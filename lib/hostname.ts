/** Recognize only actual application subdomains, never IP addresses or lookalike hosts. */
export function subdomainFromHost(host: string) {
  try {
    const hostname = new URL(`http://${host}`).hostname.toLowerCase();
    const base = hostname.endsWith(".localhost") ? "localhost" : "heptapusgroup.com";
    if (!hostname.endsWith(`.${base}`)) return null;
    const label = hostname.slice(0, -(base.length + 1));
    return label !== "www" && /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label) ? label : null;
  } catch { return null; }
}
