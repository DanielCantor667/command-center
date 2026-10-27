"""Phase B: bake and export the workshop-lab prototype for the web (specs/workshop-lab.md).

Run after prototype_workshop_room_v2.py has saved the scene:
  /Applications/Blender.app/Contents/MacOS/Blender --background blender/scenes/workshop-room-proto-v2.blend \
    --python-exit-code 1 --python blender/bake_workshop_lab.py -- [samples]

Each object gets a role (root["role"] from put(), otherwise by name/material):
  static      -> decimated, joined into two meshes (architecture / props), full Cycles lighting baked
                 into one 4k texture each (view transform applied, shown unlit on the web).
  dynamic     -> robots and cat, one GLB each with animation (drones are hidden during the bake).
  plant       -> decimated, one GLB, lit at runtime (alpha leaves do not bake well).
  emissive    -> neon/sky/glow pieces, one GLB with emissive materials (bloom on the web).
  interactive -> screens, plates, labels, whiteboard: not exported, rebuilt from data on the web;
                 their placements go to lab-anchors.json.
Raw GLBs land in ASSETS/build; compress_workshop_lab.sh writes the web copies.
"""
from __future__ import annotations

import json
import math
import sys
import time
from pathlib import Path

import bpy
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[1]
BUILD = Path("/Users/creativo/Documents/command-center-assets/build")
ARGV = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
SAMPLES = int(ARGV[0]) if ARGV else 256
BAKE_SIZE = {"architecture": 8192, "props": 4096}  # room shell gets 8k: its big flat surfaces show lightmap texel size most
INTERACTIVE = ("screen_", "label_", "plate_", "cat_", "whiteboard", "sign_", "zone_")
NOT_INTERACTIVE = ("plate_back_", "plate_led_")
STATIC_BUDGET = 5000  # triangles per imported static prop
STATIC_HERO_BUDGET = {"industrial_robot_arm": 20000}  # baked as static: 57 textures would weigh ~34 MB
PLANT_BUDGET = 9000
DYNAMIC_BUDGET = {"black_honey_-_robotic_arm": 22000}
ACTOR_FILES = {
    "black_honey_-_robotic_arm": "robot-cobot",
    "k07_drone": "drone-k07", "mech_drone": "drone-mech", "an_animated_cat": "cat",
    "robot-humanoid": "robot-humanoid", "robot-quad": "robot-quad", "robot-trilobite": "robot-trilobite",
}
# Movers are not baked into the light (their shadow would stay where they were placed)
DRONES = ("k07_drone", "mech_drone", "robot-humanoid", "robot-quad", "robot-trilobite")

sc = bpy.context.scene
BUILD.mkdir(parents=True, exist_ok=True)


def root_of(o):
    while o.parent:
        o = o.parent
    return o


def emits(o):
    for slot in o.material_slots:
        b = slot.material and slot.material.node_tree and slot.material.node_tree.nodes.get("Principled BSDF")
        if b and b.inputs["Emission Strength"].default_value > 0:
            return True
    return False


def role(o):
    r = root_of(o)
    if "role" in r:
        return r["role"]
    if o.name.startswith(INTERACTIVE) and not o.name.startswith(NOT_INTERACTIVE):
        return "interactive"
    if o.name.startswith(("bldg_", "bwin_", "window_sky", "door_sky")):
        return "emissive"  # night city lives outside the room box, which the architecture bake culls
    return "emissive" if emits(o) else "static"


def tris(o):
    return sum(len(p.vertices) - 2 for p in o.data.polygons)


def select(objs, active=None):
    bpy.ops.object.select_all(action="DESELECT")
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = active or (objs[0] if objs else None)


def realise(objs):
    """Single-user mesh data, curves converted, modifiers applied, parents cleared (world transform kept)."""
    select(objs)
    bpy.ops.object.make_single_user(object=True, obdata=True)
    curves = [o for o in objs if o.type == "CURVE"]
    if curves:
        select(curves)
        bpy.ops.object.convert(target="MESH")
    for o in objs:  # meshes allow 8 UV sets and some imports use all 8: keep the first, the bake adds its own
        for name in [layer.name for layer in o.data.uv_layers][1:]:
            o.data.uv_layers.remove(o.data.uv_layers[name])
    select(objs)  # convert() keeps the same objects, now meshes
    bpy.ops.object.parent_clear(type="CLEAR_KEEP_TRANSFORM")
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)  # vertices in world space
    return objs


