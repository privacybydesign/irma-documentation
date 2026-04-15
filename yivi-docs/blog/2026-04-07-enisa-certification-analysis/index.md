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

Strong governance and certification are essential for digital identity infrastructure. Citizens need assurance that their identity wallets meet rigorous security standards. However, our analysis of the [Draft Candidate EUDIW and Security Requirements](https://certification.enisa.europa.eu/publications/draft-candidate-eudiw-scheme-v04614-public-review_en) documents reveals several requirements that conflict with open source principles, user privacy, and other EU legislation.

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

## Platform attestation: ENISA leaves room, member states diverge

Platform attestation is a mechanism to verify that a wallet app runs on a trustworthy device. The goal is to prevent scenarios where an attacker uses a compromised or emulated device to extract cryptographic keys or manipulate wallet operations. ENISA's objective is straightforward: ensure the device environment provides adequate protection for the wallet's critical assets, particularly private keys used for authentication and signing.

How this goal is achieved, however, varies significantly between what ENISA requires and what some member states implement.

### ENISA's balanced approach

The ENISA Security Requirements take a technology-neutral stance on platform integrity:

> WIN-8.4.3-Sec-05: All wallet instance variants shall validate the integrity of the platform.

> Note: This requirement may be refined further. For instance, CEN TS 18098 adds in section .2.3.2.2.3.2 that at least the bootloader should be checked, as well as checking whether or not the device has been rooted or jailbroken. Some of these checks may also need to rely on other mechanisms and **may be performed by the wallet provider** when assessing the suitability of the user device.

This is sensible: ENISA defines the security goal (platform integrity validation) without mandating a specific technology. The phrase "may be performed by the wallet provider" explicitly allows wallet providers to implement their own verification mechanisms.

### The technical landscape: Multiple paths to compliance

On Android, there are two fundamentally different attestation mechanisms:

| Mechanism | Provider | What it proves | Alternative OS support |
|-----------|----------|----------------|------------------------|
| **[Android Key Attestation](https://developer.android.com/privacy-and-security/security-key-attestation)** | Android (AOSP) | Keys are hardware-protected (TEE/StrongBox) | Full support |
| **[Play Integrity API](https://developer.android.com/google/play/integrity)** | Google (proprietary) | Device meets Google's criteria | Limited* |

*GrapheneOS passes `MEETS_BASIC_INTEGRITY` but not `MEETS_STRONG_INTEGRITY`.

Both mechanisms can satisfy ENISA's requirement, but with different trade-offs:

**Android Key Attestation** proves cryptographic keys are protected by secure hardware. It's part of the Android Open Source Project and works on any device with a TEE or StrongBox, including GrapheneOS and other alternative distributions.

**Play Integrity** is Google's proprietary service that assesses whether a device meets their criteria. The highest level (`MEETS_STRONG_INTEGRITY`) requires OEM key registration with Google, which alternative operating systems cannot obtain.

### Member state choices: Germany vs. the Netherlands

How member states interpret ENISA's requirements varies significantly:

**Germany** has chosen a restrictive path. Their [EUDI Wallet documentation](https://bmi.usercontent.opencode.de/eudi-wallet/wallet-development-documentation-public/latest/architecture-concept/06-mobile-devices/02-mdvm/) explicitly requires `MEETS_STRONG_INTEGRITY`:

> The specification mandates checking for `MEETS_STRONG_INTEGRITY`... This verdict addresses threats including rooting, custom ROMs, app tampering, and downgrade attacks.

This choice excludes users of privacy-focused operating systems like GrapheneOS, LineageOS, /e/OS, and CalyxOS. The [community response](https://news.ycombinator.com/item?id=47644406) raised concerns about depending on American corporations for government services.

**The Netherlands** has not yet published final technical requirements, leaving room for a more inclusive approach. Dutch banking apps and government services generally work on GrapheneOS with Play Services, suggesting a precedent for accepting `MEETS_BASIC_INTEGRITY` or alternative attestation methods.

### The choice matters

Member states choosing Play Integrity's highest level create dependencies worth considering:

| Factor | Play Integrity (STRONG) | Hardware Key Attestation |
|--------|-------------------------|--------------------------|
| **Provider** | Google (US corporation) | Device hardware (AOSP standard) |
| **Alternative OS support** | No | Yes |
| **Requires Play Services** | Yes | No |
| **Proves hardware security** | Indirectly | Directly |
| **F-Droid/sideload compatible** | No | Yes |

Hardware key attestation directly proves what matters for wallet security: that cryptographic keys are protected by secure hardware. Play Integrity provides broader device assessment but at the cost of excluding privacy-conscious users and creating foreign dependencies.

### GrapheneOS: A case study

GrapheneOS deserves special mention. It's a security-hardened Android distribution [recommended by security professionals](https://grapheneos.org/features) that:

- Passes Android's standard key attestation (keys are hardware-protected)
- Includes additional security hardening beyond stock Android
- Is used by journalists, activists, and security researchers

Excluding GrapheneOS users from EUDI Wallets would be ironic: the most security-conscious citizens would be locked out of government digital identity services.

GrapheneOS [documents](https://grapheneos.org/articles/attestation-compatibility-guide) how wallet providers can verify their key attestation. The technical path exists; it requires member states and wallet providers to choose it.

:::tip[Yivi's approach]
Yivi follows ENISA's technology-neutral spirit. We use hardware key attestation (Secure Enclave on iOS, StrongBox/Hardware-Backed Keystore on Android) to prove keys are hardware-protected. This approach satisfies ENISA's security requirements while supporting GrapheneOS and other alternative distributions. Citizens shouldn't have to choose between privacy-respecting software and access to digital identity.
:::

## Device telemetry: Security monitoring vs. privacy

To detect compromised devices and respond to security incidents, ENISA requires wallet providers to collect information about the devices running their wallet instances. The rationale is sound: understanding the security posture of deployed wallets helps identify vulnerabilities, detect attacks, and maintain ecosystem integrity.

However, the scope of mandated data collection raises questions about proportionality and creates tension with EU privacy legislation.

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

## Root and jailbreak detection: A nuanced security question

Root and jailbreak detection aims to identify devices where the operating system's security model has been modified. ENISA includes this as a monitoring requirement because rooted devices have a larger software attack surface. However, the relationship between root status and actual security is more complex than a simple binary check suggests.

### The requirement

> WSU-9.1-23: Information that should be monitored includes... 1) detection of device rooting/jailbreaking

### ENISA's legitimate concern

ENISA's threat model references "high attack potential" adversaries (from eIDAS CIR 2015/1502). The concern is real:

| Threat | Description | Why root matters |
|--------|-------------|------------------|
| **TR127** | Malware accessing wallet data | Root access bypasses app sandboxing |
| **TR125** | Attacker replacing wallet keys | Elevated privileges enable key manipulation |
| **TR126** | Attacker modifying/destroying keys | Root access to filesystem |

On a rooted device, an attacker or malware with root privileges can bypass Android's application sandbox. In theory, this could allow access to secrets stored in application memory or local storage.

This is a legitimate security consideration. ENISA isn't wrong to flag it.

### The nuance: Hardware protection is the actual mitigation

Here's where it gets interesting. ENISA's own recommended mitigation for these threats is:

> "Private key in device hardware such as TEE, Secure Enclave (or comparable)"

When cryptographic keys are stored in hardware security modules (Secure Enclave, StrongBox, TEE), **root access doesn't help extract them**. The hardware is designed to protect keys even from a compromised operating system. That's the entire point of hardware security.

So we have two layers:
1. **Hardware key protection** - Actually prevents key extraction, even with root
2. **Root detection** - A heuristic that the device *might* be compromised

### Root detection as a signal, not a gate

The question isn't whether root detection has value, it's how it should be used:

| Approach | Pros | Cons |
|----------|------|------|
| **Hard block** | Simple to implement | Excludes legitimate users, bypassed by sophisticated attackers |
| **Risk signal** | Allows nuanced decisions | Requires more complex risk assessment |
| **Combined with hardware attestation** | Best of both worlds | Requires wallet providers to implement properly |

A rooted device with hardware-protected keys and GrapheneOS may be *more secure* than an unrooted device running outdated stock Android with keys in software storage. Binary root detection can't distinguish these cases.

### The practical reality

Root detection has limitations:

- **Sophisticated attackers bypass it** - Tools like Magisk Hide exist specifically for this
- **It's a cat-and-mouse game** - Detection methods are constantly circumvented
- **False positives exist** - Some legitimate configurations trigger detection

Meanwhile, hardware key attestation provides cryptographic proof that keys are protected, regardless of OS state. It's a stronger guarantee than root detection.

### A balanced approach

We're not arguing that root status is irrelevant. A reasonable approach might be:

1. **Require hardware key protection** - This is the actual security mechanism
2. **Use root detection as one risk signal** - Among device health, patch level, etc.
3. **Allow wallet providers flexibility** - To make risk-based decisions rather than binary blocks
4. **Don't exclude security-hardened alternatives** - GrapheneOS with hardware attestation should pass

ENISA's requirements actually allow this interpretation. The requirement says "monitor" root status, not "block rooted devices." Member states and wallet providers choosing hard blocks go beyond what ENISA requires.

## WUA/WIA attestation architecture

Wallet Unit Attestations (WUA) and Wallet Instance Attestations (WIA) are cryptographic certificates that prove a wallet's authenticity and security properties to relying parties. They're essential for establishing trust in the ecosystem. However, their design creates architectural dependencies that have implications for user autonomy and privacy.

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

Large specification documents developed by multiple working groups sometimes contain requirements that pull in opposite directions. The ENISA certification requirements are no exception. Several provisions create tensions that implementers will need to navigate.

The requirements contain several internal tensions:

| Privacy Requirement | Contradicting Requirement |
|---------------------|---------------------------|
| WSU-9.2-07: WUA must not enable tracking | WSU-9.1-22: Collect unique device identifiers |
| Anti-surveillance threats (TR39, TR61, TR84) | Mandatory telemetry collection |
| User control of data | Root detection and device lockout |
| Threat: "Authorities can ask user to show all wallet data" (TR61) | No technical measures against coerced disclosure |

These contradictions suggest the requirements were developed by different working groups without sufficient integration.

## Recommendations

The issues identified above are not insurmountable. With targeted refinements, the certification framework can achieve its security objectives while remaining compatible with open source development, user privacy, and alternative platforms.

We propose the following refinements:

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
