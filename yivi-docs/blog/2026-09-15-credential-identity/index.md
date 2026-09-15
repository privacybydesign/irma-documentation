---
slug: same-credential
title: "Who decides when a credential has been replaced?"
authors: [wouterensink]
tags: [yivi, eudi-wallet, openid4vci, arf, credentials, analysis]
---

*A new credential cannot tell a wallet whether an older one has become obsolete. During ordinary issuance, revocation must provide that signal. A retained link makes automatic background refresh the exception.*

<!-- truncate -->

<style>{`
  .ci-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(17rem, 1fr)); gap: 1rem; margin: 1.5rem 0; }
  .ci-card { border: 1px solid var(--ifm-color-emphasis-300); border-radius: 4px; padding: 1.1rem 1.2rem; background: var(--ifm-background-surface-color); }
  .ci-card .ci-title { font-size: 0.74rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--ifm-color-emphasis-700); margin-bottom: 0.8rem; }
  .ci-card dl { margin: 0 0 0.9rem; font-size: 0.92rem; line-height: 1.6; overflow: hidden; }
  .ci-card dt { float: left; clear: left; width: 6.4rem; color: var(--ifm-color-emphasis-700); font-weight: 400; }
  .ci-card dd { margin: 0 0 0.2rem 6.4rem; }
  .ci-verdict { border-top: 1px solid var(--ifm-color-emphasis-200); padding-top: 0.75rem; font-size: 0.95rem; font-weight: 700; color: var(--ci-verdict); }
  .ci-card.ci-keep { --ci-verdict: #1c6b58; }
  .ci-card.ci-replace { --ci-verdict: #8f6212; }
  [data-theme='dark'] .ci-card.ci-keep { --ci-verdict: #63c3a8; }
  [data-theme='dark'] .ci-card.ci-replace { --ci-verdict: #d9a441; }

  .ci-scroll { overflow-x: auto; border: 1px solid var(--ifm-color-emphasis-300); border-radius: 4px; margin: 1.5rem 0; }
  .ci-matrix { border-collapse: collapse; width: 100%; min-width: 44rem; margin: 0; display: table; }
  .ci-matrix thead th { font-size: 0.71rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; text-align: left; color: var(--ifm-color-emphasis-700); padding: 0.85rem 1rem; border: none; border-bottom: 1px solid var(--ifm-color-emphasis-400); background: var(--ifm-background-surface-color); }
  .ci-matrix tbody td, .ci-matrix tbody th { padding: 0.8rem 1rem; border: none; border-bottom: 1px solid var(--ifm-color-emphasis-200); vertical-align: middle; font-size: 0.92rem; line-height: 1.45; font-weight: 400; text-align: left; background: var(--ifm-background-surface-color); }
  .ci-matrix tbody tr:last-child td, .ci-matrix tbody tr:last-child th { border-bottom: none; }
  .ci-matrix tbody tr.ci-blind td, .ci-matrix tbody tr.ci-blind th { background: #fbf6ea; }
  [data-theme='dark'] .ci-matrix tbody tr.ci-blind td, [data-theme='dark'] .ci-matrix tbody tr.ci-blind th { background: #241d10; }
  .ci-matrix tbody tr.ci-blind th { box-shadow: inset 3px 0 0 0 #d9a441; font-weight: 600; }

  .ci-pill { display: inline-flex; align-items: center; font-size: 0.74rem; font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase; padding: 0.26rem 0.6rem; border-radius: 2px; white-space: nowrap; }
  .ci-pill.ci-same { color: var(--ifm-color-emphasis-700); background: var(--ifm-color-emphasis-200); }
  .ci-pill.ci-differ { color: #8f6212; background: #faf0dd; }
  .ci-pill.ci-v-keep { color: #1c6b58; background: #e6f2ee; }
  .ci-pill.ci-v-replace { color: #5c6472; background: #eceef3; }
  [data-theme='dark'] .ci-pill.ci-differ { color: #d9a441; background: #2a2113; }
  [data-theme='dark'] .ci-pill.ci-v-keep { color: #63c3a8; background: #14261f; }
  [data-theme='dark'] .ci-pill.ci-v-replace { color: #98a1b3; background: #1d222c; }
`}</style>

## A new credential can mean two things

You transfer from Finance to Legal. Your employer issues a fresh employee credential with your new department. That is exactly what should happen.

Your wallet now holds two employee credentials. One says Finance; the other says Legal. The old credential is still signed, unexpired, and not revoked.

The next time a verifier asks for your department, the wallet may offer both. Your employer has left Finance valid, so the wallet has no authoritative reason to suppress it.

![Two employee credentials in the wallet after a department transfer. Both have the same type and employer and are signed, unexpired and not revoked, so either can be offered.](./two-valid-employee-credentials.svg)

