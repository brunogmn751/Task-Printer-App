const { app, BrowserWindow, ipcMain } = require("electron/main");
const path = require("node:path");
const fs = require("fs");

function createWindow() {
  const win = new BrowserWindow({
    width: 520,
    minWidth: 520,
    height: 520,
    minHeight: 520,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
    title: "Task Printer",
    backgroundColor: "#DCCCAC",
    icon: path.join(__dirname, "assets", "Image", "Psy-icon.ico"),
  });

  win.loadFile(path.join(__dirname, "index.html"));

//   win.removeMenu();
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

function getTicketPath(){
    return path.join(app.getPath("temp"),"ticket.png");
}

ipcMain.handle("saveImage", (event, image)=>{
const decodedImage = image.replace(/^data:image\/png;base64,/, "");
const imagePath = getTicketPath();
fs.writeFileSync(imagePath, decodedImage, "base64");

return imagePath;
});
