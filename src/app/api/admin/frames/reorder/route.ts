import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = await pool.connect();
  try {
    const body = await req.json();
    const orderedIds = Array.isArray(body.orderedIds) ? body.orderedIds : null;

    if (!orderedIds || orderedIds.length === 0) {
      return NextResponse.json(
        { error: "orderedIds wajib diisi" },
        { status: 400 },
      );
    }

    await client.query("BEGIN");
    try {
      for (let i = 0; i < orderedIds.length; i++) {
        await client.query(
          "UPDATE frames SET sort_order = $1, updated_at = NOW() WHERE id = $2",
          [i, String(orderedIds[i])],
        );
      }
      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Reorder frames error:", error);
    return NextResponse.json(
      { error: "Gagal mengurutkan frame" },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}
