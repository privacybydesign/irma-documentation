---
slug: 2025-age-verification
title: Age Verification in the EU, Ambitious goals, missed privacy opportunities
authors: [dibranmulder]
tags: [yivi, eudi, age-verification]
---

## Protecting minors, today and tomorrow
[The European Commission is preparing a temporary age verification app](https://digital-strategy.ec.europa.eu/en/policies/eu-age-verification#:~:text=This%20initiative%20aims%20to%20allow,pornography%2C%20gambling%2C%20alcohol%2C%20and%20others), aimed at protecting minors on platforms where a minimum age is required—think of online pornography, gambling, alcohol sales, and certain social media services. The need is hardly disputed: in a digital world, it's legitimate to shield minors from harmful content. The Digital Services Act (DSA) already obligates large platforms to take protective measures, and the Commission is stepping in where compliance is lacking. A technical solution to verify age online is therefore urgently needed.

In May 2025, the European Commission launched [formal investigations into major online pornography platforms](https://ec.europa.eu/commission/presscorner/detail/en/ip_25_1339) for potentially breaching the DSA’s rules on protecting minors. Specifically, the Commission suspects that these platforms may not have effective age verification systems in place, allowing minors to access explicit content too easily. These investigations mark the first enforcement steps of this kind under the DSA, sending a strong signal that the EU intends to hold Very Large Online Platforms (VLOPs) accountable. In announcing the probes, the Commission also referenced its ongoing work on a temporary age verification solution. This tool, they noted, could help platforms meet their obligations while respecting users’ privacy and avoiding repeated identity checks.

The proposed app—a sort of mini European Digital Identity (EUDI) wallet—will allow users, starting in July 2025, to prove their age without repeatedly uploading ID documents. After installation, users verify their age once (e.g., through a passport scan, bank app, or eID login). From then on, the app can inform websites whether a user is over 18 without revealing personal data, according to the Commission. This temporary solution is meant to bridge the gap until the full rollout of EUDI wallets expected at the end of 2026. The initiative is commendable: making the internet safer for minors while providing adults with a digital tool to prove age quickly and privately. Yet the implementation raises key concerns—especially in the realm of privacy.

## A heavy tender favors large players
To build the age verification app, the Commission launched a [public tender](https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/opportunities/tender-details/ae950883-112f-4139-989e-1c8d794bb77a-CN) in October (with a deadline in mid-November 2024). The requirements were steep: only large entities or consortia with over substantial revenue, multiple large projects in their portfolio, and a stack of certifications were eligible. The winning team also had to include a privacy lawyer with at least seven years of experience, among others. This effectively excluded privacy-focused innovators—such as Yivi, the Dutch privacy-by-design identity wallet—from competing. Despite an attempt to qualify, Yivi could not meet the legal and bureaucratic criteria within the short timeframe. Ultimately, the contract went to a consortium of T-Systems and Scytales (“T-Scy”), who are delivering a white-label app.

While the Commission's choice of a well-established vendor is understandable from a risk-management perspective, it comes at a cost. In its requirements, the tender explicitly asked for experience with selective disclosure and zero-knowledge proofs (ZKPs)—advanced techniques to verify attributes (like age) without exposing identities. Solutions like Yivi are built around these principles. Yet their lack of size and formal certifications ruled them out in advance. The result: a conservative implementation that checks the technical boxes, but fails to raise the bar on privacy.

## A first look at the App
!!Describe that we took a first look at the developed Android application. 

:::warning
> !!Describe that The iOS App has not been developed or is not open sourced yet.
:::

### Technical
!!It reuses EU Digital Identity Wallet componenets such as the
- [EUDIW Wallet Core](https://github.com/eu-digital-identity-wallet/eudi-lib-android-wallet-core)
- [EUDIW Issuer](https://github.com/eu-digital-identity-wallet/eudi-srv-web-issuing-eudiw-py)
- [EUDIW Verifier](https://github.com/eu-digital-identity-wallet/eudi-web-verifier)


!!This android app is forked from EUDI Android Wallet reference application. 
https://github.com/eu-digital-identity-wallet/eudi-app-android-wallet-ui

!!As Yivi is adopting industry standards to comply with EUDI-Wallet standards we have tried to interop with the EU Digital Identity Wallet componenets, including the issuer and verifier software. We had a bad experiences with the stability and maturity of these software components, because its such a layered approach with several components written in various programming languages and evolving specification the EUDI-Wallet components barely interop with eachother. Each subproject is in a different stage.

!!Android support from Android API level 28 / Android 9 (August 2018)
!!Old implemetations of specs, such as: OpenID4VP draft 23 - presentation exchange doesn't exist anymore is replaced with DCQL.
!!Its far from a production state.

### Requesting a Proof of Age
!! There are goign to be several age attestation providers, with different level of assurances. These are very memberstate specific. The app does not support Document-Based Verification yet. There is not noation eID scheme (In the Netherlands) yet. So the only way is existing databases with the use of DigiD or KYC processes of banks or mobile networks. 

!! In the Netherlands and across Europe Yivi can be used instead of this App because we have all the workings in place. We even have a

> The user requests a Proof of Age from a designated issuer (Age Attestation Provider), which will issue it after verifying the user’s identity at a level of assurance equivalent to "substantial" or "high" pursuant to Commission Implementing Regulation (EU) 2015/1502 through the following methods: 
> - Notified or national eID schemes
> - Leveraging existing databases: Identity verification is conducted through recognised and well-established processes already in use for > personal identification under national or Union law, such as National identity providers covering the level of assurance.
> - Know Your Customer (KYC) procedures employed by banks or the identity verification methods used for issuing SIM cards by Mobile Network Operators.
> - Document-Based Verification: Confirming the user’s age using official identification documents such as electronic ID cards, passports, or other government-issued credentials. The link between the document and the user should be verified.

https://github.com/eu-digital-identity-wallet/av-doc-technical-specification/blob/main/docs/architecture-and-technical-specifications.md#231-activation-of-the-app

### UX
!! German and English only.
!! UX is very minimalistic, looks really bad.

## Whitelabel implementation by Memberstates and Age Verification App Providers
!! Memberstates have to bring it to production, but are already struggling with the EUDI-wallet timelines.
!! Who are the Age Verification App Providers they are talking about? Why is this not Yivi? 

> The Age Verification application will be delivered as a white label application, that can be adapted to national requirements, such as branding. Member States and other Age Verification App Providers will extend to make the solution full in production, deploy, publish and operate the Age Verification solution including the mobile applications and the back-end services.
https://github.com/eu-digital-identity-wallet/av-doc-technical-specification/blob/main/docs/architecture-and-technical-specifications.md#31-white-label-application

### A missed opportunity for privacy by design
[The developed Android application](https://github.com/eu-digital-identity-wallet/av-app-android-wallet-ui) does not use Zero-Knowledge Proofs, despite being mentioned in the tender as a specification. Instead, it falls back on more conventional mechanisms like hashed attributes and batch issuance—where age attestations are issued in large batches to reduce traceability. This may provide some unlinkability, but it’s far from the level of privacy that ZKPs offer.

And that’s a missed opportunity. The EU presents itself as a global leader in privacy—think of the GDPR—and the new eIDAS 2.0 regulation explicitly mandates selective data disclosure and unlinkability as foundational principles. In public debates on digital rights, there is growing concern over surveillance. The age verification app could have been a flagship example of how the EU protects children without undermining civil liberties. Unfortunately, in its current form, it falls short of that ambition.

[A group of cryptographers who analyzed](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/issues/200) the underlying cryptografy of the EUDI-wallet specifications concluded that the design choices do not meet the privacy standards set by the EU itself, and recommended a major overhaul. Their verdict: hashed attribute mechanisms are insufficient to meet the legal and ethical standards embedded in eIDAS 2.0. The technology exists to do better—so why settle for less?

## Yivi: A Privacy-First European Alternative
This is where Yivi enters the picture. Yivi is an open-source identity wallet developed in the Netherlands. It’s already capable of issuing and verifying selective attributes like "age over 18" based on the user’s control. Yivi supports issuer and relying party unlinkability, selective disclosure, and user consent by design. In short, it's a working proof that privacy and utility can coexist.

!!Yivi is also actively preparing for EUDI-wallet interoperability. It aims to support emerging standards while preserving its privacy-by-default philosophy. That’s exactly the kind of crypto-agile architecture the EU should be promoting. 

!!The argument of not using ZKP identity schemes is often based on the secure hardware discussion, but with "substantial" level of assurances this argument does not hold up anymore. Also the mentoined providers of the Proof of Age verification are not bound to use HSM's at all. 

Rather than sidelining such innovation, the EU should engage and integrate these ideas during the next development phases. Let this “temporary” app be a learning platform—not the final form. Involve developers, privacy watchdogs, and user representatives early. Evaluate usability, fix real-world challenges (e.g., sharing of age credentials among teens), and evolve the system based on that feedback. Only then can we build a solution that inspires confidence rather than skepticism.

## Looking Ahead: You have to get it right
By 2026, the full EUDI wallet will be rolled out across Europe. Age verification will likely be the first public-facing use case. That makes it even more crucial to get it right. A poorly implemented system could fuel backlash and erode public trust in digital identity.

Policymakers must find the right balance between protecting minors and safeguarding civil liberties. That balance requires treating privacy not as a checkbox, but as a non-negotiable principle. Europe already made this choice on paper—now it must live up to it in practice. The current app is a step forward, but we can and should be more ambitious.

A positive but critical recommendation: use this pilot to upgrade privacy capabilities as soon as possible. Recognize the pioneers like Yivi, who’ve paved the way. Invest in anonymous, secure age verification that respects European values. That way, we can protect our children without betraying our principles—and build a digital Europe we’re proud of.