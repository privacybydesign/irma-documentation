---
title: OpenID4VP Verifier Integration
---

This guide walks through integrating a frontend with a Yivi-compatible OpenID4VP verifier backend. The code samples are distilled from the [openid4vp-demo-frontend](https://github.com/privacybydesign/openid4vp-demo-frontend) reference implementation, which is the simplest end-to-end example we maintain.

If you have not yet read it, start with the [OpenID4VP Introduction](openid4vp-introduction.md) and the protocol details on [Disclosing SD-JWT VCs over OpenID4VP](openid4vp-disclosure.md).

## Architecture

A typical OpenID4VP verifier integration involves three components:

- **Frontend** — runs in the user's browser. Builds the DCQL query, asks the backend to start a session, renders the wallet QR code, polls for the result, and shows disclosed claims to the user.
- **Verifier backend** — your own server that holds the X.509 verifier certificate and signs authorization requests. The demo uses an [EUDI reference verifier](https://github.com/eu-digital-identity-wallet/eudi-srv-verifier-endpoint) deployment exposing `/ui/presentations`.
- **Yivi app** — the wallet. Scans the QR code, fetches the authorization request, verifies the verifier certificate against the [Yivi Trust List](trusted-verifier.md), and posts the `vp_token` back.

```
┌──────────┐   1. start session   ┌──────────────┐
│ Frontend │ ───────────────────▶ │  Verifier    │
│ (browser)│ ◀─────────────────── │  backend     │
└──────────┘    request_uri,      └──────────────┘
      │         transaction_id           ▲
      │ 2. show QR                       │ 4. POST vp_token
      ▼                                  │
┌──────────┐                             │
│ Yivi app │ ─── 3. fetch request, ──────┘
└──────────┘     user consents
      │
      │ 5. frontend polls until vp_token arrives
      ▼
   disclosed claims rendered
```

## Supported credential formats

The Yivi app answers DCQL credential queries in these formats:

| `format` | Credential | Selected by | Since |
| --- | --- | --- | --- |
| `dc+sd-jwt` | IETF SD-JWT VC | `meta.vct_values` | Yivi app 7.10.0 |
| `mso_mdoc` | ISO/IEC 18013-5 mdoc | `meta.doctype_value` | Yivi app 8.3.0 (irmago v1.4.0) |
| `vc+sd-jwt` | SD-JWT-secured W3C VCDM 2.0 credential | `meta.type_values` (fully expanded types) | Yivi app 8.4.0 (irmago v1.5.0) |

Each format answers only its own queries: an SD-JWT VC is never offered for a `vc+sd-jwt` query, nor a VCDM credential for a `dc+sd-jwt` one.

## Building a DCQL request

A DCQL query describes the credentials and claims the verifier wants. The example below asks for an email and domain claim from the `pbdf.sidn-pbdf.email` SD-JWT VC:

```ts
const dcqlQuery = {
  credentials: [
    {
      id: "email",
      format: "dc+sd-jwt",
      meta: { vct_values: ["pbdf.sidn-pbdf.email"] },
      claims: [
        { path: ["email"] },
        { path: ["domain"] },
      ],
    },
  ],
}
```

An mdoc is selected by its docType, and each claim path is exactly `[namespace, elementIdentifier]`; the wallet refuses any other path shape for `mso_mdoc`. For example, the family and given name from a PID:

```ts
const pidQuery = {
  credentials: [
    {
      id: "pid",
      format: "mso_mdoc",
      meta: { doctype_value: "eu.europa.ec.eudi.pid.1" },
      claims: [
        { path: ["eu.europa.ec.eudi.pid.1", "family_name"] },
        { path: ["eu.europa.ec.eudi.pid.1", "given_name"] },
      ],
    },
  ],
}
```

The full authorization request adds OpenID4VP envelope fields. The Yivi-compatible verifier backend expects the X.509 certificate chain of the issuers it should trust inline as `issuer_chain`:

:::caution Non-standard verifier backend API
The authorization-request shape below (including the `issuer_chain` field, the `/ui/presentations` endpoint, and the polling endpoint further down) is not defined by OpenID4VP. It is specific to the [eudi-srv-verifier-endpoint](https://github.com/eu-digital-identity-wallet/eudi-srv-verifier-endpoint) reference server from the EUDI Wallet project, and the exact request and response shapes additionally depend on the version of that server we currently run. If you deploy a different verifier backend, expect its frontend-facing API to differ.
:::

```ts
const authorizationRequest = {
  dcql_query: dcqlQuery,
  nonce: "nonce",
  jar_mode: "by_reference",
  intended_use_id: "1",
  issuer_chain: ISSUER_CHAIN, // PEM-encoded X.509 chain of the issuers you accept
}
```

Two details depend on the verifier version. From v0.11.0, `eudi-srv-verifier-endpoint` refuses a transaction that names neither an intended use (`intended_use_id`, configured on the server) nor a registration certificate. It also enforces the `request_uri_method` a transaction was started with, so leave it out and let the server's default apply: the Yivi app fetches the request object with a `GET`.

For more DCQL patterns (choices, optional credentials, predefined values), see the [DCQL examples](openid4vp-disclosure.md#dcql-queries) on the disclosure page or the `eudiPresets` array in [`src/verifiers.ts`](https://github.com/privacybydesign/openid4vp-demo-frontend/blob/main/src/verifiers.ts) of the demo frontend.

## Starting the session

POST the authorization request to your verifier backend. It returns the parameters needed to build the wallet link:

```ts
const response = await fetch(`${API_URL}/ui/presentations`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(authorizationRequest),
})

const json = await response.json()
const transactionId = json["transaction_id"]

const params = new URLSearchParams(json)
const walletLink = `openid4vp://?${params}`
```

The Yivi app accepts both the `openid4vp://` and `eudi-openid4vp://` URI schemes. On mobile you can navigate the user directly to `walletLink`; on desktop, render it as a QR code that the Yivi app can scan.

## Universal links (optional)

Any app on the device can claim the `openid4vp://` and `eudi-openid4vp://` schemes, so on a phone with multiple wallets the user sees a chooser sheet — and a hostile app could in principle register the same scheme. To make a session deterministically open in the Yivi app, wrap the standard URI in a `https://open.yivi.app/-/openid4vp` universal link. The OS verifies that host against Yivi's `apple-app-site-association` / `assetlinks.json`, so only Yivi can claim it.

The transform is mechanical: strip the scheme, prepend the universal-link host and path, keep the query string verbatim. No params are added, removed, reordered, or re-encoded.

```
openid4vp://?request_uri=https://verifier.example/req/abc&client_id=verifier.example
    ↓
https://open.yivi.app/-/openid4vp?request_uri=https://verifier.example/req/abc&client_id=verifier.example
```

Both `openid4vp://` and `eudi-openid4vp://` collapse to the same `/-/openid4vp` path. Use `https://open.staging.yivi.app/-/openid4vp` for staging.

The custom schemes remain supported unchanged, so this is opt-in and only matters when you specifically want to bypass the wallet chooser.

## Authorization request forms

The example above passes the request by reference (`request_uri`), which is what most verifier backends do. Since irmago v1.4.0 (Yivi app 8.3.0) the app accepts all three forms OpenID4VP defines:

- **`request_uri`** — the app fetches the signed request object from the verifier.
- **`request`** — the signed request object is passed by value in the link itself.
- **Unsigned parameters in the query string** — only with the `redirect_uri:` client identifier prefix. The app cannot authenticate such a verifier, so it shows it as unverified, without a logo, named by the address the response is sent to. Use a signed request whenever you have a verifier certificate.

Certificate chains in the `x5c` header may include intermediate CA certificates (irmago v1.4.1, Yivi app 8.3.1), as long as the chain leads to a trusted root.

## Polling for the result

Poll the verifier backend's result endpoint until the user completes the flow in the Yivi app:

```ts
// A query is answered with one presentation or with an array of them
// (`multiple: true`, or a credential set that matched more than once).
function presentationsOf(entry: unknown): string[] {
  if (typeof entry === "string") return [entry]
  if (Array.isArray(entry)) return entry.filter((p): p is string => typeof p === "string")
  return []
}

const id = setInterval(async () => {
  const result = await fetch(`${API_URL}/ui/presentations/${transactionId}`)
  if (result.status !== 200) return // still waiting

  clearInterval(id)
  const response = await result.json()
  const vpToken = response["vp_token"] as Record<string, unknown>
  const disclosures = Object.entries(vpToken).map(([queryId, entry]) => ({
    queryId,
    claims: presentationsOf(entry).flatMap(parseSdJwtVc),
  }))
  renderDisclosures(disclosures)
}, 500)
```

`vp_token` is keyed by the `id` of each DCQL credential query. The snippet assumes SD-JWT VC presentations; an `mso_mdoc` query is answered with a base64url-encoded ISO 18013-5 `DeviceResponse` instead, which you decode as CBOR (see `src/mdoc.ts` in the demo frontend). An SD-JWT presentation always contains a `~`, so you can tell the two apart without looking at the request.

A `vc+sd-jwt` query that requires holder binding is answered with a W3C Verifiable Presentation (`typ` `vp+jwt`) that envelopes the SD-JWT as an `EnvelopedVerifiableCredential`; the presentation's signature is the holder proof, so the enveloped SD-JWT has no key binding JWT. Without holder binding the SD-JWT is sent as is.

For production we recommend swapping the polling loop for [server-sent events or WebSockets](https://datatracker.ietf.org/doc/html/rfc6455), but polling keeps the example minimal.

## Parsing the SD-JWT VC

An SD-JWT VC consists of a JWT followed by `~`-delimited disclosures and an optional key binding JWT. Each disclosure is a base64url-encoded JSON array `[salt, claim_name, claim_value]`. `atob` only reads standard base64, so convert the alphabet first:

```ts
function base64UrlDecode(text: string): string {
  const base64 = text.replace(/-/g, "+").replace(/_/g, "/")
  return atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="))
}

function parseSdJwtVc(sdjwt: string): { key: string; value: string }[] {
  const parts = sdjwt.split("~")
  // Drop the issuer-signed JWT (first) and key-binding JWT (last, may be empty)
  const disclosures = parts.slice(1, parts.length - 1).map(base64UrlDecode)

  return disclosures.map((value) => {
    const [, claimName, claimValue] = JSON.parse(value) as [string, string, string]
    return { key: claimName, value: claimValue }
  })
}
```

In production you should also verify the issuer's signature on the JWT, check the credential's validity period, and validate the key binding JWT if one is present. The demo skips these checks because the backend has already verified the proof before exposing it to the frontend.

## Where to go next

- [OpenID4VP disclosure protocol details](openid4vp-disclosure.md) — verifier certificates, authorization request modes, more DCQL examples.
- [Trusted Verifier](trusted-verifier.md) — how to get listed and obtain a verifier certificate.
- [openid4vp-demo-frontend](https://github.com/privacybydesign/openid4vp-demo-frontend) — the full reference implementation, with SD-JWT VC and mdoc presets for the EUDI verifier, Veramo verifiers for `vc+sd-jwt`, and IRMA-protocol verification side-by-side with OpenID4VP for comparison.
