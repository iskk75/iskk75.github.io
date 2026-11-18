import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

export const C = {
  pink: "#FF2E88",
  violet: "#7B2FF7",
  orange: "#FF8A3D",
  cream: "#F4EFE6",
  ink: "#0E0A14",
  night: "#120A1F",
  white: "#FFFFFF",
};

export const FONT = "Manrope";

const weights = ["600", "700", "800"] as const;
for (const w of weights) {
  loadFont({
    family: FONT,
    url: staticFile(`fonts/manrope-latin-${w}-normal.woff2`),
    weight: w,
  });
}

export const fontStyle = {
  fontFamily: `${FONT}, Inter, system-ui, sans-serif`,
  fontWeight: 800,
  letterSpacing: "-0.02em",
} as const;
