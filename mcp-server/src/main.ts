#!/usr/bin/env node
// Entry point. Default: HTTP on PORT (default 8080) with the MCP endpoint (Streamable HTTP) at /mcp
// and, when SITE_DIR is set, the built docs site on every other path. With --stdio: a local stdio
// server, for clients that start the server as a subprocess.
//
// In HTTP mode the site comes first: the server listens before any MCP code is loaded, and the docs
// are loaded and indexed afterwards in small steps, so the site answers right away even on a small
// CPU share and keeps working if loading the docs fails. Until the docs are loaded, /mcp answers 503.

import { createServer as createHttpServer, type IncomingMessage, type ServerResponse } from "node:http";
import { readFileSync } from "node:fs";
import { resolve, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";
import type { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import type { Corpus } from "./content.ts";
import type { SearchIndex } from "./search.ts";
import type { createServer as CreateMcpServer } from "./server.ts";
import { createSiteHandler } from "./site.ts";

const here = dirname(fileURLToPath(import.meta.url));
const docsRoot = resolve(process.env.DOCS_ROOT ?? resolve(here, "../../yivi-docs"));
const siteUrl = (process.env.SITE_URL ?? "https://docs.yivi.app").replace(/\/$/, "");
const mcpPath = process.env.MCP_PATH ?? "/mcp";
// Images next to blog posts have no stable URL on the site; this server serves them here.
const imagesPath = process.env.IMAGES_PATH ?? `${mcpPath}/images`;
// The built site (yivi-docs/build). Its /img holds the same files as yivi-docs/static/img.
const siteDir = process.env.SITE_DIR ? resolve(process.env.SITE_DIR) : undefined;

const log = (msg: string) => process.stderr.write(`${msg}\n`);

interface Docs {
  corpus: Corpus;
  index: SearchIndex;
  createMcpServer: typeof CreateMcpServer;
  Transport: typeof StreamableHTTPServerTransport;
  imageTypes: Record<string, string>;
}

/** Undefined until the docs are loaded (or when loading failed). */
let docs: Docs | undefined;
let loadFailed = false;

async function loadDocs(): Promise<Docs> {
  const started = Date.now();
  const [content, search, server, http] = await Promise.all([
    import("./content.ts"),
    import("./search.ts"),
    import("./server.ts"),
    import("@modelcontextprotocol/sdk/server/streamableHttp.js"),
  ]);
  const corpus = await content.loadCorpus({ docsRoot, siteUrl, imagesPath, staticDir: siteDir });
  const index = await search.SearchIndex.create(corpus);
  log(
    `${server.SERVER_NAME} ${server.SERVER_VERSION}: ${corpus.pages.size} pages, ${corpus.chunks.length} sections, ` +
      `${corpus.requirements.length} requirements, ${corpus.images.size} images loaded from ${docsRoot} in ${Date.now() - started} ms`,
  );
  return {
    corpus,
    index,
    createMcpServer: server.createServer,
    Transport: http.StreamableHTTPServerTransport,
    imageTypes: content.IMAGE_TYPES,
  };
}

if (process.argv.includes("--stdio")) {
  const { corpus, index, createMcpServer } = await loadDocs();
  const { StdioServerTransport } = await import("@modelcontextprotocol/sdk/server/stdio.js");
  await createMcpServer(corpus, index).connect(new StdioServerTransport());
} else {
  const port = Number(process.env.PORT ?? 8080);
  const site = siteDir ? createSiteHandler(siteDir) : undefined;
  // Safety net: one bad request must never take the process (and so the whole site) down.
  const http = createHttpServer((req, res) => {
    handle(req, res).catch((err) => {
      log(`Request ${req.method} ${req.url} failed: ${err instanceof Error ? err.stack : String(err)}`);
      if (!res.headersSent) res.writeHead(500, { "content-type": "text/plain" });
      res.end();
    });
  });

  async function handle(req: IncomingMessage, res: ServerResponse) {
    // Not new URL(): a request target such as "//" is not a valid relative URL and would throw.
    const path = (req.url ?? "/").split("?", 1)[0].replace(/\/$/, "") || "/";
    const readOnly = req.method === "GET" || req.method === "HEAD";

    // Readiness: 503 while the docs are loading, so a new instance only gets traffic once /mcp works
    // (and once the loading no longer competes with page requests for CPU). The site itself
    // answers on every other path from the start, which is what liveness checks should use.
    if (path === "/healthz") {
      if (!docs && !loadFailed) {
        return void res.writeHead(503, { "content-type": "text/plain", "retry-after": "5" }).end("starting\n");
      }
      return void res.writeHead(200, { "content-type": "text/plain" }).end(docs ? "ok\n" : "ok (MCP unavailable)\n");
    }
    if (path === mcpPath || path.startsWith(`${mcpPath}/`)) {
      cors(res);
      if (req.method === "OPTIONS") return void res.writeHead(204).end();
      if (!docs) {
        return void res.writeHead(503, { "retry-after": "10", "content-type": "text/plain" }).end("Starting, try again shortly\n");
      }
      if (path === mcpPath) return handleMcp(docs, req, res);
      if (path.startsWith(`${imagesPath}/`) && readOnly) {
        let key: string;
        try {
          key = decodeURIComponent(path);
        } catch {
          return void res.writeHead(400, { "content-type": "text/plain" }).end("Bad request\n");
        }
        return serveImage(docs, key, req, res);
      }
      return void res.writeHead(404, { "content-type": "text/plain" }).end("Not found\n");
    }
    if (site && readOnly) return site(req, res);
    if (site) return void res.writeHead(405, { allow: "GET, HEAD" }).end();

    res.writeHead(404, { "content-type": "text/plain" }).end(
      `MCP server for ${siteUrl}. Connect an MCP client to ${mcpPath} (Streamable HTTP).\n`,
    );
  }
  http.listen(port, () => {
    log(`Listening on http://0.0.0.0:${port}: MCP at ${mcpPath}${siteDir ? `, site from ${siteDir}` : ""}`);
    loadDocs().then(
      (loaded) => (docs = loaded),
      (err) => {
        loadFailed = true;
        log(`Loading the docs for MCP failed; ${mcpPath} is unavailable: ${err instanceof Error ? err.stack : String(err)}`);
      },
    );
  });

  const shutdown = () => http.close(() => process.exit(0));
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

/** Stateless Streamable HTTP: a fresh server and transport per request, sharing the loaded docs. */
async function handleMcp(d: Docs, req: IncomingMessage, res: ServerResponse) {
  if (req.method !== "POST") {
    // Stateless server: no standalone SSE stream and no sessions to delete.
    res.writeHead(405, { allow: "POST, OPTIONS", "content-type": "application/json" }).end(
      JSON.stringify({ jsonrpc: "2.0", error: { code: -32000, message: "Method not allowed." }, id: null }),
    );
    return;
  }
  const server = d.createMcpServer(d.corpus, d.index);
  const transport = new d.Transport({ sessionIdGenerator: undefined, enableJsonResponse: true });
  res.on("close", () => {
    void transport.close();
    void server.close();
  });
  try {
    await server.connect(transport);
    await transport.handleRequest(req, res);
  } catch (err) {
    log(`MCP request failed: ${err instanceof Error ? err.stack : String(err)}`);
    if (!res.headersSent) {
      res.writeHead(500, { "content-type": "application/json" }).end(
        JSON.stringify({ jsonrpc: "2.0", error: { code: -32603, message: "Internal server error" }, id: null }),
      );
    }
  }
}

/** Serves an image that pages link to under imagesPath. Only registered images, never arbitrary files. */
function serveImage(d: Docs, path: string, req: IncomingMessage, res: ServerResponse) {
  const image = d.corpus.images.get(path);
  if (!image) return void res.writeHead(404, { "content-type": "text/plain" }).end("Not found\n");
  const body = readFileSync(image.file);
  res.writeHead(200, {
    "content-type": d.imageTypes[extname(image.file).toLowerCase()],
    "content-length": body.length,
    "cache-control": "public, max-age=3600",
    "x-content-type-options": "nosniff",
    // SVGs can contain scripts: never run them when an SVG is opened directly.
    "content-security-policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
  });
  res.end(req.method === "HEAD" ? undefined : body);
}

/** The content is public and read-only, so browser-based MCP clients may call it from any origin. */
function cors(res: ServerResponse) {
  res.setHeader("access-control-allow-origin", "*");
  res.setHeader("access-control-allow-methods", "POST, OPTIONS");
  res.setHeader("access-control-allow-headers", "content-type, accept, mcp-protocol-version, mcp-session-id, last-event-id");
  res.setHeader("access-control-expose-headers", "mcp-session-id");
}
