import { CameraMotionBlur } from "@remotion/motion-blur";
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame } from "remotion";
import { CountdownCard } from "../components/CountdownCard";
import { Cursor, Particles, PreloadButton } from "../components/Preload";
import { since, useAbsolute } from "../hooks";
import { C, fontStyle } from "../theme";
import { EASE, FPS, T } from "../timing";
import { CreamBackdrop } from "./Backdrop";

const MovingCursor: React.FC<{ from: number }> = ({ from }) => {
  const t = (from + useCurrentFrame()) / FPS;
  return (
    <AbsoluteFill>
      <Particles t={t} at={T.click} />
      <Cursor t={t} enterAt={T.cursorIn} clickAt={T.click} exitAt={T.click + 0.9} />
    </AbsoluteFill>
  );
};

export const S6Preload: React.FC<{ from: number; renderTimeMs: number }> = ({ from, renderTimeMs }) => {
  const { t } = useAbsolute(from);
  // La carte remonte pour laisser la place au bouton (spring)
  const lift = spring({ frame: since(t, T.cursorIn - 0.2), fps: FPS, config: { damping: 18, stiffness: 90 } });
  const dateFade = interpolate(t, [21, 21.35], [1, 0], { easing: EASE.out, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <CreamBackdrop t={t} titleIn={null} />
      <CountdownCard t={t} from={from} renderTimeMs={renderTimeMs} enterAt={null} y={-60 * lift} />
      <div style={{ position: "absolute", top: 1330, left: 0, right: 0, textAlign: "center", ...fontStyle, fontSize: 38, color: "#5A4F6E", fontWeight: 700, opacity: dateFade }}>
        Jeudi 19 novembre · <span style={{ color: C.pink }}>00:00</span> (Paris)
      </div>
      <PreloadButton t={t} enterAt={T.cursorIn} clickAt={T.click} />
      <CameraMotionBlur samples={6} shutterAngle={180}>
        <MovingCursor from={from} />
      </CameraMotionBlur>
    </AbsoluteFill>
  );
};
