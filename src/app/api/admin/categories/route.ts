import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await query(
    "SELECT id, name, is_active FROM paper_categories ORDER BY name ASC",
  );
  return NextResponse.json(result.rows);
}

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const name = String(body.name || "").trim();
  if (!name) {
    return NextResponse.json({ error: "Nama wajib diisi" }, { status: 400 });
  }

  const result = await query(
    `INSERT INTO paper_categories (name, is_active)
     VALUES ($1, true)
     RETURNING id, name, is_active`,
    [name],
  );

  return NextResponse.json(result.rows[0]);
}
