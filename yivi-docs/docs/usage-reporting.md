---
title: Usage reporting
---

Your [IRMA server](irma-server.md) can report how many disclosure and signing sessions it handles to the [Yivi Portal](https://portal.yivi.app). The Portal then shows your organization how many successful verifications its servers performed, per day or per month. This replaces the old way the IRMA server reported on itself, which sent the admin email address (`--email`) and a version ping.

To set it up, you do three things:

1. Give the server an **account key** that it keeps across restarts.
2. **Register** the public part of that key with your organization in the Yivi Portal.
3. Restart the server and **check the logs**.

You don't need a database or Redis for this. You also don't need to change your session requests or your frontend.

## What is reported

The server counts every IRMA session that reaches a final status. The counts are grouped by:

| Field | Values |
|---|---|
| Day | The UTC date the session ended |
| Requestor | The name of the [authenticated requestor](irma-server.md#requestor-authentication) that started the session |
| Action | `disclosing` or `signing` (and `issuing`, see [counting issuance](#counting-issuance)) |
| Outcome | `done`, `cancelled`, `failed` or `timeout` |
| Credential type | For `done`: the credential types that were actually disclosed. For the other outcomes: the credential types the request asked for. |

Every 5 minutes the server puts the counts of that interval into a report. It signs the report with its account key and sends it to the Portal. Each report also holds the irmago version, a name for the server instance, and a run ID and sequence number. With the run ID and sequence number, the Portal can tell when a report is missing.

The server **never** sends attribute values, session tokens, IP addresses or other personal data. A report only tells the Portal that, for example, requestor `webshop` completed 42 disclosures of `pbdf.sidn-pbdf.email` on a given day.

OpenID4VP sessions are not counted yet.

## Before you start

* Your organization must be **verified** in the Yivi Portal. You can only register usage keys for a verified organization. If your organization is not verified yet, the Usage page in the Portal says so instead of showing the keys and the chart.
* You must be able to manage your organization in the Portal.
* Your server must run an irmago version that supports usage reporting. Run `yivi irma server -h` and look for the `--usage-reporting-*` flags.
* The server must be able to make outgoing HTTPS requests to `https://portal.yivi.app`. If it uses an [outgoing HTTP proxy](irma-server.md#outgoing-http-proxies), set `HTTPS_PROXY`. The reporter uses it, and it respects `NO_PROXY`.

## Step 1: create the account key

Each server signs its reports with an ES256 (P-256) account key. The key must survive restarts, because the Portal knows your server by it. You can store the key in one of two ways.

**Option A: a state directory (recommended for a single server).** The server creates the key in this directory the first time it needs one. It also writes reports that it could not send yet to the directory, so they survive a restart.

```shell
yivi irma server usage-key --usage-reporting-state-dir /var/lib/irma/usage
```

**Option B: a key file you manage yourself**, for example a Kubernetes secret or a file from your secrets manager. The key must be a PEM-encoded P-256 private key, in SEC 1 (`EC PRIVATE KEY`) or PKCS #8 (`PRIVATE KEY`) format:

```shell
openssl ecparam -name prime256v1 -genkey -noout -out usage-account.key
yivi irma server usage-key --usage-reporting-account-key-file usage-account.key
```

Either way, `usage-key` prints the public key and its JWK thumbprint:

```text
-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE...
-----END PUBLIC KEY-----
JWK thumbprint: 3q2-7wK1h1nZ...
```

Keep this output. You paste it into the Portal in the next step. You can run `usage-key` again at any time: it loads the existing key and prints the same output.

:::warning
The private key (`account.key` in the state directory, or your key file) is what proves to the Portal that reports come from your organization. Treat it like any other secret. Don't commit it to version control and don't bake it into a container image.
:::

## Step 2: register the key in the Yivi Portal

1. Log in to the [Yivi Portal](https://portal.yivi.app).
2. Click your profile and pick your organization.
3. Select **Usage**.
4. Click **Register key**.
5. Paste the **full output** of `yivi irma server usage-key` into the **Public key** field. The thumbprint line is fine to include.
6. Optionally, add a **Label** such as `production` or `acceptance`, so you can tell your keys apart later.
7. Click **Register**.

The key now shows up in the list as **Active**, with its thumbprint and the date you registered it. Check that the thumbprint matches the one `usage-key` printed.

## Step 3: configure and start the server

Start the server with the same key setting you used for `usage-key`:

```shell
yivi irma server --production \
  --usage-reporting-state-dir /var/lib/irma/usage \
  ...
```

In [production mode](irma-server.md#production-mode), setting a state directory or key file is enough to turn reporting on. The server then sends its reports to the Yivi Portal by default.

Like every other option, these can also be set as environment variables or in a configuration file:

```shell
IRMASERVER_USAGE_REPORTING_STATE_DIR=/var/lib/irma/usage
```

```json
{
  "production": true,
  "usage_reporting_state_dir": "/var/lib/irma/usage"
}
```

### Check that it works

At startup the server checks with the Portal that its key is registered. If it is, the server logs:

```text
Usage reporting account key is registered in the Yivi Portal  thumbprint=3q2-7wK1h1nZ...
```

After the first interval (5 minutes by default) you will see `Sent usage report to the Yivi Portal` in the log. The first verifications then appear in the **Successful verifications** chart on the Usage page.

If you start the server before you register the key, it logs an error with the public key and thumbprint to register. The server **keeps running**. It checks again every hour, holds on to the counts, and sends them once you have registered the key.

## Configuration reference

| Flag | Environment variable | Default | Description |
|---|---|---|---|
| `--usage-reporting-state-dir` | `IRMASERVER_USAGE_REPORTING_STATE_DIR` | | Directory for the account key (`account.key`) and for reports that have not been sent yet. |
| `--usage-reporting-account-key-file` | `IRMASERVER_USAGE_REPORTING_ACCOUNT_KEY_FILE` | `account.key` in the state dir | PEM file with the P-256 account key. If set, this file is used and must exist. |
| `--usage-reporting-server-instance` | `IRMASERVER_USAGE_REPORTING_SERVER_INSTANCE` | hostname | Name of this server instance in the reports. Useful to tell replicas apart. |
| `--usage-reporting-interval` | `IRMASERVER_USAGE_REPORTING_INTERVAL` | `5m` | How often the counts are put into a report. Must be at least `1s`. |
| `--usage-reporting-count-issuance` | `IRMASERVER_USAGE_REPORTING_COUNT_ISSUANCE` | `false` | Also count issuance sessions. |
| `--usage-reporting-portal-url` | `IRMASERVER_USAGE_REPORTING_PORTAL_URL` | `https://portal.yivi.app/usage/v1/directory` in production mode | Usage directory URL of the Portal. Outside production mode, setting this turns reporting on. |
| `--usage-reporting-disabled` | `IRMASERVER_USAGE_REPORTING_DISABLED` | `false` | Turn usage reporting off, also in production mode. Only meant for Yivi's own internal services. |

### When is reporting on?

| Mode | Configuration | Result |
|---|---|---|
| Production | State dir or key file set | Reports to the Yivi Portal |
| Production | Nothing set | No reporting, with a warning at startup |
| Production | `--usage-reporting-disabled` | No reporting, with a warning at startup |
| Development | Nothing set | No reporting |
| Development | `--usage-reporting-portal-url` set | Reports to that URL (needs a state dir or key file too) |

:::note
For now, a production server without usage reporting still starts and only logs a warning:
`Usage reporting to the Yivi Portal is not configured. ... this will become required in a future version.`
A future major version will require it, so set it up now.
:::

## Deployment notes

### Docker

Mount the state directory as a volume, so the key and the unsent reports survive when the container is recreated. Run `usage-key` against the same volume:

```shell
docker run --rm -v irma-usage:/usage ghcr.io/privacybydesign/irma:latest \
  server usage-key --usage-reporting-state-dir /usage

docker run -d -v irma-usage:/usage -p 8088:8088 ghcr.io/privacybydesign/irma:latest \
  server --production --usage-reporting-state-dir /usage ...
```

### Kubernetes and multiple replicas

If you run several replicas of the same server, you can either:

* **share one key**: store it in a secret, mount it in every pod and set `--usage-reporting-account-key-file`. Register that one key in the Portal. Each replica reports under its own server instance name (the pod hostname by default) and run ID, so their counts are added up, not overwritten. Or
* **give each server its own key** and register each one. This is useful when you want to deactivate one server without affecting the others, for example to keep acceptance and production apart.

With only a key file and no state directory, reports that haven't been sent yet are kept **in memory**. A restart while the Portal is unreachable loses those counts. If that matters to you, also give each pod a persistent `--usage-reporting-state-dir`.

### Redis (stateless mode)

Usage reporting also works in [stateless mode](irma-server.md#stateless-mode). Completed sessions (`done`) are counted exactly. Timeouts are counted on a best-effort basis: if Redis lets a session expire before anyone reads it, that timeout is not counted.

### Graceful shutdown

On a clean stop (`SIGTERM`/`SIGINT`) the server seals the open counts into a final report and tries to send it within 10 seconds. If the server is killed or crashes, the Portal sees a gap in that run's sequence numbers. The Usage page then notes that the numbers may be incomplete.

## Resilience

Usage reporting never stops your server from handling sessions:

* **Portal down or unreachable**: reports wait in an outbox and are retried with exponential backoff, from 30 seconds up to 1 hour. Every report has a unique ID, so a retry is never counted twice.
* **Key not registered, or deactivated**: the server logs this, keeps counting and checks again every hour.
* **Long outage**: the outbox holds up to one week of reports at the default interval. When it is full, counts keep adding up in the current interval instead of being dropped.

## Counting issuance

By default only disclosure and signing sessions are counted. If you also want issuance sessions in your reports, add `--usage-reporting-count-issuance`. The credential types counted for a completed issuance session are the ones that were issued, plus any that were disclosed during it.

## Managing keys in the Portal

The **Usage keys** list on the Usage page shows every key with its label, thumbprint, registration date and status.

* **Rotating a key**: create a new key (a new state dir or key file), register it, switch the server over, and then deactivate the old key.
* **Deactivating a key**: click **Deactivate** next to it. The Portal no longer accepts reports signed with that key. Reports it already received are kept, so your history stays intact.

## Using the Go library

If you embed the server with the [`irmaserver` library](irma-server-lib.md), configure reporting through `UsageReporting` on `server.Configuration`:

```go
import (
	"github.com/privacybydesign/irmago/irma/server"
	"github.com/privacybydesign/irmago/irma/server/usage"
)

conf := &server.Configuration{
	Production: true,
	UsageReporting: &usage.Settings{
		StateDir: "/var/lib/irma/usage",
	},
	// ...
}
```

The same rules apply as for the `irma server` command. Call `Stop()` on the `irmaserver.Server` when you shut down, so the final report is sent. To create or inspect the key, use `usage.LoadOrCreateKey`, `usage.PublicKeyPEM` and `usage.Thumbprint`, or run `yivi irma server usage-key` with the same state dir.
