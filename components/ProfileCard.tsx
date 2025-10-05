// components/ProfileCard.tsx
"use client";

import React, {
  useEffect,
  useRef,
  useCallback,
  useMemo,
  useState,
} from "react";
import "./ProfileCard.css"; // side-effect CSS

interface ProfileCardProps {
  avatarUrl: string;
  iconUrl?: string;
  grainUrl?: string;
  behindGradient?: string;
  innerGradient?: string;
  showBehindGradient?: boolean;
  className?: string;
  enableTilt?: boolean;          // genel tilt
  enableMobileTilt?: boolean;    // mobilde tilt (default: false)
  mobileTiltSensitivity?: number;
  miniAvatarUrl?: string;
  name?: string;
  title?: string;
  handle?: string;
  status?: string;
  contactText?: string;
  contactHref?: string;          // <-- butonu linke çevirmek için
  showUserInfo?: boolean;
  onContactClick?: () => void;   // contactHref yoksa çalışır
}

const DEFAULT_BEHIND_GRADIENT =
  "radial-gradient(farthest-side circle at var(--pointer-x) var(--pointer-y),hsla(266,100%,90%,var(--card-opacity)) 4%,hsla(266,50%,80%,calc(var(--card-opacity)*0.75)) 10%,hsla(266,25%,70%,calc(var(--card-opacity)*0.5)) 50%,hsla(266,0%,60%,0) 100%),radial-gradient(35% 52% at 55% 20%,#00ffaac4 0%,#073aff00 100%),radial-gradient(100% 100% at 50% 50%,#00c1ffff 1%,#073aff00 76%),conic-gradient(from 124deg at 50% 50%,#c137ffff 0%,#07c6ffff 40%,#07c6ffff 60%,#c137ffff 100%)";

const DEFAULT_INNER_GRADIENT =
  "linear-gradient(145deg,#60496e8c 0%,#71C4FF44 100%)";

const ANIMATION_CONFIG = {
  SMOOTH_DURATION: 600,
  INITIAL_DURATION: 1500,
  INITIAL_X_OFFSET: 70,
  INITIAL_Y_OFFSET: 60,
  DEVICE_BETA_OFFSET: 20,
} as const;

const clamp = (v: number, min = 0, max = 100) => Math.min(Math.max(v, min), max);
const round = (v: number, p = 3) => parseFloat(v.toFixed(p));
const adjust = (v: number, a: number, b: number, c: number, d: number) =>
  round(c + ((d - c) * (v - a)) / (b - a));
const easeInOutCubic = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

/** Desktop harici (touch/ küçük ekran / reduce-motion) tilt kapalı */
function useAllowTiltDesktopOnly() {
  const [allow, setAllow] = useState(false);
  useEffect(() => {
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    const isSmall = window.matchMedia("(max-width: 767px)").matches;
    const reduce  = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setAllow(!(isTouch || isSmall || reduce));
  }, []);
  return allow;
}

