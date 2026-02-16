import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getSubdomain, getSubdomainConfig } from "@/lib/subdomain";
import SubdomainLayout from "@/components/SubdomainLayout";
import SubdomainHome from "@/components/SubdomainHome";

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
    redirect("https://heptapusgroup.com");
  }
  
  return (
    <SubdomainLayout subdomain={subdomainConfig}>
      <SubdomainHome subdomain={subdomainConfig} />
    </SubdomainLayout>
  );
}