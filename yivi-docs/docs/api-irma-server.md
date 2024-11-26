---
title: irma server
---

```shell
irma server [options...]
```

The API that this server offers consists of two parts:

* [Endpoints under `/session`](#api-reference-requestor-endpoints) with which IRMA session requestors can start IRMA sessions, monitor their status and retrieve their result afterwards.
* [Endpoints under `/irma`](#api-reference-irma-endpoints) for [frontend libraries](yivi-frontend.md) and the [irmaclient](https://github.com/privacybydesign/irmago/tree/master/irmaclient)/[Yivi app](yivi-app.md).
    * [Frontend endpoints under `/irma`](#api-reference-irma-frontend-endpoints) exclusively for [frontend libraries](yivi-frontend.md).

---
## API overview

:::toc
:::

---

For each of these endpoints, if the HTTP status code indicates that the request was not successful (i.e. not in the 2xx range), then the server returns an [`irma.RemoteError`](https://godoc.org/github.com/privacybydesign/irmago#RemoteError) instance. For example, attempting to [retrieve the session result](#get-session-requestortoken-result) of an unknown session returns:
```json
{"status": 400, "error": "SESSION_UNKNOWN", "description": "Unknown or expired session"}
```
The following fields may occur in this message:
* `status`: HTTP error code associated to this error
* `error`: an error `Type` from the list of possible errors in the [server API documentation](https://godoc.org/github.com/privacybydesign/irmago/server#Error)
* `description`: English human-readable description of this error
* `message`: May contain additional information
* `stacktrace`: Stack trace of the error, only if verbose mode is enabled

## API reference requestor endpoints

---

### `POST /session`

Start an IRMA session. What to POST to this endpoint depends on the server configuration:

* If `no_auth` is true, an [(extended) JSON session request](session-requests.md)
* If `no_auth` is false:
  * [(extended) JSON session request](session-requests.md) with an API token in the `Authorization` HTTP header
  * [JWT session request](session-requests.md#jwts-signed-session-requests) signed with RS256 or HS256

If `no_auth` is false, then which of these options should be taken depends on the [`requestors`](irma-server.md#requestor-authentication) option passed to the `irma server`.

In each case an appropriate `Content-Type` with `text/plain` or `application/json` must be included.

If the request was successfully parsed, and authenticated if applicable, then the server returns a *session package*:
```json
{
  "token":"KzxuWKwL5KGLKr4uerws",
  "sessionPtr": {"u":"https://example.com/irma/session/ysDohpoySavbHAUDjmpz","irmaqr":"disclosing"},
  "frontendRequest": {
    "authorization":"qGrMmL8UZwZ88Sq8gobV",
    "minProtocolVersion": "1.0",
    "maxProtocolVersion": "1.1"
  }
}
```
In the endpoints below, the `{requestorToken}` placeholder must be replaced with the above session `token`. The `sessionPtr` points to the IRMA session for the Yivi app user, and should be displayed as a QR for the user to scan, or encoded in a universal link for a mobile session, e.g. using [`yivi-frontend`](api-yivi-frontend.md).
The final part of the `u` field in the `sessionPtr` is called the `clientToken`. The `clientToken` can be used to access the [public `/irma` endpoints](#api-reference-irma-endpoints) of the irma server.
For accessing and using the [`/irma` frontend endpoints](#api-reference-irma-frontend-endpoints), you need the `frontendRequest`.

Each session starts in the `"INITIALIZED"` [session status](#get-session-requestortoken-status). Regardless of how it reaches its ending status (`"DONE"`, `"CANCELLED"`, `"TIMEOUT"`), it is kept in memory for 5 minutes after reaching its ending status. After that all endpoints below requiring the requestor `token` return error `"SESSION_UNKNOWN"`.

---

### `DELETE /session/{requestorToken}`

Cancel the session: set the [session status](#get-session-requestortoken-status) to `"CANCELLED"`.

> There is also a [variant of this endpoint](#delete-irma-session-clienttoken) for frontends (and Yivi apps) using client tokens (the final part of the `u` field in a `sessionPtr`).

---

### `GET /session/{requestorToken}/status`

Retrieve the [session status](https://godoc.org/github.com/privacybydesign/irmago/server#Status) as a JSON string. Returns one of:
* `"INITIALIZED"`: the session has been started and is waiting for the client
* `"PAIRING"`: the client is waiting for the frontend to [give permission to connect](#post-irma-session-clienttoken-frontend-pairingcompleted)
* `"CONNECTED"`: the client has retrieved the session request, we wait for its response
* `"CANCELLED"`: the session is cancelled: the user refused, or the user did not have the requested attributes, or an error occurred during the session
* `"DONE"`: the session has completed successfully
* `"TIMEOUT"`: session timed out

Of these the latter three are *ending statuses*; once the session reaches such a status, it will not switch status again. A session starts as `"INITIALIZED"`. When being in a non-ending status (one of the first three), all statuses below that status in the list are possible next statuses.

> The session is cancelled and receives status `"CANCELLED"` not only when the Yivi app user refuses, but also when the session is aborted due to an error.

> If the session is cancelled due to the user aborting, it is (by design) not possible using this or the other endpoints of the `irma server` to distinguish between (1) the user had the requested attributes but refused to disclose them, and (2) the session was aborted by the user's Yivi app because (s)he did not have the required attributes.

> There is also a [variant of this endpoint](#get-irma-session-clienttoken-status) for frontends (and Yivi apps) using client tokens (the final part of the `u` field in a `sessionPtr`).

---

### `GET /session/{requestorToken}/statusevents`

Subscribe to a [server-sent event](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events) stream of status updates. Whenever the session status changes, an event is sent with the new session status as a JSON string. If you need to monitor the status of a session, this is preferred over polling to `GET /session/{requestorToken}/status`.

> There is also a [variant of this endpoint](#get-irma-session-clienttoken-statusevents) for frontends (and Yivi apps) using client tokens (the final part of the `u` field in a `sessionPtr`)

---

### `GET /session/{requestorToken}/result`

Get the [session result](https://godoc.org/github.com/privacybydesign/irmago/server#SessionResult). Example output:
```json
{
  "type" : "disclosing",
  "status" : "DONE",
  "disclosed" : [
    [{
      "status" : "PRESENT",
      "rawvalue" : "yes",
      "id" : "irma-demo.MijnOverheid.ageLower.over18",
      "value" : {
        "en" : "yes",
        "nl" : "yes",
        "" : "yes"
      }
    }]
  ],
  "proofStatus" : "VALID",
  "token" : "ELMExi5iauWYHzbH7gwU"
}
```
The response may contain the following fields:
* `token`: Requestor token
* `status`: Current [session status](#get-session-requestortoken-status)
* `type`: [Session type](what-is-irma.md#session-types): one of `"disclosing"`, `"signing"`, or `"issuing"`
* `proofStatus`: One of the package level [irma.ProofStatus](https://godoc.org/github.com/privacybydesign/irmago#pkg-constants) constants, indicating the cryptographic validity of the attributes and proofs of knowledge:
   * `"VALID"`: proofs are valid
   * `"INVALID"`: proofs are invalid
   * `"INVALID_TIMESTAMP"`: Attribute-based signature has invalid timestamp
   * `"UNMATCHED_REQUEST"`: proofs do not correspond to a specified request
   * `"MISSING_ATTRIBUTES"`: proofs do not contain all requested attributes
   * `"EXPIRED"`: Attributes were expired at creation time
* `disclosed`: List of [attributes disclosed](https://godoc.org/github.com/privacybydesign/irmago#DisclosedAttribute) by the user. The array structure mirrors that of the [session request](session-requests#disclosure-requests) that started the session: the i-th item of the outer array is a conjunction of attributes satisfying the i-th outer conjunction of the session request. (*Note*: if the session was started with a legacy, pre-[condiscon](condiscon.md) session request, then this array structure has a different legacy structure; see the [legacy documentation](https://irma.app/docs/v0.2.0/api-irma-server/#get-session-requestortoken-result))
* `signature`: The full attribute-based signature in case of `"signing"` sessions
* `error`: Error message in case of failure

If the session is not yet finished (that is, the session status is `INITIALIZED` or `CONNECTED`), then only the first three fields are populated. (For getting just the current session status, using [`GET /session/{requestorToken}/statusevents`](#get-session-requestortoken-statusevents) or [`GET /session/{requestorToken}/status`](#get-session-requestortoken-status) is preferred.)

This endpoint just fetches the session result, and works normally even if the session failed. If so, the `status`, `proofStatus` or `error` fields will indicate what happened. Be sure to check these fields when retrieving and handling the session result.

---

### `GET /session/{requestorToken}/result-jwt`

If a JWT private key was [provided in the configuration of the `irma server`](irma-server.md#signed-jwt-session-results), then this returns a [JWT](https://jwt.io) signed by the `irma server` with the message from [`GET /session/{requestorToken}/result`](#get-session-requestortoken-result) above as JWT body, along with the following standard JWT fields:
* `iss`: name of the current `irma server` as defined in its configuration
* `iat`: Unix timestamp indicating when this JWT was created
* `sub`: `verification_result` or `signing_result` or `issuing_result`

This way, even if the session result from the `irma server` travels along an untrusted route (for example the user's browser), the session result can still be validated and trusted.

---

### `GET /session/{requestorToken}/getproof`

Also returns a session result JWT, but one whose structure is the same as the session JWTs returned by the [`irma_api_server`](https://github.com/privacybydesign/irma_api_server). Only works if a JWT private key was [provided in the configuration of the `irma server`](irma-server.md#signed-jwt-session-results).

---

### `GET /publickey`

If a JWT private key was [provided in the configuration of the `irma server`](irma-server.md#signed-jwt-session-results), then this returns the corresponding public key in PEM with which the server's session result JWTs returned by [`GET /session/{requestorToken}/result-jwt`](#get-session-requestortoken-result-jwt) and [`GET /session/{requestorToken}/getproof`](#get-session-requestortoken-getproof) can be verified.

---

## API reference `/irma` endpoints
The `/irma` endpoints of your IRMA server have to be publicly reachable from the internet. Most of the endpoints
behind the `/irma` prefix are exclusively used by the
[irmaclient](https://github.com/privacybydesign/irmago/tree/master/irmaclient)/[Yivi app](yivi-app.md).
These endpoints are documented in full in the page on the [IRMA protocol](irma-protocol.md).
The endpoints used by both the Yivi app and the [frontend libraries](yivi-frontend.md) are documented below.
The endpoints exclusively meant for frontend libraries can be found below [in a separate section](#api-reference-irma-frontend-endpoints).

---

### `DELETE /irma/session/{clientToken}`
Behaves exactly the same as the [delete endpoint for requestors](#delete-session-requestortoken), but uses the
[client token from the `sessionPtr`](#post-session) instead of the requestor token.

---

### `GET /irma/session/{clientToken}/status`
Behaves exactly the same as the [status endpoint for requestors](#get-session-requestortoken-status), but uses the [client token
from the `sessionPtr`](#post-session) instead of the requestor token. For frontend libraries, this endpoint is deprecated.
Please use the [frontend status endpoint](#get-irma-session-clienttoken-frontend-status) instead.

---

### `GET /irma/session/{clientToken}/statusevents`
Behaves exactly the same as the [statusevents endpoint for requestors](#get-session-requestortoken-statusevents), but uses the
[client token from the `sessionPtr`](#post-session) instead of the requestor token. For frontend libraries this endpoint is deprecated.
Please use the [frontend statusevents endpoint](#get-irma-session-clienttoken-frontend-statusevents) instead.

---

## API reference `/irma` frontend endpoints
The frontend endpoints are exclusively meant for [frontend libraries](yivi-frontend.md) to communicate with the IRMA server.
Frontends need the information from the `frontendRequest` in order to use these endpoints. The `frontendRequest` is received
along with the `sessionPtr` from the [`POST /session`](#post-session) requestor endpoint.
Just like the [other `/irma` endpoints](#api-reference-irma-endpoints), the frontend endpoints of your IRMA server
have to be publicly reachable from the internet.

To make sure these endpoints can only be accessed by frontends, requests should be done with an
additional `Authorization` HTTP request header. The expected value for this request header is the `authorization`
token in the `frontendRequest`.

The frontend endpoints in this version of the IRMA server implement frontend protocol version 1.1.

### `GET /irma/session/{clientToken}/frontend/status`
Retrieve the current [session status](https://godoc.org/github.com/privacybydesign/irmago/server#Status), and additional information
being relevant for that session status, as a JSON object.

The JSON object always contains a `status` field, containing the session status as being described in [status endpoint for requestors](#get-session-requestortoken-status).
Additionally, when the session status is `DONE`, the `nextSession` field might be included.
It contains the `sessionPtr` of the IRMA session following up the current session (a chained session).
This happens when the `nextSession` option is used as [extra parameter in the session request](session-requests.md#extra-parameters).


Below you can find an example response:
```json
{
  "status" : "DONE",
  "nextSession": {"u":"https://example.com/irma/ysDohpoySavbHAUDjmpz","irmaqr":"disclosing"}
}
```

### `GET /irma/session/{clientToken}/frontend/statusevents`
Subscribe to a [server-sent event](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events) stream of status updates.
Whenever the session status changes, an event is sent as a JSON object. This JSON object follows the exact same format as the
output of the [frontend status endpoint](#get-irma-session-clienttoken-frontend-status).
If you need to monitor the status of a session, this is preferred over polling the frontend status endpoint.

### `POST /irma/session/{clientToken}/frontend/options`
This endpoint can be used to set pairing options for an IRMA session. Specific options can be sent to this endpoint and
in the response an overview of the current pairing options is sent. If an options request holds an invalid combination
of options, an error is returned.

Session options can be changed multiple times. However, as soon as an
[irmaclient](https://github.com/privacybydesign/irmago/tree/master/irmaclient)/[Yivi app](yivi-app.md)
has connected to the session, it is not possible to change the options anymore. In other words, this
endpoint can only be used when the [session status](#get-irma-session-clienttoken-frontend-status) is `"INITIALIZED"`.

The body of an options request should have the following structure:
```json
{
  "@context": "https://irma.app/ld/request/frontendoptions/v1",
  "pairingMethod": "..."
}
```

Currently we only have one option, the option `pairingMethod`. It can have two values:
 * `"pairingMethod": "none"` **(default value)**  
   No device pairing is used. This is the normal, already known behaviour.
 * `"pairingMethod": "pin"`  
   When an [irmaclient](https://github.com/privacybydesign/irmago/tree/master/irmaclient)/[Yivi app](yivi-app.md)
   connects to a session in which pairing is enabled, the [session status](#get-irma-session-clienttoken-frontend-status)
   becomes `PAIRING`. The irmaclient shows a 4 digit pairing code and only after the user correctly enters this code
   in the frontend the session continues, and the status becomes `CONNECTED`. This method can be
   used when a user is expected to scan an IRMA QR code using his/her phone and there is a risk on shoulder surfing
   (i.e. someone in close physical proximity to the user scans the QR code that was meant for the user).
   
   Pairing confirmation can be communicated by the frontend using the [`pairingcompleted` endpoint](#post-irma-session-clienttoken-frontend-pairingcompleted).
   
   When this option is requested, the session options response on this request will contain an extra field
   `pairingCode` containing the expected 4 digit code.
   
A response of this endpoint has the following structure:
```json
{
  "@context": "https://irma.app/ld/options/v1",
  "pairingMethod": "pin",
  "pairingCode":  "1234"
}
```

If the `pairingMethod` field has the value `none`, the `pairingCode` field is omitted.

---

### `POST /irma/session/{clientToken}/frontend/pairingcompleted`
This endpoint can be used by the frontend to confirm the pairing of the frontend
and the [irmaclient](https://github.com/privacybydesign/irmago/tree/master/irmaclient)/[Yivi app](yivi-app.md).
The endpoint can only be used while the [session status](#get-session-requestortoken-status) is set to `PAIRING`.
A valid request to this endpoint will cause the session status to change from `PAIRING` to `CONNECTED`.
When the request succeeds, a `204 No Content` response is returned.