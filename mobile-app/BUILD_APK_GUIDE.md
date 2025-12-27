# Building APK for CBZ Perfumes Mobile App

## Prerequisites
1. **Expo Account** - Create a free account at https://expo.dev
2. **EAS CLI** - Install globally: `npm install -g eas-cli`

## Step-by-Step Build Instructions

### 1. Install EAS CLI (if not already installed)
```bash
npm install -g eas-cli
```

### 2. Login to Expo
```bash
cd mobile-app
eas login
```
Enter your Expo credentials when prompted.

### 3. Configure the Project
```bash
eas build:configure
```
This will set up your project for EAS Build.

### 4. Build the APK

**Option A: Build APK (Recommended for testing)**
```bash
eas build --platform android --profile preview
```

**Option B: Build Production APK**
```bash
eas build --platform android --profile production
```

### 5. Download the APK
Once the build completes (takes 10-20 minutes):
1. You'll get a link to download the APK
2. Or visit https://expo.dev and go to your project
3. Download the APK from the builds section

### 6. Install on Android Device
1. Transfer the APK to your Android phone
2. Enable "Install from Unknown Sources" in Settings
3. Tap the APK file to install

## Alternative: Local Build (Faster but requires Android Studio)

### Prerequisites
- Android Studio installed
- Java JDK 17 or higher
- Android SDK configured

### Steps
```bash
# Install dependencies
npm install

# Generate Android project
npx expo prebuild --platform android

# Build APK locally
cd android
./gradlew assembleRelease

# APK will be at: android/app/build/outputs/apk/release/app-release.apk
```

## Quick Build Commands

### For Testing (APK)
```bash
eas build --platform android --profile preview --non-interactive
```

### For Production (APK)
```bash
eas build --platform android --profile production --non-interactive
```

### Check Build Status
```bash
eas build:list
```

## App Details
- **App Name:** CBZ Perfumes
- **Package Name:** com.cbzperfumes.app
- **Version:** 1.0.0
- **Icon:** Using logo.png from public/images

## Troubleshooting

### If build fails:
1. Check your Expo account has build credits
2. Verify app.json is valid JSON
3. Make sure all dependencies are installed: `npm install`

### If icon doesn't appear:
1. Ensure icon.png is 1024x1024 pixels
2. Run: `npx expo prebuild --clean`

### To update the app:
1. Increment version in app.json
2. Rebuild: `eas build --platform android --profile production`

## Free Build Credits
Expo provides free build credits every month. Check your quota at:
https://expo.dev/accounts/[your-username]/settings/billing

## Next Steps After Building
1. Test the APK on a real Android device
2. If everything works, you can publish to Google Play Store
3. Or distribute the APK directly to users

## Publishing to Google Play Store (Optional)
```bash
eas submit --platform android
```
You'll need a Google Play Developer account ($25 one-time fee).
