"""Run against an isolated copy of the workshop scene, optionally applying the Visual 2 gallery."""
from pathlib import Path
import sys

import bpy
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "blender"))
corner_names = ("kliniu", "lorigine", "4ustudio-academy", "drokex")
corner_vertices = {
    name: [tuple(bpy.data.objects[f"screen_{name}"].matrix_world @ vertex.co)
           for vertex in bpy.data.objects[f"screen_{name}"].data.vertices]
    for name in corner_names
}
if "--apply" in sys.argv:
    from visual2_gallery import apply
    apply(bpy.data.collections["WorkshopLab"], ROOT)

expected = (
    ("kliniu", "kliniu-desktop.webp", 3.78),
    ("lorigine", "lorigine-catalog-v4.webp", 2.96),
    ("4ustudio-academy", "academy-lessons-v4.webp", 2.14),
    ("drokex", "drokex-products-v4.webp", 1.32),
)
for project, capture, y in expected:
    screen = bpy.data.objects.get(f"screen_gallery_{project}")
    assert screen is not None, f"Missing gallery screen: {project}"
    centre = sum((screen.matrix_world @ v.co for v in screen.data.vertices), Vector()) / len(screen.data.vertices)
    assert abs(centre.y - y) < 0.001, (project, centre)
    assert abs(centre.x - 3.922) < 0.001 and abs(centre.z - 2.03) < 0.001
    vertices = [screen.matrix_world @ vertex.co for vertex in screen.data.vertices]
    normal = (screen.matrix_world.to_3x3() @ screen.data.polygons[0].normal).normalized()
    assert (normal - Vector((-1, 0, 0))).length < 0.001
    assert abs((vertices[1] - vertices[0]).length - .70) < 0.001
    assert abs((vertices[3] - vertices[0]).length - .44) < 0.001
    assert bpy.data.objects.get(f"label_gallery_{project}") is not None
    corner = bpy.data.objects.get(f"screen_{project}")
    assert corner is not None, f"Missing corner screen: {project}"
    assert [tuple(corner.matrix_world @ vertex.co) for vertex in corner.data.vertices] == corner_vertices[project]
    images = [n.image for n in screen.data.materials[0].node_tree.nodes if n.type == "TEX_IMAGE"]
    assert len(images) == 1 and Path(bpy.path.abspath(images[0].filepath)).name == capture, project

for project, x in (("command-center", -0.7), ("intranet-ess", 0.0), ("vevi", 0.7)):
    screen = bpy.data.objects[f"screen_{project}"]
    centre = sum((screen.matrix_world @ v.co for v in screen.data.vertices), Vector()) / len(screen.data.vertices)
    assert (centre - Vector((x, -6.035, 2.70))).length < 0.001, (project, centre)
    normal = (screen.matrix_world.to_3x3() @ screen.data.polygons[0].normal).normalized()
    assert (normal - Vector((0, 1, 0))).length < 0.001, (project, normal)
    for prefix in ("bezel_", "label_", "arm_"):
        assert bpy.data.objects.get(prefix + project) is not None

print("VISUAL2_GALLERY_OK")
