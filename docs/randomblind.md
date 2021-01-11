---
title: Randomblind issuance
---

<script type="text/x-mathjax-config">
  MathJax.Hub.Config({
    extensions: ["tex2jax.js"],
    jax: ["input/TeX", "output/HTML-CSS"],
    tex2jax: {
      inlineMath: [ ['$','$'], ["\\(","\\)"] ],
      displayMath: [ ['$$','$$'], ["\\[","\\]"] ],
      processEscapes: true
    },
    "HTML-CSS": { fonts: ["TeX"] }
  });
</script>
<script type="text/javascript" async src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/MathJax.js"></script>

*Randomblind* attributes are a new IRMA feature introduced in
[`irmago` v0.6.0](https://github.com/privacybydesign/irmago/releases/tag/v0.6.0)
that can give the user extra privacy
guarantees during issuance.  Specifically, if this mode of issuance is enabled
for an attribute within a credential type, this attribute is guaranteed to 
  1) be random, i.e., unequal to all previously issued instances of this attribute and 
  2) remain unknown to the issuer, while it still signs the attribute as part of the credential.

Note that latter property holds up until a user decides to disclosure the
attribute.  In this sense, the attribute can be seen as a one-time attribute.

This page explains how to enable this feature and later how this guarantee is
upheld cryptographically.  The primary use case of this feature is online
voting, where voting secrecy plays a vital role. Since it is easier to explain
by example, we'll use this use case as a practical example throughout this
document.


## API

Randomblind issuance is enabled in the scheme by adding the `randomblind` XML
attribute to an `Attribute` tag within the issue specification of a given
credential.  For more information about schemes, see [this
page](https://irma.app/docs/schemes/).  In the example below we enable this for
the second attribute in the credential. Any or all atributes in a credential
type can be randomblind.

``` xml
<IssueSpecification version="4">
  ...
  <Attributes>
    <Attribute id="...">
      ...
    </Attribute>
    <Attribute id="..." randomblind="true">
      ...
    </Attribute>
  ...
  </Attributes>
...
</IssueSpecification>
```

This means that during issuance, the issuing party (i.e., the requestor that
submits the issuance request to the IRMA server) must *not* pass attribute
values for attributes that are tagged as randomblind.

As a concrete example we use the "Demo Voting Card" credential type, see [this
page in the attribute
index](https://privacybydesign.foundation/attribute-index/en/irma-demo.stemmen.stempas.html#irma-demo.stemmen.stempas.election).
Even though the credential contains five attributes, the issuer must only give
four concrete values to construct the credential. For example, a requestor can
start an issuance session to issue such a credential using the following
command:

```
irma session --issue irma-demo.stemmen.stempas=test,test.com,14-12-2020,15-12-2020
```

Upon scanning the QR code, the IRMA app user is asked permission to perform the session and
obtain this credential.  During the session, the issuer and user jointly decide on the
value of the randomblind attributes, in this case the `votingnumber` attribute.
We explain in detail how this comes to pass in the next section. The final
value, which is at most 256 bits, ends up in the credential. The app displays
this attribute in a [base62 representation](https://en.wikipedia.org/wiki/Base62).


Before issuance               |  After issuance
:----------------------------:|:----------------------------:
![Permission](assets/rb_permission.jpg) | ![Card](assets/rb_card.jpg)

## Cryptography
In this section we will explain in detail how the issuer and the user are able
to perform such an issuance session. Randomblindness of attributes only concerns
the issuance protocol. The disclosure and signature protocols involving randomblind attributes
are in every aspect identical to disclosing or signing using a normal attribute.

We can assume that both parties have 
a scheme in which the indices of the randomblind attributes within the
credential type coincide. If this is not the case, either party cancels the
session. In the following example, we only have one randomblind attribute, but
the protocol can be extended straightforwardly to issue multiple randomblind
attributes.

TODO: link to intro on CL-signatures.

Variables $R, S, Z$ are public parameters defined by the Idemix public key of the issuer.

The issuance goes as follows:
- The user starts by sampling a random $v'$ and a random 255-bit integer $m_{r}'$ at
  the index $r$ of the randomblind attribute.
  This so-called *share* of the attribute remains secret, similar to
  how the user's secret key remains secret during issuance. 
  The user computes the commitment $U = S^{v'} R_0^{m_0} R_r^{m_{r}'} \mod n$.
  Note that $m_0$ is always the user's secret key. This commitment is sent to
  the issuer along with a [zero-knowledge proof](https://irma.app/docs/zkp/)
  of $v', m_0$ and $m_{r}'$.

- The issuer samples a random prime $e$. The issuer also samples $v''$ and $m_{r}''$ at random.
  Since attribute values ($m$'s) are at most 256 bits, $m_{r}''$ is also 255 bits (to not overflow).
  Next, the issuer computes 

  $$
    A = \Bigg(\frac{Z}{U S^{v''} R_{1}^{m_1} \dots \ R_{r}^{m_r''} \dots \ R_{n}^{m_n}}\Bigg)^{1/e}
  $$

  For every attribute that is tagged randomblind, the issuer includes its share
  of the attribute in the exponent. In this case, only for index $r$.  For
  regular attributes, the exponent is simply the attribute value that the
  issuer wants to pass. The issuer sends $(A, e, v'', m_{r}'')$ back to the
  user.

- Finally, the user is able to reconstruct any attributes that are the sum of two shares:
  $$
  v = v' + v'' \\
  m_r = m_r' + m_r''
  $$

  The CL signature becomes $(A, e, v)$. It follows that $Z = A^e S^v
  \prod_{i=0}^{l} R_{i}^{m_i}$ holds for the attributes $m$ in the resulting
  credential, meaning that signature (and thereby the credential) is valid.  We
  also note that the issuer does not have enough information to fully uncover
  $m_r$, which ends up as the attribute value in the resulting credential. The
  user is now free to use this attribute, knowing the issuer cannot trace it
  back to him/her.  Note that after revealing this attribute once, this
  guarantuee no longer holds.
