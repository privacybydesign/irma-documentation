---
title: OpenID4VP Introduction
---

[OpenID for Verifiable Presentations (OpenID4VP)](https://openid.net/specs/openid-4-verifiable-presentations-1_0.html) is an open standard that allows a verifier (relying party) to request and receive verifiable credentials from a user's wallet. It is one of the core building blocks of the EUDI-wallet framework.

As part of Yivi's journey to become a [crypto agile, EUDI-compliant wallet](what-is-yivi.md#crypto-agile-and-open-standards), the Yivi app supports OpenID4VP for disclosure of SD-JWT VCs alongside the existing [IRMA protocol](irma-protocol.md). This means verifiers can choose between integrating with Yivi via IRMA or via OpenID4VP, depending on their ecosystem.

:::tip Operational
OpenID4VP disclosure is available from Yivi app version `7.10.0` and `irmago` version `0.19` onwards.
:::

## How it works at a glance

1. The verifier builds a [DCQL query](https://openid.net/specs/openid-4-verifiable-presentations-1_0.html#name-digital-credentials-query-l) describing the credentials and claims it needs.
2. The verifier asks its OpenID4VP server to create an authorization request. The server returns a `request_uri` that the Yivi app can fetch.
3. The verifier renders a wallet link such as `eudi-openid4vp://?client_id=...&request_uri=...` as a QR code (or, on mobile, opens it directly).
4. The Yivi app fetches the authorization request, verifies the verifier's X.509 certificate, asks the user to confirm, and posts a `vp_token` containing the requested SD-JWT VCs back to the verifier.
5. The verifier polls its server for the result and parses the disclosed claims out of the SD-JWT VC.

## What's in this section

- [Disclosing SD-JWT VCs over OpenID4VP](openid4vp-disclosure.md) — protocol details, verifier certificates, and DCQL examples.
- [Verifier Integration Guide](openid4vp-verifier-integration.md) — end-to-end frontend example based on the [openid4vp-demo-frontend](https://github.com/privacybydesign/openid4vp-demo-frontend) reference implementation.

## What's not supported (yet)

- Issuance over OpenID4VP — see [OpenID4VCI](openid4vci-introduction.md) instead.
- Idemix credentials over OpenID4VP — for now OpenID4VP carries only SD-JWT VC. Idemix disclosure continues to use the IRMA protocol.
- Wildcards in verifier certificate attribute permissions — every attribute you intend to request must currently be listed in the certificate's metadata.
