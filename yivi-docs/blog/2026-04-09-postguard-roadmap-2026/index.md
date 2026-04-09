---
slug: looking-ahead-with-PostGuard
title: Looking ahead with PostGuard
authors: [rubenhensen]
tags: [PostGuard, e-mail, encryption, roadmap]
---


<a href="/nl/blog/vooruitblikken-met-PostGuard" style={{background: "var(--ifm-color-primary-lightest)", color: "var(--ifm-color-primary-darkest)", padding: "0.2rem 0.6rem", borderRadius: "999px", fontSize: "0.8rem", fontWeight: "500", textDecoration: "none"}}>AI translated from Dutch</a>

![PostGuard logo](./postguard_cover.png)

The Yivi team is working hard on Yivi itself to become EUDI compliant, but besides Yivi we're also working hard on other projects like PostGuard. In this blog we'll tell you about PostGuard and what PostGuard's plans are for the coming year. We hope to get you just as excited about PostGuard as we are. And that when you want to send files, you'll do it with PostGuard of course!

<!-- truncate -->

Let me first introduce myself. I'm Ruben and last February I started at Yivi as an open source developer. I don't have a fixed role at Yivi, but I've been busy working on PostGuard. PostGuard is an identity-based, end-to-end encrypted file sharing service that originated from the [iHub](https://ihub.ru.nl/) at Radboud University. It was originally started as an NWO project under the name Encryption4All and co-funded by [NLNet](https://nlnet.nl/). The encryption is handled using Yivi, which we call identity-based encryption. The "Post" in PostGuard refers to the focus on e-mail, which for many people remains the default way to send a file to someone. Think of it as an alternative to Zivver or WeTransfer, but European, open source and with a full embrace of [Privacy by Design](https://www.sfu.ca/~palys/Cavoukian-2011-PrivacyByDesign-7FoundationalPrinciples.pdf). We could explain it at length, but the easiest thing is to just try it out at [PostGuard.eu](https://PostGuard.eu). Once you're done, we'll take you through PostGuard's roadmap.


## PostGuard for you
Our goal is for you to use PostGuard, simply because it's convenient, secure and works well. No crazy sales tricks or hidden subscriptions, no tracking by or for advertisers. Our goal is for everyone to see that the identity wallet is _here to stay_ and that managing your own data can actually be pleasant and easy.

Unless you happen to live in Nijmegen, the chances are very small that you've found a place where you can use Yivi, and we think that's a shame. That's why we're going to make PostGuard and the Thunderbird and Outlook extensions available for free for personal use. This way you can safely and freely send large files to your friends or family. You can do this in two ways:
1. Via the website, just like WeTransfer. You upload a file via the website and fill in your own email and the recipient's. Your files are then emailed to the recipients by PostGuard.
2. Via the extensions. We hope that with the Thunderbird and Outlook extensions, emailing large files feels like sending a regular attachment in an email. An added benefit is that the email is also sent from your email in your name.

## PostGuard for Business
The second part of our roadmap is PostGuard for Business. The goal here is quite simple to explain: our goal is to become a full end-to-end encryption email service with everything businesses expect. That includes download verification, email revocation, auditing trails, and most importantly, programmatic emailing from an internal application. To achieve this, we're participating in several Proof of Concepts (PoC) where we test the business case. We're proud to say that we're already working on two projects: information-rich notifications with NotifyNL and Bereken Je Recht ("Calculate Your Rights"). We'll tell you a bit more about both.

### Information-rich notifications with NotifyNL
"A message has arrived for you." When you receive an email from the government right now, it deliberately contains very little — no links or files — to make sure people navigate to a trusted environment on their own to read the message. Super secure of course, but not very user-friendly. With NotifyNL we're setting up a PoC where citizens receive an encrypted message in their email via NotifyNL. This way the government can use Yivi's attribute verification to be certain that the message can only be read by the right person. And the citizen gets the convenience of reading a regular email where all the information they need is included right away.

### Bereken Je Recht
[berekenjerecht.nl](https://www.berekenjerecht.nl/) wants to make it easy for citizens to claim the benefits they're entitled to. Bereken Je Recht helps you figure out which benefits you're entitled to, and then also apply for those benefits with the right agencies. The ultimate goal is to shorten the process, which currently often takes around 10 weeks, to 10 minutes. There's a lot to gain here by issuing and verifying attributes with various municipal and government agencies. PostGuard comes into play when sending important documents to agencies that don't yet work with identity wallet issuers and verifiers. Bereken Je Recht knows which documents you need to send for a particular application. And PostGuard can securely encrypt and email these to the relevant organizations!

## In closing
We're very excited to continue working on PostGuard, and we hope we've been able to share our enthusiasm about PostGuard with you. We believe PostGuard can truly make a difference in the world, helping you with a digital existence that works _for_ you instead of against you. That sounds a bit like a sales pitch you'd find on LinkedIn, but we truly believe it and we're happy to stand up for such an existence. Besides, PostGuard is free, so there's not much to sell.

<div class="center-container" style={{marginTop: "1.5rem"}}>
  <a class="button button--primary button--lg" href="https://PostGuard.eu" target="_blank" rel="noopener noreferrer">Try PostGuard now!</a>
</div>
