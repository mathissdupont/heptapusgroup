type Props = {
  variant?: "horizontal" | "primary" | "mark";
  tone?: "auto" | "light" | "dark";
  className?: string;
};

// View boxes remove surplus export canvas while preserving the original artwork
// and at least one capital-H height of clear space (guideline pages 7–11).
const variants = {
  horizontal: { viewBox: "126 323 864 422", asset: "horizontal", width: 180, height: 88 },
  primary: { viewBox: "145 84 790 955", asset: "primary", width: 200, height: 242 },
  mark: { viewBox: "145 157 790 766", asset: "mark", width: 48, height: 47 },
};

export default function BrandLogo({ variant = "horizontal", tone = "auto", className = "" }: Props) {
  const logo = variants[variant];
  return (
    <svg viewBox={logo.viewBox} width={logo.width} height={logo.height} role="img" aria-label="Heptapus Group" data-tone={tone} className={`brand-logo brand-logo-${variant} ${className}`}>
      <title>Heptapus Group</title>
      <image href={`/brand/heptapus-${logo.asset}-black.png`} width="1080" height="1080" className="brand-logo-on-light" />
      <image href={`/brand/heptapus-${logo.asset}-${variant === "mark" ? "black" : "white"}.png`} width="1080" height="1080" className={`brand-logo-on-dark ${variant === "mark" ? "brand-logo-invert" : ""}`} />
    </svg>
  );
}
