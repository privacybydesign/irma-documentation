import React from "react";
import Link from "@docusaurus/Link";
import { getDocument, documentUrl, SchemeDocument } from "./data";
import styles from "./styles.module.css";

function Doc({ id, note }: { id: string; note?: string }): JSX.Element {
  const doc: SchemeDocument = getDocument(id);
  return (
    <Link className={styles.mapDoc} to={documentUrl(doc)}>
      <strong>{doc.label}</strong>
      <span>{doc.title}</span>
      {note && <em>{note}</em>}
      {!doc.published && <em>Not yet published</em>}
    </Link>
  );
}

/**
 * The structure of the certification system as shown in NL-SYS-01, Figure 3, with every
 * document linked to its page.
 */
export default function DocumentMap(): JSX.Element {
  return (
    <div className={styles.map}>
      <div className={styles.mapRow}>
        <div className={styles.mapLabel}>System framework</div>
        <div className={styles.mapCells}>
          {["NL-SYS-01", "NL-SYS-02", "NL-SYS-03", "NL-SYS-04", "NL-SYS-05"].map((id) => (
            <Doc key={id} id={id} />
          ))}
        </div>
      </div>
      <div className={styles.mapRow}>
        <div className={styles.mapLabel}>Top-level certification scheme</div>
        <div className={styles.mapCells}>
          <Doc id="NL-TL" />
        </div>
      </div>
      <div className={styles.mapRow}>
        <div className={styles.mapLabel}>Subordinate schemes and their requirements</div>
        <div className={styles.mapColumns}>
          <div className={styles.mapColumn}>
            <p className={styles.mapColumnTitle}>Wallet Solution, functional</p>
            <Doc id="NL-FS" />
            <Doc id="NL-FS-W" />
            <Doc id="NL-FS-P" />
          </div>
          <div className={styles.mapColumn}>
            <p className={styles.mapColumnTitle}>Wallet Solution, cybersecurity</p>
            <Doc id="NL-CS-P1" />
            <Doc id="NL-CS-P2" />
            <Doc id="NL-CS-P3" />
            <Doc id="NL-CS-P4" />
            <Doc id="NL-CS-WI" />
            <Doc id="NL-CS-WI-COND" />
            <Doc id="NL-CS-WSCA" />
            <Doc id="NL-CS-WSCA-COND" />
          </div>
          <div className={styles.mapColumn}>
            <p className={styles.mapColumnTitle}>eID scheme: Wallet Provider and PID Provider</p>
            <Doc id="NL-P-W" note="Wallet Provider scheme" />
            <Doc id="NL-P-P" note="PID Provider scheme" />
            <Doc id="NL-P-01" note="Both" />
            <Doc id="NL-P-02" note="Both" />
            <Doc id="NL-P-03" note="Both" />
            <Doc id="NL-P-04W" note="Wallet Provider" />
            <Doc id="NL-P-04P-1" note="PID Provider" />
            <Doc id="NL-P-04P-2" note="PID Provider" />
          </div>
        </div>
      </div>
    </div>
  );
}
