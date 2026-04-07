---
slug: enisa-certification-open-source-privacy
title: "ENISA's EUDI Wallet Certification: Strong governance, but at what cost?"
authors: [dibranmulder]
tags: [eudi-wallet, certification, privacy, open-source, enisa, analysis]
---

*An analysis of the ENISA EUDI Wallet certification requirements reveals tensions between security governance, open source principles, and existing EU privacy legislation.*

<!-- truncate -->

## Introduction

The European Union Agency for Cybersecurity (ENISA) has published draft certification requirements for EUDI Wallet providers. These documents establish a comprehensive framework for ensuring wallet security, covering everything from cryptographic requirements to organizational governance.

Strong governance and certification are essential for digital identity infrastructure. Citizens need assurance that their identity wallets meet rigorous security standards. However, our analysis of the [Draft Candidate EUDIW](https://www.enisa.europa.eu/publications/cybersecurity-certification-eudiw-candidate) and [Security Requirements](https://www.enisa.europa.eu/publications/cybersecurity-certification-eudiw-security-requirements) documents reveals several requirements that conflict with open source principles, user privacy, and other EU legislation.

## The tension: security vs. openness

The ENISA requirements attempt to achieve security through multiple mechanisms. Some are well-established best practices: cryptographic standards, key management, organizational security controls. Others, however, rely on assumptions that conflict with open source development and user privacy.

### Code obfuscation is obsolete

Section 8.4.3 of the Security Requirements document mandates:

| Requirement | Description |
|-------------|-------------|
| WIN-8.4.3-Sec-06 | Anti-tampering mechanisms |
| WIN-8.4.3-Sec-07 | Anti-static analysis mechanisms |
| WIN-8.4.3-Sec-08 | Anti-dynamic analysis techniques |

These requirements reference the OWASP MASVS RESILIENCE controls: code obfuscation, anti-debugging measures, and runtime integrity checks. The underlying assumption is that making code difficult to read provides security.

### The AI deobfuscation reality

Whatever security benefit obfuscation once provided has evaporated with modern tooling. AI-powered coding assistants like [Claude Code](https://www.anthropic.com/claude-code), [OpenAI Codex](https://openai.com/index/openai-codex/), and open alternatives have fundamentally changed reverse engineering:

- **Deobfuscation is now trivial**: Our engineers routinely deobfuscate heavily protected banking apps within an hour using AI assistance
- **Pattern recognition at scale**: AI models trained on millions of codebases instantly recognize obfuscated patterns and reconstruct readable code
- **Automated analysis**: What once required weeks of manual effort now takes minutes with AI-assisted tooling

The obfuscation arms race is over. Any determined attacker with access to modern AI tools can reverse engineer obfuscated code faster than developers can obfuscate it.

### The Linux kernel model

If obfuscation doesn't work, what does? The answer has been proven at scale for over three decades: **open source security**.

The Linux kernel runs the world's most critical infrastructure: stock exchanges, air traffic control, nuclear submarines, and 96% of the top million web servers. Its security model is the opposite of obfuscation:

- **Complete source code transparency**: Every line is publicly auditable
- **Massive peer review**: Thousands of security researchers examine the code
- **Rapid vulnerability response**: Issues are found and fixed quickly because anyone can find them
- **No security through obscurity**: Security comes from sound design, not hidden code

The Linux kernel's track record demonstrates that open source doesn't weaken security; it strengthens it. The EU's digital identity infrastructure deserves the same approach.

### What this means for EUDI Wallets

The anti-analysis requirements create a false choice: either hide your code and pretend it's secure, or be non-compliant.

For open source wallet providers like Yivi, these requirements are impossible to satisfy meaningfully. Our source code is on GitHub. Obfuscating the compiled binary while the source remains public achieves nothing except wasted engineering effort and reduced auditability.

More importantly, these requirements push wallet providers toward closed-source development, reducing the security benefits of community review that make projects like Linux so robust.

:::tip[Yivi's approach]
Yivi embraces the Linux kernel model. Our security comes from open source collaboration and cryptographic design, not code hiding.
:::

## Platform attestation: ENISA vs. member state implementations

### What the ENISA requirements actually say

The ENISA Security Requirements document is more nuanced than often assumed:

> WIN-8.4.3-Sec-05: All wallet instance variants shall validate the integrity of the platform.

> Note: This requirement may be refined further. For instance, CEN TS 18098 adds in section .2.3.2.2.3.2 that at least the bootloader should be checked, as well as checking whether or not the device has been rooted or jailbroken. Some of these checks may also need to rely on other mechanisms and **may be performed by the wallet provider** when assessing the suitability of the user device.

Notably, the ENISA requirements do **not** explicitly mandate Google Play Integrity or Apple App Attest. They require "platform integrity validation" but leave the implementation method open.

### Key attestation vs. Play Integrity: A crucial distinction

There are two fundamentally different attestation mechanisms on Android:

| Mechanism | Provider | Works on GrapheneOS | What it proves |
|-----------|----------|---------------------|----------------|
| **[Android Key Attestation](https://developer.android.com/privacy-and-security/security-key-attestation)** | Android standard | Yes | Keys are stored in hardware (TEE/StrongBox) |
| **[Play Integrity API](https://developer.android.com/google/play/integrity)** | Google proprietary | Partially* | Device "integrity" per Google's criteria |

*GrapheneOS passes `MEETS_BASIC_INTEGRITY` but not `MEETS_STRONG_INTEGRITY`, which requires OEM key registration with Google.

Android's standard key attestation proves that cryptographic keys are protected by secure hardware. This works on GrapheneOS and other alternative Android distributions because it's based on the device's actual hardware capabilities, not Google's approval.

Play Integrity, by contrast, is Google's proprietary assessment of whether a device meets their criteria. `MEETS_STRONG_INTEGRITY` requires the OEM to register their signing keys with Google, a walled garden that alternative operating systems cannot enter.

### The German implementation: A cautionary example

While ENISA leaves room for interpretation, some member states are making restrictive choices. Germany's EUDI Wallet implementation [explicitly requires](https://bmi.usercontent.opencode.de/eudi-wallet/wallet-development-documentation-public/latest/architecture-concept/06-mobile-devices/02-mdvm/) `MEETS_STRONG_INTEGRITY`:

> The specification mandates checking for `MEETS_STRONG_INTEGRITY`... This verdict addresses threats including rooting, custom ROMs, app tampering, and downgrade attacks.

This choice effectively excludes:
- GrapheneOS users (a security-focused Android distribution recommended by security professionals)
- LineageOS, /e/OS, CalyxOS, and other privacy-respecting alternatives
- Users who exercise their right to control their own devices

The [Hacker News discussion](https://news.ycombinator.com/item?id=47644406) on this topic raised valid concerns about requiring citizens to depend on American corporations for access to government services.

### The sovereignty problem

Even if ENISA doesn't mandate it, member states choosing Play Integrity create dependencies that conflict with EU digital sovereignty goals:

| Concern | Impact |
|---------|--------|
| **Foreign control** | Google/Apple can revoke attestation at will |
| **Geopolitical risk** | US sanctions could block citizens from their identity wallet |
| **No appeal process** | Google account suspensions are notoriously difficult to reverse |
| **Tracking potential** | Attestation requests create metadata Google can observe |

### A better path: Hardware key attestation

The good news: strong security doesn't require Play Integrity. Android's standard key attestation provides cryptographic proof that keys are protected by secure hardware. This approach:

- Works on GrapheneOS and other alternative distributions
- Proves actual hardware security, not Google's approval
- Doesn't require Google Play Services
- Aligns with the ENISA requirement's actual text

GrapheneOS [documents](https://grapheneos.org/articles/attestation-compatibility-guide) how their key attestation works and how servers can verify it. Wallet providers willing to maintain their own verification can support alternative operating systems without compromising security.

:::tip[Yivi's approach]
Yivi uses hardware key attestation where available (Secure Enclave on iOS, StrongBox/Hardware-Backed Keystore on Android) without requiring Play Integrity. This allows installation via F-Droid or direct APK download while still providing cryptographic proof that keys are hardware-protected. We're committed to supporting privacy-focused operating systems like GrapheneOS.
:::

## Device telemetry: Surveillance by design

### What wallet providers must collect

Requirement WSU-9.1-22 mandates collecting extensive device information:

> 1) IP addresses of the device from which the wallet instance is running;
> 2) UX and telemetry information, for UX field analysis;
> 3) Unique device identifier such as IDFV or persisted UUID (iOS) or AndroidID (Android);
> 4) Device sensor identifiers and patch levels;
> 5) Hardware-level details about the device;
> 6) BLE and NFC support by device

Requirement WSU-9.1-23 adds monitoring requirements:

> 1) detection of device rooting/jailbreaking;
> 2) emulator detection;
> 3) device OS version and health data;
> 4) Wallet instance SDK and SW library versions

