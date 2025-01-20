---
slug: 2024-januari-migration
title: Migration announcement
authors: [dibranmulder]
tags: [yivi, migration]
---

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
We are not dropping Idemix support but we will build a feature with which Yivi supports crypto transitions.
We want to allign more with the The European Digital Identity Wallet (EUDI) ecosystem, 
We are aiming to become an EUDI wallet by 1 jan 2027, this is when the implementing acts are expected to be in force.
Since the EUDI-wallet ecosystem is decentral/democratized and important protocols and standards are in draft we will follow the implementation of the [NL Wallet](https://github.com/MinBZK/nl-wallet), to maximize interoperability


## MVP epics
- [SD-JWT VC](https://datatracker.ietf.org/doc/draft-ietf-oauth-sd-jwt-vc/)
- [OpenID4VP](https://openid.github.io/OpenID4VP/openid-4-verifiable-presentations-wg-draft.html)
- [OpenID4VCI](https://openid.github.io/OpenID4VCI/openid-4-verifiable-credential-issuance-wg-draft.html)
- Scheme - RP authentication & attribute authentication

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