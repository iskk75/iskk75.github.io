import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { DROP_S, EASE, FINALE_S, FPS, SHOTS, b } from "../timing";

/** Grain de film léger (bruit SVG, graine différente à chaque image). */
export const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  const seed = Math.floor(random(`g${frame}`) * 1000);
  return (
    <AbsoluteFill style={{ mixBlendMode: "overlay", opacity: 0.22, pointerEvents: "none" }}>
      <svg width="100%" height="100%">
        <filter id={`grain${frame}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={seed} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#grain${frame})`} />
      </svg>
    </AbsoluteFill>
  );
};

export const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      background: "radial-gradient(ellipse 75% 62% at 50% 46%, transparent 52%, rgba(0,0,0,0.55) 82%, rgba(0,0,0,0.85) 100%)",
      pointerEvents: "none",
    }}
  />
);

/** Flash blanc d'une image sur les transitions "flash" (+ décroissance très courte). */
export const Flashes: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  let o = 0;
  for (const s of SHOTS) {
    if (s.tin !== "flash") continue;
    const d = (t - s.start) * FPS;
    if (d >= 0 && d < 8) o = Math.max(o, d < 1 ? 1 : interpolate(d, [1, 8], [0.55, 0], { easing: EASE.out }));
  }
  if (o <= 0) return null;
  return <AbsoluteFill style={{ backgroundColor: "#fff", opacity: o, pointerEvents: "none" }} />;
};

/** Flare anamorphique + halo lumineux sur les moments forts (drop, final). */
export const Flares: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const hits = [DROP_S, b(12), b(14), FINALE_S, b(17)];
  let k = 0;
  let at = 0;
  for (const h of hits) {
    const d = t - h;
    if (d >= 0 && d < 1.2) {
      const v = interpolate(d, [0, 0.08, 1.2], [0, 1, 0], { easing: EASE.out });
      if (v > k) {
        k = v;
        at = h;
      }
    }
  }
  // Le final garde une lumière qui respire
  const finale = interpolate(t, [b(17), b(17) + 0.4, b(20)], [0, 0.75, 0.55], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE.out });
  const strength = Math.max(k, finale);
  if (strength <= 0.01) return null;
  const y = 30 + random(`fy${at}`) * 25;
  const drift = (t - at) * 60;
  return (
    <AbsoluteFill style={{ mixBlendMode: "screen", pointerEvents: "none" }}>
      {/* traînée horizontale */}
      <div
        style={{
          position: "absolute",
          left: -200,
          right: -200,
          top: `${y}%`,
          height: 10,
          transform: `translateX(${drift}px)`,
          background: "linear-gradient(90deg, transparent, rgba(255,170,90,0.9) 40%, #fff 50%, rgba(255,170,90,0.9) 60%, transparent)",
          filter: "blur(6px)",
          opacity: strength,
        }}
      />
      {/* source */}
      <div
        style={{
          position: "absolute",
          left: `${62 + random(`fx${at}`) * 20}%`,
          top: `${y}%`,
          width: 520,
          height: 520,
          transform: "translate(-50%, -50%)",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,190,110,0.55) 18%, rgba(255,90,40,0.18) 45%, transparent 70%)",
          opacity: strength,
        }}
      />
      {/* fuite de lumière chaude */}
      <AbsoluteFill
        style={{
          background: "radial-gradient(70% 45% at 85% 20%, rgba(255,140,40,0.55), transparent 70%), radial-gradient(60% 40% at 10% 90%, rgba(255,40,80,0.35), transparent 70%)",
          opacity: strength * 0.8,
        }}
      />
    </AbsoluteFill>
  );
};
