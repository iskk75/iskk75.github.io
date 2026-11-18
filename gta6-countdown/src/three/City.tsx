import { useThree } from "@react-three/fiber";
import React, { useMemo } from "react";
import { interpolate, spring } from "remotion";
import * as THREE from "three";
import { C } from "../theme";
import { EASE, FPS, T } from "../timing";
import { applyCam, cameraAt, playerAt, topCameraAt } from "./camera";
import { buildCity } from "./cityGeometry";
import { AVENUES_X, OCEAN_X, POLICE, ROUTE, ROUTE_ACC, ROUTE_LEN, STREETS_Z, rng } from "./layout";

/* La géométrie statique est construite une seule fois par page. */
let cache: ReturnType<typeof buildCity> | null = null;
const getCity = () => (cache ??= buildCity());

/* ---------- Ruban d'itinéraire (dégradé rose -> violet) ---------- */
const buildRibbon = (width: number, y: number) => {
  const pos: number[] = [];
  const col: number[] = [];
  const a = new THREE.Color(C.pink);
  const b = new THREE.Color(C.violet);
  const left: THREE.Vector3[] = [];
  const right: THREE.Vector3[] = [];
  for (let i = 0; i < ROUTE.length; i++) {
    const p = ROUTE[i];
    const q = ROUTE[Math.min(ROUTE.length - 1, i + 1)];
    const o = ROUTE[Math.max(0, i - 1)];
    const dx = q[0] - o[0];
    const dz = q[1] - o[1];
    const L = Math.hypot(dx, dz) || 1;
    const nx = -dz / L;
    const nz = dx / L;
    left.push(new THREE.Vector3(p[0] + nx * width / 2, y, p[1] + nz * width / 2));
    right.push(new THREE.Vector3(p[0] - nx * width / 2, y, p[1] - nz * width / 2));
  }
  const colorAt = (i: number) => a.clone().lerp(b, ROUTE_ACC[i] / ROUTE_LEN);
  for (let i = 0; i < ROUTE.length - 1; i++) {
    const quad = [left[i], right[i], left[i + 1], right[i], right[i + 1], left[i + 1]];
    const cs = [colorAt(i), colorAt(i), colorAt(i + 1), colorAt(i), colorAt(i + 1), colorAt(i + 1)];
    quad.forEach((v) => pos.push(v.x, v.y, v.z));
    cs.forEach((c) => col.push(c.r, c.g, c.b));
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  return g;
};

const Route: React.FC<{ progress: number }> = ({ progress }) => {
  const core = useMemo(() => buildRibbon(1.5, 0.12), []);
  const glow = useMemo(() => buildRibbon(3.4, 0.1), []);
  const segs = ROUTE.length - 1;
  const n = Math.floor(segs * progress) * 6;
  core.setDrawRange(0, n);
  glow.setDrawRange(0, n);
  return (
    <group>
      <mesh geometry={glow} renderOrder={2}>
        <meshBasicMaterial vertexColors transparent opacity={0.4} depthWrite={false} toneMapped={false} side={THREE.DoubleSide} fog={false} />
      </mesh>
      <mesh geometry={core} renderOrder={3}>
        <meshBasicMaterial vertexColors toneMapped={false} side={THREE.DoubleSide} fog={false} />
      </mesh>
    </group>
  );
};

/* ---------- Marqueur joueur ---------- */
const arrowShape = (() => {
  const s = new THREE.Shape();
  s.moveTo(0, 1.6);
  s.lineTo(1.15, -1.1);
  s.lineTo(0, -0.45);
  s.lineTo(-1.15, -1.1);
  s.closePath();
  return s;
})();

const Player: React.FC<{ t: number; scale: number }> = ({ t, scale }) => {
  const p = playerAt(t);
  const ahead = playerAt(t + 0.25);
  const heading = Math.atan2(ahead.x - p.x, ahead.z - p.z);
  const pulse = (t * 1.1) % 1;
  const ringS = interpolate(pulse, [0, 1], [1, 3.2], { easing: EASE.out });
  const ringO = interpolate(pulse, [0, 1], [0.55, 0], { easing: EASE.out });
  return (
    <group position={[p.x, 0.25, p.z]} scale={scale} renderOrder={10}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} scale={ringS} renderOrder={10}>
        <ringGeometry args={[1.5, 1.85, 40]} />
        <meshBasicMaterial color={C.pink} transparent opacity={ringO} depthWrite={false} depthTest={false} toneMapped={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} renderOrder={11}>
        <circleGeometry args={[1.95, 40]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} depthTest={false} transparent />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} renderOrder={12}>
        <circleGeometry args={[1.6, 40]} />
        <meshBasicMaterial color={C.pink} toneMapped={false} depthTest={false} transparent />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, heading + Math.PI]} position={[0, 0.06, 0]} scale={0.62} renderOrder={13}>
        <shapeGeometry args={[arrowShape]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} depthTest={false} transparent />
      </mesh>
    </group>
  );
};

