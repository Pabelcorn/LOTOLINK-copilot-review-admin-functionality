# App Resources

This directory contains the app icon and splash screen resources used to generate the native app assets.

## App Icon

### Requirements
- **Format**: PNG with transparency
- **Size**: 1024x1024px
- **Safe Area**: Keep important content within the center 80% (820x820px)
- **File**: `icon.png`

### Current Icon
A placeholder SVG-based icon is provided. For production, replace with your actual brand logo.

### Generation
Icons are automatically generated for all required sizes when you run:
```bash
npx @capacitor/assets generate --android android/app/src/main/res
```

## Splash Screen

### Requirements
- **Format**: PNG
- **Size**: 2732x2732px (largest iPad size)
- **Safe Area**: Keep logo in center 1024x1024px
- **Background**: Solid color (#0071e3)
- **File**: `splash.png`

### Current Splash
A placeholder splash screen with the app name is provided.

### Generation
Splash screens are automatically generated when you run:
```bash
npx @capacitor/assets generate --android android/app/src/main/res
```

## Sizes Generated

### Android Icon Sizes
- **mdpi**: 48x48px
- **hdpi**: 72x72px
- **xhdpi**: 96x96px
- **xxhdpi**: 144x144px
- **xxxhdpi**: 192x192px
- **Play Store**: 512x512px

### Android Splash Sizes
- **land-mdpi**: 320x470px
- **land-hdpi**: 480x640px
- **land-xhdpi**: 720x960px
- **land-xxhdpi**: 960x1440px
- **land-xxxhdpi**: 1280x1920px
- **port-mdpi**: 320x470px
- **port-hdpi**: 480x640px
- **port-xhdpi**: 720x960px
- **port-xxhdpi**: 960x1440px
- **port-xxxhdpi**: 1280x1920px

## Manual Generation (if needed)

If you need to generate icons and splashes manually without @capacitor/assets:

### Using ImageMagick
```bash
# Generate Android icons
convert icon.png -resize 48x48 android/app/src/main/res/mipmap-mdpi/ic_launcher.png
convert icon.png -resize 72x72 android/app/src/main/res/mipmap-hdpi/ic_launcher.png
convert icon.png -resize 96x96 android/app/src/main/res/mipmap-xhdpi/ic_launcher.png
convert icon.png -resize 144x144 android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png
convert icon.png -resize 192x192 android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png
```

## Design Guidelines

### Icon Design
- Simple and recognizable at small sizes
- High contrast
- No text (text doesn't scale well)
- Transparent background
- No drop shadows (platforms add their own)

### Splash Screen Design
- Centered logo
- Solid background color matching brand
- Minimal text
- Consider light/dark mode

## Tools

### Recommended Design Tools
- **Figma**: https://figma.com (Free, collaborative)
- **Adobe Illustrator**: Vector graphics
- **Sketch**: macOS design tool
- **Affinity Designer**: One-time purchase

### Icon Generators
- **App Icon Generator**: https://appicon.co
- **MakeAppIcon**: https://makeappicon.com
- **Icon Kitchen**: https://icon.kitchen

### Useful Resources
- **Material Icons**: https://fonts.google.com/icons
- **Font Awesome**: https://fontawesome.com
- **Noun Project**: https://thenounproject.com

## Current Placeholders

The current icon.svg and splash.png are PLACEHOLDERS and should be replaced with actual branded assets before production release.

To replace:
1. Design your icon and splash screen
2. Save as `resources/icon.png` (1024x1024) and `resources/splash.png` (2732x2732)
3. Run asset generation command
4. Build and test on real devices
