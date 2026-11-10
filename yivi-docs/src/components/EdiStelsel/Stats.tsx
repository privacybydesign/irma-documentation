import React from "react";
import { data } from "./data";

/** Numbers about the release, computed from the generated data. */
export function DocumentCount(): JSX.Element {
  return <>{data.documents.filter((d) => d.published).length}</>;
}

export function RequirementCount(): JSX.Element {
  return <>{data.documents.reduce((n, d) => n + d.requirements.reduce((m, r) => m + r.count, 0), 0)}</>;
}

export function CatalogueCount(): JSX.Element {
  return <>{data.documents.reduce((n, d) => n + d.requirements.length, 0)}</>;
}

export function TermCount(): JSX.Element {
  return <>{data.terms}</>;
}

export function ReleaseLabel(): JSX.Element {
  return <>{data.releaseLabel}</>;
}
