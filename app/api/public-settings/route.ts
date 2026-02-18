// app/api/public-settings/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db"; // Prisma istemcini içe aktar

// Bu rota, GİRİŞ YAPMADAN erişilebilen ayarları döndürür.
// AdminGuard vs. KULLANILMAZ.

export async function GET() {
  try {
    // 1. Sadece halka açık olması gereken ayar anahtarlarını (key) belirle.
    // Şimdilik sadece 'heroVideoUrl' yeterli. İleride başka ayarlar da ekleyebilirsin.
    const publicKeys = ['heroVideoUrl', 'stat_companies', 'stat_projects', 'stat_team', 'stat_years']; 

    // 2. Prisma ile veritabanından sadece bu anahtarlara sahip ayarları çek.
    // findMany, where koşulu ile filtreleme yapar.
    const items = await prisma.setting.findMany({
      where: {
        key: { in: publicKeys } // key değeri 'heroVideoUrl' olanı getir.
      }
    });
    
    // NOT: Eğer 'heroVideoUrl' ayarı veritabanında yoksa, items boş bir dizi [] döner.
    // Bu sorun değil, frontend bunu yönetebilir.

    // 3. Sonucu JSON formatında döndür.
    // Admin API'si ile aynı formatta { items: [...] } döndürüyoruz ki frontend kodu tutarlı olsun.
    return NextResponse.json({ items });

  } catch (error) {
    console.error("Public ayarlar okunamadı:", error);
    // Veritabanı hatası vs. olursa 500 hatası döndür.
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}