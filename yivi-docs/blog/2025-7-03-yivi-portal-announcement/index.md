---
slug: 2025-july-portal-announcement
title: Yivi Portal announcement
authors: [saravahdatipour]
tags: [yivi, yivi-portal, trusted-verifier , mobile-app]
---

<a href="https://portal.yivi.app"> Yivi Portal </a> is Yivi's new initiative to help with a smooth launch for the Trusted/Pretty verifier. Trusted Verifier is a pivotal part of the roadmap as mentioned in earlier blog posts and
serves as part of our commitment to our users, as well as helps with transparency with our verifiers in covering the downstream costs of various verification sessions that our issuers bear.
In this blog post I will dive into what the portal exactly is, and what can you expect from the coming updates.


## Yivi Portal 

As part our core values, we want to make Yivi more accessible and easy to use. That also concerns developers and the business facing side of matters. 
In the portal you can see which organizations play a part and work with Yivi and search between the credentials information that is available. <br/>
 As a verifier (referred to as relying party to adhere with the most recently used terminologies) you can register as an organization. You will then be able to set up your relying party. In doing so, you will need to specify which attributes (e.g. age, phone number) you will be requesting. You can add a few of these. You will also need to provide some context explaining why the combination of attributes is needed. <br/> For example, an online liquor shop can add age, home and email address with the context of fulfilling orders, sending an email confirmation and posting the package. This helps us ensure legitimacy of these requests and protecting our user's privacy from sharing unnecessary information. You will then be given a DNS challenge, with which we verify your domain ownership. 
 <br/>When accepted, we will get started with publishing your relying party.
Another feature now coppled with the portal is the <a>new attribute index</a> service which was previously hosted seperately <a href="https://attribute-index.yivi.app/">here</a>. You can also issue demo credentials as you did previously. This can help our consumers find all they need to know about organizations and credentials in one place.
Starting **4th of July** you can register your organization or request maintainer rights for your existing organization.

<div class="center-container">
    <img src="/img/yivi-portal.png" class="ll" alt="Yivi Portal first look" />
</div>
<p style={{ textAlign: 'center', marginTop: '1em' }}>
    First look at the Yivi Portal
</p>




## Trusted Verifier 

Trusted Verifier is more than anything, rooted in enhancing user privacy through UX. 
This program is also known as pretty verifier program has been in the works as a way to further help our 
users stay safe and make informed decisions regarding sharing their information using Yivi. Yivi makes it easy for 
any party to set up a verification service and ask for user's data. <br/> The decision to share this information then fully relies on the user, who may be uninformed about the source of this request. The goal is to guide the user to consent only when they are sure about it. Yivi already does this to some extent, with the help of the <a href="https://github.com/privacybydesign/pbdf-requestors"> requestors scheme </a>.
Parties have already been able to make themselves known to Yivi, by adding their branding and hostname, which would then be manually verified by our team. The app would read this and present
user with the user friendly branding (name and logo). Otherwise users would be encountered with the raw url starting the session, which to most users 
will seem odd and unsafe.  <br/>
The new initiative plans to take this a step further, making it an easier and more instantanious decision for the user that what seems trusted party to share information
with and what is not. This is done through the use of colors. Green for trusted and red for untrusted. The new update will come out on **1st of September**.

<div class="center-container">
    <img 
        src="/img/trusted-verifier/trusted.png" 
        style={{ width: '35%', marginRight: '7em' , marginBottom: '1em'}} 
        alt="trusted-verifier" 
    />
    <img
        src="/img/trusted-verifier/untrusted.png"
        style={{ width: "35%" , marginBottom: '1em'}}
        alt="untrusted-verifier"
    />
</div>

<p style={{ textAlign: 'center', marginTop: '1em' }}>
    The app visually distinguishes trusted (green) and untrusted (red) verifiers, helping users make informed decisions before sharing their data.
</p>

:::warning
**4th of July**

Maintainers from organizations can register their organization in the Yivi portal. <br/>
Organizations that have **existing** and active verifiers are encouraged to register on the portal,
so applying new changes, clarifying on your verification needs and their context as well as making  agreements about the your usage needs can be facilitated.

**1st of September**

Mobile App Release will:
- Warn users that they are sharing data with an unknown party.
- Assures users that they share data with a known and trusted party.

Relying parties are expected to **have registered themselves** and **have an agreement with Yivi**.
:::

## What changes now?

Now with the portal up and running, we kindly ask relying parties that are interested in providing a good user experience
to their users to join by registering at the Yivi Portal, which makes participation easier than before. Want to start by joining to the portal? <br/>[This page](/trusted-verifier) in our Yivi documention goes through the steps on how to use the portal as a relying party. 
In the near future, we are adding support for registering as issuers (attestation providers) and providing assistance with key rollovers, verifying and including the new public key in the scheme in efforts to facilitate the process of [becoming an issuer](/issuer).







