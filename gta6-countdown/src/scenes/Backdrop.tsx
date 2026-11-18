import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { C, fontStyle } from "../theme";
import { EASE } from "../timing";

/** Fond crème + titre, partagé par les scènes 5 et 6 (continuité parfaite). */
export const CreamBackdrop: React.FC<{ t: number; titleIn: number | null }> = ({ t, titleIn }) => {
  const k = titleIn === null ? 1 : interpolate(t, [titleIn, titleIn + 0.7], [0, 1], { easing: EASE.out, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const drift = interpolate(t, [15.5, 24.5], [0, 1], { easing: EASE.soft });
  return (
    <AbsoluteFill style={{ backgroundColor: C.cream }}>
      {/* taches de couleur douces */}
      <div style={{ position: "absolute", width: 900, height: 900, left: -380 + drift * 80, top: -260, borderRadius: "50%", background: C.pink, opacity: 0.13, filter: "blur(140px)" }} />
      <div style={{ position: "absolute", width: 900, height: 900, right: -420 + drift * 60, bottom: -240, borderRadius: "50%", background: C.violet, opacity: 0.12, filter: "blur(140px)" }} />
      <div style={{ position: "absolute", width: 600, height: 600, right: -200, top: 300 - drift * 60, borderRadius: "50%", background: C.orange, opacity: 0.12, filter: "blur(130px)" }} />
      {/* grille de points */}
      <AbsoluteFill style={{ backgroundImage: "radial-gradient(rgba(14,10,20,0.10) 2.5px, transparent 2.5px)", backgroundSize: "44px 44px", maskImage: "radial-gradient(70% 60% at 50% 50%, black, transparent)" }} />
      <div style={{ position: "absolute", top: 330, left: 0, right: 0, textAlign: "center", ...fontStyle, opacity: k, transform: `translateY(${(1 - k) * 40}px)` }}>
        <div style={{ fontSize: 34, letterSpacing: "0.3em", color: "#8A7FA0", fontWeight: 700 }}>PS5 · XBOX SERIES</div>
        <div
          style={{
            fontSize: 150,
            lineHeight: 1.05,
            marginTop: 14,
            backgroundImage: `linear-gradient(95deg, ${C.pink}, ${C.violet} 55%, ${C.orange})`,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          GTA 6
        </div>
      </div>
    </AbsoluteFill>
  );
};
