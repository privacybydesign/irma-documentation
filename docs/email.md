---
title: Email address
---

IRMA has a decentral architecture: anyone can start an [`irma server`](irma-server.md) and verify attributes, communicating directly with IRMA apps. This is an important and distinguishing feature contributing to IRMA's privacy features and trustworthiness, but also means that we as authors of the software have no natural update channel with which we can update all IRMA servers running within the ecosystem. We have to prevent that this leads to a fractured IRMA ecosystem with incompatible apps and servers, which would lead to bad user experience and hurt adoption.

Inspired by the approach of Let's Encrypt, each of the [IRMA server](what-is-irma.md#irma-servers) software components can be configured with an email address. If specified, the email address is uploaded to the [Privacy by Design Foundation](https://privacybydesign.foundation/) and subscribed to receive updates about changes in the IRMA software or ecosystem. You will be notified of changes such as major updates of the IRMA server, and breaking changes in any part of the IRMA infrastructure that would require you to update your IRMA server or otherwise take action in order to stay compatible with the rest of the IRMA ecosystem.

***We strongly recommend anyone running any IRMA server in production to specify an email address.***

 * If you provide your email address it will exclusively be used by the Foundation for the above purpose.
 * It will be very low volume (on average perhaps one email per several months).
 * If you have provided your email address in the past and wish to be unsubscribed, please email [the Foundation](https://privacybydesign.foundation/contact-en/).
 * See also the Foundation's [privacy policy](https://privacybydesign.foundation/privacy-policy-en/).
