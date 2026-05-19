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

    // List all session folders
    const { data: folders, error } = await supabase.storage
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

    const sessionFolders = (folders || []).filter(
      (item) => item.id === null || !item.metadata
    );

    let deletedCount = 0;
    const deletedSessions: string[] = [];

    for (const folder of sessionFolders) {
      // Get files in this session to determine creation date
      const { data: files, error: filesError } = await supabase.storage
        .from('photos')
        .list(folder.name, { limit: 100 });

      if (filesError || !files || files.length === 0) continue;

      // Determine session age from the earliest file
      const createdAt = files[0]?.created_at || folder.created_at;
      if (!createdAt) continue;

      const sessionDate = new Date(createdAt);

      if (sessionDate < cutoffDate) {
        // This session is expired - delete all files
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
