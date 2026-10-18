const { app } = require("electron");
const fs = require("node:fs/promises");
const path = require("node:path");

const defaults = { vid: "28e9", pid: "0289", printerWidth: 384 };
const allowedWidths = [384, 576, 832];

function settingsPath() {
  return path.join(app.getPath("userData"), "settings.json");
}

async function load() {
  try {
    const raw = await fs.readFile(settingsPath(), "utf8");
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return { ...defaults };
  }
}

function normalizeId(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/^0x/, "");
}

function validate(input) {
  const vid = normalizeId(input?.vid);
  const pid = normalizeId(input?.pid);
  const printerWidth = Number(input.printerWidth);

  if (!/^[0-9a-f]{4}$/.test(vid) || !/^[0-9a-f]{4}$/.test(pid)) {
    return { ok: false, error: "VID or PID number is invalid" };
  }

  if (!allowedWidths.includes(printerWidth)) {
    return { ok: false, error: "Invalid printer width" };
  }
  return { ok: true, value: { vid, pid, printerWidth } };
}

async function save(settings) {
  const file = settingsPath();
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(settings, null, 2));
}

module.exports = { load, save, validate, defaults };
