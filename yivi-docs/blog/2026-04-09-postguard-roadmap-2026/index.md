---
slug: vooruitblikken-met-PostGuard
title: Vooruitblikken met PostGuard
authors: [rubenhensen]
tags: [PostGuard, e-mail, encryptie, roadmap]
---


![PostGuard logo](./postguard_cover.png)

Het Yivi team werkt hard aan Yivi zelf om EUDI compliant te worden, maar naast Yivi werken we ook hard aan andere projecten zoals PostGuard. In deze blog vertel ik je over PostGuard en wat PostGuards plannen zijn voor het komende jaar. Zo hoop ik dat jullie net zo enthousiast worden over PostGuard als ik. En dat als je bestanden wilt versturen, je het gaat doen met PostGuard natuurlijk!

<!-- truncate -->

Ik zal mezelf eerst even voorstellen. Ik ben Ruben en afgelopen februari ben ik begonnen bij Yivi als open source ontwikkelaar. Een echte vaste taak heb ik niet bij Yivi, maar ik ben druk bezig geweest met PostGuard. PostGuard is een identity-based, end-to-end file sharing service die voortkomt uit het [iHub](https://ihub.ru.nl/) van de Radboud Universiteit. Het is oorspronkelijk gestart als een NWO-project onder de naam Encryption 4 All en mede gefinancierd door [NLNet](https://nlnet.nl/). De encryptie wordt geregeld met behulp van Yivi, wat wij identity-based encryption noemen. De Post in PostGuard is voor de focus op e-mail, wat voor veel mensen de standaard blijft om een bestand naar iemand te sturen. Zie het als een tegenhanger van Zivver of WeTransfer, alleen dan Europees, open source en met de volledige omarming van [Privacy by Design](https://www.sfu.ca/~palys/Cavoukian-2011-PrivacyByDesign-7FoundationalPrinciples.pdf). Ik kan het lang en breed uitleggen, maar het makkelijkste is als je het even uitprobeert op [PostGuard.eu](https://PostGuard.eu). Als je klaar bent dan neem ik je mee in de roadmap van PostGuard.


## PostGuard voor jou
We willen graag dat jij PostGuard gaat gebruiken, gewoon omdat het handig is en fijn werkt. Geen gekke verkooptrucjes of verborgen abonnementen, geen tracking door of voor advertenties. We willen graag dat iedereen kan zien dat de identity wallet _here to stay_ is en dat het beheren van je eigen data juist fijn en makkelijk kan zijn. 

Tenzij je toevallig in Nijmegen woont, is de kans namelijk erg klein dat je een plek hebt gevonden waar je Yivi kan gebruiken en dat vinden we jammer. Daarom gaan we PostGuard en de Thunderbird en Outlook extensies gratis ter gebruik stellen voor persoonlijke doeleinden. Zo kan jij veilig en gratis grote bestanden sturen naar je vrienden of familie. Je kan dit op twee manieren doen:
1. Via de website, net als WeTransfer. Je uploadt een bestand via de website, en vult je eigen e-mail en die van de ontvanger in. Je bestanden worden door PostGuard naar de ontvangers ge-maild.
2. Via de extensies. We hopen dat met de Thunderbird en Outlook extensies het e-mailen van grote bestanden voelt als het versturen van een normale bijlage in een e-mail. Een bijkomend voordeel, de e-mail wordt dan ook verstuurd met jouw e-mail uit jouw naam. 

## PostGuard for Business
Het tweede deel van onze roadmap is PostGuard for Business. Het doel hier is vrij simpel uit te leggen, we willen een volledige E2E encryptie e-mail service worden met alles wat bedrijven daarbij verlangen. Dat houdt in downloadverificatie, e-mail revocatie, auditing trails en als belangrijkste programmatisch e-mailen vanuit een interne applicatie. Om dit te bereiken werken we mee aan verschillende Proof of Concepts (PoC) waar we de business case uittesten. Daarbij zeg ik trots dat we nu al aan het werk zijn voor twee projecten, Informatierijk notificeren met NotifyNL en Bereken Je Recht. Ik zal over beide iets meer vertellen.

### Informatierijk notificeren met NotifyNL
"Er is een bericht voor je binnen gekomen". Als je nu een mailtje krijgt van de overheid, dan staat daar vrij bewust niets in, geen linkje of bestanden, om te zorgen dat mensen vanuit zichzelf naar een vertrouwde omgeving gaan waar ze het bericht kunnen lezen. Super veilig natuurlijk, maar niet heel gebruiksvriendelijk. Met NotifyNL zijn we bezig om een PoC op te zetten waar burgers via NotifyNL een versleuteld bericht krijgen in hun e-mail. Zo kan de overheid met de attribuut verificatie van Yivi zeker zijn dat het bericht alleen door de goede persoon te lezen is. En heeft de burger het gebruiksgemak van het lezen van een normale e-mail waar alle informatie die ze nodig hebben gelijk wordt meegegeven.

### Bereken Je Recht
[berekenjerecht.nl](https://www.berekenjerecht.nl/) wil het makkelijk maken voor burgers om aanspraak te maken op de toeslagen waar je recht op hebt. Bereken Je Recht helpt je uitzoeken welke toeslagen je recht op hebt, en om die toeslagen daarna ook aan te vragen bij de juiste instanties. Het uiteindelijke doel is het proces, wat nu vaak rond de 10 weken tijd kost, te verkorten naar 10 minuten. Hier is veel winst in te halen met het uitgeven en verifiëren van attributen bij verschillende instanties van de gemeente en de overheid. PostGuard komt om de hoek kijken met het versturen van belangrijke documenten naar instanties die nog niet werken met identity wallet issuers en verifiers. Bereken Je Recht weet welke documenten je moet versturen voor een bepaalde aanvraag. En PostGuard kan dit veilig versleutelen en mailen naar de desbetreffende organisaties!

## Tot slot
Ik heb heel veel zin om verder te werken aan PostGuard, en hoop dat ik jullie mijn enthousiasme over PostGuard heb kunnen delen. Ik denk dat PostGuard echt een toevoeging kan zijn aan de wereld die jou en mij helpt met een digitaal bestaan dat _voor_ ons werkt in plaats van tegen ons. Dat klinkt een beetje als een verkoop praatje dat je op LinkedIn terug vindt, maar ik geloof het echt en ik maak mij graag hard voor zo'n bestaan. Daarbij is PostGuard gratis, dus er valt niet zo veel te verkopen. 

<div class="center-container" style={{marginTop: "1.5rem"}}>
  <a class="button button--primary button--lg" href="https://PostGuard.eu" target="_blank" rel="noopener noreferrer">Probeer PostGuard nu!</a>
</div>

Ruben Hensen\
Open source ontwikkelaar bij Yivi
