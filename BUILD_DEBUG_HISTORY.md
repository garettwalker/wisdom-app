# EAS iOS Build Debug History

**Project:** Wilderness App (desert-app)  
**Date Range:** May 17-18, 2026  
**Objective:** Build iOS app for TestFlight/App Store using EAS Build  
**Status:** IN PROGRESS - Navigation Asset Patch Applied

---

## Initial Setup

### Project Configuration
- **Expo SDK:** Started at 49, upgraded to 54
- **React Native:** 0.81.5
- **Build Platform:** iOS (EAS Build)
- **Build Profile:** production

### Initial EAS Configuration (`eas.json`)
```json
{
  "build": {
    "production": {
      "autoIncrement": true,
      "env": { "EAS_BUILD_NO_EXPO_GO_WARNING": "true" },
      "ios": { "image": "latest" }
    }
  }
}
```

---

## Error Timeline & Attempts

### Attempt 1: Google Fonts ENOTDIR
**Error:**
```
Error: ENOTDIR: not a directory, mkdir
'/Users/expo/workingdir/build/ios/build/.../Wilderness.app/wilderness/assets/node_modules/@expo-google-fonts/playfair-display/400Regular'
```

**Root Cause:**  
`@expo-google-fonts` packages use `require()` for `.ttf` files internally. Metro tried to bundle these with deep paths (`400Regular/PlayfairDisplay_400Regular.ttf`), creating invalid directory structures during iOS archive.

**Attempted Fixes:**
1. ❌ Added `metro.config.js` with `blockList` for font files - BROKE font loading entirely
2. ✅ **SOLUTION:** Removed `@expo-google-fonts` packages, switched to local font files
   - Copied 5 fonts to `assets/fonts/`
   - Updated `_layout.tsx` to use `expo-font`'s `useFonts` with local requires
   - Updated `app.json` expo-font plugin config to point to local files
   - Removed font loading from all other screens (now handled once in root layout)

**Files Changed:**
- `app/_layout.tsx` - Single font loading point
- `app/*.tsx` (8 files) - Removed individual font loading
- `app.json` - Updated expo-font plugin config
- Deleted `@expo-google-fonts/*` packages

---

### Attempt 2: React Navigation Elements ENOTDIR
**Error:**
```
Error: ENOTDIR: not a directory, mkdir
'/Users/expo/workingdir/build/ios/build/.../Wilderness.app/wilderness/assets/node_modules/@react-navigation/elements/lib/module/assets'
```

**Root Cause:**  
Same issue as fonts - Metro preserving deep source paths (`lib/module/assets`) when bundling `@react-navigation/elements` assets.

**Attempted Fixes:**
1. ❌ Added Metro config to block `/lib/module/assets/` paths - BROKE the build (blocked required assets)
2. ❌ Removed Metro config entirely - Original ENOTDIR returned
3. ❌ Tried reinstalling node_modules - NPM cache permission issues
4. ✅ **CURRENT SOLUTION:** Post-install patch script
   - `scripts/patch-navigation-assets.js` moves assets to flatter path
   - Patches source files to use new import paths
   - Runs automatically via `postinstall` npm hook

**Patch Details:**
- Moves 29 assets from `lib/module/assets/` → `assets/`
- Patches 19 source files to update import paths
- Changes `require('./assets/...')` → `require('../../assets/...')`

---

### Attempt 3: Xcode Version Mismatch
**Error:**
```
Apple requires apps submitted to the App Store to be built with Xcode 26 or newer.
This build used Xcode 15.
```

**Fix:**
- Added `"ios": { "image": "latest" }` to production build profile
- Uses Xcode 16 (latest available on EAS)

---

### Attempt 4: Expo SDK Version Mismatch
**Error:**
```
Invalid `Podfile` file: uninitialized constant Pod::Podfile::FlipperConfiguration.
flipper_config = FlipperConfiguration.disabled
```

**Root Cause:**  
Package.json had `expo: ^49.0.23` but `react-native: 0.81.5`. Expo 49 uses Flipper, but RN 0.81 removed it.

**Fix:**
- Upgraded Expo: `49.0.23` → `54.0.34` (matches RN 0.81 requirement)
- Ran `npm install expo@~54.0.34`

