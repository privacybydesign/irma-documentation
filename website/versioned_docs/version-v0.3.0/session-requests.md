---
title: Session requests
id: version-v0.3.0-session-requests
original_id: session-requests
---

<style>
img.ss {
  padding: 0.3em 0;
  max-width: 15em;
  margin-left: unset;
  margin-right: unset;
}
</style>

Each [IRMA server](what-is-irma.md#irma-servers) exposes APIs for creating IRMA sessions with a session request. An *IRMA session request* contains all information required for the IRMA server and [IRMA app](https://github.com/privacybydesign/irma_mobile) to perform an IRMA session with, such as the attributes to be issued or verified. This page documents IRMA session requests. It applies to:

* The [`POST /session`](api-irma-server.md#post-session) endpoint from [`irma server`](irma-server.md).
* The [`StartSession()` function](https://godoc.org/github.com/privacybydesign/irmago/server/irmaserver#StartSession) in the `irmaserver` Go library.
* The [`startSession()` function](api-irmajs.md#startsession) of `irmajs`.

For the precise role of session requests in an IRMA session, see this [diagram of an IRMA session](what-is-irma.md#irma-session-flow).

## Session request data types

For each of the [three IRMA session types](what-is-irma.md#session-types), we define a *session request* data type: an object whose JSON representation contains at least a [JSON-LD `@context`](https://w3c.github.io/json-ld-syntax/#the-context) key identifying which message type it is, and extra keys specific to the session type. The following three `@context` values identify disclosure, attribute-based signature, and issuance session requests respectively:

* `"@context": "https://irma.app/ld/request/disclosure/v2"`
* `"@context": "https://irma.app/ld/request/signature/v2"`
* `"@context": "https://irma.app/ld/request/issuance/v2"`

(For now these URIs do not resolve to anything; they just distinguish the message type.)

## Disclosure requests
Disclosure sessions are started with an [`irma.DisclosureRequest`](https://godoc.org/github.com/privacybydesign/irmago#DisclosureRequest). Example:


<!--DOCUSAURUS_CODE_TABS-->
<!--Session request (JSON)-->
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
<!--Session request (Go)-->
```golang
// Create a new empty request
request := irma.NewDisclosureRequest()

// Request specific attributes
request.Disclose = irma.AttributeConDisCon{
	irma.AttributeDisCon{
		irma.AttributeCon{irma.NewAttributeRequest("irma-demo.MijnOverheid.root.BSN")},
	},
	irma.AttributeDisCon{
		irma.AttributeCon{
			irma.NewAttributeRequest("irma-demo.nijmegen.address.street"),
			irma.NewAttributeRequest("irma-demo.nijmegen.address.houseNumber"),
			irma.NewAttributeRequest("irma-demo.nijmegen.address.city"),
		},
		irma.AttributeCon{
			irma.NewAttributeRequest("irma-demo.idin.idin.address"),
			irma.NewAttributeRequest("irma-demo.idin.idin.city"),
		},
	},
}
```
<!--IRMA app-->
<img src="/docs/assets/condiscon.png" class="ss"/>
<!--END_DOCUSAURUS_CODE_TABS-->

This asks for a (demo) `BSN` attribute, as well as either `street`, `houseNumber` and `city` from `irma-demo.nijmegen.address`, or `address` and `city` from `irma-demo.idin.idin`. The three levels correspond to a *conjunction* of *disjunctions* of *conjunctions* of requested attributes, allowing verifiers to request multiple attribute sets from the user, offering choices for some or all of these sets.

All of the attribute types (i.e., the string values) contained in the request must exist in their scheme ([`irma-demo`](https://github.com/privacybydesign/irma-demo-schememanager) in the example above). For the `irma-demo` and `pbdf` schemes, an index of existing attribute types that can be requested can be found [here](https://privacybydesign.foundation/attribute-index/en/).

> Attributes can be disclosed to the requestor in any of the three session types: in issuance sessions issuance proceeds only if the user discloses the required attributes just before issuance, and in attribute-based signature sessions the requested attributes are attached to the resulting attribute-based signature. Thus the `disclose` and `labels` fields introduced above can also occur in issuance or attribute-based signature session requests (see below).

### Multiple credential types within inner conjunctions
In the request above we call the three JSON lists that contain strings *inner conjunctions* (distinguishing them from the *outer conjunctions*, that contain not attribute but disjunctions). Asking for multiple attributes within such an inner conjunctions of a session request is subject to the following rules:

- When attributes coming from multiple credential types occur in an inner conjunction, at most one of them may be a non-[singleton](overview.md#singletons).
- If some of the attributes occuring in the inner conjunction come from the same credential type, then the attributes that the user sends must come from the same credential instance: it is not allowed to mix attributes coming from distinct instances of that credential type. (The IRMA app automatically only offers candidate sets as choices to the user that satisfy this property.)

For example, consider the following session request:
<!--DOCUSAURUS_CODE_TABS-->
<!--Session request (JSON)-->
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
<!--Session request (Go)-->
```golang
request := irma.NewDisclosureRequest()
request.Disclose = irma.AttributeConDisCon{
	irma.AttributeDisCon{
		irma.AttributeCon{
			irma.NewAttributeRequest("pbdf.pbdf.diploma.degree"),
			irma.NewAttributeRequest("pbdf.pbdf.diploma.institute"),
		},
	},
}
```
<!--END_DOCUSAURUS_CODE_TABS-->

Supposing that the user has two instances of `pbdf.pbdf.diploma` whose `degree` and `institute` attributes are `(degree 1, institute 1)` and `(degree 2, institute 2)`, this means that the user can choose only either `(degree 1, institute 1)` or `(degree 2, institute 2)`, and not `(degree 1, institute 2)` or `(degree 2, institute 1)`. (If desired it would be possible to give the user those options by asking for the two attributes in two *outer* conjunctions instead of within an *inner* conjunction.)

When combining multiple credential types within a disjunction these restrictions ensure that when the IRMA app computes candidate attribute sets for the user to choose from, the amount of resulting options stays manageable. In adddition, the second restriction is a feature on its own, allowing verifiers to request multiple attributes coming from one credential instance.

### Requesting specific attribute values
Within inner conjunctions, specific attribute values can be requested by replacing the string with an object like the following:
<!--DOCUSAURUS_CODE_TABS-->
<!--Session request (JSON)-->
```json
{
  "@context": "https://irma.app/ld/request/disclosure/v2",
  "disclose": [
    [
      [
        { "type": "pbdf.pbdf.diploma.degree", "value": "PhD" },
        { "type": "pbdf.pbdf.diploma.institute", "value": null }
      ]
    ]
  ]
}
```
<!--Session request (Go)-->
```go
phd := "PhD"
request := irma.NewDisclosureRequest()
request.Disclose = irma.AttributeConDisCon{
	irma.AttributeDisCon{
		irma.AttributeCon{{
			Type:  irma.NewAttributeTypeIdentifier("pbdf.pbdf.diploma.degree"),
			Value: &phd,
		}, {
			Type:  irma.NewAttributeTypeIdentifier("pbdf.pbdf.diploma.institute"),
			Value: nil,
		}},
	},
}
```
<!--END_DOCUSAURUS_CODE_TABS-->

This would only be satisfied by a `degree` attribute whose value is `PhD`, together with any `institute` attribute. (Note that the object and string syntaxes can be mixed within an inner conjunction, i.e. it would be permissible in the JSON example above to replace the second object with just `"pbdf.pbdf.diploma.institute"`.)

### Null attributes

Whenever an attribute is marked with `optional` in the scheme ([example](https://github.com/privacybydesign/irma-demo-schememanager/blob/482ba298ee038ea43bd0cf8017567a844be0919e/MijnOverheid/Issues/fullName/description.xml#L54)), the issuer may skip it when it issues an instance of the containing credential type, assigning a `null` value to it (which is distinct from the empty string `""`). When disclosing the attribute, the verifier receives `null` instead of a string containing the attribute value.

If a non-null attribute is required this can be requested using `notNull` as follows:
<!--DOCUSAURUS_CODE_TABS-->
<!--Session request (JSON)-->
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
<!--Session request (Go)-->
```go
request := irma.NewDisclosureRequest()
request.Disclose = irma.AttributeConDisCon{
	irma.AttributeDisCon{
		irma.AttributeCon{{
			Type: irma.NewAttributeTypeIdentifier("irma-demo.MijnOverheid.fullName.prefix"),
			NotNull: true,
		}},
	},
}
```
<!--END_DOCUSAURUS_CODE_TABS-->

The default value of `notNull` is `false`.

### Optional disjunctions

A disjunction within a session request can be marked as *optional*, by including an empty inner conjunction in it:
<!--DOCUSAURUS_CODE_TABS-->
<!--Session request (JSON)-->
```json
{
  "@context": "https://irma.app/ld/request/disclosure/v2",
  "disclose": [
    [
      [ "irma-demo.nijmegen.address.city" ]
    ],
    [
      [],
      [ "irma-demo.MijnOverheid.fullName.firstname" ]
    ]
  ]
}
```
<!--Session request (Go)-->
```go
request := irma.NewDisclosureRequest()
request.Disclose = irma.AttributeConDisCon{
	irma.AttributeDisCon{
		irma.AttributeCon{irma.NewAttributeRequest("irma-demo.nijmegen.address.city")},
	},
	irma.AttributeDisCon{
		irma.AttributeCon{},
		irma.AttributeCon{irma.NewAttributeRequest("irma-demo.MijnOverheid.fullName.firstname")},
	},
}
```
<!--IRMA app-->
<img src="/docs/assets/optional-disjunction.png" class="ss"/>
<!--END_DOCUSAURUS_CODE_TABS-->

This can be useful when certain attributes are not required, so that if the user does not have them the session does not need to be aborted.

### Disjunction labels

Per disjunction a *label* can be specified, which is shown in the IRMA app when the user is asked for permission to disclose attributes. For example, the session request from [above](#disclosure-requests) could be augmented with a label for the second disjunction as follows:


<!--DOCUSAURUS_CODE_TABS-->
<!--Session request (JSON)-->
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
<!--Session request (Go)-->
```go
request := irma.NewDisclosureRequest()
request.Labels = map[int]irma.TranslatedString{
	1: {"en": "Work address", "nl": "Werk adres"},
}
```
<!--IRMA app-->
<img src="/docs/assets/condiscon-label.png" class="ss"/>
<!--END_DOCUSAURUS_CODE_TABS-->

In this way each disjunction can be given a optional label explaining to the user the purpose of the disjunction. It is recommended to only provide a label to explain something to the user that would otherwise not be obvious; for example, to request the user to send a work email address instead of a personal one. Repeating the credential or attribute name or description in labels is an antipattern.

## Attribute-based signature requests
Attribute-based signature sessions are started with an [`irma.SignatureRequest`](https://godoc.org/github.com/privacybydesign/irmago#SignatureRequest), which are similar to disclosure requests:
<!--DOCUSAURUS_CODE_TABS-->
<!--Session request (JSON)-->
```json
{
  "@context": "https://irma.app/ld/request/signature/v2",
  "message": "Message to be signed by user",
  "disclose": ...,
  "labels": ...
}
```
<!--Session request (Go)-->
```go
request := irma.NewSignatureRequest("Message to be signed by user")
request.Disclose = irma.AttributeConDisCon{ /* request attributes to attach to ABS */ }
request.Labels = map[int]irma.TranslatedString{}
```
<!--END_DOCUSAURUS_CODE_TABS-->

The `message` field is required. The attributes to be attached to the attribute-based signature are requested with the `disclose` field, which along with the `labels` field work exactly like in disclosure sessions.

## Issuance requests
Issuance sessions are started with an [`irma.IssuanceRequest`](https://godoc.org/github.com/privacybydesign/irmago#IssuanceRequest). Example:
<!--DOCUSAURUS_CODE_TABS-->
<!--Session request (JSON)-->
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
<!--Session request (Go)-->
```go
validity := irma.Timestamp(time.Unix(1592438400, 0))
request := irma.NewIssuanceRequest([]*irma.CredentialRequest{
	{
		CredentialTypeID: irma.NewCredentialTypeIdentifier("irma-demo.MijnOverheid.ageLower"),
		Validity:         &validity, // optional
		Attributes: map[string]string{
			"over12": "yes",
			"over16": "yes",
			"over18": "yes",
			"over21": "no",
		},
	},
})
request.Disclose = irma.AttributeConDisCon{}     // optional
request.Labels = map[int]irma.TranslatedString{} // optional
```
<!--END_DOCUSAURUS_CODE_TABS-->

Per credential in the `credentials` array the `validity` is optional; if skipped it is assigned the default value of 6 months. If present, the validity is always rounded down to the [nearest epoch boundary](overview.md#special-attributes), which is one week (60 * 60 * 24 * 7  = 604800 seconds).

Attributes marked as `optional` in the containing credential type ([example](https://github.com/privacybydesign/irma-demo-schememanager/blob/482ba298ee038ea43bd0cf8017567a844be0919e/MijnOverheid/Issues/fullName/description.xml#L54)) may be skipped in the `attributes` map. This issues [the `null` value](#null-attributes) to these attributes.

`disclose` and `labels` are optional, allowing for *combined disclosure-issuance sessions*, in which the user is required to disclose attributes before the IRMA server will issue the credentials.

## Extra parameters
For each API that accepts one of the above session request data types, the requestor can provide additional parameters to configure the session at the IRMA server, by providing an *extended session request* instead, as follows:
<!--DOCUSAURUS_CODE_TABS-->
<!--Extended session request (JSON)-->
```json
{
  "validity": 120,
  "timeout": 120,
  "callbackUrl": "https://example.com",
  "request": ...
}
```
<!--Extended session request (Go)-->
```go
// See also corresponding types irma.SignatureRequestorRequest
// and irma.IdentityProviderRequest
irma.ServiceProviderRequest{
	irma.RequestorBaseRequest{
		ResultJwtValidity: 120,
		ClientTimeout:     120,
		CallbackUrl:       "https://example.com",
	},
	irma.NewDisclosureRequest(),
}
```
<!--END_DOCUSAURUS_CODE_TABS-->

## JWTs: signed session requests
The IRMA API server or [`irma server`](irma-server.md) can be configured such that it only accepts session requests that have been digitally signed in the form of a [JWT](https://jwt.io). The form of the JWT depends on the [session type](what-is-irma.md#session-types). An example requesting [IRMATube](https://privacybydesign.foundation/demo/irmaTube) attributes:
```
eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6ImlybWF0dWJlIn0.eyJpYXQiOjE1NjQ2NTczNzUsImlzcyI6IklSTUFUdWJlIiwic3ViIjoidmVyaWZpY2F0aW9uX3JlcXVlc3QiLCJzcHJlcXVlc3QiOnsidmFsaWRpdHkiOjYwLCJyZXF1ZXN0Ijp7IkBjb250ZXh0IjoiaHR0cHM6Ly9pcm1hLmFwcC9sZC9yZXF1ZXN0L2Rpc2Nsb3N1cmUvdjIiLCJkaXNjbG9zZSI6W1tbInBiZGYucGJkZi5pcm1hdHViZS50eXBlIl1dLFtbInBiZGYucGJkZi5hZ2VMaW1pdHMub3ZlcjEyIl0sWyJwYmRmLm5pam1lZ2VuLmFnZUxpbWl0cy5vdmVyMTIiXV1dLCJ0eXBlIjoiZGlzY2xvc2luZyIsIm5vbmNlIjoienRuMWRoOGVoZnBjZ0V5M0VCR1daUT09IiwiY29udGV4dCI6IkFRPT0ifX19.lW9mqjrLkoahDP6Fcw_9mH5hlfl1tq5qp3W3ga0Nrd_j0NXFj-6ngqHVXEV1zhC_OkVH4LN8fMBAgN8nqaFWgEdQvrCuB7-ynuBVjLR-QU272Ym86zLEWYggAkbZ5KY40MpTxU1dgFMucG7fyAESic04OribWOCVxstAMsM28yCxvzkBMCOSjFEe3abcg_N6VvQnLn3LgZP_UrxQmQsh4DK7mBjW04LesLG1vjcliyhDGUb52FHOP_NAsG7G2FvIgojPzALlPrpTMu5p8a95wc5CGR791wybmh0F8kDdwZWAU0W2FjlX5bNPsyXN8AxRVWaRmWoGrGsQhy_sKEf8lg
```
In case of disclosure sessions, the body of the JWT (the part in between the two dots) contains a Base64-encoding of the following:
<!--DOCUSAURUS_CODE_TABS-->
<!--JWT body (JSON)-->
```json
{
  "iat": 1550424847,
  "iss": "IRMATube",
  "sub": "verification_request",
  "sprequest": ...
}
```
<!--JWT body (Go)-->
```go
// Sets iat, iss, and sub fields.
// See also corresponding functions irma.NewSignatureRequestorJwt()
// and irma.NewIdentityProviderJwt().
// Obtain signed JWT string to POST to an irma server using Sign() method.
irma.NewServiceProviderJwt("IRMATube", irma.NewDisclosureRequest())
```
<!--END_DOCUSAURUS_CODE_TABS-->

The fields are as follows:
* `iat`: Unix timestamp of the creation date of the JWT. IRMA servers may reject JWTs beyond a certain age.
* `iss`: contains the requestor name, and is used by the IRMA server to lookup the appropriate key with which to verify the JWT.
* `sub`: JWT subject, in case of disclosure sessions this must always be `"verification_request"`.
* `sprequest`: contains an extended disclosure session request as defined above.

For each possible session type, the contents of the `sub` field and the name of the field containing the session request must be as follows.

| Session type | `sub` contents | Session request field name | Go function |
| ------------ | -------------- | -------------------------- | ----------- |
| Disclosure  | `verification_request` | `sprequest` | `irma.NewServiceProviderJwt()` |
| Attribute-based signature | `signature_request` | `absrequest` | `irma.NewSignatureRequestorJwt()` |
| Issuance | `issue_request` | `iprequest` | `irma.NewIdentityProviderJwt()` |

Currently the following libraries can produce JWTs of this form:
* The [`irmago`](https://godoc.org/github.com/privacybydesign/irmago) library, using the mentioned functions
* The [`irmajs`](irmajs.md) Javascript library
* The [`irma-requestor`](https://github.com/privacybydesign/irma-requestor) PHP library
* The [`irma_api_common`](https://github.com/privacybydesign/irma_api_common) Java library
* The [`irma-diva-js`](https://github.com/Alliander/diva-irma-js) Javascript library

`irma server` currently supports JWTs signed (asymmetrically with RSA) with the `RS256` algorithm, and (symmetrically signed with HMAC-SHA256) `RS256`. The IRMA API server only supports `RS256`.
