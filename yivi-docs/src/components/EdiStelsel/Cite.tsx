import React from "react";
import Link from "@docusaurus/Link";
import { getDocument } from "./data";

/**
 * Reference to a place in a scheme document: renders "(NL-TL §8.6, p. 23)" and links to that
 * page of the authoritative PDF.
 */
export default function Cite({
  doc,
  page,
  children,
}: {
  doc: string;
  page: number;
  children?: React.ReactNode;
}): JSX.Element {
  const d = getDocument(doc);
  return (
    <span>
      (
      <Link to={`pathname://${d.pdf}#page=${page}`} title={`${d.label}: ${d.title}, PDF page ${page}`}>
        {d.label}
        {children ? <> {children}</> : null}, p. {page}
      </Link>
      )
    </span>
  );
}
