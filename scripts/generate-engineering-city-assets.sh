#!/usr/bin/env bash
set -euo pipefail

if [[ -n "${BLENDER_BIN:-}" ]]; then
  blender_bin="$BLENDER_BIN"
elif command -v blender >/dev/null 2>&1; then
  blender_bin="$(command -v blender)"
elif [[ -x "/Applications/Blender.app/Contents/MacOS/Blender" ]]; then
  blender_bin="/Applications/Blender.app/Contents/MacOS/Blender"
else
  echo "Blender no encontrado. Define BLENDER_BIN o instala Blender." >&2
  exit 1
fi

if [[ "${1:-}" == "--" ]]; then
  shift
fi

landmarks=("command-center" "kliniu" "vevi" "intranet-ess" "lorigine" "academy")
if [[ "${1:-}" == "--landmark" ]]; then
  requested_landmark="${2:-}"
  if [[ -z "$requested_landmark" ]]; then
    echo "--landmark requiere uno de los seis landmarks de Engineering City." >&2
    exit 1
  fi
  case "$requested_landmark" in
    command-center|kliniu|vevi|intranet-ess|lorigine|academy) landmarks=("$requested_landmark") ;;
    *)
      echo "Landmark desconocido: $requested_landmark. Usa uno de los seis landmarks de Engineering City." >&2
      exit 1
      ;;
  esac
  shift 2
fi

for landmark in "${landmarks[@]}"; do
  echo "Generando Engineering City: $landmark"
  "$blender_bin" --background --python-exit-code 1 --python "blender/generate_${landmark//-/_}.py" -- "$@"
done
