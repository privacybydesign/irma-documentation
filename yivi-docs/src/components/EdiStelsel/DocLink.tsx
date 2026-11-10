import React from "react";
import Link from "@docusaurus/Link";
import { getDocument, documentUrl } from "./data";

/** Link to the page of a scheme document, labelled with its ID (or the children). */
export default function DocLink({ id, children }: { id: string; children?: React.ReactNode }): JSX.Element {
  const d = getDocument(id);
  return (
    <Link to={documentUrl(d)} title={d.title}>
      {children ?? d.label}
    </Link>
  );
}
