---
title: IRMA frontend packages
id: version-v0.5.0-api-irma-frontend
original_id: api-irma-frontend
---

The IRMA frontend packages consist of multiple packages. Therefore we describe the API per package.
The API description of the IRMA frontend plugins is combined into one section.

## IRMA core
The [IRMA core](irma-frontend.md#irma-core) package only exports the `IrmaCore` class. To handle an IRMA session, 
an instance of this class can be made with the relevant options for your session. The options object is shared
between all plugins that are registered at the `IrmaCore` instance. The plugins don't need to be configured
individually. The options that can be specified depend on the specific plugins you are using. You can find all 
possible options in the READMEs of the plugins. You can find an overview of all available IRMA core plugins
[here](#plugins).

The IRMA core class has one constructor:
```javascript
const IrmaCore = require('@privacybydesign/irma-core');
const irma     = new IrmaCore({/* Options */});
```

Below you can find an overview of all methods an IRMA core instance offers you.

| Method | Functionality |
|---|---|
| `use(/* Plugin*/)` | With this method plugins can be added to the IRMA core instance. This method takes care of instantiating the plugin. You simply pass the plugin class as an argument to this function; you must not instantiate the plugin yourself.|
| `start()` | The start method activates the state machine. From then the IRMA core instance is ready to be used and no plugins can be added to the instance anymore. It returns a promise that resolves when a session is finished successfully and rejects when a unrecoverable error occurs. By calling IRMA core's `start` method, the plugins will be started too.|
| `abort()` | The abort method forces an `irma-core` instance to abort the session and all associated plugins should stop making changes. In this way you can stop the instance from being active when it is not relevant anymore. If a promise returned by the `start` method is still active, the promise will be rejected with error message `Aborted`.|

For an example of how the IRMA core API can be used, you can also check the [usage guide](irma-frontend.md#usage-guide).

## IRMA frontend
[IRMA frontend](irma-frontend.md#irma-frontend) is a wrapper
package around IRMA core combined with several of its plugins and the default [`irma-css`](irma-frontend.md#irma-css)
styling. The package can only be used in web browser environments.

It exports two functions:

| Function | Functionality |
|---|---|
| `newWeb({/* Options */})` | With this method an `IrmaCore` instance is initialized, using the given options, configured to control an embedded web element. The options that can be used are all options from [`irma-client`](https://github.com/privacybydesign/irma-frontend-packages/tree/master/plugins/irma-client) and [`irma-web`](https://github.com/privacybydesign/irma-frontend-packages/tree/master/plugins/irma-web).
| `newPopup({/* Options */})` | With this method an `IrmaCore` instance is initialized, using the given options, configured to start a popup overlay. The options that can be used are all options from [`irma-client`](https://github.com/privacybydesign/irma-frontend-packages/tree/master/plugins/irma-client) and [`irma-popup`](https://github.com/privacybydesign/irma-frontend-packages/tree/master/plugins/irma-popup).

Both functions return an interface with the following methods:

| Method | Functionality |
|---|---|
| `start()` | Calls the `start` method of the initialized `IrmaCore` instance and returns the promise it gets as result.
| `abort()` | Calls the `abort` method of the initialized `IrmaCore` instance.

When importing this library via a `<script>` tag in HTML the JavaScript variable `irma` will be bound to this library.
In these environments you can therefore directly access the exported functions by for instance saying `irma.newWeb(...)`.

## Plugins
The [plugins](irma-frontend.md#available-plugins-for-irma-core) do not export any class or method. They only add extra
possible options to IRMA core. An overview of the options that can be used per plugin can be found in the READMEs.

| Plugin |
|---|
| [`irma-client`](https://github.com/privacybydesign/irma-frontend-packages/tree/master/plugins/irma-client) |
| [`irma-web`](https://github.com/privacybydesign/irma-frontend-packages/tree/master/plugins/irma-web) |
| [`irma-popup`](https://github.com/privacybydesign/irma-frontend-packages/tree/master/examples/browser/irma-popup) |
| [`irma-console`](https://github.com/privacybydesign/irma-frontend-packages/tree/master/examples/browser/irma-console) |
| [`irma-dummy`](https://github.com/privacybydesign/irma-frontend-packages/tree/master/examples/browser/irma-dummy) |

## IRMA legacy
This package uses the exact API from [irmajs](api-irmajs.md). However, due to technical changes in IRMA, 
we were not able to realize full backwards compatibility with `irmajs`.
All changes are related to the function call `handleSession`.
* Method `canvas` is not supported anymore. Please use the module `irma-frontend` instead or make
 your own composition of plugins and layouts using `irma-core`.
 This also means the canvas related options `element` and `showConnectedIcon` are deprecated.
* Method `mobile` has the same behaviour as method `popup` now. On mobile devices, the popup
 mode automatically detects whether a mobile device is used and then shows the user the option to open
 the [IRMA app](irma-app.md) installed on the mobile device itself. It is now an explicit choice, so users can also get
 a QR on mobile devices instead (useful for tablets).
* The option `disableMobile` is not useful anymore. This module does not have
 automatic redirects to other apps anymore without explicit user interaction.
 The option is therefore deprecated.
* Because the explicit methods for mobile devices are deprecated, the undocumented exported function `detectUserAgent`
 and the undocumented exported struct `UserAgent` are also deprecated. An explicit distinction based on user agent
 is not necessary anymore. This is all handled internally now.
* The option `returnStatus` is deprecated. Instead you can use the functions `waitConnected` and `waitDone`
 to detect yourself whether the session reached a certain status.
