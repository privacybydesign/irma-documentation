---
title: irmajs JavaScript library
---

`irmajs` is a Javascript client of the RESTful JSON API offered by the [`irma server`](https://github.com/privacybydesign/irmago/tree/master/irma). It  allows you to use the `irma server` to:

 * Verify IRMA attributes. You specify which attributes, the library handles the user interaction and the communication with the `irma server` and the [IRMA app](irma-app.md)).
 * Issue IRMA attributes.
 * Perform IRMA attribute-based signature sessions, resulting in a signature on a string to which IRMA attributes are verifiably attached.

`irmajs` supports all major browsers (Firefox, Chrome, Safari, Edge, Internet Explorer 11).

## Installation

### Compiling from source
Compile the library:

    git clone https://github.com/privacybydesign/irmajs.git
    cd irmajs
    npm install
    npm run build

This writes `irma.js` to the `dist` folder, which you can include in your website in a `<script>` tag.

### Using prebuilt bundles

You can download the prebuilt `irmajs` bundles from our [CI build server](https://gitlab.science.ru.nl/irma/github-mirrors/irmajs/-/jobs/artifacts/master/download?job=bundle).

## Browser example

If you have included `irma.js` (e.g. `<script src="irma.js" defer></script>`) you can start an IRMA disclosure session as follows:

```js
const request = {
    '@context': 'https://irma.app/ld/request/disclosure/v2',
    'disclose': [[[ 'irma-demo.MijnOverheid.ageLower.over18' ]]]
};

irma.startSession(server, request)
    .then(({ sessionPtr, token }) => irma.handleSession(sessionPtr, {server, token}))
    .then(result => console.log('Done', result));
```

This assumes you have an [`irma server`](irma-server.md) that is configured to [accept unauthenticated session requests](irma-server.md#requestor-authentication) listening at the URL indicated by `server`.

For complete examples, see the `examples` folder. You can host these examples using the IRMA server, with:

    irma server -v --static-path examples/browser

> If your `irma server` is publically reachable, having a setup like the one above allows anyone on the internet to start IRMA sessions at your `irma server`. Additionally, starting IRMA sessions from the browser is generally an antipattern. You should enable either [requestor authentication](irma-server.md#requestor-authentication) or [restrict access to the IRMA session creation endpoints](irma-server.md#http-server-endpoints).

A more realistic configuration for this case may be found in the [Getting started](getting-started.md#example-configuration-and-irma-session) page.
