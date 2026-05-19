import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const maxAgeDays = body.days || 30;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - maxAgeDays);

    // List all items in the photos bucket root
    const { data: allItems, error } = await supabase.storage
      .from('photos')
      .list('', {
        limit: 1000,
        sortBy: { column: 'created_at', order: 'asc' },
      });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to list sessions', details: error.message },
        { status: 500 }
      );
    }

    const items = allItems || [];
    const folders = items.filter((item) => item.id === null && !item.metadata);
    const rootFiles = items.filter((item) => item.id !== null && item.metadata);

    let deletedCount = 0;
    const deletedSessions: string[] = [];

    // ---- Clean up NEW format (folder-based) ----
    for (const folder of folders) {
      const { data: files, error: filesError } = await supabase.storage
        .from('photos')
        .list(folder.name, { limit: 200 });

      if (filesError || !files || files.length === 0) continue;

      const createdAt = files[0]?.created_at || folder.created_at;
      if (!createdAt) continue;

      if (new Date(createdAt) < cutoffDate) {
        const filePaths = files.map((f) => `${folder.name}/${f.name}`);
        const { error: deleteError } = await supabase.storage
          .from('photos')
          .remove(filePaths);

        if (!deleteError) {
          deletedCount++;
          deletedSessions.push(folder.name);
        }
      }
    }

    // ---- Clean up OLD format (flat files) ----
    // Group by timestamp
    const oldTimestamps = new Map<string, string[]>();
    for (const file of rootFiles) {
      const match = file.name.match(/^(?:photo|live|raw)_(\d+)\./);
      if (!match) continue;
      const timestamp = match[1];
      if (!oldTimestamps.has(timestamp)) {
        oldTimestamps.set(timestamp, []);
      }
      oldTimestamps.get(timestamp)!.push(file.name);
    }

    for (const [timestamp, fileNames] of oldTimestamps.entries()) {
      // Use the timestamp to determine the date
      const sessionDate = new Date(parseInt(timestamp));
      if (isNaN(sessionDate.getTime())) continue;

      if (sessionDate < cutoffDate) {
        const { error: deleteError } = await supabase.storage
          .from('photos')
          .remove(fileNames);

        if (!deleteError) {
          deletedCount++;
          deletedSessions.push(`legacy_${timestamp}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      deletedCount,
      deletedSessions,
      cutoffDate: cutoffDate.toISOString(),
      maxAgeDays,
    });
  } catch (error) {
    console.error('Auto-cleanup error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
