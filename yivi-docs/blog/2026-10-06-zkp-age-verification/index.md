---
slug: zkp-age-verification-mobile
title: Implementation of Zero Knowledge Proofs for Age Verification on a Mobile Phone
authors: [ashwinkhan]
tags: [yivi, eudi, age-verification, zkp]
---

*Where the memory went, where the time goes, and why extra processor cores do not help*

Yivi is working towards being a wallet that conforms to the European Age Verification profile, and a recent revision of the profile settled how such a wallet proves someone's age. Annex A §A.8 now says that "where the User's device provides the necessary platform support, the AVI SHALL support the generation of Zero-Knowledge Proofs". The AVI is the Age Verification App Instance, which here means the Yivi app on the user's phone. The clause names exactly one system for doing so: `longfellow-libzk-v1`, which is Google's Longfellow library. That turns zero-knowledge proofs from something a wallet might offer into something a conformant one has to do, so the question is no longer whether Yivi implements zero-knowledge age proofs, but whether they are affordable on a phone an ordinary person already owns. This report is the measurement that answers that.

<!-- truncate -->

- **Project:** Longfellow prover investigation, google/longfellow-zk, proof system `longfellow-libzk-v1`
- **Measured:** 18–30 September 2026
- **Phone:** MediaTek Dimensity 8100 (CPH2423) · Android 15 · 11.7 GB; 4 × Cortex-A55 @ 2.0 GHz (cores 0–3, power-saving) · 4 × Cortex-A78 @ 2.85 GHz (cores 4–7, performance)
- **PC:** Intel Core i7-13700HX · 16 cores / 24 threads · 15.7 GB

When someone proves they are over 18 without revealing their date of birth, the phone has to do a large piece of mathematics first. The software that does it is Longfellow (google/longfellow-zk), a library written by Google. As above, the AV profile names this exact proof system, and adds that "Support for any other Zero-Knowledge Proof system does not constitute conformance with this profile". The technical specification's [Annex B on zero-knowledge proofs](https://ageverification.dev/av-doc-technical-specification/docs/annexes/annex-B/annex-B-zkp/) selects the scheme behind it, ECDSA Anonymous Credentials (the "Longfellow" scheme). The scheme is peer reviewed and published (Matteo Frigo and abhi shelat, "Anonymous Credentials from ECDSA", IACR Communications in Cryptology, May 2026); its formal standardisation is still in progress. That is why this report is about one library rather than about zero-knowledge proofs in general. Doing that mathematics is called proving, and it happens entirely on the user's own phone.

The profile fixes the way the proof travels as well. A website asks for it through the W3C Digital Credentials API as specified in ISO/IEC 18013-7 Annex C, using the `org-iso-mdoc` protocol, with OpenID for Verifiable Presentations as a fallback. Building that transport is the other half of the work. This report is about the first half: what the proof itself costs on the phone.

Proving is expensive. It takes seconds rather than milliseconds, and it uses a large amount of the phone's memory while it runs. This report is the record of finding out exactly how expensive, fixing the one genuine waste we found, testing several other ideas that turned out not to work, and establishing why one obvious-sounding fix ("use more of the phone's processor cores") does not help.

It also records the change that mattered more than all of those combined, and which was not about proving at all: the app used to freeze for 24 seconds on every launch before anyone had proved anything. That is §6, and a reader with time for one section should read that one.

- **Memory used:** −34% on the test circuit, 211 MB down to 140 MB (165 MB with the shipping circuit)
- **Time to make a proof:** 1.1 s in the wallet; budget allowed 8 s
- **From 1 core to 24:** no gain, identical speed
- **App launch freeze:** −21 s, 24 s down to 2.9 s

## The handful of terms used throughout

| Term | Meaning |
|---|---|
| **Proving** | The phone doing the mathematics that produces the proof. The slow, expensive half. |
| **Verifying** | The other side checking that the proof is genuine. Roughly half the cost of proving. |
| **Circuit** | A large data file describing the calculation to be proved. Ours are 88–115 MB once unpacked, and ship inside the app. |
| **Memory used** | How much of the phone's RAM the work occupies at its worst moment. If this goes too high, Android kills the app. |
| **Sumcheck** | The mathematical engine at the heart of the proof. 38.9% of the time for one proof and check (§5), and part of Google's library rather than ours. |
| **Ligero** | The part that packages the finished proof for sending. Cheap in time, but responsible for most of the proof's size. |
| **Profiling** | Sampling the program hundreds of times a second to find out which routines the time is actually being spent in. |

## 1 Getting the measurements right came first

Three of the numbers this work started from were simply wrong, and each one pointed the effort in a useless direction. Correcting how we measured had to come before deciding what to optimise.

### 1.1 The alarming 445 MB was mostly not our software

The first measurement on a real phone reported 445 MB of memory used and declared it about five times what the design had assumed. But that figure was the memory used by an entire demonstration app, of which the proving library was only one part.

