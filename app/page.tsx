import type { Metadata } from "next";
import { divisionMetadata } from "@/lib/division-seo";
import DivisionStructuredData from "@/components/DivisionStructuredData";
import { redirect, notFound } from "next/navigation";
import { getSubdomain, getSubdomainConfig } from "@/lib/subdomain";
import SubdomainLayout from "@/components/SubdomainLayout";
import SubdomainHome from "@/components/SubdomainHome";

export async function generateMetadata(): Promise<Metadata> {
  const name = await getSubdomain();
  const config = name ? await getSubdomainConfig(name) : null;
  return config ? divisionMetadata(config) : {};
}

export default async function RootPage() {
  const subdomain = await getSubdomain();
  
  if (!subdomain) {
    // Main domain - redirect to /home
    redirect("/home");
  }
  
  // Subdomain - show subdomain-specific content
  const subdomainConfig = await getSubdomainConfig(subdomain);
  
  if (!subdomainConfig) {
    // Subdomain not found or inactive
    notFound();
  }
  
  return (
    <SubdomainLayout subdomain={subdomainConfig}>
      <DivisionStructuredData division={subdomainConfig} path="/" />
      <SubdomainHome subdomain={subdomainConfig} />
    </SubdomainLayout>
  );
}