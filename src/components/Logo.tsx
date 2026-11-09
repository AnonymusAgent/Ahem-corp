import { BRAND, LOGO } from "@/lib/logo";

type Tone = "light" | "dark" | "mono";

/**
 * Ahem Corporation logo mark.
 * tone="light": for dark backgrounds (white + gold) · tone="dark": for light backgrounds (navy + gold)
 * tone="mono": single colour, inherits `currentColor`.
 */
export function LogoMark({ tone = "light", size = 40, className = "", title }: { tone?: Tone; size?: number; className?: string; title?: string }) {
  const primary = tone === "mono" ? "currentColor" : tone === "light" ? BRAND.white : BRAND.navy;
  const accent = tone === "mono" ? "currentColor" : BRAND.gold;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} role={title ? "img" : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
      <path d={LOGO.beamLeft} fill={accent} />
      <path d={LOGO.beamRight} fill={primary} />
      <path d={LOGO.towerLeft} fill={primary} />
      <path d={LOGO.towerCentre} fill={accent} />
      <path d={LOGO.towerRight} fill={primary} />
      <path d={LOGO.ground} fill={accent} />
    </svg>
  );
}

export function Logo({
  variant = "horizontal",
  tone = "light",
  size = 40,
  className = "",
}: {
  variant?: "horizontal" | "vertical" | "icon";
  tone?: Tone;
  size?: number;
  className?: string;
}) {
  if (variant === "icon") return <LogoMark tone={tone} size={size} className={className} title="Ahem Corporation" />;
  const text = tone === "light" ? "text-white" : tone === "dark" ? "text-navy" : "";
  const sub = tone === "light" ? "text-gold" : tone === "dark" ? "text-gold-700" : "opacity-70";
  const vertical = variant === "vertical";
  return (
    <span className={`inline-flex ${vertical ? "flex-col items-center gap-3 text-center" : "items-center gap-3"} ${className}`} aria-label="Ahem Corporation" role="img">
      <LogoMark tone={tone} size={vertical ? size * 1.6 : size} />
      <span className={`flex flex-col leading-none ${vertical ? "items-center" : ""}`} aria-hidden>
        <span className={`font-display font-extrabold tracking-[0.2em] ${text}`} style={{ fontSize: size * 0.5 }}>
          AHEM
        </span>
        <span className={`mt-1 font-display font-semibold tracking-[0.36em] ${sub}`} style={{ fontSize: Math.max(8, size * 0.2) }}>
          CORPORATION
        </span>
      </span>
    </span>
  );
}
