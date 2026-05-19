import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    // List all items in the photos bucket root
    const { data: allItems, error } = await supabase.storage
      .from('photos')
      .list('', {
        limit: 1000,
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (error) {
      console.error('Error listing sessions:', error);
      return NextResponse.json({ error: 'Failed to list sessions' }, { status: 500 });
    }

    const items = allItems || [];

    // Separate folders (new format) from files (old format)
    const folders = items.filter((item) => item.id === null && !item.metadata);
    const rootFiles = items.filter((item) => item.id !== null && item.metadata);

    // ---- Handle NEW format: folder-based sessions (e.g., {sessionId}/photo.png) ----
    const folderSessions = await Promise.all(
      folders.map(async (folder) => {
        const { data: files, error: filesError } = await supabase.storage
          .from('photos')
          .list(folder.name, { limit: 100 });

        if (filesError || !files || files.length === 0) return null;

        const photoFile = files.find((f) => f.name === 'photo.png');
        const burstFiles = files.filter((f) => f.name.startsWith('burst_'));
        const liveFiles = files.filter((f) => f.name.startsWith('live_'));
        const totalSize = files.reduce(
          (acc, f) => acc + (f.metadata?.size || 0),
          0
        );
        const createdAt =
          photoFile?.created_at || files[0]?.created_at || folder.created_at;
        const photoUrl = photoFile
          ? `${supabaseUrl}/storage/v1/object/public/photos/${folder.name}/photo.png`
          : null;

        return {
          id: folder.name,
          photoUrl,
          fileCount: files.length,
          burstCount: burstFiles.length,
          liveCount: liveFiles.length,
          totalSize,
          createdAt,
          format: 'folder' as const,
        };
      })
    );

    // ---- Handle OLD format: flat files at root (e.g., photo_123.png, live_123.gif) ----
    // Group root files by their timestamp suffix
    const oldSessionsMap = new Map<
      string,
      { photos: typeof rootFiles; lives: typeof rootFiles; raws: typeof rootFiles }
    >();

    for (const file of rootFiles) {
      // Match patterns: photo_TIMESTAMP.png, live_TIMESTAMP.gif, raw_TIMESTAMP.gif
      const photoMatch = file.name.match(/^photo_(\d+)\.(png|gif)$/);
      const liveMatch = file.name.match(/^live_(\d+)\.(gif|png)$/);
      const rawMatch = file.name.match(/^raw_(\d+)\.(gif|png)$/);

      const timestamp = photoMatch?.[1] || liveMatch?.[1] || rawMatch?.[1];
      if (!timestamp) continue;

      if (!oldSessionsMap.has(timestamp)) {
        oldSessionsMap.set(timestamp, { photos: [], lives: [], raws: [] });
      }
      const group = oldSessionsMap.get(timestamp)!;

      if (photoMatch) group.photos.push(file);
      else if (liveMatch) group.lives.push(file);
      else if (rawMatch) group.raws.push(file);
    }

    const oldSessions = Array.from(oldSessionsMap.entries()).map(
      ([timestamp, group]) => {
        const allFiles = [...group.photos, ...group.lives, ...group.raws];
        const totalSize = allFiles.reduce(
          (acc, f) => acc + (f.metadata?.size || 0),
          0
        );
        const pngFile = group.photos.find((f) => f.name.endsWith('.png'));
        const createdAt = pngFile?.created_at || allFiles[0]?.created_at;
        const photoUrl = pngFile
          ? `${supabaseUrl}/storage/v1/object/public/photos/${pngFile.name}`
          : null;

        return {
          id: `legacy_${timestamp}`,
          photoUrl,
          fileCount: allFiles.length,
          burstCount: group.raws.length,
          liveCount: group.lives.length,
          totalSize,
          createdAt,
          format: 'legacy' as const,
        };
      }
    );

    // Combine both formats
    const allSessions = [
      ...folderSessions.filter(Boolean),
      ...oldSessions,
    ].sort((a, b) => {
      const dateA = new Date(a!.createdAt || 0).getTime();
      const dateB = new Date(b!.createdAt || 0).getTime();
      return dateB - dateA;
    });

    return NextResponse.json({ sessions: allSessions });
  } catch (error) {
    console.error('Sessions API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { sessionIds } = await req.json();

    if (!sessionIds || !Array.isArray(sessionIds) || sessionIds.length === 0) {
      return NextResponse.json(
        { error: 'sessionIds array is required' },
        { status: 400 }
      );
    }

    let deletedCount = 0;
    const errors: string[] = [];

    for (const sessionId of sessionIds) {
      try {
        if (sessionId.startsWith('legacy_')) {
          // ---- OLD FORMAT: delete flat files from root ----
          const timestamp = sessionId.replace('legacy_', '');
          const filesToDelete = [
            `photo_${timestamp}.png`,
            `photo_${timestamp}.gif`,
            `live_${timestamp}.gif`,
            `live_${timestamp}.png`,
            `raw_${timestamp}.gif`,
            `raw_${timestamp}.png`,
          ];

          const { data, error: deleteError } = await supabase.storage
            .from('photos')
            .remove(filesToDelete);

          if (deleteError) {
            errors.push(`Failed to delete legacy ${timestamp}: ${deleteError.message}`);
            continue;
          }
          deletedCount++;
        } else {
          // ---- NEW FORMAT: delete folder contents ----
          const { data: files, error: listError } = await supabase.storage
            .from('photos')
            .list(sessionId, { limit: 200 });

          if (listError) {
            errors.push(`Failed to list files for ${sessionId}: ${listError.message}`);
            continue;
          }

          if (files && files.length > 0) {
            const filePaths = files.map((f) => `${sessionId}/${f.name}`);
            const { data, error: deleteError } = await supabase.storage
              .from('photos')
              .remove(filePaths);

            if (deleteError) {
              errors.push(`Failed to delete files for ${sessionId}: ${deleteError.message}`);
              continue;
            }
          }
          deletedCount++;
        }
      } catch (err) {
        errors.push(`Error processing ${sessionId}: ${String(err)}`);
      }
    }

    return NextResponse.json({
      deletedCount,
      totalRequested: sessionIds.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Delete sessions error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
