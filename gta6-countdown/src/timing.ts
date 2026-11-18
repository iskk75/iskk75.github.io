/**
 * Toutes les constantes de timing de la vidéo, centralisées ici.
 * Les valeurs "nominales" sont en secondes, telles que décrites dans le storyboard.
 * Les durées réelles des <TransitionSeries.Sequence> sont calculées pour que
 * chaque transition soit centrée sur la frontière entre deux scènes, et que la
 * durée totale reste exactement de 30 s.
 */
import { Easing } from "remotion";

export const FPS = 60;
export const WIDTH = 1080;
export const HEIGHT = 1920;
export const DURATION_S = 30;
export const DURATION_IN_FRAMES = DURATION_S * FPS;

/** Sortie : jeudi 19 novembre 2026, 00:00 heure de Paris (CET = UTC+1). */
export const RELEASE_ISO = "2026-11-19T00:00:00+01:00";

export const sec = (s: number) => Math.round(s * FPS);

/** Bornes nominales des scènes (secondes). */
export const SCENES = {
  intro: { start: 0, end: 2 },
  dive: { start: 2, end: 8 },
  route: { start: 8, end: 13 },
  portal: { start: 13, end: 16 },
  countdown: { start: 16, end: 21 },
  preload: { start: 21, end: 24 },
  words: { start: 24, end: 28 },
  outro: { start: 28, end: 30 },
} as const;

export type SceneKey = keyof typeof SCENES;
export const SCENE_ORDER: SceneKey[] = [
  "intro",
  "dive",
  "route",
  "portal",
  "countdown",
  "preload",
  "words",
  "outro",
];

/** Durée (frames) de la transition APRÈS la scène donnée (0 = coupe invisible / continuité). */
export const TRANSITION_AFTER: Record<SceneKey, number> = {
  intro: 36, // zoom à travers le point rose (iris)
  dive: 0, // la caméra 3D est continue : pas de transition visible
  route: 0,
  portal: 36, // portail crème
  countdown: 0, // même carte, continuité
  preload: 30, // zoom-fade vers le noir
  words: 0,
  outro: 0,
};

const before = (k: SceneKey) => {
  const i = SCENE_ORDER.indexOf(k);
  return i === 0 ? 0 : TRANSITION_AFTER[SCENE_ORDER[i - 1]];
};

/** Frame absolue où la Sequence de la scène démarre (inclut la moitié de la transition entrante). */
export const sceneFrom = (k: SceneKey) =>
  sec(SCENES[k].start) - Math.floor(before(k) / 2);

/** Durée (frames) de la Sequence de la scène, recouvrements de transition inclus. */
export const sceneDuration = (k: SceneKey) => {
  const end =
    sec(SCENES[k].end) + Math.ceil(TRANSITION_AFTER[k] / 2);
  return Math.min(end, DURATION_IN_FRAMES) - sceneFrom(k);
};

/* ---------- Timings internes (en secondes ABSOLUES de la vidéo) ---------- */
export const T = {
  // Scène 1
  pulseStart: 0.25,
  zoomStart: 1.35,
  // Scène 2
  bubbleIn: 2.6,
  markerStart: 2.0,
  // Scène 3
  routeDrawStart: 8.3,
  routeDrawEnd: 11.2,
  policePops: [8.9, 9.4, 9.9, 10.4],
  alertIn: 9.2,
  // Scène 4
  portalOpen: 13.25,
  portalFull: 15.2,
  // Scène 5
  cardIn: 16.1,
  // Scène 6
  cursorIn: 21.2,
  click: 22.45,
  // Scène 7
  words: [24.25, 25.4, 26.55],
  // Scène 8
  dateIn: 28.0,
  collapse: 29.15,
  blackout: 29.75,
} as const;

/** Durée pendant laquelle la caméra 3D continue (tout le bloc ville). */
export const CITY_END_S = 16.5;

/* ---------- Courbes d'easing communes ---------- */
export const EASE = {
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  out: Easing.bezier(0.16, 1, 0.3, 1),
  in: Easing.bezier(0.7, 0, 0.84, 0),
  soft: Easing.bezier(0.45, 0.05, 0.55, 0.95),
  snap: Easing.bezier(0.34, 1.56, 0.64, 1),
};
