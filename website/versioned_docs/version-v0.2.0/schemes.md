---
title: IRMA schemes
id: version-v0.2.0-schemes
original_id: schemes
---

In IRMA, every party ([IRMA apps](https://github.com/privacybydesign/irma_mobile), [IRMA servers](what-is-irma.md#irma-servers), [requestors](overview.md#participants)) must be aware of existing [credential types](overview.md#credential-types), attribute names, and the [issuers](overview.md#issuers) and their public keys. All such information is contained in IRMA *schemes*. It is the task of the *scheme manager* to determine and distribute this information to all parties, in the form of a directory structure [such as this one](https://github.com/privacybydesign/pbdf-schememanager), which contains:

* All information about all issuers that fall under this scheme including their logos,
* The Idemix public keys of said issuers,
* All credential types that these issuers may issue, including their logos.

This entire directory structure is signed using an (ECDSA) private-public keypair that the scheme manager has for this purpose.

Each scheme has a *scheme URL*, defined by the `<Url>` tag in the root `description.xml`. At that location the scheme manager must host the current version of the scheme. IRMA components that have the scheme installed will periodically update their local version of the scheme using this remote copy.

All of the information contained in the scheme is thus signed by as well as distributed by the scheme manager. This means that the scheme manager has exclusive and total control over which issuers may join his domain, and what credential types and attributes this issuer may issue.

## Scheme directory structure

Schematically the directory structure of a scheme looks as follows:

```text
SchemeName
+-- IssuerName
|   +-- Issues
|   |   +-- CredentialTypeName
|   |       +--- description.xml
|   |       +--- logo.png
|   +-- PublicKeys
|   |   +-- 0.xml
|   |   +-- 1.xml
|   +-- PrivateKeys (need not be present)
|   |   +-- 0.xml
|   |   +-- 1.xml
|   +-- description.xml
|   +-- logo.png
+-- description.xml
+-- index
+-- index.sig
+-- timestamp
+-- pk.pem
+-- kss-0.pem
```

Multiple issuers are grouped under the scheme, and each issuer may issue multiple credential types.

Description of the files:
* A scheme, issuer, or credential type (call it an *entity*) is always stored in `description.xml`, contained in a folder whose name *must* be that of the entity as specified by the xml file.
* Each issuer and each credential type should include a `logo.png` for in the IRMA app.
* `index` contains of each file in the tree its SHA256 hash, as well as its path and filename.
* `index.sig` is an ECDSA signature over the `index`, thus effectively signing each file listed in the `index`.
* `timestamp` contains the Unix timestamp of the last time the scheme was modified.
* `pk.pem` is the scheme's public key against which `index.sig` should verify.
* `kss-0.pem` (optional): if the scheme uses a [keyshare server](keyshare-protocol.md), then this contains the keyshare server's public key.

## Default schemes: `pbdf` and `irma-demo`

Most IRMA software components automatically use the following two schemes:

* [`pbdf`](https://github.com/privacybydesign/pbdf-schememanager): the production scheme of the [Privacy by Design Foundation](https://privacybydesign.foundation/).
* [`irma-demo`](https://github.com/privacybydesign/irma-demo-schememanager): exclusively for development, demoing and experimenting, as the scheme private key and all issuer private keys are included.

The [Privacy by Design Foundation](https://privacybydesign.foundation/), which develops IRMA and issues a basic set of attributes, is the scheme manager of these two schemes. New issuers wishing to issue attributes under the `pbdf` scheme, or existing issuers wishing to issue new credential types, can [ask](https://privacybydesign.foundation/people#developers) the Foundation to be included in these schemes.

These two schemes are hardcoded into the [IRMA app](https://github.com/privacybydesign/irma_mobile), and if an [`irma`](irma-cli.md) subcommand that requires schemes is run for the first time, these two schemes are downloaded to a default location on disk (`~/.local/share/irma/irma_configuration` on Linux/macOS). It is always possible to use other schemes in conjunction with these two, or without them, either by making a custom build of the IRMA app, or by passing the appropriate options to the `irma` subcommands (see the `--help` messages).


## Updating and signing schemes with `irma`

The following `irma scheme` subcommands from the [`irma`](irma-cli.md) command line tool act on IRMA schemes:

* `download`: Download a scheme from its remote URL
* `issuer`: Manage IRMA issuers within an IRMA scheme
   * `keygen`: Generate a new IRMA issuer private/public keypair
* `keygen`: Generate ECDSA private/public keypair for scheme signing
* `sign`: Sign a scheme directory after update its contents
* `update`: Download scheme updates from its remote URL
* `verify`: Verify scheme signature and check directory structure

Check `-h` or `--help` of these for usage details.

## Other schemes

Anyone can create their own IRMA scheme. At minimum the following must be done:

* Create a directory structure like the one above (you can use the `scheme` subcommand of the [`irma`](irma-cli.md) command line tool to generate an ECDSA public-private keypair and sign the directory tree);
* Define at least one issuer and generate its Idemix public-private keypair (again using `irma`), putting the public key in the directory structure;
* Define at least one credential type that this issuer will issue;
* Compile a version of the IRMA app with this directory tree hardcoded in it;
* Host an [`irma server`](irma-server.md) that will issue and verify your credential type (as this  server will issue credentials it must have a copy of the scheme directory tree, and the Idemix private key);
* Create a website using [irmajs](irmajs.md) that will issue and verify instances of your credential type.
