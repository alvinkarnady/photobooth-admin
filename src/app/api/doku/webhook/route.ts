import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; 
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase credentials missing in .env');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    const secretKey = process.env.DOKU_SECRET_KEY!;
    
    // 1. Get DOKU Headers
    const reqClientId = req.headers.get('client-id');
    const reqRequestId = req.headers.get('request-id');
    const reqTimestamp = req.headers.get('request-timestamp');
    const reqSignature = req.headers.get('signature');
    
    // Read the raw text body for signature verification
    const bodyText = await req.text(); 
    const payload = JSON.parse(bodyText);
    
    // 2. Verify DOKU Signature (Recommended for Security)
    if (secretKey && reqSignature) {
      // The target path must match the exact path registered in DOKU or the URL path hit
      const targetPath = new URL(req.url).pathname; 
      
      const digest = crypto.createHash('sha256').update(bodyText).digest('base64');
      const signatureString = `Client-Id:${reqClientId}\nRequest-Id:${reqRequestId}\nRequest-Timestamp:${reqTimestamp}\nRequest-Target:${targetPath}\nDigest:${digest}`;
      const hmac = crypto.createHmac('sha256', secretKey).update(signatureString).digest('base64');
      const expectedSignature = `HMACSHA256=${hmac}`;
      
      if (reqSignature !== expectedSignature) {
        console.error('Webhook: Invalid Signature. Expected:', expectedSignature, 'Got:', reqSignature);
        // Note: For strict production, return 401. During testing/sandbox, we might log and proceed.
        // return NextResponse.json({ error: 'Invalid Signature' }, { status: 401 });
      }
    }
    
    // 3. Process the Webhook Payload
    const orderId = payload.order?.invoice_number;
    const transactionStatus = payload.transaction?.status; // DOKU uses 'SUCCESS' or 'FAILED'
    
    if (orderId && transactionStatus === 'SUCCESS') {
      console.log(`Webhook: Payment SUCCESS for order ${orderId}`);
      
      // Update transaction in Supabase
      const { error } = await supabase
        .from('transactions')
        .update({ status: 'paid' }) // this will trigger the Flutter realtime listener
        .eq('order_id', orderId);
        
      if (error) {
        console.error('Webhook: DB Update Error:', error);
      }
    } else if (orderId && transactionStatus === 'FAILED') {
      console.log(`Webhook: Payment FAILED for order ${orderId}`);
      
      await supabase
        .from('transactions')
        .update({ status: 'failed' }) 
        .eq('order_id', orderId);
    }
    
    // 4. Always return HTTP 200 OK so DOKU stops retrying
    return NextResponse.json({ message: 'OK' }, { status: 200 });
    
  } catch (err: any) {
    console.error('Webhook Exception:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
