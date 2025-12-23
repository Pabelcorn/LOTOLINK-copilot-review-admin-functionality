# LotoLink Desktop Application

Professional desktop application for Windows, macOS, and Linux with glass morphism design and rounded borders.

## ✨ Features

- **Cross-platform**: Runs on Windows, macOS, and Linux
- **Glass Morphism Design**: Professional, elegant interface with translucent effects
- **Rounded Borders**: Smooth, rounded corners that blend perfectly with your desktop
- **Fullscreen Support**: Seamless transition between windowed and fullscreen modes
- **Native Feel**: Platform-specific window controls and behaviors
- **Dark Mode**: Full dark mode support with beautiful glass effects
- **Offline Capable**: Works without internet connection once installed

## 🎨 Design Highlights

### Glass Morphism Effects
- **Backdrop Blur**: Advanced blur effects (40px blur, 180% saturation)
- **Translucent Windows**: Semi-transparent backgrounds that show desktop through
- **Smooth Shadows**: Multi-layered shadows for depth perception
- **Border Highlights**: Subtle light reflections on borders

### Rounded Corners
- **Windowed Mode**: 
  - macOS: 12px radius (subtle, system-like)
  - Windows: 10px radius (modern Windows 11 style)
  - Linux: 8px radius (clean, minimalist)
- **Fullscreen Mode**: Perfect edge-to-edge display, no visible borders

### Platform-Specific Features
- **macOS**: 
  - Traffic light window controls (red, yellow, green)
  - Vibrancy effects
  - Double-click title bar to maximize
- **Windows**: 
  - Windows 11 acrylic effects
  - Snap layouts support
  - Custom minimize, maximize, close buttons
- **Linux**: 
  - Clean, minimalist design
  - Standard window decorations

