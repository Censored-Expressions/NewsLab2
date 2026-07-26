# Censored Expressions Mobile App Deployment

This package is ready to become a store app through Capacitor. The native apps load the live production site at `https://censoredexpressions.com`, so the website remains the source of truth while Apple App Store and Google Play receive native wrappers.

## Mobile Architecture

- Public website and APIs stay deployed through GitHub and Render.
- iOS and Android apps load the live HTTPS domain inside Capacitor.
- Website updates still ship through GitHub/Render.
- App store updates are only needed when native settings, app icons, permissions, store metadata, or Capacitor versions change.
- The private Owner Desk and AI Framework should remain protected by token login and should not be promoted in public mobile navigation.

## One-Time Setup

Install dependencies:

```powershell
npm install
```

Add native projects:

```powershell
npm run mobile:add:android
npm run mobile:add:ios
```

Sync the current app configuration:

```powershell
npm run mobile:sync
```

Open Android Studio:

```powershell
npm run mobile:open:android
```

Open Xcode on a Mac:

```bash
npm run mobile:open:ios
```

## Google Play Release Path

1. Create a Google Play Console account.
2. Create a new app named `Censored Expressions`.
3. Use package ID `com.censoredexpressions.app`.
4. Build a signed Android App Bundle in Android Studio.
5. Upload the `.aab` to internal testing first.
6. Complete Data Safety, Content Rating, News app declarations, privacy policy URL, and app access instructions if login-protected areas are reviewed.
7. Promote from internal testing to production after testing install, navigation, article loading, newsletter, comments, sharing, legal pages, and ads.

## Apple App Store Release Path

Apple builds require a Mac with Xcode.

1. Create an Apple Developer account.
2. Create the app in App Store Connect.
3. Use bundle ID `com.censoredexpressions.app`.
4. Open the iOS project in Xcode.
5. Set signing team, version, and build number.
6. Archive and upload through Xcode Organizer.
7. Complete privacy nutrition labels, content rights, news/content declarations, screenshots, support URL, privacy policy URL, and reviewer notes.

Apple may reject apps that are only a thin website wrapper. To reduce that risk, keep the mobile experience polished, fast, useful, and clearly branded: native app icon, stable navigation, working share actions, legal links, newsletter value, comments, and daily editorial content.

## Store Listing Draft

- App name: Censored Expressions
- Short description: Independent news, culture, commentary, newsletters, and editorials.
- Category: News
- Privacy policy: `https://censoredexpressions.com/legal-documents.html`
- Support URL: `https://censoredexpressions.com`
- Marketing URL: `https://censoredexpressions.com`
- Content note: The app provides news commentary, curated headlines, editorials, newsletters, public comments, and media links.

## Pre-Submission Checklist

- Live domain returns `200` at `https://censoredexpressions.com`.
- `https://censoredexpressions.com/manifest.webmanifest` loads.
- `https://censoredexpressions.com/assets/app-icon-512.png` loads.
- `https://censoredexpressions.com/legal-documents.html` loads.
- Newsletter page loads with current content.
- Creator Desk page loads with current editorials and comments.
- Share button works on mobile.
- Public pages do not expose Owner Desk links.
- Owner Desk still requires token access.
- AdSense script is present, but store screenshots should not rely on ad fill.
- No localhost-only links are visible in public mobile pages.
- Background images and branding load from production URLs.

## AI Framework Mobile Lesson

The Framework should treat mobile deployment as a cross-role change. It affects:

- Site optimization: production speed, image loading, cache behavior, and HTTPS reliability.
- Governance: privacy policy, public legal pages, app review disclosures, and owner-only controls.
- Code learning: native wrapper configuration, package scripts, dependency updates, and release verification.
- Monetization: mobile ad behavior must remain policy-compliant and should not force clicks or obscure content.
- Search and editorial behavior: mobile users are another source of visitor-interest learning, but search data remains only one input into editorial decisions.

Future mobile changes should be logged with trigger event, previous configuration, new configuration, confidence score, governance decision, and result metric.
