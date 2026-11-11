// Serves the built Docusaurus site (yivi-docs/build), so one container serves both docs.yivi.app
// and the MCP endpoint. Files are pre-compressed at image build time (scripts/precompress.ts);
// sirv picks the .br or .gz variant the client accepts.

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import type { IncomingMessage, ServerResponse } from "node:http";
import sirv from "sirv";

export type Handler = (req: IncomingMessage, res: ServerResponse) => void;

export function createSiteHandler(dir: string): Handler {
  const notFoundFile = join(dir, "404.html");
  const notFound = existsSync(notFoundFile) ? readFileSync(notFoundFile) : Buffer.from("Not found\n");

  return sirv(dir, {
    dev: false,
    etag: true,
    brotli: true,
    gzip: true,
    extensions: ["html"],
    setHeaders(res, pathname) {
      res.setHeader("x-content-type-options", "nosniff");
      // Webpack output under /assets has content hashes in its file names; everything else can change.
      res.setHeader(
        "cache-control",
        pathname.startsWith("/assets/") ? "public, max-age=31536000, immutable" : "public, max-age=0, must-revalidate",
      );
    },
    onNoMatch(_req, res) {
      res.writeHead(404, { "content-type": "text/html; charset=utf-8", "cache-control": "no-cache" }).end(notFound);
    },
  });
}
