import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import * as z from "zod";
import {
  SECTION_LABELS,
  displayMarkdown,
  normalizePath,
  sectionMarkdown,
  type Corpus,
  type Page,
  type Section,
} from "./content.ts";
import type { SearchIndex } from "./search.ts";
import { renderImage } from "./images.ts";

export const SERVER_NAME = "yivi-docs";
export const SERVER_VERSION = "0.1.0";

const SECTIONS = ["yivi", "eudi-certification", "blog"] as const;
const sectionSchema = z
  .enum(SECTIONS)
  .optional()
  .describe(
    "Limit to one part of the site: 'yivi' (Yivi/IRMA developer documentation: issuing, " +
      "verifying, the Yivi app, irmago, OpenID4VCI/OpenID4VP, SD-JWT VC), 'eudi-certification' " +
      "(the Dutch EDI-stelsel certification scheme for EUDI Wallets: scheme documents, " +
      "requirements, full text, glossary, legal basis) or 'blog'. Omit to search everything.",
  );

const INSTRUCTIONS = `This server gives read access to docs.yivi.app:
- Yivi documentation: how to verify and issue credentials with Yivi (IRMA), the Yivi app, irmago/irma server, session requests, schemes, revocation, the keyshare protocol, and Yivi's OpenID4VCI / OpenID4VP / SD-JWT VC support.
- Dutch EUDI Wallet certification (EDI-stelsel): an explanation of the Dutch certification system for European Digital Identity Wallets, summaries and the full text of every scheme document (NL-SYS, NL-TL, NL-FS, NL-CS, NL-P), every requirement with the page of the authoritative PDF, a glossary and the legal basis.
- The Yivi blog: release notes, roadmap, post-mortems and articles on EUDI developments.

Workflow: use search_docs to find relevant sections, then fetch_page (optionally with a #anchor) to read them in full. Diagrams and screenshots appear in pages as Markdown images with a descriptive alt text; when the picture itself matters (architecture, certificate structure, process flows), call get_image with its URL to look at it. Use get_requirement for a requirement ID such as "REQ-7.9-04" or "ICS-01", and list_certification_documents for an overview of the scheme documents. Cite the page URLs you used. For the certification scheme, the PDFs are authoritative: quote the PDF page links given in the text.`;

