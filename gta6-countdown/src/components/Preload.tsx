import React from "react";
import { interpolate, spring } from "remotion";
import { since } from "../hooks";
import { C, fontStyle } from "../theme";
import { EASE, FPS, WIDTH } from "../timing";

export const BUTTON = { cx: WIDTH / 2, cy: 1420, w: 640, h: 150 };

/** Bouton "Précharger" : apparition, enfoncement (scale 0.95) au clic, puis progression. */
export const PreloadButton: React.FC<{ t: number; enterAt: number; clickAt: number }> = ({ t, enterAt, clickAt }) => {
  const enter = spring({ frame: since(t, enterAt), fps: FPS, config: { damping: 13, stiffness: 140 } });
  // Enfoncement : descend vers 0.95 puis rebondit à 1 avec un spring
  const press = interpolate(t, [clickAt - 0.08, clickAt], [1, 0.95], {
    easing: EASE.inOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const release = spring({ frame: since(t, clickAt + 0.02), fps: FPS, config: { damping: 8, stiffness: 220 } });
  const scale = t < clickAt ? press : 0.95 + 0.05 * release;
  const progress = interpolate(t, [clickAt + 0.15, clickAt + 1.35], [0, 1], {
    easing: EASE.inOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const done = t > clickAt + 1.4;
  const labelSwap = spring({ frame: since(t, clickAt + 0.05), fps: FPS, config: { damping: 16 } });
  const doneSwap = spring({ frame: since(t, clickAt + 1.4), fps: FPS, config: { damping: 12 } });
  const label = t < clickAt + 0.05 ? "Précharger" : done ? "Prêt" : `Préchargement ${Math.round(progress * 100)} %`;
  const swap = t < clickAt + 0.05 ? 1 : done ? doneSwap : labelSwap;

  return (
    <div
      style={{
        position: "absolute",
        left: BUTTON.cx - BUTTON.w / 2,
        top: BUTTON.cy - BUTTON.h / 2,
        width: BUTTON.w,
        height: BUTTON.h,
        transform: `translateY(${(1 - enter) * 160}px) scale(${scale * (0.6 + 0.4 * enter)})`,
        opacity: Math.min(1, enter * 1.5),
        borderRadius: BUTTON.h / 2,
        background: `linear-gradient(100deg, ${C.pink}, ${C.violet})`,
        boxShadow: `0 ${30 * scale}px 60px rgba(123,47,247,0.45), 0 0 0 4px rgba(255,255,255,0.6) inset`,
        overflow: "hidden",
        ...fontStyle,
      }}
    >
      {/* remplissage de progression */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: `${progress * 100}%`,
          background: `linear-gradient(100deg, ${C.orange}, ${C.pink})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 22,
          color: C.white,
          fontSize: 54,
          transform: `translateY(${(1 - swap) * 24}px)`,
          opacity: swap,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        <svg width="54" height="54" viewBox="0 0 48 48">
          {done ? (
            <path d="M10 25 L20 35 L38 14" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          ) : (
            <>
              <path d="M24 8 V30 M14 21 L24 31 L34 21" fill="none" stroke="#fff" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M10 38 H38" stroke="#fff" strokeWidth="5.5" strokeLinecap="round" />
            </>
          )}
        </svg>
        {label}
      </div>
    </div>
  );
};

/** Curseur qui arrive en courbe douce et clique. */
export const Cursor: React.FC<{ t: number; enterAt: number; clickAt: number; exitAt: number }> = ({ t, enterAt, clickAt, exitAt }) => {
  const arrive = { easing: EASE.out, extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
  // Trajectoire en arc : x et y avec des easings différents
  const x = interpolate(t, [enterAt, clickAt - 0.1], [1180, BUTTON.cx + 120], { ...arrive, easing: EASE.out });
  const y = interpolate(t, [enterAt, clickAt - 0.1], [2050, BUTTON.cy + 20], { ...arrive, easing: EASE.inOut });
  const leaveX = interpolate(t, [exitAt, exitAt + 0.8], [0, 260], { easing: EASE.in, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const leaveY = interpolate(t, [exitAt, exitAt + 0.8], [0, 420], { easing: EASE.in, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pressDown = interpolate(t, [clickAt - 0.1, clickAt], [1, 0.82], { easing: EASE.inOut, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pressUp = spring({ frame: since(t, clickAt + 0.02), fps: FPS, config: { damping: 10, stiffness: 200 } });
  const s = t < clickAt ? pressDown : 0.82 + 0.18 * pressUp;
  const ring = interpolate(t, [clickAt, clickAt + 0.5], [0, 1], { easing: EASE.out, extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  if (t < enterAt) return null;
  return (
    <>
      {t > clickAt && ring < 1 ? (
        <div
          style={{
            position: "absolute",
            left: x - 60 * (0.3 + ring),
            top: y - 60 * (0.3 + ring),
            width: 120 * (0.3 + ring),
            height: 120 * (0.3 + ring),
            borderRadius: "50%",
            border: "5px solid rgba(255,255,255,0.9)",
            opacity: 1 - ring,
            boxSizing: "border-box",
          }}
        />
      ) : null}
      <svg
        width="96"
        height="110"
        viewBox="0 0 48 55"
        style={{
          position: "absolute",
          left: x + leaveX - 8,
          top: y + leaveY - 4,
          transformOrigin: "8px 4px",
          transform: `scale(${s})`,
          filter: "drop-shadow(0 10px 14px rgba(40,10,60,0.35))",
        }}
      >
        <path d="M6 3 L6 42 L16 33 L23 50 L31 46 L24 30 L38 30 Z" fill={C.ink} stroke="#fff" strokeWidth="3.5" strokeLinejoin="round" />
      </svg>
    </>
  );
};

/** Pop de particules autour du bouton au moment du clic. */
export const Particles: React.FC<{ t: number; at: number }> = ({ t, at }) => {
  const colors = [C.pink, C.violet, C.orange, "#FFD84D", "#1FD1C1"];
  const p = interpolate(t, [at, at + 1.1], [0, 1], { easing: EASE.out, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (t < at || p >= 1) return null;
  const fade = interpolate(t, [at + 0.45, at + 1.1], [1, 0], { easing: EASE.inOut, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const n = 28;
  return (
    <>
      {Array.from({ length: n }).map((_, i) => {
        const a = (i / n) * Math.PI * 2 + (i % 3) * 0.2;
        const dist = 200 + (i % 5) * 55;
        // ellipse : la forme du bouton est plus large que haute
        const x = BUTTON.cx + Math.cos(a) * dist * p * 1.35;
        const y = BUTTON.cy + Math.sin(a) * dist * p * 0.85 + p * p * 60;
        const size = (i % 4 === 0 ? 26 : 16) * (1 - p * 0.5);
        const star = i % 4 === 0;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x - size / 2,
              top: y - size / 2,
              width: size,
              height: size,
              borderRadius: star ? 6 : "50%",
              transform: `rotate(${p * 280 + i * 20}deg)`,
              background: colors[i % colors.length],
              opacity: fade,
              boxShadow: `0 0 16px ${colors[i % colors.length]}`,
            }}
          />
        );
      })}
    </>
  );
};
