"""Phase B: bake and export the workshop-lab prototype for the web (specs/workshop-lab.md).

Run against a copy of the raw scene, with a new, explicit output directory:
  /Applications/Blender.app/Contents/MacOS/Blender --background /path/to/raw-copy.blend \
    --python-exit-code 1 --python blender/bake_workshop_lab.py -- 256 1 \
    --output /path/to/new-build --image-base /path/to/original-scene-directory

Use --preflight to validate and prepare the scene in memory without baking,
creating the output directory, saving the .blend, or exporting anything.

Each object gets a role (root["role"] from put(), otherwise by name/material):
  static      -> decimated, joined into two meshes (architecture / props), full Cycles lighting baked
                 into one 4k texture each (view transform applied, shown unlit on the web).
  dynamic     -> robots and cat, one GLB each with animation (drones are hidden during the bake).
  plant       -> decimated, one GLB, lit at runtime (alpha leaves do not bake well).
  emissive    -> neon/glow pieces, one GLB with emissive materials (bloom on the web).
  interactive -> screens, plates, labels, whiteboard: not exported, rebuilt from data on the web;
                 their placements go to lab-anchors.json.
The approved Visual 1 light and Visual 2 gallery are prepared before baking;
the city outside the window goes to a panorama for the web's sky sphere.
"""
from __future__ import annotations

import argparse
import json
import math
import sys
import time
from pathlib import Path

import bpy
import numpy as np
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[1]
BUILD = None
SAMPLES = 256
BAKE_SIZE = {"architecture": 8192, "props": 4096}
INTERACTIVE = ("screen_", "label_", "plate_", "cat_", "whiteboard", "sign_", "zone_")
NOT_INTERACTIVE = ("plate_back_", "plate_led_")
STATIC_BUDGET = 5000  # triangles per imported static prop
# Baked as static. The arm: 57 textures would weigh ~34 MB. The rest: the contact desk, seen from arm's length.
STATIC_HERO_BUDGET = {"industrial_robot_arm": 20000, "chair": 22000, "tower": 12000, "keyboard": 12000, "mouse": 5000, "ultrawide": 4000}
PLANT_BUDGET = 9000
DYNAMIC_BUDGET = {"black_honey_-_robotic_arm": 22000}
ACTOR_FILES = {
    "black_honey_-_robotic_arm": "robot-cobot",
    "k07_drone": "drone-k07", "mech_drone": "drone-mech", "an_animated_cat": "cat",
    "robot-humanoid": "robot-humanoid", "robot-quad": "robot-quad", "robot-trilobite": "robot-trilobite",
}
# Movers are not baked into the light (their shadow would stay where they were placed)
DRONES = ("k07_drone", "mech_drone", "robot-humanoid", "robot-quad", "robot-trilobite")

sys.path.insert(0, str(ROOT / "blender"))
from visual1_lighting import apply as apply_lighting  # noqa: E402
from visual2_gallery import EXHIBITS, OLD_SLOTS, apply as apply_gallery  # noqa: E402

# R.2b: the lightmap holds light only; the look up close comes from the materials' own textures at these sizes.
DETAIL_TILED, DETAIL_PROP = 1024, 512
UV_MARGIN = {"architecture": 0.0006, "props": 0.00015}  # a texel or two per island
MEANS = {}
GLOW_KIT = ("tower_root", "keyboard_root", "mouse_root", "speaker_root")
GLOW_MAX = 1.6  # the kit goes up to 10: on the web that would turn the keyboard into one bloom blob

sc = bpy.context.scene


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


def glows(material):
    b = material and material.node_tree and material.node_tree.nodes.get("Principled BSDF")
    if not b or b.inputs["Emission Strength"].default_value <= 0:
        return False
    color = b.inputs["Emission Color"]
    return color.is_linked or any(channel > 0 for channel in color.default_value[:3])


def split_glow():
    """The RGB of the desk kit: a lightmap texel cannot hold it, so those faces leave the bake for the emissive GLB."""
    for root in [o for o in bpy.data.objects if o.name.startswith(GLOW_KIT)]:
        for o in [child for child in root.children_recursive if child.type == "MESH"]:
            select([o])
            bpy.ops.object.make_single_user(object=True, obdata=True)
            before = set(bpy.data.objects)
            bpy.ops.object.mode_set(mode="EDIT")
            bpy.ops.mesh.select_all(action="DESELECT")
            for index, slot in enumerate(o.material_slots):
                if glows(slot.material):
                    o.active_material_index = index
                    bpy.ops.object.material_slot_select()
                    node = slot.material.node_tree.nodes["Principled BSDF"].inputs["Emission Strength"]
                    node.default_value = min(node.default_value, GLOW_MAX)
            if o.data.total_face_sel:
                bpy.ops.mesh.separate(type="SELECTED")
            bpy.ops.object.mode_set(mode="OBJECT")
            for part in set(bpy.data.objects) - before:
                part["glow"] = True


