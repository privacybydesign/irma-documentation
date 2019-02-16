---
title: What is IRMA?
---

<style type="text/css">
.image {
  margin: 2em auto;
  width: 90%;
}
</style>

IRMA is a set of software projects implementing the Idemix attribute-based credential scheme, allowing users to safely and securely authenticate themselves as privacy-preserving as the situation permits. Users receive digitally signed attributes from trusted issuer, storing them in their IRMA app, after which the user can selectively disclose attributes to others. Schematically:

<div class="image">
  <img src="assets/issuance.png" style="width: 40%; margin-right: 3em"/>
  <img src="assets/disclosure.png" style="width: 40%;"/>
</div>

Using the issuer's digital signature over the attributes the verifier can verify that the attributes were given to the user in the past, and that they have not been modified since.

## IRMA sessions

A typical IRMA session is depicted schematically below.

![IRMA session flow](assets/irmaflow.png)

Software components:
* *Requestor backend and frontend*: Generally the requestor runs a website with a (JavaScript) frontend in the user's browser, and a backend server. During an IRMA session the frontend displays the IRMA QR that the IRMA app scans. All frontend tasks depicted in the diagram are supported by [`irmajs`](irmajs).
* *IRMA server*: [`irma server`](irma-server), [irma server library](irma-server-lib), or [IRMA API server](https://github.com/privacybydesign/irma_api_server).
* *IRMA mobile app*: [Android](https://play.google.com/store/apps/details?id=org.irmacard.cardemu), [iOS](https://itunes.apple.com/nl/app/irma-authentication/id1294092994). Source on [GitHub](https://github.com/privacybydesign/irma_mobile).

Explanation of the steps:

1. Usually the IRMA session starts by the user performing some action on the website (e.g. clicking on "Log in with IRMA").
1. The requestor sends its session request (containing the attributes to be disclosed or issued, or message to be signed) to the IRMA server. Depending on its configuration, the IRMA server accepts the session request only if the session request is authentic (e.g. a validly signed JWT) from an authorized requestor.
1. The irmaserver accepts the request and assigns a session token (a random string) to it. It returns the contents of the QR code that the frontend must display: the URL to itself and the session token.
1. The frontend (`irmajs`) receives and displays the QR code, which is scanned by the IRMA app.
1. The IRMA app requests the session request from step 1, receiving the attributes to be disclosed or issued, or message to be signed.
1. The IRMA server returns the session request.
1. The IRMA app displays the attributes to be disclosed or issued, or message to be signed, and asks the user if she wants to proceed.
1. The user accepts.
1. The IRMA server performs the IRMA protocol with the IRMA app, issuing new attributes to the user, or receiving and verifying attributes from the user's IRMA app, or receiving and verifying an attribute-based signature made by the user's app.
1. The session status (`DONE`, `CANCELLED`, `TIMEOUT`), along with disclosed and verified attributes or signature depending on the session type, are returned to the requestor.

Additional notes: 

* Which of these tasks are performed by the requestor's backend and which by its frontend differs case by case:
  -  Often the session request is sent to the IRMA server by the requestor's backend, after which the IRMA server's reply in step 2 is forwarded to the frontend which renders it as a QR code. Step 1 can however also be done by `irmajs`, in which case `irmajs` automatically picks up the IRMA server's reply in step 2 and renders the QR code.
  - Similarly, `irmajs` can be instructed to fetch the session result in step 10, but this can also be done in the backend.
* The IRMA server could be deployed on the same machine as the requestor's backend, but it need not be; possibly it is not even controlled by the requestor. In case the `irmaserver` library is used, steps 2/3 and 10 are function calls.