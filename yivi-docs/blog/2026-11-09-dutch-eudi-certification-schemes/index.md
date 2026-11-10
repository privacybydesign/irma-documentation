---
slug: dutch-eudi-certification-schemes
title: "The Dutch certification schemes for EUDI Wallets are out: what they mean for a wallet provider"
authors: [dibranmulder]
tags: [yivi, eudi-wallet, certification, wallet-provider]
---

*The Netherlands has published the draft certification schemes for EUDI Wallets. They consist of 24 documents, 1,065 pages and more than 1,100 numbered requirements. This post covers what was announced, what it means for a wallet provider, and how many requirements Yivi has to meet. Yivi is studying the schemes and will send its feedback to the EDI-stelsel.*

<!-- truncate -->

## What was announced

On 5 November 2026, the drafts of the Dutch certification schemes for EUDI Wallets were presented at an expert meeting and published for feedback. They describe how a wallet, its provider and the PID provider it works with will be certified before the wallet can be admitted to the Dutch electronic identification scheme, the *stelsel*.

The documents are **release candidates**. Feedback can be sent until **31 December 2026**. The organisers then plan to review the feedback until mid-February 2027, publish a general response, and publish Version 1 of the schemes in Q1 2027.

To make the schemes easier to explore, we added a section to these docs: [Dutch EUDI Certification](/edi-stelsel-certification). It explains how the system works, has a page per document, lets you search every requirement, contains the full text of all documents and links to the original PDFs. Every statement there links to the page of the PDF it comes from.

## How big it is

| | |
|---|---|
| Documents | 24 published, plus 1 still under construction (NL-SYS-04, the risk register) |
| Pages | 1,065 |
| Numbered requirements | 1,123, in 14 requirement documents |
| External requirement set on top | the OWASP MAS EUDI Wallet profile, 78 requirements |
| Terms in the vocabulary | 119 |

The documents form one system. NL-SYS-01 sets the rules, and the top-level scheme NL-TL combines the results of three subordinate certifications:

- **Functional certification (NL-FS):** does the wallet correctly implement the protocols, data formats and functions of eIDAS and its implementing acts? Mainly testing.
- **Cybersecurity certification (NL-CS):** an evaluation of the Wallet Instance under FITCEM (EN 17640), plus Common Criteria certification of the WSCA and WSCD under EUCC. Mainly security testing.
- **Wallet Provider certification (NL-P-W):** the provider as an organisation, from governance and NIS2-style cyber resilience to secure development and the full wallet lifecycle. Mainly audits.

[How the certification system works](/edi-stelsel-certification/system/overview) explains this structure in detail.

## What it means for a wallet provider

**Five certificates, and a top-level certificate on top.** A wallet provider needs:

- a functional certificate;
- a cybersecurity certificate for the Wallet Instance;
- EUCC certificates for the WSCA and the WSCD;
- its own provider certificate.

On top of these comes the top-level certificate, issued per wallet provider. It requires all of those, an active certificate of the PID provider the wallet is linked to, and proof that the provider meets the national admission conditions in Dutch law. Those conditions are not published yet: the documents still contain a placeholder for national law.

**Only remote HSM wallets.** In version 1 of the system, only HSM-based architectures are accepted. The Wallet Instance runs on the phone; the WSCA and WSCD run in the wallet provider's backend. Variants with an embedded secure element or eSIM need a protection profile before they can be certified. A wallet without a dedicated secure element is not admitted at assurance level high.

**Every platform counts separately.** For the functional certification, wallet units for different operating systems, such as iOS and Android, are separate objects of certification.

**Assurance level high, no exceptions.** The cybersecurity scheme states that assurance level high is mandatory and that substantial is not sufficient. The required test set is built on OWASP MAS, with the OWASP MAS EUDI Wallet profile on top.

**Certification is a cycle, not a one-off.** The top-level certificate and the provider certificate are valid for four years. The functional and cybersecurity certificates are valid for at most five years. In between, there is surveillance:

- an annual surveillance of the top-level and provider certificates;
- a vulnerability assessment at least every two years;
- changes that must be notified;
- in the cybersecurity scheme: critical vulnerabilities and active exploits reported within 24 hours, and high-severity vulnerabilities within 72 hours.

