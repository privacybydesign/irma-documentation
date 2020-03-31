---
title: IRMA backend packages
---

[`irma-backend-packages`](https://github.com/privacybydesign/irma-backend-packages/)
is a collection of libraries to integrate IRMA in the backend of your application.
Using the libraries in this package you can start and manage IRMA sessions from
your backend and generate and verify IRMA JWTs for session requests
and session results.

To make it possible to initiate IRMA sessions we provide to you the [`irma server`](irma-server.md).
At this server you can create sessions and the server will take care of all IRMA communication
to the user's IRMA app. For Go we provide a [library](irma-server-lib.md) to integrate the IRMA server
within your backend software. For other platforms the `irma server` provides a [REST API](api-irma-server.md).

To prevent that every developer has to implement the REST API herself, we provide you
native implementations of the API in other programming languages.

A general overview of functionalities the library provides to you:
 * Starting IRMA sessions using a session request or a JWT at the IRMA server
 * Retrieving the current status of IRMA sessions (only once or by receiving events on status updates)
 * Retrieving session result or session result JWT when a session succeeded
 * Cancelling IRMA sessions
 * Retrieving the JWT public key of the IRMA server
 * Generating a JWT of a session request
 * Verifying a JWT of a session request or a session result
 
The library will differ per language, since each programming
language has its own conventions.
 
## Available languages
For the list of currently available programming languages, check the [GitHub README](https://github.com/privacybydesign/irma-backend-packages/).

When the programming language of your choice is not available yet, you can
always use the IRMA server [REST API](api-irma-server.md).
If you think the programming language of your choice would benefit being part of 
`irma-backend-packages`, you can always contact us or make an issue on [GitHub](https://github.com/privacybydesign/irma-backend-packages/issues).

When you made a library for a programming language yourself that we do not support yet
or when you added features to existing libraries, you can always send us a pull request.
We are always interested in extending the IRMA ecosystem with support for additional
programming languages.