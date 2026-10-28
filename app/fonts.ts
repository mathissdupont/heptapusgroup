import localFont from "next/font/local";

export const inter = localFont({ src: "./fonts/inter.woff2", variable: "--font-inter", weight: "100 900", display: "swap" });
export const spaceGrotesk = localFont({ src: "./fonts/space-grotesk.woff2", variable: "--font-space-grotesk", weight: "300 700", display: "swap" });
export const orbitron = localFont({ src: "./fonts/orbitron.woff2", variable: "--font-orbitron", weight: "400 900", display: "swap" });
export const syncopate = localFont({ src: "./fonts/syncopate-bold.woff2", variable: "--font-syncopate", weight: "700", display: "swap", preload: false });
export const brandFontVariables = `${inter.variable} ${spaceGrotesk.variable} ${orbitron.variable} ${syncopate.variable}`;
