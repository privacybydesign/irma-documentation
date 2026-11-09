import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

// Sidebar of the EDI-stelsel section (docs instance "edi-stelsel", folder ./edi-stelsel).
// Pages under requirements/ and text/, and glossary, legal-basis and downloads, are generated
// by tools/docs_site.py in the EUDI-Wallet-Certification-System repository.

const documentFamilies: { label: string; slugs: string[] }[] = [
  {
    label: "System framework (NL-SYS)",
    slugs: ["nl-sys-01", "nl-sys-02", "nl-sys-03", "nl-sys-04", "nl-sys-05"],
  },
  { label: "Top-level scheme (NL-TL)", slugs: ["nl-tl"] },
  { label: "Functional (NL-FS)", slugs: ["nl-fs", "nl-fs-w", "nl-fs-p"] },
  {
    label: "Cybersecurity (NL-CS)",
    slugs: [
      "nl-cs-part-1",
      "nl-cs-part-2",
      "nl-cs-part-3",
      "nl-cs-part-4",
      "nl-cs-wi",
      "nl-cs-wi-conditions",
      "nl-cs-wsca",
      "nl-cs-wsca-conditions",
    ],
  },
  {
    label: "Wallet and PID provider (NL-P)",
    slugs: [
      "nl-p-w",
      "nl-p-p",
      "nl-p-01",
      "nl-p-02",
      "nl-p-03",
      "nl-p-04w",
      "nl-p-04p-part-1",
      "nl-p-04p-part-2",
    ],
  },
];

const requirementPages = [
  "nl-fs-w",
  "nl-fs-p",
  "nl-cs-part-3",
  "nl-cs-part-4",
  "nl-cs-wi",
  "nl-cs-wi-conditions",
  "nl-cs-wsca",
  "nl-cs-wsca-conditions",
  "nl-p-01",
  "nl-p-02",
  "nl-p-03",
  "nl-p-04w",
  "nl-p-04p-part-1",
  "nl-p-04p-part-2",
];

const unpublished = new Set(["nl-sys-04"]);

const sidebars: SidebarsConfig = {
  ediStelselSidebar: [
    "index",
    {
      type: "category",
      label: "How the system works",
      collapsed: false,
      items: [
        "system/overview",
        "system/roles",
        "system/documents",
        "system/certification-process",
        "system/certificate-lifecycle",
        "system/wallet-architecture",
      ],
    },
    {
      type: "category",
      label: "Documents",
      collapsed: true,
      link: { type: "doc", id: "system/documents" },
      items: documentFamilies.map((family) => ({
        type: "category" as const,
        label: family.label,
        collapsed: true,
        items: family.slugs.map((slug) => `documents/${slug}`),
      })),
    },
    {
      type: "category",
      label: "Requirements",
      collapsed: true,
      link: { type: "doc", id: "requirements/index" },
      items: [
        ...requirementPages.map((slug) => `requirements/${slug}`),
        {
          type: "category",
          label: "External requirement sets",
          collapsed: false,
          items: ["requirements/owasp-mas-eudiw"],
        },
      ],
    },
    {
      type: "category",
      label: "Full text",
      collapsed: true,
      link: { type: "doc", id: "text/index" },
      items: documentFamilies
        .flatMap((family) => family.slugs)
        .filter((slug) => !unpublished.has(slug))
        .map((slug) => `text/${slug}`),
    },
    "glossary",
    "legal-basis",
    "downloads",
  ],
};

export default sidebars;
