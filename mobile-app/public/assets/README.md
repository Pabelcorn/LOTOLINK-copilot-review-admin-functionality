# LotoLink Mobile App Assets

This directory contains all the assets needed for the mobile application.

## Required Assets

### Icons
- `icon.png` - App icon (1024x1024px, PNG)
- `favicon.png` - Web favicon (32x32px, PNG)

### Splash Screens
Place splash screen images in the `splash/` directory:
- `splash-2048x2732.png` - iPad Pro 12.9"
- `splash-1668x2224.png` - iPad Pro 11"
- `splash-1536x2048.png` - iPad 10.2"
- `splash-1242x2688.png` - iPhone Pro Max
- `splash-1125x2436.png` - iPhone X/XS/11 Pro
- `splash-828x1792.png` - iPhone XR/11
- `splash-750x1334.png` - iPhone 8
- `splash-640x1136.png` - iPhone SE

## Generating Assets

### Option 1: Using Capacitor Assets Generator
```bash
npm install -g @capacitor/assets

# Place your source icon (1024x1024) and splash (2732x2732) in assets/
capacitor-assets generate --iconBackgroundColor '#0071e3' --splashBackgroundColor '#0071e3'
```

### Option 2: Manual Creation
1. Create your app icon in 1024x1024px
2. Use online tools like [App Icon Generator](https://appicon.co/)
3. Download and place files in respective directories

## Design Guidelines

### App Icon
- Size: 1024x1024px
- Format: PNG with transparency
- Style: Rounded corners will be added automatically by iOS/Android
- Content: Keep important elements in the safe area (center 80%)
- Background: Use solid color or gradient

### Splash Screen
- Size: 2732x2732px (largest needed)
- Format: PNG
- Background: #0071e3 (LotoLink primary blue)
- Logo: Centered, high contrast
- Style: Minimal, clean design

### Colors
Use LotoLink brand colors:
- Primary: #0071e3
- Success: #34c759
- White: #ffffff

## Current Status
📝 Placeholder files - to be replaced with actual brand assets

## Notes
- All assets should be optimized for mobile (compressed, but high quality)
- Test icons on both light and dark backgrounds
- Verify splash screens on different device sizes