### GDPR friction

The General Data Protection Regulation (GDPR) establishes that personal data collection should be:

- **Minimized** to what is strictly necessary
- Based on a **lawful basis** (consent, legitimate interest, etc.)
- Subject to **purpose limitation**

Collecting unique device identifiers, IP addresses, and hardware fingerprints creates detailed device profiles. While the requirements mention that this should be done transparently, the scope of collection appears to exceed what's necessary for security.

| Data Point | Security Necessity | Privacy Risk |
|------------|-------------------|--------------|
| IP address | Low (changes frequently) | Geolocation tracking |
| Unique device ID | Moderate | Cross-session linking |
| Sensor identifiers | Low | Device fingerprinting |
| Hardware details | Moderate | Uniquely identifying devices |
| Root detection | Debatable | Penalizes technical users |

The security requirements document itself acknowledges privacy risks (TR39, TR84, TR85) related to tracking and linkability, yet mandates collecting data that enables exactly these threats.

:::tip[Yivi impact]
Yivi minimizes data collection. We don't require unique device identifiers for wallet operation, and our blind protocols ensure that even Yivi as the wallet provider cannot link user sessions.
:::

## Root and jailbreak detection: Who controls the device?

### The requirement

> WSU-9.1-23: Information that should be monitored includes... 1) detection of device rooting/jailbreaking

