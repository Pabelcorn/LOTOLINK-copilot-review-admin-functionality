# 🚀 Quick Start Guide - LotoLink Desktop

Get up and running with LotoLink Desktop in minutes!

## Prerequisites

Before you begin, ensure you have:
- **Node.js 18.x or higher** - [Download here](https://nodejs.org/)
- **npm 9.x or higher** (comes with Node.js)

Check your versions:
```bash
node --version  # Should show v18.x.x or higher
npm --version   # Should show 9.x.x or higher
```

---

## 🎯 For End Users (Just Want to Use the App)

### Option 1: Download Pre-built Installer (Recommended)

**Coming soon!** Check the [Releases page](https://github.com/Pabelcorn/LOTOLINK/releases) for:
- **Windows**: `LotoLink-Setup-1.0.0.exe`
- **macOS**: `LotoLink-1.0.0.dmg`
- **Linux**: `LotoLink-1.0.0.AppImage`

### Option 2: Build from Source

1. **Clone the repository**
   ```bash
   git clone https://github.com/Pabelcorn/LOTOLINK.git
   cd LOTOLINK/desktop-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the app**
   ```bash
   npm start
   ```

That's it! The app should launch automatically.

---

## 💻 For Developers (Want to Modify or Build)

### Step 1: Setup

Clone and navigate to the desktop app:
```bash
git clone https://github.com/Pabelcorn/LOTOLINK.git
cd LOTOLINK/desktop-app
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install:
- Electron framework
- electron-builder (for creating installers)
- All required dependencies

### Step 3: Development

Run in development mode with live reload:
```bash
npm start
```

Or with environment variable:
```bash
NODE_ENV=development npm start
```

**Development features:**
- DevTools automatically open
- Console logs visible
- Hot reload (if configured)

### Step 4: Building

#### Build for Your Platform
```bash
npm run build
```

This creates an installer for your current platform in `dist/` folder.

#### Build for Specific Platforms

**Windows:**
```bash
npm run build:win
```
Creates:
- `LotoLink-Setup-1.0.0.exe` (NSIS installer)

**macOS:**
```bash
npm run build:mac
```
Creates:
- `LotoLink-1.0.0.dmg` (Disk image)
- `LotoLink-1.0.0-mac.zip` (ZIP archive)

**Linux:**
```bash
npm run build:linux
```
Creates:
- `LotoLink-1.0.0.AppImage` (Universal Linux app)
- `lotolink-desktop_1.0.0_amd64.deb` (Debian/Ubuntu)
- `lotolink-desktop-1.0.0.x86_64.rpm` (Fedora/RedHat)

#### Build for All Platforms
```bash
npm run build:all
```

**Note:** Building for macOS requires a Mac. Cross-platform builds for Windows from Mac/Linux require Wine.

### Step 5: Test Your Build

After building, find the installer in the `dist/` folder:
```bash
cd dist
ls -lh
```

Install and test the application to ensure everything works correctly.

---

## 🎨 Customization

### Change Window Size
Edit `main.js`:
```javascript
mainWindow = new BrowserWindow({
  width: 1400,  // Your width
  height: 900,  // Your height
  // ...
});
```

### Modify UI
Edit `index.html`:
- All HTML structure
- CSS styles
- JavaScript logic

### Change App Icon
Replace `lotolink-logo.png` with your icon:
- Recommended size: 512x512px
- Format: PNG with transparency
- Square aspect ratio

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `F11` | Toggle fullscreen |
| `Ctrl/Cmd + W` | Close window |
| `Ctrl/Cmd + M` | Minimize |
| `Ctrl/Cmd + Q` | Quit (macOS) |
| `Alt + F4` | Quit (Windows/Linux) |
| `Ctrl/Cmd + Shift + I` | Toggle DevTools |

---

## 🐛 Troubleshooting

### "npm: command not found"
**Solution:** Install Node.js from [nodejs.org](https://nodejs.org/)

### "electron: command not found" when building
**Solution:** Run `npm install` first to install dependencies

### White/Blank screen on startup
**Solution:**
1. Open DevTools: `Ctrl/Cmd + Shift + I`
2. Check Console for errors
3. Verify `index.html` exists in the folder
4. Check file paths in `main.js`

### Build fails on macOS
**Solution:**
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build:mac
```

### Permission denied on Linux
**Solution:**
```bash
# Make build script executable
chmod +x build.sh

# Or run with npm
npm run build:linux
```

### Glass effect not visible
**Requirements:**
- **Windows:** Windows 10+ with transparency enabled in Settings
- **macOS:** macOS 10.13+ (High Sierra or later)
- **Linux:** Compositor enabled (Compiz, KWin, Mutter)

**Check:**
```bash
# Linux: Check if compositor is running
ps aux | grep -i compositor
```

---

## 📁 Project Structure

```
desktop-app/
├── main.js              # Electron main process
├── preload.js           # Secure IPC bridge
├── index.html           # App UI
├── package.json         # Dependencies & config
├── lotolink-logo.png    # App icon
├── build.sh            # Build script
├── README.md            # Full documentation
├── DESIGN.md            # Design specifications
└── QUICKSTART.md        # This file
```

---

## 🔍 What to Edit

### For UI Changes
**File:** `index.html`
- All HTML markup
- All CSS styles
- All JavaScript logic

### For Window Behavior
**File:** `main.js`
- Window size/position
- Frame/frameless toggle
- Platform-specific settings
- IPC event handlers

### For Security Settings
**File:** `preload.js`
- IPC method exposure
- Security boundaries

### For Build Settings
**File:** `package.json`
- App name, version
- Build configuration
- File inclusions
- Platform targets

---

## 📚 Next Steps

1. **Read full documentation:** `README.md`
2. **Study design system:** `DESIGN.md`
3. **Explore the code:** Start with `main.js` → `index.html`
4. **Make modifications:** Test with `npm start`
5. **Build installer:** Use `npm run build`

---

## 💡 Tips

### Development Tips
- Use `console.log()` to debug (visible in DevTools)
- Changes to `index.html` require app restart
- Changes to `main.js` require app restart
- Use `npm start` for rapid testing

### Building Tips
- Always test your build before distribution
- Include all assets (images, fonts, etc.)
- Test on the target platform if possible
- Create checksums for download verification

### Distribution Tips
- Host installers on GitHub Releases
- Provide installation instructions
- Include system requirements
- Offer support channels

---

## 🎯 Common Tasks

### Add a new dependency
```bash
npm install <package-name>
```

### Update Electron
```bash
npm update electron
```

### Clear build cache
```bash
rm -rf dist
npm run build
```

### Create production build
```bash
npm run build
```

### Package without building installer
```bash
npm run pack
```

---

## 🆘 Need Help?

- **Documentation:** See `README.md` for detailed info
- **Issues:** [GitHub Issues](https://github.com/Pabelcorn/LOTOLINK/issues)
- **Electron Docs:** [electronjs.org/docs](https://www.electronjs.org/docs)
- **Community:** [Electron Discord](https://discord.gg/electron)

---

## ✅ Checklist for First Run

- [ ] Node.js 18+ installed
- [ ] npm 9+ installed
- [ ] Cloned repository
- [ ] In `desktop-app` directory
- [ ] Ran `npm install`
- [ ] Ran `npm start`
- [ ] App launched successfully
- [ ] UI looks correct
- [ ] Window controls work
- [ ] Ready to customize!

---

**Happy coding! 🚀**

*LotoLink Desktop - Built with Electron*
