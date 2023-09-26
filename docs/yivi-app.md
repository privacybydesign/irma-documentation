---
title: Yivi app
---

<style>
img.badge {
  max-width: 15em;
  display: inline;
  margin-left: unset;
  margin-right: unset;
}
img.screenshot {
  max-width: 23%;
  width: 23%;
  display: inline;
  margin: 0;
  padding: 0;
}
</style>

<img src="/docs/assets/yivimobile/1.png" class="screenshot" alt="Screenshot of the Yivi app, showing the introduction screen" />
<img src="/docs/assets/yivimobile/2.png" class="screenshot" alt="Screenshot of the Yivi app, showing the home screen" />
<img src="/docs/assets/yivimobile/3.png" class="screenshot" alt="Screenshot of the Yivi app, showing the screen to collect missing data" />
<img src="/docs/assets/yivimobile/4.png" class="screenshot" alt="Screenshot of the Yivi app, showing the data disclosure screen" />

The Yivi app allows users to receive and store digitally signed attributes from trusted issuers, after which they can be selectively disclosed to others. The app is essentially a GUI for the [`irmaclient`](https://github.com/privacybydesign/irmago/tree/master/irmaclient) Go package, which implements the client relative to the [IRMA server](irma-server.md). It is available in the iOS and Android app stores and may also be compiled from source.

<a href="https://play.google.com/store/apps/details?id=org.irmacard.cardemu" target="_blank"><img src="/docs/assets/google-play-badge.png" alt="Play Store" class="badge" width="150"></a>
<a href="https://itunes.apple.com/nl/app/irma-authentication/id1294092994" target="_blank"><img src="/docs/assets/app-store-badge.png" alt="Apple Store" class="badge" width="150"></a>

## Source code

The source code of the Yivi app is published [on GitHub](https://github.com/privacybydesign/irmamobile/) under the [GPLv3 license](https://www.gnu.org/licenses/gpl-3.0.en.html).

## Developer mode

The Yivi app has a developer mode, which is disabled by default. It can be enabled by tapping 7 times on the version number at the bottom of the "More" tab on the home screen.

While developer mode is disabled (default), the Yivi app will:
- Block all HTTP connections that don't use TLS (i.e. the URL of the server must start with `https`), in order to prevent attributes from being sent unencrypted over the internet.
- Block all HTTP connections to IRMA servers *not* running in [`production` mode](irma-server.md#production-mode). Since the majority of the Yivi app users will not have developer mode enabled, this requires IRMA servers facing those users to enable `production` mode (which makes the IRMA server switch to safer default values for some of its configuration options).

Developer mode thus enables performing IRMA sessions with locally running IRMA servers, during development of an application using IRMA. After it has been enabled, a toggle will appear in the "Settings" screen with which it can be disabled again.

For normal users this feature is made difficult to discover by design, for their protection. On the other hand, developers will notice its existence as soon as they try to do an IRMA session with a locally running IRMA server, by the error message displayed by the app.

> Use developer mode with care: when enabled, the Yivi app will not protect you from accidentally sending your attributes unencrypted over the internet.
> Furthermore, it enables access to debugging features that may make your Yivi app unstable.