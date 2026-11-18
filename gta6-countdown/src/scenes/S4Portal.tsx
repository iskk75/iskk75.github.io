import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { PolicePins } from "../components/PolicePins";
import { useAbsolute } from "../hooks";
import { projectToScreen, playerAt } from "../three/camera";
import { CityLayer } from "../three/CityLayer";
import { C } from "../theme";
import { EASE, HEIGHT, T, WIDTH } from "../timing";

/** Portail circulaire qui s'ouvre sur le joueur et révèle la route vue de dessus. */
export const S4Portal: React.FC<{ from: number }> = ({ from }) => {
  const { t } = useAbsolute(from);
  const open = interpolate(t, [T.portalOpen, T.portalFull], [0, 1], {
    easing: EASE.inOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const maxR = Math.hypot(WIDTH, HEIGHT) / 2 + 80;
  const r = open * maxR;
  // Le centre part de la position écran du joueur et glisse vers le centre de l'image.
  const p = playerAt(t);
  const anchor = projectToScreen(t, p.x, 0, p.z);
  const cx = interpolate(open, [0, 1], [anchor.x, WIDTH / 2]);
  const cy = interpolate(open, [0, 1], [anchor.y, HEIGHT / 2]);
  const pinsFade = interpolate(t, [T.portalOpen, T.portalOpen + 0.5], [1, 0], { easing: EASE.out, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ring = interpolate(open, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);

  return (
    <AbsoluteFill>
      {open < 1 ? <CityLayer t={t} routeProgress={1} showPolice /> : null}
      {pinsFade > 0 ? <PolicePins t={t} fadeOut={pinsFade} /> : null}
      {r > 1 ? (
        <AbsoluteFill style={{ clipPath: `circle(${r}px at ${cx}px ${cy}px)` }}>
          <AbsoluteFill style={{ transform: `scale(${interpolate(open, [0, 1], [1.35, 1])})`, transformOrigin: `${cx}px ${cy}px` }}>
            <CityLayer t={t} mode="top" routeProgress={1} showPolice dof={0.5} />
          </AbsoluteFill>
        </AbsoluteFill>
      ) : null}
      {r > 1 ? (
        <div
          style={{
            position: "absolute",
            left: cx - r,
            top: cy - r,
            width: r * 2,
            height: r * 2,
            borderRadius: "50%",
            boxSizing: "border-box",
            border: `${14 * ring}px solid transparent`,
            background: `conic-gradient(from ${interpolate(t, [13, 16], [0, 300], { easing: EASE.soft })}deg, ${C.pink}, ${C.violet}, ${C.orange}, ${C.pink}) border-box`,
            WebkitMask: "linear-gradient(#000 0 0) padding-box, linear-gradient(#000 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
            filter: `drop-shadow(0 0 30px ${C.pink})`,
            opacity: ring,
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};
