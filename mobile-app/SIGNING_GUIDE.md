# Mobile App Signing Guide

This guide explains how to configure app signing for production releases of the LotoLink mobile app.

## Overview

App signing is required for:
- **Android**: Publishing to Google Play Store or distributing release builds
- **iOS**: Testing on physical devices and publishing to App Store

## Android Signing

### 1. Generate a Release Keystore (First Time Only)

```bash
# Navigate to mobile-app/android directory
cd mobile-app/android

# Generate keystore (keep this file secure!)
keytool -genkey -v -keystore lotolink-release-key.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias lotolink-release
```

You'll be prompted for:
- Keystore password (save this securely!)
- Key password (save this securely!)
- Your name, organization, city, state, country

**IMPORTANT**: 
- Store the keystore file securely (NOT in git)
- Save passwords in a secure password manager
- If you lose the keystore, you cannot update your app on Play Store

### 2. Configure Gradle for Signing

Create a file `mobile-app/android/keystore.properties` (NOT tracked in git):

```properties
storePassword=YOUR_KEYSTORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=lotolink-release
storeFile=../lotolink-release-key.jks
```

### 3. Update build.gradle

Update `mobile-app/android/app/build.gradle`:

```gradle
// Add before android block
def keystorePropertiesFile = rootProject.file("keystore.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    // ... existing config ...
    
    signingConfigs {
        release {
            if (keystorePropertiesFile.exists()) {
                keyAlias keystoreProperties['keyAlias']
                keyPassword keystoreProperties['keyPassword']
                storeFile file(keystoreProperties['storeFile'])
                storePassword keystoreProperties['storePassword']
            }
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

### 4. Build Signed Release

```bash
cd mobile-app/android
./gradlew bundleRelease
# Output: app/build/outputs/bundle/release/app-release.aab
```

### 5. GitHub Actions Setup (Optional)

To build signed releases in CI/CD:

1. Encode your keystore to base64:
```bash
base64 -i lotolink-release-key.jks -o keystore.base64.txt
```

2. Add GitHub Secrets:
   - `ANDROID_KEYSTORE_BASE64`: Content of keystore.base64.txt
   - `ANDROID_KEYSTORE_PASSWORD`: Your keystore password
   - `ANDROID_KEY_PASSWORD`: Your key password
   - `ANDROID_KEY_ALIAS`: lotolink-release

3. Update workflow to decode and use keystore before building.

## iOS Signing

### 1. Apple Developer Account

You need:
- Apple Developer Account ($99/year)
- Enrolled in Apple Developer Program

### 2. Configure in Xcode

1. Open the project:
```bash
cd mobile-app
npx cap open ios
```

2. In Xcode:
   - Select the project in the navigator
   - Select the App target
   - Go to "Signing & Capabilities" tab
   - Check "Automatically manage signing"
   - Select your Team (Apple Developer account)

3. Xcode will automatically:
   - Create a development certificate
   - Create and install provisioning profiles
   - Register your device (for testing)

### 3. Build for Testing on Device

```bash
# Build and run on connected device
cd mobile-app
npx cap run ios --target=device
```

### 4. Archive for App Store

1. In Xcode:
   - Select "Any iOS Device" as target
   - Menu: Product > Archive
   - Wait for archive to complete

2. In Organizer (appears after archive):
   - Click "Distribute App"
   - Select "App Store Connect"
   - Follow the wizard

### 5. Certificate Types

- **Development**: For testing on your devices
- **Distribution**: For App Store submission
- **Ad Hoc**: For distributing to specific devices (beta testing)

## Security Best Practices

### For Android:

1. **Never commit keystore files to git**
   - Add to .gitignore:
     ```
     *.jks
     *.keystore
     keystore.properties
     ```

2. **Backup your keystore securely**
   - Store in encrypted backup
   - Keep multiple copies in different secure locations

3. **Use environment variables in CI/CD**
   - Never hardcode passwords in workflows
   - Use GitHub Secrets or similar secure storage

### For iOS:

1. **Use Keychain for certificates**
   - macOS Keychain stores certificates securely
   - Export as .p12 for backup (with strong password)

2. **Backup provisioning profiles**
   - Download from Apple Developer Portal
   - Store securely

3. **Rotate certificates before expiry**
   - Certificates expire after 1 year
   - Set reminders to renew

## Play Store Upload

### 1. Prepare AAB

Ensure you have a signed release AAB:
```bash
cd mobile-app/android
./gradlew bundleRelease
```

### 2. Google Play Console

1. Go to [Google Play Console](https://play.google.com/console)
2. Create a new app or select existing
3. Navigate to "Release" > "Production"
4. Click "Create new release"
5. Upload your AAB file
6. Fill in release details
7. Review and publish

### 3. First-Time Setup

For first upload:
- Set up app content rating
- Complete privacy policy
- Add screenshots and descriptions
- Set pricing and distribution

## App Store Upload

### 1. App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Create new app or select existing
3. Fill in app information:
   - Name, subtitle, description
   - Screenshots for all device sizes
   - Privacy policy URL
   - Category and age rating

### 2. Upload Build

From Xcode Organizer:
1. Select your archive
2. Click "Distribute App"
3. Choose "App Store Connect"
4. Select distribution options
5. Upload

### 3. Submit for Review

1. In App Store Connect, select your build
2. Fill in "What's New in This Version"
3. Complete all required information
4. Click "Submit for Review"
5. Wait for Apple's review (typically 1-3 days)

## Troubleshooting

### Android Issues

**Build fails with "keystore not found"**
- Check storeFile path in keystore.properties
- Ensure path is relative to android directory

**"wrong password"**
- Verify keyPassword and storePassword
- Check for extra spaces in properties file

### iOS Issues

**"No signing certificate found"**
- Open Xcode Preferences > Accounts
- Click "Download Manual Profiles"
- Or use "Automatically manage signing"

**"No devices registered"**
- Connect your device
- Window > Devices and Simulators
- Click "+" to add device

**Archive option grayed out**
- Select "Any iOS Device" (not simulator)
- Ensure scheme is set to Release

## Resources

### Android
- [Android App Signing](https://developer.android.com/studio/publish/app-signing)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer)

### iOS
- [Apple Developer Portal](https://developer.apple.com)
- [App Store Connect Help](https://help.apple.com/app-store-connect/)
- [iOS Code Signing Guide](https://developer.apple.com/support/code-signing/)

## Support

For issues with signing:
1. Check logs for specific error messages
2. Consult platform documentation
3. Check Stack Overflow for similar issues
4. Contact repository maintainers

---

**Remember**: Keep your signing credentials secure and backed up. Loss of signing keys means you cannot update your published app!
