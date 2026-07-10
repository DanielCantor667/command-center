"""Entry point for the Blender render pipeline.

Usage (run headless, against a base .blend template that already has a
camera, lights and HDRI configured):

    blender scene.blend --background --python render.py -- \
        <scene.json> <assets_dir> <output_dir>

Produces <output_dir>/<scene-id>.glb and <output_dir>/<scene-id>.png.
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from lib.exporter import export_glb  # noqa: E402
from lib.importer import import_scene_objects  # noqa: E402
from lib.renderer import render_png  # noqa: E402
from lib.scene_io import load_scene  # noqa: E402


def main():
    argv = sys.argv[sys.argv.index("--") + 1:]
    if len(argv) != 3:
        raise SystemExit("usage: render.py -- <scene.json> <assets_dir> <output_dir>")

    scene_path, assets_dir, output_dir = argv
    os.makedirs(output_dir, exist_ok=True)

    scene = load_scene(scene_path)
    import_scene_objects(scene, assets_dir)

    export_glb(os.path.join(output_dir, f"{scene['id']}.glb"))
    render_png(os.path.join(output_dir, f"{scene['id']}.png"))


if __name__ == "__main__":
    main()
