---
slug: 2025-authentication
title: Exploring Authentication Options with Yivi
authors: [dibranmulder]
tags: [yivi, authentication]
---

Authentication and identification are critical components of digital services. This can be done with Yivi, our privacy-friendly ID-Wallet. It provides multiple options for verifying user identities. However, a significant challenge in implementing Yivi is the identifier used for authentication. Government and healthcare organizations can use the BSN (Burger Service Nummer), but private entities must explore alternative options. Below, we discuss potential authentication methods using Yivi, their advantages, and their limitations.

## Authentication and Activation Using BRP Data
For registration purposes organizations often need a set of data to match the user to their own administration, this is often done by matching on data from the Dutch Personal Records Database (BRP). The data in the BRP is of such quality that it can be trusted to be correct. The challenge often is that the data of the user in the administration of verifing organization is not of the same quality. Resulting in the proces that when an user discloses its BRP information to an organization it sometimes results in a dropout. These dropsouts are a problem, because its blocks the user from identifying and thereby registering or authenticating itself. To circumstand this problem organizations often choose to either: request more data from the user, for instance an contractnumber or change the data in their adminstration to match the data from the BRP so that in a next match the user is matched correctly.

Governmental and/or Health care organizations can simply use the identifying BSN from the BRP to match an user to their administration. We often see that only the BSN is requested from the user and that the BSN is then used to call the BRP for name and address details. We are not a fan of that approach, we think that the amount of backchannel communication about users should be reduced and that the user should be in control of what personal data is being shared with which organizaiton.

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
In addition to BRP data organizations may want to request users to disclose their `email address` and/or `phonenumber`. It's a common practise for authentication purposes to have the `email address` as a unique identifier of the user. The same goes for phone number, while it has to be said that phone numbers are more often transfered to other users, especially in a business setting. In that sense an email address is more stable. In the context of registration and authentication Yivi supports the combination of multiple data sources being disclosed, this can be done with the so called [condiscon](https://docs.yivi.app/condiscon) feature. Verifing organizations can make a composition of attributes that they request the user to disclose. In the context of registration/identification organizations may want to compose the following session request:

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
There is no need to request the users personal data for authentication purposes once the organization has stored the identifier which can be the `phone number` or the `email address`.

### Pros
- Having a separate registration and subsequent authentication flow is a well known practise in the field. Its a familiar user experience.
- Working with identifier reduces the amount of potential login failures to nearly zero, causing practically no dropouts.

### Cons
- Disclosing data from multiple sources may result in a more complex user experience when the user does not have the data already issued at their Yivi app.

## Issuing an Unique Identifier to the Wallet
An organization can issue a unique identifier (e.g., a membership card) to users’ Yivi wallets for repeated logins.
This can be done with chained sessions, allowing users to first disclose the required information for registration, when there is no dropout that can be solved be requesting additional information in the registration proces such as a contract number the user can be issued a company credentials which should have an identifier that is known to the organization. 

One example of an organization that does this is Pubhubs.

### Pros
- 

### Cons
- 

## Authentication Using the Yivi Wallet Instance Identifier
Each Yivi wallet instance has a unique `appid` issued by the Yivi keyshare service.

### Pros
- The appid functions as a pseudonym for users.

### Cons
- Its not unique across devices and installations (e.g., iOS and Android use distinct identifiers).
- Reinstalling the wallet or using a new device requires reactivation.
