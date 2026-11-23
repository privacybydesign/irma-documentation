---
title: OpenID4VP Introduction
---

[OpenID for Verifiable Presentations (OpenID4VP)](https://openid.net/specs/openid-4-verifiable-presentations-1_0.html) is an open standard that allows a verifier (relying party) to request and receive verifiable credentials from a user's wallet. It is one of the core building blocks of the EUDI-wallet framework.

As part of Yivi's journey to become a [crypto agile, EUDI-compliant wallet](what-is-yivi.md#crypto-agile-and-open-standards), the Yivi app supports OpenID4VP for disclosure of SD-JWT VCs, ISO mdocs and SD-JWT-secured W3C VCDM credentials alongside the existing [IRMA protocol](irma-protocol.md). This means verifiers can choose between integrating with Yivi via IRMA or via OpenID4VP, depending on their ecosystem.

:::tip Operational
OpenID4VP disclosure is available from Yivi app version `7.10.0` and `irmago` version `0.19` onwards.
:::

## How it works at a glance

1. The verifier builds a [DCQL query](https://openid.net/specs/openid-4-verifiable-presentations-1_0.html#name-digital-credentials-query-l) describing the credentials and claims it needs.
2. The verifier asks its OpenID4VP server to create an authorization request. The server returns a `request_uri` that the Yivi app can fetch.
3. The verifier renders a wallet link such as `eudi-openid4vp://?client_id=...&request_uri=...` as a QR code (or, on mobile, opens it directly).
4. The Yivi app fetches the authorization request, verifies the verifier's X.509 certificate, asks the user to confirm, and posts a `vp_token` containing the requested credentials back to the verifier.
5. The verifier polls its server for the result and parses the disclosed claims out of the presentation.

## What's in this section

- [Disclosing SD-JWT VCs over OpenID4VP](openid4vp-disclosure.md): verifier certificates and DCQL examples.
- [Verifier Integration Guide](openid4vp-verifier-integration.md): step-by-step integration, what the app supports, and troubleshooting, based on the [openid4vp-demo-frontend](https://github.com/privacybydesign/openid4vp-demo-frontend) reference implementation. Its [format table](openid4vp-verifier-integration.md#supported-credential-formats) lists the formats the Yivi app can present besides SD-JWT VC: ISO 18013-5 mdocs (`mso_mdoc`) and SD-JWT-secured W3C VCDM credentials (`vc+sd-jwt`).

## What's not supported (yet)

- Issuance over OpenID4VP: see [OpenID4VCI](openid4vci-introduction.md) instead.
- Idemix credentials over OpenID4VP: OpenID4VP carries SD-JWT VC, mdoc and SD-JWT-secured VCDM credentials. Idemix disclosure continues to use the IRMA protocol.
- Presentation Exchange and the Digital Credentials API: requests have to use DCQL and reach the app as a link or QR code.
