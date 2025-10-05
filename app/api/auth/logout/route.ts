import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { cookiesOptions } from "@/lib/auth";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  (await cookies()).set(cookiesOptions.name, "", { ...cookiesOptions.options, maxAge: 0 });
  return NextResponse.json({ ok: true });
}
