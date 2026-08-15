---
slug: 2025-arf-1-5
title: First look at the Architecture Reference Framework 1.5
authors: [dibranmulder]
tags: [yivi, arf, eudi-wallet]
---

import DocusaurusImageUrl from '@site/static/img/arf-trust-model-1-5.png';

## Introduction

On the 4th of February 2025, version 1.5 of the Architecture Reference Framework (ARF), a crucial document guiding the development and implementation of the European Digital Identity Framework, was released. Given its significance, we conducted an initial review to assess the impact of the changes, particularly in relation to Yivi’s implementation and alignment with the evolving EUDI Wallet ecosystem.

The changes from ARF 1.4 to ARF 1.5 are substantial, introducing new concepts and refining existing ones. Additionally, the list of topics planned for the next version is extensive, covering various key aspects of interoperability, privacy, and security. Looking further ahead, ARF 2.0 is expected to introduce major architectural shifts, likely setting the stage for more definitive long-term structures within the ecosystem.

At Yivi, we are closely following the developments of the ARF and the broader EUDI Wallet ecosystem, ensuring that our roadmap remains aligned with emerging standards and regulatory requirements.

<!-- truncate -->

## ARF 1.5 - Chapter by chapter review
In this section, we will examine specific chapters of the Architecture Reference Framework (ARF) 1.5 and interpret them in the context of Yivi. Our goal is to highlight key changes, assess their impact, and explore how they align with Yivi’s principles of privacy-preserving authentication and interoperability within the EUDI Wallet ecosystem.

Each chapter introduces refinements and new considerations that could shape Yivi’s implementation strategy. By reviewing these sections in detail, we aim to provide insights into the evolving framework and identify areas where Yivi can contribute to and benefit from the broader architectural developments.

### 1.5 Scope
`Section 1.5 Scope` reinforces the role of the EUDI Wallet ecosystem within the broader European Digital Identity Regulation. The document references key implementing acts that formalize various aspects of interoperability, security, and privacy. Vice versa the implementing acts mentioned reference the ARF strengthening the legal status of the Architecure Refence Framework. The following implementing acts are referenced:

> Section 1.5 Scope
> - [CIR 2024/2977](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R2977) - regarding PID and EAA
> - [CIR 2024/2979](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=OJ:L_202402979) - regarding integrity and core functionalities
> - [CIR 2024/2980](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=OJ:L_202402980) - regarding ecosystem notifications
> - [CIR 2024/2981](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=OJ:L_202402981) - regarding certification of Wallet Solutions
> - [CIR 2024/2982](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=OJ:L_202402982) - regarding protocols and interfaces.

### 1.6 Additional topics
`Section 1.6 Additional topics` is a new chapter in the ARF. It introduces a range of additional topics that are still under discussion. The outcomes of these discussions could significantly influence future iterations of the framework. While several topics have been identified, Yivi is particularly focused on those that align with its core principles of privacy, security, and user-centric identity management. Below, we delve briefly into the key areas that are of interest to Yivi and explore their potential implications.

> 1. The use of pseudonyms.
> 1. Zero Knowledge Proofs (ZKP)
> 1. Wallet-to-Wallet interactions,
> 1. The EUDI Wallet Trust Mark

### 2.3 Attribute Exchange Mechanism using Attestations
`Section 2.3 Attribute Exchange Mechanism using Attestations` is a key update. It's the introduction of data portability rights within the European Digital Identity Wallet (EUDI Wallet) framework. In previous versions, users were primarily able to store and manage their attributes and attestations. However, the latest changes in Section 2.3 now explicitly state that users can **backup** their attributes, attestations, and configurations.

:::tip[Yivi impact]
This is a significant additional requirement for Wallet providers, additionally it raises research questions like how to deal with the device binding of attestations.
:::

### 2.5.3 Other use cases
`Section 2.5.3 Other use cases` introduces a new use case for an Electronic Health Insurance Card (EHIC), highlighting the expansion of the EUDI Wallet’s scope into healthcare and insurance related identity verification.

> Section 2.5.3.5 Social Security: 
> Electronic Health Insurance Card (“EHIC”) This is a free card that provides every citizen with access to medically necessary government-provided healthcare during a temporary stay in one of the 27 EU countries, Iceland, Liechtenstein, Norway, and Switzerland, under the same conditions and at the same cost (free in some countries) as persons insured in that country. This includes, for example, services related to chronic or existing illnesses, as well as in connection with pregnancy and childbirth.

