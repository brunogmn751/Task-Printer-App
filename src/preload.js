const { contextBridge, ipcRenderer } = require("electron");


contextBridge.exposeInMainWorld('electronFunctions', {
  saveImage: (image) => ipcRenderer.invoke("saveImage", image)
})