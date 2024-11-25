---
slug: vision, roadmap
title: Caesar Groep to continue development of Yivi - Our roadmap
authors: [dibranmulder]
tags: [yivi, vision, roadmap]
---

We are excited to announce that Caesar Groep will be continuing the development of Yivi. Yivi is the most privacy friendly ID-Wallet that empowers users with privacy-first, secure, and user-friendly solutions. Our mission is to build upon the excellent foundation already laid and innovate further to ensure Yivi remains at the forefront of digital identity technology.

<!-- truncate -->

Here’s what you can expect as we embark on this journey together:

## Short-Term Roadmap: Laying a Solid Foundation
We are focusing on key actions to ensure a seamless transition from SIDN to Caesar Groep with focus on operational stability.

### Ownership and Migration of Accounts
We are securing ownership of all critical accounts such as GitHub, App Stores, Firebase, Sentry, and others. Migrating these systems is complex, but we’re making steady progress.

### Secure cloud hosting
A new landing zone(hosting environment) is being created on the Scaleway cloud. Kubernetes is our technology off choice, we will enhance security by integrating a robust secret manager and standardize on DNS zones. Scaleways offers hosting in Amsterdam, Paris as well as Warschaw, we will start off in Amsterdam but we will be ready to expand to other regions. We chose Scaleway because we value European sovereignty and condemn the privacy mentality of big-tech companies.

### Migrating SIDN Issuers
The migration of SIDN issuers is underway, on our staging environment we already have the SMS and Email issuers up and running, we still have to migrate the SAML issuer for social media and educational account issuance. You can test our staging scheme using:
- https://schemes.staging.yivi.app/pbdf-staging/description.xml
- https://emailissuer.staging.yivi.app/en/
- https://sms-issuer.staging.yivi.app/en/

### YiviConnect Migration
Yivi connect is the trusted SaaS offering of Yivi. Brokers like Signicat offer Yivi plug and play support with the use of Yivi Connect. We want migrate the Yivi Connect hosting to our Scaleway landing some ensuring an uninterrupted service.

### Mobile App Update
We already updated Flutter and our dependencies to the latest versions. We fixed the broken integration tests for iOS and will continue to improve the app. Our team already addressed some small UI issues and will continue to push on usability. Feel free to report any issues you might have with the Mobile App [here](https://github.com/privacybydesign/irmamobile/issues).

### Keyshare Server Migration
The migration of the Keyshare server is also on our immediate agenda. We are still debating our migration strategy since it also requires state to move from SIDN to Scaleway. Once we have our final migration strategy we will publish it on this blog.

## Long-Term Roadmap: Innovating and Expanding Yivi’s Potential
As we look to the future, our focus remains on driving innovation, enhancing usability, and ensuring Yivi plays a pivotal role in the evolving landscape of digital identity. Here’s how we plan to achieve this:

### Pretty Verifier Implementation
To ensure Yivi’s long-term viability and fairness in the ecosystem, we are requiring Pretty Verifiers. This initiative balances free access for individuals while enabling a sustainable business model. Here's how it works:

- Initially, we will issue warnings to non-verified relying parties and verifiers, creating awareness of upcoming changes. Subsequently after a period of time we will require 
- Protection for Citizens: By verifying verifiers, we protect users from misuse and ensure secure and compliant data exchanges.
- Fair cost distribution: This system helps offset the downstream costs borne by issuers and the wallet fostering a sustainable ecosystem.

### Embracing EUDI-Wallet Standards
The European digital identity landscape is evolving at a rapid pace, and Yivi has consistently been a pioneer in ID wallets within the Netherlands. We believe that Idemix and Zero-Knowledge Proofs (ZKPs) represent the ideal technologies for this space. However, these technologies were unfortunately not included in the Architectural Reference Framework developed by the eIDAS Expert Group.

Discussions around BBS+ have stagnated, prompting us to explore alternative solutions. Yivi will transition from Idemix to ECDSA or another privacy-preserving cryptographic protocol. Innovation remains at the core of our mission, as we collaborate with Radboud University on initiatives like Post-Quantum Cryptography. Additionally, adopting community standards such as OpenID4VP and OpenID4VCI is a top priority to ensure interoperability and alignment with the broader ecosystem.

### User Experience
User experience is the cornerstone of Yivi's mission to provide the most user-friendly ID wallet on the market. Our commitment to continuous improvement ensures that managing your digital identity is as seamless and intuitive as possible:

- Enhanced Attribute Management: Simplify navigation with features like categorization and customizable attribute reordering, putting control and clarity in the hands of our users.
- Brand Extensions: Enable organizations to seamlessly embed their branding and visual identity within Yivi, delivering a tailored and cohesive experience for their users.

By prioritizing user experience, we aim to make Yivi an indispensable tool for digital identity management.

## Our Commitment
Caesar Groep is committed to ensuring Yivi’s continued success as a trusted digital identity platform. With a clear short-term plan and a vision for the future, we aim to make Yivi indispensable for individuals, businesses, and governments.

Stay tuned for more updates as we roll out these changes and work together to shape the future of digital identity.

Let’s build a more secure and private digital world with Yivi!