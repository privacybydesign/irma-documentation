import { test } from "node:test";
import assert from "node:assert/strict";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { loadCorpus, stripFences } from "../src/content.ts";
import { SearchIndex } from "../src/search.ts";
import { createServer, parseRef } from "../src/server.ts";
import { svgText } from "../src/images.ts";

const docsRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../yivi-docs");
const SITE = "https://docs.yivi.app";
const corpus = await loadCorpus({ docsRoot, siteUrl: SITE });
const index = await SearchIndex.create(corpus);

async function connect() {
  const [clientSide, serverSide] = InMemoryTransport.createLinkedPair();
  await createServer(corpus, index).connect(serverSide);
  const client = new Client({ name: "test", version: "0" });
  await client.connect(clientSide);
  return client;
}

async function call(client: Client, name: string, args: Record<string, unknown>) {
  const res = await client.callTool({ name, arguments: args });
  const content = res.content as { type: string; text: string }[];
  return { text: content.map((c) => c.text).join("\n"), isError: res.isError === true };
}

test("loads all three parts of the site", () => {
  const count = (s: string) => [...corpus.pages.values()].filter((p) => p.section === s).length;
  assert.ok(count("yivi") >= 30);
  assert.ok(count("eudi-certification") >= 70);
  assert.ok(count("blog") >= 40);
  assert.ok(corpus.pages.has("/session-requests"));
  assert.ok(corpus.pages.has("/edi-stelsel-certification"));
  assert.ok(corpus.pages.has("/edi-stelsel-certification/documents/nl-p-01"));
  assert.ok(corpus.pages.has("/blog/2026-yivi-8-0-crypto-agility"));
});

