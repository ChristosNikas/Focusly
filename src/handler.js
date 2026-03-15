const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  startTracking:  ()       => ipcRenderer.send('start-tracking'),
  stopTracking:   ()       => ipcRenderer.send('stop-tracking'),
  showReport:     ()       => ipcRenderer.send('show-report'),
  showSettings:   ()       => ipcRenderer.send('show-settings'),
  getEvents:      ()       => ipcRenderer.invoke('get-events'),
  flush:          ()       => ipcRenderer.invoke('flush-events'),
  quit:           ()       => ipcRenderer.send('quit-app'),
  getCategories:  ()       => ipcRenderer.invoke('get-categories'),
  saveCategories: (cats)   => ipcRenderer.invoke('save-categories', cats),
});