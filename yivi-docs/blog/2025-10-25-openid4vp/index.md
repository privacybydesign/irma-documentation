---
slug: 2025-openid4vp
title: "Announcing Yivi OpenID4VP support"
authors: [wouterensink]
tags: [yivi, openid4vp, eudi, sdjwtvc]
---

A few months ago, we announced our plans to become an EUDI wallet while still retaining our original privacy-by-design technology.

Since that announcement, we've come a long way, and today it's time to announce the release of the first major step towards true [crypto agility](/docs/crypto-agile-introduction): the support for the OpenID4VP protocol and the SD-JWT VC credential format in the Yivi app.
In this blog, we'll dive into how we did this and what it means for you.

## EUDI Technology
The EUDI Wallet ecosystem consists of many moving parts, but the most fundamental pieces are a set of credential formats and protocols.
For web technology, it uses the OpenID4VCI protocol for credential issuance and the OpenID4VP protocol for disclosures.
The credential formats consist of SD-JWT VC, W3C VC, and ISO mDL/mdoc.

For Yivi to become an EUDI compatible wallet, it must have support for these formats and protocols.

We can't do all of these at the same time, so we had to make a choice to start with one credential format and one protocol.

For the credential format the choice was simple: SD-JWT VC is the most used, easiest to implement and has an open standard.

The choice for a protocol was a bit harder.
Since a single protocol can only either issue or verify, we knew we would get into the situation where we would either
have credentials without being able to share them, or we would be able to share them without being able to actually obtain them.
A classic chicken and egg problem.

To get around this problem, we decided to start with OpenID4VP for disclosures and extend our existing [IRMA protocol](/docs/irma-protocol) to be able to issue SD-JWT VCs in addition to our existing Idemix format.

A nice additional benefit for this is that we can stick close to our existing scheme for now,
which makes adapting the app a much more gradual process.

## Our choice to start from scratch
While there are existing libraries with implementations of the EUDI specifications, we ultimately decided to roll our own implementation.
There are a couple of reasons for this, but the most notable is that integrating a ready-made solution into the Yivi code base would be very challenging.

Our code base for the app currently consists of two major components: `irmaclient` and `irmamobile`. The first is the client implementation of the IRMA protocol, written in Go.
The second is the Flutter app that presents a cross-platform user interface.

We considered using the existing EUDI reference implementations developed by the EU, but ultimately decided not to use them.
They weren't cross-platform, and the code base was scattered across many different packages, making a fork pretty much unworkable if needed.

Rolling our own meant we could make it exactly the way our crypto-agile approach requires while at the same time building a much more detailed knowledge of our core technologies.

This is why we ended up extending `irmago` with EUDI code.

