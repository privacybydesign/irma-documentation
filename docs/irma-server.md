---
title: irma server
---


`irma server` is an IRMA server executable (daemon) allowing you to perform IRMA sessions with
[IRMA apps](irma-app.md). It handles all IRMA-specific cryptographic details of issuing or verifying IRMA attributes with an IRMA app on behalf of a [requestor](overview.md#participants) (the application wishing to verify or issue attributes). It exposes the following:
 * HTTP endpoints under `/irma`, used by the IRMA app during IRMA sessions
 * a JSON API under `/sessions` for requestors, allowing them to request the server to verify or issue attributes.

`irma server` is a subcommand of the [`irma`](irma-cli.md) command line tool, which additionally contains subcommands to start or perform IRMA sessions, handle [IRMA schemes](schemes.md), and more.

For installation instructions, see [`irma`](irma-cli.md).

## Running the server

Simply run `irma server` to run the server with the default configuration in development mode. Use `irma server -v` for more verbose logging, for example to see the current configuration. Use `irma server -vv` to also log session contents.

Run `irma server --help` to see configuration options. In order to verify your configuration, run `irma server check -v`.

## Starting a session
Assuming the server runs in the [default configuration](#default-configuration) (in particular [requestor authentication](#requestor-authentication) is disabled (`no_auth` is `true`) and the `irma-demo` [scheme](schemes.md) is installed), issue `irma-demo.MijnOverheid.ageLower` attributes using the [`session`](irma-cli.md) subcommand of the `irma` tool:
```shell
irma session --server http://localhost:8088 --issue irma-demo.MijnOverheid.ageLower=yes,yes,yes,no
```
Verify the `irma-demo.MijnOverheid.ageLower.over18` attribute:
```shell
irma session --server http://localhost:8088 --disclose irma-demo.MijnOverheid.ageLower.over18
```
These print QRs in your terminal that you can scan with your [IRMA app](irma-app.md) to perform the session. For more extensive examples, see [irmajs](irmajs.md).

## Configuring
Run `irma server -h` to see all configuration options. Each option may be passed as:
 1. a command line flags (e.g. [`--listen-addr`](#http-server-endpoints))
 2. a environmental variable (e.g. `IRMASERVER_LISTEN_ADDR`)
 3. an item in a configuration file (e.g. `"listen_addr"`) (which may be in JSON, TOML or YAML)

 with the following rules:
 * Flags supersede environmental variables which supersede configuration file entries.
 * Dashes are used in flags, but underscores are used in environmental variables and configuration file entries.
 * Environmental variables are uppercased and prefixed with `IRMASERVER_`.
 * The [`requestors`](#requestor-authentication) and [`static_sessions`](#static-irma-qrs) options are special: when passed as a flag or environmental variable, they must be passed as a JSON object (for example: `--requestors '{"myapp":{"auth_method":"token","key":"12345"}}'`).
 * When passing a boolean flag [use an `=`](https://golang.org/pkg/flag/#hdr-Command_line_flag_syntax), for example [`--no-auth=false`](#requestor-authentication).

In order to see the configuration that the server uses after having gathered input from these sources, specify `-v` or `-vv` or use the `verbose` option. Use `irma server check -v` (with the same flags, env vars and config files as `irma server`) to check your configuration for correctness before running the server.

For a full configuation example, see [Getting started](getting-started.md#example-configuration-and-irma-session).

In the remainder of this document, when referring to options we write them as configuration file entries, with underscores and without prefix.

### Default configuration
In the default configuration (run `irma server check -v` to see it) the server is immediately usable. In particular, it
* uses the [default IRMA schemes](schemes.md#default-schemes-pbdf-and-irma-demo) ([`pbdf`](https://github.com/credentials/pbdf-schememanager) and [`irma-demo`](https://github.com/credentials/irma-demo-schememanager)), downloading them if necessary
* allows anyone to use the server [without authentication](#requestor-authentication) (the `no_auth` setting is `true`).

If the server is reachable from the internet, you should consider enabling authentication of session requests.

### Configuration files
A configuration file can be provided using the `config` option (for example: `irma server --config ./irmaserver.json`). When not specified, the server looks for a configuration file called `irmaserver.json` or `irmaserver.toml` or `irmaserver.yaml` in (1) the current path; (2) `/etc/irmaserver/`; (3) `$HOME/irmaserver`, in that order. A configuration file is not required; if none is found at any of these locations the server takes its configuration from just command line flags and environmental variables.

### Production mode
When running the server in production, you should enable the `production` option. This enables stricter defaults on the configuration options for safety and prints warnings on possibly unsafe configurations. In particular, when `production` is enabled, the default values of some options change as follows (cf. `diff <(irma server -h) <(irma server -h --production)`):

* `url` from `"http://$YOUR_LOCAL_IP:port"` to `""`: in development mode the `url` to which IRMA apps will connect is set by default to your current local IP address; in `production` mode you must configure it yourself.
* [`no_auth`](#requestor-authentication) from `true` to `false`: you should consider enabling requestor authentication, or explicitly disable this by setting this flag to `true`.
* [`issue_perms`](#global-permissions) from `[*]` (everything) to `[]` (none).
* [`no_email`](email.md) from `true` to `false`: in `production` mode, opting out of providing an email address can be done by explicitly setting this flag to `true`.

In addition, when [developer mode is not enabled in the IRMA app](irma-app.md#developer-mode) (the default setting), the IRMA app wil refuse to perform sessions with IRMA servers not running in `production` mode. Since the majority of the IRMA app users will not have developer mode enabled, this requires IRMA servers facing those users to enable `production` mode.

### Keys and certificates
For each configuration option that refers to some kind of key or certificate (for example `jwt_privkey`), there is a corresponding option with the `_file` suffix (for example `jwt_privkey_file`). Keys can be specified either by setting former to a (PEM) string, or setting the the latter to a file containing the (PEM) string.

### HTTP server endpoints
The HTTP endpoints that this server offers is split into two parts:
* `/session`: used by the requestor to start sessions, check session status, or get session results.
* `/irma`: used by the IRMA app during IRMA sessions.

In the default mode, the server starts one HTTP server that offers both, configured with `listen_addr` and `port`. If however the `client_port` and `client_listen_addr` options are provided, then the server starts two separate HTTP servers:
* `/session` attaches to the address and port provided with `port` and `listen_addr`.
* `/irma` attaches to the address and port provided with `client_port` and `client_listen_addr`.

The `/irma` endpoints must always be reachable for the IRMA app. Using this double server mode you can restrict access to the `/session` endpoints by e.g. setting `listen_addr` to `127.0.0.1` or to an interface only reachable from an internal network. Restricting access to the `/session` endpoints in this way may make requestor authentication unnecessary.

### Requestor authentication
The server runs in one of two modes: it either accepts all session requests from anyone that can reach the server, or it accepts only authenticated session requests from authorized requestors. This can be toggled with the `no_auth` boolean option. If the `/session` creation endpoint of your `irma server` is publicly accessible from the internet (i.e. the `client_port` option is used, see [above](#http-server-endpoints)), then you should consider enabling requestor authentication (i.e. turn `no_auth` off), otherwise anyone can use your `irma server`.

The default is `true` (requests are not authenticated) when `production` is disabled and `false` otherwise.

When authentication is enabled (`no_auth` is `false`), requestors that are authorized to use the server must be configured in the `requestor` option in the form of a map, for example:

```json
{
    "requestors": {
        "myapp": {
            "auth_method": "token",
            "key": "eGE2PSomOT84amVVdTU"
        }
    }
}
```

The server supports several authentication methods, one of which must be specified in the `auth_method` field for each requestor. The snippet above demonstrates the recommended and easiest to use authentication method, called `token`. When using this method the requestor must include the `key` as an API token in a HTTP header (for more details see the [API reference](api-irma-server.md#post-session)).

In addition the server supports the following authentication methods:
* `hmac`: the requestor symmetrically [signs the session request](session-requests.md#jwts-signed-session-requests) in a [JWT](https://jwt.io/), with HMAC-SHA256 (`HS256`) using `key`. The `key` provided should be the Base64 encoding of the actual secret.
* `publickey`: the requestor asymmetrically [signs the session request](session-requests.md#jwts-signed-session-requests) in a [JWT](https://jwt.io/) with RSA (`RS256`), in this case `key` should be the PEM public key of the requestor.

For each of these modes it is also possible to specify `key_file` instead `key`; in that case the file at `key_file` will be read and used as `key`.

### Static IRMA QRs
Unlike normal QRs which differ per session (as they contain the session token), the server also supports static QRs which, when scanned by the IRMA app, start preconfigured IRMA sessions. This makes it possible to for example print such a static QR. These preconfigured sessions are configured with the `static_sessions` options, for example:
```json
{
    "static_sessions": {
        "mystaticsession": {
            "callbackUrl": "https://example.com/callbackUrl",
            "request": {
                "@context": "https://irma.app/ld/request/disclosure/v2",
                "disclose": [[[ "irma-demo.MijnOverheid.ageLower.over18" ]]]
            }
        }
    }
}
```
Thus `static_sessions` must contain a map of which each item must be an [extended session request](session-requests.md#extra-parameters). Including a `callbackUrl` to which the [session result](api-irma-server.md#get-session-token-result) is sent after the session is required (since for these sessions there is no requestor waiting to receive the attributes after the session has finished). If a JWT private key is installed, then the session result is sent as a [JWT](api-irma-server.md#get-session-token-result-jwt).

> If no JWT private key is installed, then the `callbackUrl` should either not be publically reachable, or it should use a secret URL with TLS enabled (which it should anyway as personal data will be POSTed to it). Otherwise there is no way of distinguishing POSTs from your `irma server` from POSTs made by someone else.

Assuming the URL of the `irma server` is `http://example.com`, the session configured above is started when the IRMA app scans a QR with the following contents:
```json
{
    "irmaqr": "redirect",
    "u": "http://example.com/irma/session/mystaticsession"
}
```

Only static [disclosure or attribute-based signature sessions](what-is-irma.md#session-types) are supported.

### Permissions
For each of the [three IRMA session types](what-is-irma.md#session-types) (attribute verification; attribute-based signature sessions; and attribute issuance), permission to use specific attributes/credentials can be granted to requestors in the configuration. For example, including permissions in the `myapp` requestor from above:
```json
{
    "requestors": {
        "myapp": {
            "disclose_perms": [ "irma-demo.MijnOverheid.ageLower.over18" ],
            "sign_perms": [ "irma-demo.MijnOverheid.ageLower.*" ],
            "issue_perms": [ "irma-demo.MijnOverheid.ageLower" ],
            "auth_method": "token",
            "key": "eGE2PSomOT84amVVdTU"
        }
    }
}
```
This means that `myapp` is authorized to request `irma-demo.MijnOverheid.ageLower.over18` in disclosure session, and any attribute from `irma-demo.MijnOverheid.ageLower` in attribute-based signature sessions. Additionally `myapp` can issue `irma-demo.MijnOverheid.ageLower` instances. In each level wildcards are permitted (`irma-demo.MijnOverheid.ageLower.*`, `irma-demo.MijnOverheid.*`, `irma-demo.*`, `*`). Thus `"disclose_perms": [ "*" ]` allows the requestor to verify any attribute.

### Global permissions

Global permissions can be applied to all requestors by using the global `disclose_perms`, `sign_perms` and `issue_perms` options. For each requestor, the effective set of permissions is the union of the permissions specified in its `requestors` map and the global permission set.

The global options also work when `no_auth` is enabled. Thus in this case a session type can be disabled by granting no one the permission, e.g., `issue_perms: []` would disable issuance.

In development mode, when `production` is `false`, the defaults for `disclose_perms`, `sign_perms` and `issue_perms` are `["*"]`. In order to protect any IRMA private keys that the server has access to from unintended use by others, when `production` is true the default of `issue_perms` is `[]`: no one can issue unless the global `issue_perms` is modified or unless specific requestors receive nonempty `issue_perms`.

### Client return urls

In session requests, the server can be asked to pass a [client return url](session-request.md#client-return-url) to the irma app, which the app will open after completing the session for sessions that involve only one device. This feature is always enabled.

### Augmented client return urls

The server can be configured to [augment the client return url](session-requests.md#augmenting-the-client-return-url) when requested. In order to enable this feature, the `augment_client_return_url` setting needs to be set to `true`.

### Static file hosting

Apart from hosting endpoints under [`/session` and `/irma`](irma-server.md#http-server-endpoints), the server also supports statically hosting all files from a certain directory. This can be useful [for experimenting](getting-started.md#perform-browser-irma-session). It can be configured with the following options:

* `static_path`: Host files under this path as static files. Leave empty to disable static file hosting.
* `static_prefix`: Host static files under this URL prefix (default: no prefix)

### IRMA schemes

The server uses [IRMA schemes](schemes.md) to retrieve issuer, credential and attribute names, as well as public and private keys with which attributes can be verified an issued, respectively. By default the server uses the [`pbdf` and `irma-demo` schemes](schemes.md#default-schemes-pbdf-and-irma-demo). This can be configured with the following options:

* `schemes_path`: path containing IRMA schemes (often called `irma_configuration`). Default: `C:\Users\Username\AppData\Local\irma\irma_configuration` on Windows, `$HOME/.local/share/irma/irma_configuration` otherwise. Created if it does not exist. If empty, the default schemes [`pbdf` and `irma-demo`](schemes.md#default-schemes-pbdf-and-irma-demo) are downloaded into it.
* `schemes_assets_path`: path containing initial, read-only IRMA schemes. If specified, the schemes found here are copied into the path specified by `schemes_path`. Can be used to avoid downloading default schemes on first run.
* `schemes_update`: update IRMA schemes from their scheme URL every this many minutes. Default is `60`. Set to `0` to disable automatic scheme updating (not recommended).

### IRMA issuer private keys

If IRMA issuer private keys are included in the server configuration, then the server can issue all credential types of all issuers for which private keys are installed. IRMA issuer private keys can be configured in the following two ways:

* Include the private keys within the [IRMA scheme](schemes.md) in the issuer's `PrivateKeys` folder, with filenames `0.xml`, `1.xml`, etc ([example](https://github.com/privacybydesign/irma-demo-schememanager/tree/master/MijnOverheid/PrivateKeys)).
* Set the `privkeys` option to a folder containing IRMA issuer private keys called `scheme.issuer.xml` or `scheme.issuer.counter.xml` (for example, `irma-demo.MijnOverheid.xml` or `irma-demo.MijnOverheid.2.xml`).

If issuance is enabled in production and private keys are configured, then you should ensure that only authenticated requestors can start issuance requests (otherwise if anyone can use your server to issue attributes then those attributes cannot be trusted or used). You should either:

* disable `no_auth` and [send authenticated session requests](irma-server.md#requestor-authentication),
* Restrict the [`/session` HTTP endpoints](#http-server-endpoints) to a internal network interface only accessible by your applications and not from outside.

Taking neither approach is an unsafe configuration as in that case anyone can create issuance sessions. In this case, if `production` mode is enabled then the server will refuse to run.

### Signed JWT session results

If a `jwt_privkey` (or `jwt_privkey_file`) is given, then the following endpoints are enabled:

* `GET /session/{sessiontoken}/result-jwt`: returns the session result signed by the `irma server` into a JWT.
* `GET /session/{sessiontoken}/getproof`: returns a JWT similar to the one from `result-jwt`, but with the same structure as the IRMA API server session result JWTs.
* `GET /publickey`: returns the public key with which the JWTs output by this server can be verified.

This can be useful if the session result travels along an unsafe or untrusted route from the IRMA server to the requestor. As long as the `irma server` is trusted and its public key is known, the JWT can be verified to ensure that the session result was untampered with since it left the `irma server`.

### TLS

The IRMA protocol relies on TLS for encryption of the attributes as they travel along the internet. If your server is connected to the internet and it handles actual attributes (personal data from people), then you ***must*** ensure that the attributes are protected in transit with TLS. In its default configuration (i.e. with [developer mode](irma-app.md#developer-mode) disabled), the IRMA app will refuse to connect to servers not using TLS.

You can enable TLS in the `irma server` with the `tls_cert` and `tls_privkey` options (or the `_file` equivalents), specifying a PEM certificate (chain) and PEM private key. If you use [separate requestor and app endpoints](#http-server-endpoints), additionally use `client_tls_cert` and `client_tls_privkey`.

Alternatively, if your IRMA server is connected to the internet through a reverse proxy then your reverse proxy probably handles TLS for you.

### Email

Users of the server are encouraged to provide an email address with the `email` option, subscribing for notifications about changes in the IRMA software or ecosystem. [More information](email.md). In `production` mode, it is required to either provide an email address or to explicitly out with the `no_email` option.

### Logging and verbosity

The server's verbosity can be increased by two degrees:
* `-v` flag is given, or `verbosity` option set to `1`: includes `DEBUG` messages. Logs server configuration when starting the server, stack traces of errors, and more.
* `-vv` flag is given, or `verbosity` option set to `2`: includes `TRACE` messages. Additionally includes dumps of all HTTP traffic from and to the server.

> in its default mode, the server will not log attribute values (personal data). If the verbosity is increased, then attribute values may be logged. You should avoid doing this in production.

The output is [structured](https://github.com/sirupsen/logrus#fields), putting certain recurring values in fields:
```text
[2019-02-28T20:51:09+01:00]  INFO Session started action=disclosing session=WdypvSs97JTotpfl1Dtd
```
Outputting JSON is enabled with the `log-json` option:
```json
{"action":"disclosing","level":"info","msg":"Session started","session":"WdypvSs97JTotpfl1Dtd","time":"2019-02-28T20:51:09+01:00"}
```

## Running as daemon

On most Linux systems, the `irma server` can be made into an automatically started daemon as follows:

1. Write a new systemd unit file to `/etc/systemd/system/irmaserver.service`:
    ```ini
    [Unit]
    Description=IRMA server
    Documentation=https://irma.app/docs/irma-server
    Requires=network.target

    [Service]
    Type=simple
    ExecStart=/usr/local/bin/irma server --config=/etc/irmaserver/config.json
    TimeoutStopSec=60
    Restart=always
    RestartSec=1
    StandardOutput=syslog
    StandardError=syslog
    SyslogIdentifier=irma
    User=irmaserver
    Group=irmaserver

    [Install]
    WantedBy=multi-user.target
    ```
    Modify the path to `irma` and [your configuration file (or flags or environmental variables)](#configuring) in `ExecStart` as needed, as well as `User` and `Group`.
2.  Start the daemon and schedule it for automatic start on boot by running `systemctl start irmaserver.service && systemctl enable irmaserver.service`.

See `systemctl status irmaserver.service` for the status of the daemon, and `journalctl -u irmaserver.service` for the console output of the IRMA server.

## Design goals

The server was designed with the following goals in mind.
- Developer and user friendliness
  - Each of the [configuration options](#configuring) can be specified in a configuration file, command line flag, or environmental vars (see `-h`)
  - Default configuration (demo mode) is immediately useful
  - Thorough and configurable logging (`-v`, `-vv`; by default logs exclude attribute values)
  - Partial backwards compatibility with predecessor [`irma_api_server`](https://github.com/privacybydesign/irma_api_server)
  - Small startup time
- Also available as [Go library](irma-server-lib.md) instead of standalone server
  - Bindings to other programming languages (Python, Ruby) are expected

Being written in [Go](https://golang.org/), this server (in fact, the containing [`irma` binary](irma-cli.md)) additionally automatically has the following properties.
- Simple to install (one binary, no dependencies, cross platform) and/or compile
- [Reproducible builds](https://www.gnu.org/software/mes/manual/html_node/Reproducible-Builds.html)
- [API documentation](https://godoc.org/github.com/privacybydesign/irmago) (generated automatically from `master` branch)

Referring to Go packages (i.e. folders) under [`irmago`](https://github.com/privacybydesign/irmago), the server is structured as follows.
* [`server/irmaserver`](irma-server-lib.md): Go library implementing the HTTP endpoints for the IRMA protocol (in which the IRMA app is the client), and a Go API for requestors to manage sessons. ([Godoc API documentation](https://godoc.org/github.com/privacybydesign/irmago/server/irmaserver))
* `server/requestorserver`: Go library wrapping `server/irmaserver`, exposing the requestor API as a second HTTP endpoint set under `/session` URLs instead of as Go functions (next to `/irma` for the IRMA app endpoints). ([Godoc API documentation](https://godoc.org/github.com/privacybydesign/irmago/server/requestorserver))
* `irma`: executuable whose `server` commands wraps `server/requestorserver`.
