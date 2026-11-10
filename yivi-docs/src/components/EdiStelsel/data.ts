import raw from "@site/src/data/edi-stelsel/documents.json";

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

export const data = raw as SchemeData;

export function getDocument(id: string): SchemeDocument {
  const doc = data.documents.find((d) => d.id === id || d.slug === id);
  if (!doc) {
    throw new Error(`Unknown EDI-stelsel document: ${id}`);
  }
  return doc;
}

export const documentUrl = (doc: SchemeDocument) => `/edi-stelsel-certification/documents/${doc.slug}`;
