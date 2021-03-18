---
title: IRMA frontend packages
id: version-v0.7.0-api-irma-frontend
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
