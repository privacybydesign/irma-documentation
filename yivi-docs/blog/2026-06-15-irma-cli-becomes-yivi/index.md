---
slug: 2026-irma-cli-becomes-yivi
title: "Migrating from the `irma` CLI to `yivi`"
authors: [wouterensink]
tags: [yivi, irma, irmago, migration, cli]
---

With **irmago 1.0** (currently in beta), the command-line tool you've been calling `irma` is shipped as `yivi`, and the Go package that issuer and verifier requestor servers import has moved with it. This post is for anyone running `irma server`, `irma session`, or the Docker image in production, and for anyone whose service imports `github.com/privacybydesign/irmago` to construct or sign session requests — what changes, what stays the same, and how to migrate.

<!-- truncate -->

## What changed

The repository name does not change. `github.com/privacybydesign/irmago` stays where it is, and the Go module path stays the same. What moves is the binary:

- The CLI's entry point moves from `irma/cmd/` to `yivi/cli/`.
- The binary is built and shipped as `yivi`.
- The Docker image is published as `ghcr.io/privacybydesign/yivi`.
- The former top-level commands become subcommands of `yivi irma`:

```
- irma server
- irma session
- irma scheme
+ yivi irma server
+ yivi irma session
+ yivi irma scheme
```

All flags and subcommands under `yivi irma ...` carry over unchanged from `irma ...`. Configuration files, environment variables, and on-disk layouts are unchanged.

For server integrators, the rename has a mirror at the Go-package level: the top-level package that used to live at `github.com/privacybydesign/irmago` has moved into the `irma` subpackage. The module path itself is unchanged. See [Impact on issuer and verifier requestor servers](#impact-on-issuer-and-verifier-requestor-servers) below for the import-path change and a sample diff.

## Why `yivi irma` and not just `yivi`

`yivi irma` is the only subcommand today, so the nesting may look unnecessary. It is structural: irmago is no longer just an IRMA toolkit. The 1.0 release lays the groundwork for tooling around the broader EUDI stack — for example, helpers for creating certificate signing requests for issuer and verifier certificates — to live as siblings under the same top-level binary (`yivi <something>`) rather than being grafted onto a tool named after one of the protocols it speaks. Putting IRMA-specific commands under `yivi irma` from day one means future subcommands slot in cleanly, and integrators only need to learn the layout once.

## Versions and the old `irma` binary

There is no `irma` alias inside the new `yivi` binary. If you are upgrading past `0.19.2`, you must update the binary name in scripts, Dockerfiles, systemd units, and anywhere else you invoke it. The line between the two binaries is clean and version-shaped:

- `irma` ships up to and including **irmago 0.19.2**. That binary continues to exist at that version, but **will not receive any further updates** — no security fixes, no compatibility patches, no new features.
- `yivi` ships from **irmago 1.0** onward, currently in beta.

If you are staying on 0.19.2 you do not need to do anything today, but you should plan a migration: the 0.x line is end-of-life as of the 1.0 release. We encourage everyone running the old binary in production to start tracking the 1.0 beta, both to keep getting updates and to surface migration issues before 1.0 ships at the end of June.

## Migration checklist

For most users the migration is mechanical. The shape of every command stays the same; only the executable name (and one level of nesting) changes.

**Direct CLI usage.** Replace `irma <subcommand>` with `yivi irma <subcommand>`. Flags, positional arguments, and exit codes are identical:

```
- irma server --config /etc/irma/config.json
+ yivi irma server --config /etc/irma/config.json
```

**Docker.** Pull the new image and update the entrypoint or command if you override it:

```
- docker pull ghcr.io/privacybydesign/irma
- docker run ghcr.io/privacybydesign/irma server
+ docker pull ghcr.io/privacybydesign/yivi
+ docker run ghcr.io/privacybydesign/yivi irma server
```

Note the change to the `docker run` invocation: it is now `yivi irma server`, not `irma server`. The default entrypoint in the published image runs `yivi`, so positional arguments shift one position to the right.

**CI pipelines.** Any pipeline step that runs `irma` directly, installs the `irma` binary from a release artifact, or references the old Docker image needs the same two replacements: binary name, and the extra `irma` subcommand level.

**Configuration and environment.** No changes. Existing `--config` files, `IRMA_*` environment variables (where used), keyshare configurations, scheme paths, and TLS material all work as-is. If something stopped working after the rename and looks config-related, please [open an issue on irmago](https://github.com/privacybydesign/irmago/issues) — the rename is intended to be purely cosmetic at the operations layer.

## Impact on issuer and verifier requestor servers

Most issuer and verifier deployments fall into one of two shapes: they run a standalone `irma server` (now `yivi irma server`) and talk to it over HTTP, or they embed irmago directly in a Go service to build session requests and sign request JWTs. The first group is fully covered by the binary-rename steps above. The second group has one additional change to make.

**The module path is unchanged. The top-level package has moved.** In 0.x, the irmago module exposed its core types from a package at the module root, named `irma`. In 1.0, those types live in `github.com/privacybydesign/irmago/irma` — same module, one path component deeper. This mirrors the CLI restructuring: IRMA-specific code now lives under an `irma/` namespace inside the toolkit rather than being the toolkit's identity.

**The import change is one line.** Where you previously aliased the bare module path to `irma`, you now import the explicit `irma` subpackage and the alias falls away:

```
- irma "github.com/privacybydesign/irmago"
+ "github.com/privacybydesign/irmago/irma"
```

Call sites — `irma.NewIssuanceRequest`, `irma.NewCredentialTypeIdentifier`, `irma.SignSessionRequest`, and so on — are unchanged. They were already qualified with the `irma` prefix; only the import line shifts.

**`go.mod` bumps to the 1.0 line.** Update `github.com/privacybydesign/irmago` to the current 1.0 beta tag. A real integration's diff looks like this (taken from the [go-sms-issuer](https://github.com/privacybydesign/go-sms-issuer) phone-number issuer):

```
- github.com/privacybydesign/irmago v0.19.2
+ github.com/privacybydesign/irmago v1.0.0-beta.1
```

```
- irma "github.com/privacybydesign/irmago"
+ "github.com/privacybydesign/irmago/irma"
```

The rest of the issuer code — `irma.NewIssuanceRequest`, the credential request shape, the JWT signing call — compiles unchanged against the new package location. For a working reference, the `irmago-v1-beta` branch of go-sms-issuer is exactly this two-file change.

**Other 0.19 → 1.0 API changes exist but are out of scope here.** The 1.0 release contains substantive irmago changes beyond the rename — new OpenID4VCI types, the schemaless session layer, batched SD-JWT issuance fields (e.g. `SdJwtBatchSize` on credential requests). Those belong with the broader 1.0 release notes rather than this post; see the [irmago changelog](https://github.com/privacybydesign/irmago/blob/master/CHANGELOG.md) for the full list.

## A note on the beta

irmago 1.0 — and therefore the `yivi` binary — is currently in beta ahead of the end-of-June release. If you operate `irma` in production today, the best thing you can do is pull the beta image into a staging environment and run your integration through it. Issues found now are issues that get fixed before 1.0 ships, and the smoother the migration is for early movers, the smoother it will be for everyone else.

Source on GitHub: [privacybydesign/irmago](https://github.com/privacybydesign/irmago). Questions about migrating a specific deployment: [support@yivi.app](mailto:support@yivi.app).