test("rewrites MDX to plain Markdown with absolute links", () => {
  for (const page of corpus.pages.values()) {
    const md = stripFences(page.markdown).replace(/`[^`\n]+`/g, "");
    assert.doesNotMatch(md, /<(Cite|DocLink|DocumentFacts|Tabs|TabItem)\b/, page.path);
    assert.doesNotMatch(md, /^import\s/m, page.path);
    assert.doesNotMatch(md, /pathname:|\]\(\/[^/]/, page.path);
  }
  const index = corpus.pages.get("/edi-stelsel-certification")!.markdown;
  assert.match(index, /\(\[NL-SYS-01 §2, p\. 8\]\(https:\/\/docs\.yivi\.app\/files\/edi-stelsel\/.*#page=8\)\)/);
  assert.match(index, /\[NL-FS\]\(https:\/\/docs\.yivi\.app\/edi-stelsel-certification\/documents\/nl-fs\)/);
  assert.match(corpus.pages.get("/edi-stelsel-certification/documents/nl-p-01")!.markdown, /\*\*Version:\*\* RC/);
  // Relative links between Markdown files become absolute URLs; inline code is left alone.
  const schemes = corpus.pages.get("/schemes")!.markdown;
  assert.match(schemes, /\[Yivi apps\]\(https:\/\/docs\.yivi\.app\/yivi-app\)/);
  assert.match(schemes, /\[credential types\]\(https:\/\/docs\.yivi\.app\/technical-overview#credential-types\)/);
  assert.match(schemes, /`<Url>`/);
});

test("extracts requirements per catalogue", () => {
  const reqs = corpus.requirements.filter((r) => r.id === "REQ-4.2-02" && r.document === "NL-P-01");
  assert.equal(reqs.length, 1);
  assert.match(reqs[0].text, /non-applicability/);
  assert.equal(reqs[0].url, `${SITE}/edi-stelsel-certification/requirements/nl-p-01#req-4-2-02`);
});

test("parseRef accepts URLs, paths and anchors", () => {
  assert.deepEqual(parseRef(`${SITE}/session-requests/`, SITE), { path: "/session-requests", anchor: undefined });
  assert.deepEqual(parseRef("edi-stelsel-certification/text/nl-tl#s-8-6", SITE), {
    path: "/edi-stelsel-certification/text/nl-tl",
    anchor: "s-8-6",
  });
  assert.deepEqual(parseRef(SITE, SITE), { path: "/", anchor: undefined });
});

test("search finds Yivi docs, certification requirements and blog posts", () => {
  const top = (q: string, section?: "yivi" | "eudi-certification" | "blog") =>
    index.search(q, { section, limit: 5 }).map((h) => h.chunk.path);
  assert.ok(top("revocation").includes("/revocation"));
  assert.ok(top("disclose SD-JWT VC over OpenID4VP", "yivi").some((p) => p.startsWith("/openid4vp")));
  assert.ok(top("REQ-7.9-04").includes("/edi-stelsel-certification/requirements/nl-p-01"));
  assert.ok(top("crypto agility", "blog").every((p) => p.startsWith("/blog/")));
});

test("MCP tools work end to end", async () => {
  const client = await connect();
  const { tools } = await client.listTools();
  assert.deepEqual(tools.map((t) => t.name).sort(), [
    "fetch_page",
    "get_image",
    "get_requirement",
    "list_certification_documents",
    "list_pages",
    "search_docs",
  ]);

  const search = await call(client, "search_docs", { query: "wallet secure cryptographic application", section: "eudi-certification" });
  assert.equal(search.isError, false);
  assert.match(search.text, /https:\/\/docs\.yivi\.app\/edi-stelsel-certification\//);

  const page = await call(client, "fetch_page", { page: `${SITE}/session-requests` });
  assert.match(page.text, /^# Session requests/);

  const section = await call(client, "fetch_page", { page: "/edi-stelsel-certification/requirements/nl-p-01#req-4-2-02" });
  assert.match(section.text, /### REQ-4\.2-02\n/);
  assert.doesNotMatch(section.text, /REQ-4\.2-03/);

  const long = await call(client, "fetch_page", { page: "/edi-stelsel-certification/text/nl-p-01", max_length: 2000 });
  assert.match(long.text, /offset=2000/);

  const missing = await call(client, "fetch_page", { page: "/does-not-exist" });
  assert.equal(missing.isError, true);

  const req = await call(client, "get_requirement", { id: "req-7.9-04", document: "NL-P-01" });
  assert.match(req.text, /NL-P-01: REQ-7\.9-04/);

  const docs = await call(client, "list_certification_documents", {});
  assert.match(docs.text, /NL-SYS-01/);
  assert.match(docs.text, /NL-P-04W/);

  const pages = await call(client, "list_pages", { section: "blog" });
  assert.match(pages.text, /## Yivi blog/);

  await client.close();
});

test("image references resolve to URLs that get_image accepts", () => {
  for (const page of corpus.pages.values()) {
    // Every local image is rewritten to an absolute URL; only external images keep their own URL.
    assert.doesNotMatch(stripFences(page.markdown), /<img\b|!\[[^\]]*\]\((?!https?:)/, page.path);
  }
  const blog = corpus.images.get("/mcp/images/blog/2026-08-07-trust-levels/trust-channels.svg");
  assert.ok(blog, "image next to a blog post");
  assert.deepEqual(blog.pages, ["/blog/who-vouches-for-you"]);
  assert.match(corpus.pages.get("/blog/who-vouches-for-you")!.markdown, /\]\(https:\/\/docs\.yivi\.app\/mcp\/images\/blog\/2026-08-07-trust-levels\/trust-channels\.svg\)/);
  // <img> tags in the docs become Markdown images.
  assert.match(corpus.pages.get("/yivi-app")!.markdown, /!\[Screenshot of the Yivi app[^\]]*\]\(https:\/\/docs\.yivi\.app\/img\//);
});

test("svgText extracts diagram labels", () => {
  assert.equal(
    svgText('<svg><text x="1">A &amp; B</text><g><text><tspan>multi</tspan><tspan>line</tspan></text></g></svg>'),
    "A & B\nmulti line",
  );
});

test("get_image returns raster images and renders SVGs to PNG", async () => {
  const client = await connect();
  const png = [...corpus.images.values()].find((i) => i.file.endsWith(".png"))!;
  const r1 = await client.callTool({ name: "get_image", arguments: { url: png.url } });
  const c1 = r1.content as { type: string; mimeType?: string; data?: string; text?: string }[];
  assert.equal(c1[1].type, "image");
  assert.equal(c1[1].mimeType, "image/png");

  const r2 = await client.callTool({
    name: "get_image",
    arguments: { url: "https://docs.yivi.app/mcp/images/blog/2026-08-07-trust-levels/trust-channels.svg" },
  });
  const c2 = r2.content as { type: string; mimeType?: string; data?: string; text?: string }[];
  assert.equal(c2[1].mimeType, "image/png");
  assert.equal(Buffer.from(c2[1].data!, "base64").subarray(1, 4).toString(), "PNG");
  assert.match(c2[2].text!, /^Text in the diagram:/);

  const missing = await client.callTool({ name: "get_image", arguments: { url: "/img/nope.png" } });
  assert.equal(missing.isError, true);
  await client.close();
});
