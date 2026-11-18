import React from "react";
import { interpolate, spring } from "remotion";
import { since } from "../hooks";
import { C, fontStyle } from "../theme";
import { EASE, FPS } from "../timing";

const BARS = [0.28, 0.42, 0.35, 0.58, 0.5, 0.78, 0.66, 0.95];

/** Carte d'alerte sombre (dégradé violet en bas) : "Recherché ★★★" + mini graphique animé. */
export const AlertCard: React.FC<{ t: number; enterAt: number; exitAt: number }> = ({ t, enterAt, exitAt }) => {
  const enter = spring({ frame: since(t, enterAt), fps: FPS, config: { damping: 16, stiffness: 120 } });
  const exit = interpolate(t, [exitAt, exitAt + 0.5], [0, 1], { easing: EASE.in, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (enter <= 0.001 || exit >= 1) return null;
  const y = (1 - enter) * 520 + exit * 620;
  const blink = interpolate((t * 2) % 1, [0, 0.5, 1], [1, 0.25, 1], { easing: EASE.soft });

  return (
    <div
      style={{
        position: "absolute",
        left: 56,
        right: 56,
        bottom: 300,
        transform: `translateY(${y}px)`,
        borderRadius: 52,
        padding: "44px 48px 40px",
        background: `linear-gradient(180deg, #17111F 0%, #1D1430 45%, #4A1CB0 100%)`,
        boxShadow: `0 40px 80px rgba(20,0,40,0.55), 0 0 0 2px rgba(255,255,255,0.06) inset`,
        color: C.white,
        ...fontStyle,
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 30, color: "#FF6FAE", letterSpacing: "0.14em" }}>
        <div style={{ width: 18, height: 18, borderRadius: 9, background: C.pink, opacity: blink, boxShadow: `0 0 18px ${C.pink}` }} />
        ALERTE · VICE CITY
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: 18 }}>
        <div>
          <div style={{ fontSize: 92, lineHeight: 1 }}>Recherché</div>
          <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
            {[0, 1, 2, 3, 4].map((i) => {
              const on = i < 3;
              const s = on
                ? spring({ frame: since(t, enterAt + 0.45 + i * 0.22), fps: FPS, config: { damping: 9, stiffness: 200 } })
                : 1;
              return (
                <span
                  key={i}
                  style={{
                    fontSize: 72,
                    lineHeight: 1,
                    display: "inline-block",
                    transform: `scale(${on ? s : 1}) rotate(${on ? (1 - s) * -40 : 0}deg)`,
                    color: on ? C.pink : "rgba(255,255,255,0.16)",
                    textShadow: on ? `0 0 26px ${C.pink}` : "none",
                  }}
                >
                  ★
                </span>
              );
            })}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12 }}>
          <div style={{ fontSize: 26, color: "#CBBDF0", fontWeight: 700 }}>Patrouilles</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 150 }}>
            {BARS.map((h, i) => {
              const s = spring({ frame: since(t, enterAt + 0.3 + i * 0.07), fps: FPS, config: { damping: 13, stiffness: 110 } });
              const wobble = interpolate(Math.sin(t * 3 + i * 1.3), [-1, 1], [0.9, 1.05], { easing: EASE.soft });
              return (
                <div
                  key={i}
                  style={{
                    width: 26,
                    height: 150 * h * s * wobble,
                    borderRadius: 10,
                    background: i === BARS.length - 1 ? `linear-gradient(180deg, ${C.pink}, ${C.orange})` : `linear-gradient(180deg, #B48CFF, ${C.violet})`,
                    boxShadow: i === BARS.length - 1 ? `0 0 24px ${C.pink}` : "none",
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
