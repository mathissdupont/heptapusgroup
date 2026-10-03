/** Site paths and HTTP(S) URLs; reject browser-normalized protocol-relative URLs. */
export function isSafeUrl(value: string) {
  if (/[\u0000-\u0020\u007f\\]/.test(value)) return false;
  if (value.startsWith("/")) return !value.startsWith("//");
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password;
  } catch { return false; }
}
