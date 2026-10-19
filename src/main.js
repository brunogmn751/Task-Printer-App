const { app, BrowserWindow, ipcMain } = require("electron/main");
const path = require("node:path");
const fs = require("fs");
const { printTicket } = require("./print.js");
const {
  load,
  save,
  validate,
  defaults,
  settingsPath,
} = require("./settings.js");

if (require("electron-squirrel-startup")) app.quit();

function createWindow() {
  const iconFile =
    process.platform === "win32" ? "Psy-icon.ico" : "Psyduck.png";

  const win = new BrowserWindow({
    width: 520,
    minWidth: 520,
    height: 520,
    minHeight: 520,
    // maxHeight:520,
    // maxWidth:520,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
    title: "Task Printer",
    backgroundColor: "#DCCCAC",
    icon: path.join(__dirname, "assets", "image", iconFile),
  });

  win.loadFile(path.join(__dirname, "index.html"));

  win.removeMenu();
}

app.whenReady().then(async () => {
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

function getTicketPath() {
  return path.join(app.getPath("temp"), "ticket.png");
}

ipcMain.handle("saveImage", (event, image) => {
  const decodedImage = image.replace(/^data:image\/png;base64,/, "");
  const imagePath = getTicketPath();
  fs.writeFileSync(imagePath, decodedImage, "base64");

  return imagePath;
});

ipcMain.handle("getSettings", () => load());

ipcMain.handle("saveSettings", async (event, settings) => {
  const result = validate(settings);
  if (!result.ok) return result;
  await save(result.value);
  return { ok: true };
});

ipcMain.handle("printTicket", async () => {
  const imagePath = getTicketPath();
  try {
    const config = await load();
    await printTicket(imagePath, config.vid, config.pid, config.printerWidth);
    return { ok: true };
  } catch (error) {
    console.error("Failed to print:", error);
    return { ok: false, error: error.message };
  }
});
