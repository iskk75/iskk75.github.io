import { ThreeCanvas } from "@remotion/three";
import React from "react";
import { AbsoluteFill, useVideoConfig } from "remotion";
import * as THREE from "three";
import { CityMode, CityScene } from "./City";

/**
 * Calque 3D réutilisé par les scènes 1 à 4. Il reçoit le temps ABSOLU de la vidéo,
 * ce qui garantit une caméra continue d'une scène à l'autre (aucun cut).
 */
export const CityLayer: React.FC<{
  t: number;
  mode?: CityMode;
  routeProgress?: number;
  showPolice?: boolean;
  dof?: number; // intensité de la profondeur de champ (flou haut/bas, effet tilt-shift)
}> = ({ t, mode = "orbit", routeProgress, showPolice, dof = 1 }) => {
  const { width, height } = useVideoConfig();
  const blur = 7 * dof;
  const band = (dir: "top" | "bottom"): React.CSSProperties => ({
    position: "absolute",
    left: 0,
    right: 0,
    [dir]: 0,
    height: "34%",
    backdropFilter: `blur(${blur}px)`,
    WebkitBackdropFilter: `blur(${blur}px)`,
    maskImage: `linear-gradient(${dir === "top" ? "to bottom" : "to top"}, black 0%, rgba(0,0,0,0.6) 45%, transparent 100%)`,
    WebkitMaskImage: `linear-gradient(${dir === "top" ? "to bottom" : "to top"}, black 0%, rgba(0,0,0,0.6) 45%, transparent 100%)`,
    pointerEvents: "none",
  });
  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #4B1E8C 0%, #B83A9C 35%, #FF7A59 70%, #FFC38A 100%)",
      }}
    >
      <ThreeCanvas
        width={width}
        height={height}
        shadows
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.NeutralToneMapping;
          gl.toneMappingExposure = 1.0;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
        }}
        camera={{ fov: 38, near: 1, far: 1200, position: [0, 100, 100] }}
      >
        <CityScene t={t} mode={mode} routeProgress={routeProgress} showPolice={showPolice} />
      </ThreeCanvas>
      {dof > 0 ? (
        <>
          <div style={band("top")} />
          <div style={band("bottom")} />
        </>
      ) : null}
      {/* Vignette chaude façon coucher de soleil */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(120% 80% at 50% 45%, transparent 55%, rgba(60,10,70,0.35) 100%), linear-gradient(180deg, rgba(255,120,80,0.10), transparent 30%, transparent 75%, rgba(123,47,247,0.12))",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
