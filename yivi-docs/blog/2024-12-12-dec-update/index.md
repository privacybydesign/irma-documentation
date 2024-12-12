---
slug: vision, roadmap
title: December Update
authors: [saravahdatipour, wouterensink]
tags: [yivi, update]
---

The end of 2024 is in sight, and our team is working hard to deliver as much progress to the project as possible. As part of our responsibility to the community, we're exited to tell you about some of the improvements we have been working on. 


## Email Templates
In Yivi, the user is the central focus, and that is about more than just privacy. The look and feel for all interactions 
between the user and the Yivi ecosystem should be welcoming and user-friendly. 
That's why we've improved the verification emails users receive when adding their email address to their wallet, by giving it the Yivi look and feel.

## Stateless SMS Issuer
As mentioned in the roadmap blog, we switched to Kubernetes for a robust and stable infrastructure. Part of the benefits of Kubernetes is the ability
to run multiple instances of the same server simultaniously, allowing for high availability and little downtime.
When Kubernetes gets a request it will automatically pick one of these servers to send the request to. Subsequent calls to the same hostname could end up
in different instances of the server.

In order for a server to be able to run in such a distributed fashion, it needs to be stateless.
This doesn't mean that there is no state whatsoever, but that the state cannot be part of the server itself. 
Instead the state needs to be moved to somewhere outside of the server, for example a database.

Most of our components already had this property, but a couple of them had yet to be updated.

One of the remaining components was the SMS Issuer. 
Its state consists of the ongoing verification requests and some info about previous requests in order to do some rate limiting.

This week we took the time to make the SMS Issuer stateless by moving its state to Redis.
We did this by putting state access in the Java code behind interfaces and making two implementations of these interfaces:
one for in-memory and one for Redis.
This allows us to keep backwards compatibility while adding this new stateless property as opt-in.

## Moving to Production Environment
