import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service-level or anon key for storage operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    // List all folders (sessions) in the photos bucket
    const { data: folders, error } = await supabase.storage
      .from('photos')
      .list('', {
        limit: 1000,
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (error) {
      console.error('Error listing sessions:', error);
      return NextResponse.json({ error: 'Failed to list sessions' }, { status: 500 });
    }

    // Filter out non-folder items (actual session folders)
    // Supabase storage list returns both files and folders
    // Folders have id = null in some cases, or we detect by metadata
    const sessionFolders = (folders || []).filter(
      (item) => item.id === null || !item.metadata
    );

    // For each session folder, get its contents
    const sessions = await Promise.all(
      sessionFolders.map(async (folder) => {
        const { data: files, error: filesError } = await supabase.storage
          .from('photos')
          .list(folder.name, { limit: 100 });

        if (filesError || !files) {
          return null;
        }

        // Count file types
        const photoFile = files.find((f) => f.name === 'photo.png');
        const burstFiles = files.filter((f) => f.name.startsWith('burst_'));
        const liveFiles = files.filter((f) => f.name.startsWith('live_'));
        const totalSize = files.reduce(
          (acc, f) => acc + (f.metadata?.size || 0),
          0
        );

        // Get created_at from the photo file or first file
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
        };
      })
    );

    // Filter out nulls and sort by createdAt descending
    const validSessions = sessions
      .filter(Boolean)
      .sort((a, b) => {
        const dateA = new Date(a!.createdAt || 0).getTime();
        const dateB = new Date(b!.createdAt || 0).getTime();
        return dateB - dateA;
      });

    return NextResponse.json({ sessions: validSessions });
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
        // List all files in the session folder
        const { data: files, error: listError } = await supabase.storage
          .from('photos')
          .list(sessionId, { limit: 100 });

        if (listError) {
          errors.push(`Failed to list files for ${sessionId}: ${listError.message}`);
          continue;
        }

        if (files && files.length > 0) {
          const filePaths = files.map((f) => `${sessionId}/${f.name}`);
          const { error: deleteError } = await supabase.storage
            .from('photos')
            .remove(filePaths);

          if (deleteError) {
            errors.push(`Failed to delete files for ${sessionId}: ${deleteError.message}`);
            continue;
          }
        }

        deletedCount++;
      } catch (err) {
        errors.push(`Error processing ${sessionId}: ${String(err)}`);
      }
    }

    return NextResponse.json({
      deletedCount,
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
