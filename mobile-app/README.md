# LotoLink Mobile App 📱

**Native iOS & Android application - Self-contained single-file app with full responsive design**

## 🚀 Overview

LotoLink Mobile is a native mobile application that brings the LOTOLINK lottery platform to iOS and Android devices. Built with a self-contained HTML application that includes complete responsive design optimized for all mobile devices.

### Architecture Highlights
- **Single-file application** - Complete app in one HTML file with inline React
- **Fully responsive** - Optimized breakpoints for all screen sizes (320px to tablets)
- **Native mobile features** - Capacitor integration for camera, geolocation, notifications
- **PWA-ready** - Works offline with service worker support
- **Safe area support** - Proper handling of notched devices (iPhone X and newer)
- **Touch-optimized** - 44x44pt minimum tap targets following Apple HIG

## ✨ Features

### Core Features
- ✅ **Native iOS and Android apps** - Single codebase, native performance
- ✅ **Apple-inspired premium design** - Glass morphism, smooth animations
- ✅ **Multiple lottery games** - Quiniela, Palé, Tripleta, and more
- ✅ **Banca locator** - Find nearest lottery locations with interactive maps
- ✅ **User profile management** - Wallet, settings, preferences
- ✅ **Dark mode support** - Automatic based on system preferences
- ✅ **Fully responsive design** - Perfect on all devices from 320px phones to tablets
- ✅ **Voice assistant** - AI-powered voice commands for playing lottery

### Native Integrations (Ready to implement)
- 🔔 **Push Notifications** - Firebase Cloud Messaging
- 🔐 **Biometric Authentication** - Face ID, Touch ID, Fingerprint
- 📸 **Camera Access** - For future features
- 📍 **Geolocation** - Find nearby bancas
- 💾 **Secure Storage** - Native credential storage
- ⚡ **Haptic Feedback** - Native touch responses
- 🔋 **Battery Optimization** - Native performance

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Capacitor** | 5.5.1 | Native Bridge |
| **React** | 17.x (CDN) | UI Library (loaded from unpkg CDN) |
| **Vite** | 5.0.6 | Build Tool |
| **Tailwind CSS** | Latest (CDN) | Styling Framework |
| **Leaflet** | 1.9.4 | Interactive Maps |
| **Chart.js** | Latest | Data Visualization |

### Architecture Notes
- The app uses a self-contained single-file architecture with all dependencies loaded from CDN
- No TypeScript compilation needed - pure HTML/CSS/JavaScript
- Vite is used only to copy the HTML file to the dist folder
- Capacitor wraps the web app into native containers for iOS and Android

### Note on Dependencies
The `package.json` includes some dependencies (like `@ionic/react`, `typescript`, etc.) that are not directly used by the single-file app. These are kept for:
- Capacitor plugin compatibility
- Potential future development tools
- Avoiding breaking changes in CI/CD workflows
- Developer tooling (linting, testing)

The runtime application doesn't require any of these - all UI dependencies are loaded from CDN.

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- iOS: macOS with Xcode 14+
- Android: Android Studio with SDK 33+

### Steps

```bash
# 1. Navigate to mobile-app directory
cd mobile-app

# 2. Install dependencies
npm install

# 3. Build the web assets
npm run build

# 4. Add native platforms (first time only)
npm run add:ios      # For iOS
npm run add:android  # For Android

# 5. Sync native projects
npm run sync
```

## 🔧 Development

### Web Development (Browser)
```bash
# Start development server
npm run dev

# Open http://localhost:5173
```

### iOS Development
```bash
# Sync changes to iOS
npm run sync:ios

# Open in Xcode
npm run ios

# Or build and run directly
npm run run:ios
```

### Android Development
```bash
# Sync changes to Android
npm run sync:android

# Open in Android Studio
npm run android

# Or build and run directly
npm run run:android
```

## 📱 Building for Production

### iOS App Store
```bash
# 1. Build production assets
npm run build

# 2. Sync to iOS
npm run sync:ios

# 3. Open Xcode
npm run ios

# 4. In Xcode:
#    - Select "Any iOS Device (arm64)"
#    - Product > Archive
#    - Upload to App Store Connect
```

### Google Play Store
```bash
# 1. Build production assets
npm run build

# 2. Sync to Android
npm run sync:android

# 3. Open Android Studio
npm run android

# 4. In Android Studio:
#    - Build > Generate Signed Bundle/APK
#    - Follow the signing wizard
#    - Upload to Google Play Console
```

## 📂 Project Structure

```
mobile-app/
├── src/
│   ├── components/       # Reusable React components
│   ├── pages/           # Page components (Home, Lotteries, etc.)
│   │   ├── Home.tsx
│   │   ├── Lotteries.tsx
│   │   ├── Bancas.tsx
│   │   ├── Profile.tsx
│   │   └── Play.tsx
│   ├── services/        # API services and utilities
│   ├── hooks/           # Custom React hooks
│   ├── theme/           # CSS theme files
│   │   ├── variables.css
│   │   └── custom.css
│   ├── types/           # TypeScript type definitions
│   ├── App.tsx          # Main app component
│   └── main.tsx         # Entry point
├── ios/                 # Native iOS project (generated)
├── android/             # Native Android project (generated)
├── public/              # Static assets
├── capacitor.config.ts  # Capacitor configuration
├── vite.config.ts       # Vite build configuration
├── tsconfig.json        # TypeScript configuration
└── package.json         # Dependencies and scripts
```

