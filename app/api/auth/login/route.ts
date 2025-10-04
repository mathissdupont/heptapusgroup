// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { compare } from "@/lib/hash";
import { createToken, cookiesOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "missing fields" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "invalid" }, { status: 401 });
    }

    const ok = await compare(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: "invalid" }, { status: 401 });
    }

    const token = await createToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    // ✅ Next 15: cookie'yi response üzerinden set et
    const res = NextResponse.json({ ok: true, role: user.role });

    res.cookies.set({
      name: cookiesOptions.name,
      value: token,
      httpOnly: cookiesOptions.httpOnly,
      secure: cookiesOptions.secure,
      sameSite: cookiesOptions.sameSite,
      path: cookiesOptions.path,
      maxAge: cookiesOptions.maxAge,
    });

    return res;
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "server error" }, { status: 500 });
  }
}
