import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

export const maxDuration = 30; // Allow up to 30 seconds for GIF generation

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const session = searchParams.get('session');
  const count = parseInt(searchParams.get('count') || '0');
  const type = searchParams.get('type') || 'burst'; // 'burst' or 'live'
  const targetWidth = parseInt(searchParams.get('width') || '720');
  const delayParam = searchParams.get('delay');
  const delay = parseInt(delayParam ? delayParam : (type === 'live' ? '150' : '400'));

  if (!session || count === 0) {
    return NextResponse.json({ error: 'Missing session or count' }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    return NextResponse.json({ error: 'Supabase URL not configured' }, { status: 500 });
  }

  try {
    const prefix = type === 'live' ? 'live' : 'burst';

    // 1. Fetch all frames in parallel from Supabase Storage
    const framePromises = Array.from({ length: count }, (_, i) => {
      const url = `${supabaseUrl}/storage/v1/object/public/photos/${session}/${prefix}_${i}.png`;
      return fetch(url).then(r => {
        if (!r.ok) throw new Error(`Failed to fetch frame ${i}: ${r.status}`);
        return r.arrayBuffer();
      });
    });

    const frameArrayBuffers = await Promise.all(framePromises);

    // 2. Resize all frames to consistent dimensions using sharp
    const frameDataList = await Promise.all(
      frameArrayBuffers.map(async (ab) => {
        return sharp(Buffer.from(ab))
          .resize(targetWidth)
          .ensureAlpha()
          .raw()
          .toBuffer({ resolveWithObject: true });
      })
    );

    if (frameDataList.length === 0) {
      return NextResponse.json({ error: 'No frames processed' }, { status: 400 });
    }

    const frameWidth = frameDataList[0].info.width;
    const frameHeight = frameDataList[0].info.height;
    const channels = frameDataList[0].info.channels;

    // 3. Create animated GIF using gifenc
    const { GIFEncoder, quantize, applyPalette } = require('gifenc');
    const gif = GIFEncoder();

    for (let i = 0; i < frameDataList.length; i++) {
      const frame = frameDataList[i];
      const palette = quantize(frame.data, 256);
      const index = applyPalette(frame.data, palette);
      // repeat: 0 means infinite loop
      gif.writeFrame(index, frameWidth, frameHeight, { 
        palette, 
        delay, 
        repeat: 0 
      });
    }

    gif.finish();
    const gifBuffer = gif.bytes();

    // 5. Return the GIF with proper headers
    return new NextResponse(new Uint8Array(gifBuffer), {
      headers: {
        'Content-Type': 'image/gif',
        'Content-Disposition': `attachment; filename="piawai_${type}_${session}.gif"`,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400', // Cache 24h
      },
    });
  } catch (error) {
    console.error('GIF generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate GIF', details: String(error) },
      { status: 500 }
    );
  }
}
