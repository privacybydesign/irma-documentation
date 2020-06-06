---
title: Getting started
---

This page shows how to get started with verifying or issuing IRMA attributes, using the following components:

 * [`irma server`](irma-server.md), a server that verifies or issues IRMA attributes to [IRMA apps](irma-app.md),
 * [`irmajs`](irmajs.md), a JavaScript library for drawing the IRMA QR in your website, and handling IRMA session with the `irma server`.

You should have the [IRMA app](irma-app.md) installed ([Android](https://play.google.com/store/apps/details?id=org.irmacard.cardemu), [iOS](https://itunes.apple.com/nl/app/irma-authentication/id1294092994)). If you want to compile from source instead of using prebuilt binaries, you should additionally have [Git](https://git-scm.com/), [Go](https://golang.org/doc/install), and [npm](https://docs.npmjs.com/cli/npm) installed.


## Installing and running `irma server`
You can install the `irma` command line tool in the following two ways.

* **Download prebuilt binary**: From our [CI build server](https://gitlab.science.ru.nl/irma/github-mirrors/irmago/-/jobs/artifacts/master/download?job=binaries). Extract the zip file, and use the binary for your OS and architecture (most likely amd64). Rename the file to `/usr/local/bin/irma` to have it available in your PATH.
* **Compile and install from source** as follows:
  ```shell
  git clone https://github.com/privacybydesign/irmago
  cd irmago
  go install ./irma
  ```

After installing the `irma` binary, start the server (with increased verbosity but otherwise default configuration):
```shell
irma server -v
```
Run `irma server -h` to see configuration options. In order to verify your configuration, run `irma server check -v`. General documentation can be found on the [irma server](irma-server.md) page, API documentation of HTTP endpoints can be found on the [api irma server](api-irma-server.md) page.

## Perform a command line IRMA session
You can perform a first IRMA session using your server on the command line as follows:
```shell
irma session --server http://localhost:8088 --disclose pbdf.pbdf.irmatube.type
```
([IRMATube attributes](https://privacybydesign.foundation/attribute-index/en/pbdf.pbdf.irmatube.html) are available on the [IRMATube demo](https://privacybydesign.foundation/demo/irmaTube/)) page. This will print a QR that you can scan with your IRMA app, and the attribute contents after they have been received and verified by the server. `irma session` can also perform issuance sessions and attribute-based signature sessions. If you pass  `-v` it logs the session request JSON that it sends to your `irma server`.


## Installing `irmajs` and an example webpage
Download the `irmajs` source code, as [zip](https://github.com/privacybydesign/irmajs/archive/master.zip) from GitHub, or using git:
```shell
git clone https://github.com/privacybydesign/irmajs && cd irmajs
```

Like the `irma` command line tool, `irmajs` needs to be compiled before it can be used in the browser. This bundles all dependencies, images and CSS into one JavaScript file. You can obtain a compiled version of `irmajs` in one of the following two ways:

* **Download prebuilt binary**: From our [CI build server](https://gitlab.science.ru.nl/irma/github-mirrors/irmajs/-/jobs/artifacts/master/download?job=bundle). Extract the files into the `dist` folder of `irmajs.`
* **Compile from source**, as follows:
  ```shell
  git clone https://github.com/privacybydesign/irmajs && cd irmajs
  npm i
  npm run build
  ```

The `irma.js` JavaScript file in the `dist` folder (or from the zip file) can now be included in a `<script>` tag in your website.

Examples for the browser and for nodejs are included in the `examples` folder.

## Perform browser IRMA session

(Re)start your `irma server`, configuring it such that it statically hosts the `irmajs` example webpage we just built:
```shell
irma server -v --static-path ~/irmajs/examples/browser
```
A webpage demoing IRMA attribute issuance verification should now be available at http://localhost:8088.

> Open the browser console and the console running `irma server` to see various log messages and possibly error messages as the IRMA session proceeds.
