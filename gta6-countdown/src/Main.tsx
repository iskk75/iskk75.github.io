import { Audio } from "@remotion/media";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import React from "react";
import { AbsoluteFill, Sequence, staticFile } from "remotion";
import { S1Intro } from "./scenes/S1Intro";
import { S2Dive } from "./scenes/S2Dive";
import { S3Route } from "./scenes/S3Route";
import { S4Portal } from "./scenes/S4Portal";
import { S5Countdown } from "./scenes/S5Countdown";
import { S6Preload } from "./scenes/S6Preload";
import { S7Words } from "./scenes/S7Words";
import { S8Outro } from "./scenes/S8Outro";
import { C } from "./theme";
import { iris, zoomFade } from "./transitions/iris";
import { DURATION_IN_FRAMES, EASE, TRANSITION_AFTER, sceneDuration, sceneFrom } from "./timing";

export type MainProps = {
  /** Heure (ms epoch) à laquelle le rendu démarre — injectée par calculateMetadata. */
  renderTimeMs: number;
  /** Musique : remplace public/audio/music.mp3 (silence de 30 s par défaut). */
  musicSrc: string;
  musicVolume: number;
};

export const Main: React.FC<MainProps> = ({ renderTimeMs, musicSrc, musicVolume }) => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <TransitionSeries>
      <TransitionSeries.Sequence name="1 · Intro (point rose)" durationInFrames={sceneDuration("intro")}>
        <S1Intro from={sceneFrom("intro")} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={iris({ ring: C.pink, glow: `${C.pink}AA` })}
        timing={linearTiming({ durationInFrames: TRANSITION_AFTER.intro, easing: EASE.inOut })}
      />
      <TransitionSeries.Sequence name="2 · Plongée sur la ville" durationInFrames={sceneDuration("dive")}>
        <S2Dive from={sceneFrom("dive")} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Sequence name="3 · Itinéraire + police" durationInFrames={sceneDuration("route")}>
        <S3Route from={sceneFrom("route")} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Sequence name="4 · Portail vue de dessus" durationInFrames={sceneDuration("portal")}>
        <S4Portal from={sceneFrom("portal")} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={iris({ ring: C.violet, glow: `${C.violet}88`, zoomOut: false, r0: 0 })}
        timing={linearTiming({ durationInFrames: TRANSITION_AFTER.portal, easing: EASE.inOut })}
      />
      <TransitionSeries.Sequence name="5 · Compte à rebours" durationInFrames={sceneDuration("countdown")}>
        <S5Countdown from={sceneFrom("countdown")} renderTimeMs={renderTimeMs} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Sequence name="6 · Précharger" durationInFrames={sceneDuration("preload")}>
        <S6Preload from={sceneFrom("preload")} renderTimeMs={renderTimeMs} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={zoomFade()}
        timing={linearTiming({ durationInFrames: TRANSITION_AFTER.preload, easing: EASE.inOut })}
      />
      <TransitionSeries.Sequence name="7 · Demain. Minuit. Vice City." durationInFrames={sceneDuration("words")}>
        <S7Words from={sceneFrom("words")} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Sequence name="8 · 19.11.2026" durationInFrames={sceneDuration("outro")}>
        <S8Outro from={sceneFrom("outro")} />
      </TransitionSeries.Sequence>
    </TransitionSeries>

    {/* Piste audio prête : remplace public/audio/music.mp3 par ta musique (ou passe musicSrc). */}
    <Sequence name="Musique" durationInFrames={DURATION_IN_FRAMES} layout="none">
      <Audio src={musicSrc.startsWith("http") ? musicSrc : staticFile(musicSrc)} volume={musicVolume} />
    </Sequence>
  </AbsoluteFill>
);
