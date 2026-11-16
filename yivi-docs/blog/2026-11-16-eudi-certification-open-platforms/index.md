---
slug: eudi-certification-open-platforms
title: "Can a certified EUDI Wallet run on /e/OS, GrapheneOS or a Linux phone? What the Dutch scheme says"
authors: [dibranmulder]
tags: [yivi, eudi-wallet, certification, wallet-provider, attestation, security]
---

*The draft Dutch certification schemes for EUDI Wallets do not name Google or Apple as a requirement. They set conditions on the phone and its operating system instead. This post reads those conditions for phones without Google: /e/OS, GrapheneOS, other Android distributions and Linux for mobile. In short: the scheme leaves the door open for a hardened Android distribution with a locked bootloader, makes it hard for most community builds, and closes it for Linux phones for now.*

<!-- truncate -->

## Why this matters

A European identity wallet that only works on a phone approved by Google or Apple is a strange kind of sovereign. People who run /e/OS, GrapheneOS or a Linux phone often chose that platform for the same reason they would choose Yivi: privacy and control. Yivi is published in the App Store, on Google Play and on F-Droid, and we want to keep it that way once the wallet is certified.

Whether that is possible is decided by the certification scheme. The drafts were published on 5 November 2026; we covered the overall picture in [The Dutch certification schemes for EUDI Wallets are out](/blog/dutch-eudi-certification-schemes). Here we look at one question only: what do they ask of the phone and its operating system?

This is our reading of release candidates. A certification body may read them differently, and Version 1 may change them.

## Where the scheme talks about the phone

The Wallet Instance, the app on the phone, is evaluated at assurance level high. The scheme accepts that the app cannot be secure on its own: its security "depends on the security capabilities, configuration and lifecycle support of every mobile device on which the Wallet Instance is permitted to run". Four documents turn that into requirements:

| Document | What it sets |
|---|---|
| [NL-CS-WI conditions](/edi-stelsel-certification/documents/nl-cs-wi-conditions) | Twelve mandatory security controls on the User Device, [SC-01](/edi-stelsel-certification/requirements/nl-cs-wi-conditions#sc-01) to [SC-12](/edi-stelsel-certification/requirements/nl-cs-wi-conditions#sc-12) |
| [NL-CS-WI](/edi-stelsel-certification/documents/nl-cs-wi) | The protection profile of the Wallet Instance, including the minimum device platform ([RSR_USERDEVICE](/edi-stelsel-certification/requirements/nl-cs-wi#rsr_userdevice)) and installation ([FSR_WI_INSTALL](/edi-stelsel-certification/requirements/nl-cs-wi#fsr_wi_install)) |
| [NL-P-04W](/edi-stelsel-certification/requirements/nl-p-04w) | Lifecycle requirements for the Wallet Provider: device pre-checks and distribution |
| [OWASP MAS EUDI Wallet profile](/edi-stelsel-certification/requirements/owasp-mas-eudiw) | The security tests, including root detection ([#51](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r51)) and device attestation ([#54](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r54)) |

The scheme's own architecture picture shows why the phone gets this much attention. The keys for credentials sit in the HSM at the wallet provider. On the User Device are the Wallet Instance and a key store, and that key store holds the possession factor.

![NL-CS-WI Figure 1: the Wallet Unit, with the WSCA and WSCD-HSM in the Wallet Provider infrastructure and the Wallet Instance and key store on the User Device](/img/edi-stelsel/2026-11-06/nl-cs-wi/image_000000_9ccb3826718d121ca478815afcddac6e5e0733d8988b064a2b04797a57f41fc0.png)

*NL-CS-WI, Figure 1: Wallet Unit as part of the Wallet Ecosystem (§1.2.1, p. 8). See [Supported wallet architecture](/edi-stelsel-certification/system/wallet-architecture).*

Of the three evaluated parts, only the Wallet Instance runs on hardware that the wallet provider does not control. The WSCA and WSCD are evaluated in the data centre. The Wallet Instance is evaluated at assurance level high on whatever phone the user owns, which is why the scheme has to put conditions on that phone.

![NL-SYS-01 Figure 5: the Wallet Instance on the user mobile device under FITCEM assurance level high, the WSCA and WSCD as remote applications and devices under Common Criteria EAL4 with AVA_VAN.5](/img/edi-stelsel/2026-11-06/nl-sys-01/image_000004_12c8d44297ff859758fed6f8e4465ba52337d6fc4f3502d18d4a0ccf715a7b4b.png)

*NL-SYS-01, Figure 5: TOE concept for NL-CS (§7.2, p. 35).*

The requirements name properties, not vendors. Android, iOS and the Google and Apple APIs appear as examples ("for example", "e.g."). That is the good news, and it is consistent enough to build on.

## What the phone must provide

Taken together, the mandatory requirements ask five things of a device.

**1. Security updates.** The device "shall receive regular, timely security updates" ([SC-01](/edi-stelsel-certification/requirements/nl-cs-wi-conditions#sc-01)). The app checks the OS version and security patch level at installation and at every launch, and refuses to activate the wallet on a device below the documented minimum ([INST-5.2-01](/edi-stelsel-certification/requirements/nl-p-04w#inst-5-2-01)). The provider must also be able to revoke wallets on devices that fall behind.

**2. A trusted boot chain.** Bootloader, kernel, OS and TEE code must be trusted and protected against rollback. Where secure boot is not always enforced, its status is checked at runtime, on Android through the verified boot state ([SC-03](/edi-stelsel-certification/requirements/nl-cs-wi-conditions#sc-03)).

**3. Hardware-backed keys with key attestation.** Keys live in a secure element or a hardware-backed TEE, cannot be exported, and come with key attestations that are validated on the server, "never in the UD itself" ([SC-06](/edi-stelsel-certification/requirements/nl-cs-wi-conditions#sc-06)).

**4. Hardware-supported app integrity attestation.** The device proves at runtime that the wallet app has not been tampered with, and "where OS modifications are likely" also supports attestation of the OS itself ([SC-08](/edi-stelsel-certification/requirements/nl-cs-wi-conditions#sc-08)).

**5. A sandbox, a lock screen, encryption and no root.** A non-bypassable app sandbox ([SC-07](/edi-stelsel-certification/requirements/nl-cs-wi-conditions#sc-07)), a hardware-backed lock screen ([SC-09](/edi-stelsel-certification/requirements/nl-cs-wi-conditions#sc-09)), encrypted storage ([SC-10](/edi-stelsel-certification/requirements/nl-cs-wi-conditions#sc-10)), and no root access: the app must detect root or jailbreak and refuse to finish installation ([INST-5.2-02](/edi-stelsel-certification/requirements/nl-p-04w#inst-5-2-02)).

All twelve device controls are mandatory. There is no lighter profile for a platform that offers only some of them.

## Three places where the scheme leaves room

### Attestation does not have to come from Google

[SC-08](/edi-stelsel-certification/requirements/nl-cs-wi-conditions#sc-08) says how app integrity can be attested on Android: "via the verification of hardwarebacked key pairs or alternatively the Google Play Integrity API". Play Integrity is the alternative, not the rule. The first option is Android's standard hardware key attestation, which works without Google Play services on the phone.

That matters, because /e/OS and GrapheneOS do not get Play Integrity's device and strong verdicts: they are not Google-certified builds. The /e/OS documentation says it plainly, under the heading [What relocking does not fix](https://doc.e.foundation/os/learn/bootloader-relocking):

> Relocking restores Verified Boot, it does not restore Google's device certification. Apps gated on Play Integrity or hardware attestation (banking, payment, some streaming apps) keep failing on a relocked /e/OS device, because the device is signed with the /e/OS key rather than the manufacturer one.

The last part of that quote is the point. Hardware attestation fails on /e/OS only when the verifier accepts nothing but the manufacturer's key. A verifier that also accepts the /e/OS key gets a valid answer.

With key attestation, the wallet provider's backend reads the facts itself: which app and signing certificate asked for the key, whether the bootloader is locked, and which verified boot key the OS was started with. A stock OS reports `Verified`. An alternative OS under a locked bootloader reports `SelfSigned` with the hash of its own boot key, which the provider compares against a pinned list. We described this in detail in [WIA, WUA and KA explained](/blog/how-do-we-know-a-wallet-app-is-genuine).

Two caveats. The certificate chain still ends in Google's attestation root, so this removes Google from the phone, not from the trust model. And [SC-03](/edi-stelsel-certification/requirements/nl-cs-wi-conditions#sc-03) and [SC-08](/edi-stelsel-certification/requirements/nl-cs-wi-conditions#sc-08) do not say which boot keys a provider may accept. That choice is left to the wallet provider and has to be defended towards the laboratory. The section below compares this route with the other app integrity mechanisms.

### Distribution does not have to go through Google Play

The lifecycle specification asks for distribution "exclusively through the official app store of the operating system", but continues: "or, where distribution through alternative channels is necessary", with a mechanism that lets "even a Wallet User with low digital savviness" verify the app before installing it ([INST-5.3-01](/edi-stelsel-certification/requirements/nl-p-04w#inst-5-3-01)). The guidelines name the case: "platforms without an official app store". Accepted mechanisms include code-signing checks, a hash against a published manifest, or an authenticity screen on first launch.

The protection profile adds conditions that matter for F-Droid, in [OE.APP_DISTRIBUTION](/edi-stelsel-certification/text/nl-cs-wi#s-2-5) and [FSR_WI_INSTALL](/edi-stelsel-certification/requirements/nl-cs-wi#fsr_wi_install). Every release is signed "with a Wallet Provider signing key", updates are accepted only from the same signing identity, and only certified versions are released. A repository that rebuilds the app and signs it with its own key does not fit that. F-Droid has an answer for this: with [reproducible builds](https://f-droid.org/docs/Reproducible_Builds/) it can "publish both (upstream) developer-signed and F-Droid-signed APKs", or only the developer-signed one, in which case "F-Droid will never attempt to publish APKs signed by F-Droid". A wallet provider needs that last mode. A repository run by the provider itself, or a store like [Accrescent](https://accrescent.app/features/) where developers sign "with their own keys", fits as well.

### The device must not spy on the wallet

[SC-12](/edi-stelsel-certification/requirements/nl-cs-wi-conditions#sc-12) requires that the device does not monitor apps or track users "in a way that would disclose sensitive information about the wallet to the UD's vendor or third parties". This is the one control where a de-Googled phone is the easy case and a stock phone needs the due diligence.

## App integrity: the flavours compared with the scheme

"App attestation" is not one thing. There are at least seven ways to answer the question *is this the genuine app on a sound phone*, and they differ in who vouches, what is actually proven, and whether they exist on a phone without Google. The scheme, in turn, does not ask the question once but in six places, and names mechanisms in five of them.

### What the scheme asks, and where

| Requirement | What it asks | Mechanisms it names |
|---|---|---|
| [SC-08](/edi-stelsel-certification/requirements/nl-cs-wi-conditions#sc-08), mandatory | A "hardware-supported attestation mechanism" for the app, validated "never in the UD itself"; OS integrity too "where OS modifications are likely" | Apple App Attest; on Android "verification of hardwarebacked key pairs or alternatively the Google Play Integrity API (basic or strong integrity)" |
| [ACT-6.3-01](/edi-stelsel-certification/requirements/nl-p-04w#act-6-3-01), mandatory | A Wallet Unit Attestation only after "a platform-level attestation mechanism provided by the device operating system" | Guideline: "the Play Integrity API (Android) and DCAppAttest (iOS)". Without such an API the provider "should document the alternative means" and the residual risk |
| [ACT-6.2-01](/edi-stelsel-certification/requirements/nl-p-04w#act-6-2-01), mandatory | Before issuing a WIA: the instance is genuine, and the request is not replayed or forged | Guideline: an OS app attestation "(e.g., Android Play Integrity API, Apple App Attest), a challengeresponse protocol using the Wallet Instance's signing key, or a combination of both" |
| [INST-5.1-03](/edi-stelsel-certification/requirements/nl-p-04w#inst-5-1-03), mandatory | The app checks its own package at every launch against a reference value in the hardware-backed key store or the WSCD | Guideline: "Android Key Attestation with Play Integrity, iOS App Attest", a hash check, or OS-level integrity verification |
| OWASP MAS [#54](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r54) and [#56](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r56) | "The app implements device attestation" and "app attestation" | [CF13](/edi-stelsel-certification/requirements/owasp-mas-eudiw#cf13): "e.g. Play Integrity / App Attest" |
| [RSR_ATT](/edi-stelsel-certification/requirements/nl-cs-wi#rsr_att), recommended | If attestation evidence is used: authentic, integrity protected, fresh, and tied to this device and this Wallet Instance | None |

The requirements follow the lifecycle of a Wallet Unit. The device checks and the package integrity check ([INST-5.2-01](/edi-stelsel-certification/requirements/nl-p-04w#inst-5-2-01), [INST-5.2-02](/edi-stelsel-certification/requirements/nl-p-04w#inst-5-2-02), [INST-5.1-03](/edi-stelsel-certification/requirements/nl-p-04w#inst-5-1-03)) belong to *install*. Platform attestation ([ACT-6.2-01](/edi-stelsel-certification/requirements/nl-p-04w#act-6-2-01), [ACT-6.3-01](/edi-stelsel-certification/requirements/nl-p-04w#act-6-3-01)) belongs to *activate*: without it the Wallet Unit never leaves the first state. If a phone later falls behind on updates, [SC-01](/edi-stelsel-certification/requirements/nl-cs-wi-conditions#sc-01) leads to *revocation*.

![NL-P-04W Figure A.1: lifecycle states of a Wallet Unit, from Installed through Operational without PID to Valid, ending in Uninstalled or Revoked](/img/edi-stelsel/2026-11-06/nl-p-04w/image_000000_e5bbd568625eb70a4e5998df9aa67d54b4148e42538ba621a3f3ffec85448d7c.png)

*NL-P-04W, Figure A.1: Wallet Unit lifecycle states and transitions ([Annex A](/edi-stelsel-certification/text/nl-p-04w#s-a), p. 119). The clause numbers in the figure are one lower than in the document: installation is clause 5 and activation is clause 6.*

Read together, these give six tests for any mechanism: rooted in hardware, verified on the server, fresh, proves the app, proves the OS and boot state, and provided by the platform. Add a seventh from [SC-12](/edi-stelsel-certification/requirements/nl-cs-wi-conditions#sc-12) and [ACT-6.3-02](/edi-stelsel-certification/requirements/nl-p-04w#act-6-3-02): it should not tell a vendor who uses the wallet, and it should not turn into a device fingerprint.

### The flavours

| Flavour | Who vouches | Proves the app | Proves OS and boot state | On /e/OS, GrapheneOS | Named in the scheme |
|---|---|---|---|---|---|
| [Apple App Attest](https://developer.apple.com/documentation/devicecheck/establishing-your-app-s-integrity) | Apple, key in the Secure Enclave | Yes: team and bundle | Implicit: genuine Apple device | n/a | Yes, in all five |
| [Google Play Integrity](https://developer.android.com/google/play/integrity/overview) | Google, as a verdict | Yes, if installed from Google Play | As a label: basic, device or strong | No device or strong verdict | Yes, in all five |
| [Android hardware key attestation](https://developer.android.com/privacy-and-security/security-key-attestation) | Device hardware, chain to Google's root | Yes: package name and signing certificate | Yes, as facts: boot state, boot key, lock state, patch level | Yes, with a locked bootloader | Yes in [SC-08](/edi-stelsel-certification/requirements/nl-cs-wi-conditions#sc-08), half in [INST-5.1-03](/edi-stelsel-certification/requirements/nl-p-04w#inst-5-1-03), not in [ACT-6.3-01](/edi-stelsel-certification/requirements/nl-p-04w#act-6-3-01) |
| Vendor attestation: [Samsung Knox](https://docs.samsungknox.com/dev/knox-attestation/), [Huawei Safety Detect](https://developer.huawei.com/consumer/en/doc/Security-Guides/introduction-0000001050156325) | The vendor's server | Device health, not the app | Yes, for that vendor's firmware | No | No |
| [UnifiedAttestation](https://heise.de/-11204037) (Volla, Murena, iodé) | An open validation service | Planned | Planned | Planned for /e/OS; GrapheneOS is not taking part | No |
| Challenge-response with the instance's key | Nobody, unless the key is attested | No | No | Yes | Yes, in [ACT-6.2-01](/edi-stelsel-certification/requirements/nl-p-04w#act-6-2-01) |
| In-app checks: [root detection](https://mas.owasp.org/MASWE/MASVS-RESILIENCE/MASWE-0051/), package hash, RASP | The app itself | Weakly | Weakly | Yes | Required in addition, not as attestation |

A few notes per flavour.

**[Apple App Attest](https://developer.apple.com/documentation/devicecheck/establishing-your-app-s-integrity)** fits every test. The key is generated in the Secure Enclave and Apple certifies it for one app identity. On iOS there is no choice to make.

**[Google Play Integrity](https://developer.android.com/google/play/integrity/overview)** returns a verdict, not evidence. Google decides and the provider reads [three labels](https://developer.android.com/google/play/integrity/verdicts). [Since May 2025](https://developer.android.com/google/play/integrity/improvements) the device and strong labels rest on hardware-backed signals on Android 13 and later, and strong also requires a security update from the last year. It needs Google Play services, and app recognition needs installation from Google Play. Every request also tells Google that this device runs the wallet, which sits uneasily with [SC-12](/edi-stelsel-certification/requirements/nl-cs-wi-conditions#sc-12).

**[Android hardware key attestation](https://developer.android.com/privacy-and-security/security-key-attestation)** returns evidence, not a verdict. The fields are specified in the [Android Open Source Project](https://source.android.com/docs/security/features/keystore/attestation), and GrapheneOS publishes an [attestation compatibility guide](https://grapheneos.org/articles/attestation-compatibility-guide) for verifying it on an alternative OS. The provider's backend gets a certificate chain from the phone's TEE or secure element and applies its own policy. That covers [SC-08](/edi-stelsel-certification/requirements/nl-cs-wi-conditions#sc-08), and the same certificate answers [SC-03](/edi-stelsel-certification/requirements/nl-cs-wi-conditions#sc-03) (boot state), [SC-06](/edi-stelsel-certification/requirements/nl-cs-wi-conditions#sc-06) (where the key lives) and [SC-01](/edi-stelsel-certification/requirements/nl-cs-wi-conditions#sc-01) (patch level, in a form the app cannot fake). It has two weak spots. The app identity in the certificate is filled in by the OS, so it is only worth something when the boot state is acceptable: the two fields have to be judged together. And attestation keys leak from devices now and then, so the provider has to check the revocation list. The device identifiers that ID attestation can add are best left out because of [ACT-6.3-02](/edi-stelsel-certification/requirements/nl-p-04w#act-6-3-02).

**Vendor attestation**, such as [Samsung Knox Attestation](https://docs.samsungknox.com/dev/knox-attestation/) and [Huawei Safety Detect](https://developer.huawei.com/consumer/en/doc/Security-Guides/introduction-0000001050156325), is hardware-backed and server-verified, but each one covers a single brand, reports on the device rather than on the app, and adds another vendor to the trust model. Huawei itself advises not to use its result as the only proof. Neither helps an alternative OS.

**[UnifiedAttestation](https://heise.de/-11204037)** was [announced in March 2026](https://www.androidauthority.com/custom-roms-unifiedattestation-play-integrity-3647852) by Volla, Murena, iodé and Apostrophy as an open source replacement for Play Integrity: a component in the OS, a decentralised validation service and an open test suite for certifying an OS on a device. It is the only flavour designed for European alternative Android. It would be "provided by the device operating system", which is what [ACT-6.3-01](/edi-stelsel-certification/requirements/nl-p-04w#act-6-3-01) asks. Whether it is "hardware-supported" in the sense of [SC-08](/edi-stelsel-certification/requirements/nl-cs-wi-conditions#sc-08) depends on a design we have not seen in a shipped product. GrapheneOS opposes the idea on principle: it does not want another party deciding which operating systems are allowed.

**Challenge-response**, the option in the guideline of [ACT-6.2-01](/edi-stelsel-certification/requirements/nl-p-04w#act-6-2-01), proves that the caller holds a key. It says nothing about the app unless that key was created under hardware key attestation, in which case the attestation is doing the work.

**In-app checks**, the subject of OWASP's [MASVS-RESILIENCE](https://mas.owasp.org/MASVS/11-MASVS-RESILIENCE/) weaknesses such as [root detection](https://mas.owasp.org/MASWE/MASVS-RESILIENCE/MASWE-0051/) and [app attestation](https://mas.owasp.org/MASWE/MASVS-RESILIENCE/MASWE-0056/), are required anyway: OWASP MAS [#51](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r51), [INST-5.1-03](/edi-stelsel-certification/requirements/nl-p-04w#inst-5-1-03), [INST-5.2-02](/edi-stelsel-certification/requirements/nl-p-04w#inst-5-2-02), [RSR_MON](/edi-stelsel-certification/requirements/nl-cs-wi#rsr_mon) and, as a recommendation, [RSR_INTG](/edi-stelsel-certification/requirements/nl-cs-wi#rsr_intg). They cannot be the attestation, because [SC-08](/edi-stelsel-certification/requirements/nl-cs-wi-conditions#sc-08) wants hardware support and verification off the device. A tampered app skips the checks it runs on itself.

### What the comparison shows

**The documents do not agree with each other.** [SC-08](/edi-stelsel-certification/requirements/nl-cs-wi-conditions#sc-08) puts hardware key attestation first and Play Integrity second. The guideline under [ACT-6.3-01](/edi-stelsel-certification/requirements/nl-p-04w#act-6-3-01) names only Play Integrity and App Attest, and treats everything else as a documented exception with residual risk. [INST-5.1-03](/edi-stelsel-certification/requirements/nl-p-04w#inst-5-1-03) says "Android Key Attestation with Play Integrity", which can be read as both together. For a wallet on /e/OS or GrapheneOS the difference is everything: under the first document it is a normal case, under the second a tolerated one.

**The scheme accepts a weaker Google signal than the open alternative gives.** [SC-08](/edi-stelsel-certification/requirements/nl-cs-wi-conditions#sc-08) allows Play Integrity at "basic or strong integrity". Google's [own documentation](https://developer.android.com/google/play/integrity/verdicts) says of the basic label: "The device bootloader can be locked or unlocked". That cannot be squared with [SC-03](/edi-stelsel-certification/requirements/nl-cs-wi-conditions#sc-03) and [INST-5.2-02](/edi-stelsel-certification/requirements/nl-p-04w#inst-5-2-02). A locked /e/OS or GrapheneOS phone that proves its boot key through key attestation gives more assurance than a phone that only reaches basic.

**Mandatory in one document, optional in the next.** The device must offer attestation ([SC-08](/edi-stelsel-certification/requirements/nl-cs-wi-conditions#sc-08)), the provider must use it ([ACT-6.3-01](/edi-stelsel-certification/requirements/nl-p-04w#act-6-3-01)) and the tests check for it ([#54](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r54), [#56](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r56)). In the protection profile, device attestation is a recommendation ([RSR_ATT](/edi-stelsel-certification/requirements/nl-cs-wi#rsr_att)).

**No flavour is enough alone.** The combination the scheme points at is the right one: platform attestation checked on the server at activation, in-app checks at every launch, and monitoring in between. Only the first part depends on the platform, and for that part Android has exactly one flavour that works without Google on the phone.

## The hard limit: the bootloader

**Root and unlocked bootloaders.** A custom ROM is not a rooted phone, but an unlocked bootloader fails the trusted boot control ([SC-03](/edi-stelsel-certification/requirements/nl-cs-wi-conditions#sc-03)). That rules out most community builds: LineageOS, and /e/OS on the many devices where the bootloader cannot be relocked. Which devices those are is public, see [the lists below](#which-phones-can-relock). It also means root detection ([INST-5.2-02](/edi-stelsel-certification/requirements/nl-p-04w#inst-5-2-02), OWASP MAS [#51](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r51)) has to be done properly. Heuristics that flag every non-stock OS as rooted would lock out /e/OS and GrapheneOS for no security reason.

## Which phones can relock? {#which-phones-can-relock}

Whether a phone can pass the trusted boot control with another OS is not a guess. The projects publish it per device.

| Project | Where to look | What it says (November 2026) |
|---|---|---|
| /e/OS | [Device selector](https://doc.e.foundation/devices), with the filters "Release Type" and "Bootloader Locked Status" | Marks every device as official or community build, and as lockable or not lockable. Lockable devices include Fairphone 3, 4, 5 and 6, Pixel 5, 7, 8 and Pixel Tablet, Murena One and Two, SHIFTphone 8, Teracube 2e (2021) and 2s, Gigaset GS6 and Volla Tablet. All of them are official builds. |
| /e/OS community | [Forum list of relockable devices](https://community.e.foundation/t/list-devices-where-bootloader-can-be-relocked/48424) | A dozen lockable devices against roughly 190 that are not, among them most Samsung, OnePlus, Motorola, Xiaomi and Sony models. |
| GrapheneOS | [Supported devices](https://grapheneos.org/faq#supported-devices) | Pixels only: Pixel 6 up to and including the Pixel 10 series, Pixel Fold and Pixel Tablet. Verified boot with rollback protection is a requirement for any device. |
| CalyxOS | [Device support](https://calyxos.org/docs/guide/device-support/) | "Meant to be run with a locked bootloader after installation". Pixels, Fairphone 4, 5 and Gen. 6, a number of Motorola moto g models and the SHIFTphone 8. |

Three things follow for a wallet provider.

- **The set is small and consists of a few brands.** Pixel, Fairphone, SHIFT, Murena, Teracube, some Motorola. On most other hardware an alternative OS means an unlocked bootloader, and that fails [SC-03](/edi-stelsel-certification/requirements/nl-cs-wi-conditions#sc-03) whatever the OS does.
- **Official builds only.** The [/e/OS documentation](https://doc.e.foundation/os/learn/bootloader-relocking) warns: "Relock the bootloader on official builds only. Community builds are not signed with the /e/OS release key and relocking them leaves the device unable to boot." For attestation that is convenient: there is one release key per project to pin for [SC-08](/edi-stelsel-certification/requirements/nl-cs-wi-conditions#sc-08).
- **The lists are maintained by the projects, not by the scheme, and they do not always agree.** The /e/OS forum list and the official device selector differ on a few models, such as the Pixel 4 XL and the SHIFT6mq. A provider cannot copy a list into its policy. It has to rely on what the phone attests: the boot state, the boot key and the patch level ([SC-01](/edi-stelsel-certification/requirements/nl-cs-wi-conditions#sc-01)).

## The list of accepted phones, and where it is enforced

The word "allowlist" does not appear in the drafts. The obligation does. Put the requirements next to each other and a wallet provider ends up keeping a list of device models, operating systems, boot keys and minimum versions, and acting on it.

### What the scheme makes the provider do

| Step | Requirement | What it says |
|---|---|---|
| Decide | [OE.USER_DEVICE](/edi-stelsel-certification/text/nl-cs-wi#s-2-5) | "The Wallet Provider shall support the Wallet Instance only on User Devices that meet these conditions", including security updates "for the period during which the Wallet Provider supports the device" |
| Decide | [SC-02](/edi-stelsel-certification/requirements/nl-cs-wi-conditions#sc-02), [SC-03](/edi-stelsel-certification/requirements/nl-cs-wi-conditions#sc-03), [SC-06](/edi-stelsel-certification/requirements/nl-cs-wi-conditions#sc-06), [SC-07](/edi-stelsel-certification/requirements/nl-cs-wi-conditions#sc-07), [SC-12](/edi-stelsel-certification/requirements/nl-cs-wi-conditions#sc-12) | "Due diligence shall be done" per platform: exploit protection, boot chain, TEE or secure element, sandbox, privacy |
| Document | [INST-5.2-01](/edi-stelsel-certification/requirements/nl-p-04w#inst-5-2-01) | A documented minimum OS version and security patch level, "reviewed in response to newly disclosed vulnerabilities" |
| Collect | [FSR_WI_INSTALL](/edi-stelsel-certification/requirements/nl-cs-wi#fsr_wi_install), [RSR_MON](/edi-stelsel-certification/requirements/nl-cs-wi#rsr_mon) | At activation the app sends "the device model and operating-system version" and the characteristics of the keystore; afterwards it keeps reporting platform state and versions |
| Refuse | [FSR_WI_INSTALL](/edi-stelsel-certification/requirements/nl-cs-wi#fsr_wi_install), [INST-5.2-01](/edi-stelsel-certification/requirements/nl-p-04w#inst-5-2-01), [ACT-6.3-01](/edi-stelsel-certification/requirements/nl-p-04w#act-6-3-01) | If the environment does not meet the requirements, the app "shall prevent activation" and "inform the User"; no Wallet Unit Attestation without platform attestation |
| Watch | [MON-13.1-01](/edi-stelsel-certification/requirements/nl-p-04w#mon-13-1-01) | Detect "a device or Wallet Secure Cryptographic Device profile" that is inconsistent with the profile recorded at activation |
| Revoke | [SC-01](/edi-stelsel-certification/requirements/nl-cs-wi-conditions#sc-01), [REV-12.1-01](/edi-stelsel-certification/requirements/nl-p-04w#rev-12-1-01) | The design "shall be capable of revoking WIs in case the associated UD can no longer ensure its security", for example known exploits or a device that is "significantly out of date" |
| Tell the user | [INST-5.2-01](/edi-stelsel-certification/requirements/nl-p-04w#inst-5-2-01) guideline | "When a new minimum is enforced, Users on non-compliant devices are notified before the change takes effect" |

So the list is not a one-off. A device model that is fine today drops off when its vendor stops patching it, and the wallets on it have to be revoked. [SC-01](/edi-stelsel-certification/requirements/nl-cs-wi-conditions#sc-01) suggests how to keep track: associate each Wallet Instance with "device information (device vendor, operating system version, etc.) in the Wallet Provider Backend", read "in an unspoofable way" from the attestation.

Two things are worth noting. The protection profile describes the same duty in its lifecycle text: the provider "must regularly verify that the security of the Wallet Unit is not breached or compromised", and that includes "the mobile device and OS" ([NL-CS-WI §1.3.5](/edi-stelsel-certification/text/nl-cs-wi#s-1-3-5)). And the record of device information has a limit on the other side: [ACT-6.3-02](/edi-stelsel-certification/requirements/nl-p-04w#act-6-3-02) forbids "persistent device fingerprinting". Model, OS, boot key and patch level are enough for the list. A device serial number is not needed and should not be collected.

### Every enforcement point is after the download

Look at the "Refuse" and "Revoke" rows. The scheme enforces the list in three places: in the app before activation, in the backend before a WIA or WUA is issued, and afterwards through revocation. None of the requirements asks the provider to stop an unsupported phone from *downloading* the app. The distribution requirements, [INST-5.3-01](/edi-stelsel-certification/requirements/nl-p-04w#inst-5-3-01) and [OE.APP_DISTRIBUTION](/edi-stelsel-certification/text/nl-cs-wi#s-2-5), are about authenticity of the package, not about who receives it.

That matters, because the stores differ a lot in what they can block.

### What the stores can block

| Channel | Can the publisher block by device or OS? | Source |
|---|---|---|
| Google Play | Yes, partly. Exclude device models by hand, or by rule on RAM and chip. Minimum Android version and required hardware features through the manifest. And a switch that hides the store listing from devices that fail Google's integrity check. No rule for OS build, ROM or patch level. | [Device exclusion](https://support.google.com/googleplay/android-developer/answer/1286017?hl=en), [integrity checks for the store listing](https://support.google.com/googleplay/android-developer/answer/13857328) |
| F-Droid, main repository | No. The repository is one signed index file, the same for everybody. The build metadata has no field for device model, ROM, patch level or attestation. The client compares the phone with what the APK declares and marks a version as not recommended; the user can still install it from the versions list. | [Build metadata](https://f-droid.org/docs/Build_Metadata_Reference/), [index](https://f-droid.org/docs/All_our_APIs/), [client FAQ](https://f-droid.org/docs/FAQ_-_Client/) |
| F-Droid, own repository | No. "Anyone can create their own repo", but the documentation describes no access control or per-device restriction. | [Setup an F-Droid app repo](https://f-droid.org/docs/Setup_an_F-Droid_App_Repo/) |
| Accrescent | Not that we could find. It delivers the right split APKs for a device; that is optimisation, not gating. | [Accrescent features](https://accrescent.app/features/) |
| /e/OS App Lounge | It is a window on other catalogues: Google Play "through the Google Play API", F-Droid, and web apps. The list "matches your device architecture and locale". Whether a publisher's exclusions in Google Play carry through is not documented. | [App Lounge](https://doc.e.foundation/os/apps/app-lounge/) |
| Obtainium, direct download | No. It installs "directly from their releases pages". | [Obtainium](https://github.com/ImranR98/Obtainium) |

Three observations.

**Only Google Play can block, and Google says it is not a barrier.** Its own help page on the integrity switch adds: "This does not prevent users from obtaining your app another way such as through another distribution channel or via sideloading." Android itself does not help either. Required features in the manifest are "informational only, meaning that the Android system itself doesn't check for matching feature support on the device before installing an application" ([Android documentation](https://developer.android.com/guide/topics/manifest/uses-feature-element)).

**F-Droid cannot block, and it does not need to.** An open repository with a static index cannot know which phone is asking, and that is by design. Since the scheme enforces the list at activation and not at download, this is not a gap. An /e/OS or GrapheneOS user on a phone that is not on the list can install Yivi from F-Droid, and the wallet then refuses to activate and says why. That is exactly what [FSR_WI_INSTALL](/edi-stelsel-certification/requirements/nl-cs-wi#fsr_wi_install) describes. It is also the only place where the check means something: [SC-08](/edi-stelsel-certification/requirements/nl-cs-wi-conditions#sc-08) wants the evidence validated "never in the UD itself", and a store filter is not evidence.

**The F-Droid build has to use the open attestation route anyway.** The F-Droid [inclusion policy](https://f-droid.org/docs/Inclusion_Policy/) forbids proprietary libraries and tools "such as Google Play Services", and says that apps "requiring Play Services" are rejected. A build in the main repository therefore cannot call Play Integrity. It has to prove itself through hardware key attestation, which is the route [SC-08](/edi-stelsel-certification/requirements/nl-cs-wi-conditions#sc-08) names first.

What a store filter does give is a better experience: people do not download an app that will refuse to work. Outside Google Play the provider has to supply that itself. The practical answer is to publish the list: which device models, which operating systems and which minimum patch levels are accepted, on a public page and in the store description, and to let the app explain a refusal in plain words. A published list also makes the provider's due diligence checkable by users and by the OS projects that want to get on it.

## Where it gets hard

**Updates per distribution.** [SC-01](/edi-stelsel-certification/requirements/nl-cs-wi-conditions#sc-01) is about patches actually arriving. That differs per distribution and per device, and a provider has to keep track of it for every OS it allows, because [INST-5.2-01](/edi-stelsel-certification/requirements/nl-p-04w#inst-5-2-01) makes the provider document and enforce a minimum patch level.

**Due diligence costs money, and the applicant pays.** Many criteria end in "due diligence shall be done": on exploit protection ([SC-02](/edi-stelsel-certification/requirements/nl-cs-wi-conditions#sc-02)), on the sandbox ([SC-07](/edi-stelsel-certification/requirements/nl-cs-wi-conditions#sc-07)), on the TEE ([SC-06](/edi-stelsel-certification/requirements/nl-cs-wi-conditions#sc-06)), on privacy ([SC-12](/edi-stelsel-certification/requirements/nl-cs-wi-conditions#sc-12)). The draft does not say who performs it or whether it can be reused. If every wallet provider has to produce its own evidence for every alternative OS, the rational choice is to support only the two platforms that cover almost every user. Nothing in the scheme forbids /e/OS or GrapheneOS. The risk is that the cost of proving it does, and of keeping the list described above up to date.

**Is another Android a separate certification object?** The functional scheme ([NL-FS §9.1.1](/edi-stelsel-certification/text/nl-fs#s-9-1-1)) treats wallet units for different operating systems as "separate objects of certification", because they are "different mobile applications, having different code bases". The conformance statement ([NL-FS-W](/edi-stelsel-certification/text/nl-fs-w#s-a-1)) offers two choices: "Android / iOS". The same Android app on /e/OS or GrapheneOS has the same code base, so we read it as one object. The draft does not say so.

**Linux for mobile.** postmarketOS, Mobian and Ubuntu Touch do not offer what [SC-03](/edi-stelsel-certification/requirements/nl-cs-wi-conditions#sc-03), [SC-06](/edi-stelsel-certification/requirements/nl-cs-wi-conditions#sc-06) and [SC-08](/edi-stelsel-certification/requirements/nl-cs-wi-conditions#sc-08) ask for: there is no common, hardware-rooted mechanism through which a server can verify the keys, the app and the boot state of such a phone. Sandboxing ([SC-07](/edi-stelsel-certification/requirements/nl-cs-wi-conditions#sc-07)) depends on the distribution and the packaging. Version 1 of the scheme is also written for a mobile app in a remote HSM architecture. A certified wallet on a Linux phone is not possible under these drafts, and no amount of effort by a wallet provider changes that. It needs attestation support in the platform first.

## Summary per platform

| Platform | Our reading |
|---|---|
| Stock Android, iOS | Fits. Examples in the scheme are written for these. |
| /e/OS official builds on devices that can relock (see [the lists above](#which-phones-can-relock)) | Possible, for that limited set of devices. Key attestation with a pinned boot key instead of Play Integrity ([SC-08](/edi-stelsel-certification/requirements/nl-cs-wi-conditions#sc-08)), distribution outside Google Play with a verification mechanism ([INST-5.3-01](/edi-stelsel-certification/requirements/nl-p-04w#inst-5-3-01)), plus due diligence per distribution. |
| GrapheneOS, and other Android distributions with a locked bootloader and a published boot key | Possible on the same route. |
| Community builds with an unlocked bootloader (LineageOS, most /e/OS installs) | Not possible: fails trusted boot ([SC-03](/edi-stelsel-certification/requirements/nl-cs-wi-conditions#sc-03)). |
| Linux for mobile | Not possible in version 1: no key attestation ([SC-06](/edi-stelsel-certification/requirements/nl-cs-wi-conditions#sc-06)), no app attestation ([SC-08](/edi-stelsel-certification/requirements/nl-cs-wi-conditions#sc-08)). |

## What Yivi will ask for

Feedback on the drafts is open until 31 December 2026. On this topic we will ask the EDI-stelsel for six things:

- **Keep the technology-neutral wording.** Properties, not vendors. Keep hardware key attestation as a full alternative to Play Integrity in [SC-08](/edi-stelsel-certification/requirements/nl-cs-wi-conditions#sc-08), and keep the alternative distribution route in [INST-5.3-01](/edi-stelsel-certification/requirements/nl-p-04w#inst-5-3-01).
- **Say explicitly that an alternative OS with a locked bootloader and a pinned verified boot key can meet [SC-03](/edi-stelsel-certification/requirements/nl-cs-wi-conditions#sc-03) and [SC-08](/edi-stelsel-certification/requirements/nl-cs-wi-conditions#sc-08)**, and what evidence a laboratory expects for the list of accepted boot keys.
- **Align the documents on app attestation.** Name hardware key attestation in the guidelines of [ACT-6.3-01](/edi-stelsel-certification/requirements/nl-p-04w#act-6-3-01), [ACT-6.2-01](/edi-stelsel-certification/requirements/nl-p-04w#act-6-2-01) and [INST-5.1-03](/edi-stelsel-certification/requirements/nl-p-04w#inst-5-1-03) as it is named in [SC-08](/edi-stelsel-certification/requirements/nl-cs-wi-conditions#sc-08), and drop Play Integrity's basic label from [SC-08](/edi-stelsel-certification/requirements/nl-cs-wi-conditions#sc-08).
- **Say that the list of accepted devices is enforced at activation, not at download.** State in [INST-5.3-01](/edi-stelsel-certification/requirements/nl-p-04w#inst-5-3-01) that a distribution channel does not have to filter devices, so that open repositories are not ruled out by a laboratory's reading.
- **Make platform due diligence reusable** ([SC-02](/edi-stelsel-certification/requirements/nl-cs-wi-conditions#sc-02), [SC-06](/edi-stelsel-certification/requirements/nl-cs-wi-conditions#sc-06), [SC-07](/edi-stelsel-certification/requirements/nl-cs-wi-conditions#sc-07), [SC-12](/edi-stelsel-certification/requirements/nl-cs-wi-conditions#sc-12)). One assessment of an OS, shared between wallet providers or maintained by the scheme, instead of each provider paying for the same evidence.
- **Clarify that the same Android app on another Android distribution is not a separate object of certification** under [NL-FS §9.1.1](/edi-stelsel-certification/text/nl-fs#s-9-1-1).

For Linux phones the request goes to a different address. [SC-06](/edi-stelsel-certification/requirements/nl-cs-wi-conditions#sc-06) and [SC-08](/edi-stelsel-certification/requirements/nl-cs-wi-conditions#sc-08) ask for attestation, and that has to be built into the platform before any wallet can use it.

Yivi will keep publishing on F-Droid, and we intend to support every platform the scheme allows us to support. If you maintain an alternative mobile OS and want to work out what it takes to get on a wallet provider's list of accepted platforms, we would like to hear from you.

## Sources

- [NL-CS-WI conditions](/edi-stelsel-certification/requirements/nl-cs-wi-conditions): Conditions on the Underlying Mobile System for Wallet Instances, RC1.1
- [NL-CS-WI](/edi-stelsel-certification/requirements/nl-cs-wi): protection profile for the Wallet Instance, RC1.1
- [NL-P-04W](/edi-stelsel-certification/requirements/nl-p-04w): EUDI Wallet Lifecycle Specification, sections 5.2 and 5.3
- [NL-FS](/edi-stelsel-certification/documents/nl-fs): Functional Certification Scheme, section 9.1.1
- [OWASP MAS EUDI Wallet profile](/edi-stelsel-certification/requirements/owasp-mas-eudiw), requirements [#51](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r51) and [#54](/edi-stelsel-certification/requirements/owasp-mas-eudiw#r54)
- [Device selector](https://doc.e.foundation/devices) and [bootloader relocking](https://doc.e.foundation/os/learn/bootloader-relocking), /e/OS documentation
- [List: devices where the bootloader can be relocked](https://community.e.foundation/t/list-devices-where-bootloader-can-be-relocked/48424), /e/OS community
- [Attestation compatibility guide](https://grapheneos.org/articles/attestation-compatibility-guide) and [supported devices](https://grapheneos.org/faq#supported-devices), GrapheneOS
- [Device support](https://calyxos.org/docs/guide/device-support/), CalyxOS
- [Build metadata](https://f-droid.org/docs/Build_Metadata_Reference/), [inclusion policy](https://f-droid.org/docs/Inclusion_Policy/), [reproducible builds](https://f-droid.org/docs/Reproducible_Builds/) and [repository setup](https://f-droid.org/docs/Setup_an_F-Droid_App_Repo/), F-Droid documentation
- [View and restrict your app's compatible devices](https://support.google.com/googleplay/android-developer/answer/1286017?hl=en) and [integrity checks for the store listing](https://support.google.com/googleplay/android-developer/answer/13857328), Google Play Console help
- [App Lounge](https://doc.e.foundation/os/apps/app-lounge/), /e/OS documentation; [Accrescent](https://accrescent.app/faq/); [Obtainium](https://github.com/ImranR98/Obtainium)
- [Integrity verdicts](https://developer.android.com/google/play/integrity/verdicts) and [improved verdicts on Android 13 and later](https://developer.android.com/google/play/integrity/improvements), Google Play Integrity documentation
- [Knox Enhanced Attestation (v3)](https://docs.samsungknox.com/dev/knox-attestation/enhanced-attestation-v3/), Samsung, and [Safety Detect](https://developer.huawei.com/consumer/en/doc/Security-Guides/introduction-0000001050156325), Huawei
- [Paying without Google: new consortium wants to remove custom ROM hurdles](https://heise.de/-11204037), heise online, and [UnifiedAttestation](https://www.androidauthority.com/custom-roms-unifiedattestation-play-integrity-3647852), Android Authority
