---
title: Session requests
---

Each IRMA server exposes APIs for creating IRMA sessions with a session request. An *IRMA session request* contains all information required for the IRMA server and IRMA client to perform an IRMA session with, such as the attributes to be issued or verified. This page documents IRMA session requests. It applies to:

* The `POST /session` endpoint from [`irma server`](irma-server).
* The [`StartSession()` function](https://godoc.org/github.com/privacybydesign/irmago/server/irmaserver#StartSession) in the `irmaserver` Go library.
* The [`startSession()` function](api-irmajs#startsession) of `irmajs`.

## Session request data types

For each of the three session types, we define a *session request* data type. Each request contain a `type` field whose value is `"disclosing"`, `"signing"` or `"issuing"`. For the precise role of session requests in an IRMA session, see this [diagram of an IRMA session](what-is-irma#irma-sessions).

### Disclosure requests
Disclosure requests are started with an [`irma.DisclosureRequest`](https://godoc.org/github.com/privacybydesign/irmago#DisclosureRequest). Example:
```json
{
  "type": "disclosing",
  "content": [{
    "label": "Age limit",
    "attributes": [
      "irma-demo.MijnOverheid.ageLimits.over18",
      "irma-demo.MijnOverheid.ageLimits.over21"
    ]
  },
  {
    "label": "First name",
    "attributes": [
      "irma-demo.MijnOverheid.fullName.firstname"
    ]
  }]
}
```
This asks the user for either an `over18` attribute or an `over21` attribute, *and* a `firstname` attribute. The `"Age limit"` and `"First name"` labels are shown in the IRMA app when the user is asked for permission to disclose these attributes, next to the candidate attributes.

Each element of `content` in this example is called an *attribute disjunction*, as it asks for any one of the attributes listed in `attributes`. Specific attribute values can be requested by setting `attributes` to a map instead of a list. For example, setting `attributes` to
```json
{ "irma-demo.MijnOverheid.ageLimits.over18": "yes" }
```
would only be satisfied by an `over18` attribute whose value is `yes`.

The `content` array may contain multiple such attribute disjunctions, each of which the user must satisfy with an attribute (they are `AND`ed together). Thus `content` contains a *conjunction of disjunctions* of IRMA attributes.

### Attribute-based signature requests
Attribute-based signature sessions are started with an [`irma.SignatureRequest`](https://godoc.org/github.com/privacybydesign/irmago#SignatureRequest), which are similar to disclosure requests:
```json
{
  "type": "signing",
  "message": "Message to be signed by user",
  "content": ...
}
```
`content` is an array of attribute disjunctions just as in disclosure requests.

### Issuance requests
Issuance sesstions are started with an [`irma.IssuanceRequest`](https://godoc.org/github.com/privacybydesign/irmago#IssuanceRequest). Example:
```json
{
  "type": "issuing",
  "credentials": [{
    "credential": "irma-demo.MijnOverheid.ageLower",
    "attributes": {
      "over12": "yes",
      "over16": "yes",
      "over18": "yes",
      "over21": "no"
    }
  }],
  "disclose": ...
}
```
`disclose` is an optional array of attribute disjunctions just as in disclosure requests. If this is provided then a *combined disclosure-issuance* session is performed: the user needs to disclose the attributes from `disclose` first before receiving the new attributes.

### Extra parameters
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
The IRMA API server or `irma server` can be configured such that it only accepts session requests that have been digitally signed in the form of a [JWT](https://jwt.io). This way the session request JWT can be sent to an IRMA sever for example by an untrusted source such as the frontend (browser), while the IRMA server is still able to authenticate the session request as coming from a requestor that is authorized to perform sessions.

The form of the JWT depends on the session type. For example, here is a JWT produced by the [IRMATube demo](https://privacybydesign.foundation/demo/irmaTube):
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
* The [`irma`](https://github.com/privacybydesign/irmago) Go library.
* The [`irma-requestor`](https://github.com/privacybydesign/irma-requestor) PHP library.
* The [`irma_api_common`](https://github.com/privacybydesign/irma_api_common) Java library.

`irma server` currently supports JWTS signed (asymmetrically with RSA) with the `RS256` algorithm, and (symmetrically signed with HMAC-SHA256) `RS256`. The IRMA API server only supports `RS256`.