const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  saveSchedule: (data) => ipcRenderer.invoke('save-schedule', data),
  loadSchedule: () => ipcRenderer.invoke('load-schedule'),
})
