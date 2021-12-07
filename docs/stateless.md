---
title: Stateless IRMA server
---

For each IRMA session the [IRMA server](irma-server.md) needs to keep track of the [session state](irma-protocol#the-session-state). 
By default the session state is kept in memory. With version 0.9.0 of the IRMA server it is possible to run the IRMA server in a stateless mode. The session data will then be stored in a Redis datastore. This page explains how the stateless IRMA server works and how to run the IRMA server in stateless mode.

## Overview
During an IRMA session, the IRMA server acts as a state machine which is described in detail on the [IRMA protocol page](http://localhost:3000/docs/next/irma-protocol#the-session-state). The IRMA session progresses through various states such as `INITIALIZED`, `CONNECTED` and `DONE`. The IRMA server contains logic when to switch from one state into the other. The state itself can be kept in memory or, alternatively, in a Redis data store. Saving the session state in memory requires no extra setup and is currently the default behaviour of the IRMA server. However, the data in memory cannot be shared between several IRMA servers. This means that you cannot scale the IRMA server horizontally when using this in-memory solution. Next to poor scalability, the in-memory solution is problematic when the IRMA server needs to be restarted or - even worse - when the server crashes. In such cases, the in-memory information of all sessions gets irreversibly lost.

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

> By default Redis does _not_ use TLS. Since the session data is not encrypted before being sent to Redis, you should turn on TLS for your Redis server!

Your Redis server configuration should look as follows:
```
requirepass placeholderPassword

// Disable the non-TLS port completely
port 0
// Enable TLS on the default Redis port
tls-port 6379

// X.509 certificate and a private key
tls-cert-file /path/to/redis.crt
tls-key-file /path/to/redis.key

// Disable TLS client authentication
tls-auth-clients no
```

The IRMA server already authenticates to the Redis server using a password. The IRMA server currently does not support mutual TLS for the Redis connection. Therefore, the `tls-auth-clients` in the Redis configuration is set to `no`. For more information on TLS support in Redis see the [Redis documentation](https://redis.io/topics/encryption).

If you want to run several IRMA servers, you can now run them behind a load balancer and connect them to the same Redis instance.

> Currently a simple locking mechanism is implemented. When running several Redis instances in parallel, edge cases may occur. We recommend to use a single Redis instance.

### Using multiple Redis instances
Currently the IRMA server does not support Redis clusters or a master/slave mode. You can only connect to one Redis address. This means that the Redis connection is currently a bottleneck and single point of failure. You could use Redis enterprise which will let you connect with one outward-facing Redis connection and will provide you with an underlying failover mechanism.  

Please get in touch with us, should you wish the IRMA server to support multiple Redis instances.

> Be aware that running a single Redis instance only makes the Redis connection a single point of failure. The current implementation makes the IRMA server stateless but only moves the single point of failure from the IRMA server to Redis.

### Using stateless mode in combination with server-sent events
Currently the IRMA server does not support a stateless mode in combination with server-sent events. Please contact us, should you be in need of this combination.