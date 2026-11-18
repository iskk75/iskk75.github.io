import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import {
  AVENUES_X,
  BEACH_X,
  CITY_X_MIN,
  CITY_Z,
  OCEAN_X,
  PARK_X,
  ROAD_W,
  STREETS_Z,
  rng,
} from "./layout";

/** Accumulateur de géométries colorées (vertex colors) fusionnées en une seule draw call. */
class Builder {
  parts: THREE.BufferGeometry[] = [];

  add(geo: THREE.BufferGeometry, color: string, m: THREE.Matrix4) {
    const g = geo.index ? geo.toNonIndexed() : geo;
    g.applyMatrix4(m);
    const c = new THREE.Color(color);
    const n = g.attributes.position.count;
    const arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      arr[i * 3] = c.r;
      arr[i * 3 + 1] = c.g;
      arr[i * 3 + 2] = c.b;
    }
    g.setAttribute("color", new THREE.BufferAttribute(arr, 3));
    if (g.attributes.uv) g.deleteAttribute("uv");
    this.parts.push(g);
  }

  box(w: number, h: number, d: number, x: number, y: number, z: number, color: string, ry = 0) {
    const m = new THREE.Matrix4().compose(
      new THREE.Vector3(x, y + h / 2, z),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(0, ry, 0)),
      new THREE.Vector3(1, 1, 1),
    );
    this.add(new THREE.BoxGeometry(w, h, d), color, m);
  }

  /** Dalle au sol (épaisseur nulle visuellement), y = altitude du dessus. */
  slab(x0: number, x1: number, z0: number, z1: number, y: number, color: string) {
    const g = new THREE.PlaneGeometry(x1 - x0, z1 - z0);
    const m = new THREE.Matrix4().compose(
      new THREE.Vector3((x0 + x1) / 2, y, (z0 + z1) / 2),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0)),
      new THREE.Vector3(1, 1, 1),
    );
    this.add(g, color, m);
  }

  cyl(rt: number, rb: number, h: number, x: number, y: number, z: number, color: string, seg = 10, rx = 0, rz = 0) {
    const m = new THREE.Matrix4().compose(
      new THREE.Vector3(x, y + h / 2, z),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, 0, rz)),
      new THREE.Vector3(1, 1, 1),
    );
    this.add(new THREE.CylinderGeometry(rt, rb, h, seg, 1), color, m);
  }

  cone(r: number, h: number, x: number, y: number, z: number, color: string, seg = 8, euler = new THREE.Euler()) {
    const m = new THREE.Matrix4().compose(
      new THREE.Vector3(x, y, z),
      new THREE.Quaternion().setFromEuler(euler),
      new THREE.Vector3(1, 1, 1),
    );
    this.add(new THREE.ConeGeometry(r, h, seg, 1), color, m);
  }

  build() {
    const merged = mergeGeometries(this.parts, false)!;
    merged.computeVertexNormals();
    this.parts.forEach((p) => p.dispose());
    return merged;
  }
}

/* ---------- Palette ville ---------- */
const PASTELS = [
  "#FF9EBB", // rose
  "#93E8D0", // menthe
  "#FFC38F", // pêche
  "#BBA2FF", // lilas
  "#8FD0F2", // bleu ciel
  "#FFE58F", // jaune
  "#FFB0D4",
  "#F5DCC2", // crème
];
const ACCENTS = ["#FF2E88", "#7B2FF7", "#FF8A3D", "#1FB5B0", "#4C7DFF"];
const GLASS = "#5CC9D6";
const TRIM = "#FFFFFF";

export const GROUND = {
  sidewalk: "#EDE4D6",
  road: "#8E8C99",
  marking: "#F8F4EC",
  grass: "#8FD49C",
  sand: "#F6DDB0",
  wetSand: "#E9C895",
};

