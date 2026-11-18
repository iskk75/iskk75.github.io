import { CameraMotionBlur } from "@remotion/motion-blur";
import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame } from "remotion";
import { since } from "../hooks";
import { C } from "../theme";
import { EASE, FPS, T } from "../timing";

/** Le point rose (lu dans CameraMotionBlur, donc via useCurrentFrame). */
const Dot: React.FC<{ from: number }> = ({ from }) => {
  const t = (from + useCurrentFrame()) / FPS;
  const appear = spring({ frame: since(t, T.pulseStart), fps: FPS, config: { damping: 12, stiffness: 120 } });
  // Pulsation : chaque battement est une courbe easée (pas de sinus brut)
  const beat = ((t - T.pulseStart) / 0.6) % 1;
  const pulse = t < T.pulseStart ? 0 : interpolate(beat, [0, 0.25, 1], [0, 1, 0], { easing: EASE.soft });
  const zoom = interpolate(t, [T.zoomStart, 2.15], [1, 26], { easing: Easing.bezier(0.5, 0, 0.75, 0), extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const r = 22 * appear * (1 + 0.18 * pulse) * zoom;
  const ringP = beat;
  const ringR = 22 + interpolate(ringP, [0, 1], [0, 90], { easing: EASE.out });
  const ringO = t < T.pulseStart + 0.1 || t > T.zoomStart ? 0 : interpolate(ringP, [0, 1], [0.7, 0], { easing: EASE.out });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          position: "absolute",
          width: ringR * 2,
          height: ringR * 2,
          borderRadius: "50%",
          border: `4px solid ${C.pink}`,
          opacity: ringO,
        }}
      />
      <div
        style={{
          width: r * 2,
          height: r * 2,
          borderRadius: "50%",
          background: `radial-gradient(circle, #FFE3F0 0%, ${C.pink} 45%, ${C.violet} 100%)`,
          boxShadow: `0 0 ${40 + 60 * pulse}px ${12 + 18 * pulse}px ${C.pink}AA, 0 0 ${200 * zoom}px ${C.violet}66`,
        }}
      />
    </AbsoluteFill>
  );
};

export const S1Intro: React.FC<{ from: number }> = ({ from }) => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <CameraMotionBlur samples={8} shutterAngle={200}>
      <Dot from={from} />
    </CameraMotionBlur>
  </AbsoluteFill>
);
