import React from "react";
import Link from "@docusaurus/Link";
import { data, getDocument } from "./data";
import styles from "./styles.module.css";

/** Facts box at the top of a document page: cover data, PDF, full text and requirements. */
export default function DocumentFacts({ id }: { id: string }): JSX.Element {
  const doc = getDocument(id);
  if (!doc.published) {
    return (
      <div className={styles.facts}>
        <p className={styles.factsTitle}>
          {doc.label}: {doc.title}
        </p>
        <p>
          Not published in the release of {data.releaseLabel}. The release lists this document as
          "under construction".
        </p>
      </div>
    );
  }
  return (
    <div className={styles.facts}>
      <p className={styles.factsTitle}>
        {doc.label}: {doc.title}
      </p>
      <div className={styles.actions}>
        <Link className="button button--primary button--sm" to={`pathname://${doc.pdf}`}>
          Download PDF ({doc.pdfSize}, {doc.pages} pages)
        </Link>
        <Link className="button button--secondary button--sm" to={doc.text!}>
          Read the full text
        </Link>
        {doc.requirements.map((r) => (
          <Link key={r.catalogue} className="button button--secondary button--sm" to={r.url}>
            {r.count} requirements
          </Link>
        ))}
      </div>
      <table className={styles.coverTable}>
        <caption>Cover page of the document, as printed</caption>
        <tbody>
          {doc.cover.map((f) => (
            <tr key={f.key}>
              <th scope="row">{f.key}</th>
              <td>
                {f.value}
                {f.note && <span className={styles.note}> ({f.note})</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
