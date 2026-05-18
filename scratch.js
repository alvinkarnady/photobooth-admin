const sharp = require('sharp');
const fs = require('fs');

async function run() {
  const width = 100;
  const height = 100;
  const channels = 4;
  const frames = 3;

  // Create 3 frames: red, green, blue
  const red = Buffer.alloc(width * height * channels, 0);
  for (let i = 0; i < red.length; i += 4) { red[i] = 255; red[i+3] = 255; }
  
  const green = Buffer.alloc(width * height * channels, 0);
  for (let i = 0; i < green.length; i += 4) { green[i+1] = 255; green[i+3] = 255; }

  const blue = Buffer.alloc(width * height * channels, 0);
  for (let i = 0; i < blue.length; i += 4) { blue[i+2] = 255; blue[i+3] = 255; }

  const stackedBuffer = Buffer.concat([red, green, blue]);

  try {
    const gifBuffer = await sharp(stackedBuffer, {
      animated: true,
      limitInputPixels: false,
      raw: {
        width: width,
        height: height * frames,
        channels: channels,
      },
    })
      .gif({
        delay: [500, 500, 500],
        loop: 0,
      })
      .toBuffer();
    
    fs.writeFileSync('test.gif', gifBuffer);
    console.log('Success, wrote test.gif');
  } catch (e) {
    console.error(e);
  }
}
run();
