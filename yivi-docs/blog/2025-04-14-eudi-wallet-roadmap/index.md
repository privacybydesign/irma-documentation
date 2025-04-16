---
slug: 2025-eudi-wallet-roadmap
title: EUDI wallet roadmap
authors: [dibranmulder]
tags: [yivi, eudi]
---

Yivi is committed to becoming an EUDI-wallet, not because the technical choices of the [Architectural Reference Framework (ARF)](https://eu-digital-identity-wallet.github.io/eudi-doc-architecture-and-reference-framework/latest/) are in line with our principles but because we believe that the wide user adoption of ID-Wallets has to pushed from legislation perspective. And therefore, we have to comply with the legislation to ultimately fulfill our mission which is, with Yivi you are: `In charge of your digital data`, we provide technology that is `Privacy First`. 

Yivi is committed to stay privacy first, we think that from the ground up privacy should be respected and implemented. The current developments in the EUDI wallet ecosystem are step forwards in terms of European autonomy and self sovereignty of users, but lacks key privacy features, such as: `issuer unlinkability` and `relying party, which is a shame. We are closely following the [Topic G: Zero Knowledge Proof discussion](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/discussions/408) in the ARF. We are content with the fact that the issue is being addressed but we are quite skeptical of the outcome and moreover with the timeline of the outcome.

## Current state of Yivi
Yivi is a set of open source software project implementing the Idemix attribute-based credential scheme, allowing users to safely and securely authenticate themselves as privacy-preserving as the situation permits. Users receive digitally signed attributes from trusted issuers, storing them in their Yivi app, after which the user can selectively disclose attributes to others. 

Yivi is more than just a mobile app, in fact we have all the software to build up an ID-Wallet ecosystem, much like the ARF prescribes. Obviously, some components are missing but Yivi got quite some production-grade technology, such as:
- an implementation of the Idemix signature scheme.
- an open and transparent implementation of a Trust Scheme.
- an implementation of a proprietary `IRMA` protocol for issuance and selective disclosure, respecting core features such as: `selective disclosure`, `issuance`, `revocation based on accumulators` and that with respect to core privacy features such as: `issuer unlinkability` and `relying party unlinkability`. 
- a set of `open-source` software tooling to host `Attestation Providers (Issuers)` and `Relying Parties (Verifiers)`.
- a multi-platform, multi-language, accessible mobile App.

As you can see Yivi is and was its time way ahead but now has come the time that we should allign with the broader European ecosystem. We believe our work in the past decade was fundamental to the new way of attribute-based credential thinking.

## Challenges
The current implementation of Yivi has several challenges that hinder it from wider usage in the European context. We should work on interoperability and adopt industry standards. Our Idemix signature scheme has challenges such as that its not Eliptic Curve based and it lacks hardware binding support.

:::note
Yivi should be able to adopt new credential schemes, such as BBS# or Post Quantum implementations of Zero Knowledge Proof credential schemes.
:::

Yivi builds upon our own [IRMA protocol](http://localhost:3000/irma-protocol), we build this because there were no alternatives and no standards available, however reality caught up with us and now protocols like [OpenID for Verifiable Presentations](https://openid.github.io/OpenID4VP/openid-4-verifiable-presentations-wg-draft.html) and [OpenID for Verifiable Credential Issuance](https://openid.github.io/OpenID4VCI/openid-4-verifiable-credential-issuance-wg-draft.html) are now approaching a first stable version.

:::note
Yivi should be able to use industry standard protocols to improve interoperability.
:::

Yivi's has an open trust scheme, with the Privacy By Design Foundatation as trust anchor. Yivi users should be able to use other trust schemes as well, in such as way that credentials from multiple trust schemes can be used to selectively disclose information.

:::note
Yivi should be able to be part of the Dutch EDI-stelsel, which will provide PID en PUB EAA credentials.
:::

## Europe should make the right move
We think that the adoption of BBS+ signature schemes need more attention, we acknowledge the fact that hardware binding of these signature schemes within Trusted Execution Environments or HSM's.

There have been modifications of BBS+ such as BBS# that make BBS Anonymous Credentials eIDAS 2.0 Compliant. Lots of effort is put into this from the Orange Innovations. Essentially BBS# [Ora2024] is a modification of BBS+ allowing group signatures and selective disclosure based on ECDSA.

However, there is a long road ahead of integrating these signature schemes within the ARF, but we greatly support the work Orange has been doing.

## Vision - The road ahead
We took some time so that the ARF and according standards became less volatile. Aligning to the ARF and accompanying standards that are very much still in development is a risky move. You might end up making the required investment twice. We now believe that the ecosystem is working towards a first stable interoperable profile. This gives us the certainty to start aligning Yivi with industry standards.

:::note[Vision]
Yivi has to become `crypto agile`, in the sense that Yivi supports multiple credential schemes, protocols and credential formats. We think this is the right move ahead, we `preserve our privacy first implementation` and make Yivi `compatible with EUDI-wallet standards`. It allows us to innovate together with academia on for instance Post Quantum ZKP, Digital voting, Digital watermarking, etc.
:::

Becoming crypto agile is a multi-year effort. It will be a long-term investment which will significantly increase the interoperability of Yivi and thereby increase the usability of Yivi for organizations. We set the following milestones as a first step towards becoming an `crypto agile` and `EUDI-wallet` compliant ID-wallet.

In our continued efforts we will maintain our core principles which are:
- We will always work `open source`.
- We will always prefer the most `privacy friendly` solution.
- We will `never ask users to pay` for the App.
- We will stand for `ethical usage` of Yivi.

### 1. Disclose Idemix credentials over OpenID4VP.

Idemix credentials are very closely related to [AnonCreds credential formats](https://openid.net/specs/openid-4-verifiable-presentations-1_0.html#name-anoncreds). We aim to introduce our own credential format on top of OpenID4VP, this is a first milestone, which improves interoperability with Relying Parties in the ecosystem. To improve interoperability we will investigate the required effort of integrating with existing verifiers of the EUDI-wallet open source projects. In this way we make it fully transparent what changes are required to interop with Yivi.

Since `OpenID for Verifiable Presentations - draft 26` removed DIF Presentation Exchange as a query language we will focus on DCQL as a query language. 

We break this epic up in the following sub tasks:

- Get a basic disclosure of a SD-JWT VC credential with ECDSA working over OpenID4VP to EU verifier.
- Disclose SD-JWT VC using Golang to EU verifier
- Write the Yivi App side of the protocol out in Golang and integrate in `irmago`.
- Build OpenID4VP verifier server in Go
- Make the verifier send Idemix DCQL queries to wallet and accept valid Idemix responses
- Make the Yivi App send Idemix credentials for Idemix DCQL requests

### 2. Support for ES256 signatures over OpenId4VCI.
The second milestone should enable us to issue non Zero Knowledge Proof credential to Yivi. This is needed because our long-term goal is to enable users to issue at least their PID credential to Yivi, next to that we see lots of government bodies exploring the possibility of issuing data themselves, such as `annual income`, `student status`, `working status`, etc.

Our current assumption is that these governmental bodies will leverage batch issuance of ES256 signatures to preserve some sort of privacy, but hopefully in the future they will also support privacy first credential schemes such as BBS#.

### 3. Multi trust scheme support
The third milestone will be alligning Yivi with the EUDI trust model. This will encompass a lot of things, but we are closely following the [NL Public Reference Wallet](https://github.com/MinBZK/nl-wallet) and keeping track of their choices. We do not have a detailed plan of approach yet, but we will be actively researching the following topics:

The following topics will also be applied to the Yivi trust scheme:
- Relying Party registration.
- Attribute registration for Relying parties.
- Relying Party authentication using X509 certificates

Next to that the following topics require more research
- Wallet Instance and Wallet Unit lifecycle and the Wallet Provider.
- Device binding 

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