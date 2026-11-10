"""Run in Blender against a COPY of the raw workshop .blend; no bake, save or export.

  Blender --background /path/to/raw-copy.blend --python-exit-code 1 \
    --python blender/tests/test_bake_workshop_preflight.py
"""
from pathlib import Path
import sys
import tempfile

import bpy

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "blender"))
import bake_workshop_lab as bake  # noqa: E402

# Importing the bake must not run it or create an output.
assert bake.BUILD is None
try:
    bake.parse_options(["--output", tempfile.gettempdir()])
except FileExistsError:
    pass
else:
    raise AssertionError("An existing output directory must be rejected")

bake.restore_image_paths(ROOT / "blender/scenes")
bake.ensure_gallery()
count = len(bpy.data.objects)
bake.ensure_gallery()
assert len(bpy.data.objects) == count, "Gallery must not be duplicated"
bake.apply_lighting(bpy.context.scene)
assert bpy.context.scene.get("visual1_lighting_applied")
assert bpy.data.objects.get("room_haze")
assert abs(bpy.data.objects["hang_0"].data.energy - 72) < .001
try:
    bake.apply_lighting(bpy.context.scene)
except RuntimeError:
    pass
else:
    raise AssertionError("Repeated lighting must be rejected")

bpy.data.objects.remove(bpy.data.objects["label_gallery_kliniu"])
try:
    bake.ensure_gallery()
except RuntimeError as error:
    assert "Gallery is incomplete" in str(error)
else:
    raise AssertionError("A partial gallery must be rejected")

print("VISUAL3_BAKE_PREFLIGHT_TEST_OK (no bake, save or export)")
