# 🚀 Quick Start - LotoLink Mobile App

Get the mobile app running in under 5 minutes!

## Prerequisites ✅

- ✅ Node.js 18+ and npm
- ✅ For iOS: macOS with Xcode 14+
- ✅ For Android: Android Studio with SDK 33+

## Step 1: Install Dependencies

```bash
cd mobile-app
npm install
```

This will install all required packages (~2-3 minutes).

## Step 2: Start Development Server

```bash
npm run dev
```

Open your browser at **http://localhost:5173** to see the app!

## Step 3: Test on Native Devices (Optional)

### For iOS (macOS only)

```bash
# First time only - add iOS platform
npm run add:ios

# Build and sync
npm run build
npm run sync:ios

# Open in Xcode
npm run ios
```

In Xcode:
1. Select your device or simulator
2. Click ▶️ Run button
3. App launches on device!

### For Android

```bash
# First time only - add Android platform
npm run add:android

# Build and sync
npm run build
npm run sync:android

# Open in Android Studio
npm run android
```

In Android Studio:
1. Select your device or emulator
2. Click ▶️ Run button
3. App launches on device!

## Features Available

✅ **5 Complete Pages:**
- 🏠 Home - Hero, quick actions, results
- 🏆 Lotteries - Browse all lotteries
- 🎟️ Play - Select numbers and play
- 🏪 Bancas - Find lottery locations
- 👤 Profile - User settings and wallet

✅ **Native Features Ready:**
- Push Notifications (Firebase)
- Biometric Auth (Face ID / Touch ID / Fingerprint)
- Camera Access
- Geolocation
- Haptic Feedback
- Secure Storage

✅ **Premium Design:**
- Apple-inspired UI
- Glass morphism effects
- Dark mode support
- Smooth 60fps animations

## Next Steps

1. **Customize the App**
   - Edit colors in `src/theme/variables.css`
   - Modify pages in `src/pages/`
   - Add your logo to `public/assets/`

2. **Connect to Backend**
   - Configure API URL in `.env`
   - Implement authentication
   - Add API calls to services

3. **Add Native Features**
   - See `IMPLEMENTATION.md` for examples
   - Configure Firebase for push
   - Set up biometric auth

4. **Deploy**
   - Build for production: `npm run build`
   - Follow guides in `README.md`
   - Submit to App Store / Google Play

## Troubleshooting

### Port 5173 already in use
```bash
# Kill process using port
lsof -ti:5173 | xargs kill -9

# Or use different port
npm run dev -- --port 3001
```

### iOS build fails
```bash
# Clean and rebuild
cd ios/App
xcodebuild clean
cd ../..
npm run sync:ios
```

### Android build fails
```bash
# Clean Gradle cache
cd android
./gradlew clean
cd ..
npm run sync:android
```

### Dependencies issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Need Help?

- 📖 Read the full [README.md](README.md)
- 📚 Check [IMPLEMENTATION.md](IMPLEMENTATION.md)
- 🐛 Open an issue in main repository
- 💬 Ask in Ionic Forum

## What's Next?

Ready to dive deeper? Check out:
- [Full README](README.md) - Complete documentation
- [Implementation Guide](IMPLEMENTATION.md) - Detailed technical guide
- [Ionic Docs](https://ionicframework.com/docs) - Framework documentation
- [Capacitor Docs](https://capacitorjs.com/docs) - Native bridge documentation

---

**🎉 You're all set! Happy coding!**