/* ---------- Bâtiments art déco ---------- */
const decoBuilding = (
  b: Builder,
  r: () => number,
  cx: number,
  cz: number,
  w: number,
  d: number,
  h: number,
  frontX: boolean,
) => {
  const color = PASTELS[Math.floor(r() * PASTELS.length)];
  const accent = ACCENTS[Math.floor(r() * ACCENTS.length)];
  const type = r();

  // Socle légèrement plus sombre
  b.box(w + 0.15, 0.5, d + 0.15, cx, 0, cz, TRIM);
  // Corps
  b.box(w, h, d, cx, 0, cz, color);

  // Bandeaux horizontaux ("eyebrows") + fenêtres en bande
  const floor = 1.35;
  for (let y = 1.2; y < h - 0.4; y += floor) {
    b.box(w + 0.28, 0.12, d + 0.28, cx, y, cz, TRIM);
    // bande de vitrage sur les façades +x et +z
    b.box(w * 0.78, 0.55, 0.06, cx, y + 0.3, cz + d / 2 + 0.03, GLASS);
    b.box(0.06, 0.55, d * 0.78, cx + w / 2 + 0.03, y + 0.3, cz, GLASS);
  }
  // Corniche (bord blanc) + toit de la couleur du bâtiment, visible en vue de dessus
  b.box(w + 0.35, 0.22, d + 0.35, cx, h, cz, TRIM);
  b.box(w - 0.15, 0.04, d - 0.15, cx, h + 0.22, cz, color);
  // Toit : piscine turquoise ou blocs de clim
  if (r() < 0.45 && w > 3 && d > 3) {
    b.box(w * 0.45, 0.1, d * 0.35, cx - w * 0.15, h + 0.26, cz - d * 0.2, "#2FD3E0");
    b.box(w * 0.45 + 0.3, 0.06, d * 0.35 + 0.3, cx - w * 0.15, h + 0.24, cz - d * 0.2, "#FFFFFF");
  } else {
    b.box(0.9, 0.5, 0.9, cx - w * 0.25, h + 0.24, cz - d * 0.25, "#C9C3D3");
    b.box(0.7, 0.4, 1.2, cx - w * 0.3, h + 0.24, cz + d * 0.1, "#D8D2E0");
  }

  if (type < 0.4) {
    // Pylône central vertical (signature art déco) côté façade
    const fx = frontX ? cx + w / 2 + 0.12 : cx;
    const fz = frontX ? cz : cz + d / 2 + 0.12;
    b.box(frontX ? 0.35 : 0.9, h + 2.2, frontX ? 0.9 : 0.35, fx, 0.5, fz, accent);
    b.box(frontX ? 0.4 : 1.3, 0.3, frontX ? 1.3 : 0.4, fx, h + 2.6, fz, TRIM);
  } else if (type < 0.7) {
    // Tour d'angle arrondie (streamline)
    const rr = Math.min(w, d) * 0.32;
    const tx = cx + w / 2 - rr * 0.6;
    const tz = cz + d / 2 - rr * 0.6;
    b.cyl(rr, rr, h + 1.4, tx, 0, tz, color, 14);
    b.cyl(rr + 0.12, rr + 0.12, 0.18, tx, h + 1.4, tz, TRIM, 14);
    b.cyl(0.08, 0.08, 1.4, tx, h + 1.55, tz, TRIM, 6);
    b.cyl(rr * 0.55, rr * 0.55, 0.6, tx, h + 1.55, tz, accent, 12);
  } else {
    // Couronnement en gradins (ziggourat)
    b.box(w * 0.7, 0.9, d * 0.7, cx, h + 0.2, cz, color);
    b.box(w * 0.7 + 0.2, 0.12, d * 0.7 + 0.2, cx, h + 1.1, cz, TRIM);
    b.box(w * 0.4, 0.7, d * 0.4, cx, h + 1.2, cz, accent);
  }

  // Auvent coloré au rez-de-chaussée
  if (frontX) b.box(0.7, 0.12, d * 0.7, cx + w / 2 + 0.35, 1.0, cz, accent);
  else b.box(w * 0.7, 0.12, 0.7, cx, 1.0, cz + d / 2 + 0.35, accent);
};

const tower = (b: Builder, r: () => number, cx: number, cz: number, w: number, d: number, h: number) => {
  const body = r() < 0.5 ? "#F7F1EA" : PASTELS[Math.floor(r() * PASTELS.length)];
  b.box(w, h, d, cx, 0, cz, body);
  for (let y = 1.5; y < h - 0.5; y += 1.5) {
    b.box(w + 0.5, 0.14, d + 0.5, cx, y, cz, TRIM); // balcons filants
    b.box(w * 0.86, 0.9, 0.06, cx, y + 0.25, cz + d / 2 + 0.03, GLASS);
    b.box(0.06, 0.9, d * 0.86, cx + w / 2 + 0.03, y + 0.25, cz, GLASS);
  }
  b.box(w * 0.6, 1.2, d * 0.6, cx, h, cz, TRIM);
};

