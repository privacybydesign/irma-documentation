---
slug: 2025-arf-1-5
title: First look at the Architecture Reference Framework 1.5
authors: [dibranmulder]
tags: [yivi, arf, eudi-wallet]
---

## Introduction

Compose an introduction in which we say we took a first look at the ARF 1.5 released 3 days ago.

<!-- truncate -->

## 1.5 Scope
Talks about EUDI Wallet ecosystem and .European Digital Identity Regulation,
It references the according implementing acts. The implementing acts reference the architecture reference framework aswell.
Focus on interoperability, security, and privacy.

[https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R2977](CIR 2024/2977 regarding PID and EAA)
[https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=OJ:L_202402979](CIR 2024/2979 regarding integrity and core functionalities)
[https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=OJ:L_202402980](CIR 2024/2980 regarding ecosystem notifications)
[https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=OJ:L_202402981](CIR 2024/2981 regarding certification of Wallet Solutions)
[https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=OJ:L_202402982](CIR 2024/2982 regarding protocols and interfaces.)

## 1.6 Additional topics
A list of topics for future exploration and refinement is published, for Yivi the following topics amongst others are interesting:

> 1. Privacy risks and mitigations,
> 1. The use of pseudonyms.
> 1. Zero Knowledge Proofs (ZKP)
> 1. Wallet-to-Wallet interactions,
> 1. The EUDI Wallet Trust Mark

## 2.3 Attribute Exchange Mechanism using Attestations
Talks about:
Backup a list of their attributes, attestations, and configurations, guaranteeing compliance with data portability rights.

## 2.5.3
Use case Electronic Health Insurance Card (“EHIC”) has been added.


## 3.1 EUDI wallet ecosystem - Introduction

<div class="center-container">
    <img src="/img/arf-ecosystem-1-5.png" class="mm" alt="EUDI wallet ecosystem" />
</div>

## 3.5 Trusted List Provider
Trusted Lists and Trusted List Providers may also exist for non-qualified EAA Providers, but this is out of scope of the ARF.

## 3.17 Access Certificate Authorities
Access Certificate Authority is separated from the Trusted List Provider.

> 6.1 Scope: This conceptual trust model may be implemented with slight variations across Member States, such as adopting one or multiple Certification Authorities or leveraging existing entities that already fulfill this role.

## 4.4 Data presentation flows have been added
Making distictions between: Proximity Supervised Flow, Proximity Unsupervised Flow, Remote Same-Device Flow, Remote Cross-Device Flow.

## 6 Trust model
<div class="center-container">
    <img src="/img/arf-trust-model-1-5.png" class="mm" alt="EUDI wallet ecosystem" />
</div>
Explicitly states that the Wallet Provider Trusted List Provider and the Relying Party Registrar are being taken care of by Member States. 

## 6.4.2 Relying Party registration

## 6.5.3 Wallet Unit activation
Has been added to verify that a user is not using a Fake App with pretends to be an EUDI wallet.

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
