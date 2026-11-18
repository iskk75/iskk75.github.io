// Usage : node scripts/stills.mjs <dossier> <frame> [frame...]  — un seul bundle, plusieurs images.
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
const [dir, ...frames] = process.argv.slice(2);
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const browserExecutable = process.env.REMOTION_BROWSER ?? null;
const composition = await selectComposition({ serveUrl, id: "Edit", inputProps: {}, browserExecutable });
for (const fr of frames) {
  await renderStill({ composition, serveUrl, frame: Number(fr), output: path.join(dir, `f${fr}.png`), browserExecutable, inputProps: {} });
  console.log("ok", fr);
}