Now change one fact. You did not leave Finance; you joined Legal as a second department. In that case, both credentials should remain valid.

<div className="ci-cards">
  <div className="ci-card ci-keep">
    <div className="ci-title">You join a second department</div>
    <dl>
      <dt>Type</dt><dd>same as one you hold</dd>
      <dt>Issuer</dt><dd>same as one you hold</dd>
      <dt>Attributes</dt><dd><strong>differ</strong> from the stored credential</dd>
    </dl>
    <div className="ci-verdict">Issuer action: keep both valid</div>
  </div>
  <div className="ci-card ci-replace">
    <div className="ci-title">You transfer departments</div>
    <dl>
      <dt>Type</dt><dd>same as one you hold</dd>
      <dt>Issuer</dt><dd>same as one you hold</dd>
      <dt>Attributes</dt><dd><strong>differ</strong> from the stored credential</dd>
    </dl>
    <div className="ci-verdict">Issuer action: revoke the old credential</div>
  </div>
</div>

The wallet sees the same pattern in both cases: same type, same issuer, different attributes. Yet one case keeps both credentials valid, while the other makes the old one obsolete.

Attribute names do not resolve the ambiguity. A field describes its value, not whether an older statement remains true.

The employer knows what happened; the wallet does not. During ordinary issuance, the issuer must express that the old credential is obsolete by revoking it.

## Replacement hides two mechanisms

Here, a **logical credential** is the unit shown to the user as one card: one credential type from one provider with one set of attribute values.

Behind that card, the wallet may store several signed technical copies. Their salts, keys, signatures, and validity timestamps may differ, but each makes the same statement.

In other words, one logical credential consists of a batch of one or more technical credentials.

![One logical credential shown as a card, backed by four signed technical copies. Type, issuer and attribute values are identical across the copies and are the three inputs Yivi hashes; salts, digests, holder keys, signatures and validity timestamps differ per copy and are omitted.](./logical-credential.svg)

When attribute values change, the result is a new logical credential. The issuer decides whether the older credential remains valid by leaving it valid, letting it expire, or revoking it.

The word *replacement* therefore covers two mechanisms:

1. **Content identity** groups new technical copies with the same logical credential during refresh.
2. **Revocation status** tells wallets and verifiers that an old logical credential is no longer valid.

Content identity is calculated from the credential. Revocation is an issuer action on a credential it previously issued.

These mechanisms answer different questions: “Are these new copies of the same statement?” and “Is the former statement still valid?”

## What content matching can decide

Yivi treats an arriving credential as another copy of a stored logical credential when three things match:

1. the **type** (`vct` for SD-JWT VC, `docType` for mdoc),
2. the **issuer**,
3. the **attribute values**.

The wallet hashes those inputs. A matching hash lets the new batch refresh the stored batch. A different hash represents a different logical credential.

The hash omits salts, digests, holder keys, signatures, and validity timestamps. Those values change between issuances, even when the logical credential does not.

The ARF describes the same rule in a note attached to [`PAD_02`][pad-02]:

> Physical PIDs or attestations correspond to a logical one if they have not only the same attestation type and **Provider**, but also the same attribute values.

This works well for routine refresh. Credentials expire, and batches of single-use copies run out. The wallet can fetch fresh copies with new keys and timestamps but unchanged attributes.

An age credential, for example, keeps saying `age_over_18: true`. Its hash still matches, so fresh copies update the batch and the wallet shows one card rather than twelve.

Content matching may also group exact duplicates during ordinary issuance. It cannot decide that a different logical credential has made an older one obsolete.

OpenID4VCI describes the alternative plainly: a wallet may hold several credentials of the same type “without knowing which one is the latest”.

