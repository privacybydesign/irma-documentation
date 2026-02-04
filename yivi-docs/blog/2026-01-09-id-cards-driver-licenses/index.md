---
slug: 2026-id-cards-driver-licenses
title: "ID-cards and Dutch Driver Licenses now available"
authors: [dibranmulder]
tags: [yivi, mrtd, id-card, driver-license, international]
---

We're thrilled to announce that Yivi now supports **ID-cards and Dutch Driver Licenses** as credentials. This expansion significantly broadens Yivi's international reach and makes the platform more accessible to users worldwide.

<!-- truncate -->

## Expanding our MRTD coverage

Following our successful passport integration, we've continued to enhance Yivi's Machine Readable Travel Document (MRTD) capabilities. With this release, users can now add their ID-cards and Dutch Driver Licenses to their Yivi wallet using the same secure scanning and NFC technology.

This means Yivi now provides **full coverage for the complete range of MRTDs used in the Netherlands**, as well as common identity documents from around the world. Whether you're a Dutch resident or an international user, Yivi offers a trusted way to manage your digital identity credentials.

## Why this matters for international users

Identity verification is often region-specific, with different countries relying on different primary documents. While passports are universally recognized, many people primarily use their national ID cards or driver's licenses for day-to-day identification needs.

By supporting ID-cards alongside passports, Yivi becomes more practical and accessible to a broader international audience. Users can now choose the identity document that makes the most sense for their situation:
- **Passports** for international identification
- **ID-cards** for EU citizens and those who prefer their national ID
- **Driver's Licenses** for Dutch residents who want to use their most commonly carried document

## How it works

The process mirrors our passport credential flow:
1. **Scan the Machine Readable Zone (MRZ)** of your ID card or driver's license
2. **Read the NFC chip** with your phone
3. **Validate the data** through Passive Authentication and Active Authentication

Just like with passports, the data is validated against government-issued Masterlists of trusted document issuers, ensuring the highest level of security and authenticity.

## Screenshots

### Adding an ID-card
<div class="center-container">
    <img src="/img/id-card-edl/01_add_data_id.png" class="ss" alt="Yivi app - Add ID card data" />
    <img src="/img/id-card-edl/02_id_mrz.png" class="ss" alt="Yivi app - Scan ID card MRZ" />
    <img src="/img/id-card-edl/03_id_start_scan.png" class="ss" alt="Yivi app - Start NFC scan" />
</div>

<div class="center-container">
    <img src="/img/id-card-edl/04_id_scanning.png" class="ss" alt="Yivi app - NFC scanning in progress" />
    <img src="/img/id-card-edl/05_id_add_credential.png" class="ss" alt="Yivi app - Add ID credential" />
</div>

### ID-card and Driver's License credentials
<div class="center-container">
    <img src="/img/id-card-edl/06_id_cred_top.png" class="ss" alt="Yivi app - ID card credential (top)" />
    <img src="/img/id-card-edl/07_id_cred_bottom.png" class="ss" alt="Yivi app - ID card credential (bottom)" />
    <img src="/img/id-card-edl/08_edl_top.png" class="ss" alt="Yivi app - Driver's license credential (top)" />
</div>

<div class="center-container">
    <img src="/img/id-card-edl/09_edl_bottom.png" class="ss" alt="Yivi app - Driver's license credential (bottom)" />
</div>

## Technical integration

ID-cards and driver's licenses are supported through the same open-source infrastructure that powers our passport credentials:

- The [Yivi app](https://github.com/privacybydesign/irmamobile) now supports all three document types.
- The [go-passport-issuer API](https://github.com/privacybydesign/go-passport-issuer) has been extended to validate ID-cards and driver's licenses.
- Both **Idemix** and **SD-JWT VC** formats are available
- Compatible with **OpenID4VP** and the **IRMA protocol**

As with passports, we **strongly recommend** using the Idemix version for enhanced privacy protection, especially for selective disclosure use cases like age verification.

## Call for testing: International ID-cards especially welcome

While we've thoroughly tested with Dutch documents, we're particularly interested in feedback from users with **international ID-cards**. Every country's identity documents have unique characteristics, and real-world testing helps us ensure broad compatibility.

If you have an ID-card from any country or a Dutch driver's license, we'd love for you to test the new credential types. Your feedback will help us refine the feature and ensure it works seamlessly across different document standards.

**To participate in testing:**
- Reach out via [Slack](https://irmacard.slack.com/), [GitHub](https://github.com/privacybydesign), or [Email](mailto:support@yivi.app)
- Download the latest Yivi app from the App Store, Google Play Store or F-Droid
- Test the credential issuance with your documents
- Share your experience and any issues you encounter

## Widening Yivi's international applicability

This release represents a significant step forward in making Yivi a truly international identity solution. With support for the most common identity documents used globally, Yivi can now serve users from many different countries and contexts.

We're committed to continuing this expansion and welcome feedback from our international community on what documents and features would be most valuable to you.

## Open source and privacy-first

As always, all components of this feature are **open source** and built with privacy as the foundation. The selective disclosure capabilities of Yivi mean users only share the minimum necessary information for each verification, protecting their privacy while providing trusted authentication.

Thank you to the [NLnet Foundation](https://nlnet.nl/) for their continued support in making these enhancements possible.

## Get involved

We believe great software comes from community collaboration. If you're interested in testing, contributing code, or just learning more about how Yivi's MRTD support works, we'd love to hear from you:

- [Slack](https://irmacard.slack.com/)
- [GitHub](https://github.com/privacybydesign)
- [Email](mailto:support@yivi.app)

Let's build the future of digital identity together!