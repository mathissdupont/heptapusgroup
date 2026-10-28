import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

export function teamError(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") return NextResponse.json({ error: "Bu profil adresi zaten kullanılıyor." }, { status: 409 });
    if (error.code === "P2025") return NextResponse.json({ error: "Ekip üyesi bulunamadı." }, { status: 404 });
    if (["P2021", "P2022"].includes(error.code)) return NextResponse.json({ error: "Ekip yönetimi için veritabanı güncellemesi gerekli. Sunucuda npm run db:deploy çalıştırılmalı." }, { status: 503 });
  }
  console.error("Team operation failed", error);
  return NextResponse.json({ error: "Ekip işlemi tamamlanamadı." }, { status: 500 });
}
