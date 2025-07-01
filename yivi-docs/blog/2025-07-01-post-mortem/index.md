---
slug: 2025-juni-post-mortem
title: Post-mortem of the June 29th and 30th 2025 incident
authors: [dibranmulder]
tags: [yivi, ios, post-mortem]
---

According to our mission, we are committed to transparency and accountability. This post-mortem is part of that commitment, detailing the events surrounding the issue with the Yivi app on iOS on June 29th and 30th 2025.

## Summary of the impact
Some iOS users of the Yivi app were unable to open their Yivi app on June 29th and 30th, 2025, due to an issue with the Universal Links feature. This issue was caused by a domain migration of `irma.app`, resulting traffic to be redirected from `irma.app` to `yivi.app`. iOS devices however do not support redirection for Universal Links, which led to the app being unable to open Universal Links. This issue was resolved by changing the `irma.app` domain back to its original server.

Users that had the Yivi app installed prior to the incident were probably not affected, as the app was still able to open. However, users who installed the app after the domain migration were unable to open it due to the Universal Links issue.

## Timeline of the incident
| Date & Time                      | Description                                                                                                                                                                                          |
|-----------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| June 29th, 2025, 20:00 CEST       | Received an email from DNS provider that the domain `irma.app` was migrated to the new provider and was starting to redirect traffic to `yivi.app`.                                                          |
| June 29th, 2025, 21:07 CEST       | Received a report from a user that the Yivi app on iOS was not opening.                                                                                                                               |
| June 30th, 2025, 00:03 CEST       | Received another report from a user that the Yivi app on iOS was not opening.                                                                                                                         |
| June 30th, 2025, 13:15 CEST       | Started investigating the issue and found that the Universal Links feature was not working due to the domain migration.                                         |
| June 30th, 2025, 14:00 CEST       | Confirmed the issue was caused by the redirection of traffic from `irma.app` to `yivi.app`. Issue affected only new installations of the Yivi app on iOS, not existing ones.                               |
| June 30th, 2025, 15:30 CEST       | Changed the `irma.app` DNS settings back to the old server allowing Apple devices to check the site association again.                                                                                                          |
| June 30th, 2025, 16:00 CEST       | Confirmed that the issue was resolved; the Yivi app was able to open on iOS devices again.                                                                                                           |
| July 1st, 2025, 11:45 CEST        | Delivered a workaround to affected users by providing a page that converts `irma.app` Universal Links to `open.yivi.app` Universal Links.                                                           |
| July 1st, 2025, 14:00 CEST        | Documented the issue and resolution in a post-mortem on our blog and shared it with the community.                                                                                                   |


## Customer impact
The incident affected a small number of iOS users who were unable to open the Yivi app, in a same deice flow, due to the Universal Links issue. The impact was limited to users who installed the app after the domain migration and to users of who's iOS rechecked the site association file after the migration. We have no reason to believe that it affected a large number of existing Yivi iOS users. According to our `keyshare server registrations`, the number of affected users, that installed the Yivi app in the time window mentioned above, was about `78 users` including Android users, which is a small percentage of our total user base.

## Root cause and mitigation
As part of our efforts to improve the Yivi app, we migrated the domain `irma.app` to `yivi.app`. This migration was intended to provide a more consistent branding experience for our users and to gain control over all domains originally maintained by `SIDN`. However, the migration inadvertently caused an issue with the Universal Links feature on iOS devices, which do not support forwarding for Universal Links.

The Universal Links feature allows the Yivi app to open directly from links in the browser, providing a seamless user experience. However, iOS requires that the associated domain file (`apple-app-site-association`) be hosted on the domain without any redirects. The redirection of traffic from `irma.app` to `yivi.app` caused the associated domain file to be redirected, which prevented the Yivi app from opening on iOS devices that installed the app after the migration.

> `https://fully qualified domain/.well-known/apple-app-site-association`
> You must host the file using https:// with a valid certificate and with no redirects.

[Link to Apple's documentation](https://developer.apple.com/documentation/xcode/supporting-associated-domains#:~:text=and%20with%20no-,redirects,-.)

The reason it was not breaking Android devices is that Android uses a different mechanism for handling Universal Links, which doesn't rely on the `irma.app` domain, as can be seen in our Yivi frontend packages code, its  not using the `irma.app` domain for Android devices, but instead used an intent link that does not require the associated domain file to be hosted without redirects.

[Yivi frontend packages code](https://github.com/privacybydesign/yivi-frontend-packages/blob/da76c44b0698563bc95c66c3552c2cb914747ec0/plugins/yivi-client/state-client.js#L296)
```js
  _getMobileUrl(sessionPtr) {
    const json = JSON.stringify(sessionPtr);
    switch (this._userAgent) {
      case 'Android': {
        // Universal links are not stable in Android webviews and custom tabs, so always use intent links.
        const intent = `Intent;package=org.irmacard.cardemu;scheme=irma;l.timestamp=${Date.now()}`;
        return `intent://qr/json/${encodeURIComponent(json)}#${intent};end`;
      }
      case 'iOS': {
        return `https://irma.app/-/session#${encodeURIComponent(json)}`;
      }
      default: {
        throw new Error('Device type is not supported.');
      }
    }
  }
```

To mitigate the issue, we changed the DNS settings of `irma.app` back to the old server, allowing the Yivi app to open on iOS devices again. This was a temporary solution to ensure that users could continue to use the app while we worked on a more permanent fix.

The `open.yivi.app` domain was not affected by this issue, as it was not part of the domain migration. The `open.yivi.app` domain is an alternative Universal Link that can be used to open the Yivi app on iOS devices. We provided a workaround for affected users by creating a page on `irma.app/-/session` that converts the `irma.app` Universal Links to `open.yivi.app` Universal Links, allowing them to continue using the app without any issues.

This workaround will stay into place until we have fully migrated the `irma.app` domain to the new server and ensured that all Universal Links are working correctly. Apple states that it can take up to a week for devices to recheck the associated domain file, so we will monitor the situation closely and make any necessary adjustments as needed.

Affected users can decide to reinstall the Yivi app from the App Store, which will ensure that the app is able to open Universal Links correctly. However, this is not necessary for existing users who already have the app installed, as they will still be able to open the app without any issues.

## Next steps
1. **Reevaluate domain migration strategy**: We will review our domain migration strategy to ensure that future migrations do not cause similar issues with Universal Links or other features.
2. **Review App integrations**: We will review the integration of the Yivi app with Universal Links and QR intents on both iOS and Android devices to ensure that it is robust and has fallbacks in place for any potential issues.

