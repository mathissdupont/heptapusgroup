import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { cookiesOptions } from "@/lib/auth";

export async function POST() {
  const { name, ...opts } = cookiesOptions as any;
  (await cookies()).set(name, "", { ...opts, maxAge: 0 });
  return NextResponse.json({ ok: true });
}
