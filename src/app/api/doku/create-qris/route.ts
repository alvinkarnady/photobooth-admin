import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

/**
 * DOKU SNAP QRIS Integration
 * 
 * Flow:
 * 1. Get Access Token B2B (POST /authorization/v1/access-token/b2b)
 * 2. Generate QRIS (POST /snap-adapter/b2b/v1.0/qr/qr-mpm-generate)
 * 
 * Required env vars:
 * - DOKU_CLIENT_ID
 * - DOKU_SECRET_KEY (used as clientSecret for symmetric signature)
 * - DOKU_IS_PROD
 * - NEXT_PUBLIC_SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 */

export async function POST(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error("Supabase credentials missing in .env");
      return NextResponse.json(
        { error: "Server configuration error: Supabase" },
        { status: 500 },
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { amount } = await req.json();

    // --- DOKU Configuration ---
    const clientId = process.env.DOKU_CLIENT_ID;
    const secretKey = process.env.DOKU_SECRET_KEY;
    const isProd = process.env.DOKU_IS_PROD === "true";
    const baseUrl = isProd
      ? "https://api.doku.com"
      : "https://api-sandbox.doku.com";

    if (!clientId || !secretKey) {
      console.error("DOKU credentials missing in .env");
      return NextResponse.json(
        { error: "Server configuration error: DOKU" },
        { status: 500 },
      );
    }

    // ====================================
    // STEP 1: Get Access Token B2B
    // ====================================
    const timestamp = new Date().toISOString(); // e.g. 2026-06-05T08:00:00.000Z
    
    // Asymmetric Signature for Access Token:
    // Since we don't have RSA Private Key, we use HMAC-SHA256 with Secret Key as a workaround
    // Formula: HMAC-SHA256(secretKey, clientId + "|" + timestamp)
    const stringToSign = `${clientId}|${timestamp}`;
    const asymmetricSignature = crypto
      .createHmac("sha256", secretKey)
      .update(stringToSign)
      .digest("base64");

    const tokenResponse = await fetch(
      `${baseUrl}/authorization/v1/access-token/b2b`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CLIENT-KEY": clientId,
          "X-TIMESTAMP": timestamp,
          "X-SIGNATURE": asymmetricSignature,
        },
        body: JSON.stringify({ grantType: "client_credentials" }),
      },
    );

    const tokenData = await tokenResponse.json();
    console.log("DOKU Token Response:", JSON.stringify(tokenData, null, 2));

    if (!tokenResponse.ok || !tokenData.accessToken) {
      console.error("DOKU Token Error:", tokenData);
      return NextResponse.json(
        {
          error: `Gagal mendapatkan token DOKU: ${tokenData.responseMessage || JSON.stringify(tokenData)}`,
        },
        { status: 400 },
      );
    }

    const accessToken = tokenData.accessToken;

    // ====================================
    // STEP 2: Generate QRIS using SNAP API
    // ====================================
    const orderId = `MEMOIRE-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const externalId = `${Date.now()}`;
    const qrisTimestamp = new Date().toISOString();
    const targetPath = "/snap-adapter/b2b/v1.0/qr/qr-mpm-generate";

    // Request Body per DOKU SNAP spec
    const qrisBody = {
      partnerReferenceNo: orderId,
      amount: {
        value: `${amount}.00`, // e.g. "20000.00"
        currency: "IDR",
      },
      merchantId: clientId, // Use Client ID as merchantId for sandbox
      terminalId: "MEMOIRE01",
      additionalInfo: {
        postalCode: "90234", // Makassar postal code
        feeType: "1", // No Tips
      },
    };
    const qrisBodyString = JSON.stringify(qrisBody);

    // Symmetric Signature for Transaction API:
    // Formula: HMAC-SHA512(secretKey, HTTPMethod + ":" + EndpointUrl + ":" + AccessToken + ":" + Lowercase(HexEncode(SHA-256(minify(RequestBody)))) + ":" + TimeStamp)
    const bodyHash = crypto
      .createHash("sha256")
      .update(qrisBodyString)
      .digest("hex")
      .toLowerCase();
    const symmetricStringToSign = `POST:${targetPath}:${accessToken}:${bodyHash}:${qrisTimestamp}`;
    const symmetricSignature = crypto
      .createHmac("sha512", secretKey)
      .update(symmetricStringToSign)
      .digest("base64");

    const qrisResponse = await fetch(`${baseUrl}${targetPath}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-PARTNER-ID": clientId,
        "X-EXTERNAL-ID": externalId,
        "X-TIMESTAMP": qrisTimestamp,
        "X-SIGNATURE": symmetricSignature,
        Authorization: `Bearer ${accessToken}`,
        "CHANNEL-ID": "H2H",
      },
      body: qrisBodyString,
    });

    const qrisData = await qrisResponse.json();
    console.log(
      "DOKU QRIS Response:",
      JSON.stringify(qrisData, null, 2),
    );

    // Extract QR content - SNAP API returns "qrContent" (camelCase)
    const qrContent = qrisData.qrContent;

    if (!qrContent) {
      console.error("DOKU QRIS Error - no qrContent:", qrisData);
      return NextResponse.json(
        {
          error: `Gagal membuat QRIS: ${qrisData.responseMessage || JSON.stringify(qrisData)}`,
          debug: qrisData, // include full response for debugging
        },
        { status: 400 },
      );
    }

    // ====================================
    // STEP 3: Save to Supabase
    // ====================================
    const { error: dbError } = await supabase.from("transactions").insert({
      order_id: orderId,
      amount: amount,
      status: "pending",
      qr_string: qrContent,
      provider: "doku",
    });

    if (dbError) {
      console.error("Supabase Insert Error:", dbError);
      return NextResponse.json(
        { error: "Gagal menyimpan transaksi ke database." },
        { status: 500 },
      );
    }

    // Return to Flutter
    return NextResponse.json({
      qr_url: qrContent,
      order_id: orderId,
    });
  } catch (err: any) {
    console.error("create-qris API Exception:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
