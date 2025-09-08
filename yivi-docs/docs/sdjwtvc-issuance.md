# Issuing SD-JWT VC over IRMA
During the transition to become a Crypto Agile EUDI compliant wallet,
it was decided that Yivi would first implemented the OpenID4VP protocol the SD-JWT VC credential format.

Since OpenID4VP is only meant for disclosures, there would be no way to get SD-JWT VCs into the Yivi app.
It was therefore decided to extend the IRMA protocol to allow it to issue SD-JWT VC credentials together with our existing Idemix ones.

This feature is opt-in and requires an issuer certificate.

NOTE: SD-JWT VC and OpenID4VP support are currently experimental. We don't recommend depending on it for now.

## Issuer certificates
You can contact the Yivi team via [support@yivi.app](mailto:support@yivi.app) to obtain a certificate.
In order to get a certificate you also need to be a regular Idemix issuer present in one of our schemes.


## Enabling SD-JWT VC issuance
Once an issuer certificate is obtained, the changes needed to support SD-JWT VC issuance in addition to Idemix is quite small.
- Update your IRMA server
- Update the IRMA server configuration
- Update the issuance request

### Step 1: Update your IRMA server
First and foremost you should update your IRMA server to version `0.19` or higher.

### Step 2: Update IRMA server configuration
Now that you have a SD-JWT VC compatible IRMA server, you need to add two settings to the configuration.

- A path to the SD-JWT VC issuer certificates directory
- A path to the SD-JWT VC issuer private keys directory

Since both file types use the `.pem` extension and we want to allow setting different file permissions for keys vs certificates,
these go in different directories.

**The filenames should correspond with the issuer identifier as defined in the scheme.**
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

#### Using `config.json`
```json
{
  "requestors": {
    "sms_issuer": {
      "auth_method": "publickey",
      "key_file": "/mnt/requestor-pubkeys/pub.pem",
      "issue_perms": [
        "pbdf-staging.sidn-pbdf.mobilenumber"
      ]
    }
  },
  "sdjwtvc": {
    "issuer_certificates_path": "<path_to_certs>",
    "issuer_private_keys_path": "<path_to_keys>"
  }
}

```

#### Using command line parameters/arguments
```bash
irma server --sdjwtvc-issuer-certificates-path="<path_to_certs>" \
            --sdjwtvc-issuer-private-keys-path="<path_to_keys>"
```

#### Using environment variables
```bash
export IRMASERVER_SDJWTVC_ISSUER_CERTIFICATES_PATH="<path_to_certs>"
export IRMASERVER_SDJWTVC_ISSUER_PRIVATE_KEYS_PATH="<path_to_keys>"
irma server
```

### Step 3: Update issuance session request
In order to also issue SD-JWT VCs, they need to be explicitly requested from the IRMA server in the issuance request.
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

If you're using `irmago` to create an issuance request for you, we recommend doing something like this:
```go
issuanceRequest := irma.NewIssuanceRequest([]*irma.CredentialRequest{
  {
    CredentialTypeID: irma.NewCredentialTypeIdentifier("irma-demo.sidn-pbdf.email"),
    Attributes: map[string]string{
      "email": "test@example.com",
      "domain": "example.com"
    },
    SdJwtBatchSize: irma.DefaultSdJwtIssueAmount, // optionally replace by other value
  },
})
```
