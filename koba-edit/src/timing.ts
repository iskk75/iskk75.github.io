/**
 * Timing centralisé de l'edit "Promis bébé".
 * Les temps ont été détectés sur public/ref.mp3 (librosa : autocorrélation de l'enveloppe
 * d'attaque, puis calage de phase sur la grille des demi-temps).
 */
import { Easing } from "remotion";

export const FPS = 60;
export const WIDTH = 1080;
export const HEIGHT = 1920;

/* ---------- Tempo ---------- */
export const BPM = 72.16;
export const BEAT = 60 / BPM; // 0.8315 s
export const FIRST_BEAT = 0.8108; // premier temps fort (s)
/** Position (s) de chaque temps du morceau. */
export const BEATS = Array.from({ length: 21 }, (_, k) => +(FIRST_BEAT + k * BEAT).toFixed(4));
/** b(k) : temps k ; b(k + 0.5) : demi-temps. */
export const b = (k: number) => +(FIRST_BEAT + k * BEAT).toFixed(4);

/** Fin de l'edit : 20e temps (≈ 17,45 s). */
export const END_S = b(20);
export const DURATION_IN_FRAMES = Math.round(END_S * FPS);

/* ---------- Sections ---------- */
export const DROP_S = b(8); // "Un jour ça va…" : on passe en chaud
export const FINALE_S = b(16);
export const RISER_S = b(6); // le riser monte jusqu'au drop

export const f = (s: number) => Math.round(s * FPS);

/* ---------- Paroles (calées mot à mot sur la voix) ---------- */
export type Word = { w: string; t: number; key?: boolean };
export type LyricLine = {
  start: number;
  end: number;
  words: Word[];
  /** Placement : x, y en % de l'écran (centre du bloc), rotation en degrés. */
  pos: { x: number; y: number; rot: number };
  color: string;
};

const CYAN = "#3FE8FF";
const RED = "#FF2A3D";
const GOLD = "#FFC93C";

const words = (list: [string, number][], key: string): Word[] =>
  list.map(([w, t]) => ({ w, t, key: w === key }));

export const LYRICS: LyricLine[] = [
  {
    start: 0.6,
    end: 3.75,
    pos: { x: 50, y: 78, rot: -3 },
    color: CYAN,
    words: words(
      [
        ["DES", 0.62],
        ["FOIS", 1.1],
        ["J'AI", 1.26],
        ["DES", 1.4],
        ["SAUTES", 1.52],
        ["D'HUMEUR,", 1.8],
        ["J'SAIS", 2.1],
        ["PAS", 2.36],
        ["POURQUOI", 2.82],
      ],
      "POURQUOI",
    ),
  },
  {
    start: 3.9,
    end: 7.3,
    pos: { x: 50, y: 14, rot: 4 },
    color: CYAN,
    words: words(
      [
        ["DES", 3.92],
        ["FOIS", 4.4],
        ["J'AI", 4.6],
        ["DES", 4.74],
        ["SAUTES", 4.88],
        ["D'HUMEUR,", 5.1],
        ["J'SAIS", 5.6],
        ["PAS", 6.02],
        ["POURQUOI", 6.18],
      ],
      "D'HUMEUR,",
    ),
  },
  {
    start: 7.4,
    end: 10.35,
    pos: { x: 50, y: 74, rot: -6 },
    color: RED,
    words: words(
      [
        ["UN", 7.42],
        ["JOUR", 7.62],
        ["ÇA", 7.86],
        ["VA,", 8.14],
        ["UN", 8.46],
        ["JOUR", 8.66],
        ["ÇA", 9.0],
        ["VA", 9.34],
        ["PAS", 9.62],
      ],
      "PAS",
    ),
  },
  {
    start: 10.5,
    end: 12.2,
    pos: { x: 50, y: 50, rot: 3 },
    color: RED,
    words: words(
      [
        ["DES", 10.52],
        ["FOIS", 10.66],
        ["C'EST", 10.9],
        ["COMME", 11.22],
        ["ÇA", 11.46],
      ],
      "ÇA",
    ),
  },
  {
    start: 12.28,
    end: 14.05,
    pos: { x: 50, y: 76, rot: -5 },
    color: GOLD,
    words: words(
      [
        ["DES", 12.3],
        ["FOIS", 12.42],
        ["C'EST", 12.58],
        ["COMME", 12.88],
        ["ÇA", 13.18],
      ],
      "COMME",
    ),
  },
];

