---
slug: 2025-ux-crypto-agile-wallet
title: "Yivi adds Passport credentials - call for testing and feedback"
authors: [dibranmulder]
tags: [yivi, passport]
---

We are excited to announce that Yivi now supports Passport credentials! This new feature allows users to store and manage their digital passports securely within the Yivi wallet, enhancing convenience and accessibility for travelers. With this new feature, Yivi broadens its potential userbase to a truly international audience.

## How does it work?
With the support of the [NLnet Foundation](https://nlnet.nl/), we have integrated support for Machine Readable Travel Documents (MRTDs) into Yivi. This means that users can now add their digital passports to the Yivi wallet by scanning the Machine Readable Zone (MRZ) of their physical passports, followed by reading the NFC chip of the passport with their phone. The passport data is then validated (Passive Authentication) against the Dutch and German government-issued Masterlists of trusted passport issuers to ensure authenticity. On top of that we also have implemented Active Authentication measures to further enhance security.

## Whats available now?
The following `open source` components are now available for testing and feedback:

- An example App for scanning and reading passports
- A Beta Yivi wallet version with support for storing and managing Passport credentials
- An API for validating Passport credentials against government-issued Masterlists
- OpenID4VP integration with Yivi for using Passport credentials in verifiable presentations, including a demo.

The version we release now can be used both with SD-JWT and Idemix credentials, both over the OpenID4VP- and the IRMA-protocol. In the near future we will also work on supporting OpenID4VCI, so that the passport credentials can be issued to a wider range of applications. For now the SD-JWT and Idemix support relies on our IRMA protocol integration. 

We strongly recommend using the Idemix version of the passport credentials, as it offers enhanced privacy features. Especially in the context of Age Verification, the Idemix version ensures that only the necessary information is shared, exposure is unlinkable and minimizes tracability.

## Open source development
We believe in the power of open source and community collaboration. The development of the Passport credentials feature is no exception. We invite developers, researchers, and enthusiasts to contribute to the Yivi project on GitHub. Your feedback, bug reports, and feature requests are invaluable in helping us improve the platform.

Join us in making Yivi the best it can be!

## Call for testing and feedback
We are currently in the Beta phase of this new feature and are actively seeking feedback from users and developers. If you have a digital passport and are interested in testing the new Passport credentials feature in Yivi, please reach out to us. Your insights and experiences will help us refine and enhance the functionality.

[Slack](https://irmacard.slack.com/)
[Github](https://github.com/privacybydesign)
[Email](mailto:support@yivi.app)