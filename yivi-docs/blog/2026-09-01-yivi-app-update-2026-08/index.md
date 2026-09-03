---
slug: yivi-app-update-august-2026
title: "Face verification, screen readers and fewer surprises in Yivi app 8.2.0"
authors: [wouterensink]
tags: [yivi, update, ux, security, openid4vp, openid4vci, sdjwtvc]
---

*August brought one Yivi app release and one release of the Go library underneath it. App version 8.2.0 was published on 14 August and reached the App Store, Google Play and F-Droid. Version 1.3.0 of `irmago`, the Go implementation doing the wallet's actual work, was published on 12 August, and app 8.2.0 pins that version.*

<!-- truncate -->

## Adding a document can now include a face check

The largest new thing in 8.2.0 is face verification during document issuance. When you add data from the chip in your passport, ID card or driving licence, the app reads the chip over NFC as before, then runs a short liveness session with the camera and hands the resulting liveness transaction id to the passport issuer, which compares the live face against the portrait stored on the chip.

The point is narrow and worth stating plainly. Reading a chip proves the document is genuine, not that it belongs to the person holding the phone. The face check closes that gap, so someone else's passport is no longer enough to obtain their attributes.

The wallet does not decide whether this happens. The passport issuer announces its face verification policy at the start of each session, and that announcement also names the face API the liveness session must target, so the step can be switched off remotely and no environment is compiled into the app. In the production Yivi scheme today, the passport and ID-card credentials are the ones whose issue URL points at the live passport issuer.

The two builds reach that check differently. The App Store and Google Play builds use Regula's native Face SDK; the F-Droid build runs Regula's web Face SDK in a WebView loading a capture page served by the passport issuer itself, so no proprietary native code ships in that APK.

Two smaller pieces moved with it. Reading a driving licence now performs Active Authentication, which checks that the chip is the original rather than a copy, when the licence keeps its authentication key in data group 13; that check previously only ran for documents keeping it in data group 15. And the app now refuses to post the signed issuance request carrying the chip data to any host outside an explicit HTTPS allowlist.

## A wallet a screen reader can follow

A blind tester went through the app in early August and filed what they found. The fixes are in 8.2.0.

The checkbox that accepts the terms and conditions had no accessible name, so a screen reader announced only that there was a checkbox and whether it was ticked. It now reads out what it is for, and the link to the terms stays separately reachable beside it. The optional error-reporting checkbox got the same treatment.

On the PIN screen, the whole screen used to be a single item fusing the "Enter your PIN" heading with the digit count, offering a tap that did nothing; heading and progress are now separate. On iOS, the screen telling you to return to your browser is announced as soon as it appears rather than sitting there silently, and the decorative arrow is no longer read out as an unnamed image. Widget tests now pin all four screens' labels, roles and live regions.

## Your credential list keeps up, without nagging you

Yivi can now tell you that an SD-JWT credential issued over OpenID4VCI has been revoked. `irmago` 1.3.0 implements the IETF OAuth Token Status List (draft 15): the wallet fetches, verifies and caches status list tokens, and checks a credential's status at issuance, at disclosure, and on a background sweep.

Until this release that status never reached the app: the sweep wrote the new value to storage and stopped there, so a revoked credential went on looking valid until you happened to reopen the credential list. There is now one signal that fires when a credential's status actually moves, for both credential technologies Yivi supports. What that looks like in the app is a quiet refresh of the list, not a notification. Nothing pings your phone; what you see when you next open the Data tab is correct.

The same work removed an irritation in the opposite direction: the Data tab no longer reloads once an hour, nor every few tens of seconds while you hold a revoked credential.

Three session bugs went with it. Finishing a session while the app believed another was running underneath used to pop every screen off the navigation stack, leaving the app unusable until restarted. Dismissing an OpenID4VP session used to leave it running, so its permission screen came back after every later IRMA session. And with two such sessions in flight, dismissing one could cancel the other.

## Yivi in the language you set

Credential and issuer text is now resolved inside the Go client in the language the app is set to. The fallback chain is fixed: exact locale, base language, English, then any language the issuer did supply. Text an issuer never translated shows in a language you can read instead of `[translation missing]`, and the text of one credential never mixes languages. Logos fall back separately, since a logo has no language, and those missing for your language are fetched in the background. SVG credential logos now render instead of appearing blank, which took a fix on both sides: `irmago` had been discarding the content type it downloaded.

## Progress on open wallet standards

OpenID4VP is an open standard that lets a service ask a digital identity wallet for verified information. OpenID4VCI is its counterpart for issuing credentials into a wallet.

`irmago` 1.3.0 adds support for OpenID4VP over the W3C Digital Credentials API (OpenID4VP 1.0 Appendix A), the route where the operating system or browser presents its own credential chooser and hands the request to the wallet, instead of the wallet being reached through a custom URL scheme or universal link.

What is implemented, precisely: `openid4vp.Client.NewDcApiSession` accepts the `openid4vp-v1-unsigned` and `openid4vp-v1-signed` protocol identifiers and returns the authorization response to the caller under response modes `dc_api` and `dc_api.jwt`, instead of transmitting it to a `response_uri`. Signed requests are checked against their `expected_origins`, and presentations are bound to `origin:<origin>` rather than to the client identifier, so a response captured for one website cannot be replayed at another. Credentials are queried with DCQL and presented as SD-JWT VC; `openid4vp-v1-multisigned` is recognised only so it can be reported as unsupported. Integration tests run against version 0.11.0 of the EUDI reference verifier.

This is for integrators who pull `irmago` 1.3.0. It is not part of the released Yivi app: the app-side wiring that would receive a request from the platform credential chooser is not in 8.2.0, and there is nothing to switch on your phone.

