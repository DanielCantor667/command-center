"""Responsive hero cameras; preserve the gallery and detail scenes."""
from pathlib import Path
import bpy
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'blender/output/lorigine-v4'


def build():
    source = bpy.data.scenes['Lorigine Gallery v4']
    for name, width, height, scale, target_z in [
        ('desktop', 2000, 1200, 6.2, .95),
        ('mobile', 900, 1600, 6.3, .80),
    ]:
        scene = source.copy()
        scene.name = f'Lorigine Hero {name} v4'
        scene.use_fake_user = True
        camera = source.camera.copy()
        camera.data = source.camera.data.copy()
        scene.collection.objects.link(camera)
        scene.camera = camera
        target = Vector((0, 0, target_z))
        # Keep the orthographic image plane above the ground in the tall crop.
        camera.location = target + (Vector((2.8, -4.5, 2.35)) - target) * 3
        camera.rotation_euler = (target - camera.location).to_track_quat('-Z', 'Y').to_euler()
        camera.data.ortho_scale = scale
        scene.render.resolution_x = width
        scene.render.resolution_y = height
        scene.render.filepath = str(OUT / f'lorigine-hero-{name}-v4-')
    bpy.ops.wm.save_as_mainfile(filepath=str(OUT / 'lorigine-gallery-v4.blend'))


if __name__ == '__main__':
    build()
