# Desktop Application Distribution Guide

This guide explains how to build and distribute the LotoLink desktop application installers.

## 📦 Build Outputs

The desktop application is built using Electron and electron-builder, generating installers for three platforms:

### Windows
- **NSIS Installer**: `LotoLink-Setup-1.0.0.exe`
  - One-click installation
  - Desktop and Start Menu shortcuts
  - Uninstaller included
  - Supports both 64-bit (x64) and 32-bit (ia32) architectures

### macOS
- **DMG Disk Image**: `LotoLink-1.0.0.dmg`
  - Drag-and-drop installation
  - Beautiful installer window with application icon
  - Works on macOS 10.13 (High Sierra) and later
- **ZIP Archive**: `LotoLink-1.0.0-mac.zip`
  - Alternative distribution format
  - Can be extracted directly

### Linux
- **AppImage**: `LotoLink-1.0.0.AppImage`
  - Universal Linux binary
  - Works on most Linux distributions
  - No installation required - just make executable and run
- **Debian Package**: `lotolink-desktop_1.0.0_amd64.deb`
  - For Debian, Ubuntu, and derivatives
  - Standard package management integration
- **RPM Package**: `lotolink-desktop-1.0.0.x86_64.rpm`
  - For Fedora, RedHat, CentOS, and derivatives
  - Standard package management integration

## 🔨 Building Installers

### Automated Builds (GitHub Actions)

The repository includes automated workflows that build installers on every push to `main` and on tagged releases.

#### Trigger a Build

1. **Push to main branch**: Builds are triggered automatically
2. **Create a release tag**: 
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
3. **Manual dispatch**: Go to Actions → Build Desktop Installers → Run workflow

#### Download Built Artifacts

After a workflow completes:
1. Go to the Actions tab in GitHub
2. Click on the completed workflow run
3. Scroll to "Artifacts" section
4. Download:
   - `windows-installer` - Windows .exe files
   - `macos-installer` - macOS .dmg and .zip files
   - `linux-installers` - Linux AppImage, .deb, and .rpm files

### Local Builds

#### Prerequisites
- Node.js 18.x or higher
- npm 9.x or higher
- Platform-specific requirements (see below)

#### Build for Current Platform
```bash
cd desktop-app
npm install
npm run build
```

This builds installers for your current operating system.

#### Build for All Platforms
```bash
cd desktop-app
./build-all.sh
```

Options:
- `--windows-only` - Build only Windows installer
- `--macos-only` - Build only macOS installers
- `--linux-only` - Build only Linux installers
- `--no-windows` - Skip Windows build
- `--no-macos` - Skip macOS build
- `--no-linux` - Skip Linux build

#### Build for Specific Platform
```bash
cd desktop-app
npm run build:win      # Windows
npm run build:mac      # macOS
npm run build:linux    # Linux
```

#### Platform-Specific Requirements

**Windows Builds:**
- Can be built on Windows natively
- Can be built on macOS/Linux with Wine installed
- Requires: `wine` and `mono` (for Linux/macOS)

**macOS Builds:**
- **Must** be built on macOS
- Requires Xcode Command Line Tools
- Install: `xcode-select --install`

**Linux Builds:**
- Can be built on any platform
- Recommended to build on Linux for best results
- Requires standard build tools (`gcc`, `make`)

### Build Output Location

All installers are placed in `desktop-app/dist/`:
```
dist/
├── LotoLink-Setup-1.0.0.exe              # Windows
├── LotoLink-1.0.0.dmg                    # macOS DMG
├── LotoLink-1.0.0-mac.zip                # macOS ZIP
├── LotoLink-1.0.0.AppImage               # Linux AppImage
├── lotolink-desktop_1.0.0_amd64.deb      # Linux Debian
└── lotolink-desktop-1.0.0.x86_64.rpm     # Linux RPM
```

## 🚀 Distribution

### GitHub Releases

When you push a version tag (e.g., `v1.0.0`), the workflow automatically:
1. Builds installers for all platforms
2. Creates a GitHub Release
3. Uploads all installers to the release
4. Generates a release summary with installation instructions

### Manual Distribution

1. **Direct Download**: Host the files on your web server
2. **CDN Distribution**: Upload to a CDN for faster downloads
3. **Update Server**: Set up an update server for automatic updates

### Update Mechanism

electron-builder supports automatic updates. To enable:

1. **Add update configuration** to `package.json`:
```json
"build": {
  "publish": [
    {
      "provider": "github",
      "owner": "Pabelcorn",
      "repo": "LOTOLINK"
    }
  ]
}
```

