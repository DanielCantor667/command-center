"""Check the Visual 1 look against a scene copy, with no saving or exporting."""
from pathlib import Path
import sys

import bpy
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "blender"))
if "--apply" in sys.argv:
    from visual2_gallery import apply as add_gallery
    from visual1_lighting import apply as apply_lighting
    add_gallery(bpy.data.collections["WorkshopLab"], ROOT)
    apply_lighting(bpy.context.scene)

scene = bpy.context.scene
assert abs(scene.view_settings.exposure - .15) < .0001
for name, energy in (("hang_0", 72), ("hang_1", 72), ("hang_2", 72), ("bench_lamp", 150),
                     ("pegboard_wash", 24), ("window_cyan", 100), ("monitor_purple", 42)):
    assert abs(bpy.data.objects[name].data.energy - energy) < .001, name
for name, location, target, energy, color, size in (
    ("visual1_bench_bounce", (-3.35, 2.0, 2.36), (-3.45, 2.0, .7), 60, (1, .43, .18), 1.0),
    ("visual1_desk_task", (2.85, 2.25, 2.35), (3.35, 3.0, .75), 35, (1, .45, .18), .7),
    ("visual1_monitor_spill", (3.48, 3.0, 1.28), (2.2, 3.0, .75), 20, (.49, .60, 1.0), .7),
):
    light = bpy.data.objects.get(name)
    assert light and light.type == "LIGHT" and light.data.type == "AREA", name
    assert abs(light.data.energy - energy) < .001 and abs(light.data.size - size) < .001, name
    assert light.data.shape == "DISK" and (Vector(light.data.color) - Vector(color)).length < .001, name
    assert (light.location - Vector(location)).length < .001, name
    actual_direction = light.rotation_euler.to_quaternion() @ Vector((0, 0, -1))
    assert (actual_direction - (Vector(target) - Vector(location)).normalized()).length < .001, name
for name in ("hang_0", "hang_1", "hang_2", "bench_lamp"):
    assert (Vector(bpy.data.objects[name].data.color) - Vector((1, .52, .20))).length < .001, name
for name, y in (("kliniu", 3.78), ("lorigine", 2.96), ("4ustudio-academy", 2.14), ("drokex", 1.32)):
    light = bpy.data.objects[f"gallery_light_{name}"]
    assert light.data.type == "AREA" and light.data.shape == "DISK"
    assert abs(light.data.energy - 18) < .001 and abs(light.data.size - .22) < .001
    assert (Vector(light.data.color) - Vector((1, .45, .18))).length < .001
    assert (light.location - Vector((3.72, y, 2.53))).length < .001
    direction = light.rotation_euler.to_quaternion() @ Vector((0, 0, -1))
    assert (direction - (Vector((3.95, y, 2.0)) - light.location).normalized()).length < .001
floor = bpy.data.materials["floor"].node_tree.nodes.get("Principled BSDF")
assert not floor.inputs["Roughness"].is_linked
assert abs(floor.inputs["Roughness"].default_value - .53) < .001
assert bpy.data.objects.get("room_haze") is not None

if "--apply" in sys.argv:
    count = len(bpy.data.objects)
    try:
        apply_lighting(scene)
    except RuntimeError:
        pass
    else:
        raise AssertionError("Repeated application must be rejected")
    assert len(bpy.data.objects) == count
    assert abs(bpy.data.objects["hang_0"].data.energy - 72) < .001

print("VISUAL1_LIGHTING_OK")
