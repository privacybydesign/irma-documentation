// Turns the images of the docs into something a model can look at. MCP image results only accept
// raster formats, so SVG diagrams are rendered to PNG (with resvg); their text is returned as well,
// so the labels can be quoted exactly.

import { readFileSync } from "node:fs";
import { extname } from "node:path";
import { Resvg } from "@resvg/resvg-js";
import { IMAGE_TYPES, type Image } from "./content.ts";

export interface RenderedImage {
  data: Buffer;
  mimeType: string;
  /** For SVGs: the text in the diagram, in document order. */
  text?: string;
}

/** Long edge Claude's vision works at without downscaling; SVGs are rendered at about this size. */
const TARGET_EDGE = 1568;
/** Raster images above this size are not returned inline (MCP clients and model APIs limit image size). */
const MAX_BYTES = 5 * 1024 * 1024;

const cache = new Map<string, RenderedImage>();

export function renderImage(image: Image): RenderedImage {
  const cached = cache.get(image.key);
  if (cached) return cached;
  const ext = extname(image.file).toLowerCase();
  const raw = readFileSync(image.file);
  let out: RenderedImage;
  if (ext === ".svg") {
    out = { data: svgToPng(raw), mimeType: "image/png", text: svgText(raw.toString("utf8")) };
  } else {
    if (raw.length > MAX_BYTES) {
      throw new Error(`${image.url} is ${(raw.length / 1e6).toFixed(1)} MB, too large to return inline.`);
    }
    out = { data: raw, mimeType: IMAGE_TYPES[ext] };
  }
  cache.set(image.key, out);
  return out;
}

const fontOptions = {
  // System fonts: in the Docker image Inter and DejaVu (apk font-inter, font-dejavu).
  loadSystemFonts: true,
  fontDirs: process.env.FONT_DIRS?.split(":").filter(Boolean) ?? [],
  defaultFontFamily: "Inter",
  sansSerifFamily: "Inter",
  monospaceFamily: "DejaVu Sans Mono",
};

function svgToPng(svg: Buffer): Buffer {
  const edge = svgEdge(svg.toString("utf8")) ?? TARGET_EDGE;
  const zoom = Math.min(3, TARGET_EDGE / edge);
  const resvg = new Resvg(svg, {
    font: fontOptions,
    background: "white",
    fitTo: { mode: "zoom", value: zoom },
  });
  return resvg.render().asPng();
}

/** Longest side of the SVG's intrinsic size (width/height attributes, else the viewBox). */
function svgEdge(svg: string): number | undefined {
  const root = /<svg\b[^>]*>/.exec(svg)?.[0] ?? "";
  const num = (name: string) => Number(new RegExp(`\\b${name}="([\\d.]+)(?:px)?"`).exec(root)?.[1]);
  let [w, h] = [num("width"), num("height")];
  if (!(w > 0 && h > 0)) {
    const vb = /\bviewBox="[\d.-]+[\s,]+[\d.-]+[\s,]+([\d.]+)[\s,]+([\d.]+)"/.exec(root);
    [w, h] = vb ? [Number(vb[1]), Number(vb[2])] : [NaN, NaN];
  }
  return w > 0 && h > 0 ? Math.max(w, h) : undefined;
}

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

/** The text of an SVG's <text> elements (joining their <tspan>s), one element per line. */
export function svgText(svg: string): string {
  const lines: string[] = [];
  for (const m of svg.matchAll(/<text\b[^>]*>([\s\S]*?)<\/text>/g)) {
    const line = m[1]
      .replace(/<\/tspan>\s*<tspan\b[^>]*>/g, " ")
      .replace(/<[^>]+>/g, "")
      .replace(/&(#x?[0-9a-f]+|\w+);/gi, (e, code: string) =>
        code.startsWith("#")
          ? String.fromCodePoint(parseInt(code.slice(code[1] === "x" ? 2 : 1), code[1] === "x" ? 16 : 10))
          : (ENTITIES[code] ?? e),
      )
      .replace(/\s+/g, " ")
      .trim();
    if (line) lines.push(line);
  }
  return lines.join("\n");
}
