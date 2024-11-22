---
slug: vision, roadmap
title: Caesar Groep to continue development of Yivi - Our Vision and Roadmap
authors: [dibranmulder]
tags: [yivi, vision, roadmap]
---

We are excited to announce that Caesar Groep will be continuing the development of Yivi. Yivi is a groundbreaking ID-Wallet that empowers users with privacy-first, secure, and user-friendly solutions. Our mission is to build upon the excellent foundation already laid and innovate further to ensure Yivi remains at the forefront of digital identity technology.

<!-- truncate -->

Here’s what you can expect as we embark on this journey together:

# Short-Term Roadmap: Laying a Solid Foundation
We are focusing on key actions to ensure a seamless transition and operational stability:

1. Ownership and Migration of Accounts
    - We are securing ownership of all critical accounts such as GitHub, App Stores, Firebase, Sentry, and others. Migrating these systems is complex, but we’re making steady progress.
2. Secure cloud hosting
    - A new landing zone(hosting environment) is being created on the Scaleway cloud. Kubernetes is our technology off choice, we will enhance security by integrating a robust secret manager and standardize on DNS zones. Scaleways offers hosting in Amsterdam, Paris as well as Warschaw, we will start off in Amsterdam but will be ready to expand to other regions.
4. Migrating SIDN Issuers
    - The migration of SIDN issuers is underway, on our staging environment we already have the SMS and Email issuers up and running, we still have to migrate the SAML issuer for social media and educational account issuance.
5. YiviConnect Migration
    - YiviConnect, a critical component, is being migrated to ensure uninterrupted service.
6. App Update
    - We upgraded the App the all latest Flutter versions, we will pick up small UI fixes 
7. Keyshare Server Migration
    - The migration of the Keyshare server is also on our immediate agenda, ensuring continuity of secure key management.

# Mid-Term Roadmap: Innovating and Expanding Yivi’s Potential
Our long-term roadmap is driven by a commitment to innovation and usability.

## Pretty Verifier Implementation
Phased Rollout:
Initial warnings for non-verified relying parties or verifiers.
Introduction of cost per attribute, with compensation for issuers and attention to cryptographic implementation and transaction tracking.
Expansion with a self-service portal for issuing and verification, ensuring compliance with ARF standards.
Key Assumptions:
Zero-Knowledge Proofs (ZKPs) remain the ideal technology, despite limited adoption.
Idemix will likely not be part of ARF and SOG-IS standards.
Discussions around BBS+ are stagnant; alternatives will be explored.
Yivi will transition from Idemix to ECDSA or another privacy-preserving cryptographic protocol.
We will innovate with Post-Quantum Cryptography in collaboration with Radboud University.
Adoption of community standards like OpenID4VP and OpenID4VCI is a priority.
2. User Experience Enhancements
Wider Adoption through UX Improvements:
Categorization of attributes for easier navigation.
Custom reordering of attributes for flexibility.
Integration capabilities for organizations to include their branding and visual identity.
Local Partnerships:
Focus on real-world use cases, such as Stadspas, Groenekaart, and Aansluiting, to drive adoption in cities and communities.

# Long term Vision


# Our Commitment
Caesar Groep is committed to ensuring Yivi’s continued success as a trusted digital identity platform. With a clear short-term plan and a vision for the future, we aim to make Yivi indispensable for individuals, businesses, and governments.

Stay tuned for more updates as we roll out these changes and work together to shape the future of digital identity.

Let’s build a more secure and private digital world with Yivi!