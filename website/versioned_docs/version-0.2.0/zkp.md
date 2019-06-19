---
title: Zero-knowledge proofs
id: version-0.2.0-zkp
original_id: zkp
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

IRMA uses zero-knowledge proofs to prove that a number satisfies a certain property, without disclosing the number itself, in various situations. In particular:

* When a user discloses part of the attributes of a credential, she hides the others using a zero-knowledge proof, with which she convinces the verifier that she possesses a valid issuer signature over all attributes from the credential, including the hidden ones.
* The user always uses the same number - her *secret key* - as the first attribute of each credential she receives, by proving to the issuer that she knows the number, without disclosing it to the issuer. This way the issuer can safely sign this attribute (together with the other ones) without knowing it.

Here we briefly review how zero-knowledge proofs are used in IRMA. We take the following:

* Let $G$ be a (multiplicatively written) [cyclic group](https://en.wikipedia.org/wiki/Cyclic_group). In Idemix which IRMA implements, this is $G = QR(n)$, the subgroup of [quadratic residues](https://en.wikipedia.org/wiki/Quadratic_residue) in the integers modulo $n$, with $n = p q$ a product of [safe primes](https://en.wikipedia.org/wiki/Safe_prime).
* Let $R$ be a generator of $G$ - that is, any element $P$ from $G$ can be written as $P = R^m$ for some integer (attribute) $m$. (Such a generator always exists because $G$ is cyclic.)

Now suppose that $R$ and $P$ are known, and the (IRMA) user wishes to convince someone (the *verifier*) that she knows the number $m$ which is such that $P = R^m$. IRMA uses *zero-knowledge proofs in the Fiat-Shamir heuristic* for this. Skipping many details, the following happens:

1. The verifier sends a random number $\eta$ called the *nonce* to the user.
1. The user:
   1. generates a random number $w$
   1. computes the *commitment* $W = R^w$,
   1. computes the *challenge* $c = H(P, W, \eta)$, where $H$ is a hash function (e.g., SHA256)
   1. computes the *response* $s = cm + w$,
   1. sends the tuple $(c, s)$ to the verifier.
1. The verifier computes $W' = R^sP^{-c}$ and $c' = H(P, W', \eta)$, and then verifies that $c = c'$.

If $c$ and $s$ are correctly computed, then $W' = R^sP^{-c} = R^{cm+w}R^{-mc} = R^w = W$, so that the verification equation $c' = H(P, W', \eta) = H(P, W, \eta) = c$ indeed holds. Additionally, when correctly implemented this protocol guarantees the following:
* The user indeed knows $m$ (more precisely: if the user does not know the number $m$ then it cannot make the verifier accept),
* The verifier learns nothing about the value or properties of $m$ that it did not already know, except that it is known to the user.

The actual zero-knowledge proof protocol implemented in IRMA allows for simultaneous proving knowledge of *multiple* hidden numbers, instead of just the one $m$ like the protocol above. This extension is essentially straightforward and not relevant here.

Due to the fact that the order of the group $QR(n)$ in which the proofs take place is not known to all participants (in fact, this group order is the IRMA issuer's secret key), the proofs of knowledge in IRMA are slightly more complicated than they would be if the group order were known (such as for example in elliptic curves). For example, if the group order were known then the response $s = cm + w$ from step 2.4 above would be reduced modulo the group order. Instead in IRMA we have to choose $w$ to be very large so that even without this modular reduction it still completely hides $m$. For full details about proofs of knowledge in this situation, we refer to Appendix C of the [Identity Mixer specification](https://domino.research.ibm.com/library/cyberdig.nsf/1e4115aea78b6e7c85256b360066f0d4/eeb54ff3b91c1d648525759b004fbbb1?OpenDocument).
