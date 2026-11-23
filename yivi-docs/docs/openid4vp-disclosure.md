---
title: Disclosing SD-JWT VCs over OpenID4VP
---

Yivi started its transition to become a Crypto Agile EUDI compliant wallet.
We decided that the first step of this transition would be to
add support for the OpenID4VP protocol and the SD-JWT VC credential format.

Starting with `irmago` version `0.19` and version `7.10.0` of the Yivi app it is
possible to [issue SD-JWT VCs together with Idemix over the IRMA protocol](sdjwtvc-issuance) and disclose SD-JWT VCs over OpenID4VP.

## Requesting SD-JWT VCs using OpenID4VP
Yivi is compatible with a subset of the [OpenID4VP standard version 1.0](https://openid.net/specs/openid-4-verifiable-presentations-1_0.html).

### User flow
The OpenID4VP disclosure flow in the Yivi app is identical to the Idemix disclosure flows we know.
The user can select between any of their available SD-JWT credentials and add or remove optional credentials.
If a requested credential is missing, the user will be guided to obtain a new one, after which the disclosure session will seamlessly be resumed.

### Verifier certificates
Before you're allowed to request any attributes you must possess a valid verifier certificate that is on the Yivi Trust List.
You can obtain one by becoming a Trusted Verifier via the Yivi portal and then contacting Yivi support to help create a certificate.
Since OpenID4VP support is in such a new state this cannot be done automatically yet.

The certificate contains a json value that has some metadata in it, like the origanisation information and authorized attributes.
It is tied to the hostname where the verifier server runs (so the URL the app has to contact for an OpenID4VP session).

Below you'll find a script for creating a certificate signing request. Once you've created a CSR, you can send it to us so we can create a certificate for you. Keep in mind that the json inside the certificate needs to cover all credentials and attributes you're planning to request. A request for anything outside it is rejected by the Yivi app as a whole.

Instead of listing everything, you can use `*` as a wildcard: for one part of a dot-separated credential identifier (for example `pbdf.sidn-pbdf.*`), or as the only entry in `attributes` to allow every attribute of a credential. A credential identifier that is a URL or URN, such as `urn:eudi:pid:1`, has to match exactly. An authorized identifier never matches a requested identifier that has more parts, so a three-part entry does not cover a five-part mdoc doctype such as `eu.europa.ec.av.1`.

<details>
  <summary>
    Script to generate Verifier Certificate Signing Request
  </summary>

```bash
# remove whitespace and escape quotes for json
escaped_json=$(cat $RP_JSON_FILE | jq -c | jq -R)

# create cfg file for the certificate signing request
echo "
[ req ]
default_md         = sha256
distinguished_name = req_distinguished_name
prompt             = no
req_extensions     = v3_req
x509_extensions    = v3_ext

[ req_distinguished_name ]
C  = $C
ST = $ST
L  = $L
O  = $O
CN = $VERIFIER_HOST

[ v3_req ]
subjectAltName   = @alt_names
extendedKeyUsage = clientAuth
keyUsage         = digitalSignature, keyEncipherment
basicConstraints = critical, CA:FALSE
2.1.123.1        = ASN1:UTF8String:$escaped_json

[ alt_names ]
DNS.0 = $VERIFIER_HOST
URI.1 = https://$VERIFIER_HOST

[ v3_ext ]
subjectKeyIdentifier   = hash
authorityKeyIdentifier = keyid:always,verifier
" > "$VERIFIER_HOST.cfg"


# generate private key (can skip this if you already have one)
openssl ecparam -name prime256v1 -genkey -noout -outform DER -out $VERIFIER_HOST.der.key

# convert private key to pem format (can skip this if you already have one)
openssl ec -inform DER -in $VERIFIER_HOST.der.key -outform PEM -out $VERIFIER_HOST.pem.key

# convert key to PKCS#8 format (can skip this if you already have one)
openssl pkcs8 -topk8 -inform DER -outform DER -nocrypt -in $VERIFIER_HOST.der.key -out pkcs8.key

# create certificate signing request
openssl req -config $VERIFIER_HOST.cfg -new -key pkcs8.key -out $VERIFIER_HOST.csr

```
</details>

Save the contents of this script to a file and make it executable with:
```bash
chmod +x script.sh
```

You can then run it using the following command:
```bash
export RP_JSON_FILE=rp.json      # see below for the contents of this file
export VERIFIER_HOST=<host_dns>  # replace with url where verifier server runs
export C=NL                      # replace with your country
export ST=Utrecht                # Replace with your state/province
export L=Utrecht                 # replace with your city
export O=Yivi                    # replace with your organization

./script.sh
```

Below you'll find an example for the json that defines the name and image shown to the user during disclosure, as well as all the attributes you'd like to be able to request.

<details>
  <summary>
    Example Json for Verifier metadata json
  </summary>

```json
{
    "registration": "https://portal.staging.yivi.app/organizations/<your-org>/",
    "organization": {
        "logo": {
            "mimeType": "image/png",
            "data": "<base64_encoded_png>"
        },
        "legalName": {
            "en": "<your-legal-name>",
            "nl": "<your-legal-name>"
        }
    },
    "rp": {
        "authorized": [
            {
                "credential": "pbdf-staging.sidn-pbdf.mobilenumber",
                "attributes": [
                    "mobilenumber"
                ]
            },
            {
                "credential": "pbdf-staging.sidn-pbdf.email",
                "attributes": [
                    "email",
                    "domain"
                ]
            },
            {
                "credential": "pbdf-staging.pbdf.passport",
                "attributes": [
                    "photo",
                    "documentNumber",
                    "documentType",
                    "lastName",
                    "dateOfBirth",
                    "activeAuthentication",
                    "country",
                    "dateOfExpiry",
                    "gender",
                    "over12",
                    "over16",
                    "over18",
                    "over65",
                    "isEuCitizen",
                    "nationality",
                    "yearOfBirth",
                    "over21",
                    "firstName"
                ]
            }
        ],
        "purpose": {
            "en": "EUDI PoC",
            "nl": "EUDI PoC"
        }
    }
}
```
</details>

To encode your organization image to a base64 string, run:
```bash
base64 "<logo_file>.png" > image.txt
```

Copy the contents of this file to and paste in the `origanization.logo.data` field.
Note that only png is supported right now.

### Authorization requests
We support the `x509_san_dns` and `x509_hash` client identifier prefixes as defined in the [OpenID4VP spec](https://openid.net/specs/openid-4-verifiable-presentations-1_0.html#name-defined-client-identifier-p),
which means we identify and verify verifiers by a x.509 certificate.

Additionally we put some metadata about the verifier inside of this certificate,
including their origanization information, a logo and permissions for what credentials and attributes they're allowed to ask.
Signed authorization requests that don't come with a valid certificate are denied by the Yivi app. The one exception is an unsigned request using the `redirect_uri:` client identifier prefix (supported since Yivi app 8.3.0): the app accepts it, but shows the verifier as unverified, without a logo, named by the address the response is sent to.
Certificates can be revoked using a certificate revocation list, after which the Yivi app will refuse to share any data with the verifier.

For development the app also accepts signed requests from verifiers identified by a DID (`decentralized_identifier` prefix), which are shown as unverified as well. See the [integration guide](openid4vp-verifier-integration.md#testing-without-a-certificate).

For the authorization request url we currently support the `openid4vp://` and `eudi-openid4vp://` schemes, as well as [universal links](openid4vp-verifier-integration.md#universal-links-optional).
Any url using these schemes can open the Yivi app and is assumed to be an OpenID4VP session.
We support both the response mode `direct_post` as well as `direct_post.jwt` for an extra layer of encryption. The latter requires an encryption key in the `jwks` of your `client_metadata`.

The full list of what the app supports is in the [integration guide](openid4vp-verifier-integration.md#what-the-yivi-app-supports).

### DCQL queries
SD-JWT VCs that are issued through a Yivi scheme are requested by the identifiers defined in that scheme.

:::note
For a credential from a Yivi scheme, `vct_values` holds the credential ID as defined in the scheme, and each claim `path` holds one attribute name.

The `format` field should be `dc+sd-jwt` when requesting SD-JWT VCs.

Don't forget that objects in both `credentials` as well as `claims` should have unique IDs.

Each option in `credential_sets` may contain only one credential query ID.
:::

Below are a couple of DCQL examples, as well as their condiscon counterparts.

<details>
  <summary>
    Example 1: Asking for email and phone number
  </summary>

```json
{
    "dcql_query": {
        "credentials": [
            {
                "id": "some-unique-id",
                "format": "dc+sd-jwt",
                "meta": {
                    "vct_values": ["pbdf.sidn-pbdf.email"]
                },
                "claims": [
                    { "id": "em", "path": ["email"] },
                    { "id": "do", "path": ["domain"] }
                ]
            },
            {
                "id": "some-unique-id-2",
                "format": "dc+sd-jwt",
                "meta": {
                    "vct_values": ["pbdf.sidn-pbdf.mobilenumber"]
                },
                "claims": [
                    { "id": "mn", "path": ["mobilenumber"] }
                ]
            }
        ]
    }
}
```

For reference, it's equivalent to the following condiscon:
```json
[
    [
        ["pbdf.sidn-pbdf.email.email", "pbdf.sidn-pbdf.email.domain"],
    ],
    [
        ["pbdf.sidn-pbdf.mobilenumber.mobilenumber"],
    ],
]
```
</details>


<details>
  <summary>
    Example 2: Giving the user a choice between email and phone number
  </summary>

```json
{
    "dcql_query": {
        "credentials": [
            {
                "id": "email-id",
                "format": "dc+sd-jwt",
                "meta": {
                    "vct_values": ["pbdf.sidn-pbdf.email"]
                },
                "claims": [
                    { "id": "em", "path": ["email"] },
                    { "id": "do", "path": ["domain"] }
                ]
            },
            {
                "id": "phone-id",
                "format": "dc+sd-jwt",
                "meta": {
                    "vct_values": ["pbdf.sidn-pbdf.mobilenumber"]
                },
                "claims": [
                    { "id": "mn", "path": ["mobilenumber"] }
                ]
            }
        ],
        "credential_sets": [
            {
                "options": [["email-id"], ["phone-id"]]
            }
        ]
    }
}
```
This query requests either the email credential or the mobilenumber credential.
It corresponds to the following condiscon:

```json
[
    [
        ["pbdf.sidn-pbdf.email.email", "pbdf.sidn-pbdf.email.domain"],
        ["pbdf.sidn-pbdf.mobilenumber.mobilenumber"]
    ]
]
```
</details>


<details>
  <summary>
    Example 3: Asking for any gmail address
  </summary>

```json
{
    "dcql_query": {
        "credentials": [
            {
                "id": "email-id",
                "format": "dc+sd-jwt",
                "meta": {
                    "vct_values": ["pbdf.sidn-pbdf.email"]
                },
                "claims": [
                    { "id": "em", "path": ["email"] },
                    { "id": "do", "path": ["domain"], "values": ["gmail.com"] }
                ]
            }
        ]
    }
}
```

It corresponds to this condiscon:
```json
[
    [
        [
          "pbdf.sidn-pbdf.email.email",
          { "type": "pbdf.sidn-pbdf.email.domain", "value": "gmail.com" }
        ]
    ]
]
```
</details>

<details>
  <summary>
    Example 4: Asking for required email and an optional phone number
  </summary>

```json
{
    "dcql_query": {
        "credentials": [
            {
                "id": "email-id",
                "format": "dc+sd-jwt",
                "meta": {
                    "vct_values": ["pbdf.sidn-pbdf.email"]
                },
                "claims": [
                    { "id": "em", "path": ["email"] },
                ]
            },
            {
                "id": "phone-id",
                "format": "dc+sd-jwt",
                "meta": {
                    "vct_values": ["pbdf.sidn-pbdf.mobilenumber"]
                },
                "claims": [
                    { "id": "mn", "path": ["mobilenumber"] }
                ]
            }
        ],
        "credential_sets": [
            {
                "options": [["email-id"]]
            },
            {
                "options": [["phone-id"]],
                "required": false
            }
        ]
    }
}
```

It corresponds to this condiscon:
```json
[
    [
        ["pbdf.sidn-pbdf.email.email"]
    ]
    [
        ["pbdf.sidn-pbdf.mobilenumber.mobilenumber"],
        []
    ]
]
```
</details>
