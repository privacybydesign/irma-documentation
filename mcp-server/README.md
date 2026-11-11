# Yivi docs MCP server

An [MCP](https://modelcontextprotocol.io) server that lets AI agents search and read everything on
[docs.yivi.app](https://docs.yivi.app):

- the **Yivi documentation** (`yivi-docs/docs`);
- the **Dutch EUDI Wallet certification** section (`yivi-docs/edi-stelsel`): summaries, full text,
  every requirement, glossary and legal basis;
- the **Yivi blog** (`yivi-docs/blog`).

It reads the same Markdown/MDX sources Docusaurus builds the site from, so it always serves the
content of the commit it was built from. MDX components are rewritten to plain Markdown (`<Cite>`
becomes a link to the PDF page, `<DocLink>` a link to the document page, `<DocumentFacts>` the
cover facts, `<img>` a Markdown image), and all links are absolute `https://docs.yivi.app/...` URLs that agents can cite.

## Tools

| Tool | What it does |
| --- | --- |
| `search_docs` | Full-text search (BM25, prefix and fuzzy matching) over all sections of all pages. Optional `section`: `yivi`, `eudi-certification` or `blog`. |
| `fetch_page` | A page as Markdown, by URL or path. Add `#anchor` to get one section. Long pages are returned in parts (`offset`). |
| `get_image` | An image from a page (diagram, figure, screenshot) so the model can look at it. SVG diagrams are rendered to PNG and their text is returned as well. |
| `list_pages` | All pages with URL and description, optionally for one section. |
| `get_requirement` | A certification requirement by ID (`REQ-7.9-04`, `ICS-01`, `E1`, …), optionally within one `document` (`NL-P-01`). |
| `list_certification_documents` | The documents of the Dutch certification scheme with version, status and links to summary, full text, requirements and PDF. |

All tools are read-only.

### Images

Pages show images as `![alt](url)` with the site's descriptive alt text; `get_image` takes that URL.
MCP image results only accept raster formats, so SVG diagrams are rendered to PNG with
[resvg](https://github.com/yisibl/resvg-js) (fonts: Inter and DejaVu from the Docker image, system fonts
locally). Images in `static/img` keep their site URL. Images next to a blog post have no stable URL
on the site (Docusaurus hashes or inlines them), so this server serves them itself under
`/mcp/images/...`; only images used on a page are served, SVGs with a sandboxing
`Content-Security-Policy`.

## Connect an agent

The server is part of the docs site: `https://docs.yivi.app/mcp` (Streamable HTTP, no login).

- **Claude Desktop / claude.ai:** Settings → Connectors → Add custom connector, URL `https://docs.yivi.app/mcp`.
- **Other MCP clients** (IDEs, CLIs): add a remote/HTTP server with that URL.
- **Locally** (Node.js 23.6 or later, which runs the TypeScript sources directly): `npm ci` here,
  then configure the client to start `node /path/to/mcp-server/src/main.ts --stdio`, for example:

  ```json
  { "mcpServers": { "yivi-docs": { "command": "node", "args": ["/path/to/mcp-server/src/main.ts", "--stdio"] } } }
  ```

## Run and test

```bash
npm ci
npm start           # MCP over HTTP on http://localhost:8080/mcp
SITE_DIR=../yivi-docs/build npm start   # the same, plus the built site on every other path
npm run stdio       # stdio transport
npm test            # tests against the docs sources in ../yivi-docs
npm run typecheck
npx @modelcontextprotocol/inspector   # interactive testing
```

Environment variables:

| Variable | Default | |
| --- | --- | --- |
| `PORT` | `8080` | HTTP port (`80` in the Docker image). |
| `SITE_DIR` | | Built Docusaurus site to serve on all paths outside `MCP_PATH` (`/public` in the Docker image). Its `img/` is also where `/img/...` images are read from. |
| `MCP_PATH` | `/mcp` | Path of the MCP endpoint. |
| `DOCS_ROOT` | `../yivi-docs` | Folder with `docs/`, `edi-stelsel/`, `blog/` and `src/data/`. |
| `IMAGES_PATH` | `$MCP_PATH/images` | Path where images next to blog posts are served. |
| `FONT_DIRS` | | Extra font directories (colon-separated) for rendering SVGs. |
| `SITE_URL` | `https://docs.yivi.app` | Origin used for the URLs in results (e.g. `https://docs.staging.yivi.app`). |

The MCP endpoint is stateless (no sessions; JSON responses), so the server can run as several
replicas behind a load balancer.

## Deployment

The repository's `Dockerfile` builds one image, `ghcr.io/privacybydesign/irma-documentation`, in
which this server serves both the site and `/mcp` on port 80 (as an unprivileged user). The site is
served with pre-compressed brotli/gzip files (`scripts/precompress.ts`, run at build time), immutable
caching for the hashed files under `/assets/` and the site's own 404 page.

Start-up is ordered so the site never waits for MCP: the server listens first, then loads and
indexes the docs in small steps (about 2 s of CPU in total), yielding to page requests in between.
Until then `/mcp` answers 503. If loading fails, the site keeps working and only `/mcp` is unavailable.

- **Liveness:** `/` (answers from the start).
- **Readiness:** `/healthz` answers 503 while the docs load and 200 afterwards, so an instance only
  gets traffic once loading no longer competes with page requests for CPU.
- **Resources:** about 120–170 MiB of memory; with 0.2 CPU the site answers after about 3 s and
  `/mcp` is ready after about 30 s. Much less CPU (e.g. 0.04) makes start-up take minutes.
