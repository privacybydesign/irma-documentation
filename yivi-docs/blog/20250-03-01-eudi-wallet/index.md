---
slug: 2024-januari-migration
title: Alliging with EUDI-wallet standards announcement
authors: [dibranmulder]
tags: [yivi, migration]
---

The digital identity landscape is evolving rapidly, and we at Yivi are committed to staying at the forefront of innovation while prioritizing user privacy. With this blog, we outline our plans to align Yivi with the European Digital Identity Wallet (EUDI) standards and our vision for the future.

At Yivi, we believe that zero knowledge proofs (ZKPs) is the appropriate technology for modern ID-wallets. This approach ensures that users can share only the necessary information without revealing excessive personal data, safeguarding their privacy. It is a foundational principle that drives our mision in ensuring the best privacy safeguards for our users.

Our zero knowledge proofs implementation: Idemix was its time well ahead. Inspiring the European ecosystem with the capabilities of ID-Wallets building privacy enhancing features like **multi-show unlinkability** and **issuer unlinkability**. We are still greatfull for all the people that worked on Yivi and made it the best and privacy friendly wallet in existence, untill this day.

We watched the EUDI-wallet developments over the past year with disappointment. Despite the [well documented feedback of douzens of cryptographers](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/issues/200), the EUDI-wallet standards, described in the [the Architecture and Reference Framework (ARF)](https://eu-digital-identity-wallet.github.io/eudi-doc-architecture-and-reference-framework/latest/), moved in a direction we did not want. It fell back on conventional cryptography losing core privacy enhacing aspects at its foundation.

## The way forward
We believe that the wide adoption of EUID-wallets will be an enhancement for modern society. Digital identity at its core should be privacy enhancing and its not safe at Big Tech companies.
Europe should build its sovereign identity framework that is resilient from geo-political factors. We think the eIDAS 2.0 legislation is in line with these principles.
Ofcourse we still think the chosen cryptograpgy standards are a missed opportunity, but that boat has sailed.

The only way in which EUDI-wallets are going to be succesfull is when there is a broad ecosystem of issuers and verifiers.
In other for the community to reach that goal we have to improve on compatibility and interopability.
We acknowledge the fact that Yivi has its own proprietary protocols and cryptographic algorithmes. Thats because Yivi was its time ahead.

In this next fase we want to allign more with the The European Digital Identity Wallet (EUDI) standards.
We will do this without compromising on our core mision which is delivering the best privacy enhancing technology out there.
We are not dropping IRMA/Idemix support but we will build a crypto agility feature.

### Crypto agility


### Planning
By the 1st of April 2025 we will have a plan to become EUDI Wallet compliant.
By the 1st of 




We are aiming to become an EUDI wallet by 1 jan 2027, this is when the implementing acts are expected to be in force.
Since the EUDI-wallet ecosystem is decentral/democratized and important protocols and standards are in draft we will follow the implementation of the [NL Wallet](https://github.com/MinBZK/nl-wallet), to maximize interoperability



## Assumptions

We think zero knowledge proofs is the right technology for ID-Wallets. 
We acknowledge the fact that Idemix has very few implementations are therefore lacks compatibility.
We acknowledge the fact that the IRMA protocol is proprietary and lacks wider adoption.
We acknowledge the fact that the Radboud University and SIDN were ahead of their times and greatly influenced the way how people think of ID-Wallets.
We still believe Yivi is the most privacy friendly ID-Wallet out there.

We think that BBS+ should have been in the [The Architecture and Reference Framework](https://eu-digital-identity-wallet.github.io/eudi-doc-architecture-and-reference-framework/latest/) for EUDI-wallets, like also mentoined in this paper and Github issue: [Cryptographers' Feedback on the EU Digital Identity’s ARF](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/issues/200).
We acknowledge that BBS+ has Eliptic Curve based signatures and is HSM friendly and therefore a better protocol then Idemix for ID-wallets.
We think having an open and transparent trust scheme which has a low barrier to use is valuable.

The current directions to EUDI-wallets are heading have severe privacy flaws, its compromising on multishow unlinkability and issuer unlinkability.
Multishow unlinkability means that if you reveal the same attribute twice to a relying party they can't be related. There are ways to circumstand the negative effects by for instance batch issuancing credentials and make them single use, but thats not going to happen in the broader EUDI-wallet ecosystem. With regards to issuer unlinkability, if you show the same non-unique attribute to the relying party twice, it will not be able to recognize you, even if the issuer cooperates with it. Its simply not possible in the ARF-setup. 

## The way forward
We are not dropping IRMA/Idemix support but we will build a feature with which Yivi supports crypto transitions.
We want to allign more with the The European Digital Identity Wallet (EUDI) ecosystem, 
We are aiming to become an EUDI wallet by 1 jan 2027, this is when the implementing acts are expected to be in force.
Since the EUDI-wallet ecosystem is decentral/democratized and important protocols and standards are in draft we will follow the implementation of the [NL Wallet](https://github.com/MinBZK/nl-wallet), to maximize interoperability

## MVP epics
- [SD-JWT VC](https://datatracker.ietf.org/doc/draft-ietf-oauth-sd-jwt-vc/)
- [OpenID4VP](https://openid.github.io/OpenID4VP/openid-4-verifiable-presentations-wg-draft.html)
- [OpenID4VCI](https://openid.github.io/OpenID4VCI/openid-4-verifiable-credential-issuance-wg-draft.html)
- Scheme - Relying Party authentication & attribute authentication

## Later epics
- eIDAS high
	- App/key attestation
	- WTE
	- PoA
- Redesign & reimplement schemes (i.e. RP & issuer authentication)
- Pseudonyms
- Credential revocation
- Wallet backup & recovery
- Offline support
	- Without internet/keyshare server
	- Over BLE/NFC/Wifi
		- ISO 18013-5
			- credential format
			- disclosure protocol
	- Verifier app (voor offline interactions with Yivi app)
- Qualified signatures