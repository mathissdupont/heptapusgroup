// lib/fetcher.ts
export async function jfetch<T>(url: string, init?: RequestInit): Promise<T> {
  // FormData gönderirken Content-Type set etme — browser multipart boundary'yi otomatik eklesin
  const isFormData = typeof FormData !== "undefined" && init?.body instanceof FormData;
  const headers: Record<string, string> = isFormData
    ? {}
    : { "Content-Type": "application/json" };

  const res = await fetch(url, {
    ...init,
    headers: { ...headers, ...(init?.headers || {}) },
    credentials: "include",   // cookie'yi gönder
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({} as any));
    throw new Error(body?.error || res.statusText);
  }
  return res.json() as Promise<T>;
}
