---
slug: 2025-authentication
title: Exploring Authentication Options with Yivi
authors: [dibranmulder, wouterensink]
tags: [yivi, authentication]
---

Authentication and identification are critical components of digital services. This can be done with Yivi, our privacy-friendly ID-Wallet. It provides multiple options for verifying user identities. However, a significant challenge in implementing Yivi is the identifier used for authentication. Government and healthcare organizations can use the BSN (Burger Service Nummer), but private entities must explore alternative options. Below, we discuss potential authentication methods using Yivi, their advantages, and their limitations.

<!-- truncate -->

## Authentication and Activation Using BRP Data
For registration purposes organizations often need a set of data to match the user to their own administration, this is often done by matching on data from the Dutch Personal Records Database (BRP). The data in the BRP is of such quality that it can be trusted to be correct. The challenge often is that the data of the user in the administration of verifing organization is not of the same quality. Resulting in the proces that when a user discloses its BRP information to an organization it sometimes results in a dropout. These dropsouts are a problem, because it blocks the user from identifying and thereby registering or authenticating itself. To circumvent this problem organizations often choose to either: request more data from the user, for instance an contractnumber or change the data in their adminstration to match the data from the BRP so that in a next match the user is matched correctly.

Governmental and/or Health care organizations can simply use the identifying BSN from the BRP to match a user to their administration. We often see that only the BSN is requested from the user and that the BSN is then used to call the BRP for name and address details. We are not a fan of that approach, because we think that the amount of backchannel communication about users should be reduced and that the user should be in control of what personal data is being shared with which organizaiton.

### Pros
- In most cases, unique identification is achievable.
- High quality data for registration purposes.
- No unique identifier available for non governmental/health care organizations. 
- BRP data can be used to increase data quality in the administration of organizations.

### Cons
- Dropouts require additional data or manual processes which may negatively influence the user experience.
- No unique identifier is available for private sector.
- Name and/or address scans can have negative effects on performance.

#### Attribute Index of Municipality
Below is the attribute index of the BRP disclosed by the municipality. 
<iframe src="https://attribute-index.staging.yivi.app/en/pbdf.gemeente.personalData.html" style={{ width: 100 + '%', height: 500 + 'px' }}  />

## Adding email address or phone number
In addition to BRP data organizations may want to request users to disclose their `email address` and/or `phonenumber`. It's a common practice for authentication purposes to have the `email address` as a unique identifier of the user. The same goes for phone number, while it has to be said that phone numbers are more often transfered to other users, especially in a business setting. In that sense an email address is more stable. In the context of registration and authentication Yivi supports the combination of multiple data sources being disclosed, this can be done with the so called [condiscon](https://docs.yivi.app/condiscon) feature. Verifing organizations can make a composition of attributes that they request the user to disclose. In the context of registration/identification organizations may want to compose the following session request:

```json
{
  "@context": "https://irma.app/ld/request/disclosure/v2",
  "disclose": [
    [
      [ "pbdf.pbdf.email" ],
      [ "pbdf.pbdf.mobilenumber" ]
    ],
    [
        "pbdf.gemeente.personalData.firstnames",
        "pbdf.gemeente.personalData.familyname",
        "pbdf.gemeente.personalData.fullname",
        "pbdf.gemeente.personalData.surname",
        "pbdf.gemeente.address.street",
        "pbdf.gemeente.address.houseNumber",
        "pbdf.gemeente.address.zipcode",
        "pbdf.gemeente.address.city"   
    ]
  ]
}
```

In this example we request users to disclose either their `email address` or `phone number` and their `name` and `address details`, which are often required in a registration process. Once the identifying data has been added to the administration of the verifying organization a subsequent authentication request might look like this:

```json
{
  "@context": "https://irma.app/ld/request/disclosure/v2",
  "disclose": [
    [
      [ "pbdf.pbdf.email" ],
      [ "pbdf.pbdf.mobilenumber" ]
    ]
  ]
}
```
There is no need to request the user's personal data for authentication purposes once the organization has stored the identifier which can be the `phone number` or the `email address`.

### Pros
- Having a separate registration and subsequent authentication flow is a well known practise in the field. It's a familiar user experience.
- Working with identifiers reduces the amount of potential login failures to nearly zero, causing practically no dropouts.

### Cons
- Disclosing data from multiple sources may result in a more complex user experience when the user does not have the data already issued at their Yivi app.

## Issuing a unique identifier to the Wallet
Organizations can enhance user authentication by issuing a unique identifier, such as a membership card, directly to users’ Yivi wallets. This approach allows users to authenticate seamlessly without repeatedly disclosing sensitive personal data. The unique identifier can be tied to an internal identifier known only to the organization, ensuring a smooth authentication experience while maintaining user privacy.

This process can be facilitated using chained Yivi sessions. Users first disclose the necessary information for registration. If any mismatches arise that prevent automatic registration, additional identifying information, such as a contract number, can be requested to complete the registration. Once a user is successfully registered, the organization can issue a Yivi credential containing the unique identifier, which can be used for subsequent authentications.

A notable example of this implementation is PubHubs, where users are issued a club membership credential that allows seamless authentication for entry and participation.

<div class="center-container">
    <img src="/img/disclose-pubhubs.jpg" class="ss" alt="Disclosure of information" />
    <img src="/img/issue-pubhubs.jpg" class="ss" alt="Issuance of registration" />
</div>

### Pros
- Provides a privacy-preserving authentication method without requiring repeated data disclosures.
- Reduces user friction in subsequent login attempts.
- Can be tied to existing internal identifiers within the organization.
- Enables a high level of security with minimal backchannel verification.

### Cons
- Chained Yivi sessions are not yet widely supported by many identity brokers such as Signicat and Ver.iD.
- Having organization specific credentials in a Wallet and using them on a subsequent authentication is not a well-known user experience yet.

## Authentication Using the Yivi Wallet Instance Identifier
Every Yivi wallet instance is associated with a unique [app-ID](https://attribute-index.staging.yivi.app/en/pbdf.sidn-pbdf.irma.html), which is issued by the Yivi keyshare server. This identifier provides an alternative authentication mechanism that does not rely on personal attributes.

Organizations can use the `app-ID` as a pseudonymous identifier to authenticate users across sessions. This method provides a straightforward way to recognize returning users without requesting sensitive personal data. However, the `app-ID` has limitations that make it less suitable for long-term authentication.

<div class="center-container">
    <img src="/img/app-id.jpg" class="ss" alt="Disclosure of App-ID information" />
</div>

### Pros
- Functions as a pseudonymized identifier for users, maintaining privacy.
- Enables quick and easy authentication without requiring additional attributes to be issued.

### Cons
- The app-ID is not unique across different devices or installations. For example, an iOS and an Android installation of the same user will generate distinct appid values.

## Final Thoughts
Each authentication method using Yivi presents unique strengths and challenges. The choice depends on factors such as regulatory compliance, infrastructure readiness, and user experience. Organizations must carefully assess their needs and available resources before implementing an authentication solution with Yivi.