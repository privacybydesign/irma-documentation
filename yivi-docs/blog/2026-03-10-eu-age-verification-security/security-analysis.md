# Security Analysis: Age Verification Credential Issuance Flow

This document analyzes the security model of the passport-to-credential flow, identifying trust assumptions, attack vectors, and potential mitigations.

---

## Executive Summary

The current implementation has a **significant trust gap**: all passport integrity verification and face matching happens **client-side** (in the app), but the issuer has **no cryptographic proof** that these checks actually occurred or passed. An attacker with a modified app could bypass all verification and submit arbitrary `birth_date` values to receive fraudulent age verification credentials.

| Security Property | Current Status | Risk Level |
|-------------------|----------------|------------|
| Passport chip authenticity | Client-side only | **HIGH** |
| Passport data integrity | Client-side only | **HIGH** |
| Face liveness detection | Client-side only | **HIGH** |
| Face matching | Client-side only | **HIGH** |
| App integrity | Limited (wallet attestation) | **MEDIUM** |
| Credential binding | Strong (device key) | LOW |

---

## 1. Trust Model Analysis

### What the Issuer Actually Receives

When the wallet requests an age verification credential, it sends:

```json
{
  "credential_configuration_id": "eu.europa.ec.eudi.age_verification_mdoc",
  "proof": {
    "proof_type": "jwt",
    "jwt": "<signed with device key, contains device public key>"
  }
}
```

Plus user data (after authorization):
- `birth_date` - extracted from passport DG1/DG11

### What the Issuer Does NOT Receive

- **No SOD (Security Object Document)** - The signed hash table from the passport
- **No DS certificate** - The Document Signing Certificate
- **No signature verification proof** - Evidence that passport signatures were valid
- **No CSCA chain proof** - Evidence that certificates chained to trusted roots
- **No Chip Authentication proof** - Evidence that the chip was genuine (not cloned)
- **No face matching result** - Evidence that face verification passed
- **No liveness detection proof** - Evidence that a real person was present
- **No raw passport data** - Only the claimed `birth_date`

### The Trust Gap

```
┌─────────────────────────────────────────────────────────────────┐
│                    WHAT HAPPENS IN THE APP                       │
│  (Attacker can modify/bypass ALL of this)                       │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │ NFC Read    │ → │ Integrity   │ → │ Face Match  │         │
│  │ Passport    │    │ Verify      │    │ Liveness    │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│         ↓                  ↓                  ↓                  │
│    [Can fake]         [Can skip]         [Can skip]             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    Only "birth_date" sent
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                         ISSUER                                   │
│  - Cannot verify passport was real                              │
│  - Cannot verify integrity checks passed                        │
│  - Cannot verify face match occurred                            │
│  - Blindly trusts the birth_date value                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Attack Vectors

### Attack 1: Modified App (Complete Bypass)

**Threat**: Attacker modifies the APK to bypass all verification.

**Steps**:
1. Decompile the APK using apktool/jadx
2. Modify `PassportNFC.kt` to skip `verifyHT()`, `verifyDS()`, `verifyCS()`
3. Modify `AVFaceMatchSdkImpl.kt` to always return `isSameSubject = true`
4. Hardcode any desired `birth_date` value
5. Recompile and sign with debug key
6. Request credential from issuer

**Result**: Attacker receives valid age verification credential without ever having a real passport or matching face.

**Difficulty**: Medium - Requires Android reverse engineering skills

**Current Mitigation**: None effective. The `WalletAttestationProvider` attests to the wallet instance, but:
- It doesn't attest to app integrity (no SafetyNet/Play Integrity)
- It doesn't attest to verification results
- A modified app can fake the attestation request

### Attack 2: Frida/Xposed Hooking (Runtime Bypass)

**Threat**: Attacker uses runtime hooking to bypass checks without modifying the APK.

**Steps**:
1. Install Frida or Xposed on rooted device
2. Hook `verifyHT()`, `verifyDS()`, `verifyCS()` to return success
3. Hook `nativeBridge.safeMatch()` to return `true`
4. Hook `nativeBridge.safeProcess()` to return `isLive = true`
5. Inject arbitrary `birth_date` before it's sent to issuer

**Result**: Same as Attack 1 - fraudulent credential issuance.

**Difficulty**: Medium - Common technique in mobile security testing

**Current Mitigation**: None. No root detection, no hooking detection.

### Attack 3: Face Spoofing (Without App Modification)

**Threat**: Attacker uses someone else's passport and spoofs the face verification.

**Attack Variants**:

| Attack Type | Description | Effectiveness |
|-------------|-------------|---------------|
| **Photo attack** | Hold up photo of passport owner | Blocked by liveness (97.2% threshold) |
| **Video replay** | Play video of passport owner | Partially blocked by liveness |
| **3D mask** | Wear realistic 3D-printed mask | May bypass liveness |
| **Deepfake injection** | Inject deepfake video into camera feed | Bypasses client-side liveness |

**Liveness Detection Limitations**:
- Uses passive liveness (silentface40/silentface27 models)
- No active challenges (blink, turn head, etc.)
- Client-side only - attacker can inject frames after liveness check
- 97.2% threshold is high but not perfect

**Current Mitigation**: Dual liveness models with high threshold, majority voting across 3 frames. However, all checks are client-side.

### Attack 4: Passport Data Injection

**Threat**: Attacker never scans a real passport, just injects data.

**Steps**:
1. Modify app to skip NFC reading entirely
2. Hardcode passport data structure with desired `birth_date`
3. Provide any face image for "matching"
4. Proceed to issuance

**Result**: Credential issued without any real passport involved.

**Difficulty**: Low-Medium - Just need to understand the data flow

**Current Mitigation**: None. Issuer cannot distinguish real passport data from injected data.

### Attack 5: Cloned Passport Chip

**Threat**: Attacker clones a passport chip to a writable NFC card.

**Analysis**:
- **Basic cloning**: Would fail Chip Authentication (CA) if implemented
- **Current state**: CA is optional and not required for issuance
- **Golden image attack**: Clone just the data, modify birth_date → fails HT verification
- **But**: HT verification is client-side, can be bypassed

**Current Mitigation**: Chip Authentication (CA) is implemented but:
- Not enforced as requirement for issuance
- Result not sent to issuer
- Can be bypassed with modified app

---

## 3. What IS Secure

### Device Key Binding (Strong)

The credential becomes cryptographically bound to the device's private key:

```python
mdoci.new(
    doctype="eu.europa.ec.av.1",
    devicekeyinfo=device_publickey,  # Bound to credential
    ...
)
```

- Private key stored in Android Keystore (hardware-backed on most devices)
- Credential cannot be used without proving possession of private key
- Prevents credential theft/copying after issuance

**But**: This only protects the credential after issuance. It doesn't prevent fraudulent issuance.

### Wallet Attestation (Partial)

The app has `WalletAttestationProvider`:

```kotlin
override suspend fun getWalletAttestation(keyInfo: KeyInfo): Result<String>
override suspend fun getKeyAttestation(keys: List<KeyInfo>, nonce: Nonce?): Result<String>
```

This attests to:
- Wallet instance identity
- Key material

This does NOT attest to:
- App integrity (no Play Integrity API)
- Verification results
- That a real passport was scanned

---

## 4. Recommended Mitigations

### Priority 1: Server-Side Passport Verification (CRITICAL)

**Send passport cryptographic proof to issuer:**

```kotlin
// Instead of just birth_date, send:
data class PassportProof(
    val sodFile: ByteArray,           // Security Object Document
    val dsCertificate: ByteArray,     // Document Signing Certificate
    val dg1Bytes: ByteArray,          // Raw DG1 data
    val dg11Bytes: ByteArray?,        // Raw DG11 data (if available)
    val chipAuthResult: ChipAuthProof? // Optional CA proof
)
```

**Issuer verifies:**
1. Parse SOD, extract hashes
2. Hash DG1/DG11, compare to SOD hashes (HT)
3. Verify SOD signature with DS certificate (DS)
4. Verify DS certificate chains to trusted CSCA (CS)
5. Extract `birth_date` from verified DG1/DG11

**Benefits**:
- Issuer cryptographically verifies passport authenticity
- Modified apps cannot forge valid SOD signatures
- Birth date provably came from real passport

### Priority 2: App Attestation (HIGH)

**Integrate Android Play Integrity API:**

```kotlin
// Request integrity verdict
val integrityTokenProvider = IntegrityTokenProvider(context)
val token = integrityTokenProvider.request(nonce)

