import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Must use Service Role to bypass RLS for inserting

    if (!supabaseUrl || !supabaseKey) {
      console.error("Supabase credentials missing in .env");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { amount } = await req.json();

    // 1. Generate unique Order ID / Invoice Number
    const orderId = `MEMOIRE-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // 2. DOKU Configuration
    const clientId = process.env.DOKU_CLIENT_ID;
    const secretKey = process.env.DOKU_SECRET_KEY;
    const isProd = process.env.DOKU_IS_PROD === "true";
    const baseUrl = isProd
      ? "https://api.doku.com"
      : "https://api-sandbox.doku.com";
    const targetPath = "/qris/v1/qr/generate";

    if (!clientId || !secretKey) {
      console.error("DOKU credentials missing in .env");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    const requestId = crypto.randomUUID();
    const timestamp = new Date().toISOString(); // UTC format

    // 3. Prepare Body & Digest
    const body = {
      order: {
        invoice_number: orderId,
        amount: amount,
        callback_url: 'https://memoire.phinisitech.com/api/doku/webhook' // Sometimes used in older API
      },
      additional_info: {
        override_notification_url: 'https://memoire.phinisitech.com/api/doku/webhook'
      },
      notifyUrl: 'https://memoire.phinisitech.com/api/doku/webhook',
      notify_url: 'https://memoire.phinisitech.com/api/doku/webhook'
    };
    const bodyString = JSON.stringify(body);

    const hash = crypto.createHash("sha256").update(bodyString).digest();
    const digest = hash.toString("base64");

    // 4. Generate Signature (HMAC-SHA256)
    const signatureString = `Client-Id:${clientId}\nRequest-Id:${requestId}\nRequest-Timestamp:${timestamp}\nRequest-Target:${targetPath}\nDigest:${digest}`;
    const hmac = crypto
      .createHmac("sha256", secretKey)
      .update(signatureString)
      .digest();
    const signature = `HMACSHA256=${hmac.toString("base64")}`;

    // 5. Hit DOKU API
    const response = await fetch(baseUrl + targetPath, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Client-Id": clientId,
        "Request-Id": requestId,
        "Request-Timestamp": timestamp,
        Signature: signature,
      },
      body: bodyString,
    });

    const dokuData = await response.json();

    if (!response.ok || !dokuData.response?.qr_content) {
      console.error("DOKU API Error:", dokuData);
      return NextResponse.json(
        { error: "Gagal membuat QRIS dari DOKU." },
        { status: 400 },
      );
    }

    const qrString = dokuData.response.qr_content;

    // 6. Save to Supabase (Transactions Table)
    const { error: dbError } = await supabase.from("transactions").insert({
      order_id: orderId,
      amount: amount,
      status: "pending",
      qr_string: qrString,
      provider: "doku", // optional context
    });

    if (dbError) {
      console.error("Supabase Insert Error:", dbError);
      return NextResponse.json(
        { error: "Gagal menyimpan transaksi ke database." },
        { status: 500 },
      );
    }

    // 7. Return payload back to Flutter app
    return NextResponse.json({
      qr_url: qrString, // Note: returning qr_string as qr_url so it fits Flutter's existing variable
      order_id: orderId,
    });
  } catch (err: any) {
    console.error("create-qris API Exception:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
