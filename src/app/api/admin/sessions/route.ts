import { NextRequest, NextResponse } from 'next/server';
import { ListObjectsV2Command, DeleteObjectsCommand } from '@aws-sdk/client-s3';
import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL } from '@/lib/r2';

export async function GET() {
  try {
    const listCmd = new ListObjectsV2Command({
      Bucket: R2_BUCKET_NAME,
      Prefix: 'photos/',
      Delimiter: '/',
    });
    
    const { CommonPrefixes, Contents } = await r2Client.send(listCmd);
    
    // ---- Handle NEW format: folder-based sessions (e.g., {sessionId}/photo.png) ----
    const folderSessions = await Promise.all(
      (CommonPrefixes || []).map(async (folder) => {
        const prefix = folder.Prefix!;
        const sessionId = prefix.replace('photos/', '').replace('/', '');
        
        const filesCmd = new ListObjectsV2Command({
          Bucket: R2_BUCKET_NAME,
          Prefix: prefix,
        });
        
        const { Contents: files } = await r2Client.send(filesCmd);
        
        if (!files || files.length === 0) return null;
        
        const photoFile = files.find(f => f.Key?.endsWith('photo.png'));
        const burstFiles = files.filter(f => f.Key?.includes('burst_'));
        const liveFiles = files.filter(f => f.Key?.includes('live_'));
        
        const totalSize = files.reduce((acc, f) => acc + (f.Size || 0), 0);
        const createdAt = photoFile?.LastModified || files[0].LastModified;
        const photoUrl = photoFile ? `${R2_PUBLIC_URL}/${photoFile.Key}` : null;
        
        return {
          id: sessionId,
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
    const rootFiles = (Contents || []).filter(f => f.Key !== 'photos/');
    const oldSessionsMap = new Map<
      string,
      { photos: typeof rootFiles; lives: typeof rootFiles; raws: typeof rootFiles }
    >();
    
    for (const file of rootFiles) {
      const name = file.Key!.replace('photos/', '');
      const photoMatch = name.match(/^photo_(\d+)\.(png|gif)$/);
      const liveMatch = name.match(/^live_(\d+)\.(gif|png)$/);
      const rawMatch = name.match(/^raw_(\d+)\.(gif|png)$/);

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
    
    const oldSessions = Array.from(oldSessionsMap.entries()).map(([timestamp, group]) => {
      const allFiles = [...group.photos, ...group.lives, ...group.raws];
      const totalSize = allFiles.reduce((acc, f) => acc + (f.Size || 0), 0);
      const pngFile = group.photos.find(f => f.Key!.endsWith('.png'));
      const createdAt = pngFile?.LastModified || allFiles[0]?.LastModified;
      const photoUrl = pngFile ? `${R2_PUBLIC_URL}/${pngFile.Key}` : null;
      
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
    });
    
    // Combine both formats
    const allSessions = [...folderSessions.filter(Boolean), ...oldSessions].sort((a, b) => {
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
        let keysToDelete: string[] = [];

        if (sessionId.startsWith('legacy_')) {
          // ---- OLD FORMAT: delete flat files from root ----
          const timestamp = sessionId.replace('legacy_', '');
          keysToDelete = [
            `photos/photo_${timestamp}.png`,
            `photos/photo_${timestamp}.gif`,
            `photos/live_${timestamp}.gif`,
            `photos/live_${timestamp}.png`,
            `photos/raw_${timestamp}.gif`,
            `photos/raw_${timestamp}.png`,
          ];
        } else {
          // ---- NEW FORMAT: delete folder contents ----
          const filesCmd = new ListObjectsV2Command({
            Bucket: R2_BUCKET_NAME,
            Prefix: `photos/${sessionId}/`,
          });
          const { Contents } = await r2Client.send(filesCmd);

          if (Contents && Contents.length > 0) {
            keysToDelete = Contents.map((f) => f.Key!).filter(Boolean);
          }
        }

        if (keysToDelete.length > 0) {
          const deleteCmd = new DeleteObjectsCommand({
            Bucket: R2_BUCKET_NAME,
            Delete: {
              Objects: keysToDelete.map((Key) => ({ Key })),
            },
          });
          await r2Client.send(deleteCmd);
        }
        deletedCount++;
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
