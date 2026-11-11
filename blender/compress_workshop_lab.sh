#!/usr/bin/env bash
# Phase B: compress raw workshop-lab GLBs into a new staging directory.
# Usage: compress_workshop_lab.sh BAKE_DIRECTORY NEW_OUTPUT_DIRECTORY
# Review the staged files and install them separately; no web app path is selected by default.
# Same tool and version as the earlier workshop props: gltf-transform 4.5.1, meshopt geometry.
# Textures go to KTX2 (stay compressed on the GPU: the 8k lightmap is 45 MB of VRAM instead of 358 MB as WebP),
# in three tiers picked by labTier() in lab.ts: high (8k lightmap), medium (4k), low (2k, phones).
# ETC1S for every slot: UASTC normal maps tripled the download and the actors are too small on screen to show it.
# Needs KTX-Software 4.3+ (`ktx` on PATH):
# the official signed pkg extracted into the assets folder, no system install.
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ASSETS=/Users/creativo/Documents/command-center-assets
if [[ $# -ne 2 ]]; then
  echo "Usage: $0 BAKE_DIRECTORY NEW_OUTPUT_DIRECTORY" >&2
  exit 2
fi
SRC="$(cd "$1" && pwd)"
OUT=$2
if [[ -e "$OUT" || -L "$OUT" ]]; then
  echo "Output already exists; choose a new staging directory: $OUT" >&2
  exit 2
fi
mkdir "$OUT"
OUT="$(cd "$OUT" && pwd)"
export PATH="$ASSETS/tools/ktx-4.4.2/bin:$PATH"
GT="npx -y @gltf-transform/cli@4.5.1"
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT

# compress <name> <tier> <max texture px> [optimize flags...]
compress() {
  local name=$1 tier=$2 size=$3; shift 3
  mkdir -p "$OUT/$tier"
  # meshopt goes last: the texture commands rewrite the file without it
  $GT optimize "$SRC/$name.glb" "$TMP/$name.glb" --compress false --texture-compress false "$@"
  $GT etc1s "$TMP/$name.glb" "$TMP/$name.glb" --resize "$size" --quality 255
  $GT meshopt "$TMP/$name.glb" "$OUT/$tier/$name-v1.glb"
}

# tier:lightmap:props:detail:plants:simplify error (P.2, specs/workshop-performance.md: phones get coarser geometry)
for tier_size in high:8192:1024:384:512:0.0001 medium:4096:512:256:512:0.0001 low:2048:512:192:256:0.001; do
  IFS=: read -r tier room props detail plants error <<< "$tier_size"
  mkdir "$OUT/$tier"
  # baked room: the lightmaps hold the light; the detail and normal textures (R.2b) are what the smaller tiers give up
  $GT optimize "$SRC/lab-baked.glb" "$TMP/lab-baked-optimized.glb" --compress false --texture-compress false --simplify-error "$error"
  # The low tier draws the room unlit: its normals are dead weight.
  if [[ "$tier" == low ]]; then
    npx -y --package=@gltf-transform/cli@4.5.1 -- node "$SCRIPT_DIR/drop_workshop_normals.cjs" "$TMP/lab-baked-optimized.glb" "$TMP/lab-baked-unlit.glb"
    mv "$TMP/lab-baked-unlit.glb" "$TMP/lab-baked-optimized.glb"
  fi
  # The CLI's glob tests names AND URIs: embedded images have empty URIs, so a negated
  # glob can accidentally resize lightmaps too. Select textures directly instead.
  npx -y --package=@gltf-transform/cli@4.5.1 -- node "$SCRIPT_DIR/resize_workshop_textures.cjs" "$TMP/lab-baked-optimized.glb" "$TMP/lab-baked.glb" "$detail"
  if [[ "$tier" == high ]]; then
    # Positive name match protects the lightmaps from detail texture compression.
    # The second pass skips those KTX2 textures and compresses only the remaining details.
    $GT etc1s "$TMP/lab-baked.glb" "$TMP/lab-baked-maps.glb" --pattern 'lab-*' --resize "$room" --quality 128
    $GT etc1s "$TMP/lab-baked-maps.glb" "$TMP/lab-baked-ktx.glb" --resize "$room" --quality 32
  else
    quality=255
    [[ "$tier" == medium ]] && quality=80
    $GT etc1s "$TMP/lab-baked.glb" "$TMP/lab-baked-ktx.glb" --resize "$room" --quality "$quality"
  fi
  $GT meshopt "$TMP/lab-baked-ktx.glb" "$OUT/$tier/lab-baked-v1.glb"
  compress lab-emissive "$tier" 512
  compress lab-plants "$tier" "$plants"
  for actor in robot-cobot drone-k07 drone-mech cat robot-humanoid robot-quad robot-trilobite; do
    # actors keep their node hierarchy so animations stay addressable
    compress "$actor" "$tier" "$props" --join false --flatten false --instance false
  done
done
cp "$SRC/lab-anchors.json" "$OUT/lab-anchors-v1.json"
# The city behind the window (bake_workshop_lab.py). Below the skyline the HDRI is the street and its crowd:
# it fades to black, as seen from a few floors up.
python3 - "$SRC/night-sky.png" "$OUT/night-sky-v1.webp" <<'PY'
import sys
from PIL import Image
sky = Image.open(sys.argv[1]).convert("RGB").resize((3072, 1536))
fade = Image.new("L", (1, 1536))
fade.putdata([round(255 * min(1, max(0, (0.585 - y / 1536) / 0.025))) for y in range(1536)])
Image.composite(sky, Image.new("RGB", sky.size), fade.resize(sky.size)).save(sys.argv[2], quality=82, method=6)
PY
# Typed copy for the web module, already in three.js space: Blender (x, y, z-up) -> (x, z, -y),
# facing yaw -> rotation.y = facing + 90 deg. Plates are laid out by technology-shelf.tsx itself.
python3 - "$SRC/lab-anchors.json" "$OUT/lab-anchors.ts" <<'PY'
import json, math, sys
src, dst = sys.argv[1], sys.argv[2]
rows = []
for name, a in sorted(json.load(open(src)).items()):
    if name.startswith("plate_"):
        continue
    x, y, z = a["centre"]
    rot = round(math.radians(a["facing"] + 90), 4)
    rows.append(f"  '{name}': {{ position: [{x}, {z}, {round(-y, 4)}], rotationY: {rot}, size: [{a['size'][0]}, {a['size'][1]}] }},")
open(dst, "w").write(
    "// Generated by blender/compress_workshop_lab.sh from lab-anchors.json; do not edit by hand.\n"
    "export interface LabAnchor { position: [number, number, number]; rotationY: number; size: [number, number] }\n"
    "export const LAB_ANCHORS: Record<string, LabAnchor> = {\n" + "\n".join(rows) + "\n};\n")
print("wrote", dst, len(rows), "anchors")
PY
du -sh "$OUT"/*/