Measured again on the same phone with everything else stripped away (no app framework, no user interface, just the library and a small probe watching its memory), the library uses 211 MB. The other 235 MB was the app's own machinery: the Android runtime, the user-interface toolkit, and graphics.

> **A trap worth naming**
>
> Results from a desktop test machine and results from a real phone are not interchangeable. One of the experiments below (§4.2) appeared to save 7.4 MB on the desktop and saved nothing at all on the phone. The two systems hand unused memory back to the operating system on different schedules, which invented a saving that was never there. Any memory improvement found on a desktop must be re-checked on a phone before it is believed.

### 1.2 A single timing tells you nothing

Phones deliberately speed up and slow down their processors depending on temperature and workload. One measurement run came back about 40% faster than its neighbours and could not be reproduced in five further attempts. On another occasion a phone drifted 57% on identical software between sessions, purely because it had warmed up.

So every comparison in this report is interleaved: the versions being compared are built from one source and run alternately within a single sitting, and only compared against each other. Numbers from different sittings are not comparable, and each table below says which sitting it came from.

### 1.3 The first profile had a blind spot

Our first attempt to find where the time went left nearly a quarter of it unaccounted for, and accidentally included our own measuring thread in the results. Re-run with both faults fixed, the figures add up to 100% and exclude the measuring apparatus. Those are the figures used in §5.

## 2 The real defect: the library reserved far more memory than it needed

Before the library can use a circuit, it has to unpack it from its compressed form. To do that it sets aside a block of memory to unpack into. In three places, it sets aside a block sized by a fixed safety limit rather than by the actual file:

```cpp
std::vector<uint8_t> bytes(kCircuitSizeMax); // 130,000,000 bytes
```

Two things are wrong with this. The block is 130 MB regardless of need, while the circuits we actually ship unpack to 88–115 MB (§2.4), so between 15 and 42 MB is reserved for nothing. Worse, this particular way of reserving memory writes a zero into every single byte. Merely reserving space would cost little; writing to all of it forces the operating system to genuinely hand over all 130 MB of physical memory. We pay for the safety limit in full, every time.

Separately, the verifying side of the library never released its block after it had finished unpacking: it held all 130 MB for the entire check, where the proving side already let its block go.

### 2.1 Two fixes, about fifteen lines of code

- **Fix A:** ask the compressed file how big it will be when unpacked (it records this) and reserve exactly that, instead of the fixed limit.
- **Fix B:** release the verifying side's block as soon as unpacking is done, matching what the proving side already did.

| Memory used | Before | With Fix A | With A and B |
|---|---|---|---|
| Circuit for 1 attribute | 211.8 MB | 171.2 MB | 147.7 MB |
| Circuit for 2 attributes | 213.5 MB | 177.9 MB | 154.4 MB |

*Desktop test machine. Google's own test suite on the fixed library: all 23 tests pass in 190 seconds, including the tests that check the library correctly rejects bad input. Speed and proof size unchanged.*

### 2.2 Confirmed on the actual phone, where it works slightly better

| Memory used, 1-attribute circuit | Desktop | Phone |
|---|---|---|
| Before | 211.8 MB | 210.9 MB |
| After both fixes | 147.7 MB | 139.9 MB |
| **Saved** | **−64 MB (−30%)** | **−71 MB (−34%)** |

Nothing in the fixes was specific to either kind of machine. Two useful side-findings: the desktop and phone "before" figures agree to within 1 MB, so the library's appetite does not depend on the type of processor; and because both figures now come from the same phone running the same circuit, the claim that the original 445 MB was mostly the demonstration app is now directly demonstrated rather than argued.

The fixes also made the library faster, which is not a coincidence; §5.3 explains why. In the same sitting: proving 1700 → 1529 ms, verifying 891 → 824 ms.

### 2.3 Why simply raising the limit would be the wrong answer

The obvious alternative is to raise or lower that 130 MB limit. It was originally 150 MB and was tightened to 130 MB at some point. There is no recorded reason for either value: every change published to the library arrives as a single bulk import with no explanatory note, so there is no rationale to look up.

> **The underlying problem is that one number does two jobs**
>
> That limit is simultaneously how much memory to reserve and the largest circuit we are willing to accept. While it is a single number, reducing memory means refusing legitimate circuits, and accepting bigger circuits means wasting more memory. Fix A separates the two: the acceptance limit can stay where it is and now costs nothing in memory unless a file genuinely claims to be that big.

Raising the limit is also not risk-free, for a subtle reason. The size being trusted comes from the file itself, before anything has confirmed the file is genuine, because the library has to unpack and read a circuit in order to compute the identity check that would tell it whether the circuit is the one expected. That is acceptable for circuits bundled inside our own app. It would be considerably less comfortable if circuits were ever downloaded.

The right answer replaces the limit rather than adjusting it. We know exactly which circuits we ship, and each one has exactly one correct unpacked size. So we can check the size the file claims against the size we expect for that specific circuit, and reserve that. This belongs in our own wrapper around the library, not in the change we propose back to Google, which should stay the narrow "stop paying the limit in memory" fix.

