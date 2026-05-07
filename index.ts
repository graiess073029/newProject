import { app, BrowserWindow, dialog, screen as electronScreen, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs';

import { getLatestData } from './services/SensorsEvent';
import { executeCommand } from './services/executeCommand';
import { getAppsData } from './services/getAppsData';
import { getBackgroundsData } from './services/getBackgroundsData';
import { getModesData } from './services/getModesData';
import { addBackground } from './services/addBackground';
import { readSensors } from "./services/readSensors"
import { sharedMemReader } from './services/sharedMemReader';

const createWindow = () => {
  const displays = electronScreen.getAllDisplays()

  displays.forEach((display) => {
    const { x, y, width, height } = display.bounds

    const win = new BrowserWindow({
      x,
      y,
      width,
      height,
      movable: false,
      frame: false,
      alwaysOnTop: false,
      autoHideMenuBar: true,
      enableLargerThanScreen: true,
      resizable: false,
      skipTaskbar: false,
      fullscreen: false,
      roundedCorners: false,
      webPreferences: {
        preload: path.join(__dirname, "preload", 'preload.js'),
        devTools: true,
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: false,
      }
    })

    win.loadFile(path.join(__dirname, 'renderer', 'index.html'))

  })
}

ipcMain.on('refresh-windows', () => {
  BrowserWindow.getAllWindows().forEach((win) => {
    win.reload()
  })
})

const userDataPath = app.getPath('userData');
const dataFolder = path.join(userDataPath, 'data');

// 3. Création manuelle du dossier
if (!fs.existsSync(dataFolder)) {
  fs.mkdirSync(dataFolder, { recursive: true });
}

if (!fs.existsSync(path.join(dataFolder, 'assets'))) fs.mkdirSync(path.join(dataFolder, 'assets'), { recursive: true });
if (!fs.existsSync(path.join(dataFolder, 'data.JSON'))) fs.writeFileSync(path.join(dataFolder, 'data.JSON'), JSON.stringify({}));
if (!fs.existsSync(path.join(dataFolder, 'backgrounds.JSON'))) fs.writeFileSync(path.join(dataFolder, 'backgrounds.JSON'), JSON.stringify({}));
if (!fs.existsSync(path.join(dataFolder, 'modes.JSON'))) fs.writeFileSync(path.join(dataFolder, 'modes.JSON'), JSON.stringify({}));
if (!fs.existsSync(path.join(dataFolder, 'data.csv'))) fs.writeFileSync(path.join(dataFolder, 'data.csv'), "");

ipcMain.handle('get-sensor-data', () => {
  return getLatestData();
});


ipcMain.handle('execute-command', (event, command) => {
  return executeCommand(command);
});

ipcMain.handle('get-apps-data', () => {
  return getAppsData();
});

ipcMain.handle('get-backgrounds-data', () => {
  return getBackgroundsData();
});

ipcMain.handle('get-modes-data', () => {
  return getModesData();
});

ipcMain.handle('get-readings', async () => {
  return await sharedMemReader();
});

ipcMain.handle('pick-file', async (event) => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'Backgrounds', extensions: ['jpg', 'jpeg', 'png', 'webp', 'mp4', 'webm'] }]
  });
  if (!result.canceled) return result.filePaths[0];
  return null;
});

ipcMain.handle('add-background', (event, path: string) => {
  return addBackground(path)
})


app.whenReady().then(createWindow)

readSensors();

