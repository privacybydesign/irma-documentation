---
title: Trusted Verifier
---

Simply put, Trusted Verifier is a seal of approval from Yivi that a verifier can obtain, which will be shown to users in the the Yivi app. 
Only verifiers who are known to the Yivi app through <a href="https://github.com/privacybydesign/pbdf-requestors">requestors scheme</a> will be able to benefit from this. 
 Previously, joining this scheme was only possible through making a PR with the necessary information (name, id, hostname, and logo) set up in the required format. Now we can help you through this process possible via <a href="https://portal.yivi.app">Yivi Portal</a>, which will be a companion synced with changes in the IRMA schemes.

Trusted Verifier has the following goals:

- Provide users with guidance to make informed decisions and as a precaution against data oversharing, which is a critical privacy concern
- Provide a user experience that is intuitive and feels secure
- Help keep verifiers accountable and share their verification costs

<div class="center-container">
    <img 
        src="/img/trusted-verifier/trusted.png" 
        style={{ width: '35%', marginRight: '7em' , marginBottom: '1em'}} 
        alt="trusted-verifier" 
    />
    <img
        src="/img/trusted-verifier/untrusted.png"
        style={{ width: "35%" , marginBottom: '1em'}}
        alt="untrusted-verifier"
    />
</div>

<p style={{ textAlign: 'center', marginTop: '1em' }}>
    The app visually distinguishes trusted (green) and untrusted (red) verifiers, helping users make informed decisions before sharing their data.
</p>

## Using Yivi Portal to become a Trusted Verifier
To become a Trusted Verifier, we have created a <a href="https://portal.yivi.app/">portal</a> for organizations. 
The portal holds organizations that were already a part of the <a href="https://github.com/privacybydesign/pbdf-requestors">requestors scheme</a> as well as making it possible to create new organizations. An organization in this
context is an entity in Yivi that can become a verifier (relying party) and/or an issuer (attestation provider). 

The steps to become a Trusted Verifier using the Yivi Portal are as follows:

1. Log in to the Portal with your email address using the Yivi app. You will need to have added an email address to your Yivi app beforehand. Then, a user with your email address will be created.
1. If you are new, <a href="https://portal.yivi.app/organizations/register">register an organization</a>. If you are already a verifier or an issuer, contact us to be added as a maintainer. You will need to log in again for your new permissions to take effect. You will find your organization under your avatar.
1. In your organization management page, fill out the form for adding a new relying party (verifier).
1. You will need to complete a DNS TXT challenge. You can then mark your application as complete. We will review it shortly and the decision will be known to you via the status on your relying party.
1. We will review your application and contact you to discuss the terms of your usage and pricing. Once we have agreed upon the terms, we will publish your relying party in the Yivi app.
1. Once accepted, your relying party will be a Trusted Verifier.

:::note
You may notice that the terms verifier and relying party, and issuer and attestation provider are used interchangeably.
:::

## Terms and conditions
To become a Trusted Verifier, you will need to agree to the terms and conditions of Yivi. As mentioned before we believe in self sustaining ecosystem, which means that issuers are compensated for their costs and the Yivi app can be maintained and improved over time. For now we don't publish the terms and conditions and the according pricing on the portal, but we will be happy to discuss this with you.

If you are using Yivi through an identity broker, you will need to agree to the terms and conditions of the identity broker as well. The identity broker is a third party that provides a service to you and your users, and it may have its own terms and conditions that you need to agree to.
