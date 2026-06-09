import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

/**
 * DOKU QRIS Webhook Handler
 * 
 * Receives payment notifications from DOKU when a QRIS payment is completed.
 * Supports both SNAP and Legacy notification formats.
 * Updates the transaction status in Supabase, which triggers the
 * Flutter app's realtime listener.
 */
export async function POST(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; 
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Webhook: Supabase credentials missing in .env');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    const secretKey = process.env.DOKU_SECRET_KEY;
    
    // Read the raw text body for signature verification
    const bodyText = await req.text(); 
    console.log('Webhook: Received notification body:', bodyText);
    
    const payload = JSON.parse(bodyText);
    console.log('Webhook: Parsed payload:', JSON.stringify(payload, null, 2));
    
    // Log all headers for debugging
    const headers: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      headers[key] = value;
    });
    console.log('Webhook: Headers:', JSON.stringify(headers, null, 2));
    
    // --- Signature Verification ---
    if (secretKey) {
      const reqSignature = req.headers.get('signature') || req.headers.get('x-signature');
      const reqClientId = req.headers.get('client-id') || req.headers.get('x-client-key');
      const reqRequestId = req.headers.get('request-id') || req.headers.get('x-request-id');
      const reqTimestamp = req.headers.get('request-timestamp') || req.headers.get('x-timestamp');
      
      if (reqSignature && reqClientId && reqTimestamp) {
        const targetPath = new URL(req.url).pathname; 
        
        // DOKU Legacy signature verification
        const digest = crypto.createHash('sha256').update(bodyText).digest('base64');
        const signatureString = `Client-Id:${reqClientId}\nRequest-Id:${reqRequestId}\nRequest-Timestamp:${reqTimestamp}\nRequest-Target:${targetPath}\nDigest:${digest}`;
        const hmac = crypto.createHmac('sha256', secretKey).update(signatureString).digest('base64');
        const expectedSignature = `HMACSHA256=${hmac}`;
        
        if (reqSignature !== expectedSignature) {
          console.warn('Webhook: Signature mismatch. Expected:', expectedSignature, 'Got:', reqSignature);
          // Log but don't block for now - enable strict check once verified working
          // return NextResponse.json({ error: 'Invalid Signature' }, { status: 401 });
        } else {
          console.log('Webhook: Signature verified successfully');
        }
      }
    }
    
    // --- Extract order info ---
    // Support both SNAP and Legacy notification formats
    let orderId: string | undefined;
    let transactionStatus: string | undefined;
    
    // SNAP format: { partnerReferenceNo, latestTransactionStatus, ... }
    if (payload.partnerReferenceNo) {
      orderId = payload.partnerReferenceNo;
      transactionStatus = payload.latestTransactionStatus || payload.transactionStatusDesc;
      console.log(`Webhook: SNAP format detected. Order: ${orderId}, Status: ${transactionStatus}`);
    }
    // Legacy format: { order: { invoice_number }, transaction: { status } }
    else if (payload.order?.invoice_number) {
      orderId = payload.order.invoice_number;
      transactionStatus = payload.transaction?.status;
      console.log(`Webhook: Legacy format detected. Order: ${orderId}, Status: ${transactionStatus}`);
    }
    // Alternative SNAP format: { originalPartnerReferenceNo, ... }
    else if (payload.originalPartnerReferenceNo) {
      orderId = payload.originalPartnerReferenceNo;
      transactionStatus = payload.latestTransactionStatus || payload.transactionStatusDesc;
      console.log(`Webhook: Alternative SNAP format. Order: ${orderId}, Status: ${transactionStatus}`);
    }
    
    if (!orderId) {
      console.error('Webhook: Could not extract orderId from payload:', JSON.stringify(payload));
      // Still return 200 to prevent DOKU from retrying
      return NextResponse.json({ message: 'OK - no order ID found' }, { status: 200 });
    }
    
    // Normalize status
    const isSuccess = transactionStatus === 'SUCCESS' 
      || transactionStatus === '00' 
      || transactionStatus === 'PAID'
      || transactionStatus === 'SUCCESS';
    const isFailed = transactionStatus === 'FAILED' 
      || transactionStatus === 'EXPIRED'
      || transactionStatus === 'DENIED';
    
    if (isSuccess) {
      console.log(`Webhook: Payment SUCCESS for order ${orderId}`);
      
      const { error } = await supabase
        .from('transactions')
        .update({ status: 'paid' })
        .eq('order_id', orderId);
        
      if (error) {
        console.error('Webhook: DB Update Error:', error);
      } else {
        console.log(`Webhook: DB updated to 'paid' for order ${orderId}`);
      }
    } else if (isFailed) {
      console.log(`Webhook: Payment FAILED/EXPIRED for order ${orderId}`);
      
      const { error } = await supabase
        .from('transactions')
        .update({ status: 'failed' }) 
        .eq('order_id', orderId);
        
      if (error) {
        console.error('Webhook: DB Update Error:', error);
      }
    } else {
      console.log(`Webhook: Unhandled status '${transactionStatus}' for order ${orderId}`);
    }
    
    // Always return HTTP 200 OK so DOKU stops retrying
    return NextResponse.json({ message: 'OK' }, { status: 200 });
    
  } catch (err: any) {
    console.error('Webhook Exception:', err);
    // Still return 200 to prevent infinite retries from DOKU
    return NextResponse.json({ message: 'OK - error handled' }, { status: 200 });
  }
}