### 2.4 How much headroom is left

| Unpacked circuit size | 1 attribute | 2 | 3 | 4 |
|---|---|---|---|---|
| Version 6 | 87.7 MB | 92.7 | 97.6 | 102.5 |
| Version 7 | 98.9 MB | 104.1 | 109.4 | 114.6 |

The sizes are the unpacked sizes the compressed files declare, in the same decimal megabytes as every other figure in this report; the one-attribute version 6 circuit here, 87.7 MB, is the circuit the memory work of §2 and the experiment of §4.2 ran against. Roughly +5 MB per extra attribute and +11–12 MB per new circuit version. A future version 8 handling four attributes would land near 126 MB against a 130 MB limit, which is close enough to matter. This table also retires an old worry: proving two, three or four attributes at once was flagged as untested and probably much worse. In memory terms a second attribute costs about 7 MB and 15 milliseconds, which is negligible.

## 3 The proving work uses one processor core

Modern phones have eight processor cores. If proving could be split across them it would finish far sooner. The desktop figure of about 800 milliseconds looked as though it might already be quietly relying on lots of cores, which would mean a phone would do much worse. We tested it by restricting the program to a fixed number of cores:

| Cores available | Proving | Verifying | Memory used |
|---|---|---|---|
| 24 | 790 ms | 476 ms | 117 MB |
| 4 | 750 ms | 503 ms | 111 MB |
| 1 | 830 ms | 473 ms | 104 MB |

*Version 6 circuit, one attribute, on the desktop machine (x86-64, Linux under WSL), with the program pinned to 24, 4 and 1 cores. It was measured through a Java test harness against the unmodified library, before any of the fixes in §2. The memory column is the peak resident memory of the Java process the timing tool wrapped, which is the one that drives the test rather than the one the proving happens in: the harness runs the test in a worker process it starts itself. So the prover's own allocations are outside these figures, and the evidence for that is §2.1, where the identical circuit measured natively peaks at 211.8 MB, about 95 MB above anything in this column. Only §2's figures describe what the library itself uses.*

Normal variation between runs is about 5%, so all three rows are the same result. Giving the program twenty-four times as many cores changes nothing measurable. The conclusion rests on the timings alone; the memory column is reproduced because it was part of what the run recorded, but it describes the harness rather than the library and carries no weight here.

There was an upside to this finding. Because proving uses one core, predicting the phone figure became simple arithmetic: take the desktop time and scale it by how much slower a single phone core is. That predicted 2.5 to 3.5 seconds, and the shipping wallet came in at about 1.1 seconds (§8.3). The prediction was two to three times too pessimistic, which is the useful direction to be wrong in.

> **A related dead end: choosing which cores**
>
> Phone processors mix fast cores with slow power-saving ones. On this phone the four power-saving cores are numbered 0–3 and the four fast ones 4–7. Forcing the work onto the power-saving four makes it three times slower (6.2 s against 2.0 s in the same sitting). Forcing it onto the fast four changes nothing, because Android already puts it there. There is nothing to gain here and a great deal to lose.

### 3.1 Why it cannot be split up: the shape of the mathematics

Most of the proving time goes into the sumcheck. The 38.9% in §5 is its share of one proof *plus* one check; every routine in that bucket is prover-side and none of it is the checker's work, so measured against the 2132 milliseconds of proving in that same run, the sumcheck is about 60% of proving on its own (§5.1). And the sumcheck is a chain of steps where each step needs the answer from the one before it. That happens at two levels:

- The circuit is proved layer by layer. Proving a statement about one layer turns into a statement about the next layer down, and so on. The next layer's problem does not exist until the current one has finished producing it, so two layers can never be worked on at the same time.
- Within a layer, each round depends on the last. Each round produces a value, and that value is fed through a scrambling function to produce the starting point for the next round. This is deliberate: it is what stops the prover from cheating by choosing convenient values in advance. But it also means the rounds form an unbreakable chain and cannot be reordered or overlapped.

What is left that could be shared between cores is the number-crunching inside a single step. The hardware measurements show what that work is doing:

| Hardware measurements, one proof | Sumcheck | Circuit unpacking |
|---|---|---|
| Instructions executed | 1.50 billion | 1.68 billion |
| Processor cycles consumed | 1004 million | 508 million |
| Work done per cycle | 1.49 | 3.31 |
| Rate of waiting on memory | 1.40% | 0.23% |

The sumcheck consumes twice the processor cycles to execute fewer instructions. The counters do not say exactly why: a rate of 1.49 instructions per cycle is consistent both with waiting on data arriving from memory and with the dependent chain described above, where each operation must wait for the result of the one before it. Either reading leads to the same conclusion. The sumcheck is limited by how fast a single core can feed itself, not by how much raw arithmetic is available. The counters do not show whether the sumcheck would speed up across several cores, and that was not tested. The one-versus-twenty-four-core result stands on its own: the library uses one core, and giving it more changed nothing.

