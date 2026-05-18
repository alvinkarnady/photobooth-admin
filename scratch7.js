const { GIFEncoder, quantize, applyPalette } = require('gifenc');

const width = 720;
const height = 960;
const frames = 12;

const start = Date.now();
const gif = GIFEncoder();

for (let f = 0; f < frames; f++) {
  const buf = Buffer.alloc(width * height * 4, 0);
  for (let i = 0; i < buf.length; i += 4) { buf[i] = 255; buf[i+3] = 255; }
  
  const palette = quantize(buf, 256);
  const index = applyPalette(buf, palette);
  gif.writeFrame(index, width, height, { palette: palette, delay: 150 });
}

gif.finish();
const gifBuffer = gif.bytes();
console.log('Took', Date.now() - start, 'ms for', frames, 'frames');