---

### Attempt 5: Missing Node Modules
**Error:**
```
Failed to resolve plugin for module "expo-router"
```

**Root Cause:**  
`node_modules` directory was deleted during troubleshooting.

**Fix:**
- Fixed NPM cache permissions: `sudo chown -R 501:20 "/Users/garettwalker/.npm"`
- Ran `npm install` to restore dependencies
- Post-install script automatically patched navigation assets

---

## Configuration Files

### Final `metro.config.js`
**Status:** REMOVED  
All Metro config attempts caused more issues. Using default Expo Metro config.

### Final `app.json` (expo-font plugin)
```json
[
  "expo-font",
  {
    "fonts": [
      "./assets/fonts/Inter_400Regular.ttf",
      "./assets/fonts/Inter_500Medium.ttf",
      "./assets/fonts/Inter_600SemiBold.ttf",
      "./assets/fonts/PlayfairDisplay_400Regular.ttf",
      "./assets/fonts/PlayfairDisplay_700Bold.ttf"
    ]
  }
]
```

### Final `eas.json`
```json
{
  "production": {
    "autoIncrement": true,
    "env": { "EAS_BUILD_NO_EXPO_GO_WARNING": "true" },
    "ios": { "image": "latest" }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "glwalke17@gmail.com",
        "ascAppId": "YOUR_ASC_APP_ID_HERE",
        "appleTeamId": "838HM253V3"
      }
    }
  }
}
```

---

## Key Learnings

### What Works
1. ✅ Local font files + expo-font config plugin
2. ✅ Post-install patches for problematic node_modules
3. ✅ Xcode "latest" image for App Store compliance
4. ✅ Expo SDK version must match React Native version

### What Doesn't Work
1. ❌ `@expo-google-fonts` with EAS builds (Metro bundling issues)
2. ❌ Metro `blockList` for assets (breaks required imports)
3. ❌ Deep asset paths in node_modules (ENOTDIR errors)

### Why ENOTDIR Happens
Metro preserves source file paths when bundling assets. When those paths are deeply nested (`lib/module/assets/...`), the resulting iOS archive path exceeds filesystem limits or treats files as directories.

**Solution pattern:** Flatten the asset paths before Metro sees them.

---

## Current State (Latest Attempt)

### Applied Fixes
- [x] Local fonts instead of @expo-google-fonts
- [x] Navigation asset patch script
- [x] Xcode 16 (latest image)
- [x] Expo SDK 54
- [x] NPM cache permissions fixed
- [x] Node modules reinstalled with post-install patch

### Pending
- [ ] Build attempt with navigation patch
- [ ] If successful: Submit to App Store / TestFlight

---

## Next Steps If Build Fails Again

### Option 1: Downgrade React Navigation
- Downgrade to `@react-navigation/*` v6 (fewer deep asset paths)
- May require code changes for API differences

### Option 2: Patch Package Manager
- Use `patch-package` instead of custom script
- More robust for team development

### Option 3: EAS Build Cache Clear
```bash
eas build:configure --platform ios --clear-cache
```

### Option 4: Create Development Build First
- Test with `development` profile locally
- Catch issues before production builds

---

## Quick Reference Commands

```bash
# Fix build
npx -y eas-cli build --platform ios --profile production

# Check project health
npx expo-doctor

# Fix npm permissions
sudo chown -R 501:20 "/Users/garettwalker/.npm"

# Reinstall with patches
rm -rf node_modules && npm install

# View build logs
eas build:logs --build-id <BUILD_ID>
```

---

## Related Documentation

- [Expo SDK 54 Migration Guide](https://docs.expo.dev/guides/sdk-54/)
- [EAS Build iOS Configuration](https://docs.expo.dev/build-reference/ios-builds/)
- [Metro Configuration](https://facebook.github.io/metro/docs/configuration/)
- [React Navigation Troubleshooting](https://reactnavigation.org/docs/troubleshooting/)

---

**Last Updated:** May 18, 2026 - After navigation asset patch applied  
**Build Attempts:** 5+  
**Time Invested:** ~3 hours
