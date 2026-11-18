import React from "react";
import { AbsoluteFill } from "remotion";
import { CountdownCard } from "../components/CountdownCard";
import { useAbsolute } from "../hooks";
import { C, fontStyle } from "../theme";
import { T } from "../timing";
import { CreamBackdrop } from "./Backdrop";

export const S5Countdown: React.FC<{ from: number; renderTimeMs: number }> = ({ from, renderTimeMs }) => {
  const { t } = useAbsolute(from);
  return (
    <AbsoluteFill>
      <CreamBackdrop t={t} titleIn={T.cardIn - 0.1} />
      <CountdownCard t={t} from={from} renderTimeMs={renderTimeMs} enterAt={T.cardIn} />
      <div style={{ position: "absolute", top: 1330, left: 0, right: 0, textAlign: "center", ...fontStyle, fontSize: 38, color: "#5A4F6E", fontWeight: 700, opacity: t > T.cardIn + 0.8 ? 1 : 0 }}>
        Jeudi 19 novembre · <span style={{ color: C.pink }}>00:00</span> (Paris)
      </div>
    </AbsoluteFill>
  );
};
