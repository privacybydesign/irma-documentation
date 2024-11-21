---
title: Stateless IRMA server
---

For each IRMA session the [IRMA server](irma-server.md) needs to keep track of the [session state](irma-protocol.md#the-session-state). 
By default the session state is kept in memory. With version 0.9.0 of the IRMA server it is possible to run the IRMA server in a stateless mode. The session data will then be stored in a Redis datastore. This page explains how the stateless IRMA server works and how to run the IRMA server in stateless mode.

## Overview
During an IRMA session, the IRMA server acts as a state machine which is described in detail on the [IRMA protocol page](irma-protocol.md). The IRMA session progresses through various states such as `INITIALIZED`, `CONNECTED` and `DONE`. The IRMA server contains logic when to switch from one state into the other. The state itself can be kept in memory or, alternatively, in a Redis data store. Saving the session state in memory requires no extra setup and is currently the default behaviour of the IRMA server. However, the data in memory cannot be shared between several IRMA servers. This means that you cannot scale the IRMA server horizontally when using this in-memory solution. Next to poor scalability, the in-memory solution is problematic when the IRMA server needs to be restarted or - even worse - when the server crashes. In such cases, the in-memory information of all sessions gets irreversibly lost.

With the new feature of running the IRMA server in stateless mode, the session data gets decoupled from the IRMA server, making the server itself stateless. The IRMA server still contains the logic when to switch between states but will retrieve and update the session data from and to a dedicated store. Hence, several IRMA servers can be run in parallel and connect to the same data store. Also, no data is lost when the IRMA server restarts or crashes.

### Use cases
* Scaling the IRMA server horizontally, i.e. running several IRMA severs in parallel.
* Preventing data loss when restarting an IRMA server.
* Preventing data loss in case of IRMA server crashes.

## Running the IRMA server in stateless mode
### Example
You can start the IRMA server in stateless mode by setting the `store-type` option to `redis`. Additionally you need to provide a Redis server address and password. For test purposes you can override the need for a password by setting the `redis-allow-empty-password` option to `true`. However, make sure to use a secure Redis password in production. Your Redis data store will contain sensitive data and must be password-protected.

```
irma server -vv --store-type redis --redis-addr "localhost:6379" --redis-pw "placeholderPassword"
```

If you want to run several IRMA servers, you can now run them behind a load balancer and connect them to the same Redis instance.

By default the IRMA server connects to Redis with TLS, using the system store of certificate authorities. Alternatively, you can specify the certificate that Redis uses, or the certificate authority with which that certificate is signed, using the `redis-tls-cert` or `redis-tls-cert-file` options. A certificate may be configured in Redis as follows:

```
requirepass placeholderPassword

# Disable the non-TLS port completely
port 0
# Enable TLS on the default Redis port
tls-port 6379

# X.509 certificate and a private key
tls-cert-file /path/to/cert.pem
tls-key-file /path/to/privkey.pem

# Disable TLS client authentication
tls-auth-clients no
```

It is also possible to disable TLS altogether for connections to Redis, using the `redis-no-tls` option.

> In production, always using TLS for Redis is recommended. If you disable TLS, be sure to run your Redis server in an internal network protected against unauthorized access.

### Using multiple Redis instances
The IRMA server supports Redis in Sentinel mode, which allows you to use multiple Redis instances in a failover configuration. For data consistency, we currently require at least 1 replica to be present. This means that you need a minimum of 2 replicas for high availability. Please check the [configuration options](irma-server.md#stateless-mode) for more information about this mode.

We currently do not support Redis in cluster mode. If you need support for Redis Cluster, please contact us.

### Server-sent events
Currently the IRMA server does not support a stateless mode in combination with server-sent events. Please contact us, should you be in need of this combination.
