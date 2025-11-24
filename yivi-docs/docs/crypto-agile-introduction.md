---
title: Crypto Agile Introduction
---

## Yivi's Journey to Crypto Agility

As we enter a pivotal phase in digital identity development across Europe, **Yivi is committed to becoming a compliant EUDI-wallet**. This strategic decision is driven by a broader vision: to ensure that privacy-first identity solutions remain viable in a landscape increasingly shaped by regulation and standardization.

Our mission has always been clear: **with Yivi, you are in charge of your digital data**. While regulatory alignment with eIDAS 2.0 and the EUDI-wallet may challenge some of our architectural preferences, it is a necessary step to bring privacy-preserving identity to the masses.

## What is Crypto Agility?

Crypto agility refers to the ability of a digital identity system to support multiple cryptographic schemes, protocols, and credential formats. For Yivi, this means:

- Supporting multiple credential schemes (Idemix, SD-JWT VC, Idemix, and future post-quantum implementations)
- Implementing industry-standard protocols (OpenID4VP, OpenID4VCI) alongside our existing IRMA protocol
- Enabling interoperability with various trust schemes and ecosystems

This approach allows Yivi to preserve its privacy-first implementation while becoming compatible with EUDI-wallet standards.

## Privacy by Design, Still at the Core

Yivi was built from the ground up to respect user privacy. The emergence of the EUDI-wallet framework is a positive step for digital autonomy and self-sovereignty of users. However, we remain concerned about the current lack of native support for core privacy mechanisms such as **issuer unlinkability** and **relying party unlinkability**.

We are actively engaged in community discussions like [Topic G on Zero Knowledge Proofs](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/discussions/408), which highlight the limitations of the current specifications. While we appreciate that these topics are on the agenda, we remain cautious about both the timeline and the effectiveness of proposed solutions.

## Yivi Today: A Mature Ecosystem

Yivi is more than just a mobile app. It's a set of open-source software projects implementing the Idemix attribute-based credential scheme, allowing users to safely and securely authenticate themselves as privacy-preserving as the situation permits.

Yivi has production-grade technology including:

- An implementation of the Idemix credential scheme
- An open and transparent implementation of a Trust Scheme
- An implementation of the proprietary IRMA protocol for issuance and selective disclosure, supporting core features such as selective disclosure, issuance, and revocation based on accumulators—all while respecting core privacy features like issuer unlinkability and relying party unlinkability
- A set of open-source software tooling to host Attestation Providers (Issuers) and Relying Parties (Verifiers)
- A multi-platform, multi-language, and accessible mobile app

Yivi was ahead of its time, but now has come the time to align with the broader European ecosystem. We believe our work in the past decade has been fundamental to the new way of attribute-based credential thinking.

## Key Challenges Ahead

Despite our maturity, there are significant gaps to bridge to achieve full EUDI-wallet compliance. We must work on interoperability and adopting industry standards. Our Idemix credential scheme has challenges such as not being Elliptic Curve based and lacking hardware binding support.

