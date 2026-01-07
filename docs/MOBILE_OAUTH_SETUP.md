# Mobile OAuth Setup Guide - LOTOLINK

## Overview

This guide provides step-by-step instructions for implementing Google and Apple OAuth authentication in the LOTOLINK mobile app (Ionic/Capacitor).

## Prerequisites

- Ionic/Capacitor mobile app (already set up)
- Google Cloud Console account
- Apple Developer account
- Backend API running with OAuth endpoints

## Installation

### 1. Install Required Capacitor Plugins

```bash
cd mobile-app

# Install Google Auth plugin
npm install @codetrix-studio/capacitor-google-auth

# Install Apple Sign-In plugin
npm install @capacitor-community/apple-sign-in

# Sync with native projects
npx cap sync
```

### 2. Configure Google OAuth

#### 2.1 Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable "Google+ API"
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Create three client IDs:
   - **Web Client ID** (for backend verification)
   - **iOS Client ID** (for iOS app)
   - **Android Client ID** (for Android app)

#### 2.2 Configure capacitor.config.ts

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lotolink.mobile',
  appName: 'LotoLink',
  webDir: 'dist',
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    },
  },
};

export default config;
```

#### 2.3 iOS Configuration

Add to `ios/App/App/Info.plist`:

```xml
<key>GIDClientID</key>
<string>YOUR_IOS_CLIENT_ID.apps.googleusercontent.com</string>
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>com.googleusercontent.apps.YOUR_REVERSED_CLIENT_ID</string>
    </array>
  </dict>
</array>
```

#### 2.4 Android Configuration

Add to `android/app/src/main/res/values/strings.xml`:

```xml
<resources>
    <string name="app_name">LotoLink</string>
    <string name="server_client_id">YOUR_WEB_CLIENT_ID.apps.googleusercontent.com</string>
</resources>
```

### 3. Configure Apple Sign-In

#### 3.1 Apple Developer Console Setup

1. Go to [Apple Developer](https://developer.apple.com)
2. Register an App ID with "Sign In with Apple" capability
3. Create a Service ID for web authentication
4. Configure redirect URLs
5. Create a private key for Sign In with Apple

#### 3.2 iOS Configuration

Add to `ios/App/App/App.entitlements`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.developer.applesignin</key>
    <array>
        <string>Default</string>
    </array>
</dict>
</plist>
```

Add capability in Xcode:
1. Open `ios/App/App.xcworkspace` in Xcode
2. Select your app target
3. Go to "Signing & Capabilities"
4. Click "+ Capability"
5. Add "Sign In with Apple"

## Implementation

### 1. Update AuthScreen.tsx

Replace the placeholder OAuth handlers with actual implementation:

```typescript
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { SignInWithApple, SignInWithAppleResponse } from '@capacitor-community/apple-sign-in';
import { Capacitor } from '@capacitor/core';
import { authenticateWithGoogle, authenticateWithApple } from '../../services/auth.service';

const AuthScreen: React.FC = () => {
  // ... existing code ...

  const handleGoogleAuth = async () => {
    try {
      setLoading(true);
      
      // Initialize Google Auth on web platform
      if (Capacitor.getPlatform() === 'web') {
        await GoogleAuth.initialize({
          clientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
          scopes: ['profile', 'email'],
          grantOfflineAccess: true,
        });
      }
      
      // Sign in with Google
      const googleUser = await GoogleAuth.signIn();
      
      // Send ID token to backend
      const response = await authenticateWithGoogle(googleUser.authentication.idToken);
      
      // Check if age verification is needed
      if (!response.user.ageVerified) {
        history.push('/auth/age-verification', { userId: response.user.id });
      } else {
        history.push('/home');
      }
    } catch (error: any) {
      console.error('Google auth error:', error);
      
      if (error.message && error.message.includes('popup_closed_by_user')) {
        // User cancelled, no error message needed
        return;
      }
      
      alert('Error al iniciar sesión con Google. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleAppleAuth = async () => {
    try {
      setLoading(true);
      
      // Apple Sign-In is only available on iOS and web
      if (!['ios', 'web'].includes(Capacitor.getPlatform())) {
        alert('Apple Sign-In solo está disponible en iOS');
        return;
      }
      
      // Check if Apple Sign-In is available
      const available = await SignInWithApple.isAvailable();
      if (!available.isAvailable) {
        alert('Apple Sign-In no está disponible en este dispositivo');
        return;
      }
      
      // Authorize with Apple
      const result: SignInWithAppleResponse = await SignInWithApple.authorize({
        clientId: 'com.lotolink.mobile', // Your Service ID
        redirectURI: 'https://yourdomain.com/auth/apple/callback',
        scopes: 'email name',
        state: '12345',
        nonce: 'nonce',
      });
      
      // Send identity token to backend
      const response = await authenticateWithApple(
        result.response.identityToken,
        result.response.authorizationCode,
        result.response.user ? JSON.stringify(result.response.user) : undefined
      );
      
      // Check if age verification is needed
      if (!response.user.ageVerified) {
        history.push('/auth/age-verification', { userId: response.user.id });
      } else {
        history.push('/home');
      }
    } catch (error: any) {
      console.error('Apple auth error:', error);
      
      if (error.code === '1001') {
        // User cancelled, no error message needed
        return;
      }
      
      alert('Error al iniciar sesión con Apple. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // ... rest of component ...
};
```

