import type {
  TransitionPresentation,
  TransitionPresentationComponentProps,
} from "@remotion/transitions";
import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { HEIGHT, WIDTH } from "../timing";

type IrisProps = { ring: string; glow: string; zoomOut?: boolean; r0?: number };

const MAX_R = Math.hypot(WIDTH, HEIGHT) / 2 + 40;

/** Transition "portail" : le plan suivant apparaît dans un cercle qui s'ouvre depuis le centre. */
const Iris: React.FC<TransitionPresentationComponentProps<IrisProps>> = ({
  children,
  presentationDirection,
  presentationProgress: p,
  passedProps,
}) => {
  if (presentationDirection === "exiting") {
    // Le plan sortant est "traversé" : il zoome vers la caméra.
    const s = interpolate(p, [0, 1], [1, passedProps.zoomOut ? 0.9 : 2.4]);
    return (
      <AbsoluteFill style={{ transform: `scale(${s})` }}>{children}</AbsoluteFill>
    );
  }
  const r = interpolate(p, [0, 1], [passedProps.r0 ?? 60, MAX_R]);
  const ringW = interpolate(p, [0, 0.1, 0.8, 1], [0, 10, 14, 0]);
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          clipPath: `circle(${r}px at 50% 50%)`,
          transform: `scale(${interpolate(p, [0, 1], [1.25, 1])})`,
        }}
      >
        {children}
      </AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: WIDTH / 2 - r,
          top: HEIGHT / 2 - r,
          width: r * 2,
          height: r * 2,
          borderRadius: "50%",
          border: `${ringW}px solid ${passedProps.ring}`,
          boxShadow: `0 0 60px 10px ${passedProps.glow}, inset 0 0 40px ${passedProps.glow}`,
          boxSizing: "border-box",
        }}
      />
    </AbsoluteFill>
  );
};

export const iris = (props: IrisProps): TransitionPresentation<IrisProps> => ({
  component: Iris,
  props,
});

/** Transition "zoom-fade" : le plan sortant s'éloigne et se floute, le suivant arrive. */
const ZoomFade: React.FC<TransitionPresentationComponentProps<Record<string, never>>> = ({
  children,
  presentationDirection,
  presentationProgress: p,
}) => {
  if (presentationDirection === "exiting") {
    return (
      <AbsoluteFill
        style={{
          transform: `scale(${interpolate(p, [0, 1], [1, 1.12])})`,
          filter: `blur(${interpolate(p, [0, 1], [0, 18])}px)`,
          opacity: interpolate(p, [0, 0.7, 1], [1, 0.4, 0]),
        }}
      >
        {children}
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill
      style={{
        transform: `scale(${interpolate(p, [0, 1], [0.94, 1])})`,
        opacity: interpolate(p, [0.2, 1], [0, 1], { extrapolateLeft: "clamp" }),
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

export const zoomFade = (): TransitionPresentation<Record<string, never>> => ({
  component: ZoomFade,
  props: {},
});
