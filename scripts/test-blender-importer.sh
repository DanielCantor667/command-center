#!/usr/bin/env bash
set -euo pipefail

if [[ -n "${BLENDER_BIN:-}" ]]; then blender_bin="$BLENDER_BIN"
elif command -v blender >/dev/null 2>&1; then blender_bin="$(command -v blender)"
elif [[ -x "/Applications/Blender.app/Contents/MacOS/Blender" ]]; then blender_bin="/Applications/Blender.app/Contents/MacOS/Blender"
else echo "Blender no encontrado. Define BLENDER_BIN o instala Blender." >&2; exit 1
fi

"$blender_bin" --background --python-exit-code 1 --python blender/test_importer.py -- apps/web/public/models
