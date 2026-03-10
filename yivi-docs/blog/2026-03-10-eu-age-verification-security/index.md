---
slug: eu-age-verification-security-analysis
title: If the European Age Verification app launches today, it will be broken tomorrow
authors: [dibranmulder]
tags: [security, privacy, eudi-wallet, age-verification, analysis]
---

*A security analysis of the EU Age Verification Wallet reveals a privacy-first design with a critical trust gap that undermines its security guarantees.*

<!-- truncate -->

## Introduction

The European Commission is building an [Age Verification (AV) Wallet](https://github.com/eu-digital-identity-wallet/av-app-android-wallet-ui) - a mobile application that allows EU citizens to prove their age using their passport, without revealing their actual birth date or identity. It's part of the broader [EU Digital Identity Wallet](https://commission.europa.eu/strategy-and-policy/priorities-2019-2024/europe-fit-digital-age/european-digital-identity_en) initiative.

The concept is compelling: scan your passport with NFC, verify you're the legitimate holder via face matching, and receive a cryptographic credential that proves "I am over 18" without revealing who you are. Privacy advocates should be pleased.

But after conducting a thorough security analysis of the [Android](https://github.com/eu-digital-identity-wallet/av-app-android-wallet-ui) and [iOS](https://github.com/eu-digital-identity-wallet/av-app-ios-wallet-ui) implementations, along with the [Python issuer service](https://github.com/eu-digital-identity-wallet/av-srv-web-issuing-avw-py), I found a fundamental architectural flaw: **the issuer has no way to verify that the passport verification actually happened**.

If this app launches in its current state, it will be trivially bypassable by anyone with basic reverse engineering skills. Let me explain why.

---

## The good: privacy by design

First, credit where it's due. the architecture respects privacy:

### Biometric data never leaves your device

The face matching between your passport photo and your live selfie happens entirely on-device using [ONNX models](https://onnx.ai/) (MediaPipe for face detection, GLintR100 for embeddings, SilentFace for liveness). Your face images are never sent to any server.

```
Passport Photo → [On-Device Face Matching] → Live Selfie
                         ↓
                 Match Result (yes/no)
                         ↓
              Only "birth_date" sent to issuer
```

### Passport data stays local

The app reads your passport via NFC following the [ICAO 9303](https://www.icao.int/publications/pages/publication.aspx?docnum=9303) standard. It extracts:
- DG1: Basic MRZ data (name, birth date, passport number)
- DG2: Face image
- DG11: Full birth date
- SOD: Security Object (cryptographic signatures)

All of this data stays on your phone. The issuer only receives your birth date - nothing else.

### Device biometrics are truly private

When you unlock the app with Face ID, Touch ID, or fingerprint, this authentication happens in your device's secure hardware:
- **iOS**: Secure Enclave
- **Android**: Trusted Execution Environment (TEE)

Neither Apple nor Google receives your biometric data. This is how mobile biometrics should work.

---

## The bad: a fundamental trust gap

Here's the problem: **all the security checks happen in the app, but the issuer can't verify they actually ran**.

### What actually gets sent to the issuer

When you request an age verification credential, here's what the issuer receives:

```json
{
  "credential_configuration_id": "eu.europa.ec.eudi.age_verification_mdoc",
  "proof": {
    "proof_type": "jwt",
    "jwt": "<device key proof>"
  }
}
```

Plus, after authorization, the issuer gets your `birth_date`.

That's it.

### What the issuer does not receive

- No SOD (Security Object Document) from the passport
- No cryptographic proof that a real passport was scanned
- No proof that integrity checks passed
- No proof that face verification occurred
- No proof that liveness detection passed

The issuer is **blindly trusting the app** to have done all these checks correctly.

### The attack

An attacker with moderate technical skills can:

1. **Decompile the APK** using [apktool](https://apktool.org/) or [jadx](https://github.com/skylot/jadx)
2. **Modify the verification logic** to always return "success"
3. **Hardcode any birth date** they want
4. **Recompile and sign** the modified app
5. **Request a credential** - the issuer has no way to know the checks were bypassed

Or, without modifying the app at all:

1. **Root/jailbreak the device**
2. **Use [Frida](https://frida.re/)** to hook the verification functions at runtime
3. **Force all checks to return success**
4. **Proceed with fraudulent credential issuance**

The issuer sees a valid request and issues a credential. There's no cryptographic evidence that anything was tampered with.

---

## The technical details

### Passport verification: client-side only

The passport verification happens in [`PassportNFC.kt`](https://github.com/eu-digital-identity-wallet/av-app-android-wallet-ui/blob/main/passport-scanner/src/main/java/eu/europa/ec/passportscanner/nfc/passport/PassportNFC.kt) (Android) and uses the [JMRTD](https://jmrtd.org/) library:

```kotlin
// All verification happens locally
private fun verifyHT() { /* Hash verification */ }
private fun verifyDS() { /* Signature verification */ }
private fun verifyCS() { /* Certificate chain verification */ }
```

These checks verify:
- **Hash Table (HT)**: Data hasn't been modified
- **Document Signature (DS)**: Issuing authority signed the document
- **Certificate Chain (CS)**: Certificate chains to a trusted CSCA

All of this is good cryptography. But the results never leave the device in a verifiable form.

### Face verification: easily bypassable

The face matching uses a native SDK with these thresholds:

```kotlin
// WalletCoreConfigImpl.kt
faceMatchConfig = FaceMatchConfig(
    livenessThreshold = 0.972017,  // 97.2% confidence required
    matchingThreshold = 0.5        // 50% similarity required
)
```

The 97.2% liveness threshold sounds strict, but it doesn't matter if an attacker can simply hook the result:

```javascript
// Frida script to bypass face verification
Interceptor.attach(Module.findExportByName("libavfacelib.so", "jni_match"), {
    onLeave: function(retval) {
        retval.replace(1);  // Always return "match successful"
    }
});
```

### The issuer has no defense

Looking at the [issuer code](https://github.com/eu-digital-identity-wallet/av-srv-web-issuing-avw-py/blob/main/app/formatter_func.py), we can see it simply accepts the birth date and creates a credential:

```python
# formatter_func.py - mdocFormatter()
def mdocFormatter(data, credential_metadata, country, device_publickey):
    # No verification of passport authenticity
    # Just trusts the data and signs a credential
    mdoci.new(
        doctype="eu.europa.ec.av.1",
        data=data,  # Trusts this completely
        devicekeyinfo=device_publickey,
        ...
    )
```

---

## "But what about app attestation?"

You might think: "Can't we use Google Play Integrity or Apple App Attest to verify the app hasn't been modified?"

### Play Integrity / App Attest can help, but...

Yes, these APIs can verify:
- The app is the genuine, unmodified version from the store
- The device isn't rooted/jailbroken
- The device passes integrity checks

But they **cannot** verify:
- That the passport verification actually ran
- That the face matching occurred
- That the results were genuine

Even simpler: an attacker can bypass the app entirely:
1. Study the OpenID4VCI protocol the issuer uses
2. Generate your own key pair
3. Send HTTP requests directly to the issuer with any birth_date
4. Receive a credential bound to your key

The issuer has no way to distinguish this from a legitimate app request. App attestation only helps if the issuer *requires* it - and even then, it only proves the app is genuine, not that the app did its job correctly.

### Privacy cost of app attestation

There's also a privacy tradeoff:

| Platform | What the vendor learns |
|----------|----------------------|
| Google Play Integrity | You're using the app, when, device details, linked to Google account |
| Apple App Attest | You're using the app, device identifier (obfuscated) |

For privacy-conscious users, this creates an uncomfortable dependency on Big Tech surveillance infrastructure.

### Exclusion of open source users

Users of privacy-focused Android distributions like [GrapheneOS](https://grapheneos.org/) or [LineageOS](https://lineageos.org/) - who specifically avoid Google Play Services - would be unable to use the app if Play Integrity becomes mandatory.

---

## What would actually work

### The fix: server-side passport verification

The issuer needs **cryptographic proof** that a real passport was scanned. Here's what should be sent:

```kotlin
data class PassportProof(
    val sodFile: ByteArray,      // Security Object Document
    val dsCertificate: ByteArray, // Document Signing Certificate
    val dg1Bytes: ByteArray,      // Raw DG1 data (includes birth date)
)
```

The issuer would then:
1. **Verify SOD signature** with the DS certificate
2. **Verify certificate chain** against known CSCAs (Country Signing CAs)
3. **Hash DG1** and compare to the hash in SOD
4. **Extract birth date** from the now-verified DG1

This way, a modified app **cannot** forge a valid passport proof - it would need to forge the passport's cryptographic signatures, which is infeasible.

### The tradeoff: privacy vs security

Here's the tension:

| Approach | Privacy | Security |
|----------|---------|----------|
| Current (all on-device) | Excellent | Weak |
| Server-side passport verification | Reduced (nationality revealed) | Strong |

Sending SOD + DS certificate to the server reveals:
- Your nationality (from the certificate)
- That you have a valid passport

It does NOT reveal your name, passport number, or face image.

The recommendation: **verify and discard**. The issuer verifies the cryptographic proof, extracts the birth date, and immediately discards the passport data without storing it.

---

## The bigger picture

This isn't just about age verification. The [EU Digital Identity Wallet](https://github.com/eu-digital-identity-wallet) is intended to become a cornerstone of digital identity in Europe - used for everything from opening bank accounts to accessing government services.

If the architecture trusts the app to honestly report verification results, the entire system's security depends on the assumption that no one will modify the app. In 2025, that's not a reasonable assumption.

The cryptographic building blocks are all there:
- Passports have digital signatures (ICAO 9303)
- The SOD contains verifiable hashes
- Certificate chains can be validated
- [OpenID4VCI](https://openid.net/specs/openid-4-verifiable-credential-issuance-1_0.html) supports proof mechanisms

The app just needs to **use** them in a way the issuer can verify.

---

## Conclusion

The EU Age Verification Wallet demonstrates that privacy-preserving identity verification is possible. The team has made thoughtful choices:
- Biometrics stay on-device
- Face images never leave the phone
- Only the minimum necessary data (birth date) goes to the issuer

But privacy without security is incomplete. Right now, the system relies entirely on trusting the app - and apps can be modified, hooked, or tricked.

**The fix is clear**: send cryptographic passport proofs to the issuer. This adds a small privacy cost (nationality revealed) but provides the security guarantee that the current design lacks.

Until then, if this app launches today, someone will bypass it tomorrow.

---

## References

- [AV Android Wallet (GitHub)](https://github.com/eu-digital-identity-wallet/av-app-android-wallet-ui)
- [AV iOS Wallet (GitHub)](https://github.com/eu-digital-identity-wallet/av-app-ios-wallet-ui)
- [AV Issuer Service (GitHub)](https://github.com/eu-digital-identity-wallet/av-srv-web-issuing-avw-py)
- [EUDI Wallet Core Library](https://github.com/eu-digital-identity-wallet/eudi-lib-android-wallet-core)
- [ICAO 9303 - Machine Readable Travel Documents](https://www.icao.int/publications/pages/publication.aspx?docnum=9303)
- [OpenID4VCI Specification](https://openid.net/specs/openid-4-verifiable-credential-issuance-1_0.html)
- [OpenID4VP Specification](https://openid.net/specs/openid-4-verifiable-presentations-1_0.html)
- [JMRTD - Java Machine Readable Travel Documents](https://jmrtd.org/)
- [EU Digital Identity Wallet Initiative](https://commission.europa.eu/strategy-and-policy/priorities-2019-2024/europe-fit-digital-age/european-digital-identity_en)
- [Frida - Dynamic Instrumentation Toolkit](https://frida.re/)
- [Google Play Integrity API](https://developer.android.com/google/play/integrity)
- [Apple App Attest](https://developer.apple.com/documentation/devicecheck/establishing_your_app_s_integrity)

---

*This analysis is based on the publicly available source code as of March 2026. The findings are intended to help improve the security of the EU Digital Identity ecosystem.*
