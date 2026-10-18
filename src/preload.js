const { contextBridge, ipcRenderer } = require("electron");


contextBridge.exposeInMainWorld('electronFunctions', {
  saveImage: (image) => ipcRenderer.invoke("saveImage", image),
  saveSettings: (settings) => ipcRenderer.invoke("saveSettings", settings),
  printTicket: () => ipcRenderer.invoke("printTicket")
})