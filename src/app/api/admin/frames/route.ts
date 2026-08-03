import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { uploadFrameAsset } from "@/lib/r2";

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await query(
    `SELECT id, name, layout, paper_size_category, overlay_image_path,
            primary_color, background_color, canvas_width, canvas_height,
            photo_slots, is_active, sort_order, created_at, updated_at
     FROM frames
     ORDER BY sort_order ASC, created_at DESC`,
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
    const file = form.get("file");
    const name = String(form.get("name") || "").trim();
    const paperSizeCategory = String(form.get("paper_size_category") || "").trim();
    const canvasWidth = Number(form.get("canvas_width") || 0);
    const canvasHeight = Number(form.get("canvas_height") || 0);
    const primaryColor = Number(form.get("primary_color") || 4293361251);
    const backgroundColor = Number(form.get("background_color") || 4294765804);
    const id = String(form.get("id") || randomUUID()).trim() || randomUUID();

    let photoSlots: unknown = [];
    const slotsRaw = form.get("photo_slots");
    if (typeof slotsRaw === "string" && slotsRaw.trim()) {
      photoSlots = JSON.parse(slotsRaw);
    }

    if (!name) {
      return NextResponse.json({ error: "Nama wajib diisi" }, { status: 400 });
    }
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File PNG wajib diunggah" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const overlayUrl = await uploadFrameAsset(id, buffer, file.type || "image/png");

    const maxSort = await query<{ max: number | null }>(
      "SELECT MAX(sort_order) AS max FROM frames",
    );
    const sortOrder = (maxSort.rows[0]?.max ?? -1) + 1;

    const result = await query(
      `INSERT INTO frames (
         id, name, layout, paper_size_category, overlay_image_path,
         primary_color, background_color, canvas_width, canvas_height,
         photo_slots, is_active, sort_order
       ) VALUES (
         $1, $2, 'custom', $3, $4,
         $5, $6, $7, $8,
         $9::jsonb, true, $10
       )
       RETURNING id, name, layout, paper_size_category, overlay_image_path,
                 primary_color, background_color, canvas_width, canvas_height,
                 photo_slots, is_active, sort_order, created_at, updated_at`,
      [
        id,
        name,
        paperSizeCategory || null,
        overlayUrl,
        primaryColor,
        backgroundColor,
        canvasWidth || null,
        canvasHeight || null,
        JSON.stringify(photoSlots),
        sortOrder,
      ],
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("Create frame error:", error);
    return NextResponse.json(
      { error: "Gagal membuat frame" },
      { status: 500 },
    );
  }
}
