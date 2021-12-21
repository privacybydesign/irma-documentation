---
title: Getting started
id: version-v0.5.0-getting-started
original_id: getting-started
---

This page shows how to get started with verifying or issuing IRMA attributes, using the following components:

 * [`irma server`](irma-server.md), a server that verifies or issues IRMA attributes to [IRMA apps](irma-app.md),
 * [`irma-frontend`](irma-frontend.md), a JavaScript library for drawing the IRMA QR in your website, and handling IRMA session with the `irma server`.

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


## Installing an example webpage for `irma-frontend`
Download the `irma-frontend-packages` source code, as [zip](https://github.com/privacybydesign/irma-frontend-packages/archive/master.zip) from GitHub, or using git:
```shell
git clone https://github.com/privacybydesign/irma-frontend-packages && cd irma-frontend-packages
```

Examples for the browser and for nodejs are included in the `examples` folder. In this guide we will use the `irma-frontend` example for browsers to realize the example webpage. This example has to be installed first.
```shell
cd examples/browser/irma-frontend/
npm install
npm run build
```

## Perform browser IRMA session

(Re)start your `irma server`, configuring it such that it statically hosts the `irma-frontend` example webpage we just built:
```shell
irma server -v --static-path ~/irma-frontend-packages/examples/browser/irma-frontend
```
A webpage demoing IRMA attribute issuance verification should now be available at http://localhost:8088.

> Open the browser console and the console running `irma server` to see various log messages and possibly error messages as the IRMA session proceeds.

## Example configuration and IRMA session

Generally, your IRMA server runs in your backend alongside a server application serving your frontend (website), with which the IRMA app user is interacting. Your server application starts and manages sessions at your IRMA server to verify or issue attributes (for example, when the user wants to log in). This can be setup as follows.

### Configure `irma server`

In production it is generally best to [authenticate incoming session requests](irma-server.md#requestor-authentication) from your application. The following is an example production configuration file ([in YAML](irma-server.md#configuring)) for the `irma server` (start with `irma server -c /path/to/config.yml`) that will accept [session requests](session-requests.md) if they include a `Authorization: mysecrettoken` HTTP header.

```yaml
production: true
email: "example@example.com"  # see https://irma.app/docs/email

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

* You may want to [restrict permissions](irma-server.md/#permissions) to verify or issue specific attributes, globally or per requestor.
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

* Use the `token` to [track the session status](api-irma-server.md#get-session-token-status), and to [get the session result](api-irma-server.md#get-session-token-result) after the session has finished.
* The `sessionPtr` and `frontendRequest` are used by [`irma-frontend`](api-irma-frontend.md) to show an IRMA QR code or toggle to the IRMA app. Generally you [configure `irma-frontend`](https://github.com/privacybydesign/irma-frontend-packages/tree/master/plugins/irma-client#usage) with an URL that returns the `sessionPtr` and `frontendRequest`; it will then start the session automatically.

Instead of managing sessions with HTTP requests as shown here, [for certain languages](irma-backend.md) (currently Go and JavaScript) it is also possible to include an IRMA library and manage sessions using function invocations.

## Issuing IRMA attributes

This page mostly focuses on verifying, i.e. receiving IRMA attributes from IRMA apps and establishing their authenticity. Issuing attributes to IRMA apps can be done with the same software and with largely similar flows, but is more involved, because the identity of prospective issuers need to be verified and the contents and structure of the credentials to be issued needs to be established. This process is documented (among other things) in the [issuer guide](issuer.md).

For experimenting and demoing, however, it is possible to issue [any of the existing credentials](https://privacybydesign.foundation/attribute-index/en/irma-demo.html) within the [`irma-demo` scheme](schemes.md). For example, if the `requestors` block in the [YAML example configuration](#configure-irma-server) of the IRMA server above would include permission to issue `irma-demo` attrbutes, as follows:

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
