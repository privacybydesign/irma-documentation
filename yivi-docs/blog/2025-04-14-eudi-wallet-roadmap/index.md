---
slug: 2025-eudi-wallet-roadmap
title: Yivi’s Strategic Roadmap to EUDI-Wallet Compliance
authors: [dibranmulder]
tags: [yivi, eudi]
---

As we enter a pivotal phase in digital identity development across Europe, **Yivi is committed to becoming a compliant EUDI-wallet**. This strategic decision is driven by a broader vision: to ensure that privacy-first identity solutions remain viable in a landscape increasingly shaped by regulation and standardization.

Our mission has always been clear: **with Yivi, you are in charge of your digital data**. And while regulatory alignment with eIDAS 2.0 and the EUDI-wallet may challenge some of our architectural preferences, it is a necessary step to bring privacy-preserving identity to the masses.

<div class="center-container">
    <img src="/img/vision.png" class="mm" alt="Yivi's vision" />
</div>

## Privacy by design, still at the core
Yivi was built from the ground up to respect user privacy. The emergence of the EUDI-wallet framework is a positive step for digital autonomy and self sovereignty of users. However, we are concerned about the current lack of native support for core privacy mechanisms such as **issuer unlinkability** and **relying party unlinkability**.

We are actively engaged in community discussions like [Topic G on Zero Knowledge Proofs](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/discussions/408), which highlight the limitations of the current specifications. While we appreciate that these topics are on the agenda, we remain cautious about both the timeline and the effectiveness of proposed solutions.

## Yivi Today: A Mature Ecosystem
Yivi is a set of open source software project implementing the Idemix attribute-based credential scheme, allowing users to safely and securely authenticate themselves as privacy-preserving as the situation permits. Users receive digitally signed attributes from trusted issuers, storing them in their Yivi app, after which the user can selectively disclose attributes to others. 

Yivi is more than just a mobile app, in fact we have all the software to build up an ID-Wallet ecosystem, much like the ARF prescribes. Obviously, some components are missing but Yivi has got some production-grade technology, such as:
- an implementation of the Idemix credential scheme.
- an open and transparent implementation of a Trust Scheme.
- an implementation of a proprietary `IRMA` protocol for issuance and selective disclosure, respecting core features such as: `selective disclosure`, `issuance`, `revocation based on accumulators` and that with respect to core privacy features such as: `issuer unlinkability` and `relying party unlinkability`. 
- a set of `open-source` software tooling to host `Attestation Providers (Issuers)` and `Relying Parties (Verifiers)`.
- a multi-platform, multi-language and accessible mobile App.

As you can see Yivi is and was way ahead of its time, but now has come the time to align with the broader European ecosystem. We believe our work in the past decade has been fundamental to the new way of attribute-based credential thinking.

## Key Challenges Ahead
Despite our maturity, there are significant gaps to bridge to achieve full EUDI-wallet compliance. We should work on interoperability and adopting industry standards. Our Idemix credential scheme has challenges such as its not Elliptic Curve based and it lacks hardware binding support.

:::note
Yivi should be able to adopt new credential schemes, such as BBS+ or Post Quantum implementations of Zero Knowledge Proof credential schemes.
:::