Yivi builds upon our own [IRMA protocol](irma-protocol.md), which we built because there were no alternatives and no standards available. However, reality caught up with us, and now protocols like [OpenID for Verifiable Presentations](https://openid.github.io/OpenID4VP/openid-4-verifiable-presentations-wg-draft.html) and [OpenID for Verifiable Credential Issuance](https://openid.github.io/OpenID4VCI/openid-4-verifiable-credential-issuance-wg-draft.html) are now approaching a first stable version.

## The Road Ahead: Key Milestones

Becoming crypto agile is a multi-year effort. It will be a long-term investment which will significantly increase the interoperability of Yivi and thereby increase its usability for organizations. We have set the following milestones as a first step towards becoming a crypto agile and EUDI-wallet compliant ID-wallet.

### 1. Disclose SD-JWT VC credentials over OpenID4VP

Our first milestone is to enable the disclosure of SD-JWT VC credentials using the OpenID for Verifiable Presentations (OpenID4VP) protocol. This is a key step in becoming interoperable with the broader EUDI-wallet ecosystem. OpenID4VP is designed as a flexible carrier for multiple credential formats, and we believe it will ultimately support Idemix-based credentials as well—especially given its close relation to [AnonCreds](https://openid.net/specs/openid-4-verifiable-presentations-1_0.html#name-anoncreds).

Yivi aims to introduce its own credential format over OpenID4VP. While Idemix remains central to our stack, we will also embrace SD-JWT VCs and eventually other formats. Issuance in the early phases will still be handled via the IRMA protocol, with enhancements including:

- Same-device and cross-device disclosure flows
- Key binding support using Yivi's keyshare server

This approach allows us to retain Yivi's strengths while offering compatibility with modern standards.

### 2. Issue SD-JWT VC credentials over OpenID4VCI

Once disclosure is in place, the next step is standardizing issuance. We will adopt OpenID for Verifiable Credential Issuance (OpenID4VCI) to enable issuance of SD-JWT VCs in line with Dutch and European expectations.

This will be essential for integrating with emerging national and sectoral ecosystems, such as:

- The Dutch PID Provider
- PuB EAA issuers like the KVK, Belastingdienst, and others

While IRMA will remain the initial method for issuance, we will build bridges to support new flows and allow identity brokers to mediate across formats. Yivi must support multiple issuance standards to remain relevant and inclusive.

For more details on how to issue SD-JWT VCs using the IRMA protocol, see our [SD-JWT VC Issuance guide](sdjwtvc-issuance.md).

### 3. Multi-trust scheme support

The third milestone is the integration of multiple trust schemes. Currently, Yivi operates under the trust scheme of the Privacy by Design Foundation. But in a European context, users must be able to present credentials from various ecosystems—public and private—without friction.

To do this, we'll begin aligning with the EUDI trust model, closely observing the architectural direction of the [NL Public Reference Wallet](https://github.com/MinBZK/nl-wallet). Topics under research include:

- Relying Party (RP) registration and attribute catalog publishing
- RP authentication using X.509 certificates
- Lifecycle management of wallet instances and binding to specific devices
- Compatibility with Dutch and EU-level schemes, including integration with EDI-stelsel for PID and PuB credentials

Trust scheme pluralism is critical to maintaining Yivi's openness, and we will ensure that users can fluidly operate across ecosystems while remaining in full control of their data.

## Core Principles

In our continued efforts we will maintain our core principles:

- We will always work **open source**
- We will always prefer the most **privacy friendly** solution
- We will **never ask users to pay** for the app
- We will stand for **ethical usage** of Yivi

## Conclusion: Privacy First, Future Ready

Our journey toward EUDI-wallet compliance is a long-term commitment. It is not merely about ticking regulatory checkboxes—rather it's about preserving the right to privacy in a digitized European society. Yivi will continue to lead by example—through open innovation, ethical technology, and a relentless pursuit of user empowerment.

By becoming crypto-agile and aligning with emerging European standards, we reaffirm our founding belief: **Digital identity should not come at the cost of privacy.**

## Related Documentation

- [SD-JWT VC Issuance](sdjwtvc-issuance.md) - How to issue SD-JWT VCs using the IRMA protocol
- [IRMA Protocol](irma-protocol.md) - Details about Yivi's proprietary protocol
- [Schemes](schemes.md) - Information about IRMA schemes and trust models
- [Technical Overview](technical-overview.md) - Deep dive into Yivi's architecture

## References

- [OpenID for Verifiable Presentations - Editor's draft](https://openid.github.io/OpenID4VP/openid-4-verifiable-presentations-wg-draft.html)
- [OpenID for Verifiable Credential Issuance - Editor's draft](https://openid.github.io/OpenID4VCI/openid-4-verifiable-credential-issuance-wg-draft.html)
- [OpenID4VC High Assurance Interoperability Profile](https://openid.net/specs/openid4vc-high-assurance-interoperability-profile-1_0-03.html)
- [SD-JWT-based Verifiable Credentials (SD-JWT VC)](https://datatracker.ietf.org/doc/draft-ietf-oauth-sd-jwt-vc/)
- [Topic G: Zero Knowledge Proof #408](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/discussions/408)
- [Privacy shall be at the heart of ARF #192](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/discussions/192)
