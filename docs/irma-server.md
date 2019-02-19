---
title: irma server
---


`irma server` is an IRMA server executable (daemon) allowing you to perform IRMA sessions with
[IRMA apps](https://github.com/privacybydesign/irma_mobile).
It exposes the following:
 * HTTP endpoints used by the IRMA app during IRMA sessions
 * a JSON API for [requestors](https://credentials.github.io/docs/irma.html#participants),
   allowing them to request the server to verify or issue attributes.

`irma server` is a subcommand of the `irma` command line tool, which additionally contains subcommands to start or perform IRMA sessions, handle IRMA schemes, and more.

## Installing
If necessary, clone `irmago` and install dependencies with [dep](https://github.com/golang/dep):
```shell
mkdir -p $GOPATH/github.com/privacybydesign && cd $GOPATH/github.com/privacybydesign
git clone https://github.com/privacybydesign/irmago && cd irmago
dep ensure
```

Build and install:
```shell
cd irma
go install
```


Run `irma server -h` to see configuration options or just `irma server` to run the server with the default configuration.
In order to verify your configuration, run `irma server check -v`.


## Starting a session
Assuming the server runs in the [default configuration](#default-configuration) (in particular [requestor authentication](#requestor-authentication) is disabled (`no_auth` is `true`) and the `irma-demo` scheme is installed), issue `irma-demo.MijnOverheid.ageLower` attributes using the [`session`](../../irma) subcommand of the `irma` tool:
```shell
irma session --server http://localhost:8088 --issue irma-demo.MijnOverheid.ageLower=yes,yes,yes,no
```
Verify the `irma-demo.MijnOverheid.ageLower.over18` attribute:
```shell
irma session --server http://localhost:8088 --disclose irma-demo.MijnOverheid.ageLower.over18
```
These print QRs in your terminal that you can scan with your IRMA app to perform the session. For more extensive examples, see [irmajs](irmajs).



## Configuring
Run `irma server -h` to see all configuration options. Each option may be passed as:
 1. a command line flags (e.g. `--listen-addr`)
 2. a environmental variable (e.g. `IRMASERVER_LISTEN_ADDR`)
 3. an item in a configuration file (e.g. `"listen_addr"`) (which may be in JSON, TOML or YAML)
 
 with the following rules:
 * Flags supersede environmental variables which supersede configuration file entries.
 * Dashes are used in flags, but underscores are used in environmental variables and configuration file entries.
 * Environmental variables are uppercased and prefixed with `IRMASERVER_`.
 * The `requestors` option is special: when passed as a flag or environmental variable, it must be passed in JSON.

In order to see the configuration that the server uses after having gathered input from these sources, specify `-v` or `-vv` or use the `verbose` option. Use `irma server check -v` (with the same flags, env vars and config files as `irma server`) to check your configuration for correctness before running the server.

In the remainder of this document, when referring to options we write them as configuration file entries, with underscores and without prefix.

### Default configuration
In the default configuration (run `irma server check -v` to see it) the server is immediately usable. In particular, it
* uses the default [IRMA schemes](https://credentials.github.io/docs/irma.html#scheme-managers) ([pbdf](https://github.com/credentials/pbdf-schememanager) and [irma-demo](https://github.com/credentials/irma-demo-schememanager)), downloading them if necessary
* allows anyone to use the server [without authentication](#requestor-authentication) (the `no_auth` setting is `true`).

If the server is reachable from the internet, you should consider enabling authentication of session requests.

### Configuration files
A configuration file can be provided using the `config` option (for example: `irma server --config ./irmaserver.json`). When not specified, the server looks for a configuration file called `irmaserver.json` or `irmaserver.toml` or `irmaserver.yaml` in (1) the current path; (2) `/etc/irmaserver/`; (3) `$HOME/irmaserver`, in that order. A configuration file is not required; if none is found at any of these locations the server takes its configuration from just command line flags and environmental variables.

### Keys and certificates
For each configuration option that refers to some kind of key or certificate (for example `jwt_privkey`), there is a corresponding option with the `_file` suffix (for example `jwt_privkey_file`). Keys can be specified either by setting former to a (PEM) string, or setting the the latter to a file containing the (PEM) string.

### Production mode
When running the server in production, enable the `production` option. This enables stricter defaults on the configuration options for safety and prints warnings on possibly unsafe configurations.

### HTTP server endpoints
The HTTP endpoints that this server offers is split into two parts:
* `/session`: used by the requestor to start sessions, check session status, or get session results.
* `/irma`: used by the IRMA app during IRMA sessions.

In the default mode, the server starts one HTTP server that offers both, configured with `listen_addr` and `port`. If however the `client_port` and `client_listen_addr` options are provided, then the server starts two separate HTTP servers:
* `/session` attaches to the address and port provided with `port` and `listen_addr`.
* `/irma` attaches to the address and port provided with `client_port` and `client_listen_addr`.

The `/irma` endpoints must always be reachable for the IRMA app. Using this double server mode you can restrict access to the `/session` endpoints by e.g. setting `listen_addr` to `127.0.0.1` or to an interface only reachable from an internal network. Restricting access to the `/session` endpoints in this way may make requestor authentication unnecessary.

### Requestor authentication
The server runs in one of two modes: it either accepts all session requests from anyone that can reach the server, or it accepts only authenticated session requests from authorized requestors. This can be toggled with the `no_auth` boolean option. The default is `true` (requests are not authenticated) when `production` is not enabled, and `false` otherwise.

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

The server supports the following three authentication methods, one of which must be specified in `auth_method` for each requestor:
* `token`: the requestor must include the `key` as an API token in a HTTP header.
* `hmac`: the requestor symmetrically [signs the session request](api-session-requests#jwts-signed-session-requests) in a [JWT](https://jwt.io/), with RSA (`RS256`), in this case `key` should be the PEM public key of the requestor.
* `publickey`: the requestor asymetrically [signs the session request](api-session-requests#jwts-signed-session-requests) in a [JWT](https://jwt.io/) with HMAC-SHA256 (`HS256`) using `key`. The `key` provided should be the Base64 encoding of the actual secret.

For each of these modes it is also possible to specify `key_file` instead `key`; in that case the file at `key_file` will be read and used as `key`.

### Permissions
For each of the three IRMA session types (attribute verification; attribute-based signature sessions; and attribute issuance), permission to use specific attributes/credentials can be granted to requestors in the configuration. For example, including permissions in the `myapp` requestor from above:
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

The global options also work when `no_auth` is enabled. Thus in this case a session type can be disabled by granting no one the permission, e.g., `issue_perms: ["*"]` would disable issuance.

In development mode, when `production` is `false`, the defaults for `disclose_perms`, `sign_perms` and `issue_perms` are `["*"]`. In order to protect any IRMA private keys that the server has access to from unintended use by others, when `production` is true the default of `issue_perms` is `[]`: no one can issue unless the global `issue_perms` is modified or unless specific requestors receive nonempty `issue_perms`.

### Signed JWT session results

If a `jwt_privkey` (or `jwt_privkey_file`) is given, then the following endpoints are enabled:

* `GET /session/{sessiontoken}/result-jwt`: returns the session result signed by the `irma server` into a JWT.
* `GET /session/{sessiontoken}/getproof`: returns a JWT similar to the one from `result-jwt`, but with the same structure as the IRMA API server session result JWTs.
* `GET /publickey`: returns the public key with which the JWTs output by this server can be verified.

This can be useful if the session result travels along an unsafe or untrusted route from the IRMA server to the requestor. In such cases the JWT can be verified to ensure that the session result is untampered with.

### TLS

### Email

Users of the server are encouraged to provide an email address with the `email` option, subscribing for notifications about changes in the IRMA software or ecosystem. [More information](../#specifying-an-email-address). In `production` mode, it is required to either provide an email address or to explicitly out with the `no_email` option. 

## See also

This executable wraps the Go library [`requestorserver`](../requestorserver) which wraps the Go library [`irmaserver`](../irmaserver).

The [client](../../irmaclient) corresponding to this server is implemented by the [IRMA mobile app](https://github.com/privacybydesign/irma_mobile).

This server replaces the Java [irma_api_server](https://github.com/privacybydesign/irma_api_server). 