// Send to issuer with credential request
// Issuer verifies:
// - App is genuine (not modified)
// - Device passes integrity checks
// - Not running on emulator/rooted device
```

**Benefits**:
- Detects modified APKs
- Detects rooted devices
- Detects emulators
- Harder to bypass than client-side checks

### Priority 3: Server-Side Face Verification (MEDIUM-HIGH)

**Option A: Send face data to server**

```kotlin
// Send encrypted face data
data class FaceVerificationRequest(
    val passportPhoto: EncryptedBytes,  // From DG2
    val selfieFrames: List<EncryptedBytes>,
    val livenessChallenge: String
)
```

**Privacy concerns**: Face images leave device
**Mitigation**: Use privacy-preserving techniques (homomorphic encryption, secure enclaves)

**Option B: Verifiable face matching proof**

- Use a Trusted Execution Environment (TEE) to run face matching
- TEE produces signed attestation of match result
- Issuer verifies TEE attestation

### Priority 4: Active Authentication (MEDIUM)

**Use passport's Active Authentication feature:**

```kotlin
// Challenge-response with passport chip
val challenge = issuer.getChallenge()
val response = passport.activeAuthenticate(challenge)
// Send response to issuer
// Issuer verifies signature with AA public key from DG15
```

**Benefits**:
- Proves chip has private key (not cloned)
- Cannot be spoofed without physical access to original chip

**Limitations**:
- Not all passports support AA
- Requires issuer involvement in challenge generation

### Priority 5: Enhanced Liveness Detection (MEDIUM)

**Add active liveness challenges:**

```kotlin
// Instead of passive-only liveness:
sealed class LivenessChallenge {
    object Blink : LivenessChallenge()
    object TurnLeft : LivenessChallenge()
    object TurnRight : LivenessChallenge()
    object Smile : LivenessChallenge()
}

