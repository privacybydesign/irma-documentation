---
id: getting-started
title: Getting started
---

This page shows how to get started with verifying or issuing IRMA attributes, using the following components:

 * [`irma server`](irma-server), a server that verifies or issues IRMA attributes to [IRMA apps](https://github.com/privacybydesign/irma_mobile),
 * [`irmajs`](irmajs), a JavaScript library for drawing the IRMA QR in your website, and handling IRMA session with the `irma server`.

This guide assumes you have [Go](https://golang.org/doc/install), [dep](https://golang.github.io/dep/docs/installation.html), [npm](https://docs.npmjs.com/cli/npm) and [Git](https://git-scm.com/) installed. You should also have the IRMA app installed ([Android](https://play.google.com/store/apps/details?id=org.irmacard.cardemu), [iOS](https://itunes.apple.com/nl/app/irma-authentication/id1294092994)).


## Installing and running `irma server`
Install the main `irma` command:
```shell
mkdir -p $GOPATH/github.com/privacybydesign && cd $GOPATH/github.com/privacybydesign
git clone https://github.com/privacybydesign/irmago && cd irmago
dep ensure
go install ./irma
```

Start the server (with increased verbosity but otherwise default configuration):
```shell
irma server -v
```
Run `irma server -h` to see configuration options. In order to verify your configuration, run `irma server check -v`.

*Tip*: You can perform a first IRMA session using your server on the command line as follows:
```shell
irma session --server http://localhost:8088 --disclose pbdf.pbdf.irmatube.type
```
([IRMATube attributes](https://privacybydesign.foundation/attribute-index/en/pbdf.pbdf.irmatube.html) are available [here](https://privacybydesign.foundation/demo/irmaTube/)). This will print a QR that you can scan with your IRMA app, and the attribute contents after they have been received and verified by the server. `irma session` can also perform issuance sessions and attribute-based signature sessions. If you pass  `-v` it logs the session request JSON that it sends to your `irma server`.


## Installing `irmajs` and an example webpage
Download and build `irmajs`:
```shell
git clone https://github.com/privacybydesign/irmajs && cd irmajs
npm i
npm run build
```

The `irma.js` JavaScript file in the `dist` folder can now be included in a `<script>` tag in your website.

Build the included verification demo website:
```shell
cd examples/browser
npm i
```


## Perform browser IRMA session

(Re)start your `irma server`, configuring it such that it statically hosts the `irmajs` example webpage we just built:
```shell
irma server -v --static-path ~/irmajs/examples/browser
```
A webpage demoing IRMA attribute issuance verification should now be available at http://localhost:8088.

*Tip*: open the browser console and the console running `irma server` to see various log and possibly error messages as the IRMA sesion proceeds.