export function createServer(corpus: Corpus, index: SearchIndex): McpServer {
  const server = new McpServer(
    { name: SERVER_NAME, version: SERVER_VERSION, title: "Yivi docs" },
    { instructions: INSTRUCTIONS },
  );
  const readOnly = { readOnlyHint: true, openWorldHint: false } as const;

  server.registerTool(
    "search_docs",
    {
      title: "Search the Yivi docs",
      description:
        "Full-text search over docs.yivi.app: the Yivi developer documentation, the Dutch EUDI " +
        "Wallet certification (EDI-stelsel) pages and the Yivi blog. Returns the best matching " +
        "sections with their URL and a snippet. Read a result in full with fetch_page.",
      inputSchema: {
        query: z.string().min(1).max(500).describe("Keywords or a question, e.g. 'revocation of credentials' or 'WSCA certification evidence'."),
        section: sectionSchema,
        limit: z.number().int().min(1).max(30).default(8).describe("Maximum number of results."),
      },
      annotations: readOnly,
    },
    async ({ query, section, limit }) => {
      const hits = index.search(query, { section, limit });
      if (!hits.length) {
        return text(`No results for "${query}"${section ? ` in ${SECTION_LABELS[section]}` : ""}. Try other keywords or list_pages.`);
      }
      const lines = hits.map((h, i) => {
        const page = corpus.pages.get(h.chunk.path)!;
        const url = h.chunk.anchor ? `${page.url}#${h.chunk.anchor}` : page.url;
        const where = h.chunk.heading ? `${page.title} › ${h.chunk.heading}` : page.title;
        return `${i + 1}. **${where}** (${SECTION_LABELS[page.section]})\n   ${url}\n   ${h.snippet}`;
      });
      return text(`Results for "${query}":\n\n${lines.join("\n\n")}`);
    },
  );

  server.registerTool(
    "fetch_page",
    {
      title: "Read a docs page",
      description:
        "Returns a page of docs.yivi.app as Markdown. Accepts a full URL or a path, optionally " +
        "with a #anchor to return only that section. Long pages are returned in parts: pass the " +
        "offset given at the end of a part to read the next one.",
      inputSchema: {
        page: z.string().min(1).max(500).describe("URL or path, e.g. 'https://docs.yivi.app/session-requests', '/edi-stelsel-certification/documents/nl-p-01' or '/edi-stelsel-certification/text/nl-tl#s-8-6'."),
        offset: z.number().int().min(0).default(0).describe("Character offset to start from."),
        max_length: z.number().int().min(1000).max(100000).default(30000).describe("Maximum number of characters to return."),
      },
      annotations: readOnly,
    },
    async ({ page: ref, offset, max_length }) => {
      const { path, anchor } = parseRef(ref, corpus.siteUrl);
      const page = corpus.pages.get(path);
      if (!page) {
        const near = suggest(corpus, path);
        return error(`No page at ${path}.${near.length ? ` Did you mean: ${near.join(", ")}?` : " Use search_docs or list_pages to find pages."}`);
      }
      let body: string;
      if (anchor) {
        const sec = sectionMarkdown(page, anchor);
        if (!sec) return error(`No section #${anchor} on ${page.url}. Sections: ${outline(page)}`);
        body = sec;
      } else {
        body = displayMarkdown(page.markdown);
      }
      const header = [
        `# ${page.title}`,
        `URL: ${page.url}${anchor ? `#${anchor}` : ""}`,
        page.description && `Description: ${page.description}`,
        page.date && `Date: ${page.date}`,
        page.tags?.length && `Tags: ${page.tags.join(", ")}`,
        imageCount(corpus, page) &&
          `Images: ${imageCount(corpus, page)} (shown as ![alt](url); call get_image with the url to view one)`,
      ].filter(Boolean).join("\n");
      const part = body.slice(offset, offset + max_length);
      const end = offset + part.length;
      let footer = "";
      if (end < body.length) {
        footer =
          `\n\n---\n[Part ${offset}–${end} of ${body.length} characters. Call fetch_page again with offset=${end} for more` +
          (anchor ? "]" : `, or read one section with an anchor. Sections: ${outline(page)}]`);
      }
      return text(`${header}\n\n${part}${footer}`);
    },
  );

  server.registerTool(
    "get_image",
    {
      title: "View an image from the docs",
      description:
        "Returns an image (diagram, figure or screenshot) shown on docs.yivi.app, so you can look " +
        "at it. Pass the URL of a Markdown image from fetch_page, e.g. " +
        "'https://docs.yivi.app/img/edi-stelsel/.../image.png'. SVG diagrams are returned as PNG, " +
        "together with the text they contain. Only images used on the site can be retrieved.",
      inputSchema: {
        url: z.string().min(1).max(1000).describe("Image URL or path, as it appears in a page."),
      },
      annotations: readOnly,
    },
    async ({ url }) => {
      const { path } = parseRef(url, corpus.siteUrl);
      const image = corpus.images.get(path);
      if (!image) {
        return error(
          `No image at ${url}. Use the URL of an image (![alt](url)) from a page returned by fetch_page; external images are not available.`,
        );
      }
      let rendered;
      try {
        rendered = renderImage(image);
      } catch (e) {
        return error(`Could not load ${image.url}: ${e instanceof Error ? e.message : String(e)}`);
      }
      const shownOn = image.pages.map((p) => corpus.pages.get(p)?.url ?? p).join(", ");
      const about = [
        image.alt && `Alt text: ${image.alt}`,
        `URL: ${image.url}`,
        shownOn && `Shown on: ${shownOn}`,
      ].filter(Boolean).join("\n");
      return {
        content: [
          { type: "text" as const, text: about },
          { type: "image" as const, data: rendered.data.toString("base64"), mimeType: rendered.mimeType },
          ...(rendered.text ? [{ type: "text" as const, text: `Text in the diagram:\n${rendered.text}` }] : []),
        ],
      };
    },
  );

  server.registerTool(
    "list_pages",
    {
      title: "List docs pages",
      description: "Lists the pages of docs.yivi.app with their URL and description, optionally for one part of the site.",
      inputSchema: { section: sectionSchema },
      annotations: readOnly,
    },
    async ({ section }) => {
      const groups = (section ? [section] : [...SECTIONS]).map((s) => {
        const pages = [...corpus.pages.values()]
          .filter((p) => p.section === s)
          .sort((a, b) => (s === "blog" ? (b.date ?? "").localeCompare(a.date ?? "") : a.path.localeCompare(b.path)));
        const lines = pages.map((p) =>
          `- [${p.title}](${p.url})${p.date ? ` (${p.date})` : ""}${p.description ? ` — ${p.description}` : ""}`,
        );
        return `## ${SECTION_LABELS[s]} (${pages.length} pages)\n\n${lines.join("\n")}`;
      });
      return text(groups.join("\n\n"));
    },
  );

  server.registerTool(
    "get_requirement",
    {
      title: "Look up a certification requirement",
      description:
        "Looks up a requirement of the Dutch EUDI Wallet certification scheme by its ID (e.g. " +
        "'REQ-7.9-04', 'ICS-01', 'E1', '#1' for OWASP MAS) and returns its text, obligation, " +
        "applicability and PDF page. IDs such as 'REQ-4.2-02' occur in several documents: pass " +
        "document to narrow it down.",
      inputSchema: {
        id: z.string().min(1).max(100).describe("Requirement ID."),
        document: z.string().max(100).optional().describe("Document or catalogue ID, e.g. 'NL-P-01' or 'NL-FS-W'."),
      },
      annotations: readOnly,
    },
    async ({ id, document }) => {
      const norm = (s: string) => s.toLowerCase().replace(/^\\?#/, "#").replace(/\s+/g, "");
      const inDoc = (doc: string) => !document || norm(doc).includes(norm(document));
      const pool = corpus.requirements.filter((r) => inDoc(r.document));
      let matches = pool.filter((r) => norm(r.id) === norm(id));
      const exact = matches.length > 0;
      if (!exact) matches = pool.filter((r) => norm(r.id).includes(norm(id)) || norm(r.title).includes(norm(id))).slice(0, 10);
      if (!matches.length) {
        return error(`No requirement "${id}"${document ? ` in ${document}` : ""}. Try search_docs with section 'eudi-certification'.`);
      }
      const body = matches.map((r) =>
        `## ${r.document}: ${r.id}${r.title ? ` — ${r.title}` : ""}\n${r.url}\n\n${r.text}`,
      );
      const intro = exact ? "" : `No exact match for "${id}"; closest requirements:\n\n`;
      return text(intro + body.join("\n\n"));
    },
  );

  server.registerTool(
    "list_certification_documents",
    {
      title: "List the Dutch EUDI certification documents",
      description:
        "Lists every document of the Dutch EUDI Wallet certification scheme (EDI-stelsel) with " +
        "its version, status, links to the summary page, full text, requirements and the " +
        "authoritative PDF.",
      inputSchema: {},
      annotations: readOnly,
    },
    async () => {
      const site = corpus.siteUrl;
      const s = corpus.scheme;
      const fams = new Map<string, string[]>();
      for (const d of s.documents) {
        const cover = (k: string) => d.cover.find((c) => c.key === k)?.value;
        const links = [
          `[summary](${site}/edi-stelsel-certification/documents/${d.slug})`,
          d.text && `[full text](${site}${d.text})`,
          ...d.requirements.map((r) => `[${r.count} requirements](${site}${r.url})`),
          d.pdf && `[PDF${d.pages ? `, ${d.pages} pages` : ""}](${site}${d.pdf})`,
        ].filter(Boolean);
        const meta = [cover("Version"), cover("Status"), d.published ? null : "not published"].filter(Boolean).join(", ");
        const line = `- **${d.label}** — ${d.title}${meta ? ` (${meta})` : ""}: ${links.join(" · ")}`;
        fams.set(d.familyTitle, [...(fams.get(d.familyTitle) ?? []), line]);
      }
      const out = [...fams].map(([f, lines]) => `## ${f}\n\n${lines.join("\n")}`);
      return text(
        `Dutch EUDI Wallet certification scheme, release of ${s.releaseLabel}: ${s.documents.length} documents, ` +
          `${s.terms} glossary terms, ${s.acronyms} acronyms. Overview: ${site}/edi-stelsel-certification\n\n${out.join("\n\n")}`,
      );
    },
  );

  return server;
}

function text(t: string) {
  return { content: [{ type: "text" as const, text: t }] };
}

function error(t: string) {
  return { content: [{ type: "text" as const, text: t }], isError: true };
}

export function parseRef(ref: string, siteUrl: string): { path: string; anchor?: string } {
  let s = ref.trim();
  try {
    const u = new URL(s, siteUrl);
    s = decodeURIComponent(u.pathname) + u.hash;
  } catch {
    // keep as is
  }
  const [p, anchor] = s.split("#", 2);
  return { path: normalizePath(p.replace(/\/index(\.html)?$|\.html$/, "")), anchor: anchor || undefined };
}

function imageCount(corpus: Corpus, page: Page): number {
  let n = 0;
  for (const image of corpus.images.values()) if (image.pages.includes(page.path)) n++;
  return n;
}

function outline(page: Page): string {
  return page.headings
    .filter((h) => h.level === 2)
    .map((h) => `#${h.anchor}`)
    .join(", ") || "(none)";
}

function suggest(corpus: Corpus, path: string): string[] {
  const last = path.split("/").pop() ?? "";
  if (!last) return [];
  return [...corpus.pages.values()]
    .filter((p) => p.path.endsWith(`/${last}`) || p.path.includes(last))
    .slice(0, 5)
    .map((p) => p.path);
}

export type { Section };