**The effort is substantial, and the applicant pays.** NL-SYS-01 states that each applicant pays for its own certification and for maintaining its certificate. The documents also give an idea of the effort:

- **Wallet Instance evaluation:** a fixed time budget, with an effort table of 156.5 person days for all functional and mandatory resilience requirements. Including the recommended requirements it is 178.25 person days. The table assumes 8 hours per person day, which the document marks as still to be confirmed.
- **Wallet Provider certification:** the indicative effort of the certification body is 30 working days for the evaluation and 15 for the certification. These are maximum and planned values.

These figures are only for those two parts. The functional certification, the EUCC evaluations of the WSCA and WSCD, the top-level certification, the yearly surveillance and the provider's own preparation come on top.

## How many requirements Yivi has to meet

Yivi is a wallet provider and develops its own WSCA. These are the requirement documents that apply to us:

| Certification | Document | Requirements |
|---|---|---:|
| Functional | [NL-FS-W](/edi-stelsel-certification/requirements/nl-fs-w): Implementation Conformance Statement | 37 |
| Cybersecurity, Wallet Instance | [NL-CS-WI](/edi-stelsel-certification/requirements/nl-cs-wi): protection profile | 41 |
| | [NL-CS-WI conditions](/edi-stelsel-certification/requirements/nl-cs-wi-conditions): mobile platform | 12 |
| | [NL-CS Part 3](/edi-stelsel-certification/requirements/nl-cs-part-3): evidence for the laboratory | 15 |
| | [NL-CS Part 4](/edi-stelsel-certification/requirements/nl-cs-part-4): audit criteria for our processes | 24 |
| Cybersecurity, WSCA | [NL-CS-WSCA](/edi-stelsel-certification/requirements/nl-cs-wsca): Common Criteria protection profile | 59 |
| | [NL-CS-WSCA conditions](/edi-stelsel-certification/requirements/nl-cs-wsca-conditions): underlying platform | 110 |
| Wallet Provider | [NL-P-01](/edi-stelsel-certification/requirements/nl-p-01): organisation (excluding the 5 for PID providers only) | 97 |
| | [NL-P-02](/edi-stelsel-certification/requirements/nl-p-02): cybersecurity controls for essential entities | 218 |
| | [NL-P-03](/edi-stelsel-certification/requirements/nl-p-03): secure development and vulnerability management | 122 |
| | [NL-P-04W](/edi-stelsel-certification/requirements/nl-p-04w): wallet onboarding and lifecycle | 201 |
| **Total** | | **936** |

On top of that come:

- the 77 in-scope requirements of the [OWASP MAS EUDI Wallet profile](/edi-stelsel-certification/requirements/owasp-mas-eudiw), on which the security tests are built;
- the conditions of the top-level scheme;
- the national admission conditions, which are not published yet.

Not every one of the 936 is a hard "shall". In the functional ICS, 14 items are recommended and 12 optional. Six of the Wallet Instance requirements are recommended, and 17 of the lifecycle requirements are conditional. The 169 WSCA requirements apply to whoever develops the WSCA. A wallet provider that buys its WSCA relies on that WSCA's certification instead.

## What Yivi is doing

We are going through the schemes document by document and requirement by requirement. For every requirement we record whether it applies to Yivi and where we stand. Along the way we note what is unclear, inconsistent or missing in the drafts.

The drafts have a fair number of loose ends, which is what a consultation is for. Some examples:

- **Missing pieces:** the risk register document NL-SYS-04 and the national admission conditions are not there yet.
- **Numbers that don't line up:** NL-CS Part 2 describes a four-year certification cycle, while allowing cybersecurity certificates of up to five years.
- **Placeholders:** parts of the cybersecurity procedures are still placeholders.
- **Outdated references:** the Wallet Instance protection profile maps to an older numbering of the OWASP profile.

Yivi will send its feedback to the EDI-stelsel before the deadline of 31 December 2026. We want the Dutch certification system to be clear, workable and achievable for every wallet provider that wants to offer a secure, privacy-friendly wallet, including open source wallets like Yivi.

Want to see for yourself? Start with [Dutch EUDI Certification](/edi-stelsel-certification), or go straight to the [requirement search](/edi-stelsel-certification/requirements).