Yivi builds upon our own [IRMA protocol](/irma-protocol), we build this because there were no alternatives and no standards available, however reality caught up with us and now protocols like [OpenID for Verifiable Presentations](https://openid.github.io/OpenID4VP/openid-4-verifiable-presentations-wg-draft.html) and [OpenID for Verifiable Credential Issuance](https://openid.github.io/OpenID4VCI/openid-4-verifiable-credential-issuance-wg-draft.html) are now approaching a first stable version.

:::note
Yivi should be able to use industry standard protocols to improve interoperability.
:::

Yivi's has an open-source trust scheme, with the Privacy By Design Foundatation as trust anchor. Yivi users should be able to use other trust schemes as well, in such as way that credentials from multiple trust schemes can be used to selectively disclose information.

:::note
Yivi should be able to be part of the Dutch EDI-stelsel, which will provide PID and PUB EAA credentials.
:::

## Europe should make the right move
We think that the adoption of BBS+ signature schemes need more attention. We acknowledge the fact that hardware binding of these signature schemes within Trusted Execution Environments or HSM's is a challenge, but workarounds are available.

There have been modifications of BBS+ such as BBS# that make BBS Anonymous Credentials eIDAS 2.0 Compliant. Lots of effort is put into this from [Orange Open Source](https://opensource.orange.com/en/open-source-orange/). Essentially [BBS#](https://github.com/user-attachments/files/19198669/The_BBS_Sharp_Protocol.pdf) is a modification of BBS+ allowing group signatures and selective disclosure based on ECDSA.

However, there is a long road ahead of integrating these signature schemes within the ARF, but we greatly support the work Orange has been doing.

## Vision - The road ahead
We have intentionally waited for the ARF and related standards to stabilize. Premature adoption would have resulted in duplicated investment. Now, with a more concrete and interoperable profile emerging we think the time is right to take action.

:::note[Vision]
Yivi has to become `crypto agile`, in the sense that Yivi supports multiple credential schemes, protocols and credential formats. We think this is the right move ahead, we `preserve our privacy first implementation` and make Yivi `compatible with EUDI-wallet standards`. It allows us to innovate together with academia on for instance Post Quantum ZKP, Digital voting, Digital watermarking, etc.
:::

Becoming crypto agile is a multi-year effort. It will be a long-term investment which will significantly increase the interoperability of Yivi and thereby increase the usability of Yivi for organizations. We set the following milestones as a first step towards becoming an `crypto agile` and `EUDI-wallet` compliant ID-wallet.

In our continued efforts we will maintain our core principles which are:
- We will always work `open source`.
- We will always prefer the most `privacy friendly` solution.
- We will `never ask users to pay` for the App.
- We will stand for `ethical usage` of Yivi.

### 1. Disclose SD-JWT VC credentials over OpenID4VP.
Our first milestone is to enable the disclosure of SD-JWT VC credentials using the OpenID for Verifiable Presentations (OpenID4VP) protocol. This is a key step in becoming interoperable with the broader EUDI-wallet ecosystem. OpenID4VP is designed as a flexible carrier for multiple credential formats, and we believe it will ultimately support Idemix-based credentials as well—especially given its close relation to [AnonCreds](https://openid.net/specs/openid-4-verifiable-presentations-1_0.html#name-anoncreds).

In fact, Yivi aims to introduce its own credential format over OpenID4VP. While Idemix remains central to our stack, we will also embrace SD-JWT VCs and eventually other formats. Issuance in the early phases will still be handled via the IRMA protocol, with enhancements including:

- Same-device and cross-device disclosure flows
- Key binding support using Yivi’s keyshare server

This approach allows us to retain Yivi’s strengths while offering compatibility with modern standards.


### 2. Issue SD-JWT VC credentials over OpenID4VCI
Once disclosure is in place, the next step is standardizing issuance. We will adopt OpenID for Verifiable Credential Issuance (OpenID4VCI) to enable issuance of SD-JWT VCs in line with Dutch and European expectations.

This will be essential for integrating with emerging national and sectoral ecosystems, such as:

- The Dutch PID Provider
- PuB EAA issuers like the KVK, Belastingdienst, and others

While IRMA will remain the initial method for issuance, we will build bridges to support new flows and allow identity brokers to mediate across formats. Yivi must support multiple issuance standards to remain relevant and inclusive.

### 3. Multi trust scheme support
The third milestone is the integration of multiple trust schemes. Currently, Yivi operates under the trust scheme of the Privacy by Design Foundation. But in a European context, users must be able to present credentials from various ecosystems—public and private—without friction.

To do this, we’ll begin aligning with the EUDI trust model, closely observing the architectural direction of the [NL Public Reference Wallet](https://github.com/MinBZK/nl-wallet). Topics under research include:

- Relying Party (RP) registration and attribute catalog publishing
- RP authentication using X.509 certificates
- Lifecycle management of wallet instances and binding to specific devices
- Compatibility with Dutch and EU-level schemes, including integration with EDI-stelsel for PID and PuB credentials

Trust scheme pluralism is critical to maintaining Yivi’s openness, and we will ensure that users can fluidly operate across ecosystems while remaining in full control of their data.

## Conclusion: Privacy First, Future Ready
Our journey toward EUDI-wallet compliance is a long-term commitment. It is not merely about ticking regulatory checkboxes rather it's about preserving the right to privacy in a digitized European society. Yivi will continue to lead by example—through open innovation, ethical technology, and a relentless pursuit of user empowerment.

By becoming crypto-agile and aligning with emerging European standards, we reaffirm our founding belief: Digital identity should not come at the cost of privacy.

## References

OpenID for Verifiable Presentations - Editor's draft
https://openid.github.io/OpenID4VP/openid-4-verifiable-presentations-wg-draft.html

OpenID for Verifiable Credential Issuance - Editor's draft
https://openid.github.io/OpenID4VCI/openid-4-verifiable-credential-issuance-wg-draft.html

OpenID4VC High Assurance Interoperability Profile
https://openid.net/specs/openid4vc-high-assurance-interoperability-profile-1_0-03.html

SD-JWT-based Verifiable Credentials (SD-JWT VC)
https://datatracker.ietf.org/doc/draft-ietf-oauth-sd-jwt-vc/

Topic G: Zero Knowledge Proof #408
https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/discussions/408

Privacy shall be at the heart of ARF #192
https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/discussions/192

BBS# and eIDAS 2.0
https://csrc.nist.gov/csrc/media/presentations/2024/wpec2024-3b3/images-media/wpec2024-3b3-slides-antoine-jacques--BBS-sharp-eIDAS2.pdf

The BBS# protocol
https://github.com/user-attachments/files/19198669/The_BBS_Sharp_Protocol.pdf