import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

/**
 * DOKU SNAP QRIS Integration (Production)
 *
 * Flow:
 * 1. Get Access Token B2B (POST /authorization/v1/access-token/b2b)
 *    - Uses RSA-SHA256 asymmetric signature with Merchant Private Key
 * 2. Generate QRIS (POST /snap-adapter/b2b/v1.0/qr/qr-mpm-generate)
 *    - Uses HMAC-SHA512 symmetric signature with Secret Key
 *
 * Required env vars:
 * - DOKU_CLIENT_ID
 * - DOKU_SECRET_KEY
 * - DOKU_PRIVATE_KEY (RSA PEM format)
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
    const privateKeyPem = process.env.DOKU_PRIVATE_KEY;
    const isProd = process.env.DOKU_IS_PROD === "true";
    const baseUrl = isProd
      ? "https://api.doku.com"
      : "https://api-sandbox.doku.com";

    if (!clientId || !secretKey) {
      console.error("DOKU credentials missing in .env");
      return NextResponse.json(
        { error: "Server configuration error: DOKU credentials" },
        { status: 500 },
      );
    }

    if (!privateKeyPem) {
      console.error("DOKU_PRIVATE_KEY missing in .env");
      return NextResponse.json(
        { error: "Server configuration error: DOKU private key" },
        { status: 500 },
      );
    }

    // Parse the private key (handle escaped newlines from env var)
    const privateKey = privateKeyPem.replace(/\\n/g, "\n");

    // ====================================
    // STEP 1: Get Access Token B2B
    // ====================================
    // Timestamp in ISO8601 format required by DOKU SNAP: YYYY-MM-DDTHH:mm:ss+07:00
    // Must NOT have milliseconds, must have timezone offset (not 'Z')
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");
    const timestamp = `${now.getUTCFullYear()}-${pad(now.getUTCMonth() + 1)}-${pad(now.getUTCDate())}T${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}:${pad(now.getUTCSeconds())}Z`;

    // Asymmetric Signature: RSA-SHA256 with Merchant Private Key
    // StringToSign = clientId + "|" + timestamp
    const stringToSign = `${clientId}|${timestamp}`;

    const asymmetricSignature = crypto
      .sign("sha256", Buffer.from(stringToSign), {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_PADDING,
      })
      .toString("base64");

    console.log("DOKU: Requesting access token...");
    console.log("DOKU: Base URL:", baseUrl);
    console.log("DOKU: Client ID:", clientId);
    console.log("DOKU: Timestamp:", timestamp);

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
    const qrisNow = new Date();
    const qrisTimestamp = `${qrisNow.getUTCFullYear()}-${pad(qrisNow.getUTCMonth() + 1)}-${pad(qrisNow.getUTCDate())}T${pad(qrisNow.getUTCHours())}:${pad(qrisNow.getUTCMinutes())}:${pad(qrisNow.getUTCSeconds())}Z`;
    const targetPath = "/snap-adapter/b2b/v1.0/qr/qr-mpm-generate";

    // Format amount: must be string with 2 decimal places (e.g. "20000.00")
    const formattedAmount = `${Number(amount).toFixed(2)}`;

    // Request Body per DOKU SNAP spec
    // Try using QRIS checkout Client ID as merchantId
    const qrisBody = {
      partnerReferenceNo: orderId,
      merchantId: "95525",
      terminalId: "A01",
      amount: {
        value: formattedAmount,
        currency: "IDR",
      },
      feeType: "MERCHANT",
      additionalInfo: {
        postalCode: "90234",
      },
    };
    const qrisBodyString = JSON.stringify(qrisBody);
    console.log("DOKU: QRIS Request Body:", qrisBodyString);

    // Symmetric Signature for Transaction API:
    // HMAC-SHA512(secretKey, HTTPMethod + ":" + EndpointUrl + ":" + AccessToken + ":" + Lowercase(HexEncode(SHA-256(minify(RequestBody)))) + ":" + TimeStamp)
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

    console.log("DOKU: Generating QRIS...");
    console.log("DOKU: Order ID:", orderId);
    console.log("DOKU: Amount:", formattedAmount);

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
          debug: qrisData,
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

    console.log("DOKU: QRIS created successfully for order:", orderId);

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
