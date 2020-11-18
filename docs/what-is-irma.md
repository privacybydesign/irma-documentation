---
title: What is IRMA?
---

IRMA is a set of free and open source software projects implementing the Idemix attribute-based credential scheme, allowing users to safely and securely authenticate themselves as privacy-preserving as the situation permits. Users receive digitally signed attributes from trusted issuer, storing them in their IRMA app, after which the user can selectively disclose attributes to others. Schematically:

<div class="center">
  <img src="/docs/assets/issuance.png" style="width: 40%; margin-right: 3em" alt="issuance-flow"/>
  <img src="/docs/assets/disclosure.png" style="width: 40%;" alt="disclosure-flow" />
</div>

Using the issuer's digital signature over the attributes the verifier can verify that the attributes were given to the user in the past, and that they have not been modified since.

## IRMA session flow

A typical IRMA session is depicted schematically below.

![IRMA session flow](assets/irmaflow.png)

Software components:
* *Requestor backend and frontend*: Generally the requestor runs a website with a (JavaScript) frontend in the user's browser, and a backend server. During an IRMA session the frontend displays the IRMA QR that the [IRMA app](irma-app.md) scans. All frontend tasks depicted in the diagram are supported by [`irma-frontend`](irma-frontend.md).
* [*IRMA server*](#irma-servers): Handles IRMA protocol with the IRMA app for the requestor.
* [*IRMA mobile app*](irma-app.md): [Android](https://play.google.com/store/apps/details?id=org.irmacard.cardemu), [iOS](https://itunes.apple.com/nl/app/irma-authentication/id1294092994).

Explanation of the steps:

1. Usually the session starts by the user performing some action on the website (e.g. clicking on "Log in with IRMA").
1. The requestor sends its [session request](session-requests.md) (containing the attributes to be disclosed or issued, or message to be signed) to the [IRMA server](#irma-servers). Depending on its configuration, the IRMA server accepts the session request only if the session request is authentic (e.g. a validly signed [session request JWT](session-requests.md#jwts-signed-session-requests)) from an authorized requestor.
1. The IRMA server accepts the request and assigns a session token (a random string) to it. It returns the contents of the QR code that the frontend must display: the URL to itself and the session token.
1. The frontend ([`irma-frontend`](irma-frontend.md)) receives and displays the QR code, which is scanned by the IRMA app.
1. The IRMA app requests the session request from step 1, receiving the attributes to be disclosed or issued, or message to be signed.
1. The IRMA server returns the session request.
1. The IRMA app displays the attributes to be disclosed or issued, or message to be signed, and asks the user if she wants to proceed.
1. The user accepts.
1. The IRMA server performs the IRMA protocol with the IRMA app, issuing new attributes to the user, or receiving and verifying attributes from the user's IRMA app, or receiving and verifying an attribute-based signature made by the user's app.
1. The session status (`DONE`, `CANCELLED`, `TIMEOUT`), along with disclosed and verified attributes or signature depending on the session type, are returned to the requestor.

Additional notes: 

* Which of these tasks are performed by the requestor's backend and which by its frontend differs case by case:
  - Often the session request is sent to the IRMA server by the requestor's backend, after which the IRMA server's reply in step 2 is forwarded to the frontend which renders it as a QR code. Step 1 can however also be done by `irma-frontend`, in which case `irma-frontend` automatically picks up the IRMA server's reply in step 2 and renders the QR code.
  - Similarly, `irma-frontend` can be instructed to fetch the session result in step 10, but this can also be done in the backend. In the latter, `irma-frontend` can fetch a custom result at your backend, if desired.
* The IRMA server could be deployed on the same machine as the requestor's backend, but it need not be; possibly it is not even controlled by the requestor. Generally, steps 2/3 and 10 are done with REST HTTP calls to the IRMA server, but in case the [`irmaserver`](irma-server-lib.md) library is used, these steps are function calls. Alternatively, you could use one of the packages in [`irma-backend-packages`](irma-backend.md) to do these steps with function calls in other programming languages.

## Session types

In an IRMA session, the [IRMA mobile app](irma-app.md) performs one of the following three *session types* with an [*IRMA server*](#irma-servers):

* *Disclosure sessions*: Upon receiving a list of requested attributes from the IRMA server, the app discloses the required attributes to the IRMA server if the app user agrees, after which they are verified by the IRMA server.
* *Attribute-based signature sessions*: Similar to disclosure sessions, but the attributes are attached to a message digitally signed into an [*attribute-based signature*](overview.md#attribute-based-signatures). The attribute-based signature can be verified at any later time, ensuring that the signed message is intact, and that the IRMA attributes attached to it were valid at the time of creation of the attribute-based signature.
* *Issuance sessions*: the IRMA app receives a new set of IRMA attributes including valid issuer signatures from the IRMA server, to use in later disclosure or attribute-based signature sessions. (Possibly the user is asked to disclose some attributes as well, within the same IRMA session, before receiving the new attributes. This is called a *combined issuance-disclosure session*.)

This process is depicted schematically and explained in more detail in the [IRMA session flow](what-is-irma.md#irma-session-flow) chapter. For the user, after scanning the QR in his/her IRMA app a disclosure session generally looks like the following. (Attribute-based signature sessions and issuance sessions are identical in terms of their flow (scan qr, provide permission, success screen); only the graphical interface is different.)

<div class="center" style="margin: 3em 0">
  <img src="/docs/assets/disclose-permission.png" style="width:30%;margin-right:3em" alt="disclose-permission" />
  <img src="/docs/assets/disclose-done.png" style="width:30%" alt="disclosure-done" />
</div>

## IRMA servers

Various existing software components documented on this website can perform the role of the IRMA server. 
Apart from exposing an API that is used by the [IRMA app](irma-app.md) during IRMA sessions, each of these components also offer an API with which IRMA sessions can be started and monitored, for use by the [*requestor*](overview.md#participants): the party wishing to issue attributes to or verify attributes from an IRMA app. The IRMA server handles the IRMA session with the IRMA app for the requestor.

Currently the following IRMA servers exist:

* The `irma server` command of the [`irma`](irma-cli.md) binary: a standalone daemon exposing its requestor API as HTTP endpoints. [Documentation](irma-server.md); [API reference](api-irma-server.md).
* The `irmaserver` Go library, exposing a HTTP server that handles IRMA sessions with the IRMA app, and Go functions for starting and managing IRMA sessions. [Documentation](irma-server-lib.mdrary); [API reference](https://godoc.org/github.com/privacybydesign/irmago/server/irmaserver).
* The now deprecated [`irma_api_server`](https://github.com/privacybydesign/irma_api_server).

## About this documentation

IRMA uses JSON to pass messages within IRMA sessions. The majority of IRMA is [written in Go](https://github.com/privacybydesign/irmago), and the JSON messages generally correspond to specific Go structs. For example, the [`GET /session/{token}/result`](api-irma-server.md#get-session-token-result) endpoint of the [`irma server`](irma-server.md) outputs instances of the [`server.SessionResult`](https://godoc.org/github.com/privacybydesign/irmago/server#SessionResult).  In such cases, a link to the corresponding Go struct will be included. This can tell you what fields you can use or expect. (Note that some structs have custom (un)marshalers. See also the [Go documentation](https://blog.golang.org/json-and-go) on JSON and Go.)
