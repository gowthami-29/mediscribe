const { app, BrowserWindow } = require('electron');

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    autoHideMenuBar: true,
    title: 'ArogyaScribe'
  });

  win.maximize();

  win.loadURL('https://mediscribe-kohl.vercel.app');
}

app.whenReady().then(createWindow);