def role(o):
    if o.get("glow"):
        return "emissive"
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
        if o.data.uv_layers:
            o.data.uv_layers[0].name = "UVMap"  # join() matches UV sets by name
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


def source_image(socket):
    """The first image feeding a socket, through multiplies and tints."""
    pending = [link.from_node for link in socket.links]
    while pending:
        node = pending.pop(0)  # breadth first and in input order: a multiply's A is the albedo, its B the AO
        if node.type == "TEX_IMAGE" and node.image:
            return node
        pending += [link.from_node for i in node.inputs for link in i.links]
    return None


def display_mean(image):
    """Mean colour as stored (display-referred for sRGB images), read from a small copy."""
    if image.name not in MEANS:
        small = image.copy()
        small.scale(8, 8)
        px = np.empty(8 * 8 * 4, np.float32)
        small.pixels.foreach_get(px)
        MEANS[image.name] = np.maximum(px.reshape(-1, 4)[:, :3].mean(0), 0.02)
        bpy.data.images.remove(small)
    return MEANS[image.name]


def mean_colour(socket):
    """Linear mean of a Base Color chain: the flat albedo the light is baked on."""
    if not socket.is_linked:
        return np.array(socket.default_value[:3], np.float32)
    node = socket.links[0].from_node
    if node.type == "TEX_IMAGE" and node.image:
        return display_mean(node.image) ** 2.2
    if node.type == "MIX" and node.blend_type == "MULTIPLY":
        return mean_colour(node.inputs["A"]) * mean_colour(node.inputs["B"])
    inputs = [i for i in node.inputs if i.type == "RGBA"]
    return mean_colour(inputs[0]) if inputs else np.array((0.5, 0.5, 0.5), np.float32)


def detail_image(image, size):
    """Albedo over its own mean, halved so 0.5 is neutral: the web multiplies the lightmap by it."""
    key = f"detail_{image.name}"
    if key in bpy.data.images:
        return bpy.data.images[key]
    mean = display_mean(image)
    detail = image.copy()
    detail.name = key
    detail.scale(min(size, image.size[0]), min(size, image.size[1]))
    px = np.empty(detail.size[0] * detail.size[1] * 4, np.float32)
    detail.pixels.foreach_get(px)
    px = px.reshape(-1, 4)
    px[:, :3] = np.clip(px[:, :3] / mean / 2, 0, 1)
    px[:, 3] = 1
    detail.pixels.foreach_set(px.ravel())
    detail.update()
    detail.pack()
    return detail


def box_uv(o, slots):
    """World-metre box projection for the materials the prototype projects in object space (`slots`: slot -> tile)."""
    layer = o.data.uv_layers["UVMap"]
    for poly in o.data.polygons:
        tile = slots.get(poly.material_index)
        if not tile:
            continue
        axis = max(range(3), key=lambda i: abs(poly.normal[i]))
        u, v = [i for i in range(3) if i != axis]
        for index in poly.loop_indices:
            co = o.data.vertices[o.data.loops[index].vertex_index].co
            layer.uv[index].vector = (co[u] / tile, co[v] / tile)


def prepare_materials(objs):
    """Every static material becomes a flat-albedo copy for the bake (so the lightmap only holds light) and remembers
    its texture for the web. Slots sharing an image share one material: fewer draw calls."""
    plans = {}
    for o in objs:
        uvs = o.data.uv_layers
        if "UVMap" not in uvs:
            uvs.new(name="UVMap")
        tiles = {}
        for index, slot in enumerate(o.material_slots):
            m = slot.material
            b = m and m.use_nodes and m.node_tree.nodes.get("Principled BSDF")
            if not b:
                continue
            base = source_image(b.inputs["Base Color"])
            mapping = next((n for n in m.node_tree.nodes if n.type == "MAPPING"), None)
            if mapping:
                tiles[index] = 1 / mapping.inputs["Scale"].default_value[0]
            key = (base.image.name if base else f"flat_{m.name}", bool(mapping))
            plan = plans.get(key)
            if not plan:
                flat = m.copy()
                flat_b = flat.node_tree.nodes["Principled BSDF"]
                colour = mean_colour(b.inputs["Base Color"])
                for name in ("Base Color", "Normal"):
                    for link in list(flat_b.inputs[name].links):
                        flat.node_tree.links.remove(link)
                flat_b.inputs["Base Color"].default_value = (*colour, 1)
                roughness = b.inputs["Roughness"]
                normal = source_image(b.inputs["Normal"]) if mapping else None
                plan = plans[key] = {"flat": flat, "image": base and base.image, "tiled": bool(mapping), "normal": normal and normal.image,
                                     "roughness": 0.55 if roughness.is_linked else roughness.default_value, "metal": min(b.inputs["Metallic"].default_value, 1)}
            slot.material = plan["flat"]
        box_uv(o, tiles)
    return list(plans.values())


