---
slug: post-quantum-gap-eudi-wallet
title: "The post-quantum gap in the EUDI wallet ecosystem"
authors: [dibranmulder]
tags: [security, crypto, post-quantum, eudi-wallet, haip, analysis]
---

*The EUDI wallet ecosystem is being built for Level of Assurance "high", which means resistance against attackers with a high attack potential, up to and including state actors. Yet almost every cryptographic mechanism it standardises on today, from the signatures on your credentials to the TLS between its servers, is exactly the kind of asymmetric cryptography that a large quantum computer breaks. This post is about that gap, and about why "we will get to it later" is a harder position to defend for a high-assurance wallet than for almost any other system on the internet.*

<!-- truncate -->

<style>{`
  .pq-scroll { overflow-x: auto; border: 1px solid var(--ifm-color-emphasis-300); border-radius: 4px; margin: 1.5rem 0; }
  .pq-table { border-collapse: collapse; width: 100%; min-width: 44rem; margin: 0; display: table; }
  .pq-table thead th { font-size: 0.71rem; font-weight: 700; letter-spacing: 0.09em; text-transform: uppercase; text-align: left; color: var(--ifm-color-emphasis-700); padding: 0.8rem 1rem; border: none; border-bottom: 1px solid var(--ifm-color-emphasis-400); background: var(--ifm-background-surface-color); }
  .pq-table tbody td, .pq-table tbody th { padding: 0.8rem 1rem; border: none; border-bottom: 1px solid var(--ifm-color-emphasis-200); vertical-align: top; font-size: 0.92rem; line-height: 1.45; font-weight: 400; text-align: left; background: var(--ifm-background-surface-color); }
  .pq-table tbody tr:last-child td, .pq-table tbody tr:last-child th { border-bottom: none; }
  .pq-table td code, .pq-table th code { font-size: 0.83rem; }
  .pq-broken { color: #b3261e; font-weight: 600; }
  .pq-safe { color: #1c6b58; font-weight: 600; }
  [data-theme='dark'] .pq-broken { color: #f2b8b5; }
  [data-theme='dark'] .pq-safe { color: #63c3a8; }
  .pq-player { display: flex; justify-content: center; margin: 1.75rem 0; }
  .pq-player iframe { width: 100%; max-width: 560px; height: 352px; border: 0; }
`}</style>

## "Only God knows if encryption is really safe"

