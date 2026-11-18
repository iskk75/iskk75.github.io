# Edit TikTok · Koba LaD — « Promis bébé »

Remotion, 1080×1920, 60 fps, 17,4 s (20 temps à 72,16 BPM).

- `npx remotion render Edit out/edit.mp4` → export **sans musique** (bruitages seulement), à poster avec le son dans TikTok.
- `npx remotion render Preview out/preview.mp4` → même montage **avec** `public/ref.mp3`, pour vérifier la synchro.
- `node scripts/stills.mjs out/stills 300 470 900` → images fixes.

Tout le timing est dans `src/timing.ts` : grille des temps (BPM, premier temps), paroles mot par mot,
liste des plans (source, point d'entrée, cadrage, vitesse, transition, teinte, note d'aura) et bruitages.
Les bruitages (`public/sfx/`) sont générés (numpy), donc libres de droits.

Les clips (`public/clips/`) et `public/ref.mp3` ne sont pas versionnés : ce sont des contenus TikTok sous droits.
