---
title: "Migrating Yivi frontend packages from v0 to v1"
---

This guide covers all breaking changes when upgrading from `@privacybydesign/yivi-*` v0.x to v1.0
and provides step-by-step migration instructions.

## Named exports replace default exports

All packages now use **named exports** instead of default exports. This is the change most likely to
affect your code.

**Before (v0.x):**
```javascript
// ES modules
import YiviCore from '@privacybydesign/yivi-core';
import YiviWeb from '@privacybydesign/yivi-web';
import YiviClient from '@privacybydesign/yivi-client';

// CommonJS
const YiviCore = require('@privacybydesign/yivi-core');
```

**After (v1.0):**
```javascript
// ES modules
import { YiviCore } from '@privacybydesign/yivi-core';
import { YiviWeb } from '@privacybydesign/yivi-web';
import { YiviClient } from '@privacybydesign/yivi-client';

// CommonJS
const { YiviCore } = require('@privacybydesign/yivi-core');
```

This applies to all packages: `yivi-core`, `yivi-client`, `yivi-web`, `yivi-popup`, `yivi-console`, and `yivi-dummy`.

If you use **dynamic imports**, the same change applies:
```javascript
// Before (v0.x)
const YiviCore = (await import('@privacybydesign/yivi-core')).default;

// After (v1.0)
const { YiviCore } = await import('@privacybydesign/yivi-core');
```

### yivi-frontend

The `yivi-frontend` convenience package also switched to named exports:

**Before (v0.x):**
```javascript
const yivi = require('@privacybydesign/yivi-frontend');
const session = yivi.newWeb({ ... });
```

**After (v1.0):**
```javascript
import { newWeb, newPopup } from '@privacybydesign/yivi-frontend';
const session = newWeb({ ... });
```

When loading `yivi-frontend` via a `<script>` tag, the global `yivi.newWeb(...)` / `yivi.newPopup(...)` API
remains unchanged.

## ESM-first module system

All packages now set `"type": "module"` in their `package.json` and ship dual ESM/CJS builds
through the `"exports"` field:

- `dist/index.mjs` (ESM)
- `dist/index.cjs` (CJS)
- `dist/index.d.mts` / `dist/index.d.cts` (TypeScript declarations)

### What this means for your project

- **Static ESM imports work natively** in bundlers and Node.js without extra configuration.
- **Deep imports into source files no longer work.** Only the documented package entry points are
  accessible. If you were importing internal files like
  `@privacybydesign/yivi-core/state-transitions`, those paths are no longer available.
- **Vite users:** v0.x was CJS-only, so you may have needed `optimizeDeps.include` to force
  CJS-to-ESM conversion during pre-bundling. This is no longer required for static imports. However,
  if you use **dynamic imports** (`await import(...)`) for the yivi packages, you may still want
  `optimizeDeps.include` so Vite can discover them at dev server startup:
  ```javascript
  // vite.config.js
  export default {
    optimizeDeps: {
      include: [
        '@privacybydesign/yivi-core',
        '@privacybydesign/yivi-web',
        '@privacybydesign/yivi-client',
      ],
    },
  };
  ```

## Removed dependencies: `isomorphic-fetch` and `eventsource`

### `isomorphic-fetch` removed

`yivi-client` no longer ships `isomorphic-fetch`. The global `fetch` API is assumed to be available,
which is the case in all modern browsers and Node.js 18+.

**Action required:** If your project targets Node.js < 18, you must provide your own `fetch` polyfill.

### `eventsource` polyfill removed

`yivi-client` no longer bundles the `eventsource` npm package as a Node.js polyfill for Server-Sent
Events. When native `EventSource` is unavailable, the client automatically falls back to HTTP polling.

**Action required:** If you had workarounds for the `eventsource` dependency (browser stubs, Vite
resolve aliases, etc.), you can safely remove them:

```javascript
// vite.config.js — you can remove this:
resolve: {
  alias: {
    eventsource: './src/stubs/eventsource.ts',
  },
},
```

If you relied on SSE for server status updates in Node.js, you will now get polling instead. No code
changes are needed, but be aware that polling has slightly different timing characteristics.

## TypeScript support

All packages now ship TypeScript declaration files (`.d.mts` / `.d.cts`). Key types exported from
`@privacybydesign/yivi-core` include:

| Type | Description |
|---|---|
| `YiviOptions` | Full options object passed to the `YiviCore` constructor |
| `YiviSessionOptions` | The `session` sub-object of options |
| `YiviStateOptions` | The `state` sub-object of options |
| `YiviState` | Union of all state machine states |
| `StateChangeEvent` | Shape of the object passed to plugin `stateChange` callbacks |
| `YiviPlugin` / `YiviPluginConstructor` | Interfaces for writing custom plugins |
| `SessionPtr` / `FrontendRequest` | Session-related types |

## Peer dependencies

Plugins now formally declare `@privacybydesign/yivi-core` as a peer dependency. Make sure
`yivi-core` is installed alongside any plugins you use. Most package managers handle this
automatically, but you may see warnings if `yivi-core` is missing.

```json
{
  "dependencies": {
    "@privacybydesign/yivi-core": "^1.0.0",
    "@privacybydesign/yivi-client": "^1.0.0",
    "@privacybydesign/yivi-web": "^1.0.0",
    "@privacybydesign/yivi-css": "^1.0.0"
  }
}
```

## `yivi-console` sub-path exports

`yivi-console` now uses explicit sub-path exports for Node.js and browser environments, replacing
the automatic resolution via the `"browser"` field in `package.json`.

**Before (v0.x):**
```javascript
// Automatically resolved to node.js or web.js based on environment
const YiviConsole = require('@privacybydesign/yivi-console');
```

