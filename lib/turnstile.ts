const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

type TurnstileResponse = { success?: boolean; hostname?: string };

export async function verifyTurnstile(
  token: string | null | undefined,
  remoteIp?: string,
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return process.env.NODE_ENV === "development";
  if (!token || token.length > 2048) return false;

  try {
    const body = new URLSearchParams({ secret, response: token });
    if (remoteIp && remoteIp !== "unknown") body.set("remoteip", remoteIp);

    const response = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      signal: AbortSignal.timeout(5000),
      cache: "no-store",
    });
    if (!response.ok) return false;

    const result = await response.json() as TurnstileResponse;
    if (!result.success) return false;
    if (process.env.NODE_ENV !== "production") return true;

    const hostname = result.hostname?.toLowerCase();
    return hostname === "heptapusgroup.com" || Boolean(hostname?.endsWith(".heptapusgroup.com"));
  } catch {
    return false;
  }
}
