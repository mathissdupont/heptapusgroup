import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { cookiesOptions, parseToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

function anonymousResponse(clearCookie = false) {
  const response = NextResponse.json({ user: null });
  if (clearCookie) {
    const { name, ...options } = cookiesOptions;
    response.cookies.set(name, "", { ...options, maxAge: 0 });
  }
  return response;
}

export async function GET() {
  const token = (await cookies()).get(cookiesOptions.name)?.value;
  if (!token) return anonymousResponse();

  try {
    const claims = await parseToken(token);
    const user = await prisma.user.findUnique({
      where: { id: claims.id },
      select: { id: true, email: true, name: true, role: true, sessionVersion: true },
    });

    if (
      !user ||
      user.email !== claims.email ||
      user.sessionVersion !== claims.sessionVersion
    ) return anonymousResponse(true);

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch {
    return anonymousResponse(true);
  }
}
