/**
 * Server-side Cloudflare Turnstile token verification.
 * Call this from API routes before processing form submissions.
 */

const SECRET_KEY = process.env.TURNSTILE_SECRET_KEY || "1x0000000000000000000000000000000AA"; // test key fallback

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function verifyTurnstile(token: string | null | undefined): Promise<boolean> {
  // In development without keys, skip verification
  if (!process.env.TURNSTILE_SECRET_KEY && process.env.NODE_ENV === "development") {
    return true;
  }

  if (!token) return false;

  try {
    const res = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: SECRET_KEY,
        response: token,
      }),
    });
    const data = await res.json();
    return data.success === true;
  } catch {
    return false;
  }
}
