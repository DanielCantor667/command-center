#!/usr/bin/env bash
# Phase B: compress the raw workshop-lab GLBs (bake_workshop_lab.py output) into the web copies.
# Same tool and version as the earlier workshop props: gltf-transform 4.5.1, meshopt geometry.
# Textures go to WebP (no runtime transcoder needed, unlike KTX2).
set -euo pipefail
SRC=/Users/creativo/Documents/command-center-assets/build
OUT="$(cd "$(dirname "$0")/.." && pwd)/apps/web/public/models/workshop-lab"
GT="npx -y @gltf-transform/cli@4.5.1"
mkdir -p "$OUT"

# baked room: keep the 4k lightmaps, it is the whole look of the room
$GT optimize "$SRC/lab-baked.glb" "$OUT/lab-baked-v1.glb" --compress meshopt --texture-compress webp --texture-size 4096
$GT optimize "$SRC/lab-emissive.glb" "$OUT/lab-emissive-v1.glb" --compress meshopt
$GT optimize "$SRC/lab-plants.glb" "$OUT/lab-plants-v1.glb" --compress meshopt --texture-compress webp --texture-size 512
for actor in robot-cobot drone-k07 drone-mech cat; do
  # actors keep their node hierarchy so animations stay addressable
  $GT optimize "$SRC/$actor.glb" "$OUT/$actor-v1.glb" --compress meshopt --texture-compress webp --texture-size 1024 \
    --join false --flatten false --instance false
done
cp "$SRC/lab-anchors.json" "$OUT/lab-anchors-v1.json"
du -ch "$OUT"/* | sort -h
