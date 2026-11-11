import MiniSearch from "minisearch";
import type { Chunk, Corpus, Section } from "./content.ts";

export interface Hit {
  chunk: Chunk;
  score: number;
  snippet: string;
}

const defaultTokenize = (text: string) => text.split(/[\n\r\p{Z}\p{P}]+/u).filter(Boolean);

/**
 * Query tokens: the usual word split plus every whitespace-separated term as a whole, so that
 * "REQ-4.2-02" matches the identifier field exactly while still matching "req", "4", "2", "02".
 */
const queryTokenize = (text: string) => [
  ...new Set([...defaultTokenize(text), ...text.split(/\s+/).filter((t) => /[-.]/.test(t))]),
];

export class SearchIndex {
  private readonly index: MiniSearch<Chunk>;
  private readonly byId: Map<string, Chunk>;

  /** Builds the index in small batches, yielding to the event loop in between. */
  static async create(corpus: Corpus): Promise<SearchIndex> {
    const search = new SearchIndex(corpus);
    await search.index.addAllAsync(corpus.chunks, { chunkSize: 50 });
    return search;
  }

  private constructor(corpus: Corpus) {
    this.byId = new Map(corpus.chunks.map((c) => [c.id, c]));
    this.index = new MiniSearch<Chunk>({
      fields: ["title", "heading", "text", "ids"],
      storeFields: [],
      tokenize: (text, field) => (field === "ids" ? text.split(/\s+/) : defaultTokenize(text)),
      searchOptions: {
        boost: { ids: 6, heading: 3, title: 2 },
        prefix: (term) => term.length > 3,
        fuzzy: (term) => (term.length > 5 ? 0.15 : false),
        tokenize: queryTokenize,
      },
    });
  }

  search(query: string, opts: { section?: Section; limit: number }): Hit[] {
    const terms = queryTokenize(query).map((t) => t.toLowerCase());
    return this.index
      .search(query, {
        filter: opts.section ? (r) => this.byId.get(r.id)?.section === opts.section : undefined,
      })
      .slice(0, opts.limit)
      .map((r) => {
        const chunk = this.byId.get(r.id)!;
        return { chunk, score: r.score, snippet: snippet(chunk.text, terms) };
      });
  }
}

function snippet(text: string, terms: string[], size = 320): string {
  const flat = text.replace(/\s+/g, " ").trim();
  const lower = flat.toLowerCase();
  let at = -1;
  for (const t of terms.sort((a, b) => b.length - a.length)) {
    at = lower.indexOf(t);
    if (at >= 0) break;
  }
  const start = Math.max(0, (at < 0 ? 0 : at) - size / 3);
  const cut = flat.slice(start, start + size);
  return (start > 0 ? "…" : "") + cut + (start + size < flat.length ? "…" : "");
}
