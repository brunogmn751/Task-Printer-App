const { Printer, Image } = require("@node-escpos/core");
const USB = require("@node-escpos/usb-adapter");
const { Jimp } = require("jimp");
const path = require("path");
const os = require("os");
const fs = require("fs");

const PRINTER_VID = 0x28e9;
const PRINTER_PID = 0x0289;
const printerWidth = 384;
const paperFeedMargin = 60;

async function prepareImage(imagePath) {
  let img = await Jimp.read(imagePath);

  img.greyscale();

  if (img.bitmap.width !== printerWidth) {
    img.resize({ w: printerWidth });
  }

  ditherFloydSteinberg(img);

  const finalHeight = img.bitmap.height + paperFeedMargin;
  const preparedTicket = new Jimp({
    width: printerWidth,
    height: finalHeight,
    color: 0xffffffff,
  });
  preparedTicket.composite(img, 0, 0);

  const tmpPath = path.join(os.tmpdir(), `tmp_print_${Date.now()}.png`);
  await preparedTicket.write(tmpPath);
  return tmpPath;
}

function ditherFloydSteinberg(img) {
  const { data, width, height } = img.bitmap;
  const gray = new Float32Array(width * height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      gray[y * width + x] = data[(y * width + x) * 4]; // canal R = valor de cinza
    }
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const oldPixel = gray[i];
      const newPixel = oldPixel < 128 ? 0 : 255;
      const error = oldPixel - newPixel;
      gray[i] = newPixel;

      if (x + 1 < width) gray[i + 1] += (error * 7) / 16;
      if (y + 1 < height) {
        if (x > 0) gray[i - 1 + width] += (error * 3) / 16;
        gray[i + width] += (error * 5) / 16;
        if (x + 1 < width) gray[i + 1 + width] += (error * 1) / 16;
      }
    }
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const v = gray[y * width + x];
      data[idx] = v;
      data[idx + 1] = v;
      data[idx + 2] = v;
    }
  }
}

function printTicket(imagePath) {
  return new Promise((resolve, reject) => {
    let device;
    try {
      device = new USB(PRINTER_VID, PRINTER_PID);
    } catch (error) {
      return reject(new Error(`Couldn't find printer: ${error.message}`));
    }

    device.open(async (error) => {
      if (error) {
        return reject(new Error(`Failed opening printer: ${error.message}`));
      }

      let tmpPath;
      try {
        tmpPath = await prepareImage(imagePath);

        const printer = new Printer(device, { encoding: "GB18030" });
        const image = await Image.load(tmpPath);
        printer.raster(image);
        printer.cut(false, 0).close();
        resolve(true);
      } catch (error) {
        reject(error);
      } finally {
        if (tmpPath && fs.existsSync(tmpPath)) {
          fs.unlinkSync(tmpPath);
        }
      }
    });
  });
}

module.exports = { printTicket };