That is the translated title of a recent episode of the Dutch podcast [De Technoloog](https://www.bnr.nl/podcast/de-technoloog/10609122/alleen-god-weet-of-encryptie-echt-veilig-is), with cryptographer **Bas Westerbaan** as its guest. Westerbaan is a Radboud University alumnus, from the same Nijmegen cryptography school that [IRMA](https://www.irmalliance.org/), and therefore Yivi, grew out of. He now works at [Cloudflare](https://blog.cloudflare.com/author/bas-westerbaan/), where he spends his days actually shipping post-quantum cryptography to a meaningful fraction of the internet. Listening to him lay out the state of the field is a useful antidote to the way quantum risk is usually discussed. It is not a distant science-fiction event. It is an engineering migration that is already underway and is going to take the better part of a decade.

<div className="pq-player">
  <iframe title="De Technoloog on Spotify" src="https://open.spotify.com/embed/show/6koTehR7m7gptOv3tILVk1?utm_source=generator&si=53a029841bda4bda" style={{ borderRadius: '12px' }} frameBorder="0" allowFullScreen allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
</div>

The uncomfortable part, for anyone building in the European digital identity space, is what that timeline implies. The [EU Digital Identity (EUDI) wallet ecosystem](https://eudi.dev/3.0.0/main/) is being assembled right now, on standards that are being finalised over the coming years, and those standards are almost without exception classical. If we finish building this ecosystem on the cryptography we have today, we will have to tear a great deal of it open again the moment we take post-quantum seriously. For a Level of Assurance "high" system, that moment should arrive sooner than for almost anything else.

## Two clocks that do not line up

Cloudflare is about as well positioned as an organisation can be to migrate to post-quantum cryptography. It controls both ends of a huge share of the connections it serves, it can ship changes to its edge continuously, and it has some of the best cryptographers in the world on staff. Even so, its stated goal is to be [fully post-quantum secure by 2029](https://blog.cloudflare.com/pq-2024/), covering both key agreement and signatures, and that is described as an ambitious target. Key agreement is largely done: a majority of Cloudflare's traffic already uses hybrid [ML-KEM key exchange](https://blog.cloudflare.com/post-quantum-for-all/), and the company has extended the same approach into [post-quantum IPsec tunnels](https://blog.cloudflare.com/post-quantum-ipsec/). Signatures, the harder half, are the reason 2029 is a stretch rather than a done deal.

Now put the EUDI clock next to it. The ecosystem is aiming to reach production maturity over the next couple of years. The interoperability profiles, the trust frameworks and the certificate policies that member states and wallet providers implement against are being written now, and they are classical. If everything goes to plan, we roll out a continent-scale, high-assurance identity ecosystem built entirely on pre-quantum cryptography at roughly the same moment Cloudflare is congratulating itself on finishing the opposite migration. And then we would need to start overhauling the freshly built EUDI stack immediately to make it quantum resistant.

Two clocks, and they do not line up.

## Aspect 1: credentials are asymmetric signatures, all the way down

Start with the thing the wallet exists to carry: credentials.

A EUDI credential, whether an SD-JWT VC or an ISO mdoc, is fundamentally a set of attributes with an **issuer's digital signature** over them. That signature is what makes the credential trustworthy. It is how a verifier knows the PID came from a member state's identity provider and was not fabricated. There is a second signature in the flow too: the **holder binding** or device key that proves the wallet presenting the credential is the one it was issued to.

Both of those are asymmetric signatures, and the [OpenID4VC High Assurance Interoperability Profile (HAIP)](https://openid.net/specs/openid4vc-high-assurance-interoperability-profile-1_0-final.html) is explicit about which ones. Its baseline is `ES256`, meaning ECDSA over the NIST P-256 curve with SHA-256, required across issuers, verifiers and wallets, with `ECDH-ES` over P-256 for response encryption. These are excellent classical choices. They are also precisely the primitives that [Shor's algorithm](https://en.wikipedia.org/wiki/Shor%27s_algorithm) dismantles on a cryptographically relevant quantum computer. Search the HAIP specification, or the underlying [OpenID4VCI](https://openid.net/specs/openid-4-verifiable-credential-issuance-1_0.html) and [OpenID4VP](https://openid.net/specs/openid-4-verifiable-presentation-1_0.html) specifications, for "post-quantum" and you will find nothing at all.

The threat here is not abstract. If an adversary can forge an issuer signature, they can mint credentials that are cryptographically indistinguishable from genuine ones: a synthetic PID for anyone they like, accepted by every verifier in the ecosystem. Credentials are also long lived. A document issued today may be valid for years, and the issuer keys behind them for longer still. A migration that "starts when quantum arrives" starts too late for anything already in the field.

And then there is the part I will deliberately not dwell on, because it deserves its own post: **zero-knowledge proofs**. Yivi's heritage, and the privacy-preserving future everyone claims to want for the EUDI wallet, leans on unlinkable, selective-disclosure proofs. The classical building blocks for those, such as [BBS+](https://www.ietf.org/archive/id/draft-irtf-cfrg-bbs-signatures-08.html) and the IRMA/Idemix family, are elegant and mature. Their post-quantum equivalents are not. Lattice-based zero-knowledge is an active research area, not a stable, standardised, certifiable toolbox you can ship to millions of phones. So the moment credentials go post-quantum, the privacy properties we have spent years perfecting have no drop-in replacement waiting for them. That is a gap on top of a gap, and it is worth naming even while we focus elsewhere.

## Aspect 2: the PKI nobody puts on the slides

Credentials get the attention. The plumbing does not, and the plumbing is where most of the asymmetric cryptography in the ecosystem actually lives.

Think about everything that has to hold a key pair for the EUDI wallet to function:

- **Issuer certificates**, chaining to the trust anchors published by member states, that let a wallet decide an issuer is authorised to issue what it issues.
- **Relying-party and access certificates**, the registration certificates that authorise a verifier to ask for specific attributes, which form the backbone of the whole "who is allowed to request what" model.
- **Wallet and key attestations** proving a wallet instance is genuine and that its keys live in secure hardware.
- **The (mutual) TLS** between every component: wallet to issuer, wallet to verifier, the backend-to-backend traffic, and the trust-list distribution.

Every one of those is RSA or elliptic curve today. Every one of those falls to the same quantum adversary. Making the EUDI wallet post-quantum is therefore not a matter of swapping the credential signature algorithm. It is re-issuing an entire continental PKI, redefining certificate profiles, and negotiating new cipher suites on every channel. That is a migration of the same shape and size as the one Cloudflare has been grinding through for years, except spread across dozens of member states and hundreds of trust service providers who all have to move roughly in step.

The transport layer also carries the classic **"harvest now, decrypt later"** risk, and this is exactly the case the European guidance flags. An adversary can record encrypted PID traffic today and decrypt it once a quantum computer exists. The [ECCG Agreed Cryptographic Mechanisms](https://certification.enisa.europa.eu/document/download/a845662b-aee0-484e-9191-890c4cfa7aaa_en?filename=ECCG%20Agreed%20Cryptographic%20Mechanisms%20version%202.pdf) document is blunt about it, and recommends prioritising post-quantum protection first "in applications where confidentiality is to be protected in the long term." Identity data, meaning who you are, where you live, your date of birth, and the fact that you presented a credential to a particular verifier at a particular time, is about as long-lived a confidentiality requirement as exists.

## What "post-quantum ready" would actually require

The good news is that Europe has already written down the destination. The [ECCG Agreed Cryptographic Mechanisms v2.0](https://certification.enisa.europa.eu/document/download/a845662b-aee0-484e-9191-890c4cfa7aaa_en?filename=ECCG%20Agreed%20Cryptographic%20Mechanisms%20version%202.pdf) (April 2025), the reference for what counts as "agreed" cryptography under the EU certification framework, already lists the post-quantum mechanisms an EUDI stack would migrate to:

<div className="pq-scroll">
<table className="pq-table">
<thead>
<tr><th>Purpose</th><th>Classical (today, HAIP)</th><th>Post-quantum (ECCG agreed)</th></tr>
</thead>
<tbody>
<tr>
<td>Signatures<br/><span style={{fontSize:'0.82rem',color:'var(--ifm-color-emphasis-700)'}}>credentials, certificates, attestations</span></td>
<td><code className="pq-broken">ECDSA P-256 (ES256)</code>, RSA</td>
<td><a href="https://csrc.nist.gov/pubs/fips/204/final"><code className="pq-safe">ML-DSA</code></a> (FIPS 204, use ML-DSA-87 or -65), <a href="https://csrc.nist.gov/pubs/fips/205/final"><code className="pq-safe">SLH-DSA</code></a> (FIPS 205, levels 3 and 5), and stateful hash-based <a href="https://csrc.nist.gov/pubs/sp/800/208/final"><code>XMSS</code> / <code>LMS</code></a> (SP 800-208)</td>
</tr>
<tr>
<td>Key agreement / encryption<br/><span style={{fontSize:'0.82rem',color:'var(--ifm-color-emphasis-700)'}}>TLS, response encryption</span></td>
<td><code className="pq-broken">ECDH P-256</code>, RSA</td>
<td><a href="https://csrc.nist.gov/pubs/fips/203/final"><code className="pq-safe">ML-KEM</code></a> (FIPS 203, use ML-KEM-1024 or -768), <a href="https://frodokem.org/"><code className="pq-safe">FrodoKEM</code></a> (-1344 or -976)</td>
</tr>
</tbody>
</table>
</div>

Two things about that table matter more than the algorithm names.

First, the ECCG does not tell you to simply replace the classical primitive with the post-quantum one. For the lattice-based mechanisms (ML-DSA, ML-KEM) it mandates **hybridisation**. They "shouldn't be used in a standalone way", but combined with a well-established classical mechanism, such that an attacker must break both to win. This is a hedge against the newer schemes turning out to have flaws. It is sensible, but it also means the migration target is heavier and more complex than today's stack, not a clean swap. Only the conservative hash-based signatures (SLH-DSA, XMSS, LMS) may stand alone.

Second, notice what is not on the post-quantum side: any zero-knowledge or anonymous-credential scheme. The agreed list gives us quantum-resistant signatures and key agreement. It does not give us quantum-resistant selective disclosure. Which brings us back to the ZKP gap: the ecosystem can go post-quantum for authenticity and confidentiality well before it can go post-quantum without sacrificing privacy.

And even the parts that are covered are not free. As Cloudflare put it in [ML-DSA will have to do](https://blog.cloudflare.com/ml-dsa-will-have-to-do/), "you go to war with the algorithms you have, not the ones you wish you had." ML-DSA is deployable today, but an ML-DSA-44 signature is around 2,420 bytes against Ed25519's 64, with a 1,312-byte public key. Multiply that across every credential, every certificate in a chain, and every attestation in a presentation, and the size and performance budget of the whole protocol changes. The signature schemes that would ease that pain, such as FN-DSA, SQIsign and the multivariate candidates, are by NIST's own timelines standardised somewhere between 2027 and the early 2030s, and widely available even later. For the EUDI window, ML-DSA and SLH-DSA are what there is.

## Level of Assurance "high" changes the risk calculus

Here is the argument I most want to land.

Most organisations plan their post-quantum migration against a **risk profile**. When is a cryptographically relevant quantum computer plausible? How long does my data need to stay confidential? How valuable is it to an attacker? For a great many systems, the honest answer is "we have some time", and a measured, later migration is entirely defensible.

The EUDI wallet does not get to reason that way, because of the assurance level it is designed for. eIDAS defines Level of Assurance **high** as, in essence, resistance to attackers with a **high attack potential**, meaning adversaries with substantial expertise, resources and motivation. In the standard threat-modelling language, that explicitly includes **nation-state actors**. That is the bar a EUDI wallet claims to clear.

Now ask the obvious question. Who is most likely to field a cryptographically relevant quantum computer first, and to harvest encrypted identity traffic today in anticipation of it? The same well-resourced state actors that Level of Assurance high is defined against. The quantum adversary is not some new threat outside the model. It is the flagship member of the exact threat class the wallet already promises to withstand. A risk-based "we will do post-quantum later" posture is coherent for a loyalty-card app. For a system whose entire assurance claim rests on beating high-attack-potential adversaries, deferring post-quantum protection is in tension with the assurance level printed on the box.

None of this is an argument against building the EUDI wallet, and it is certainly not an argument for waiting. It is an argument for **crypto-agility from day one**, meaning the ability to swap signature and key-agreement algorithms without re-architecting the wallet, and for putting a hybrid post-quantum path on the roadmap now, while the certificate profiles and interoperability profiles are still being written, rather than after they have hardened across dozens of member states. It is a great deal cheaper to leave room for ML-DSA and ML-KEM in a design than to retrofit them into a deployed one.

We have been building Yivi toward exactly that kind of agility. [Yivi 8.0 was framed around a crypto-agile foundation](/blog/2026-yivi-8-0-crypto-agility) precisely so that the algorithms underneath our credentials are things we can change rather than things we are stuck with. The EUDI ecosystem as a whole will need the same instinct. Because only God knows whether today's encryption is really safe forever, but we already know it is not safe against a large quantum computer, and we already know who is most motivated to build one.
