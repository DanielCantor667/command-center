"""Validate a scene and all referenced GLB assets before invoking Blender.

Usage:
    python3 blender/validate_scene.py blender/scenes/starter-office.json apps/web/public/models
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from lib.scene_io import load_scene  # noqa: E402


def main():
    if len(sys.argv) != 3:
        raise SystemExit("usage: validate_scene.py <scene.json> <assets_dir>")

    scene_path, assets_dir = sys.argv[1:]
    scene = load_scene(scene_path)
    missing = [obj["asset"] for obj in scene["objects"] if not os.path.isfile(os.path.join(assets_dir, f"{obj['asset']}.glb"))]
    if missing:
        unique_missing = ", ".join(sorted(set(missing)))
        raise SystemExit(f"scene is valid but GLB assets are missing: {unique_missing}")

    print(f"scene '{scene['id']}' is ready for Blender ({len(scene['objects'])} objects)")


if __name__ == "__main__":
    main()
