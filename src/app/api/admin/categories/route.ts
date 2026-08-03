import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { query } from "@/lib/db";
import { COOKIE_NAME, verifyAdminSessionToken } from "@/lib/admin-auth";

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const session = verifyAdminSessionToken(token);
  if (!session) return null;
  return session;
}

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
