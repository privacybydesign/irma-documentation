---
slug: 2025-schememanager-migration
title: Schememanager Migration Announcement
authors: [kamphuisem]
tags: [yivi, schememanager, migration, announcement]
---

# Schememanager migration announcement

We would like to inform our community of an upcoming change with regards to the Yivi/IRMA schememanager.
This change will impact every IRMA-server currently running. Please read below for further details.

Currently, every IRMA-server instance and mobile-app communicates with the Yivi schememanager, which is the basis of our trust-model.
This schememanager is currently running on servers, hosted by the Privacy by Design Foundation.
With the migration of Yivi to the Caesar group, the Foundation has asked us to also take this component under our management.
Because of this change, the URL and IP to the schememanager will change in the near future and we ask you to update your instance(s) of the IRMA-server.

## Timeline overview
The complete timeline of this change will look like this:
-	Setup Yivi hosting environment for schememanager.  (done)
-	08-04-2025 (today): Setup proxy from the old environment to the new environment.  (this change will have no impact on current IRMA-server installations)
-	09-04-2025: IRMA-server release with new schememanager URL. At the same time, a mobile app update will be released for the beta program.
-	14-05-2025: The old URL will no longer be available. All IRMA-servers and mobile apps need to have been updated to the latest release.

Because of the change in URL and IP, we ask you to take the steps written out below.

### 1. Add whitelisted domain/IP-addresses
If your organization uses firewalls with whitelisted domains and/or IP-addresses, please add the domain and/or IP-addresses below. In case you are not sure if this is the case for you, please contact your network administrator. If you are sure you don’t need whitelisting, you can skip this step.
Please make sure to have both settings active before upgrading the IRMA-server. Once the updated IRMA-server is running steadily for a while, you can remove the old settings.

|  | Old settings | New settings |
|----------|----------|----------|
| Domain | https://privacybydesign.foundation/schememanager/ | https://schemes.yivi.app/ |
| IPv4 | 37.97.206.70 | 51.158.130.42 |
| IPv6* | n.a. | 2001:bc8:1640:3c32:: |

_*\) Note: the IPv6 address is already reserved, however it is not in active use yet. Once it is, we will notify about it on our blog._

### 2. Update the IRMA-server
After you’ve made sure you can reach the new domain (after the firewall changes, in case you require them), you are ready to update the IRMA-server to __version v0.18.0__.
Please review the release notes in case you need to skip one or more version for this update.

__We kindly ask you to plan this update and execute the update to v0.18.0 before May 14<sup>th</sup>.__

Should you have any questions regarding this update, please feel free contact us at [support@yivi.app](mailto:support@yivi.app).
