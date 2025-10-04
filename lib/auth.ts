import { SignJWT, jwtVerify } from "jose";
import type { NextRequest } from "next/server";
const secret = new TextEncoder().encode(process.env.AUTH_SECRET!);

export type SessionUser = {
  id: string;
  email: string;
  role: "ADMIN" | "EDITOR" | "VIEWER";
  name?: string | null;
};

export async function createToken(user: SessionUser) {
  return await new SignJWT(user)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${60 * 60 * 24 * 10}s`) // 10 gün
    .sign(secret);
}

export async function parseToken(token: string) {
  const { payload } = await jwtVerify(token, secret);
  return payload as SessionUser;
}

export const cookiesOptions = {
  name: "hepta_auth",
  secure: process.env.NODE_ENV === "production", // DEV'de false olmalı
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 30, // 30 gün
};

export async function getSessionUser(req: NextRequest): Promise<SessionUser> {
  const token = req.cookies.get(cookiesOptions.name)?.value;
  if (!token) throw new Error("no token");
  return await parseToken(token);
}