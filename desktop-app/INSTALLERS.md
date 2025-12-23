# Desktop Installers Quick Reference

## 🚀 Quick Start

### For Users: Download Pre-built Installers

1. Go to [GitHub Releases](https://github.com/Pabelcorn/LOTOLINK/releases)
2. Download the installer for your operating system:
   - **Windows**: `LotoLink-Setup-{version}.exe`
   - **macOS**: `LotoLink-{version}.dmg`
   - **Linux**: `LotoLink-{version}.AppImage` (or `.deb`/`.rpm`)
3. Install and run

### For Developers: Building Locally

```bash
cd desktop-app
npm install

# Build for current platform only
npm run build

# Build for all platforms (requires appropriate OS/tools)
./build-all.sh
```

## 📦 Available Installers

| Platform | Format | Size | Requirements |
|----------|--------|------|--------------|
| Windows | `.exe` (NSIS) | ~150-200 MB | Windows 10+ |
| macOS | `.dmg` / `.zip` | ~160-210 MB | macOS 10.13+ |
| Linux | `.AppImage` | ~150-200 MB | Any Linux distro |
| Linux | `.deb` | ~150-200 MB | Debian/Ubuntu |
| Linux | `.rpm` | ~150-200 MB | Fedora/RedHat |

## 🔄 Automated Builds

Installers are automatically built by GitHub Actions:

- ✅ **On every push to `main`** → Builds uploaded as artifacts
- ✅ **On version tags** (e.g., `v1.0.0`) → Builds uploaded to GitHub Releases
- ✅ **Manual trigger** → Can be triggered from GitHub Actions UI

### Workflow Status

Check the build status: [Actions → Build Desktop Installers](https://github.com/Pabelcorn/LOTOLINK/actions/workflows/build-installers.yml)

## 🛠️ Build Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `npm run build` | Build for current platform | Quick local build |
| `npm run build:win` | Build Windows installer | Windows-specific |
| `npm run build:mac` | Build macOS installers | macOS-specific |
| `npm run build:linux` | Build Linux installers | Linux-specific |
| `npm run build:all` | Build for all platforms | Multi-platform |
| `./build.sh` | Build with validation | Shell script wrapper |
| `./build-all.sh` | Build all with options | Advanced builds |
| `./validate-build.sh` | Validate configuration | Pre-build checks |

## 🎯 Creating a New Release

1. **Update version** in `package.json`:
   ```bash
   cd desktop-app
   npm version patch  # or minor, or major
   ```

2. **Commit and push**:
   ```bash
   git add package.json
   git commit -m "Bump version to X.Y.Z"
   git push
   ```

3. **Create and push tag**:
   ```bash
   git tag vX.Y.Z
   git push origin vX.Y.Z
   ```

4. **Wait for builds** (10-15 minutes)
   - Go to [Actions tab](https://github.com/Pabelcorn/LOTOLINK/actions)
   - Monitor the "Build Desktop Installers" workflow

5. **Verify release**
   - Go to [Releases tab](https://github.com/Pabelcorn/LOTOLINK/releases)
   - Check that all installers are attached

## 📋 Installation Instructions

### Windows
1. Download `LotoLink-Setup-{version}.exe`
2. Double-click to run
3. Follow the installation wizard
4. Launch from Start Menu or Desktop shortcut

### macOS
1. Download `LotoLink-{version}.dmg`
2. Open the DMG file
3. Drag LotoLink to Applications folder
4. Launch from Applications

### Linux (AppImage)
```bash
# Download
wget https://github.com/Pabelcorn/LOTOLINK/releases/download/vX.Y.Z/LotoLink-X.Y.Z.AppImage

# Make executable
chmod +x LotoLink-X.Y.Z.AppImage

# Run
./LotoLink-X.Y.Z.AppImage
```

### Linux (Debian/Ubuntu)
```bash
# Download and install
sudo dpkg -i lotolink-desktop_X.Y.Z_amd64.deb
sudo apt-get install -f  # Install dependencies if needed

# Run
lotolink-desktop
```

### Linux (Fedora/RedHat)
```bash
# Download and install
sudo rpm -i lotolink-desktop-X.Y.Z.x86_64.rpm

# Run
lotolink-desktop
```

## 🔍 Troubleshooting

### Build fails locally
```bash
# Validate configuration first
./validate-build.sh

# Clear and reinstall dependencies
rm -rf node_modules dist
npm install

# Try again
npm run build
```

### GitHub Actions build fails
1. Check the [Actions logs](https://github.com/Pabelcorn/LOTOLINK/actions)
2. Look for error messages in failed steps
3. Common issues:
   - Missing dependencies in `package.json`
   - Icon file issues
   - Permission problems (check workflow permissions)

### Installer not working
- **Windows**: Right-click → "Run as administrator"
- **macOS**: System Preferences → Security → Allow app
- **Linux AppImage**: Ensure file is executable: `chmod +x *.AppImage`

## 📚 Documentation

- [Desktop App README](README.md) - Full documentation
- [Distribution Guide](DISTRIBUTION.md) - Detailed distribution instructions
- [Main Project README](../README.md) - Project overview

## 🔗 Links

- **Repository**: https://github.com/Pabelcorn/LOTOLINK
- **Releases**: https://github.com/Pabelcorn/LOTOLINK/releases
- **Actions**: https://github.com/Pabelcorn/LOTOLINK/actions
- **Issues**: https://github.com/Pabelcorn/LOTOLINK/issues

---

**Last Updated**: December 2024  
**Version**: 1.0.0
