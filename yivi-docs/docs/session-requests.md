---
title: Session requests
---

Each [IRMA server](what-is-yivi.md#irma-servers) exposes APIs for creating IRMA sessions with a session request. An *IRMA session request* contains all information required for the IRMA server and [Yivi app](yivi-app.md) to perform an IRMA session with, such as the attributes to be issued or verified. This page documents IRMA session requests. It applies to:

* The [`POST /session`](api-irma-server.md#post-session) endpoint from [`irma server`](irma-server.md).
* The [`StartSession()` function](https://godoc.org/github.com/privacybydesign/irmago/server/irmaserver#StartSession) in the `irmaserver` Go library.
* The [`startSession()` function](api-irmajs.md#startsession) of `irmajs`.

For the precise role of session requests in an IRMA session, see this [diagram of an IRMA session](what-is-yivi.md#irma-session-flow).

## Session request data types

For each of the [three IRMA session types](what-is-yivi.md#session-types), we define a *session request* data type: an object whose JSON representation contains at least a [JSON-LD `@context`](https://w3c.github.io/json-ld-syntax/#the-context) key identifying which message type it is, and extra keys specific to the session type. The following three `@context` values identify disclosure, attribute-based signature, and issuance session requests respectively:

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
<!--Yivi app-->
<img src="/img/condiscon.png" class="ss" alt="condiscon" />
<!--END_DOCUSAURUS_CODE_TABS-->

This asks for a (demo) `BSN` attribute, as well as either `street`, `houseNumber` and `city` from `irma-demo.nijmegen.address`, or `address` and `city` from `irma-demo.idin.idin`. The three levels correspond to a *conjunction* of *disjunctions* of *conjunctions* of requested attributes, allowing verifiers to request multiple attribute sets from the user, offering choices for some or all of these sets.

All of the attribute types (i.e., the string values) contained in the request must exist in their scheme ([`irma-demo`](https://github.com/privacybydesign/irma-demo-schememanager) in the example above). For the `irma-demo` and `pbdf` schemes, an index of existing attribute types that can be requested can be found [here](https://privacybydesign.foundation/attribute-index/en/).

> Attributes can be disclosed to the requestor in any of the three session types: in issuance sessions issuance proceeds only if the user discloses the required attributes just before issuance, and in attribute-based signature sessions the requested attributes are attached to the resulting attribute-based signature. Thus the `disclose` and `labels` fields introduced above can also occur in issuance or attribute-based signature session requests (see below).

### Multiple credential types within inner conjunctions
In the request above we call the three JSON lists that contain strings *inner conjunctions* (distinguishing them from the *outer conjunctions*, that contain not attribute but disjunctions). Asking for multiple attributes within such an inner conjunctions of a session request is subject to the following rules:

- When attributes coming from multiple credential types occur in an inner conjunction, at most one of them may be a non-[singleton](overview.md#singletons).
- If some of the attributes occuring in the inner conjunction come from the same credential type, then the attributes that the user sends must come from the same credential instance: it is not allowed to mix attributes coming from distinct instances of that credential type. (The Yivi app automatically only offers candidate sets as choices to the user that satisfy this property.)

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

When combining multiple credential types within a disjunction these restrictions ensure that when the Yivi app computes candidate attribute sets for the user to choose from, the amount of resulting options stays manageable. In adddition, the second restriction is a feature on its own, allowing verifiers to request multiple attributes coming from one credential instance.

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
<!--Yivi app-->
<img src="/img/optional-disjunction.png" class="ss" alt="optional-disjunction" />
<!--END_DOCUSAURUS_CODE_TABS-->

This can be useful when certain attributes are not required, so that if the user does not have them the session does not need to be aborted.

### Disjunction labels

Per disjunction a *label* can be specified, which is shown in the Yivi app when the user is asked for permission to disclose attributes. For example, the session request from [above](#disclosure-requests) could be augmented with a label for the second disjunction as follows:


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
<!--Yivi app-->
<img src="/img/condiscon-label.png" class="ss" alt="condiscon-label" />
<!--END_DOCUSAURUS_CODE_TABS-->

In this way each disjunction can be given a optional label explaining to the user the purpose of the disjunction. It is recommended to only provide a label to explain something to the user that would otherwise not be obvious; for example, to request the user to send a work email address instead of a personal one. Repeating the credential or attribute name or description in labels is an antipattern.

### Skip expiry check
You can allow users to disclose expired instances of credentials. This is useful for [combined issuance-disclosure sessions](session-requests.md#issuance-requests) and [chained sessions](chained-sessions.md) if you only want to ensure that the user is still using the same device, and therefore the same [secret key](zkp.md), as during a previous issuance session.

```json
{
  "@context": "https://irma.app/ld/request/disclosure/v2",
  "disclose": [
    [
      [
        { "type": "irma-demo.MijnOverheid.root.BSN", "value": "12345" }
      ]
    ]
  ],
  "skipExpiryCheck": [ "irma-demo.MijnOverheid.root" ]
}
```

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

The `clientReturnUrl` option can also be used, both for issuance only and combined disclosure-issuance sessions. Usage is similar as in [disclosure sessions](#client-return-url).

## Client return URL
If the user performs a mobile session, i.e. on the same device as where the Yivi app is installed on, then after the session has completed the user will be redirect to the `clientReturnUrl` specified in the session request, if present.

<!--DOCUSAURUS_CODE_TABS-->
<!--Session request (JSON)-->
```json
{
  "@context": "https://irma.app/ld/request/disclosure/v2",
  "disclose": [
    ...
  ],
  "clientReturnUrl": "https://example.com"
}
```
<!--Session request (Go)-->
```go
request := irma.NewDisclosureRequest()
request.ClientReturnURL = "https://example.com"
```
<!--END_DOCUSAURUS_CODE_TABS-->

The example shows a disclosure request but `clientReturnUrl` can be set on session requests of any type. If set, when the user finishes a session (either successfully or unsuccessfully), she is redirected to the location specified by `clientReturnUrl`.

If *not* set:
* On Android the Yivi app automatically toggles back to the previous app;
* On iOS it is not possible to toggle back to the previous app due to restrictions by Apple, so the Yivi app stays open. In the top left corner of the screen, however, a button appears that leads back to the previous app.

This URL does not necessarily have to be a web URL; it can also be a universal link to another app. Universal links work both on Android and iOS. It is also possible to use iOS or Android scheme URLs. (Note however that iOS and Android scheme URLs differ from one another, so when starting a session with a scheme URL as return URL you should therefore determine on which platform the user's app is running.)

On iOS, toggling back to the calling app or website after the session can be simulated by navigating towards the calling app using a `clientReturnUrl`, either a normal URL or universal link. This works on Android as well, so currently this is the only platform-independent way of ensuring that the used ends up at a specified place after the session. If the URL opens a website, however, then the user is navigated towards a new browser tab instead of back to an existing browser tab, so in website-IRMA-website flows you will need to reload your webapp and state in the newly opened tab.

### Augmenting the client return URL

It is possible to have the IRMA server augment the `clientReturnUrl` with the server token of a session (i.e., the `token` in the [response of the `/session` endpoint](api-irma-server.md#post-session)). This token is then appended as a query parameter with name `token` to the `clientReturnUrl`. Using this token, one can the retrieve the [session result](api-irma-server.md#get-session-token-result).

To enable this, both the server configuration flag `augment-client-return-url` needs to be enabled, as well as the `augmentReturnUrl` session request parameter needs to be true.
<!--DOCUSAURUS_CODE_TABS-->
<!--Session request (JSON)-->
```json
{
  "@context": "https://irma.app/ld/request/disclosure/v2",
  "disclose": [
    ...
  ],
  "augmentReturnUrl": true,
  "clientReturnUrl": "https://example.com"
}
```
<!--Session request (Go)-->
```go
request := irma.NewDisclosureRequest()
request.ClientReturnURL = "https://example.com"
request.AugmentReturnURL = true
```
<!--END_DOCUSAURUS_CODE_TABS-->

In this example, the client return url would be augmented to become `https://example.com?token=0123456789abcdef`, where `0123456789abcdef` would be the server token of the session.

## Session host
The host in the `sessionPtr` field of the [session package](api-irma-server.md#post-session) can be configured using the `host` option in the session request. This is useful when the IRMA server can be reached through multiple URLs. In this way, a single IRMA server can be used to serve multiple requestors, each with their own hostname. The hostname is being shown to the user in the Yivi app. The IRMA server will verify that the hostname the Yivi app connects to matches the hostname in the session request.

```json
{
  "@context": "https://irma.app/ld/request/disclosure/v2",
  "host": "irma.example.com",
  "disclose": ...
}
```
This leads to the following session package:
```json
{
  "token":"KzxuWKwL5KGLKr4uerws",
  "sessionPtr": {"u":"https://irma.example.com/irma/session/ysDohpoySavbHAUDjmpz","irmaqr":"disclosing"},
  "frontendRequest": {
    "authorization":"qGrMmL8UZwZ88Sq8gobV",
    "minProtocolVersion": "1.0",
    "maxProtocolVersion": "1.1"
  }
}
```

The `host` field is optional. If not set, the `url` from the server's [configuration](irma-server.md#configuring) will be used as-is. In this case, the IRMA server will not check which host the Yivi app connects to. The Yivi app on the other hand will check that the TLS certificate being used is correct.

When you use `irma server`, you should explicitly specify [requestor permissions](irma-server.md#permissions) for this. Otherwise, only the hostname from the `url` in the server's [configuration](irma-server.md#configuring) will be allowed. When you use the [IRMA server library](irma-server-lib.md), no permission restrictions are imposed. If you need restrictions, then you have to implement this yourself.

## Extra parameters
For each API that accepts one of the above session request data types, the requestor can provide additional parameters to configure the session at the IRMA server, by providing an *extended session request* instead, as follows:
<!--DOCUSAURUS_CODE_TABS-->
<!--Extended session request (JSON)-->
```json
{
  "validity": 120,
  "timeout": 120,
  "callbackUrl": "https://example.com",
  "nextSession": {
    "url": "https://example.com/nextsession"
  },
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
		NextSession:       &irma.NextSessionData{URL: "https://example.com/nextsession"},
	},
	irma.NewDisclosureRequest(),
}
```
<!--END_DOCUSAURUS_CODE_TABS-->

Below you can find an overview of all extra parameters and their default value.

| Option (JSON) | Option (Go) | Meaning | Default value |
| ------------- | ----------- | ------- | ------------- |
| `"validity"` | `ResultJwtValidity`  | Validity of session result JWT in seconds (to determine JWT expiration time `exp`)  | 120 seconds |
| `"timeout"` | `ClientTimeout` | Wait this many seconds for the Yivi app to connect before the session times out | 300 seconds (5 minutes) |
| `"callbackUrl"` | `CallbackUrl` | URL to post session result to | `""` (no callback is performed) |
| `"nextSession"` | `NextSession` | Continue with a follow-up IRMA session when this session succeeds. The session result is posted to `URL`, and as response on the `POST` a new session request should be returned for the IRMA server to start. More documentation [here](chained-sessions.md). | `nil` (there is no next session) |

More information about session lifetimes and timeouts can be found in the [IRMA server documentation](irma-server.md#session-lifetime).

## JWTs: signed session requests
The IRMA API server or [`irma server`](irma-server.md) can be configured such that it only accepts session requests that have been digitally signed in the form of a [JWT](https://jwt.io). The form of the JWT depends on the [session type](what-is-yivi.md#session-types). An example requesting [IRMATube](https://privacybydesign.foundation/demo/irmaTube) attributes::
```
eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6ImlybWF0dWJlIn0.eyJpYXQiOjE1NjQ2NTczNzUsInN1YiI6InZlcmlmaWNhdGlvbl9yZXF1ZXN0Iiwic3ByZXF1ZXN0Ijp7InJlcXVlc3QiOnsiQGNvbnRleHQiOiJodHRwczovL2lybWEuYXBwL2xkL3JlcXVlc3QvZGlzY2xvc3VyZS92MiIsImRpc2Nsb3NlIjpbW1sicGJkZi5wYmRmLmlybWF0dWJlLnR5cGUiXV0sW1sicGJkZi5wYmRmLmFnZUxpbWl0cy5vdmVyMTIiXSxbInBiZGYuZ2VtZWVudGUucGVyc29uYWxEYXRhLm92ZXIxMiJdXV19fX0.lW9mqjrLkoahDP6Fcw_9mH5hlfl1tq5qp3W3ga0Nrd_j0NXFj-6ngqHVXEV1zhC_OkVH4LN8fMBAgN8nqaFWgEdQvrCuB7-ynuBVjLR-QU272Ym86zLEWYggAkbZ5KY40MpTxU1dgFMucG7fyAESic04OribWOCVxstAMsM28yCxvzkBMCOSjFEe3abcg_N6VvQnLn3LgZP_UrxQmQsh4DK7mBjW04LesLG1vjcliyhDGUb52FHOP_NAsG7G2FvIgojPzALlPrpTMu5p8a95wc5CGR791wybmh0F8kDdwZWAU0W2FjlX5bNPsyXN8AxRVWaRmWoGrGsQhy_sKEf8lg
```
In case of disclosure sessions, the body of the JWT (the part in between the two dots) contains a Base64-encoding of the following:
<!--DOCUSAURUS_CODE_TABS-->
<!--JWT body (JSON)-->
```json
{
  "iat": 1550424847,
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
