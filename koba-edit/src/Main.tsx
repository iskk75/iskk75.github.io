import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, interpolate, Sequence, spring, staticFile, useCurrentFrame } from "remotion";
import { Flares, Flashes, Grain, Vignette } from "./components/Effects";
import { Lyrics } from "./components/Lyrics";
import { ShotLayer, SvgDefs } from "./components/ShotLayer";
import { DURATION_IN_FRAMES, EASE, FPS, SFX, SHOTS, b, f } from "./timing";

export type MainProps = {
  /** true = ajoute public/ref.mp3 (uniquement pour vérifier la synchro). */
  withRef: boolean;
};

/** Titre final, posé au-dessus de la foule (le visage est en bas du cadre). */
const FinalTitle: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS + b(17.5);
  const s = spring({ frame: frame, fps: FPS, config: { damping: 12, stiffness: 140 } });
  const glow = interpolate(t, [b(17.5), b(20)], [0.4, 1], { easing: EASE.out, extrapolateRight: "clamp" });
  return (
    <div
      style={{
        position: "absolute",
        top: "14%",
        left: 0,
        right: 0,
        textAlign: "center",
        fontFamily: "Anton",
        fontSize: 230,
        lineHeight: 1,
        color: "#fff",
        letterSpacing: "0.02em",
        transform: `scale(${0.6 + 0.4 * s}) rotate(${(1 - s) * -6}deg)`,
        opacity: Math.min(1, s * 1.5),
        WebkitTextStroke: "8px #000",
        paintOrder: "stroke fill",
        textShadow: `0 0 ${40 + 60 * glow}px rgba(255,190,80,${0.6 * glow}), 0 8px 0 rgba(0,0,0,0.6)`,
      }}
    >
      KOBA LAD
    </div>
  );
};

export const Main: React.FC<MainProps> = ({ withRef }) => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <SvgDefs />
    {SHOTS.map((s) => (
      <Sequence key={s.name + s.start} name={`Plan · ${s.name}`} from={f(s.start)} durationInFrames={f(s.end) - f(s.start)}>
        <ShotLayer shot={s} />
      </Sequence>
    ))}
    <Flares />
    <Vignette />
    <Grain />
    <Flashes />
    <Lyrics />
    <Sequence name="Titre final" from={f(b(17.5))} durationInFrames={DURATION_IN_FRAMES - f(b(17.5))}>
      <FinalTitle />
    </Sequence>

    {/* Bruitages (restent dans l'export, discrets) */}
    {SFX.whoosh.map((t, i) => (
      <Sequence key={`w${i}`} name="Whoosh" from={Math.max(0, f(t))} durationInFrames={f(0.5)} layout="none">
        <Audio src={staticFile("sfx/whoosh.wav")} volume={0.22} />
      </Sequence>
    ))}
    {SFX.impact.map((t, i) => (
      <Sequence key={`i${i}`} name="Impact" from={f(t)} durationInFrames={f(0.9)} layout="none">
        <Audio src={staticFile("sfx/impact.wav")} volume={0.3} />
      </Sequence>
    ))}
    {SFX.shutter.map((t, i) => (
      <Sequence key={`s${i}`} name="Déclencheur" from={f(t)} durationInFrames={f(0.3)} layout="none">
        <Audio src={staticFile("sfx/shutter.wav")} volume={0.35} />
      </Sequence>
    ))}
    {SFX.riser.map((t, i) => (
      <Sequence key={`r${i}`} name="Riser" from={f(t)} durationInFrames={f(1.7)} layout="none">
        <Audio src={staticFile("sfx/riser.wav")} volume={0.25} />
      </Sequence>
    ))}

    {withRef ? (
      <Sequence name="Son de référence (preview uniquement)" layout="none">
        <Audio src={staticFile("ref.mp3")} />
      </Sequence>
    ) : null}
  </AbsoluteFill>
);