/* ---------- Végétation et plage ---------- */
export const palm = (b: Builder, x: number, z: number, h0: number, lean: number, seed: number) => {
  const r = rng(seed);
  const h = h0 * 0.72;
  const trunk = "#A9744A";
  const seg = 5;
  let px = x;
  let pz = z;
  const dir = r() * Math.PI * 2;
  for (let i = 0; i < seg; i++) {
    const y = (i * h) / seg;
    const k = (i / seg) ** 2 * lean;
    px = x + Math.cos(dir) * k;
    pz = z + Math.sin(dir) * k;
    b.cyl(0.17 - i * 0.015, 0.2 - i * 0.015, h / seg + 0.05, px, y, pz, i % 2 ? trunk : "#97633C", 6);
  }
  const top = new THREE.Vector3(px, h, pz);
  const greens = ["#2FA866", "#3DBE73", "#26935A"];
  const n = 7;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + r() * 0.4;
    const len = 1.5 + r() * 0.4;
    // Feuille : cône aplati couché, qui retombe
    const g = new THREE.ConeGeometry(0.38, len, 4, 1);
    g.translate(0, len / 2, 0);
    g.scale(0.25, 1, 1); // feuille plate
    // On couche la feuille (rotation z) puis on l'oriente autour du tronc (rotation y)
    const m = new THREE.Matrix4()
      .makeTranslation(top.x, top.y, top.z)
      .multiply(new THREE.Matrix4().makeRotationY(a))
      .multiply(new THREE.Matrix4().makeRotationZ(-(Math.PI / 2) - 0.15 + r() * 0.35));
    b.add(g, greens[i % 3], m);
  }
  b.cone(0.28, 0.4, top.x, top.y - 0.05, top.z, "#6B4A2B", 6);
};

const umbrella = (b: Builder, x: number, z: number, color: string) => {
  b.cyl(0.05, 0.05, 1.6, x, 0, z, "#FFFFFF", 5);
  b.cone(1.1, 0.5, x, 1.75, z, color, 10);
  b.box(0.8, 0.08, 1.6, x + 0.9, 0, z + 0.3, "#FFFFFF"); // transat
};

const lifeguard = (b: Builder, x: number, z: number, color: string) => {
  for (const [dx, dz] of [
    [-0.7, -0.7],
    [0.7, -0.7],
    [-0.7, 0.7],
    [0.7, 0.7],
  ])
    b.cyl(0.07, 0.07, 1.8, x + dx, 0, z + dz, "#FFFFFF", 5);
  b.box(2.0, 0.2, 2.0, x, 1.8, z, "#FFFFFF");
  b.box(1.8, 1.3, 1.6, x, 2.0, z, color);
  b.box(0.08, 0.5, 1.2, x + 0.94, 2.4, z, GLASS);
  b.box(2.2, 0.18, 2.0, x, 3.3, z, "#FF2E88");
  b.box(1.4, 0.18, 0.5, x - 0.2, 0.0, z + 1.4, "#FFFFFF"); // rampe
};

