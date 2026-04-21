---
slug: 2026-openid-full-support
title: "Yivi announces end to end OpenID support: private BETA now open"
authors: [dibranmulder]
tags: [yivi, openid4vci, openid4vp, sdjwtvc, eudi, beta]
---

After shipping OpenID4VP support last year and migrating all Privacy by Design issuers to SD-JWT VCs earlier this year, today we're closing the loop: **Yivi now supports both OpenID4VCI and OpenID4VP**. Issuers and verifiers can integrate with Yivi entirely using open standards.

We're opening a private BETA and inviting organizations to be among the first to integrate.

<figure style={{textAlign: 'center', marginBottom: '1.5rem'}}>
  <video controls style={{borderRadius: '8px', maxWidth: '360px', display: 'block', margin: '0 auto'}}>
    <source src="/img/openid4vc-complete-flow-demo-bg.mp4" type="video/mp4" />
  </video>
  <figcaption style={{marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--ifm-color-emphasis-600)'}}>A Yivi user loads in his eduID and discloses it using OpenID4VP using Veramo verifier software.</figcaption>
</figure>

<!-- truncate -->

## From IRMA to full OpenID

Since Yivi's origins as IRMA, our issuance protocol has been built in-house. The IRMA protocol served the Privacy by Design community well. It still does and it is not going anywhere.

But the European Digital Identity ecosystem has converged on a clear set of open standards: **OpenID4VCI** for credential issuance, **OpenID4VP** for disclosure, and **SD-JWT VC** as the dominant credential format. Organizations integrating identity today want to build on these standards, and so do we.

With this release, the full OpenID stack is supported in Yivi. Existing IRMA based integrations continue to work alongside it. Nothing breaks, and nothing needs to migrate.

## What's new

**OpenID4VCI:** Issuers can now issue credentials directly into the Yivi app using the OpenID4VCI protocol. No custom IRMA server required. Any OpenID4VCI compliant issuer can participate in the Yivi ecosystem.

**OpenID4VP:** Verifiers can request attributes using the OpenID4VP protocol with DCQL queries. This makes Yivi interoperable with the most commonly used protocol for selective disclosure in the European identity community. Any OpenID4VP compliant verifier can accept credentials from Yivi.

**SD-JWT VC:** All credentials exchanged over our OpenID stack use the SD-JWT Verifiable Credentials format, the most widely adopted credential format in the European identity community.

## Already in testing: SURF and Ver.id

We're not starting from zero. We're actively testing with two early integration partners.

**SURF** is the collaborative organisation for IT in Dutch education and research. Through this integration, a student can issue their **EduID credential** directly into the Yivi app via OpenID4VCI, and selectively disclose it to any service that accepts it via OpenID4VP.

**Ver.id** brings additional high quality attribute coverage to the ecosystem. We're working closely with them to validate the full issuance and disclosure cycle over the OpenID stack.

These integrations confirm that the full loop works: credential issuance, storage in Yivi, and selective disclosure over open standards, end to end.

## A sustainable model for authoritative attributes

A question we hear often from potential issuers is: *why should we bear the cost of issuing credentials that get used in third party services?*

It's a fair question. Our answer is a monetization model built directly into the Yivi trust ecosystem:

- **Issuers can be compensated** when their credentials are disclosed to relying parties.
- **Relying parties pay for the downstream value** they receive from authoritative attribute data.
- **If issuer and verifier are the same organization**, no costs are generated. Compensation only flows when value crosses organizational boundaries.

This makes it economically viable for authoritative sources to publish and maintain high quality credentials. Examples of the kind of attributes we're talking about:

| Domain | Example attributes |
|---|---|
| Employment | Current employer, job title, contract type |
| Education | Diploma, field of study, institution |
| Healthcare | BIG registration, professional qualification |
| Other | Industry specific certifications and registrations |

These are not self asserted claims. They come from the organizations that hold the authoritative data, and relying parties can trust them accordingly.

## Fully open, by design

What sets Yivi apart from other wallet solutions is that the entire ecosystem is open. The protocols, server software, mobile app, and trust framework are all open source. There are no proprietary locks, no closed trust registries, and no single vendor gating who can issue or verify.

If you're evaluating wallet providers and find the trust ecosystem is opaque or controlled by the vendor, that's worth weighing carefully.

## Join the private BETA

We're now inviting organizations to join the private BETA. Our current focus is on four sectors where high quality authoritative credentials create the most immediate value:

- **Healthcare:** BIG registrations, professional qualifications
- **Municipalities:** civic identity, permits, resident services
- **Energy:** installer certifications, grid operator credentials
- **Insurance:** policy linked attributes, verification flows

That said, we're open to any sector with a compelling use case.

**What the process looks like:**

1. Reach out to us at [support@yivi.app](mailto:support@yivi.app)
2. We scope the integration together
3. Within a month, your issuer or verifier is set up and connected to an automated testing environment
4. You can start issuing or accepting credentials via the live Yivi app

:::tip[Get in touch]
Email [support@yivi.app](mailto:support@yivi.app) to join the private BETA. Tell us a bit about your organization and the attributes you issue or need to verify.
:::
