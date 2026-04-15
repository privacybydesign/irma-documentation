---
slug: a-comparative-look-at-digital-driving-licenses 
title: A comparative look at digital driving licenses
authors: [danielbaay]
tags: [digital driving licenses, mDL]
---



Digital driving licenses are being introduced across Europe and beyond, but they don’t all work the same way. 

As part of my Master's thesis, I researched the progress and current state of digital driving licenses, also known as mobile driving licenses (mDLs). I compared Austria, Australia, and Germany to understand how these systems differ in practice, and what that means for wallet-based identification.

Austria and Australia, specifically New South Wales (NSW), are both relatively advanced in implementing mDLs. Austria stands out as a European frontrunner, with mDLs aligned with ISO standards and accepted by the police. Australia, while non-European, also has a working system, but with notable differences in design. 

Germany, in contrast, has not yet introduced mDLs. Adoption is slower, and both legal and cultural approaches are more cautious. Together, these countries provide a useful comparison on multiple aspects: operational vs. non-operational systems, EU vs. non-EU contexts, and fast vs. slow adoption. 


<!-- truncate -->

## How verification works in practice
One of the most visible differences lies in how digital driving licenses are verified during roadside checks.

In Austria, verification is registry-centric. There is a [specific QR code for roadside checks, called “Verkehrskontrolle”](https://www.bmi.gv.at/magazin/2023_01_02/32_E-Government.aspx) (English: traffic stop). This QR code is scanned with an official police device, which triggers a check in the central driving license register. 

Australia takes a [mixed approach](https://www.service.nsw.gov.au/nsw-digital-driver-licence/licence-checkers-and-the-nsw-digital-driver-licence). Verification is partly done via visual inspection, which is not much more than inspecting the mDL shown on the phone. Verification can also take place via a short-lived QR code, through which the validity of the license token is checked by authorized verifiers. However, documentation is limited, so it is not entirely clear whether this happens through a database. This suggests a more credential-centric approach, where the mDL is the primary source of trust. 

In Germany, a traditional approach is followed. mDLs are not yet available, so the physical license is checked instead. These are checked both through visual inspection and through police databases. 


## When things go wrong
Another important question is what happens when something goes wrong because a phone is unavailable.

In Austria, citizens are allowed to present a valid mDL through the [eAusweise app](https://www.id-austria.gv.at/en/verwenden/eausweise) during roadside police checks. If the phone is unavailable, either due to an empty battery or a technical issue, there is no clearly explained digital fallback. In practice, this is treated as if the driving license is not presented, unless the physical license is shown. Interestingly, if the failure is on the police side, the citizen should not be penalized.

In Australia (specifically NSW), the mDL is stored in the [Service NSW app](https://www.service.nsw.gov.au/nsw-digital-driver-licence/licence-holders-and-nsw-digital-driver-licence). Here, the rules are stricter: if a valid license is not shown immediately, it is treated as a failure to produce a license, which results in an immediate fine. As a fallback for a digital license, the physical license remains available, and it is therefore advised to always carry it. 

Germany represents the strictest case. mDLs are not yet accepted, and drivers are legally required to carry and present a physical license at all times. [Failure to do so results in a fine](https://www.nextpit.de/news/ohne-fuehrerschein-fahren-so-ist-es-jetzt-moeglich), even if the person holds a valid license. 

Across all three countries, mDLs do not yet replace physical documents. When technology fails, the system falls back entirely on traditional physical documents. This indicates that digital licenses currently complement physical ones, rather than replacing them.


## What if there is no internet?
An important question is how digital driving licenses work without an internet connection, especially in roadside checks, where connectivity cannot always be guaranteed.

No active internet connection is needed on the holder’s side for a police check in either [Austria](https://www.id-austria.gv.at/de/hilfe/hilfe-zur-app-eausweise/haeufige-fragen-eausweise-digitaler-fuehrerschein) or [Australia](https://www.service.nsw.gov.au/nsw-digital-driver-licence/licence-holders-and-nsw-digital-driver-licence). When the license is stored locally on the device, it can be shown offline. However, it is not entirely clear whether the police-side verification needs an internet connection. 

Germany, by contrast, does not rely on digital licenses at all. Verification is fully offline, as it is based on physical documents, although police may still perform database checks when needed.

Offline presentation is generally possible, either through locally stored digital credentials or physical documents, but offline verification is not always clearly defined. In practice, technical resilience still depends on the availability of physical documents as a fallback. 


## Who sees what, and who remembers it?
For Yivi, one of the most important questions is not just how digital driving licenses work, but what happens to the data during verification.

An interesting aspect of Austria’s system is that the level of [privacy protection depends on the context](https://www.id-austria.gv.at/en/verwenden/eausweise). In private interactions, privacy protection is relatively high, and verification happens locally through QR codes without central logging. In police checks, however, a central driving license register is queried when the QR code is scanned, and access is logged for oversight and accountability purposes. In law enforcement contexts, privacy is reduced in exchange for traceability and control.

Austria also shows that selective disclosure is technically possible, but it is not fully applied in driving license checks. In some cases, such as proof of age, it is possible to display a limited set of personal data. 

Australia also has [context-dependent privacy protection](https://www.service.nsw.gov.au/nsw-digital-driver-licence/licence-checkers-and-the-nsw-digital-driver-licence), but with less transparency. Data minimization and selective disclosure are used in age verification, but in roadside checks, the full license is shown, just as handing over a physical license. It is, however, unclear how verification events are logged.

Germany takes a different approach. mDLs are not yet operational, largely due to privacy and security concerns. An earlier attempt to introduce mDLs was [halted](https://www.bussgeldkatalog.org/digitaler-fuehrerschein/), which illustrates a cautious, law-first approach in which potential risks to privacy were considered unacceptable. Here, privacy acts as a blocking constraint instead of a design feature. 

Across all three countries, one key insight emerges: privacy in mDL systems is not a fixed property, but a trade-off. In everyday interactions, systems prioritize data minimization and limited disclosure, while in police contexts, privacy is often reduced in exchange for accountability, oversight, and legal certainty.


## What does this mean for Yivi?
The comparison shows that wallet-to-wallet identification is not just a technical challenge; it is shaped by legal rules, trust models, and accountability requirements that differ across countries. While the [upcoming EU regulation](https://transport.ec.europa.eu/news-events/news/modernised-eu-rules-driving-licences-and-driving-disqualifications-enter-force-2025-11-25_en) will harmonise the format and availability of mDLs, differences in verification practices and institutional requirements are likely to remain. Any solution therefore has to operate within these constraints.

One of the key challenges is trust. Different countries place trust in different parts of the system. Austria relies on central registers to confirm validity, while Australia places more trust in the digital credential itself. Germany, for now, does not allow digital verification at all. For Yivi, this means that a wallet-to-wallet solution cannot assume a single trust model, but must be flexible enough to support both state-backed and credential-based verification.

Another important constraint is offline use. In all cases, citizens are expected to be able to identify themselves without relying on a stable internet connection. This means that wallet-based identification must work under uncertain technical conditions and cannot fully replace physical documents. Instead, it has to coexist with them.

Finally, there is a fundamental tension between privacy and accountability. In everyday interactions, systems tend to minimize data sharing and limit traceability. In police contexts, however, this changes: verification is often logged, and more data may be exposed to ensure oversight and legal certainty.

For Yivi, this highlights a core design challenge: how to support selective disclosure and user control, while still enabling the level of accountability that law enforcement requires. 

Privacy in this context is not absolute. It depends on who is asking, and why.
