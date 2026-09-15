---
slug: same-credential
title: "Is this the same credential? How the Yivi wallet decides what to replace, and where it cannot tell"
authors: [wouterensink]
tags: [yivi, eudi-wallet, openid4vci, arf, credentials, analysis]
---

*Every time a credential arrives, a wallet has to decide whether it replaces something you already hold or sits next to it. Get it wrong one way and you collect identical cards you cannot tell apart; get it wrong the other and the wallet deletes something you needed. This post is about how the Yivi wallet decides, why the issuer has to be part of that decision, and about a band of cases where no wallet built on today's specifications can tell the difference at all.*

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

## You move house

You move house. A few weeks later your PID provider issues you a fresh PID with the new address on it, which is exactly what should happen.

Your wallet now holds two PIDs. One says you live at Oude Gracht 1. The other says Nieuwe Gracht 5. Both are validly signed, neither has expired, and there is nothing in either of them that marks one as current. So the next time a verifier asks where you live, the wallet offers you both and asks you to choose — presenting an address you moved out of as an equally legitimate answer, and putting it back on the list every time you are asked, for as long as the credential has left to run.

Nobody implemented this wrong. The wallet is doing the best that can be done with what the issuance told it, and the issuance did not tell it much. The gap is not in anyone's code. It is in what today's specifications let an issuance say at all.

:::warning This is not a tidiness problem

It is tempting to read the symptom as clutter: two cards where there should be one, mildly annoying, a thing for a future release to clean up. It is not. The two cards are not interchangeable — one of them is simply wrong — and the wallet offers them to you as equals, every time, indefinitely.

Working out which of your own credentials is current is the job a wallet exists to do, and here it is quietly handed back to you. The ARF is unambiguous about whose job it is: `ISSU_62` says a wallet SHALL no longer present an obsolete credential, and SHOULD delete it. Yours keeps offering it.

:::

## The question every issuance asks

Strip away the formats and the flows and a wallet receiving a credential has exactly one decision to make:

> **Does this replace what I already hold?**

Answer *yes* when the truth was *no*, and the wallet deletes a credential you wanted to keep. Answer *no* when the truth was *yes*, and you accumulate identical-looking cards with nothing to say which one is live. Neither failure announces itself, and both are the wallet's fault from the user's point of view, whatever the specification says.

The Yivi wallet answers that question by comparing content. And comparing content, it turns out, answers a question sitting right next to it: *is this the same thing as something I already have?* Those two look like one question. They agree almost all of the time. Everything interesting in this post lives in the place where they come apart.

## How the wallet decides today

Two credentials are the same credential when three things match:

1. the **type** (`vct` for SD-JWT VC, `docType` for mdoc),
2. the **issuer**,
3. the **attribute values**.

The wallet hashes those three things together. Same hash, and the arriving credential replaces the stored one. Different hash, and both are kept.

Everything that changes on every issuance is deliberately left out of the hash: salts, digests, holder keys, signatures, validity timestamps. Two issuances of the same credential differ in all of them, and none of them says anything about what the credential *means*.

The rule is not ours. The ARF states it in a note attached to `PAD_02`, a requirement about deletion, of all places:

> Physical PIDs or attestations correspond to a logical one if they have not only the same attestation type and **Provider**, but also the same attribute values.

Type, provider, attribute values. The same three.

This gets renewals right, and renewals are the common case by a wide margin. Credentials expire. Batches of single-use copies run out, and the wallet goes back to the issuer for more. The issuer signs fresh copies with fresh keys and fresh timestamps — and **the attribute values do not move**, because not moving is what makes it a renewal. An age credential says `age_over_18: true` for as long as it exists. So the hash matches, the new copies replace the old, and you hold one card rather than twelve. OpenID4VCI is blunt about the alternative: a wallet that files every issuance as new "might end up with more than one Credential of the same type, without knowing which one is the latest".

## Why the issuer has to be in there

Two credentials, both of type `age_verification`, each carrying exactly one claim: `age_over_18: true`. Byte for byte, their claims are identical. One is issued by the Dutch state; the other by a supermarket's loyalty programme.

They are not the same credential. "Over 18, according to the Dutch state" and "over 18, according to a supermarket" are different statements, and — as the [trust levels post](/blog/who-vouches-for-you) argued at length — a verifier is entitled to accept one and refuse the other. A wallet that collapsed them would be discarding the part of the credential that carries its weight.

