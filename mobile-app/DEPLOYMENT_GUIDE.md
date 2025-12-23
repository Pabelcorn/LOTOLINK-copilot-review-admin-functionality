# Mobile App Deployment Guide

Complete deployment guide for releasing the LotoLink mobile app to production.

## Pre-Deployment Checklist

### Code Quality
- [ ] All features implemented and tested
- [ ] No console.log statements in production code
- [ ] All TODO comments resolved
- [ ] Code reviewed and approved
- [ ] Tests passing (unit + E2E)
- [ ] No security vulnerabilities (run `npm audit`)
- [ ] Performance optimized
- [ ] Memory leaks checked

### Configuration
- [ ] Production API URL configured
- [ ] Firebase project set up (production)
- [ ] Push notification credentials configured
- [ ] Analytics configured (Firebase, etc.)
- [ ] Error tracking configured (Sentry, etc.)
- [ ] Environment variables set correctly

### Assets
- [ ] App icon generated (1024x1024)
- [ ] Splash screens generated (all sizes)
- [ ] Screenshots prepared (all required sizes)
- [ ] Feature graphic created (Android)
- [ ] Promotional materials ready

### Legal & Compliance
- [ ] Privacy policy created and hosted
- [ ] Terms of service created and hosted
- [ ] Age rating determined
- [ ] Content rating questionnaire completed
- [ ] GDPR compliance verified (if applicable)
- [ ] App permissions documented and justified

### Testing
- [ ] Tested on real iOS devices
- [ ] Tested on real Android devices
- [ ] Tested on various screen sizes
- [ ] Tested offline functionality
- [ ] Tested push notifications
- [ ] Tested biometric authentication
- [ ] Tested in-app purchases (if applicable)
- [ ] Beta testing completed
- [ ] User feedback incorporated

## Version Management

