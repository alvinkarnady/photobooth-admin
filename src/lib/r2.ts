import { S3Client } from '@aws-sdk/client-s3';

// Access Key ID : bac053d672c1ea02eb8675e4957e365d
// Secret Access Key : 12d428bdfb47e6ac86141eb7c9932887f198443684b2a78a654bd95343243f0e
// Endpoint: https://6887cbc03fa3869744098f1402cfce98.r2.cloudflarestorage.com

const accountId = '6887cbc03fa3869744098f1402cfce98';
const accessKeyId = process.env.R2_ACCESS_KEY_ID || 'bac053d672c1ea02eb8675e4957e365d';
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || '12d428bdfb47e6ac86141eb7c9932887f198443684b2a78a654bd95343243f0e';

export const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'photobooth-media';
export const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || 'https://pub-39bcbb6191eb4a958c8210dc87371845.r2.dev';