const ProfileCardComponent: React.FC<ProfileCardProps> = ({
  avatarUrl,
  iconUrl,
  grainUrl,
  behindGradient,
  innerGradient,
  showBehindGradient = true,
  className = "",
  enableTilt = true,
  enableMobileTilt = false,
  mobileTiltSensitivity = 5,
  miniAvatarUrl,
  name = "User",
  title = "Role",
  handle = "user",
  status = "Online",
  contactText = "Contact",
  contactHref,
  showUserInfo = true,
  onContactClick,
}) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const desktopOk = useAllowTiltDesktopOnly();
  const tiltActive = enableTilt && (desktopOk || enableMobileTilt === true);

  const animationHandlers = useMemo(() => {
    if (!tiltActive) return null;
    let rafId: number | null = null;

    const updateCardTransform = (ox: number, oy: number, card: HTMLElement, wrap: HTMLElement) => {
      const w = card.clientWidth;
      const h = card.clientHeight;

      const px = clamp((100 / w) * ox);
      const py = clamp((100 / h) * oy);
      const cx = px - 50;
      const cy = py - 50;

      const props: Record<string, string> = {
        "--pointer-x": `${px}%`,
        "--pointer-y": `${py}%`,
        "--background-x": `${adjust(px, 0, 100, 35, 65)}%`,
        "--background-y": `${adjust(py, 0, 100, 35, 65)}%`,
        "--pointer-from-center": `${clamp(Math.hypot(py - 50, px - 50) / 50, 0, 1)}`,
        "--pointer-from-top": `${py / 100}`,
        "--pointer-from-left": `${px / 100}`,
        "--rotate-x": `${round(-(cx / 5))}deg`,
        "--rotate-y": `${round(cy / 4)}deg`,
      };
      Object.entries(props).forEach(([k, v]) => wrap.style.setProperty(k, v));
    };

    const createSmoothAnimation = (dur: number, sx: number, sy: number, card: HTMLElement, wrap: HTMLElement) => {
      const t0 = performance.now();
      const tx = wrap.clientWidth / 2;
      const ty = wrap.clientHeight / 2;

      const loop = (t: number) => {
        const p = clamp((t - t0) / dur);
        const e = easeInOutCubic(p);
        updateCardTransform(adjust(e, 0, 1, sx, tx), adjust(e, 0, 1, sy, ty), card, wrap);
        if (p < 1) rafId = requestAnimationFrame(loop);
      };
      rafId = requestAnimationFrame(loop);
    };

    return {
      updateCardTransform,
      createSmoothAnimation,
      cancelAnimation: () => {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = null;
      },
    };
  }, [tiltActive]);

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!tiltActive || !animationHandlers) return;
    const card = cardRef.current!, wrap = wrapRef.current!;
    const rect = card.getBoundingClientRect();
    animationHandlers.updateCardTransform(e.clientX - rect.left, e.clientY - rect.top, card, wrap);
  }, [tiltActive, animationHandlers]);

  const handlePointerEnter = useCallback(() => {
    if (!tiltActive || !animationHandlers) return;
    const card = cardRef.current!, wrap = wrapRef.current!;
    animationHandlers.cancelAnimation();
    wrap.classList.add("active");
    card.classList.add("active");
  }, [tiltActive, animationHandlers]);

  const handlePointerLeave = useCallback((e: PointerEvent) => {
    if (!tiltActive || !animationHandlers) return;
    const card = cardRef.current!, wrap = wrapRef.current!;
    animationHandlers.createSmoothAnimation(
      ANIMATION_CONFIG.SMOOTH_DURATION,
      e.offsetX, e.offsetY,
      card, wrap
    );
    wrap.classList.remove("active");
    card.classList.remove("active");
  }, [tiltActive, animationHandlers]);

  const handleDeviceOrientation = useCallback((e: DeviceOrientationEvent) => {
    if (!tiltActive || !enableMobileTilt || !animationHandlers) return;
    const card = cardRef.current!, wrap = wrapRef.current!;
    const { beta, gamma } = e;
    if (beta == null || gamma == null) return;
    animationHandlers.updateCardTransform(
      card.clientHeight / 2 + gamma * mobileTiltSensitivity,
      card.clientWidth / 2 + (beta - ANIMATION_CONFIG.DEVICE_BETA_OFFSET) * mobileTiltSensitivity,
      card, wrap
    );
  }, [tiltActive, enableMobileTilt, animationHandlers, mobileTiltSensitivity]);

  useEffect(() => {
    if (!tiltActive || !animationHandlers) return;
    const card = cardRef.current!, wrap = wrapRef.current!;
    const pm = handlePointerMove as unknown as EventListener;
    const pe = handlePointerEnter as unknown as EventListener;
    const pl = handlePointerLeave as unknown as EventListener;
    const doHandler = handleDeviceOrientation as unknown as EventListener;

    const tryEnableDeviceTilt = () => {
      if (!enableMobileTilt || location.protocol !== "https:") return;
      const DM: any = (window as any).DeviceMotionEvent;
      if (DM && typeof DM.requestPermission === "function") {
        DM.requestPermission().then((s: string) => {
          if (s === "granted") window.addEventListener("deviceorientation", doHandler);
        }).catch(() => {});
      } else {
        window.addEventListener("deviceorientation", doHandler);
      }
    };

    card.addEventListener("pointerenter", pe);
    card.addEventListener("pointermove", pm);
    card.addEventListener("pointerleave", pl);
    if (enableMobileTilt) card.addEventListener("click", tryEnableDeviceTilt);

    const ix = wrap.clientWidth - ANIMATION_CONFIG.INITIAL_X_OFFSET;
    const iy = ANIMATION_CONFIG.INITIAL_Y_OFFSET;
    animationHandlers.updateCardTransform(ix, iy, card, wrap);
    animationHandlers.createSmoothAnimation(ANIMATION_CONFIG.INITIAL_DURATION, ix, iy, card, wrap);

    return () => {
      card.removeEventListener("pointerenter", pe);
      card.removeEventListener("pointermove", pm);
      card.removeEventListener("pointerleave", pl);
      if (enableMobileTilt) card.removeEventListener("click", tryEnableDeviceTilt);
      window.removeEventListener("deviceorientation", doHandler);
      animationHandlers.cancelAnimation();
    };
  }, [tiltActive, enableMobileTilt, animationHandlers, handlePointerMove, handlePointerEnter, handlePointerLeave, handleDeviceOrientation]);

  const cardStyle = useMemo(() => ({
    "--icon": iconUrl ? `url(${iconUrl})` : "none",
    "--grain": grainUrl ? `url(${grainUrl})` : "none",
    "--behind-gradient": showBehindGradient ? (behindGradient ?? DEFAULT_BEHIND_GRADIENT) : "none",
    "--inner-gradient": innerGradient ?? DEFAULT_INNER_GRADIENT,
  }) as React.CSSProperties, [iconUrl, grainUrl, showBehindGradient, behindGradient, innerGradient]);

  return (
    <div ref={wrapRef} className={`pc-card-wrapper ${className ?? ""}`} style={cardStyle}>
      <section ref={cardRef} className="pc-card">
        <div className="pc-inside">
          <div className="pc-shine" />
          <div className="pc-glare" />

          {/* Avatar + alt bilgi barı */}
          <div className="pc-content pc-avatar-content">
            <img
              className="avatar"
              src={avatarUrl}
              alt={`${name} avatar`}
              loading="lazy"
              onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
            />

            {showUserInfo && (
              <div className="pc-user-info">
                <div className="pc-user-details">
                  <div className="pc-mini-avatar">
                    <img
                      src={miniAvatarUrl || avatarUrl}
                      alt={`${name} mini avatar`}
                      loading="lazy"
                      onError={(e) => {
                        const t = e.target as HTMLImageElement;
                        t.style.opacity = "0.5";
                        t.src = avatarUrl;
                      }}
                    />
                  </div>
                  <div className="pc-user-text">
                    <div className="pc-handle">@{handle}</div>
                    <div className="pc-status">{status}</div>
                  </div>
                </div>

                {contactHref ? (
                  <a
                    className="pc-contact-btn"
                    href={contactHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ pointerEvents: "auto" }}
                    aria-label={`Contact ${name}`}
                  >
                    {contactText}
                  </a>
                ) : onContactClick ? (
                  <button
                    className="pc-contact-btn"
                    onClick={onContactClick}
                    style={{ pointerEvents: "auto" }}
                    type="button"
                    aria-label={`Contact ${name}`}
                  >
                    {contactText}
                  </button>
                ) : null}
              </div>
            )}
          </div>

          {/* İsim / ünvan */}
          <div className="pc-content">
            <div className="pc-details">
              <h3>{name}</h3>
              <p>{title}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default React.memo(ProfileCardComponent);
