import { NextRequest, NextResponse } from 'next/server';
import { ListObjectsV2Command, DeleteObjectsCommand } from '@aws-sdk/client-s3';
import { r2Client, R2_BUCKET_NAME } from '@/lib/r2';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const maxAgeDays = body.days || 30;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - maxAgeDays);

    const listCmd = new ListObjectsV2Command({
      Bucket: R2_BUCKET_NAME,
      Prefix: 'photos/',
      Delimiter: '/',
    });
    
    const { CommonPrefixes, Contents } = await r2Client.send(listCmd);

    let deletedCount = 0;
    const deletedSessions: string[] = [];

    // ---- Clean up NEW format (folder-based) ----
    if (CommonPrefixes) {
      for (const folder of CommonPrefixes) {
        const prefix = folder.Prefix!;
        const sessionId = prefix.replace('photos/', '').replace('/', '');
        
        const filesCmd = new ListObjectsV2Command({
          Bucket: R2_BUCKET_NAME,
          Prefix: prefix,
        });
        
        const { Contents: files } = await r2Client.send(filesCmd);
        
        if (!files || files.length === 0) continue;
        
        const createdAt = files[0].LastModified;
        if (!createdAt) continue;
        
        if (new Date(createdAt) < cutoffDate) {
          const deleteCmd = new DeleteObjectsCommand({
            Bucket: R2_BUCKET_NAME,
            Delete: {
              Objects: files.map((f) => ({ Key: f.Key! })),
            },
          });
          
          await r2Client.send(deleteCmd);
          deletedCount++;
          deletedSessions.push(sessionId);
        }
      }
    }

    // ---- Clean up OLD format (flat files) ----
    const rootFiles = (Contents || []).filter((f) => f.Key !== 'photos/');
    const oldTimestamps = new Map<string, string[]>();
    
    for (const file of rootFiles) {
      const name = file.Key!.replace('photos/', '');
      const match = name.match(/^(?:photo|live|raw)_(\d+)\./);
      if (!match) continue;
      
      const timestamp = match[1];
      if (!oldTimestamps.has(timestamp)) {
        oldTimestamps.set(timestamp, []);
      }
      oldTimestamps.get(timestamp)!.push(file.Key!);
    }

    for (const [timestamp, keys] of oldTimestamps.entries()) {
      const sessionDate = new Date(parseInt(timestamp));
      if (isNaN(sessionDate.getTime())) continue;

      if (sessionDate < cutoffDate) {
        const deleteCmd = new DeleteObjectsCommand({
          Bucket: R2_BUCKET_NAME,
          Delete: {
            Objects: keys.map((Key) => ({ Key })),
          },
        });
        
        await r2Client.send(deleteCmd);
        deletedCount++;
        deletedSessions.push(`legacy_${timestamp}`);
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
