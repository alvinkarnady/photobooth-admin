import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await req.json();

  if (typeof body.is_active === "boolean") {
    const result = await query(
      `UPDATE paper_categories
       SET is_active = $1
       WHERE id = $2
       RETURNING id, name, is_active`,
      [body.is_active, id],
    );
    return NextResponse.json(result.rows[0]);
  }

  return NextResponse.json({ error: "No valid fields" }, { status: 400 });
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  await query("DELETE FROM paper_categories WHERE id = $1", [id]);
  return NextResponse.json({ ok: true });
}
