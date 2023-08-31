---
title: Keyshare protocol
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

This document describes the goals and details of the IRMA keyshare protocol.

## Introduction

The [IRMA mobile app](irma-app.md) allows users to obtain and disclose [IRMA attributes](overview.md#cryptographic-entities), as well as attach them to signed statements. Before such an IRMA session proceeds, the IRMA app may ask the user to enter her IRMA PIN code so that the [requestor](overview.md#participants) can be sure that it is indeed the attribute owner initiating the session (as opposed to, e.g., a thief of the user's phone). The verification of the correctness of the IRMA PIN code, and preventing the session from happening when it is not, is the responsibility of the [IRMA keyshare server](https://github.com/privacybydesign/irma_keyshare_server). In order to do this, it interacts with the IRMA app and possibly the IRMA server in a protocol that we call the *keyshare protocol*. This protocol is documented here.

Each [IRMA scheme](schemes.md) decides whether or not it employs an IRMA keyshare server. If it does, then this keyshare server is involved in any IRMA session that involves attributes that fall under the scheme manager's responsibility.

Upon app installation, the IRMA user *registers* to the keyshare servers of the installed scheme managers. At this point the user chooses her IRMA PIN code. The app additionally generates an ECDSA keypair, of which the public key is sent to the keyshare server, and the corresponding private key is stored exclusively in the phone's Secure Enclave (SE) or Trusted Execution Environment (TEE). Afterwards, whenever the user performs an IRMA session, the user must first enter her IRMA PIN code, after which her IRMA app signs a challenge provided by the keyshare server using its ECDSA private key. Only if the PIN is correct and the challenge is correctly signed will the keyshare server allow the session to proceed.

This page mentions the cryptographical mechanism, but with a focus on the implementation in IRMA. More details as well as a security proof of the keyshare protocol can be found [here](assets/keysharePaper.pdf).

### Goals

The keyshare server must:
- Authenticate a user as being the same person that registered to the keyshare server in the past, just before an IRMA session occurs, using (1) a secret from the phone's SE/TEE and (2) the user's IRMA PIN;
- Block the IRMA session from happening when this authentication fails,
- Allow users to remotely block their IRMA app from performing future IRMA session in case of loss or theft of their phone. That is, the user can *revoke* her own attributes.
- The keyshare server must not learn the values of any of the attributes of any user, and also not to whom the user discloses attributes.

Consequentially, it is insufficient to verify the user's IRMA PIN code locally in the IRMA app, because otherwise a malicious actor could try to bruteforce the PIN of a user and thus gain access to her attributes. Instead we have chosen to modify the cryptography that is used in IRMA sessions in such a way that the keyshare server's contribution to it is necessary for the session to complete, so that the keyshare server can reliably block sessions from happening by refusing to cooperate, if the correct PIN is not entered. Additionally the keyshare server prevents bruteforce attempts on the user's PIN, by rejecting further PIN attempts if the user's PIN is entered incorrectly too many times.

### IRMA secret keys and keyshares

IRMA is an implementation of the Idemix attribute-based credential (ABC) scheme. In such schemes a *credential* is a set of numbers $(k_0, ..., k_n)$ along with a digital signature over this set of numbers, created by the [issuer](https://credentials.github.io/docs/irma.html#participants) using the [issuer's private key](https://credentials.github.io/docs/irma.html#cryptographic-entities). The ABC scheme provides an *attribute disclosure protocol* in which the user can selectively disclose any subset of the attributes $(k_0, ..., k_n)$ to another party (called the *verifier* or *service provider*), in such a way that the verifier is assured of the validity of the issuer's signature over all attributes (including the ones that were not shown).

In IRMA, the first attribute $k_0$ of a credential is always the user's *secret key*. When the user discloses attributes, this secret key is always kept hidden. The *issuance protocol* in which an issuer grants an IRMA credential to a user is such that whenever the user receives a second or third or $n$-th credential, the value of this secret key $k_0$ of the new credential is the same as that of the user's first credential. Consequentially, the first attributes $k_0$ of all credentials of the user have the same value. Then, when the user discloses two attributes that come from two distinct credentials, the user not only proves to the verifier that she owns two valid signatures over the two credentials, but also that the values of the first attributes (i.e. the secret keys) of the two credential coincides. To the verifier, this proves that even though the two attributes come from distinct credentials, they still come from the same IRMA app, and therefore the same user.

Thus each user has her own secret key, namely the integer that serves as the first attribute in each of her credentials. We shall drop the index and call this integer $m$. Recalling that the signed tuple of attributes of a credential is then $(m, k_1, ..., k_n)$, the purpose of the keyshare protocol is to enforce that the tuple of integers that is effectively signed in the issuance protocol is $(m_u + m_k, k_1, ..., k_n)$, where $m_u$ is known to the user and hidden from the keyshare server (along with all other attributes), and $m_k$ is known to the keyshare server and hidden from the user. That is, the user's secret key is *split* into two halves, one of which resides at the keyshare server (hence its name). Consequentially, the cooperation of the keyshare server in IRMA sessions, which necessarily always involve the secret key $m = m_u + m_k$, has become necessary.

### Splitting the secret key across the user and keyshare server

As mentioned, in IRMA the secret key $m$ is always kept hidden from the verifier using [a zero-knowledge proof](zkp.md). Now let $m = m_u + m_k$ with $m_u$ only known to the user, $m_k$ only known to the keyshare server, and $m$ known to neither. We now describe how we can modify the zero-knowledge proof of the secret key in such a way that the user and keyshare server *jointly* prove knowledge of the number $m$, as follows. We refer to the diagram and use the notation of the [page on zero-knowledge proofs](zkp.md). Additionally, set $M = R^m$.

* The user performs steps 2.i and 2.ii normally, generating a random number $w$ and computing the commitment $W = R^w$. Additionally, the user computes $h_W = H(W, P)$.
* Between step 2.ii and step 2.iii, the user commits to $W$ and $P$ towards the keyshare server by sending $h_W$ to it. The keyshare server remembers $h_W$ for later, generates its own random $w_k$ and computes $W_k = R^{w_k}$. It sends $W_k$ back to the user (keeping $w_k$ hidden).
* The user computes the challenge as $c = H(P, WW_k, \eta)$, and computes its response $s = cm + w$ as in step 2.iv.
* Between step 2.iv and step 2.v, the user sends $\eta, s, P, W$ to the keyshare server.
* Using this data, the keyshare server first verifies that the $h_W$ that it received earlier from the user equals $h_W = H(W, P)$. (This forces the user to use the same values of $W$ and $P$ throughout the protocol.) If that is the case, then next the keyshare server computes the exact same challenge $c = H(P, WW_k, \eta)$ as the user did, along with its own response, $s_k = cm_k + w_k$. The keyshare server sends $s + s_k$ to the user.
* The user sends $(c, s + s_k)$ to the verifier as in step 2.v.

The verifier then uses this tuple to verify the proof of knowledge as it normally would. If both the user and the keyshare server follow the protocol, then the verification equation $c = c'$ will hold, so that the verifier will accept. This is effectively a proof of knowledge of the sum $m = m_u + m_k$, in the sense that the messages going back and forth between the user and verifier have exactly the same structure as they would have if they were a proof of knowledge of $m$ - in fact, to the verifier an execution of this modified protocol is completely indistinguishable from a normal one without a keyshare server. Additionally, the protocol has the following properties:

* The keyshare server essentially proves a normal (i.e., non-Fiat-Shamir heuristic) zero-knowledge proof of $m_k$ to the user. Consequentially, the user learns nothing about the number $m_k$.
* As the user does not know the number $m_k$ and gains no knowledge of it even through multiple session with the keyshare server, she can impossibly prove knowledge of the sum $m = m_u + m_k$ if the keyshare server refuses to cooperate.

For these reasons this protocol is very well suited for our aims of making the keyshare server's contributions necessary in IRMA sessions, while simultaneously keeping the amount of information that the keyshare server learns about the user, her activities and her attributes as little as possible.

## The protocol

We now describe the IRMA keyshare protocol. The version of the keyshare protocol documented here is supported by the keyshare server since `v0.14.0` of `irmago`. This is an improvement of an older version of the keyshare protocol, which is documented [here](/docs/v0.11.0/keyshare-protocol). The [IRMA app](app.md) always uses the latest keyshare protocol version that it knows of, but the keyshare server is backwards compatible: it also understands older protocol versions.

### Overview

When the IRMA app runs for the first time, it first registers to the keyshare server as follows. It asks the user for the IRMA PIN that she wishes to use in future sessions, and optionally for her email address. Next, it computes the following cryptographic material:
* An ECDSA keypair inside the phone's SE/TEE, which is later used for challenge-response authentication to the keyshare server.
* A salt: 32 random bytes. Similar to password authentication, this is later used to send a *hashed salted* PIN, that is `SHA256(salt, PIN)`, to the keyshare server, instead of the PIN directly.

Using its ECDSA private key, it then signs the user's email address (if specified), the ECDSA public key, and the user's hashed salted PIN into a JWT, and sends this JWT to the keyshare server. The keyshare server then generates a random username for the user, which is automatically issued to the user as her first attribute. At this point registration is complete in the sense that the user can now receive and disclose attributes. If the user entered her email address a confirmation link is sent to it, which the user must click on to finalize the registration.

When performing an IRMA session, the user and keyshare server use the protocol described above to compute a proof of knowledge of the sum $m = m_u + m_k$, with an important addition: when sending the response $s_k$, the keyshare server always includes a digital signature over this number. The keyshare server's public key with which these signatures can be verified is known to all IRMA participants through the [IRMA scheme](schemes.md).

Now the IRMA protocol is modified as follows.

* The user authenticates to the keyshare server as follows: (1) the app retrieves a challenge from the keyshare server; (2) the user enters her PIN in the IRMA app; (3) using its ECDSA private key from the SE/TEE, the app signs the challenge, hashed salted PIN, and the user's username into a JWT; (4) it sends this JWT to the keyshere server. The keyshare server checks if the user is known, if the JWT validates against the public key with which she registered, and if the PIN is correct; and aborts if not.
* When performing a disclosure or attribute-based signing session, the user engages in the protocol described above with the keyshare server to produce a proof of knowledge of the sum $m = m_u + m_k$, and sends this proof to the verifier.
* During issuance, in the final message of the keyshare server to the user in the keyshare protocol described above, the keyshare server includes a digital signature over the the pair $(c, s + s_k)$. When the user sends $(c, s + s_k)$ to the issuer it includes this signature. The issuer only proceeds with issuance if the keyshare server's signature over $(c, s + s_k)$ is valid.

In this way, the issuer enforces that the user uses the help of the keyshare server in the issuance protocol, and that the resulting credential indeed has $m = m_u + m_k$ as its first attribute. Consequentially, the modified disclosure protocol as described in the second item will succeed, and as the keyshare server's contributions are not directly communicated from the keyshare server to the verifier but only to the user, the keyshare server never learns to whom the user is disclosing attributes.


### Registration

When registering, the IRMA app signs the following message into a JWT with its ECDSA private key, and sends that to `/client/register` at the keyshare server:

```json
{
    "email": "example@example.com",
    "language": "en",
    "pin": "0kO3xbCrWMK1336eKzI3KOKWWogGb/oW4xErUd5rwFI=\n",
    "publickey": "User's ECDSA public key, base64-encoded"
}
```

The email address is optional and may be absent. The `language` indicates the user's preferred language, used for a confirmation mail if the email address is present. Lastly, the `pin` field is computed as `Base64(SHA256(salt, pin))\n` (the trailing newline is there for legacy purposes and will be removed in the future). Note that since the user is not yet known to the keyshare server, this message is self-signed; to validate it the public key will first need to be extracted from the JWT and parsed.

### Authentication

During an IRMA session, authenticating to the keyshare server during the protocol between the IRMA client and keyshare server is done as follows. First, the app retrieves a challenge from the keyshare server at `POST /users/verify_start`. Next it computes the PIN as `Base64(SHA256(salt, pin))\n`, and using its ECDSA private key it signs the following message into a JWT, and sends that to the keyshare server at `POST /user/verify/pin_challengeresponse`:

a message like the following

```json
{
    "id": "FVP1kMRcF2s",
    "pin": "0kO3xbCrWMK1336eKzI3KOKWWogGb/oW4xErUd5rwFI=\n",
    "challenge": "the challenge retrieved earlier"
}
```
If the JWT validates against the user's public key and the PIN is correct, then the user has successfully authenticated. The keyshare server then returns an object like the following:
```json
{
    "status": "succes",
    "message": "<authentication JWT>"
}
```

Here, `success` indicates to the user that authentication was succesful. The `message` field contains a signed JWT that is used as authentication in the rest of the protocol. This JWT has an expiry of 15 minutes. The contents of this JWT is like the following:

```json
{
    "iss": "name_of_keyshare_server",
    "sub": "auth_tok",
    "exp": 1523914956,
    "token_id": "a token identifying the user",
    "iat": 1523914056
}
```

### The keyshare protocol

At the start of the keyshare protocol, the client needs to inform the keyshare server which IRMA public keys are involved, in the sense that they are necessary to verify the attributes that are being disclosed. An issuer may have multiple public keys, indexed by integers starting at 0, so the string `"irma-demo.IRMATube-1"` refers to the second public key of the `IRMATube` issuer.

The keyshare server's API endpoints are the following.

*   `POST /prove/getCommitments`: The client sends a list of public key identifiers (e.g. `["irma-demo.IRMATube-1"]`) to the keyshare server (along with the authentication JWT described above in a HTTP header). If the user is authenticated and the public keys are known to the keyshare server, the keyshare server reacts with a commitment to its part of the secret key, for each of the specified public keys:

    ```json
    {
        "c": {
            "irma-demo.IRMATube-1": {
                "P": 121212,
                "Pcommit": 909090,
            }
        }
    }
    ```
    Here `P ` $ = R^{m_k}\mod n$ and `Pcommit ` $=W_k$ is the commitment mentioned above, `Pcommit ` $= W_k = R^{w_k} \mod n$, with $R$ and $n$ coming from the second public key of the `irma-demo.IRMATube` issuer.
*  `POST /prove/getResponse`: after calculating the challenge, the client posts it to the keyshare server, who replies with a signed JWT with the following as content:

    ```json
    {
        "iss": "name_of_keyshare_server",
        "sub": "ProofP",
        "ProofP": {
            "P": 121212,
            "c": 343434,
            "s_response": 565656
        },
        "iat": 1523914056
    }
    ```
    `s_response` is the response integer $s_k$ in the Schnorr zero-knowledge proof.

This ends the involvement of the keyshare server in the IRMA session. In case of attribute disclosures or attribute-based signatures, the client next merges the keyshare server's contributions `Pcommit` and `s_response` into its proof of knowledge of the secret key. In case of issuance this is skipped; instead the entire JWT from the final endpoint is sent to the issuer alongside the client's own proof of knowledge of its part of the secret key.

The structure of the message in which the client sends the keyshare server's signed response to the issuance session currently unfortunately supports at most one keyshare server simultaneously. This means that it is impossible for two (or more) issuers falling under two distinct scheme managers that  use distinct keyshare servers to both issue credential simultaneously to a client (i.e., within one IRMA session). Although this is an unlikely scenario, this will still be fixed in a future version of the protocol. Although all other issuance or disclosure sessions involving multiple keyshare server simultaneously are theoretically already possible, currently no IRMA client yet supports being registered to more than one keyshare server at once.

### Changing the PIN

When the user wants to change her IRMA PIN, using her ECDSA private key she signs the following message into a JWT, and sends that to `POST /user/change/pin`:

```json
{
    "id": "FVP1kMRcF2s",
    "oldpin": "0kO3xbCrWMK1336eKzI3KOKWWogGb/oW4xErUd5rwFI=\n",
    "newpin": "IjBrTzN4YkNyV01LMTMzNmVLekkzS09LV1dvZ0diL29=\n"
}
```

The keyshare server then looks up the user given the specified `id`, and checks if the `oldpin` is correct. If so it changes the user's PIN to the `newpin`, and responds with the following:
```json
{"status": "success"}
```
(That is, the same JSON message as `POST /user/verify/pin` but without an authentication JWT).

In addition to these API endpoints, the keyshare server exposes a number of other endpoints that are used by the [MyIRMA webclient](https://github.com/privacybydesign/irma_keyshare_webclient), which allows the IRMA user to manage her registration at the keyshare server. These endpoints are not documented here.