/* ---------- Voitures ---------- */
type Car = { axis: "x" | "z"; lane: number; dir: 1 | -1; offset: number; speed: number; color: string };
const CAR_COLORS = ["#FFFFFF", "#FF2E88", "#7B2FF7", "#FF8A3D", "#1FB5B0", "#FFD84D", "#2B2B3A"];
const CARS: Car[] = (() => {
  const r = rng(42);
  const list: Car[] = [];
  for (const ax of AVENUES_X) {
    for (let k = 0; k < 5; k++) {
      const dir = ax === 0 ? 1 : r() < 0.5 ? 1 : -1; // Ocean Drive : seulement la voie opposée
      list.push({ axis: "z", lane: ax + dir * -1.1, dir, offset: r() * 200, speed: 4 + r() * 4, color: CAR_COLORS[Math.floor(r() * CAR_COLORS.length)] });
    }
  }
  for (const sz of STREETS_Z) {
    if (r() < 0.45) continue;
    const dir = r() < 0.5 ? 1 : -1;
    list.push({ axis: "x", lane: sz + dir * 1.1, dir, offset: r() * 80, speed: 3 + r() * 3, color: CAR_COLORS[Math.floor(r() * CAR_COLORS.length)] });
  }
  return list;
})();

const wrap = (v: number, min: number, max: number) => min + ((((v - min) % (max - min)) + (max - min)) % (max - min));

const CarMesh: React.FC<{ color: string; police?: boolean; t?: number }> = ({ color, police, t = 0 }) => {
  const blink = Math.sin(t * 18) > 0;
  return (
    <group>
      <mesh castShadow position={[0, 0.45, 0]}>
        <boxGeometry args={[1.5, 0.6, 3.0]} />
        <meshLambertMaterial color={color} />
      </mesh>
      <mesh castShadow position={[0, 0.95, -0.15]}>
        <boxGeometry args={[1.3, 0.45, 1.6]} />
        <meshLambertMaterial color={police ? "#1C2440" : "#2A2F45"} />
      </mesh>
      {police ? (
        <>
          <mesh position={[-0.3, 1.25, -0.15]}>
            <boxGeometry args={[0.5, 0.18, 0.35]} />
            <meshBasicMaterial color={blink ? "#FF2E4D" : "#55141F"} toneMapped={false} />
          </mesh>
          <mesh position={[0.3, 1.25, -0.15]}>
            <boxGeometry args={[0.5, 0.18, 0.35]} />
            <meshBasicMaterial color={blink ? "#14235A" : "#3D7BFF"} toneMapped={false} />
          </mesh>
        </>
      ) : null}
    </group>
  );
};

const Traffic: React.FC<{ t: number }> = ({ t }) => (
  <>
    {CARS.map((c, i) => {
      // vitesse quasi constante mais adoucie (pas d'interpolation linéaire)
      const travel = interpolate(t, [0, 18], [0, c.speed * 18], { easing: EASE.soft });
      const along = wrap(c.offset + c.dir * travel, -130, 130);
      const pos: [number, number, number] = c.axis === "z" ? [c.lane, 0, along] : [along - 60, 0, c.lane];
      const rot = c.axis === "z" ? (c.dir > 0 ? 0 : Math.PI) : c.dir > 0 ? Math.PI / 2 : -Math.PI / 2;
      if (c.axis === "x" && (pos[0] > -3 || pos[0] < -120)) return null;
      return (
        <group key={i} position={pos} rotation={[0, rot, 0]}>
          <CarMesh color={c.color} />
        </group>
      );
    })}
  </>
);

