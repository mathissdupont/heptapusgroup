import { z } from "zod";

// bcrypt ignores bytes after the 72nd byte, including parts of Unicode passwords.
export const newPasswordSchema = z.string().min(10, "Şifre en az 10 karakter olmalıdır.")
  .max(72).refine((value) => new TextEncoder().encode(value).length <= 72,
    "Şifre UTF-8 olarak en fazla 72 bayt olabilir.");