> **Conclusion**
>
> Using more cores is not a setting somebody forgot to switch on. The library runs the proof on one core, the layers and rounds of the sumcheck form a chain that cannot be split, and whether the arithmetic inside a single step could be spread across cores was not tested. The sumcheck's 60% of proving is Google's cryptography, and it is not something we can negotiate with.

## 4 Four improvements we tried and rejected

Each of these was actually built and measured rather than argued about. They are recorded here so nobody spends the effort again.

### 4.1 Compiler settings: NO GAIN AVAILABLE

Programs can be compiled to favour speed or to favour small size. We built the library three ways and ran them alternately on the phone:

| Setting | Memory used | Proving | Program size |
|---|---|---|---|
| Favour speed (what we already use) | 139.9 MB | 2402 ms | 4.87 MB |
| Balanced | 139.8 MB | 2529 ms (+5%) | 4.83 MB |
| Favour small size | 139.9 MB | 3275 ms (+36%) | 4.78 MB |

Memory does not move at all: 139.7 to 139.9 MB across every build and every run. The entire program is under 5 MB and the difference between the extremes is 88 kilobytes, six hundredths of one percent of a 140 MB total. The memory is not the program; it is data the program sets aside while running, so how the program is compiled cannot touch it. Meanwhile "favour small size" costs almost a full second per proof in exchange for nothing. The setting already in use was the right one; there was never a dial to turn.

### 4.2 Unpacking the circuit in small pieces: BUILT, MEASURED, REVERTED

Instead of unpacking the whole 87.7 MB circuit into memory at once, unpack it in 64-kilobyte pieces through a small window. This was written in full, checked against Google's test suite, run on the phone, and then removed on the strength of these results:

| Two runs of each, alternated | Existing | With piecewise unpacking |
|---|---|---|
| Memory during unpacking | 119.5 / 119.2 MB | 40.0 / 40.1 MB (−67%) |
| Worst moment overall | 140.0 / 139.7 MB | 139.8 / 139.9 MB (no change) |
| Proving | 1875 / 1856 ms | 1930 / 1922 ms (+3%) |
| Verifying | 1052 / 1053 ms | 1121 / 1129 ms (+7%) |

The idea worked exactly as designed, and that is why it failed. Unpacking is not the moment of highest memory use; proving is. Cutting unpacking by two thirds lowers a peak that nobody was worried about and leaves the figure everyone actually quotes untouched, while costing around 60 milliseconds of proving and just over 70 of verifying in exchange.

The desktop run had shown a 7.4 MB saving, which turned out to be a quirk of how the desktop system recycles memory and did not exist on the phone.

Two things are worth keeping from having built it. The change turned out to fit the existing code cleanly, so if this is ever needed for a different reason the route is known. And the difficult part was not the feature but the failure handling: an early version crashed the program when fed a deliberately corrupted circuit, which Google's own test suite caught. A corrupt circuit has to come back as a polite error, never a crash.

### 4.3 Memory-manager tuning: NO GAIN AVAILABLE

A sizeable share of the time is spent by the operating system handing memory to the program (§5.3), so a setting that tells Android to stop reclaiming memory looked promising. Tested against the default twice, alternating, it changed the count by ten out of a quarter of a million, and made no measurable difference to time. The cost is the program asking for genuinely new memory, not memory being handed back and forth. There is no cheap setting-level win here.

### 4.4 Reusing an unpacked circuit: DROPPED BEFORE BUILDING

The library could unpack a circuit once and keep it ready for reuse. We dropped this for two reasons. An earlier estimate that unpacking was 45% of the work does not hold on a phone, where it is about 14%. And keeping a circuit ready costs around 42 MB permanently while only helping the second and subsequent proofs in one session, and a wallet makes one proof per presentation. Removed from the list of changes to propose to Google.

## 5 Where the time actually goes

Measured by sampling the program a thousand times a second on the phone, from a cold start, watching only the working thread, with nothing left unaccounted for.

| Activity | Time | Share |
|---|---|---|
| Sumcheck | 1295 ms | 38.9% |
| Operating system | 919 ms | 27.6% |
| Unpacking circuit | 478 ms | 14.3% |
| Basic arithmetic | 320 ms | 9.6% |
| Packaging proof | 170 ms | 5.1% |
| Clearing memory | 55 ms | 1.7% |
| Everything else | 95 ms | 2.8% |
| **Total** | **3332 ms** | **100.0%** |

*Time for one proof plus one verification, by activity. Cold phone. The profiler took 3332 samples at one per millisecond with nothing excluded and nothing below a cutoff discarded, so the time column is a count of samples and adds up exactly. The share column is that column as a percentage, rounded to one decimal, with "everything else" carrying the rounding. "Operating system" is Android handing memory to the program; "packaging proof" is Ligero.*

