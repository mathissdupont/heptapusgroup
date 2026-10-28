# Heptapus Group web design

Source: **HeptapusGroup_BrandGuidelines.pdf**, June 2026. The supplied logo and font files are the source assets; the website does not recreate the logotype as ordinary text.

## Palette

From page 13:

| Color | Value | Web use |
| --- | --- | --- |
| Onyx | `#0B0C10` | Dark backgrounds and light-mode text |
| Bright Snow | `#FAFAFA` | Light backgrounds and dark-mode text |
| Royal Violet | `#6F22D2` | Primary actions and brand accents |
| Dusty Grape | `#4A4E69` | Secondary text on light backgrounds and derived neutral surfaces |
| Medium Slate Blue | `#A155FF` | Links and focus accents on dark backgrounds |

Dark mode is the initial presentation. The light theme uses the same palette, and existing visitor theme preferences remain respected. Text/background pairs use contrasting colors rather than violet text indiscriminately. Success and error colors retain their functional meaning. A division's explicitly configured accent remains available; its default is Royal Violet.

## Typography

Pages 15–18 specify Orbitron, Space Grotesk, Syncopate and Inter. The implementation uses:

- **Orbitron:** large display headings and statistics.
- **Space Grotesk:** section headings, service names, personal names and admin headings.
- **Syncopate:** short brand captions.
- **Inter:** paragraphs, navigation, forms and long biographies.

WOFF2 files are served locally through `next/font/local`; no external font request is required. They are losslessly converted from the supplied font archives. Font licenses are distributed in `public/brand/licenses`.

The supplied Orbitron font does not include `Ğ`, `ğ`, `İ`, `Ş` or `ş`. Its display stack therefore falls back to Space Grotesk for these glyphs. The supplied Space Grotesk, Syncopate and Inter include the Turkish characters used by the site.

## Logo

Pages 6–11 specify the primary vertical logo, secondary horizontal lockup, monochrome versions and clear space equal to the capital H height.

`BrandLogo` uses the supplied PNG artwork inside SVG view boxes. The view boxes retain the original proportions and an H-height buffer around the visible artwork; they remove surplus export canvas without redrawing or stretching the mark. The horizontal lockup appears in the header and footer, the primary logo in brand panels, and the mark in compact placements. Black artwork is used on light surfaces and white artwork on dark surfaces.

Full lockups remain above the guide's 50px minimum. Compact mark placements preserve a visible symbol of at least 35px. Do not add a separately typed brand name alongside the full lockup, change the artwork's proportions, or add glow and shadow effects to the logo.

Browser favicons use a separate transparent Royal Violet mark with reduced canvas padding for 16–64px display. The ICO contains 16, 32, 48 and 64px images; SVG and PNG metadata point to versioned URLs. Header logos are not automatically reused as division favicons.

## Layout

The existing content and responsive layout remain in place. Violet actions, quiet dividers, clear typography and reserved logo space carry the identity. Service descriptions and real project and team imagery remain the main content. Large repeated logo patterns are reserved for brand collateral rather than used behind website copy.