On the OpenID4VCI side, 1.3.0 is mostly about handling credential offers correctly, and those fixes are in the app. An offer that omitted the optional `grants` member used to dereference a nil pointer on a goroutine `irmago` owned, which no recover covered, so it took the whole app down rather than failing the session. Such an offer is now accepted as the specification requires, with the grant type read from the authorization server's `grant_types_supported` metadata, and any panic on an OpenID4VCI session goroutine is reported as a session failure instead of terminating the process.

## Under the hood

Some of 8.2.0 is hardening you will not see. The passport-reading library `vcmrtd` was upgraded to 4.1.0, making the BAC, PACE and secure-messaging MAC comparisons constant-time and moving the challenge-response and APDU hex dumps behind the sensitive-data log gate. EUDI storage writes are now atomic, so an interrupted write can no longer leave a half-written file that reads back as corruption rather than absence. On iOS the app is no longer covered by a full-screen blur while the NFC reader sheet is up, so the scanning animation and its progress text stay readable for the whole read. One consequence is worth knowing: while that sheet or the biometric prompt is up, the app switcher shows the screen underneath unblurred, which can be your unlocked wallet. Backgrounding the app still blurs it.

## What developers and organisations should know

| Capability | Version | Platform | Status |
|---|---|---|---|
| Face verification during document issuance | Yivi app 8.2.0 | Android and iOS | Live, applied per session by the passport issuer |
| Token Status List revocation for SD-JWT VC | Yivi app 8.2.0, `irmago` 1.3.0 | Android and iOS | Stable, surfaces as a silent list refresh |
| Screen-reader labels on enrollment, PIN and iOS return screens | Yivi app 8.2.0 | Android and iOS | Stable |
| App-language text resolved in the Go client | Yivi app 8.2.0, `irmago` 1.3.0 | Android and iOS | Stable |
| OpenID4VP over the W3C Digital Credentials API | `irmago` 1.3.0 | Library only, not wired into app 8.2.0 | SD-JWT VC with DCQL, for interoperability testing |

`irmago` 1.3.0 carries breaking changes for anyone embedding the client. `client.New` now takes a `client.ClientHandler` instead of an `irmaclient.ClientHandler`: replace `UpdateAttributes` with `CredentialsChanged`, and drop `UpdateConfiguration` and `Revoked(cred)`. The `clientmodels` DTOs ship resolved strings instead of translation maps across 17 fields, so pass the locale to `client.New`, call `SetLocale` on language changes, and remove client-side language picking.

One fix matters to anyone who turns on developer mode, which testers reach by tapping the version number in the More tab seven times. Each relaxation developer mode makes — plain-HTTP OpenID4VCI issuers, insecure `did:web` verifiers, staging trust anchors and lenient certificate-chain validation — now follows the preference in both directions and is applied at startup. Before this release, switching developer mode off left all four in place until the app was restarted, and a wallet that started with the preference already on loaded only the staging anchors.

Issuers who put a credential logo on the OpenID4VCI `credential_metadata` side while their VCT type metadata omits it will find that the logo now survives, because displays are merged per field rather than per locale entry. Operators running the Yivi server get three fixes: Redis Sentinel deployments no longer wait for a replica, Redis writes are no longer discarded on an optimistic-locking conflict, and a non-200 response that is not an `irma.RemoteError` is reported by status code rather than as a decoding failure.

No new issuers or verifiers were added to the production Yivi schemes in August; the one change to `pbdf-requestors`, deployed on 25 August, was a capitalisation fix in an existing entry. And a note on dates: both store builds of 8.2.0 went live slightly before the GitHub tag existed, on 13 August on Google Play and 14 August on the App Store. A store publication is not an installation, though. When 8.2.0 reaches a given phone depends on when that phone updates. It has since been succeeded: as of 2 September the App Store and Google Play serve 8.2.1, which carries everything described here; F-Droid is still on 8.2.0.

### Sources

- [Yivi app v8.2.0](https://github.com/privacybydesign/irmamobile/releases/tag/v8.2.0), published 14 August 2026, and [`irmago` v1.3.0](https://github.com/privacybydesign/irmago/releases/tag/v1.3.0), published 12 August 2026
- [Face verification for document issuance](https://github.com/privacybydesign/irmamobile/pull/646) and [the FOSS liveness route for F-Droid](https://github.com/privacybydesign/irmamobile/pull/666)
- [Screen-reader fixes for the enrollment checkboxes, PIN screen and iOS return screen](https://github.com/privacybydesign/irmamobile/pull/682)
- [Credential status refresh in the app](https://github.com/privacybydesign/irmamobile/pull/692), [Token Status List support in `irmago`](https://github.com/privacybydesign/irmago/pull/561), and [the single change signal](https://github.com/privacybydesign/irmago/pull/653)
- [Developer mode applied in both directions and at startup](https://github.com/privacybydesign/irmago/pull/699)
- [Locale-aware client](https://github.com/privacybydesign/irmago/pull/633) and [the app side of it](https://github.com/privacybydesign/irmamobile/pull/678)
- [OpenID4VP over the W3C Digital Credentials API](https://github.com/privacybydesign/irmago/pull/648), [the OpenID4VCI credential-offer panic](https://github.com/privacybydesign/irmago/pull/644), and [the per-session dismisser fix](https://github.com/privacybydesign/irmago/pull/651)
- [OpenID4VP 1.0](https://openid.net/specs/openid-4-verifiable-presentations-1_0.html), [OpenID4VCI 1.0](https://openid.net/specs/openid-4-verifiable-credential-issuance-1_0.html), and [IETF OAuth Token Status List draft 15](https://datatracker.ietf.org/doc/draft-ietf-oauth-status-list/15/)
