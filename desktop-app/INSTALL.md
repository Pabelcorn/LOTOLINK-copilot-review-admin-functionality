# LotoLink Desktop App - Installation Guide

## 📦 Available Installers

LotoLink Desktop is available for **Windows**, **macOS**, and **Linux**.

### Windows
- **LotoLink-Setup-1.0.0.exe** - Standard Windows installer
- Requires Windows 7 or later

### macOS
- **LotoLink-1.0.0.dmg** - macOS disk image
- **LotoLink-1.0.0-mac.zip** - Portable macOS app
- Requires macOS 10.11 or later

### Linux
- **LotoLink-1.0.0.AppImage** - Universal Linux app (runs on any distribution)
- **lotolink-desktop_1.0.0_amd64.deb** - For Debian/Ubuntu-based systems
- **lotolink-desktop-1.0.0.x86_64.rpm** - For Fedora/RedHat-based systems

---

## 🚀 Installation Instructions

### Windows Installation

1. Download `LotoLink-Setup-1.0.0.exe`
2. Double-click the installer
3. Follow the installation wizard
4. Choose whether to create desktop and start menu shortcuts
5. Click "Install"
6. Launch LotoLink from your desktop or Start menu

### macOS Installation

**Using DMG:**
1. Download `LotoLink-1.0.0.dmg`
2. Double-click the DMG file
3. Drag the LotoLink app to your Applications folder
4. Open LotoLink from Applications
5. If you see a security warning, go to System Preferences > Security & Privacy and click "Open Anyway"

**Using ZIP:**
1. Download `LotoLink-1.0.0-mac.zip`
2. Extract the ZIP file
3. Move LotoLink.app to your Applications folder
4. Launch from Applications

### Linux Installation

**AppImage (Recommended - Works on all distributions):**
1. Download `LotoLink-1.0.0.AppImage`
2. Make it executable: `chmod +x LotoLink-1.0.0.AppImage`
3. Run it: `./LotoLink-1.0.0.AppImage`
4. (Optional) Right-click > Properties > Permissions > Check "Allow executing file as program"

**Debian/Ubuntu (.deb):**
```bash
sudo dpkg -i lotolink-desktop_1.0.0_amd64.deb
sudo apt-get install -f  # Fix any dependency issues
```

Or double-click the .deb file and use your Software Center.

**Fedora/RedHat (.rpm):**
```bash
sudo rpm -i lotolink-desktop-1.0.0.x86_64.rpm
```

Or double-click the .rpm file and use your Software Center.

---

## ✨ Features

- **Native Desktop Experience** - Full window controls, system tray integration
- **Cross-Platform** - Works on Windows, macOS, and Linux
- **Offline Support** - Works without internet connection
- **Auto-Updates** - Get notified when new versions are available
- **Privacy-Focused** - All data stored locally on your device

---

## 🔧 System Requirements

### Minimum Requirements
- **OS**: Windows 7+, macOS 10.11+, or Linux (any modern distribution)
- **RAM**: 2 GB
- **Disk Space**: 200 MB
- **Display**: 1024x768 or higher

### Recommended Requirements
- **OS**: Windows 10+, macOS 11+, or Linux (Ubuntu 20.04+)
- **RAM**: 4 GB
- **Disk Space**: 500 MB
- **Display**: 1920x1080 or higher

---

## 🆘 Troubleshooting

### Windows
- **Installer blocked by SmartScreen**: Click "More info" > "Run anyway"
- **App won't start**: Make sure you have .NET Framework 4.5+ installed

### macOS
- **"App is damaged" error**: Run `xattr -cr /Applications/LotoLink.app` in Terminal
- **Security warning**: Go to System Preferences > Security & Privacy > Click "Open Anyway"

### Linux
- **AppImage won't run**: Make sure FUSE is installed: `sudo apt install fuse libfuse2`
- **Missing dependencies**: Install with `sudo apt-get install -f` or `sudo yum install`

---

## 📝 License

LotoLink Desktop is licensed under the MIT License.

---

## 🤝 Support

For support, please visit:
- GitHub Issues: https://github.com/Pabelcorn/LOTOLINK/issues
- Documentation: https://github.com/Pabelcorn/LOTOLINK/wiki

---

## 🔄 Updates

LotoLink Desktop checks for updates automatically. You'll be notified when a new version is available.

To manually check for updates:
1. Open LotoLink Desktop
2. Go to Help > Check for Updates
3. Follow the prompts to download and install

---

**Enjoy using LotoLink Desktop! 🎉**
