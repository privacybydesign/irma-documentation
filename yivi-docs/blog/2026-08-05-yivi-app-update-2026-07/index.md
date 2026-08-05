---
slug: 2026-07-yivi-app-update
title: "Yivi app update, July 2026: a locked app stays locked"
authors: [martijnkamphuis]
tags: [yivi, yivi-app, release, security, openid4vp, openid4vci]
---

July brought two Yivi app releases, **8.1.1** and **8.1.2**, and two releases of `irmago`, the Go library that does the wallet's protocol and storage work. Most of the month's effort went into the parts of the app that decide *when* you are asked for your PIN and *where* a session is allowed to send you afterwards. Alongside that, an encryption-at-rest problem in the newer credential store was found and fixed.

<!-- truncate -->

## A locked app stays locked

If the Yivi app is locked and something opens it with a link that carries a session — a "Log in with Yivi" button on the same phone, for example — you should be asked for your PIN before anything is shared. Two fixes in July closed the gaps in that rule.

The first, in **8.1.1**, deals with a cold start. Biometric unlock (Face ID, fingerprint) is now held back until the app knows *which* link opened it. Before, biometrics could win the race and unlock the app, after which the pending session forced a relock — a visible flash, and not the deterministic behaviour intended.

The second, in **8.1.2**, deals with a warm resume: the app has been open, auto-locked while idle, and is then brought forward by a session link. That path was not covered by the first fix. Biometrics are now withheld there too while a session is pending or in flight.

Both fixes touch the Android and the iOS side of the bridge between the app and `irmago`, so both platforms are covered. Biometric unlock is convenient for opening your wallet, but it is deliberately *not* the authentication used to approve sharing your data. These fixes keep that distinction intact even when a session arrives at an awkward moment.

## Cross-device sessions behave like cross-device sessions

In a **same-device** session the browser asking for your data is on the phone itself, and the app hands you back to it when you are done. In a **second-device** session the browser is on a laptop, the phone only scans a QR code, and the laptop is where the flow continues. Two fixes in **8.1.2** restore the boundary between the two.

Scanning a desktop QR code with the phone's own camera app is again recognised as a second-device session; it had begun running the same-device return flow, which tries to send you onward on the phone while the real session waits on the laptop.

More importantly, on a second-device session the app no longer opens the relying party's return URL in a browser on the phone. That URL belongs to the browser session on the other device, which honours it there. Opening it on the phone started a second, unrelated browser session with the relying party — an interaction the person never asked for, and a request carrying the phone's address and browser to a party with no reason to receive one. The app now confirms success locally instead. A `tel:` return URL is the deliberate exception and still opens the dialer.

## Encryption at rest, put right

Yivi 8.0 introduced a second credential store next to the classic IRMA one: the EUDI database, holding SD-JWT VC credentials received over OpenID4VCI along with holder binding keys, private keys and logs. It is meant to be encrypted at rest with SQLCipher.

From `irmago` 1.0.0 onward it was being opened without its AES key, so it was written in plaintext despite the documented encryption. This was fixed in `irmago` **1.1.1**, which ships in Yivi app **8.1.1**. On the first launch after updating, an existing plaintext database is re-encrypted in place, atomically and without data loss; already-encrypted databases are left alone. Storage regression tests now cover both cases.

The scope, stated plainly: the affected file is the EUDI database as written by app versions 8.0.0 and 8.1.0. The classic IRMA credential store is a different database and was not affected. If you are still on 8.0.0 or 8.1.0, updating performs the migration for you.

## Fewer sessions that stall, and harder-to-abuse SMS verification

A cause of failed sessions on slow connections was traced to the HTTP client inside `irmago`: a five-second timeout covering the *whole* request, response body included, silently overrode the intended twenty-second per-request deadline. That produced `context deadline exceeded` errors on slow networks or large responses. The twenty-second deadline is now the only one, from Yivi app **8.1.1**.

