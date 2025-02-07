---
slug: 2025-arf-1-5
title: First look at the Architecture Reference Framework 1.5
authors: [dibranmulder]
tags: [yivi, arf, eudi-wallet]
---

## Introduction

Three days ago, version 1.5 of the Architecture Reference Framework (ARF), a crucial document guiding the development and implementation of the European Digital Identity Framework. Given its significance, we conducted an initial review to assess the impact of the changes, particularly in relation to Yivi’s implementation and alignment with the evolving EUDI Wallet ecosystem.

The changes from ARF 1.4 to ARF 1.5 are substantial, introducing new concepts and refining existing ones. Additionally, the list of topics planned for next version is extensive, covering various key aspects of interoperability, privacy, and security. Looking further ahead, ARF 2.0 is expected to introduce major architectural shifts, likely setting the stage for more definitive long-term structures within the ecosystem.

At Yivi, we are closely following the developments of the ARF and the broader EUDI Wallet ecosystem, ensuring that our roadmap remains aligned with emerging standards and regulatory requirements.

<!-- truncate -->

## ARF 1.5 - Chapter review

### 1.5 Scope
ARF 1.5 reinforces the role of the EUDI Wallet ecosystem within the broader European Digital Identity Regulation. The document references key implementing acts that formalize various aspects of interoperability, security, and privacy. Vice versa the implementic acts mentoined reference the ARF strengthening the legal status of the Architecure Refence Framework. The following implementing acts are referenced:

- [CIR 2024/2977](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R2977) - regarding PID and EAA
- [(CIR 2024/2979](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=OJ:L_202402979) - regarding integrity and core functionalities
- [CIR 2024/2980](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=OJ:L_202402980) - regarding ecosystem notifications
- [CIR 2024/2981](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=OJ:L_202402981) - regarding certification of Wallet Solutions
- [CIR 2024/2982](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=OJ:L_202402982) - regarding protocols and interfaces.

### 1.6 Additional topics
A list of additional topics for future exploration has been published in ARF 1.5. Among the many areas identified, Yivi is particularly interested in the development of the following topics:

> 1. Privacy risks and mitigations,
> 1. The use of pseudonyms.
> 1. Zero Knowledge Proofs (ZKP)
> 1. Wallet-to-Wallet interactions,
> 1. The EUDI Wallet Trust Mark

### 2.3 Attribute Exchange Mechanism using Attestations
Talks about:
Backup a list of their attributes, attestations, and configurations, guaranteeing compliance with data portability rights.

### 2.5.3
A new use case for an Electronic Health Insurance Card (EHIC) has been introduced, highlighting the expansion of the EUDI Wallet’s scope into healthcare and insurance related identity verification.

> Electronic Health Insurance Card (“EHIC”) This is a free card that provides every citizen with access to medically necessary government-provided healthcare during a temporary stay in one of the 27 EU countries, Iceland, Liechtenstein, Norway, and Switzerland, under the same conditions and at the same cost (free in some countries) as persons insured in that country. This includes, for example, services related to chronic or existing illnesses, as well as in connection with pregnancy and childbirth.

### 3.1 EUDI wallet ecosystem - Introduction

<div class="center-container">
    <img src="/img/arf-ecosystem-1-5.png" class="mm" alt="EUDI wallet ecosystem" />
</div>

### 3.5 Trusted List Provider
Trusted Lists and Trusted List Providers may also exist for non-qualified EAA Providers, but this is out of scope of the ARF.

### 3.17 Access Certificate Authorities
Access Certificate Authority is separated from the Trusted List Provider.

> 6.1 Scope: This conceptual trust model may be implemented with slight variations across Member States, such as adopting one or multiple Certification Authorities or leveraging existing entities that already fulfill this role.

### 4.4 Data presentation flows have been added
Making distictions between: Proximity Supervised Flow, Proximity Unsupervised Flow, Remote Same-Device Flow, Remote Cross-Device Flow.

## 6 Trust model
<div class="center-container">
    <img src="/img/arf-trust-model-1-5.png" class="mm" alt="EUDI wallet ecosystem" />
</div>
Explicitly states that the Wallet Provider Trusted List Provider and the Relying Party Registrar are being taken care of by Member States. 

## 6.4.2 Relying Party registration

## 6.5.3 Wallet Unit activation
This section introduces mechanisms to ensure that users do not install or use fraudulent wallet applications. The authentication process ensures that both the Wallet Provider and Wallet Instance verify each other's authenticity.

> The EUDI Wallet Instance authenticates the EUDI Wallet Provider, meaning that the instance is sure that it is dealing with the genuine Wallet Provider who provided it to the User.
The EUDI Wallet Provider authenticates the EUDI Wallet Instance. This means that the EUDI Wallet Provider is sure that the instance is indeed a true instance of their EUDI Wallet Solution, and not a fake app.
Both of these trust relationships are the responsibility of the Wallet Provider. The ARF does not specify how these trust relationships can be satisfied.

## 6.6.3.3 Wallet Unit allows User to verify that Relying Party does not request more attributes than it registered
In the Access Certifcate Authority should have a relying party registrar in which also is stated with attributes may be requested by the relying party and to which purpose. 

https://eu-digital-identity-wallet.github.io/eudi-doc-architecture-and-reference-framework/latest/annexes/annex-2/annex-2-high-level-requirements/#a236-topic-6-relying-party-authentication-and-user-approval

> A Relying Party SHOULD communicate in the request which attributes are needed for which purpose (use case, service), if this is supported by the protocol used for communication with the Wallet Unit. Notes: - This could be done, for instance, by grouping the attributes and describing the use case, service, or purpose of each group. - The purpose of this recommendation is that a Relying Party makes clear to the User what the intended use, the service being accessed, or the specific purpose is of each requested attribute. 

## 7.4.3.5 Risks and mitigation measures related to User privacy
The ARF identifies the risks which are stated in the [Cryptographers' Feedback on the EU Digital Identity’s ARF](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/issues/200) and which we fully subscribe to, namely:
- Attestation Provider linkability.
- Relying Party linkability

> One key area of development is age verification, where the European Commission is actively exploring and testing ZKP-based solutions. The outcomes of this initiative could pave the way for the adoption of ZKPs within the EUDI Wallet ecosystem, further strengthening privacy protections in future implementations.

This exploration is most likely in the form of this tender, which we tried to register for but failed to compose a viable consortium in such a short notice. 

[Development, Consultancy and Support for an Age Verification Solution EC-CNECT/2024/OP/0073](https://digital-strategy.ec.europa.eu/en/funding/call-tenders-development-consultancy-and-support-age-verification-solution)

## Conclusion
The changes in ARF 1.5 are substantial, reinforcing security, interoperability, and regulatory clarity within the EUDI Wallet ecosystem. With an extensive list of additional topics planned for an anticipated major revision in ARF 2.0, the framework is rapidly evolving.

Yivi remains committed to following the ARF and aligning our roadmap with its requirements, ensuring compliance while continuing to innovate in privacy-preserving digital identity solutions.