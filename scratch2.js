const sharp = require('sharp');
const fs = require('fs');

async function run() {
  const width = 100;
  const height = 100;
  const channels = 4;
  const frames = 3;

  const red = Buffer.alloc(width * height * channels, 0);
  for (let i = 0; i < red.length; i += 4) { red[i] = 255; red[i+3] = 255; }
  
  const green = Buffer.alloc(width * height * channels, 0);
  for (let i = 0; i < green.length; i += 4) { green[i+1] = 255; green[i+3] = 255; }

  const blue = Buffer.alloc(width * height * channels, 0);
  for (let i = 0; i < blue.length; i += 4) { blue[i+2] = 255; blue[i+3] = 255; }

  const stackedBuffer = Buffer.concat([red, green, blue]);

  try {
    const metadata = await sharp(stackedBuffer, {
      animated: true,
      limitInputPixels: false,
      raw: {
        width: width,
        height: height * frames,
        channels: channels,
      },
    }).metadata();
    console.log("Metadata without pageHeight:", metadata.pages);

    // Now try passing pageHeight? Wait, `sharp` doesn't take pageHeight as an option.
    // Instead we can use gifencoder which is native nodejs.
    // Wait, let's see if we can use another method or set pageHeight.
  } catch (e) {
    console.error(e);
  }
}
run();
