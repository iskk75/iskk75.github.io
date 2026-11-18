import { CameraMotionBlur } from "@remotion/motion-blur";
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame } from "remotion";
import { since } from "../hooks";
import { C, fontStyle } from "../theme";
import { EASE, FPS, T } from "../timing";
import { NightBackdrop } from "./S7Words";

const Content: React.FC<{ from: number }> = ({ from }) => {
  const t = (from + useCurrentFrame()) / FPS;
  const pop = spring({ frame: since(t, T.dateIn), fps: FPS, config: { damping: 14, stiffness: 110 } });
  const grow = interpolate(t, [T.dateIn, T.collapse], [0, 1], { easing: EASE.soft, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const glow = interpolate(t, [T.dateIn + 0.2, T.collapse], [0, 1], { easing: EASE.out, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // Tout se resserre en un point
  const collapse = interpolate(t, [T.collapse, T.blackout], [0, 1], { easing: EASE.in, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const textScale = (0.55 + 0.45 * pop + 0.14 * grow) * (1 - collapse);
  const dotR = interpolate(collapse, [0.6, 1], [0, 26], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fadeDot = interpolate(t, [T.blackout, 29.98], [1, 0], { easing: EASE.out, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const shrinkDot = interpolate(t, [T.blackout, 29.98], [1, 0.2], { easing: EASE.in, extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ transform: `scale(${textScale})`, opacity: Math.min(1, pop * 1.4) * (1 - collapse * 0.5), textAlign: "center", ...fontStyle }}>
        <div
          style={{
            fontSize: 170,
            color: "#FFF4FA",
            letterSpacing: "-0.03em",
            textShadow: `0 0 ${20 + 40 * glow}px ${C.pink}, 0 0 ${60 + 120 * glow}px ${C.pink}AA, 0 0 ${200 * glow}px ${C.violet}`,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          19.11.2026
        </div>
        <div style={{ fontSize: 40, marginTop: 20, letterSpacing: "0.32em", color: "#E7D9FF", opacity: glow, fontWeight: 700 }}>PS5 · XBOX SERIES</div>
      </div>
      {dotR > 0 ? (
        <div
          style={{
            position: "absolute",
            width: dotR * 2 * shrinkDot,
            height: dotR * 2 * shrinkDot,
            borderRadius: "50%",
            background: "#FFE3F0",
            boxShadow: `0 0 40px 16px ${C.pink}, 0 0 120px 40px ${C.violet}`,
            opacity: fadeDot,
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};

export const S8Outro: React.FC<{ from: number }> = ({ from }) => {
  const t = (from + useCurrentFrame()) / FPS;
  const bgOut = interpolate(t, [T.collapse, T.blackout], [1, 0], { easing: EASE.inOut, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <AbsoluteFill style={{ opacity: bgOut }}>
        <NightBackdrop t={t} />
      </AbsoluteFill>
      <CameraMotionBlur samples={8} shutterAngle={200}>
        <Content from={from} />
      </CameraMotionBlur>
    </AbsoluteFill>
  );
};
