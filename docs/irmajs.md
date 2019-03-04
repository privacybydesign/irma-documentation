---
title: irmajs JavaScript library
---

`irmajs` is a Javascript client of the RESTful JSON API offered by the [`irma server`](https://github.com/privacybydesign/irmago/tree/master/irma). It  allows you to use the `irma server` to:

 * Verify IRMA attributes. You specify which attributes, the library handles the user interaction and the communication with the `irma server` and the [IRMA app](https://github.com/privacybydesign/irma_mobile)).
 * Issue IRMA attributes.
 * Perform IRMA attribute-based signature sessions, resulting in a signature on a string to which IRMA attributes are verifiably attached.

`irmajs` supports all major browsers (Firefox, Chrome, Safari, Edge, Internet Explorer 11).

## Building

Compile the library:

    npm run build

This writes `irma.js` to the `dist` folder, which you can include in your website in a `<script>` tag.

## Browser example

If you have included `irma.js` (e.g. `<script src="irma.js" defer></script>`) you can start an IRMA disclosure session as follows:

```js
const request = {
    'type': 'disclosing',
    'content': [{
        'label': 'Over 18',
        'attributes': [ 'irma-demo.MijnOverheid.ageLower.over18' ]
    }]
};

irma.startSession(server, request)
    .then(({ sessionPtr, token }) => irma.handleSession(sessionPtr, {server, token}))
    .then(result => console.log('Done', result));
```

This assumes you have an [`irma server`](irma-server) that is configured to [accept unauthenticated session requests](irma-server#requestor-authentication) listening at the URL indicated by `server`.

For complete examples, see the `examples` folder.
