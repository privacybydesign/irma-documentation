---
title: IRMA frontend JavaScript packages
id: version-v0.8.0-irma-frontend
original_id: irma-frontend
---

The [`irma-frontend-packages`](https://github.com/privacybydesign/irma-frontend-packages) repository is a set of
related JavaScript packages that together form a Javascript frontend client to the
[`irma server`](https://github.com/privacybydesign/irmago/tree/master/irma). The packages contain a state
machine package [`irma-core`](#irma-core) to which several plugin packages can be added to achieve IRMA support
for your application. We also provide a wrapper package [`irma-frontend`](#irma-frontend) that combines `irma-core` with some of the
plugins in a bundle. With this wrapper package you have an easy starting point for handling sessions using an embedded
web element or using a popup overlay in the browser.

Using the default styling, the browser version will look like this:

![IRMA frontend web element](assets/irma-frontend-web.gif)

All packages are published on [npm](https://www.npmjs.com/) in `@privacybydesign` scoped packages.

## IRMA core

This package contains the [state machine](https://github.com/privacybydesign/irma-frontend-packages/blob/master/irma-core/state-transitions.js)
for implementing IRMA flows. `irma-core` itself does not provide any real functionality. Plugins can be registered at the
state machine and the plugins then provide the functionality depending on the state the state machine is in. 
The plugins can also request state modifications to the state machine.

IRMA core can be initialized in the following way:
```javascript
const IrmaCore = require('@privacybydesign/irma-core');
const irma     = new IrmaCore(/* options */);

irma.use(/* Plugin A */);
irma.use(/* Plugin B */);

irma.start();
```

More information about the methods IRMA core offers to you can be found
in the [API overview](api-irma-frontend.md#irma-core).

### Available plugins for IRMA core
Below is a list of the plugins we provide. Detailed explanations of the plugins can be found in the READMEs
on GitHub (linked to in the left column).

| Plugin | Functionality |
|---|---|
| [`irma-client`](https://github.com/privacybydesign/irma-frontend-packages/tree/master/plugins/irma-client) | Plugin to fetch a [session package](api-irma-server.md#post-session), to check the `irma server` for the current session status and optionally to fetch the result. The plugin is widely configurable, so you can also fetch a session package or a session result at custom endpoints. |
| [`irma-web`](https://github.com/privacybydesign/irma-frontend-packages/tree/master/plugins/irma-web) | Plugin to handle user interaction via a web element that developers can embed within the contents of their webpages. It is designed to be used with [`irma-css`](#irma-css). `irma-css` is not embedded in this package, so you have to manually include this. You are also free to use your own styling. |
| [`irma-popup`](https://github.com/privacybydesign/irma-frontend-packages/tree/master/examples/browser/irma-popup) | `irma-web` element embedded in a popup overlay. The popup is displayed on top of your content and is hidden again when a session is completed, when a fatal error occurs or when the user closes the popup. It is designed to be used with [`irma-css`](#irma-css). `irma-css` is not embedded in this package, so you have to manually include this. You are also free to use your own styling.  |
| [`irma-console`](https://github.com/privacybydesign/irma-frontend-packages/tree/master/examples/browser/irma-console) | Plugin to handle user interaction via the console (either the browser console or the command line console) using node.js. |
| [`irma-dummy`](https://github.com/privacybydesign/irma-frontend-packages/tree/master/examples/browser/irma-dummy) | Plugin that provides a dummy implementation of the `irma-client` plugin. This can be used to test the user interaction without actually having to do a session at an IRMA server. Instead, the state machine will be instructed to continue after fixed timeouts. |

If a plugin for your use case is not available, we offer you the option to [construct one yourself](#make-your-own-irma-core-plugin).

### Usage guide
Here we explain the scenario in which the web element is embedded within the contents of our website.
This web element will be controlled by the `irma-web` plugin. We use `irma-client` for the communication
with the IRMA server and our backend.

In the body of our HTML page we need to have an HTML element where `irma-web` can render its user interface.
We also import the [`irma-css`](#irma-css) styling to nicely style our `irma-web-form` element.
```html
<html>
  <head>
    ...
    <link rel="stylesheet" href="assets/irma.css" />
    ...
  </head>
  <body>
    ...
    <section class="irma-web-form" id="irma-web-form"></section>
    ...
  </body>
</html>
```

In our JavaScript we import `irma-core` and the relevant plugins first.
```javascript
const IrmaCore   = require('@privacybydesign/irma-core');
const IrmaWeb    = require('@privacybydesign/irma-web');
const IrmaClient = require('@privacybydesign/irma-client');
```

Then we can instantiate IRMA core. Let's assume we already have an endpoint `/get-irma-session`
in our backend that starts a relevant IRMA session at the [`irma server`](irma-server.md). Let's say the endpoint
returns a single session package (in JSON) without any backend token.
```javascript
const irma = new IrmaCore({
  // Enable to get helpful output in the browser console.
  debugging: false,

  // The option 'element' is used by irma-web to find its HTML element in the DOM.
  element: '#irma-web-form',

  // The 'session' option struct is used by irma-client to find the session information.
  session: {
    // The base url of our website
    url: 'http://example.com',

    // The 'start' option struct specifies where irma-client can fetch a new session package.
    start: {
      // Specifies how the endpoint url can be derived from the base url (see above).
      url: o => `${o.url}/get-irma-session`,
      // A GET request is used.
      method: 'GET',
      // No additional HTTP headers are needed.
      headers: {},
      // Note: a GET request with empty headers is fetch's default, so
      // omitting these options would lead to the same result.
      // All options the fetch API exposes can be used here to customize the request.
      // https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch
    },
    
    // The 'mapping' option specifies how the data can be derived from a 'start' response.
    mapping: {
      // The only thing included in the request is the session pointer, so no additional parsing is needed.
      sessionPtr: r => r,
    },

    // Since we did not receive a backend token, we cannot retrieve any session result here.
    result: false,
  },
});
```

Now we can add the plugins to our IRMA core instance and start running it.
```javascript
irma.use(IrmaWeb);
irma.use(IrmaClient);

const promise = irma.start();
```

IRMA core is now started and the IRMA web element should be visible.
By looking at the state of the promise, you can detect whether the user has finished.
```javascript
promise.then(() => {
  // The user has completed the session.
})
.catch((err) => {
  // Some fatal error has occurred.
});
```

Be aware that you can start an instance of `irma-core` only once.
When you want to call `start()` again, you have to create a new instance.
When a promise of an earlier `start()` call is not completed yet, promise rejection
can be forced by calling the `abort()` method. In this way a new `irma-core`
instance can be created without any risk on interference with other running instances.
When a promise is rejected because of an `abort()` call, the promise will return the
error message `Aborted`.

```javascript
irma.abort();
```

For detailed information about all available options, you can check the README of the
particular plugin on GitHub. There are links in the plugin overview [above](#available-plugins-for-IRMA-core).

## IRMA frontend
For convenience we already bundled `irma-core`, `irma-web`, `irma-popup` and `irma-client` together with the default styling
from `irma-css`. We also added polyfills in this package to realize support for Internet Explorer 11.
The package can be installed from the npm registry.
The bundled package can also be downloaded directly [here](https://github.com/privacybydesign/irma-frontend-packages/releases/latest/download/irma.js).
Please host this file as asset yourself.

The bundle can be imported in your JavaScript file by doing `require('@privacybydesign/irma-frontend')` or it can
be included directly in the HTML.

```html
<script src="assets/irma.js" type="text/javascript" defer></script>
```

You can then instantiate `irma-frontend` and start a session like this when using an embedded web element:
```javascript
const exampleWeb = irma.newWeb({
  debugging: false,            // Enable to get helpful output in the browser console
  element:   '#irma-web-form', // Which DOM element to render to

  // Back-end options
  session: {
    // Configure your flow here, see usage guide of irma-core
  },

  ...
});

exampleWeb.start()
.then(result => console.log("Successful disclosure! 🎉", result))
.catch(error => console.error("Couldn't do what you asked 😢", error));
```

When you want a popup overlay to be used to, you can do the following:
```javascript
const examplePopup = irma.newPopup({
  debugging: false, // Enable to get helpful output in the browser console

  // Back-end options
  session: {
    // Configure your flow here, see usage guide of irma-core
  },

  ...
});

examplePopup.start()
.then(result => console.log("Successful disclosure! 🎉", result))
.catch(error => console.error("Couldn't do what you asked 😢", error));
```

Be aware that you can start an instance of `irma-frontend` only once.
When you want to call `start()` again, you have to create a new instance.
When a promise of an earlier `start()` call is not completed yet, promise rejection
can be forced by calling the `abort()` method. In this way a new `irma-frontend`
instance can be created without any risk on interference with other running instances.
When a promise is rejected because of an `abort()` call, the promise will return the
error message `Aborted`.

```javascript
exampleWeb.abort();
examplePopup.abort();
```

More information about the methods the IRMA frontend package offers to you can be found
in the [API overview](api-irma-frontend.md#irma-frontend).

## IRMA css
For the IRMA core plugins `irma-web` and `irma-popup` we made it possible to manually include the style
that it will use. We provide to you a [normal version](https://github.com/privacybydesign/irma-frontend-packages/releases/latest/download/irma.css)
and a [minified version](https://github.com/privacybydesign/irma-frontend-packages/releases/latest/download/irma.min.css)
of the default styles. The CSS can be linked into your website the regular way:

```html
<link rel="stylesheet" href="assets/irma.css" />
```

When you want to adapt the design to suit for your own use case, you can take a look in the [styleguide](https://privacybydesign.github.io/irma-frontend-packages/styleguide/).
Based on this you can adapt the CSS and then import the modified version into your project.
Customized versions of `irma-css` can be used in combination with the `irma-web` and
`irma-popup` plugins for `irma-core`.

### Customizing the design
Customizing the design is especially useful for developers that want to use an embedded
web element to initiate the IRMA flow and see that the default design does not fit
into the design of their website. We provide you a convenient way to alter the
design and build a new, customized style. This can be done in the following way:

1. Clone the [`irma-frontend-packages` repository](https://github.com/privacybydesign/irma-frontend-packages).
2. Use our [guide](https://github.com/privacybydesign/irma-frontend-packages/tree/master/irma-css#compiling-locally)
   to compile the CSS styleguide locally.
3. Make the desired changes in the source files. These files can be found in the
   `irma-css/src` directory.
4. Check **all pages** of the locally built styleguide to check whether your local
   changes work for all flows.
5. Build a release version for your customized CSS by running `npm run release` in the
   `irma-css` directory. The built CSS files can be found in the `irma-css/dist` directory.
6. Include the new style in your website and use [IRMA core](#irma-core) in combination
   with the `irma-web` plugin (for embedded web elements) or the `irma-popup` plugin (for
   a popup overlay). The plugins will use the custom CSS that you have embedded. For
   managing the session state we recommend you to use the `irma-client` plugin.
   
```javascript
require('assets/my-custom-irma-css-design.min.css');

const IrmaCore   = require('@privacybydesign/irma-core');
const IrmaWeb    = require('@privacybydesign/irma-web');
const IrmaClient = require('@privacybydesign/irma-client');

const irma = new IrmaCore({
  debugging: true,
  element:   '#irma-web-form',
  language:  'en',
  // Check the irma-web README on how to customize the default texts.
  session: {
    // Check the irma-client README for all options.
  },
});

irma.use(IrmaWeb);
irma.use(IrmaClient);

irma.start()
.then(result => console.log("Successful disclosure! 🎉", result))
.catch(error => {
  if (error === 'Aborted') {
    console.log('We closed it ourselves, so no problem 😅');
    return;
  }
  console.error("Couldn't do what you asked 😢", error);
});
```

## Make your own IRMA core plugin
If you need functionality that is not covered by one of the existing IRMA core plugins, you can also define
one yourself. In the constructor the `stateMachine` and the `options` from `IrmaCore` can be accessed.
The constructor can be omitted if you do not need it.
Furthermore, a plugin can have a `start` method that is
called when the `start` method of the associated `IrmaCore` instance is called, a `stateChange` method 
that is called when the state of the state machine changes, and a `close` method (check the explanation below for details).

```javascript
class IrmaPlugin {
  // Optional
  constructor({stateMachine, options}) {
    ...
  }

  // Optional method
  start() {
    ...
  }

  // Optional method
  stateChange({newState, oldState, transition, isFinal, payload}) {
    ...
  }

  // Optional method
  close() {
    // May return a Promise when the closing operation is async;
    // irma-core will then wait for the Promise to be completed.
    ...
  }
}
```

A plugin can request the state machine to make changes. This can be done using the `transition` and
`finalTransition` methods of the `stateMachine`. The first parameter of these functions is the requested
transition. The possible transitions can be found in the [state machine](https://github.com/privacybydesign/irma-frontend-packages/blob/master/irma-core/state-transitions.js).
As second parameter `payload` can be added to the transition. The payload can then be accessed by all other plugins
as it is one of the parameters of the `stateChange` method. When requesting a `finalTransition`, the state
machine will be locked in the new state. From then no transitions can be made anymore. For a `finalTransition`
the potential `newState` must be in the list of possible end states. Otherwise, an error is returned. After
a `finalTransition` the `close` method of the plugin is called to close the plugin's state. This method should
return a Promise which resolves when the plugin finishes closing. When the `close` Promises of all plugins are
resolved, the promise returned by the `start` method of `IrmaCore` will resolve or reject (depending on the
transaction). In this way we can guarantee that plugins are not active anymore when the promise returned by the
`start` method of `IrmaCore` is finished. Besides when calling `finalTransition`, the closing procedure can also
be activated when the `transition` method is used and the state machine gets in a state from which no
transitions are possible anymore.

For example, in the `IrmaPopup` plugin the user can press on the close button in the UI to abort the session.
When this happens the `IrmaPopup` plugin must request a state change at the IRMA core state machine to
notify all other plugins that the new state becomes `Aborted`. This is done in the following way:
```javascript
stateMachine.transition('abort', 'Popup closed');
```

There are no transitions possible anymore from the state `Aborted`. This means that unless the transition
is not explicitly marked as final, the `stateChange` method of your plugin will be called with `isFinal` set
to true.

## Differences with [irmajs](irmajs.md)
The previous JavaScript library `irmajs` combined frontend and backend functionality. The `startSession` related
functions could be used to for starting sessions, and `handleSession` could be used for actually being the 
frontend to the user.

In the new library we have split these functionalities into two libraries. The session management functionality
for node.js server applications now belongs to the [`irma-backend-packages`](https://github.com/privacybydesign/irma-backend-packages).
The `irma-frontend-packages` only deals with session handling for the (web)client, starting
with fetching a session package from a remote server, then communicating with the `irma server` what the current status
of the session is, and finally fetching the result if the client needs it.
It also handles the user interaction related to all of these actions.

As a rule of thumb, `irma-frontend-packages` is meant to handle the `/irma/...` endpoints, and
`irma-backend-packages` is meant to handle the `/session/...` endpoints of the `irma server`. Theoretically,
`irma-frontend-packages` is able to fetch a session package directly at the `irma server` and therefore also
use the `/session` endpoint of the `irma server`. This flow is however not recommended. A better
practice is to put a backend layer in between that starts the session at the `irma server`.

For user interaction, we currently have support for a web element embedded in the content, a web browser
popup overlay and console user interaction using node.js. Below you can find an overview of the plugins for
`irma-core` and how they map to the methods known from `irmajs`. In all cases the [`irma-client`](https://github.com/privacybydesign/irma-frontend-packages/tree/master/plugins/irma-client)
plugin is needed for server communication.

| irmajs method | irma-frontend plugin  | Differences |
|---|---|---|
| `'popup'` | [`irma-popup`](https://github.com/privacybydesign/irma-frontend-packages/tree/master/plugins/irma-popup) | Does not always reject on cancellation or timeout. When a `start` endpoint is specified at `irma-client` to fetch a new session package, the user gets the opportunity to try again. Also, support for tablets has been added. The default [`irma-css`](#irma-css) style can be used or a custom CSS template can be defined to give it your own look and feel. |
| `'canvas'` | [`irma-web`](https://github.com/privacybydesign/irma-frontend-packages/tree/master/plugins/irma-web) | Has been upgraded to a full web element to also be able to handle tablets. Auto-refreshment of the QR on session timeout is now supported. Furthermore, the differences mentioned at the method `popup` also apply here. |
| `'mobile'` | [`irma-web`](https://github.com/privacybydesign/irma-frontend-packages/tree/master/plugins/irma-web) or [`irma-popup`](https://github.com/privacybydesign/irma-frontend-packages/tree/master/plugins/irma-popup) | The mobile flow is fully integrated into the web and popup interfaces. Please check those options to see the differences. |
| `'console'` |  [`irma-console`](https://github.com/privacybydesign/irma-frontend-packages/tree/master/plugins/irma-console) | No major differences. |
| `'url'` | _No support_ | The url can simply be constructed according to the format `https://irma.app/-/session#<sessionptr>` where `<sessionptr>` has to be replaced with the session package JSON object (converted to a string using url encoding). A session package can be retrieved using the [`irma-backend-packages`](https://github.com/privacybydesign/irma-backend-packages). |

For users that have difficulties integrating a new library, but do want to upgrade, we also provide a [`irma-legacy`](https://github.com/privacybydesign/irma-frontend-packages/tree/master/irma-legacy)
wrapper that maps the legacy `irmajs` calls onto the new `irma-frontend-packages`. More information about this will follow.
