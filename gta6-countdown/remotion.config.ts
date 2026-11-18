/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import { Config } from "@remotion/cli/config";

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setDefaultPremountInSeconds(2);

// Rendu WebGL (Three.js) : "angle" utilise le GPU. Sur une machine sans GPU, lance avec --gl=swangle.
Config.setChromiumOpenGlRenderer("angle");
Config.setConcurrency(null);

// Optionnel : navigateur local (ex. conteneur sans accès au téléchargement de Chrome Headless Shell).
if (process.env.REMOTION_BROWSER) {
  Config.setBrowserExecutable(process.env.REMOTION_BROWSER);
}
