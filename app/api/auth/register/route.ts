import { NextResponse } from "next/server";

/** Kullanıcı oluşturma yalnızca yönetim panelindeki korumalı API üzerinden yapılır. */
export async function POST() {
  return NextResponse.json(
    { error: "Herkese açık kayıt kapalıdır. Kullanıcılar yönetim panelinden oluşturulmalıdır." },
    { status: 403 },
  );
}
