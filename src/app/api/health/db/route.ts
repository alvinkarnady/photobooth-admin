import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const result = await query(
      "SELECT name, is_active FROM paper_categories ORDER BY name"
    );

    return NextResponse.json({
      ok: true,
      database: "connected",
      categories: result.rows,
    });
  } catch (error: any) {
    console.error("DB health error:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "Database connection failed",
      },
      { status: 500 }
    );
  }
}
