// lib/fetcher.ts
export async function jfetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    credentials: "include",   // cookie'yi gönder
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({} as any));
    throw new Error(body?.error || res.statusText);
  }
  return res.json() as Promise<T>;
}
