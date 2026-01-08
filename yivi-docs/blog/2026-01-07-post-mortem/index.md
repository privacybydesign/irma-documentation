---
slug: 2026-jan-post-mortem
title: Post-mortem of the 7th of Januari
authors: [dibranmulder]
tags: [yivi, post-mortem]
---

According to our mission, we are committed to transparency and accountability. This post-mortem is part of that commitment, detailing the events surrounding the outage of the 7th of January 2026.

## Summary of the impact
We experienced significant degradated user experience on the 7th of January 2026, which affected our services for approximately 4 hours. During this time, users experienced inconsistent success rates in onboarding the Yivi app and or issuing credentials to them. The issue was caused by key rotation of the Yivi scheme and successive issues which arose from rotating the key.
<!-- truncate -->

## Timeline of the incident
| Date & Time                      | Description                                                                                                                                                                                          |
|-----------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Wednesday 7 January 2026 09:43 CET | At epoch `1767775401` the `sidn-pbdf` public key expired causing new users to not onboard the Yivi app. |
| Wednesday 7 January 2026 09:52 CET | At epoch `1767775972` the `pbdf` public key expired causing new users to not onboard the Yivi app. |
| Wednesday 7 January 2026 13:15 CET | First support ticket was filed. |
| Wednesday 7 January 2026 13:34 CET | The `sidn-pbdf` public key was rerolled and added to the scheme |
| Wednesday 7 January 2026 13:50 CET | The `pbdf` public key was rerolled and added to the scheme |
| Wednesday 7 January 2026 15:00 CET | Fix for race condition was applied to irmaserver |
| Wednesday 7 January 2026 15:08 CET | Fix for race condition was applied to keyshare server |
| Wednesday 7 January 2026 15:08 CET | The issue was resolved. |


## Customer impact
Yivi users were unable to onboard the Yivi app and issue credentials during the outage. The impact was significant, as new users were unable to use the app for approximately 4 hours.

## Root cause and mitigation
The Yivi team monitors the expiration dates of the public keys used in the Yivi scheme. However, due to an oversight and, the expiration dates for the `sidn-pbdf` and `pbdf` public keys were not updated in time, leading to their expiration on the 7th of January 2026. This caused new users to be unable to onboard the Yivi app and issue credentials.

Once the issue was identified, the Yivi team quickly rerolled the expired public keys and added them to the scheme. However, during this process of adding new keys to the scheme a race condition arose in both the irmaserver and keyshare server, which caused inconsistent success rates for onboarding and issuing credentials. This was due to both servers trying to update the scheme whilest starting up, this normally should not be an issue but due to the expansion of the scheme with more keys it caused a race condition. This was quickly identified and fixed by applying a fix to both servers.

## Next steps
To prevent similar incidents in the future, the Yivi team is implementing the following measures:
- `TODO`: Improve monitoring and alerting for key expiration dates to ensure timely updates, our monitoring insufficiently distinguishes between high priority and low priority alerts making it tough for the team to notice critical alerts.
- `DONE`: We now use container orchestration to download the scheme prior to starting the irmaserver and keyshare server, preventing race conditions during startup.

We apologize for the inconvenience caused by this incident and are committed to improving our processes to ensure the reliability of our services.