Yivi's embedded issuance flow can verify a phone number by SMS, and sending SMS costs money — which makes it a target for SMS pumping fraud, where an attacker triggers bulk messages to premium-rate ranges. Two changes in **8.1.2** raise the cost of that. The app now solves a proof-of-work challenge before asking for an SMS code: cheap once, expensive in bulk, and a no-op against issuers that hand out no challenge. And seven country codes were removed from the phone-number picker — Gambia, Montenegro and Mongolia because the SMS provider does not support them, and Bolivia, Cambodia, Ecuador and Mozambique because of elevated fraud risk. For anyone with a number in those countries that is a loss, not an improvement: embedded SMS verification is no longer available to them.

## Smaller changes you may notice

- **Disclosure requests that pin a specific value.** When a verifier asks for an attribute with a fixed value and you already hold a match, the app now also offers to obtain a fresh credential of that type, where the type allows more than one instance and publishes an issuance URL. The option used to disappear as soon as a match existed. In app **8.1.2**.
- **More passports readable.** The passport-reading library now skips Active Authentication when the chip does not carry the key for it (no DG15) instead of failing the whole read, so documents relying on Chip Authentication — a UK passport was the reported case — can be read. Passive authentication of the document signature stays mandatory. In app **8.1.2**.
- **An occasional request for feedback.** After five successful sessions the app may ask whether you like it. "Yes" shows the platform's own review card; "not really" opens a private feedback box and never sends you to a store. At most two asks, ever. This is in the store builds only; the F-Droid build leaves the proprietary review package out entirely.

## Progress on open wallet standards

**OpenID4VP** is an open standard that lets a service request verified information from a digital wallet. Yivi's support for it reached production in 8.0.

July added a way for the app to recognise more kinds of verifier. Alongside the existing `x509_san_dns` client identifier prefix, `irmago` 1.1.0 added `x509_hash` (the verifier identified by the hash of its certificate) and `decentralized_identifier` for `did:jwk` and `did:web`. The same work taught the app to read **verifier metadata** from the request — the verifier's name, logo and information page — falling back to the certificate's common name. In practice, the permission screen can name and show who is asking even when that verifier is not listed in a Yivi scheme. In Yivi app **8.1.0** and later.

**OpenID4VCI** is the matching standard for issuing credentials to a wallet. July's work here was groundwork rather than new user-visible flows. `irmago` 1.2.0, in app **8.1.2**, made the holder-key seams pluggable: the key that binds a credential to its holder can live in an external secure device — a Wallet Secure Cryptographic Application or an HSM — rather than only in the app's own storage, and the EUDI holder database can be opened on any GORM dialector, such as PostgreSQL, for server-side deployments. Both are interfaces for other software to implement; the app passes the existing software, storage-backed implementation, so nothing about it behaves differently today. They are a prerequisite for the assurance level the EUDI framework expects, not a claim to have reached it.

