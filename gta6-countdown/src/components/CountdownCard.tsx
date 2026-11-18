import { CameraMotionBlur } from "@remotion/motion-blur";
import React from "react";
import { interpolate, spring, useCurrentFrame } from "remotion";
import { secondsUntilRelease, splitHMS } from "../countdown";
import { since } from "../hooks";
import { C, fontStyle } from "../theme";
import { EASE, FPS } from "../timing";

const DIGIT_H = 190;

/** Un chiffre qui roule verticalement (spring) quand sa valeur change. */
const Digit: React.FC<{ cur: string; prev: string; local: number }> = ({ cur, prev, local }) => {
  const changed = cur !== prev;
  const s = changed ? spring({ frame: local, fps: FPS, config: { damping: 13, stiffness: 150, mass: 0.7 } }) : 1;
  return (
    <div style={{ position: "relative", width: 112, height: DIGIT_H, overflow: "hidden" }}>
      {changed ? (
        <div style={{ position: "absolute", inset: 0, textAlign: "center", transform: `translateY(${-s * DIGIT_H}px)`, opacity: 1 - s }}>
          {prev}
        </div>
      ) : null}
      <div style={{ position: "absolute", inset: 0, textAlign: "center", transform: `translateY(${(1 - s) * DIGIT_H}px)` }}>{cur}</div>
    </div>
  );
};

/**
 * Compteur HH:MM:SS. Le temps restant est calculé à partir de l'heure du rendu
 * (renderTimeMs, injecté par calculateMetadata) + la frame ABSOLUE de la vidéo.
 * NB : useCurrentFrame() est lu ici pour que <CameraMotionBlur> puisse échantillonner des sous-frames.
 */
const Counter: React.FC<{ renderTimeMs: number; from: number }> = ({ renderTimeMs, from }) => {
  const frame = from + useCurrentFrame();
  const sec = Math.floor(frame / FPS);
  const local = frame - sec * FPS;
  const startRemaining = secondsUntilRelease(renderTimeMs);
  const now = splitHMS(startRemaining - sec);
  const prev = splitHMS(startRemaining - sec + 1);
  const group = (k: "h" | "m" | "s") => (
    <div style={{ display: "flex" }}>
      {now[k].split("").map((d, i) => (
        <Digit key={i} cur={d} prev={prev[k].padStart(now[k].length, "0")[i] ?? d} local={local} />
      ))}
    </div>
  );
  const colon = <div style={{ width: 52, textAlign: "center", color: "#C9B8F2", transform: "translateY(-10px)" }}>:</div>;
  return (
    <div style={{ display: "flex", alignItems: "center", fontSize: 176, lineHeight: `${DIGIT_H}px`, fontVariantNumeric: "tabular-nums", color: C.ink }}>
      {group("h")}
      {colon}
      {group("m")}
      {colon}
      {group("s")}
    </div>
  );
};

/** Carte blanche + halo arc-en-ciel (conic-gradient flouté qui tourne). */
export const CountdownCard: React.FC<{
  t: number;
  from: number;
  renderTimeMs: number;
  enterAt: number | null; // null = déjà visible (continuité entre scènes)
  y?: number;
}> = ({ t, from, renderTimeMs, enterAt, y = 0 }) => {
  const enter = enterAt === null ? 1 : spring({ frame: since(t, enterAt), fps: FPS, config: { damping: 15, stiffness: 110 } });
  const label = enterAt === null ? 1 : spring({ frame: since(t, enterAt + 0.25), fps: FPS, config: { damping: 18 } });
  const digits = enterAt === null ? 1 : spring({ frame: since(t, enterAt + 0.45), fps: FPS, config: { damping: 16 } });
  const angle = interpolate(t, [15, 26], [0, 540], { easing: EASE.soft });
  const haloPulse = interpolate(Math.sin(t * 2.4), [-1, 1], [0.85, 1], { easing: EASE.soft });

  return (
    <div
      style={{
        position: "absolute",
        left: 70,
        right: 70,
        top: 720 + y,
        height: 500,
        transform: `translateY(${(1 - enter) * 120}px) scale(${0.86 + 0.14 * enter})`,
        opacity: Math.min(1, enter * 1.4),
      }}
    >
      {/* Halo */}
      <div
        style={{
          position: "absolute",
          inset: -36,
          borderRadius: 90,
          background: `conic-gradient(from ${angle}deg, ${C.pink}, ${C.violet}, #3D7BFF, #1FD1C1, #FFD84D, ${C.orange}, ${C.pink})`,
          filter: "blur(46px)",
          opacity: 0.85 * haloPulse,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: -5,
          borderRadius: 66,
          background: `conic-gradient(from ${angle}deg, ${C.pink}, ${C.violet}, #3D7BFF, #1FD1C1, #FFD84D, ${C.orange}, ${C.pink})`,
          opacity: 0.9,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 62,
          background: "#FFFFFF",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          ...fontStyle,
        }}
      >
        <div
          style={{
            fontSize: 54,
            color: C.violet,
            opacity: label,
            transform: `translateY(${(1 - label) * 20}px)`,
            marginBottom: 6,
          }}
        >
          Sortie dans
        </div>
        <div style={{ position: "relative", width: 900, height: DIGIT_H + 10, opacity: digits, transform: `translateY(${(1 - digits) * 30}px)` }}>
          <CameraMotionBlur samples={6} shutterAngle={160}>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%", height: "100%" }}>
              <Counter renderTimeMs={renderTimeMs} from={from} />
            </div>
          </CameraMotionBlur>
        </div>
        <div
          style={{
            display: "flex",
            gap: 0,
            width: 760,
            justifyContent: "space-between",
            fontSize: 26,
            fontWeight: 700,
            color: "#9A90AE",
            letterSpacing: "0.18em",
            opacity: digits,
            marginTop: 4,
          }}
        >
          <span style={{ width: 224, textAlign: "center" }}>HEURES</span>
          <span style={{ width: 224, textAlign: "center" }}>MINUTES</span>
          <span style={{ width: 224, textAlign: "center" }}>SECONDES</span>
        </div>
      </div>
    </div>
  );
};