That is the obvious argument, and it is not the strongest one. The strongest one is that **replacement is destructive**. When the wallet decides an arriving credential replaces a stored one, it deletes the stored batch, and the deletion cascades to every copy and every holder binding key. If the issuer were not part of the identity, then any issuer your wallet talks to could delete a credential belonging to any *other* issuer, just by issuing the same type with the same attributes.

For an age attestation that is trivial to do. The attribute set is one boolean; there is nothing to guess, and every issuer of that type mints identical claims for every user over eighteen. A hostile issuer could reliably destroy your government-issued credential, you would have no way back except returning to the government issuer, and from inside the wallet nothing unusual would appear to have happened.

## Two events the wallet cannot tell apart

Now the part the rule cannot reach.

<div className="ci-cards">
  <div className="ci-card ci-keep">
    <div className="ci-title">You add a second email address</div>
    <dl>
      <dt>Type</dt><dd>same as one you hold</dd>
      <dt>Issuer</dt><dd>same as one you hold</dd>
      <dt>Attributes</dt><dd><strong>differ</strong> from the stored credential</dd>
    </dl>
    <div className="ci-verdict">Correct answer: keep both</div>
  </div>
  <div className="ci-card ci-replace">
    <div className="ci-title">You move house</div>
    <dl>
      <dt>Type</dt><dd>same as one you hold</dd>
      <dt>Issuer</dt><dd>same as one you hold</dd>
      <dt>Attributes</dt><dd><strong>differ</strong> from the stored credential</dd>
    </dl>
    <div className="ci-verdict">Correct answer: replace</div>
  </div>
</div>

You have a work address and a home address, and a credential for each. Both are current, both are correct, and you would be furious if adding the second had deleted the first. You also have one address you live at, and when you move, the old one is not a second home that also happens to be true. It is simply wrong.

The three facts the wallet can observe are identical. The required outcomes are opposite.

And it is not that the two cases differ in some subtle way we could look harder for. In both, the attribute that changed can literally be called `address`. The only thing separating them is what the credential *means* — and meaning is not a field.

## The whole picture

Every situation, laid out by what the wallet can actually see:

<div className="ci-scroll" role="region" aria-label="What the wallet can observe" tabIndex={0}>
  <table className="ci-matrix">
    <thead>
      <tr>
        <th>What really happened</th>
        <th>Type</th>
        <th>Issuer</th>
        <th>Attributes</th>
        <th>Correct answer</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <th scope="row">PID renewed, nothing changed</th>
        <td><span className="ci-pill ci-same">Same</span></td>
        <td><span className="ci-pill ci-same">Same</span></td>
        <td><span className="ci-pill ci-same">Same</span></td>
        <td><span className="ci-pill ci-v-replace">Replace</span></td>
      </tr>
      <tr>
        <th scope="row">Email credential re-issued unchanged</th>
        <td><span className="ci-pill ci-same">Same</span></td>
        <td><span className="ci-pill ci-same">Same</span></td>
        <td><span className="ci-pill ci-same">Same</span></td>
        <td><span className="ci-pill ci-v-replace">Replace</span></td>
      </tr>
      <tr className="ci-blind">
        <th scope="row">You move house</th>
        <td><span className="ci-pill ci-same">Same</span></td>
        <td><span className="ci-pill ci-same">Same</span></td>
        <td><span className="ci-pill ci-differ">Differ</span></td>
        <td><span className="ci-pill ci-v-replace">Replace</span></td>
      </tr>
      <tr className="ci-blind">
        <th scope="row">You add a second email address</th>
        <td><span className="ci-pill ci-same">Same</span></td>
        <td><span className="ci-pill ci-same">Same</span></td>
        <td><span className="ci-pill ci-differ">Differ</span></td>
        <td><span className="ci-pill ci-v-keep">Keep both</span></td>
      </tr>
      <tr className="ci-blind">
        <th scope="row">A second diploma from the same university</th>
        <td><span className="ci-pill ci-same">Same</span></td>
        <td><span className="ci-pill ci-same">Same</span></td>
        <td><span className="ci-pill ci-differ">Differ</span></td>
        <td><span className="ci-pill ci-v-keep">Keep both</span></td>
      </tr>
      <tr>
        <th scope="row">Age credential from the state and from a shop</th>
        <td><span className="ci-pill ci-same">Same</span></td>
        <td><span className="ci-pill ci-differ">Differ</span></td>
        <td><span className="ci-pill ci-same">Same</span></td>
        <td><span className="ci-pill ci-v-keep">Keep both</span></td>
      </tr>
      <tr>
        <th scope="row">Email attested by your employer and by the state</th>
        <td><span className="ci-pill ci-same">Same</span></td>
        <td><span className="ci-pill ci-differ">Differ</span></td>
        <td><span className="ci-pill ci-same">Same</span></td>
        <td><span className="ci-pill ci-v-keep">Keep both</span></td>
      </tr>
    </tbody>
  </table>
