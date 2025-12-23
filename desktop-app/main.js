const { app, BrowserWindow, screen, ipcMain, dialog } = require('electron');
const path = require('path');

let mainWindow;

// Detect OS for platform-specific behavior
const isMac = process.platform === 'darwin';
const isWindows = process.platform === 'win32';
const isLinux = process.platform === 'linux';

function createWindow() {
  console.log('Creating main window...');
  console.log('Platform:', process.platform);
  
  // Get primary display dimensions
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;
  console.log('Display size:', width, 'x', height);

  // Create the browser window with glass morphism effects
  mainWindow = new BrowserWindow({
    width: Math.min(1400, width - 100),
    height: Math.min(900, height - 100),
    minWidth: 1024,
    minHeight: 768,
    frame: false, // Frameless window for custom design
    transparent: true, // Enable transparency for glass effect
    backgroundColor: '#00000000', // Transparent background
    hasShadow: true,
    roundedCorners: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      devTools: true,
      webSecurity: true
    },
    titleBarStyle: isMac ? 'hiddenInset' : 'hidden',
    vibrancy: isMac ? 'under-window' : undefined, // macOS vibrancy effect
    backgroundMaterial: isWindows ? 'acrylic' : undefined, // Windows 11 acrylic effect
    show: false // Don't show until ready
  });

  // Load the index.html file with absolute path for packaged app
  const htmlPath = path.join(__dirname, 'index.html');
  console.log('Loading HTML from:', htmlPath);
  
  mainWindow.loadFile(htmlPath).catch(err => {
    console.error('Failed to load index.html:', err);
    // Show user-friendly error dialog with basic troubleshooting info
    // Detailed errors are logged to console for debugging
    dialog.showErrorBox(
      'Error Loading Application',
      'The application failed to start. This may be due to:\n\n' +
      '• Incomplete installation\n' +
      '• Corrupted download\n' +
      '• Antivirus blocking the app\n\n' +
      'Please try:\n' +
      '1. Reinstalling the application\n' +
      '2. Running as administrator (Windows)\n' +
      '3. Checking antivirus settings\n\n' +
      'If the problem persists, please contact support with the error details from the console.'
    );
  });

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    console.log('Window is ready to show');
    mainWindow.show();
    
    // Apply OS-specific class for styling using predefined platform mappings
    const platformClass = {
      'darwin': 'os-macos',
      'win32': 'os-windows',
      'linux': 'os-linux'
    }[process.platform] || 'os-unknown';
    
    mainWindow.webContents.executeJavaScript(`
      document.documentElement.classList.add('electron-app');
      document.documentElement.classList.add('${platformClass}');
      document.documentElement.classList.add('os-${process.platform}');
      document.body.classList.add('${platformClass}');
    `).catch(err => {
      console.error('Failed to inject platform classes:', err);
    });
  });

  // Handle page load failures
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Page failed to load:', errorCode, errorDescription);
    // Show user-friendly error without exposing internal details
    dialog.showErrorBox(
      'Page Load Error',
      'The application interface failed to load.\n\n' +
      'This could be caused by:\n' +
      '• Network connectivity issues\n' +
      '• File system permissions\n' +
      '• Antivirus software\n\n' +
      'Please try restarting the application or reinstalling.'
    );
  });

  // Handle window state changes
  mainWindow.on('enter-full-screen', () => {
    mainWindow.webContents.executeJavaScript(`
      document.documentElement.classList.add('fullscreen');
    `);
  });

  mainWindow.on('leave-full-screen', () => {
    mainWindow.webContents.executeJavaScript(`
      document.documentElement.classList.remove('fullscreen');
    `);
  });

  mainWindow.on('maximize', () => {
    mainWindow.webContents.executeJavaScript(`
      document.documentElement.classList.add('maximized');
    `);
  });

  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.executeJavaScript(`
      document.documentElement.classList.remove('maximized');
    `);
  });

  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  console.log('Electron app is ready');
  console.log('App path:', app.getAppPath());
  console.log('User data path:', app.getPath('userData'));
  
  createWindow();

  app.on('activate', () => {
    // On macOS it's common to re-create a window when the dock icon is clicked
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
}).catch(err => {
  console.error('Error during app initialization:', err);
  // Show user-friendly startup error without exposing internal state
  dialog.showErrorBox(
    'Startup Error',
    'The application failed to initialize.\n\n' +
    'Possible solutions:\n' +
    '• Restart your computer\n' +
    '• Reinstall the application\n' +
    '• Check system requirements\n' +
    '• Disable conflicting software\n\n' +
    'Technical details have been logged to the console.'
  );
  app.quit();
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (!isMac) {
    app.quit();
  }
});

// Handle IPC messages from renderer process
ipcMain.on('window-minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('window-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.on('window-close', () => {
  if (mainWindow) mainWindow.close();
});

ipcMain.on('window-fullscreen', () => {
  if (mainWindow) {
    mainWindow.setFullScreen(!mainWindow.isFullScreen());
  }
});

// Get window state
ipcMain.handle('get-window-state', () => {
  if (!mainWindow) return {};
  return {
    isMaximized: mainWindow.isMaximized(),
    isFullScreen: mainWindow.isFullScreen(),
    isMinimized: mainWindow.isMinimized()
  };
});