## 🎨 Design System

The app uses an **Apple-inspired premium design system** with:

### Colors
- **Primary**: #0071e3 (Apple Blue)
- **Success**: #34c759 (Apple Green)
- **Warning**: #ff9f0a (Apple Orange)
- **Danger**: #ff3b30 (Apple Red)

### Typography
- Font Family: Inter, SF Pro Display, SF Pro Text
- Optimized for readability on mobile

### Components
- **Glass Morphism Cards** - Semi-transparent with blur
- **Premium Buttons** - Rounded with gradients
- **Native Animations** - Smooth, 60fps transitions
- **Safe Area Support** - Works with notched devices

## 🔌 Native Features Implementation

### Push Notifications
```typescript
import { PushNotifications } from '@capacitor/push-notifications';

// Register for push notifications
await PushNotifications.requestPermissions();
await PushNotifications.register();
```

### Biometric Authentication
```typescript
import { NativeBiometric } from 'capacitor-native-biometric';

// Check availability
const result = await NativeBiometric.isAvailable();

// Authenticate
const verified = await NativeBiometric.verifyIdentity({
  reason: 'Para acceder a tu cuenta',
  title: 'Autenticación',
});
```

### Geolocation
```typescript
import { Geolocation } from '@capacitor/geolocation';

// Get current position
const position = await Geolocation.getCurrentPosition();
console.log('Lat:', position.coords.latitude);
console.log('Lng:', position.coords.longitude);
```

### Camera
```typescript
import { Camera, CameraResultType } from '@capacitor/camera';

// Take a photo
const image = await Camera.getPhoto({
  quality: 90,
  allowEditing: true,
  resultType: CameraResultType.Uri
});
```

## 🔗 Backend Integration

The mobile app connects to the existing LOTOLINK backend API:

```typescript
// services/api.ts example
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

## 📊 Performance Optimization

- **Code Splitting** - Lazy load pages and components
- **Image Optimization** - WebP format with fallbacks
- **Bundle Size** - Vendor chunks separated (ionic, react)
- **Caching** - Service Worker for offline support
- **Native Performance** - Hardware accelerated animations

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests (requires Appium setup)
# Coming soon

# Linting
npm run lint
```

## 🚀 Deployment Checklist

### Before Release
- [ ] Update version in package.json
- [ ] Update version in capacitor.config.ts
- [ ] Build production assets (`npm run build`)
- [ ] Test on real devices (iOS & Android)
- [ ] Generate app icons and splash screens
- [ ] Configure push notification credentials
- [ ] Set up analytics (Firebase, etc.)
- [ ] Test biometric authentication
- [ ] Test deep linking
- [ ] Verify API endpoints (production URLs)

### iOS Specific
- [ ] Update Info.plist with required permissions
- [ ] Configure App Store Connect
- [ ] Add app screenshots (all required sizes)
- [ ] Set up TestFlight beta testing
- [ ] Submit for review

### Android Specific
- [ ] Update AndroidManifest.xml permissions
- [ ] Configure Google Play Console
- [ ] Generate release signing key
- [ ] Add app screenshots (all required sizes)
- [ ] Set up internal testing track
- [ ] Submit for review

## 🔐 Security

- **HTTPS Only** - All API calls over secure connection
- **JWT Authentication** - Secure token-based auth
- **Biometric Support** - Native device security
- **Secure Storage** - Capacitor Preferences for sensitive data
- **Certificate Pinning** - Optional for production
- **Code Obfuscation** - Enabled in production builds

## 📱 Supported Devices

### iOS
- iPhone 12 and newer (iOS 15+)
- iPad (iPadOS 15+)
- iPhone SE (3rd generation)

### Android
- Android 12+ (API Level 31+)
- ARM64 and x86_64 architectures
- Minimum 2GB RAM recommended

## 🤝 Contributing

This mobile app is part of the LOTOLINK ecosystem. See main repository README for contribution guidelines.

## 📝 License

MIT License - see main repository

## 🆘 Support

- **Issues**: Open an issue in the main LOTOLINK repository
- **Documentation**: See `/docs` folder in main repository
- **Email**: support@lotolink.com

## 🎯 Roadmap

### v1.1.0 (Next Release)
- [ ] Push notifications for draw results
- [ ] Biometric login
- [ ] Offline mode with sync
- [ ] Apple Pay / Google Pay integration

### v1.2.0
- [ ] In-app ticket scanner
- [ ] Social sharing features
- [ ] Multiple language support
- [ ] Lottery result predictions

### v2.0.0
- [ ] Live streaming of draws
- [ ] Augmented Reality ticket scanner
- [ ] AI-powered number recommendations
- [ ] Gamification and rewards

---

**Built with ❤️ by the LotoLink Team**