</div>

The first two rows agree with each other. The last two agree with each other. Content identity gets all four right, and it gets them right for the right reasons.

The three rows in the middle have exactly the same observable shape and do not share an answer. That band — **same type, same issuer, different attribute values** — is where every wallet is blind.

## Why nothing in the specs closes it

IRMA, the protocol Yivi grew out of, solved this years ago with a flag. A credential type could be marked as a singleton in the scheme, meaning the wallet holds at most one. When such a credential is issued, the wallet drops every previous instance of that type whatever its values, and tells you up front which card is about to disappear. The moved-house case, handled, with no content comparison anywhere.

There is nothing like it in the EUDI world. No per-type flag in OpenID4VCI Credential Issuer Metadata, none in an attestation rulebook, none in the ARF. There is simply nothing to read.

And here is the awkward part: adding one would not fix this. Go back to the ARF's own example, two diplomas from the same university. A flag on the diploma *type* cannot tell "the new address replaces the old address" apart from "this is a second diploma", because both are the same type from the same issuer with different values. Being a singleton is a property of the specific credential, not of its type. Even if the whole ecosystem agreed to add the flag tomorrow, it would give the wrong answer for every type a person can legitimately hold more than one of.

So what else is there? It is worth walking the candidates, because several look promising:

**`credential_configuration_id`.** A Credential Configuration is the issuer's description of "a particular kind of Credential" it offers. A kind, not an instance. Your two email addresses come from the same configuration, and so does your corrected one.

**`credential_identifiers`.** These do point at specific datasets, which is encouraging, until you read the scope: each one identifies a dataset issuable "using the Access Token returned in this response". Token-scoped. They cannot be stored now and matched against an issuance next month.

**SD-JWT VC type metadata.** Describes which claims a type has and how to display them. Silent on how many you may hold.

**`credential_reuse_policy`** (ARF `ISSU_39`, ETSI TS 119 472-3). The closest thing in the ecosystem, and it answers a different question: how many *technical copies* of one logical credential to keep, and when to refresh them. Batch size and refresh triggers. Not whether a second logical credential of the type is legitimate.

**The credential itself.** There is no stable per-credential identifier that survives re-issuance. `sub` identifies the subject, not the credential.

**The OpenID4VCI data model.** This is the deepest reason and the one that makes the search futile. A Credential is "an instance of a Credential Configuration with a particular Credential Dataset", and a Credential Dataset is "a set of one or more claims about a subject". A changed address produces a new dataset. A second email address produces a new dataset. The model expresses no relationship *between* datasets — nothing that says one supersedes another. The distinction we need does not exist in the vocabulary, so no field could carry it.

The pattern is consistent. Every identifier the specs offer names either a **type** or a **single delivery**. None of them names *a logical credential over time*, which is precisely the thing we would need.

Which does not stop the specs asking for the behaviour. ARF `ISSU_62` says a wallet that re-issued a credential with changed attribute values "SHALL no longer present the (now obsolete) pre-existing" one and "SHOULD delete it", and `ISSU_59` says the wallet SHALL diff the values and notify you. Required to spot it, required to say so, required to stop presenting the old one — and given no mechanism for working out which credential the new one replaces.

## The one place the answer does exist

The signal is not in the credential. It never was. It is in how the issuance happened.

![A re-issuance runs left to right: the session begins with a refresh token bound to a specific stored credential, the issuer signs fresh copies, and the wallet stores them by hashing type, issuer and attributes. The binding to the credential being replaced is never carried to the storage step.](./reissuance-timeline.svg)

OpenID4VCI describes two ways a credential gets updated. In the first, the wallet uses a token it already holds to fetch a new version of a credential it already holds, with no user interaction — and ARF `ISSU_65` requires the provider to check that the result goes back to the same wallet unit, pointing at exactly that mechanism. A refresh is performed *against a specific credential*. That is what the refresh token is bound to.