/* ---------- Construction principale ---------- */
export const buildCity = () => {
  const solid = new Builder();
  const ground = new Builder();
  const r = rng(1987);

  const [Z0, Z1] = CITY_Z;
  const half = ROAD_W / 2;

  // Sol de base (trottoirs)
  ground.slab(CITY_X_MIN - 40, PARK_X[0], Z0 - 60, Z1 + 60, 0, GROUND.sidewalk);
  // Parc (Lummus Park) et plage
  ground.slab(PARK_X[0], PARK_X[1], Z0 - 60, Z1 + 60, 0.0, GROUND.grass);
  ground.slab(BEACH_X[0], BEACH_X[1], Z0 - 60, Z1 + 60, 0.0, GROUND.sand);
  ground.slab(BEACH_X[1] - 2.5, BEACH_X[1] + 1.5, Z0 - 60, Z1 + 60, -0.04, GROUND.wetSand);
  // Allée piétonne dans le parc
  ground.slab(5.2, 6.4, Z0 - 60, Z1 + 60, 0.015, "#F3E9D9");

  // Avenues (nord-sud)
  for (const ax of AVENUES_X) {
    ground.slab(ax - half, ax + half, Z0 - 60, Z1 + 60, 0.02, GROUND.road);
    // pointillés centraux
    for (let z = Z0 - 60; z < Z1 + 60; z += 4) ground.slab(ax - 0.09, ax + 0.09, z, z + 2, 0.035, GROUND.marking);
  }
  // Rues (est-ouest), arrêtées à Ocean Drive
  for (const sz of STREETS_Z) {
    ground.slab(CITY_X_MIN - 40, half, sz - half, sz + half, 0.021, GROUND.road);
    for (let x = CITY_X_MIN - 40; x < -half - 1; x += 4) {
      if (AVENUES_X.some((ax) => Math.abs(x + 1 - ax) < half + 1.2)) continue;
      ground.slab(x, x + 2, sz - 0.09, sz + 0.09, 0.035, GROUND.marking);
    }
    // passages piétons sur Ocean Drive
    for (let i = 0; i < 6; i++) {
      const x = -half + 0.3 + i * 0.8;
      ground.slab(x, x + 0.45, sz + half + 0.5, sz + half + 1.5, 0.036, GROUND.marking);
    }
  }

  // Îlots
  const avenues = [...AVENUES_X].sort((a, b) => b - a); // 0, -16, ...
  for (let ai = 0; ai < avenues.length; ai++) {
    const xR = avenues[ai] - half - 1.0; // bord droit de l'îlot
    const xL = ai + 1 < avenues.length ? avenues[ai + 1] + half + 1.0 : xR - 11;
    for (let si = 0; si < STREETS_Z.length - 1; si++) {
      const zT = STREETS_Z[si] + half + 1.0;
      const zB = STREETS_Z[si + 1] - half - 1.0;
      const bw = xR - xL;
      const bd = zB - zT;
      const oceanFront = ai === 0;
      // 2 x 2 lots
      const lots = oceanFront ? [
        [0, 0, 1, 0.5],
        [0, 0.5, 1, 0.5],
      ] : r() < 0.25 ? [[0, 0, 1, 1]] : [
        [0, 0, 0.5, 0.5],
        [0.5, 0, 0.5, 0.5],
        [0, 0.5, 0.5, 0.5],
        [0.5, 0.5, 0.5, 0.5],
      ];
      for (const [lx, lz, lw, ld] of lots) {
        const gap = 0.5;
        const w = bw * lw - gap;
        const d = bd * ld - gap;
        const cx = xL + bw * (lx + lw / 2);
        const cz = zT + bd * (lz + ld / 2);
        if (oceanFront) {
          decoBuilding(solid, r, cx - 0.6, cz, w - 1.4, d, 3.2 + Math.floor(r() * 3) * 1.35, true);
        } else if (lw === 1 && ld === 1) {
          if (r() < 0.5) {
            // petite place avec palmiers
            ground.slab(xL, xR, zT, zB, 0.01, GROUND.grass);
            palm(solid, cx - 2, cz - 2, 4.5, 0.8, si * 31 + ai);
            palm(solid, cx + 2.5, cz + 1.5, 5, 1, si * 17 + ai);
            palm(solid, cx - 1.5, cz + 3, 3.8, 0.6, si * 7 + ai);
          } else {
            tower(solid, r, cx, cz, w * 0.8, d * 0.8, 12 + r() * 14);
          }
        } else {
          const tall = ai >= 2 && r() < 0.18;
          if (tall) tower(solid, r, cx, cz, w, d, 10 + r() * 10);
          else decoBuilding(solid, r, cx, cz, w, d, 2.8 + Math.floor(r() * 4) * 1.35, false);
        }
      }
    }
  }

  // Palmiers le long d'Ocean Drive (côté parc) et dans le parc
  for (let z = Z0; z <= Z1; z += 6.5) {
    palm(solid, PARK_X[0] + 1.0, z + (r() - 0.5), 4.6 + r() * 1.2, 0.6 + r() * 0.6, Math.floor(z * 13 + 400));
    if (r() < 0.6) palm(solid, PARK_X[1] - 1.2, z + 3 + r(), 4.2 + r() * 1.4, 0.8 + r(), Math.floor(z * 7 + 900));
  }
  // Palmiers sur les trottoirs des rues
  for (const sz of STREETS_Z) {
    for (let x = -6; x > CITY_X_MIN; x -= 16) {
      if (r() < 0.5) palm(solid, x, sz + half + 0.6, 4 + r(), 0.5, Math.floor(sz * 3 - x * 5 + 77));
    }
  }

  // Plage : parasols et postes de secours
  const umbrellaColors = ["#FF2E88", "#7B2FF7", "#FF8A3D", "#FFFFFF", "#1FB5B0"];
  for (let z = Z0; z <= Z1; z += 5) {
    if (r() < 0.55) umbrella(solid, 12 + r() * 7, z + r() * 3, umbrellaColors[Math.floor(r() * umbrellaColors.length)]);
  }
  const towerColors = ["#FFB3C7", "#B8F0E0", "#FFD3A8", "#CDB8FF", "#FFF0B8"];
  let ti = 0;
  for (let z = Z0 + 10; z <= Z1; z += 34) lifeguard(solid, 19.5, z, towerColors[ti++ % towerColors.length]);

  return { solid: solid.build(), ground: ground.build(), oceanX: OCEAN_X };
};