### 3.1 EUDI wallet ecosystem - Introduction
<div class="center-container">
    <img src="/img/arf-ecosystem-1-5.png" alt="EUDI wallet ecosystem" />
</div>
`Section 3.1 EUDI wallet ecosystem - Introduction` of the ARF 1.5 introduces refinements to the EUDI Wallet ecosystem, clarifying the roles and responsibilities of its key stakeholders. While much of the ecosystem structure remains consistent with previous versions, the most significant change is the introduction of Access Certificate Authorities.

Access Certificate Authorities are now explicitly defined as trusted entities responsible for issuing access certificates to key participants in the EUDI Wallet ecosystem, including:
- PID Providers
- QEAA Providers
- PuB-EAA Providers
- Non-qualified EAA Providers
- Relying Parties

:::tip[Yivi impact]
The distinction between Trusted List Providers (TLP) and Access Certificate Authorities (ACA) makes it so that the role can be carried out by different parties and systems. Allowing for non-trusted and trusted TLP's and ACA's to be used in the same Wallet instance.
:::

### 3.5 Trusted List Provider
`Section 3.5 Trusted List Provider` now explicitly states that there may be Trusted Lists and Trusted List Providers for non-qualified EAA Providers, allowing interplay between qualified and non-qualified EUDI-wallet Trust schemes.

> Note: Trusted Lists and Trusted List Providers may also exist for non-qualified EAA Providers, but this is out of scope of the ARF.

:::tip[Yivi impact]
This ensures that we can keep our own trust scheme next to the EUDI-Wallet Trust models. 
:::

### 3.17 Access Certificate Authorities
`Section 3.17 Access Certificate Authorities` introduces the role of `Access Certificate Authority`. It's separated from the Trusted List Provider role. The Trust model described in `Section 6` also states that it operated by the Member State. We interpret this in such as way that existing infrastructure such as PKIo can be used for this.

> 6.1 Scope: This conceptual trust model may be implemented with slight variations across Member States, such as adopting one or multiple Certification Authorities or leveraging existing entities that already fulfill this role.

:::tip[Yivi impact]
We are most likely going to deal with an existing Dutch governmental organizations such as RDI for Access certificates.
:::

### 6 Trust model
<div class="center-container">
    <img src="/img/arf-trust-model-1-5.png" alt="EUDI wallet ecosystem" />
</div>
`Section 6.1 Scope` explicitly states that the Wallet Provider TLP, PID Provider TLP, Attestation Provider TLP and the Relying Party Registrar are the responsibility of Member States and are no longer considered to be the same across EUDI-wallets.

:::tip[Yivi impact]
Having an EUDI-wallet available in multiple Member states becomes harder. This leaves more room for local wallet initiatives. 
:::

### 6.5.3 Wallet Unit activation
`Section 6.5.3 Wallet Unit activation` outlines the activation process for a Wallet Unit, detailing the responsibilities of Wallet Providers like Yivi. It introduces mechanisms to ensure that users do not install or use fraudulent wallet applications. The authentication process ensures that both the Wallet Provider and Wallet Instance verify each other's authenticity.

> Section 6.5.3.1
> 1. The EUDI Wallet Instance authenticates the EUDI Wallet Provider, meaning that the instance is sure that it is dealing with the genuine Wallet Provider who provided it to the User. 
> 2. The EUDI Wallet Provider authenticates the EUDI Wallet Instance. This means that the EUDI Wallet Provider is sure that the instance is indeed a true instance of their EUDI Wallet Solution, and not a fake app.
> Both of these trust relationships are the responsibility of the Wallet Provider. The ARF does not specify how these trust relationships can be satisfied.

Upon installation, a Wallet Unit is in the `Installed` state and requires activation to become operational. During activation, the Wallet Provider issues a Wallet Unit Attestation (WUA) to the Wallet Unit. The WUA serves multiple purposes:

