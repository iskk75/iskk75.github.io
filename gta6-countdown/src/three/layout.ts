/**
 * Plan de la ville (unités monde). x = est (océan vers +x), z = sud, y = haut.
 */
export const ROAD_W = 5;
export const AVENUES_X = [0, -16, -32, -48, -64]; // 0 = Ocean Drive
export const STREETS_Z = Array.from({ length: 13 }, (_, k) => -96 + 16 * k);
export const CITY_Z = [-104, 104] as const;
export const CITY_X_MIN = -72;
export const PARK_X = [2.5, 9] as const;
export const BEACH_X = [9, 24] as const;
export const OCEAN_X = 24;

export type V2 = [number, number];

/** Graine pseudo-aléatoire déterministe (mulberry32). */
export const rng = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/** Polyligne avec coins arrondis, rééchantillonnée finement. */
export const roundedPolyline = (pts: V2[], radius: number, step = 0.35) => {
  const out: V2[] = [];
  const push = (p: V2) => out.push(p);
  push(pts[0]);
  for (let i = 1; i < pts.length - 1; i++) {
    const [ax, az] = pts[i - 1];
    const [bx, bz] = pts[i];
    const [cx, cz] = pts[i + 1];
    const l1 = Math.hypot(bx - ax, bz - az);
    const l2 = Math.hypot(cx - bx, cz - bz);
    const r = Math.min(radius, l1 / 2, l2 / 2);
    const p1: V2 = [bx + ((ax - bx) / l1) * r, bz + ((az - bz) / l1) * r];
    const p2: V2 = [bx + ((cx - bx) / l2) * r, bz + ((cz - bz) / l2) * r];
    push(p1);
    // Bézier quadratique p1 -> b -> p2
    for (let k = 1; k <= 8; k++) {
      const u = k / 8;
      const x = (1 - u) * (1 - u) * p1[0] + 2 * (1 - u) * u * bx + u * u * p2[0];
      const z = (1 - u) * (1 - u) * p1[1] + 2 * (1 - u) * u * bz + u * u * p2[1];
      push([x, z]);
    }
  }
  push(pts[pts.length - 1]);
  // Rééchantillonnage régulier
  const res: V2[] = [out[0]];
  let carry = 0;
  for (let i = 1; i < out.length; i++) {
    const [ax, az] = out[i - 1];
    const [bx, bz] = out[i];
    const L = Math.hypot(bx - ax, bz - az);
    let d = step - carry;
    while (d <= L) {
      const u = d / L;
      res.push([ax + (bx - ax) * u, az + (bz - az) * u]);
      d += step;
    }
    carry = L - (d - step);
  }
  res.push(out[out.length - 1]);
  return res;
};

export const cumulative = (pts: V2[]) => {
  const acc = [0];
  for (let i = 1; i < pts.length; i++) {
    acc.push(acc[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  }
  return acc;
};

export const sampleAt = (pts: V2[], acc: number[], s: number) => {
  const total = acc[acc.length - 1];
  const d = Math.max(0, Math.min(total, s));
  let lo = 0;
  let hi = acc.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (acc[mid] <= d) lo = mid;
    else hi = mid;
  }
  const seg = acc[hi] - acc[lo] || 1;
  const u = (d - acc[lo]) / seg;
  const x = pts[lo][0] + (pts[hi][0] - pts[lo][0]) * u;
  const z = pts[lo][1] + (pts[hi][1] - pts[lo][1]) * u;
  const heading = Math.atan2(pts[hi][0] - pts[lo][0], pts[hi][1] - pts[lo][1]);
  return { x, z, heading };
};

/* ---------- Trajet du joueur + itinéraire GPS ---------- */
// Le joueur remonte Ocean Drive (voie de droite), puis l'itinéraire tourne dans la ville.
const LANE = 1.1;
export const ROUTE_CORNERS: V2[] = [
  [LANE, 40],
  [LANE, 16],
  [-16, 16],
  [-16, -16],
  [-32, -16],
  [-32, -48],
  [-48, -48],
  [-48, -80],
];
export const APPROACH_CORNERS: V2[] = [
  [LANE, 92],
  [LANE, 40],
];

export const ROUTE = roundedPolyline(ROUTE_CORNERS, 4);
export const ROUTE_ACC = cumulative(ROUTE);
export const ROUTE_LEN = ROUTE_ACC[ROUTE_ACC.length - 1];

/** Chemin complet du marqueur = approche + itinéraire. */
export const PLAYER_PATH = roundedPolyline(
  [...APPROACH_CORNERS, ...ROUTE_CORNERS.slice(1)],
  4,
);
export const PLAYER_ACC = cumulative(PLAYER_PATH);
export const APPROACH_LEN = 52;

/** Voitures de police (sur les routes, près de l'itinéraire). */
export const POLICE: { x: number; z: number; rot: number }[] = [
  { x: -16 + 1.1, z: 33, rot: Math.PI },
  { x: -6, z: 16 - 1.1, rot: -Math.PI / 2 },
  { x: -24, z: -16 + 1.1, rot: Math.PI / 2 },
  { x: -32 - 1.1, z: -33, rot: 0 },
];
