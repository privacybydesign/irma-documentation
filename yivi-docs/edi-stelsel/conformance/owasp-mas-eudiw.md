---
title: "Yivi and the OWASP MAS EUDI Wallet profile"
sidebar_label: "OWASP MAS EUDIW profile"
description: "Where the Yivi app stands on each of the 78 requirements of the OWASP MAS EUDI Wallet profile, with a pointer to the source code, test or pull request behind every statement."
format: md
---

This page lists where the Yivi app stands on each of the 78 requirements of the [OWASP MAS EUDI Wallet profile](/edi-stelsel-certification/requirements/owasp-mas-eudiw) (v1.0). Every statement has a pointer to the code, test or pull request it is based on.

:::caution[Self-assessment]

This is a self-assessment by the Yivi team. It is not the result of an evaluation by a laboratory, and Yivi is not certified under the Dutch scheme. "Implemented" means that a measure is in the source code, not that an evaluator accepted it.

:::

## Basis {#basis}

- **App:** [privacybydesign/irmamobile](https://github.com/privacybydesign/irmamobile) at commit [`7c7af78`](https://github.com/privacybydesign/irmamobile/commit/7c7af783afcd97c75c2a22d3d1279dbcf4a14159), the merge of [PR #828](https://github.com/privacybydesign/irmamobile/pull/828) "Implement the OWASP MAS EUDI Wallet profile in the app" on 18 November 2026. The changes are unreleased: they are under "Unreleased" in the [`CHANGELOG.md:7–53`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/CHANGELOG.md#L7-L53).
- **Scope:** the Yivi app for the Play Store and the App Store (`yivi_app`, with the shared code in `yivi_core`). The F-Droid app (`yivi_fdroid`) is named where it differs.
- **Not in scope:** irmago, which the app uses at v1.5.0 ([`go.mod:8`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_core/go.mod#L8)), and the wallet provider backend. Requirements that depend on them are marked open.
- **Pointers:** links go to the files at that commit, so they keep showing the lines that were assessed. Statements marked [PR #828, "Left out"](https://github.com/privacybydesign/irmamobile/pull/828) come from the list of requirements that the pull request left out.

## Summary {#summary}

| Status | Requirements | Meaning |
|---|---|---|
| **Implemented** | 31 | A measure for this requirement is in the app. The evidence column points to it. |
| **Partly** | 5 | A measure is in the app, and a named part is still open. |
| **Open: wallet provider** | 12 | Needs the wallet provider backend. PR #828 leaves these for later. |
| **Open: irmago** | 11 | Needs a change in [irmago](https://github.com/privacybydesign/irmago), the library underneath the app. |
| **Open: decision** | 6 | Needs a product decision or is a feature of its own. |
| **Not assessed** | 12 | No evidence has been collected. This says nothing about whether the app meets the requirement. |
| **Out of scope** | 1 | The catalogue itself places the requirement outside the profile. |
| Total | 78 | |

Per category:

| Category | Implemented | Partly | Open: wallet provider | Open: irmago | Open: decision | Not assessed | Out of scope | Total |
|---|---|---|---|---|---|---|---|---|
| [MASVS-STORAGE](#masvs-storage) | 3 | 1 | 1 | – | – | 1 | – | 6 |
| [MASVS-CRYPTO](#masvs-crypto) | 2 | – | 2 | 5 | – | 2 | – | 11 |
| [MASVS-AUTH](#masvs-auth) | 1 | – | 3 | 1 | 2 | 1 | – | 8 |
| [MASVS-NETWORK](#masvs-network) | 2 | – | 1 | – | – | – | – | 3 |
| [MASVS-PLATFORM](#masvs-platform) | 8 | 2 | – | – | 1 | 1 | – | 12 |
| [MASVS-CODE](#masvs-code) | 2 | 1 | 2 | 1 | 1 | 3 | – | 10 |
| [MASVS-RESILIENCE](#masvs-resilience) | 8 | 1 | 3 | 1 | 1 | 1 | – | 15 |
| [MASVS-PRIVACY](#masvs-privacy) | 5 | – | – | 3 | 1 | 3 | 1 | 13 |
| **Total** | 31 | 5 | 12 | 11 | 6 | 12 | 1 | 78 |

## How it was verified {#verification}

According to [PR #828](https://github.com/privacybydesign/irmamobile/pull/828), these checks ran before the merge: Dart analysis, the unit tests of `yivi_core`, the `yivi_fdroid` test, the Android JVM unit tests, the Go test of the bridge and a Swift type-check of the iOS plugin sources. An obfuscated alpha build was run on a Galaxy S9 (Android 12) and an Android 16 emulator, for start-up and unlock, the secure window, the idle lock, the screen-lock screen and the "device unsafe" warning.

Still open according to the same pull request:

- everything on an iPhone: the capture cover, also with VoiceOver and over AirPlay, and the system keyboard;
- a debugger or Frida attached to a release build;
- a screen reader moving focus for five minutes;
- enrollment on a fresh install, the Sentry paths, and one full integration run.

The checks on the environment ([#51](#c51)–[#53](#c53), [#58](#c58), [#64](#c64), [#65](#c65)) run on the device and only react in release builds. Someone in control of the device can get around them. They are the app-side half; the other half is attestation by the wallet provider ([#54](#c54), [#56](#c56)).

The app also has an automated test bed that runs the OWASP MASTG tests of the profile. Its results are on the [test results page](/edi-stelsel-certification/conformance/owasp-mas-eudiw-tests), and every requirement below links to its tests there.

A regression guard, [`check_security_config.sh`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/ci_scripts/check_security_config.sh), runs in the status checks ([`status-checks.yml:69`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/.github/workflows/status-checks.yml#L69)) and fails when one of the settings for #2, #6, #26, #27, #49, #59 or #63 is undone.

## Requirements {#requirements}

Each requirement links to its text in the catalogue.

### MASVS-STORAGE {#masvs-storage}

#### \#1 — The app encrypts sensitive data stored in private storage. {#c1}

- **Status:** Partly
- **Finding:** The wallet storage is encrypted with a 32-byte key. On Android that key is stored encrypted under an AES-256-GCM key in the Android Keystore (StrongBox when the device has it); on iOS under a key in the Secure Enclave, with a keychain key as fallback. The key is handed to irmago at start-up. Open: storage hardening in irmago.
- **Evidence:** [`AESKey.java:10–26`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_core/android/src/main/java/foundation/privacybydesign/yivi_core/irma_mobile_bridge/AESKey.java#L10-L26), [`TEEEncryption.java:42–56`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_core/android/src/main/java/foundation/privacybydesign/yivi_core/irma_mobile_bridge/TEEEncryption.java#L42-L56), [`TEE.swift:128–152`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_core/ios/Classes/TEE.swift#L128-L152), [`bridge.go:72–78`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_core/irmagobridge/bridge.go#L72-L78), [PR #828, "Left out"](https://github.com/privacybydesign/irmamobile/pull/828)
- **Requirement:** [#1 in the catalogue](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r1)
- **Tests:** [test results for #1](/edi-stelsel-certification/conformance/owasp-mas-eudiw-tests#req-1)

#### \#2 — The app encrypts sensitive data stored outside of private storage. {#c2}

- **Status:** Implemented
- **Finding:** The app requests no storage permissions, and Dart code may not write to shared storage or share files: the CI guard fails when it does.
- **Evidence:** [`AndroidManifest.xml:94–98`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_app/android/app/src/main/AndroidManifest.xml#L94-L98), [`check_security_config.sh:43–46`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/ci_scripts/check_security_config.sh#L43-L46)
- **Requirement:** [#2 in the catalogue](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r2)
- **Tests:** [test results for #2](/edi-stelsel-certification/conformance/owasp-mas-eudiw-tests#req-2)

#### \#3 — The app stores cryptographic keys inside the platform-provided secure keystore. {#c3}

- **Status:** Open: wallet provider
- **Finding:** The key that protects the storage key and the device signing key are in the Android Keystore and the Secure Enclave. Open: hardware-backed, attested holder keys and the key hierarchy that goes with them.
- **Evidence:** [`TEEEncryption.java:42–56`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_core/android/src/main/java/foundation/privacybydesign/yivi_core/irma_mobile_bridge/TEEEncryption.java#L42-L56), [`ECDSA.java:84–99`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_core/android/src/main/java/foundation/privacybydesign/yivi_core/irma_mobile_bridge/ECDSA.java#L84-L99), [`TEE.swift:128–152`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_core/ios/Classes/TEE.swift#L128-L152), [PR #828, "Left out"](https://github.com/privacybydesign/irmamobile/pull/828)
- **Requirement:** [#3 in the catalogue](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r3)
- **Tests:** [test results for #3](/edi-stelsel-certification/conformance/owasp-mas-eudiw-tests#req-3)

#### \#4 — The app does not hardcode sensitive data in the application package. {#c4}

- **Status:** Not assessed
- **Finding:** No scan of the app package is recorded. The one build-time secret found in the source, the Sentry DSN, is empty in the repository and filled in by the delivery workflow.
- **Evidence:** [`sentry_dsn.dart:1–2`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_core/lib/sentry_dsn.dart#L1-L2), [`delivery.yml:107`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/.github/workflows/delivery.yml#L107)
- **Requirement:** [#4 in the catalogue](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r4)
- **Tests:** [test results for #4](/edi-stelsel-certification/conformance/owasp-mas-eudiw-tests#req-4)

#### \#5 — The app excludes sensitive data from application logs. {#c5}

- **Status:** Implemented
- **Finding:** The e-mail address and phone number are no longer logged when they are sent to the issuers. The MRZ scanner and the iOS bridge only log in debug builds.
- **Evidence:** [`mrz_scanner.dart:94`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_core/lib/src/screens/embedded_issuance_flows/documents/widgets/mrz_scanner.dart#L94), [`IrmaMobileBridgePlugin.swift:173–175`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_core/ios/Classes/IrmaMobileBridgePlugin.swift#L173-L175), [PR #828](https://github.com/privacybydesign/irmamobile/pull/828)
- **Requirement:** [#5 in the catalogue](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r5)
- **Tests:** [test results for #5](/edi-stelsel-certification/conformance/owasp-mas-eudiw-tests#req-5)

#### \#6 — The app excludes sensitive data from backups. {#c6}

- **Status:** Implemented
- **Finding:** Android: `allowBackup="false"` and data extraction rules that exclude every domain from cloud backup and device transfer. iOS: the data directory is marked as excluded from backup. The CI guard keeps the Android settings in place.
- **Evidence:** [`AndroidManifest.xml:10–11`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_app/android/app/src/main/AndroidManifest.xml#L10-L11), [`data_extraction_rules.xml:7–30`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_app/android/app/src/main/res/xml/data_extraction_rules.xml#L7-L30), [`IrmaMobileBridgePlugin.swift:32–37`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_core/ios/Classes/IrmaMobileBridgePlugin.swift#L32-L37), [`check_security_config.sh:48–56`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/ci_scripts/check_security_config.sh#L48-L56)
- **Requirement:** [#6 in the catalogue](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r6)
- **Tests:** [test results for #6](/edi-stelsel-certification/conformance/owasp-mas-eudiw-tests#req-6)

### MASVS-CRYPTO {#masvs-crypto}

#### \#7 — The app properly encrypts sensitive data. {#c7}

- **Status:** Open: irmago
- **Finding:** Open: an allow-list of JWE algorithms in irmago.
- **Evidence:** [PR #828, "Left out"](https://github.com/privacybydesign/irmamobile/pull/828)
- **Requirement:** [#7 in the catalogue](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r7)
- **Tests:** [test results for #7](/edi-stelsel-certification/conformance/owasp-mas-eudiw-tests#req-7)

#### \#8 — The app properly hashes sensitive data. {#c8}

- **Status:** Open: irmago
- **Finding:** Open: an allow-list of hash algorithms in irmago.
- **Evidence:** [PR #828, "Left out"](https://github.com/privacybydesign/irmamobile/pull/828)
- **Requirement:** [#8 in the catalogue](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r8)
- **Tests:** [test results for #8](/edi-stelsel-certification/conformance/owasp-mas-eudiw-tests#req-8)

#### \#9 — The app properly uses Message Authentication Codes (MACs). {#c9}

- **Status:** Not assessed
- **Finding:** No evidence collected yet. The cryptographic protocol code is in irmago, not in the app.
- **Requirement:** [#9 in the catalogue](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r9)
- **Tests:** [test results for #9](/edi-stelsel-certification/conformance/owasp-mas-eudiw-tests#req-9)

#### \#10 — The app properly generates cryptographic signatures. {#c10}

- **Status:** Not assessed
- **Finding:** No evidence collected yet. The cryptographic protocol code is in irmago, not in the app.
- **Requirement:** [#10 in the catalogue](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r10)
- **Tests:** [test results for #10](/edi-stelsel-certification/conformance/owasp-mas-eudiw-tests#req-10)

#### \#11 — The app properly verifies cryptographic signatures. {#c11}

- **Status:** Open: irmago
- **Finding:** Open: validation along the EUDI trust paths in irmago.
- **Evidence:** [PR #828, "Left out"](https://github.com/privacybydesign/irmamobile/pull/828)
- **Requirement:** [#11 in the catalogue](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r11)
- **Tests:** [test results for #11](/edi-stelsel-certification/conformance/owasp-mas-eudiw-tests#req-11)

#### \#12 — The app properly generates random numbers. {#c12}

- **Status:** Implemented
- **Finding:** The storage key on Android is generated with the default `SecureRandom`, the platform CSPRNG. This covers the app's own code; random numbers in irmago are not part of this assessment.
- **Evidence:** [`AESKey.java:28–36`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_core/android/src/main/java/foundation/privacybydesign/yivi_core/irma_mobile_bridge/AESKey.java#L28-L36)
- **Requirement:** [#12 in the catalogue](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r12)
- **Tests:** [test results for #12](/edi-stelsel-certification/conformance/owasp-mas-eudiw-tests#req-12)

#### \#13 — The app securely generates cryptographic keys. {#c13}

- **Status:** Open: wallet provider
- **Finding:** Open: hardware-backed, attested generation of holder keys.
- **Evidence:** [PR #828, "Left out"](https://github.com/privacybydesign/irmamobile/pull/828)
- **Requirement:** [#13 in the catalogue](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r13)
- **Tests:** [test results for #13](/edi-stelsel-certification/conformance/owasp-mas-eudiw-tests#req-13)

#### \#14 — The app derives cryptographic keys using approved key derivation functions. {#c14}

- **Status:** Open: irmago
- **Finding:** Open: the PIN key derivation in irmago.
- **Evidence:** [PR #828, "Left out"](https://github.com/privacybydesign/irmamobile/pull/828)
- **Requirement:** [#14 in the catalogue](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r14)
- **Tests:** [test results for #14](/edi-stelsel-certification/conformance/owasp-mas-eudiw-tests#req-14)

#### \#15 — The app rotates cryptographic keys regularly. {#c15}

- **Status:** Open: irmago
- **Finding:** Open: key rotation in irmago.
- **Evidence:** [PR #828, "Left out"](https://github.com/privacybydesign/irmamobile/pull/828)
- **Requirement:** [#15 in the catalogue](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r15)
- **Tests:** [test results for #15](/edi-stelsel-certification/conformance/owasp-mas-eudiw-tests#req-15)

#### \#16 — The app restricts access to cryptographic keys. {#c16}

- **Status:** Open: wallet provider
- **Finding:** The iOS key is only usable while the device is unlocked and never leaves the device (`kSecAttrAccessibleWhenUnlockedThisDeviceOnly`, `.privateKeyUsage`). The Android Keystore key sets no user authentication requirement. Open: access rules for attested holder keys.
- **Evidence:** [`TEE.swift:37–41`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_core/ios/Classes/TEE.swift#L37-L41), [`TEEEncryption.java:42–46`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_core/android/src/main/java/foundation/privacybydesign/yivi_core/irma_mobile_bridge/TEEEncryption.java#L42-L46), [PR #828, "Left out"](https://github.com/privacybydesign/irmamobile/pull/828)
- **Requirement:** [#16 in the catalogue](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r16)
- **Tests:** [test results for #16](/edi-stelsel-certification/conformance/owasp-mas-eudiw-tests#req-16)

#### \#17 — The app verifies that the device has a secure lock configured. {#c17}

- **Status:** Implemented
- **Finding:** Yivi only works on a device with a screen lock. Without one, a screen explains how to set it, before enrollment and for existing users. The check is repeated whenever the app is reopened.
- **Evidence:** [`DeviceSecurityPlugin.java:41–43`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_core/android/src/main/java/foundation/privacybydesign/yivi_core/plugins/device_security/DeviceSecurityPlugin.java#L41-L43), [`DeviceSecurityPlugin.swift:24–32`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_core/ios/Classes/DeviceSecurityPlugin.swift#L24-L32), [`device_lock_required_screen.dart`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_core/lib/src/screens/device_lock/device_lock_required_screen.dart), [`device_lock_requirement_test.dart`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_core/test/device_lock_requirement_test.dart)
- **Requirement:** [#17 in the catalogue](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r17)
- **Tests:** [test results for #17](/edi-stelsel-certification/conformance/owasp-mas-eudiw-tests#req-17)

### MASVS-AUTH {#masvs-auth}

#### \#18 — The app enforces authentication and authorization on its components. {#c18}

- **Status:** Not assessed
- **Finding:** No evidence collected yet. The Android app exports two activities: the main activity, for the launcher and deep links, and the callback activity of the in-app authentication flow.
- **Evidence:** [`AndroidManifest.xml:14–20`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_app/android/app/src/main/AndroidManifest.xml#L14-L20), [`AndroidManifest.xml:74–83`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_app/android/app/src/main/AndroidManifest.xml#L74-L83)
- **Requirement:** [#18 in the catalogue](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r18)
- **Tests:** [test results for #18](/edi-stelsel-certification/conformance/owasp-mas-eudiw-tests#req-18)

#### \#19 — The app enables auto-fill support for credential providers. {#c19}

- **Status:** Open: decision
- **Finding:** Open: support for credential provider APIs is a feature of its own.
- **Evidence:** [PR #828, "Left out"](https://github.com/privacybydesign/irmamobile/pull/828)
- **Requirement:** [#19 in the catalogue](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r19)
- **Tests:** [test results for #19](/edi-stelsel-certification/conformance/owasp-mas-eudiw-tests#req-19)

#### \#20 — The app implements local authentication securely. {#c20}

- **Status:** Open: wallet provider
- **Finding:** The app unlocks with a PIN or with biometrics through `local_auth`, set to biometrics only. Open: local authentication bound to hardware-backed keys.
- **Evidence:** [`biometric_provider.dart:90`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_core/lib/src/screens/pin/providers/biometric_provider.dart#L90), [PR #828, "Left out"](https://github.com/privacybydesign/irmamobile/pull/828)
- **Requirement:** [#20 in the catalogue](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r20)
- **Tests:** [test results for #20](/edi-stelsel-certification/conformance/owasp-mas-eudiw-tests#req-20)

#### \#21 — The app does not allow fallback to non-biometric credentials for sensitive transactions. {#c21}

- **Status:** Open: decision
- **Finding:** Open: accepting strong biometrics only needs a replacement of `local_auth` on Android.
- **Evidence:** [PR #828, "Left out"](https://github.com/privacybydesign/irmamobile/pull/828)
- **Requirement:** [#21 in the catalogue](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r21)
- **Tests:** [test results for #21](/edi-stelsel-certification/conformance/owasp-mas-eudiw-tests#req-21)

#### \#22 — The app invalidates keys after any enrollment of new biometric data. {#c22}

- **Status:** Open: wallet provider
- **Finding:** Open: needs hardware-backed keys that are bound to the enrolled biometrics.
- **Evidence:** [PR #828, "Left out"](https://github.com/privacybydesign/irmamobile/pull/828)
- **Requirement:** [#22 in the catalogue](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r22)
- **Tests:** [test results for #22](/edi-stelsel-certification/conformance/owasp-mas-eudiw-tests#req-22)

#### \#23 — The app enforces step-up authentication before granting access to sensitive functionality. {#c23}

- **Status:** Implemented
- **Finding:** The app locks after five minutes without use while it is open, next to the existing lock after five minutes in the background. A touch, a key press, typing, scrolling and an action of a screen reader count as use. The session continues after the PIN.
- **Evidence:** [`idle_lock_observer.dart:41–42`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_core/lib/src/util/idle_lock_observer.dart#L41-L42), [`foreground_idle_lock_test.dart`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_core/test/foreground_idle_lock_test.dart)
- **Requirement:** [#23 in the catalogue](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r23)
- **Tests:** [test results for #23](/edi-stelsel-certification/conformance/owasp-mas-eudiw-tests#req-23)

#### \#24 — The app makes sensitive data inaccessible after session termination. {#c24}

- **Status:** Open: irmago
- **Finding:** Open: clearing memory in irmago when the app locks.
- **Evidence:** [PR #828, "Left out"](https://github.com/privacybydesign/irmamobile/pull/828)
- **Requirement:** [#24 in the catalogue](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r24)
- **Tests:** [test results for #24](/edi-stelsel-certification/conformance/owasp-mas-eudiw-tests#req-24)

#### \#25 — The app ensures non-repudiation for critical actions. {#c25}

- **Status:** Open: wallet provider
- **Finding:** Open: non-repudiation with attested keys.
- **Evidence:** [PR #828, "Left out"](https://github.com/privacybydesign/irmamobile/pull/828)
- **Requirement:** [#25 in the catalogue](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r25)
- **Tests:** [test results for #25](/edi-stelsel-certification/conformance/owasp-mas-eudiw-tests#req-25)

### MASVS-NETWORK {#masvs-network}

#### \#26 — The app encrypts all network traffic. {#c26}

- **Status:** Implemented
- **Finding:** Android: no cleartext traffic. Dart refuses every connection that is not `https`. The Go bridge uses TLS 1.2 or higher with AEAD cipher suites only, also for OpenID4VCI, OpenID4VP, status list and did:web traffic. iOS: App Transport Security may not be switched off. One exception: fetching the public key of a scheme from the scheme management screen while developer mode is on.
- **Evidence:** [`network_security_config.xml:11–17`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_app/android/app/src/main/res/xml/network_security_config.xml#L11-L17), [`yivi_core.dart:56`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_core/lib/yivi_core.dart#L56), [`bridge.go:122–137`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_core/irmagobridge/bridge.go#L122-L137), [`bridge.go:191–198`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_core/irmagobridge/bridge.go#L191-L198), [`check_security_config.sh:49–71`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/ci_scripts/check_security_config.sh#L49-L71), [`dart_https_only_test.dart`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_core/test/dart_https_only_test.dart), [`tls_test.go`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_core/irmagobridge/tls_test.go)
- **Requirement:** [#26 in the catalogue](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r26)
- **Tests:** [test results for #26](/edi-stelsel-certification/conformance/owasp-mas-eudiw-tests#req-26)

#### \#27 — The app validates certificates for all network traffic. {#c27}

- **Status:** Implemented
- **Finding:** Android trusts only the certificate authorities that ship with the system, not ones a user installed. The Go bridge validates against its embedded root certificates. The CI guard fails on any code that weakens certificate validation in Go, Dart or Android.
- **Evidence:** [`network_security_config.xml:13–15`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_app/android/app/src/main/res/xml/network_security_config.xml#L13-L15), [`bridge.go:122–123`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_core/irmagobridge/bridge.go#L122-L123), [`check_security_config.sh:72–80`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/ci_scripts/check_security_config.sh#L72-L80)
- **Requirement:** [#27 in the catalogue](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r27)
- **Tests:** [test results for #27](/edi-stelsel-certification/conformance/owasp-mas-eudiw-tests#req-27)

#### \#28 — The app correctly implements identity pinning. {#c28}

- **Status:** Open: wallet provider
- **Finding:** Open: identity pinning with a channel to rotate the pins.
- **Evidence:** [PR #828, "Left out"](https://github.com/privacybydesign/irmamobile/pull/828)
- **Requirement:** [#28 in the catalogue](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r28)
- **Tests:** [test results for #28](/edi-stelsel-certification/conformance/owasp-mas-eudiw-tests#req-28)

### MASVS-PLATFORM {#masvs-platform}

#### \#29 — The app securely handles deep links. {#c29}

- **Status:** Implemented
- **Finding:** A deep link is passed on as encoded JSON instead of pasted into a JSON string. Return URLs with a `javascript`, `data`, `file`, `content`, `intent` or similar scheme are not opened. On Android, a deep link from a launch out of the recents list is dropped.
- **Evidence:** [`IrmaMobileBridgePlugin.swift:89–97`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_core/ios/Classes/IrmaMobileBridgePlugin.swift#L89-L97), [`return_url.dart:11–30`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_core/lib/src/models/return_url.dart#L11-L30), [`YiviCorePlugin.java:149–151`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_core/android/src/main/java/foundation/privacybydesign/yivi_core/YiviCorePlugin.java#L149-L151), [`return_url_test.dart`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_core/test/return_url_test.dart)
- **Requirement:** [#29 in the catalogue](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r29)
- **Tests:** [test results for #29](/edi-stelsel-certification/conformance/owasp-mas-eudiw-tests#req-29)

#### \#30 — The app uses the clipboard securely and only with user consent. {#c30}

- **Status:** Implemented
- **Finding:** The only place that writes to the clipboard is the copy button of the NFC error details. It copies the logs without personal data; with "show sensitive data" ticked, the button is off.
- **Evidence:** [`nfc_error_dialog.dart:71`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_core/lib/src/screens/embedded_issuance_flows/documents/widgets/nfc_error_dialog.dart#L71), [`nfc_error_dialog_clipboard_test.dart`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_core/test/nfc_error_dialog_clipboard_test.dart)
- **Requirement:** [#30 in the catalogue](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r30)
- **Tests:** [test results for #30](/edi-stelsel-certification/conformance/owasp-mas-eudiw-tests#req-30)

#### \#31 — The app only permits trusted app extensions to interact with it. {#c31}

- **Status:** Implemented
- **Finding:** iOS refuses third-party keyboard extensions, so the system keyboard is used. The fields for document numbers and dates turn off suggestions, autocorrect and keyboard learning.
- **Evidence:** [`AppDelegate.swift:19–27`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_app/ios/Runner/AppDelegate.swift#L19-L27), [`document_nr_input_field.dart:43–46`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_core/lib/src/screens/embedded_issuance_flows/documents/widgets/document_nr_input_field.dart#L43-L46)
- **Requirement:** [#31 in the catalogue](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r31)
- **Tests:** [test results for #31](/edi-stelsel-certification/conformance/owasp-mas-eudiw-tests#req-31)

#### \#32 — The app securely handles intents. {#c32}

- **Status:** Implemented
- **Finding:** Return URLs that could start an arbitrary Android component (`intent`, `android-app`, `content`) are refused. The in-app browser opens `https` only, enforced in the native Android code too.
- **Evidence:** [`return_url.dart:11–30`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_core/lib/src/models/return_url.dart#L11-L30), [`IIABPlugin.java:59–60`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_core/android/src/main/java/foundation/privacybydesign/yivi_core/plugins/iiab/IIABPlugin.java#L59-L60)
- **Requirement:** [#32 in the catalogue](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r32)
- **Tests:** [test results for #32](/edi-stelsel-certification/conformance/owasp-mas-eudiw-tests#req-32)

#### \#33 — The app does not expose sensitive native functionality to WebView content. {#c33}

- **Status:** Partly
- **Finding:** The F-Droid app has a WebView for face capture. It navigates only within the host of the capture page over `https`, and exposes one JavaScript channel to that page. If the hosted capture page redirects to another host, that host has to be added. Open: the Play Store APK also contains the WebView activity of the `url_launcher` plugin, which the test bed found ([MASTG-TEST-0250](/edi-stelsel-certification/conformance/owasp-mas-eudiw-tests#mastg-test-0250)); whether the app ever opens it has not been assessed.
- **Evidence:** [`face_capture_webview.dart:31–36`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_fdroid/lib/face_capture_webview.dart#L31-L36), [`face_capture_webview.dart:61–70`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_fdroid/lib/face_capture_webview.dart#L61-L70), [`face_capture_navigation_test.dart`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_fdroid/test/face_capture_navigation_test.dart)
- **Requirement:** [#33 in the catalogue](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r33)
- **Tests:** [test results for #33](/edi-stelsel-certification/conformance/owasp-mas-eudiw-tests#req-33)

#### \#34 — The app only allows trusted WebView content to access local resources. {#c34}

- **Status:** Partly
- **Finding:** The face capture WebView of the F-Droid app has no file access and no content provider access. Open: the WebView activity of the `url_launcher` plugin in the Play Store APK has not been assessed ([MASTG-TEST-0252](/edi-stelsel-certification/conformance/owasp-mas-eudiw-tests#mastg-test-0252)).
- **Evidence:** [`face_capture_webview.dart:112–113`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_fdroid/lib/face_capture_webview.dart#L112-L113)
- **Requirement:** [#34 in the catalogue](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r34)
- **Tests:** [test results for #34](/edi-stelsel-certification/conformance/owasp-mas-eudiw-tests#req-34)

#### \#35 — The app only allows trusted content in WebViews. {#c35}

- **Status:** Implemented
- **Finding:** Markdown texts, which can come from issuers, only open `https` and `mailto` links. An SVG logo or attribute image larger than 1 MiB is not drawn.
- **Evidence:** [`irma_markdown.dart:14–21`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_core/lib/src/widgets/irma_markdown.dart#L14-L21), [`base64_image.dart:27`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_core/lib/src/widgets/base64_image.dart#L27), [`irma_markdown_links_test.dart`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_core/test/irma_markdown_links_test.dart), [`base64_image_svg_test.dart`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_core/test/base64_image_svg_test.dart)
- **Requirement:** [#35 in the catalogue](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r35)
- **Tests:** [test results for #35](/edi-stelsel-certification/conformance/owasp-mas-eudiw-tests#req-35)

#### \#36 — The app does not unnecessarily expose sensitive data through its user interface. {#c36}

- **Status:** Open: decision
- **Finding:** Open: masking attribute values by default is a feature of its own.
- **Evidence:** [PR #828, "Left out"](https://github.com/privacybydesign/irmamobile/pull/828)
- **Requirement:** [#36 in the catalogue](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r36)
- **Tests:** [test results for #36](/edi-stelsel-certification/conformance/owasp-mas-eudiw-tests#req-36)

#### \#37 — The app does not unnecessarily expose sensitive data through system notifications. {#c37}

- **Status:** Not assessed
- **Finding:** No evidence collected yet. The `pubspec.yaml` of the app lists no notification or push messaging package.
- **Evidence:** [`pubspec.yaml`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_app/pubspec.yaml), [`pubspec.yaml`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_core/pubspec.yaml)
- **Requirement:** [#37 in the catalogue](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r37)
- **Tests:** [test results for #37](/edi-stelsel-certification/conformance/owasp-mas-eudiw-tests#req-37)

#### \#38 — The app removes or masks sensitive data from its views when moved to the background, when being recorded or when a screenshot is taken. {#c38}

- **Status:** Implemented
- **Finding:** Android: the window is secure from its creation, which keeps it out of screenshots, recordings and the recents view. iOS: the app blurs itself in the app switcher and covers itself while the screen is recorded or mirrored. A setting lets the user allow screenshots and recording.
- **Evidence:** [`PrivacyScreenPlugin.java:46–47`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_core/android/src/main/java/foundation/privacybydesign/yivi_core/plugins/privacy_screen/PrivacyScreenPlugin.java#L46-L47), [`PrivacyScreenPlugin.swift:56–63`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_core/ios/Classes/PrivacyScreenPlugin.swift#L56-L63), [`PrivacyScreenPlugin.swift:76–115`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_core/ios/Classes/PrivacyScreenPlugin.swift#L76-L115), [`privacy_screen_test.dart`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_core/test/privacy_screen_test.dart)
- **Requirement:** [#38 in the catalogue](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r38)
- **Tests:** [test results for #38](/edi-stelsel-certification/conformance/owasp-mas-eudiw-tests#req-38)

#### \#39 — The app protects its sensitive screens against overlay attacks. {#c39}

- **Status:** Implemented
- **Finding:** Android: overlay windows of other apps are hidden while Yivi is in the foreground (Android 12 and later), and a tap that arrives while another window covers Yivi is ignored (all versions).
- **Evidence:** [`PrivacyScreenPlugin.java:76–81`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_core/android/src/main/java/foundation/privacybydesign/yivi_core/plugins/privacy_screen/PrivacyScreenPlugin.java#L76-L81)
- **Requirement:** [#39 in the catalogue](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r39)
- **Tests:** [test results for #39](/edi-stelsel-certification/conformance/owasp-mas-eudiw-tests#req-39)

#### \#40 — The app prevents sensitive data from being exposed to, or captured by, accessibility services. {#c40}

- **Status:** Implemented
- **Finding:** Android 14 and later: the content of the app is only given to accessibility services that are an accessibility tool, such as TalkBack, Voice Access and Switch Access.
- **Evidence:** [`PrivacyScreenPlugin.java:62`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_core/android/src/main/java/foundation/privacybydesign/yivi_core/plugins/privacy_screen/PrivacyScreenPlugin.java#L62)
- **Requirement:** [#40 in the catalogue](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r40)
- **Tests:** [test results for #40](/edi-stelsel-certification/conformance/owasp-mas-eudiw-tests#req-40)

### MASVS-CODE {#masvs-code}

#### \#41 — The app detects if it is running on an unsupported OS version and reacts appropriately. {#c41}

- **Status:** Open: wallet provider
- **Finding:** The app has a fixed minimum version: Android 8.0 (API 26) and iOS 15.6. Open: a minimum OS version driven by signed wallet configuration.
- **Evidence:** [`build.gradle:40`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_app/android/app/build.gradle#L40), [`Podfile:8`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_app/ios/Podfile#L8), [PR #828, "Left out"](https://github.com/privacybydesign/irmamobile/pull/828)
- **Requirement:** [#41 in the catalogue](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r41)
- **Tests:** [test results for #41](/edi-stelsel-certification/conformance/owasp-mas-eudiw-tests#req-41)

#### \#42 — The app targets the latest platform version. {#c42}

- **Status:** Open: decision
- **Finding:** `targetSdkVersion` is 36 while the app compiles against SDK 37. Open: the bump needs a behaviour-change pass on a device.
- **Evidence:** [`build.gradle:30–41`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_app/android/app/build.gradle#L30-L41), [PR #828, "Left out"](https://github.com/privacybydesign/irmamobile/pull/828)
- **Requirement:** [#42 in the catalogue](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r42)
- **Tests:** [test results for #42](/edi-stelsel-certification/conformance/owasp-mas-eudiw-tests#req-42)

#### \#43 — The app detects if it must be updated and reacts appropriately. {#c43}

- **Status:** Open: wallet provider
- **Finding:** Open: enforced updates driven by signed wallet configuration.
- **Evidence:** [PR #828, "Left out"](https://github.com/privacybydesign/irmamobile/pull/828)
- **Requirement:** [#43 in the catalogue](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r43)
- **Tests:** [test results for #43](/edi-stelsel-certification/conformance/owasp-mas-eudiw-tests#req-43)

#### \#44 — The app's third-party components are regularly checked for known vulnerabilities. {#c44}

- **Status:** Implemented
- **Finding:** Every delivery build generates a CycloneDX SBOM. Dependabot keeps the GitHub Actions, Go, pub and Gradle dependencies up to date. Status checks run `govulncheck` on the Go bridge, also every Monday, and a dependency review on each pull request.
- **Evidence:** [`delivery.yml:43–72`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/.github/workflows/delivery.yml#L43-L72), [`generate_sbom.sh`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/generate_sbom.sh), [`dependabot.yml`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/.github/dependabot.yml), [`status-checks.yml:27–30`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/.github/workflows/status-checks.yml#L27-L30), [`status-checks.yml:489–491`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/.github/workflows/status-checks.yml#L489-L491)
- **Requirement:** [#44 in the catalogue](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r44)
- **Tests:** [test results for #44](/edi-stelsel-certification/conformance/owasp-mas-eudiw-tests#req-44)

#### \#45 — The app uses the compiler-provided security features of the platform. {#c45}

- **Status:** Partly
- **Finding:** The Go bridge is built with `-trimpath` and without the symbol table and DWARF data. Not recorded yet: a check of the compiled binaries for PIE, stack canaries and ARC.
- **Evidence:** [`bind_go.sh:189–195`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/bind_go.sh#L189-L195)
- **Requirement:** [#45 in the catalogue](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r45)
- **Tests:** [test results for #45](/edi-stelsel-certification/conformance/owasp-mas-eudiw-tests#req-45)

#### \#46 — The app does not use deprecated APIs or functionality. {#c46}

- **Status:** Not assessed
- **Finding:** No evidence collected yet.
- **Requirement:** [#46 in the catalogue](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r46)
- **Tests:** [test results for #46](/edi-stelsel-certification/conformance/owasp-mas-eudiw-tests#req-46)

#### \#47 — The app uses standard APIs for security-critical functionality. {#c47}

- **Status:** Not assessed
- **Finding:** No evidence collected yet.
- **Requirement:** [#47 in the catalogue](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r47)
- **Tests:** [test results for #47](/edi-stelsel-certification/conformance/owasp-mas-eudiw-tests#req-47)

#### \#48 — The app package does not contain malicious code. {#c48}

- **Status:** Not assessed
- **Finding:** No evidence collected yet. Related checks that run in CI: CodeQL on the Go bridge, the Android Java plugins and the workflow files, and a dependency review.
- **Evidence:** [`status-checks.yml:472–473`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/.github/workflows/status-checks.yml#L472-L473), [`status-checks.yml:489–491`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/.github/workflows/status-checks.yml#L489-L491)
- **Requirement:** [#48 in the catalogue](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r48)
- **Tests:** [test results for #48](/edi-stelsel-certification/conformance/owasp-mas-eudiw-tests#req-48)

#### \#49 — The app loads dynamic code safely from trusted sources. {#c49}

- **Status:** Implemented
- **Finding:** The Android code loads no code at run time. The CI guard fails on `DexClassLoader`, `PathClassLoader`, `InMemoryDexClassLoader` and `System.load(`.
- **Evidence:** [`check_security_config.sh:81–85`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/ci_scripts/check_security_config.sh#L81-L85)
- **Requirement:** [#49 in the catalogue](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r49)
- **Tests:** [test results for #49](/edi-stelsel-certification/conformance/owasp-mas-eudiw-tests#req-49)

#### \#50 — The app securely handles untrusted data. {#c50}

- **Status:** Open: irmago
- **Finding:** App side: SVG size cap, link scheme allow-lists and encoded deep links (see [#29](#c29) and [#35](#c35)). Open: bounded parsing of untrusted input in irmago.
- **Evidence:** [PR #828, "Left out"](https://github.com/privacybydesign/irmamobile/pull/828)
- **Requirement:** [#50 in the catalogue](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r50)
- **Tests:** [test results for #50](/edi-stelsel-certification/conformance/owasp-mas-eudiw-tests#req-50)

### MASVS-RESILIENCE {#masvs-resilience}

#### \#51 — The app detects if it runs on a rooted/jailbroken device and reacts appropriately. {#c51}

- **Status:** Implemented
- **Finding:** A rooted or jailbroken device gives a warning, which the user accepts once to continue.
- **Evidence:** [`RootDetectionPlugin.java:53`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_core/android/src/main/java/foundation/privacybydesign/yivi_core/plugins/root_detection/RootDetectionPlugin.java#L53), [`RootDetectionPlugin.swift`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_core/ios/Classes/RootDetectionPlugin.swift), [`repository.dart:9–14`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_core/lib/src/screens/rooted_warning/repository.dart#L9-L14)
- **Requirement:** [#51 in the catalogue](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r51)
- **Tests:** [test results for #51](/edi-stelsel-certification/conformance/owasp-mas-eudiw-tests#req-51)

#### \#52 — The app detects when it is running inside an app-virtualization environment. {#c52}

- **Status:** Implemented
- **Finding:** An app-cloning container gives the "device unsafe" warning, with its own explanation and its own acceptance.
- **Evidence:** [`AppIntegrityPlugin.java:193–202`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_core/android/src/main/java/foundation/privacybydesign/yivi_core/plugins/app_integrity/AppIntegrityPlugin.java#L193-L202), [`repository.dart:9–14`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_core/lib/src/screens/rooted_warning/repository.dart#L9-L14), [`device_risk_test.dart`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_core/test/device_risk_test.dart)
- **Requirement:** [#52 in the catalogue](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r52)
- **Tests:** [test results for #52](/edi-stelsel-certification/conformance/owasp-mas-eudiw-tests#req-52)

#### \#53 — The app detects when it is running in an emulated or virtual device environment. {#c53}

- **Status:** Partly
- **Finding:** An emulator gives the "device unsafe" warning in release builds. Open: `x86_64` stays in the release build, because dropping it drops ChromeOS.
- **Evidence:** [`AppIntegrityPlugin.java:162–168`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_core/android/src/main/java/foundation/privacybydesign/yivi_core/plugins/app_integrity/AppIntegrityPlugin.java#L162-L168), [`build.gradle:78–79`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_app/android/app/build.gradle#L78-L79), [PR #828, "Left out"](https://github.com/privacybydesign/irmamobile/pull/828)
- **Requirement:** [#53 in the catalogue](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r53)
- **Tests:** [test results for #53](/edi-stelsel-certification/conformance/owasp-mas-eudiw-tests#req-53)

#### \#54 — The app implements device attestation. {#c54}

- **Status:** Open: wallet provider
- **Finding:** Open: device attestation and the Wallet Unit Attestation.
- **Evidence:** [PR #828, "Left out"](https://github.com/privacybydesign/irmamobile/pull/828)
- **Requirement:** [#54 in the catalogue](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r54)
- **Tests:** [test results for #54](/edi-stelsel-certification/conformance/owasp-mas-eudiw-tests#req-54)

#### \#55 — The app detects attacks by malware. {#c55}

- **Status:** Not assessed
- **Finding:** No evidence collected yet.
- **Requirement:** [#55 in the catalogue](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r55)
- **Tests:** [test results for #55](/edi-stelsel-certification/conformance/owasp-mas-eudiw-tests#req-55)

#### \#56 — The app implements app attestation. {#c56}

- **Status:** Open: wallet provider
- **Finding:** Open: app attestation and the Wallet Unit Attestation.
- **Evidence:** [PR #828, "Left out"](https://github.com/privacybydesign/irmamobile/pull/828)
- **Requirement:** [#56 in the catalogue](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r56)
- **Tests:** [test results for #56](/edi-stelsel-certification/conformance/owasp-mas-eudiw-tests#req-56)

#### \#57 — The app verifies the integrity of its resources. {#c57}

- **Status:** Open: wallet provider
- **Finding:** Open: integrity of security settings and scheme keys.
- **Evidence:** [PR #828, "Left out"](https://github.com/privacybydesign/irmamobile/pull/828)
- **Requirement:** [#57 in the catalogue](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r57)
- **Tests:** [test results for #57](/edi-stelsel-certification/conformance/owasp-mas-eudiw-tests#req-57)

#### \#58 — The app detects unauthorized changes to its code and execution flow at runtime. {#c58}

- **Status:** Implemented
- **Finding:** With a debugger or an instrumentation tool attached, the app shows a screen that says so and stays closed. Checked at start, on resume and every 30 seconds, in release builds, also in one that was repackaged as debuggable.
- **Evidence:** [`app_integrity.dart:96–107`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_core/lib/src/screens/app_integrity/app_integrity.dart#L96-L107), [`AppIntegrityPlugin.java:102–108`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_core/android/src/main/java/foundation/privacybydesign/yivi_core/plugins/app_integrity/AppIntegrityPlugin.java#L102-L108), [`app_integrity_blocked_screen.dart:6–9`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_core/lib/src/screens/app_integrity/app_integrity_blocked_screen.dart#L6-L9), [`app_integrity_test.dart`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_core/test/app_integrity_test.dart)
- **Requirement:** [#58 in the catalogue](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r58)
- **Tests:** [test results for #58](/edi-stelsel-certification/conformance/owasp-mas-eudiw-tests#req-58)

#### \#59 — The app implements code obfuscation. {#c59}

- **Status:** Implemented
- **Finding:** Release builds made with fastlane obfuscate the Dart code and keep the symbols separately. R8 is on for the Android release build. The Go bridge is built without symbols. Exception: the F-Droid app is not built through fastlane, gets no Dart obfuscation and is outside the CI guard.
- **Evidence:** [`Fastfile:144`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/fastlane/Fastfile#L144), [`Fastfile:257`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/fastlane/Fastfile#L257), [`build.gradle:74–75`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_app/android/app/build.gradle#L74-L75), [`bind_go.sh:195`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/bind_go.sh#L195), [`check_security_config.sh:86–95`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/ci_scripts/check_security_config.sh#L86-L95)
- **Requirement:** [#59 in the catalogue](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r59)
- **Tests:** [test results for #59](/edi-stelsel-certification/conformance/owasp-mas-eudiw-tests#req-59)

#### \#60 — The app applies resource obfuscation to hinder reverse engineering. {#c60}

- **Status:** Implemented
- **Finding:** Resource shrinking is on for the Android release build, and Go symbols are stripped. The same F-Droid exception as for [#59](#c59) applies.
- **Evidence:** [`build.gradle:74–75`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_app/android/app/build.gradle#L74-L75), [`bind_go.sh:195`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/bind_go.sh#L195)
- **Requirement:** [#60 in the catalogue](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r60)
- **Tests:** [test results for #60](/edi-stelsel-certification/conformance/owasp-mas-eudiw-tests#req-60)

#### \#61 — The app does not contain debug artifacts. {#c61}

- **Status:** Open: decision
- **Finding:** Developer mode can still be switched on in the production app, with 7 taps on the version. Integrators use it. Open: removing it from production builds is a product decision.
- **Evidence:** [`version_button.dart:57–62`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_core/lib/src/screens/more/widgets/version_button.dart#L57-L62), [PR #828, "Left out"](https://github.com/privacybydesign/irmamobile/pull/828)
- **Requirement:** [#61 in the catalogue](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r61)
- **Tests:** [test results for #61](/edi-stelsel-certification/conformance/owasp-mas-eudiw-tests#req-61)

#### \#62 — The app applies application-level payload encryption in addition to transport-layer encryption. {#c62}

- **Status:** Open: irmago
- **Finding:** Open: application-level payload encryption in irmago.
- **Evidence:** [PR #828, "Left out"](https://github.com/privacybydesign/irmamobile/pull/828)
- **Requirement:** [#62 in the catalogue](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r62)
- **Tests:** [test results for #62](/edi-stelsel-certification/conformance/owasp-mas-eudiw-tests#req-62)

#### \#63 — The app disables debug mechanisms. {#c63}

- **Status:** Implemented
- **Finding:** No manifest marks the app debuggable and WebView debugging is off; the CI guard fails otherwise. An Android release build fails when no release key is given, instead of falling back to the debug key.
- **Evidence:** [`check_security_config.sh:96–103`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/ci_scripts/check_security_config.sh#L96-L103), [`build.gradle:116–120`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_app/android/app/build.gradle#L116-L120)
- **Requirement:** [#63 in the catalogue](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r63)
- **Tests:** [test results for #63](/edi-stelsel-certification/conformance/owasp-mas-eudiw-tests#req-63)

#### \#64 — The app detects debugger attachment at runtime and responds to protect sensitive operations. {#c64}

- **Status:** Implemented
- **Finding:** Android: `Debug.isDebuggerConnected()`, `Debug.waitingForDebugger()` and the `TracerPid` of the process. iOS: the `P_TRACED` flag. A hit closes the app behind a blocking screen.
- **Evidence:** [`AppIntegrityPlugin.java:120–121`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_core/android/src/main/java/foundation/privacybydesign/yivi_core/plugins/app_integrity/AppIntegrityPlugin.java#L120-L121), [`AppIntegrityPlugin.swift:50–56`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_core/ios/Classes/AppIntegrityPlugin.swift#L50-L56), [`AppIntegrityPluginTest.kt`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_core/android/src/test/kotlin/foundation/privacybydesign/yivi_core/plugins/app_integrity/AppIntegrityPluginTest.kt)
- **Requirement:** [#64 in the catalogue](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r64)
- **Tests:** [test results for #64](/edi-stelsel-certification/conformance/owasp-mas-eudiw-tests#req-64)

#### \#65 — The app detects dynamic analysis tools and responds to protect sensitive operations. {#c65}

- **Status:** Implemented
- **Finding:** Frida and similar instrumentation tools are detected by their libraries and threads on Android and by their loaded images on iOS; a hit closes the app behind a blocking screen. A hooking framework (Xposed, LSPosed, a tweak injector) gives the "device unsafe" warning.
- **Evidence:** [`AppIntegrityPlugin.java:40–57`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_core/android/src/main/java/foundation/privacybydesign/yivi_core/plugins/app_integrity/AppIntegrityPlugin.java#L40-L57), [`AppIntegrityPlugin.java:138–150`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_core/android/src/main/java/foundation/privacybydesign/yivi_core/plugins/app_integrity/AppIntegrityPlugin.java#L138-L150), [`AppIntegrityPlugin.swift:61–78`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_core/ios/Classes/AppIntegrityPlugin.swift#L61-L78)
- **Requirement:** [#65 in the catalogue](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r65)
- **Tests:** [test results for #65](/edi-stelsel-certification/conformance/owasp-mas-eudiw-tests#req-65)

### MASVS-PRIVACY {#masvs-privacy}

#### \#66 — The app adequately manages permissions. {#c66}

- **Status:** Implemented
- **Finding:** The Android manifest of the app declares internet, biometrics and camera. `RECORD_AUDIO` and the external storage permissions, which a plugin adds, are removed. The Play Store app keeps `VIBRATE`, which the face verification SDK declares. iOS declares Face ID, NFC and camera use.
- **Evidence:** [`CHANGELOG.md:19–20`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/CHANGELOG.md#L19-L20), [`AndroidManifest.xml:89–98`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_app/android/app/src/main/AndroidManifest.xml#L89-L98), [`Info.plist:5–6`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_app/ios/Runner/Info.plist#L5-L6), [`Info.plist:66–73`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_app/ios/Runner/Info.plist#L66-L73)
- **Requirement:** [#66 in the catalogue](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r66)
- **Tests:** [test results for #66](/edi-stelsel-certification/conformance/owasp-mas-eudiw-tests#req-66)

#### \#67 — The app uses anonymization or pseudonymisation measures. {#c67}

- **Status:** Open: irmago
- **Finding:** Open: linkability of SD-JWT credentials in irmago.
- **Evidence:** [PR #828, "Left out"](https://github.com/privacybydesign/irmamobile/pull/828)
- **Requirement:** [#67 in the catalogue](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r67)
- **Tests:** [test results for #67](/edi-stelsel-certification/conformance/owasp-mas-eudiw-tests#req-67)

#### \#68 — The app does not use persistent or unique identifiers in a way that enables user tracking. {#c68}

- **Status:** Implemented
- **Finding:** Error reporting (Sentry) is only started after the opt-in, and attaches no default personal data. One exception: a report the user sends from an error screen starts Sentry for that report only.
- **Evidence:** [`sentry.dart:33–52`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_core/lib/src/sentry/sentry.dart#L33-L52), [`sentry_opt_in_test.dart`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_core/test/sentry_opt_in_test.dart)
- **Requirement:** [#68 in the catalogue](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r68)
- **Tests:** [test results for #68](/edi-stelsel-certification/conformance/owasp-mas-eudiw-tests#req-68)

#### \#69 — The app uses privacy-preserving functionality. {#c69}

- **Status:** Open: irmago
- **Finding:** Open: the OpenID4VP display name in irmago.
- **Evidence:** [PR #828, "Left out"](https://github.com/privacybydesign/irmamobile/pull/828)
- **Requirement:** [#69 in the catalogue](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r69)
- **Tests:** [test results for #69](/edi-stelsel-certification/conformance/owasp-mas-eudiw-tests#req-69)

#### \#70 — The app informs the user about the privacy implications before performing an action. {#c70}

- **Status:** Not assessed
- **Finding:** No evidence collected yet.
- **Requirement:** [#70 in the catalogue](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r70)
- **Tests:** [test results for #70](/edi-stelsel-certification/conformance/owasp-mas-eudiw-tests#req-70)

#### \#71 — The app uses adequate defaults for privacy relevant actions. {#c71}

- **Status:** Implemented
- **Finding:** Error reporting is off until the user opts in.
- **Evidence:** [`sentry.dart:13–31`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_core/lib/src/sentry/sentry.dart#L13-L31), [`sentry.dart:66–71`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_core/lib/src/sentry/sentry.dart#L66-L71)
- **Requirement:** [#71 in the catalogue](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r71)
- **Tests:** [test results for #71](/edi-stelsel-certification/conformance/owasp-mas-eudiw-tests#req-71)

#### \#72 — The app provides an adequate privacy policy. {#c72}

- **Status:** Implemented
- **Finding:** The privacy policy is linked on the terms screen of the enrollment, so it can be read before any data is processed.
- **Evidence:** [`accept_terms_screen.dart:69–76`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_core/lib/src/screens/enrollment/accept_terms/accept_terms_screen.dart#L69-L76)
- **Requirement:** [#72 in the catalogue](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r72)
- **Tests:** [test results for #72](/edi-stelsel-certification/conformance/owasp-mas-eudiw-tests#req-72)

#### \#73 — The app adequately declares all user collected data. {#c73}

- **Status:** Open: decision
- **Finding:** The `yivi_core` plugin has a privacy manifest that declares no collected data. Open: a privacy manifest for the Runner target has to match the App Store privacy labels, which are not in the repository.
- **Evidence:** [`PrivacyInfo.xcprivacy:5–12`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_core/ios/Resources/PrivacyInfo.xcprivacy#L5-L12), [PR #828, "Left out"](https://github.com/privacybydesign/irmamobile/pull/828)
- **Requirement:** [#73 in the catalogue](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r73)
- **Tests:** [test results for #73](/edi-stelsel-certification/conformance/owasp-mas-eudiw-tests#req-73)

#### \#74 — The app adequately declares all tracking domains it connects to. {#c74}

- **Status:** Not assessed
- **Finding:** No evidence collected yet. The privacy manifest of the `yivi_core` plugin declares no tracking and no tracking domains.
- **Evidence:** [`PrivacyInfo.xcprivacy:5–12`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_core/ios/Resources/PrivacyInfo.xcprivacy#L5-L12)
- **Requirement:** [#74 in the catalogue](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r74)
- **Tests:** [test results for #74](/edi-stelsel-certification/conformance/owasp-mas-eudiw-tests#req-74)

#### \#75 — The app offers reproducible builds. {#c75}

- **Status:** Out of scope
- **Finding:** Marked "OUT OF SCOPE for the OWASP MAS EUDIW Profile" in the catalogue.
- **Evidence:** [Catalogue](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r75)
- **Requirement:** [#75 in the catalogue](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r75)
- **Tests:** [test results for #75](/edi-stelsel-certification/conformance/owasp-mas-eudiw-tests#req-75)

#### \#76 — The app provides adequate controls to manage user data. {#c76}

- **Status:** Open: irmago
- **Finding:** The user can delete all data in the app, which removes the storage. Open: server-side account deletion.
- **Evidence:** [`event_handler.go:142–143`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_core/irmagobridge/event_handler.go#L142-L143), [PR #828, "Left out"](https://github.com/privacybydesign/irmamobile/pull/828)
- **Requirement:** [#76 in the catalogue](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r76)
- **Tests:** [test results for #76](/edi-stelsel-certification/conformance/owasp-mas-eudiw-tests#req-76)

#### \#77 — The app provides adequate controls over the visibility of user data. {#c77}

- **Status:** Not assessed
- **Finding:** No evidence collected yet.
- **Requirement:** [#77 in the catalogue](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r77)
- **Tests:** [test results for #77](/edi-stelsel-certification/conformance/owasp-mas-eudiw-tests#req-77)

#### \#78 — The app requests user consent prior to any data processing. {#c78}

- **Status:** Implemented
- **Finding:** The terms are accepted during enrollment, with the privacy policy linked on that screen. The time of accepting is stored next to the accepted version.
- **Evidence:** [`irma_preferences.dart:87–88`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_core/lib/src/data/irma_preferences.dart#L87-L88), [`accept_terms_screen.dart:69–76`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_core/lib/src/screens/enrollment/accept_terms/accept_terms_screen.dart#L69-L76), [`consent_record_test.dart`](https://github.com/privacybydesign/irmamobile/blob/7c7af783afcd97c75c2a22d3d1279dbcf4a14159/yivi_core/test/consent_record_test.dart)
- **Requirement:** [#78 in the catalogue](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r78)
- **Tests:** [test results for #78](/edi-stelsel-certification/conformance/owasp-mas-eudiw-tests#req-78)

## Open work {#open-work}

Grouped as in [PR #828, "Left out"](https://github.com/privacybydesign/irmamobile/pull/828):

- **Wallet provider** ([#3](#c3), [#13](#c13), [#16](#c16), [#20](#c20), [#22](#c22), [#25](#c25), [#28](#c28), [#41](#c41), [#43](#c43), [#54](#c54), [#56](#c56), [#57](#c57)): device and app attestation and the Wallet Unit Attestation, non-repudiation with attested keys, hardware-backed attested holder keys and their key hierarchy, identity pinning with a pin rotation channel, a minimum OS version and enforced updates driven by signed wallet configuration, and integrity of security settings and scheme keys.
- **irmago** ([#7](#c7), [#8](#c8), [#11](#c11), [#14](#c14), [#15](#c15), [#24](#c24), [#50](#c50), [#62](#c62), [#67](#c67), [#69](#c69), [#76](#c76) and the open part of [#1](#c1)): storage hardening, JWE and hash algorithm allow-lists, EUDI trust paths, PIN key derivation, key rotation, clearing memory on lock, bounded parsing of untrusted input, payload encryption, SD-JWT linkability, the OpenID4VP display name and server-side account deletion.
- **Decision first** ([#19](#c19), [#21](#c21), [#36](#c36), [#42](#c42), [#61](#c61), [#73](#c73) and the open part of [#53](#c53)): developer mode in the production app, `x86_64` in the release build, the target SDK, a privacy manifest for the Runner target, credential provider APIs, strong-only biometrics and masking attribute values by default.
- **Not assessed** ([#4](#c4), [#9](#c9), [#10](#c10), [#18](#c18), [#37](#c37), [#46](#c46), [#47](#c47), [#48](#c48), [#55](#c55), [#70](#c70), [#74](#c74), [#77](#c77)): the pull request neither changed nor listed these. Evidence for them still has to be collected.
- **Follow-up:** the upload of Dart symbols to Sentry has to be configured before the first obfuscated release ([irmamobile#829](https://github.com/privacybydesign/irmamobile/issues/829)).
