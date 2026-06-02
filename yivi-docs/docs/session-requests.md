---
title: Session requests
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Each [IRMA server](technical-overview.md#irma-servers) exposes APIs for creating IRMA sessions with a session request. An *IRMA session request* contains all information required for the IRMA server and [Yivi app](yivi-app.md) to perform an IRMA session with, such as the attributes to be issued or verified. This page documents IRMA session requests. It applies to:

* The [`POST /session`](api-irma-server.md#post-session) endpoint from [`irma server`](irma-server.md).
* The [`StartSession()` function](https://godoc.org/github.com/privacybydesign/irmago/server/irmaserver#StartSession) in the `irmaserver` Go library.
* The [`session.start` attribute](https://github.com/privacybydesign/yivi-frontend-packages/blob/master/plugins/yivi-client/README.md#session) of [`Yivi client`](/yivi-frontend#available-plugins-for-yivi-core).

For the precise role of session requests in an IRMA session, see the [IRMA session flow](#irma-session-flow) below.

## Session types

In an IRMA session, the [Yivi mobile app](yivi-app.md) performs one of the following three *session types* with an [*IRMA server*](technical-overview.md#irma-servers):

* *Disclosure sessions*: Upon receiving a list of requested attributes from the IRMA server, the app discloses the required attributes to the IRMA server if the app user agrees, after which they are verified by the IRMA server.
* *Attribute-based signature sessions*: Similar to disclosure sessions, but the attributes are attached to a message digitally signed into an [*attribute-based signature*](technical-overview.md#attribute-based-signatures). The attribute-based signature can be verified at any later time, ensuring that the signed message is intact, and that the IRMA attributes attached to it were valid at the time of creation of the attribute-based signature.
* *Issuance sessions*: the Yivi app receives a new set of IRMA attributes including valid issuer signatures from the IRMA server, to use in later disclosure or attribute-based signature sessions. (Possibly the user is asked to disclose some attributes as well, within the same IRMA session, before receiving the new attributes. This is called a *combined issuance-disclosure session*.)

This process is depicted schematically and explained in more detail in the [IRMA session flow](#irma-session-flow) section below. For the user, after scanning the QR in his/her Yivi app a disclosure session generally looks like the following. (Attribute-based signature sessions and issuance sessions are identical in terms of their flow (scan qr, provide permission, success screen); only the graphical interface is different.)

<div className="center" style={{ margin: '3em 0' }}>
  <img 
    src="/img/disclose-permission.png" 
    style={{ width: '30%', marginRight: '3em' }} 
    alt="disclose-permission" 
  />
  <img 
    src="/img/disclose-done.png"
    style={{ width: '30%' }} 
    alt="disclosure-done" 
  />
</div>

## IRMA session flow

A typical IRMA session is depicted schematically below.

![IRMA session flow](/img/irmaflow.png)

Software components:
* *Requestor backend and frontend*: Generally the requestor runs a website with a (JavaScript) frontend in the user's browser, and a backend server. During an IRMA session the frontend displays the IRMA QR that the [Yivi app](yivi-app.md) scans. All frontend tasks depicted in the diagram are supported by [`yivi-frontend`](yivi-frontend.md).
* [*IRMA server*](technical-overview.md#irma-servers): Handles [IRMA protocol](irma-protocol.md) with the Yivi app for the requestor.
* [*Yivi mobile app*](yivi-app.md): [Android](https://play.google.com/store/apps/details?id=org.irmacard.cardemu), [iOS](https://itunes.apple.com/nl/app/irma-authentication/id1294092994).

Explanation of the steps:

1. Usually the session starts by the user performing some action on the website (e.g. clicking on "Log in with IRMA").
1. The requestor sends its session request (containing the attributes to be disclosed or issued, or message to be signed) to the [IRMA server](technical-overview.md#irma-servers). Depending on its configuration, the IRMA server accepts the session request only if the session request is authentic (e.g. a validly signed [session request JWT](#jwts-signed-session-requests)) from an authorized requestor.
1. The IRMA server accepts the request and assigns a session token (a random string) to it. It returns the contents of the QR code that the frontend must display: the URL to itself and the session token.
1. The frontend ([`yivi-frontend`](yivi-frontend.md)) receives and displays the QR code, which is scanned by the Yivi app.
1. The Yivi app requests the session request from step 1, receiving the attributes to be disclosed or issued, or message to be signed.
1. The IRMA server returns the session request.
1. The Yivi app displays the attributes to be disclosed or issued, or message to be signed, and asks the user if she wants to proceed.
1. The user accepts.
1. The IRMA server performs the IRMA protocol with the Yivi app, issuing new attributes to the user, or receiving and verifying attributes from the user's Yivi app, or receiving and verifying an attribute-based signature made by the user's app.
1. The session status (`DONE`, `CANCELLED`, `TIMEOUT`), along with disclosed and verified attributes or signature depending on the session type, are returned to the requestor.

Additional notes: 

* Which of these tasks are performed by the requestor's backend and which by its frontend differs case by case:
  - Often the session request is sent to the IRMA server by the requestor's backend, after which the IRMA server's reply in step 2 is forwarded to the frontend which renders it as a QR code. Step 1 can however also be done by `yivi-frontend`, in which case `yivi-frontend` automatically picks up the IRMA server's reply in step 2 and renders the QR code.
  - Similarly, `yivi-frontend` can be instructed to fetch the session result in step 10, but this can also be done in the backend. In the latter, `yivi-frontend` can fetch a custom result at your backend, if desired.
* The IRMA server could be deployed on the same machine as the requestor's backend, but it need not be; possibly it is not even controlled by the requestor. Generally, steps 2/3 and 10 are done with REST HTTP calls to the IRMA server, but in case the [`irmaserver`](irma-server-lib.md) library is used, these steps are function calls. Alternatively, you could use one of the packages in [`irma-backend-packages`](irma-backend.md) to do these steps with function calls in other programming languages.

## Session request data types

For each of the [three IRMA session types](#session-types), we define a *session request* data type: an object whose JSON representation contains at least a [JSON-LD `@context`](https://w3c.github.io/json-ld-syntax/#the-context) key identifying which message type it is, and extra keys specific to the session type. The following three `@context` values identify disclosure, attribute-based signature, and issuance session requests respectively:

* `"@context": "https://irma.app/ld/request/disclosure/v2"`
* `"@context": "https://irma.app/ld/request/signature/v2"`
* `"@context": "https://irma.app/ld/request/issuance/v2"`

(For now these URIs do not resolve to anything; they just distinguish the message type.)

## Disclosure requests
Disclosure sessions are started with an [`irma.DisclosureRequest`](https://godoc.org/github.com/privacybydesign/irmago#DisclosureRequest). Example:

<Tabs>
  <TabItem value="json" label="Session request (JSON)" default>
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
  </TabItem>
  <TabItem value="go" label="Session request (Go)">
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
  </TabItem>
  <TabItem value="yivi" label="Yivi App">
    <img src="/img/condiscon.png" class="ss" alt="condiscon" />
  </TabItem>
</Tabs>

This asks for a (demo) `BSN` attribute, as well as either `street`, `houseNumber` and `city` from `irma-demo.nijmegen.address`, or `address` and `city` from `irma-demo.idin.idin`. The three levels correspond to a *conjunction* of *disjunctions* of *conjunctions* of requested attributes, allowing verifiers to request multiple attribute sets from the user, offering choices for some or all of these sets.

All of the attribute types (i.e., the string values) contained in the request must exist in their scheme ([`irma-demo`](https://github.com/privacybydesign/irma-demo-schememanager) in the example above). For the `irma-demo` and `pbdf` schemes, an index of existing attribute types that can be requested can be found [here](https://portal.yivi.app/attribute-index).

> Attributes can be disclosed to the requestor in any of the three session types: in issuance sessions issuance proceeds only if the user discloses the required attributes just before issuance, and in attribute-based signature sessions the requested attributes are attached to the resulting attribute-based signature. Thus the `disclose` and `labels` fields introduced above can also occur in issuance or attribute-based signature session requests (see below).

### Multiple credential types within inner conjunctions
In the request above we call the three JSON lists that contain strings *inner conjunctions* (distinguishing them from the *outer conjunctions*, that contain not attribute but disjunctions). Asking for multiple attributes within such an inner conjunctions of a session request is subject to the following rules:

- When attributes coming from multiple credential types occur in an inner conjunction, at most one of them may be a non-[singleton](technical-overview.md#singletons).
- If some of the attributes occuring in the inner conjunction come from the same credential type, then the attributes that the user sends must come from the same credential instance: it is not allowed to mix attributes coming from distinct instances of that credential type. (The Yivi app automatically only offers candidate sets as choices to the user that satisfy this property.)

For example, consider the following session request:

<Tabs>
  <TabItem value="json" label="Session request (JSON)" default>
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
  </TabItem>
  <TabItem value="go" label="Session request (Go)">
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
  </TabItem>
</Tabs>

Supposing that the user has two instances of `pbdf.pbdf.diploma` whose `degree` and `institute` attributes are `(degree 1, institute 1)` and `(degree 2, institute 2)`, this means that the user can choose only either `(degree 1, institute 1)` or `(degree 2, institute 2)`, and not `(degree 1, institute 2)` or `(degree 2, institute 1)`. (If desired it would be possible to give the user those options by asking for the two attributes in two *outer* conjunctions instead of within an *inner* conjunction.)

When combining multiple credential types within a disjunction these restrictions ensure that when the Yivi app computes candidate attribute sets for the user to choose from, the amount of resulting options stays manageable. In adddition, the second restriction is a feature on its own, allowing verifiers to request multiple attributes coming from one credential instance.

### Requesting specific attribute values
Within inner conjunctions, specific attribute values can be requested by replacing the string with an object like the following:

<Tabs>
  <TabItem value="json" label="Session request (JSON)">
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
  </TabItem>
  <TabItem value="go" label="Session request (Go)">
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
  </TabItem>
</Tabs>

This would only be satisfied by a `degree` attribute whose value is `PhD`, together with any `institute` attribute. (Note that the object and string syntaxes can be mixed within an inner conjunction, i.e. it would be permissible in the JSON example above to replace the second object with just `"pbdf.pbdf.diploma.institute"`.)

### Null attributes

Whenever an attribute is marked with `optional` in the scheme ([example](https://github.com/privacybydesign/irma-demo-schememanager/blob/482ba298ee038ea43bd0cf8017567a844be0919e/MijnOverheid/Issues/fullName/description.xml#L54)), the issuer may skip it when it issues an instance of the containing credential type, assigning a `null` value to it (which is distinct from the empty string `""`). When disclosing the attribute, the verifier receives `null` instead of a string containing the attribute value.

If a non-null attribute is required this can be requested using `notNull` as follows:

<Tabs>
  <TabItem value="json" label="Session request (JSON)">
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
  </TabItem>
  <TabItem value="go" label="Session request (Go)">
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
  ````
  </TabItem>
</Tabs>

The default value of `notNull` is `false`.

### Optional disjunctions

A disjunction within a session request can be marked as *optional*, by including an empty inner conjunction in it:

<Tabs>
  <TabItem value="json" label="Session request (JSON)">
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
  </TabItem>
  <TabItem value="go" label="Session request (Go)">
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
  </TabItem>
  <TabItem value="app" label="Yivi App">
<img src="/img/optional-disjunction.png" class="ss" alt="optional-disjunction" />
  </TabItem>
</Tabs>

This can be useful when certain attributes are not required, so that if the user does not have them the session does not need to be aborted.

### Skip expiry check
You can allow users to disclose expired instances of credentials. This is useful for [combined issuance-disclosure sessions](#issuance-requests) and [chained sessions](#chained-sessions) if you only want to ensure that the user is still using the same device, and therefore the same [secret key](zkp.md), as during a previous issuance session.

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

<Tabs>
  <TabItem value="json" label="Session request (JSON)">
```json
{
  "@context": "https://irma.app/ld/request/signature/v2",
  "message": "Message to be signed by user",
  "disclose": ...,
  "labels": ...
}
```
  </TabItem>
  <TabItem value="go" label="Session request (Go)">
```go
request := irma.NewSignatureRequest("Message to be signed by user")
request.Disclose = irma.AttributeConDisCon{ /* request attributes to attach to ABS */ }
request.Labels = map[int]irma.TranslatedString{}
```
  </TabItem>
</Tabs>

The `message` field is required. The attributes to be attached to the attribute-based signature are requested with the `disclose` field, which along with the `labels` field work exactly like in disclosure sessions.

## Issuance requests
Issuance sessions are started with an [`irma.IssuanceRequest`](https://godoc.org/github.com/privacybydesign/irmago#IssuanceRequest). Example:

<Tabs>
  <TabItem value="json" label="Session request (JSON)">
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
  </TabItem>
  <TabItem value="go" label="Session request (Go)">
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
  </TabItem>
</Tabs>

Per credential in the `credentials` array the `validity` is optional; if skipped it is assigned the default value of 6 months. If present, the validity is always rounded down to the [nearest epoch boundary](technical-overview.md#special-attributes), which is one week (60 * 60 * 24 * 7  = 604800 seconds).

Attributes marked as `optional` in the containing credential type ([example](https://github.com/privacybydesign/irma-demo-schememanager/blob/482ba298ee038ea43bd0cf8017567a844be0919e/MijnOverheid/Issues/fullName/description.xml#L54)) may be skipped in the `attributes` map. This issues [the `null` value](#null-attributes) to these attributes.

`disclose` and `labels` are optional, allowing for *combined disclosure-issuance sessions*, in which the user is required to disclose attributes before the IRMA server will issue the credentials.

The `clientReturnUrl` option can also be used, both for issuance only and combined disclosure-issuance sessions. Usage is similar as in [disclosure sessions](#client-return-url).

## Client return URL
If the user performs a mobile session, i.e. on the same device as where the Yivi app is installed on, then after the session has completed the user will be redirect to the `clientReturnUrl` specified in the session request, if present.

<Tabs>
  <TabItem value="json" label="Session request (JSON)">
```json
{
  "@context": "https://irma.app/ld/request/disclosure/v2",
  "disclose": [
    ...
  ],
  "clientReturnUrl": "https://example.com"
}
```
  </TabItem>
  <TabItem value="go" label="Session request (Go)">
```go
request := irma.NewDisclosureRequest()
request.ClientReturnURL = "https://example.com"
```
  </TabItem>
</Tabs>

The example shows a disclosure request but `clientReturnUrl` can be set on session requests of any type. If set, when the user finishes a session (either successfully or unsuccessfully), she is redirected to the location specified by `clientReturnUrl`.

If *not* set:
* On Android the Yivi app automatically toggles back to the previous app;
* On iOS it is not possible to toggle back to the previous app due to restrictions by Apple, so the Yivi app stays open. In the top left corner of the screen, however, a button appears that leads back to the previous app.

This URL does not necessarily have to be a web URL; it can also be a universal link to another app. Universal links work both on Android and iOS. It is also possible to use iOS or Android scheme URLs. (Note however that iOS and Android scheme URLs differ from one another, so when starting a session with a scheme URL as return URL you should therefore determine on which platform the user's app is running.)

On iOS, toggling back to the calling app or website after the session can be simulated by navigating towards the calling app using a `clientReturnUrl`, either a normal URL or universal link. This works on Android as well, so currently this is the only platform-independent way of ensuring that the used ends up at a specified place after the session. If the URL opens a website, however, then the user is navigated towards a new browser tab instead of back to an existing browser tab, so in website-IRMA-website flows you will need to reload your webapp and state in the newly opened tab.

### Augmenting the client return URL

It is possible to have the IRMA server augment the `clientReturnUrl` with the server token of a session (i.e., the `token` in the [response of the `/session` endpoint](api-irma-server.md#post-session)). This token is then appended as a query parameter with name `token` to the `clientReturnUrl`. Using this token, one can the retrieve the [session result](api-irma-server.md#get-sessionrequestortokenresult).

To enable this, both the server configuration flag `augment-client-return-url` needs to be enabled, as well as the `augmentReturnUrl` session request parameter needs to be true.

<Tabs>
  <TabItem value="json" label="Session request (JSON)">
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
  </TabItem>
  <TabItem value="go" label="Session request (Go)">
```go
request := irma.NewDisclosureRequest()
request.ClientReturnURL = "https://example.com"
request.AugmentReturnURL = true
```
  </TabItem>
</Tabs>

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

<Tabs>
  <TabItem value="json" label="Session request (JSON)">
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
  </TabItem>
  <TabItem value="go" label="Session request (Go)">
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
  </TabItem>
</Tabs>

Below you can find an overview of all extra parameters and their default value.

| Option (JSON) | Option (Go) | Meaning | Default value |
| ------------- | ----------- | ------- | ------------- |
| `"validity"` | `ResultJwtValidity`  | Validity of session result JWT in seconds (to determine JWT expiration time `exp`)  | 120 seconds |
| `"timeout"` | `ClientTimeout` | Wait this many seconds for the Yivi app to connect before the session times out | 300 seconds (5 minutes) |
| `"callbackUrl"` | `CallbackUrl` | URL to post session result to | `""` (no callback is performed) |
| `"nextSession"` | `NextSession` | Continue with a follow-up IRMA session when this session succeeds. The session result is posted to `URL`, and as response on the `POST` a new session request should be returned for the IRMA server to start. See [Chained sessions](#chained-sessions) below. | `nil` (there is no next session) |

More information about session lifetimes and timeouts can be found in the [IRMA server documentation](irma-server.md#session-lifetime).

## Chained sessions

Multiple IRMA sessions may be chained together by the requestor into a single flow. After the Yivi app user has started the first session (for example, by scanning a QR code), she then passes through multiple session screens, as shown here. In this example, the requestor uses a disclosure session to retrieve the user's name and then immediately afterwards issues that into a new credential.

<div className="center" style={{ textAlign: "center", marginBottom: "1em" }}>
  <img
    src="/img/chain-disclosure.png"
    style={{ width: "35%" }}
    alt="disclosure-flow"
  />
  <img
    src="/img/chain-issuance.png"
    style={{ width: "35%", marginRight: "3em" }}
    alt="issuance-flow"
  />
</div>

The IRMA server enables this by sending the session results of the intermediate sessions in the chain to a server chosen by the requestor, which can process the session results and respond with a session request for the next session in the chain.

Attributes disclosed in earlier sessions in a session chain can also be used to lookup data to be issued in a new credential, later in the session chain. More generally, within a session chain later sessions may depend on the results of the earlier sessions. With ordinary (that is, non-chained) IRMA sessions, the only possible way to achieve this is to send the user to a webpage between each session to start the next session.

### The `nextSession` URL

An [extended session request](#extra-parameters) may contain a `nextSession` object which must contain a `url` field. If so, then at the end of the session (i.e., after the user has agreed to perform the session in the session screen of the Yivi app), the IRMA server will POST the [session result](https://pkg.go.dev/github.com/privacybydesign/irmago/server#SessionResult) in JSON (as returned by the [`/result` endpoint](api-irma-server.md#get-sessionrequestortokenresult)) to that `url`. The server at that `url` must then respond with one of the following:

* a new (extended) session request in JSON, which may depend on the received session result;
* HTTP 204, signifying that there is no next session to be performed. In this case, no further sessions take place and the flow stops normally.

In the first case, the IRMA server will then start a new session using that session request and pass it to the Yivi app, which will show the corresponding session screen. Thus, the app user moves from the first session screen immediately to the next one.

The session request returned by the server at the `nextSession` URL may itself contain a `nextSession` object (possibly but not necessarily referring to the same server). If so, then yet another session will be started using the same mechanism, after the one specified by the current session request. In this fashion, a session chain can consist of any number of sessions (although ideally it is kept as short as possible for optimal UX; in most cases two sessions will suffice).

### Signing POSTed session results

If a [JWT private key is installed in the IRMA server](irma-server.md#signed-jwt-session-results), then instead of POSTing plain JSON session results (as returned by the [`/result` endpoint](api-irma-server.md#get-sessionrequestortokenresult)) to the `nextSession` URL, the server will POST a session result JWT signed with the private key (as returned by the [`/result-jwt` endpoint](api-irma-server.md#get-sessionrequestortokenresult-jwt)) to the `nextSession` URL. The server at that URL can verify the JWT using the corresponding public key to authenticate the request as coming from the expected IRMA server.

If a JWT private key is not installed, then the boolean `--allow-unsigned-callbacks` option must be passed to the IRMA server before chained sessions may be used, to explicitly enable POSTing unsigned session results. Otherwise, the server will reject session requests containing a `nextSession` object.

> If no JWT private key is installed, then the `nextSession` URL should either not be publically reachable, or it should include a secret token (e.g. `https://example.com/cX5aTins5kEZpjDpfYcN`) and have TLS enabled (which it should anyway as personal data will be POSTed to it). Otherwise there is no way for the server at the `nextSession` URL to distinguish POSTs from your IRMA server from POSTs made by anyone else.

### Use cases

* Retrieving an attribute and then issuing it into a new credential.
* Retrieving an attribute; use that to lookup related data; and issue that data into new credentials.
* Refreshing a nearly expired credential, by retrieving an identifying attribute from it; use that to lookup fresh values for the other attributes, and issue a fresh credential.

### Example

In this example, we use an IRMA disclosure request to retrieve the user's name, and then issue that into a new credential, as shown in the two screenshots above. A live demo very similar to this may be found [here](https://demos.yivi.app/demos/irmaTubePremium/index.en.html).

First, we deploy the following Go program at `https://example.com`. This program unmarshals the request body into a session result, takes the disclosed attribute from it, and returns an issuance request containing that attribute.

Note that this program assumes that no JWT private key is installed; see the remark in the previous paragraph.

<details>
<summary>Full Go program (click to expand)</summary>

```go
package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"

	irma "github.com/privacybydesign/irmago"
	"github.com/privacybydesign/irmago/server"
)

func main() {
	log.Fatal(http.ListenAndServe(":80", http.HandlerFunc(handler)))
}

func handler(w http.ResponseWriter, r *http.Request) {
	// Read and unmarshal the POSTed session result
	bts, err := ioutil.ReadAll(r.Body)
	if err != nil {
		writeError(w, err.Error())
		return
	}
	var result server.SessionResult
	if err := json.Unmarshal(bts, &result); err != nil {
		writeError(w, err.Error())
		return
	}

	// Perform sanity checks on the session result.
	// NB: this endpoint is called by the IRMA server just before it ends the
	// session, so the session status is expected to be server.StatusConnected
	// (or the JSON string "CONNECTED").
	if result.Status != server.StatusConnected ||
		result.ProofStatus != irma.ProofStatusValid ||
		len(result.Disclosed) == 0 || len(result.Disclosed[0]) == 0 ||
		result.Disclosed[0][0].Identifier.String() != "irma-demo.gemeente.personalData.fullname" ||
		result.Disclosed[0][0].RawValue == nil {
		writeError(w, "received invalid session result")
		return
	}

	// Construct issuance request to respond with,
	// containing the attribute from the session result
	issuanceRequest := irma.NewIssuanceRequest([]*irma.CredentialRequest{{
		CredentialTypeID: irma.NewCredentialTypeIdentifier("irma-demo.IRMATube.member"),
		Attributes: map[string]string{
			"fullname": *result.Disclosed[0][0].RawValue,
			"type":     "premium",
			"id":       "123456",
		}}},
	)

	// Marshal and write our issuance request
	bts, err = json.Marshal(issuanceRequest)
	if err != nil {
		writeError(w, err.Error())
		return
	}
	w.Header().Set("Content-Type", "application/json")
	if _, err = w.Write(bts); err != nil {
		fmt.Println(err.Error())
	}
}

func writeError(w http.ResponseWriter, msg string) {
	w.WriteHeader(500)
	w.Write([]byte(msg))
}
```

</details>

The session chain can then be started by sending the following session request to our IRMA server.

<Tabs>
  <TabItem value="json" label="Extended session request (JSON)" default>
  	```jsonc
		{
		"nextSession": {
			"url": "https://example.com"
		},
		"request": {
			"@context": "https://irma.app/ld/request/disclosure/v2",
			"disclose": [[[ "irma-demo.gemeente.personalData.fullname" ]]]
		}
	}
	```
  </TabItem>
  <TabItem value="go" label="Extended session request (Go)">
    ```go
	irma.ServiceProviderRequest{
		RequestorBaseRequest: irma.RequestorBaseRequest{
			NextSession: &irma.NextSessionData{
				URL: "https://example.com",
			},
		},
		Request: irma.NewDisclosureRequest(
			irma.NewAttributeTypeIdentifier("irma-demo.gemeente.personalData.fullname"),
		),
	}
	```
  </TabItem>
</Tabs>

After the user discloses the `irma-demo.gemeente.personalData.fullname` attribute, the IRMA server POSTs it to `https://example.com`. Our Go server responds to the IRMA server with the `issuanceRequest` found near the end of the program. Next, the IRMA server immediately starts this issuance session with the user's Yivi app, resulting in the screenshots shown above.

### Differences with combined issuance-disclosure requests

[Combined issuance-disclosure requests](#issuance-requests), i.e. issuance requests with a nonempty `disclose` field requesting attributes to be disclosed, is another way of first requesting and then issuing attributes from/to an Yivi app user within a single flow. Thus, this is very similar to a session chain consisting of first a disclosure request and then an issuance request. However, contrary to session chains, this flow is started using a single session request. Thus, when using combined issuance-disclosure requests it is impossible for the issued attributes to depend on the disclosed attributes, because at the time the session request is composed the value of the disclosed attributes are not yet known.

Comparing the two, chained sessions are more powerful in the following ways:

* As mentioned, sessions later in the chain may depend on the session results of earlier sessions in the chain;
* Session chains can consist of more than two sessions (although this may lead to bad UX);
* The sessions occuring in a session chain may be of any type (although first disclosure and then issuance is probably the most common scenario).

## JWTs: signed session requests
The IRMA API server or [`irma server`](irma-server.md) can be configured to only accept session requests that have been digitally signed using a signed JWT, according to the [JWT (RFC 7519)](https://datatracker.ietf.org/doc/html/rfc7519) and [JWS (RFC 7515)](https://datatracker.ietf.org/doc/html/rfc7515) standards. These signed session requests are JWS objects (signed JWTs) that encapsulate the session request data. Set the HTTP `Content-Type` header to `text/plain` when sending a signed session request.

An example requesting [YiviTube](https://yivitube.yivi.app/) attributes:

```
eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6ImlybWF0dWJlIn0.eyJpYXQiOjE1NjQ2NTczNzUsInN1YiI6InZlcmlmaWNhdGlvbl9yZXF1ZXN0Iiwic3ByZXF1ZXN0Ijp7InJlcXVlc3QiOnsiQGNvbnRleHQiOiJodHRwczovL2lybWEuYXBwL2xkL3JlcXVlc3QvZGlzY2xvc3VyZS92MiIsImRpc2Nsb3NlIjpbW1sicGJkZi5wYmRmLmlybWF0dWJlLnR5cGUiXV0sW1sicGJkZi5wYmRmLmFnZUxpbWl0cy5vdmVyMTIiXSxbInBiZGYuZ2VtZWVudGUucGVyc29uYWxEYXRhLm92ZXIxMiJdXV19fX0.lW9mqjrLkoahDP6Fcw_9mH5hlfl1tq5qp3W3ga0Nrd_j0NXFj-6ngqHVXEV1zhC_OkVH4LN8fMBAgN8nqaFWgEdQvrCuB7-ynuBVjLR-QU272Ym86zLEWYggAkbZ5KY40MpTxU1dgFMucG7fyAESic04OribWOCVxstAMsM28yCxvzkBMCOSjFEe3abcg_N6VvQnLn3LgZP_UrxQmQsh4DK7mBjW04LesLG1vjcliyhDGUb52FHOP_NAsG7G2FvIgojPzALlPrpTMu5p8a95wc5CGR791wybmh0F8kDdwZWAU0W2FjlX5bNPsyXN8AxRVWaRmWoGrGsQhy_sKEf8lg
```

In case of disclosure sessions, the body of the JWT (the part in between the two dots) contains a Base64-encoding of the following:

<Tabs>
  <TabItem value="json" label="JWT body (JSON)">
  ```json
  {
    "iat": 1550424847,
    "sub": "verification_request",
    "sprequest": ...
  }
  ```
  </TabItem>
  <TabItem value="go" label="JWT body (Go)">
  ```go
  // Sets iat, iss, and sub fields.
  // See also corresponding functions irma.NewSignatureRequestorJwt()
  // and irma.NewIdentityProviderJwt().
  // Obtain signed JWT string to POST to an irma server using Sign() method.
  irma.NewServiceProviderJwt("IRMATube", irma.NewDisclosureRequest())
  ```
  </TabItem>
</Tabs>

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
