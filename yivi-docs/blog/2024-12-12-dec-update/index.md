---
slug: 2024-december-update
title: December update
authors: [wouterensink, saravahdatipour, dibranmulder]
tags: [yivi, update]
---

Hey everyone! 

As we approach the end of 2024, our team is working hard to deliver as much progress on the project as possible. In keeping with our commitment to the community, we’re excited to share some of the improvements we’ve been working on. A lot of work has been put in getting a production grade hosting environment, but next to that we also delivered on some other areas.

<!-- truncate -->

## Yivi app update
The Yivi app we all know and love has gotten a welcome update. We upgraded to the latest Flutter and Xcode versions and updated all dependencies. The update includes some nice visual fixes and improvements aswell, including the following notable changes: 
- Visual feedback when pressing cards and buttons
- Swipe to go back now works between any page where it makes sense
- Improvements to the navigation bar layout on modern iPhones with rounded displays
- The icons in the navigation bar now fill in when they're selected
- Lists are now always scrollable, making for a more natural feel
- The background color is now more consistent between pages

The Caesar Groep is committed to making Yivi, the identity walled with the best user experience.
These changes are currently in beta and should be available to you very soon.

## Other visual improvements
In Yivi, the user is the central focus, and that is about more than just privacy. 
The look and feel for all interactions 
between the user and the Yivi ecosystem should be welcoming and user-friendly. 

### Demos redesign
In the transition from IRMA to Yivi, some components of the ecosystem had yet to receive a visual update. We received feedback from the community that IRMA references are confusing to their users and that we should get rid of them as soon as possible. One of these is the Yivi [demos page](https://demos.staging.yivi.app), which is often used in the community to display Yivi's capabilities. As of now the demos page has been updated with the Yivi look and feel. We are planning to remove them from the Privacy By Design foundations website and host them on `demos.yivi.app`, for now they are available at our staging environment: https://demos.staging.yivi.app.
<a href="https://demos.staging.yivi.app" target="_blank"><img src="/img/yivi-demos.png" class="" alt="pre-condiscon" /></a>

### New email templates
When users add their email address using our [email-issuer](https://email-issuer.staging.yivi.app), they receive an email containing a link with which they can verify their email adress. We received feedback that first of all the email is send from `noreply@sidn.nl` while people expect `noreploy@yivi.app` to be the sender, secondly the email template is very minimalistic which doesn't improve the trust people have this is not a phising mail. We therefore improved the verification emails by adding the Yivi look and feel. Also we created a button and an `explicit` url which people can click on or copy to their browsers. Better informing them to which website they are navigating. This is considered a better security practise. 

<img src="/img/new-mail-template.png" class="mm" alt="" />

The changes are live on our staging issuer [email-issuer.staging.yivi.app](https://email-issuer.staging.yivi.app), which is our internal testing environment but open to the public. We expect this changes to come live early next year. This is part of the migration from SIDN to Caesar Groep. We will shut down `https://sidnemailissuer.yiviconnect.nl/uitgifte/email/` and use `https://email-issuer.staging.yivi.app` instead. We will also change the sender of the email from `noreply@sidn.nl` to `noreply@yivi.app`. We tested the new mail layout on Outlook Desktop, Web and mobile clients, both Office365 as well as outlook.com, Gmail web and mobile clients and lastly the Mail app on macOS. If there are any issues with the new mailings please let us know.

## Stateless issuers
As mentioned in the [roadmap blog](vision,%20roadmap), we switched to Kubernetes for a robust and stable infrastructure. Part of the benefits of Kubernetes is the ability
to run multiple instances of the same issuer for example simultaniously, allowing for high availability and little downtime.
When Kubernetes gets a request it will automatically pick one of these instances to send the request to. Subsequent calls to the same hostname could end up being taken care of by other instances.

In order for an issuer to be able to run in such a distributed fashion, it needs to be stateless.
This doesn't mean that there's no state whatsoever, but rather that the state cannot be part of the instance itself. 
Instead the state needs to be moved to somewhere outside of the instance, for example a database.

Most of our components already have this capability, like the `irmago server`, but a some of them had yet to be updated.

Two of the remaining ones were the `SMS issuer` and the `email issuer`. 
Their state consists of the ongoing verification requests and some info about previous requests in order to do rate limiting.

This week we took the time to make the these two issuers stateless by moving their state to Redis.
We did this by putting state access in the Java code behind interfaces and making two implementations of these interfaces:
one for in-memory and one for Redis. This allows us to keep backwards compatibility while adding this new stateless property as opt-in.

## Moving to a production environment
As the completion of the staging environment nears, we've started working on the production environment.

### Better Secret management
For Yivi to remain safe and trustworthy, we must carefully manage our credentials and secrets. We’ve selected mature tooling for secret management to handle multiple scenarios. For instance, CI/CD pipelines should not be able to read secrets directly, while our Kubernetes cluster must be able to reference them. We’re also considering incorporating Hardware Security Modules (HSMs) in the future to further strengthen our security posture.

### Deployment using GitHub Actions
Until now, deployments to our staging environment have been handled manually. In production, we follow a least-privilege policy, meaning contributors don’t have default access to our production cluster. To maintain this, deployments must be automatic and controlled.

By leveraging GitHub Actions for deployments, we’ll ensure:

- Higher quality through automated testing
- Fewer human errors
- A “four-eyes” principle for increased security and accountability

## Closing 2024
This year has been an important one for Yivi. The transition from SIDN to Caesar Groep has begun, and what a start it was. We’re thrilled to see the renewed interest in Yivi and the opportunities that come with it.

Thank you all for being a part of the Yivi community. This concludes the December update. Feel free to contact us with any questions or remarks.

We will see you next month with the next update. For now, we wish you a merry Christmas and a happy new year!

Kind regards,

Dibran, Sara, Wouter, Martijn, Jasper, Leon, Ivar, and Sietse.
The Yivi team