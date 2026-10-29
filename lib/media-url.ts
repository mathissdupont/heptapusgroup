export function youtubeVideoId(value: string): string | null {
  try {
    const url = new URL(value, "https://heptapusgroup.com");
    if (!["https:", "http:"].includes(url.protocol)) return null;
    const host = url.hostname.toLowerCase();
    const id = host === "youtu.be" ? url.pathname.slice(1) : ["youtube.com", "www.youtube.com", "m.youtube.com", "youtube-nocookie.com", "www.youtube-nocookie.com"].includes(host) ? url.searchParams.get("v") || url.pathname.match(/^\/(?:embed|shorts)\/([^/]+)/)?.[1] : null;
    return id && /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
  } catch { return null; }
}
export function isExternalMediaUrl(value: string): boolean {
  try {
    const url = new URL(value, "https://heptapusgroup.com");
    return ["https:", "http:"].includes(url.protocol) && url.hostname !== "heptapusgroup.com" && !url.hostname.endsWith(".heptapusgroup.com");
  } catch { return false; }
}
