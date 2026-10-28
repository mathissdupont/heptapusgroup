import { type Division, parseSubdomainSettings } from "@/lib/subdomain-content";
import { DivisionServices, DivisionContact } from "@/components/DivisionContent";

export default function SubdomainServices({ subdomain }: { subdomain: Division }) {
  const settings = parseSubdomainSettings(subdomain.settings);
  return <div className="division-container"><DivisionServices settings={settings} /><DivisionContact subdomain={subdomain} settings={settings} /></div>;
}