### 5.1 It is the sumcheck, and that was not obvious

The library's own progress messages suggest the time goes into working through the circuit. It does not. The routine that dominates is the sumcheck engine, and the library's labels do not distinguish the two, so this only became visible by measuring rather than reading. It is 38.9% of one proof and check, and since every routine in that bucket is prover-side, about 60% of proving on its own (§3.1). Either way it is work we cannot change from outside.

### 5.2 The part with the bad reputation is cheap, in time

Ligero, the component that packages the finished proof, was widely assumed to be the expensive part. It is 5.1% of the time. Where it is expensive is the size of what it produces: it accounts for about 88% of the finished proof's bytes. Two different kinds of cost had been rolled into one reputation. It matters if a proof has to travel across a network; it does not matter at all for how long the user waits.

### 5.3 Over a quarter of the time is spent obtaining memory

Counted directly: 245,220 requests to the operating system for memory during a single proof and check, which is roughly a gigabyte of memory touched for the first time in order to reach a 140 MB peak. This is the link between the two halves of this report: memory cost shows up as time. It is why the memory fixes in §2 also made the library 3–10% faster, and it is why the tuning attempt in §4.3 was never going to help. Genuinely reducing it would mean the library reusing its working memory instead of repeatedly asking for more.

### 5.4 Most of the unpacking cost is one routine

The 14% spent unpacking the circuit is not spread across that job. A single routine, removing duplicate entries from a table, accounts for 306 milliseconds of it, which is 16% of every instruction in the entire run. The hardware measurements in §3.1 show it running at close to the processor's maximum rate with almost no waiting, and spending 98% of its time inside itself rather than calling other code.

That combination says something specific: it is not a memory or layout problem, so rearranging data would not help. It is simply performing too many operations, which means only a different method would change it.

It is recorded here as an observation rather than a recommendation, because the arithmetic does not justify the work. Both proving and verifying unpack a circuit, so the 306 milliseconds is split roughly between them, meaning a perfect fix would take around 150 milliseconds off proving, about 7% of the proving time in the sitting where it was profiled. Buying that requires replacing an algorithm inside Google's library and persuading them to accept the change. The figure is worth knowing; it is not worth chasing.

## 6 Shipping the circuit map

Everything so far has been about the seconds a proof takes. One improvement removed more time than all the others put together, and it was not about proving at all. Without it the feature was unshippable, not merely slow.

### 6.1 The first working build froze the app for 24 seconds

The first build with proving wired in locked the Yivi app on launch. Not a pause: a freeze, with Android reporting a single frozen frame of 23,963 milliseconds, 2,872 dropped frames, and its watchdog twice filing the app as Not Responding. A user meeting that would conclude the app was broken and uninstall it.

The cause is a step that has nothing to do with proving. Before the library will use a circuit, it has to confirm which circuit the file is, and the only trustworthy way to do that is to unpack the file and compute a fingerprint over its real contents. On the PC, loading the eight circuits takes 12 to 14 seconds per process (§8.3), which is 1.5 to 1.75 seconds per circuit. Nobody timed a single identification on the phone, but the two endpoints pin the total: of the 23,963 ms frozen frame, 2,878 ms remained after the fix (§6.2), so identifying the eight circuits cost the phone about 21 seconds, around 2.6 seconds per circuit, roughly one and a half to one and three quarter times the PC's per-circuit cost. Why the phone is that much slower here, when it proves only about 20% slower than the PC (§8.2), was not measured. So every launch spent about twenty-one seconds proving to itself something that could not have changed since the app was built, and it did so on the thread that draws the screen.

### 6.2 The fix: the MapCache, worked out at build time

The mapping from file to circuit identity is fixed the moment the app is built. So it is computed then, once, and compiled into the app as data: the MapCache. At launch the wallet computes a cryptographic hash over each circuit file exactly as it ships, in its compressed form and with no unpacking, and looks the answer up in the MapCache instead of working the identity out again.

| At app launch | Before | After |
|---|---|---|
| Identifying 8 circuits | about 21 of the 24 s | effectively 0 |
| Longest frozen frame | 23,963 ms | 2,878 ms |
| Dropped frames | 2,872 | 343 |
| "App Not Responding" reports | 2 | 0 |

About 21 seconds of the launch freeze removed, more than every other optimisation in this report put together. The 2.9 seconds that remain are the app's own startup and the first screen being drawn, not this library.

> **Why this change counted for more than the others**
>
> The memory work in §2 took the library from uncomfortable to comfortable. This one took the feature from impossible to ship to invisible. A 34% memory saving is worth having; an app that freezes for 24 seconds on every launch does not reach users at all.

### 6.3 Two properties worth stating

