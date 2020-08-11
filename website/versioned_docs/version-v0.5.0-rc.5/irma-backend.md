---
title: IRMA backend packages
id: version-v0.5.0-rc.5-irma-backend
original_id: irma-backend
---

[`irma-backend-packages`](https://github.com/privacybydesign/irma-backend-packages/)
is a collection of libraries in multiple programming languages assuming the role
of the [IRMA server](what-is-irma.md#irma-servers) in the IRMA protocol, allowing you to integrate IRMA in the backend
of your application. In particular, these libraries allow you to do the following:

 * Starting IRMA sessions using a session request or a JWT at the IRMA server
 * Retrieving the current status of IRMA sessions (only once or by receiving events on status updates)
 * Retrieving session result or session result JWT when a session succeeded
 * Cancelling IRMA sessions
 * Retrieving the JWT public key of the IRMA server
 * Generating a JWT of a session request
 * Verifying a JWT of a session request or a session result

Additionally, they will handle all communication with the [IRMA app](irma-app.md).

Depending on the programming language, the libraries achieve this by either directly including
the IRMA server functionality, or by consuming the [REST API](api-irma-server.md) exposed
by the [`irma server`](irma-server.md).
 
The library will slightly differ per language, since each programming language has its own conventions.
 
## Available languages
For the list of currently available programming languages, check the [GitHub README](https://github.com/privacybydesign/irma-backend-packages/). (Note that for the Go programming language, there is
a separate [`irmaserver`](irma-server-lib.md) Go package.)

If the programming language of your choice is not available yet, you can
always directly invoke the `irma server` [REST API](api-irma-server.md).
If you think the programming language of your choice would benefit being part of 
`irma-backend-packages`, you can always contact us or make an issue on [GitHub](https://github.com/privacybydesign/irma-backend-packages/issues).

If you made a library for a programming language yourself that we do not support yet,
or if you added features to existing libraries, please send us a pull request.
We are always interested in extending the IRMA ecosystem with support for additional
programming languages.
