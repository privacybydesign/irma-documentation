---
title: Issuer guide
---

Being an IRMA issuer allows you to issue credentials containing attributes to IRMA app users, which they can then disclose to yourself or to others. Contrary to verifying IRMA attributes from the [IRMA app](irma-app.md) which can be done by anyone running an [IRMA server](irma-server.md), issuing to IRMA apps cannot be done without involvement the developers of IRMA ([the Privacy by Design Foundation](https://privacybydesign.foundation) and [SIDN](https://sidn.nl/irma)): registering your organization and the credentials you will be issuing is required. As part of this registration process the identity of your organization is verified, and the contents and structure of the credentials that you will be issuing is finetuned for correctness and consistency with the rest of the IRMA ecosystem. This process includes signing a contract that among others requires you to properly protect your IRMA private key, as well as paying a yearly fee.

This page documents some of the processes involved.

## Becoming an issuer

In IRMA, information on all issuers, their credentials and the contained attributes is stored in datastructures called [IRMA schemes](schemes.md). The two standard IRMA schemes, `irma-demo` and `pbdf`, meant for demo and production respectively, are maintained by [the Privacy by Design Foundation](https://privacybydesign.foundation) and [SIDN](https://sidn.nl/irma). All IRMA apps and servers contain a copy of these two schemes, which they automatically periodically update. A party wishing to become an issuer must therefore be included in these schemes. 

Generally, the process of becoming an IRMA issuer looks as follows. These steps are documented in detail in the sections below.

1. Collect all relevant information on your issuer, its credentials and the contained attributes, and submit that as a pull request (PR) to the [`irma-demo` scheme](https://github.com/privacybydesign/irma-demo-schememanager). (We can help creating the PR based on the relevant information, if required.) Once that is merged, it becomes automatically available for your IRMA server and for IRMA apps. Then you can start issuing the new credentials in your application during development and in demos, using the [IRMA server](irma-server.md). In this phase, you can finetune your credential structure and your issuance application.
2. When your credential structure has become finalized and you are ready to move to production, [contact us](/docs/about). Once the issuer contract has been signed, your issuer information from the `irma-demo` scheme can be copied over to the production scheme, `pbdf` using another PR. At this point you will need to generate your IRMA issuer private/public keypair (more on that [below](#generating-and-refreshing-irma-issuer-keys)), and include the public key in the PR. Once your issuer information is included in the `pbdf` scheme, you can start issuing credentials.

> Credentials within the `irma-demo` scheme are not meant for production application and actual personal data, since attributes within this scheme cannot be trusted: all private keys of all issuers under the `irma-demo` scheme are included in it, so that anyone can issue any `irma-demo` credential containing any attribute values.

### Creating `irma-demo` issuer and credentials

Within the scheme, all issuer and credential information is contained in a folder that schematically looks like the following.

```text
issuer-id
├── Issues
│   └── credentialtype-id
│       ├── description.xml
│       └── logo.png
├── PublicKeys
│   ├── 0.xml
|   └── 1.xml
├── PrivateKeys
│   ├── 0.xml
│   └── 1.xml
├── description.xml
└── logo.png
```

To get started, it is easiest to use an existing folder of another issuer in `irma-demo` as base by duplicating it, and modifying its contents. In order to check correctness of your modifications, you can try to sign the scheme by running `irma scheme sign` in your `irma-demo` checkout, which will point out common mistakes. For more details about the contents of schemes, see the [IRMA scheme](schemes.md) page.

Some notes about the `irma-demo` scheme:

* The contents of the `<Name>` tags in the `description.xml` of both the issuer and all of its credential types must start with `Demo ` for all translations, to distinguish them from production (`pbdf`) credentials in the IRMA app.
* Using the IRMA logo as `logo.png` for the issuer and credential type is fine.
* For the private and public keypair, since no trust is associated to anything within `irma-demo`, using those of another issuer in `irma-demo` is fine (but generating a new keypair is fine too; see [below](#generating-and-refreshing-irma-issuer-keys)).

Once your modifcations are complete, ensure the scheme is validly signed by running `irma scheme sign` in your irma-demo checkout, and submit your changes as a [PR](https://github.com/privacybydesign/irma-demo-schememanager/compare). Once the PR is merged, your issuer and its credentials become available for issuance to your IRMA server when it updates its copy of the scheme: periodically (hourly by default), or when you restart your server.

You can then use your IRMA server to issue the new credentials to your IRMA app. Alternatively, after the `irma-demo` PR is merged, the new credentials can also be issued from their corresponding pages in the [attribute index](https://privacybydesign.foundation/attribute-index/en/) (only in the case of `irma-demo` credentials).

#### Using a locally modified `irma-demo` scheme

Instead of submitting a PR to the `irma-demo` scheme to us, it is also possible to modify a local copy of the `irma-demo` scheme, and embed that local copy in the IRMA server and a manually compiled IRMA app, as follows.

1. Create your modifications in `irma-demo`.
2. Ensure the scheme is validly signed by running `irma scheme sign` in your `irma-demo` checkout.
3. When starting your [IRMA server](irma-server.md#irma-schemes), point it to the folder containing your `irma-demo` checkout and disable scheme updating:
   ```sh
   irma server --schemes-path ... --schemes-update 0
   ```
4. Create a checkout of [`irmamobile`](https://github.com/privacybydesign/irmamobile/), the IRMA app source code; replace the `irma-demo` copy in `irmamobile/irma_configuration/irma-demo` with your modified copy; and compile the IRMA app using the instructions in its README.

If you use the IRMA server from step 3 to issue your credentials, then the IRMA app from step 4 will accept them. Note, however, that the standard App/Play Store versions of the IRMA app will not.

### Creating `pbdf` issuer and credentials

After the development phase of your issuance application is finished and the issuer contract has been signed, your issuer and credentials can be moved to production as follows.

1. Copy your issuer and its credentials from `irma-demo` to a local checkout of the production scheme, [`pbdf`](https://github.com/privacybydesign/pbdf-schememanager).
2. Change all occurences of `irma-demo` within your issuer and credentials to `pbdf`; ensure the `Demo ` prefix is everywhere removed; and use actual logos for your issuer and credentials.
3. [Generate](#generating-irma-issuer-keys) a new 2048 bit IRMA issuer private/public keypair; put the public key within your issuer folder in `PublicKeys/0.xml`; and keep your private key private.
4. Submit your changes to `pbdf` as a PR.

Your PR will then be signed by us, and merged. As with `irma-demo`, your issuer and its credentials then become available for issuance to your IRMA server when it updates its copy of the scheme: periodically (hourly by default), or when you restart your server. Your credentials will also automatically appear in the [attribute index](https://privacybydesign.foundation/attribute-index/en/), but by contrast with `irma-demo` credentials, they cannot be issued from there.

### Generating IRMA issuer keys

Generating a new IRMA issuer private/public keypair is done with the [`irma`](irma-cli.md) command line tool:

```sh
irma issuer keygen
```

See `irma issuer keygen -h` for the flags that this command accepts. By default, it will emit the private and public keys in directories called `PrivateKeys` and `PublicKeys` under your current directory, creating them if they don't exist.

Some notes:

* When generating a new keypair for the `irma-demo` scheme, the private key is expected to be included in the PR to the `irma-demo` repository, within the `PrivateKeys` folder under your issuer folder. However, when generating a new keypair for the production `pbdf` scheme, you *must* keep your private key private.
* Your past and current public keys are stored within your issuer folder in the `pbdf` scheme in the `PublicKeys` folder with increasing filenames: `0.xml`, `1.xml`, et cetera. The number in the filename is the counter of your public key. When generating a new public key, you can ensure it gets the correct counter in one of the following ways:
  - By specifying it explicitly using the `-c` or `--counter` flag.
  - By running `irma issuer keygen` within your issuer folder in the scheme; it will then infer the appropriate counter using the public keys already present in the `PublicKeys` folder.
  - Alternatively, after generating the keypair you can open the private and public keys in a text editor and set the `<Counter>` tag to the appropriate number.
* If one of your credentials contains more than 10 attributes, then that amount of attributes *increased by 2* (to account for [the secret key and metadata attributes](overview.md#special-attributes)) must be passed to the `-a` or `--numattributes` flag, to ensure that the new public key supports the required amount of attributes.

## Issuer maintenance

Production IRMA issuer keypairs are valid for a year. Once a keypair expires it cannot be used anymore for issuance, so it is important that it is replaced by a fresh keypair before that time. Once a new public key has been included in the `pbdf` scheme, the corresponding private key can be included in your IRMA server configuration. After a restart it will use to the new private key.

### Submitting a new production public key

The process for getting a new issuer public key included in the production `pbdf` scheme is as follows.

1. Generate a new keypair as documented above.
2. Send the public keypair to the `pbdf` scheme manager, using a [PR](https://github.com/privacybydesign/pbdf-schememanager/compare), email or Slack.
3. The scheme manager will contact you out-of-band to verify that the public key arrived intactly, by checking its SHA256 hash.
4. If this check succeeds, your new key will be included in the scheme. You can then install the corresponding private key in your issuing IRMA server.
