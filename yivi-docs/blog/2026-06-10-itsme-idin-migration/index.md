---
slug: itsme-idin-silent-migration
title: "When trust is silently rerouted: itsme, iDIN, and where your biometrics actually go"
authors: [dibranmulder]
tags: [yivi, privacy, identity, iDIN, itsme, biometrics, self-hosting]
---

Something happened on the iDIN bank-selection screen that most people never noticed. Between the list of familiar banks, the institutions whose trust iDIN was built on, a new option quietly appeared: itsme. Not a bank. An identity app. And with that single addition, the trust model that made iDIN meaningful was quietly rerouted.

This matters, and it matters more than it looks. iDIN's address data was never its strongest point to begin with. itsme doesn't fix that weakness, it makes it worse. Let me explain why, and why we at Yivi are deliberately taking the opposite path.

<!-- truncate -->

<div class="center-container">
    <figure style={{margin: 0, textAlign: 'center'}}>
        <img src="/img/itsme.avif" style={{height: '22em', width: 'auto', maxWidth: 'none'}} alt="itsme appearing as an option in the iDIN bank-selection list" />
        <figcaption>ItsMe</figcaption>
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

When you pick your bank from the iDIN list, you are implicitly trusting that whatever sits behind that logo carries at least those bank-grade guarantees, weak as the address one already is. That assumption is shaky for ABN AMRO, ING, Rabobank and the rest where addresses are concerned. It collapses entirely for an identity app that was silently slotted into the same list.

## itsme takes an already-weak address and removes the last guardrail

Here is where it goes from "weak" to "broken". iDIN's address was at least procedural: held by a regulated bank, attached to a KYC'd account, loosely propped up by ongoing monitoring. Flawed, but anchored to *something*.

itsme removes even that anchor. The address itsme supplies can be self-attested: entered by the user, not checked against an authoritative source, with no bank KYC obligation behind it. So the one attribute that was already the soft spot in iDIN becomes, for the itsme path, entirely self-declared.

The practical consequence is simple: someone can fake their address, trivially. A relying party that chose iDIN because it wanted at least a bank-anchored address now receives, for the itsme path, an address that nobody checked at all. The relying party doesn't see the difference: same screen, same flow, same little list of logos. A known quality problem just got quietly downgraded to no verification, and the trust was rerouted without anyone consenting to the change.

## Where does the identity verification actually happen?

itsme's identity verification leans on MRTD authentication, reading the chip in your passport or ID card. That is genuinely strong technology; it's the same Machine Readable Travel Document standard we use in Yivi. The question is never "is the technology good?" The question is always: who processes your data, and where does it go?

Under the hood, itsme uses third-party SaaS providers:

- Document and chip reading via ReadID (InnoValor / innovalor.nl): when you scan your passport, the data from the chip is sent to a third party's cloud service. InnoValor is a reputable Dutch organisation, but the point is that most users have no idea their passport chip data is leaving for a SaaS backend at all.
- Face verification via iProov: the liveness check streams your selfie video and compares it against the face photo extracted from your passport chip. That biometric stream goes to iProov, a SaaS company backed by US venture capital.

So in the course of "just verifying with itsme", a user's most sensitive data, the biometric photo from their travel document and a live video of their face, is transmitted to third-party cloud services, including one backed by US venture capital. None of these companies are villains. ReadID and iProov are competent, and they may well be compliant. The problem is structural, not about any single vendor's integrity.

## Why this is the wrong direction for society

When the most sensitive identity operations, chip reading and biometric face matching, are routinely outsourced to a handful of SaaS providers, you build a future in which:

- Citizens don't know where their biometrics go. Consent is meaningless if nobody understands the data flow.
- Trust labels get diluted. "iDIN" stops meaning "my bank vouches for this" and starts meaning "some app in the list, maybe".
- Critical national identity infrastructure depends on foreign venture-backed companies. Ownership, jurisdiction, and incentives can change overnight. A US VC-backed company answers to its investors and its government, not to Dutch or European citizens.

This is the slow centralisation of the most intimate data we have, our faces and our travel documents, into commercial clouds, hidden behind a friendly UI. That is not the direction we want for society.

## How Yivi does it differently: in-house, self-hosted, data going nowhere

We made a deliberate choice. With Yivi, the sensitive operations stay under our own control, and the data does not travel to third-party clouds.

- Passport and MRTD scanning is done in-house. We built our own [open-source MRTD reading and validation stack](https://github.com/privacybydesign/vcmrtd), validating against government-issued masterlists. Your chip data isn't shipped off to someone else's SaaS. (See our earlier post on [Yivi Passport credentials](/blog/2025-passport-callout).)
- Face verification is being built open source. We are developing face-verification capability in the open. And where we do evaluate commercial components, our rule is non-negotiable: we will always self-host. The selfie stream and the chip photo stay within infrastructure we control.
- Data is stored nowhere it doesn't need to be. Yivi's whole architecture is built around data minimisation and the user holding their own attributes. There is no central honeypot of biometrics, and no silent hand-off to a third party.
- Standards-based and ready today. We offer fully EUDI and ARF compliant interfaces to request user data such as name, address and date of birth, all coming from trustworthy data sources, over open protocols like OpenID4VP with SD-JWT VCs. You can start building today and work towards eIDAS 2.0 compliance.

The contrast is the whole point. itsme's model routes your passport chip and your face through external SaaS providers, one of them US venture-backed, often without the user understanding it. Yivi keeps it in-house, open source where we can, and self-hosted always.

## Trust should be explicit

The deepest problem with the silent iDIN change isn't itsme specifically. It's that the trust model was altered without anyone being asked. People trusted banks. Now an ID app with self-attested addresses sits in the same list, and the chip-reading and biometrics behind it run on third-party clouds.

We believe identity infrastructure has to be honest about where trust comes from and where data goes. That means the quality of each attribute should be visible: authoritative, procedural, or self-attested data should never be silently blended into one indistinguishable list. It means biometric processing should happen on infrastructure you control, not be quietly outsourced. And it means being open source so anyone can check.

That's the bet we're making with Yivi. Your data should go nowhere. Be stored nowhere. And the trust you place in a system should be the trust you actually consented to.

- [Slack](https://irmacard.slack.com/)
- [GitHub](https://github.com/privacybydesign)
- [Email](mailto:support@yivi.app)
