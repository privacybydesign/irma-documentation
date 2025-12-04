---
slug: 2025-passport-callout
title: "BETA release Yivi Passport credentials - call for testing and feedback"
authors: [dibranmulder]
tags: [yivi, passport]
---

We are excited to announce the **BETA release of Yivi Passport credentials!**  
This new feature allows users to securely store and manage their digital passports within the Yivi wallet, enhancing convenience and accessibility for travelers. With this release, Yivi expands its reach to a truly international audience.

<!-- truncate -->

:::warning
Passport credentials are currently in **BETA**, this means its only available upon request. We have tested thoroughly with Dutch passports, but have not yet conducted extensive testing with other nationalities.
:::

## Why Passport credentials?
Passport credentials fill a critical gap on the road to EUDI wallets. While PID providers will take time to become available, people need a trusted way to prove their identity today. Yivi already offers high-quality personal data for Dutch citizens, but we also want to support an international audience.  

Passports are the most widely accepted form of identification worldwide, making them a natural bridge. They also enable powerful, privacy-preserving use cases—such as open-source, age-verification flows—where only the minimum necessary information is shared.

## How does it work?
With support from the [NLnet Foundation](https://nlnet.nl/), we have integrated Machine Readable Travel Document (MRTD) support into Yivi.  

Users can now add their digital passports to the Yivi wallet by:
1. Scanning the Machine Readable Zone (MRZ) of their physical passport.  
2. Reading the NFC chip of the passport with their phone.  

The passport data is then validated through **Passive Authentication** against Dutch and German government-issued Masterlists of trusted passport issuers. In addition, **Active Authentication** is implemented to further strengthen security.

## What’s available now?
The following **open source** components are ready for testing and feedback:

- [Example app for scanning and reading passports](https://github.com/privacybydesign/vcmrtd)  
- A **Beta Yivi wallet version** with support for storing and managing Passport credentials (available on request)  
- [API for validating Passport credentials against government-issued Masterlists](https://github.com/privacybydesign/go-passport-issuer)  
- [OpenID4VP integration with Yivi for using Passport credentials in verifiable presentations, including a demo](https://verifier.openid4vc.staging.yivi.app/)  

This release supports both **SD-JWT VC** and **Idemix credentials**, available via the **OpenID4VP** and the **IRMA protocol**. Support for **OpenID4VCI** is planned, enabling passport credentials to be issued to a wider range of applications.  

We **strongly recommend** using the Idemix version of the passport credentials, as it offers enhanced privacy. Especially for **Age Verification**, Idemix ensures that only the required information is shared, data exposure is unlinkable, and traceability is minimized.

## Screenshots
<div class="center-container">
    <img src="/img/passport/image-5.png" class="ss" alt="Yivi app UX design for batch issuance" />
    <img src="/img/passport/image-4.png" class="ss" alt="Yivi app UX design for scanning MRZ" />
    <img src="/img/passport/image-3.png" class="ss" alt="Yivi app UX design for NFC reading" />
</div>

<div class="center-container">
    <img src="/img/passport/image-2.png" class="ss" alt="Yivi app UX design for credential overview" />
    <img src="/img/passport/image-1.png" class="ss" alt="Yivi app UX design for age verification flow" />
    <img src="/img/passport/image.png" class="ss" alt="Yivi app UX design for presentation sharing" />
</div>

## Example DCQL query for requesting Passport credentials
To demonstrate how to request a Passport credential using OpenID4VP, we have set up a demo verifier at https://verifier.openid4vc.staging.yivi.app/ using the [Verifier Endpoint of the European Comission](https://github.com/eu-digital-identity-wallet/eudi-srv-web-verifier-endpoint-23220-4-kt) to showcase interoperability, below is a sample DCQL query that can be used to request a Passport credential.
```json
{
    "type": "vp_token",
    "dcql_query": {
        "credentials": [
            {
                "id": "mobilenumber",
                "format": "dc+sd-jwt",
                "meta": {
                    "vct_values": [
                        "pbdf-staging.pbdf.passport"
                    ]
                },
                "claims": [
                    {
                        "id": "eu",
                        "path": [
                            "isEuCitizen"
                        ]
                    }
                ]
            }
        ]
    },
    "nonce": "nonce",
    "jar_mode": "by_reference",
    "request_uri_method": "post",
    "issuer_chain": "-----BEGIN CERTIFICATE-----\nMIICbTCCAhSgAwIBAgIUX8STjkv3TRF5UBstXlp4ILHy2h0wCgYIKoZIzj0EAwQw\nRjELMAkGA1UEBhMCTkwxDTALBgNVBAoMBFlpdmkxKDAmBgNVBAMMH1lpdmkgU3Rh\nZ2luZyBSZXF1ZXN0b3JzIFJvb3QgQ0EwHhcNMjUwODEyMTUwODA1WhcNNDAwODA4\nMTUwODA0WjBMMQswCQYDVQQGEwJOTDENMAsGA1UECgwEWWl2aTEuMCwGA1UEAwwl\nWWl2aSBTdGFnaW5nIEF0dGVzdGF0aW9uIFByb3ZpZGVycyBDQTBZMBMGByqGSM49\nAgEGCCqGSM49AwEHA0IABMDTwj6APykJnBdr0sCO8LpkULpbXFOBWV47hKKsJHsa\nCVMarjLCYU3CV57UdklHSlMrtm7vfoDpYn4BvUv00UqjgdkwgdYwEgYDVR0TAQH/\nBAgwBgEB/wIBADAfBgNVHSMEGDAWgBRjtHvVs5rhDnC0L2AUi+7ncyXe1jBwBgNV\nHR8EaTBnMGWgY6Bhhl9odHRwczovL2NhLnN0YWdpbmcueWl2aS5hcHAvZWpiY2Ev\ncHVibGljd2ViL2NybHMvc2VhcmNoLmNnaT9pSGFzaD1rRkNPdDhOTGhKOGcwV3FN\nQW5sJTJCdm9OMlJ1WTAdBgNVHQ4EFgQUEjcBLRMmQGBJO0h04IL5Jwha1rEwDgYD\nVR0PAQH/BAQDAgGGMAoGCCqGSM49BAMEA0cAMEQCIDEaWIs4uSm8KVQe+fy0EndE\nTaj1ayt6dUgKQY/xZBO3AiAPYGwRlZMzbeCTFQ2ORLJiSowRtXzbmXpNDSyvtn7e\nDw==\n-----END CERTIFICATE-----"
}
```

## Open source development
We believe in the power of open source and community collaboration. The development of Passport credentials is no exception.  

We invite developers, researchers, and enthusiasts to contribute to the Yivi project on GitHub. Your feedback, bug reports, and feature requests are invaluable in helping us improve the platform.

Join us in making Yivi the best it can be!

## Call for testing and feedback
We are currently in the **BETA phase** of this feature and are actively seeking feedback from users and developers.  

If you have a digital passport and are interested in testing the new Passport credentials in Yivi, please reach out to us. Your insights will help refine and improve the functionality.

- [Slack](https://irmacard.slack.com/)  
- [GitHub](https://github.com/privacybydesign)  
- [Email](mailto:support@yivi.app)