## Using the EUDI verifier server as a reference
In order to be sure our OpenID4VP and SD-JWT VC implementations would be compatible with the spec, we would need an existing verifier to test against.
We decided to opt for the [EUDI reference implementation](https://github.com/eu-digital-identity-wallet/eudi-srv-web-issuing-eudiw-py) since it was open source, easy to set up, and has a high chance of being used in the ecosystem.

We run it both on `https://verifier.openid4vc.staging.yivi.app` as well as in the Docker Compose configuration used during `irmago` integration tests.

## OpenID4VP: A new protocol
Since its inception, Yivi has been built around a very specific set of technologies: the Idemix credential format and the IRMA protocol.
So far, this has worked out very well, but it also means it was not designed with multiple formats and protocols in mind.

Adding a protocol means adapting a significant section of the existing Yivi code base.

Our strategy for this was to build a shell around the existing `irmaclient` code and build a new client side by side with the existing IRMA client inside of this shell.
We kept the API that `irmamobile` uses to talk to `irmaclient` as unchanged as possible to prevent making too many changes at once.

Inside of this shell, we started building an OpenID4VP client.
This client is compatible with the existing interfaces that the app relies on for handling session interactions.
As long as we stick to our current [scheme](/docs/schemes), this will work well, but it will need a significant refactor when we eventually accept credentials outside of our scheme.

When a new session URL is received by the client, it will forward it either to the existing IRMA client or the new OpenID4VP client based on the type of session.


## SD-JWT VC: A new credential format
SD-JWT VC is quite a simple and straightforward credential format, but it's relatively new and still changes from time to time, so an up-to-date implementation in Go was not available.

### Issuing SD-JWT VC over the IRMA protocol
Since we wouldn't be able to develop both OpenID4VP and OpenID4VCI at the same time, we knew we would end up in a situation where either we could issue SD-JWT VC credentials but had no way to disclose them, or we would be able to disclose them but had no way to issue them. A classic chicken and egg problem.

The solution we came up with was to extend the IRMA protocol to allow it to also issue SD-JWT VCs.

As of today, issuers will be able to start issuing their credentials as defined in our scheme both in the classic Idemix format as well as the new SD-JWT VC format using the latest version of the `irma` server.

In order to be able to do this, they need to obtain a new X.509 certificate that's on our new Trust List.

### Key binding & salts: A major limitation
In order to prove a credential instance belongs to a user, SD-JWT uses a system called "key binding".
Here, the wallet provides an asymmetric public key to the issuer, who puts it into the credential.
During disclosure, the wallet uses its corresponding private key to sign a JWT containing the hash over the credential and some parameters provided by the verifier to prove they own the private key corresponding to the public key inside of the credential.

This is quite a nice system, but it has one major flaw: disclosing a credential multiple times means showing the same public key multiple times.
This breaks one of the pillars Yivi was originally built on: multi-show unlinkability.

The only way to (kind of) solve this without moving entirely to Zero-Knowledge Proofs (like Yivi originally uses) is to issue multiple instances of the same credential at the same time and discard an instance after it has been used once.

This has far-reaching consequences for the user experience, which is something we'll talk about next.


## The Yivi app
For our users, not a lot will change in terms of how the [Yivi app](/docs/yivi-app) works.
This is intentional, as we wanted to stay close to our easy-to-understand interface.
The issuance and disclosure flows, including the ability to do issuance during disclosure, remain unchanged.

One thing we did change is the way credential cards look.
This has to do with the fact that SD-JWT VCs come in batches of instances (as discussed above), and these instances are removed after a single use.
If you received 10 instances, you can share them only 10 times.
We struggled with this because the implications for the UX are quite significant.

As you might know, Yivi's own Idemix credentials are infinitely shareable until they expire based on time.
Issuing the same credential in SD-JWT means that the app possesses one format that can be shared infinitely and another format that can only be shared X times.

This leaves us in a situation where a credential can be in a state of both valid and "out of stock," depending on which format is requested.

We don't want to bother our users with this, but in one way or another, we'll have to.

After a lot of consideration, we decided to show the instance count in the UI.
It now shows up next to the expiry date. If it's Idemix only, we show "unlimited"; if an SD-JWT is present, we show the remaining number of disclosures.

When the credential is close to its usage limit, we show this to the user with a button to reobtain the credential, just like we do with regular time-based expiry.

This leaves us with only two UX downsides:
1. The app shows there are 0 credential instances left, but Idemix can still be shared
2. The app doesn't show a decreased number after SD-JWT is shared

## Becoming an SD-JWT VC issuer
If you're already an [issuer](/docs/issuer) using an IRMA server in the Yivi ecosystem, you can become an SD-JWT VC issuer with some minor modifications.
First of all, you'll need to obtain an X.509 certificate that is on our Trust List.

This certificate is on an issuer basis, as defined in our [scheme](/docs/schemes).
This means you can use it to issue the same credentials you already can with your existing Idemix private key.

After you obtained a certificate, you need to upgrade your [IRMA server](/docs/irma-server) to version `0.19` or higher.
More details on how to set it up can be found in the [SD-JWT VC Issuance guide](/docs/sdjwtvc-issuance).

## Becoming an OpenID4VP verifier
We are compatible with a subset of the OpenID4VP standard version 1.0.
In this section, we'll specify what is possible for you and how you can use Yivi with OpenID4VP and SD-JWT.

### Verifier certificate
Before you're allowed to request any attributes, you must possess a valid verifier certificate that is on the Yivi Trust List.
You can obtain one via the Yivi portal.

The certificate contains a JSON value that has some metadata in it, like the organization information, permitted attributes, and a logo.
It is tied to the hostname where the verifier server runs (so the URL the app has to contact for a session).

More details about what features we support and how to set it up can be found in our documentation (coming soon).


## Next up: OpenID4VCI
Now that OpenID4VP is done, our journey to become a [crypto-agile](/docs/crypto-agile-introduction) EUDI-compatible wallet has officially started.
Our next step is to implement the issuance side of the system: the OpenID4VCI protocol.

## Wrap up
As we've seen today, Yivi is well on its way to becoming crypto-agile. For more information about our roadmap, see our [Crypto Agile Introduction](/docs/crypto-agile-introduction).
