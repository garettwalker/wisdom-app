# EAS Build Configuration

This document explains the configuration changes made to prepare for EAS Build and app store submission.

---

## Files Modified

### `app.json` - Expo Configuration

**Changes Made:**

| Field | Value | Purpose |
|-------|-------|---------|
| `name` | `"30 Days Into the Desert"` | Display name shown on device home screen |
| `ios.bundleIdentifier` | `"com.desertapp.meditation"` | Unique iOS app ID (required for App Store) |
| `android.package` | `"com.desertapp.meditation"` | Unique Android package name (required for Play Store) |
| `ios.infoPlist.NSMicrophoneUsageDescription` | Privacy description | Required by Apple even if not using mic |
| `extra.eas.projectId` | `"YOUR_PROJECT_ID_HERE"` | Links to your EAS project (get from `eas init`) |

---

### `eas.json` - EAS Build Configuration (NEW)

**Build Profiles:**

| Profile | Purpose | Distribution |
|---------|---------|--------------|
| `development` | Local testing with dev client | Internal (Expo Go) |
| `preview` | Pre-production builds | Internal (TestFlight/internal testing) |
| `production` | App store releases | App Store / Play Store |

**Submit Configuration:**

For automated store submission, fill in:
- `ios.appleId` - Your Apple ID email
- `ios.ascAppId` - App Store Connect App ID (after creating app)
- `ios.appleTeamId` - Your Apple Developer Team ID
- `android.serviceAccountKeyPath` - Path to Google Play service account JSON
- `android.track` - `"internal"` for internal testing, `"production"` for public

---

## Setup Steps

### 1. Initialize EAS Project

```bash
cd /Users/garettwalker/desert-app
npx eas init
```

This will:
- Create/link your EAS project
- Generate a `projectId` - copy this to `app.json` under `extra.eas.projectId`

### 2. Configure Build Profiles

Edit `eas.json` and replace placeholders:
- `YOUR_PROJECT_ID_HERE` → Your actual EAS project ID

### 3. Configure Store Submission (Optional - do when ready)

For iOS:
- Get Apple Team ID from https://developer.apple.com/account
- Create app in App Store Connect to get ASC App ID

For Android:
- Create service account in Google Play Console
- Download JSON key to `./google-service-account.json`

---

## Building Commands

### Development Build (for testing)
```bash
npx eas build --profile development --platform ios
npx eas build --profile development --platform android
```

### Preview Build (for beta testing)
```bash
npx eas build --profile preview --platform ios
npx eas build --profile preview --platform android
```

### Production Build (for stores)
```bash
npx eas build --profile production --platform ios
npx eas build --profile production --platform android
```

---

## Verify Configuration

Run this to check your config is valid:

```bash
npx eas build:configure
```

Expected output:
```
✔ Validated configuration
✔ Using EAS project: YOUR_PROJECT_ID
✔ iOS bundle identifier: com.desertapp.meditation
✔ Android package: com.desertapp.meditation
```

---

## Naming Convention Used

**Bundle ID format:** `com.desertapp.meditation`

- `com` - Reverse domain notation
- `desertapp` - Your app/brand name
- `meditation` - App category/descriptor

This format works for both:
- Apple App Store (as Bundle ID)
- Google Play Store (as Application ID)

If you own `yourdomain.com`, consider: `com.yourdomain.desertapp`

---

## Next Steps

1. Run `npx eas init` to link your EAS project
2. Update `app.json` with the real `projectId`
3. Run `npx eas build:configure` to verify
4. Build a development version first to test the pipeline
5. When ready, build production for store submission