<details>
  <summary>View the complete content-matching comparison</summary>
  <div className="ci-scroll" role="region" aria-label="What the wallet can observe" tabIndex={0}>
    <table className="ci-matrix">
      <thead>
        <tr>
          <th>What really happened</th>
          <th>Type</th>
          <th>Issuer</th>
          <th>Attributes</th>
          <th>Required handling</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope="row">PID renewed, nothing changed</th>
          <td><span className="ci-pill ci-same">Same</span></td>
          <td><span className="ci-pill ci-same">Same</span></td>
          <td><span className="ci-pill ci-same">Same</span></td>
          <td><span className="ci-pill ci-v-replace">Refresh copies</span></td>
        </tr>
        <tr>
          <th scope="row">Email credential re-issued unchanged</th>
          <td><span className="ci-pill ci-same">Same</span></td>
          <td><span className="ci-pill ci-same">Same</span></td>
          <td><span className="ci-pill ci-same">Same</span></td>
          <td><span className="ci-pill ci-v-replace">Refresh copies</span></td>
        </tr>
        <tr className="ci-blind">
          <th scope="row">You transfer departments</th>
          <td><span className="ci-pill ci-same">Same</span></td>
          <td><span className="ci-pill ci-same">Same</span></td>
          <td><span className="ci-pill ci-differ">Differ</span></td>
          <td><span className="ci-pill ci-v-replace">Revoke old</span></td>
        </tr>
        <tr className="ci-blind">
          <th scope="row">You join a second department</th>
          <td><span className="ci-pill ci-same">Same</span></td>
          <td><span className="ci-pill ci-same">Same</span></td>
          <td><span className="ci-pill ci-differ">Differ</span></td>
          <td><span className="ci-pill ci-v-keep">Keep both valid</span></td>
        </tr>
        <tr className="ci-blind">
          <th scope="row">A second diploma from the same university</th>
          <td><span className="ci-pill ci-same">Same</span></td>
          <td><span className="ci-pill ci-same">Same</span></td>
          <td><span className="ci-pill ci-differ">Differ</span></td>
          <td><span className="ci-pill ci-v-keep">Keep both valid</span></td>
        </tr>
        <tr>
          <th scope="row">Age credential from the state and from a shop</th>
          <td><span className="ci-pill ci-same">Same</span></td>
          <td><span className="ci-pill ci-differ">Differ</span></td>
          <td><span className="ci-pill ci-same">Same</span></td>
          <td><span className="ci-pill ci-v-keep">Keep both valid</span></td>
        </tr>
        <tr>
          <th scope="row">Email attested by your employer and by the state</th>
          <td><span className="ci-pill ci-same">Same</span></td>
          <td><span className="ci-pill ci-differ">Differ</span></td>
          <td><span className="ci-pill ci-same">Same</span></td>
          <td><span className="ci-pill ci-v-keep">Keep both valid</span></td>
        </tr>
      </tbody>
    </table>
  </div>
</details>

## Revocation is the replacement signal

When changed values make an old credential obsolete, the provider should issue the updated credential and revoke the old one.

:::warning Replacement starts with the issuer

[`VCR_03`][vcr-03] makes the PID or attestation provider the only ecosystem party responsible for executing revocation.

Under [`VCR_09`][vcr-09], that provider revokes an applicable credential after its attributes change. Under [`VCR_19`][vcr-19], the wallet should regularly check status.

:::

![Four steps after a department transfer. The employer issues the updated credential and revokes the old copies under VCR_09; the wallet checks status under VCR_19, then stops presenting the obsolete credential under ISSU_62.](./revocation-timeline.svg)

The provider controls the status of the credentials it issued. It can invalidate the exact old technical copies without asking the wallet to reconstruct a relationship from new contents.

After revocation, the old copies are no longer valid. Under [`VCR_19`][vcr-19], the wallet should regularly check their status and notify the user.

Under [`ISSU_62`][issu-62], the wallet stops presenting the obsolete credential and should delete it. A verifier that checks status can reject any surviving copy.

Revocation does not name the replacement. It solves the safety problem: the former statement is invalid, while the newly issued statement is valid.

The `VCR_09` mandate applies when the credential is revocable and would otherwise remain valid for at least 24 hours. Otherwise, expiry limits the overlap.

The wallet still cannot declare the credential invalid on the issuer's behalf.

## Background refresh is the exception

The relationship missing from an ordinary issuance can exist in the wallet's local refresh context.

If an automatic refresh starts from a stored credential, Yivi can retain that association throughout the issuance session: “this issuance updates credential X”.

That is not an inference from credential contents. The wallet knows which stored credential initiated the refresh.

![Yivi can start a refresh from a stored credential, but lose that local association before the new copies reach storage.](./reissuance-timeline.svg)

Today, Yivi discards the association and later tries to reconstruct it from the content hash. Content comparison cannot recover context after it has been discarded.

OpenID4VCI lets a wallet obtain an updated credential with a valid access token, or use a refresh token to obtain one.

For a device-bound PID or attestation, ARF [`ISSU_65`][issu-65] requires the provider to verify that the re-issued credential goes to the same Wallet Unit.

Neither mechanism identifies a particular stored credential as the predecessor. A refresh token is not, by itself, a stable pointer to one logical credential.

[`ISSU_59`][issu-59] requires the wallet to compare old and new values during re-issuance and notify the user. Retaining the local association gives Yivi the context needed for that comparison.

User-initiated issuance is different. A universal link, QR code, or link in an email starts an authorization with no stored credential attached.

The result carries no more context than a first-time issuance. The provider must revoke any obsolete credential; Yivi should store the new one and follow the status of the old one.

## Technical details

