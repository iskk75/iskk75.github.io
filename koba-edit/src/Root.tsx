import React from "react";
import { Composition } from "remotion";
import { Main } from "./Main";
import { DURATION_IN_FRAMES, FPS, HEIGHT, WIDTH } from "./timing";

export const RemotionRoot: React.FC = () => (
  <>
    {/* Export final : SANS la musique (seulement les bruitages) */}
    <Composition id="Edit" component={Main} durationInFrames={DURATION_IN_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={{ withRef: false }} />
    {/* Vérification de la synchro : avec public/ref.mp3 */}
    <Composition id="Preview" component={Main} durationInFrames={DURATION_IN_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={{ withRef: true }} />
  </>
);
