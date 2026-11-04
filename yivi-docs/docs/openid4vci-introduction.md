---
title: OpenID4VCI Introduction
---

[OpenID for Verifiable Credential Issuance (OpenID4VCI)](https://openid.net/specs/openid-4-verifiable-credential-issuance-1_0.html) is the open standard for issuing verifiable credentials into a wallet. It is the issuance counterpart to [OpenID4VP](openid4vp-introduction.md) and is one of the core building blocks of the EUDI-wallet framework.

OpenID4VCI is [milestone 3](what-is-yivi.md#3-issue-sd-jwt-vc-credentials-over-openid4vci) of Yivi's [crypto agility roadmap](what-is-yivi.md#crypto-agile-and-open-standards). It enables Yivi to receive credentials from external issuers — for example a Dutch PID Provider or a public-sector EAA issuer — using the same standardized issuance protocol that other EUDI wallets support.

:::tip Operational
OpenID4VCI issuance is available in Yivi app 8.0.0+ (irmago v1.0.0+). mdoc credentials are supported from Yivi app 8.3.0 and SD-JWT-secured W3C VCDM credentials from Yivi app 8.4.0. Reach out to Yivi support if you want to issue into Yivi.
:::

## How it works at a glance

Yivi supports both the **pre-authorized code flow** and the **authorization code flow**. The pre-authorized flow is the most common in the EUDI ecosystem and is what our demos exercise; the steps below describe it end-to-end:

1. The issuer (or a frontend on its behalf) creates a **credential offer** describing which credential type to issue, optionally with a transaction code (`tx_code`) that the user must enter in the wallet for confirmation.
2. The issuer returns a wallet link such as `openid-credential-offer://?credential_offer_uri=...`. The user scans it as a QR code or opens it directly on mobile.
3. The Yivi app fetches the offer, optionally prompts for the `tx_code`, exchanges the pre-authorized code for an access token, and uses it to download the credential.
4. The issuer's backend can poll its own state to confirm that the credential was issued and clean up the offer.

## Relationship to IRMA-based issuance

Yivi already supports issuing SD-JWT VCs **over the IRMA protocol** today — see [Issuing SD-JWT VC over IRMA](sdjwtvc-issuance.md). That path is operational and is the right choice for existing Yivi issuers gradually adopting SD-JWT VC. OpenID4VCI is the path for **new** issuers that want to follow the EUDI standards directly without onboarding into the IRMA ecosystem.

Both paths produce the same SD-JWT VCs in the Yivi app. Once in the wallet, SD-JWT VCs are disclosed over OpenID4VP regardless of which protocol issued them.

Unlike IRMA issuance, OpenID4VCI is not limited to SD-JWT VC: the Yivi app also accepts ISO 18013-5 mdocs (`mso_mdoc`) and SD-JWT-secured W3C VCDM 2.0 credentials (`vc+sd-jwt`), such as Open Badges. See [Supported credential formats](openid4vci-issuer-integration.md#supported-credential-formats).

## What's in this section

- [Issuer Integration Guide](openid4vci-issuer-integration.md) — supported credential formats, credential offer creation, pre-authorized code flow, and the `tx_code` extension.

## What's not supported (yet)

- Issuing Idemix credentials over OpenID4VCI. Idemix issuance continues to use the IRMA protocol.
- Issuer trust list management via the Yivi portal — issuer onboarding is still a manual process; contact Yivi support.