So at the moment the session starts, the wallet knows the answer. It then discards it, and tries to reconstruct it at storage time by comparing hashes, which cannot work. Comparing content after the fact cannot recover information that was available at the start and thrown away.

The fix follows: carry "this issuance replaces credential X" through the session from the moment it begins, and act on it when storing. Not implemented in Yivi today, and stated here as where this has to go rather than as a shipped feature. Today a re-issuance that changes an attribute value leaves both credentials in the wallet, and nothing at issuance time tells you the new one differs from the one you already hold — a second missed requirement, since `ISSU_59` says the wallet SHALL compare the values and notify you of any differences.

## What that would not fix

Now the uncomfortable half. OpenID4VCI's *second* update path is ordinary issuance, started over from the beginning with the user involved. There is no refresh token, no binding, nothing to carry.

That path is the scene this post opened with. You move house, you go through issuance again, and the wallet receives a PID with no more context than any first-time issuance carries. Carrying the intent through the session fixes the automatic refresh, which is real and worth doing. It does not fix the case where you did it by hand.

Closing that one needs something the specifications do not currently have: a way for an issuance to say *this supersedes that*, surviving across sessions, naming a logical credential rather than a type or a delivery. It is a small thing to add to a data model and a large thing to add to a data model that has already shipped. Until then, every wallet in the ecosystem is guessing in the same band, and content identity is the best guess available — right for renewals, right for different issuers, silent in the middle.

## The mirror image

There is a second way this missing concept shows up, and it runs the other way.

The identity rule is only as stable as the issuer name we feed it. If an issuer's identifier moves — a changed domain, a rotated certificate carrying a different name, a trailing slash that was not there last time — then a renewal stops matching the credential it was meant to renew, and the wallet files it as a second card. The old one is never matched again and sits there until it expires.

That is the same disease with the symptom reversed. In the blind band, two different credentials look identical to the wallet. Here, one credential fails to be recognised as itself. Both are the wallet having no durable notion of a logical credential over time.

We should be honest about where our own footing is weakest. SD-JWT VC gives us the `iss` claim, and the signing certificate when it is absent. **mdoc has no issuer field in the document at all** — issuer identity lives in the certificate chain — and we currently fall back to the credential issuer URL from the issuance protocol, which names the endpoint the wallet fetched from rather than the entity that signed the document. That is a fallback, not an answer, and making it a real one is on us rather than on the specs.

Worth noting too that SD-JWT VC treats a shifting issuer identifier as a warning sign rather than routine churn: its security considerations describe issuers that rotate identifiers, or use a different one per holder, as a tracking risk verifiers should watch for. An issuer name that moves is something to notice, not something to normalise away.

## If you issue credentials

There is one thing issuers can do today that costs nothing and removes a whole class of this problem.

**When you re-issue a credential because its attribute values changed, do it over the refresh path rather than sending the user through a fresh authorization.** Same credential, same wallet, same outcome on your side — but one path carries the identity of what is being replaced and the other destroys it. An issuer that refreshes is handing the wallet the answer. An issuer that restarts issuance is asking every wallet in the ecosystem to guess — and when the guess is wrong, the person holding the phone is the one left to sort it out.

If you run an issuer and want to talk about how your re-issuance flow behaves, or you think we have this wrong, we would like to hear it: [support@yivi.app](mailto:support@yivi.app).

## Sources

* [OpenID for Verifiable Credential Issuance 1.0](https://openid.net/specs/openid-4-verifiable-credential-issuance-1_0.html) — Credential Configuration and Credential Dataset terminology, batch issuance, and refreshing issued credentials
* [EUDI Architecture and Reference Framework](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework) — logical versus technical attestations, `ISSU_59`, `ISSU_62`, `ISSU_65`, `PAD_02`
* [ARF discussion topic B: re-issuance and batch issuance of PIDs and attestations](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/blob/main/docs/discussion-topics/b-re-issuance-and-batch-issuance-of-pids-and-attestations.md)
* [SD-JWT-based Verifiable Credentials](https://datatracker.ietf.org/doc/draft-ietf-oauth-sd-jwt-vc/) — type metadata and the issuer-identifier tracking considerations
* ETSI TS 119 472-3 — `credential_reuse_policy`
* [Who vouches for you? How the Yivi wallet will decide whom to trust](/blog/who-vouches-for-you)
