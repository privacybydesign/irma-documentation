---
title: Technical overview
---

This document presents a technical overview of the IRMA project.

## IRMA terminology

### Participants

* *IRMA app*: (mobile) application that receives attributes, and can disclose them. Also called *client* as it acts as the client in the IRMA protocol.
* *Verifier* or *service provider*: a party wanting to verify someone's attributes (in order to provide some service).
* *Issuer* or *Identity provider*: a party wanting to issue attributes to someone.
* *Issuer*: uses an Idemix private key in order to issue credentials to a client, when instructed to by an identity provider
* *Requestor*: the service or identity provider that wants to, respectively, verify someone's attributes or issue attributes to them.
* *Scheme manager*: distributes Idemix public keys, credential types and issuer information to clients and requestors; also decides which issuers may join its domain and what credential types they may issue.

### Cryptographic entities

* *Attribute*: a small piece of data, generally containing a statement about the attribute owner (e.g., '> 18 years old').
* *Credential*: a group of attributes, jointly signed by the issuer using an Idemix private key, in an interactive protocol (called the *issuance protocol*) between the issuer and client.
* *Credential type*: each IRMA credential is an instance of a credential type, which determines the names of the contained attributes, its validity period, and by which issuer the credential is issued.
  * *Singleton credential type*: users can store at most one instance of such credential types in her IRMA app.
* *Idemix private-public keypair*: a pair of related keys:
  * *Idemix private key*: used by the issuer to sign a credential in the issuance protocol.
  * *Idemix public key*: used by a verifier when attributes are disclosed to it, in order to establish that the disclosed attributes have been signed using the corresponding Idemix private key.
