import type { Prisma } from "@prisma/client";

export const AUDIT_ACTIONS = {
  USER_CREATED: "Kullanıcı eklendi",
  USER_ROLE_CHANGED: "Kullanıcı rolü değiştirildi",
  USER_DISABLED: "Hesap devre dışı bırakıldı",
  USER_ENABLED: "Hesap etkinleştirildi",
  USER_PASSWORD_RESET: "Kullanıcı şifresi yenilendi",
  USER_DELETED: "Kullanıcı silindi",
  LOGIN_FAILED: "Başarısız giriş",
  LOGIN_SUCCEEDED: "Oturum açıldı",
  PASSWORD_CHANGED: "Şifre değiştirildi",
} as const;

export function recordAudit(
  tx: Pick<Prisma.TransactionClient, "auditLog">,
  actor: { id: string; email: string } | null,
  action: keyof typeof AUDIT_ACTIONS,
  targetId?: string,
) {
  return tx.auditLog.create({
    data: { actorId: actor?.id, actorEmail: actor?.email, action, targetId },
  });
}
