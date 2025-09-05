---
slug: 2025-ux-crypto-agile-wallet
title: "UX challenges of a crypto agile wallet"
authors: [dibranmulder]
tags: [yivi, eudi]
---

Our mission is to make Yivi the most privacy and user friendly wallet out there. In line with this mission we developed our crypto agile vision, allowing users to use different cryptographic technologies in a seamless way. As part of this vision, we want to support verifiable credentials, which are becoming increasingly popular in the digital identity space.

## EUDI wallet and verifiable credentials
This summer we put tremendous effort in adopting industry standards for verifiable credentials. We are about to release our first version with OpenID4VP support, using batch issued credentials.

In contrast to other wallets that have very technical user interfaces, we aim to provide a more user-friendly experience. This is especially important for scenarios where users need to obtain multiple credentials in various formats, such as in the EUDI wallet.

## Batch issuance
One of the first challenges we faced is that many services do not support privacy preserving credential formats such as Idemix. Instead, they use more common formats such as SD-JWT VC and W3C VC. These formats do not have the same level of privacy protection as Idemix, which can be a problem for users who value their privacy.

Batch issuance is a stopgap to mitigate the lack of privacy features of ordinary credential formats. Usage of these credentials typically leaves a cryptographic trail that can be used to track users across different services. 

Batch issuance allows users to obtain copies of the same credential in a single issuance session, and then use them one by one in different disclosures. This breaks the linkability between sessions, improving user privacy.

This sounds like a good solution, but it comes with its own challenges. In this blog post we will discuss the UX challenges that batch issuance brings, and how we plan to address them.

:::tip
Batch issuance is **not needed** when using Idemix credentials. Since Idemix is built on zero-knowledge proofs, it does not leave behind cryptographic trails that can be tracked across services. Each disclosure is unlinkable by design, offering strong privacy protection without the need for multiple issued copies.
:::

### Expiry vs maximum usage
One of the main UX challenges with batch issuance is that credentials have a maximum usage limit. This means that a credential can only be used a certain number of times before it expires. This is different from our privacy first Idemix credentials, which typically have an expiry date, based on the validity of the underlying data.

Having both an expiry date and a maximum usage limit can be confusing for users. For example, if a user has a credential that expires in one year but can only be used five times, they may not understand why they cannot use it after five uses, even though it is still valid. The concept of maximum usage is something a user should not be bothered with, but in the current state of the art, it is unavoidable.

<div class="center-container">
    <img src="/img/batch-issuance.png" class="ss" alt="Yivi app UX design for batch issuance" />
</div>
<p style={{ textAlign: 'center', marginTop: '1em' }}>
    Yivi app UX design for batch issuance
</p>

## Multiple credential formats
Another challenge is that different services may require different credential formats. For example, some services may require SD-JWTs, while others may require W3C VCs, or even ISO mdocs. This creates a fragmented landscape that puts the burden on the end-user. From their perspective, a credential is a credential, they do not (and should not) need to understand which cryptographic format is being used under the hood.

Without careful UX design, users could easily run into situations where:
- They receive seemingly duplicate credentials that serve the same purpose but in different formats.
- They are asked to re-collect the "same" credential just because a service does not accept the format they already have.
- They are left wondering why a credential works in one context but fails in another.

This can quickly lead to frustration, especially in scenarios where citizens are expected to interact with multiple services from different providers.

Our approach in Yivi is to **embrace crypto agility**:
- Whenever possible, we will issue credentials in **all supported formats** at once.
- The wallet will abstract away, as much complexity as possible, presenting users with a single, unified credential view.  
- Behind the scenes, Yivi ensures that the correct format is presented to the relying party, without requiring user intervention.  

To further support clarity, we are thinking about adding visual indicators in the wallet so that advanced users can see which credential type is being used (Idemix, SD-JWT, W3C VC, or mdoc). However, for most users, the complexity will remain hidden, allowing them to simply “use their credential” without worrying about formats or cryptography.

:::warning
This design is not final and we will probably change it in the future. We welcome feedback and suggestions from the community.
:::

Below an image with visual indicators, showing the privacy first Idemix credential, SD-JWTs with a maximum usage, and the ISO mdoc credentials with a maximum usage.

<div class="center-container">
    <img src="/img/credential-formats.png" class="ss" alt="Yivi app retrieval wizard" />
</div>
<p style={{ textAlign: 'center', marginTop: '1em' }}>
    Yivi app retrieval wizard
</p>

## Schemaless credentials