### The problem

Users have a fundamental right to control their own devices. Rooting or jailbreaking a device is:

- **Legal** in most jurisdictions
- Often done for **legitimate security purposes** (installing firewalls, removing bloatware)
- Common among **security researchers** and **privacy-conscious users**
- Sometimes **more secure** than stock configurations (e.g., GrapheneOS)

Treating rooted devices as inherently untrustworthy:

1. **Discriminates against technical users** who may have legitimate reasons
2. **Creates security theater** because root detection can be bypassed
3. **Doesn't prove actual compromise** because a rooted device with proper security may be safer than a stock device with outdated firmware

The security requirements acknowledge the threat of attackers with "high attack potential" (TR117). But root detection doesn't stop sophisticated attackers; it only inconveniences legitimate users.

## WUA/WIA attestation architecture

### Centralized control points

The Wallet Unit Attestation (WUA) and Wallet Instance Attestation (WIA) system creates dependencies on wallet provider infrastructure:

- WIAs have short lifetimes (under 24 hours per WSU-9.2-03)
- Users must regularly connect to provider infrastructure
- Providers can revoke attestations, blocking wallet use

While revocation capabilities are necessary for security, the combination of short attestation lifetimes and centralized issuance creates:

| Risk | Description |
|------|-------------|
| **No offline autonomy** | Extended offline periods (travel, rural areas) may render wallets unusable |
| **Censorship potential** | Governments could pressure providers to revoke specific users' attestations |
| **Tracking vector** | Despite privacy requirements, attestation renewal creates metadata |

### The contradiction

Requirement WSU-9.2-07 states:

> The wallet provider shall ensure that the wallet unit identifier included in the WUA does not enable tracking of the user.

Yet WSU-9.1-22 requires collecting unique device identifiers. The provider simultaneously must not track users via WUA identifiers while collecting device IDs that enable exactly such tracking.

## Internal contradictions

The requirements contain several internal tensions:

