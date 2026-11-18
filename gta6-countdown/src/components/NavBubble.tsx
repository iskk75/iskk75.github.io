import React from "react";
import { interpolate, spring } from "remotion";
import { since } from "../hooks";
import { C, fontStyle } from "../theme";
import { EASE, FPS } from "../timing";

type Arrow = "straight" | "left";

const ArrowIcon: React.FC<{ type: Arrow }> = ({ type }) => (
  <svg width="64" height="64" viewBox="0 0 64 64">
    {type === "straight" ? (
      <path d="M32 8 L50 30 H38 V56 H26 V30 H14 Z" fill="#fff" strokeLinejoin="round" stroke="#fff" strokeWidth="3" />
    ) : (
      <path
        d="M44 56 V34 C44 28 40 24 34 24 H24 V34 L8 19 L24 4 V14 H34 C46 14 54 22 54 34 V56 Z"
        fill="#fff"
        stroke="#fff"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    )}
  </svg>
);

/** Bulle de guidage noire arrondie (en haut à gauche), style application GPS. */
export const NavBubble: React.FC<{
  t: number;
  enterAt: number;
  exitAt?: number;
  steps: { at: number; street: string; meters: [number, number]; until: number; arrow: Arrow }[];
}> = ({ t, enterAt, exitAt, steps }) => {
  const enter = spring({ frame: since(t, enterAt), fps: FPS, config: { damping: 15, stiffness: 140 } });
  const exit = exitAt
    ? interpolate(t, [exitAt, exitAt + 0.45], [0, 1], { easing: EASE.in, extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 0;
  const shown = enter * (1 - exit);
  if (shown <= 0.001) return null;

  // Étape courante + bascule douce (flip vertical) entre deux étapes
  let idx = 0;
  steps.forEach((s, i) => {
    if (t >= s.at) idx = i;
  });
  const step = steps[idx];
  const flip = spring({ frame: since(t, step.at), fps: FPS, config: { damping: 16, stiffness: 170 } });
  const flipY = idx === 0 ? 0 : (1 - flip) * 40;
  const flipO = idx === 0 ? 1 : flip;
  const meters = interpolate(t, [step.at, step.until], step.meters, {
    easing: EASE.soft,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const m = Math.max(10, Math.round(meters / 10) * 10);

  return (
    <div
      style={{
        position: "absolute",
        left: 56,
        top: 200,
        transformOrigin: "0% 0%",
        transform: `translateY(${(1 - shown) * -40}px) scale(${0.7 + 0.3 * shown})`,
        opacity: shown,
        display: "flex",
        alignItems: "center",
        gap: 26,
        padding: "26px 40px 26px 26px",
        background: "rgba(10,8,14,0.94)",
        borderRadius: 44,
        boxShadow: "0 24px 60px rgba(30,0,40,0.45)",
        ...fontStyle,
      }}
    >
      <div
        style={{
          width: 96,
          height: 96,
          borderRadius: 30,
          background: `linear-gradient(135deg, ${C.pink}, ${C.violet})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 0 30px ${C.pink}66`,
        }}
      >
        <div style={{ transform: `translateY(${flipY * 0.4}px)`, opacity: flipO }}>
          <ArrowIcon type={step.arrow} />
        </div>
      </div>
      <div style={{ transform: `translateY(${flipY}px)`, opacity: flipO, color: C.white, fontSize: 50, whiteSpace: "nowrap" }}>
        {step.street}
        <span style={{ color: "#B9AFC9", fontWeight: 700 }}> · </span>
        <span style={{ color: C.pink, fontVariantNumeric: "tabular-nums" }}>{m} m</span>
      </div>
    </div>
  );
};
