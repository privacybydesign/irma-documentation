// Loads the Markdown/MDX sources of docs.yivi.app into an in-memory corpus.
//
// The sources are the same files Docusaurus builds from (yivi-docs/docs, yivi-docs/edi-stelsel,
// yivi-docs/blog), so the MCP server always serves exactly what the site publishes. MDX-only
// constructs (imports, JSX components, comments) are rewritten to plain Markdown, and site-relative
// links become absolute so an agent can cite them.

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative, sep, basename, dirname, resolve, extname } from "node:path";
import { parse as parseYaml } from "yaml";
import GithubSlugger from "github-slugger";

export type Section = "yivi" | "eudi-certification" | "blog";

export const SECTION_LABELS: Record<Section, string> = {
  yivi: "Yivi documentation",
  "eudi-certification": "Dutch EUDI Wallet certification (EDI-stelsel)",
  blog: "Yivi blog",
};

export interface Heading {
  level: number;
  text: string;
  anchor: string;
  /** Line index in Page.markdown. */
  line: number;
}

export interface Chunk {
  id: string;
  path: string;
  section: Section;
  title: string;
  heading: string;
  anchor: string;
  text: string;
  /** Identifiers (requirement IDs, document IDs) matched as whole tokens. */
  ids: string;
}

export interface Page {
  /** Site path without trailing slash, e.g. "/session-requests". */
  path: string;
  url: string;
  section: Section;
  title: string;
  description: string;
  date?: string;
  tags?: string[];
  markdown: string;
  headings: Heading[];
}

export interface Requirement {
  id: string;
  title: string;
  /** Catalogue the requirement belongs to, e.g. "NL-P-01". */
  document: string;
  url: string;
  text: string;
}

export interface CoverField {
  key: string;
  value: string;
  note: string | null;
}

export interface SchemeDocument {
  id: string;
  label: string;
  slug: string;
  family: string;
  familyTitle: string;
  title: string;
  published: boolean;
  cover: CoverField[];
  pages: number | null;
  pdfSize: string | null;
  pdf: string | null;
  text: string | null;
  requirements: { catalogue: string; url: string; count: number }[];
}

export interface SchemeData {
  release: string;
  releaseLabel: string;
  documents: SchemeDocument[];
  terms: number;
  acronyms: number;
}

export interface Image {
  /** URL path the image is looked up by: "/img/..." (served by the site) or "<imagesPath>/..." (served by this server). */
  key: string;
  url: string;
  file: string;
  alt: string;
  /** URL paths of the pages that show the image. */
  pages: string[];
}

export interface Corpus {
  siteUrl: string;
  pages: Map<string, Page>;
  images: Map<string, Image>;
  chunks: Chunk[];
  requirements: Requirement[];
  scheme: SchemeData;
}

export interface LoadOptions {
  /** Directory that contains docs/, edi-stelsel/, blog/ and src/data (the yivi-docs folder). */
  docsRoot: string;
  /** Public origin of the docs site, without trailing slash. */
  siteUrl: string;
  /**
   * URL path under which this server serves images that have no stable URL on the site (images
   * next to a blog post, which Docusaurus hashes or inlines). Default "/mcp/images".
   */
  imagesPath?: string;
  /** Folder that "/img/..." image paths resolve in: yivi-docs/static, or the built site. */
  staticDir?: string;
}

