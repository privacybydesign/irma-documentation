---
slug: 2025-schememanager-migration
title: Scheme manager Migration Announcement
authors: [martijnkamphuis]
tags: [yivi, schememanager, migration, announcement]
---

# Update 15-04-2025
We want to inform you about a slight change in the planning, with the following impact for IRMA-server administrators:

- 30-04-2025: The scheme URL inside the scheme itself will be updated. If automatic scheme update is enabled on your server, this will automatically switch your server to use the new URL.
- **If you are behind a firewall, please keep the old Privacy By Design domain and/or IP whitelisted until at least May 14th.**


# Scheme manager migration announcement

We would like to inform our community of an upcoming change with regards to the Yivi/IRMA scheme manager.
This change will impact every IRMA-server currently running. Please read below for further details.

As part of our ongoing efforts to enhance resiliency and reliability, we will migrate the scheme manager to our next-generation infrastructure. Currently, all IRMA-server instances and mobile apps rely on the Yivi scheme manager, which forms the foundation of our trust model. At present, the scheme manager is hosted on infrastructure without failover capabilities. To improve robustness, we will move it to our reliable, European sovereign cloud hosting environment.

Because of this change, the URL and IP to the scheme manager will change in the near future and we ask you to update your instance(s) of the IRMA-server.

## Timeline overview
The complete timeline of this change will look like this:
-	Setup Yivi hosting environment for scheme manager.  (done)
-	08-04-2025 (today): Setup proxy from the old environment to the new environment.  (this change will have no impact on current IRMA-server installations)
-	09-04-2025: IRMA-server release with new scheme manager URL. At the same time, a mobile app update will be released for the beta program.
-	14-05-2025: The old URL will no longer be available. All IRMA-servers and mobile apps need to have been updated to the latest release.

Because of the change in URL and IP, we ask you to take the steps written out below.

### 1. Add whitelisted domain/IP-addresses
If your organization uses firewalls with whitelisted domains and/or IP-addresses for outbound traffic, please add the domain and/or IP-addresses below. If you are not sure if this is the case for you, please contact your network administrator. If you are sure you don’t need whitelisting, you can skip this step.
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
