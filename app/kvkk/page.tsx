import LegalDocument, { legalMetadata, type LegalSearch } from "@/components/LegalDocument";
export const dynamic = "force-dynamic";
export async function generateMetadata({ searchParams }: { searchParams: LegalSearch }) { return legalMetadata("kvkk", searchParams); }
export default function Page({ searchParams }: { searchParams: LegalSearch }) { return <LegalDocument kind="kvkk" searchParams={searchParams} />; }