// Server generates random sequence
// App must detect correct responses
// Harder to spoof than passive liveness
```

**Benefits**:
- Significantly harder to spoof with photos/videos
- Random challenges prevent replay attacks

---

## 5. Comparison: Current vs. Recommended

| Check | Current | Recommended |
|-------|---------|-------------|
| Passport hash verification | Client-side | **Server-side** (send SOD) |
| Passport signature verification | Client-side | **Server-side** (send DS cert) |
| Certificate chain verification | Client-side | **Server-side** (verify against CSCA) |
| Chip authentication | Client-side (optional) | **Server-verified** (Active Auth) |
| App integrity | None | **Play Integrity API** |
| Face liveness | Client-side passive | **Server-side + active challenges** |
| Face matching | Client-side | **TEE-attested or server-side** |

---

## 6. Risk Assessment Summary

### Current Risk Level: HIGH

An attacker with moderate technical skills can:
- Obtain fraudulent age verification credentials
- Use any birth_date they want
- Completely bypass all security checks
- Do so without being detected

### With Recommended Mitigations: LOW-MEDIUM

After implementing server-side passport verification and app attestation:
- Attacker would need to compromise the passport's cryptographic signatures (infeasible)
- Modified apps would be detected by Play Integrity
- Face spoofing would be significantly harder

---

## 7. Hypothesis: Would Play Integrity API Be Sufficient?

### What Play Integrity API Provides

Google's Play Integrity API can attest to three things:

| Verdict | What it proves |
|---------|----------------|
| **App integrity** | The APK is genuine, signed by the original developer, installed from Play Store |
| **Device integrity** | The device passes Android compatibility tests, has a verified boot state, is not rooted |
| **Account details** | The device has a licensed Google Play account |

### Integration Example

```kotlin
// In the wallet app
val integrityManager = IntegrityManagerFactory.create(context)
val integrityTokenResponse = integrityManager
    .requestIntegrityToken(
        IntegrityTokenRequest.builder()
            .setNonce(issuerProvidedNonce)  // Prevents replay
            .build()
    )
    .await()

// Send token to issuer with credential request
val credentialRequest = CredentialRequest(
    credentialConfigurationId = "eu.europa.ec.eudi.age_verification_mdoc",
    proof = deviceKeyProof,
    integrityToken = integrityTokenResponse.token()  // NEW
)
```

```python
# On issuer side - verify the token
from google.auth.transport import requests
from google.oauth2 import id_token

def verify_play_integrity(token, expected_nonce):
    # Decode and verify with Google's API
    verdict = playintegrity.decodeIntegrityToken(token)

    # Check verdicts
    assert verdict.appIntegrity.appRecognitionVerdict == "PLAY_RECOGNIZED"
    assert verdict.deviceIntegrity.deviceRecognitionVerdict in ["MEETS_DEVICE_INTEGRITY", "MEETS_STRONG_INTEGRITY"]
    assert verdict.requestDetails.nonce == expected_nonce
```

### What Play Integrity WOULD Prevent

| Attack | Blocked? | Explanation |
|--------|----------|-------------|
| Modified APK | **YES** | App won't be recognized as genuine |
| Frida on rooted device | **YES** | Device integrity check fails |
| Xposed Framework | **YES** | Requires unlocked bootloader, fails device check |
| Emulator attacks | **YES** | Emulators fail device integrity |
| Magisk (basic) | **PARTIAL** | MagiskHide may bypass, but increasingly detected |
| Debug builds | **YES** | Only Play Store releases pass |

### What Play Integrity WOULD NOT Prevent

| Attack | Blocked? | Why not |
|--------|----------|---------|
| Data injection via legitimate app | **NO** | App is genuine, but attacker controls input |
| Face spoofing (photo/video/mask) | **NO** | Doesn't attest to what the app did |
| Fake passport data entry | **NO** | Doesn't prove NFC scan occurred |
| Bypassing checks via app vulnerabilities | **NO** | App integrity ≠ correct execution |
| Sophisticated Magisk bypass | **NO** | Arms race with root hiding |
| Virtual environments (some) | **PARTIAL** | Some pass integrity checks |

### The Critical Gap: Attestation ≠ Execution Proof

**Play Integrity proves the app is genuine. It does NOT prove:**

```
┌─────────────────────────────────────────────────────────────────┐
│ WHAT PLAY INTEGRITY ATTESTS TO:                                 │
│                                                                 │
│   "This is the genuine AV Wallet app, running on a             │
│    genuine Android device, installed from Play Store"          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    BUT IT DOES NOT PROVE:
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ WHAT ACTUALLY NEEDS TO BE PROVEN:                               │
│                                                                 │
│   ✗ "A real passport was scanned via NFC"                      │
│   ✗ "The passport integrity checks passed"                     │
│   ✗ "The face verification was performed"                      │
│   ✗ "The face matched the passport photo"                      │
│   ✗ "The birth_date came from verified passport data"          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Scenario: Attack on Play Integrity-Protected App

Even WITH Play Integrity, an attacker could:

