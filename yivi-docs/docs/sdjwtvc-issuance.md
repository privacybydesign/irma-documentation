---
title: Issuing SD-JWT VC over IRMA
---

:::info
SD-JWT VC issuance is only supported by Yivi app version `7.10.0` and later and `irmago` version `0.19` and later.
:::

## Background and Motivation

As part of Yivi's strategic journey to become a [crypto-agile](crypto-agile-introduction.md) and EUDI-wallet compliant solution, we are implementing support for multiple credential formats and protocols. Our first milestone in this transition is to enable the disclosure of SD-JWT VC credentials using the OpenID4VP protocol, making Yivi interoperable with the broader European digital identity ecosystem.

However, OpenID4VP is primarily designed for credential disclosure, not issuance. To enable SD-JWT VCs in the Yivi app, we needed a way to issue them. Rather than immediately implementing the full OpenID4VCI standard (which is our second milestone), we decided to extend our existing IRMA protocol to support SD-JWT VC issuance alongside our traditional Idemix credentials.

This pragmatic approach allows existing Yivi issuers to gradually adopt SD-JWT VCs while we continue working toward full EUDI-wallet compliance. Enabling SD-JWT VC support is opt-in for existing Yivi issuers, and this guide explains how to enable it in detail.

## Enabling SD-JWT VC issuance
If you're an existing Yivi issuer, the process of enabling SD-JWT VC issuance is pretty straightforward.
It consists of four steps:

1) Obtain issuer certificate
2) Update IRMA server
3) Update IRMA server configuration
4) Update issuance request

### Step 1: Obtain issuer certificate
In order to issue an SD-JWT VC credential that the Yivi app accepts, you need to be on our Trust List.
This means you need to obtain an issuer certificate.
This certificate contains rights about what credentials and attributes you're allowed to issue,
as well as some metadata about your company.
You can contact the Yivi team via [support@yivi.app](mailto:support@yivi.app) to obtain a certificate.
In order to get a certificate, you also need to be a regular Idemix issuer present in one of our [schemes](schemes.md).

<details>
  <summary>
    Script to generate Issuer Certificate Signing Request
  </summary>

```sh
# Example usage:
# $ AP_JSON_FILE=app.json ISSUER_HOST=is.yivi.app C=NL ST=Utrecht L=Utrecht O=Yivi  ./gen.sh

# remove whitespace and escape quotes for json
escaped_json=$(cat $AP_JSON_FILE | jq -c | jq -R)

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
CN = $ISSUER_HOST

[ v3_req ]
subjectAltName   = @alt_names
extendedKeyUsage = clientAuth
keyUsage         = digitalSignature, keyEncipherment
basicConstraints = critical, CA:FALSE
2.1.123.1        = ASN1:UTF8String:$escaped_json

[ alt_names ]
DNS.0 = $ISSUER_HOST
URI.1 = https://$ISSUER_HOST

[ v3_ext ]
subjectKeyIdentifier   = hash
authorityKeyIdentifier = keyid:always,issuer
" > "$ISSUER_HOST.cfg"


# generate private key
openssl ecparam -name prime256v1 -genkey -noout -outform DER -out $ISSUER_HOST.der.key

# convert private key to pem format
openssl ec -inform DER -in $ISSUER_HOST.der.key -outform PEM -out $ISSUER_HOST.pem.key

# convert key to PKCS#8 format
openssl pkcs8 -topk8 -inform DER -outform DER -nocrypt -in $ISSUER_HOST.der.key -out pkcs8.key

# create certificate signing request
openssl req -config $ISSUER_HOST.cfg -new -key pkcs8.key -out $ISSUER_HOST.csr
```
</details>

### Step 2: Update IRMA server
Once an issuer certificate is obtained, the changes needed to support SD-JWT VC issuance in addition to Idemix are quite small.
First and foremost, you should update your [IRMA server](irma-server.md) to version `0.19` or higher.

### Step 3: Update IRMA server configuration
Now that you have an SD-JWT VC compatible IRMA server, you need to add two settings to the configuration.

- A path to the SD-JWT VC issuer certificates directory
- A path to the SD-JWT VC issuer private keys directory

Since both file types use the `.pem` extension and we want to allow setting different file permissions for keys vs certificates,
these go in different directories.

:::note 
The filenames should correspond with the issuer identifier as defined in the scheme.
:::

