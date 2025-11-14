---
title: irma cli
---

`irma` is an IRMA Swiss knife in the form of a command line executable, supporting the following subcommands:

* [`irma server`](irma-server.md): an IRMA server daemon allowing you to perform IRMA sessions with [Yivi apps](yivi-app.md).
* `irma session`: Perform an IRMA disclosure, issuance or signature session, using the [builtin](irma-server-lib.md) IRMA server or a remote [`irma server`](irma-server.md)
* [`irma scheme`](schemes.md#updating-and-signing-schemes-with-irma): Manage IRMA schemes, supporting downloading, updating, verifying, and signing schemes, and IRMA key generation
* `irma request`: compose an IRMA session request
* `irma meta`: Parse an IRMA metadata attribute and print its contents

Pass `-h` or `--help` to any of these subcommands to see usage details and examples.

## Installation

See the [Getting started guide](getting-started.md#installing-irma-server).

## Examples

Perform IRMA sessions on the command line. By default, this starts a IRMA server specfically for one session on port 48680, prints the QR, and prints session results when the session is done:
```shell
irma session --disclose pbdf.nijmegen.personalData.fullname
irma session --issue irma-demo.MijnOverheid.ageLower=yes,yes,yes,no
irma session --noqr --request '{"type":"disclosing","content":[{"label":"BSN","attributes":["irma-demo.MijnOverheid.ageLower.over18"]}]}'
irma session --server http://localhost:8088 --authmethod token --key mytoken --disclose irma-demo.MijnOverheid.ageLower.over18
```

> If you run using Docker, then the commands look a bit different.
> ```shell
> docker run -p 48680:48680 ghcr.io/privacybydesign/irma:latest session --url "http://$IP:48680" --disclose pbdf.nijmegen.personalData.fullname
> docker run -p 48680:48680 ghcr.io/privacybydesign/irma:latest session --url "http://$IP:48680" --issue irma-demo.MijnOverheid.ageLower=yes,yes,yes,no
> docker run -p 48680:48680 ghcr.io/privacybydesign/irma:latest session --url "http://$IP:48680" --noqr --request '{"type":"disclosing","content":[{"label":"BSN","attributes":["irma-demo.MijnOverheid.ageLower.over18"]}]}'
> docker run ghcr.io/privacybydesign/irma:latest session --server "http://$IP:8088" --authmethod token --key mytoken --disclose irma-demo.MijnOverheid.ageLower.over18
> ```

Download an IRMA scheme and then verify its authenticity:
```shell
irma scheme download . https://schemes.yivi.app/irma-demo
irma scheme verify irma-demo
```
This should result in:
```text
Verifying scheme irma-demo

Verification was successful.
```

Generate an IRMA issuer private-public keypair (of 2048 bits and supporting a maximum of 10 attributes):
```shell
cd irma-demo/MijnIssuer
irma scheme issuer keygen # takes a while
ls PublicKeys PrivateKeys
```
This should result in:
```text
PrivateKeys:
0.xml

PublicKeys:
0.xml
```

Sign an IRMA scheme after having made modifications:
```shell
cd irma-demo
# Make modifications (e.g. add a public key to an issuer with irma scheme issuer keygen)
irma scheme sign
irma scheme verify
```

```text
Verifying scheme irma-demo

Verification was successful.
```
