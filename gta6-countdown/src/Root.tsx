import React from "react";
import { CalculateMetadataFunction, Composition } from "remotion";
import { Main, MainProps } from "./Main";
import "./theme";
import { DURATION_IN_FRAMES, FPS, HEIGHT, WIDTH, sceneDuration, sceneFrom, SCENE_ORDER } from "./timing";

/**
 * Le compte à rebours est figé au moment du rendu : Date.now() est lu ici,
 * une seule fois, puis la vidéo défile seconde par seconde à partir de cette valeur.
 * Pour forcer une heure précise : --props='{"renderTimeMs": 1795000000000}'.
 */
const calculateMetadata: CalculateMetadataFunction<MainProps> = ({ props }) => {
  const renderTimeMs = props.renderTimeMs > 0 ? props.renderTimeMs : Date.now();
  return {
    props: { ...props, renderTimeMs },
    defaultOutName: "gta6-countdown",
  };
};

// Garde-fou : la somme des scènes moins les transitions doit faire exactement 30 s.
const last = SCENE_ORDER[SCENE_ORDER.length - 1];
if (sceneFrom(last) + sceneDuration(last) !== DURATION_IN_FRAMES) {
  throw new Error("Timing incohérent : vérifie src/timing.ts");
}

export const RemotionRoot: React.FC = () => (
  <Composition
    id="GTA6Countdown"
    component={Main}
    durationInFrames={DURATION_IN_FRAMES}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
    defaultProps={{ renderTimeMs: 0, musicSrc: "audio/music.mp3", musicVolume: 1 }}
    calculateMetadata={calculateMetadata}
  />
);
