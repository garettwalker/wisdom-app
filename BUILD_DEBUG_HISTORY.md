# EAS iOS Build Debug History

**Project:** Wilderness App (desert-app)  
**Date Range:** May 17-18, 2026  
**Objective:** Build iOS app for TestFlight/App Store using EAS Build  
**Status:** IN PROGRESS - Navigation Asset Patch (patch-package) Applied

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

### Attempt 6: Custom Patch Script Failed on EAS
**Error:**
```
Error: ENOTDIR: not a directory, mkdir
'/Users/expo/workingdir/build/ios/build/.../Wilderness.app/wilderness/assets/node_modules/@react-navigation/elements/lib/module/assets'
```

**Root Cause:**  
Custom `scripts/patch-navigation-assets.js` runs locally but NOT during EAS build. EAS servers don't execute postinstall scripts the same way as local npm install.

**Attempted Fixes:**
1. ❌ Custom `patch-navigation-assets.js` script - Only works locally, not on EAS
2. ✅ **SOLUTION:** Switched to `patch-package`
   - Installed: `npm install --save-dev patch-package`
   - Created patch: `npx patch-package @react-navigation/elements`
   - Updated postinstall: `"postinstall": "patch-package"`
   - Patch file: `patches/@react-navigation+elements+2.9.18.patch`

**Why patch-package works:**
- EAS recognizes patches in `patches/` directory automatically
- Applies after `npm install` on build servers
- Standard approach for node_modules patching

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
2. ✅ `patch-package` for node_modules patches (NOT custom scripts)
3. ✅ Xcode "latest" image for App Store compliance
4. ✅ Expo SDK version must match React Native version

### What Doesn't Work
1. ❌ `@expo-google-fonts` with EAS builds (Metro bundling issues)
2. ❌ Metro `blockList` for assets (breaks required imports)
3. ❌ Deep asset paths in node_modules (ENOTDIR errors)
4. ❌ Custom postinstall scripts on EAS (use patch-package instead)

### Why ENOTDIR Happens
Metro preserves source file paths when bundling assets. When those paths are deeply nested (`lib/module/assets/...`), the resulting iOS archive path exceeds filesystem limits or treats files as directories.

**Solution pattern:** Flatten the asset paths before Metro sees them.

---

## Current State (Latest Attempt)

### Applied Fixes
- [x] Local fonts instead of @expo-google-fonts
- [x] EAS pre-install hook for navigation asset patching
- [x] Xcode 16 (latest image)
- [x] Expo SDK 54
- [x] NPM cache permissions fixed
- [x] Config plugin (attempted, replaced by pre-install hook)

### Completed Attempts
- [x] Attempt 8: Shell script + prebuildCommand - ❌ Failed (expo CLI doesn't accept --platform on scripts)
- [x] Attempt 9: Config plugin withDangerousMod - ❌ Failed (patch runs but Metro still sees original paths)
- [x] Attempt 10: EAS pre-install hook - ⏳ Current (runs after npm install, before build)

### Pending
- [ ] Build attempt with EAS pre-install hook
- [ ] If successful: Submit to App Store / TestFlight

---

### Attempt 7: patch-package Binary Files Failed
**Error:**
```
SyntaxError: node_modules/@react-navigation/elements/assets/back-icon.png: Empty file
Error: Empty file
```

**Root Cause:**  
`patch-package` doesn't handle binary files (PNG images) correctly. The patch file contained empty/invalid binary data.

**Fix:**
- ❌ Deleted broken patch
- ✅ Switched to shell script approach

---

### Attempt 8: Shell Script with prebuildCommand
**Error:**
```
unknown or unexpected option: --platform
npx expo chmod +x ./scripts/patch-navigation.sh && ./scripts/patch-navigation.sh --platform ios exited with non-zero code: 1
```

**Root Cause:**  
`prebuildCommand` is designed for `expo prebuild` CLI commands, not arbitrary shell scripts. EAS automatically appends `--platform ios` which breaks shell scripts.

**Fix:**
- ❌ Removed `prebuildCommand` from `eas.json`
- ✅ Switched to Expo config plugin approach

---

### Attempt 9: Expo Config Plugin withDangerousMod
**Error:**
```
Error: ENOTDIR: not a directory, mkdir '.../@react-navigation/elements/assets'
```

**Root Cause:**  
Config plugin runs during `expo prebuild`, but `npm install` on EAS happens AFTER prebuild (or resets node_modules). The patched files get overwritten.

**Fix:**
- ❌ Config plugin doesn't run at the right time
- ✅ Switched to EAS pre-install hook

---

### Attempt 10: EAS Pre-Install Hook (CURRENT)
**Solution:**
1. Created `eas-hooks/pre-install.sh`:
   - Runs automatically after `npm install` on EAS servers
   - Copies assets to flatter path
   - Patches JS imports
2. No configuration needed - EAS detects and runs hooks automatically

**Why this should work:**
- EAS runs `npm install`
- Hook patches node_modules immediately after
- Metro bundling sees patched files
- No timing conflicts

---

### Historical: Shell Script Attempt Details
**Original Solution:**
1. Created `scripts/patch-navigation.sh` to:
   - Copy assets from `lib/module/assets/` to `assets/` (flatter path)
   - Patch JS imports using `sed`
2. Tried multiple ways to execute on EAS:
   ```json
   "prebuildCommand": "chmod +x ./scripts/patch-navigation.sh && ./scripts/patch-navigation.sh"
   ```
3. Updated `package.json` postinstall to run same script

**Why this should work:**
- EAS `prebuildCommand` runs explicitly before build
- Shell script handles binary files correctly (cp, not patch)
- Tested locally - patches applied successfully

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

**Last Updated:** May 18, 2026 - Attempts 8-10, EAS pre-install hook created (10+ attempts total)
**Build Attempts:** 10+
**Time Invested:** ~5 hours

---

## Key Insight

The ENOTDIR error is a **known issue** with React Navigation 7 + Metro 0.80+ + EAS managed builds. The community hasn't found a clean solution.

**What works locally doesn't work on EAS because:**
- `npm install` on EAS servers resets node_modules
- Custom patches get overwritten
- Metro bundling happens after prebuild but before our patches apply

**Current attempt (EAS pre-install hook) is the most promising** because it patches immediately after npm install, before any other build steps.

**If this fails, options are:**
1. Fork @react-navigation/elements with flatter asset paths
2. Switch to bare workflow (eject from managed)
3. Use patch-package with post-install-postinstall (hacky)
4. Contact EAS support with full build logs
