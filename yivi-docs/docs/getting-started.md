---
title: Getting started
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

This page shows how to get started with verifying or issuing IRMA attributes, using the following components:

 * [`irma server`](irma-server.md), a server that verifies or issues IRMA attributes to [Yivi apps](yivi-app.md),
 * [`yivi-frontend`](yivi-frontend.md), a JavaScript library for drawing the Yivi QR in your website, and handling IRMA session with the `irma server`.

You should have the [Yivi app](yivi-app.md) installed ([Android](https://play.google.com/store/apps/details?id=org.irmacard.cardemu), [iOS](https://itunes.apple.com/nl/app/irma-authentication/id1294092994)). If you want to compile from source instead of using prebuilt binaries, you should additionally have [Git](https://git-scm.com/), [Go](https://golang.org/doc/install), and [npm](https://docs.npmjs.com/cli/npm) installed.


## Installing `irma server`
You can install the `irma` command line tool in the following three ways.

<Tabs groupId="installation">
  <TabItem value="binary" label="Prebuilt binary" default>
    * Download prebuilt binary from [GitHub](https://github.com/privacybydesign/irmago/releases/latest). Choose the binary for your OS and architecture (most likely amd64).
    * Rename the file to `/usr/local/bin/irma` to have it available in your PATH.
  </TabItem>
  <TabItem value="compile" label="Compile and install binary from source">
    ```shell
    go install github.com/privacybydesign/irmago/irma@latest
    ```
  </TabItem>
  <TabItem value="docker" label="Docker">
    ```shell
    docker pull ghcr.io/privacybydesign/irma:latest
    ```
  </TabItem>
</Tabs>

## Running `irma server`
After installing the `irma` binary, start the server (with increased verbosity but otherwise default configuration):

<Tabs groupId="installation">
  <TabItem value="binary" label="Binary" default>
    ```shell
    irma server -v
    ```
  </TabItem>
  <TabItem value="docker" label="Docker">
    ```shell
    IP=192.168.1.2 # Replace with your local IP address.
    docker run -p 8088:8088 ghcr.io/privacybydesign/irma:latest server -v --url "http://$IP:port"
    ```
  </TabItem>
</Tabs>

### Configuration
Run `irma server -h` to see configuration options. In order to verify your configuration, run `irma server check -v`. General documentation can be found on the [irma server](irma-server.md) page, API documentation of HTTP endpoints can be found on the [api irma server](api-irma-server.md) page.

## Perform a command line IRMA session
Given:
1. a running IRMA server (see [above](#running-irma-server))
2. the Yivi app with [developer mode](yivi-app.md#developer-mode) turned on
3. the devices with the Yivi app and IRMA server on the same network

you can perform a first IRMA session using your server on the command line as follows:

<Tabs groupId="installation">
  <TabItem value="binary" label="Binary" default>
    ```shell
    irma session --server http://localhost:8088 --disclose pbdf.pbdf.irmatube.type
    ```
  </TabItem>
  <TabItem value="docker" label="Docker">
    ```shell
    IP=192.168.1.2 # Replace with your local IP address.
    docker run ghcr.io/privacybydesign/irma:latest session --server "http://$IP:8088" --disclose pbdf.pbdf.irmatube.type
    ```
  </TabItem>
</Tabs>
[IRMATube attributes](https://attribute-index.yivi.app/en/pbdf.pbdf.irmatube.html) are available on the [YiviTube demo](https://yivitube.yivi.app/) page. This will print a QR that you can scan with your Yivi app, and the attribute contents after they have been received and verified by the server. `irma session` can also perform issuance sessions and attribute-based signature sessions. If you pass  `-v` it logs the session request JSON that it sends to your `irma server`.


## Installing an example webpage for `yivi-frontend`
Download the `yivi-frontend-packages` source code, as [zip](https://github.com/privacybydesign/yivi-frontend-packages/archive/master.zip) from GitHub, or using git:
```shell
git clone https://github.com/privacybydesign/yivi-frontend-packages && cd yivi-frontend-packages
```

Examples for the browser and for Node.js are included in the `examples` folder. In this guide we will use the `yivi-frontend` example for browsers to realize the example webpage. This example has to be installed first.
```shell
cd examples/browser/yivi-frontend/
npm install
npm run build
```

## Perform browser IRMA session

(Re)start your `irma server`, configuring it such that it statically hosts the `yivi-frontend` example webpage we just built with the commands below. Change `~` to the actual folder you have downloaded `yivi-frontend-packages` to.
<Tabs groupId="installation">
  <TabItem value="binary" label="Binary" default>
    ```shell
    irma server -v --static-path ~/yivi-frontend-packages/examples/browser/yivi-frontend
    ```
  </TabItem>
  <TabItem value="docker" label="Docker">
    ```shell
    IP=192.168.1.2 # Replace with your local IP address.
    docker run -v ~/yivi-frontend-packages:/yivi-frontend-packages -p 8088:8088 ghcr.io/privacybydesign/irma:latest server -v --url "http://$IP:port" --static-path /yivi-frontend-packages/examples/browser/yivi-frontend
    ```
  </TabItem>
</Tabs>
A webpage demoing IRMA attribute issuance verification should now be available at http://localhost:8088.

:::note
Open the browser console and the console running `irma server` to see various log messages and possibly error messages as the IRMA session proceeds.
:::

## Example configuration and IRMA session

Generally, your IRMA server runs in your backend alongside a server application serving your frontend (website), with which the Yivi app user is interacting. Your server application starts and manages sessions at your IRMA server to verify or issue attributes (for example, when the user wants to log in). This can be set up as follows.

### Configure `irma server`

In production, it is generally best to [authenticate incoming session requests](irma-server.md#requestor-authentication) from your application. The following is an example production configuration file ([in YAML](irma-server.md#configuring)) for the `irma server` (start with `irma server -c /path/to/config.yml`) that will accept [session requests](session-requests.md) if they include a `Authorization: mysecrettoken` HTTP header.

```yaml title="config.yml"
production: true
email: "example@example.com"  # see https://docs.yivi.app/email/

port: 443
url: "https://example.com/irma/"
tls_cert: "/etc/letsencrypt/live/example.com/fullchain.pem"
tls_privkey: "/etc/letsencrypt/live/example.com/privkey.pem"

no_auth: false
requestors:
  myapp:
    auth_method: "token"
    key: "mysecrettoken"
```

* You may want to [restrict permissions](/irma-server/#permissions) to verify or issue specific attributes, globally or per requestor.
* The server can be made into a daemon on most Linux systems [using a systemd unit file](irma-server.md#running-as-daemon).
* Another common setup is to have a reverse proxy between the IRMA server and the internet, which handles TLS instead and forwards traffic on `https://example.com/irma/` to the IRMA server.

### Perform a session

Assuming your application runs on the same server as the IRMA server, your application can now start a session at your IRMA server as follows (using `curl` as example):

```bash
curl https://example.com/session \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: mysecrettoken" \
  -d '{
        "@context": "https://irma.app/ld/request/disclosure/v2",
        "disclose": [[["irma-demo.MijnOverheid.ageLower.over18"]]]
      }'
```

This will output something like the following:

```json
{
  "token": "X7LU5Q8Jhig0330gjYUO",
  "sessionPtr": {"u": "https://example.com/irma/t1nXs4ZduyhvAeAAlB77","irmaqr": "disclosing"},
  "frontendRequest":{"authorization":"X9XeI0gJG2HZv4hZ1WkP","minProtocolVersion":"1.0","maxProtocolVersion":"1.1"}
}
```

* Use the `token` to [track the session status](api-irma-server.md#get-sessionrequestortokenstatus), and to [get the session result](api-irma-server.md#get-sessionrequestortokenresult) after the session has finished.
* The `sessionPtr` and `frontendRequest` are used by [`yivi-frontend`](api-yivi-frontend.md) to show a Yivi QR code or toggle to the Yivi app. Generally you [configure `yivi-frontend`](https://github.com/privacybydesign/yivi-frontend-packages/tree/master/plugins/yivi-client#usage) with a URL that returns the `sessionPtr` and `frontendRequest`; it will then start the session automatically.

Instead of managing sessions with HTTP requests as shown here, [for certain languages](irma-backend.md) (currently Go and JavaScript) it is also possible to include an IRMA library and manage sessions using function invocations.

## Issuing IRMA attributes

This page mostly focuses on verifying, i.e. receiving IRMA attributes from Yivi apps and establishing their authenticity. Issuing attributes to Yivi apps can be done with the same software and with largely similar flows, but is more involved, because the identity of prospective issuers need to be verified and the contents and structure of the credentials to be issued needs to be established. This process is documented (among other things) in the [issuer guide](issuer.md).

For experimenting and demoing, however, it is possible to issue [any of the existing credentials](https://attribute-index.yivi.app/en/irma-demo.html) within the [`irma-demo` scheme](schemes.md). For example, if the `requestors` block in the [YAML example configuration](#configure-irma-server) of the IRMA server above would include permission to issue `irma-demo` attrbutes, as follows:

```yaml
requestors:
  myapp:
    auth_method: "token"
    key: "mysecrettoken"
    issue_perms:
      - "irma-demo.*"
```

Then an issuance session for the credential used in the [example disclosure session](#perform-a-session) above can be started at the IRMA server as follows:

```bash
curl https://example.com/session \
  -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: mysecrettoken" \
  -d '{
        "@context": "https://irma.app/ld/request/issuance/v2",
        "credentials": [
          {
            "credential": "irma-demo.MijnOverheid.ageLower",
            "attributes": {
              "over12": "yes",
              "over16": "yes",
              "over18": "yes",
              "over21": "no"
            }
          }
        ]
      }'
```

To issue a demo credential of your own not already present in the `irma-demo` scheme, see the [issuer guide](issuer.md).