1. **Use the legitimate app** from Play Store on a genuine device
2. **Scan a random passport** (or any NFC card that responds)
3. **Let integrity checks fail** (attacker doesn't care)
4. **Exploit app logic** to proceed despite failures:
   - Find a code path that doesn't check `verificationStatus`
   - Use a race condition
   - Exploit error handling that defaults to "success"
5. **Enter fake birth_date** through UI manipulation or accessibility services
6. **Submit to issuer** with valid Play Integrity token

The issuer sees: "Genuine app, genuine device, here's a birth_date" - and has no way to know the passport verification failed.

### When Play Integrity IS Valuable

Play Integrity becomes effective when **combined with**:

| Combined With | Result |
|---------------|--------|
| Server-side passport verification | Attacker can't modify app to send fake SOD |
| Server-side face matching | Attacker can't bypass local face check |
| Secure enclave execution | Critical code runs in trusted environment |
| Certificate pinning + TLS | Attacker can't intercept/modify traffic |

### Conclusion: Play Integrity is Necessary but Not Sufficient

```
Security Level with Play Integrity alone:     ████████░░░░░░░░░░░░ 40%
Security Level with server-side verification: ████████████████░░░░ 80%
Security Level with both:                     ██████████████████░░ 90%
Security Level with both + TEE face matching: ████████████████████ 95%
```

**Play Integrity should be implemented**, but it's a **defense-in-depth layer**, not a solution to the fundamental trust problem. The issuer still needs cryptographic proof that:
1. A real passport was read (SOD verification)
2. The data wasn't tampered with (hash verification)
3. The passport is authentic (certificate chain verification)

Without server-side verification of passport cryptographic proofs, Play Integrity only raises the bar for attackers - it doesn't eliminate the attack surface.

### Recommended Approach

```
┌─────────────────────────────────────────────────────────────────┐
│                     LAYERED SECURITY MODEL                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Layer 1: Play Integrity API                                    │
│           → Blocks modified apps, rooted devices, emulators     │
│                                                                 │
│  Layer 2: Server-side passport verification                     │
│           → Cryptographic proof of authentic passport           │
│           → Cannot be forged even with genuine app              │
│                                                                 │
│  Layer 3: TEE-attested face matching (optional)                 │
│           → Face matching in secure enclave                     │
│           → Signed attestation of match result                  │
│                                                                 │
│  Layer 4: Active liveness challenges                            │
│           → Server-generated random challenges                  │
│           → Harder to spoof than passive liveness               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Bottom line**: Play Integrity is valuable and should be implemented, but alone it's like putting a better lock on a door while leaving the window open. The fundamental fix requires the issuer to verify passport cryptographic proofs server-side.

---

## 8. Privacy Implications

The security mitigations discussed above come with significant privacy tradeoffs. This section analyzes the privacy implications of each approach.

### 8.1 Current Design: Privacy-First

The current implementation prioritizes privacy:

| Data | Stays on Device | Sent to Issuer |
|------|-----------------|----------------|
| Passport chip data (DG1-DG15) | **Yes** | No |
| SOD (Security Object) | **Yes** | No |
| Face image from passport | **Yes** | No |
| Selfie/liveness frames | **Yes** | No |
| Face embeddings | **Yes** | No |
| Verification results | **Yes** | No |
| Birth date | No | **Yes** (only this) |

**Privacy benefits:**
- Biometric data never leaves the device
- Full passport data stays local
- Issuer learns only what's needed (age verification)
- No central database of passport scans

**Privacy cost:** Security vulnerabilities discussed in previous sections.

---

### 8.2 Device Biometric Authentication: Privacy Analysis

The app uses Android's `BiometricPrompt` API for device unlock and credential access authentication. This is **separate** from the passport face matching.

#### Implementation Details

```kotlin
// BiometricAuthenticationController.kt
import androidx.biometric.BiometricPrompt
import androidx.biometric.BiometricManager

const val AUTHENTICATOR_LEVEL = BIOMETRIC_STRONG  // Class 3 biometrics

// Authentication flow
val prompt = BiometricPrompt(activity, executor, callback)
prompt.authenticate(promptInfo, cryptoObject)
```

#### Is This Google-Based?

**No.** The `androidx.biometric` library is part of Android Jetpack, but it's a **wrapper around Android platform APIs**, not a Google service.

| Component | Where it runs | Google involvement |
|-----------|---------------|-------------------|
| BiometricPrompt API | Android Framework | None - platform API |
| Biometric templates | Device TEE/Secure Element | **Never sent to Google** |
| Fingerprint matching | Hardware TEE | Local only |
| Face recognition | Hardware TEE (on supported devices) | Local only |
| Biometric enrollment | Device Settings | Stored locally |

#### Privacy Properties

```
┌─────────────────────────────────────────────────────────────────┐
│           DEVICE BIOMETRIC AUTHENTICATION                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ✓ Biometric templates NEVER leave the device                   │
│  ✓ Matching happens in Trusted Execution Environment (TEE)      │
│  ✓ Not dependent on Google Play Services                        │
│  ✓ Works on non-Google devices (Samsung, Huawei, LineageOS)     │
│  ✓ Google does NOT receive biometric data                       │
│  ✓ No network connection required for authentication            │
│                                                                 │
│  Hardware security:                                             │
│  - Templates stored in Secure Element or TEE                    │
│  - Cannot be extracted even with root access                    │
│  - Protected by hardware-backed keystore                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### How It's Used in This App

1. **App unlock** - User can enable biometric authentication instead of PIN
2. **Credential access** - Biometric required before presenting credentials
3. **Key unlock** - Biometric unlocks cryptographic keys in Android Keystore

```kotlin
// KeystoreController.kt - Keys bound to biometric authentication
setUserAuthenticationParameters(
    0, // timeout
    KeyProperties.AUTH_DEVICE_CREDENTIAL or KeyProperties.AUTH_BIOMETRIC_STRONG
)
setInvalidatedByBiometricEnrollment(true)  // Re-enrollment invalidates keys
```

#### Security Binding

The app properly binds cryptographic keys to biometric authentication:

```kotlin
// Keys are only usable after biometric auth
val cipher = cryptoController.getCipher(encrypt, ivBytes)
val cryptoObject = BiometricPrompt.CryptoObject(cipher)
prompt.authenticate(promptInfo, cryptoObject)  // Cipher unlocked by biometric
```

This means:
- Private keys cannot be used without biometric authentication
- A stolen device with locked screen cannot use credentials
- Even with root access, keys require biometric unlock

#### Comparison: Device Biometrics vs. Face Matching

| Aspect | Device Biometrics | Passport Face Matching |
|--------|-------------------|------------------------|
| Purpose | Unlock app/keys | Verify passport holder |
| Technology | Android BiometricPrompt | Custom ONNX models |
| Processing | Hardware TEE | App process (software) |
| Templates | Stored in Secure Element | Not stored (one-time) |
| Google involvement | **None** | **None** |
| Can be bypassed on rooted device | Very difficult | Easier (software-based) |

#### Privacy Verdict: Device Biometrics

| Criteria | Rating | Notes |
|----------|--------|-------|
| Data leaves device | **No** | Templates in TEE only |
| Google tracking | **No** | Platform API, not service |
| Works without Play Services | **Yes** | Pure Android framework |
| Hardware protection | **Yes** | TEE/Secure Element |
| Privacy risk | **Very Low** | Industry standard |

**Conclusion:** Device biometric authentication is privacy-preserving and does not involve Google services. It's a secure, local-only mechanism that significantly improves credential security without privacy tradeoffs.

---

### 8.3 Play Integrity API: Privacy Concerns

#### What Google Receives

When Play Integrity is called, Google receives:

| Data | Description | Privacy Impact |
|------|-------------|----------------|
| **App package name** | Which app is requesting attestation | Google knows you're using the AV Wallet |
| **Timestamp** | When the request was made | Usage patterns tracked |
| **Device identifiers** | Hardware attestation keys | Device fingerprinting |
| **Google account** | Linked to Play Services | Ties usage to identity |
| **Device state** | Root status, bootloader state | Security posture revealed |

#### Privacy Concerns

**1. Google as Gatekeeper**
```
User → App → Google Play Services → Google Servers → Attestation
                                          ↓
                              Google knows:
                              - You're using age verification
                              - When and how often
                              - Your device details
                              - Linked to your Google account
```

**2. Exclusion of Privacy-Conscious Users**
- Users without Google Play Services (GrapheneOS, LineageOS, Huawei devices) cannot use the app
- Users who disable Play Services for privacy are excluded
- Creates dependency on Google infrastructure

**3. Device Fingerprinting**
- Hardware attestation creates unique device fingerprint
- Can be correlated across apps/services
- Persistent identifier even after factory reset (hardware-backed)

**4. Chilling Effect**
- Users may avoid age verification if it means Google tracking
- Particularly sensitive for privacy-conscious demographics

#### Mitigation Strategies for Play Integrity Privacy

| Strategy | Description | Tradeoff |
|----------|-------------|----------|
| **Minimize calls** | Only request attestation at credential issuance, not every app launch | Reduces tracking frequency |
| **No account requirement** | Use device-only integrity, not account-based | Weaker attestation |
| **Alternative attestation** | Support Samsung Knox, Huawei equivalent | More implementation work |
| **Transparency** | Clear disclosure to users about Google involvement | User trust |

---

### 8.4 Server-Side Passport Verification: Privacy Concerns

#### What the Issuer Would Receive

If SOD + certificates are sent for server-side verification:

| Data | What it reveals | Privacy Impact |
|------|-----------------|----------------|
| **SOD file** | Hashes of all data groups | Reveals which DGs exist |
| **DS Certificate** | Issuing country, validity period | Nationality exposed |
| **DG1 raw data** | Full MRZ data | Name, DOB, passport number, nationality, sex, expiry |
| **DG11 raw data** | Additional personal data | Full birth date, place of birth, address |
| **Certificate chain** | Full chain to CSCA | Country's PKI structure |

#### Privacy Concerns

**1. Data Minimization Violation**

The current design follows data minimization - only `birth_date` is sent. Server-side verification would require sending much more:

```
Current (Privacy-Preserving):
  App → Issuer: { birth_date: "1990-01-15" }

Server-Side Verification (Privacy-Invasive):
  App → Issuer: {
    sod: <contains hashes of ALL data groups>,
    dsCert: <reveals nationality, validity>,
    dg1: <full MRZ: name, DOB, passport#, nationality, sex>,
    dg11: <full birth date, possibly address>
  }
```

**2. Central Database Risk**

```
┌─────────────────────────────────────────────────────────────────┐
│                    ISSUER DATABASE                               │
│                                                                 │
│  If issuer stores verification data:                            │
│  - Passport numbers of all users                                │
│  - Full names and nationalities                                 │
│  - Birth dates and places                                       │
│  - When each passport was used                                  │
│                                                                 │
│  Breach impact: SEVERE                                          │
│  - Identity theft at scale                                      │
│  - Travel pattern analysis                                      │
│  - Discrimination based on nationality                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**3. Nationality Discrimination**

- DS certificate reveals issuing country
- Issuer could reject or flag certain nationalities
- Could be used for profiling or discrimination

**4. Function Creep**

- Data collected for age verification could be repurposed
- Government requests for user data
- Marketing or analytics use

**5. Cross-Border Data Transfer**

- Passport data may cross jurisdictions
- GDPR implications for EU citizens
- Data sovereignty concerns

#### Mitigation Strategies for Server-Side Verification Privacy

| Strategy | Description | Privacy Benefit | Security Cost |
|----------|-------------|-----------------|---------------|
| **Verify-and-discard** | Issuer verifies but never stores passport data | No database risk | Requires real-time verification |
| **Zero-knowledge proofs** | Prove passport is valid without revealing data | Maximum privacy | Complex implementation, computational cost |
| **Selective disclosure** | Send only SOD + DG1 hash, not full data | Reduced exposure | Still reveals nationality from cert |
| **Trusted third party** | Independent verifier, issuer only gets yes/no | Issuer doesn't see data | Requires trusted intermediary |
| **On-device secure enclave** | TEE verifies, signs attestation | Data never leaves device | Requires hardware support |
| **Homomorphic encryption** | Compute on encrypted data | Data encrypted in transit and at rest | Performance overhead |

---

### 8.5 Server-Side Face Verification: Privacy Concerns

If face matching moved server-side:

| Data Sent | Privacy Impact |
|-----------|----------------|
| Passport photo (DG2) | Biometric data leaves device |
| Selfie images | Live biometric capture sent to server |
| Face embeddings | Mathematical representation of face |

#### Severe Privacy Risks

**1. Biometric Data Exposure**
- Face images are permanent identifiers (can't change your face)
- Once leaked, compromised forever
- Can be used for surveillance, tracking, deepfakes

**2. Biometric Database**
```
If issuer stores face data:
┌─────────────────────────────────────────────────────────────────┐
│  - Face images of every user                                    │
│  - Can be used for facial recognition                           │
│  - Government surveillance requests                             │
│  - Potential for mass tracking                                  │
│  - Breach = permanent identity compromise                       │
└─────────────────────────────────────────────────────────────────┘
```

**3. Consent and GDPR**
- Biometric data is "special category" under GDPR
- Requires explicit consent
- Right to erasure complicated for biometrics
- Cross-border transfer restrictions

#### Mitigation Strategies for Face Verification Privacy

| Strategy | Description | Privacy | Security |
|----------|-------------|---------|----------|
| **Keep on device** (current) | All face processing local | **Best** | Weakest |
| **TEE attestation** | Match in secure enclave, send signed result | **Good** | Strong |
| **Encrypted computation** | Homomorphic encryption for face matching | **Good** | Strong, but slow |
| **Trusted execution on server** | SGX/TrustZone enclave on server | Medium | Strong |
| **Federated verification** | Split computation across multiple parties | Medium | Complex |
| **One-way embeddings** | Send embeddings, not images (still reveals face geometry) | Partial | Medium |

---

### 8.6 Privacy vs. Security Tradeoff Matrix

| Approach | Privacy Score | Security Score | Practical |
|----------|---------------|----------------|-----------|
| **Current design** (all on-device) | ★★★★★ | ★★☆☆☆ | Yes |
| **Play Integrity only** | ★★★☆☆ | ★★★☆☆ | Yes |
| **Server-side passport verification** | ★★☆☆☆ | ★★★★☆ | Yes |
| **Server-side face verification** | ★☆☆☆☆ | ★★★★★ | Yes |
| **TEE passport verification** | ★★★★☆ | ★★★★☆ | Limited devices |
| **Zero-knowledge proofs** | ★★★★★ | ★★★★☆ | Experimental |
| **Play Integrity + Server passport + On-device face** | ★★★☆☆ | ★★★★☆ | **Recommended** |

---

### 8.7 Recommended Privacy-Preserving Security Model

The optimal balance between privacy and security:

```
┌─────────────────────────────────────────────────────────────────┐
│              PRIVACY-PRESERVING SECURITY MODEL                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ON DEVICE (Privacy Protected):                                 │
│  ├─ Face liveness detection                                     │
│  ├─ Face matching (passport photo vs selfie)                    │
│  ├─ Face images (never sent)                                    │
│  └─ Face embeddings (never sent)                                │
│                                                                 │
│  SENT TO ISSUER (Minimal Data):                                 │
│  ├─ SOD file (hashes only, no personal data)                    │
│  ├─ DS certificate (reveals nationality - unavoidable)          │
│  ├─ DG1 hash (not raw data)                                     │
│  ├─ birth_date claim                                            │
│  ├─ Play Integrity token                                        │
│  └─ Device key proof                                            │
│                                                                 │
│  ISSUER BEHAVIOR:                                               │
│  ├─ Verify SOD signature against DS certificate                 │
│  ├─ Verify DS certificate chains to CSCA                        │
│  ├─ Verify DG1 hash matches SOD                                 │
│  ├─ Extract birth_date from verified DG1                        │
│  ├─ Verify Play Integrity token                                 │
│  ├─ DISCARD all passport data after verification                │
│  └─ Store only: credential issued (yes/no), timestamp           │
│                                                                 │
│  NEVER STORED BY ISSUER:                                        │
│  ├─ Passport numbers                                            │
│  ├─ Full names                                                  │
│  ├─ Face images                                                 │
│  └─ Raw passport data                                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Privacy Disclosure Requirements

If this model is implemented, users should be informed:

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER PRIVACY NOTICE                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  To verify your age, this app will:                             │
│                                                                 │
│  ✓ Read your passport via NFC (data stays on your phone)        │
│  ✓ Verify your face matches the passport (on your phone only)   │
│  ✓ Send cryptographic proof to the issuer (not your photo)      │
│  ✓ Send your birth date to calculate age                        │
│  ✓ Use Google Play Integrity to verify app authenticity         │
│                                                                 │
│  The issuer will learn:                                         │
│  • Your nationality (from passport certificate)                 │
│  • Your birth date                                              │
│  • That you have a valid passport                               │
│                                                                 │
│  The issuer will NOT receive or store:                          │
│  • Your name or passport number                                 │
│  • Your face image                                              │
│  • Your full passport data                                      │
│                                                                 │
│  Google will learn:                                             │
│  • That you're using this app                                   │
│  • Your device information                                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### 8.8 Alternative: Zero-Knowledge Approach (Future)

The ideal future solution would use zero-knowledge proofs:

```
User proves: "I have a valid passport issued by an EU country,
             and my birth date makes me over 18"

Issuer learns: "This person is over 18" (nothing else)
```

**Current limitations:**
- ZK proofs for passport signatures are computationally expensive
- Not yet practical for mobile devices
- Active research area (e.g., ZK-SNARKs for RSA signatures)

**Projects working on this:**
- Anon Aadhaar (ZK proofs for Indian ID)
- OpenPassport (ZK proofs for ePassports)
- Rarimo (ZK identity proofs)

When mature, ZK proofs would provide **maximum privacy with strong security**.

---

## 9. Conclusion

The current implementation prioritizes **privacy** over **security**. This is a deliberate design choice with real tradeoffs:

| Current Design | Benefit | Cost |
|----------------|---------|------|
| All verification on-device | Face images never leave device | Issuer can't verify checks occurred |
| Only birth_date sent | Minimal data disclosure | No proof data is authentic |
| No Play Integrity | No Google tracking | Modified apps undetected |

**The fundamental tension:** Strong security requires the issuer to verify something, but verification requires sending data, which impacts privacy.

### Recommended Balanced Approach

```
Privacy: ████████████░░░░░░░░ 60%  (some data sent, but minimal)
Security: ████████████████░░░░ 80%  (major vulnerabilities closed)
```

| Component | Recommendation | Privacy Impact | Security Gain |
|-----------|----------------|----------------|---------------|
| Passport verification | **Server-side SOD + cert verification** | Nationality revealed | **Critical** |
| Face verification | **Keep on-device** | None | Acceptable |
| App attestation | **Play Integrity** | Google tracking | **High** |
| Data retention | **Verify and discard** | Minimal | N/A |

### Key Takeaways

1. **Security and privacy are in tension** - Perfect privacy (current design) means weak security
2. **Play Integrity is necessary but not sufficient** - Blocks app modification but doesn't prove verification occurred
3. **Server-side passport verification is the critical fix** - Without it, the system relies entirely on trusting the app
4. **Face verification can stay on-device** - Biometrics are the most sensitive; keep them local
5. **Zero-knowledge proofs are the future** - Eventually can prove "I'm over 18" without revealing anything else

The minimum viable secure implementation requires:
- **Server-side passport cryptographic verification** (SOD + certificates)
- **Play Integrity API** (app authenticity)
- **On-device face verification** (privacy preservation)
- **Verify-and-discard policy** (no passport data retention)

---

---

## 10. iOS App Analysis

This section analyzes the iOS wallet app (`av-app-ios-wallet-ui`) and compares it with the Android implementation.

### 10.1 iOS Biometric Authentication (Face ID / Touch ID)

#### Implementation

The iOS app uses Apple's native `LocalAuthentication` framework:

```swift
// SystemBiometryController.swift
import LocalAuthentication

let context = LAContext()
context.evaluatePolicy(.deviceOwnerAuthenticationWithBiometrics,
                       localizedReason: "Unlock wallet") { success, error in
    // Handle result
}
```

#### Privacy Analysis: Is This Apple-Based?

**Yes, but Apple does NOT receive biometric data.**

| Component | Where it runs | Apple involvement |
|-----------|---------------|-------------------|
| Face ID processing | Secure Enclave | **Local only** |
| Touch ID matching | Secure Enclave | **Local only** |
| Biometric templates | Secure Enclave | **Never sent to Apple** |
| Authentication result | Local | Boolean only |

```
┌─────────────────────────────────────────────────────────────────┐
│           iOS BIOMETRIC AUTHENTICATION                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ✓ Face ID/Touch ID data NEVER leaves device                   │
│  ✓ Processing happens in Secure Enclave (hardware)             │
│  ✓ Apple does NOT receive biometric data                       │
│  ✓ No network connection required                              │
│  ✓ Cannot be extracted even with jailbreak                     │
│                                                                 │
│  Secure Enclave:                                                │
│  - Separate processor with own encrypted memory                 │
│  - Hardware-based key storage                                   │
│  - Biometric templates encrypted at rest                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Comparison: iOS vs Android Biometrics

| Aspect | iOS (Face ID/Touch ID) | Android (BiometricPrompt) |
|--------|------------------------|---------------------------|
| Framework | `LocalAuthentication` | `androidx.biometric` |
| Hardware security | Secure Enclave | TEE/StrongBox |
| Vendor involvement | **Apple: None** | **Google: None** |
| Data leaves device | **No** | **No** |
| Jailbreak/root resistant | Very high | High |
| Privacy risk | **Very Low** | **Very Low** |

**Verdict:** Both platforms implement biometric authentication locally with hardware-backed security. Neither Apple nor Google receives biometric data.

---

### 10.2 iOS Face Verification & Liveness

#### Implementation

The iOS app uses the same face matching SDK as Android:

```swift
// LivenessCheckInteractor.swift
// Uses FaceMatchSDK.xcframework (Keyless Tech)
// Same ONNX models: mediapipe_long, glintr100, silentface40, silentface27
// Same thresholds: liveness 0.972017, matching 0.5
```

**Models (embedded in framework):**
- `mediapipe_long.onnx` - Face detection
- `glintr100.onnx` - Face embedding extraction
- `silentface40.onnx` - Liveness detection #1
- `silentface27.onnx` - Liveness detection #2

#### Same Vulnerability as Android

The iOS app has the **same security gap** as Android:
- Face verification happens **client-side**
- Liveness detection is **passive only**
- Results are **not cryptographically attested**
- A jailbroken device could bypass checks

```
iOS Attack Vector (same as Android):

1. Jailbreak device
2. Hook FaceMatchSDK using Frida/Substrate
3. Force captureAndMatch() to return success
4. Proceed to credential issuance with fake data
```

---

### 10.3 iOS NFC Passport Reading

#### Implementation

```swift
// NFCDocumentReaderInteractor.swift
import NFCPassportReader  // Open-source library v2.3.0+

let passportReader = PassportReader()
let nfcModel = try await passportReader.readPassport(
    mrzKey: mrzKey,
    tags: [.COM, .DG1, .DG2, .SOD],
    skipSecureElements: true,
    skipPACE: false
)
```

#### Same Trust Gap

- Passport verification (SOD, DS, CS) happens **on-device**
- Only `birth_date` sent to issuer
- No cryptographic proof sent to issuer
- Same vulnerability as Android

---

### 10.4 iOS-Specific Security Features

#### Keychain Storage

```swift
// KeyChainController.swift
Keychain(service: serviceName, accessGroup: accessGroup)
    .accessibility(.whenUnlocked)  // Requires device unlock
    .authenticationPolicy([.biometryAny])  // Requires biometric
```

| Feature | iOS Keychain | Android Keystore |
|---------|--------------|------------------|
| Hardware backing | Secure Enclave | TEE/StrongBox |
| Biometric binding | `.biometryAny` | `setUserAuthenticationRequired` |
| Access control | `.whenUnlocked` | Similar |
| Encryption | AES-256-GCM | AES-256-GCM |

#### Certificate Pinning

```swift
// CertificatePinningConfig.swift (using TrustKit)
let pinnedDomains = [
    "issuer.ageverification.dev",
    "test.issuer.dev.ageverification.dev",
    "issuer.dev.ageverification.dev",
    "passport.issuer.dev.ageverification.dev"
]
// SHA-256 public key hashes pinned
// Enforcement: kTSKEnforcePinning: true
```

#### Release Build Hardening

```swift
// SecurityExtensions.swift
#if !DEBUG
// Disable all logging in release builds
func print(_ items: Any...) { }  // No-op
// URLCache completely disabled
URLCache.shared = URLCache(memoryCapacity: 0, diskCapacity: 0)
#endif
```

---

### 10.5 iOS vs Android: Security Comparison

| Security Aspect | iOS | Android | Notes |
|-----------------|-----|---------|-------|
| Biometric auth | Secure Enclave | TEE | Both hardware-backed |
| Face verification | Client-side | Client-side | **Same vulnerability** |
| Liveness detection | Passive | Passive | **Same vulnerability** |
| Passport verification | Client-side | Client-side | **Same vulnerability** |
| Data sent to issuer | birth_date only | birth_date only | **Same gap** |
| Certificate pinning | TrustKit | OkHttp | Both implemented |
| Key storage | Keychain | Keystore | Both hardware-backed |
| App attestation | None visible | None visible | **Gap on both** |
| Jailbreak/root detection | Not found | Not found | **Gap on both** |

---

### 10.6 iOS-Specific Privacy Considerations

#### Apple App Attest (Not Currently Used)

The iOS app does **not** appear to use Apple's App Attest API, which is analogous to Android's Play Integrity:

```swift
// App Attest would look like:
import DeviceCheck
let service = DCAppAttestService.shared
service.attestKey(keyId, clientDataHash: hash) { attestation, error in }
```

**If App Attest were added:**

| What Apple Would Learn | Privacy Impact |
|------------------------|----------------|
| App bundle ID | Which app is requesting |
| Device identifier (obfuscated) | Device tracking possible |
| Attestation timestamp | Usage patterns |
| Key attestation | Cryptographic proof |

**Difference from Play Integrity:**
- Apple's approach is more privacy-preserving
- No account linking (unlike Google)
- Obfuscated device ID (not tied to Apple ID)
- But still reveals app usage to Apple

---

### 10.7 iOS Attack Vectors

| Attack | iOS Difficulty | Android Difficulty | Notes |
|--------|---------------|-------------------|-------|
| Jailbreak + hook | Medium | Medium (root) | Same conceptual attack |
| Modified IPA sideload | Medium (requires signing) | Easy (APK) | iOS harder to sideload |
| Face spoofing | Same | Same | Same SDK |
| Data injection | Medium | Medium | Same trust model |
| MITM (with pinning) | Hard | Hard | Both have pinning |

**iOS Advantages:**
- Harder to sideload modified apps (requires enterprise cert or jailbreak)
- Tighter app sandbox
- Unified hardware (Secure Enclave on all devices)

**iOS Disadvantages:**
- Same fundamental trust gap (client-side verification)
- Same lack of server-side passport verification
- Same bypassable face verification

---

### 10.8 iOS Privacy Summary

| Component | Sends data to Apple? | Sends data to Google? | Privacy Risk |
|-----------|---------------------|----------------------|--------------|
| Face ID / Touch ID | **No** | N/A | Very Low |
| Face verification (SDK) | **No** | **No** | Very Low |
| Passport reading | **No** | N/A | Very Low |
| Keychain | **No** | N/A | Very Low |
| App Attest (if added) | **Yes** (limited) | N/A | Low-Medium |

**Conclusion:** The iOS app has **equivalent privacy properties** to Android:
- Biometric data stays on device
- Face verification stays on device
- No Apple tracking for core functionality
- Same security gaps (client-side verification)

---

### 10.9 Cross-Platform Recommendations

Both iOS and Android apps need the same security improvements:

| Recommendation | iOS Impact | Android Impact |
|----------------|------------|----------------|
| Server-side passport verification | Fixes main vulnerability | Fixes main vulnerability |
| App Attest / Play Integrity | Blocks jailbreak attacks | Blocks root attacks |
| Active liveness challenges | Reduces face spoofing | Reduces face spoofing |
| Jailbreak/root detection | Raises attack bar | Raises attack bar |

The fundamental security architecture is **identical across platforms** - both rely on client-side verification and trust the app to be honest. The recommended fixes apply equally to both.

---

## Appendix: Attack Difficulty Matrix

| Attack | Technical Skill | Resources Needed | Detection Risk | Impact |
|--------|----------------|------------------|----------------|--------|
| Modified APK | Medium | PC, Android SDK | Low | Complete bypass |
| Frida hooking | Medium | Rooted device, Frida | Low | Complete bypass |
| Photo spoofing | Low | Photo of victim | Medium | May fail liveness |
| Video replay | Low | Video of victim | Medium | May fail liveness |
| 3D mask | High | 3D printer, skills | Low | May bypass liveness |
| Deepfake injection | High | ML expertise | Low | Bypasses client liveness |
| Data injection | Medium | Reverse engineering | Low | Complete bypass |
| Passport cloning | High | Specialized hardware | Medium | Fails CA (if enforced) |
