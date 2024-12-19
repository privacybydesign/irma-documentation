---
slug: vision, roadmap, progress
title: November update
authors: [dibranmulder]
tags: [yivi, roadmap, update]
---

He all, I thought it would be nice to update you on our progress. Our dedicated team started the development and operations of Yivi effectively on the 1st of November. The existing code base (70+ repositories) is quite large, and the learning curve is rather steep, however I think we are making great progress. We touched a lot of components already and we are learning as we go.

As told during the Yivi meetup we have a roadmap ahead of us containing 3 epics, namely: Cloud Migration, Development and eIDAS2.0. I will update our progress on each of them.

<!-- truncate -->

## Cloud Migration
As said our priority is taking care of all infrastructure and tooling required to serve the Yivi ecosystem. We are aiming for a seamless migration of multiple core components such as several issuers (mobile, email,saml, idin), yiviconnect.nl, the key share server and my yivi. Most of these components are hosted by SIDN on VM’s managed by them. Our plan is to host it all on Scaleway, a European cloud provider, offering locations in Amsterdam, Paris and Warsaw. Our tech of choice is Kubernetes. Choosing Kubernetes benefits the broader ecosystem, because containerized hosting will be our default going forward. You might have seen that several demos and issuers are now containerized.

To highlight our progress, here is a list of services running on our staging environment—a newly established platform where we test our services.
- https://schemes.staging.yivi.app
- https://is.staging.yivi.app
- https://my.staging.yivi.app/
- https://keyshare.staging.yivi.app
- https://email-issuer.staging.yivi.app/
- https://sms-issuer.staging.yivi.app/en/
- https://docs.staging.yivi.app
- https://connect.staging.yivi.app/saml-bridge
- https://demos.staging.yivi.app
- https://angrygames.staging.yivi.app
- https://atumd.staging.yivi.app
- https://docs.staging.yivi.app

For security reasons, we do not open-source the code used to create the infrastructure.

## Development
The next priority is to take care of the user experience of Yivi. We think having the best UX is one of the ways in which Yivi distinguishes itself from other ID-wallets. Our mobile engineer Wouter took some time to eliminate technical debt, including upgrading to the latest Xcode and Flutter versions and upgrading several dependencies. Also, the integration tests broke with the upgrade, so we had to fix them.

The first UI improvements are already merged, we will stack them up and aim to release them before Christmas. We already took ownership of the App and Play Store accounts, but the release process and any particularities have not been discussed yet. We will update you when there’s a new App to test. Make sure to open an issue on the irmamobile repository when you experience bugs in the mobile app.

Next to the mobile development we started fixing some bugs in the irmago library. Getting familiar with this rather complex piece of code is quite challenging but progress is made. Luckily, we have the extensive knowledge of Ivar and Sietse available so that helps a lot!

## eIDAS 2.0
We acknowledge that Yivi should be part of the European Digital Identity Framework. Becoming an EUDI-wallet is one of our long-term goals, however, how to become one is very much still a moving target. Fortunately, we have several connections and advisors keeping us up to date in that field.

We have begun examining the technical implications of adopting cryptography and protocols other than Idemix and IRMA. While it's too early to share specific details, rest assured that it's on our radar.

## Community
We started reaching out to the existing contacts of Yivi, you might have noticed it. We had dozens of talks and introductions, and we valued them very much. It’s very nice to see the enthusiasm about Yivi in the ecosystem. Also, we have several commercial parties showing interest in Yivi, we can’t share anything yet, but we will when the time is ready.

Several parties contacted us regarding the Development, Consultancy and Support for an Age Verification Solution – European Tender. We evaluated the tender but sadly participating in the tender on such a short term was rather impossible. In the future we will need a consortium of organizations to participate in such a tender. We already had quite a lot of expertise available via several organizations, but we clearly missed BID management capacity and law and regulations expertise. If your organization has these expertise’s we would like to connect so that we can explore a collaboration in the future.

Thank you all for being a part of the Yivi community. Feel free to contact us with any questions or remarks. This concludes the November update, I will try to update you every month, and for now happy holidays!

Kind regards, also on behalf of the yivi team

Dibran, Sara, Wouter, Martijn, Jasper, Leon, Ivar, Sietse. 
