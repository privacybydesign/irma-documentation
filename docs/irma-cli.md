---
title: irma command line tool
---

`irma` is an IRMA Swiss knife in the form of a command line executable, supporting the following subcommands:

* [`irma server`](irma-server): an IRMA server daemon allowing you to perform IRMA sessions with [IRMA apps](https://github.com/privacybydesign/irma_mobile).
* `irma session`: Perform an IRMA disclosure, issuance or signature session, using the [builtin](irma-server-lib) IRMA server or a remote [`irma server`](irma-server)
* [`irma scheme`](schemes#updating-and-signing-schemes-with-irma): Manage IRMA schemes, supporting downloading, updating, verifying, and signing schemes, and IRMA key generation
* `irma request`: compose an IRMA session request
* `irma meta`: Parse an IRMA metadata attribute and print its contents

Pass `-h` or `--help` to any of these subcommands to see usage details and examples.

## Install

If necessary, clone `irmago` and install dependencies with [dep](https://github.com/golang/dep):
```shell
mkdir -p $GOPATH/github.com/privacybydesign && cd $GOPATH/github.com/privacybydesign
git clone https://github.com/privacybydesign/irmago && cd irmago
dep ensure
```

Build and install `irma`:
```shell
cd irma
go install
```

## Examples

Perform IRMA sessions on the command line (start the session, print the QR, and print session result when the session is done):
```shell
$ irma session --issue irma-demo.MijnOverheid.ageLower=yes,yes,yes,no
$ irma session --disclose irma-demo.MijnOverheid.ageLower.over18
$ irma session --request '{"type":"disclosing","content":[{"label":"BSN","attributes":["irma-demo.MijnOverheid.ageLower.over18"]}]}'
$ irma session --server http://localhost:8088 --authmethod token --key mytoken --disclose irma-demo.MijnOverheid.ageLower.over18
```

Download an IRMA scheme and then verify its authenticity:
```shell
$ irma scheme download . https://privacybydesign.foundation/schememanager/irma-demo
$ irma scheme verify irma-demo
Verifying scheme irma-demo

Verification was successful.
```

Generate an IRMA issuer private-public keypair (of 2048 bits and supporting a maximum of 10 attributes):
```shell
$ cd irma-demo/MijnIssuer
$ irma scheme issuer keygen # takes a while
$ ls PublicKeys PrivateKeys
PrivateKeys:
0.xml

PublicKeys:
0.xml
```

Sign an IRMA scheme after having made modifications:
```shell
$ cd irma-demo
# Make modifications (e.g. add a public key to an issuer with irma scheme issuer keygen)
$ irma scheme sign
$ irma scheme verify
Verifying scheme irma-demo

Verification was successful.
```
