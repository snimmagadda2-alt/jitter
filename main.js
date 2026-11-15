const { app, BrowserWindow } = require('electron');
const path = require('path');

if (process.platform === 'linux') {
  app.commandLine.appendSwitch('no-sandbox');
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 750,
    title: 'JitterDev',
    icon: path.join(__dirname, 'icon.png'),
    backgroundColor: '#090910',
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  win.loadFile('app.html');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