* *Disclosure proof*: a set of disclosed attributes, along with a proof of knowledge showing that these disclosed attributes originated from a credential that was validly signed by the issuer.
* [*Attribute-based signature*](#attribute-based-signatures): a digital signature, with IRMA attributes cryptographically attached to it, on some document or message.

### Core software projects

* [IRMA mobile app](https://github.com/privacybydesign/irma_mobile): (mobile) application that receives attributes, and can disclose them.
* [`irma` command](irma-cli): contains an IRMA attribute verification and issuance server, scheme management, and more.
* [irmajs](irmajs): javascript library acting as glue between an IRMA server and the requestor's website, allowing the requestor to instruct an API server to issue or verify attributes.

## Overview

IRMA is at its core a set of software projects implementing the Idemix attribute-based credential scheme. An *attribute* is a statement or property about a person, such as "I am over 18 years old" or "my name is John Doe".

These attributes are grouped together in a *credential*. In attribute-based credential schemes such as Idemix, such a credential can be issued to a user by a trusted party called the *issuer*. This issuer creates a digital signature over the credential and its containing attributes using its *private key*. The user receives the credential as well as the issuer's signature in her [IRMA mobile app](https://github.com/privacybydesign/irma_mobile).

After that, the user can disclose these attributes to other parties, who are called *verifiers*, selectively showing some and hiding the other attributes from the credential. The verifier then receives the disclosed attributes, as well as a *proof of knowledge* which proves to the verifier that the user

* knows the attributes from the credential which are not being disclosed
* owns a valid issuer signature over the disclosed attributes and hidden attributes.

The verifier can check the validity of this proof of knowledge using the issuer's *public key* that corresponds with the private key with which the issuer signed the attributes (thus, the verifier must know this public key). The verifier can tell from this that the user has at some point received the disclosed attributes from the trusted issuer. Therefore, it can trust the authenticity of the attributes. (This proof of knowledge does *not* include a full copy of the signature over the attributes, so that even if all attributes of the credential were disclosed simultaneously, the verifier can impossibly use the received attributes and proof of knowledge to disclose these attributes itself to others.)

In addition to attribute disclosure, users can also attach their attributes to messages in an *IRMA attribute-based signature*. This is explained in more detail [below](#attribute-based-signatures).

## Credential types

In IRMA, each credential is an instance of a *credential type*. A credential type specifies (among other things) how many attributes its instances have, what their names are, and by which issuer instances of this credential type are issued. Credential types are not shared between issuers: even if two issuers would issue two credential types with the same name and with the same amount of attributes having the same names, they still are distinct credential types. [Here](https://github.com/privacybydesign/pbdf-schememanager/blob/master/pbdf/Issues/irmatube/description.xml) is an example of such a credential type, defining the "IRMATube" credential type which is issued and verified in [this IRMA demo](https://privacybydesign.foundation/demo/irmaTube/). Schematically, an instance of such a credential type would look as follows.

| Attribute name | Attribute value |
| -------------- | --------------- |
| **type**       | member          |
| **id**         | 123456          |

In this table, the right column are the attribute values which are stored and signed in the credential. The left column contains the attribute names from the credential type.

### Singletons

A credential type can be marked as a *singleton* by the scheme manager. If so the IRMA app will store at most one instance of this credential type simultaneously, and receiving a new one would overwrite any older instance. (Example:  [`pbdf.nijmegen.bsn`](https://privacybydesign.foundation/attribute-index/en/pbdf.nijmegen.bsn.html)) If a credential type is not a singleton (example: [`pbdf.pbdf.diploma`](https://privacybydesign.foundation/attribute-index/en/pbdf.pbdf.diploma.html)), then the user can have any number of instances of that credential type in her IRMA app.

### Special attributes

#### The metadata attribute

In IRMA, each credential always contain a special attribute called the *metadata attribute*, which must always be disclosed whenever other attributes are disclosed from this credential. This metadata attribute contains:

* which credential type this credential is an instance of (from which it follows by which issuer this credential was issued),
* the date at which this credential was issued,
* the expiry date of this credential.

In order to lessen linkability issues (see the [security properties](#irma-security-properties) section below), the issuance and expiry dates are always chosen to fall on the boundary of an *epoch*, which is one week.

#### The secret key attribute

The first attribute of any IRMA credential is always a 256-bit integer which is called the user's *secret key*. The user's IRMA app randomly chooses and stores this integer when it is run for the first time. Whenever it receives a new credential, the app ensures that this number is used as the first attribute, so that all credentials that the app manages share this integer as their first attribute. Contrary to the metadata attribute this attribute is never disclosed; it is even kept hidden from the issuer during issuance. When the user discloses attributes that come from multiple credentials, the proof of knowledge that the IRMA app calculates and sends to the verifier proves multiple facts:

* The app knows a valid issuer signature over each credential from which attributes are currently being disclosed,
* The first attribute from all of these credentials coincide.

From this the verifier can conclude that the credentials from which attributes are being disclosed belong to one and the same person; that is, it defends against users pooling their credentials.

## Schemes

IRMA schemes are documented [here](schemes).

## Issuers

Each IRMA issuer has an Idemix private key, which it must keep secret as it is used when issuing credentials, and a corresponding public key which is distributed to attribute verifiers and IRMA apps in the IRMA scheme. An issuer may issue multiple credential types (and a scheme may contain many issuers).

Issuers cannot independently create credential types and start issuing them to IRMA app users: the credential type must first be included in an [IRMA scheme](schemes) by the scheme manager. In case of the default scheme `pbdf` of the IRMA app, this is the [Privacy by Design Foundation]((https://privacybydesign.foundation/issuance/)).

When verifying IRMA attributes, out of all possible attributes the verifier could ask for, it must decide which attributes suite its purposes best. In order to be able to make this decision, it is important that for each credential type it is clearly documented how the attributes are obtained, and how it is ensured that they indeed belong to the person that receives them. For each credential type in the `pbdf` scheme, the Privacy by Design Foundation documents this [here](https://privacybydesign.foundation/issuance/).

## IRMA PIN codes using the keyshare server

When a user's device containing her IRMA app along with her attributes is lost or stolen, the finder of the phone can potentially abuse the owner's attributes. In order to protect against this, scheme managers may decide to employ an *IRMA keyshare server*. In this case, whenever a credential type that falls under the scheme is used, the user must enter her PIN code before the IRMA session can proceed. The correctness of this PIN code is verified by the keyshare server. When an incorrect PIN code is entered three times in a row, the keyshare server blocks IRMA sessions by refusing to cooperate, for an amount of time that exponentially increases with the amount of consecutive incorrect PIN codes entered. Additionally, users can remotely block their own IRMA app from performing future IRMA sessions on the keyshare server's website, in case their phone is lost or stolen.

The keyshare server's most important function is twofold. It provides a stronger binding of the attributes to their owner, by forcing the correctness of the IRMA PIN code: as long as the user can be trusted to not reveal her PIN code to anyone, the party that receives the attributes can be sure that the person who is disclosing them right now is the same person as the one to which they were issued in the past. Additionally, it provides a way of blocking future IRMA sessions; currently, this feature is only exposed to the users themselves. The price of these advantages is that there is now a single entity that has to cooperate in each IRMA session. This means that whenever the keyshare server is not online, no user can issue or disclose any of the attributes falling under the authority of the relevant scheme. It is thus very important that this component is carefully protected and monitored. Additionally, the keyshare server learns and records a limited amount of data whenever the user performs an IRMA session (how limited this data is is discussed below).

At the Privacy by Design Foundation we believe that the advantages of using a keyshare server far outweigh the disadvantages, so the Foundation's scheme uses a keyshare server. Like all other software, this server is open source.

At a high level keyshare servers work as follows. The user's secret key is split across the user's IRMA app and the keyshare server: both of them hold a part of the secret key. The actual secret key that is effectively used in each credential from this scheme is the sum of these two secret keys. When the user does not enter the correct PIN code the keyshare server will refuse to use its part of the secret key in the IRMA protocol, making it impossible for the session to complete.

In more detail: whenever a scheme is installed in the IRMA app that uses a keyshare server (or when the IRMA app starts for the first time and encounters a hardcoded scheme manager that uses a keyshare server), the user *registers* at the keyshare server, by entering her email address and choosing a PIN code. The IRMA app chooses and stores a random salt of 8 bytes, calculates `SHA256(salt || PIN)`, and sends this along with the user's email address to the keyshare server.

At that moment, the keyshare server chooses and stores a *keyshare* for this user: a 32-bit integer just like the user's secret key. Whenever the users performs an IRMA session using attributes from this scheme, the following happens:

* The IRMA app sends the email address along with `SHA256(salt || PIN)` to the keyshare server. If this hash is not equal to the hash with which the user registered, the keyshare server aborts the session.
* Assuming the user entered the correct PIN code, the keyshare server generates a proof of knowledge for its part of the user's secret key and sends this to the IRMA app.

What happens next depends on the type of the IRMA session:

* When receiving newly issued attributes, the IRMA app sends the keyshare's proof of knowledge to the issuance server, who first verifies its correctness and authenticity. If correct and authentic, it completes the issuance session in such a way that the actual secret key used in the resulting credential is the sum of both secret keys: that of the user and that of the keyshare server.
* When disclosing attributes, the IRMA app merges this proof of knowledge with its own proof of knowledge of its own part of the secret key (and the other hidden attributes) in a certain fashion. The result of this is a valid proof of knowledge of the sum of the two secret keys.

Consequentially, it is cryptographically enforced during issuance that the user will need the keyshare server's cooperation whenever she later wants to disclose attributes from the resulting credential. By refusing to cooperate, the keyshare can completely block the user from using her attributes, which is what happens when the user enters an incorrect PIN code too often.

Additionally, the keyshare server comes with a small website on which users can, after logging in with their email address attribute (which they received upon registering at the keyshare server):

* Instruct the keyshare server to block future IRMA sessions, remotely blocking their own IRMA app;
* Delete their account at the keyshare server (which also blocks future IRMA sessions),
* View a log of earlier IRMA transactions and PIN code entry attempts.

As the keyshare server's contribution to the proof of knowledge of the secret key is passed to the verifier through the IRMA app instead of directly from the keyshare server to the verifier, the keyshare server does not know to whom attributes are being disclosed. In fact, the only thing it learns is which issuer (and which Idemix public keys) are involved; it does not get to see which attributes are being disclosed nor their values, nor which attributes are kept hidden, nor how many attributes from how many credentials. The transaction log that the user sees in the keyshare server's website is correspondingly bare.

Summarizing, the keyshare server increases the binding between the attributes and the user through the PIN code and through the option of revocation in case of loss or theft, at the cost of a decrease in the decentral nature of IRMA and in some of the privacy guarantees. In order to keep the privacy cost as low as possible, using various cryptographic means we have tried to keep the amount of information that the keyshare server learns about the participants as small as possible. Although we are still looking at ways to make the keyshare server still more privacy-friendly, at the Privacy by Design Foundation we believe that this tradeoff is already worth it. Thus, the `pbdf` scheme indeed uses a keyshare server (towards users we call it "MyIRMA"; its website is [here](https://privacybydesign.foundation/myirma/)).

Each scheme manager can decide for itself whether or not to use a keyshare server in its scheme. Currently, however, due to a limitation in the IRMA protocol only one keyshare server can be involved simultaneously in IRMA sessions. This will be solved in future new versions of the IRMA app and the IRMA API server.

Full details on the protocol spoken between the IRMA client and an [IRMA keyshare server](https://github.com/privacybydesign/irma_keyshare_server) is documented [here](keyshare-protocol).

## Attribute-based signatures

Apart from attribute disclosure, IRMA also supports *attribute-based signatures*: a digital signature with IRMA attributes attached to it, on some document or string (more accurately this can generally be any set of bytes, though currently IRMA only support strings). The IRMA app can create such signatures with any of the attributes that it contains. The validity of such a signature can be verified using the Idemix public keys of the issuers of the used attributes, and valid attribute-based signatures can only be created using valid credentials. Contrary to [disclosure proofs](#cryptographic-entities) which are tied to an authentication session, and thus of no more use afterwards, attribute-based signatures are attached to the document that they sign, so their validity is useful as long as the signed document exist. IRMA attribute-based signatures have the same properties as conventional (non-attribute-based) [digital signatures](https://en.wikipedia.org/wiki/Digital_signature) such as non-repudiation, integrity of the signed message, and unforgeability with respect to the issuer private key. In addition, the attributes are cryptographically verifiably attached to the signature and message.

IRMA attribute-based signatures can be used in any case where conventional (digital or conventional "wet") signatures are used and in which it is necessary to know something about the signature creator. For example:

* A doctor could attach his name and "I am a doctor"-attribute to a medical prescription.
* Teachers could sign student grades with their "I am a teacher"-attribute.
* If a bank were to issue bank account numbers as an attribute to bank account owners, then a bank account owner could attach her account number attribute to a statement like "I transfer $10 to account 424242", effectively creating a cheque.

Technically, IRMA attribute-based signatures are very similar to disclosure proofs. As mentioned earlier IRMA disclosures use a challenge-response protocol: the verifier generates a random number called the nonce and sends it to the IRMA app, whose response has to take this nonce into account in a precise fashion (this is achieved using the [Fiat-Shamir heuristic](https://en.wikipedia.org/wiki/Fiat%E2%80%93Shamir_heuristic)). More precisely, the disclosure proof is a digital signature on the nonce that was used; if the nonce was freshly generated then the verifier can be sure that the attribute owner is actually present instead of replaying an earlier or eavesdropped disclosure proof. An IRMA attribute-based signature is the same except that not a nonce but an actual message is signed (or rather its SHA256 hash).

Currently IRMA only supports creating attribute-based signatures on strings, although we plan to support other types of documents as well. They can be created using [irmajs](https://github.com/privacybydesign/irmajs) and verified using [IRMA servers](what-is-irma#irma-servers) almost the same as disclosure proofs. An online demo (using [demo attributes](https://demo.irmacard.org/tomcat/irma_api_server/examples/issue-all.html)) is available [here](https://demo.irmacard.org/tomcat/irma_api_server/examples/sign.html).

## IRMA security properties

* **Credential unforgeability:**
  Only the issuer (that is, the holder of the Idemix private key) can issue credentials that will verify under the Idemix public key. Thus when a verifier receives valid attributes, it can safely assume they were issued by the issuer.

* **Multi-show unlinkability:**
  When a verifier performs two IRMA sessions in which the attributes that it receives are identical, then it cannot tell whether the two IRMA sessions were performed with one user who disclosed the same attributes twice, or with two distinct users. In other words, such sessions are not linkable as coming from the same user. (It is important to note that this property holds only at the cryptographic level; using identifying data from the transport layer such as the user's IP or MAC address verifiers can potentially still link sessions.)

* **Grouping credentials using the private key:**
  When attributes are disclosed coming from multiple credentials, the IRMA app additionally proves that the credentials share the same secret key, and thus that the attributes come from the same user.

* **Eavesdroppers cannot perform replay attacks:**
  When verifying attributes, the verifier first sends a number of random bits called the nonce to the IRMA app, and the IRMA app's reply containing the disclosed attributes and the proofs of knowledge has to fit on this nonce in a precise fashion. Assuming that the verifier never reuses nonces, this means that an eavesdropper cannot replay an IRMA disclosure.

* **Verifiers cannot perform replay attacks:**
  Even if all attributes were disclosed (and the secret key is in fact never disclosed), the IRMA app does not send a complete copy of the credential's signature to the verifier; instead parts of it are hidden using proofs of knowledge. This means that verifiers cannot use what they learn in IRMA disclosures to disclose the received attributes to other verifiers, acting as an IRMA app possessing the attributes that were disclosed to it.

* **No impersonation attacks:**
  The credentials and attributes reside in the IRMA app installation of the users. This is contrary to other identity management systems such as for example "Log in with Facebook": when someone presses such a Facebook login button on some website, it is really Facebook who authenticates on that website on behalf of the user. Consequentially, Facebook can potentially authenticate itself as any of its users to such websites. This is not possible in IRMA.

* **No privacy hotspots:**
  When a user discloses IRMA attributes to a verifier, the attributes are sent directly from the user to the verifier without passing through any central party.

It must be mentioned that these properties only hold assuming that our software contains no bugs that break these properties. For this reason all of the IRMA software is open source so that anyone can verify its correctness. We encourage anyone to inspect the IRMA source code, and inform us of any errors that might lessen security or other aspects of the functionality.

## Other resources

* Website of the [Privacy by Design Foundation](http://privacybydesign.foundation/), the creators and maintainers of IRMA
  * An [introduction to IRMA](https://privacybydesign.foundation/irma-start/) for IRMA app users
  * A general and more complete [introduction to IRMA](https://privacybydesign.foundation/irma-explanation/)
  * [Live IRMA demos](https://privacybydesign.foundation/demo-en/)
* The Android and iOS [IRMA apps](https://privacybydesign.foundation/download-en/)