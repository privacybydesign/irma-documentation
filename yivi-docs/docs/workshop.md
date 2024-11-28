---
title: May 22 IRMA Workshop
---

## Resources

- Technical documentation: https://irma.app/docs
- IRMA source code: https://github.com/privacybydesign/
- Attribute index: https://privacybydesign.foundation/attribute-index/en/
- Slack: ask for invite

Other resources:
- Privacy by Design Foundation website: https://privacybydesign.foundation/
- Privacy by Design Foundation twitter: https://twitter.com/IRMA_privacy/
- Attribute issuance: https://privacybydesign.foundation/issuance

## Prerequisites

Make sure you have installed the Yivi app on your [Android](https://play.google.com/store/apps/details?id=org.irmacard.cardemu) or [iOS](https://itunes.apple.com/nl/app/irma-authentication/id1294092994) device.

If you haven't before, try one of the demos on our [demo page](https://privacybydesign.foundation/demo/). For many demos you need for example an [email or age limit attribute](https://privacybydesign.foundation/issuance/). [IRMATube](https://privacybydesign.foundation/demo/irmaTube) is an entirely self-contained demo.

## Part 1

For this part, follow the instructions in the [Getting Started](getting-started.md) page of the technical documentation. You will download or compile from source the IRMA command line tool, which includes the IRMA server. You then download or compile the `irmajs` JavaScript library and let the IRMA server host the static pages.

This IRMA server automatically detects your LAN IP address, and adjusts the URL in the QR to match that address. This is necessary because the Yivi app on your phone somehow needs to connect to your server. However, not all network allow direct LAN access, especially not corporate wifi. Mobile hotspots often work well.

#### Using a workshop server

To bypass any compilation and network issues, you can also use one of our workshop Debian Linux servers over an SSH connection. Please reserve one by grabbing a token at the front of the room. Then edit and execute the following:

```
PASSWORD=...
SERVER_NUMBER=01

wget -O irma_workshop_id_rsa "https://irma.app/irma_workshop_id_rsa_${PASSWORD}"
chmod 600 irma_workshop_id_rsa
ssh -i irma_workshop_id_rsa "debian@irma${SERVER_NUMBER}.irma.app"
```

Add the `PASSWORD` you received during the workshop (as a super basic precaution). The private key gives access to all workshop servers. Enter the two-digit server number that's on your token as `SERVER_NUMBER`.

You can then run the example with `./run_example.sh` and browse to the address listed in the output. The server is completely yours to use for purposes of the workshop, and can also be easily reset on request.


## Part 2
Integrate IRMA attribute verification in your own website or application, for example with one of the following use cases:

* Use case 1: Instead of logging in with username/passwords, users can register and then login at your website by showing their IRMA email address attribute ([index](https://privacybydesign.foundation/attribute-index/en/pbdf.pbdf.email.html), [issuance](https://privacybydesign.foundation/issuance/email/), [info](https://privacybydesign.foundation/issuance-email/)).
* Use case 2: Auto-fill an HTML form in your website by asking the user to disclose IRMA attributes, as in [this demo](https://privacybydesign.foundation/demo/adres/).
* Use case 3: Ask your users to provide, for example, consent to receive ads per email, with an [attribute-based signature](what-is-yivi.md#session-types).
* Use case 4 (experimental): if you develop an iOS or Android app, start an IRMA session from within your app using these libraries: [iOS](https://github.com/privacybydesign/irmaios), [Android](https://github.com/privacybydesign/irmaandroid).

## Advanced/take home exercises

1. In production scenarios, you should switch to the [`pbdf`](https://github.com/credentials/pbdf-schememanager) [scheme](schemes.md), which contrary to the [`irma-demo`](https://github.com/credentials/irma-demo-schememanager) scheme contains actual personal data.
2. Start issuing your own attributes, as follows:
   1. Create a new credential type within the `irma-demo` scheme, and re-sign the scheme (`irma scheme sign`)
   2. Create a custom build of the Yivi app [`irma_mobile`](yivi-app.md) with your modified `irma-demo` scheme in its `irma_configuration` folder
   3. Start an `irma server` and point it to your modified `irma-demo` scheme, e.g. with the `--schemes-path` flag
   4. Start an issuance session of your new credential type, e.g. by modifying the [`irmajs` browser demo](https://github.com/privacybydesign/irmajs)
3. The HTTP endpoints exposed by the `irma server` are also available as Go functions in the [`irmaserver`](irma-server-lib.md) Go library, and as C functions [here](https://github.com/privacybydesign/irmago/tree/master/server/irmac). Enable IRMA attribute verification and issuance from your own favorite programming language by binding to these C functions.