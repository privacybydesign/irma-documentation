---
title: IRMA protocol
---

During an IRMA session, the IRMA protocol is used by the [IRMA server](irma-server.md) and [Yivi app](yivi-app.md) to issue or verify attributes. The Yivi app sends and receives various data by invoking a number of HTTP endpoints of the IRMA server, making the session progress through a number of stages. This page documents those endpoints, the data being handled, and the states the session goes through.

## Introduction

The IRMA protocol consists of a set of messages that are exchanged between the IRMA server and an Yivi app during a session. Each message being sent or received is a JSON serialization of a particular Go struct defined within the [`irmago`](https://github.com/privacybydesign/irmago) source code repository. Thus, whenever we say below that an instance of a particular struct is sent or received, we refer to its JSON serialization. For most of the messages being sent and received, the default Go (un)marshaler is used. Whenever we say that a particular Go struct is sent or received, we will link to its [API documentation](https://pkg.go.dev/github.com/privacybydesign/irmago), from which its JSON structure may be inferred.

We assume here that the Yivi app and server both support the latest IRMA protocol version. Some of the messages have custom unmarshalers, which if an older protocol version is used transform the message to comply with the older protocol version.

The HTTP endpoints of the IRMA server documented here are invoked exclusively by the Yivi app, in particular by the [`irmaclient` Go library](https://pkg.go.dev/github.com/privacybydesign/irmago/irmaclient) used by the Yivi app. These endpoints are not meant for direct use by any other party or software. The endpoints of the IRMA server used by requestors and/or by frontends are documented in the [API reference of the IRMA server](api-irma-server.md).

In order to protect the attributes as they travel over the internet from being read or modified by anyone else than the Yivi app and server to which they are sent, it is important that they are encrypted. The IRMA protocol does not deal with encryption by itself; instead it relies on TLS for this, as well as for authenticating the requestor. Thus, the messages being sent in the protocol as shown below are normally TLS encrypted. The Yivi app will refuse to connect to IRMA servers over plain HTTP without TLS, unless [developer mode](yivi-app.md#developer-mode) is enabled.

The IRMA protocol as outlined below can be seen in action by performing an IRMA session with an IRMA server configured with [maximum verbosity](irma-server.md#logging-and-verbosity), as then it will log all HTTP traffic that it sends and receives.

### The session state

At any time after its creation an IRMA session is in a particular [session state](https://pkg.go.dev/github.com/privacybydesign/irmago#ServerStatus), and with respect to this state the IRMA server acts as a state machine. Each of the endpoints below may be invoked only when the session is in a particular state, and most of them cause the session to progress to a next state. The requestor, the frontend and the Yivi app may keep track of the session state through server-sent events or through polling. An IRMA session progresses through the following states, in the order as they appear here:

* `INITIALIZED`: after the session [is created](#session-creation).
* `PAIRING`: only if device pairing is enabled, after the Yivi app [first connects to the IRMA server](#retrieving-the-session-request).
* `CONNECTED`: either when device pairing is disabled and the Yivi app [first connects to the IRMA server](#retrieving-the-session-request), or after the frontend indicates to the IRMA server that pairing has been completed successfully.
* `DONE`: after the HTTP request has finished processing in which Yivi app has sent its [session response](#sending-the-session-response). In this state, any attributes that were disclosed by the Yivi app to the server are ready to be retrieved by the requestor.

At any time, the session may move from one of the first three states to any of the following states:

* `TIMEOUT`: the session has been in one of the first three states longer than a timeout (configurable in the IRMA server, by default 5 minutes).
* `CANCELLED`: the session was cancelled [by the Yivi app](#cancelling-delete-irma-session-clienttoken), [the requestor or by the frontend](api-irma-server.md#delete-session-requestortoken); or an error occurred.

Of these states, `DONE`, `TIMEOUT` and `CANCELLED` are final states: no valid state transition exists from these to any other state.

### Sequence diagram

The following sequence diagrams showing an IRMA session in the happy flow, without and with device pairing, summarize the above. Note that these diagrams show a complete session for completeness, including the actions of the frontend, while the remainder of this document focuses on the actions of the Yivi app.

<!--
Generate these using `java -jar path-to-plantuml.jar -tsvg *.puml` in docs/assets. E.g. if the PlantUML extension is installed in VSCode: `java -jar ~/.vscode/extensions/jebbs.plantuml-2.15.1/plantuml.jar -tsvg *.puml`
-->

<!--DOCUSAURUS_CODE_TABS-->
<!--Pairing disabled-->
<img src="/docs/assets/session-no-pairing.svg">
<!--Pairing enabled-->
<img src="/docs/assets/session-pairing.svg">
<!--END_DOCUSAURUS_CODE_TABS-->

### Further reading

This page is concerned only with the IRMA protocol. For more technical information on IRMA in general, as well as explanations and definitions of some of the terms mentioned in this page, see the [technical overview](overview.md).

This page does not deal with the cryptographic contents of the messages being passed nor how they achieve [IRMA's security properties](overview.md#irma-security-properties), only with how and when they are passed. IRMA being an implementation of the Idemix attribute-based credential scheme, details on the cryptographic contents and mechanisms of the messages  may be found in the [Idemix specification](https://dominoweb.draco.res.ibm.com/reports/rz3730_revised.pdf) and in the [paper introducing Idemix](https://cs.brown.edu/people/alysyans/papers/camlys02b.pdf) by Camenisch and Lysyanskaya.

## Session creation

The [requestor](overview.md#participants) creates a session by sending a [session request](session-requests.md) for one of the three supported [session types](what-is-irma.md#session-types) to the [`POST /session`](api-irma-server.md#post-session) endpoint of the `irma server`, or by invoking the [`StartSession()`](https://pkg.go.dev/github.com/privacybydesign/irmago/server/irmaserver#Server.StartSession) function of the `irmaserver` Go library. If the IRMA server accepts the session (i.e., the session request is valid and the requestor is authorized to start sessions), the session is created and its state is set to [`INITIALIZED`](https://pkg.go.dev/github.com/privacybydesign/irmago#ServerStatusInitialized). This means that the IRMA server is waiting for the first HTTP request of the Yivi app, documented below.

When the requestor creates the session, the IRMA server responds with a [session package](api-irma-server.md#post-session). For example:

```json
{
  "sessionPtr": {
    "u": "https://example.com/irma/session/6xyh0D2CdLsloWljYFH1",
    "irmaqr": "disclosing"
  },
  "token": "NsuDGnWtfpLX7nv4Gn1M",
  "frontendRequest": {
    "authorization": "MfEl17feZHbfOfPQtiJe",
    "minProtocolVersion": "1.0",
    "maxProtocolVersion": "1.1"
  }
}
```

The requestor takes the `sessionPtr` and `frontendRequest` from the session package and sends those to its [frontend](yivi-frontend.md), which uses them to create a QR code or a universal link. The Yivi app then picks that up by either scanning the QR code (desktop flow) or clicking on the universal link (mobile flow).

Next, there are two possibilities: the frontend either enables device pairing, or not. Pairing is only used in the desktop flow, i.e. when the frontend displays a QR code for the Yivi app to scan (and even then not necessarily in all cases; it can be disabled by the frontend). If device pairing is enabled, then after the Yivi app connects to the server (using the information in the QR code or the universal link) but before the Yivi app receives the session request, the user must enter a random 4-digit pairing code in the frontend, as protection against shoulder surfing (QR code stealing).

## Retrieving the session request

### `GET /irma/session/{clientToken}`

After the Yivi app scans the QR code or the user taps on the universal link displayed by the frontend, containing a token identifying the session that we will denote with `clientToken`, the app performs a GET request to `/irma/session/{clientToken}`. It sends along the minimum and maximum versions of the IRMA protocol that it supports. For example:

```
GET /irma/session/6xyh0D2CdLsloWljYFH1/ HTTP/1.1
X-Irma-Minprotocolversion: 2.4
X-Irma-Maxprotocolversion: 2.8
```

The server responds with an [`irma.ClientSessionRequest` instance](https://pkg.go.dev/github.com/privacybydesign/irmago#ClientSessionRequest), containing the protocol version that it chooses (the highest protocol version supported by both itself and by the app), the pairing code if device pairing is enabled, or the session request if not. For example:

<!--DOCUSAURUS_CODE_TABS-->
<!--Pairing enabled-->
```json
{
  "@context": "https://irma.app/ld/request/client/v1",
  "protocolVersion": "2.8",
  "options": {
    "@context": "https://irma.app/ld/options/v1",
    "pairingMethod": "pin",
    "pairingCode": "1761"
  }
}
```
<!--Pairing disabled-->
```json
{
  "@context": "https://irma.app/ld/request/client/v1",
  "protocolVersion": "2.8",
  "options": {
    "@context": "https://irma.app/ld/options/v1",
    "pairingMethod": "none"
  },
  "request": {
    "@context": "https://irma.app/ld/request/disclosure/v2",
    "context": "AQ==",
    "nonce": "Il2FiK8uCIApjzkWeRouSQ==",
    "protocolVersion": "2.8",
    "devMode": true,
    "disclose": [
      [
        [
          "pbdf.pbdf.irmatube.type"
        ]
      ]
    ]
  }
}
```
<!--END_DOCUSAURUS_CODE_TABS-->

If device pairing is disabled, then the session state is set to [`CONNECTED`](https://pkg.go.dev/github.com/privacybydesign/irmago#ServerStatusConnected). Otherwise the session state is set to [`PAIRING`](https://pkg.go.dev/github.com/privacybydesign/irmago#ServerStatusPairing). In that case the Yivi app shows the `pairingCode` in the response above in its GUI, and instructs the user to type that into the frontend. It uses [`/irma/session/{clientToken}/statusevents`](api-irma-server.md#get-irma-session-clienttoken-statusevents) or polls to [`/irma/session/{clientToken}/status`](api-irma-server.md#get-irma-session-clienttoken-status) to keep track of the session status. After the user enters the pairing code into the frontend, the frontend invokes the [`POST /irma/session/{clientToken}/frontend/pairingcompleted` endpoint](api-irma-server.md#post-irma-session-clienttoken-frontend-pairingcompleted), triggering the IRMA server to switch the session status to `CONNECTED`. When that happens the Yivi app notices through a server-sent event or through its polling, after which it invokes the below endpoint to retrieve the session request.

### `GET /irma/session/{clientToken}/request`

This endpoint is only used to retrieve the session request when device pairing is enabled (if not, this endpoint is not invoked since the session request is included in the response to the previous HTTP request, see above). The server responds with the session request, for example:

```json
{
  "@context": "https://irma.app/ld/request/disclosure/v2",
  "nonce": "Il2FiK8uCIApjzkWeRouSQ==",
  "context": "AQ==",
  "protocolVersion": "2.8",
  "devMode": true,
  "disclose": [
    [
      [
        "pbdf.pbdf.irmatube.type"
      ]
    ]
  ]
}
```

This is the session request that was passed by the requestor to the IRMA server [when the session was started](#session-creation), with the following additions:

* `nonce` (standing for a *n*umber that is used *once*): this base64-encoded number serves as the challenge in the IRMA protocol, which is a challenge-response protocol: the Yivi app's [response](#sending-the-session-response) must take this number into account in a specific way. That is, this number guarantees liveness of the prover (the app) and prevents against replay attacks. It is randomly chosen by the IRMA server and unique per session.
* `context`: always contains a base64 encoding of the number 1; this is not currently used in IRMA.
* `protocolVersion`: the protocol version chosen by the IRMA server (see above).
* `devMode`: `true` when [production mode](irma-server.md#production-mode) is *not* enabled in the IRMA server, false otherwise. (If this is `true`, then the Yivi app will accept the session request only if [developer mode](yivi-app.md#developer-mode) is enabled in it).

## Sending the session response

After receiving the session request, the following happens.

* The Yivi app compares the requested attributes (if any) in the session request against its store to decide if it currently has them in possession, and computes a list of options containing attributes for the user to choose from that will satisfy the requestor, according to the session request.
* The app presents those options as well as information about the requestor to the user, asking her to either choose from the options and proceed with the session, or to abort.
* If the user decides to proceed with the session, then based on the user's choices of attributes to be disclosed the Yivi app computes the appropriate response to the IRMA server, in conjunction with the keyshare server using the [keyshare protocol](keyshare-protocol.md). If instead the user decides to abort, or if any error occurs, then the Yivi app cancels the session (see [below](#cancelling-delete-irma-session-clienttoken)).

In the remainder of this section, we assume that so far no error occurred and the user chooses to proceed. In that case, after constructing the response to the IRMA server as mentioned above one of the following three endpoints is invoked, depending on the session type.

### Disclosure: `POST /irma/session/{clientToken}/proofs`

The app POSTs an [`irma.Disclosure` instance](https://pkg.go.dev/github.com/privacybydesign/irmago#Disclosure), for example:

```json
{
  "proofs": [
    {
      "c": "Hg+cpDeB85nH0hZFmQ2AzLIv+CxVi6mPR2LeDZ+7XVU=",
      "A": "1Uf2V5PRILh6cjo64wWcwIDm39SqnXAXu+tOwq90GmceiahyG5h1zH5/HMA4vwxZfF+9pkqIX1/7twRU6dI5ct2hqAq6qWWcYrwqFV2PsMLVzIyrdU1xVeo4YOIajJ4DMX5rxrCJjjLb28VNWxWUqieXs/iz8Dn67+nYTxxdv4tQw7B3i45PtrD+sKbZPGjTQP0iBHOp5OOvlWNKDYZhKAYgkx+upjcDMHUSCDZPLUCzVBK7LZRqzsh02QrBRyFmeWKxqHpOKzyN9V1GHnUpXWPehenwGFD+N9/TB7rDfMciAV/BaC6pbPbjYCT0bWaBxe07kKT0O4PSsOHBf643jA==",
      "e_response": "oB02Vcm+NekUq4qA92p45jWj4L/QAIJW2SxnMOSyX6GmhV62KeU5+hQUvAv6hK/Jkw+NqdX0kiwV8DUQFc4d",
      "v_response": "C8NbtoNAwYX/OiYMbVBHcDExpIId2a6k5e/JC2rAbp7qATkHTfOjhvjjdSQNy6CYguW67Zn26lp817EWRNxia6ScAuQjkT+8nxBfFIOG5+qFANiRp2MhNCcbyFFPjQGL9m5fPHAoRkyvAPydwvOwomXuj2zX0LbReuYxlBviwLjikNHeWrPAxzk11NCnSxQd3jo+cHzKmJd24RbeOWoyuBRtoXBEV/cKcFbfAd0vamr9n5LYNDK7BXqazBzkP6VeTyzvKFgalW/7mzilYgLAe5htSsHnAQCe7gOP//12iPxQe7NX1aGUmOmTZfQmNv4AxU9tCb3ylPTXPPImYaUiVt8k91+ADvgF/uwf2gLPs3QtsvYqi6njozrRt1ZyIL9dHxf9AQMQiWDBGXkw2rbywx/UmfZV/TqZmU7j/NFLqlDC7u1UYfzMQFSvy/pamImQ20njTG9bZY8geAGc0mMLhwtSY8GIHaCG7Qmgz/cNWuAszX2w4bG9hZaznBCbOOA/q2UH962Majum4DbJo+12/jY=",
      "a_responses": {
        "0": "X1DnHADwaDTOQGb2SS+bJCebTCRbZserzi5wqu0K8SQI7729hH39YC2y9PK4x6m+6Ep1MTqRDF7ZT8ThSV6Fg2ngqTytVJv9t7mobp3fTnY=",
        "3": "vrmbFFjN2NepjEiDXSwhnb5AC7Y2ZWAluAu2gUUmLD4Re3BG/Jia9WGFWU6SEifmT269BHE8LmsT0/UkGFr+CRPddXPDJUFWaEsoQ2NtNz0=",
        "4": "E4BMmNXOAHNCMEVGLiA9WZ8GkqLRPlWs+3H3uEZ8G/I/6ct1O98OJI0+C7hD3zP6yD1M1qXbWE7DTWo4tt/rXDju6Zdhq+olST8OzLxwU5Q="
      },
      "a_disclosed": {
        "1": "AwAKhwAaAAXZZxdMn4TvQ6F/mVxWb6a7",
        "2": "5MrO6tjC5Q=="
      }
    }
  ],
  "indices": [
    [
      {
        "cred": 0,
        "attr": 2
      }
    ]
  ]
}
```

The `proofs` array contains a list of disclosure proofs, i.e. [`gabi.ProofD`](https://pkg.go.dev/github.com/privacybydesign/gabi#ProofD) instances, for each credential out of which attributes are being disclosed (present in the `a_disclosed` map, see below). The remainder of the fields within the `gabi.ProofD` are [zero-knowledge proofs](zkp.md) of the hidden attributes (`a_responses`) and of the issuer signature over the attributes of this credential.

The `indices` double array informs the IRMA server where it can find the attributes that it requested in the session request within the `proofs` array, schematically as follows: if `indices[i][j]` contains `{"cred": k, "attr": l}`, then the attribute requested in the [inner conjunction](session-requests.md#multiple-credential-types-within-inner-conjunctions) `j` in the outer conjunction `i` can be found in `proofs[k].a_disclosed[l]`.

#### The attributes in `a_disclosed`

The IRMA protocol uses Base64 to encode large integers, as can be seen in the strings in the message above. The disclosed attributes additionally contain an extra bit in the least significant position encoding their presence, which is used to distinguish [absent attributes](session-requests.md#issuance-requests) from attributes containing the empty string as values. Thus, a (non-empty) string found within `a_disclosed` containing a disclosed attribute can be converted to its string value as follows:

* Base64-decode the string,
* Bit-shift the resulting bytes one position to the right,
* Parse the resulting bytes as a UTF-8 string.

For example, taking attribute `2` from `a_disclosed` in the message above, the following [Go snippet](https://play.golang.org/p/GTWeM_uHr98) outputs `regular`.

```go
bts, _ := base64.StdEncoding.DecodeString("5MrO6tjC5Q==")
i := new(big.Int).SetBytes(bts)
i.Rsh(i, 1)
fmt.Println(string(i.Bytes()))
```

Note that attribute `1` is the [metadata attribute](overview.md#the-metadata-attribute), containing among others the credential type and the expiry date of the credential in a custom encoding. This attribute is always disclosed. The above snippet will not output anything sensible for metadata attributes, but instead the [`irma` command line tool](irma-cli.md) can be used as follows.

```text
$ irma meta "AwAKhwAaAAXZZxdMn4TvQ6F/mVxWb6a7"
Identifier      : pbdf.pbdf.irmatube
Signed          : 2021-08-26 02:00:00 +0200 CEST
Expires         : 2022-02-24 01:00:00 +0100 CET
IsValid         : true
Version         : 3
KeyCounter      : 5
KeyExpires      : 2021-09-23 11:43:09 +0200 CEST
KeyModulusBitlen: 2048
```

### Attribute-based signatures: `POST /irma/session/{clientToken}/proofs`

The app POSTs an [`irma.SignedMessage` instance](https://pkg.go.dev/github.com/privacybydesign/irmago#SignedMessage), for example:

```json
{
  "@context": "https://irma.app/ld/signature/v2",
  "signature": [
    {
      "c": "fxMY3mOBnyuh+snmkvpza7R8yoNhXk5WWWDAddxpmwM=",
      "A": "pU8O3BUrdgAZ5+Xekea+++MJSsZKkqdHRJOv11Nog5BmKnFpbV388ZMaSFOj1BsFT6vA3O7sWNMfxgWrgWYDONdIrd9zLt+GbT4kcqDvp/ual2u9JqAOkt6xHoG2kDX9VLLBRxsPzgeyic/NReqXotQ7qcSppf/9NGe6u+BJnmEWPALIdSfv+dwycfrWf3qAblMmwwYKodUBLwRd0nvR1NXsq5omieM9QRf12rXyZHJ4/jxDL7YKXk3CbKQxqZP84Q8MWoL3BnaVvL+XcAdZcxh4ayZSNBfOF2ovZQhNtWmIueLMf2MrVVF6V8Z4j+WBHEE0bTJLXfSsWzi1ex89Ww==",
      "e_response": "CtS3r/LSInVqRzb7fbF9g/TozXmPHzoPbR2O/Hap2sWJlIC2qxaDwGkiJuCxw/nhLrV7u9Qy8b4jpd70xwno",
      "v_response": "AUMG/sw2Dx34g2eYrm15+/lgubKoQR0tHctZIfOHs2IT+9n7lmXW/kA57f5O43LxG14yo6G7vSdqwW5QRsCfix/nbl2El0C31sFb5ZyKVcHsFDB4derCQYaAqr6lbSUS6mjHSl5p8JMMoGErF/B0f+9dNrbZlWXbdzckdZUruWEbnoSvXvt8v6oXmHCE7ngHrxa+0ft/Fs6phvgYbAA/ABXwxuSjsm2U0FUMdfpKwhwClOFWZzgX5HLV4rNq/Z6j9DYd6NEKnwSavLB0h8F1gibV2IyxdTFWM7B62Izq8W2NvJkvNE7Z+CaeAFyyHGmA12rSfPfPqspEGd87UJo2ByfZ8DZZsWoe0EYM/LYPnK4BDsaKNiNXc1+42QkZkeL7ZL2p+er7F6CfuhpebEt7gaANiBUJfR0XFMC1IH/eLvx6Y9Sa7h9NvcHFGC1/cHgEOk9SZi4AXpg7W05Tv01IYQg6o+hgjwAI23dEm2TM4CMDyFXsi0XSa/m9DcnZXWrRrz8DLz3XDLO6SlBkKDzOfyw=",
      "a_responses": {
        "0": "09um7BUT1sfj4G8NJfNTxVrxQR5Fxyjb88EWOtICeQAcwMJPeL7HjfjkVuDSsnUbO/a95PMwWo2QOjz3pYx5TwfxksfODhov1SdGQublems=",
        "3": "wXFVVu64epTtUeuwYhkTsStWRoKJKjgo69Y2YBFdWJY2D4oIH3ut0Fprs/p2Mhm+g180Gc0JuiFqVJfMnTUhBbs26ENDGbAZZRVdobu7520=",
        "4": "A8rAICtm6tykmm21SBkOFrjZQt7K2xukuPaoXhYJOtX180p29tzueTipAp/nfDyRwLkWox26QBj0s8AXmOvzU0S4vq5oHSxsHVWvKosMHLM="
      },
      "a_disclosed": {
        "1": "AwAKhwAaAAXZZxdMn4TvQ6F/mVxWb6a7",
        "2": "5MrO6tjC5Q=="
      }
    }
  ],
  "indices": [
    [
      {
        "cred": 0,
        "attr": 2
      }
    ]
  ],
  "nonce": "u9llQevSkYoDEiz/qAtJDQ==",
  "context": "AQ==",
  "message": "The message signed by this signature",
  "timestamp": {
    "Time": 1630063199,
    "ServerUrl": "https://irma.sidn.nl/atumd",
    "Sig": {
      "Alg": "ed25519",
      "Data": "iAyQutB26ZaVLgfXvMa+sjAeXOYclpInq+xIaROdoWG/WqIg6xWQuFwaPvZQ0PQk5C3e0EYNDGsjNTpQejWBCw==",
      "PublicKey": "MKdXxJxEWPRIwNP7SuvP0J/M/NV51VZvqCyO+7eDwJ8="
    }
  }
}
```

Here, the fields are as follows:

* `@context` identifies this as an IRMA attribute-based signature.
* `signature` is the same as [`proofs` in disclosure sessions](#disclosure-post-irma-session-clienttoken-proofs).
* `indices` is the same as in [disclosure sessions](#disclosure-post-irma-session-clienttoken-proofs).
* `nonce` and `context` have the same values as in the [session request](#get-irma-session-clienttoken-request). Contrary to the response of disclosure sessions they are included here, so that the signature is completely self-contained: it contains all information necessary to verify its validity.
* `message` is the message signed by this signature.
* `timestamp` contains a signed timestamp, which is used during verification of the attribute-based signature to establish that the attributes within it were valid at creation time of the signature.

### Issuance: `POST /irma/session/{clientToken}/commitments`

The app POSTs an [`irma.IssueCommitmentMessage` instance](https://pkg.go.dev/github.com/privacybydesign/irmago#IssueCommitmentMessage), for example:

```json
{
  "combinedProofs": [
    {
      "U": "LcIn9Bbp2HN0gLPU11fFSWbLlGcUz1SzmsSk0yxY7Qou3RlucUErR/xvBuhUG3kCOhVVuZm2tw/W0OAWc/ivsYZ+XxV/bJURcFjaDt7cyKN7hIG1LYTtUHy343eSSCUBTKshO4cNy+QdL7jwzh5+wXdGUuUvJ4FEg1ktjOt2zaA=",
      "c": "FTgz4JDU+B5C21ieVZ7b+d8DDohXSRDRm311Kv8T9/o=",
      "v_prime_response": "f6kkO0Z85+gjE3av3bEyr7EJgh7yjW39aKtt/oI4m6QyGu95CqLMbHLObz3cPAnGsm/GhL2KnGZiyF89KnHBrSaiCyAjzpaqTK17/SisNdqSI0gTtqMnQLdVlHGQLeBiS00iHRbG943p6kXXiBCNz7RUxDU3uDgVMq58YaragkYHwudd2YANUFe0XuTbkQ0HEdIOyhJA5PRfxcpsXPg2P9MlL1oppqM69PL/Sy3v9mgdc8G/",
      "s_response": "R71lJ6mVIeLb6g2sabiShN2hOHoSirE2b0/DoESEEDntHlOyaLrPIxjuH2DNV8PTYa/NonBvF9Wfpn9zRNnIyrr6C5+0XRjpYPM="
    }
  ],
  "n_2": "kRNuTr7JcrhXvwIfR+EUKQ=="
}
```

The `combinedProofs` array contains, for each credential being issued within the session (one in this example), a [zero-knowledge proof](zkp.md) of the Yivi app's secret key (which will become [the first attribute](overview.md#the-secret-key-attribute) of the credential(s) being issued). In addition, in case of [combined disclosure-issuance sessions](session-requests.md#issuance-requests) this array will also contain [`gabi.ProofD`](https://pkg.go.dev/github.com/privacybydesign/gabi#ProofD) instances, like the `proofs` array in [disclosure sessions](irma-protocol.md#disclosure-post-irma-session-clienttoken-proofs).

When responding to this HTTP request (see below) with its signature(s) over the attributes, the IRMA server includes a zero-knowledge proof of its own, proving that it correctly constructed its signatures. The `n_2` field contains the nonce over which the issuer is to construct that zero-knowledge proof (c.f. the `nonce` in the session request, see [above](irma-protocol.md#get-irma-session-clienttoken-request)).

### The IRMA server's response

When receiving data from the Yivi app on any of the above three endpoints, the IRMA server first verifies the proofs contained in them (note that the app sends zero-knowledge proofs for each session type). The Yivi app is a challenge-response protocol, so referring back to the `nonce` in the session request (as [mentioned earlier](irma-protocol.md#get-irma-session-clienttoken-request)) which acts as the challenge, the data that the Yivi app sends to these endpoints must be a valid response to that particular challenge.

The server responds with an [`irma.ServerSessionResponse`](https://pkg.go.dev/github.com/privacybydesign/irmago#ServerSessionResponse) for each of the three above endpoints. For example:

```json
{
  "proofStatus": "VALID",
  "nextSession": {
    "u": "https://example.com/irma/session/QBeuXS3iWcYY76rdHfP6",
    "irmaqr": "disclosing"
  },
  "sigs": [
    {
      "signature": {
        "A": "QyeTB0DyqPV9563K0bANaQqQ+zshEUfjcc/fB0pGgc4TXVtu+0mTvohePatBNt3G7GJeJEjnjJHW5AvmhpN74PWJiqXxjlrlkAIJ3oKW0BDIT4t1eaicpXeICq2MU441YWR5dxNX5oYB3fNqjGPnXNJA5XuIBnME3hPl1M4EgTc=",
        "e": "EAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACBXzy0nbspQi7Bn5leUl",
        "v": "D3D/nmdPqJ0s3f936ZQ6mKm73J/nA2Aoc0whTGXnYLfr1PwpuHCeI5uSZ5P2TI92h6GSKbiWdmRSjYZPq9K4uqITaJp+ojKwNEomgcUrEKb+VK+dPjEzwvSwC5MoyfPhoEjxSsRiOgCX4rqAheAdFYQru481hZz7ljmNrp0NgYb8vjxLE3YGshamhRYBe03aO1ZSuS8I54qrRQqqOsoL5+D/olZYlv9K5RV8ndz2Q8Kp/0GpB3rTo8okohP5Sx1uAKKJg10bv+Z0OolGli3o76bbc5I6",
        "KeyshareP": null
      },
      "proof": {
        "c": "39uLUi9wzUQMFes7y5l7Es/Xm2LBRJdfI0cFz1AdtmA=",
        "e_response": "FmokcMY3fjT7G4qGMZAnkfgofCm/xmnzNLxxulxsOALtTWCePNi9W5yBe7y83DT6KBBaOmvf29OunzjorK9DOnXaSt64DX8hLw8J/pqn+1RfpvKpBwXfILS26FP7iZVGuUmozp26sai0iuL7qiV1QL/eXD0C+6bgUtcWUusBbR0="
      }
    }
  ]
}
```

Here the fields are as follows:

* `proofStatus`: an [`irma.ProofStatus`](https://pkg.go.dev/github.com/privacybydesign/irmago#ProofStatus) constant containing whether or not the server successfully validated the proofs that it received from the app. Anything else than `VALID` is considered an error by the app. (The same status is reported to the requestor in the session result, see below.)
* `nextSession` optionally contains the [session pointer](https://pkg.go.dev/github.com/privacybydesign/irmago#Qr) to the next session in the [session chain](chained-sessions.md). If this field is present, then after processing the current response the app will immediately start the next session using this session pointer.
* In case of issuance sessions, the `sigs` array contains the issuer's signatures over each of the credentials being issued (if `proofStatus` is `VALID`). For each object within this array, the `signature` object contains the signature itself, and the `proof` is the issuer's proof of correctness of the signature, over the nonce `n_2` mentioned [above](#issuance-post-irma-session-clienttoken-commitments).

After this, the session state is set to [`DONE`](https://pkg.go.dev/github.com/privacybydesign/irmago#ServerStatusDone), and the requestor can retrieve the [session result](https://pkg.go.dev/github.com/privacybydesign/irmago/server#SessionResult) at the [`GET /session/{requestorToken}/result`](api-irma-server.md#get-session-requestortoken-result) or [`GET /session/{requestorToken}/result-jwt`](api-irma-server.md#get-session-requestortoken-result-jwt) endpoints, or using the [`GetSessionResult()` function](https://pkg.go.dev/github.com/privacybydesign/irmago/server/irmaserver#Server.GetSessionResult).

## Cancelling: `DELETE /irma/session/{clientToken}`

If the user decides to cancel the session, or if the Yivi app finds that it does not possess the attributes being requested, or if the app encounters any error during any part of the session, then the the app cancels the session by invoking `DELETE /irma/session/{clientToken}`. The server responds with HTTP status 200 and no response body. The session state is set to [`CANCELLED`](https://pkg.go.dev/github.com/privacybydesign/irmago#ServerStatusCancelled).

## Errors

If the server encounters any error when handling invocations of any of the endpoints documented here, it will set the session state to `CANCELLED`, and instead of responding to the Yivi app with the objects documented above it responds with an [`irma.RemoteError`](https://pkg.go.dev/github.com/privacybydesign/irmago#RemoteError), containing details about the error. For example, when invoking any of the above four endpoints using a `clientToken` that does not refer to an existing session in the `CONNECTED` state, the server responds with the following:

```json
{
  "status": 400,
  "error": "SESSION_UNKNOWN",
  "description": "Unknown or expired session"
}
```

The Yivi app will then inform the user that an error occurred, and in some cases allow the user to report the error to the IRMA team.
