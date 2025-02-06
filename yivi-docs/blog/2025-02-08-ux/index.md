# Yivi UX Plans
One of the main goals for Yivi is to become the worlds most user friendly identity wallet.
We've already done a lot to help this cause, like allowing the user to directly start issuing missing credentials while they're trying to dislose so they
stay in the flow.

In this blog we'll look ahead at some of the plans we have for the near future to improve the user experience.

## Our four values for UX
To keep our goals clear and keep an eye on the usefulness of new features, we've written down our main values for the UX.
These values are:
- Accessible
- Understandable
- Trustworthy
- Beautiful

Accessible means that we're committed to making Yivi a good experience for everyone.

Understandable means that Yivi should feel familiar and usable to everyone.

Trustworthy is not just about using the most reliable protocols. 
It's also about conveying that to the user and letting them feel like they can trust Yivi, issuers and verifiers.
Things that fall into this category are imagery, colors and clear explanations.

Beautiful is not as important as the others, but the eye wants something too.
Things like consistent color, fonts and styling combined with fluid animations is what gives Yivi just that extra touch.


## Our plans for the near future
There are four UX improvements that we want to work on over the next couple of months.
These are:
- Getting compliant with European Accessibility Act
- QR code scanner button on the login page
- Easier card organisation and navigation
- Brand extensions

Let's look at them one by one.

### Getting compliant with European Accessibility Act (EAA)
The EAA is a directive that aims to improve the functioning of the internal market for accessible products and services,
by removing barriers created by divergent rules in member states of the European Union.

It applies to products and services that have been identified as being most important to people with disabilities.
Yivi aims to be one of those products and therefore should comply with this act.

For digital products, like Yivi, this means having to comply with the Web Content Accessibility Guide (WCAG) version 2.1 level AA.

Requirements include:
- Big enough touch targets
- Big enough contrast ratios
- Support for screen readers
- Alt text for visual media
- Support for large text
- And more

We plan to adhere to these standards by assessing our current state and make improvements accordingly.
Recently we've improved our screen reader support by adding better descriptions and hiding some distracting items from the screen reader.

Automatic tests will be introduced to make sure our Flutter code adhears to the touch target and contrast ratio requirements set by WCAG.

We encourage users to let us know what they think and how we can improve the experience for them.

### QR code scanner button on login page
For Yivi to be understandable it helps to feel familiar to some degree.
Lots of banking apps, at least in The Netherlands,
have a quickly accessible QR code scanner button on the login page that users can press even before entering their pin.
The pin code then needs to be entered to confirm the action the user wants to take based on the scanned QR code.
For banking apps that would most likely be transfering money.

Our plan is for Yivi to also support this flow. 
The user can quickly scan a QR code by pressing the button on the login page 
and then enter the pin afterwards to go ahead with the issuance or disclosure.


### Easier card organisation and navigation
We've received feedback from some of our users that the navigation and organisation of the cards inside the wallet.
Right now there's just a list of cards, categorized based on the Category field in the scheme and nothing more.
There's no way to sort, organize or navigate these cards. You can just scroll a list.

When a user has just a few credentials this is not a big issue, but when the list gets larger, finding the card you're looking for becomes harder and harder.

To solve this problem, we're planning to make the list editable and add search functionality.
Editable means the user will be able to select, move and delete credentials.

Sorting based on time and name is also something we're looking at,
but it's important to not let that interfere too much with custom ordering.

### Brand extensions
To build a level of trust, imagery and branding is important. 
As of now, credentials inside the Yivi app are plain, white cards with a name and a small logo for the issuer.
To feel more authentic, it would be nice if issuers had more control over what their card will look like.
The credential containing your ID information could for example look like your actual ID card.

We do need to consider what this means for usability, as the cards will most likely be taller than they are now and that could make the list a lot longer.

The card image itself could contain some of your personal data in the form of some kind of SVG template.
We need to keep in mind for this that not all of your data may fit on the card itself and not everyone will be able to read those details from the image
itself.

As for the technology, we're considering using the SD-JWT VC SVG template system as a basis.

We would like to get feedback from our issuers to see if this is something they would want, and if so, what features they'd want out of it.

## Closing up
So that's it for now. We'd love to hear from you about what you think about these plans and what other features you'd like to see in Yivi.
