---
title: OpenID4VCI Introduction
---

[OpenID for Verifiable Credential Issuance (OpenID4VCI)](https://openid.net/specs/openid-4-verifiable-credential-issuance-1_0.html) is the open standard for issuing verifiable credentials into a wallet. It is the issuance counterpart to [OpenID4VP](openid4vp-introduction.md) and is one of the core building blocks of the EUDI-wallet framework.

OpenID4VCI is [milestone 3](what-is-yivi.md#3-issue-sd-jwt-vc-credentials-over-openid4vci) of Yivi's [crypto agility roadmap](what-is-yivi.md#crypto-agile-and-open-standards). It enables Yivi to receive SD-JWT VCs from external issuers — for example a Dutch PID Provider or a public-sector EAA issuer — using the same standardized issuance protocol that other EUDI wallets support.

:::info Private Beta
OpenID4VCI issuance is currently in private beta. The API and integration story may still change. Reach out to Yivi support if you would like to participate.
:::

## How it works at a glance

Yivi supports the **pre-authorized code flow**, which is the most common flow used in the EUDI ecosystem and the only one currently exercised in our demos:

1. The issuer (or a frontend on its behalf) creates a **credential offer** describing which credential type to issue, optionally with a transaction code (`tx_code`) that the user must enter in the wallet for confirmation.
2. The issuer returns a wallet link such as `openid-credential-offer://?credential_offer_uri=...`. The user scans it as a QR code or opens it directly on mobile.
3. The Yivi app fetches the offer, optionally prompts for the `tx_code`, exchanges the pre-authorized code for an access token, and uses it to download the credential.
4. The issuer's backend can poll its own state to confirm that the credential was issued and clean up the offer.

## Relationship to IRMA-based issuance

Yivi already supports issuing SD-JWT VCs **over the IRMA protocol** today — see [Issuing SD-JWT VC over IRMA](sdjwtvc-issuance.md). That path is operational and is the right choice for existing Yivi issuers gradually adopting SD-JWT VC. OpenID4VCI is the path for **new** issuers that want to follow the EUDI standards directly without onboarding into the IRMA ecosystem.

Both paths produce the same SD-JWT VCs in the Yivi app. Once in the wallet, SD-JWT VCs are disclosed over OpenID4VP regardless of which protocol issued them.

## What's in this section

- [Issuer Integration Guide](openid4vci-issuer-integration.md) — credential offer creation, pre-authorized code flow, and the `tx_code` extension.

## What's not supported (yet)

- The authorization code flow (only pre-authorized code is in scope for the private beta).
- Issuing Idemix credentials over OpenID4VCI. OpenID4VCI carries SD-JWT VC only.
- Issuer trust list management via the Yivi portal — issuer onboarding is still a manual process during the private beta.