### Semantic Versioning
Follow semantic versioning: `MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes
- **MINOR**: New features (backwards compatible)
- **PATCH**: Bug fixes

Example: `1.0.0` → `1.1.0` (new features) → `1.1.1` (bug fix)

### Files to Update

1. **package.json**
   ```json
   {
     "version": "1.0.0"
   }
   ```

2. **capacitor.config.ts**
   ```typescript
   const config: CapacitorConfig = {
     appId: 'com.lotolink.app',
     appName: 'LotoLink',
     // version is managed in native projects
   };
   ```

3. **Android**: `android/app/build.gradle`
   ```gradle
   android {
       defaultConfig {
           versionCode 1        // Integer, increment each release
           versionName "1.0.0"  // String, semantic version
       }
   }
   ```

4. **iOS**: `ios/App/App/Info.plist`
   ```xml
   <key>CFBundleShortVersionString</key>
   <string>1.0.0</string>  <!-- User-facing version -->
   <key>CFBundleVersion</key>
   <string>1</string>       <!-- Build number, increment each upload -->
   ```

## Android Deployment

### Initial Setup (First Time Only)

1. **Create Google Play Developer Account**
   - Go to https://play.google.com/console
   - Pay $25 one-time registration fee
   - Complete account verification

2. **Create App in Console**
   - Click "Create app"
   - Fill in basic details:
     - App name: LotoLink
     - Default language: Spanish
     - App or game: App
     - Free or paid: Free (or Paid)
   - Accept declarations

3. **Complete Store Listing**

   Navigate to `Store presence > Main store listing`:

   **App details**
   - Short description (80 chars)
   - Full description (4000 chars)
   - Screenshots (required):
     - Phone: Minimum 2, maximum 8 (16:9 or 9:16)
     - 7-inch tablet: Minimum 1 (optional but recommended)
     - 10-inch tablet: Minimum 1 (optional but recommended)
   - Feature graphic: 1024 x 500 (required)
   - App icon: 512 x 512 (high-res icon)

   **Categorization**
   - App category: Games > Casino (or Entertainment)
   - Tags: Add relevant keywords

   **Contact details**
   - Email: support@lotolink.com
   - Phone: (optional)
   - Website: https://lotolink.com

   **Privacy policy**
   - URL: https://lotolink.com/privacy

4. **Content Rating**
   - Navigate to `Policy > App content > Content rating`
   - Fill out IARC questionnaire
   - Submit for rating

5. **Target Audience**
   - Navigate to `Policy > App content > Target audience`
   - Select appropriate age groups
   - Answer questions about appeal to children

6. **App Access**
   - Specify if app has restricted features
   - Provide test credentials if needed

7. **Ads**
   - Declare if app contains ads

8. **Data Safety**
   - Declare data collection and usage
   - Specify security practices

### Release Process

1. **Build Release AAB**
   ```bash
   cd mobile-app
   npm run build
   npx cap sync android
   cd android
   ./gradlew bundleRelease
   ```

2. **Upload to Play Console**
   - Navigate to `Release > Production`
   - Click `Create new release`
   - Upload AAB: `android/app/build/outputs/bundle/release/app-release.aab`
   - Enter release notes
   - Review and rollout

3. **Release Tracks**

   **Internal Testing**
   - Fast, no review required
   - Test with up to 100 testers
   - Updates available in minutes

   **Closed Testing**
   - Test with specific testers
   - No review required
   - Good for beta testing

   **Open Testing**
   - Public beta
   - Requires review (faster than production)
   - Anyone can join

   **Production**
   - Public release
   - Requires full review (2-3 days)
   - Staged rollout recommended

4. **Staged Rollout** (Recommended)
   - Start with 5% of users
   - Monitor crash reports and ratings
   - Increase to 10% → 20% → 50% → 100%
   - Halt rollout if issues detected

### Update Process

1. **Increment Version**
   - Update `versionCode` (must be higher than previous)
   - Update `versionName` (e.g., 1.0.0 → 1.1.0)

2. **Build and Upload**
   - Same as initial release process
   - Add "What's new" notes

3. **Review Timeline**
   - Initial review: 2-7 days
   - Updates: 1-3 days typically

## iOS Deployment

### Initial Setup (First Time Only)

1. **Create Apple Developer Account**
   - Go to https://developer.apple.com
   - Enroll ($99/year)
   - Complete identity verification

2. **Create App in App Store Connect**
   - Go to https://appstoreconnect.apple.com
   - Click "+" to create new app
   - Fill in details:
     - Platform: iOS
     - Name: LotoLink
     - Primary language: Spanish
     - Bundle ID: com.lotolink.app
     - SKU: com.lotolink.app.ios
     - User access: Full access

3. **Complete App Information**

   **General**
   - App name: LotoLink
   - Subtitle: Juega loterías dominicanas
   - Category: Entertainment (or Games)
   - Content rights: Own or licensed

   **Pricing and Availability**
   - Price: Free (or set price)
   - Availability: All countries
   - Pre-order: No

   **App Privacy**
   - Privacy policy URL: https://lotolink.com/privacy
   - Data collection: Fill out questionnaire

   **Age Rating**
   - Complete questionnaire
   - Based on content

4. **Prepare for Submission**

   **Screenshots** (Required sizes):
   - 6.7" Display (iPhone 15 Pro Max): 1290 x 2796
   - 6.5" Display (iPhone 14 Plus): 1284 x 2778
   - 5.5" Display (iPhone 8 Plus): 1242 x 2208
   - iPad Pro 12.9": 2048 x 2732
   - Minimum 3, maximum 10 per size

   **App Preview Video** (Optional but recommended):
   - 30 seconds max
   - Same sizes as screenshots

### Release Process

1. **Configure Xcode**
   ```bash
   cd mobile-app
   npm run build
   npx cap sync ios
   npx cap open ios
   ```

2. **Update Version and Build Number**
   - In Xcode, select project > App target > General
   - Version: 1.0.0 (user-facing)
   - Build: 1 (increment for each upload)

3. **Configure Signing**
   - Select `Signing & Capabilities` tab
   - Ensure provisioning profile is valid
   - Select team from dropdown

4. **Archive for Release**
   - Select "Any iOS Device (arm64)" in toolbar
   - Menu: `Product > Archive`
   - Wait for archiving to complete

5. **Upload to App Store**
   - Archives window opens
   - Select archive > `Distribute App`
   - Select `App Store Connect`
   - Options:
     - Include bitcode: No (deprecated)
     - Upload symbols: Yes
     - Manage version: Automatically
   - Click `Upload`
   - Wait for processing (10-30 minutes)

6. **Submit for Review**
   - Go to App Store Connect
   - Select your app
   - Navigate to version
   - Add build (uploaded binary)
   - Complete remaining information:
     - Screenshots
     - Description
     - Keywords
     - Support URL
     - Marketing URL (optional)
   - Click `Submit for Review`

7. **TestFlight** (Optional Beta Testing)
   - After upload, build appears in TestFlight
   - Add internal testers (Apple Developer team)
   - Add external testers (up to 10,000)
   - Testers install TestFlight app
   - Send invites via email
   - Collect feedback

### Update Process

1. **Increment Version/Build**
   - Version: 1.0.0 → 1.1.0 (for new features)
   - Build: Always increment (e.g., 1 → 2)

2. **Archive and Upload**
   - Same process as initial release

3. **Submit Update**
   - Add "What's New" notes (4000 chars max)
   - Submit for review

4. **Review Timeline**
   - Initial review: 24-48 hours typically
   - Can be up to 7 days
   - Expedited review available for urgent fixes

### App Review Guidelines

**Common Rejection Reasons**:
- Incomplete information
- Broken links
- Missing privacy policy
- Crashes or bugs
- Misleading content
- Inappropriate content
- Use of private APIs

**Best Practices**:
- Test thoroughly before submission
- Provide clear app description
- Include demo account if app requires login
- Respond to reviewer questions quickly
- Follow Human Interface Guidelines

## Post-Deployment

### Monitoring

1. **Crash Reports**
   - Android: Google Play Console > Quality > Android vitals
   - iOS: App Store Connect > TestFlight > Crashes

2. **User Reviews**
   - Monitor daily
   - Respond to negative reviews
   - Thank users for positive reviews
   - Address issues in updates

3. **Analytics**
   - Daily active users (DAU)
   - Monthly active users (MAU)
   - Retention rates (D1, D7, D30)
   - Session length
   - Feature usage

4. **Performance**
   - App startup time
   - API response times
   - Battery usage
   - Memory usage
   - Network usage

### Hotfix Process

1. **Identify Critical Bug**
2. **Fix in Code**
3. **Increment Patch Version** (e.g., 1.0.0 → 1.0.1)
4. **Build and Test**
5. **Submit for Expedited Review** (iOS)
6. **Release to Production**

### Marketing

1. **App Store Optimization (ASO)**
   - Keywords in title and description
   - High-quality screenshots
   - Positive reviews
   - Regular updates

2. **Promotion**
   - Social media announcement
   - Email to existing users
   - Press release
   - App review sites
   - Paid advertising (optional)

3. **User Engagement**
   - Push notifications (don't spam!)
   - In-app messages
   - Email campaigns
   - Feature announcements

## Rollback Plan

### Android
- Play Console allows staged rollout
- Can halt rollout if issues detected
- Can rollback to previous version
- Takes effect within hours

### iOS
- Cannot rollback in App Store
- Can only remove from sale
- Must submit new version to fix
- Can expedite review for critical fixes

**Prevention**:
- Always test thoroughly
- Use staged rollout (Android)
- Beta test via TestFlight (iOS)
- Monitor crash reports closely

## Support

### User Support Channels
- Email: support@lotolink.com
- In-app support
- FAQ page
- Social media

### Developer Support
- Google Play Console help
- Apple Developer forums
- Stack Overflow
- Community forums

---

**Version**: 1.0.0  
**Last Updated**: December 2024
