import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

/**
 * DOKU QRIS Webhook Handler
 * 
 * Receives payment notifications from DOKU when a QRIS payment is completed.
 * 
 * DOKU QRIS notification format:
 * - Query params: WORDS, ACQUIRER, INVOICE, TRANSACTIONID, AMOUNT, TXNDATE, 
 *   MERCHANTPAN, REFERENCEID, TXNSTATUS, etc.
 * - JSON body: { transactionId, activityCode, message, processDate }
 * 
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
    
    // Parse URL query parameters (DOKU QRIS notification format)
    const url = new URL(req.url);
    const queryParams: Record<string, string> = {};
    url.searchParams.forEach((value, key) => {
      queryParams[key] = value;
    });
    
    // Read body
    const bodyText = await req.text();
    let bodyPayload: any = {};
    try {
      if (bodyText) {
        bodyPayload = JSON.parse(bodyText);
      }
    } catch {
      // Body might not be JSON
      bodyPayload = {};
    }
    
    // Log everything for debugging
    console.log('Webhook: Query params:', JSON.stringify(queryParams, null, 2));
    console.log('Webhook: Body:', bodyText);
    console.log('Webhook: Parsed body:', JSON.stringify(bodyPayload, null, 2));
    
    // Log headers
    const headers: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      headers[key] = value;
    });
    console.log('Webhook: Headers:', JSON.stringify(headers, null, 2));
    
    // --- Extract order info ---
    let orderId: string | undefined;
    let isSuccess = false;
    let isFailed = false;
    
    // Format 1: DOKU QRIS Direct Notification (query parameters)
    if (queryParams.INVOICE) {
      orderId = queryParams.INVOICE;
      const txnStatus = queryParams.TXNSTATUS;
      const message = bodyPayload.message || '';
      
      isSuccess = txnStatus === 'S' || txnStatus === 'SUCCESS' || message.includes('Success');
      isFailed = txnStatus === 'F' || txnStatus === 'FAILED' || message.includes('Failed');
      
      console.log(`Webhook: DOKU QRIS format. Order: ${orderId}, TxnStatus: ${txnStatus}, Message: ${message}`);
      
      // Verify WORDS signature if available
      const secretKey = process.env.DOKU_SECRET_KEY;
      if (secretKey && queryParams.WORDS) {
        const amount = queryParams.AMOUNT || '';
        const transactionId = queryParams.TRANSACTIONID || '';
        // DOKU WORDS = SHA256(AMOUNT + SHAREDKEY + INVOICE + STATUSCODE)
        const wordsInput = `${amount}${secretKey}${orderId}${txnStatus}`;
        const expectedWords = crypto.createHash('sha1').update(wordsInput).digest('hex');
        
        if (queryParams.WORDS !== expectedWords) {
          console.warn('Webhook: WORDS verification failed. Expected:', expectedWords, 'Got:', queryParams.WORDS);
        } else {
          console.log('Webhook: WORDS verified successfully');
        }
      }
    }
    // Format 2: SNAP format (JSON body with partnerReferenceNo)
    else if (bodyPayload.partnerReferenceNo) {
      orderId = bodyPayload.partnerReferenceNo;
      const status = bodyPayload.latestTransactionStatus || bodyPayload.transactionStatusDesc;
      isSuccess = status === 'SUCCESS' || status === '00' || status === 'PAID';
      isFailed = status === 'FAILED' || status === 'EXPIRED' || status === 'DENIED';
      console.log(`Webhook: SNAP format. Order: ${orderId}, Status: ${status}`);
    }
    // Format 3: Legacy format (JSON body with order.invoice_number)
    else if (bodyPayload.order?.invoice_number) {
      orderId = bodyPayload.order.invoice_number;
      const status = bodyPayload.transaction?.status;
      isSuccess = status === 'SUCCESS';
      isFailed = status === 'FAILED';
      console.log(`Webhook: Legacy format. Order: ${orderId}, Status: ${status}`);
    }
    
    if (!orderId) {
      console.error('Webhook: Could not extract orderId from notification');
      return new Response('CONTINUE', { status: 200 });
    }
    
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
      console.log(`Webhook: Payment FAILED for order ${orderId}`);
      
      const { error } = await supabase
        .from('transactions')
        .update({ status: 'failed' }) 
        .eq('order_id', orderId);
        
      if (error) {
        console.error('Webhook: DB Update Error:', error);
      }
    } else {
      console.log(`Webhook: Pending/unknown status for order ${orderId}`);
    }
    
    // DOKU expects "CONTINUE" as response for QRIS notifications
    return new Response('CONTINUE', { status: 200 });
    
  } catch (err: any) {
    console.error('Webhook Exception:', err);
    return new Response('CONTINUE', { status: 200 });
  }
}
