# Mobile App Build Guide

Complete guide for building and distributing the LotoLink mobile app for iOS and Android.

## Architecture

The mobile app is built using a self-contained single-file HTML application (`index.html`) that includes:
- Complete responsive design optimized for all mobile devices (phones and tablets)
- React application loaded from CDN
- Full PWA support with offline capabilities
- Native mobile features through Capacitor
- Comprehensive responsive CSS with breakpoints for all screen sizes
- Safe area insets support for notched devices (iPhone X and newer)
- Touch-optimized UI with proper tap targets (44x44pt minimum)

The build process uses Vite to bundle the HTML and assets into a `dist/` folder, which is then synced to native platforms via Capacitor.

## Prerequisites

### General Requirements
- Node.js 18+ and npm
- Git
- LotoLink mobile app repository cloned

### iOS Requirements (macOS only)
- macOS 12 (Monterey) or later
- Xcode 14+ (download from Mac App Store)
- CocoaPods: `sudo gem install cocoapods`
- Apple Developer Account ($99/year)

### Android Requirements
- Android Studio (latest version)
- JDK 17+ (included with Android Studio)
- Android SDK Platform 33+ (API Level 33)
- Android SDK Build-Tools 33.0.0+
- Google Play Developer Account ($25 one-time)

## Initial Setup

### 1. Install Dependencies

```bash
cd mobile-app
npm install
```

### 2. Build Web Assets

```bash
npm run build
```

This creates the `dist/` directory with the compiled web assets.

### 3. Add Native Platforms

#### Android
```bash
npx cap add android
```

#### iOS (macOS only)
```bash
npx cap add ios
cd ios/App
pod install
cd ../..
```

### 4. Sync Capacitor

After building or making changes:

```bash
npx cap sync
```

This copies web assets and updates native plugins.

## Android Build Process

### Development Build (APK for Testing)

1. **Open in Android Studio**
   ```bash
   npx cap open android
   ```

2. **Wait for Gradle sync** to complete (first time takes 5-10 minutes)

3. **Configure Signing (for release)**
   - Navigate to `Build > Generate Signed Bundle/APK`
   - Select `APK` or `Android App Bundle`
   - Create or select keystore
   - Fill in signing details
   - **IMPORTANT**: Save keystore and credentials securely!

4. **Build Debug APK**
   - Select `Build > Build Bundle(s) / APK(s) > Build APK(s)`
   - APK location: `android/app/build/outputs/apk/debug/app-debug.apk`

5. **Install on Device**
   ```bash
   adb install android/app/build/outputs/apk/debug/app-debug.apk
   ```

### Production Build (AAB for Play Store)

1. **Update Version Numbers**

   Edit `android/app/build.gradle`:
   ```gradle
   android {
       defaultConfig {
           versionCode 1        // Increment for each release
           versionName "1.0.0"  // Semantic version
       }
   }
   ```

2. **Generate Signing Key** (first time only)
   ```bash
   keytool -genkey -v -keystore lotolink-release.keystore \
     -alias lotolink -keyalg RSA -keysize 2048 -validity 10000
   ```
   
   **Store credentials securely!**

3. **Configure Signing**

   Create `android/key.properties`:
   ```properties
   storePassword=YOUR_STORE_PASSWORD
   keyPassword=YOUR_KEY_PASSWORD
   keyAlias=lotolink
   storeFile=/path/to/lotolink-release.keystore
   ```

   Add to `.gitignore`:
   ```
   key.properties
   *.keystore
   ```

4. **Build Release AAB**
   - In Android Studio: `Build > Generate Signed Bundle/APK`
   - Select `Android App Bundle`
   - Choose keystore and credentials
   - Select `release` build variant
   - AAB location: `android/app/build/outputs/bundle/release/app-release.aab`

### Command Line Build (Alternative)

```bash
# Debug APK
cd android
./gradlew assembleDebug

# Release AAB (requires signing configuration)
./gradlew bundleRelease
```

## iOS Build Process (macOS only)

### Development Build

1. **Open in Xcode**
   ```bash
   npx cap open ios
   ```

2. **Configure Signing**
   - Select project in Navigator
   - Select `App` target
   - Go to `Signing & Capabilities`
   - Select your Team (Apple Developer Account)
   - Xcode auto-generates provisioning profiles

3. **Select Device/Simulator**
   - Top bar: Select target device or simulator

4. **Build and Run**
   - Press `⌘ + R` or click Play button
   - App installs and launches on device/simulator

### Production Build (IPA for App Store)

1. **Update Version Numbers**

   Edit `ios/App/App/Info.plist`:
   ```xml
   <key>CFBundleShortVersionString</key>
   <string>1.0.0</string>
   <key>CFBundleVersion</key>
   <string>1</string>
   ```

2. **Configure App Store Connect**
   - Log in to https://appstoreconnect.apple.com
   - Create new app
   - Fill in app information
   - Add screenshots (required sizes)
   - Write app description

