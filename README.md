# Yivi technical documentation

This is the source of the Yivi technical documentation website.

## Local development
To start a local docusaurus server simply run the following commands.
```bash
cd yivi-docs
npm i
npm run start
```

To start a local docker container with the right settings simply run:

```bash
docker compose up
```

## Release
To release a new version run the Github action located [here](https://github.com/privacybydesign/irma-documentation/actions/workflows/delivery.yml). This will push a new Docker build to Github packages:
https://github.com/privacybydesign/irma-documentation/pkgs/container/irma-documentation

### Note on delivery.yml pipeline behavior
When the `delivery.yml` pipeline is run from the master branch, it will use the latest tag. If the pipeline is not run from the master branch, it will use the staging tag.

## EDI-stelsel section
The `EDI-stelsel` section (`yivi-docs/edi-stelsel`, served under `/edi-stelsel-certification`) explains the Dutch certification system for EUDI Wallets. It is a separate docs instance with its own sidebar (`yivi-docs/sidebarsEdiStelsel.ts`) and React components in `yivi-docs/src/components/EdiStelsel`.

- **Hand-written pages:** `index.mdx`, `system/*.mdx` and `documents/*.mdx`. Every statement cites the section and PDF page of the scheme document it comes from (`<Cite doc="NL-TL" page={23}>§8.6</Cite>`).
- **Generated pages, do not edit by hand:**
  - `requirements/*.md` (not `requirements/index.mdx`);
  - `text/*.md` (not `text/index.mdx`);
  - `glossary.md`, `legal-basis.md` and `downloads.md`;
  - `src/data/edi-stelsel/documents.json`;
  - the PDFs and data sets in `static/files/edi-stelsel/<release>/` and the diagrams in `static/img/edi-stelsel/<release>/`.

The generated pages are created from the scheme release and its requirement catalogue with `tools/docs_site.py` in the EUDI-Wallet-Certification-System repository:

```bash
python tools/docs_site.py ../irma-documentation/yivi-docs --release 2026-11-06
```
