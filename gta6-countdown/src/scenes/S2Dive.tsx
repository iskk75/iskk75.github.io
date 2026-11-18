import React from "react";
import { AbsoluteFill } from "remotion";
import { NavBubble } from "../components/NavBubble";
import { useAbsolute } from "../hooks";
import { CityLayer } from "../three/CityLayer";
import { T } from "../timing";

export const S2Dive: React.FC<{ from: number }> = ({ from }) => {
  const { t } = useAbsolute(from);
  return (
    <AbsoluteFill>
      <CityLayer t={t} />
      <NavBubble
        t={t}
        enterAt={T.bubbleIn}
        steps={[{ at: T.bubbleIn, until: 8.5, street: "Ocean Drive", meters: [200, 60], arrow: "straight" }]}
      />
    </AbsoluteFill>
  );
};
