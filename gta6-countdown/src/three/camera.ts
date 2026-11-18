import * as THREE from "three";
import { interpolate } from "remotion";
import { EASE, HEIGHT, T, WIDTH } from "../timing";
import { APPROACH_LEN, PLAYER_ACC, PLAYER_PATH, sampleAt } from "./layout";

export const FOV = 38;

/* ---------- Marqueur du joueur : progression continue et adoucie ---------- */
export const playerAt = (t: number) => {
  // Une seule courbe douce de 1.5 s à 16.5 s : jamais d'arrêt ni d'à-coup.
  const s = interpolate(t, [T.markerStart - 0.5, 16.5], [0, APPROACH_LEN + 46], {
    easing: EASE.soft,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return sampleAt(PLAYER_PATH, PLAYER_ACC, s);
};

/* ---------- Spline Catmull-Rom scalaire sur des clés espacées régulièrement ---------- */
const catmull = (keys: number[], step: number, t: number) => {
  const n = keys.length;
  const f = Math.max(0, Math.min(n - 1 - 1e-6, t / step));
  const i = Math.floor(f);
  const u = f - i;
  const p0 = keys[Math.max(0, i - 1)];
  const p1 = keys[i];
  const p2 = keys[Math.min(n - 1, i + 1)];
  const p3 = keys[Math.min(n - 1, i + 2)];
  return (
    0.5 *
    (2 * p1 +
      (-p0 + p2) * u +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * u * u +
      (-p0 + 3 * p1 - 3 * p2 + p3) * u * u * u)
  );
};

// Clés toutes les 2 s, de t = 0 à t = 18 s.
const STEP = 2;
const RADIUS = [240, 175, 110, 74, 70, 92, 112, 116, 112, 110];
const ELEV = [84, 74, 56, 44, 42, 50, 56, 59, 61, 62];
const AZIM = [20, 26, 34, 40, 46, 52, 58, 63, 67, 70];

const CENTER = new THREE.Vector3(-14, 0, 8);
const ROUTE_CENTER = new THREE.Vector3(-16, 0, 4);

export type CamState = {
  position: THREE.Vector3;
  target: THREE.Vector3;
  fov: number;
};

export const cameraAt = (t: number): CamState => {
  const p = playerAt(t);
  const player = new THREE.Vector3(p.x, 0, p.z);
  // Le regard glisse du centre-ville vers le joueur, puis s'ouvre vers l'itinéraire.
  const wFollow = interpolate(t, [1.2, 5.5], [0, 1], {
    easing: EASE.inOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const wRoute = interpolate(t, [8.2, 12.5], [0, 0.5], {
    easing: EASE.inOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const follow = player.clone().add(new THREE.Vector3(2.5, 0, -5)); // un peu d'avance + la plage dans le champ
  const target = CENTER.clone().lerp(follow, wFollow).lerp(ROUTE_CENTER, wRoute);

  const r = catmull(RADIUS, STEP, t);
  const el = THREE.MathUtils.degToRad(catmull(ELEV, STEP, t));
  const az = THREE.MathUtils.degToRad(catmull(AZIM, STEP, t));
  const position = new THREE.Vector3(
    target.x + r * Math.cos(el) * Math.sin(az),
    target.y + r * Math.sin(el),
    target.z + r * Math.cos(el) * Math.cos(az),
  );
  return { position, target, fov: FOV };
};

/** Caméra "vue de dessus" utilisée à l'intérieur du portail (scène 4). */
export const topCameraAt = (t: number): CamState => {
  const p = playerAt(t);
  const height = interpolate(t, [T.portalOpen, 16.6], [120, 70], {
    easing: EASE.out,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const target = new THREE.Vector3(p.x, 0, p.z - 6);
  return {
    position: new THREE.Vector3(p.x, height, p.z - 6 + 0.001),
    target,
    fov: FOV,
  };
};

/** Applique un état de caméra à une PerspectiveCamera three.js. */
export const applyCam = (cam: THREE.PerspectiveCamera, s: CamState, up = new THREE.Vector3(0, 1, 0)) => {
  cam.fov = s.fov;
  cam.aspect = WIDTH / HEIGHT;
  cam.near = 1;
  cam.far = 1200;
  cam.up.copy(up);
  cam.position.copy(s.position);
  cam.lookAt(s.target);
  cam.updateProjectionMatrix();
  cam.updateMatrixWorld(true);
};

const scratch = new THREE.PerspectiveCamera();
/** Projette un point monde en pixels écran (pour aligner les icônes HTML sur la 3D). */
export const projectToScreen = (t: number, x: number, y: number, z: number) => {
  applyCam(scratch, cameraAt(t));
  const v = new THREE.Vector3(x, y, z).project(scratch);
  return { x: ((v.x + 1) / 2) * WIDTH, y: ((1 - v.y) / 2) * HEIGHT, visible: v.z < 1 };
};
