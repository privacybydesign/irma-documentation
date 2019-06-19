---
title: Keyshare protocol
id: version-v0.2.0-keyshare-protocol
original_id: keyshare-protocol
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

The [IRMA mobile app](https://github.com/privacybydesign/irma_mobile) allows users to obtain and disclose [IRMA attributes](overview#cryptographic-entities), as well as attach them to signed statements. Before such an IRMA session proceeds, the IRMA app may ask the user to enter her IRMA PIN code so that the [requestor](overview#participants) can be sure that it is indeed the attribute owner initiating the session (as opposed to, e.g., a thief of the user's phone). The verification of the correctness of the IRMA PIN code, and preventing the session from happening when it is not, is the responsibility of the [IRMA keyshare server](https://github.com/privacybydesign/irma_keyshare_server). In order to do this, it interacts with the IRMA app and possibly the IRMA API server in a protocol that we call the *keyshare protocol*. This protocol is documented here.

Each [IRMA scheme](schemes) decides whether or not it employs an IRMA keyshare server. If it does, then this keyshare server is involved in any IRMA session that involves attributes that fall under the scheme manager's responsibility.

Upon app installation, the IRMA user *registers* to the keyshare servers of the installed scheme managers. At this point the user chooses her IRMA PIN code. Afterwards, whenever the user performs an IRMA session, the user must first enter her IRMA PIN code. Only if the PIN is correct will the keyshare server allow the session to proceed.

### Goals

The keyshare server must:
- Authenticate a user as being the same person that registered to the keyshare server in the past, just before an IRMA session occurs,
- Block the IRMA session from happening when this authentication fails,
- Allow users to remotely block their IRMA app from performing future IRMA session in case of loss or theft of their phone. That is, the user can *revoke* her own attributes.
- The keyshare server must not learn the values of any of the attributes of any user, and also not to whom the user discloses attributes.

The latter two points imply that it is insufficient to verify the user's IRMA PIN code locally in the IRMA app, because the IRMA app should not be trusted: the user could create a malicious version that does not check the IRMA PIN. Instead we have chosen to modify the cryptography that is used in IRMA sessions in such a way that the keyshare server's contribution to it is necessary for the session to complete, so that the keyshare server can reliably block sessions from happening by refusing to cooperate.

### IRMA secret keys and keyshares

IRMA is an implementation of the Idemix attribute-based credential (ABC) scheme. In such schemes a *credential* is a set of numbers $(k_0, ..., k_n)$ along with a digital signature over this set of numbers, created by the [issuer](https://credentials.github.io/docs/irma.html#participants) using the [issuer's private key](https://credentials.github.io/docs/irma.html#cryptographic-entities). The ABC scheme provides an *attribute disclosure protocol* in which the user can selectively disclose any subset of the attributes $(k_0, ..., k_n)$ to another party (called the *verifier* or *service provider*), in such a way that the verifier is assured of the validity of the issuer's signature over all attributes (including the ones that were not shown).

In IRMA, the first attribute $k_0$ of a credential is always the user's *secret key*. When the user discloses attributes, this secret key is always kept hidden. The *issuance protocol* in which an issuer grants an IRMA credential to a user is such that whenever the user receives a second or third or $n$-th credential, the value of this secret key $k_0$ of the new credential is the same as that of the user's first credential. Consequentially, the first attributes $k_0$ of all credentials of the user have the same value. Then, when the user discloses two attributes that come from two distinct credentials, the user not only proves to the verifier that she owns two valid signatures over the two credentials, but also that the values of the first attributes (i.e. the secret keys) of the two credential coincides. To the verifier, this proves that even though the two attributes come from distinct credentials, they still come from the same IRMA app, and therefore the same user.

Thus each user has her own secret key, namely the integer that serves as the first attribute in each of her credentials. We shall drop the index and call this integer $m$. Recalling that the signed tuple of attributes of a credential is then $(m, k_1, ..., k_n)$, the purpose of the keyshare protocol is to enforce that the tuple of integers that is effectively signed in the issuance protocol is $(m_u + m_k, k_1, ..., k_n)$, where $m_u$ is known to the user and hidden from the keyshare server (along with all other attributes), and $m_k$ is known to the keyshare server and hidden from the user. That is, the user's secret key is *split* into two halves, one of which resides at the keyshare server (hence its name). Consequentially, the cooperation of the keyshare server in IRMA sessions, which necessarily always involve the secret key $m = m_u + m_k$, has become necessary.

### Splitting the secret key across the user and keyshare server

As mentioned, in IRMA the secret key $m$ is always kept hidden from the verifier using [a zero-knowledge proof](zkp). Now let $m = m_u + m_k$ with $m_u$ only known to the user, $m_k$ only known to the keyshare server, and $m$ known to neither. We now describe how we can modify the zero-knowledge proof of the secret key in such a way that the user and keyshare server *jointly* prove knowledge of the number $m$, as follows. We refer to the diagram and use the notation of the [page on zero-knowledge proofs](zkp).

* After step 2.2, the user asks the keyshare server to generate its own random $w_k$ and compute $W_k = R^{w_k}$. The keyshare server keeps $w_k$ hidden but sends $W_k$ to the user.
* The user computes the challenge as $c = H(P, WW_k, \eta)$, and then sends $c$ to the keyshare server.
* The keyshare server computes $s_k = cm_k + w_k$ and sends this number to the user.
* Instead of sending $(c,s)$ to the verifier in step 2.5, the user sends $(c, s + s_k)$.

The verifier then uses this tuple to verify the proof of knowledge as it normally would. If both the user and the keyshare server follow the protocol, then the verification equation $c = c'$ will hold, so that the verifier will accept. This is effectively a proof of knowledge of the sum $m = m_u + m_k$, in the sense that the messages going back and forth between the user and verifier have exactly the same structure as they would have if they were a proof of knowledge of $m$ - in fact, to the verifier an execution of this modified protocol is completely indistinguishable from a normal one without a keyshare server. Additionally, the protocol has the following properties:

* The keyshare server essentially proves a normal (i.e., non-Fiat-Shamir heuristic) zero-knowledge proof of $m_k$ to the user. Consequentially, the user learns nothing about the number $m_k$.
* As the user does not know the number $m_k$ and gains no knowledge of it even through multiple session with the keyshare server, she can impossibly prove knowledge of the sum $m = m_u + m_k$ if the keyshare server refuses to cooperate.

For these reasons this protocol is very well suited for our aims of making the keyshare server's contributions necessary in IRMA sessions, while simultaneously keeping the amount of information that the keyshare server learns about the user, her activities and her attributes as little as possible.

## The protocol

### Overview

We now describe the IRMA keyshare protocol at a high level. When the IRMA app runs for the first time, it registers to the keyshare server, by asking the user for the IRMA PIN that she wishes to use in future sessions, and optionally for her email address. It sends these to the keyshare server. The keyshare server then generates a random username for the user, which is automatically issued to the user as her first attribute. At this point registration is complete in the sense that the user can now receive and disclose attributes. If she entered her email address on registration a confirmation link is sent to it, and if the user clicks on it then the keyshare server issues an email address attribute to the user, and stores the email address.

When performing an IRMA session, the user and keyshare server use the protocol described above to compute a proof of knowledge of the sum $m = m_u + m_k$, with an important addition: when sending the response $s_k$, the keyshare server always includes a digital signature over this number. The keyshare server's public key with which these signatures can be verified is known to all IRMA participants.

Now the IRMA protocol is modified as follows.

* The user authenticates to the keyshare server, by entering her PIN in the IRMA app, which sends it along with the user's username at the keyshare server to the keyshare server. The keyshare server checks if the user is known and if the PIN is correct, and aborts if not.
* When performing a disclosure or attribute-based signing session, the user engages in the protocol described above with the keyshare server to produce a proof of knowledge of the sum $m = m_u + m_k$, and sends this proof to the verifier.
* When issuing the user does the same, except for computing and sending the sum $s + s_k$ in the final step of the protocol described above. Instead, the user sends $s$ and $s_k$, along with the keyshare server's signature over $s_k$, separately to the issuer. The issuer then checks the signature over $s_k$, and computes the sum $s + s_k$ which it uses for checking the proof of knowledge.

In this way, the issuer enforces that the user uses the help of the keyshare server in the issuance protocol, and that the resulting credential indeed has $m = m_u + m_k$ as its first attribute. Consequentially, the modified disclosure protocol as described in the second item will succeed, and as the keyshare server's contributions are not directly communicated from the keyshare server to the verifier but only to the user, the keyshare server never learns to whom the user is disclosing attributes.


### Registration

When registering, the IRMA app POSTs a message like the one below to the to `/api/v1/client/register` at the keyshare server:

```json
{
    "email": "example@example.com",
    "language": "en",
    "pin": "0kO3xbCrWMK1336eKzI3KOKWWogGb/oW4xErUd5rwFI=\n",
}
```

The email address is optional and may be absent. The `language` indicates the user's preferred language, used for a confirmation mail if the email address is present. Lastly, the `pin` field is computed as `Base64(SHA256(nonce, pin))\n` (the trailing newline is there for legacy purposes and will be removed in the future).

### Authentication

During an IRMA session, authenticating to the keyshare server during the protocol between the IRMA client and keyshare server is done by sending the same hashed PIN `Base64(SHA256(nonce, pin))\n` as during registration. If the PIN is valid, then the keyshare server returns a signed JWT containing the user's username, having an expiry date of 15 minutes. This JWT later serves as authentication token in the keyshare protocol, described below.

Below, the API endpoints of the keyshare server are described in the order they are called during the IRMA protocol.

*   `POST /api/v1/user/isAuthorized`: The client posts the keyshare server's JWT from a previous IRMA session, who responds with

    ```json
    {
        "status": status, 
        "candidates": [ "pin" ]
    }
    ```
    where status is either `"authorized"` or `"expired"`. (The `candidates` array lists the supported methods for authentication, which is currently only using PIN codes.) If the status is "authorized" then the keyshare protocol itself starts using `/api/v1/prove/getCommitments` described below. Else the user must enter her PIN, after which

*   `POST /api/v1/user/verify/pin`: After computing the PIN again as `Base64(SHA256(nonce, pin))\n`, a message like the following is sent to the keyshare server:

    ```json
    {
        "id": "FVP1kMRcF2s",
        "pin": "0kO3xbCrWMK1336eKzI3KOKWWogGb/oW4xErUd5rwFI=\n"
    }
    ```
    If the PIN is correct for the specified user, then the user has successfully authenticated. The keyshare server then returns the signed JWT that is used as authentication in the rest of the protocol. The signed message of this JWT is like the following:

    ```json
    {
        "iss": "name_of_keyshare_server",
        "sub": "auth_tok",
        "exp": 1523914956,
        "user_id": "FVP1kMRcF2s",
        "iat": 1523914056
    }
    ```

### The keyshare protocol

At the start of the keyshare protocol, the client needs to inform the keyshare server which IRMA public keys are involved, in the sense that they are necessary to verify the attributes that are being disclosed. An issuer may have multiple public keys, indexed by integers starting at 0, so the string `"irma-demo.IRMATube-1"` refers to the second public key of the `IRMATube` issuer.

The keyshare server's API endpoints are the following.

*   `POST /api/v1/prove/getCommitments`: The client sends a list of public key identifiers (e.g. `["irma-demo.IRMATube-1"]`) to the keyshare server (along with the authentication JWT described above in a HTTP header). If the user is authenticated and the public keys are known to the keyshare server, the keyshare server reacts with a commitment to its part of the secret key, for each of the specified public keys:

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
*  `POST /api/v1/prove/getResponse`: after calculating the challenge, the client posts it to the keyshare server, who replies with a signed JWT with the following as content:

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

In addition to these API endpoints, the keyshare server exposes a number of other endpoints that are used by the [MyIRMA webclient](https://github.com/privacybydesign/irma_keyshare_webclient), which allows the IRMA user to manage her registration at the keyshare server. These endpoints are not documented here.
