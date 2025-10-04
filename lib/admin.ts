// lib/admin.ts
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { cookiesOptions, parseToken } from "@/lib/auth";

export type ElevatedRole = "ADMIN" | "EDITOR";
const ELEVATED: readonly ElevatedRole[] = ["ADMIN", "EDITOR"] as const;

/** Cookie'deki JWT'yi okuyup verilen rolleri doğrular. */
export async function requireRole(
  roles: readonly ElevatedRole[],
  _req?: NextRequest
) {
  // hepta_auth cookie’sini oku
  const token = (await cookies()).get(cookiesOptions.name)?.value;
  if (!token) return null;

  try {
    const user = await parseToken(token); // { id, email, role, ... }
    return (roles as readonly string[]).includes(String(user.role))
      ? user
      : null;
  } catch {
    return null;
  }
}

/** ADMIN veya EDITOR gerekli kısayol */
export async function requireElevated(req?: NextRequest) {
  return requireRole(ELEVATED, req);
}

export function isAdmin(req: Request) {
  const key = req.headers.get("x-admin-key") || "";
  return key && key === process.env.ADMIN_KEY;
}