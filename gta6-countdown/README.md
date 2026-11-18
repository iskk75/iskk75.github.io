# Compte à rebours GTA 6 · Remotion + React Three Fiber

Vidéo verticale 1080×1920, 60 fps, 30 s (TikTok / Shorts) : compte à rebours avant la sortie
de GTA 6 sur PS5 et Xbox Series, **jeudi 19 novembre 2026 à 00:00 (heure de Paris)**.
Création originale : aucun logo, aucune police ni aucun visuel officiel de Rockstar.

## Commandes

```bash
npm i
npm run dev                       # Remotion Studio (aperçu)
npx remotion still GTA6Countdown out/still.png --frame=690
npx remotion render GTA6Countdown out/gta6-countdown.mp4
```

Sur une machine sans GPU, ajoute `--gl=swangle`. Si Chrome Headless Shell ne peut pas être
téléchargé, indique un navigateur local : `REMOTION_BROWSER=/chemin/vers/chrome npx remotion render ...`.
`./scripts-stills.sh 420 690 880` exporte plusieurs images clés dans `out/stills/`.

## Compte à rebours

`calculateMetadata` (dans `src/Root.tsx`) lit `Date.now()` une seule fois au moment du rendu.
Le compteur part de cette valeur, puis il défile seconde par seconde selon la frame absolue.
Pour forcer une heure de départ : `--props='{"renderTimeMs": 1795467600000}'`.

## Musique

La piste audio est déjà branchée (`src/Main.tsx`, séquence « Musique »). Remplace
`public/audio/music.mp3` (30 s de silence) par ta musique, ou passe
`--props='{"musicSrc":"audio/ma-musique.mp3","musicVolume":0.8}'`.

## Structure

| Fichier | Rôle |
| --- | --- |
| `src/timing.ts` | **Toutes** les constantes de timing (scènes, transitions, temps des animations, easings) |
| `src/Main.tsx` | `<TransitionSeries>` des 8 scènes + piste audio |
| `src/scenes/S1Intro.tsx` … `S8Outro.tsx` | Une scène = un composant |
| `src/three/` | Ville 3D low-poly procédurale (géométrie fusionnée, caméra continue, ombres douces) |
| `src/components/` | Bulle GPS, carte d'alerte, icônes police, carte compteur, bouton, curseur, particules |
| `src/transitions/iris.tsx` | Transitions « portail » circulaire et zoom-fade |

Les animations n'utilisent que `spring()` et `interpolate()` avec un easing (`Easing.bezier`).
La caméra 3D suit une spline Catmull-Rom calculée à partir du temps absolu : elle ne coupe
jamais d'une scène à l'autre. La profondeur de champ est un flou tilt-shift (haut/bas), et le
motion blur vient de `@remotion/motion-blur` (`<CameraMotionBlur>`) sur le point d'intro,
les chiffres qui roulent, le curseur et la fermeture finale.