The following details explain why Yivi hashes type, issuer, and attributes, and why the issuer input must remain stable. They support the rule; they do not determine validity.

### Why type and issuer both matter

The type says what kind of credential this is. In SD-JWT VC it is the `vct` claim; in mdoc it is the `docType`. It identifies neither the subject nor the issuer.

The issuer says who stands behind the claims. Yivi derives that identity differently by format:

* **SD-JWT VC** uses the `iss` claim when present. Otherwise, it uses the identity in the certificate that signed the credential.
* **mdoc** has no issuer field in the document. Its issuer identity comes from the certificate chain used to sign it.
* If neither yields a usable name, Yivi falls back to the credential issuer URL used during issuance.

Consider two `age_verification` credentials that say `age_over_18: true`. One comes from the Dutch state and the other from a supermarket loyalty programme.

They make the same statement, but at different trust levels. A verifier may accept one issuer and reject the other, as the [trust levels post](/blog/who-vouches-for-you) explains.

### Why issuers are fragile

The hash assumes that Yivi derives the same identity every time the same provider issues a credential. That assumption is more fragile than it looks.

For SD-JWT VC, a changed `iss` value changes the issuer input. For mdoc, a changed name in the signing certificate can do the same.

When the credential issuer URL is the fallback, a new domain, path, or trailing slash can also produce a different issuer identity.

If the type and attributes stay the same but the derived issuer identity changes, the complete hash changes. Yivi then treats the new technical credentials as a different logical credential.

The new credential may still be valid and verifiable. The failure is local continuity: the incoming batch no longer replaces the existing card, so the wallet keeps both.

Rotating keys or certificates is harmless to grouping only when the issuer identity that Yivi derives remains unchanged.

Today, issuers must keep that identity stable across renewals. Supporting intentional changes would require an explicit migration or alias mechanism; content hashing alone cannot connect the old and new identities.

## If you issue credentials

Credential replacement starts with the issuer:

1. Issue the updated credential.
2. Revoke the obsolete technical copies when their claims are no longer true.
3. Support automatic refresh so the wallet can update its local record without interrupting the user.
4. Keep the issuer identity stable across renewals as much as possible.

Do not rely on matching type, issuer, or attributes to make a wallet invalidate an old credential. Those fields cannot distinguish a department transfer from an additional department.

During ordinary issuance, Yivi should follow revocation status. Only an automatic refresh may use a retained local association to replace the credential that initiated it.

If a credential cannot be revoked, its validity period determines how long an obsolete value remains usable. That is part of the issuer's credential design.

If you run an issuer and want to discuss your re-issuance flow, or think we have this wrong, we would like to hear from you: [support@yivi.app](mailto:support@yivi.app).

## Sources

* [OpenID for Verifiable Credential Issuance 1.0](https://openid.net/specs/openid-4-verifiable-credential-issuance-1_0-final.html) — batch issuance and refreshing issued credentials
* [EUDI Architecture and Reference Framework](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework) — logical versus technical attestations, [`VCR_03`][vcr-03], [`VCR_09`][vcr-09], [`VCR_19`][vcr-19], [`ISSU_59`][issu-59], [`ISSU_62`][issu-62], [`ISSU_65`][issu-65], [`PAD_02`][pad-02]
* [ARF discussion topic B: re-issuance and batch issuance of PIDs and attestations](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/blob/main/docs/discussion-topics/b-re-issuance-and-batch-issuance-of-pids-and-attestations.md)
* [SD-JWT-based Verifiable Credentials](https://datatracker.ietf.org/doc/draft-ietf-oauth-sd-jwt-vc/) — `vct` and `iss` claims
* [Who vouches for you? How the Yivi wallet will decide whom to trust](/blog/who-vouches-for-you)

[issu-59]: https://eudi.dev/3.0.0/annexes/annex-2/annex-2.03-high-level-requirements-by-category/#ISSU_59
[issu-62]: https://eudi.dev/3.0.0/annexes/annex-2/annex-2.03-high-level-requirements-by-category/#ISSU_62
[issu-65]: https://eudi.dev/3.0.0/annexes/annex-2/annex-2.03-high-level-requirements-by-category/#ISSU_65
[pad-02]: https://eudi.dev/3.0.0/annexes/annex-2/annex-2.03-high-level-requirements-by-category/#PAD_02
[vcr-03]: https://eudi.dev/3.0.0/annexes/annex-2/annex-2.03-high-level-requirements-by-category/#VCR_03
[vcr-09]: https://eudi.dev/3.0.0/annexes/annex-2/annex-2.03-high-level-requirements-by-category/#VCR_09
[vcr-19]: https://eudi.dev/3.0.0/annexes/annex-2/annex-2.03-high-level-requirements-by-category/#VCR_19
