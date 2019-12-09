---
title: Coming: revocation
---

<script type="text/x-mathjax-config">
  MathJax.Hub.Config({
    extensions: ["tex2jax.js"],
    jax: ["input/TeX", "output/HTML-CSS"],
    tex2jax: {
      inlineMath: [ ['$','$'], ["\\(","\\)"] ],
      displayMath: [ ['$$','$$'], ["\\[","\\]"] ],
      processEscapes: true
    },
    "HTML-CSS": { fonts: ["TeX"] }
  });
</script>
<script type="text/javascript" async src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/MathJax.js"></script>

Revocation will add to IRMA issuers the ability to revoke a credential that it previously issued to an IRMA app, when the contained attributes are no longer accurate. This allows IRMA attribute verifiers to establish that the attributes it received are still factual, as otherwise the credential would have been revoked by the issuer.

This page explains in detail how revocation is implemented in IRMA and what it means to requestors and app users, on three levels:
* In the first part of the section below, we give a summarizing overview fitting in one page.
* In the [API section](#api) we give a much more expansive explanation, including the new revocation API for issuers and verifiers.
* In the [cryptography section](#cryptography) we explain the cryptographic mechanism enabling revocation.

> This page gives an overview of the current state of the revocation implementation in IRMA. It is not yet finished, and its contents are not yet final and subject to change.

## Overview

Revocation in IRMA is an implementation of the RSA-B scheme from ["Accumulators with applications to anonymity-preserving revocation"](https://eprint.iacr.org/2017/043.pdf) by Baldimtsi et al, which in turn is based on ["Dynamic accumulators and application to efficient revocation of anonymous credentials"](http://static.cs.brown.edu/people/alysyans/papers/camlys02.pdf) by Camenisch et al. Using this scheme the app can prove nonrevocation of its credential in zero-knowledge, preserving [unlinkability of multiple disclosures](overview.md#irma-security-properties) of the attributes within the credential.

In IRMA, revocation is enabled per credential type in the IRMA scheme. If so, when properly configured (more on that [below](#preparation)) the issuer's IRMA server will issue revocation-enabled credentials of that type. During disclosures the IRMA app can then prove nonrevocation (but it will only do so if explicitly asked for by the requestor).

In short, revocation works as follows.

* **Key generation**: The issuer generates an **accumulator** and makes it available to all IRMA participants (i.e. requestors and apps; more on how this is done later). This accumulator changes value whenever the issuer revokes a credential.
* **Issuance**: If the issuer issues a credential for which revocation is enabled in the scheme, then along with the credential the issuer computes a **nonrevocation witness**, consisting of two large integers.  This witness is valid against the issuer's current accumulator (like a signature over a message can be valid against a public key). One of these integers is also included in the credential as a new **revocation attribute** (hidden in de IRMA app GUI), binding the witness to the credential. During issuance, the issuer stores the revocation attribute for this credential in a database for later revocation.
* **Disclosure**: If the requestor asks for a nonrevocation proof for a given credential type and the app has a revocation-enabled credential instance of that type, then along with the disclosed attributes the client sends to the requestor a **nonrevocation proof**, which proves in zero knowledge to the requestor that the witness of the credential is valid against the issuer's current accumulator. From this the requestor infers that the credential is not revoked.
* **Revocation**: When the issuer wants to revoke a credential, it first looks up in its database the revocation attribute for that credential that it stored after issuance. Using this, it (1) updates its accumulator to a new value, and (2) makes available to all IRMA participants a **revocation update message**, consisting of the new accumulator and the revocation attribute of the revoked credential. IRMA apps containing (non-revoked) credentials use these update messages to update their witness, so that it becomes valid to the new accumulator. This update algorithm is such that it always fails for the witness of the revoked credential, so that the containing app can no longer prove nonrevocation.

Computing a nonrevocation proof for a credential is much more expensive than just computing a disclosure proof out of that credential. If the user has a revocation-enabled credential then proving nonrevocation is not required; instead she can also just normally disclose attributes from the credential, without using the witness, which is much cheaper. For this reason the app will only prove nonrevocation for a credential type if the requestor explicitly requests it. Requestors should only request nonrevocation proofs when it is really necessary for them to establish that they received nonrevoked attributes.

In the papers linked to above (and generally in the scientific literature on revocation), the party that is able to revoke credentials is called the **revocation authority**, which is not necessarily the same as the party that issues credentials. Within IRMA we have decided to endow the issuer with this responsibility, i.e. the issuer is also the revocation authority for revocation-enabled credential types, because conceptually and technically this simplifies many details.

> In the remainder of this post when we refer to the requestor, issuer, or verifier, we generally refer to the IRMA server software implementing APIs for those parties. The term "IRMA server" itself refers to all variants of the IRMA server: 
> * The [`irmaserver` Go library](irma-server-lib.md);
> * Bindings to that library from other languages; 
> * The [`irma server`](irma-server.md) daemon.

### Revocation updates

Whenever the issuer revokes a credential, updating its accumulator, it publishes a revocation update message as explained above, which apps require to update their witness so that it is valid against the new accumulator. Accumulators are labeled with an index which is increased whenever the issuer makes a new accumulator by revoking. Apps use the index keep track of against which accumulator their witness is valid in the chain of all past accumulators, and thus how many update messages it needs to obtain and apply. The app requires all of update messages that it has not already received and applied; if it misses one or more of them it cannot update its witness and it is no longer able to compute nonrevocation proofs for the witness's credential. If that happens but the verifier requires a nonrevocation proof, then the user is unable to disclose attributes from the credential.

It is thus crucial that the set of update messages is always available to each IRMA app. In IRMA, the issuer is responsible for ensuring that all update messages and the latest accumulator are available. To that end, the IRMA server exposes these messages through new HTTP endpoints, if so configured. For each revocation-enabled credential type, at least one URL to such an IRMA server instance must be included within the credential type in the scheme.

If within an IRMA session a requestor requests revocation for a given credential type but the app's witness is out of date (i.e. credentials have been revoked and the accumulator changed value since the app last updated), then before the app can prove nonrevocation it needs to update its witness so that it becomes valid against the latest accumulator. If the app would have to contact the issuer's IRMA server to download updates whenever that happens, then the issuer could infer from its logs that the user is updating probably because she now wants to disclose attributes, harming the user's privacy towards the issuer. In order to prevent this, whenever a requestor requests a nonrevocation proof for a given credential type in a session request, it is required to include the last few revocation update messages for that credential type with the session request. The app uses those to update its witness, if it is not too far behind. The IRMA server will automatically include the required amount of update messages when it sends the session request to the app during the IRMA protocol. (If the app is too far behind then it will need to contact the issuer to download the updates that it did not received from the requestor in the session request. The IRMA app will do this periodically, i.e. outside of IRMA sessions, for all of its witnesses.)

#### Revocation update chain

Whenever a credential is revoked and the accumulator changes value, its index is incremented. If an app has a witness at index $i$ but the current accumulator $\nu_j$ has index $j$, then the app requires $(e_i,\dots,e_j,\nu_j)$ to update its witness to the latest index $j$. As soon as another credential is revoked and the current accumulator becomes $\nu_{j+1}$, the old accumulator $\nu_j$ is no longer needed. Thus the revocation attributes $e_i$ naturally form a chain, headed with $\nu_j$.

A requestor by itself only needs the accumulator $\nu_j$ against which the app has proved nonrevocation in order to verify the proof, and not necessarily the revocation attributes $e_j$. However, they will still fetch these from the issuer's IRMA server in order to pass them on to apps during IRMA sessions.

### Issuer responsibilities

The issuer of a revocation-enabled credential type must:

* Store all revocation update messages in a database in order to be able to offer these to other IRMA participants needing them;
* Offer the revocation update messages to other IRMA participants through a HTTP API;
* Store all revocation attributes of each revocation-enabled credential in a database during issuance, as the revocation attribute is necessary during revocation;
* Revoke a credential when necessary by updating the accumulator and adding a revocation update message.

If the server hosting the revocation update messages is unreachable, then the requestor and app cannot update their accumulator and witness to the latest version. In that case nonrevocation can only be proved against the last known accumulator, from before the issuer's server became unreachable. 

> In the event that the issuer's server is unreachable and the requestor's IRMA server cannot update its accumulator to the latest version, then the requestor's IRMA server will accept nonrevocation proofs from the app against its last known accumulator. This results in a time window in which nonrevocation is not guaranteed. If that time window is longer than a configurable maximum the server will report the length of the nonrevocation window to the requestor, but still accept the attributes.

The only possible alternative behaviour would be for the requestor to not accept the attributes, but we want to avoid burdening the user with the consequences of the problem; she would then no longer be able to do whatever she wanted to do with her attributes. Instead it is the issuer's responsibility to always keep its server online so that this does not happen; and when it does go offline, to restore it as soon as possible. The shorter it is offline, the smaller the "nonrevocation window" and the smaller the problem.

Before revocation is enabled for a given credential type, revocation-specific public and private key material has to be included in the IRMA public and private key of the issuer of the credential type. The [`irma` binary](irma-cli.md) will do so automatically for new keypairs and it will also be able to augment existing keypairs.

### Scalability

## API

### Preparation

#### Enabling revocation in the scheme

Revocation for a credential type is enabled in the scheme by including at least one `RevocationServer` XML tag in its `description.xml`:
```xml
<IssueSpecification version="4">
  <RevocationServers>
    <RevocationServer>http://example.com/</RevocationServer>
  </RevocationServers>
  <!-- ... -->
</IssueSpecification>
```
See for example [this demo credential type](https://github.com/privacybydesign/irmago/blob/revocation/testdata/irma_configuration/irma-demo/MijnOverheid/Issues/root/description.xml#L19). Specifying more than one URL allows IRMA requestors to fallback to other URLs when one of them is offline.

#### Configuring `irma server` for revocation

The primary new responsibility for an issuer of a revocation-enabled credential type is to maintain the [revocation update chain](#revocation-update-chain) $(...,e_{i-1},e_i,\nu_i)$. Concretely:
1. Offering parts of this chain to apps and requestors through HTTP endpoints.
2. Storing an **issuance record** for each issued credential, containing its `revocationKey` and revocation attribute $e$.
3. Revoking credentials, adding to the revocation update chain.

The IRMA server can handle each of these tasks, using a SQL database to store the revocation update chain and issuance records in. One IRMA server can perform any or all of these tasks. The server of task 1 needs to be publically reachable from the internet, but servers 2 and 3 need not be.

### Issuance

When issuing a revocation-enabled credential to a user, the issuer includes a `revocationKey` for each credential in the session request. For example:
```json
{
  "@context": "https://irma.app/ld/request/issuance/v2",
  "credentials": [{
    "credential": "irma-demo.MijnOverheid.root",
    "attributes": { "BSN": "12345" },
    "revocationKey": "bsn-12345"
  }],
}
```

The state that would be needed during revocation (in particular, the revocation attribute of this credential) is stored in the database with the `revocationKey` acting as primary key: when later this credential needs to be revoked the issuer can refer to it out of all issued credentials using its `revocationKey`. 

### Disclosure

Requestors can request nonrevocation proof for a given credential type by including it in the new `revocation` array in the session request:

```json
{
  "@context": "https://irma.app/ld/request/disclosure/v2",
  "disclose": [[[ "irma-demo.MijnOverheid.root.BSN" ]]],
  "revocation": [ "irma-demo.MijnOverheid.root" ]
}
```
This instructs the IRMA server to only accept the attributes if the app includes a valid nonrevocation proof for all instances of `irma-demo.MijnOverheid.root` out of which it discloses attributes. If a credential type is not listed there and the app has a revocation-enabled credential of that type, then it will not include a nonrevocation proof.

Since attribute disclosures can occur during [any of the three session types](session-requests.md#disclosure-requests) (disclosure, attribute-based signatures, issuance), the `revocation` key can be included in the session requests of any type.

> Pre-revocation IRMA servers cannot verify disclosures from revocation-enabled credentials, even if no nonrevocation proof is included by the app. In this case version negotiation between the app and server will fail and the session will abort. Requestors should update their IRMA servers before revocation support lands in the IRMA app.

The IRMA server of the requestor obtains new accumulator update messages in one of two possible ways: either they are POSTed to them so that the server is always up to date, or it periodically fetches them from the `RevocationServer` specified in the credential type in the scheme. Either way, when the IRMA app connects to the IRMA server (e.g. after scanning the QR code), for each credential type of which nonrevocation proofs are requested in the session request, the server looks up in its own memory or database (1) the last accumulator that it knows and (2) a certain amount of the most recent update messages, and it includes these in the session request that it sends to the IRMA app.

The server will accept the nonrevocation proof of the app if the proof is valid against either the accumulator that it included in the session request, or a newer one. The app always includes the accumulator against which it proved nonrevocation with the nonrevocation proof, so that during verification it is never necessary to retrieve accumulators from the issuer; by including the accumulator the response of the app contains all information required to verify it.

If during disclosure the requestor asks for a nonrevocation proof of a given credential type, but the app only posesses credentials of that type that do not support revocation (i.e., no witnesses were included with them during issuance), then the app will abort as it is not able to fulfill the requestor's request. However, as the issuer starts issuing revocation-enabled credentials the ratio of credentials that don't versus do support revocation will only gradually increase. Consequentially:

> Requestors should not immediately request nonrevocation proofs during disclosures when revocation has been enabled in the scheme for a credential type, or at least assist the user in obtaining new, revocation-enabled credentials.

### Revocation

The API that the IRMA server exposes for revoking previously issued credentials is similar to the API for starting and managing IRMA sessions:
* A new revocation endpoint is available as a function on the [`irmaserver` Go library](irma-server-lib.md), and as a corresponding HTTP endpoint in the `irma server`.
* Similar to session request data structures, (e.g. [`DisclosureRequest`](https://godoc.org/github.com/privacybydesign/irmago#DisclosureRequest)), revocation is initiated by a `RevocationRequest` data structure identified as such by a [JSON-LD](https://json-ld.org/) `@context` tag (having constant value `https://irma.app/ld/request/revocation/v1`).
* As with ordinary session requests, when the `no-auth` setting is disabled in the `irma server` configuration this request has to be authenticated using one of the [existing authentication methods](irma-server.md#requestor-authentication) (i.e., by including a preshared `token` in a HTTP header or by signing the request into a JWT using `hmac` or `publickey`).
* Each requestor configured in the `irma server` can be endowed with permission to revoke specific credential types (possibly in addition to [permissions to issue or verify attributes](irma-server#permissions)). If `no-auth` is disabled, and the revocation request can be succesfully authenticated as originating from a requestor present in the `irma server` configuration, and that requestor is authorized to revoke the credential type mentioned in the request, then the revocation command is executed and the credential is revoked.

For example, the following `RevocationRequest` instructs the server to revoke the `irma-demo.MijnOverheid.root` instance to which it previously assigned `bsn-12345` as `revocationKey` during issuance.

```json
{
  "@context": "https://irma.app/ld/request/revocation/v1",
  "type": "irma-demo.MijnOverheid.root",
  "revocationKey": "bsn-12345"
}
```

## Cryptography

The IRMA issuer private key is $(p', q')$ where $p, q$ are both [safe primes](https://en.wikipedia.org/wiki/Safe_prime): if written as $p' = 2p+1$ and $q' = 2q+1$, then $p$ and $q$ are also prime. The issuers uses this private key for issuing attributes as well as for revoking. The corresponding IRMA issuer public key contains the modulus $n = p'q'$. This modulus defines the group $QR_n = (\mathbb{Z}/n\mathbb{Z})^2$ of quadratic residues within the integers modulo $n$, in which both the Idemix and the revocation cryptography takes place. For signing various revocation related messages the issuer additionally generates an ECDSA public/private keypair. These are included in the existing IRMA private/public keys.

### Issuance
The current accumulator is a number $\nu \in QR_n$. The first accumulator is randomly chosen by the issuer from $QR_n$. During issuance, the issuer
  1. generates a prime $e$,
  2. embeds the prime $e$ as an attribute within the credential being issued,
  3. uses its private key to compute $u = \nu^{1/e\bmod pq}$, and sends the tuple $(u,e)$ to the app along with the credential,
  4. stores the number $e$ in a database for later revocation.

### Disclosure
The revocation witness is the tuple $(u, e)$. By definition it is valid only if $u^e = \nu \bmod n$. When using revocation, the app now proves the following to the verifier:
* "I possess a valid credential containing the disclosed attributes as well as an undisclosed attribute $e$."
* "I know a number $u$ which is such that $u^e = \nu \bmod n$."

The app proves this in zero-knowledge, meaning that the verifier can infer nothing from this proof except the above two facts. In particular, the proof hides the undisclosed attributes as well as $u$ and $e$. This provides unlinkability, as it ensures that a later session using the same credential and same witness cannot be linked to earlier ones. From the fact that the witness is valid, the verifier infers that the witness's credential is not revoked.

The app includes the accumulator $\nu$ signed by the issuer against which it proved nonrevocation with its nonrevocation proof. The verifier accepts if this included accumulator is validly signed by the issuer; if the nonrevocation proof is valid against that accumulator; and if the accumulator is the same or newer than its own copy.

### Revocation
Henceforth, we label the current accumulator and witnesses with an index $i$, so the current accumulator value is $\nu_i$. If the issuer wants to revoke a credential it first looks up in its database the revocation attribute $\tilde{e}$ that it used for that credential (we use a tilde to distinguish this $\tilde{e}$ from the revocation attributes $e$ of other apps wanting to update their own (nonrevoked) witness, see below). Then it uses its private key to compute the new accumulator value as follows:

<span style="padding-left: 3em"/> $\displaystyle \nu_{i+1} = \nu_{i}^{1/\tilde{e}\bmod pq}$

The update message consists of $(\nu_{i+1}, \tilde{e})$; the issuer signs this using its ECDSA private key and then offers it to others using a HTTP API. Apps and requestors only use update messages if it is validly signed, confirmed using the ECDSA public key of the issuer of the credential type.

Apps having a (nonrevoked) credential with witness $(u_i, e)$ (satisfying $u_i^{e} = \nu_i$) first compute the numbers $a, b$ which are such that $ae + b\tilde{e} = 1$, using the [Extended Euclidean algorithm](https://en.wikipedia.org/wiki/Extended_Euclidean_algorithm), and then they update their witness as follows:

<span style="padding-left: 3em"/> $\displaystyle u_{i+1} = u_i^b\nu_{i+1}^a$

This is valid against the new accumulator $\nu_{i+1}$:

<div style="padding-left: 3em; padding-bottom: 1em"/>
$
  \begin{eqnarray*}
  u_{i+1}^{e}
  &=& (u_i^b\nu_{i+1}^a)^{e}
   = u_i^{be}\nu_{i+1}^{ae} \\
  &=& \nu_i^{b}\nu_{i}^{ae/\tilde{e}}
   = (\nu_i^{\tilde{e}}\nu_{i}^{ae})^{1/\tilde{e}}
   = (\nu_i^{\tilde{e}+ae})^{1/\tilde{e}} \\
  &=& \nu_i^{1/\tilde{e}}
   = \nu_{i+1}
  \end{eqnarray*}
$
</div>

(The $\bmod n$ after each equality sign is implied.) The revoked credential having revocation attribute $\tilde{e}$ cannot use this algorithm and update message $(\nu_{i+1}, \tilde{e})$ to compute a new witness, as in this case there exist no integers $a, b$ such that $a\tilde{e} + b\tilde{e} = 1$. In fact, [one can prove that](http://static.cs.brown.edu/people/alysyans/papers/camlys02.pdf) knowing only $\nu_i$, $\nu_{i+1} = \nu_{i}^{1/\tilde{e}}$ and $\tilde{e}$, by the [Strong RSA assumption](https://en.wikipedia.org/wiki/Strong_RSA_assumption) which is used by both Idemix and the RSA-B accumulator scheme, *no* efficient algorithm can compute the correct witness $u_{i+1} = \nu_{i+1}^{1/\tilde{e}} = \nu_{i}^{1/\tilde{e}^2}$.

Thus the app owning the revoked credential has no way to compute a new witness on its own without the issuer private key. Since the app no longer posesses a valid witness, it can no longer prove that it does, i.e., construct a nonrevocation proof: the credential is revoked.
