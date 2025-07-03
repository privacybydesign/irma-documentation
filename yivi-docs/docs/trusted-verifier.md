---
title: Trusted Verifier
---

Simply put, Trusted Verifier is a seal of approval from Yivi that a verifier can obtain which will be shown to the user on their Yivi. 
Only verifiers who are known to the Yivi app through <a href="https://github.com/privacybydesign/pbdf-requestors">requestors scheme</a> will be able to benefit from this. 
 Previously, joining this scheme was only possible through making a PR with the necessary information (name, id, hostname, and logo) set up in the required format. Now we can help you through this process possible via <a href="https://portal.yivi.app">Yivi Portal</a>, which will be a companion synced with changes in the IRMA schemes.

Trusted Verifier has the following goals:

- Provide users with guidance to make informed decisions and as a precaution against data oversharing, which is a critical privacy concern
- Provide a user experience that is intuitive
- Help keep verifiers accountable and share their verification costs

<div class="center-container">
  <img
    src="/img/trusted-verifier/trusted.png"
    style={{ width: "35%"}}
    alt="disclosure-flow"
  />
  <img
    src="/img/trusted-verifier/untrusted.png"
    style={{ width: "35%" }}
    alt="disclosure-flow"
  />
</div>

## Using Yivi Portal to become a Trusted Verifier

To become a Trusted Verifier, we have created a portal for organizations. 
The portal holds organizations that were already a part of the <a href="https://github.com/privacybydesign/pbdf-requestors">requestors scheme</a> as
well as making it possible to create new organizations. An organization in this
context is an entity in Yivi that can become a verifier (relying party) or an issuer (attestation provider). 

The steps to become a Trusted Verifier using the Yivi Portal are as follows:

1. Log in to the Portal with your email address. A user with your email address will be created.
2. If you are new, <a href="https://portal.yivi.app/organizations/register">register an organization</a>. If you are already a verifier or an issuer, contact us to be added as a maintainer. You will need to log in again for your new permissions to take effect. You will find your organization under your avatar.
3. In your organization management page, fill out the form for adding a new relying party (verifier).
4. You will need to complete a DNS TXT challenge. You can then mark your application as complete. We will review it shortly and the decision will be known to you via the status on your relying party.
5. Once accepted, your relying party will be a Trusted Verifier.

:::note
You may notice that the terms verifier and relying party, and issuer and attestation provider are used interchangeably.
:::
