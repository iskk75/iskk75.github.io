import React from "react";
import { AbsoluteFill, interpolate, spring } from "remotion";
import { since, useAbsolute } from "../hooks";
import { C, fontStyle } from "../theme";
import { EASE, FPS, T } from "../timing";

export const NightBackdrop: React.FC<{ t: number }> = ({ t }) => {
  const d = interpolate(t, [23.5, 30], [0, 1], { easing: EASE.soft });
  return (
    <AbsoluteFill style={{ backgroundColor: "#07040C" }}>
      <div style={{ position: "absolute", width: 1100, height: 1100, left: -500 + d * 160, top: -300, borderRadius: "50%", background: C.violet, opacity: 0.28, filter: "blur(170px)" }} />
      <div style={{ position: "absolute", width: 1000, height: 1000, right: -520 + d * 120, bottom: -200, borderRadius: "50%", background: C.pink, opacity: 0.22, filter: "blur(170px)" }} />
    </AbsoluteFill>
  );
};

const WORDS = [
  { text: "Demain.", color: C.cream },
  { text: "Minuit.", color: C.cream },
  { text: "Vice City.", color: "gradient" },
];

/** Texte mot par mot : chaque mot arrive flouté puis se précise. */
export const S7Words: React.FC<{ from: number }> = ({ from }) => {
  const { t } = useAbsolute(from);
  const out = interpolate(t, [27.5, 28.0], [0, 1], { easing: EASE.in, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <NightBackdrop t={t} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 10, ...fontStyle }}>
        {WORDS.map((w, i) => {
          const at = T.words[i];
          const s = spring({ frame: since(t, at), fps: FPS, config: { damping: 18, stiffness: 120 } });
          const blur = interpolate(t, [at, at + 0.55], [28, 0], { easing: EASE.out, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const next = T.words[i + 1];
          const dim = next ? interpolate(t, [next, next + 0.4], [1, 0.42], { easing: EASE.inOut, extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
          const isLast = i === WORDS.length - 1;
          return (
            <div
              key={w.text}
              style={{
                fontSize: isLast ? 190 : 150,
                lineHeight: 1.1,
                opacity: s * dim * (1 - out),
                filter: `blur(${blur + out * 20}px)`,
                transform: `translateY(${(1 - s) * 50 - out * 80}px) scale(${1.08 - 0.08 * s})`,
                color: w.color === "gradient" ? "transparent" : w.color,
                backgroundImage: w.color === "gradient" ? `linear-gradient(95deg, ${C.pink}, ${C.orange})` : undefined,
                WebkitBackgroundClip: w.color === "gradient" ? "text" : undefined,
                backgroundClip: w.color === "gradient" ? "text" : undefined,
                textShadow: isLast ? "none" : undefined,
                padding: "0 20px",
              }}
            >
              {w.text}
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
