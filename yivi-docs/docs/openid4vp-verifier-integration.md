---
title: OpenID4VP Verifier Integration
---

This guide walks through integrating a frontend with a Yivi-compatible OpenID4VP verifier backend. The code samples are distilled from the [openid4vp-demo-frontend](https://github.com/privacybydesign/openid4vp-demo-frontend) reference implementation, which is the simplest end-to-end example we maintain.

If you have not yet read it, start with the [OpenID4VP Introduction](openid4vp-introduction.md) and the protocol details on [Disclosing SD-JWT VCs over OpenID4VP](openid4vp-disclosure.md).

## Architecture

A typical OpenID4VP verifier integration involves three components:

- **Frontend** — runs in the user's browser. Builds the DCQL query, asks the backend to start a session, renders the wallet QR code, polls for the result, and shows disclosed claims to the user.
- **Verifier backend** — your own server that holds the X.509 verifier certificate and signs authorization requests. The demo uses an [EUDI reference verifier](https://github.com/eu-digital-identity-wallet/eudi-app-android-wallet-ui) deployment exposing `/ui/presentations`.
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

## Building a DCQL request

A DCQL query describes the credentials and claims the verifier wants. The example below asks for an email and domain claim from the `sidn-pbdf.email` SD-JWT VC:

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

The full authorization request adds OpenID4VP envelope fields. The Yivi-compatible verifier backend expects the verifier's X.509 certificate chain inline as `issuer_chain`:

:::caution Non-standard verifier backend API
The authorization-request shape below (including the `issuer_chain` field, the `/ui/presentations` endpoint, and the polling endpoint further down) is not defined by OpenID4VP. It is specific to the [eudi-srv-verifier-endpoint](https://github.com/eu-digital-identity-wallet/eudi-srv-verifier-endpoint) reference server from the EUDI Wallet project, and the exact request and response shapes additionally depend on the version of that server we currently run. If you deploy a different verifier backend, expect its frontend-facing API to differ.
:::

```ts
const authorizationRequest = {
  type: "vp_token",
  dcql_query: dcqlQuery,
  nonce: "nonce",
  jar_mode: "by_reference",
  request_uri_method: "post",
  issuer_chain: ISSUER_CHAIN, // PEM-encoded X.509 chain
}
```

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
const walletLink = `eudi-openid4vp://?${params}`
```

The Yivi app accepts both the `openid4vp://` and `eudi-openid4vp://` URI schemes. On mobile you can navigate the user directly to `walletLink`; on desktop, render it as a QR code that the Yivi app can scan.

### Universal links

The Yivi app also accepts an HTTPS universal link form that opens directly into the app on mobile (or falls back to the App Store / Play Store entry on devices without Yivi installed):

```
https://open.yivi.app/-/openid4vp?request_uri=...&client_id=...
```

Use the same query string you would put on the `openid4vp://` URI; the app rewrites the link to the canonical scheme internally. The staging host `https://open.staging.yivi.app/-/openid4vp` is accepted for testing.

## Polling for the result

Poll the verifier backend's result endpoint until the user completes the flow in the Yivi app:

```ts
const id = setInterval(async () => {
  const result = await fetch(`${API_URL}/ui/presentations/${transactionId}`)
  if (result.status !== 200) return // still waiting

  clearInterval(id)
  const response = await result.json()
  const entries = Object.entries(response["vp_token"]) as [string, string[]][]
  const disclosures = entries.map(([_, sdjwts]) => sdjwts.flatMap(parseSdJwtVc))
  renderDisclosures(disclosures)
}, 500)
```

For production we recommend swapping the polling loop for [server-sent events or WebSockets](https://datatracker.ietf.org/doc/html/rfc6455), but polling keeps the example minimal.

## Parsing the SD-JWT VC

An SD-JWT VC consists of a JWT followed by `~`-delimited disclosures and an optional key binding JWT. Each disclosure is a base64-encoded JSON array `[salt, claim_name, claim_value]`:

```ts
function parseSdJwtVc(sdjwt: string): { key: string; value: string }[] {
  const parts = sdjwt.split("~")
  // Drop the issuer-signed JWT (first) and key-binding JWT (last, may be empty)
  const disclosures = parts.slice(1, parts.length - 1).map((d) => atob(d))

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
- [openid4vp-demo-frontend](https://github.com/privacybydesign/openid4vp-demo-frontend) — the full reference implementation, including IRMA-protocol verification side-by-side with OpenID4VP for comparison.