**It does not weaken the check on which circuit is used.** A shortcut here would be serious: the circuit's identity is exactly what the relying party's own checks are compared against, so a wallet that could be made to load a circuit under the wrong name would be a real problem. Three things keep this safe. The map is generated at build time by doing the full, slow identification honestly, and the generator refuses outright if any file disagrees with the name it claims. It is compiled into the app, so it is signed and distributed exactly as the code is, rather than sitting in a file something else could rewrite. And if an entry is ever stale or wrong, the library falls back to identifying the circuit the slow way and corrects the entry, so a bad map costs startup time and nothing else.

**It is easy to lose by accident.** Adding circuits, or loading them by a path that does not consult the map, brings the whole 24-second freeze straight back. It is not a setting; it is a build step, and it has to stay part of the build.

## 7 Where this leaves the library

| Version 6 circuit, 1 attribute, test harness | Before fixes | After fixes |
|---|---|---|
| Proving | 2074 ms | 2004 ms |
| Verifying | 1050 ms | 997 ms |
| Memory used | 211.0 MB | 139.0 MB |

*This is a before-and-after comparison, not a statement of what proving costs. Both columns come from one interleaved sitting of the on-device test harness, with all 20 of its tests passing, including a complete presentation exchange. Read the differences only. The same harness on the same phone and circuit measured proving at 1529 ms in another sitting, 24% below the 2004 ms here, which is why no absolute from this table is quoted anywhere else in this report. What proving actually costs in the shipping wallet is §8.3.*

> **Against the target**
>
> Before any of this work began, we set a threshold for when the idea would have to be abandoned: if proving took around 8 seconds, or ran out of memory, on a phone from 2022, then the fallback of handing over the date of birth in the ordinary way would become the common case rather than the exception.
>
> The shipping wallet proves in about 1.1 seconds (§8.3). The 139 MB memory peak above was measured with the version 6 circuit the test harness uses; the shipping wallet uses a version 7 circuit, and the same probe on the same phone measures 165.0 MB with that one (median of ten runs, spread 165.0–165.1 MB). That is 25 MB above version 6 rather than the 11 MB the unpacked sizes in §2.4 would lead you to expect, so estimating this figure from the circuit sizes understates it; 165 MB is the measured number and the one to use. Both are the library's own peak, not the whole app's. It passes with room to spare on both counts.
>
> One estimate made at that time turned out to be wrong, and is worth correcting: the "88 MB in use during proving" we assumed is the temporary unpacked circuit rather than the actual peak, which is 140 MB with the version 6 circuit (211 MB before the fixes) and 165 MB with the shipping version 7 circuit, on top of the host app.

### 7.1 What would move the remaining 140 MB

The floor is the proving engine's own working data, roughly 90 MB of tables it keeps while it runs, on top of about 50 MB of circuit held in memory. Of that circuit, only around 40 MB is the circuit proper; the 88 MB unpacked form is temporary. Reducing this is a change to the algorithm, and the algorithm is Google's.

### 7.2 Still open

- iPhone is unmeasured and requires a Mac to test.

## 8 What the Yivi wallet itself reports, on a real phone

Everything above measures the library in isolation, through a purpose-built test harness. This section is different: it is the shipping Yivi wallet, on a real phone, performing a real age presentation to a relying party, the same code path a member of the public would use.

The wallet now measures and displays this itself. It records the moment the user taps to consent, and the moment the finished, sealed response is handed back to the system. The elapsed time is shown to the user on the screen that confirms the disclosure, and is also written to the device log.

> **What the number does and does not include**
>
> Included: choosing which credential to use, unpacking and reading the circuit, generating the zero-knowledge proof, signing, and sealing the response for transmission. Excluded: the time the user spent reading the consent screen, which is not work the wallet does; and the relying party's verifying of the proof, which happens on the other side after the wallet's work is finished.

> **These are the figures this report stands on**
>
> The shipping wallet, on a real presentation, is the only thing that measures what a user actually waits for. Earlier sections quote the test harness, and those numbers are used there purely as before-and-after comparisons within a single sitting; the harness measured proving at 1529 ms and 2004 ms for the same circuit on the same phone in two different sittings, so its absolutes carry no weight. Where this report says how long proving takes, it means these.

### 8.1 The two machines

Proving and verifying happen on different hardware in any real deployment, and this report measures them accordingly. The phone is the user's; the verifying PC stands in for a relying party's server.

| Property | Proving (the phone) | Verifying (the PC) |
|---|---|---|
| Processor | MediaTek Dimensity 8100 | Intel Core i7-13700HX |
| Architecture | arm64, 8 cores | x86-64, 16 cores / 24 threads |
| Memory | 11.7 GB | 15.7 GB |
| System | Android 15 (CPH2423) | Windows 11; Linux container for the proof verification |

*Only one of those cores is ever used for proving, per §3, and the 24-thread figure is the same machine as the "24 cores" row in §3's scaling table, which was measured here.*

### 8.2 What the relying party spends

Verifying splits into two very different costs, and it is worth seeing them apart:

| On the verifying PC | Time | What it is |
|---|---|---|
| Verifying the proof | 497 ms | the cryptography |
| Everything around it | 1.1 ms | decoding the response, establishing the issuer, matching it to the request |
| of which: decoding the 360 KB response | 0.4 ms | leaving 0.7 ms for the trust checks |
| Ratio | 0.2% | everything else, as a share of the proof check |

*Proof verification: median of 8 samples, range 469–540 ms. For scale, the same PC produces a proof in 890 ms (8 samples, 842–946), so verifying costs a little over half of what proving costs. That the PC proves only ~20% faster than the phone (890 ms against ~1096 ms in §8.3), despite a far higher clock, fits the single-core picture of §3.1: proving is limited by how fast one core can feed itself, so a faster processor gains much less than its clock suggests.*

The last row is the useful finding: everything the relying party does apart from the cryptography costs about a millisecond, two tenths of one percent of the proof check. A verifier therefore has no performance reason to cut corners on the issuer checks, which matters because those checks are what stop a proof made under a self-issued credential from being accepted. Anyone worrying about the cost of verification should look only at the proof.

### 8.3 One to four attributes, end to end

A relying party may ask for one age threshold or several. This is what that costs, measured on live disclosures asking for one, two, three and four attributes: proved on the phone, verified on the PC, once each.

| Attributes | Circuit | Proof size | Proving (phone) | Verifying (PC) | Total |
|---|---|---|---|---|---|
| 1 | v1_7_1_4151_4096 | 360,820 B | 1096 ms | 504 ms | 1600 ms |
| 2 | v1_7_2_4265_4096 | 360,556 B | 1077 ms | 509 ms | 1586 ms |
| 3 | v1_7_3_4307_4096 | 362,356 B | 1146 ms | 587 ms | 1733 ms |
| 4 | v1_7_4_4415_4096 | 364,612 B | 1204 ms | 546 ms | 1750 ms |
| **1 → 4** | | **+1.1%** | **+108 ms** | **+42 ms** | **+150 ms** |

Asking for four age thresholds instead of one cost about 9% more time and 1% more data in these runs. Read the time as a bound on a small effect rather than a price list. Each row is a single live disclosure. Run-to-run variation is about 5% on the desktop (§3), and the eight repeat verifications in §8.2 spread over 469–540 ms, so the table cannot separate one attribute from two: the two-attribute row came in 19 ms *faster* than the one-attribute row, which is noise rather than a saving, and verifying is noisier still, with three attributes checking slower than four. The 108 ms proving gap between one and four is about 10%, the same size as the 104 ms spread of the eight repeat proofs on the PC in §8.2 (842–946 ms), and the phone rows here are single runs, so the table does not show that it is more than noise. The 42 ms verifying gap is inside the §8.2 spread. The proof sizes, which are exact byte counts, are the firm half of the table.

That makes the practical answer stronger rather than weaker: there is no reason for a relying party to ration its questions. A request for four thresholds is very nearly as cheap as a request for one, because the cost is set by the circuit's fixed structure rather than by how much is being proved.

It also puts the two halves in proportion on real work. Proving is roughly twice verifying. Part of that gap is the phone being the slower machine: on the PC alone, proving takes 890 ms against 497 ms to verify (§8.2), a ratio of about 1.8.

*The attribute count and circuit in each row are read out of the response itself rather than taken from what was asked for. Proving figures are from the wallet's own measurement on the phone; verifying figures are one verification each of the corresponding real proof, on the PC described in §8.1. Loading the circuits (12–14 s per process on the PC, and the launch cost §6 removes on the phone) is startup rather than verification and is excluded throughout.*

### 8.4 How these measurements were produced

Everything in §8 comes from the same arrangement, and it is worth stating exactly, because one half of it is real and the other half is simulated.

| Part | What it is |
|---|---|
| The wallet | The Yivi Android app (irmamobile), built from source and installed on the test phone. It holds the credential, shows the consent screen, and reports the proving time from its own clock. |
| The wallet's engine | irmago, the Go library inside the app. It parses the request, authenticates the reader, selects the credential, drives the proof, signs, and seals the response. The proving itself is Google's library, reached through a thin Go wrapper. |
| The credential | A real age-verification attestation (eu.europa.ec.av.1) issued by the EUDI issuer running on Yivi's staging cluster, signed by that issuer's own document signer under Yivi's staging attestation-provider authority. Not a test fixture minted for the occasion. |
| The relying party | Simulated by a local script. It builds and signs a real ISO 18013-5 request with a reader certificate, hands it to the app, waits for the answer, and decrypts it with the one-use key it generated for that request. |
| The verification | Run separately on the PC against the decrypted response, using the same proof library the wallet used to produce it. |

So the wallet side is the shipping article end to end: real app, real credential from a real issuer, real cryptography. What is simulated is the website. In deployment a browser would ask the phone for a credential through the operating system and pass the answer to a relying party's server; here a script delivers the request directly and opens the answer itself. The bytes exchanged are the same, and the request is signed and the response sealed exactly as they would be, but no browser and no real website took part.