2. **Implement auto-updater** in `main.js`:
```javascript
const { autoUpdater } = require('electron-updater');

app.whenReady().then(() => {
  autoUpdater.checkForUpdatesAndNotify();
});
```

## 📝 Release Process

### 1. Prepare Release
```bash
# Update version in package.json
cd desktop-app
npm version patch  # or minor, or major

# Commit changes
git add package.json
git commit -m "Bump version to 1.0.1"
git push
```

### 2. Create Release Tag
```bash
# Create and push tag
git tag v1.0.1
git push origin v1.0.1
```

### 3. Wait for Build
- Go to Actions tab
- Monitor the "Build Desktop Installers" workflow
- Wait for all platform builds to complete (typically 10-15 minutes)

### 4. Verify Release
- Go to Releases tab
- Check that the new release was created
- Verify all installer files are attached
- Review the release notes

### 5. Announce Release
- Update the main README.md with download links
- Notify users through your communication channels
- Update documentation if needed

## 🔐 Code Signing

### Windows
For production releases, sign the `.exe` file:

```bash
# Install Windows SDK or signtool
signtool sign /f certificate.pfx /p password /t http://timestamp.digicert.com LotoLink-Setup-1.0.0.exe
```

In GitHub Actions, add:
```yaml
- name: Sign Windows executable
  run: |
    echo "${{ secrets.WINDOWS_CERTIFICATE }}" | base64 --decode > cert.pfx
    signtool sign /f cert.pfx /p "${{ secrets.CERT_PASSWORD }}" /tr http://timestamp.digicert.com /td sha256 /fd sha256 desktop-app/dist/*.exe
```

### macOS
For production releases, sign and notarize:

```bash
# Sign the app
codesign --force --deep --sign "Developer ID Application: Your Name" "LotoLink.app"

# Notarize
xcrun notarytool submit LotoLink-1.0.0.dmg --apple-id "your@email.com" --password "app-specific-password" --team-id "TEAMID"
```

In GitHub Actions, use `action-electron-builder` with signing certificates:
```yaml
- name: Build and sign macOS
  env:
    CSC_LINK: ${{ secrets.MAC_CERTIFICATE }}
    CSC_KEY_PASSWORD: ${{ secrets.MAC_CERTIFICATE_PASSWORD }}
    APPLE_ID: ${{ secrets.APPLE_ID }}
    APPLE_APP_SPECIFIC_PASSWORD: ${{ secrets.APPLE_APP_PASSWORD }}
  run: npm run build:mac
```

### Linux
Linux packages generally don't require signing, but you can sign the packages:

```bash
# Sign .deb package
dpkg-sig -k YOUR_KEY_ID --sign builder lotolink-desktop_1.0.0_amd64.deb

# Sign .rpm package
rpm --addsign lotolink-desktop-1.0.0.x86_64.rpm
```

## 📊 File Sizes (Approximate)

- Windows installer: ~150-200 MB
- macOS DMG: ~160-210 MB
- macOS ZIP: ~155-205 MB
- Linux AppImage: ~150-200 MB
- Linux .deb: ~150-200 MB
- Linux .rpm: ~150-200 MB

*Note: Sizes may vary based on dependencies and compression*

## 🐛 Troubleshooting

### Build Fails on macOS
- Ensure you're on macOS (required for macOS builds)
- Install Xcode Command Line Tools: `xcode-select --install`
- Clear build cache: `rm -rf ~/Library/Caches/electron-builder`

### Build Fails on Windows
- Run as Administrator if permission errors occur
- Disable antivirus temporarily
- Clear npm cache: `npm cache clean --force`

### Build Fails on Linux
- Install build essentials: `sudo apt-get install build-essential`
- Install required dependencies: `sudo apt-get install rpm`

### "No space left on device"
- Clear old builds: `rm -rf dist/`
- Clear node_modules: `rm -rf node_modules && npm install`
- Free up disk space

### Installer Size Too Large
- Review included files in `package.json` → `build.files`
- Remove unnecessary dependencies
- Use `asar` packing (enabled by default)

## 📚 Additional Resources

- [electron-builder Documentation](https://www.electron.build/)
- [Electron Documentation](https://www.electronjs.org/docs)
- [Code Signing Guide](https://www.electron.build/code-signing)
- [Auto Update Guide](https://www.electron.build/auto-update)

## 🤝 Support

For build or distribution issues:
- Check existing [GitHub Issues](https://github.com/Pabelcorn/LOTOLINK/issues)
- Create a new issue with build logs
- Review the workflow logs in GitHub Actions

---

**Last Updated**: December 2024