3. **Archive for Distribution**
   - In Xcode top bar: Select `Any iOS Device (arm64)`
   - Menu: `Product > Archive`
   - Wait for archive to complete (5-10 minutes)
   - Archives window opens automatically

4. **Upload to App Store**
   - Select archive
   - Click `Distribute App`
   - Select `App Store Connect`
   - Select options (defaults are fine)
   - Upload (takes 10-20 minutes)

5. **Submit for Review**
   - Go to App Store Connect
   - Select your app
   - Add build to version
   - Submit for review
   - Wait for approval (1-2 days typically)

### TestFlight Beta Testing

1. **Upload build** (same as above, steps 1-4)
2. **Go to TestFlight** tab in App Store Connect
3. **Add beta testers** via email
4. **Testers receive invite** to install TestFlight
5. **Test and gather feedback**

## Environment Configuration

### Development
Create `.env.development`:
```env
VITE_API_URL=http://localhost:3000/api/v1
```

### Production
Create `.env.production`:
```env
VITE_API_URL=https://api.lotolink.com/api/v1
```

Load in `capacitor.config.ts` if needed.

## Firebase Setup (for Push Notifications)

### Android
1. **Create Firebase Project**: https://console.firebase.google.com
2. **Add Android App**
   - Package name: `com.lotolink.app`
3. **Download `google-services.json`**
4. **Place in**: `android/app/google-services.json`
5. **Sync Capacitor**: `npx cap sync android`

### iOS
1. **Add iOS App** in same Firebase project
   - Bundle ID: `com.lotolink.app`
2. **Download `GoogleService-Info.plist`**
3. **Place in**: `ios/App/App/GoogleService-Info.plist`
4. **Add to Xcode** project (drag & drop in Navigator)
5. **Sync Capacitor**: `npx cap sync ios`

## Troubleshooting

### Android Issues

**Gradle Build Fails**
```bash
cd android
./gradlew clean
./gradlew build --stacktrace
```

**Plugin Not Found**
```bash
npm install
npx cap sync android
```

**Device Not Detected**
```bash
adb devices
adb kill-server
adb start-server
```

### iOS Issues

**Build Failed**
- Clean build folder: `⌘ + Shift + K`
- Clean derived data: `⌘ + Shift + Alt + K`
- Update CocoaPods: `cd ios/App && pod update`

**Signing Issues**
- Ensure Apple ID is added in Xcode Preferences
- Check provisioning profiles are valid
- Try automatic signing first

**Device Not Detected**
- Trust computer on iOS device
- Check cable connection
- Restart Xcode and device

### Common Issues

**Module Not Found**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
npx cap sync
```

**White Screen on Launch**
- Check Capacitor server config in `capacitor.config.ts`
- Ensure `dist/` is built correctly
- Check browser console for errors

## Publishing Checklists

### Android (Google Play Console)

- [ ] Build signed AAB
- [ ] Upload to Google Play Console
- [ ] Add app listing details
- [ ] Upload screenshots (phone & tablet)
- [ ] Upload feature graphic (1024x500)
- [ ] Set content rating
- [ ] Add privacy policy URL
- [ ] Complete pricing & distribution
- [ ] Submit for review

### iOS (App Store Connect)

- [ ] Archive and upload IPA
- [ ] Add app listing details
- [ ] Upload screenshots (all required sizes)
- [ ] Write app description & keywords
- [ ] Set age rating
- [ ] Add privacy policy URL
- [ ] Enable TestFlight (optional)
- [ ] Submit for review

## Continuous Integration

### GitHub Actions Example

Create `.github/workflows/mobile-build.yml`:

```yaml
name: Mobile App Build

on:
  push:
    branches: [main]
    paths:
      - 'mobile-app/**'

jobs:
  build-android:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - name: Install dependencies
        run: |
          cd mobile-app
          npm install
      - name: Build
        run: |
          cd mobile-app
          npm run build
      - name: Sync Capacitor
        run: |
          cd mobile-app
          npx cap sync android
      - name: Build APK
        run: |
          cd mobile-app/android
          ./gradlew assembleDebug
      - name: Upload APK
        uses: actions/upload-artifact@v3
        with:
          name: app-debug
          path: mobile-app/android/app/build/outputs/apk/debug/app-debug.apk
```

## Resources

### Documentation
- [Capacitor Docs](https://capacitorjs.com/docs)
- [Ionic React Docs](https://ionicframework.com/docs/react)
- [Android Developer Docs](https://developer.android.com)
- [iOS Developer Docs](https://developer.apple.com)

### Tools
- [Android Studio](https://developer.android.com/studio)
- [Xcode](https://developer.apple.com/xcode)
- [Firebase Console](https://console.firebase.google.com)
- [App Store Connect](https://appstoreconnect.apple.com)
- [Google Play Console](https://play.google.com/console)

---

**Last Updated**: December 2024  
**Version**: 1.0.0
