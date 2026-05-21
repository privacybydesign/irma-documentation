---
slug: 2026-yivi-7-14-crypto-agility
title: "Yivi 7.14: a foundation built for crypto agility"
authors: [wouterensink]
tags: [yivi, openid4vci, openid4vp, sdjwtvc, eudi]
---

Last month we [announced end-to-end OpenID4VC support in private beta](/blog/2026-openid-full-support). With **Yivi 7.14.0** and **irmago 0.20.0** shipping at the end of May, those protocols reach production — and the foundation underneath them has finally caught up.

This release is the structural moment Yivi stops being an IRMA wallet that speaks OpenID and becomes a credential-format-agnostic wallet that happens to also speak IRMA. It is the single biggest milestone in our transition toward a crypto-agile EUDI wallet.

<!-- truncate -->

## The IRMA-shaped wallet we were

Yivi started life as the IRMA app. That heritage was in the bones of the codebase: attribute identifiers were IRMA paths, credential storage assumed the IRMA scheme, the session state machine assumed a single protocol, and even the command-line tool was called `irma`. The data model did not have a place for a credential payload with a nested object or an array, because IRMA credentials do not have those.

When we shipped [OpenID4VP](https://openid.net/specs/openid-4-verifiable-presentations-1_0.html) support in **irmago 0.19.0** (September 2025), we introduced the first wedge: a wrapping `Client` struct that placed `IrmaClient` and a new `OpenID4VPClient` side by side. That worked for disclosure. For full schema independence — [OpenID4VCI](https://openid.net/specs/openid-4-verifiable-credential-issuance-1_0.html) issuance, rendering of nested [SD-JWT VC](https://datatracker.ietf.org/doc/draft-ietf-oauth-sd-jwt-vc/) credentials in the app, end-to-end on open standards — the rest of the wallet had to follow.

## What schema independence actually means

The simplest way to put it: the frontend no longer needs to know which protocol a session is using. A QR scan or deep link starts a session, and irmago figures out whether it is IRMA, OpenID4VP, or OpenID4VCI and hands it off to the matching protocol client. The app gets a uniform snapshot back and renders it. From the Flutter side, every session looks the same shape.

Two pieces make this work:

**Each session snapshot carries a protocol tag.** It is there for irmago's own routing, not something the app branches on. The frontend reads the snapshot and shows it; everything protocol-specific stays inside irmago.

**Attributes are addressed by their location inside the credential, not by an IRMA-scheme identifier.** That location is just a path: `["email"]` for a flat field, `["address", "street"]` for a nested one, `["departments", 0, "name"]` for something inside an array. The same notation works for a flat IRMA attribute and a deeply nested SD-JWT claim, so the rest of the app — credential cards, disclosure prompts, the activity log — handles them all the same way.

### Session logic moved across the repo boundary

The half of the refactor that reaches into irmamobile is the half that took the longest. The complex parts of the disclosure flow — disclosure-plan computation, candidate-credential matching, selective-disclosure choice resolution, the session state machine itself — all moved out of Dart and into Go.

The app no longer computes the disclosure plan; irmago does, then emits a snapshot. The app renders it and forwards user choices back as claim-path selections.

This buys two properties we explicitly designed for:

1. **The frontend is now protocol- and format-independent.** Adding mdoc, a new OpenID flavor, or any future credential format is now a Go change. The Flutter UI stays the same — it consumes session snapshots, not a credential type.
2. **End-to-end testing runs in Go.** Disclosure flow tests exercise the real session machinery as integration tests in irmago, without spinning up a Flutter test harness. Feedback that used to take minutes takes seconds.

IRMA did not go away in this refactor — it became one protocol among several. Idemix-based credentials flow through the same schemaless session layer as SD-JWT credentials, just with a different `Protocol` tag and a different signing path. Existing IRMA integrations keep working unchanged.

EUDI credentials are stored encrypted at rest in a SQLCipher-backed database alongside the existing IRMA storage, and the rest of the app — credential cards, activity logs, disclosure prompts — was reshaped to work without an IRMA scheme so it can render any of them.

## End-to-end on open standards

With this release, Yivi supports the **[DIIP v5](https://fidescommunity.github.io/DIIP/) profile** of the OpenID4VC stack end to end. DIIP — the Decentralized Identity Interop Profile, version 5 — pins down a concrete subset of the OpenID4VCI, OpenID4VP, and SD-JWT VC specifications so that issuers, wallets, and verifiers built against it interoperate out of the box. This is the profile Yivi targets today; broader OpenID4VC support beyond DIIP v5 (additional flows, response modes, credential formats) remains future work.

Within that profile:

**OpenID4VCI for issuance.** New in 0.20.0. The `eudi/openid4vci` package implements both the **pre-authorized code flow** (with `tx_code` for out-of-band user verification) and the **authorization code flow** (with [PKCE](https://datatracker.ietf.org/doc/html/rfc7636) and an in-app browser), as required by DIIP v5. Any DIIP v5-compliant issuer can drop credentials into Yivi.

**OpenID4VP for disclosure.** Originally shipped in 0.19.0; now part of a complete picture. DCQL queries select credentials by their VCT and disclose individual claims by claim path. Both `direct_post` and `direct_post.jwt` response modes are supported, matching the DIIP v5 requirements.

**SD-JWT VC as the credential format.** All credentials exchanged over the OpenID stack use SD-JWT Verifiable Credentials — the credential format DIIP v5 mandates. The implementation lives in `eudi/credentials/sdjwtvc`, including holder key binding, type metadata fetching, and selective disclosure with claim-path-based selection.

## Nested claims, arrays, and selective disclosure

Schema independence and the OpenID stack together open a capability the IRMA-shaped data model literally could not express: credentials with nested objects and arrays, and selective disclosure that reaches into them.

A credential payload now looks like this:

```json
{
  "vct": "https://example.org/EduCredential",
  "given_name": "Anna",
  "address": {
    "country": "NL",
    "city": "Utrecht",
    "street": "Vredenburg 19"
  },
  "qualifications": [
    { "name": "BSc Computer Science", "year": 2024 },
    { "name": "MSc Cybersecurity",   "year": 2026 }
  ]
}
```

A verifier can request only `address.city` and the year of the second qualification — no other claim is revealed:

```json
{
  "credentials": [{
    "id": "edu",
    "format": "dc+sd-jwt",
    "meta": { "vct_values": ["https://example.org/EduCredential"] },
    "claims": [
      { "path": ["address", "city"] },
      { "path": ["qualifications", 1, "year"] }
    ]
  }]
}
```

The wallet sends back exactly those two claims, plus the issuer's signature over the whole credential — selective disclosure preserved at every level of nesting.

## `irmago` is now `yivi`

The repository keeps its name, but the command-line tool does not. In 0.20.0 the CLI's entry point moves from `irma/cmd/` to `yivi/cli/`, and the binary is built and shipped as `yivi`:

```diff
- irma server
- irma session
+ yivi irma server
+ yivi irma session
```

The Go module path stays `github.com/privacybydesign/irmago` — only the binary is renamed. All subcommands and flags carry over. The rename reflects what the tool actually is now: a toolkit for a wallet that is no longer just an IRMA wallet.

## First ecosystem: SURF Edubadges

The first ecosystem this release plugs into is **[SURF Edubadges](https://edubadges.nl/login)**. Through this integration, a student can issue their **eduID** credential into Yivi over OpenID4VCI and present it to any service that accepts eduID over OpenID4VP. The full loop runs on open standards on both ends, with no Yivi-specific adapter on the issuer or verifier side.

For now, this is where we are concentrating production attention. The infrastructure built for SURF Edubadges.

## What's next

The schema-independent foundation is what unlocks the next set of work. Three things are on the near horizon:

- **[mdoc / ISO 18013-5](https://www.iso.org/standard/69084.html) support.** Alongside SD-JWT VC. mdoc is the dominant format for proximity-based presentation (mDL and the rest of the ISO 18013 family). The new claim-path data model already accommodates it; the remaining work is in the protocol and storage layers.
- **[W3C VCDM 2.0](https://www.w3.org/TR/vc-data-model-2.0/) support.** Adding the W3C Verifiable Credentials Data Model 2.0 alongside SD-JWT VC and mdoc rounds out the third major credential format in the EUDI landscape. The claim-path model carries over directly; the work is in the proof formats and the issuance/verification paths.
- **Broader EUDI standards alignment.** Continued tracking of the EUDI ARF — trust frameworks, PID credentials, and certified-wallet ecosystem participation as those specifications stabilize.
- **A wallet provider backend.** In the [EUDI Architecture Reference Framework](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework) sense: a backend that issues wallet attestations, anchors trust on individual wallet instances, and manages per-instance keys. This is the next architectural layer Yivi needs to be a fully-featured EUDI wallet.

Each of these would have been a substantially harder change against the old IRMA-shaped foundation. That is the milestone this release marks: not a list of new features, but the foundation that lets the next list happen at all.

---

Yivi 7.14.0 and irmago 0.20.0 ship at the end of May. Source on GitHub: [privacybydesign/irmamobile](https://github.com/privacybydesign/irmamobile) and [privacybydesign/irmago](https://github.com/privacybydesign/irmago). Full release notes in the [irmago changelog](https://github.com/privacybydesign/irmago/blob/master/CHANGELOG.md).

If you are integrating OpenID4VC issuance or disclosure with Yivi, [support@yivi.app](mailto:support@yivi.app) is the place to start.
