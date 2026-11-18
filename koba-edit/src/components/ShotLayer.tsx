import React from "react";
import { AbsoluteFill, interpolate, OffthreadVideo, random, spring, staticFile, useCurrentFrame } from "remotion";
import { BEATS, DROP_S, EASE, FPS, HEIGHT, Shot, WIDTH } from "../timing";

/** Dimensions source de chaque clip (pour un cadrage "cover" précis). */
const SIZES: Record<string, [number, number]> = {
  "clips/v1.mp4": [480, 848],
  "clips/v2.mp4": [576, 1024],
  "clips/v3.mp4": [576, 1024],
  "clips/v4r.mp4": [1024, 576],
  "clips/v5.mp4": [1268, 576],
  "clips/v6.mp4": [576, 1024],
  "clips/v7c.mp4": [576, 322],
};

/** Temps source (s) en fonction du temps local du plan : ralenti, accéléré, rampe de vitesse, arrêt sur image. */
export const sourceTime = (shot: Shot, local: number) => {
  const dur = shot.end - shot.start;
  switch (shot.speed) {
    case "slow":
      return shot.from + interpolate(local, [0, dur], [0, dur * 0.5], { easing: EASE.out });
    case "crawl":
      // ultra-ralenti (0,15x) : la poussée de caméra du plan masque la cadence
      return shot.from + interpolate(local, [0, dur], [0, dur * 0.055], { easing: EASE.inOut });
    case "veryslow":
      return shot.from + interpolate(local, [0, dur], [0, dur * 0.33], { easing: EASE.out });
    case "fast":
      return shot.from + interpolate(local, [0, dur], [0, dur * 1.8], { easing: EASE.inOut });
    case "ramp":
      // velocity edit : très rapide au début, puis presque figé
      return shot.from + interpolate(local, [0, dur], [0, dur * 1.25], { easing: EASE.ramp });
    case "freeze": {
      const hold = Math.min(dur * 0.55, 0.45);
      return shot.from + interpolate(local, [0, hold, dur], [0, 0.18, 0.2], { easing: EASE.out, extrapolateRight: "clamp" });
    }
    default:
      return shot.from + interpolate(local, [0, dur], [0, dur], { easing: (x) => x });
  }
};

const Video: React.FC<{ shot: Shot; srcT: number; style?: React.CSSProperties }> = ({ shot, srcT, style }) => {
  const frame = useCurrentFrame();
  const [w, h] = SIZES[shot.src];
  const z = shot.zoom ?? 1;
  const scale = Math.max(WIDTH / w, HEIGHT / h) * z;
  const dw = w * scale;
  const dh = h * scale;
  const left = Math.min(0, Math.max(WIDTH - dw, WIDTH / 2 - dw * shot.fx));
  const top = Math.min(0, Math.max(HEIGHT - dh, HEIGHT / 2 - dh * shot.fy));
  // Remappage temporel : à chaque image, on décale le point d'entrée pour que la vidéo
  // affiche exactement srcT (ralenti, accéléré, rampe, arrêt sur image).
  const trimBefore = Math.max(0, Math.round(srcT * FPS) - frame);
  return (
    <OffthreadVideo
      src={staticFile(shot.src)}
      muted
      trimBefore={trimBefore}
      style={{ position: "absolute", left, top, width: dw, height: dh, ...style }}
    />
  );
};

