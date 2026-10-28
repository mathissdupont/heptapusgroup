import type { Metadata } from "next";

// Use a dedicated compact mark, never a full header logo, in browser tabs.
// The version changes the cached URL for visitors with the previous favicon.
export const siteIcons: Metadata["icons"] = {
  icon: [
    { url: "/brand/favicon-32.png?v=2", type: "image/png", sizes: "32x32" },
    { url: "/brand/favicon.svg?v=2", type: "image/svg+xml", sizes: "any" },
  ],
  shortcut: "/brand/favicon-32.png?v=2",
};