### 2. Update App.tsx

Initialize Google Auth when app starts:

```typescript
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

const App: React.FC = () => {
  useEffect(() => {
    // Initialize Google Auth on web
    if (Capacitor.getPlatform() === 'web') {
      GoogleAuth.initialize({
        clientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
        scopes: ['profile', 'email'],
        grantOfflineAccess: true,
      });
    }
  }, []);

  // ... rest of app ...
};
```

### 3. Handle Age Verification

After successful OAuth authentication, redirect to age verification if needed:

```typescript
// In AgeVerificationScreen.tsx
const handleAgeVerification = async () => {
  try {
    setLoading(true);
    
    const birthDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    
    await verifyAge(userId, birthDate, acceptTerms, acceptPrivacy);
    
    // Navigate to home after successful verification
    history.push('/home');
  } catch (error: any) {
    setError(error.response?.data?.message || 'Debes tener 18 años o más');
  } finally {
    setLoading(false);
  }
};
```

## Testing

### Test on iOS Simulator

```bash
npx cap run ios
```

### Test on Android Emulator

```bash
npx cap run android
```

### Test on Device

1. Build the app:
   ```bash
   npm run build
   npx cap sync
   ```

2. Open in Xcode (iOS) or Android Studio (Android)
3. Run on connected device

### Test OAuth Flows

1. **Google Sign-In:**
   - Tap "Continuar con Google"
   - Select Google account
   - Verify successful login
   - Check if age verification appears (if not yet verified)

2. **Apple Sign-In:**
   - Tap "Continuar con Apple"
   - Use Face ID/Touch ID or password
   - Verify successful login
   - Check if age verification appears (if not yet verified)

3. **Guest Mode:**
   - Tap "Explorar sin registrarme"
   - Navigate app
   - Try to save ticket → should prompt for registration

4. **Admin Access:**
   - On login screen, enter "LOT20041227" as phone
   - Admin modal should appear
   - Enter credentials
   - Should redirect to admin panel

## Troubleshooting

### Google Auth Errors

**Error: "Developer Error"**
- Check that Web Client ID in capacitor.config.ts matches Google Console
- Verify SHA-1 certificate fingerprint is added for Android

**Error: "popup_closed_by_user"**
- User cancelled authentication, this is normal

**Error: "idpiframe_initialization_failed"**
- Check that cookies are enabled
- Clear browser cache

### Apple Sign-In Errors

**Error: "1000" (Unknown)**
- Check App ID has Sign In with Apple capability
- Verify Service ID is properly configured

**Error: "1001" (Cancelled)**
- User cancelled authentication, this is normal

**Not Available on Android**
- Apple Sign-In is only available on iOS and web
- Hide Apple button on Android or show explanatory message

### General Tips

1. **Test on Real Devices:** OAuth may not work properly in all simulators
2. **Check Backend:** Ensure backend OAuth endpoints are running and configured
3. **Verify Client IDs:** Double-check all client IDs match between console and config
4. **Enable Logging:** Add console.log statements to debug OAuth flow
5. **Check Network:** OAuth requires internet connection

## Environment Variables

Create `.env.development` and `.env.production`:

```bash
# Google OAuth
VITE_GOOGLE_WEB_CLIENT_ID=your_web_client_id.apps.googleusercontent.com
VITE_GOOGLE_IOS_CLIENT_ID=your_ios_client_id.apps.googleusercontent.com
VITE_GOOGLE_ANDROID_CLIENT_ID=your_android_client_id.apps.googleusercontent.com

# Apple Sign-In
VITE_APPLE_SERVICE_ID=com.lotolink.mobile
VITE_APPLE_REDIRECT_URI=https://yourdomain.com/auth/apple/callback

# API
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

## Security Checklist

- [ ] Client IDs properly configured for each platform
- [ ] Redirect URIs match configured values
- [ ] Backend properly verifies OAuth tokens
- [ ] Age verification enforced after OAuth
- [ ] Guest mode restrictions enforced
- [ ] Error messages don't leak sensitive info
- [ ] OAuth tokens never stored in plain text
- [ ] HTTPS used in production
- [ ] Rate limiting enabled on backend

## Additional Resources

- [Google Sign-In for iOS](https://developers.google.com/identity/sign-in/ios)
- [Google Sign-In for Android](https://developers.google.com/identity/sign-in/android)
- [Apple Sign-In Documentation](https://developer.apple.com/sign-in-with-apple/)
- [Capacitor Google Auth Plugin](https://github.com/CodetrixStudio/CapacitorGoogleAuth)
- [Capacitor Apple Sign-In Plugin](https://github.com/capacitor-community/apple-sign-in)

## Support

For issues or questions:
- Check [AUTHENTICATION_GUIDE.md](../AUTHENTICATION_GUIDE.md)
- Review [AUTH_INTEGRATION.md](../AUTH_INTEGRATION.md)
- Submit [GitHub issue](https://github.com/Pabelcorn/LOTOLINK/issues)
