---
title: "\"Condiscon\" session requests"
---

<style>
img.ss {
  padding: 0.3em 0;
  max-width: 15em;
  margin-left: unset;
  margin-right: unset;
}
</style>

This page introduces *condiscon*: a new IRMA feature allowing IRMA [verifiers and signature requestors](overview.md#participants) to express the attributes they need with much more flexibility, using a new format for the [session request](session-requests.md) with which sessions are started at the IRMA server. This affects:
- [Requestors](overview.md#participants) using an [`irma server`](irma-server.md) or the [`irmaserver` library](irma-server-lib.md), as they need to convert their session request to the new condiscon format.
- The [`irma` command](irma-cli.md) including [`irma server`](irma-server.md) (`0.3.0` and up supports condiscon).
- The [IRMA app](https://github.com/privacybydesign/irma_mobile) (a condiscon-compatible version will soon be released in the beta channel).

Below we describe the new session format, explaining the new features that it brings, and highlighting differences with the old session format. The documentation of the updated session request format can be found [here](session-requests.md).

## New session request format

An [IRMA disclosure session](what-is-irma.md#session-types) is started by a verifier submitting a [*session request*](session-requests.md) to an IRMA server, listing the attributes that it requires, offering the user a choice between multiple options for some or all of these attributes. That is, IRMA supports requesting the user for a [*conjunction*](https://en.wikipedia.org/wiki/Logical_conjunction) of [*disjunctions*](https://en.wikipedia.org/wiki/Logical_disjunction) of attributes. In the (new) IRMA app, this looks as follows.

<!--DOCUSAURUS_CODE_TABS-->
<!--IRMA app-->
<img src="/docs/assets/pre-condiscon.png" class="ss"/>
<!--Session request (old format, JSON)-->
```json
{
  "type": "disclosing",
  "content": [{
    "label": "Address",
    "attributes": [
      "irma-demo.nijmegen.address.street",
      "irma-demo.idin.idin.address"
    ]
  },
  {
    "label": "City",
    "attributes": [
      "irma-demo.nijmegen.address.city",
      "irma-demo.idin.idin.city"
    ]
  }]
}
```
<!--END_DOCUSAURUS_CODE_TABS-->

"Condiscon", standing for conjunction of disjunctions *of conjunctions* of attributes adds one extra level to this in the session request format: now verifiers can request multiple attribute *sets* from the user, offering the user multiple choices for some or all of the sets:

<!--DOCUSAURUS_CODE_TABS-->
<!--IRMA app-->
<img src="/docs/assets/condiscon.png" class="ss"/>
<!--Session request (condiscon, JSON)-->
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
<!--Session request (condiscon, Go)-->
```golang
request := irma.NewDisclosureRequest()
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
<!--END_DOCUSAURUS_CODE_TABS-->

In this disclosure request, the user is asked for her (demo) BSN, and for her `street`, `houseNumber` and `city` attribute from the `irma-demo.nijmegen.address` credential type. For the latter three the user has one other option which is not currently shown in the screenshot (but it is present in the session request).

In the session request above (see the second tab) we call the three JSON lists that contain strings *inner conjunctions* (distinguishing them from the *outer conjunctions*, that contain not attribute but disjunctions). Asking for multiple attributes within such an inner conjunctions of a session request is subject to the following rules:

- When attributes coming from multiple credential types occur in an inner conjunction, at most one of them may be a non-[singleton](overview.md#singletons).
- If some of the attributes occuring in the inner conjunction come from the same credential type, then the attributes that the user sends must come from the same credential instance: it is not allowed to mix attributes coming from distinct instances of that credential type. (The IRMA app automatically only offers candidate sets as choices to the user that satisfy this property.)

For example, consider the following condiscon session request:
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

When combining multiple credential types within a disjunction these restrictions ensure that when the IRMA app computes candidate attribute sets for the user to choose from, the amount of resulting options stays manageable. In adddition, the second restriction is a new feature on its own, allowing verifiers to request multiple attributes coming from one credential instance.

## Other features

As before, the verifier can indicate in the session request that it requires specific values for one or more of the requested attributes. In addition, the new condiscon versions of the IRMA app and server include the following new features.

- **Optional disjunctions**: Now that inner conjunctions can be of any length (instead of just 1 as it previously was), verifiers can mark a disjunction as *optional* by specifying an empty inner conjunction `[]` as one of its candidates, indicating that by disclosing nothing this disjunction is satisfied:
  <!--DOCUSAURUS_CODE_TABS-->
  <!--Session request (JSON)-->
  ```json
  {
    "@context": "https://irma.app/ld/request/disclosure/v2",
    "disclose": [
      [
        [],
        [ "pbdf.pbdf.diploma.degree" ]
      ]
    ]
  }
  ```
  <!--Session request (Go)-->
  ```golang
  request := irma.NewDisclosureRequest()
  request.Disclose = irma.AttributeConDisCon{
    irma.AttributeDisCon{
      irma.AttributeCon{},
      irma.AttributeCon{irma.NewAttributeRequest("pbdf.pbdf.diploma.degree")},
    },
  }
  ```
<!--END_DOCUSAURUS_CODE_TABS-->
  This can be useful when certain attributes would be useful but not required, so that their absence does not abort the IRMA session.

- **Null attributes**: Attributes that were skipped by the issuer during issuance, assigning them the `null` value, can now be requested and disclosed normally. The verifier receives the JSON value `null` instead of a (string) attribute value. (Previously such null attributes would have caused the IRMA app to abort the session, considering them "absent" and thus the request unsatisfiable. This made it impractical to request an optional attribute along with other attributes.)
- **Disjunction labels** are now optional. They often only repeated the requested credential or attribute names (mainly because they were required); this is now discouraged. Instead, labels should only be used to explain something to the user that would otherwise not be obvious (e.g, to request the user to send a work email address instead of a personal one).

For full details, see the documentation of the [session request format](session-requests.md).

## Compatibility

The `irma server` of version `0.3.0` and up is:
- Backwards compatible with the old session request format, i.e. with old IRMA requestor applications. New session request JSON objects are recognized as such by the presence of their `@context` property; if this is absent the request is interpreted as a pre-condiscon IRMA session request.
- Backwards compatible with old IRMA apps, as long as the condiscon feature is not used in the session (i.e., all inner conjunctions contain exactly 1 attribute).

The new IRMA app is backwards compatible with the old session request format, i.e. with old `irma server`s, *except* in case of signature sessions (see below). The documentation of the pre-condiscon session format can be found [here](/docs/session-requests).

## Signature sessions

For attribute-based signatures, the condiscon version of the IRMA software brings another update that fixes the [following issue](https://github.com/privacybydesign/irmago/issues/35): if the scheme manager adds a new attribute to an existing credential type, then attribute-based signatures using attributes from that credential type that were created before the attribute was added would fail to verify by the IRMA server, due to the signature not incorporating the new attribute. In effect, adding a new attribute to an existing credential type would invalidate all attribute-based signatures previously made that contain attributes from that credential.

This is fixed in the condiscon versions of IRMA by committing to the attribute structure (i.e. disclosed vs. non-disclosed attributes) during generation and verification of the attribute-based signature in a new way, that is automatically compatible with future attribute additions to the credential type.

Previously generated IRMA attribute-based signatures remain valid (as long as no new attributes are added to their credential types). However, the new IRMA app always uses the fixed signature generation algorithm which the pre-condiscon version of the IRMA server does not support. For that reasons, if you use attribute-based signatures your IRMA server(s) will need to be updated before the new IRMA app is released (probably some weeks from now).

