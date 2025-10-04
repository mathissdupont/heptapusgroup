"use client";
import LiquidEther from "@/components/LiquidEther";

export default function BackgroundCanvas() {
  return (
    <div
      className="bg-root" // Tam ekran sabit layer
      // pointerEvents kapalı, canvas'ta açacağız (UI'yi engellemesin)
      style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}
    >
      <LiquidEther
        // Canvas doğrudan etkileşim alsın
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "auto",
        }}
        colors={["#3a2d8f", "#7b5cff", "#b19eef"]}
        resolution={0.5}
        autoDemo
        autoSpeed={0.45}
        autoIntensity={1.9}
        takeoverDuration={0.5}
        autoResumeDelay={3000}
        autoRampDuration={0.6}
        mouseForce={50}
        cursorSize={110}
        isViscous={false}
        viscous={30}
        iterationsViscous={32}
        iterationsPoisson={32}
        isBounce
      />

      {/* Dim katman görünür kalsın ama etkileşimi engellemesin */}
      <div className="bg-dim" style={{ pointerEvents: "none" }} />
    </div>
  );
}
