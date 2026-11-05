---
slug: yivi-8-4-vcdm
title: "Yivi 8.4: W3C credentials, richer cards and stronger status checks"
authors: [wouterensink]
tags: [yivi, openid4vci, openid4vp, sdjwtvc, vcdm, openbadges, mdoc, accessibility]
---

*Yivi app 8.4.0 adds end-to-end support for SD-JWT-secured W3C Verifiable Credentials. It can now receive these credentials over OpenID4VCI, present selected claims over OpenID4VP and show rich, structured content such as Open Badges clearly inside the wallet.*

<!-- truncate -->

## A second family of SD-JWT credentials

SD-JWT makes it possible to disclose selected claims from a signed credential without sharing the rest. Yivi already supported the IETF SD-JWT VC format. Version 8.4 adds the W3C Verifiable Credentials Data Model 2.0 variant defined by VC-JOSE-COSE, identified as `vc+sd-jwt`.

The complete flow is supported. An issuer can issue a `vc+sd-jwt` credential into Yivi over OpenID4VCI. Yivi verifies and stores it, presents it as a familiar card and can later answer an OpenID4VP request with only the claims the verifier asked for. When holder binding is required, the app wraps the credential in a signed W3C Verifiable Presentation so the verifier can establish that the presentation came from the credential's holder.

The distinction between the two SD-JWT families is now explicit:

- `dc+sd-jwt` identifies an IETF SD-JWT VC.
- `vc+sd-jwt` identifies an SD-JWT-secured W3C Verifiable Credential.

Earlier OpenID4VCI drafts also used `vc+sd-jwt` for what is now called `dc+sd-jwt`. Yivi no longer accepts that older interpretation because one identifier cannot safely describe two different credential models. Issuers using the draft-era name should update their credential configuration and JWT type.

## Open Badges that look like badges

One practical application of W3C credentials is [Open Badges 3.0](https://www.1edtech.org/standards/open-badges). An Open Badge can describe an achievement, the organisation that awarded it and supporting evidence. Those details are often nested several levels deep and may include images, which is a poor fit for a flat list of attribute keys and values.

Yivi 8.4 understands that structure. Objects are grouped under their own headings, list entries are kept together and numbered within their list, and ordinary values appear before nested sections and images. The technical `credentialSubject` wrapper is left out, because it adds no meaning for the person viewing the card. If an issuer did not provide a display label, Yivi turns a key such as `targetCode` into “Target code” instead of exposing the raw key.

<figure style={{textAlign: 'center', marginBottom: '1.5rem'}}>
  <video autoPlay muted loop playsInline style={{width: '100%', maxWidth: '290px', display: 'block', margin: '0 auto'}}>
    <source src="/img/yivi-8-4-open-badge-demo.mp4" type="video/mp4" />
  </video>
  <figcaption style={{marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--ifm-color-emphasis-600)'}}>An Open Badge being added to Yivi, with its achievement details grouped under their own heading.</figcaption>
</figure>

Images can now be claims in their own right. Yivi recognises image data embedded in a credential and image URLs used by Open Badges, downloads remote claim images over HTTPS and shows them on the issuance, credential, disclosure and activity screens. SVG images are rendered as SVG rather than as blank bitmap placeholders. Invalid logos are simply omitted instead of leaving a grey error box.

These changes are not limited to badges. They improve any SD-JWT or mdoc credential with structured attributes, portraits or other visual claims, while the permission screen still makes clear which claims will be shared.

## Revocation across credential formats

A wallet must not keep presenting a credential after its issuer has revoked it. Yivi 8.4 expands and aligns status checking across its supported formats:

- W3C credentials support both the [W3C Bitstring Status List](https://www.w3.org/TR/vc-bitstring-status-list/) and the IETF Token Status List.
- mdoc credentials can now use an IETF Token Status List, as SD-JWT VCs already could.
- Status List Tokens may be encoded as a JWT or a CWT.

Status is checked when a credential is issued and refreshed afterwards. A revoked credential is marked consistently in the credential list, on the disclosure screen and in the activity log. For a batch-issued credential, Yivi checks every instance and treats the batch according to its least favourable status. A network or verification failure never clears an earlier revocation.

The release also tightens what Yivi accepts at issuance. A batch must contain equivalent copies of one credential, so a wallet cannot show the values from one copy and later disclose different values from another. Critical SD-JWT claims may not be hidden as selective disclosures, weak or truncated digest algorithms are rejected, and reissuing a credential replaces the stored copy atomically.

## Smaller accessibility improvements

The Data tab's search and add buttons now have meaningful screen-reader labels: “Search your data” and “Obtain data”. On the More tab, a screen reader can read the App ID and version and activate the version item used to enable developer mode. The collect-data progress indicator no longer announces an unexplained numeric value; the useful “Step 1 of 2” text remains.

These are small changes in code, but important ones in use: an icon-only control is not a control if its purpose cannot be perceived.

## For issuers and verifiers

Yivi app 8.4.0 uses [`irmago` 1.5.0](https://github.com/privacybydesign/irmago/releases/tag/v1.5.0). Integrators can now test issuance and presentation of `vc+sd-jwt` credentials, including Open Badges, through the same OpenID4VCI and OpenID4VP paths as Yivi's other credential formats.

When implementing the new format, use `vc+sd-jwt` only for a W3C VCDM credential and `dc+sd-jwt` for an IETF SD-JWT VC. Keep validation properties such as `@context`, `type`, `issuer`, validity dates and status information visible to the wallet rather than making them selectively disclosable. Yivi resolves credential types from their JSON-LD contexts during issuance, so presentation does not need to contact a context host.

Start with our [OpenID4VCI issuer integration guide](/openid4vci-issuer-integration) and [OpenID4VP verifier integration guide](/openid4vp-verifier-integration). The complete app changes are listed in the [Yivi 8.4.0 release notes](https://github.com/privacybydesign/irmamobile/releases/tag/v8.4.0).
