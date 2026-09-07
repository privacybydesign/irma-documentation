---
slug: itsme-idin-migration
title: "When trust changes hands: itsme, iDIN, and where your biometrics actually go"
authors: [dibranmulder]
tags: [yivi, privacy, identity, iDIN, itsme, biometrics, self-hosting]
---

In December 2025, the Belgian identity app itsme [acquired iDIN](https://www.abnamro.com/en/news/dutch-identification-service-idin-acquired-by-itsme) from Currence, with a migration scheduled to run from 2026 to 2028 ([Finextra](https://www.finextra.com/newsarticle/47072/belgium-bank-owned-itsme-acquires-dutch-banks-digital-id-service-idin)). The deal was announced publicly, but its consequences for end users are easy to miss. iDIN was built on the trust people place in their own bank. itsme is owned by a consortium of Belgian banks (Belfius, BNP Paribas Fortis, KBC and ING) and is a notified eIDAS eID scheme — but it is not the user's own bank, and as it slots into the iDIN bank-selection list the trust model behind that familiar set of logos is shifting underneath it.

This matters more than it looks. iDIN's address data was never its strongest point, and moving to itsme does not fix that weakness — it risks deepening it. Here is what changes, and why we at Yivi are deliberately taking the opposite path.

<!-- truncate -->

<div class="center-container">
    <figure style={{margin: 0, textAlign: 'center'}}>
        <img src="/img/itsme.avif" style={{height: '22em', width: 'auto', maxWidth: 'none'}} alt="An itsme app consent screen, sharing identity attributes during a login" />
        <figcaption>itsme</figcaption>
    </figure>
    <figure style={{margin: '0 2em', textAlign: 'center'}}>
        <img src="/img/id-card-edl/05_id_add_credential.png" style={{height: '22em', width: 'auto', maxWidth: 'none'}} alt="Adding a credential in the Yivi wallet" />
        <figcaption>Yivi</figcaption>
    </figure>
</div>

## The trust people had in iDIN came from banks

iDIN works because of *where the trust comes from*. When you identify with iDIN, you log in through your own bank. Your bank already knows who you are: they verified your identity against your passport or ID card when you opened your account, they have a legal KYC obligation, and they keep that data under continuous monitoring. That chain of trust is the entire value of iDIN.

But not every attribute in that chain is equally strong, and this is the part people gloss over. Identity (name, date of birth) is verified against a government document, which is solid. Address is a much weaker link. Banks rarely hard-check an address against the municipal population register (the BRP). In practice the address comes from a proof-of-address document, a reference transfer from another bank, or simply what the customer entered, propped up by the soft fact that mail and cards get sent there. It is procedural, not authoritative.

So even before itsme entered the picture, iDIN addresses already suffered from quality problems. They were "bank-held" far more than they were "bank-verified". Relying parties that treated an iDIN address as gold-standard were already overestimating it.

When you pick your bank from the iDIN list, you are implicitly trusting that whatever sits behind that logo carries at least those bank-grade guarantees, weak as the address one already is. That assumption is shaky for ABN AMRO, ING, Rabobank and the rest where addresses are concerned. It is weaker still for an identity app that now sits in — and is set to take over — that same list.

## itsme takes an already-weak address and removes the last guardrail

Here is where it goes from "weak" to "broken". iDIN's address was at least procedural: held by a regulated bank, attached to a KYC'd account, loosely propped up by ongoing monitoring. Flawed, but anchored to *something*.

It is not clear that itsme preserves even that anchor. As far as we can find, itsme has not published exactly how it sources its address attribute — and this is precisely the point we would most want itsme to clarify. If, as its self-service onboarding suggests, the address can be self-attested (entered by the user, not checked against an authoritative source, with no bank KYC obligation behind it), then the one attribute that was already the soft spot in iDIN becomes, for the itsme path, entirely self-declared.

If that is the case, the practical consequence is simple: an address could be supplied without any authoritative check. A relying party that chose iDIN because it wanted at least a bank-anchored address would then receive, for the itsme path, an address that nobody verified. The relying party doesn't see the difference: same screen, same flow, same little list of logos. A known quality problem could quietly become no verification at all — and the trust model behind the logo would have changed without the relying party, or the user, being asked.

## Where does the identity verification actually happen?

itsme's identity verification leans on MRTD authentication, reading the chip in your passport or ID card. That is genuinely strong technology; it's the same Machine Readable Travel Document standard we use in Yivi. The question is never "is the technology good?" The question is always: who processes your data, and where does it go?

Under the hood, itsme uses third-party SaaS providers:

- Document and chip reading via ReadID, the product of **Inverid** — the Dutch company formerly known as InnoValor, renamed in 2022 and [subsequently acquired by Signicat](https://www.inverid.com/inverid-signicat): when you scan your passport, the data from the chip is processed by a third party's service. Inverid is a competent, established company, but the point is that most users have no idea their passport chip data is leaving for a SaaS backend at all.
- Face verification via [iProov](https://www.iproov.com/press/iproov-face-verification-selected-by-itsme-to-support-global-expansion): the liveness check streams your selfie video and compares it against the face photo extracted from your passport chip. That biometric stream goes to iProov — a UK (London) company that took a [$70M growth-equity investment from US-based Sumeru Equity Partners in 2022](https://www.iproov.com/press/70m-investment-sumeru-equity-partners).

So in the course of "just verifying with itsme", a user's most sensitive data, the biometric photo from their travel document and a live video of their face, is transmitted to third-party cloud services. None of these companies are villains. Inverid and iProov are competent, and they may well be compliant. The problem is structural, not about any single vendor's integrity.

## Why this is the wrong direction for society

When the most sensitive identity operations, chip reading and biometric face matching, are routinely outsourced to a handful of SaaS providers, you build a future in which:

- Citizens don't know where their biometrics go. Consent is meaningless if nobody understands the data flow.
- Trust labels get diluted. "iDIN" stops meaning "my bank vouches for this" and starts meaning "some app in the list, maybe".
- Critical national identity infrastructure comes to depend on a chain of commercial vendors. Ownership, jurisdiction, and incentives can change over time — and a vendor answers first to its investors and to the legal jurisdiction it operates under, not to Dutch or European citizens.

This is the slow centralisation of the most intimate data we have, our faces and our travel documents, into commercial clouds, hidden behind a friendly UI. That is not the direction we want for society.

## How Yivi does it differently: in-house, self-hosted, data going nowhere

We made a deliberate choice. With Yivi, the sensitive operations stay under our own control, and the data does not travel to third-party clouds.

- Passport and MRTD scanning is done in-house. We built our own [open-source MRTD reading and validation stack](https://github.com/privacybydesign/vcmrtd), validating against government-issued masterlists. Your chip data isn't shipped off to someone else's SaaS. (See our earlier post on [Yivi Passport credentials](/blog/2025-passport-callout).)
- Face verification is being built open source. We are developing face-verification capability in the open. And where we do evaluate commercial components, our rule is non-negotiable: we will always self-host. The selfie stream and the chip photo stay within infrastructure we control.
- Data is stored nowhere it doesn't need to be. Yivi's whole architecture is built around data minimisation and the user holding their own attributes. There is no central honeypot of biometrics, and no silent hand-off to a third party.
- Standards-based and ready today. We offer fully EUDI and ARF compliant interfaces to request user data such as name, address and date of birth, all coming from trustworthy data sources, over open protocols like OpenID4VP with SD-JWT VCs. You can start building today and work towards eIDAS 2.0 compliance.

itsme's model routes your passport chip and your face through external SaaS providers — one of them carrying US growth-equity backing — often without the user understanding it. Yivi keeps it in-house, open source where we can, and self-hosted always.

## Trust should be explicit

The deepest problem isn't itsme specifically. It's that the trust model behind the iDIN logo is changing — through an acquisition that end users never had a say in — while the screen they see stays the same. People trusted their own banks. Now an identity app, whose address attribute may be self-attested, is taking over that list, and the chip-reading and biometrics behind it run on third-party clouds.

We believe identity infrastructure has to be honest about where trust comes from and where data goes. That means the quality of each attribute should be visible: authoritative, procedural, or self-attested data should never be silently blended into one indistinguishable list. It means biometric processing should happen on infrastructure you control, not be quietly outsourced. And it means being open source so anyone can check.

That's the bet we're making with Yivi. Your data should go nowhere. Be stored nowhere. And the trust you place in a system should be the trust you actually consented to.

- [Slack](https://irmacard.slack.com/)
- [GitHub](https://github.com/privacybydesign)
- [Email](mailto:support@yivi.app)
