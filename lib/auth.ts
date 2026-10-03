import { SignJWT, jwtVerify } from "jose";
import { z } from "zod";
import type { NextRequest } from "next/server";

const TOKEN_ISSUER = "heptapusgroup";
const TOKEN_AUDIENCE = "heptapus-admin";
const SESSION_SECONDS = 60 * 60 * 24 * 10;

const sessionUserSchema = z.object({
  id: z.string().min(1),
  email: z.string().email(),
  role: z.enum(["ADMIN", "EDITOR", "VIEWER"]),
  name: z.string().nullable().optional(),
  sessionVersion: z.number().int().nonnegative(),
});

export type SessionUser = z.infer<typeof sessionUserSchema>;

function getAuthSecret() {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 32) {
    throw new Error("AUTH_SECRET en az 32 karakter olmalıdır.");
  }
  return new TextEncoder().encode(value);
}

export async function createToken(user: SessionUser) {
  return new SignJWT(user)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuer(TOKEN_ISSUER)
    .setAudience(TOKEN_AUDIENCE)
    .setIssuedAt()
    .setJti(crypto.randomUUID())
    .setExpirationTime(`${SESSION_SECONDS}s`)
    .sign(getAuthSecret());
}

export async function parseToken(token: string): Promise<SessionUser> {
  const { payload } = await jwtVerify(token, getAuthSecret(), {
    algorithms: ["HS256"],
    issuer: TOKEN_ISSUER,
    audience: TOKEN_AUDIENCE,
    requiredClaims: ["exp", "iat", "jti"],
  });
  return sessionUserSchema.parse(payload);
}

const configuredDomain = process.env.AUTH_COOKIE_DOMAIN?.trim();

export const cookiesOptions = {
  name: "hepta_auth",
  secure: process.env.NODE_ENV === "production",
  httpOnly: true,
  sameSite: "strict" as const,
  path: "/",
  maxAge: SESSION_SECONDS,
  ...(configuredDomain ? { domain: configuredDomain } : {}),
};

export async function getSessionUser(req: NextRequest): Promise<SessionUser> {
  const token = req.cookies.get(cookiesOptions.name)?.value;
  if (!token) throw new Error("no token");
  return parseToken(token);
}