/** Un plan, avec sa transition d'entrée, son étalonnage et la secousse sur les temps. */
export const ShotLayer: React.FC<{ shot: Shot }> = ({ shot }) => {
  const frame = useCurrentFrame(); // local à la Sequence du plan
  const local = frame / FPS;
  const t = shot.start + local;
  const srcT = sourceTime(shot, local);

  /* --- Transition d'entrée --- */
  let transform = "";
  let filter = "";
  let glitch = 0;
  const pop = spring({ frame, fps: FPS, config: { damping: 14, stiffness: 260, mass: 0.6 } });
  switch (shot.tin) {
    case "zoom":
      transform += ` scale(${interpolate(pop, [0, 1], [1.45, 1])})`;
      filter += ` blur(${interpolate(frame, [0, 6], [8, 0], { extrapolateRight: "clamp", easing: EASE.out })}px)`;
      break;
    case "whip": {
      const x = interpolate(frame, [0, 9], [WIDTH * 0.85, 0], { extrapolateRight: "clamp", easing: EASE.out });
      transform += ` translateX(${x}px) skewX(${interpolate(frame, [0, 9], [-8, 0], { extrapolateRight: "clamp", easing: EASE.out })}deg)`;
      filter += ` blur(${interpolate(frame, [0, 9], [28, 0], { extrapolateRight: "clamp", easing: EASE.out })}px)`;
      break;
    }
    case "glitch":
      glitch = interpolate(frame, [0, 10], [1, 0], { extrapolateRight: "clamp", easing: EASE.out });
      break;
    case "velocity":
      transform += ` scale(${interpolate(frame, [0, 14], [1.25, 1.02], { extrapolateRight: "clamp", easing: EASE.ramp })})`;
      filter += ` blur(${interpolate(frame, [0, 5], [10, 0], { extrapolateRight: "clamp", easing: EASE.out })}px)`;
      break;
    case "shake":
    case "flash":
    case "cut":
    default:
      break;
  }

  /* --- Secousse sur les basses (chaque temps après le drop, + entrée "shake") --- */
  const lastBeat = [...BEATS].reverse().find((bt) => bt <= t + 1e-6) ?? 0;
  const sinceBeat = (t - lastBeat) * FPS;
  const onDrop = t >= DROP_S;
  const amp =
    (onDrop ? interpolate(sinceBeat, [0, 9], [16, 0], { extrapolateRight: "clamp", easing: EASE.out }) : 0) +
    (shot.tin === "shake" ? interpolate(frame, [0, 14], [26, 0], { extrapolateRight: "clamp", easing: EASE.out }) : 0);
  const sx = (random(`sx${Math.floor(t * FPS)}`) - 0.5) * 2 * amp;
  const sy = (random(`sy${Math.floor(t * FPS)}`) - 0.5) * 2 * amp;
  const sr = (random(`sr${Math.floor(t * FPS)}`) - 0.5) * amp * 0.06;
  const beatPunch = onDrop ? interpolate(sinceBeat, [0, 10], [1.035, 1], { extrapolateRight: "clamp", easing: EASE.out }) : 1;
  const push = shot.speed === "crawl" ? interpolate(local, [0, shot.end - shot.start], [1, 1.16], { easing: EASE.inOut }) : 1;
  transform = `translate(${sx}px, ${sy}px) rotate(${sr}deg) scale(${beatPunch * push})${transform}`;

  /* --- Étalonnage : contraste fort ; froid sur les plans calmes, chaud sur le drop --- */
  const grade =
    shot.tone === "cold"
      ? "contrast(1.28) saturate(0.85) brightness(0.95)"
      : shot.tone === "warm"
        ? "contrast(1.32) saturate(1.25) brightness(1.02)"
        : "contrast(1.3) saturate(1.2) brightness(1.06)";
  const tint =
    shot.tone === "cold"
      ? "linear-gradient(180deg, rgba(40,120,255,0.28), rgba(10,40,120,0.32))"
      : shot.tone === "warm"
        ? "linear-gradient(180deg, rgba(255,120,30,0.26), rgba(200,30,10,0.24))"
        : "linear-gradient(180deg, rgba(255,190,60,0.26), rgba(255,90,20,0.22))";

  const offset = glitch * 26;
  const sliceShift = glitch > 0.05 ? (random(`gl${frame}`) - 0.5) * 120 * glitch : 0;

  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#000" }}>
      <AbsoluteFill style={{ transform, filter: `${grade}${filter}` }}>
        <Video shot={shot} srcT={srcT} />
        {glitch > 0.02 ? (
          <>
            {/* séparation RVB : copies décalées, canal rouge et canal cyan */}
            <AbsoluteFill style={{ mixBlendMode: "screen", opacity: 0.85 * glitch, transform: `translateX(${offset}px)`, filter: "url(#only-red)" }}>
              <Video shot={shot} srcT={srcT} />
            </AbsoluteFill>
            <AbsoluteFill style={{ mixBlendMode: "screen", opacity: 0.85 * glitch, transform: `translateX(${-offset}px)`, filter: "url(#only-cyan)" }}>
              <Video shot={shot} srcT={srcT} />
            </AbsoluteFill>
            {/* bande décalée */}
            <AbsoluteFill
              style={{
                clipPath: `inset(${30 + random(`gy${frame}`) * 40}% 0 ${20 + random(`gh${frame}`) * 20}% 0)`,
                transform: `translateX(${sliceShift}px)`,
              }}
            >
              <Video shot={shot} srcT={srcT} />
            </AbsoluteFill>
          </>
        ) : null}
      </AbsoluteFill>
      <AbsoluteFill style={{ background: tint, mixBlendMode: "soft-light" }} />
      <AbsoluteFill style={{ background: tint, mixBlendMode: "overlay", opacity: 0.5 }} />
    </AbsoluteFill>
  );
};

/** Filtres SVG partagés (séparation des canaux pour le glitch). */
export const SvgDefs: React.FC = () => (
  <svg width="0" height="0" style={{ position: "absolute" }}>
    <filter id="only-red">
      <feColorMatrix type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" />
    </filter>
    <filter id="only-cyan">
      <feColorMatrix type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0" />
    </filter>
  </svg>
);
