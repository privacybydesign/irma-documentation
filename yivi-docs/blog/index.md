---
slug: vooruitblikken-met-postguard
title: Vooruitblikken met Postguard
authors: [rubenhensen]
tags: [Postguard, e-mail, encryptie, roadmap]
---

# Vooruitblikken met Postguard
Yivi droomt groots, en die dromen gaan soms over Postguard.

Ik zal mezelf even voorstellen. Ik ben Ruben, een bijna afgestudeerde student van de Radboud Universiteit en afgelopen februari begonnen bij Yivi als open source ontwikkelaar. Een echte vaste taak heb ik niet bij Yivi, maar ik ben de afgelopen tijd druk bezig geweest met Postguard en ik wil jullie graag meenemen in de plannen die wij daarvoor in petto hebben.

Laat ik eerst even uitleggen wat Postguard is. Postguard is een end-to-end e-mail encryptie service ontwikkeld op de Radboud Universiteit, waar de encryptie geregeld wordt met behulp van Yivi, wat wij identity based encryption noemen. Zie het als een tegenhanger van Zivver of WeTransfer, alleen dan Europees, open source en met de volledige omarming van [Privacy by Design](https://www.sfu.ca/~palys/Cavoukian-2011-PrivacyByDesign-7FoundationalPrinciples.pdf). Ik kan het lang en breed uitleggen, maar het makkelijkste is als je het even uitprobeert op [postguard.eu](https://postguard.eu). Als je klaar bent dan neem ik je mee in de roadmap van Postguard.

## Postguard voor jou
We willen graag dat jij Postguard gaat gebruiken, gewoon omdat het handig is en fijn werkt. Geen gekke verkooptrucjes of verborgen abonnementen. We willen graag dat iedereen kan zien dat de identity wallet _here to stay_ is en dat het beheren van je eigen data juist fijn en makkelijk kan zijn. 

Tenzij je toevallig in Nijmegen woont, is de kans namelijk erg klein dat je een plek hebt gevonden waar je Yivi kan gebruiken, en dat vinden we jammer. Daarom gaan we Postguard en de Thunderbird en Outlook extensies gratis ter gebruik stellen voor persoonlijke doeleinden. Zo kan jij veilig en gratis grote bestanden sturen naar je vrienden of familie. Je akn die op twee manieren doe:
1. Via de website, net als WeTransfer. Je uploadt een bestand via de website, en vult je eigen email, en die van de ontvanger. Je bestanden worden door Postguard naar de ontvangers gemaild.
2. Via de extensies. We hopen dat met de Thunderbird en Outlook extensies het emailen van grote bestanden voelt als het versturen van een normale bijlage in een email. Een bijkomend voordeel, de e-mail wordt dan ook verstuurd met jou e-mail uit jouw naam. 

## Postguard for Business
Het tweede deel van onze roadmap is Postguard for Business. Het doel hier is vrij simpel uit te leggen, we willen een volledige e2e encryptie email service worden met alles wat bedrijven daarbij verlangen. Dat houdt in downloadverificatie, email revocatie, auditing trails en als belangrijkste programmatisch emailen vanuit een interne applicatie. Om dit te bereiken werken we mee aan verschillende Proof of Concepts waar we de business case uittesten. Daarbij zeg ik trots dat we nu al aan het werk zijn voor twee projecten, Informatierijk notificeren met NotifyNL en Bereken je recht. Ik zal over beide iets meer vertellen.

### Informatierijk notificeren met NotifyNL
"Er is een bericht voor je binnen gekomen". Als je nu een mailtje krijgt van de overheid, dan staat daar vrij bewust niets in, geen linkje of bestanden, om te zorgen dat mensen vanuit zichzelf naar een vertrouwde omgeving gaan waar ze het bericht kunnen lezen. Super veilig natuurlijk, maar niet heel gebruiksvriendelijk. Met NotifyNL zijn we bezig om een PoC op te zetten waar burgers via NotifyNL een versleuteld bericht krijgen in hun email. Zo kan de overheid met de attribuut verificatie van Yivi zeker zijn dat het bericht alleen door de goede persoon te lezen is. En heeft de burger het gebruiksgemak van het lezen van een normale email waar alle informatie die ze nodig hebben gelijk wordt meegegeven.

### Bereken je Recht
[berekenjerecht.nl](https://www.berekenjerecht.nl/) wil het makkelijk maken voor burgers om aanspraak te maken op de toeslagen waar je recht op hebt als burger. Bereken je recht helpt je uitzoeken welke toeslagen je recht op hebt, en om die toeslagen daarna ook aan te vragen bij de juiste instanties. Het uiteindelijke doel is het proces, wat nu vaak rond de 10 weken tijd kost, te verkorten naar 10 minuten. Hier is veel winst in te halen met het uitgeven en verifiëren van attributen bij verschillende instanties van de gemeente en de overheid. Postguard komt om de hoek kijken met het versturen van belangrijke documenten naar instanties die nog niet werken met identity wallet issuers en verifiers. Bereken je recht weet welke documenten je moet versturen voor een bepaalde aanvraag. En Postguard kan dit veilig versleutelen en mailen naar de desbetreffende organisaties!

## Onze roadmap
Tweede kwartaal:
- 17 april: de nieuwe postguard website presenteren op de [Yivi meetup](https://yivi.app/meetings/)
- E-mailen m.b.v. API-keys
- PoC voor Bereken je Recht en NotifyNL live
- Thunderbird en Outlook extensies klaar voor gebruik

Derde kwartaal:
- E-mail revocation
- Downloadbevestiging
- Auditing
- Postguard for Business portal 

Vierde kwartaal:
Dit durf ik nog niet te zeggen. De ontwikkelingen gaan snel binnen Yivi en Postguard, maar zo ook om ons heen. Wat nu voor handen ligt zal over zes maanden vast weer anders liggen. Ik zal jullie op de hoogte houden met een nieuwe blogpost als de tijd daar is. 

## Tot slot
Ik heb heel veel zin om verder te werken aan Postguard, en hoop dat ik jullie mijn enthousiasme over Postguard heb kunnen delen. Ik denk dat Postguard echt een toevoeging kan zijn aan de wereld die jou en mij helpt met een digitaal bestaan dat _voor_ ons werkt in plaats van tegen ons. Dat klinkt een beetje als een verkoop praatje dat je op LinkedIn terug vindt, maar ik geloof het echt en ik maak mij graag hard voor zo'n bestaan. Daarbij is Postguard gratis, dus er valt niet zo veel te verkopen. 

<div class="center-container" style="margin-top: 1.5rem;">
  <a class="button button--primary button--lg" href="https://postguard.eu" target="_blank" rel="noopener noreferrer">Probeer Postguard nu!</a>
</div>

Ruben Hensen\
Open source ontwikkelaar bij Yivi
