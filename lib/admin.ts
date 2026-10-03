import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { cookiesOptions, parseToken, type SessionUser } from "@/lib/auth";
import { isTrustedMutation } from "@/lib/request-security";
import { subdomainFromHost } from "@/lib/hostname";

export type AppRole = SessionUser["role"];
export type ElevatedRole = Extract<AppRole, "ADMIN" | "EDITOR">;
const ELEVATED: readonly ElevatedRole[] = ["ADMIN", "EDITOR"];

/** JWT'yi doğrular ve güncel rolü veritabanından tekrar kontrol eder. */
export async function requireRole(roles: readonly AppRole[], req?: NextRequest) {
  if (req && !isTrustedMutation(req)) return null;
  if (req && subdomainFromHost(req.headers.get("host") || new URL(req.url).host)) return null;
  const token = req ? req.cookies.get(cookiesOptions.name)?.value
    : (await cookies()).get(cookiesOptions.name)?.value;
  if (!token) return null;

  try {
    const claims = await parseToken(token);
    const user = await prisma.user.findUnique({
      where: { id: claims.id },
      select: { id: true, email: true, name: true, role: true, sessionVersion: true },
    });

    if (
      !user ||
      user.email !== claims.email ||
      user.sessionVersion !== claims.sessionVersion ||
      !roles.includes(user.role)
    ) return null;
    return user;
  } catch {
    return null;
  }
}

export async function requireElevated(req?: NextRequest) {
  return requireRole(ELEVATED, req);
}
