// Read-only deployment audit: node scripts/audit-seo.mjs https://ware.heptapusgroup.com
const origin = new URL(process.argv[2] || "https://ware.heptapusgroup.com").origin;
let failures = 0;
async function fetchText(url) {
  const response = await fetch(url, { headers: { "user-agent": "HeptapusSEOAudit/1.0" }, signal: AbortSignal.timeout(15_000), redirect: "manual" });
  if (response.status !== 200) throw new Error(`${url}: HTTP ${response.status}`);
  return { body: await response.text(), response };
}
function attributes(tag) {
  return Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*(["'])(.*?)\2/g)].map(match => [match[1].toLowerCase(), match[3]]));
}
try {
  const robots = await fetchText(`${origin}/robots.txt`);
  if (!robots.body.includes(`${origin}/sitemap.xml`)) throw new Error("robots.txt does not reference this host's sitemap");
  const sitemap = await fetchText(`${origin}/sitemap.xml`);
  const urls = [...new Set([...sitemap.body.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1].replace(/&amp;/g, "&")))];
  if (!urls.length || urls.length > 200) throw new Error("Expected 1–200 sitemap URLs for a division");
  const titles = new Set();
  for (const url of urls) {
    if (new URL(url).origin !== origin) { console.error(`FAIL foreign sitemap URL: ${url}`); failures++; continue; }
    try {
      const { body, response } = await fetchText(url);
      const html = body.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
      const title = html.match(/<title>(.*?)<\/title>/s)?.[1]?.trim();
      const tags = [...html.matchAll(/<(?:meta|link)\b[^>]*>/gi)].map(match => attributes(match[0]));
      const canonical = tags.find(tag => tag.rel === "canonical")?.href;
      const description = tags.find(tag => tag.name === "description")?.content;
      const robotsMeta = tags.find(tag => tag.name === "robots")?.content || "";
      const schemas = [...body.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs)];
      const issues = [];
      if (!title) issues.push("missing title");
      if (titles.has(title)) issues.push("duplicate title");
      titles.add(title);
      if (!description) issues.push("missing description");
      if (canonical?.replace(/\/$/, "") !== url.replace(/\/$/, "")) issues.push("missing/incorrect canonical");
      if ((html.match(/<h1\b/gi) || []).length !== 1) issues.push("expected one H1");
      if (/noindex/i.test(`${response.headers.get("x-robots-tag") || ""} ${robotsMeta}`)) issues.push("noindex in sitemap");
      if (!schemas.length) issues.push("missing structured data");
      for (const match of schemas) { try { JSON.parse(match[1]); } catch { issues.push("invalid JSON-LD"); } }
      if (issues.length) { failures++; console.error(`FAIL ${url}: ${issues.join(", ")}`); }
      else console.log(`PASS ${url}`);
    } catch (error) { failures++; console.error(`FAIL ${error.message}`); }
  }
  console.log(`${urls.length} pages checked; ${failures} pages need attention.`);
} catch (error) { failures++; console.error(`FAIL ${error.message}`); }
process.exitCode = failures ? 1 : 0;
