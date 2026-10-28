export type LoginSession = { user: { id: string; email: string; name?: string | null; role: "ADMIN" | "EDITOR" } };

/** Confirm that the browser retained the session before leaving the login form. */
export async function loginAndVerify(email: string, password: string, request: typeof fetch = fetch): Promise<LoginSession> {
  const response = await request("/api/auth/login", {
    method: "POST", headers: { "Content-Type": "application/json" },
    credentials: "include", cache: "no-store", body: JSON.stringify({ email, password }),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || result?.ok !== true) {
    throw new Error(result?.error || "Giriş tamamlanamadı. Lütfen tekrar deneyin.");
  }
  const verification = await request("/api/auth/me", { credentials: "include", cache: "no-store" });
  const session = await verification.json().catch(() => null);
  if (!verification.ok) throw new Error(session?.error || "Oturum doğrulanamadı. Lütfen tekrar deneyin.");
  if (!session?.user?.id) {
    throw new Error("Oturum çerezi doğrulanamadı. Çerezlere izin verildiğini kontrol edin. Sorun sürerse site yöneticisi oturum ayarlarını kontrol etmeli.");
  }
  if (!["ADMIN", "EDITOR"].includes(session.user.role)) throw new Error("Bu hesabın yönetim paneline erişim yetkisi yok.");
  if (typeof session.user.email !== "string" || session.user.email.toLowerCase() !== email.trim().toLowerCase()) {
    throw new Error("Oturum giriş yaptığınız hesapla eşleşmedi. Site çerezlerini temizleyip tekrar deneyin.");
  }
  return session as LoginSession;
}