def final_material(name, plan, baked):
    """What the web gets: lightmap on the `bake` UVs; detail and normal on the object's own UVs (three reads the channels)."""
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    b = nt.nodes["Principled BSDF"]

    def image(picture, uv):
        node = nt.nodes.new("ShaderNodeTexImage")
        node.image = picture
        coords = nt.nodes.new("ShaderNodeUVMap")
        coords.uv_map = uv
        nt.links.new(coords.outputs["UV"], node.inputs["Vector"])
        return node

    nt.links.new(image(baked, "bake").outputs["Color"], b.inputs["Base Color"])
    b.inputs["Roughness"].default_value, b.inputs["Metallic"].default_value = plan["roughness"], plan["metal"]
    if plan["image"]:
        detail = image(detail_image(plan["image"], DETAIL_TILED if plan["tiled"] else DETAIL_PROP), "UVMap")
        nt.links.new(detail.outputs["Color"], b.inputs["Emission Color"])
        b.inputs["Emission Strength"].default_value = 1
    if plan["normal"]:
        small = plan["normal"].copy()
        small.scale(DETAIL_TILED, DETAIL_TILED)
        small.pack()
        normal = image(small, "UVMap")
        small.colorspace_settings.name = "Non-Color"
        map_node = nt.nodes.new("ShaderNodeNormalMap")
        map_node.uv_map = "UVMap"
        nt.links.new(normal.outputs["Color"], map_node.inputs["Color"])
        nt.links.new(map_node.outputs["Normal"], b.inputs["Normal"])
    return m


def bake_group(o, name, plans):
    """Lightmap UVs + one Combined bake over flat albedo, saved with the scene's view transform."""
    t0 = time.time()
    uvs = o.data.uv_layers
    uvs.new(name="bake")
    assert "bake" in uvs, f"{name}: no room for the bake UV set"
    uvs.active = uvs["bake"]
    select([o])
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    # The margins are shares of the whole atlas: 0.0015 per island left the props with islands of a few texels.
    bpy.ops.uv.smart_project(angle_limit=math.radians(66), island_margin=0.0)
    bpy.ops.uv.pack_islands(margin=UV_MARGIN[name], rotate=True, shape_method="AABB")
    bpy.ops.object.mode_set(mode="OBJECT")
    img = bpy.data.images.new(f"bake_{name}", BAKE_SIZE[name], BAKE_SIZE[name], float_buffer=True)
    for slot in o.material_slots:
        nt = slot.material.node_tree
        node = nt.nodes.new("ShaderNodeTexImage")
        node.image = img
        nt.nodes.active = node
    sc.cycles.bake_type = "COMBINED"
    sc.render.bake.margin = 3
    sc.render.bake.use_clear = True
    bpy.ops.object.bake(type="COMBINED")
    path = BUILD / f"lab-{name}.png"
    sc.render.image_settings.file_format = "PNG"
    sc.render.image_settings.color_depth = "8"
    img.save_render(str(path), scene=sc)
    print(f"BAKED {name}: {tris(o)} tris, {len(o.material_slots)} materials, {time.time() - t0:.0f}s -> {path}")
    baked = bpy.data.images.load(str(path))
    finals = {plan["flat"].name: plan for plan in plans}
    for index, slot in enumerate(o.material_slots):
        if slot.material.name in finals:
            slot.material = final_material(f"lab_{name}_{index}", finals[slot.material.name], baked)
    keep = {"UVMap", "bake"}  # imports carry up to 8 UV sets; removal invalidates other layer references
    for layer in [layer.name for layer in o.data.uv_layers if layer.name not in keep]:
        o.data.uv_layers.remove(o.data.uv_layers[layer])
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


