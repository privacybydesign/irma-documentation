import React from "react";
import Link from "@docusaurus/Link";
import { data, documentUrl } from "./data";
import styles from "./styles.module.css";

/** Table of all documents of the release, grouped by family, with links and downloads. */
export default function DocumentTable({ family }: { family?: string }): JSX.Element {
  const docs = data.documents.filter((d) => !family || d.family === family);
  return (
    <table className={styles.docTable}>
      <thead>
        <tr>
          <th>Document</th>
          <th>Title</th>
          <th>Version</th>
          <th>Requirements</th>
          <th>Sources</th>
        </tr>
      </thead>
      <tbody>
        {docs.map((d) => {
          const version = d.cover.find((f) => f.key === "Version")?.value ?? "–";
          return (
            <tr key={d.id}>
              <td>
                <Link to={documentUrl(d)}>{d.label}</Link>
              </td>
              <td>{d.title}</td>
              <td>{d.published ? version : "–"}</td>
              <td>
                {d.requirements.length === 0
                  ? "–"
                  : d.requirements.map((r) => (
                      <Link key={r.catalogue} to={r.url}>
                        {r.count}
                      </Link>
                    ))}
              </td>
              <td>
                {d.published ? (
                  <>
                    <Link to={`pathname://${d.pdf}`}>PDF</Link> · <Link to={d.text!}>Text</Link>
                  </>
                ) : (
                  <em>Not published</em>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