## 📋 Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd desktop-app
npm install
```

### 2. Run in Development Mode

```bash
npm start
```

This will launch the application in development mode with DevTools enabled.

## 🏗️ Building for Production

### Build for Current Platform

```bash
npm run build
```

### Build for Specific Platforms

#### Windows
```bash
npm run build:win
```
Output: `dist/LotoLink-Setup-1.0.0.exe` (NSIS installer)

#### macOS
```bash
npm run build:mac
```
Output: 
- `dist/LotoLink-1.0.0.dmg` (DMG installer)
- `dist/LotoLink-1.0.0-mac.zip` (ZIP archive)

#### Linux
```bash
npm run build:linux
```
Output:
- `dist/LotoLink-1.0.0.AppImage` (AppImage, universal)
- `dist/lotolink-desktop_1.0.0_amd64.deb` (Debian/Ubuntu)
- `dist/lotolink-desktop-1.0.0.x86_64.rpm` (Fedora/RedHat)

### Build for All Platforms

```bash
npm run build:all
```

**Note**: Building for macOS requires a Mac. Building for Windows from Mac/Linux requires Wine.

### Automated Builds with GitHub Actions

The repository includes automated CI/CD pipelines that build installers for all platforms:

- **Trigger**: Automatically runs on push to `main` branch or when creating a version tag
- **Platforms**: Windows, macOS, and Linux in parallel
- **Output**: Installers are uploaded as GitHub Artifacts and attached to Releases

#### Downloading Pre-built Installers

1. Go to [GitHub Releases](https://github.com/Pabelcorn/LOTOLINK/releases)
2. Download the installer for your platform:
   - Windows: `LotoLink-Setup-{version}.exe`
   - macOS: `LotoLink-{version}.dmg` or `LotoLink-{version}-mac.zip`
   - Linux: `LotoLink-{version}.AppImage`, `.deb`, or `.rpm`
3. Install and run

#### Triggering a Manual Build

You can manually trigger builds from GitHub Actions:
1. Go to the **Actions** tab
2. Select **Build Desktop Installers** workflow
3. Click **Run workflow**
4. Choose platform(s) to build (all, windows, macos, or linux)
5. Wait for the build to complete
6. Download artifacts from the workflow run

For more details, see [DISTRIBUTION.md](DISTRIBUTION.md)


## 📦 Distribution Files

After building, you'll find installers in the `dist/` directory:

```
dist/
├── LotoLink-Setup-1.0.0.exe          # Windows installer
├── LotoLink-1.0.0.dmg                # macOS disk image
├── LotoLink-1.0.0-mac.zip            # macOS ZIP
├── LotoLink-1.0.0.AppImage           # Linux AppImage
├── lotolink-desktop_1.0.0_amd64.deb  # Debian/Ubuntu package
└── lotolink-desktop-1.0.0.x86_64.rpm # Fedora/RedHat package
```

## 🖥️ System Requirements

### Windows
- Windows 10 or later
- 4 GB RAM minimum
- 200 MB disk space

### macOS
- macOS 10.13 (High Sierra) or later
- 4 GB RAM minimum
- 200 MB disk space

### Linux
- Ubuntu 18.04 or equivalent
- 4 GB RAM minimum
- 200 MB disk space

## ⌨️ Keyboard Shortcuts

- `F11` - Toggle fullscreen
- `Ctrl/Cmd + W` - Close window
- `Ctrl/Cmd + M` - Minimize window
- `Ctrl/Cmd + Q` - Quit application (macOS)
- `Alt + F4` - Quit application (Windows/Linux)

## 🎯 Window Controls

### macOS
- **Red button** (⏺): Close window
- **Yellow button** (⏺): Minimize window
- **Green button** (⏺): Maximize/restore window
- **Double-click title bar**: Maximize/restore

### Windows
- **─**: Minimize window
- **☐**: Maximize window
- **❐**: Restore window (when maximized)
- **✕**: Close window

### Linux
- **_**: Minimize window
- **□**: Maximize/restore window
- **×**: Close window

## 🎨 Customization

### Window Size
Default window size is 1400x900 (or screen size - 100px if smaller).
Minimum window size is 1024x768.

To change, edit `main.js`:
```javascript
mainWindow = new BrowserWindow({
  width: 1400,  // Change this
  height: 900,  // Change this
  minWidth: 1024,
  minHeight: 768,
  // ...
});
```

### Window Frame
The app uses a frameless window with custom controls. To use native frame:

In `main.js`, change:
```javascript
frame: false,  // Change to true
transparent: true,  // Change to false
```

## 🔧 Development

### Enable DevTools
DevTools are automatically opened in development mode. To toggle:

**In Development:**
```bash
NODE_ENV=development npm start
```

**Keyboard shortcut:**
- macOS: `Cmd + Option + I`
- Windows/Linux: `Ctrl + Shift + I`

### Hot Reload
For development with hot reload, you can use:
```bash
npm install --save-dev electron-reload
```

Then add to `main.js`:
```javascript
if (process.env.NODE_ENV === 'development') {
  require('electron-reload')(__dirname);
}
```

## 📝 Project Structure

```
desktop-app/
├── main.js              # Electron main process
├── preload.js           # Preload script (security)
├── index.html           # Application UI
├── package.json         # Dependencies and build config
├── lotolink-logo.png    # App icon
└── dist/                # Built applications (after build)
```

## 🔐 Security

- **Context Isolation**: Enabled for security
- **Node Integration**: Disabled in renderer
- **Preload Script**: Secure IPC communication
- **Web Security**: Enabled

### Admin Panel Access

The application includes an admin panel that can be accessed by administrators. 

**To access the admin panel:**

1. Log in with an admin account (email containing `admin@` or `administrador@`)
2. Go to your Profile (click the 👤 icon)
3. Click the **"⚙️ Panel Admin"** button (purple button)
4. Enter admin credentials in the login modal:
   - **Username**: `admin`
   - **Password**: `lotolink2024`

**For detailed information about admin credentials and security**, see [ADMIN_CREDENTIALS.md](ADMIN_CREDENTIALS.md).

⚠️ **IMPORTANT**: The default credentials are for development only. **Change them before deploying to production!**

## 🐛 Troubleshooting

### White Screen on Startup
- Check console for errors: `Ctrl/Cmd + Shift + I`
- Ensure all assets (HTML, images) are in the correct location
- Verify file paths in `main.js`

### Window Controls Not Working
- Ensure `preload.js` is loaded correctly
- Check that `contextBridge` APIs are exposed
- Verify IPC event listeners in `main.js`

### Build Fails
- Clear node_modules: `rm -rf node_modules && npm install`
- Update electron-builder: `npm update electron-builder`
- Check platform-specific requirements

### Glass Effect Not Visible
- Windows: Requires Windows 10 or later with transparency effects enabled
- macOS: Requires macOS 10.13 or later
- Linux: Requires compositor (e.g., Compiz, KWin)

## 📄 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on all platforms if possible
5. Submit a pull request

## 📞 Support

For issues and questions:
- GitHub Issues: [Create an issue](https://github.com/Pabelcorn/LOTOLINK/issues)
- Email: support@lotolink.com

## 🎉 Acknowledgments

- Built with [Electron](https://www.electronjs.org/)
- UI inspired by Apple's design language
- Glass morphism design trends

---

**Made with ❤️ by the LotoLink Team**
