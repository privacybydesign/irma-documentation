---
slug: 2025-ux-crypto-agile-wallet
title: "UX challenges of a crypto agile wallet"
authors: [dibranmulder]
tags: [yivi, eudi]
---

Our mission is to make Yivi the most privacy and user friendly wallet out there. In line with this mission we developed our crypto agile vision, allowing users to use different cryptographic technologies in a seamless way. As part of this vision, we want to support verifiable credentials, which are becoming increasingly popular in the digital identity space.

## EUDI wallet and verifiable credentials
This summer we put tremendous effort in adopting industry standards for verifiable credentials. We have are about to release our first version with OpenID4VP support, using batch issued credentials.

In contrast to other wallets that have very technical users interfaces, we aim to provide a more user-friendly experience. This is especially important for scenarios where users need to obtain multiple credentials in various formats, such as in the EUDI wallet.

## Batch issuance
One of the first challenges we faced is that many services do not support privacy preserving credential formats such as Idemix. Instead, they use more common formats such as SD-JWTs or W3C VCs. These formats do not have the same level of privacy protection as Idemix, which can be a problem for users who value their privacy.

Batch issuance is a stopgap to mitigate the lack of privacy features of ordinary credential formats. Usage of these credentials typically leaves a cryptograhic trail that can be used to track users across different services. 

Batch issuance allows users to obtain copies of the same credential in a single issuance session, and then use them one by one in different disclosures. This breaks the linkability between sessions, improving user privacy.

This sounds like a good solution, but it comes with its own challenges. In this blog post we will discuss the UX challenges that batch issuance brings, and how we plan to address them.

### Expiry vs maximum usage
One of the main UX challenges with batch issuance is that credentials have a maximum usage limit. This means that a credential can only be used a certain number of times before it expires. This is different from our privacy first Idemix credentials, which typically have an expiry date, based on the validity of the underlying data.

Having both an expiry date and a maximum usage limit can be confusing for users. For example, if a user has a credential that expires in one year but can only be used five times, they may not understand why they cannot use it after five uses, even though it is still valid. The concept of maximum usage is something a user should not be bothered with, but in the current state of the art, it is unavoidable.

<div class="center-container">
    <img src="/img/batch-issuance.png" class="mm" alt="Yivi app UX design for batch issuance" />
</div>
<p style={{ textAlign: 'center', marginTop: '1em' }}>
    Yivi app UX design for batch issuance
</p>

## Multiple credential formats
Another challenge is that different services may require different credential formats. For example, some services may require SD-JWTs, while others may require W3C VCs. This means that users may need to obtain multiple credentials in different formats, which is very confusing to users. They may not understand why they need to obtain multiple credentials, or how to manage them. This can lead to frustration and confusion.

Yivi's approach will be to issue all supported formats when possible, and to hide the complexity of different formats from users as much as possible. We will also provide clear explanations and guidance on how to manage multiple credentials, and how to use them in different scenarios.

:::warning
We urge the community to adopt the same approach, to reduce the complexity for users.
:::

Below an image with visual indicators, showing the privacy first Idemix credential, SD-JWTs with a maximum usage, and the iso mdoc credentials with a maximum usage.

<div class="center-container">
    <img src="/img/credential-formats.png" class="mm" alt="Yivi app UX design for credential formats" />
</div>
<p style={{ textAlign: 'center', marginTop: '1em' }}>
    Yivi app UX design for credential formats
</p>

:::tip
This design is not final and may change in the future. We welcome feedback and suggestions from the community.
:::