def monitor_anchor():
    """The ultrawide's screen as a flat quad at the front of its curve; the HTML monitor sits there on the web."""
    points = [o.matrix_world @ v.co for o in bpy.data.objects if o.type == "MESH" and any(s.material and s.material.name == "contact_screen" for s in o.material_slots)
              for v in o.data.vertices if any(s.material and s.material.name == "contact_screen" for s in [o.material_slots[p.material_index] for p in o.data.polygons if v.index in p.vertices])]
    lo = Vector([min(p[i] for p in points) for i in range(3)])
    hi = Vector([max(p[i] for p in points) for i in range(3)])
    return {"centre": [round(lo.x - 0.003, 4), round((lo.y + hi.y) / 2, 4), round((lo.z + hi.z) / 2, 4)], "facing": 180.0, "size": [round(hi.y - lo.y, 4), round(hi.z - lo.z, 4)]}


def night_sky():
    """The HDRI as the room's window sees it, equirectangular with +Y (the window) at the image centre."""
    hidden = [o for o in bpy.data.objects if not o.hide_render]
    for o in hidden:
        o.hide_render = True
    data = bpy.data.cameras.new("sky")
    data.type, data.panorama_type = "PANO", "EQUIRECTANGULAR"
    cam = bpy.data.objects.new("cam_sky", data)
    sc.collection.objects.link(cam)
    cam.rotation_euler = (math.pi / 2, 0, 0)
    sc.camera = cam
    sc.cycles.samples = 16
    sc.render.resolution_x, sc.render.resolution_y, sc.render.resolution_percentage = 4096, 2048, 100
    sc.render.image_settings.file_format = "PNG"
    sc.render.filepath = str(BUILD / "night-sky.png")
    bpy.ops.render.render(write_still=True)
    for o in hidden:
        o.hide_render = False
    bpy.data.objects.remove(cam)


def restore_image_paths(image_base):
    """Resolve external images from their authored directory when a .blend has been copied."""
    if not image_base.is_dir():
        raise NotADirectoryError(f"Image base directory does not exist: {image_base}")
    images = []
    for image in bpy.data.images:
        if image.source != "FILE" or image.packed_file or not image.filepath:
            continue
        value = image.filepath[2:] if image.filepath.startswith("//") else image.filepath
        path = Path(value).expanduser()
        if not path.is_absolute():
            path = image_base / path
        path = path.resolve()
        if not path.is_file():
            raise FileNotFoundError(f"Missing image {image.name}: {path}")
        images.append((image, path))
    for image, path in images:
        image.filepath = str(path)
        image.reload()
    print(f"Preflight: {len(images)} external image paths resolved", flush=True)


def ensure_gallery():
    """Add the gallery only to a raw scene; reject partial or misplaced galleries."""
    names = ["gallery_lamp_rail"]
    for project, _, _ in EXHIBITS:
        names.extend(f"{prefix}{project}" for prefix in (
            "screen_gallery_", "label_gallery_", "gallery_frame_", "gallery_lamp_body_",
            "gallery_lamp_face_", "gallery_light_",
        ))
    present = [name for name in names if bpy.data.objects.get(name)]
    if present and len(present) != len(names):
        missing = [name for name in names if not bpy.data.objects.get(name)]
        raise RuntimeError(f"Gallery is incomplete; missing: {', '.join(missing)}")
    if not present:
        collection = bpy.data.collections.get("WorkshopLab")
        if collection is None:
            raise RuntimeError("Missing WorkshopLab collection")
        apply_gallery(collection, ROOT)
    bpy.context.view_layer.update()
    for project, _, y in EXHIBITS:
        if not bpy.data.objects.get(f"screen_{project}"):
            raise RuntimeError(f"Missing original corner screen: {project}")
        screen = bpy.data.objects[f"screen_gallery_{project}"]
        if screen.type != "MESH" or len(screen.data.vertices) != 4 or not screen.data.polygons:
            raise RuntimeError(f"Invalid gallery screen: {project}")
        centre = sum((screen.matrix_world @ vertex.co for vertex in screen.data.vertices), Vector()) / 4
        normal = (screen.matrix_world.to_3x3() @ screen.data.polygons[0].normal).normalized()
        if (centre - Vector((3.922, y, 2.03))).length > .001 or (normal - Vector((-1, 0, 0))).length > .001:
            raise RuntimeError(f"Gallery screen is misplaced: {project}")
    for project, _, x in OLD_SLOTS:
        for prefix in ("label_", "bezel_", "arm_"):
            if not bpy.data.objects.get(prefix + project):
                raise RuntimeError(f"Missing relocated object: {prefix + project}")
        screen = bpy.data.objects.get(f"screen_{project}")
        if not screen or screen.type != "MESH" or len(screen.data.vertices) != 4 or not screen.data.polygons:
            raise RuntimeError(f"Missing relocated screen: {project}")
        centre = sum((screen.matrix_world @ vertex.co for vertex in screen.data.vertices), Vector()) / 4
        normal = (screen.matrix_world.to_3x3() @ screen.data.polygons[0].normal).normalized()
        if (centre - Vector((x, -6.035, 2.70))).length > .001 or (normal - Vector((0, 1, 0))).length > .001:
            raise RuntimeError(f"Relocated screen is misplaced: {project}")
    print("Preflight: gallery complete and positioned", flush=True)


