const { contextBridge, ipcRenderer } = require("electron");


contextBridge.exposeInMainWorld('electronFunctions', {
  saveImage: (image) => ipcRenderer.invoke("saveImage", image),
  saveSettings: (settings) => ipcRenderer.invoke("saveSettings", settings),
  getSettings: () => ipcRenderer.invoke("getSettings"),
  printTicket: () => ipcRenderer.invoke("printTicket")
})