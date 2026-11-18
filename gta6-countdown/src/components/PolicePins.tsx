import React from "react";
import { spring } from "remotion";
import { since } from "../hooks";
import { C } from "../theme";
import { FPS, T } from "../timing";
import { projectToScreen } from "../three/camera";
import { POLICE } from "../three/layout";

const Siren: React.FC = () => (
  <svg width="58" height="58" viewBox="0 0 64 64">
    <rect x="6" y="34" width="52" height="16" rx="7" fill="#fff" />
    <path d="M16 34 L22 22 H42 L48 34 Z" fill="#fff" />
    <rect x="22" y="14" width="10" height="7" rx="3" fill="#FF2E4D" />
    <rect x="32" y="14" width="10" height="7" rx="3" fill="#3D7BFF" />
    <circle cx="18" cy="51" r="6" fill="#1B1626" />
    <circle cx="46" cy="51" r="6" fill="#1B1626" />
  </svg>
);

/** Icônes "police" ancrées sur les voitures 3D (projection écran) avec un pop élastique. */
export const PolicePins: React.FC<{ t: number; fadeOut?: number }> = ({ t, fadeOut = 1 }) => (
  <>
    {POLICE.map((p, i) => {
      const s = spring({ frame: since(t, T.policePops[i]), fps: FPS, config: { damping: 9, stiffness: 190, mass: 0.8 } });
      if (s <= 0.001) return null;
      const pos = projectToScreen(t, p.x, 2.2, p.z);
      if (!pos.visible) return null;
      const lightOn = Math.sin(t * 9 + i) > 0;
      return (
        <div
          key={i}
          style={{
            position: "absolute",
            left: pos.x - 55,
            top: pos.y - 150,
            width: 110,
            height: 130,
            transformOrigin: "50% 100%",
            transform: `scale(${s})`,
            opacity: fadeOut,
          }}
        >
          <div
            style={{
              width: 110,
              height: 110,
              borderRadius: 55,
              background: "#14101C",
              border: "6px solid #fff",
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 14px 30px rgba(0,0,0,0.35), 0 0 ${lightOn ? 40 : 18}px ${lightOn ? "#FF2E4D" : "#3D7BFF"}`,
            }}
          >
            <Siren />
          </div>
          <div
            style={{
              position: "absolute",
              left: 45,
              top: 100,
              width: 0,
              height: 0,
              borderLeft: "10px solid transparent",
              borderRight: "10px solid transparent",
              borderTop: "18px solid #fff",
            }}
          />
          <div style={{ position: "absolute", left: 38, top: 112, width: 34, height: 12, borderRadius: 6, background: C.ink, opacity: 0.2 }} />
        </div>
      );
    })}
  </>
);
