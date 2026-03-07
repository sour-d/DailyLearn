import { NextRequest, NextResponse } from "next/server";
import { createSessionToken, SESSION_COOKIE } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { pin } = await request.json();
    const expectedPin = process.env.APP_PIN;

    if (!expectedPin) {
      return NextResponse.json(
        { error: "APP_PIN not configured" },
        { status: 500 }
      );
    }

    if (pin !== expectedPin) {
      return NextResponse.json({ error: "Invalid PIN" }, { status: 401 });
    }

    const token = await createSessionToken(pin);
    const res = NextResponse.json({ ok: true });

    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60, // 1 hour
    });

    return res;
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
