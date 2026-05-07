const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  
  getSensorsData: () => ipcRenderer.invoke('get-sensor-data'),

  refreshWindows: () => ipcRenderer.send('refresh-windows'),

  executeCommand: (command : string) => ipcRenderer.invoke('execute-command', command),

  getAppsData: () => ipcRenderer.invoke('get-apps-data'),

  getBackgroundsData: () => ipcRenderer.invoke('get-backgrounds-data'),

  getModesData: () => ipcRenderer.invoke('get-modes-data'),

  addBackground : (path : string) => ipcRenderer.invoke('add-background',path),

  pickFile : () => ipcRenderer.invoke('pick-file'),

  readSharedMem : () => ipcRenderer.invoke('get-readings'),

});