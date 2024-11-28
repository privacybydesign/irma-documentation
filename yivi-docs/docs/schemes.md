---
title: IRMA schemes
---

In IRMA, every party ([Yivi apps](yivi-app.md), [IRMA servers](what-is-yivi.md#irma-servers), [requestors](technical-overview.md#participants)) must be aware of existing [credential types](technical-overview.md#credential-types), attribute names, and the [issuers](technical-overview.md#issuers) and their public keys. All such information is contained in IRMA *schemes*. It is the task of the *scheme manager* to determine and distribute this information to all parties, in the form of a directory structure [such as this one](https://github.com/privacybydesign/pbdf-schememanager), which contains:

* All information about all issuers that fall under this scheme including their logos,
* The IRMA public keys of said issuers,
* All credential types that these issuers may issue, including their logos.

This entire directory structure is signed using an (ECDSA) private-public keypair that the scheme manager has for this purpose.

Each scheme has a *scheme URL*, defined by the `<Url>` tag in the root `description.xml`. At that location the scheme manager must host the current version of the scheme. IRMA components that have the scheme installed will periodically update their local version of the scheme using this remote copy.

All of the information contained in the scheme is thus signed by as well as distributed by the scheme manager. This means that the scheme manager has exclusive and total control over which issuers may join his domain, and what credential types and attributes this issuer may issue.

## Scheme contents

Schematically the directory structure of a scheme looks as follows:

```text
scheme-id
├── issuer-id
│   ├── Issues
│   │   └── credentialtype-id
│   │       ├── description.xml
│   │       └── logo.png
│   ├── PublicKeys
│   │   ├── 0.xml
│   │   └── 1.xml
│   ├── PrivateKeys (need not be present)
│   │   ├── 0.xml
│   │   └── 1.xml
│   ├── description.xml
│   └── logo.png
├── description.xml
├── index
├── index.sig
├── timestamp
├── pk.pem
└── kss-0.pem
```

Multiple issuers are grouped under the scheme, and each issuer may issue multiple credential types.

Description of the files:
* A scheme, issuer, or credential type (call it an *entity*) is always stored in `description.xml`, contained in a folder whose name *must* be that of the entity as specified by the xml file.
* Each issuer and each credential type should include a `logo.png` for in the Yivi app.
* `index` contains of each file in the tree its SHA256 hash, as well as its path and filename.
* `index.sig` is an ECDSA signature over the `index`, thus effectively signing each file listed in the `index`.
* `timestamp` contains the Unix timestamp of the last time the scheme was modified.
* `pk.pem` is the scheme's public key against which `index.sig` should verify.
* `kss-0.pem` (optional): if the scheme uses a [keyshare server](keyshare-protocol.md), then this contains the keyshare server's public key.

IRMA schemes have the following nested structure: a scheme contains (multiple) issuers, which contain (multiple) credentials, which contain (multiple) attributes. Each of these are identified and referred to using a string that we call the *identifier*. In the case of schemes, issuers and credentials, these can be seen in the directory structure. In the directory tree above:

* The identifier of the scheme is `scheme-id`,
* This scheme contains an issuer whose identifier is `issuer-id`,
* This issuer contains a credential type whose identifier is `credentialtype-id`.

The `description.xml` of a credential type contains the definitions, including their identifiers, of the attributes contained within that credential type.

These identifiers are used to refer to these entities within [IRMA session requests](session-requests.md), joined together using a dot `.` as separator. For example, the `description.xml` [below](#credential-types) shows the definition of the credential type `credentialtype-id` included in the directory tree above. This file contains an attribute whose identifier, as defined by the `id` XML attribute, is `boolean-attr`. Then the following would be a valid IRMA disclosure request that requests an Yivi app user to disclose this attribute:

<!--DOCUSAURUS_CODE_TABS-->
<!--Session request (JSON)-->
```json
{
  "@context": "https://irma.app/ld/request/disclosure/v2",
  "disclose": [[[ "scheme-id.issuer-id.credentialtype-id.boolean-attr" ]]]
}
```
<!--Session request (Go)-->
```golang
irma.NewDisclosureRequest(irma.NewAttributeTypeIdentifier(
    "scheme-id.issuer-id.credentialtype-id.boolean-attr",
))
```
<!--END_DOCUSAURUS_CODE_TABS-->

IRMA identifiers may not themselves contain dots. Generally, only alphanumeric characters and the dash `-`are used.

## File contents

### Scheme

The `description.xml` of a scheme looks like the following.

```xml
<SchemeManager version="7">
    <Id>scheme-id</Id>
    <Url>https://example.com/scheme</Url>
    <Demo>true</Demo>
    <Name>
        <en>English human-readable name</en>
        <nl>Nederlandse human-readable naam</nl>
    </Name>
    <Description>
        <en>A description of this scheme</en>
        <nl>Een beschrijving van dit scheme</nl>
    </Description>
    <TimestampServer>https://example.com/atumd</TimestampServer>
    <KeyshareServer>https://example.com/keyshareserver</KeyshareServer>
    <KeyshareWebsite>https://example.com/myirma</KeyshareWebsite>
    <KeyshareAttribute>scheme-id.issuer-id.credential-id.keyshare-attr</KeyshareAttribute>
    <Contact>https://example.com</Contact>
</SchemeManager>
```

* The `version` XML attribute of the `<SchemeManager>` tag is a constant, versioning the XML structure in the file.
* The identifier of the issuer is specified by the `<Id>` tag (`scheme-id` in this example).
* The `<Url>` tag points to the location where an online copy of this scheme is hosted, from which Yivi apps and servers update their local copies.
* The `<Demo>` tag, containing `true` or `false`, defines whether this is a demo or a production scheme. When `true`, the human-readable names (i.e., the contents of the `<Name>` tags) of all issuers and credential types within the scheme are required to start with the prefix `Demo `, and some requirements checked by `irma scheme verify` and `irma scheme sign` are slightly relaxed.
* The `<TimestampServer>` defines which timestamp server is used for [attribute-based signatures](session-requests.md#attribute-based-signature-requests) that contain attributes from this scheme.
* The `<KeyshareServer>`, `<KeyshareWebsite>`, and `<KeyshareAttribute>` tags, when present, enable the use of a [keyshare server](keyshare-protocol.md) for this scheme, and define the URL of the keyshare server; the URL of the MyIRMA webinterface for it; and which attribute is used by the keyshare server, respectively.

### Issuers

The `description.xml` of an issuer looks like the following.

```xml
<Issuer version="4">
    <ID>issuer-id</ID>
    <Name>
        <en>English human-readable name</en>
        <nl>Nederlandse human-readable naam</nl>
    </Name>
    <ShortName>
        <en>English name</en>
        <nl>Nederlandse naam</nl>
    </ShortName>
    <SchemeManager>scheme-id</SchemeManager>
    <ContactAddress>https://example.org</ContactAddress>
    <ContactEMail>example@example.org</ContactEMail>
</Issuer>
```

* The `version` XML attribute of the `<Issuer>` tag is a constant, versioning the XML structure in the file.
* The identifier of the issuer, specified by the `<ID>` tag (`issuer-id` in this example), must equal the folder name in which the file is stored.
* The `<SchemeManager>` tag must contain the identifier of the containing scheme.
* The `<ShortName>` tag should be present but is not currently shown in the Yivi app GUI or elsewhere.

### Credential types

The `description.xml` of a credential type looks like the following.

```xml
<IssueSpecification version="4">
    <Name>
        <en>English human-readable name</en>
        <nl>Nederlandse human-readable naam</nl>
    </Name>
    <ShortName>
        <en>English name</en>
        <nl>Nederlandse naam</nl>
    </ShortName>
    <SchemeManager>scheme-id</SchemeManager>
    <IssuerID>issuer-id</IssuerID>
    <CredentialID>credential-id</CredentialID>
    <Description>
        <en>A description of this credential type</en>
        <nl>Een beschrijving van dit credentialtype</nl>
    </Description>
    <IssueURL>
        <en>https://example.com/issue-url/en</en>
        <nl>https://example.com/issue-url/nl</nl>
    </IssueURL>
    <ShouldBeSingleton>true</ShouldBeSingleton>

    <Attributes>
        <Attribute id="boolean-attr" displayIndex="1" displayHint="yesno">
            <Name>
                <en>Boolean attribute</en>
                <nl>Boolean attribuut</nl>
            </Name>
            <Description>
                <en>A description of this boolean attribute</en>
                <nl>Een beschrijving van dit boolean attribuut</nl>
            </Description>
        </Attribute>
        <Attribute id="optional-attr" displayIndex="0" optional="true">
            <Name>
                <en>Optional attribute</en>
                <nl>Optioneel attribuut</nl>
            </Name>
            <Description>
                <en>A description of this optional attribute</en>
                <nl>Een beschrijving van dit optionele attribuut</nl>
            </Description>
        </Attribute>
    </Attributes>
</IssueSpecification>
```

* The `version` XML attribute of the `<IssueSpecification>` tag is a constant, versioning the XML structure in the file.
* The identifier of the credential type, specified by the `<CredentialID>` tag (`credential-id` in this example), must equal the folder name in which the file is stored.
* The `<IssuerID>` tag must contain the identifier of the containing issuer.
* The `<SchemeManager>` tag must contain the identifier of the containing scheme.
* The `<ShortName>` and `<Description>` tags should be present but are not currently shown in the Yivi app GUI or elsewhere.
* The `<IssueURL>` tag should contain translated URLs referring to where the user can obtain this credential. If the user refreshes an instance of the credential type, or tries to obtain it during a session, this URL is used.
* The `<ShouldBeSingleton>` tag should contain either `true` or `false`, and determines if the user is allowed to possess more than one instance of the credential type simultaneously in her Yivi app. Default is `false`.

An attribute is defined by an `<Attribute>` XML tag, which must at minimum contain an identifier in the `id` XML attribute, and `<Name>` and `<Description>` XML subtags. Additionally, the following XML attributes are supported:

* `displayIndex`: Once an `<Attribute>` has been added to the credential type, its position relative to the other `<Attribute>` XML tags cannot be changed. However, its position as shown in the Yivi app may be set using the `displayIndex` XML attribute. In the example above, the Yivi app will first show the `optional-attr` and then the `boolean-attr`. If not present, the value of `displayIndex` is inferred from its position within the `<Attributes>` XML tag.
* `optional`: if `true`, the issuer [may skip this attribute during issuance](session-requests.md#null-attributes), for example when the value of the corresponding attribute is unknown or not applicable.
* `displayHint="yesno"`: used to indicate that the attribute will contain boolean values such as `yes`, `no`, `ja` or `nee` (case insensitive). When present, the Yivi app will translate the boolean to the user's language.

New attributes can be added to existing credential types at any point in time. Existing attributes within a credential type may not be removed once they exist, but they may be marked `optional` so that the issuer can skip them during issuance.

## Default schemes: `pbdf` and `irma-demo`

Most IRMA software components automatically use the following two schemes:

* [`pbdf`](https://github.com/privacybydesign/pbdf-schememanager): the production scheme of the [Privacy by Design Foundation](https://privacybydesign.foundation/).
* [`irma-demo`](https://github.com/privacybydesign/irma-demo-schememanager): exclusively for development, demoing and experimenting, as the scheme private key and all issuer private keys are included.

The [Privacy by Design Foundation](https://privacybydesign.foundation/), which develops IRMA and issues a basic set of attributes, is the scheme manager of these two schemes. New issuers wishing to issue attributes under the `pbdf` scheme, or existing issuers wishing to issue new credential types, can [ask](https://privacybydesign.foundation/people#developers) the Foundation to be included in these schemes.
For more information on this process, see the [issuer documentation page](issuer.md).

These two schemes are hardcoded into the [Yivi app](yivi-app.md), and if an [`irma`](irma-cli.md) subcommand that requires schemes is run for the first time, these two schemes are downloaded to a default location on disk (`~/.local/share/irma/irma_configuration` on Linux/macOS). It is always possible to use other schemes in conjunction with these two, or without them, either by making a custom build of the Yivi app, or by passing the appropriate options to the `irma` subcommands (see the `--help` messages).


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
* Compile a version of the Yivi app with this directory tree hardcoded in it;
* Host an [`irma server`](irma-server.md) that will issue and verify your credential type (as this  server will issue credentials it must have a copy of the scheme directory tree, and the Idemix private key);
* Create a website using [`yivi-frontend`](yivi-frontend.md) that will issue and verify instances of your credential type.
