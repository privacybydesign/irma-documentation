---
title: Yivi frontend JavaScript packages
---

The [`yivi-frontend-packages`](https://github.com/privacybydesign/yivi-frontend-packages) repository is a set of
related JavaScript packages that together form a Javascript frontend client to the
[`irma server`](https://github.com/privacybydesign/irmago/tree/master/irma). The packages contain a state
machine package [`yivi-core`](#yivi-core) to which several plugin packages can be added to achieve Yivi support
for your application. We also provide a wrapper package [`yivi-frontend`](#yivi-frontend) that combines `yivi-core` with some of the
plugins in a bundle. With this wrapper package you have an easy starting point for handling sessions using an embedded
web element or using a popup overlay in the browser.

Using the default styling, the browser version will look like this:

![Yivi frontend web element](/img/yivi-frontend-web.gif)

All packages are published on [npm](https://www.npmjs.com/) in `@privacybydesign` scoped packages.

## Yivi core

This package contains the [state machine](https://github.com/privacybydesign/yivi-frontend-packages/blob/master/yivi-core/state-transitions.js)
for implementing Yivi flows. `yivi-core` itself does not provide any real functionality. Plugins can be registered at the
state machine and the plugins then provide the functionality depending on the state the state machine is in. 
The plugins can also request state modifications to the state machine.

Yivi core can be initialized in the following way:
```javascript
const YiviCore = require('@privacybydesign/yivi-core');
const yivi     = new YiviCore(/* options */);

yivi.use(/* Plugin A */);
yivi.use(/* Plugin B */);

yivi.start();
```

More information about the methods Yivi core offers to you can be found
in the [API overview](api-yivi-frontend.md#yivi-core).

### Available plugins for Yivi core
Below is a list of the plugins we provide. Detailed explanations of the plugins can be found in the READMEs
on GitHub (linked to in the left column).

| Plugin | Functionality |
|---|---|
| [`yivi-client`](https://github.com/privacybydesign/yivi-frontend-packages/tree/master/plugins/yivi-client) | Plugin to fetch a [session package](api-irma-server.md#post-session), to check the `irma server` for the current session status and optionally to fetch the result. The plugin is widely configurable, so you can also fetch a session package or a session result at custom endpoints. |
| [`yivi-web`](https://github.com/privacybydesign/yivi-frontend-packages/tree/master/plugins/yivi-web) | Plugin to handle user interaction via a web element that developers can embed within the contents of their webpages. It is designed to be used with [`yivi-css`](#yivi-css). `yivi-css` is not embedded in this package, so you have to manually include this. You are also free to use your own styling. |
| [`yivi-popup`](https://github.com/privacybydesign/yivi-frontend-packages/tree/master/examples/browser/yivi-popup) | `yivi-web` element embedded in a popup overlay. The popup is displayed on top of your content and is hidden again when a session is completed, when a fatal error occurs or when the user closes the popup. It is designed to be used with [`yivi-css`](#yivi-css). `yivi-css` is not embedded in this package, so you have to manually include this. You are also free to use your own styling.  |
| [`yivi-console`](https://github.com/privacybydesign/yivi-frontend-packages/tree/master/examples/browser/yivi-console) | Plugin to handle user interaction via the console (either the browser console or the command line console) using node.js. |
| [`yivi-dummy`](https://github.com/privacybydesign/yivi-frontend-packages/tree/master/plugins/browser/yivi-dummy) | Plugin that provides a dummy implementation of the `yivi-client` plugin. This can be used to test the user interaction without actually having to do a session at an IRMA server. Instead, the state machine will be instructed to continue after fixed timeouts. |

If a plugin for your use case is not available, we offer you the option to [construct one yourself](#make-your-own-yivi-core-plugin).

### Usage guide
Here we explain the scenario in which the web element is embedded within the contents of our website.
This web element will be controlled by the `yivi-web` plugin. We use `yivi-client` for the communication
with the IRMA server and our backend.

In the body of our HTML page we need to have an HTML element where `yivi-web` can render its user interface.
We also import the [`yivi-css`](#yivi-css) styling to nicely style our `yivi-web-form` element.
```html
<html>
  <head>
    ...
    <link rel="stylesheet" href="assets/yivi.css" />
    ...
  </head>
  <body>
    ...
    <section class="yivi-web-form" id="yivi-web-form"></section>
    ...
  </body>
</html>
```

In our JavaScript we import `yivi-core` and the relevant plugins first.
```javascript
const YiviCore   = require('@privacybydesign/yivi-core');
const YiviWeb    = require('@privacybydesign/yivi-web');
const YiviClient = require('@privacybydesign/yivi-client');
```

Then we can instantiate Yivi core. Let's assume we already have an endpoint `/get-irma-session`
in our backend that starts a relevant IRMA session at the [`irma server`](irma-server.md). Let's say the endpoint
returns a single session package (in JSON) without any backend token.
```javascript
const yivi = new YiviCore({
  // Enable to get helpful output in the browser console.
  debugging: false,

  // The option 'element' is used by yivi-web to find its HTML element in the DOM.
  element: '#yivi-web-form',

  // The 'session' option struct is used by yivi-client to find the session information.
  session: {
    // The base url of our website
    url: 'http://example.com',

    // The 'start' option struct specifies where yivi-client can fetch a new session package.
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

Now we can add the plugins to our Yivi core instance and start running it.
```javascript
yivi.use(YiviWeb);
yivi.use(YiviClient);

const promise = yivi.start();
```

Yivi core is now started and the Yivi web element should be visible.
By looking at the state of the promise, you can detect whether the user has finished.
```javascript
promise.then(() => {
  // The user has completed the session.
})
.catch((err) => {
  // Some fatal error has occurred.
});
```

Be aware that you can start an instance of `yivi-core` only once.
When you want to call `start()` again, you have to create a new instance.
When a promise of an earlier `start()` call is not completed yet, promise rejection
can be forced by calling the `abort()` method. In this way a new `yivi-core`
instance can be created without any risk on interference with other running instances.
When a promise is rejected because of an `abort()` call, the promise will return the
error message `Aborted`.

```javascript
yivi.abort();
```

For detailed information about all available options, you can check the README of the
particular plugin on GitHub. There are links in the plugin overview [above](#available-plugins-for-yivi-core).

## Yivi frontend
For convenience we already bundled `yivi-core`, `yivi-web`, `yivi-popup` and `yivi-client` together with the default styling
from `yivi-css`. We also added polyfills in this package to realize support for Internet Explorer 11.
The package can be installed from the npm registry.
The bundled package can also be downloaded directly [here](https://github.com/privacybydesign/yivi-frontend-packages/releases/latest/download/yivi.js).
Please host this file as asset yourself.

The bundle can be imported in your JavaScript file by doing `require('@privacybydesign/yivi-frontend')` or it can
be included directly in the HTML.

```html
<script src="assets/yivi.js" type="text/javascript" defer></script>
```

You can then instantiate `yivi-frontend` and start a session like this when using an embedded web element:
```javascript
const exampleWeb = yivi.newWeb({
  debugging: false,            // Enable to get helpful output in the browser console
  element:   '#yivi-web-form', // Which DOM element to render to

  // Back-end options
  session: {
    // Configure your flow here, see usage guide of yivi-core
  },

  ...
});

exampleWeb.start()
.then(result => console.log("Successful disclosure! 🎉", result))
.catch(error => console.error("Couldn't do what you asked 😢", error));
```

When you want a popup overlay to be used to, you can do the following:
```javascript
const examplePopup = yivi.newPopup({
  debugging: false, // Enable to get helpful output in the browser console

  // Back-end options
  session: {
    // Configure your flow here, see usage guide of yivi-core
  },

  ...
});

examplePopup.start()
.then(result => console.log("Successful disclosure! 🎉", result))
.catch(error => console.error("Couldn't do what you asked 😢", error));
```

Be aware that you can start an instance of `yivi-frontend` only once.
When you want to call `start()` again, you have to create a new instance.
When a promise of an earlier `start()` call is not completed yet, promise rejection
can be forced by calling the `abort()` method. In this way a new `yivi-frontend`
instance can be created without any risk on interference with other running instances.
When a promise is rejected because of an `abort()` call, the promise will return the
error message `Aborted`.

```javascript
exampleWeb.abort();
examplePopup.abort();
```

More information about the methods the Yivi frontend package offers to you can be found
in the [API overview](api-yivi-frontend.md#yivi-frontend).

## Yivi css
For the Yivi core plugins `yivi-web` and `yivi-popup` we made it possible to manually include the style
that it will use. We provide to you a [normal version](https://github.com/privacybydesign/yivi-frontend-packages/releases/latest/download/yivi.css)
and a [minified version](https://github.com/privacybydesign/yivi-frontend-packages/releases/latest/download/yivi.min.css)
of the default styles. The CSS can be linked into your website the regular way:

```html
<link rel="stylesheet" href="assets/yivi.css" />
```

When you want to adapt the design to suit for your own use case, you can take a look in the [styleguide](https://privacybydesign.github.io/yivi-frontend-packages/styleguide/).
Based on this you can adapt the CSS and then import the modified version into your project.
Customized versions of `yivi-css` can be used in combination with the `yivi-web` and
`yivi-popup` plugins for `yivi-core`.

### Customizing the design
Customizing the design is especially useful for developers that want to use an embedded
web element to initiate the Yivi flow and see that the default design does not fit
into the design of their website. We provide you a convenient way to alter the
design and build a new, customized style. This can be done in the following way:

1. Clone the [`yivi-frontend-packages` repository](https://github.com/privacybydesign/yivi-frontend-packages).
2. Use our [guide](https://github.com/privacybydesign/yivi-frontend-packages/tree/master/yivi-css#compiling-locally)
   to compile the CSS styleguide locally.
3. Make the desired changes in the source files. These files can be found in the
   `yivi-css/src` directory.
4. Check **all pages** of the locally built styleguide to check whether your local
   changes work for all flows.
5. Build a release version for your customized CSS by running `npm run release` in the
   `yivi-css` directory. The built CSS files can be found in the `yivi-css/dist` directory.
6. Include the new style in your website and use [Yivi core](#yivi-core) in combination
   with the `yivi-web` plugin (for embedded web elements) or the `yivi-popup` plugin (for
   a popup overlay). The plugins will use the custom CSS that you have embedded. For
   managing the session state we recommend you to use the `yivi-client` plugin.
   
```javascript
require('assets/my-custom-yivi-css-design.min.css');

const YiviCore   = require('@privacybydesign/yivi-core');
const YiviWeb    = require('@privacybydesign/yivi-web');
const YiviClient = require('@privacybydesign/yivi-client');

const yivi = new YiviCore({
  debugging: true,
  element:   '#yivi-web-form',
  language:  'en',
  // Check the yivi-web README on how to customize the default texts.
  session: {
    // Check the yivi-client README for all options.
  },
});

yivi.use(YiviWeb);
yivi.use(YiviClient);

yivi.start()
.then(result => console.log("Successful disclosure! 🎉", result))
.catch(error => {
  if (error === 'Aborted') {
    console.log('We closed it ourselves, so no problem 😅');
    return;
  }
  console.error("Couldn't do what you asked 😢", error);
});
```

## Make your own Yivi core plugin
If you need functionality that is not covered by one of the existing Yivi core plugins, you can also define
one yourself. In the constructor the `stateMachine` and the `options` from `YiviCore` can be accessed.
The constructor can be omitted if you do not need it.
Furthermore, a plugin can have a `start` method that is
called when the `start` method of the associated `YiviCore` instance is called, a `stateChange` method 
that is called when the state of the state machine changes, and a `close` method (check the explanation below for details).

```javascript
class YiviPlugin {
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
    // yivi-core will then wait for the Promise to be completed.
    ...
  }
}
```

A plugin can request the state machine to make changes. This can be done using the `transition` and
`finalTransition` methods of the `stateMachine`. The first parameter of these functions is the requested
transition. The possible transitions can be found in the [state machine](https://github.com/privacybydesign/yivi-frontend-packages/blob/master/yivi-core/state-transitions.js).
As second parameter `payload` can be added to the transition. The payload can then be accessed by all other plugins
as it is one of the parameters of the `stateChange` method. When requesting a `finalTransition`, the state
machine will be locked in the new state. From then no transitions can be made anymore. For a `finalTransition`
the potential `newState` must be in the list of possible end states. Otherwise, an error is returned. After
a `finalTransition` the `close` method of the plugin is called to close the plugin's state. This method should
return a Promise which resolves when the plugin finishes closing. When the `close` Promises of all plugins are
resolved, the promise returned by the `start` method of `YiviCore` will resolve or reject (depending on the
transaction). In this way we can guarantee that plugins are not active anymore when the promise returned by the
`start` method of `YiviCore` is finished. Besides when calling `finalTransition`, the closing procedure can also
be activated when the `transition` method is used and the state machine gets in a state from which no
transitions are possible anymore.

For example, in the `YiviPopup` plugin the user can press on the close button in the UI to abort the session.
When this happens the `YiviPopup` plugin must request a state change at the Yivi core state machine to
notify all other plugins that the new state becomes `Aborted`. This is done in the following way:
```javascript
stateMachine.transition('abort', 'Popup closed');
```

There are no transitions possible anymore from the state `Aborted`. This means that unless the transition
is not explicitly marked as final, the `stateChange` method of your plugin will be called with `isFinal` set
to true.