This would result in a directory structure that looks something like this:
```
├── certs
│   ├── pbdf.pbdf.pem
│   └── pbdf.sidn-pbdf.pem
└── privkeys
    ├── pbdf.pbdf.pem
    └── pbdf.sidn-pbdf.pem
```

You can pick one of three methods to set the paths to these directories:

<details>
  <summary>
    Option 1: Using `config.json`
  </summary>
  Add a couple of fields to the config json file passed into the IRMA server via the `--config` flag/argument:
  ```json
  {
    // other config stuff...
    "sdjwtvc": {
      "issuer_certificates_dir": "<path_to_certs>",
      "issuer_private_keys_dir": "<path_to_keys>"
    }
  }
  ```
</details>


<details> 
  <summary>
    Option 2: Using command line parameters/arguments
  </summary>
  You can also pass the paths to the IRMA server directly when invoking it by using command line arguments:

```bash
irma server --sdjwtvc-issuer-certificates-dir="<path_to_certs>" \
            --sdjwtvc-issuer-private-keys-dir="<path_to_keys>"
```
</details>


<details>
  <summary>
    Option 3: Using environment variables
  </summary>
  The last option is to define them via environment variables. The IRMA server will pick up on these automatically:

```bash
export IRMASERVER_SDJWTVC_ISSUER_CERTIFICATES_DIR="<path_to_certs>"
export IRMASERVER_SDJWTVC_ISSUER_PRIVATE_KEYS_DIR="<path_to_keys>"
irma server
```
</details>


### Step 4: Update issuance session request
In order to also issue SD-JWT VCs, they need to be explicitly requested from the IRMA server in the [issuance request](session-requests.md#issuance-requests).
A normal issuance request requesting two credentials would look something like this:
```json
{
  "@context": "https://irma.app/ld/request/issuance/v2",
  "credentials": [
    {
      "credential": "irma-demo.sidn-pbdf.mobilenumber",
      "attributes": {
        "mobilenumber": "0612345678"
      }
    },
    {
      "credential": "irma-demo.sidn-pbdf.email",
      "attributes": {
        "email": "test@example.com",
        "domain": "example.com"
      }
    }
  ]
}
```

To also issue the SD-JWT VC version alongside the Idemix version, just add the `sdJwtBatchSize` 
field with a value representing the batch size for the given credential:



```json
{
  "@context": "https://irma.app/ld/request/issuance/v2",
  "credentials": [
    {
      "credential": "irma-demo.sidn-pbdf.mobilenumber",
      "attributes": {
        "mobilenumber": "0612345678"
      },
      "sdJwtBatchSize": 50
    },
    {
      "credential": "irma-demo.sidn-pbdf.email",
      "attributes": {
        "email": "test@example.com",
        "domain": "example.com"
      },
      "sdJwtBatchSize": 100
    }
  ]
}
```

This will issue `irma-demo.sidn-pbdf.mobilenumber` in a batch of 50 and `irma-demo.sidn-pbdf.email` in a batch of 100 instances.

:::info
SD-JWT VCs are issued in batches because the credential format doesn't provide the same privacy properties as Yivi's Idemix credentials.
SD-JWTs are trackable by default because hashes and holder binding keys stay the same each time they're disclosed.
In order to maintain multi-show unlinkability, we have to show a different instance of the credential each time.
This also means that after showing all instances in the batch, the credential needs to be reobtained.
:::


If you're using `irmago` to create an issuance request for you, we recommend doing something like this:
```go
issuanceRequest := irma.NewIssuanceRequest([]*irma.CredentialRequest{
  {
    CredentialTypeID: irma.NewCredentialTypeIdentifier("irma-demo.sidn-pbdf.email"),
    Attributes: map[string]string{
      "email": "test@example.com",
      "domain": "example.com"
    },
    SdJwtBatchSize: irma.DefaultSdJwtIssueAmount, // optionally replace by another value
  },
})
```

Credentials in the issuance request that don't specify the `sdJwtBatchSize` field will not have an SD-JWT issued.
Older Yivi apps and IRMA servers will ignore the entire SD-JWT issuance system and still work with Idemix only.

## Related documentation

For more information on related topics, see:

- [Issuer guide](issuer.md) - General guide for becoming a Yivi issuer
- [Session requests](session-requests.md) - Detailed documentation on IRMA session requests
- [IRMA schemes](schemes.md) - Information about IRMA schemes and issuer registration
- [IRMA server](irma-server.md) - Documentation on configuring and running the IRMA server
