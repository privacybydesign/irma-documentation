import React from "react";
import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import { data, source } from "./data";
import styles from "./styles.module.css";

/**
 * Says where the scheme documents come from: the official publication of Programma EDI-stelsel NL.
 * The default variant is the banner of the introduction page. The compact variant is shown under
 * every page of the section (see src/theme/DocItem/Footer).
 */
export default function SourceNotice({ compact = false }: { compact?: boolean }): JSX.Element {
  const logo = useBaseUrl(source.logo);
  const publication = <Link to={source.url}>{source.title}</Link>;
  return (
    <aside className={compact ? `${styles.source} ${styles.sourceCompact}` : styles.source} aria-label="Source">
      <Link to={source.url} className={styles.sourceLogo} title={`${source.publisher} (${source.site})`}>
        <img src={logo} alt={`Logo of ${source.publisher}`} width={720} height={324} loading="lazy" />
      </Link>
      {compact ? (
        <p>
          <strong>Source:</strong> {publication}, published by {source.publisher} on {source.site}. This page is
          part of an independent guide by Yivi and is not an official publication.
        </p>
      ) : (
        <div>
          <p className={styles.sourceTitle}>Source: {source.publisher}</p>
          <p>
            The scheme documents explained in this section are written and published by {source.publisher}. The
            official publication is {publication} on {source.site}. There you find the original PDFs (this section
            uses the release of {data.releaseLabel}) and the feedback form.
          </p>
          <p className={styles.note}>
            Yivi is not part of the programme. The logo is shown only to identify the source.
          </p>
        </div>
      )}
    </aside>
  );
}