**After (v1.0):**
```javascript
import { YiviConsole } from '@privacybydesign/yivi-console/node';  // Node.js
import { YiviConsole } from '@privacybydesign/yivi-console/web';   // Browser
import { YiviConsole } from '@privacybydesign/yivi-console';       // Generic
```

## DOM changes: `<a>` tags replaced with `<button>` elements

Interactive elements in the rendered Yivi UI (cancel, retry, back, show QR) are now semantic
`<button>` elements instead of `<a>` tags:

| Element | v0.x | v1.0 |
|---|---|---|
| Cancel | `<a data-yivi-glue-transition="cancel">` | `<button class="yivi-web-button-secondary">` |
| Retry | `<a>` | `<button class="yivi-web-button-secondary">` |
| Back | `<a>` | `<button class="yivi-web-button-tertiary">` |
| Show QR | `<a>` | `<button class="yivi-web-button-secondary">` |

**Action required:** If you have custom CSS targeting anchor tags inside the Yivi form (e.g.,
`.yivi-web-content a` or `a[data-yivi-glue-transition]`), update those selectors to target `button`
elements instead.

## CSS changes

### New CSS classes

| Class | Purpose |
|---|---|
| `.yivi-web-button-secondary` | Outlined button style (cancel, retry, show QR) |
| `.yivi-web-button-tertiary` | Text-link-style button (back) |
| `.yivi-web-minimal` | Wrapper class for the new [minimal mode](#minimal-mode) |

### Changed styles

- **Font sizes:** Fixed `px`-based font sizes have been removed from header and content paragraph
  elements. The Yivi form now inherits font sizes from the parent page. If you depended on the
  specific pixel values, you may need to set font sizes in your own CSS.
- **Button focus outlines:** The `outline: 0` rule on `:focus` has been removed. Buttons now show
  the browser's default focus outline, improving keyboard accessibility.
- **Button hover/active states:** `.yivi-web-button` now has `box-shadow` on hover and `translateY`
  on active for visual feedback.
- **QR code rendering:** `image-rendering: pixelated` is now applied to `.yivi-web-qr-code` for
  sharper QR codes.
- **Anchor styling removed:** The CSS block that styled `.yivi-web-content a` has been removed,
  since interactive anchors have been replaced with buttons.

### Sass partials: `@import` replaced with `@use`

If you import individual SCSS partials from `yivi-css/src/` in your own Sass files, you need to
migrate from `@import` to `@use`/`@forward`:

**Before (v0.x):**
```scss
@import '@privacybydesign/yivi-css/src/variables';
@import '@privacybydesign/yivi-css/src/mixins';
```

**After (v1.0):**
```scss
@use '@privacybydesign/yivi-css/src/variables' as *;
@use '@privacybydesign/yivi-css/src/mixins' as *;
```

If you only consume the compiled CSS file (`dist/yivi.css`), this does not affect you.

## Minimal mode {#minimal-mode}

v1.0 introduces a `minimal` option for `yivi-web` that renders only the QR code and status
animations, without the surrounding form wrapper. This is useful when you want to embed the QR code
in your own custom UI without fighting the default form styles.

```javascript
const yivi = new YiviCore({
  element: '#yivi-container',
  minimal: true,
  session: { ... },
});

yivi.use(YiviWeb);
yivi.use(YiviClient);
yivi.start();
```

If you were using CSS hacks in v0.x to hide the form wrapper and only show the QR code (e.g.,
`.yivi-web-content { all: revert !important; }` or similar overrides), you can now replace those with
`minimal: true` and remove the custom CSS.

## Deprecated state machine methods

The `transition()` and `finalTransition()` methods on the state machine are deprecated.
Use `selectTransition()` instead, which automatically determines whether the transition is final
based on the target state.

**Before (v0.x):**
```javascript
stateMachine.transition('abort', 'User cancelled');
stateMachine.finalTransition('abort', 'User cancelled');
```

**After (v1.0):**
```javascript
stateMachine.selectTransition('abort', 'User cancelled');
```

## Node.js minimum version

The minimum supported Node.js version is now **18**, due to the reliance on native `fetch` and
native ESM support. CI tests run on Node.js 22.

## `yivi-css` import in bundlers

The `yivi-css` package's main entry points to a CSS file, which some bundlers cannot resolve as a
JavaScript import. If your bundler has trouble importing `@privacybydesign/yivi-css`, use a resolve
alias or import the CSS file path directly:

```javascript
// Direct import
import '@privacybydesign/yivi-css/dist/yivi.css';
```

```javascript
// Or add a Vite/webpack alias
// vite.config.js
export default {
  resolve: {
    alias: {
      '@privacybydesign/yivi-css': '@privacybydesign/yivi-css/dist/yivi.css',
    },
  },
};
```

## Migration checklist

- [ ] Update all imports from default to named exports (`import { YiviCore }` instead of `import YiviCore`)
- [ ] Update `yivi-frontend` usage to named exports (`import { newWeb }` instead of `yivi.newWeb`)
- [ ] Update `yivi-console` imports to use sub-path exports (`/node` or `/web`)
- [ ] Ensure Node.js >= 18 is used in your project
- [ ] Remove `eventsource` polyfills, stubs, or resolve aliases
- [ ] Remove `isomorphic-fetch` polyfills
- [ ] Remove `optimizeDeps.include` for yivi packages (if using static imports with Vite)
- [ ] Update custom CSS selectors from `a` to `button` for interactive elements inside the Yivi form
- [ ] If importing SCSS partials: migrate `@import` to `@use`
- [ ] Consider using `minimal: true` if you had CSS hacks to hide the form wrapper
- [ ] Ensure `yivi-core` is installed alongside plugins (now a peer dependency)
- [ ] Replace `stateMachine.transition()` / `finalTransition()` with `selectTransition()` in custom plugins
