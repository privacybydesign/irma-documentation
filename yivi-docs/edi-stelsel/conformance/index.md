---
title: "Yivi conformance overview"
sidebar_label: "Overview"
description: "Where Yivi stands on the requirements of the Dutch EUDI Wallet certification schemes, per requirement set, with pointers to the evidence."
format: md
---

This section records where Yivi stands on the requirements of the Dutch certification schemes for EUDI Wallets. Each requirement set gets its own page, with a status per requirement and a pointer to the evidence: source code, a test, a pull request or a document.

:::caution[Self-assessment]

These pages are a self-assessment by the Yivi team. They are not the result of an evaluation, test or audit by a conformity assessment body, and Yivi is not certified under the Dutch scheme. The scheme documents are release candidates, so the requirements can still change.

:::

## Status per requirement set {#status}

So far, one requirement set has been assessed: the OWASP MAS EUDI Wallet profile. The other sets are listed so that it is clear what is still to come.

| Requirement set | What its requirements are | Conformance overview |
|---|---|---|
| [OWASP MAS EUDI Wallet profile](/edi-stelsel-certification/requirements/owasp-mas-eudiw) | The wallet-specific OWASP Mobile Application Security requirements, on which the cybersecurity certification builds its test set | **[Assessed](/edi-stelsel-certification/conformance/owasp-mas-eudiw)**: 78 requirements, app side. [Automated test results](/edi-stelsel-certification/conformance/owasp-mas-eudiw-tests) |
| [NL-CS-WI](/edi-stelsel-certification/requirements/nl-cs-wi) | Functional (FSR) and resilience (RSR) security requirements for the Wallet Instance | Not started |
| [NL-CS-WI conditions](/edi-stelsel-certification/requirements/nl-cs-wi-conditions) | Conditions on the underlying mobile system (SC-01 to SC-12) | Not started |
| [NL-CS-WSCA](/edi-stelsel-certification/requirements/nl-cs-wsca) | Common Criteria security functional requirements (SFRs) for the WSCA | Not started |
| [NL-CS-WSCA conditions](/edi-stelsel-certification/requirements/nl-cs-wsca-conditions) | Conditions for the platform underneath the WSCA | Not started |
| [NL-CS Part 3](/edi-stelsel-certification/requirements/nl-cs-part-3) | The evidence an evaluation laboratory checks (E1–E15) | Not started |
| [NL-CS Part 4](/edi-stelsel-certification/requirements/nl-cs-part-4) | Audit criteria for the operational processes behind the Wallet Instance | Not started |
| [NL-FS-W](/edi-stelsel-certification/requirements/nl-fs-w) | Implementation Conformance Statement (ICS) items for a Wallet Solution | Not started |
| [NL-P-01](/edi-stelsel-certification/requirements/nl-p-01) | Organisational and technical requirements for Wallet Providers and PID Providers | Not started |
| [NL-P-02](/edi-stelsel-certification/requirements/nl-p-02) | Cybersecurity controls for essential entities | Not started |
| [NL-P-03](/edi-stelsel-certification/requirements/nl-p-03) | Secure software development and vulnerability management requirements | Not started |
| [NL-P-04W](/edi-stelsel-certification/requirements/nl-p-04w) | Wallet onboarding and lifecycle management requirements for Wallet Providers | Not started |
| [NL-FS-P](/edi-stelsel-certification/requirements/nl-fs-p) | ICS items for a PID issuance service | Not started |
| [NL-P-04P Part 1](/edi-stelsel-certification/requirements/nl-p-04p-part-1) | PID issuance and lifecycle management requirements for PID Providers | Not started |
| [NL-P-04P Part 2](/edi-stelsel-certification/requirements/nl-p-04p-part-2) | PID revocation, expiry and deletion requirements for PID Providers | Not started |

The last three sets are addressed to PID Providers. Whether they apply to Yivi has not been determined yet.

## How to read a conformance page {#reading}

Every conformance page uses the same parts:

- **Basis:** the exact version that was assessed, such as a commit of the app. Links to source code point to that version, so they keep showing the lines the statement is based on.
- **Status:** one status per requirement.
- **Finding:** what is in place and what is open, in one or two sentences.
- **Evidence:** links to the files, tests, pull requests or documents behind the finding.

The statuses are:

| Status | Meaning |
|---|---|
| **Implemented** | A measure for this requirement is in place. The evidence points to it. It does not mean that an evaluator accepted it. |
| **Partly** | A measure is in place, and a named part is still open. |
| **Open** | Not in place yet. The page names what it depends on, such as the wallet provider backend, irmago or a decision. |
| **Not assessed** | No evidence has been collected. This says nothing about whether the requirement is met. |
| **Out of scope** | The requirement set itself places the requirement outside its scope. |

## Sources of evidence {#sources}

| Source | What it shows |
|---|---|
| [privacybydesign/irmamobile](https://github.com/privacybydesign/irmamobile) | The Yivi app: source code, tests, the changelog and the CI workflows |
| [privacybydesign/irmago](https://github.com/privacybydesign/irmago) | The library underneath the app: protocols, cryptography and storage |
| [Requirements](/edi-stelsel-certification/requirements) | Every requirement of the scheme documents, with a link to the page of the authoritative PDF |
