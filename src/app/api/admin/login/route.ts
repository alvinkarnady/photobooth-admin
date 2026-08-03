import { NextResponse } from "next/server";
import {
  COOKIE_NAME,
  createAdminSessionToken,
  getAdminCredentials,
} from "@/lib/admin-auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    const creds = getAdminCredentials();
    if (!creds.email || !creds.password) {
      return NextResponse.json(
        { error: "Admin credentials not configured" },
        { status: 500 }
      );
    }

    if (
      email !== creds.email.toLowerCase() ||
      password !== creds.password
    ) {
      return NextResponse.json(
        { error: "Email atau Password salah!" },
        { status: 401 }
      );
    }

    const token = createAdminSessionToken(email);
    const res = NextResponse.json({ ok: true, email });

    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Login failed" },
      { status: 500 }
    );
  }
}
