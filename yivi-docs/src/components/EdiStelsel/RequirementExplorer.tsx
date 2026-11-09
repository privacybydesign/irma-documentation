import React, { useEffect, useMemo, useState } from "react";
import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { data } from "./data";
import styles from "./styles.module.css";

interface Requirement {
  document: string;
  document_title: string;
  id: string;
  kind: string;
  title: string;
  text: string;
  section: string;
  page: number | null;
  obligation: string;
  legal_refs: string[];
  url: string;
  pdf: string;
}

const PAGE_SIZE = 50;

function normalise(s: string): string {
  return s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "");
}

/** Search and filter every requirement of the release, client side. */
export default function RequirementExplorer(): JSX.Element {
  const source = useBaseUrl(`/files/edi-stelsel/${data.release}/requirements.json`);
  const [all, setAll] = useState<Requirement[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [doc, setDoc] = useState("");
  const [kind, setKind] = useState("");
  const [obligation, setObligation] = useState("");
  const [limit, setLimit] = useState(PAGE_SIZE);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setQuery(params.get("q") ?? "");
    setDoc(params.get("document") ?? "");
    fetch(source)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((json) => setAll(json.requirements as Requirement[]))
      .catch((e) => setError(String(e)));
  }, [source]);

  const index = useMemo(
    () =>
      (all ?? []).map((r) => ({
        r,
        haystack: normalise(
          [r.id, r.title, r.text, r.section, r.document, r.legal_refs.join(" ")].join(" "),
        ),
      })),
    [all],
  );

  const options = (key: keyof Requirement) =>
    Array.from(new Set((all ?? []).map((r) => String(r[key])))).filter(Boolean);

  const words = normalise(query).split(/\s+/).filter(Boolean);
  const results = index
    .filter(
      ({ r, haystack }) =>
        (!doc || r.document === doc) &&
        (!kind || r.kind === kind) &&
        (!obligation || r.obligation === obligation) &&
        words.every((w) => haystack.includes(w)),
    )
    .map(({ r }) => r);

  useEffect(() => setLimit(PAGE_SIZE), [query, doc, kind, obligation]);

  if (error) {
    return <p>The requirement data could not be loaded ({error}).</p>;
  }
  if (!all) {
    return <p>Loading the requirements…</p>;
  }

  return (
    <div className={styles.explorer}>
      <div className={styles.filters}>
        <label>
          Search
          <input
            type="search"
            value={query}
            placeholder="Words or an ID, e.g. revocation, PIN, ISS-5.1-01"
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <label>
          Document
          <select value={doc} onChange={(e) => setDoc(e.target.value)}>
            <option value="">All documents</option>
            {options("document").map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </label>
        <label>
          Kind
          <select value={kind} onChange={(e) => setKind(e.target.value)}>
            <option value="">All kinds</option>
            {options("kind").sort().map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </label>
        <label>
          Obligation
          <select value={obligation} onChange={(e) => setObligation(e.target.value)}>
            <option value="">Any obligation</option>
            {options("obligation").sort().map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </label>
      </div>
      <p className={styles.count} aria-live="polite">
        {results.length} of {all.length} requirements
      </p>
      <ul className={styles.results}>
        {results.slice(0, limit).map((r) => (
          <li key={r.url}>
            <div className={styles.resultHead}>
              <Link to={r.url}>
                <strong>{r.id}</strong>
              </Link>
              <span className={styles.badge}>{r.document}</span>
              <span className={styles.badge}>{r.kind}</span>
              <span className={styles.badge}>{r.obligation}</span>
              {r.page && <Link to={`pathname://${r.pdf}`}>PDF p. {r.page}</Link>}
            </div>
            {r.section && <div className={styles.resultSection}>{r.section}</div>}
            <div className={styles.resultText}>
              {r.text.length > 400 ? r.text.slice(0, 400) + "…" : r.text}
            </div>
          </li>
        ))}
      </ul>
      {results.length > limit && (
        <button className="button button--secondary" onClick={() => setLimit(limit + PAGE_SIZE)}>
          Show more ({results.length - limit} left)
        </button>
      )}
    </div>
  );
}