def parse_options(argv):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("samples", nargs="?", type=int, default=256)
    parser.add_argument("size_scale", nargs="?", type=int, default=1)
    parser.add_argument("--output", type=Path, required=True, help="New isolated output directory")
    parser.add_argument("--image-base", type=Path, default=ROOT / "blender/scenes", help="Authored base for relative image paths")
    parser.add_argument("--preflight", action="store_true", help="Prepare in memory only; do not create output")
    options = parser.parse_args(argv)
    if options.samples < 1 or not 1 <= options.size_scale <= 4096:
        parser.error("samples must be positive and size_scale must be between 1 and 4096")
    if not options.output.is_absolute():
        parser.error("--output must be an absolute path to a new directory")
    if options.output.exists() or options.output.is_symlink():
        raise FileExistsError(f"Refusing existing output: {options.output}")
    options.output = options.output.resolve()
    if options.output.is_relative_to(ROOT):
        raise ValueError("Output must be outside the project repository")
    options.image_base = options.image_base.expanduser().resolve()
    return options


def main():
    global BUILD, SAMPLES, BAKE_SIZE
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    options = parse_options(argv)
    if not bpy.data.filepath:
        raise RuntimeError("Open a copy of the raw .blend before running the bake")
    if Path(bpy.data.filepath).resolve() == (ROOT / "blender/scenes/workshop-room-proto-v2.blend").resolve():
        raise RuntimeError("Open a copy of the raw .blend, not the original scene")
    restore_image_paths(options.image_base)
    ensure_gallery()
    apply_lighting(sc)
    if options.preflight:
        print("VISUAL3_BAKE_PREFLIGHT_OK (no bake, save or export)", flush=True)
        return
    BUILD = options.output
    BUILD.mkdir(parents=True, exist_ok=False)
    SAMPLES = options.samples
    BAKE_SIZE = {"architecture": 8192 // options.size_scale, "props": 4096 // options.size_scale}
    bpy.data.objects.remove(bpy.data.objects["room_haze"])  # no volumes in the bake
    night_sky()
    for o in [o for o in bpy.data.objects if o.name.startswith(("bldg_", "bwin_", "window_sky", "door_sky"))]:
        bpy.data.objects.remove(o)  # the sky sphere replaces the box skyline on the web
    split_glow()
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
    placements = anchors([o for o in groups["interactive"] if o.type == "MESH"])
    placements["screen_contact"] = monitor_anchor()
    (BUILD / "lab-anchors.json").write_text(json.dumps(placements, indent=1))

    # static: authored architecture vs imported props
    arch = [o for o in groups["static"] if "role" not in root_of(o)]
    props_by_root = {}
    for o in groups["static"]:
        r = root_of(o)
        if "role" in r:
            props_by_root.setdefault(r.name, []).append(o)
    props = []
    for root_name, objs in props_by_root.items():
        budget = STATIC_HERO_BUDGET.get(bpy.data.objects[root_name].get("asset") or root_name.split("_root")[0], STATIC_BUDGET)
        objs = realise([o for o in objs if o.type in ("MESH", "CURVE")])
        decimate(objs, budget)
        props += objs
    arch = realise(arch)
    arch_plans, prop_plans = prepare_materials(arch), prepare_materials(props)
    arch_obj = join(arch, "lab_architecture")
    cull_outside(arch_obj, (-4.0, -6.1, 0.0), (4.0, 4.9, 3.2))  # room interior (prototype W, D, H)
    props_obj = join(props, "lab_props")
    bake_group(arch_obj, "architecture", arch_plans)
    bake_group(props_obj, "props", prop_plans)
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


if __name__ == "__main__":
    main()
