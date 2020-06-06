---
title: irma server library
id: version-v0.5.0-rc.3-irma-server-lib
original_id: irma-server-lib
---

<a href="https://godoc.org/github.com/privacybydesign/irmago/server/irmaserver" class="godoc"><img src="https://godoc.org/github.com/privacybydesign/irmago/server/irmaserver?status.svg" alt="GoDoc"></a>

`irmaserver` is a Go library providing a HTTP server that handles IRMA session with the IRMA app, and functions for starting and managing IRMA sessions.

## Installing

```shell
go get github.com/privacybydesign/irmago
```

## Configuring
The server is configured by passing a `server.Configuration` instance to `irmaserver.New()`. For the options and their meaning, see [Godoc](https://godoc.org/github.com/privacybydesign/irmago/server/#Configuration).

## Email

Users are encouraged to provide an email address with the `Email` option in the `server.Configuration` struct, subscribing for notifications about changes in the IRMA software or ecosystem. [More information](email.md).

## Example

```go
package main

import (
	"github.com/privacybydesign/irmago/server"
    "github.com/privacybydesign/irmago/server/irmaserver"
    "net/http"
    "fmt"
    "encoding/json"
)

func main() {
	configuration := &server.Configuration{
	    // Replace with address that IRMA apps can reach
	    URL: "http://localhost:1234/irma",
	}

	err := irmaserver.Initialize(configuration)
	if err != nil {
	   	// ...
	}

	http.Handle("/irma/", irmaserver.HandlerFunc())
	http.HandleFunc("/createrequest", createFullnameRequest)

	// Start the server
	fmt.Println("Going to listen on :1234")
	err = http.ListenAndServe(":1234", nil)
	if err != nil {
		fmt.Println("Failed to listen on :1234")
	}
}

func createFullnameRequest(w http.ResponseWriter, r *http.Request) {
	request := `{
	    "type": "disclosing",
	    "content": [{ "label": "Full name", "attributes": [ "pbdf.nijmegen.personalData.fullname" ]}]
	}`

	sessionPointer, token, err := irmaserver.StartSession(request, func (r *server.SessionResult) {
	    fmt.Println("Session done, result: ", server.ToJson(r))
	})
	if err != nil {
		// ...
	}

	fmt.Println("Created session with token ", token)

	// Send session pointer to frontend, which can render it as a QR
	w.Header().Add("Content-Type", "text/json")

	jsonSessionPointer, _ := json.Marshal(sessionPointer)
	w.Write(jsonSessionPointer)
}
```

## See also

* The Go library [`requestorserver`](https://godoc.org/github.com/privacybydesign/irmago/server/requestorserver) wraps the functions that this library exposes for starting and managing IRMA sessions into HTTP endpoints.
* The [`irma server`](irma-server.md) command wraps `requestorserver` into an executable.
* The [client](https://godoc.org/github.com/privacybydesign/irmago/irmaclient) corresponding to this server is implemented by the [IRMA mobile app](irma-app.md).
