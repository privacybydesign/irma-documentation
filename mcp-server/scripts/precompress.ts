// Writes .br and .gz next to every compressible file of the built site, so the server can send
// compressed responses without compressing on each request.
//   node scripts/precompress.ts <site dir>

import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, extname } from "node:path";
import { brotliCompressSync, gzipSync, constants } from "node:zlib";

const COMPRESSIBLE = new Set([".html", ".css", ".js", ".mjs", ".json", ".xml", ".svg", ".txt", ".map", ".xsl", ".ico", ".webmanifest"]);
const MIN_BYTES = 1024;

const dir = process.argv[2];
if (!dir) throw new Error("usage: precompress.ts <dir>");

let files = 0;
let before = 0;
let after = 0;
const walk = (d: string) => {
  for (const name of readdirSync(d)) {
    const full = join(d, name);
    if (statSync(full).isDirectory()) walk(full);
    else if (COMPRESSIBLE.has(extname(name).toLowerCase())) compress(full);
  }
};
const compress = (file: string) => {
  const data = readFileSync(file);
  if (data.length < MIN_BYTES) return;
  const br = brotliCompressSync(data, {
    params: { [constants.BROTLI_PARAM_QUALITY]: 11, [constants.BROTLI_PARAM_SIZE_HINT]: data.length },
  });
  writeFileSync(`${file}.br`, br);
  writeFileSync(`${file}.gz`, gzipSync(data, { level: 9 }));
  files++;
  before += data.length;
  after += br.length;
};
walk(dir);
console.log(`Pre-compressed ${files} files: ${(before / 1e6).toFixed(1)} MB -> ${(after / 1e6).toFixed(1)} MB (brotli)`);
