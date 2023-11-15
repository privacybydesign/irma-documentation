---
title: Yivi frontend packages
id: version-v0.14.2-api-yivi-frontend
original_id: api-yivi-frontend
---

The Yivi frontend packages consist of multiple packages. Therefore we describe the API per package.
The API description of the Yivi frontend plugins is combined into one section.

## Yivi core
The [Yivi core](yivi-frontend.md#yivi-core) package only exports the `YiviCore` class. To handle an IRMA session, 
an instance of this class can be made with the relevant options for your session. The options object is shared
between all plugins that are registered at the `YiviCore` instance. The plugins don't need to be configured
individually. The options that can be specified depend on the specific plugins you are using. You can find all 
possible options in the READMEs of the plugins. You can find an overview of all available Yivi core plugins
[here](#plugins).

The Yivi core class has one constructor:
```javascript
const YiviCore = require('@privacybydesign/yivi-core');
const yivi     = new YiviCore({/* Options */});
```

Below you can find an overview of all methods an Yivi core instance offers you.

| Method | Functionality |
|---|---|
| `use(/* Plugin*/)` | With this method plugins can be added to the Yivi core instance. This method takes care of instantiating the plugin. You simply pass the plugin class as an argument to this function; you must not instantiate the plugin yourself.|
| `start()` | The start method activates the state machine. From then the Yivi core instance is ready to be used and no plugins can be added to the instance anymore. It returns a promise that resolves when a session is finished successfully and rejects when a unrecoverable error occurs. By calling Yivi core's `start` method, the plugins will be started too.|
| `abort()` | The abort method forces an `yivi-core` instance to abort the session and all associated plugins should stop making changes. In this way you can stop the instance from being active when it is not relevant anymore. If a promise returned by the `start` method is still active, the promise will be rejected with error message `Aborted`.|

For an example of how the Yivi core API can be used, you can also check the [usage guide](yivi-frontend.md#usage-guide).

## Yivi frontend
[Yivi frontend](yivi-frontend.md#yivi-frontend) is a wrapper
package around Yivi core combined with several of its plugins and the default [`yivi-css`](yivi-frontend.md#yivi-css)
styling. The package can only be used in web browser environments.

It exports two functions:

| Function | Functionality |
|---|---|
| `newWeb({/* Options */})` | With this method an `YiviCore` instance is initialized, using the given options, configured to control an embedded web element. The options that can be used are all options from [`yivi-client`](https://github.com/privacybydesign/yivi-frontend-packages/tree/master/plugins/yivi-client) and [`yivi-web`](https://github.com/privacybydesign/yivi-frontend-packages/tree/master/plugins/yivi-web).
| `newPopup({/* Options */})` | With this method an `YiviCore` instance is initialized, using the given options, configured to start a popup overlay. The options that can be used are all options from [`yivi-client`](https://github.com/privacybydesign/yivi-frontend-packages/tree/master/plugins/yivi-client) and [`yivi-popup`](https://github.com/privacybydesign/yivi-frontend-packages/tree/master/plugins/yivi-popup).

Both functions return an interface with the following methods:

| Method | Functionality |
|---|---|
| `start()` | Calls the `start` method of the initialized `YiviCore` instance and returns the promise it gets as result.
| `abort()` | Calls the `abort` method of the initialized `YiviCore` instance.

When importing this library via a `<script>` tag in HTML the JavaScript variable `yivi` will be bound to this library.
In these environments you can therefore directly access the exported functions by for instance saying `yivi.newWeb(...)`.

## Plugins
The [plugins](yivi-frontend.md#available-plugins-for-yivi-core) do not export any class or method. They only add extra
possible options to Yivi core. An overview of the options that can be used per plugin can be found in the READMEs.

| Plugin |
|---|
| [`yivi-client`](https://github.com/privacybydesign/yivi-frontend-packages/tree/master/plugins/yivi-client) |
| [`yivi-web`](https://github.com/privacybydesign/yivi-frontend-packages/tree/master/plugins/yivi-web) |
| [`yivi-popup`](https://github.com/privacybydesign/yivi-frontend-packages/tree/master/examples/browser/yivi-popup) |
| [`yivi-console`](https://github.com/privacybydesign/yivi-frontend-packages/tree/master/examples/browser/yivi-console) |
| [`yivi-dummy`](https://github.com/privacybydesign/yivi-frontend-packages/tree/master/plugins/yivi-dummy) |
