---
slug: 2025-keyshare-migration
title: 📢 Important notice Keyshare server migration
authors: [dibranmulder]
tags: [yivi, migration]
---

In the night of March 17th to 18th, 2025, at 01:00 CET, we will complete the final phase of the migration from SIDN to Caesar Groep. The last two components that require temporary downtime are the Keyshare Server and MyYivi. These systems play a crucial role in Yivi's authentication and identity management services, and we want to ensure a smooth transition with minimal disruption.

<!-- truncate -->

## Migration Plan
To ensure a seamless transition, we have prepared the following steps:

- Yivi App Update - March 11th, 2025
  - A Yivi App release will update the Keyshare Server endpoint from `https://irma.sidn.nl/tomcat/irma_keyshare_server` to `https://keyshare.yivi.app`.
  - The trust scheme will be changed to use the new Keyshare Server.
  - During this transition, https://keyshare.yivi.app will act as a reverse proxy to the existing SIDN Keyshare Server, ensuring uninterrupted service.
- Final Migration - March 18th, 2025
  - At 01:00 CET, the SIDN Keyshare Server will be shut down.
  - The Keyshare database will be migrated to our new infrastructure.
  - The reverse proxy at `https://keyshare.yivi.app` will be removed and traffic will be routed to , and the new Keyshare Server will be brought online.
  - The DNS for `irma.sidn.nl` will be updated to redirect users who have not yet updated their app to the new environment.

## Expected Impact
There is no expected impact regarding the Yivi App update on the 11th of March.

There is approximately 1 hour of **expected downtime** for users in the night of the 17th-18th of March
Users will receive errors when entering the pin in Yivi.

## What can you do?
Organizations using Yivi should take the following steps to mitigate potential issues:
- Verify Integrations: Ensure all integrations with Yivi services continue to function correctly after the migration.
- Inform Users: Notify your users about the scheduled downtime to manage expectations and reduce support requests.

## Contact and Support
If you have any questions or experience issues during the migration, please reach out to us:

📧 Email Support: support@yivi.app

📢 Status Updates: We will post updates on this blog.

We appreciate your cooperation and patience during this transition. Thank you for using Yivi

## Overview of migrated services

| **Resource**          | **Old Location**                                           | **New Location**                      | **Migration Date**   |
|-----------------------|------------------------------------------------------------|---------------------------------------|----------------------|
| **Mail**              | `yivi@caesar.nl` and `noreply@sidn.nl`                     | `support@yivi.app` and `noreply@mail.yivi.app`| ✅ Ready     |
| **SMS Issuer**        | https://sidnsmsissuer.yiviconnect.nl/issuance/sms          | https://sms-issuer.yivi.app           | 🚀 Live           |
| **Email Issuer**      | https://sidnemailissuer.yiviconnect.nl/issuance/email      | https://email-issuer.yivi.app         | 🚀 Live             |
| **iDIN Issuer**       | https://privacybydesign.foundation/uitgifte/idin/          | https://idin-issuer.yivi.app          | 🚀 Live
| **Attribute Index**   | https://privacybydesign.foundation/attribute-index/en/     | https://attribute-index.yivi.app      | 🚀 Live      |
| **Atumd Server**      | https://irma.sidn.nl/atumd/                                | https://atumd.yivi.app                | 🚀 Live         |
| **Docs**              | https://irma.app/docs                                      | https://docs.yivi.app                 | 🚀 Live |
| **Demos**             | https://privacybydesign.foundation/demo/                   | https://demos.yivi.app                | 🚀 Live         |
| **YiviConnect**       | URL remains unchanged                                      | URL remains unchanged                 | 🚀 Live  |
| **open.yivi.app**     | URL remains unchanged                                      | URL remains unchanged                 | 🚀 Live  |
| **Keyshare Server**   | https://irma.sidn.nl/tomcat/irma_keyshare_server           | https://keyshare.yivi.app             | **⚠️ 18th of March** |
| **MyYivi**            | URL remains unchanged                                      | URL remains unchanged                 | **⚠️ 18th of March** |