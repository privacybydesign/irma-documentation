# docs.yivi.app: the static Docusaurus site and the MCP server for AI agents (mcp-server/), served
# by one Node process on port 80. The site is on every path; the MCP endpoint is at /mcp.

FROM node:26-alpine AS build
WORKDIR /app/website
COPY ./yivi-docs /app/website
RUN npm install
RUN npm run build
# Pre-compressed .br/.gz copies, so responses are compressed without work per request.
COPY mcp-server/scripts/precompress.ts /tmp/precompress.ts
RUN node /tmp/precompress.ts build

FROM node:26-alpine AS server-deps
WORKDIR /app/mcp-server
COPY mcp-server/package.json mcp-server/package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts

# The Node binary, allowed to listen on port 80 (which the deployment in irma-documentation-ops
# expects) without running as root. COPY keeps the file capability.
FROM node:26-alpine AS node
RUN apk add --no-cache libcap-utils \
 && setcap cap_net_bind_service=+ep /usr/local/bin/node

# Runtime: plain Alpine with only the Node binary, so npm and yarn from the node image are not in it.
# Same Alpine release as node:26-alpine. Fonts are for rendering SVG diagrams to PNG (get_image).
FROM alpine:3.24
# apk upgrade: take fixes released after the base image was built (the image scan fails on those).
RUN apk upgrade --no-cache \
 && apk add --no-cache libstdc++ libgcc font-inter font-dejavu \
 && addgroup -g 1000 node \
 && adduser -u 1000 -G node -s /bin/sh -D node
COPY --from=node /usr/local/bin/node /usr/local/bin/node
ENV NODE_ENV=production \
    PORT=80 \
    SITE_DIR=/public \
    DOCS_ROOT=/app/yivi-docs
WORKDIR /app/mcp-server
COPY --from=build /app/website/build /public
COPY --from=server-deps /app/mcp-server/node_modules ./node_modules
COPY mcp-server/package.json ./
COPY mcp-server/src ./src
# The Markdown sources the MCP server indexes (images come from /public/img).
COPY yivi-docs/docs /app/yivi-docs/docs
COPY yivi-docs/edi-stelsel /app/yivi-docs/edi-stelsel
COPY yivi-docs/blog /app/yivi-docs/blog
COPY yivi-docs/src/data /app/yivi-docs/src/data
USER node
EXPOSE 80
# /healthz turns healthy once the MCP index is loaded (the site itself serves from the start).
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s CMD wget -qO- http://127.0.0.1/healthz || exit 1
CMD ["node", "src/main.ts"]
