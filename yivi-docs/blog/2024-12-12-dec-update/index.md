---
slug: 2024-december-update
title: December update
authors: [wouterensink, saravahdatipour]
tags: [yivi, update]
---

Hey everyone! 

As we approach the end of 2024, our team is working hard to deliver as much progress on the project as possible. In keeping with our commitment to the community, we’re excited to share some of the improvements we’ve been working on.

<!-- truncate -->

## Yivi app update
The Yivi app we all know and love has gotten a welcome update.
The update includes some nice visual fixes and improvements.
Some notable changes include:
- Visual feedback when pressing cards and buttons
- Swipe to go back now works between any page where it makes sense
- Improvements to the navigation bar layout on modern iPhones with rounded displays
- The icons in the navigation bar now fill in when they're selected
- Lists are now always scrollable, making for a more natural feel
- The background color is now more consistent between pages

The Caesar Groep is committed to making Yivi identity walled with the best user experience.
These changes are currently in beta and should be available to you very soon!

## Other visual improvements
In Yivi, the user is the central focus, and that is about more than just privacy. 
The look and feel for all interactions 
between the user and the Yivi ecosystem should be welcoming and user-friendly. 

### Demos redesign
In the transition from Irma to Yivi, some components of the ecosystem had yet to receive a visual update. 
One of these is the [demos page](https://demos.staging.yivi.app).
As of now the demos page has been updated with the Yivi look and feel.

### New email templates
When users add their email address using our [email-issuer](https://email-issuer.staging.yivi.app), they receive an email containing a link they can use to verify their email (are you still following?).

This email used to be plain and boring, but not anymore!

We've improved the verification emails by adding the Yivi look.
The changes are live on [email-issuer.staging.yivi.app](https://email-issuer.staging.yivi.app), so you can try it out for yourself!


## Stateless issuers
As mentioned in the [roadmap blog](vision,%20roadmap), we switched to Kubernetes for a robust and stable infrastructure. Part of the benefits of Kubernetes is the ability
to run multiple instances of the same server simultaniously, allowing for high availability and little downtime.
When Kubernetes gets a request it will automatically pick one of these servers to send the request to. Subsequent calls to the same hostname could end up
in different instances of the server.

In order for a server to be able to run in such a distributed fashion, it needs to be stateless.
This doesn't mean that there's no state whatsoever, but rather that the state cannot be part of the server itself. 
Instead the state needs to be moved to somewhere outside of the server, for example a database.

Most of our components already had this property, but a couple of them had yet to be updated.

Two of the remaining ones were the SMS issuer and the email isser. 
Their state consists of the ongoing verification requests and some info about previous requests in order to do some rate limiting.

This week we took the time to make the these two issuers stateless by moving their state to Redis.
We did this by putting state access in the Java code behind interfaces and making two implementations of these interfaces:
one for in-memory and one for Redis.
This allows us to keep backwards compatibility while adding this new stateless property as opt-in.

## Moving to a production environment
As the completion of the staging environment nears, we've started work on the production environment.

### Secrets to Scaleway
In order to have a safe and trustworthy Yivi, it's critical that some credentials are kept secret.
We do this by having secrets in Kubernetes and mounting them to the servers that run inside the cluster.
Until last week these secrets were put into Kubernetes manually, 
which means a lot of manual work would have to be done when setting up a new cluster.
To cut down on this work, we've moved the secrets to an external secret manager. This means these secrets can be reused when setting up a new cluster, reducing the amount of manual work required.
You can think of it like having a password manager instead of having to manually enter your passwords when logging in.
The secret manager we chose is the Scaleway Secret Manager.


### Deployment using GitHub Actions
Up until now we've been deploying our staging environment by hand using Terraform.
This is nice for quick iteration, but the drawback it that it's not clear to everybody what exactly has been deployed.
The current deployment could live in an updated file that's only accessible to a single developer, because they haven't committed it yet.

To make this more centralized, we're working on deploying via GitHub Actions. Each time a pull request is merged to the main branch, the delivery will kick
off, deploying the latest state. This way everyone is up to date on what's running on the Kubernetes cluster.

## Closing 2024
This year has been an important one for Yivi. 
The transition from SIDN to Caesar Groep has began, and what a start it was!
We're thrilled to see the renewed interest in Yivi and the opportunities that come with it!

Thank you all for being a part of the Yivi community. This concludes the December update. 
Feel free to contact us with any questions or remarks.

We will see you next month with the next update, and for now, merry Christmas and a happy new year!

Kind regards, 

Dibran, Sara, Wouter, Martijn, Jasper, Leon, Ivar, and Sietse.

The Yivi team
