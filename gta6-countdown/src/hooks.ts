import { useCurrentFrame } from "remotion";
import { FPS } from "./timing";

/** Frame et temps ABSOLUS dans la vidéo, à partir de la frame de départ de la scène. */
export const useAbsolute = (from: number) => {
  const local = useCurrentFrame();
  const frame = from + local;
  return { frame, t: frame / FPS, local };
};

/** Frames écoulées depuis un instant absolu (en secondes) — pratique pour spring(). */
export const since = (t: number, at: number) => (t - at) * FPS;