| Privacy Requirement | Contradicting Requirement |
|---------------------|---------------------------|
| WSU-9.2-07: WUA must not enable tracking | WSU-9.1-22: Collect unique device identifiers |
| Anti-surveillance threats (TR39, TR61, TR84) | Mandatory telemetry collection |
| User control of data | Root detection and device lockout |
| Threat: "Authorities can ask user to show all wallet data" (TR61) | No technical measures against coerced disclosure |

These contradictions suggest the requirements were developed by different working groups without sufficient integration.

## Recommendations

We propose the following refinements to the ENISA certification requirements:

### 1. Remove or redefine anti-analysis requirements

Replace MASVS-RESILIENCE requirements with:
- Cryptographic security requirements (key protection, signature verification)
- Hardware security requirements (use of secure enclaves where available)
- Allow compliance through cryptographic proofs rather than code obfuscation

### 2. Reduce platform attestation dependency

- Accept hardware key attestation as sufficient (proves keys are in secure hardware)
- Remove requirements that depend on Google/Apple attestation services
- Ensure compatibility with alternative Android distributions

### 3. Minimize mandatory telemetry

- Apply GDPR data minimization principle
- Limit collection to data strictly necessary for security
- Remove unique device identifier requirements unless justified

### 4. Reconsider root detection requirements

- Focus on key protection rather than platform state
- Accept that properly configured rooted devices may be secure
- Don't penalize users who exercise control over their devices

### 5. Address internal contradictions

- Reconcile privacy requirements with telemetry mandates
- Ensure consistent treatment of tracking risks
- Integrate privacy-by-design principles throughout

## Conclusion

The ENISA certification requirements establish important security baselines for EUDI Wallets. Strong governance, proper key management, and organizational security controls are essential for digital identity infrastructure that citizens can trust.

However, several aspects deserve attention:

- **Anti-analysis requirements** are obsolete in the age of AI-assisted reverse engineering and incompatible with open source development
- **Vague platform integrity requirements** leave room for member states to mandate Play Integrity, excluding privacy-focused operating systems like GrapheneOS
- **Extensive telemetry requirements** create tension with GDPR data minimization principles
- **Root detection mandates** penalize privacy-conscious users without stopping sophisticated attackers

The good news: these issues are solvable within the existing framework. ENISA's requirements don't mandate Play Integrity; they allow hardware key attestation as an alternative. Cryptographic techniques like the SECDSA architecture provide strong security guarantees without requiring code obfuscation. The path forward exists.

We encourage member states to follow the spirit of the ENISA requirements rather than defaulting to restrictive implementations that exclude privacy-conscious citizens. Hardware key attestation provides genuine security proof. Code transparency strengthens security through community review. These approaches align with both the certification requirements and the EU's broader goals of digital sovereignty and privacy protection.

Yivi remains committed to becoming a certified EUDI Wallet provider while supporting alternative operating systems like GrapheneOS. We believe strong security and open source principles are complementary, not conflicting. Citizens shouldn't have to choose between using a privacy-respecting operating system and accessing their digital identity.

---

## References

### ENISA Documents
- [Draft Candidate EUDIW Requirements](https://www.enisa.europa.eu/publications/cybersecurity-certification-eudiw-candidate)
- [EUDIW Security Requirements](https://www.enisa.europa.eu/publications/cybersecurity-certification-eudiw-security-requirements)

### EU Legislation
- [eIDAS 2.0 Regulation (EU 2024/1183)](https://eur-lex.europa.eu/eli/reg/2024/1183/oj)
- [General Data Protection Regulation (GDPR)](https://eur-lex.europa.eu/eli/reg/2016/679/oj)
- [Digital Markets Act](https://digital-markets-act.ec.europa.eu/)

### Technical References
- [SECDSA: Split-ECDSA for EUDI Wallets (Verheul, 2024)](https://eprint.iacr.org/2024/1612)
- [OWASP Mobile Application Security Verification Standard](https://mas.owasp.org/MASVS/)
- [Architecture Reference Framework 1.5](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework)

### Yivi Resources
- [Yivi EUDI Wallet Roadmap](/blog/2025-04-14-eudi-wallet-roadmap)
- [Crypto Agile Introduction](/crypto-agile-introduction)
- [OpenID4VP Support Announcement](/blog/2025-openid4vp)