def decimate(objs, budget):
    total = sum(tris(o) for o in objs)
    if total <= budget:
        return
    ratio = max(0.02, budget / total)
    for o in objs:
        if tris(o) < 60:
            continue
        mod = o.modifiers.new("decimate", "DECIMATE")
        mod.ratio = ratio
        select([o])
        bpy.ops.object.modifier_apply(modifier=mod.name)


def join(objs, name):
    select(objs)
    bpy.ops.object.join()
    o = bpy.context.view_layer.objects.active
    o.name = o.data.name = name
    return o


def cull_outside(o, lo, hi):
    """Drop faces whose centre lies outside the room box (wall exteriors, floor underside...): never seen,
    and they would waste lightmap space."""
    import bmesh
    bm = bmesh.new()
    bm.from_mesh(o.data)
    out = [f for f in bm.faces if any(not (lo[i] - 1e-3 <= f.calc_center_median()[i] <= hi[i] + 1e-3) for i in range(3))]
    bmesh.ops.delete(bm, geom=out, context="FACES")
    bm.to_mesh(o.data)
    bm.free()
    print(f"CULLED {len(out)} faces outside the room")


def bake_group(o, name):
    """Lightmap UVs + one Combined bake (all lights, bounces, emission) saved with the scene's view transform."""
    t0 = time.time()
    uvs = o.data.uv_layers
    if "UVMap" not in uvs:
        uvs.new(name="UVMap")
    uvs["UVMap"].active_render = True
    uvs.new(name="bake")
    assert "bake" in uvs, f"{name}: no room for the bake UV set"
    uvs.active = uvs["bake"]
    select([o])
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.uv.smart_project(angle_limit=math.radians(66), island_margin=0.0015)
    bpy.ops.uv.pack_islands(margin=0.0015, rotate=True, shape_method="AABB")
    bpy.ops.object.mode_set(mode="OBJECT")
    img = bpy.data.images.new(f"bake_{name}", BAKE_SIZE[name], BAKE_SIZE[name], float_buffer=True)
    for slot in o.material_slots:
        nt = slot.material.node_tree
        node = nt.nodes.new("ShaderNodeTexImage")
        node.image = img
        nt.nodes.active = node
    sc.cycles.bake_type = "COMBINED"
    sc.render.bake.margin = 8
    sc.render.bake.use_clear = True
    bpy.ops.object.bake(type="COMBINED")
    path = BUILD / f"lab-{name}.png"
    sc.render.image_settings.file_format = "PNG"
    sc.render.image_settings.color_depth = "8"
    img.save_render(str(path), scene=sc)
    print(f"BAKED {name}: {tris(o)} tris, {time.time() - t0:.0f}s -> {path}")
    # swap to a single baked material on the lightmap UV only
    baked = bpy.data.images.load(str(path))
    m = bpy.data.materials.new(f"lab_{name}")
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    tex = m.node_tree.nodes.new("ShaderNodeTexImage")
    tex.image = baked
    m.node_tree.links.new(tex.outputs["Color"], b.inputs["Base Color"])
    b.inputs["Roughness"].default_value = 1.0
    o.data.materials.clear()
    o.data.materials.append(m)
    # imports carry up to 8 UV sets; remove by name, removal invalidates other layer references
    for name in [layer.name for layer in o.data.uv_layers if layer.name != "bake"]:
        o.data.uv_layers.remove(o.data.uv_layers[name])
    o.data.uv_layers["bake"].active_render = True


def export(objs, path, animations=False):
    select(objs)
    # ACTIVE_ACTIONS: only each object's own clip; the default exports every action in the file
    bpy.ops.export_scene.gltf(filepath=str(path), export_format="GLB", use_selection=True,
                              export_animations=animations, export_animation_mode="ACTIVE_ACTIONS",
                              export_apply=True, export_yup=True)
    print("EXPORTED", path.name, round(path.stat().st_size / 1e6, 2), "MB")