Two further items were merged but are **not in a released app**: a credential offer that omits the `grants` member, or sends it empty, no longer aborts the flow (the grant type is derived from the authorization server's metadata, and only `authorization_code` can be derived that way); and Token Status List revocation for SD-JWT credentials issued over OpenID4VCI, with integration tests in the app.

None of this makes Yivi a wallet that "supports OpenID4VCI" without qualification. What is in production is SD-JWT VC issuance over the pre-authorized code and authorization code flows, as shipped in 8.0.

## What developers and organisations should know

| Capability | Yivi app | Platform | Status |
|---|---:|---|---|
| PIN gating of session links on cold start | 8.1.1 | Android and iOS | Stable |
| PIN gating on warm resume | 8.1.2 | Android and iOS | Stable |
| EUDI database encrypted at rest (+ migration) | 8.1.1 | Android and iOS | Stable |
| Second-device return URL disregarded | 8.1.2 | Android and iOS | Stable |
| Proof-of-work before embedded SMS send | 8.1.2 | Android and iOS | Stable |
| Passport read without DG15 | 8.1.2 | Android and iOS | Stable |
| `x509_hash` and verifier metadata (OpenID4VP) | 8.1.0 | Android and iOS | Stable |
| External holder-key binding (WSCA/HSM) | 8.1.2 | Android and iOS | Library interface, app uses software keys |
| Token Status List revocation for SD-JWT | Not released | — | Merged, unreleased |
| Credential offer without a `grants` member | Not released | — | Merged, unreleased |

If you integrate against `irmago`, **1.2.0 carries a breaking change**: `storage.NewStorage(...)` moved to `sqlcipherstorage.New(...)` with an identical signature, so that a pure-Go consumer can import `eudi/storage` without compiling the cgo `sqlcipher` package. `openid4vci.NewClient` and `eudi_sdjwt_dcql.NewSdJwtVcDcqlHandler` now take a required holder-key binder; pass the software, storage-backed implementation to keep existing behaviour.

If you run a Yivi issuer with embedded SMS verification, the proof-of-work check is opt-in from your side: the app solves a challenge only if you hand one out. Nothing here requires action from people using the app beyond updating it, and app-store rollout follows each release rather than coinciding with it.

## Looking ahead

Several changes were merged in July but are not in a released app, and we are putting no date on them: SVG credential logos rendering correctly, credential and issuer text resolved in your app language by `irmago` — falling back to English or another language the issuer did supply, instead of "[translation missing]" — a confirmation when you log out from the More tab, and the Token Status List revocation support above.

---

### Sources

**Releases**

- [Yivi app 8.1.1](https://github.com/privacybydesign/irmamobile/releases/tag/v8.1.1) and [8.1.2](https://github.com/privacybydesign/irmamobile/releases/tag/v8.1.2)
- [irmago 1.1.0](https://github.com/privacybydesign/irmago/releases/tag/v1.1.0), [1.1.1](https://github.com/privacybydesign/irmago/releases/tag/v1.1.1) and [1.2.0](https://github.com/privacybydesign/irmago/releases/tag/v1.2.0)

**Yivi app**

- [Gate universal-link sessions behind the PIN after biometric unlock](https://github.com/privacybydesign/irmamobile/pull/645)
- [PIN-gate universal-link sessions on resume-lock](https://github.com/privacybydesign/irmamobile/pull/655)
- [Restore the QR-versus-button second-device distinction](https://github.com/privacybydesign/irmamobile/pull/652)
- [Disregard the client return URL on second-device sessions](https://github.com/privacybydesign/irmamobile/pull/663)
- [Proof-of-work challenge before an embedded SMS send](https://github.com/privacybydesign/irmamobile/pull/662) and [the ALTCHA gate on the Send button](https://github.com/privacybydesign/irmamobile/pull/670)
- [Remove high-risk countries from the SMS country picker](https://github.com/privacybydesign/irmamobile/pull/661)
- [Skip Active Authentication when the chip has no DG15](https://github.com/privacybydesign/irmamobile/pull/672)
- [Ask engaged users for feedback after five sessions](https://github.com/privacybydesign/irmamobile/pull/650)
- [Render SVG credential logos](https://github.com/privacybydesign/irmamobile/pull/676) and [confirm logout with a notification](https://github.com/privacybydesign/irmamobile/pull/562) (both unreleased)

**irmago**

- [Encrypt the EUDI database at rest and migrate legacy plaintext databases](https://github.com/privacybydesign/irmago/pull/615)
- [Drop the 5s HTTP client timeout so body reads honour the 20s deadline](https://github.com/privacybydesign/irmago/pull/607)
- [Add the `x509_hash` client identifier prefix and verifier metadata support](https://github.com/privacybydesign/irmago/pull/602)
- [Offer an issuance option for fixed-value disclosure requests](https://github.com/privacybydesign/irmago/pull/630)
- [WSCA-ready holder-key binding seams](https://github.com/privacybydesign/irmago/pull/624) and [`NewStorageWithDialector`](https://github.com/privacybydesign/irmago/pull/620)
- [Status list support for SD-JWT](https://github.com/privacybydesign/irmago/pull/561) and [credential offers without a `grants` member](https://github.com/privacybydesign/irmago/pull/644) (both unreleased)
- [Locale-aware client](https://github.com/privacybydesign/irmago/pull/633) (unreleased)

**Standards**

- [OpenID for Verifiable Presentations](https://openid.net/specs/openid-4-verifiable-presentations-1_0.html)
- [OpenID for Verifiable Credential Issuance](https://openid.net/specs/openid-4-verifiable-credential-issuance-1_0.html)
