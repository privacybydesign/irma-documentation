---
title: IRMA sessions
---

## Session types

In an IRMA session, the [IRMA mobile app](https://github.com/privacybydesign/irma_mobile) performs one of the following three *session types* with an *IRMA server*:

* *Disclosure sessions*: Upon receiving a list of requested attributes from the IRMA server, the app discloses the required attributes to the IRMA server if the app user agrees, after which they are verified by the IRMA server.
* *Attribute-based signature sessions*: Similar to disclosure sessions, but the attributes are attached to a message digitally signed into an [*attribute-based signature*](overview#attribute-based-signatures). The attribute-based signature can be verified at any later time, ensuring that the signed message is intact, and that the IRMA attributes attached to it were valid at the time of creation of the attribute-based signature.
* *Issuance sessions*: the IRMA app receives a new set of IRMA attributes including valid issuer signatures from the IRMA server, to use in later disclosure or attribute-based signature sessions.

This process is depicted schematically and explained in more detail [here](what-is-irma#irma-session-flow). For the user, after scanning the QR in his/her IRMA app this generally looks like the following.

<div class="center" style="margin: 3em 0">
  <img src="assets/disclose-permission.png" style="width:30%;margin-right:3em" />
  <img src="assets/disclose-done.png" style="width:30%" />
</div>

## IRMA servers

Various existing software components documented on this website can perform the role of the IRMA server. 
Apart from exposing an API that is used by the IRMA app during IRMA sessions, each of these components also offer an API with which IRMA sessions can be started and monitored, for use by the [*requestor*](overview#participants): the party wishing to issue attributes to or verify attributes from an IRMA app. The IRMA server handles the IRMA session with the IRMA app for the requestor.

Currently the following IRMA servers exist:

* The `irma server` command of the [`irma`](irma-cli) binary: a standalone daemon exposing its requestor API as HTTP endpoints. [Documentation](irma-server); [API reference](api-irma-server).
* The `irmaserver` Go library, exposing a HTTP server that handles IRMA sessions with the IRMA app, and Go functions for starting and managing IRMA sessions. [Documentation](irma-server-library); [API reference](https://godoc.org/github.com/privacybydesign/irmago/server/irmaserver).
* The now deprecated [`irma_api_server`](https://github.com/privacybydesign/irma_api_server).