/* ---------- Plans ---------- */
export type Transition = "cut" | "zoom" | "whip" | "flash" | "glitch" | "shake" | "velocity";
export type Speed = "normal" | "slow" | "veryslow" | "crawl" | "ramp" | "freeze" | "fast";

export type Shot = {
  name: string;
  src: string;
  /** Point d'entrée dans le clip source (s). */
  from: number;
  start: number;
  end: number;
  /** Cadrage "cover" : point focal (0-1) et zoom supplémentaire. */
  fx: number;
  fy: number;
  zoom?: number;
  speed: Speed;
  tin: Transition;
  tone: "cold" | "warm" | "gold";
  aura: number;
};

/* L'ordre monte en puissance : plans calmes (froids) → drop chaud (coupes au temps puis au demi-temps)
   → le meilleur plan (stade, 5/5) tenu jusqu'à la fin. */
export const SHOTS: Shot[] = [
  // --- Intro calme (froid), une coupe tous les 2 temps
  { name: "Il chante, yeux fermés", src: "clips/v3.mp4", from: 17.0, start: 0, end: b(1), fx: 0.5, fy: 0.22, zoom: 1.3, speed: "normal", tin: "cut", tone: "cold", aura: 2 },
  { name: "Lunettes, cigarette", src: "clips/v5.mp4", from: 0.6, start: b(1), end: b(3), fx: 0.5, fy: 0.5, zoom: 1.0, speed: "crawl", tin: "whip", tone: "cold", aura: 3 },
  { name: "Tête levée", src: "clips/v3.mp4", from: 27.0, start: b(3), end: b(5), fx: 0.5, fy: 0.25, zoom: 1.3, speed: "slow", tin: "zoom", tone: "cold", aura: 3 },
  { name: "Scène, de profil", src: "clips/v2.mp4", from: 0.1, start: b(5), end: b(6), fx: 0.64, fy: 0.3, zoom: 1.45, speed: "normal", tin: "glitch", tone: "cold", aura: 3 },
  { name: "Chaînes (arrêt sur image)", src: "clips/v5.mp4", from: 2.05, start: b(6), end: b(7), fx: 0.5, fy: 0.5, zoom: 1.0, speed: "freeze", tin: "flash", tone: "cold", aura: 4 },
  { name: "Chaînes, garage", src: "clips/v7c.mp4", from: 3.0, start: b(7), end: b(7.5), fx: 0.68, fy: 0.5, zoom: 1.0, speed: "fast", tin: "shake", tone: "cold", aura: 3 },
  { name: "Cri dans la fumée", src: "clips/v5.mp4", from: 1.75, start: b(7.5), end: b(8), fx: 0.52, fy: 0.5, zoom: 1.0, speed: "normal", tin: "whip", tone: "cold", aura: 3 },
  // --- DROP (chaud)
  { name: "Flammes sur scène", src: "clips/v6.mp4", from: 38.02, start: b(8), end: b(9), fx: 0.5, fy: 0.35, zoom: 1.2, speed: "slow", tin: "flash", tone: "warm", aura: 5 },
  { name: "Doudoune blanche", src: "clips/v4r.mp4", from: 4.0, start: b(9), end: b(10), fx: 0.68, fy: 0.5, zoom: 1.0, speed: "slow", tin: "zoom", tone: "warm", aura: 4 },
  { name: "Scène, sourire", src: "clips/v2.mp4", from: 7.0, start: b(10), end: b(10.5), fx: 0.62, fy: 0.3, zoom: 1.45, speed: "normal", tin: "glitch", tone: "warm", aura: 4 },
  { name: "Micro en main", src: "clips/v2.mp4", from: 13.8, start: b(10.5), end: b(11), fx: 0.64, fy: 0.3, zoom: 1.45, speed: "normal", tin: "whip", tone: "warm", aura: 4 },
  { name: "Bras levé, micro", src: "clips/v2.mp4", from: 1.9, start: b(11), end: b(12), fx: 0.64, fy: 0.32, zoom: 1.45, speed: "ramp", tin: "velocity", tone: "warm", aura: 4 },
  { name: "Lunettes rouges", src: "clips/v4r.mp4", from: 3.0, start: b(12), end: b(13), fx: 0.7, fy: 0.5, zoom: 1.0, speed: "slow", tin: "shake", tone: "warm", aura: 4 },
  { name: "Costume", src: "clips/v4r.mp4", from: 8.6, start: b(13), end: b(14), fx: 0.45, fy: 0.38, zoom: 1.15, speed: "slow", tin: "zoom", tone: "warm", aura: 4 },
  { name: "Flammes (clip)", src: "clips/v5.mp4", from: 2.55, start: b(14), end: b(14.5), fx: 0.48, fy: 0.5, zoom: 1.0, speed: "normal", tin: "flash", tone: "warm", aura: 5 },
  { name: "Micro, foule", src: "clips/v2.mp4", from: 11.2, start: b(14.5), end: b(15), fx: 0.64, fy: 0.3, zoom: 1.45, speed: "fast", tin: "glitch", tone: "warm", aura: 4 },
  { name: "Veste à motifs", src: "clips/v5.mp4", from: 4.3, start: b(15), end: b(15.5), fx: 0.5, fy: 0.5, zoom: 1.0, speed: "normal", tin: "whip", tone: "warm", aura: 4 },
  { name: "Lunettes noires (arrêt sur image)", src: "clips/v6.mp4", from: 11.27, start: b(15.5), end: b(16), fx: 0.45, fy: 0.35, zoom: 1.35, speed: "freeze", tin: "zoom", tone: "warm", aura: 4 },
  // --- FINALE : le meilleur plan
  { name: "Flammes, de près", src: "clips/v6.mp4", from: 38.35, start: b(16), end: b(16.5), fx: 0.5, fy: 0.3, zoom: 1.45, speed: "normal", tin: "flash", tone: "gold", aura: 4 },
  { name: "Sourire", src: "clips/v6.mp4", from: 0.05, start: b(16.5), end: b(17), fx: 0.6, fy: 0.3, zoom: 1.4, speed: "normal", tin: "glitch", tone: "gold", aura: 4 },
  { name: "Le stade", src: "clips/v6.mp4", from: 72.4, start: b(17), end: b(20), fx: 0.44, fy: 0.42, zoom: 1.36, speed: "crawl", tin: "flash", tone: "gold", aura: 5 },
];

/* ---------- Bruitages (instants en secondes) ---------- */
export const SFX = {
  whoosh: SHOTS.filter((s) => s.tin === "whip" || s.tin === "zoom" || s.tin === "velocity").map((s) => s.start - 0.12),
  impact: SHOTS.filter((s) => s.tin === "flash").map((s) => s.start),
  shutter: SHOTS.filter((s) => s.speed === "freeze").map((s) => s.start),
  riser: [DROP_S - 1.7], // le riser se termine pile sur le drop
};

export const EASE = {
  out: Easing.bezier(0.16, 1, 0.3, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  in: Easing.bezier(0.7, 0, 0.84, 0),
  ramp: Easing.bezier(0.05, 0.9, 0.2, 1),
};