def anchors(objs):
    """World placement of every interactive quad (centre, facing yaw in degrees, width, height)."""
    out = {}
    for o in objs:
        vs = [o.matrix_world @ v.co for v in o.data.vertices]
        c = sum(vs, Vector()) / len(vs)
        n = (o.matrix_world.to_3x3() @ o.data.polygons[0].normal).normalized()
        out[o.name] = {
            "centre": [round(c.x, 4), round(c.y, 4), round(c.z, 4)],
            "facing": round(math.degrees(math.atan2(n.y, n.x)), 2),
            "size": [round((vs[1] - vs[0]).length, 4), round((vs[3] - vs[0]).length, 4)],
        }
    return out


def main():
    groups = {"static": [], "dynamic": [], "plant": [], "emissive": [], "interactive": []}
    for o in bpy.data.objects:
        if o.type in ("MESH", "CURVE"):
            groups[role(o)].append(o)
    print({k: len(v) for k, v in groups.items()})

    sc.render.engine = "CYCLES"
    sc.cycles.samples = SAMPLES
    prefs = bpy.context.preferences.addons["cycles"].preferences
    prefs.compute_device_type = "METAL"
    prefs.get_devices()
    for dev in prefs.devices:
        dev.use = True
    sc.cycles.device = "GPU"
    out = sc.world.node_tree.nodes["World Output"]
    for link in list(out.inputs["Volume"].links):  # no haze in the bake
        sc.world.node_tree.links.remove(link)
    for o in groups["dynamic"]:
        if root_of(o).get("asset") in DRONES:
            o.hide_render = True

    # interactive placements first (before anything moves)
    (BUILD / "lab-anchors.json").write_text(json.dumps(anchors([o for o in groups["interactive"] if o.type == "MESH"]), indent=1))

    # static: authored architecture vs imported props
    arch = [o for o in groups["static"] if "role" not in root_of(o)]
    props_by_root = {}
    for o in groups["static"]:
        r = root_of(o)
        if "role" in r:
            props_by_root.setdefault(r.name, []).append(o)
    props = []
    for root_name, objs in props_by_root.items():
        budget = STATIC_HERO_BUDGET.get(bpy.data.objects[root_name].get("asset"), STATIC_BUDGET)
        objs = realise([o for o in objs if o.type in ("MESH", "CURVE")])
        decimate(objs, budget)
        props += objs
    arch = realise(arch)
    arch_obj = join(arch, "lab_architecture")
    cull_outside(arch_obj, (-3.0, -4.1, 0.0), (3.0, 4.9, 3.2))  # room interior
    props_obj = join(props, "lab_props")
    bake_group(arch_obj, "architecture")
    bake_group(props_obj, "props")
    export([arch_obj, props_obj], BUILD / "lab-baked.glb")

    emissive = realise(groups["emissive"])
    export(emissive, BUILD / "lab-emissive.glb")

    plants_by_root = {}
    for o in groups["plant"]:
        plants_by_root.setdefault(root_of(o).name, []).append(o)
    plants = []
    for objs in plants_by_root.values():
        objs = realise(objs)
        decimate(objs, PLANT_BUDGET)
        plants += objs
    export(plants, BUILD / "lab-plants.glb")

    for o in bpy.data.objects:
        o.hide_render = False
    for root in [o for o in bpy.data.objects if o.parent is None and o.get("role") == "dynamic"]:
        key = root.get("asset")
        members = [root] + list(root.children_recursive)
        meshes = [o for o in members if o.type == "MESH"]
        if key in DYNAMIC_BUDGET and not any(o.find_armature() for o in meshes):
            for o in meshes:
                select([o])
                bpy.ops.object.make_single_user(object=True, obdata=True)
            decimate(meshes, DYNAMIC_BUDGET[key])
        export(members, BUILD / f"{ACTOR_FILES[key]}.glb", animations=True)


main()
