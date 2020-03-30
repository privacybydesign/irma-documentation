---
title: IRMA frontend JavaScript packages
---

The [`irma-frontend-packages`](https://github.com/privacybydesign/irma-frontend-packages) repository is a set of
related JavaScript packages that together form a Javascript frontend client to the
[`irma server`](https://github.com/privacybydesign/irmago/tree/master/irma). The package consists of a state
machine package [`irma-core`](#irma-core) to which several plugin packages can be added to achieve IRMA support
for your application. We also provide a wrapper package [`irma-frontend`](#irma-frontend) that combines `irma-core` with some of the
plugins in a bundle to have an easy starting point for handling sessions using an embedded web element in the browser.

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

### Available plugins for IRMA core
Below a list of the plugins we provide to you. The detailed explanation of the plugin can be found in the READMEs
on Github. In the table links to these READMEs are included.

| Plugin | Functionality |
|---|---|
| [`irma-client`](https://github.com/privacybydesign/irma-frontend-packages/tree/master/plugins/irma-client) | Plugin to fetch a session pointer, to check the `irma server` for the current session status and optionally to fetch the result. The plugin is widely configurable, so you can also fetch a session pointer or a session result at custom endpoints. |
| [`irma-web`](https://github.com/privacybydesign/irma-frontend-packages/tree/master/plugins/irma-web) | Plugin to handle user interaction via a web element that developers can embed within the content of their website. It is designed to be used with [`irma-css`](#irma-css). `irma-css` is not embedded in this package, so you have to manually include this. You are also free to use your own styling. |
| [`irma-popup`](https://github.com/privacybydesign/irma-frontend-packages/tree/master/examples/browser/irma-popup) | `irma-web` element embedded in a popup overlay. The popup is displayed on top of your content and is hidden again when a session is completed, when a fatal error occurs or when the user closes the popup. It is designed to be used with [`irma-css`](https://github.com/privacybydesign/irma-frontend-packages/tree/master/irma-css). `irma-css` is not embedded in this package, so you have to manually include this. You are also free to use your own styling.  |
| [`irma-console`](https://github.com/privacybydesign/irma-frontend-packages/tree/master/examples/browser/irma-console) | Plugin to handle user interaction via the console (either the browser console or the command line console) using node.js. |
| [`irma-dummy`](https://github.com/privacybydesign/irma-frontend-packages/tree/master/examples/browser/irma-dummy) | Plugin that provides a dummy implementation of the `irma-client` plugin. This can be used to test the user interaction without actually having to do a session. The state machine will be instructed to continue after fixed timeouts. |

### Make your own plugin
If you need functionality that is not covered by one of the existing plugins, you can also define one yourself.
The defined class must at least have a constructor. In the constructor the `stateMachine` and the `options`
from `irma-core` can be accessed. Furthermore a plugin can have a `start` method, that is
called when `irmaCore.start` is called, and a `stateChange` method, that is called when the state of the state
machine changes.

A plugin should be of the following format:
```javascript
class IrmaPlugin {

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
}
```

A plugin can request the state machine to make changes. This can be done using the `transition` and
`finalTransition` methods of the `stateMachine`. The first parameter of these functions is the requested
transition. The possible transitions can be found in the [state machine](https://github.com/privacybydesign/irma-frontend-packages/blob/master/irma-core/state-transitions.js).
As second parameter `payload` can be added to the transition. The payload can then be accessed by all other plugins
as it is one of the parameters of the `stateChange` method. When requesting a `finalTransition`, the state
machine will be locked in the new state. From then no transactions can be made anymore. For a `finalTransaction`
the potential `newState` must be in the list of possible end states. Otherwise an error is returned. After
a `finalTransaction` the promise returned by `irmaCore.start()` will resolve or reject (depending on the transaction).

## IRMA frontend
For convenience we already bundled `irma-core`, `irma-web` and `irma-client` together with the default styling
from `irma-css`. This bundled package can be downloaded [here](https://gitlab.science.ru.nl/irma/github-mirrors/irma-frontend-packages/-/jobs/artifacts/master/raw/irma-frontend/dist/irma.js?job=irma-frontend).
Please host this file as asset yourself.

The bundle can be imported the usual way:

```html
<script src="assets/irma.js" type="text/javascript" defer></script>
```

You can then instantiate `irma-core` and start a session like this:
```javascript
irma.new({
  debugging: false,            // Enable to get helpful output in the browser console
  element:   '#irma-web-form', // Which DOM element to render to

  // Back-end options
  session: {
    // Configure your flow here, see code examples in root README file
  },

  ...
});

irma.start()
.then(result => console.log("Successful disclosure! 🎉", result))
.catch(error => console.error("Couldn't do what you asked 😢", error));
```

## IRMA css
For the IRMA core plugins `irma-web` and `irma-popup` we made it possible to manually include the style
that it will use. We provide to you a [normal version and a minified version](https://gitlab.science.ru.nl/irma/github-mirrors/irma-frontend-packages/-/jobs/artifacts/master/browse/irma-css/dist?job=irma-css)
of the default styles. The CSS can be linked into your website the regular way:

```html
<link rel="stylesheet" href="assets/irma.css" />
```

When you want to adapt the design to suit for your own use case, you can take a look in the [styleguide](https://privacybydesign.github.io/irma-frontend-packages/styleguide/).
Based on this you can adapt the CSS and then import the modified version into your project.

## Differences with [irmajs](irmajs.md)
The previous JavaScript library `irmajs` combined frontend and backend functionality. The `startSession` related
functions could be used to for session management and `handleSession` could be used for actually being the 
frontend to the user.

In the new library we fully splitted these functionalities in two libraries. The session management functionality
for node.js server applications now belongs to the [`irma-backend-packages`](https://github.com/privacybydesign/irma-backend-packages).
The `irma-frontend-packages` only deal with session handling. This involves the flow starting
with fetching a session pointer from a remote server, then communicating with the `irma server` what the current status
of the session is and finally fetching the result if the client needs it.
It also handles the user interaction related to all these actions.

A rule of thumb: `irma-frontend-packages` is meant to handle the `/irma/...` endpoints and
`irma-backend-packages` to handle the `/session/...` endpoints of the `irma server`. Theoretically,
`irma-frontend-packages` is able to fetch a session pointer directly at the `irma server` and therefore also
use the `/session` endpoint of the `irma server`. This flow is however not recommended. A better
practice is to put a backend layer in between that starts the session at the `irma server`.

For user interaction, we currently have support for a web element embedded in the content, a web browser
popup overlay and console user interaction using node.js. Below an overview of the plugins for
`irma-core` and how they map to the methods known from `irmajs`. In all cases the [`irma-client`](https://github.com/privacybydesign/irma-frontend-packages/tree/master/plugins/irma-client)
plugin is needed for server communication.

| irmajs method | irma-frontend plugin  | Differences |
|---|---|---|
| `'popup'` | [`irma-popup`](https://github.com/privacybydesign/irma-frontend-packages/tree/master/plugins/irma-popup) | Does not always reject on cancellation or timeout. When a `start` endpoint is specified at `irma-client` to fetch a new session pointer, the user gets the opportunity to try again. Also, support for tablets has been added. The default [`irma-css`](#irma-css) style can be used or a custom CSS template can be defined to give it your own look and feel. |
| `'canvas'` | [`irma-web`](https://github.com/privacybydesign/irma-frontend-packages/tree/master/plugins/irma-web) | Has been upgraded to a full web element to also be able to handle tablets. Auto-refreshment of the QR on session timeout is now supported. Furthermore the differences mentioned at the method `popup` also apply here. |
| `'mobile'` | [`irma-web`](https://github.com/privacybydesign/irma-frontend-packages/tree/master/plugins/irma-web) or [`irma-popup`](https://github.com/privacybydesign/irma-frontend-packages/tree/master/plugins/irma-popup) | The mobile flow is fully integrated into the web and popup interfaces. Please check those options to see the differences. |
| `'console'` |  [`irma-console`](https://github.com/privacybydesign/irma-frontend-packages/tree/master/plugins/irma-console) | No major differences. |
| `'url'` | _No support_ | The url can simply be constructed according to the format `https://irma.app/-/session#<sessionptr>` where `<sessionptr>` has to be replaced with the session pointer (using url encoding). A session pointer can be retrieved using the [`irma-backend-packages`](https://github.com/privacybydesign/irma-backend-packages). |

For users that have difficulties integrating a new library, but do want to upgrade, we also provide a [`irma-legacy`](https://github.com/privacybydesign/irma-frontend-packages/tree/master/irma-legacy)
wrapper that maps the legacy `irmajs` calls onto the new `irma-frontend-packages`. More information about this will follow.
