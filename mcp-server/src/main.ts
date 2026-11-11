#!/usr/bin/env node
// Entry point. Default: Streamable HTTP on PORT (default 8080) at /mcp. With --stdio: a local
// stdio server, for clients that start the server as a subprocess.

import { createServer as createHttpServer, type IncomingMessage, type ServerResponse } from "node:http";
import { readFileSync } from "node:fs";
import { resolve, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { IMAGE_TYPES, loadCorpus } from "./content.ts";
import { SearchIndex } from "./search.ts";
import { createServer, SERVER_NAME, SERVER_VERSION } from "./server.ts";

const here = dirname(fileURLToPath(import.meta.url));
const docsRoot = resolve(process.env.DOCS_ROOT ?? resolve(here, "../../yivi-docs"));
const siteUrl = (process.env.SITE_URL ?? "https://docs.yivi.app").replace(/\/$/, "");
const mcpPath = process.env.MCP_PATH ?? "/mcp";
// Images next to blog posts have no stable URL on the site; this server serves them here.
const imagesPath = process.env.IMAGES_PATH ?? `${mcpPath}/images`;

const started = Date.now();
const corpus = loadCorpus({ docsRoot, siteUrl, imagesPath });
const index = new SearchIndex(corpus);
const log = (msg: string) => process.stderr.write(`${msg}\n`);
log(
  `${SERVER_NAME} ${SERVER_VERSION}: ${corpus.pages.size} pages, ${corpus.chunks.length} sections, ` +
    `${corpus.requirements.length} requirements, ${corpus.images.size} images loaded from ${docsRoot} in ${Date.now() - started} ms`,
);

if (process.argv.includes("--stdio")) {
  await createServer(corpus, index).connect(new StdioServerTransport());
} else {
  const port = Number(process.env.PORT ?? 8080);
  const http = createHttpServer(async (req, res) => {
    const path = new URL(req.url ?? "/", "http://localhost").pathname.replace(/\/$/, "") || "/";
    cors(res);
    if (req.method === "OPTIONS") return void res.writeHead(204).end();

    if (path === "/healthz") {
      return void res.writeHead(200, { "content-type": "text/plain" }).end("ok\n");
    }
    if (path === mcpPath) return handleMcp(req, res);
    if (path.startsWith(`${imagesPath}/`) && (req.method === "GET" || req.method === "HEAD")) {
      return serveImage(decodeURIComponent(path), req, res);
    }

    res.writeHead(404, { "content-type": "text/plain" }).end(
      `${SERVER_NAME}: MCP server for ${siteUrl}. Connect an MCP client to ${mcpPath} (Streamable HTTP).\n`,
    );
  });
  http.listen(port, () => log(`Listening on http://0.0.0.0:${port}${mcpPath}`));

  const shutdown = () => http.close(() => process.exit(0));
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

/** Stateless Streamable HTTP: a fresh server and transport per request, sharing the loaded corpus. */
async function handleMcp(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== "POST") {
    // Stateless server: no standalone SSE stream and no sessions to delete.
    res.writeHead(405, { allow: "POST, OPTIONS", "content-type": "application/json" }).end(
      JSON.stringify({ jsonrpc: "2.0", error: { code: -32000, message: "Method not allowed." }, id: null }),
    );
    return;
  }
  const server = createServer(corpus, index);
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
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
function serveImage(path: string, req: IncomingMessage, res: ServerResponse) {
  const image = corpus.images.get(path);
  if (!image) return void res.writeHead(404, { "content-type": "text/plain" }).end("Not found\n");
  const body = readFileSync(image.file);
  res.writeHead(200, {
    "content-type": IMAGE_TYPES[extname(image.file).toLowerCase()],
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