That matters for one figure and not the others. Proving and verifying are unaffected; they are the same code on the same inputs either way. What the arrangement cannot measure is the handover itself: how long the browser and the operating system take to pass the request in and the response back out.

> **One deliberate condition: the screen stays on**
>
> An Android phone has two kinds of processor core: four slow power-saving ones and four fast ones (§3). Android decides which to use, and one of the things it decides on is whether the app is the one the user is looking at. An app in the background, or a phone with its screen off, can be moved onto the power-saving cores, where the same proof takes three times as long.
>
> So the phone is held awake and the wallet kept in the foreground for every run. That is not tilting the measurement in our favour: it is the condition a real disclosure happens under, because the user is looking at a consent screen and tapping it. Measuring with the screen off would produce a number no user would ever experience.

### 8.5 Why the two halves do not overlap

Proving and verifying never happen at the same time. The proof has to exist and reach the other side before verifying can begin, so the total time a relying party waits is proving, plus transmission, plus verifying, in that order. In the flow Yivi uses, the wallet hands the response to the browser on the same phone through the operating system, but the browser still has to send the 360 KB response to the relying party's server, and that upload was not measured (§8.4). Leaving transmission out, proving accounts for roughly two thirds of the total, which is why it received all of the optimisation effort described in this report.

## 9 What this changes for the Yivi wallet

These measurements were taken to settle design questions, not for their own sake. This is what they settle.

**Zero-knowledge proofs become the normal path rather than the exception.** The threshold set before the work started was around 8 seconds on a phone from 2022, beyond which handing over the date of birth in the ordinary way would become the common case. The shipping wallet proves in about 1.1 seconds (§8.3), and the library peaks at 165 MB (§7). The profile still requires the plain mdoc fallback for devices that cannot generate a proof at all (Annex A §A.6, and §A.9 forbids a relying party from refusing a presentation merely because it used that fallback), so Yivi implements both paths. On the hardware measured here, the fallback stays a fallback.

**Parallelism is not a direction to spend effort on.** The library proves on one core, and giving it twenty-four changed nothing (§3); whether the arithmetic inside a single step could be spread across cores was not tested (§3.1). Picking cores by hand is worse than letting Android pick (§3). That closes off an obvious-looking direction, and it is why the effort went into memory instead, where there was something to win.

**The wallet proves in the foreground, while the user is on the consent screen.** The same proof takes three times as long on the power-saving cores, and that is where Android moves work the user is not looking at (§8.4). Proving at the moment of consent, with the screen on, is both the quicker arrangement and the one a real disclosure happens under.

**Both memory fixes ship, and the strict one stays ours.** The Yivi build carries the two fixes from §2. The narrow one, reserving what the file needs instead of a fixed 130 MB limit, is what we propose back to Google. The stricter check, comparing the size a circuit claims against the known size of the specific circuit we ship, belongs in our own wrapper, because only the wallet knows which circuits those are (§2.3).

**The circuit map is a build step, and it has to stay part of the build.** Without it the app freezes for 24 seconds on every launch (§6). Adding a circuit, or loading one by a path that does not consult the map, brings that back in full. It is not a setting somebody can turn on afterwards.

**Relying parties have no reason to ration what they ask for.** Four age thresholds cost very nearly what one costs (§8.3), and everything a verifier does apart from checking the proof costs about a millisecond (§8.2). There is no performance argument for cutting corners on the issuer and trust checks, which are what stop a proof made under a self-issued credential from being accepted.

**What remains expensive is size, not time.** A proof is around 360 KB, of which the packaging step accounts for about 88% (§5.2). That is a concern for the upload from the browser to the relying party's server, a leg this report did not measure (§8.4), and not something the user waits for.

Two things are still open: iPhone is unmeasured and needs a Mac to test (§7.2), and the handover between browser, operating system and wallet was simulated rather than measured (§8.4).

### 9.1 What to expect next

Everything measured here is wired into the Yivi Android app, together with the transport around it: the `org-iso-mdoc` protocol over the W3C Digital Credentials API, which is how a website asks for an age proof and how the answer travels back. Both have been exercised end to end on a real phone, with a real age-verification attestation from Yivi's own issuer, and the proofs the wallet produces are accepted by Google's own reference verifier. The measurements in §8 were taken with a script standing in for the website; the same flow has since been run through a browser on the phone, which is how it will work in practice. A release of the Yivi app with zero-knowledge age proofs and `org-iso-mdoc` support is coming soon, on Android first.

---

*All phone figures from the same device throughout: CPH2423 / Dimensity 8100, Android 15, 8 cores, 11.7 GB RAM. All verifying-PC figures from an Intel Core i7-13700HX, 16 cores / 24 threads, 15.7 GB RAM; the proof check ran inside a Linux container on that machine, the surrounding work natively on Windows 11. Measurements of 30 September 2026 unless stated otherwise. Underlying measurement files, profiles, patches and test harnesses are retained alongside the source.*