/* ---------- Police (apparition avec pop) ---------- */
const Police: React.FC<{ t: number }> = ({ t }) => (
  <>
    {POLICE.map((p, i) => {
      const start = T.policePops[i];
      const s = spring({ frame: (t - start) * FPS, fps: FPS, config: { damping: 11, stiffness: 160 } });
      if (s <= 0.001) return null;
      const drive = interpolate(t, [start, start + 6], [0, 3.5], { easing: EASE.out, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
      return (
        <group key={i} position={[p.x + Math.sin(p.rot) * drive, 0, p.z + Math.cos(p.rot) * drive]} rotation={[0, p.rot, 0]} scale={s * 1.25}>
          <CarMesh color="#FFFFFF" police t={t + i * 0.13} />
        </group>
      );
    })}
  </>
);

/* ---------- Océan ---------- */
const Ocean: React.FC<{ t: number }> = ({ t }) => {
  const swell = Math.sin(t * 1.3) * 0.6;
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[OCEAN_X + 300, -0.12, 0]} receiveShadow>
        <planeGeometry args={[600, 1400]} />
        <meshPhongMaterial color="#13BFC4" shininess={60} specular="#FFD2B0" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[OCEAN_X + 5 + swell * 0.4, -0.08, 0]}>
        <planeGeometry args={[10, 1400]} />
        <meshBasicMaterial color="#6FE6DA" transparent opacity={0.55} depthWrite={false} />
      </mesh>
      {[0, 1, 2].map((k) => (
        <mesh key={k} rotation={[-Math.PI / 2, 0, 0]} position={[OCEAN_X + 0.6 + k * 2.4 + swell * (0.5 + k * 0.3), -0.05, 0]}>
          <planeGeometry args={[0.35 - k * 0.08, 1400]} />
          <meshBasicMaterial color="#FFFFFF" transparent opacity={0.85 - k * 0.25} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
};

/* ---------- Scène complète ---------- */
export type CityMode = "orbit" | "top";

export const CityScene: React.FC<{
  t: number;
  mode?: CityMode;
  routeProgress?: number;
  showPolice?: boolean;
}> = ({ t, mode = "orbit", routeProgress = 0, showPolice = false }) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const state = mode === "orbit" ? cameraAt(t) : topCameraAt(t);
  applyCam(camera, state, mode === "top" ? new THREE.Vector3(0, 0, -1) : undefined);

  const city = getCity();
  const dist = state.position.distanceTo(state.target);

  // Lumière solaire qui suit la zone filmée (ombres nettes à l'endroit utile)
  const tg = state.target;
  const sunOffset = new THREE.Vector3(-42, 38, 26);
  const shadowExtent = Math.min(140, Math.max(40, dist * 0.75));

  const light = useMemo(() => new THREE.DirectionalLight(), []);
  light.position.set(tg.x + sunOffset.x, sunOffset.y, tg.z + sunOffset.z);
  light.target.position.set(tg.x, 0, tg.z);
  light.target.updateMatrixWorld();
  const sc = light.shadow.camera as THREE.OrthographicCamera;
  sc.left = -shadowExtent;
  sc.right = shadowExtent;
  sc.top = shadowExtent;
  sc.bottom = -shadowExtent;
  sc.near = 1;
  sc.far = 220;
  sc.updateProjectionMatrix();

  const markerScale = mode === "top" ? 1.4 : interpolate(dist, [55, 260], [1.0, 2.6], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <>
      <fog attach="fog" args={["#FFB8A8", dist * 1.4, dist * 4.5]} />
      <hemisphereLight args={["#FFF1F4", "#B9A6E8", 1.35]} />
      <ambientLight intensity={0.25} color="#FFD9C2" />
      <primitive
        object={light}
        color="#FFC08F"
        intensity={2.4}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0006}
        shadow-normalBias={0.04}
        shadow-radius={4}
      />
      <primitive object={light.target} />

      <mesh geometry={city.ground} receiveShadow>
        <meshLambertMaterial vertexColors />
      </mesh>
      <mesh geometry={city.solid} castShadow receiveShadow>
        <meshLambertMaterial vertexColors />
      </mesh>
      <Ocean t={t} />
      <Traffic t={t} />
      {routeProgress > 0 ? <Route progress={routeProgress} /> : null}
      {showPolice ? <Police t={t} /> : null}
      <Player t={t} scale={markerScale} />
    </>
  );
};
