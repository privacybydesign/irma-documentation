---
slug: 2025-iban-issuer
title: Yivi adds an IBAN issuer
authors: [dibranmulder]
tags: [yivi, iban]
---

We’re excited to introduce a new feature in Yivi: IBAN Issuance via verified iDEAL payments. This addition brings secure, self-sovereign proof of bank account ownership right into the hands of Yivi users.

## How it works
The IBAN issuer enables users to receive a verifiable credential containing their bank account information, simply by completing a €0.01 iDEAL transaction. This small payment serves as proof of account ownership.

After a successful payment, the following information is extracted and issued as an IBAN credential:
- Full name of the account holder
- IBAN
- BIC

This credential can then be used in any Yivi-enabled service that needs proof of bank account ownership, such as financial onboarding, gig-economy platforms, or trusted peer-to-peer transactions.

<div class="center-container">
    <img src="/img/iban-portrait.png" class="ss" alt="IBAN credential" />
</div>


## Backed by CM’s IBAN Verification
Yivi’s IBAN issuer is powered by [CM.com's IBAN Verification service](https://knowledgecenter.cm.com/kc/what-is-iban-verification-and-how-does-it-work), a reliable and widely-used system for verifying account ownership via a €0.01 transfer. CM ensures that the account details are validated and returned in a privacy-respecting way, fitting seamlessly into Yivi’s selective disclosure model.

## Try it now
The IBAN issuer is live and available at:
👉 https://iban-issuer.yivi.app/en

Users can visit the page, initiate the iDEAL verification process and add an IBAN credential in just a few clicks.

## Why this matters
Verifying a bank account typically requires sharing large amounts of personal data or uploading sensitive documents. With this new IBAN issuer, Yivi brings a privacy-by-design, user-controlled alternative that fits modern digital interactions — no oversharing, no intermediaries, and cryptographically verifiable.

We're proud to keep extending Yivi’s ecosystem with trusted, reusable digital credentials. Let us know what you think or how you'd like to integrate IBAN verification into your workflows!