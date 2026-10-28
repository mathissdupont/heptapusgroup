import { NextResponse } from "next/server";

export function databaseServiceError(error: unknown) {
  const value = error && typeof error === "object" ? error as { code?: string; meta?: { code?: string } } : {};
  const schemaMissing = ["P2021", "P2022", "P2011", "42P01", "42703", "23502"].includes(value.code || "")
    || ["42P01", "42703", "23502"].includes(value.meta?.code || "");
  return NextResponse.json({
    error: schemaMissing
      ? "Veritabanı güncellemesi eksik. Site yöneticisi sunucuda migration'ları uygulamalı."
      : "İşlem şu anda tamamlanamıyor. Lütfen daha sonra tekrar deneyin.",
    code: schemaMissing ? "DATABASE_SCHEMA_OUTDATED" : "DATABASE_UNAVAILABLE",
  }, { status: 503, headers: { "Cache-Control": "no-store" } });
}
