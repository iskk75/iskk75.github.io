#!/usr/bin/env bash
# Usage : ./scripts-stills.sh 60 300 600 ...   (exporte out/stills/f<frame>.png)
set -e
mkdir -p out/stills
for f in "$@"; do
  npx remotion still GTA6Countdown "out/stills/f$f.png" --frame="$f" --gl="${REMOTION_GL:-angle}" --log=error
done
