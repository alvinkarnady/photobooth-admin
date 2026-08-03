import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { uploadLutAsset } from "@/lib/r2";

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await query(
    `SELECT id, name, lut_url, is_active, created_at
     FROM lut_filters
     ORDER BY created_at DESC`,
  );
  return NextResponse.json(result.rows);
}

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const form = await req.formData();
    const name = String(form.get("name") || "").trim();
    const file = form.get("file");
    const id = String(form.get("id") || randomUUID()).trim() || randomUUID();

    if (!name) {
      return NextResponse.json({ error: "Nama wajib diisi" }, { status: 400 });
    }
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File PNG wajib diunggah" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const lutUrl = await uploadLutAsset(id, buffer, file.type || "image/png");

    const result = await query(
      `INSERT INTO lut_filters (id, name, lut_url, is_active)
       VALUES ($1, $2, $3, true)
       RETURNING id, name, lut_url, is_active, created_at`,
      [id, name, lutUrl],
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("Create LUT error:", error);
    return NextResponse.json({ error: "Gagal mengupload LUT" }, { status: 500 });
  }
}
