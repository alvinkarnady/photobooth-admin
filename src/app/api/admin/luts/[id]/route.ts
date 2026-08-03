import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { deleteLutAsset } from "@/lib/r2";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, context: RouteContext) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const body = await req.json();
    if (typeof body.is_active !== "boolean") {
      return NextResponse.json({ error: "No valid fields" }, { status: 400 });
    }

    const result = await query(
      `UPDATE lut_filters
       SET is_active = $1
       WHERE id = $2
       RETURNING id, name, lut_url, is_active, created_at`,
      [body.is_active, id],
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "LUT tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Update LUT error:", error);
    return NextResponse.json({ error: "Gagal memperbarui LUT" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const existing = await query("SELECT id FROM lut_filters WHERE id = $1", [id]);
    if (existing.rows.length === 0) {
      return NextResponse.json({ error: "LUT tidak ditemukan" }, { status: 404 });
    }

    try {
      await deleteLutAsset(id);
    } catch (err) {
      console.warn("R2 LUT delete warning:", err);
    }

    await query("DELETE FROM lut_filters WHERE id = $1", [id]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Delete LUT error:", error);
    return NextResponse.json({ error: "Gagal menghapus LUT" }, { status: 500 });
  }
}
