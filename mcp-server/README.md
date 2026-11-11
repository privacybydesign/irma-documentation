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

Remote (once deployed), Streamable HTTP:

```bash
claude mcp add --transport http yivi-docs https://docs.yivi.app/mcp
```

Locally, from this repository (Node.js 23.6 or later, which runs the TypeScript sources directly):

```bash
cd mcp-server && npm ci
claude mcp add yivi-docs -- node "$PWD/src/main.ts" --stdio
```

Other clients: use the URL `https://docs.yivi.app/mcp`, or the command `node src/main.ts --stdio`.

## Run and test

```bash
npm ci
npm start           # Streamable HTTP on http://localhost:8080/mcp, health check on /healthz
npm run stdio       # stdio transport
npm test            # tests against the docs sources in ../yivi-docs
npm run typecheck
npx @modelcontextprotocol/inspector   # interactive testing
```

Environment variables:

| Variable | Default | |
| --- | --- | --- |
| `PORT` | `8080` | HTTP port. |
| `MCP_PATH` | `/mcp` | Path of the MCP endpoint. |
| `DOCS_ROOT` | `../yivi-docs` | Folder with `docs/`, `edi-stelsel/`, `blog/` and `src/data/`. |
| `IMAGES_PATH` | `$MCP_PATH/images` | Path where images next to blog posts are served. |
| `FONT_DIRS` | | Extra font directories (colon-separated) for rendering SVGs. |
| `SITE_URL` | `https://docs.yivi.app` | Origin used for the URLs in results (e.g. `https://docs.staging.yivi.app`). |

The HTTP server is stateless (no sessions; JSON responses), so it can run as several replicas
behind a load balancer. The content is loaded into memory at start-up (about 1 s).

## Deployment

`Dockerfile.mcp` in the repository root builds `ghcr.io/privacybydesign/irma-documentation-mcp`.
The Delivery workflow publishes it with the same tags as the site image (`:edge` from master,
`:X.Y.Z` and `:latest` on a release). To serve it at `https://docs.yivi.app/mcp`, route `/mcp` and
everything under it (`/mcp/images/...`) on the docs host to this container (port 8080).