Most credential ecosystems rely on schemas: predefined structures that describe the credential’s attributes, format, and sometimes even their presentation. Yivi extends this with a trust schema that not only defines what data fields exist, but also adds **display hints** such as *yes/no toggles, date/time formats, or image representations*. These hints allow the wallet to present information consistently and clearly, even when different issuers define similar attributes.  

### UX without a schema

For newer credential formats like SD-JWT Verifiable Credentials and ISO mdoc, the situation is less straightforward.

#### SD-JWT and ISO mdoc: structure vs presentation
SD-JWT VCs are technically very flexible, since each disclosure can be selective and minimal. From a UX perspective, however, the wallet has little guidance on how to present each claim. Without schema-level hints, an attribute may appear as plain text, even if it would be more meaningful as a date, an image (such as a passport photo), or a simple yes/no switch.

There is work in the SD-JWT VC spec on display metadata, which could provide wallets with presentation hints similar to Yivi’s trust schema. However, this is not widely implemented yet—in practice, most deployments (including ours) still rely on schemas to drive UX. Another relevant source of metadata is the OpenID4VCI metadata published in the issuer’s `.well-known` endpoint (e.g. `/.well-known/jwt-vc-issuer`), which can inform wallets about issuance details and supported credential types.

A further challenge with SD-JWT is that any embedded images or larger data elements (such as logos, icons, or photos) are repeated for every credential instance. In batch issuance scenarios, this multiplies both the storage footprint and the request size, which can quickly become inefficient.

ISO mdoc takes a different approach, offering more structure with a well-defined set of namespaces and data element types. Each element includes typing information (such as `date`, `boolean`, or `portrait`), which gives wallets stronger guidance for rendering. Yet the format only has limited support for multi-linguality: ISO defines fixed data elements but does not provide rich, multi-language labels or explanatory hints as Yivi does. Moreover, issuance flows are tightly coupled to the relying party’s process, leaving no standardized way for a wallet to present a user-friendly preview before issuance.

#### Comparing UX capabilities
By contrast, the Yivi trust schema goes well beyond simple structure. It enriches attributes with labels, hints, icons, and multi-language support, ensuring they are always presented in the user’s preferred language. Yivi also includes a credential description page before issuance, so users can see what will be added to their wallet with clear explanations and consent. On top of that, it offers a credential store: a curated list of credentials that users can initiate issuance for directly from the wallet, rather than only reacting to a service request.

In short, SD-JWT provides maximum protocol flexibility but limited UX guidance (with emerging but underused metadata extensions), ISO mdoc offers strong typing but weak user-facing context, while Yivi’s trust schema delivers a full-stack UX solution—covering structure, presentation, language, issuance previews, and proactive credential discovery.

### The deeper issue: missing guided flows

A second, more profound issue emerges when a service requests a credential that is **not part of any defined schema**. In such cases:  

- The wallet has no basis to offer a **wizard-like flow** that guides the user through obtaining the credential before disclosing it.  
- The user is left stranded: the service asks for something the wallet doesn’t know how to fetch, and no UX pathway exists to bridge that gap.  
- There is no **credential store integration** without a schema, meaning the wallet cannot help the user proactively collect credentials they may need later.  

Yivi already has these flows **built-in**:  
- When a disclosure request arrives for a credential the user lacks, the app guides them to retrieve it first, then continues the disclosure.  
- The **credential store** allows the user to initiate issuance directly from their wallet, in their own language, with clear descriptions.  

<div class="center-container">
    <img src="/img/issue-wizard.png" class="ss" alt="Yivi app UX design for credential formats" />
</div>
<p style={{ textAlign: 'center', marginTop: '1em' }}>
    Yivi app UX design for credential formats
</p>

But in a schemaless world, **the fundamental pieces are missing** to enable a good user experience. There is no shared understanding of what the credential "is", where it can be retrieved, how it should be displayed, or how it should be described across multiple languages.  

This gap highlights a broader challenge for the industry: **without schema-level conventions, wallets cannot build essential UX features** like guided acquisition, issuance previews, consistent rendering, multi-lingual consent, and proactive credential discovery. Until these foundations are addressed, users will face fragmented and often confusing experiences, exactly what we set out to avoid.

## Conclusion
Yivi is already far ahead of the curve in terms of UX. Where other wallets burden users with cryptographic jargon, fragmented formats, and confusing limitations, Yivi abstracts away complexity and prioritizes clarity, privacy, and usability. This is not a "nice to have", it is the key to adoption and long-term success.

Digital identity wallets will only succeed if ordinary citizens can use them confidently, without frustration or doubt. A good UX makes the difference between a technology that remains niche and one that reaches mass adoption. By leading with a privacy-first, user-friendly design, Yivi sets the benchmark for what a European digital identity wallet should be.