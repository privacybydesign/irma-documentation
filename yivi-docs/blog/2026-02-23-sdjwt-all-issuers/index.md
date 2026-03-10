---
slug: 2026-sdjwt-all-issuers
title: All Privacy by Design issuers now support SD-JWT VCs
authors: [dibranmulder]
tags: [yivi, sd-jwt, eudi, openid4vp, credentials]
---

We're pleased to announce that all Privacy by Design Foundation issuers now issue **SD-JWT Verifiable Credentials** alongside traditional Idemix credentials. This marks a significant milestone in Yivi's transition to becoming a fully EUDI-compliant wallet.

<!-- truncate -->

## What this means for users and verifiers

Starting today, when you obtain credentials from any of the Privacy by Design Foundation's issuers, you automatically receive both credential formats:

- **Idemix credentials** - Our privacy-preserving credential format with multi-show unlinkability
- **SD-JWT VCs** - The emerging standard for the European Digital Identity (EUDI) ecosystem

This dual issuance happens seamlessly in the background. Users don't need to take any additional action - your Yivi wallet now holds both formats for maximum compatibility.

## Supported issuers

The following Privacy by Design issuers now support SD-JWT VCs:

| Issuer | Attributes | Issuance method |
|--------|-----------|-----------------|
| **Email** | Email address, domain | In-app verification |
| **Phone** | Mobile number | In-app SMS verification |
| **IBAN** | Full name, IBAN, BIC | iDEAL verification |
| **Passport** | Full identity data, photo, age verification | NFC chip scan |
| **ID-card** | Full identity data, photo, age verification | NFC chip scan |
| **Driver License** | Full identity data, photo, age verification | NFC chip scan |
| **SURF** | Educational institution, affiliation | SURFconext authentication |

## Why SD-JWT VCs matter

The European Union is standardizing on SD-JWT VCs for the upcoming European Digital Identity Wallet (EUDI). By supporting this format now, Yivi ensures forward compatibility with the broader European identity ecosystem.

SD-JWT VCs offer:

- **Selective disclosure** - Share only the attributes you need
- **OpenID4VP compatibility** - Interoperable with EUDI-compliant verifiers
- **Wide ecosystem support** - Growing adoption across European member states

## When to use which format

Both formats support selective disclosure, but they have different privacy characteristics:

**Use Idemix when:**
- Privacy is paramount (e.g., age verification without tracking)
- You're interacting with Yivi-native services
- Multi-show unlinkability is important

**Use SD-JWT VCs when:**
- Interacting with EUDI-compliant verifiers
- OpenID4VP is required
- Cross-border European services are involved

The Yivi app automatically selects the appropriate format based on the verifier's request protocol.

## For verifiers: Request SD-JWT VCs via OpenID4VP

If you're building a service that needs to verify credentials, you can now request SD-JWT VCs using the OpenID4VP protocol. This enables you to:

- Build EUDI-compliant verification flows
- Accept credentials from other EUDI wallets in the future
- Use standardized DCQL queries for attribute requests

For implementation details and code examples, see our documentation on [Disclosing SD-JWT VCs over OpenID4VP](https://docs.yivi.app/openid4vp-disclosure).

## Technical requirements

To use SD-JWT VCs, ensure you're running:
- **Yivi app** version 7.10.0 or later
- **irmago** version 0.19 or later (for server integrations)

## What's next

This release is part of our broader crypto-agility roadmap. We're continuing to enhance Yivi's EUDI compliance, including:

- Full OpenID4VCI support for issuance
- Extended trust framework integration
- Post-quantum cryptography preparation

## Get started

Update your Yivi app to the latest version and obtain fresh credentials from any of the supported issuers. Your existing Idemix credentials remain valid - the new SD-JWT VCs are issued alongside them.

Have questions or feedback? Reach out to us:
- [Slack](https://irmacard.slack.com/)
- [GitHub](https://github.com/privacybydesign)
- [Email](mailto:support@yivi.app)
