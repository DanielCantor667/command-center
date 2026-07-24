#!/usr/bin/env bash
set -euo pipefail

if [[ -n "${BLENDER_BIN:-}" ]]; then
  blender_bin="$BLENDER_BIN"
elif command -v blender >/dev/null 2>&1; then
  blender_bin="$(command -v blender)"
elif [[ -x "/Applications/Blender.app/Contents/MacOS/Blender" ]]; then
  blender_bin="/Applications/Blender.app/Contents/MacOS/Blender"
else
  echo "Blender was not found. Set BLENDER_BIN or install Blender." >&2
  exit 1
fi

mkdir -p blender/output
"$blender_bin" --background --python-exit-code 1 blender/templates/base.blend --python blender/render.py -- \
  blender/scenes/starter-office.json apps/web/public/models blender/output
