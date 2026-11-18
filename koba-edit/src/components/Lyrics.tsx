import { loadFont } from "@remotion/fonts";
import React from "react";
import { interpolate, random, spring, staticFile, useCurrentFrame } from "remotion";
import { BEATS, DROP_S, EASE, FPS, LYRICS } from "../timing";

const FONT = "Anton";
loadFont({ family: FONT, url: staticFile("fonts/anton-latin-400-normal.woff2"), weight: "400" });

/** Paroles mot par mot : chaque mot tombe pile sur la voix, le mot-clé passe en couleur et grossit. */
export const Lyrics: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const line = LYRICS.find((l) => t >= l.start && t < l.end);
  if (!line) return null;

  const out = interpolate(t, [line.end - 0.12, line.end], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE.in });
  // léger tremblement sur le rythme
  const lastBeat = [...BEATS].reverse().find((bt) => bt <= t) ?? 0;
  const sb = (t - lastBeat) * FPS;
  const amp = interpolate(sb, [0, 8], [t >= DROP_S ? 9 : 4, 0], { extrapolateRight: "clamp", easing: EASE.out });
  const jx = (random(`lx${frame}`) - 0.5) * 2 * amp;
  const jy = (random(`ly${frame}`) - 0.5) * 2 * amp;
  const beatScale = interpolate(sb, [0, 8], [1.05, 1], { extrapolateRight: "clamp", easing: EASE.out });

  const enter = spring({ frame: (t - line.start) * FPS, fps: FPS, config: { damping: 16, stiffness: 200 } });

  return (
    <div
      style={{
        position: "absolute",
        left: `${line.pos.x}%`,
        top: `${line.pos.y}%`,
        width: 980,
        transform: `translate(-50%, -50%) translate(${jx}px, ${jy}px) rotate(${line.pos.rot}deg) scale(${beatScale * (0.9 + 0.1 * enter)})`,
        opacity: out,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "baseline",
        columnGap: 30,
        rowGap: 0,
        fontFamily: FONT,
        lineHeight: 1.02,
        textAlign: "center",
      }}
    >
      {line.words.map((w, i) => {
        const appear = t >= w.t;
        const s = spring({ frame: (t - w.t) * FPS, fps: FPS, config: { damping: 11, stiffness: 320, mass: 0.5 } });
        const keyGrow = w.key ? spring({ frame: (t - w.t) * FPS, fps: FPS, config: { damping: 9, stiffness: 180 } }) : 0;
        const size = w.key ? 150 : 104;
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              margin: w.key ? "0 10px" : 0,
              fontSize: size,
              color: w.key ? line.color : "#FFFFFF",
              visibility: appear ? "visible" : "hidden",
              transform: `scale(${appear ? (0.4 + 0.6 * s) * (1 + 0.12 * keyGrow) : 0}) translateY(${(1 - s) * 30}px)`,
              WebkitTextStroke: "7px #000",
              paintOrder: "stroke fill",
              textShadow: w.key
                ? `0 0 34px ${line.color}AA, 0 6px 0 rgba(0,0,0,0.55)`
                : "0 6px 0 rgba(0,0,0,0.5), 0 0 24px rgba(0,0,0,0.45)",
              letterSpacing: "0.01em",
            }}
          >
            {w.w}
          </span>
        );
      })}
    </div>
  );
};