1. Describing Capabilities and Properties: It details the features of the Wallet Unit, including the Wallet Instance, the user's device, and the secure cryptographic devices (WSCDs) used. This information allows PID Providers or Attestation Providers to verify that the Wallet Unit meets their requirements and is suitable for receiving a PID or attestation.
1. Providing a Public Key: The WUA contains a public key associated with the Wallet Unit. During the issuance of a PID or attestation, providers can use this public key to verify that the Wallet Unit possesses the corresponding private key, ensuring the authenticity of the Wallet Unit.
1. Including Revocation Information: If the WUA is valid for 24 hours or longer, it includes data that allows PID Providers, Attestation Providers, or Relying Parties to verify whether the WUA has been revoked by the Wallet Provider, thereby confirming the current validity of the Wallet Unit.

After activation, the Wallet Unit transitions to the `Operational` state, during which the user and Wallet Provider can manage the Wallet Unit. In this state, the user can request the issuance of PIDs or various attestations and present attributes to Relying Parties. The Wallet Provider is responsible for updating the Wallet Unit, revoking it if necessary (e.g., at the user's request or if security is compromised), and ensuring that the risk of malicious Relying Parties linking multiple presentations of the same WUA to track the user is minimized.

:::tip[Yivi impact]
Although Wallet Instance activation was already part of ARF 1.4 Section 6.5.3, The Wallet Unit Activation in ARF 1.5 is a significant refinement and has quite some impact on Wallet Providers.
:::

### 6.6.3.3 Wallet Unit allows User to verify that Relying Party does not request more attributes than it registered
`Section 6.6.3.3 Wallet Unit allows User to verify that Relying Party does not request more attributes than it registered` introduces arguably one of the most anticipated features namely Relying Party attribute registration. It states that Relying parties must specify which attributes they request users to disclose and to which purpose, this will be administered in the Relying Party Registrar.

> [ANEX 2 - Topic 6](https://eu-digital-identity-wallet.github.io/eudi-doc-architecture-and-reference-framework/latest/annexes/annex-2/annex-2-high-level-requirements/#a236-topic-6-relying-party-authentication-and-user-approval)
A Relying Party SHOULD communicate in the request which attributes are needed for which purpose (use case, service), if this is supported by the protocol used for communication with the Wallet Unit. Notes: - This could be done, for instance, by grouping the attributes and describing the use case, service, or purpose of each group. - The purpose of this recommendation is that a Relying Party makes clear to the User what the intended use, the service being accessed, or the specific purpose is of each requested attribute. 

:::tip[Yivi impact]
Yivi's Trusted Verifier/Pretty Verifier roadmap is aligned with Relying Party attribute registration, this is a much needed change to protect users from disclosing too much information.
:::

### 7.4.3.5 Risks and mitigation measures related to User privacy
`Section 7.4.3.5 Risks and mitigation measures related to User privacy` identifies the risks stated in the [Cryptographers' Feedback on the EU Digital Identity’s ARF](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/issues/200) and which we fully subscribe too. It mentions major privacy features which the current ARF lacks, namely:
- Attestation Provider linkability.
- Relying Party linkability

> Section 7.4.3.5:
> One key area of development is age verification, where the European Commission is actively exploring and testing ZKP-based solutions. The outcomes of this initiative could pave the way for the adoption of ZKPs within the EUDI Wallet ecosystem, further strengthening privacy protections in future implementations.

The ARF notes that ZKP-based solutions are under evaluation, and we believe this work is primarily occurring within the framework of the following tender: [Development, Consultancy and Support for an Age Verification Solution EC-CNECT/2024/OP/0073](https://digital-strategy.ec.europa.eu/en/funding/call-tenders-development-consultancy-and-support-age-verification-solution)

Yivi attempted to participate in this tender but was unable to form a viable consortium within the short timeframe.

:::tip[Yivi impact]
Yivi subscribes to the risks and is closely following development regarding the tender and anticipated changes for ARF 2.0
:::

## Conclusion
The changes introduced in ARF 1.5 significantly improve security, interoperability, and regulatory clarity for the EUDI Wallet ecosystem. However, critical privacy concerns remain, particularly regarding linkability risks, which we think must be addressed in subsequent versions.

This first analysis is not exhaustive, and further review may uncover additional gaps or areas of concern. As ARF 2.0 is being prepared, it is crucial that privacy remains a key focus.

Yivi remains committed to aligning with EUDI Wallet standards while continuing to innovate in privacy-preserving digital identity solutions, ensuring compliance without compromising user privacy.
