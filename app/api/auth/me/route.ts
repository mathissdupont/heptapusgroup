// app/api/auth/me/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { cookiesOptions, parseToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const token = (await cookies()).get(cookiesOptions.name)?.value;
  if (!token) return NextResponse.json({ user: null });
  try {
    const user = await parseToken(token);
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ user: null });
  }
}
