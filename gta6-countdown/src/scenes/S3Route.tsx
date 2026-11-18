import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { AlertCard } from "../components/AlertCard";
import { NavBubble } from "../components/NavBubble";
import { PolicePins } from "../components/PolicePins";
import { useAbsolute } from "../hooks";
import { CityLayer } from "../three/CityLayer";
import { EASE, T } from "../timing";

export const routeProgressAt = (t: number) =>
  interpolate(t, [T.routeDrawStart, T.routeDrawEnd], [0, 1], {
    easing: EASE.inOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

export const S3Route: React.FC<{ from: number }> = ({ from }) => {
  const { t } = useAbsolute(from);
  return (
    <AbsoluteFill>
      <CityLayer t={t} routeProgress={routeProgressAt(t)} showPolice />
      <PolicePins t={t} />
      <NavBubble
        t={t}
        enterAt={-10}
        exitAt={12.5}
        steps={[
          { at: 0, until: 8.5, street: "Ocean Drive", meters: [200, 60], arrow: "straight" },
          { at: 8.7, until: 12.5, street: "Tourne à gauche", meters: [180, 90], arrow: "left" },
        ]}
      />
      <AlertCard t={t} enterAt={T.alertIn} exitAt={12.4} />
    </AbsoluteFill>
  );
};