const FENCE = /^\s*(```|~~~)/;
/** A closing fence has no info string. */
const isClosingFence = (line: string, fence: string) => new RegExp(`^\\s*${fence}+\\s*$`).test(line);
const HEADING = /^(#{1,6})\s+(.*?)\s*(?:\{#([\w.-]+)\})?\s*$/;

/** Lets other work (such as serving the site) run between steps of loading. */
const yieldToEventLoop = () => new Promise<void>((resolve) => setImmediate(resolve));

/**
 * Loads all pages. Asynchronous only so that it yields to the event loop after every file: the
 * server keeps answering requests while the docs load on a small CPU share.
 */
export async function loadCorpus({ docsRoot, siteUrl, imagesPath = "/mcp/images", staticDir }: LoadOptions): Promise<Corpus> {
  docsRoot = resolve(docsRoot);
  staticDir = resolve(staticDir ?? join(docsRoot, "static"));
  const scheme = JSON.parse(
    readFileSync(join(docsRoot, "src/data/edi-stelsel/documents.json"), "utf8"),
  ) as SchemeData;

  // First pass: every source file and the URL path it is published at, so that relative
  // Markdown links (e.g. "[schemes](schemes.md)") can be turned into absolute URLs.
  const sources: Source[] = [];
  const collect = async (dir: string, section: Section, pathOf: (file: string) => (fm: Frontmatter) => string) => {
    for (const file of walk(join(docsRoot, dir))) {
      await yieldToEventLoop();
      const { fm, body } = splitFrontmatter(readFileSync(file, "utf8"));
      if (fm.draft === true || fm.unlisted === true) continue;
      sources.push({ file, section, fm, body, path: pathOf(file)(fm) });
    }
  };
  await collect("docs", "yivi", (file) => docPath(join(docsRoot, "docs"), file, ""));
  await collect("edi-stelsel", "eudi-certification", (file) =>
    docPath(join(docsRoot, "edi-stelsel"), file, "/edi-stelsel-certification"),
  );
  await collect("blog", "blog", (file) => (fm) => blogPath(join(docsRoot, "blog"), file, fm));

  const ctx: Ctx = {
    siteUrl,
    scheme,
    docsRoot,
    staticDir,
    imagesPath: normalizePath(imagesPath),
    fileToPath: new Map(sources.map((s) => [s.file, s.path])),
    images: new Map(),
  };
  const pages = new Map<string, Page>();
  for (const src of sources) {
    await yieldToEventLoop();
    pages.set(src.path, buildPage(ctx, src));
  }

  const chunks: Chunk[] = [];
  const requirements: Requirement[] = [];
  for (const page of pages.values()) {
    await yieldToEventLoop();
    chunks.push(...chunkPage(page));
    if (page.path.startsWith("/edi-stelsel-certification/requirements/")) {
      requirements.push(...extractRequirements(page));
    }
  }
  return { siteUrl, pages, images: ctx.images, chunks, requirements, scheme };
}

interface Ctx {
  siteUrl: string;
  scheme: SchemeData;
  docsRoot: string;
  staticDir: string;
  imagesPath: string;
  /** Absolute source file path -> published URL path. */
  fileToPath: Map<string, string>;
  /** Filled while converting pages. */
  images: Map<string, Image>;
}

export const IMAGE_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

/**
 * Registers a local image referenced from a page and returns its absolute URL, or undefined for
 * external or missing images. Site images ("/img/x.png") keep their site URL; images next to a
 * source file get a URL under ctx.imagesPath.
 */
function registerImage(ctx: Ctx, src: string, alt: string, sourceFile: string): string | undefined {
  if (/^[a-z]+:/i.test(src) || src.startsWith("//")) return undefined;
  const clean = decodeURIComponent(src.replace(/[?#].*$/, ""));
  if (!IMAGE_TYPES[extname(clean).toLowerCase()]) return undefined;
  let file: string;
  let key: string;
  if (clean.startsWith("/")) {
    file = join(ctx.staticDir, clean);
    key = normalizePath(clean);
  } else {
    file = resolve(dirname(sourceFile), clean);
    const rel = relative(ctx.docsRoot, file).split(sep).join("/");
    if (rel.startsWith("..")) return undefined;
    key = normalizePath(`${ctx.imagesPath}/${rel}`);
  }
  if (!existsSync(file)) return undefined;
  const page = ctx.fileToPath.get(sourceFile);
  const image = ctx.images.get(key) ?? { key, url: ctx.siteUrl + key, file, alt, pages: [] };
  if (page && !image.pages.includes(page)) image.pages.push(page);
  if (!image.alt && alt) image.alt = alt;
  ctx.images.set(key, image);
  return image.url;
}

interface Source {
  file: string;
  section: Section;
  fm: Frontmatter;
  body: string;
  path: string;
}

type Frontmatter = Record<string, unknown>;

function* walk(dir: string): Generator<string> {
  if (!existsSync(dir)) return;
  for (const name of readdirSync(dir).sort()) {
    if (name.startsWith("_") || name.startsWith(".")) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) yield* walk(full);
    else if (/\.mdx?$/.test(name)) yield full;
  }
}

/** URL path of a docs-plugin page: slug/id frontmatter, else the file path; index files map to their folder. */
function docPath(root: string, file: string, base: string) {
  return (fm: Frontmatter): string => {
    const rel = relative(root, file).split(sep).join("/").replace(/\.mdx?$/, "");
    const dir = rel.includes("/") ? rel.slice(0, rel.lastIndexOf("/")) : "";
    if (typeof fm.slug === "string") {
      return normalizePath(fm.slug.startsWith("/") ? base + fm.slug : `${base}/${dir}/${fm.slug}`);
    }
    let name = basename(rel);
    if (typeof fm.id === "string") name = fm.id;
    else if (/^(index|readme)$/i.test(name) || name === basename(dir)) name = "";
    return normalizePath(`${base}/${dir}/${name}`);
  };
}

/** URL path of a blog post: /blog/<slug>, else Docusaurus' default /blog/YYYY/MM/DD/<name>. */
function blogPath(root: string, file: string, fm: Frontmatter): string {
  if (typeof fm.slug === "string") {
    return normalizePath(fm.slug.startsWith("/") ? fm.slug : `/blog/${fm.slug}`);
  }
  const rel = relative(root, file).split(sep).join("/");
  const name = /^index\.mdx?$/.test(basename(rel)) ? basename(dirname(rel)) : basename(rel).replace(/\.mdx?$/, "");
  const m = /^(\d{4})-(\d{2})-(\d{2})-(.*)$/.exec(name);
  return normalizePath(m ? `/blog/${m[1]}/${m[2]}/${m[3]}/${m[4]}` : `/blog/${name}`);
}

export function normalizePath(p: string): string {
  const out = ("/" + p).replace(/\/{2,}/g, "/").replace(/\/$/, "");
  return out === "" ? "/" : out;
}

function buildPage(ctx: Ctx, { file, section, fm, body, path }: Source): Page {
  const markdown = toMarkdown(ctx, body, file);
  const firstH1 = /^#\s+(.+)$/m.exec(markdown)?.[1];
  const title = str(fm.title) ?? firstH1 ?? basename(file).replace(/\.mdx?$/, "");
  const date =
    section === "blog"
      ? (str(fm.date) ?? /(\d{4}-\d{2}-\d{2})/.exec(file)?.[1])
      : undefined;

  return {
    path,
    url: ctx.siteUrl + (path === "/" ? "/" : path),
    section,
    title,
    description: str(fm.description) ?? "",
    date,
    tags: Array.isArray(fm.tags) ? fm.tags.map(String) : undefined,
    markdown,
    headings: collectHeadings(markdown),
  };
}

function str(v: unknown): string | undefined {
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}

function splitFrontmatter(raw: string): { fm: Frontmatter; body: string } {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw);
  if (!m) return { fm: {}, body: raw };
  const fm = (parseYaml(m[1]) ?? {}) as Frontmatter;
  return { fm, body: raw.slice(m[0].length) };
}

/** The document without its fenced code blocks. */
export function stripFences(md: string): string {
  const prose: string[] = [];
  outsideFences(md, (s) => (prose.push(s), s));
  return prose.join("\n");
}

/** Applies fn to the parts of the document outside fenced code blocks. */
function outsideFences(md: string, fn: (prose: string) => string): string {
  const lines = md.split("\n");
  const out: string[] = [];
  let buf: string[] = [];
  let fence: string | null = null;
  const flush = () => {
    if (buf.length) out.push(fn(buf.join("\n")));
    buf = [];
  };
  for (const line of lines) {
    const m = FENCE.exec(line);
    if (fence) {
      out.push(line);
      if (isClosingFence(line, fence)) fence = null;
    } else if (m) {
      flush();
      out.push(line);
      fence = m[1];
    } else {
      buf.push(line);
    }
  }
  flush();
  return out.join("\n");
}

function attr(attrs: string, name: string): string | undefined {
  const m = new RegExp(`\\b${name}=(?:"([^"]*)"|'([^']*)'|\\{\\s*([^}]*?)\\s*\\})`).exec(attrs);
  return m ? (m[1] ?? m[2] ?? m[3]?.replace(/^["']|["']$/g, "")) : undefined;
}

/** Rewrites MDX to plain Markdown with absolute links. */
export function toMarkdown(ctx: Ctx, body: string, file: string): string {
  const site = ctx.siteUrl;
  const doc = (id: string | undefined) =>
    ctx.scheme.documents.find((d) => d.id === id || d.slug === id);

  const md = outsideFences(body, (prose) => {
    // Keep inline code (which may contain "<Tag>" or "import") out of the rewriting below.
    const code: string[] = [];
    let s = prose.replace(/``[^`\n][^\n]*?``|`[^`\n]+`/g, (m) => `\u0000${code.push(m) - 1}\u0000`);
    s = s
      .replace(/^import\s+(?:[\w*{}\s,]+?\s+from\s+)?["'][^"'\n]+["'];?[ \t]*$/gm, "")
      .replace(/\{\/\*[\s\S]*?\*\/\}/g, "");

    let prev: string;
    do {
      prev = s;
      s = s.replace(/<!--[\s\S]*?-->/g, "");
    } while (s !== prev);

    // <Cite doc="NL-TL" page={23}>§8.6</Cite>  ->  ([NL-TL §8.6, p. 23](pdf#page=23))
    s = s.replace(
      /<Cite\b([^>]*?)(?:\/>|>([\s\S]*?)<\/Cite>)/g,
      (_m, attrs: string, inner?: string) => {
        const d = doc(attr(attrs, "doc"));
        const page = attr(attrs, "page");
        const label = [d?.label ?? attr(attrs, "doc"), inner?.trim()].filter(Boolean).join(" ");
        const text = `${label}${page ? `, p. ${page}` : ""}`;
        return d?.pdf ? `([${text}](pathname://${d.pdf}#page=${page}))` : `(${text})`;
      },
    );

    // <DocLink id="NL-FS" />  ->  [NL-FS](/edi-stelsel-certification/documents/nl-fs)
    s = s.replace(
      /<DocLink\b([^>]*?)(?:\/>|>([\s\S]*?)<\/DocLink>)/g,
      (_m, attrs: string, inner?: string) => {
        const d = doc(attr(attrs, "id"));
        if (!d) return inner ?? attr(attrs, "id") ?? "";
        return `[${inner?.trim() || d.label}](/edi-stelsel-certification/documents/${d.slug})`;
      },
    );

    // <DocumentFacts id="NL-P-01" />  ->  the cover facts as a list
    s = s.replace(/<DocumentFacts\b([^>]*?)\/>/g, (_m, attrs: string) => {
      const d = doc(attr(attrs, "id"));
      if (!d) return "";
      const lines = d.cover.map(
        (c) => `- **${c.key}:** ${c.value}${c.note ? ` (${c.note})` : ""}`,
      );
      if (d.pdf) lines.push(`- **Authoritative PDF:** [${basename(d.pdf)}](pathname://${d.pdf})`);
      if (d.text) lines.push(`- **Full text:** [${d.label} full text](${d.text})`);
      for (const r of d.requirements) {
        lines.push(`- **Requirements:** [${r.count} entries in ${r.catalogue}](${r.url})`);
      }
      return lines.join("\n");
    });

    // Tabs: keep each tab's content, labelled.
    s = s
      .replace(/<TabItem\b([^>]*)>/g, (_m, attrs: string) => {
        const label = attr(attrs, "label") ?? attr(attrs, "value");
        return label ? `\n**${label}:**\n` : "";
      })
      .replace(/<\/TabItem>|<\/?Tabs\b[^>]*>/g, "");

    // Release statistics (src/components/EdiStelsel/Stats.tsx).
    const docs = ctx.scheme.documents;
    const stats: Record<string, string | number> = {
      DocumentCount: docs.filter((d) => d.published).length,
      RequirementCount: docs.reduce((n, d) => n + d.requirements.reduce((m, r) => m + r.count, 0), 0),
      CatalogueCount: docs.reduce((n, d) => n + d.requirements.length, 0),
      TermCount: ctx.scheme.terms,
      ReleaseLabel: ctx.scheme.releaseLabel,
    };
    s = s.replace(/<(\w+)\s*\/>/g, (m, name: string) => (name in stats ? String(stats[name]) : m));

    // Interactive components (search widgets, maps) have no text equivalent.
    s = s.replace(/<[A-Z][\w.]*\b[^>]*\/>/g, "").replace(/<\/?[A-Z][\w.]*\b[^>]*>/g, "");

    // Images: <img src="..." alt="..."> and ![alt](src) become ![alt](absolute URL) that get_image accepts.
    s = s.replace(/<img\b([^>]*?)\/?>/g, (m, attrs: string) => {
      const src = attr(attrs, "src");
      return src ? `![${attr(attrs, "alt") ?? ""}](${src})` : m;
    });
    s = s.replace(/!\[([^\]]*)\]\(\s*<?([^)\s>]+)>?(\s+"[^"]*")?\s*\)/g, (m, alt: string, src: string) => {
      const url = registerImage(ctx, src, alt, file);
      return url ? `![${alt}](${url})` : m;
    });

    // Relative links to other Markdown sources: [schemes](schemes.md#x) -> https://docs.yivi.app/schemes#x
    s = s.replace(/\]\((?![a-z]+:|\/|#)([^)\s#]+\.mdx?)(#[^)\s]*)?\)/g, (m, target: string, hash = "") => {
      const path = ctx.fileToPath.get(resolve(dirname(file), decodeURIComponent(target)));
      return path ? `](${site}${path === "/" ? "/" : path}${hash})` : m;
    });

    return s
      .replace(/\u0000(\d+)\u0000/g, (_m, i: string) => code[Number(i)])
      .replace(/\]\(pathname:\/\/\//g, `](${site}/`)
      .replace(/\]\(\/(?!\/)/g, `](${site}/`)
      .replace(/^(#{1,6}\s+)\\#/gm, "$1#");
  });

  return md.replace(/\n{3,}/g, "\n\n").trim() + "\n";
}

function plainHeading(text: string): string {
  return text
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[`*]/g, "")
    .replace(/(^|\s)_+([^_\s][^_]*?)_+(?=\s|$)/g, "$1$2")
    .replace(/\\(.)/g, "$1")
    .trim();
}

function collectHeadings(markdown: string): Heading[] {
  const slugger = new GithubSlugger();
  const headings: Heading[] = [];
  let fence: string | null = null;
  markdown.split("\n").forEach((line, i) => {
    const f = FENCE.exec(line);
    if (fence) {
      if (isClosingFence(line, fence)) fence = null;
      return;
    }
    if (f) {
      fence = f[1];
      return;
    }
    const h = HEADING.exec(line);
    if (!h) return;
    const text = plainHeading(h[2]);
    headings.push({ level: h[1].length, text, anchor: h[3] ?? slugger.slug(text), line: i });
  });
  return headings;
}

/** Markdown of the page as served to agents: explicit heading IDs removed. */
export function displayMarkdown(md: string): string {
  return md.replace(/^(#{1,6}\s+.*?)\s*\{#[\w.-]+\}\s*$/gm, "$1");
}

const CHUNK_LEVEL = 4;

function chunkPage(page: Page): Chunk[] {
  const lines = page.markdown.split("\n");
  const bounds = page.headings.filter((h) => h.level >= 2 && h.level <= CHUNK_LEVEL);
  const chunks: Chunk[] = [];
  const push = (heading: string, anchor: string, from: number, to: number) => {
    const text = displayMarkdown(lines.slice(from, to).join("\n")).trim();
    if (!text && !heading) return;
    chunks.push({
      id: `${page.path}#${anchor}`,
      path: page.path,
      section: page.section,
      title: page.title,
      heading,
      anchor,
      text,
      ids: identifiers(`${heading}\n${text}`),
    });
  };
  push("", "", 0, bounds[0]?.line ?? lines.length);
  bounds.forEach((h, i) => {
    push(h.text, h.anchor, h.line + 1, bounds[i + 1]?.line ?? lines.length);
  });
  return chunks;
}

const ID_PATTERN = /\b(?:[A-Z]{2,}[A-Z0-9]*(?:[-.][A-Z0-9]+)+|REQ-[\d.]+-\d+)\b/g;

/** Requirement and document identifiers such as "REQ-4.2-02", "NL-P-01", "ICS-01", "MASVS-STORAGE-1". */
function identifiers(text: string): string {
  return [...new Set(text.match(ID_PATTERN) ?? [])].join(" ");
}

function extractRequirements(page: Page): Requirement[] {
  const document = page.title.replace(/\s+requirements$/i, "");
  const lines = page.markdown.split("\n");
  const out: Requirement[] = [];
  page.headings.forEach((h, i) => {
    if (h.level !== 3) return;
    const end = page.headings.slice(i + 1).find((n) => n.level <= 3)?.line ?? lines.length;
    const [id, ...rest] = h.text.split(/\s+—\s+/);
    out.push({
      id: id.trim(),
      title: rest.join(" — ").trim(),
      document,
      url: `${page.url}#${h.anchor}`,
      text: displayMarkdown(lines.slice(h.line + 1, end).join("\n")).trim(),
    });
  });
  return out;
}

/** Returns the Markdown of one heading's section (the heading plus everything up to the next heading of the same or a higher level). */
export function sectionMarkdown(page: Page, anchor: string): string | undefined {
  const i = page.headings.findIndex((h) => h.anchor === anchor);
  if (i < 0) return undefined;
  const h = page.headings[i];
  const end = page.headings.slice(i + 1).find((n) => n.level <= h.level)?.line;
  const lines = page.markdown.split("\n").slice(h.line, end);
  return displayMarkdown(lines.join("\n")).trim() + "\n";
}
