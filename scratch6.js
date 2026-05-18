const { GIFEncoder, quantize, applyPalette } = require('gifenc');
const fs = require('fs');

async function run() {
  const width = 100;
  const height = 100;
  const frames = 3;

  const red = Buffer.alloc(width * height * 4, 0);
  for (let i = 0; i < red.length; i += 4) { red[i] = 255; red[i+3] = 255; }
  
  const green = Buffer.alloc(width * height * 4, 0);
  for (let i = 0; i < green.length; i += 4) { green[i+1] = 255; green[i+3] = 255; }

  const blue = Buffer.alloc(width * height * 4, 0);
  for (let i = 0; i < blue.length; i += 4) { blue[i+2] = 255; blue[i+3] = 255; }

  const buffers = [red, green, blue];

  try {
    const gif = GIFEncoder();

    for (const buf of buffers) {
      const palette = quantize(buf, 256);
      const index = applyPalette(buf, palette);
      gif.writeFrame(index, width, height, { palette: palette, delay: 500, repeat: 0 });
    }

    gif.finish();
    const gifBuffer = gif.bytes();
    fs.writeFileSync('test4.gif', gifBuffer);
    console.log('Success, wrote test4.gif');
  } catch (e) {
    console.error(e);
  }
}
run();
