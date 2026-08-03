import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { deleteFrameAsset, uploadFrameAsset } from "@/lib/r2";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, context: RouteContext) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const result = await query(
    `SELECT id, name, layout, paper_size_category, overlay_image_path,
            primary_color, background_color, canvas_width, canvas_height,
            photo_slots, is_active, sort_order, created_at, updated_at
     FROM frames
     WHERE id = $1`,
    [id],
  );

  if (result.rows.length === 0) {
    return NextResponse.json({ error: "Frame tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json(result.rows[0]);
}

export async function PATCH(req: Request, context: RouteContext) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const existing = await query("SELECT id FROM frames WHERE id = $1", [id]);
    if (existing.rows.length === 0) {
      return NextResponse.json({ error: "Frame tidak ditemukan" }, { status: 404 });
    }

    const contentType = req.headers.get("content-type") || "";
    const updates: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    const add = (column: string, value: unknown) => {
      updates.push(`${column} = $${idx}`);
      values.push(value);
      idx += 1;
    };

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();

      const name = form.get("name");
      if (typeof name === "string" && name.trim()) {
        add("name", name.trim());
      }

      if (form.has("paper_size_category")) {
        const cat = String(form.get("paper_size_category") || "").trim();
        add("paper_size_category", cat || null);
      }

      if (form.has("canvas_width")) {
        add("canvas_width", Number(form.get("canvas_width")) || null);
      }
      if (form.has("canvas_height")) {
        add("canvas_height", Number(form.get("canvas_height")) || null);
      }
      if (form.has("primary_color")) {
        add("primary_color", Number(form.get("primary_color")));
      }
      if (form.has("background_color")) {
        add("background_color", Number(form.get("background_color")));
      }
      if (form.has("is_active")) {
        add("is_active", String(form.get("is_active")) === "true");
      }
      if (form.has("sort_order")) {
        add("sort_order", Number(form.get("sort_order")));
      }

      const slotsRaw = form.get("photo_slots");
      if (typeof slotsRaw === "string" && slotsRaw.trim()) {
        JSON.parse(slotsRaw); // validate
        updates.push(`photo_slots = $${idx}::jsonb`);
        values.push(slotsRaw);
        idx += 1;
      }

      const file = form.get("file");
      if (file instanceof File && file.size > 0) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const overlayUrl = await uploadFrameAsset(id, buffer, file.type || "image/png");
        add("overlay_image_path", overlayUrl);
      }
    } else {
      const body = await req.json();

      if (typeof body.name === "string" && body.name.trim()) {
        add("name", body.name.trim());
      }
      if (body.paper_size_category !== undefined) {
        add(
          "paper_size_category",
          body.paper_size_category ? String(body.paper_size_category) : null,
        );
      }
      if (body.canvas_width !== undefined) {
        add("canvas_width", body.canvas_width == null ? null : Number(body.canvas_width));
      }
      if (body.canvas_height !== undefined) {
        add("canvas_height", body.canvas_height == null ? null : Number(body.canvas_height));
      }
      if (body.primary_color !== undefined) {
        add("primary_color", Number(body.primary_color));
      }
      if (body.background_color !== undefined) {
        add("background_color", Number(body.background_color));
      }
      if (typeof body.is_active === "boolean") {
        add("is_active", body.is_active);
      }
      if (body.sort_order !== undefined) {
        add("sort_order", Number(body.sort_order));
      }
      if (body.overlay_image_path !== undefined) {
        add("overlay_image_path", body.overlay_image_path);
      }
      if (body.photo_slots !== undefined) {
        updates.push(`photo_slots = $${idx}::jsonb`);
        values.push(JSON.stringify(body.photo_slots));
        idx += 1;
      }
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No valid fields" }, { status: 400 });
    }

    updates.push("updated_at = NOW()");
    values.push(id);

    const result = await query(
      `UPDATE frames
       SET ${updates.join(", ")}
       WHERE id = $${idx}
       RETURNING id, name, layout, paper_size_category, overlay_image_path,
                 primary_color, background_color, canvas_width, canvas_height,
                 photo_slots, is_active, sort_order, created_at, updated_at`,
      values,
    );

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Update frame error:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui frame" },
      { status: 500 },
    );
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const existing = await query("SELECT id FROM frames WHERE id = $1", [id]);
    if (existing.rows.length === 0) {
      return NextResponse.json({ error: "Frame tidak ditemukan" }, { status: 404 });
    }

    try {
      await deleteFrameAsset(id);
    } catch (err) {
      console.warn("R2 delete warning:", err);
    }

    await query("DELETE FROM frames WHERE id = $1", [id]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Delete frame error:", error);
    return NextResponse.json(
      { error: "Gagal menghapus frame" },
      { status: 500 },
    );
  }
}
