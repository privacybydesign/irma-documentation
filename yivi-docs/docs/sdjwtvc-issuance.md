---
title: Issuing SD-JWT VC over IRMA
---

:::info
SD-JWT VC issuance is only supported by Yivi app version `7.9.0` and later and `irmago` version `0.19` and later.
:::

## Why it exists

During the transition to become a Crypto Agile EUDI compliant wallet,
it was decided that Yivi would first implemented the OpenID4VP protocol the SD-JWT VC credential format.

Since OpenID4VP is only meant for disclosures, there would be no way to get SD-JWT VCs into the Yivi app.
It was therefore decided to extend the IRMA protocol to allow it to issue SD-JWT VC credentials together with our existing Idemix ones.

Enabling support is opt-in for existing Yivi issuers, and will be explained in detail in this article.

:::warning
SD-JWT VC and OpenID4VP support in Yivi are currently experimental. We don't recommend depending on it for now.
:::


## Enabling SD-JWT VC issuance
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
In order to get a certificate you also need to be a regular Idemix issuer present in one of our schemes.

### Step 2: Update IRMA server
Once an issuer certificate is obtained, the changes needed to support SD-JWT VC issuance in addition to Idemix are quite small.
First and foremost you should update your IRMA server to version `0.19` or higher.

### Step 3: Update IRMA server configuration
Now that you have a SD-JWT VC compatible IRMA server, you need to add two settings to the configuration.

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
  The last option is to define then via environment variables. The IRMA server will pick up on these automatically:

```bash
export IRMASERVER_SDJWTVC_ISSUER_CERTIFICATES_DIR="<path_to_certs>"
export IRMASERVER_SDJWTVC_ISSUER_PRIVATE_KEYS_DIR="<path_to_keys>"
irma server
```
</details>


### Step 4: Update issuance session request
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

:::info
SD-JWT VCs are issued in batches because the credential format doesn't provide the same privacy properties as Yivi's Idemix credentials.
SD-JWTs are trackable by default because hashes and holder binding keys stay the same for each time it's disclosed.
In order to maintain multi-show unlinkability we have to show a different instance of the credential each time.
This also means that after showing all instances in the batch the credential needs to be reobtained.
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

Credentials in the issuance request that don't specify the `sdJwtBatchSize` field will not get an SD-JWT issued.
Older Yivi apps and IRMA servers will ignore the whole SD-JWT issuance system and still work with Idemix only.
