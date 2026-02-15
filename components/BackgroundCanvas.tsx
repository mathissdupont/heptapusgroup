"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import LiquidEther from "@/components/LiquidEther";

const DARK_COLORS  = ["#3a2d8f", "#7b5cff", "#b19eef"];
const LIGHT_COLORS = ["#c4d4f0", "#a8bce6", "#e0e8f5"];

export default function BackgroundCanvas() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = !mounted || resolvedTheme === "dark";
  const colors = isDark ? DARK_COLORS : LIGHT_COLORS;

  return (
    <div
      className="bg-root"
      style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}
    >
      <LiquidEther
        key={isDark ? "dark" : "light"}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "auto",
        }}
        colors={colors}
        resolution={0.5}
        autoDemo
        autoSpeed={0.18}
        autoIntensity={0.9}
        takeoverDuration={0.5}
        autoResumeDelay={3000}
        autoRampDuration={0.6}
        mouseForce={30}
        cursorSize={110}
        isViscous={false}
        viscous={30}
        iterationsViscous={32}
        iterationsPoisson={32}
        isBounce
      />

      <div className="bg-dim" style={{ pointerEvents: "none" }} />
    </div>
  );
}
