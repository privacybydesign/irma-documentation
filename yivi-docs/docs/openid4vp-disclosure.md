---
title: Disclosing SD-JWT VCs over OpenID4VP
---

Yivi started its transition to become a Crypto Agile EUDI compliant wallet.
We decided that the first step of this transition would be to
add support for the OpenID4VP protocol and the SD-JWT VC credential format.

Starting with `irmago` version `0.19` and version `7.10.0` of the Yivi app it is
possible to issue SD-JWT VCs together with Idemix over the IRMA protocol and disclose SD-JWT VCs over OpenID4VP.


:::warning
SD-JWT VC and OpenID4VP support in Yivi are currently experimental. We don't recommend depending on it for now.
:::

## Requesting SD-JWT VCs using OpenID4VP
Yivi is compatible with a subset of the [OpenID4VP standard version 1.0](https://openid.net/specs/openid-4-verifiable-presentations-1_0.html).

### User flow
The OpenID4VP disclosure flow in the Yivi app is identical to the Idemix disclosure flows we know.
The user can select between any of their available SD-JWT credentials and add or remove optional credentials.
If a requested credential is missing, the user will be guided to obtain a new one, after which the disclosure session will seamlessly be resumed.

### Verifier certificates
Before you're allowed to request any attributes you must possess a valid verifier certificate that is on the Yivi Trust List.
You can obtain one via the Yivi portal by becoming a Trusted Verifier.

The certificate contains a json value that has some metadata in it, like the origanisation information and authorized attributes.
It is tied to the hostname where the verifier server runs (so the URL the app has to contact for an OpenID4VP session).

### Authorization requests
We currently only support the `x509_san_dns` client identifier prefix as defined in the [OpenID4VP spec](https://openid.net/specs/openid-4-verifiable-presentations-1_0.html#name-defined-client-identifier-p),
which means we identify and verifiy verifiers by a x.509 certificate.

Additionally we put some metadata about the verifier inside of this certificate,
including their origanization information, a logo and permissions for what credentials and attributes they're allowed to ask.
Authorization requests that don't come with a valid certificate are denied by the Yivi app.
Certificates can be revoked using a certificate refocation list, after which the Yivi app will refuse to share any data with the verifier.

For the authorization request url we currently only support the `eudi-openid4vp://` scheme.
Any url using this scheme can open the Yivi app and is assumed to be an OpenID4VP session.
We support both the response type `direct_post` as well as `direct_post.jwt` for an extra layer of encryption.

### DCQL queries
For the time being all SD-JWT instances in the Yivi app will be tied to our scheme.
Therefore you have to use the identifiers as defined in the scheme to request attributes.

:::note
The `vct_values` array should contain exactly one value, corresponding to the requested credential ID as defined in a Yivi scheme.

The `format` field should always be `dc+sd-jwt` when requesting SD-JWT VCs.

Don't forget that objects in both `credentials` as well as `claims` should have unique IDs.
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
