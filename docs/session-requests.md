---
title: Session requests
---

<style>
img.ss {
  padding: 0.3em 0;
  max-width: 15em;
  margin-left: unset;
  margin-right: unset;
}
</style>

Each [IRMA server](what-is-irma#irma-servers) exposes APIs for creating IRMA sessions with a session request. An *IRMA session request* contains all information required for the IRMA server and [IRMA app](https://github.com/privacybydesign/irma_mobile) to perform an IRMA session with, such as the attributes to be issued or verified. This page documents IRMA session requests. It applies to:

* The [`POST /session`](api-irma-server#post-session) endpoint from [`irma server`](irma-server).
* The [`StartSession()` function](https://godoc.org/github.com/privacybydesign/irmago/server/irmaserver#StartSession) in the `irmaserver` Go library.
* The [`startSession()` function](api-irmajs#startsession) of `irmajs`.

For the precise role of session requests in an IRMA session, see this [diagram of an IRMA session](what-is-irma#irma-session-flow).

## Session request data types

For each of the [three IRMA session types](what-is-irma#session-types), we define a *session request* JSON data type: an object containing at least a [JSON-LD `@context`](https://w3c.github.io/json-ld-syntax/#the-context) key identifying which message type it is, and extra keys specific to the session type. The following three `@context` values identify disclosure, attribute-based signature, and issuance session requests respectively:

* `"@context": "https://irma.app/ld/request/disclosure/v2"`
* `"@context": "https://irma.app/ld/request/signature/v2"`
* `"@context": "https://irma.app/ld/request/issuance/v2"`

## Disclosure requests
Disclosure requests are started with an [`irma.DisclosureRequest`](https://godoc.org/github.com/privacybydesign/irmago#DisclosureRequest). Example:


<!--DOCUSAURUS_CODE_TABS-->
<!--Session request-->
```json
{
  "@context": "https://irma.app/ld/request/disclosure/v2",
  "disclose": [
    [
      [ "irma-demo.MijnOverheid.root.BSN" ]
    ],
    [
      [
        "irma-demo.nijmegen.address.street",
        "irma-demo.nijmegen.address.houseNumber",
        "irma-demo.nijmegen.address.city"
      ],
      [
        "irma-demo.idin.idin.address",
        "irma-demo.idin.idin.city"
      ]
    ]
  ]
}
```
<!--IRMA app-->
<img src="/docs/assets/condiscon.png" class="ss"/>
<!--END_DOCUSAURUS_CODE_TABS-->

This asks for a (demo) `BSN` attribute, as well as either `street`, `houseNumber` and `city` from `irma-demo.nijmegen.address`, or `address` and `city` from `irma-demo.idin.idin`. The three levels correspond to a *conjunction* of *disjunctions* of *conjunctions* of requested attributes, allowing verifiers to request multiple attribute sets from the user, offering choices for some or all of these sets.

> Attributes can be disclosed to the requestor in any of the three session types: in issuance sessions issuance proceeds only if the user discloses the required attributes just before issuance, and in attribute-based signature sessions the requested attributes are attached to the resulting attribute-based signature. Thus the `disclose` and `labels` fields introduced above can also occur in issuance or attribute-based signature session requests (see below).

### Multiple credential types within inner conjunctions
In the request above we call the three JSON lists that contain strings *inner conjunctions* (distinguishing them from the *outer conjunctions*, that contain not attribute but disjunctions). Asking for multiple attributes within such an inner conjunctions of a session request is subject to the following rules:

- When attributes coming from multiple credential types occur in an inner conjunction, at most one of them may be a non-[singleton](overview#singletons).
- If some of the attributes occuring in the inner conjunction come from the same credential type, then the attributes that the user sends must come from the same credential instance: it is not allowed to mix attributes coming from distinct instances of that credential type. (The IRMA app automatically only offers candidate sets as choices to the user that satisfy this property.)

For example, consider the following session request:
```json
{
  "@context": "https://irma.app/ld/request/disclosure/v2",
  "disclose": [
    [
      [
        "pbdf.pbdf.diploma.degree",
        "pbdf.pbdf.diploma.institute"
      ]
    ]
  ]
}
```

Supposing that the user has two instances of `pbdf.pbdf.diploma` whose `degree` and `institute` attributes are `(degree 1, institute 1)` and `(degree 2, institute 2)`, this means that the user can choose only either `(degree 1, institute 1)` or `(degree 2, institute 2)`, and not `(degree 1, institute 2)` or `(degree 2, institute 1)`. (If desired it would be possible to give the user those options by asking for the two attributes in two *outer* conjunctions instead of within an *inner* conjunction.)

When combining multiple credential types within a disjunction these restrictions ensure that when the IRMA app computes candidate attribute sets for the user to choose from, the amount of resulting options stays manageable. In adddition, the second restriction is a new feature on its own, allowing verifiers to request multiple attributes coming from one credential instance.

### Requesting specific attribute values
Within inner conjunctions, specific attribute values can be requested by replacing the string with an object like the following:
```json
{
  "@context": "https://irma.app/ld/request/disclosure/v2",
  "disclose": [
    [
      [
        { "type": "pbdf.pbdf.diploma.degree", "value": "PhD" },
        { "type": "pbdf.pbdf.diploma.institute", "value": null },
      ]
    ]
  ]
}
```
This would only be satisfied by a `degree` attribute whose value is `PhD`, together with any `institute` attribute. (Note that the object and string syntaxes can be mixed within an inner conjunction, i.e. it would be permissible in the example above to replace the second object with just `"pbdf.pbdf.diploma.institute"`.)

### Null attributes

Whenever an attribute is marked with `optional` in the scheme ([example](https://github.com/privacybydesign/irma-demo-schememanager/blob/482ba298ee038ea43bd0cf8017567a844be0919e/MijnOverheid/Issues/fullName/description.xml#L54)), the issuer may skip it when it issues an instance of the containing credential type, assigning a `null` value to it (which is distinct from the empty string `""`). When disclosing the attribute, the verifier receives `null` instead of a string containing the attribute value.

If a non-null attribute is required this can be requested using `notNull` as follows:

```json
{
  "@context": "https://irma.app/ld/request/disclosure/v2",
  "disclose": [
    [
      [
        { "type": "irma-demo.MijnOverheid.fullName.prefix", "notNull": true }
      ]
    ]
  ]
}
```

The default value of `notNull` is `false`.

### Optional disjunctions

A disjunction within a session request can be marked as *optional*, by including an empty inner conjunction in it:
<!--DOCUSAURUS_CODE_TABS-->
<!--Session request-->
```json
{
  "@context": "https://irma.app/ld/request/disclosure/v2",
  "disclose": [
    [
      [ "irma-demo.nijmegen.address.city" ],
    ],
    [
      [],
      [ "irma-demo.MijnOverheid.fullName.firstname" ]
    ]
  ]
}
```
<!--IRMA app-->
<img src="/docs/assets/optional-disjunction.png" class="ss"/>
<!--END_DOCUSAURUS_CODE_TABS-->

This can be useful when certain attributes are not required, so that if the user does not have them the session does not need to be aborted.

### Disjunction labels

Per disjunction a *label* can be specified, which is shown in the IRMA app when the user is asked for permission to disclose attributes. For example, the session request from [above](#disclosure-requests) could be augmented with a label for the second disjunction as follows:


<!--DOCUSAURUS_CODE_TABS-->
<!--Session request-->
```json
{
  "@context": "https://irma.app/ld/request/disclosure/v2",
  "disclose": [
    [ ... ],
    [ ... ]
  ],
  "labels": {
    "1": { "en": "Work address", "nl": "Werk adres" }
  }
}
```
<!--IRMA app-->
<img src="/docs/assets/condiscon-label.png" class="ss"/>
<!--END_DOCUSAURUS_CODE_TABS-->

In this way each disjunction can be given a optional label explaining to the user the purpose of the disjunction. It is recommended to only provide a label to explain something to the user that would otherwise not be obvious; for example, to request the user to send a work email address instead of a personal one. Repeating the credential or attribute name or description in labels is an antipattern.

## Attribute-based signature requests
Attribute-based signature sessions are started with an [`irma.SignatureRequest`](https://godoc.org/github.com/privacybydesign/irmago#SignatureRequest), which are similar to disclosure requests:
```json
{
  "@context": "https://irma.app/ld/request/signature/v2",
  "message": "Message to be signed by user",
  "disclose": ...,
  "labels": ...
}
```

The `message` field is required. The attributes to be attached to the attribute-based signature are requested with the `disclose` field, which along with the `labels` field work exactly like in disclosure sessions.

## Issuance requests
Issuance sessions are started with an [`irma.IssuanceRequest`](https://godoc.org/github.com/privacybydesign/irmago#IssuanceRequest). Example:
```json
{
  "@context": "https://irma.app/ld/request/issuance/v2",
  "credentials": [{
    "credential": "irma-demo.MijnOverheid.ageLower",
    "validity": 1592438400,
    "attributes": {
      "over12": "yes",
      "over16": "yes",
      "over18": "yes",
      "over21": "no"
    }
  }],
  "disclose": ...,
  "labels": ...
}
```
Per credential in the `credentials` array the `validity` is optional; if skipped it is assigned the default value of 6 months. If present, the validity is always rounded down to the [nearest epoch boundary](overview#special-attributes), which is one week (60 * 60 * 24 * 7  = 604800 seconds).

Attributes marked as `optional` in the containing credential type ([example](https://github.com/privacybydesign/irma-demo-schememanager/blob/482ba298ee038ea43bd0cf8017567a844be0919e/MijnOverheid/Issues/fullName/description.xml#L54)) may be skipped in the `attributes` map. This issues [the `null` value](#null-attributes) to these attributes.

`disclose` and `labels` are optional, allowing for *combined disclosure-issuance sessions*, in which the user is required to disclose attributes before the IRMA server will issue the credentials.

## Extra parameters
For each API that accepts one of the above session request data types, the requestor can provide additional parameters to configure the session at the IRMA server, by providing an *extended session request* instead, as follows:
```json
{
  "validity": 120,
  "timeout": 120,
  "callbackUrl": "https://example.com",
  "request": ...
}
```

## JWTs: signed session requests
The IRMA API server or [`irma server`](irma-server) can be configured such that it only accepts session requests that have been digitally signed in the form of a [JWT](https://jwt.io). The form of the JWT depends on the [session type](what-is-irma#session-types). For example, here is a JWT produced by the [IRMATube demo](https://privacybydesign.foundation/demo/irmaTube):
```
eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6ImlybWF0dWJlIn0.eyJpYXQiOjE1NTA0MjQ4NDcsImlzcyI6IklSTUFUdWJlIiwic3ViIjoidmVyaWZpY2F0aW9uX3JlcXVlc3QiLCJzcHJlcXVlc3QiOnsidmFsaWRpdHkiOjYwLCJyZXF1ZXN0Ijp7ImNvbnRlbnQiOlt7ImxhYmVsIjoiTWVtYmVyc2hpcCIsImF0dHJpYnV0ZXMiOlsicGJkZi5wYmRmLmlybWF0dWJlLnR5cGUiXX0seyJsYWJlbCI6IkFnZSBvdmVyIDEyIiwiYXR0cmlidXRlcyI6WyJwYmRmLnBiZGYuYWdlTGltaXRzLm92ZXIxMiIsInBiZGYubmlqbWVnZW4uYWdlTGltaXRzLm92ZXIxMiJdfV19fX0.4_b12I4fwXVE5QRf7ll1K-FhjeDYQk3a4XTiykIuWW61gY9VwzJrazWDWU7PRJfb0BgLU36cyw9K5FeQPpsIRxXhFxde4ueAjAixNWtn1JG1Nt_L-7LEOV3cl6G7TAGdVx_-WrLctBQ99NMHWL4_xJ8pY253vI6oQjqp0TTwMPkOAp-taZiRY5AEW0Itj1dbX09WWbxIegL7-SIhi-kjrz-ia6h-l2udAVaeCzpQX_-1Sqm1z8-Fi4lhcRNVituCGMgsWAPUNNPExlOY1YJmuLUogvSIClW6hqTUafVxWqQ-DLJFNBWLzlOoiSj6WqtkEX5r5AsFHKpI5383umcJqA
```
In case of disclosure sessions, the body of the JWT (the part in between the two dots) contains a Base64-encoding of the following:
```json
{
  "iat": 1550424847,
  "iss": "IRMATube",
  "sub": "verification_request",
  "sprequest": ...
}
```
The fields are as follows:
* `iat`: Unix timestamp of the creation date of the JWT. IRMA servers may reject JWTs beyond a certain age.
* `iss`: contains the requestor name, and is used by the IRMA server to lookup the appropriate key with which to verify the JWT.
* `sub`: JWT subject, in case of disclosure sessions this must always be `"verification_request"`.
* `sprequest`: contains an extended disclosure session request as defined above.

For each possible session type, the contents of the `sub` field and the name of the field containing the session request must be as follows.

| Session type | `sub` contents | Session request field name |
| ------------ | -------------- | -------------------------- |
| Disclosure  | `verification_request` | `sprequest` |
| Attribute-based signature | `signature_request` | `absrequest` |
| Issuance | `issue_request` | `iprequest` |

Currently the following libraries can produce JWTs of this form:
* The [`irma`](https://godoc.org/github.com/privacybydesign/irmago) Go library
* The [`irmajs`](irmajs) Javascript library
* The [`irma-requestor`](https://github.com/privacybydesign/irma-requestor) PHP library
* The [`irma_api_common`](https://github.com/privacybydesign/irma_api_common) Java library
* The [`irma-diva-js`](https://github.com/Alliander/diva-irma-js) Javascript library

`irma server` currently supports JWTs signed (asymmetrically with RSA) with the `RS256` algorithm, and (symmetrically signed with HMAC-SHA256) `RS256`. The IRMA API server only supports `RS256`.
