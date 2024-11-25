---
title: Chained sessions
---

Since version 6.1.0 of the [Yivi app](yivi-app.md) and 0.8.0 of the [IRMA server](irma-server.md), multiple [IRMA sessions](what-is-irma.md#session-types) may be chained together by the requestor into a single flow. After the Yivi app user has started the first session (for example, by scanning a QR code), she then passes through multiple session screens, as shown here. In this example, the requestor uses a disclosure session to retrieve the user's name and then immediately afterwards issues that into a new credential.

<div className="center" style={{ marginBottom: "1em" }}>
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

This page documents how this feature works.

## The `nextSession` URL

An [extended session request](session-requests.md#extra-parameters) may now contain a `nextSession` object which must contain a `url` field. If so, then at the end of the session (i.e., after the user has agreed to perform the session in the session screen of the Yivi app), the IRMA server will POST the [session result](https://pkg.go.dev/github.com/privacybydesign/irmago/server#SessionResult) in JSON (as returned by the [`/result` endpoint](api-irma-server#get-session-requestortoken-result)) to that `url`. The server at that `url` must then respond with one of the following:

* a new (extended) session request in JSON, which may depend on the received session result;
* HTTP 204, signifying that there is no next session to be performed. In this case, no further sessions take place and the flow stops normally.

In the first case, the IRMA server will then start a new session using that session request and pass it to the Yivi app, which will show the corresponding session screen. Thus, the app user moves from the first session screen immediately to the next one.

The session request returned by the server at the `nextSession` URL may itself contain a `nextSession` object (possibly but not necessarily referring to the same server). If so, then yet another session will be started using the same mechanism, after the one specified by the current session request. In this fashion, a session chain can consist of any number of sessions (although ideally it is kept as short as possible for optimal UX; in most cases two sessions will suffice).

## Signing POSTed session results

If a [JWT private key is installed in the IRMA server](irma-server.md#signed-jwt-session-results), then instead of POSTing plain JSON session results (as returned by the [`/result` endpoint](api-irma-server#get-session-requestortoken-result)) to the `nextSession` URL, the server will POST a session result JWT signed with the private key (as returned by the [`/result-jwt` endpoint](api-irma-server.md#get-session-requestortoken-result-jwt)) to the `nextSession` URL. The server at that URL can verify the JWT using the corresponding public key to authenticate the request as coming from the expected IRMA server.

If a JWT private key is not installed, then the boolean `--allow-unsigned-callbacks` option must be passed to the IRMA server before chained sessions may be used, to explicitly enable POSTing unsigned session results. Otherwise, the server will reject session requests containing a `nextSession` object.

> If no JWT private key is installed, then the `nextSession` URL should either not be publically reachable, or it should include a secret token (e.g. `https://example.com/cX5aTins5kEZpjDpfYcN`) and have TLS enabled (which it should anyway as personal data will be POSTed to it). Otherwise there is no way for the server at the `nextSession` URL to distinguish POSTs from your IRMA server from POSTs made by anyone else.

## Use cases

* Retrieving an attribute and then issuing it into a new credential.
* Retrieving an attribute; use that to lookup related data; and issue that data into new credentials.
* Refreshing a nearly expired credential, by retrieving an identifying attribute from it; use that to lookup fresh values for the other attributes, and issue a fresh credential.

## Example

In this example, we use an IRMA disclosure request to retrieve the user's name, and then issue that into a new credential, as shown in the two screenshots on top of this page. A live demo very similar to this may be found [here](https://privacybydesign.foundation/demo/irmaTubePremium).

First, we deploy the following Go program at `https://example.com`. This program unmarshals the request body into a session result, takes the discloed attribute from it, and returns an issuance request containing that attribute.

Note that this program assumes that no JWT private key is installed; see the remark in the previous paragraph.

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

The session chain can then be started by sending the following session request to our IRMA server.

<!--DOCUSAURUS_CODE_TABS-->
<!--Extended session request (JSON)-->
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
<!--Extended session request (Go)-->
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
<!--END_DOCUSAURUS_CODE_TABS-->

After the user discloses the `irma-demo.gemeente.personalData.fullname` attribute, the IRMA server POSTs it to `https://example.com`. Our Go server responds to the IRMA server with the `issuanceRequest` found near the end of the program. Next, the IRMA server immediately starts this issuance session with the user's Yivi app, resulting in the screenshots shown on top of this page.

## Differences with combined issuance-disclosure requests

[Combined issuance-disclosure requests](session-requests.md#issuance-requests), i.e. issuance requests with a nonempty `disclose` field requesting attributes to be disclosed, is another way of first requesting and then issuing attributes from/to an Yivi app user within a single flow. Thus, this is very similar to a session chain consisting of first a disclosure request and then an issuance request. However, contrary to session chains, this flow is started using a single session request. Thus, when using combined issuance-disclosure requests it is impossible for the issued attributes to depend on the disclosed attributes, because at the time the session request is composed the value of the disclosed attributes are not yet known.

Comparing the two, chained sessions are more powerful in the following ways:

* As mentioned, sessions later in the chain may depend on the session results of earlier sessions in the chain;
* Session chains can consist of more than two sessions (although this may lead to bad UX);
* The sessions occuring in a session chain may be of any type (although first disclosure and then issuance is probably the most common scenario).
