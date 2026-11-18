import { RELEASE_ISO } from "./timing";

/** Secondes restantes avant la sortie, au moment donné (ms epoch). */
export const secondsUntilRelease = (nowMs: number) =>
  Math.max(0, Math.floor((new Date(RELEASE_ISO).getTime() - nowMs) / 1000));

/** Découpe en HH:MM:SS (HH peut dépasser 24 si la sortie est à plus d'un jour). */
export const splitHMS = (total: number) => {
  const t = Math.max(0, total);
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = t % 60;
  return {
    h: String(h).padStart(2, "0"),
    m: String(m).padStart(2, "0"),
    s: String(s).padStart(2, "0"),
  };
};
