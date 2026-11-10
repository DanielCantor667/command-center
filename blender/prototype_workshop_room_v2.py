"""Workshop robotics-lab prototype v2: closed room, realistic PBR props, animated robots + cat.

Run from any cwd:
  /Applications/Blender.app/Contents/MacOS/Blender --background --factory-startup \
    --python-exit-code 1 --python blender/prototype_workshop_room_v2.py -- out.png [main|bench|desk|back]

The Visual 2 scene is saved to a separate copy under ASSETS/lookdev/visual-2-2026-10-30/.
An existing output is never intentionally overwritten; move it aside before rerunning.

Blender coordinates (x right, y away from the camera, z up), metres. Pieces live outside the repo in
ASSETS: Poly Haven (CC0) and Sketchfab (CC BY, credit required -> CREDITS.md before shipping).
Every imported piece is measured after import and placed by its bottom/top, so source origins and
units do not matter (put()).
"""
from __future__ import annotations

import json
import math
import random
import sys
from pathlib import Path

import bpy
from mathutils import Matrix, Vector

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "blender"))
from lib.engineering_city import add_box, add_camera, add_cylinder, clear_scene, ensure_collection, srgb_hex  # noqa: E402

ASSETS = Path("/Users/creativo/Documents/command-center-assets")
PH = ASSETS / "polyhaven"
SK = ASSETS / "sketchfab"
QUAT = ASSETS / "scifi-essentials/flat"
KIT = ASSETS / "kits/desk"  # blender/prepare_desk_kit.py: metres, user side towards -X, origin bottom centre
OUT_BLEND = ASSETS / "lookdev/visual-2-2026-10-30/workshop-room-visual2.blend"


def assert_output_available():
    if OUT_BLEND.exists():
        raise FileExistsError(f"Refusing to overwrite existing scene: {OUT_BLEND}")


assert_output_available()  # Check before modifying the open scene or rendering.
RNG = random.Random(7)
W, D, H = 8.0, 11.0, 3.2
BY = 4.9  # back wall plane
FY = BY - D  # front wall plane: the front half holds the project booths, two per side of the aisle
CY = (BY + FY) / 2

clear_scene()
C = ensure_collection("WorkshopLab")
M: dict[str, bpy.types.Material] = {}


def mat(name, hex_, rough=0.6, metal=0.0, emit=None, strength=0.0, bump=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    b = nt.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = srgb_hex(hex_)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    if emit:
        b.inputs["Emission Color"].default_value = srgb_hex(emit)
        b.inputs["Emission Strength"].default_value = strength
    if bump:
        noise = nt.nodes.new("ShaderNodeTexNoise")
        noise.inputs["Scale"].default_value = 14
        noise.inputs["Detail"].default_value = 10
        bm = nt.nodes.new("ShaderNodeBump")
        bm.inputs["Strength"].default_value = bump
        nt.links.new(noise.outputs["Fac"], bm.inputs["Height"])
        nt.links.new(bm.outputs["Normal"], b.inputs["Normal"])
    M[name] = m
    return m


def mottled(name, c1, c2, rough, scale=3.0, bump=0.1):
    """Concrete / painted-metal look: noise-driven colour mix + bump, in object coordinates."""
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    b = nt.nodes["Principled BSDF"]
    coord = nt.nodes.new("ShaderNodeTexCoord")
    noise = nt.nodes.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = scale
    noise.inputs["Detail"].default_value = 12
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].color = srgb_hex(c1)
    ramp.color_ramp.elements[1].color = srgb_hex(c2)
    bump_n = nt.nodes.new("ShaderNodeBump")
    bump_n.inputs["Strength"].default_value = bump
    nt.links.new(coord.outputs["Object"], noise.inputs["Vector"])
    nt.links.new(noise.outputs["Fac"], ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], b.inputs["Base Color"])
    nt.links.new(noise.outputs["Fac"], bump_n.inputs["Height"])
    nt.links.new(bump_n.outputs["Normal"], b.inputs["Normal"])
    b.inputs["Roughness"].default_value = rough
    M[name] = m


TEX = ASSETS / "polyhaven-tex"
GEN = ASSETS / "generated"


def pbr(name, folder, tile, tint=(1, 1, 1), rough_mul=1.0, metal=0.0):
    """Poly Haven PBR set (diff/nor/rough/ao), box-projected in object space, `tile` metres per repeat."""
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    b = nt.nodes["Principled BSDF"]
    coord = nt.nodes.new("ShaderNodeTexCoord")
    mapping = nt.nodes.new("ShaderNodeMapping")
    mapping.inputs["Scale"].default_value = (1 / tile,) * 3
    nt.links.new(coord.outputs["Object"], mapping.inputs["Vector"])

    def tex(kind, colour=True):
        t = nt.nodes.new("ShaderNodeTexImage")
        t.image = bpy.data.images.load(str(TEX / folder / f"{kind}.jpg"))
        t.image.colorspace_settings.name = "sRGB" if colour else "Non-Color"
        t.projection, t.projection_blend = "BOX", 0.2
        nt.links.new(mapping.outputs["Vector"], t.inputs["Vector"])
        return t

    diff, ao, rough, nor = tex("diff"), tex("ao", False), tex("rough", False), tex("nor", False)
    mix = nt.nodes.new("ShaderNodeMix")
    mix.data_type, mix.blend_type = "RGBA", "MULTIPLY"
    mix.inputs["Factor"].default_value = 1.0
    nt.links.new(diff.outputs["Color"], mix.inputs["A"])
    nt.links.new(ao.outputs["Color"], mix.inputs["B"])
    tint_n = nt.nodes.new("ShaderNodeMix")
    tint_n.data_type, tint_n.blend_type = "RGBA", "MULTIPLY"
    tint_n.inputs["Factor"].default_value = 1.0
    tint_n.inputs["B"].default_value = (*tint, 1)
    nt.links.new(mix.outputs["Result"], tint_n.inputs["A"])
    nt.links.new(tint_n.outputs["Result"], b.inputs["Base Color"])
    rm = nt.nodes.new("ShaderNodeMath")
    rm.operation, rm.inputs[1].default_value = "MULTIPLY", rough_mul
    nt.links.new(rough.outputs["Color"], rm.inputs[0])
    nt.links.new(rm.outputs["Value"], b.inputs["Roughness"])
    nmap = nt.nodes.new("ShaderNodeNormalMap")
    nt.links.new(nor.outputs["Color"], nmap.inputs["Color"])
    nt.links.new(nmap.outputs["Normal"], b.inputs["Normal"])
    b.inputs["Metallic"].default_value = metal
    M[name] = m


def image_mat(name, path, emit=0.0):
    """Unlit-ish image surface for screens (emit>0) or printed plates (small emit for legibility)."""
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    b = nt.nodes["Principled BSDF"]
    t = nt.nodes.new("ShaderNodeTexImage")
    t.image = bpy.data.images.load(str(path))
    nt.links.new(t.outputs["Color"], b.inputs["Base Color"])
    b.inputs["Roughness"].default_value = 0.35
    if emit:
        nt.links.new(t.outputs["Color"], b.inputs["Emission Color"])
        b.inputs["Emission Strength"].default_value = emit
    return m


def quad(name, centre, facing_deg, w, h, material):
    """Vertical image quad whose front faces the yaw `facing_deg` (0 = +X); UVs read left-to-right."""
    a = math.radians(facing_deg)
    n = Vector((math.cos(a), math.sin(a), 0))
    r = (-n).cross(Vector((0, 0, 1)))
    c, up = Vector(centre), Vector((0, 0, 1))
    verts = [c - r * w / 2 - up * h / 2, c + r * w / 2 - up * h / 2, c + r * w / 2 + up * h / 2, c - r * w / 2 + up * h / 2]
    me = bpy.data.meshes.new(name)
    me.from_pydata(verts, [], [(0, 1, 2, 3)])
    uv = me.uv_layers.new()
    for loop, co in zip(me.loops, ((0, 0), (1, 0), (1, 1), (0, 1))):
        uv.data[loop.index].uv = co
    me.materials.append(material)
    o = bpy.data.objects.new(name, me)
    C.objects.link(o)
    return o


def hazard():
    """Yellow/black diagonal safety tape (procedural bands)."""
    m = bpy.data.materials.new("hazard")
    m.use_nodes = True
    nt = m.node_tree
    b = nt.nodes["Principled BSDF"]
    coord = nt.nodes.new("ShaderNodeTexCoord")
    wave = nt.nodes.new("ShaderNodeTexWave")
    wave.bands_direction = "DIAGONAL"
    wave.inputs["Scale"].default_value = 6
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.interpolation = "CONSTANT"
    ramp.color_ramp.elements[0].color = srgb_hex("#111111")
    ramp.color_ramp.elements[1].position = 0.5
    ramp.color_ramp.elements[1].color = srgb_hex("#e8b40c")
    nt.links.new(coord.outputs["Object"], wave.inputs["Vector"])
    nt.links.new(wave.outputs["Fac"], ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], b.inputs["Base Color"])
    b.inputs["Roughness"].default_value = 0.6
    M["hazard"] = m


def cable(name, points, radius=0.012):
    curve = bpy.data.curves.new(name, "CURVE")
    curve.dimensions, curve.bevel_depth, curve.bevel_resolution = "3D", radius, 3
    spline = curve.splines.new("NURBS")
    spline.points.add(len(points) - 1)
    for p, co in zip(spline.points, points):
        p.co = (*co, 1)
    spline.order_u, spline.use_endpoint_u = 3, True
    o = bpy.data.objects.new(name, curve)
    o.data.materials.append(M["black"])
    C.objects.link(o)
    return o


pbr("floor", "concrete_floor_worn_001", 2.4, tint=(0.55, 0.58, 0.6), rough_mul=0.9)
pbr("wall", "painted_plaster_wall", 2.0, tint=(0.36, 0.52, 0.54))
pbr("wall_low", "metal_plate_02", 1.2, tint=(0.35, 0.4, 0.42), metal=0.6)
hazard()
mat("ceiling", "#12191b", 0.9)
mat("trim", "#15191b", 0.5, 0.4)
mat("desk", "#2b343a", 0.45, 0.2)
mat("metal", "#5b656c", 0.35, 0.8)
mat("black", "#0a0c0e", 0.4, 0.2)
mat("cyan_glow", "#2fe6ff", 0.3, emit="#2fe6ff", strength=9)
mat("pink_glow", "#ff4fa3", 0.3, emit="#ff4fa3", strength=7)
mat("cyan_dim", "#2fe6ff", 0.3, emit="#2fe6ff", strength=0.8)  # PC tower window: a glow, not a white slab
mat("pink_dim", "#ff4fa3", 0.3, emit="#ff4fa3", strength=2.5)
mat("amber_glow", "#ffb347", 0.3, emit="#ffb347", strength=6)
mat("green_glow", "#46ff7a", 0.3, emit="#46ff7a", strength=5)
mat("white_glow", "#e8fbff", 0.3, emit="#e8fbff", strength=14)
mat("screen", "#5a2bd6", 0.2, emit="#7a4cff", strength=2.6)
mat("sky", "#0b4a58", 1.0, emit="#106d80", strength=2.2)
mat("building", "#04161b", 0.9)
mat("window_lit", "#ffd27a", 1.0, emit="#ffd27a", strength=5)
mat("peg", "#1a2326", 0.7, bump=0.03)
mat("bench_top", "#6a4a2a", 0.5, bump=0.05)


def box(name, loc, dims, m, rot=0.0, bevel=0.0):
    return add_box(name, loc, dims, C, M[m], None, math.radians(rot), bevel)


def put(path, loc, rot=0.0, scale=1.0, max_dim=None, anchor="bottom", role="static", skip_mats=(), tint=None):
    """Import a glTF, measure its evaluated bounds, then place centre-xy at loc.xy and bottom/top at loc.z.

    `role` (static | dynamic | plant) tells bake_workshop_lab.py what to bake vs export separately.
    `skip_mats` leaves effect meshes (e.g. jet flames) out of the measurement; `tint` darkens base colours.
    """
    before = set(bpy.data.objects)
    (bpy.ops.import_scene.fbx if Path(path).suffix.lower() == ".fbx" else bpy.ops.import_scene.gltf)(filepath=str(path))
    bpy.context.view_layer.update()
    new = [o for o in bpy.data.objects if o not in before]
    dg = bpy.context.evaluated_depsgraph_get()
    pts = []
    for o in new:
        if o.type == "MESH" and not any(s.material and s.material.name.startswith(skip_mats) for s in o.material_slots):
            e = o.evaluated_get(dg)
            me = e.to_mesh()
            pts += [e.matrix_world @ v.co for v in me.vertices]
            e.to_mesh_clear()
    mn = Vector([min(p[i] for p in pts) for i in range(3)])
    mx = Vector([max(p[i] for p in pts) for i in range(3)])
    s = (max_dim / max(mx - mn)) if max_dim else scale
    c = (mn + mx) / 2
    root = bpy.data.objects.new(path.stem + "_root", None)
    bpy.context.scene.collection.objects.link(root)
    root["role"] = role
    if tint:
        for o in new:
            for slot in o.material_slots:
                b = slot.material and slot.material.node_tree.nodes.get("Principled BSDF")
                if not b or slot.material.get("tinted"):
                    continue
                slot.material["tinted"] = True
                base = b.inputs["Base Color"]
                if base.is_linked:
                    nt = slot.material.node_tree
                    mul = nt.nodes.new("ShaderNodeMix")
                    mul.data_type, mul.blend_type = "RGBA", "MULTIPLY"
                    mul.inputs["Factor"].default_value = 1.0
                    mul.inputs["B"].default_value = (tint, tint, tint, 1)
                    nt.links.new(base.links[0].from_socket, mul.inputs["A"])
                    nt.links.new(mul.outputs["Result"], base)
                else:
                    c = base.default_value
                    base.default_value = (c[0] * tint, c[1] * tint, c[2] * tint, 1)
    for o in new:
        if o.parent is None:
            o.parent = root
    r = Matrix.Rotation(math.radians(rot), 3, "Z")
    base = (mn.z if anchor == "bottom" else mx.z)
    xy = r @ Vector((c.x * s, c.y * s, 0))
    root.rotation_euler[2] = math.radians(rot)
    root.scale = (s, s, s)
    root.location = (loc[0] - xy.x, loc[1] - xy.y, loc[2] - base * s)
    return root


PLANTS = ("potted_plant", "pachira", "anthurium", "calathea", "fern")


def ph(name, loc, rot=0.0, scale=1.0, max_dim=None, anchor="bottom"):
    role = "plant" if name.startswith(PLANTS) else "static"
    return put(PH / name / f"{name}.gltf", loc, rot, scale, max_dim, anchor, role)


def sk(name, loc, rot=0.0, max_dim=1.0, anchor="bottom", skip_mats=(), role="dynamic"):
    root = put(SK / name / "model.glb", loc, rot, 1.0, max_dim, anchor, role, skip_mats)
    root["asset"] = name  # every Sketchfab file is model.glb; the bake names exports by folder
    return root


# --- architecture ------------------------------------------------------------------------------
box("floor", (0, CY, -0.05), (W, D, 0.1), "floor")
box("ceiling", (0, CY, H + 0.05), (W, D, 0.1), "ceiling")
for side, sx in (("L", -W / 2 - 0.05), ("R", W / 2 + 0.05)):
    box(f"wall_{side}", (sx, CY, H / 2), (0.1, D, H), "wall")
    box(f"wainscot_{side}", (sx - math.copysign(0.01, sx), CY, 0.55), (0.1, D, 1.1), "wall_low")
# front wall: closes the room behind the camera, with the entry door
box("wall_F", (0, FY - 0.05, H / 2), (W, 0.1, H), "wall")
box("wainscot_F", (0, FY + 0.02, 0.5), (W, 0.04, 1.0), "wall_low")
box("baseboard_F", (0, FY + 0.04, 0.07), (W, 0.03, 0.14), "trim")
box("door_F", (0.0, FY + 0.06, 1.05), (0.92, 0.05, 2.1), "desk", bevel=0.01)
box("door_F_frame", (0.0, FY + 0.045, 1.08), (1.04, 0.04, 2.18), "trim")
box("door_F_handle", (0.33, FY + 0.1, 1.0), (0.12, 0.03, 0.03), "metal")
box("exit_sign", (0.0, FY + 0.05, 2.35), (0.36, 0.04, 0.12), "green_glow")
box("wall_B_left", (-2.75, BY + 0.05, H / 2), (2.5, 0.1, H), "wall")
box("wall_B_mid", (0.0, BY + 0.05, H / 2), (1.0, 0.1, H), "wall")
box("wall_B_right", (3.0, BY + 0.05, H / 2), (2.0, 0.1, H), "wall")
box("wall_B_door_top", (-1.0, BY + 0.05, (2.1 + H) / 2), (1.0, 0.1, H - 2.1), "wall")
box("wall_B_win_top", (1.25, BY + 0.05, (2.4 + H) / 2), (1.5, 0.1, H - 2.4), "wall")
box("wall_B_win_bot", (1.25, BY + 0.05, 0.5), (1.5, 0.1, 1.0), "wall")
box("wainscot_B", (0, BY - 0.02, 0.5), (W, 0.04, 1.0), "wall_low")
box("baseboard_B", (0, BY - 0.04, 0.07), (W, 0.03, 0.14), "trim")
for i in range(-5, 5):  # ceiling beams
    box(f"beam_{i}", (0, 0.4 + i * 1.1, H - 0.1), (W, 0.18, 0.2), "trim")

box("window_sky", (1.25, BY + 1.3, 1.7), (3.0, 0.02, 2.4), "sky")
box("door_sky", (-1.0, BY + 1.3, 1.05), (2.0, 0.02, 2.4), "sky")
for i in range(11):
    bx, bh, bw = RNG.uniform(-1.6, 2.2), RNG.uniform(0.8, 2.3), RNG.uniform(0.18, 0.42)
    box(f"bldg_{i}", (bx, BY + 0.55 + RNG.uniform(0, 0.5), bh / 2 + 0.3), (bw, 0.2, bh), "building")
    for j in range(RNG.randint(2, 6)):
        box(f"bwin_{i}_{j}", (bx + RNG.uniform(-bw / 3, bw / 3), BY + 0.44, 0.5 + RNG.uniform(0, bh)),
            (0.045, 0.01, 0.06), "window_lit" if RNG.random() > 0.35 else "cyan_glow")
for k, (fx, fy, fw, fh) in enumerate([(1.25, 1.7, 1.54, 1.44), (-1.0, 1.05, 1.04, 2.14)]):
    box(f"frame_t{k}", (fx, BY - 0.02, fy + fh / 2), (fw, 0.08, 0.05), "trim")
    box(f"frame_l{k}", (fx - fw / 2, BY - 0.02, fy), (0.05, 0.08, fh), "trim")
    box(f"frame_r{k}", (fx + fw / 2, BY - 0.02, fy), (0.05, 0.08, fh), "trim")
for i in range(9):
    box(f"blind_{i}", (1.25, BY - 0.06, 2.38 - i * 0.055), (1.46, 0.015, 0.03), "metal")

# --- left wall: tool wall + robot bench -------------------------------------------------------
LX = -W / 2
box("pegboard", (LX + 0.04, 2.0, 1.85), (0.04, 3.2, 1.5), "peg")
for i in range(16):  # pegboard holes read as a grid of dots
    for j in range(7):
        box(f"hole_{i}_{j}", (LX + 0.065, 0.55 + i * 0.2, 1.2 + j * 0.2), (0.005, 0.02, 0.02), "black")
for k, (name, yy, zz) in enumerate((("pliers", 0.6, 2.35), ("pipe_wrench", 0.95, 2.3), ("ratchet_wrench", 1.3, 2.35),
                                    ("screwdrivers_02", 0.65, 1.75), ("pliers", 1.0, 1.7), ("pipe_wrench", 1.35, 1.75))):
    ph(name, (LX + 0.09, yy, zz), rot=90, max_dim=0.34, anchor="top")

# technology wall: one plate per technology, one row per category (data: generate_lab_textures.py)
LAYOUT = json.loads((GEN / "layout.json").read_text())
PITCH, PLATE, TOP, FIRST_Y = 0.19, 0.165, 2.45, 1.95
for row, cat in enumerate(LAYOUT["categories"]):
    z = TOP - row * PITCH
    quad(f"cat_{cat}", (LX + 0.07, FIRST_Y - 0.26, z), 0, 0.3, 0.056, image_mat(f"m_cat_{cat}", GEN / "tech" / f"cat_{cat}.png", 1.2))
for t in LAYOUT["tech"]:
    y, z = FIRST_Y + t["col"] * PITCH, TOP - t["row"] * PITCH
    box(f"plate_back_{t['file']}", (LX + 0.075, y, z), (0.012, PLATE + 0.012, PLATE + 0.012), "black")
    quad(f"plate_{t['file']}", (LX + 0.083, y, z), 0, PLATE, PLATE, image_mat(f"m_{t['file']}", GEN / "tech" / t["file"], 0.6))
    box(f"plate_led_{t['file']}", (LX + 0.084, y + PLATE / 2 - 0.012, z + PLATE / 2 - 0.012), (0.004, 0.012, 0.012), "cyan_glow")
box("bench_top", (LX + 0.4, 1.9, 0.9), (0.75, 3.0, 0.07), "bench_top", bevel=0.01)
for yy in (0.5, 3.3):
    for xx in (LX + 0.1, LX + 0.7):
        box("bench_leg", (xx, yy, 0.43), (0.06, 0.06, 0.86), "metal")
box("bench_shelf", (LX + 0.4, 1.9, 0.3), (0.7, 2.9, 0.04), "metal")
# base kept clear of the wall: the arm sweeps 0.3 m past its base (x) and 0.9 m towards the pegboard edge (y)
sk("black_honey_-_robotic_arm", (LX + 0.82, 1.5, 0.935), rot=35, max_dim=1.0)
ph("bench_vice_01", (LX + 0.3, 0.45, 0.935), rot=90, max_dim=0.28)
ph("retro_multimeter", (LX + 0.35, 2.6, 0.935), rot=70, max_dim=0.2)
ph("industrial_microscope", (LX + 0.4, 3.0, 0.935), rot=120, max_dim=0.42)
ph("circuit_board", (LX + 0.5, 2.3, 0.935), rot=15, max_dim=0.22)
ph("desk_lamp_arm_01", (LX + 0.2, 2.0, 0.935), rot=90, max_dim=0.6)
ph("metal_toolbox", (LX + 0.45, 0.9, 0.31), rot=90, max_dim=0.4)
ph("metal_tool_chest", (LX + 0.45, 2.1, 0.31), rot=90, max_dim=0.65)

# --- back-left corner: big yellow industrial arm inside a taped safety zone --------------------
sk("industrial_robot_arm", (-2.9, 3.95, 0), rot=-35, max_dim=2.2, role="static")  # baked: see bake_workshop_lab.py
for k, (cx, cy, w, d) in enumerate(((-2.9, 3.0, 1.9, 0.08), (-2.9, 4.75, 1.9, 0.08), (-3.85, 3.875, 0.08, 1.83), (-1.95, 3.875, 0.08, 1.83))):
    box(f"tape_{k}", (cx, cy, 0.002), (w, d, 0.004), "hazard")

# --- back wall right: steel shelves with parts -----------------------------------------------
ph("steel_frame_shelves_01", (3.3, BY - 0.35, 0), rot=180, max_dim=2.1)
ph("worn_metal_rack", (LX + 0.35, -0.2, 0), rot=90, max_dim=1.9)
ph("television_02", (3.45, BY - 0.3, 1.5), rot=190, max_dim=0.38)
ph("metal_toolbox", (3.15, BY - 0.3, 1.02), rot=170, max_dim=0.4)
ph("retro_multimeter", (3.5, BY - 0.3, 0.55), rot=200, max_dim=0.2)
put(QUAT / "Prop_Crate.gltf", (3.15, BY - 0.3, 0.06), rot=10, max_dim=0.42)
ph("boombox", (LX + 0.32, -0.2, 0.86), rot=80, max_dim=0.55)
ph("classic_laptop", (LX + 0.32, -0.1, 1.27), rot=95, max_dim=0.4)
put(QUAT / "Prop_Mug.gltf", (LX + 0.3, 0.2, 0.86), max_dim=0.12)
ph("potted_plant_02", (LX + 0.3, -0.35, 1.68), max_dim=0.35)
ph("pachira_aquatica_01", (0.75, BY - 0.45, 0), rot=30, max_dim=1.6)

# --- right wall: PC desk ---------------------------------------------------------------------
DX = W / 2 - 0.45
pbr("desk_oak", "oak_veneer_01", 1.2, tint=(0.8, 0.74, 0.68), rough_mul=0.85)
box("pc_desk_top", (DX, 3.0, 0.74), (0.8, 2.4, 0.05), "desk_oak", bevel=0.01)
for yy in (1.9, 4.1):
    for xx in (DX - 0.33, DX + 0.33):
        box("pc_leg", (xx, yy, 0.36), (0.05, 0.05, 0.72), "black")
# R.1 (specs/workshop-realism.md): real gaming setup from Sketchfab (CC BY, CREDITS.md), split by prepare_desk_kit.py
DESK_TOP = 0.765
contact_screen = image_mat("contact_screen", GEN / "contact-monitor-uv.png", 1.6)  # Playwright render of the web monitor HTML, flipped vertically for the kit UVs
monitor = put(KIT / "ultrawide.glb", (DX + 0.31, 3.0, DESK_TOP - 0.06))  # the clamp grips the back edge of the top
for o in monitor.children_recursive:
    for slot in getattr(o, "material_slots", []):
        if slot.material and slot.material.name.startswith("Monitor_Glow"):
            slot.material = contact_screen  # same content as the web's HTML screen, which covers it there
put(KIT / "keyboard.glb", (DX - 0.17, 3.0, DESK_TOP))
put(KIT / "mouse.glb", (DX - 0.13, 2.45, DESK_TOP))
for sy in (2.42, 3.58):
    put(KIT / "speaker.glb", (DX + 0.2, sy, DESK_TOP))
put(KIT / "tower.glb", (DX + 0.1, 3.97, DESK_TOP), rot=90)  # tempered-glass side towards the room
put(KIT / "chair.glb", (DX - 1.0, 3.0, 0))
ph("potted_plant_02", (W / 2 - 0.5, 1.2, 0), max_dim=0.8)
ph("metal_trash_can", (W / 2 - 0.45, 4.6, 0), max_dim=0.55)

# project wall: the projects without a corner (data: generate_lab_textures.py); the others have their screen in their corner
RX = W / 2 - 0.02
SW, SH = 0.62, 0.39
CORNER_PROJECTS = ("kliniu", "lorigine", "drokex", "4ustudio-academy")
wall_projects = [p for p in LAYOUT["projects"] if p["id"] not in CORNER_PROJECTS]
slots = [(1.7, 2.0), (2.4, 2.0), (3.1, 2.0)]
assert len(wall_projects) <= len(slots)
for (sy, sz), p in zip(slots, wall_projects):
    box(f"bezel_{p['id']}", (RX - 0.02, sy, sz), (0.04, SW + 0.05, SH + 0.05), "black", bevel=0.008)
    quad(f"screen_{p['id']}", (RX - 0.045, sy, sz), 180, SW, SH, image_mat(f"m_screen_{p['id']}", GEN / "projects" / f"{p['id']}.png", 1.8))
    quad(f"label_{p['id']}", (RX - 0.045, sy, sz - SH / 2 - 0.045), 180, 0.42, 0.065,
         image_mat(f"m_label_{p['id']}", GEN / "projects" / f"{p['id']}_label.png", 1.0))
    box(f"arm_{p['id']}", (RX - 0.01, sy, sz + SH / 2 + 0.05), (0.02, 0.03, 0.1), "metal")

# Visual 2: a distinct gallery; corner screens keep their original names and placements.
from visual2_gallery import apply as add_visual2_gallery  # noqa: E402
add_visual2_gallery(C, ROOT)

# Trayectoria: whiteboard mounted on the back wall between the door and the window
quad("whiteboard", (0.0, BY - 0.035, 1.55), 270, 0.92, 0.62, image_mat("m_whiteboard", GEN / "trayectoria.png", 0.25))
box("wb_frame", (0.0, BY - 0.02, 1.55), (0.96, 0.025, 0.66), "metal")
box("wb_tray", (0.0, BY - 0.06, 1.21), (0.8, 0.07, 0.025), "metal")

# --- repair table with the cat: left of the central aisle, long side along it ---------------
DESK_TOP = 0.67  # measured top of metal_office_desk at max_dim 1.7
TX, TY = -2.2, 1.35
ph("metal_office_desk", (TX, TY, 0), rot=90, max_dim=1.7)
put(QUAT / "Enemy_EyeDrone.gltf", (TX - 0.05, TY - 0.2, DESK_TOP), rot=200, max_dim=0.42)
ph("magnifying_glass_01", (TX + 0.15, TY + 0.25, DESK_TOP), rot=30, max_dim=0.25)
ph("circuit_board", (TX - 0.2, TY + 0.5, DESK_TOP), rot=-20, max_dim=0.22)
ph("vintage_spacecraft_instrument", (TX - 0.2, TY - 0.6, DESK_TOP), rot=160, max_dim=0.35)
sk("an_animated_cat", (TX + 0.1, TY + 0.5, DESK_TOP), rot=-160, max_dim=0.48)
sk("k07_drone", (0.95, 2.55, 1.75), rot=-20, max_dim=0.65)
sk("mech_drone", (1.75, 2.1, 1.35), rot=-90, max_dim=0.75, skip_mats=("Fire",))


def walker(path, name, loc, max_dim, clip):
    """A walking actor: its own clip is made the active action (imports activate the first one).
    The web moves it along a patrol route (`LAB_ACTORS[].patrol`); `loc` is the route's first point."""
    before = set(bpy.data.actions)
    root = put(path, loc, 0, 1.0, max_dim, "bottom", "dynamic")
    root["asset"] = name
    walk = next(a for a in bpy.data.actions if a not in before and a.name.rsplit(".", 1)[0].endswith(clip))  # a second import of the same file names its clips "Walk.001"
    for o in root.children_recursive:
        if o.type == "ARMATURE":
            o.animation_data.action = walk
        elif o.type == "MESH":  # the FBX import leaves materials at alpha 0 (invisible once exported)
            for slot in o.material_slots:
                slot.material.blend_method = "OPAQUE"
                node = slot.material.node_tree.nodes.get("Principled BSDF")
                if node:
                    node.inputs["Alpha"].default_value = 1.0
    return root


# Three CC0 walkers (Quaternius): routes live in lab.ts, first waypoint = Blender (x, -z of the three.js route)
walker(ASSETS / "animated-robot/FBX/Robot.fbx", "robot-humanoid", (-1.0, 0.3, 0), 1.1, "Robot_Walking")
walker(QUAT / "Enemy_QuadShell.gltf", "robot-quad", (-0.5, -0.5, 0), 0.75, "Walk")
walker(QUAT / "Enemy_Trilobite.gltf", "robot-trilobite", (2.3, 0.35, 0), 0.6, "Walk")
for k, pts in enumerate((
    [(DX + 0.1, 4.0, 0.75), (DX + 0.25, 4.1, 0.02), (2.4, 4.2, 0.01), (0.5, 3.4, 0.01), (TX + 0.6, TY + 0.6, 0.01), (TX + 0.35, TY + 0.5, 0.8)],
    [(LX + 0.45, 1.5, 0.93), (LX + 0.8, 1.6, 0.01), (TX - 0.7, 1.9, 0.01), (TX - 0.35, 1.8, 0.01), (TX - 0.3, 1.75, 0.8)],
    [(-2.9, 3.3, 0.3), (-2.3, 2.9, 0.01), (-0.2, 3.1, 0.01), (1.2, 3.6, 0.01), (DX - 0.2, 4.4, 0.01), (W / 2 - 0.05, 4.5, 0.3)],
)):
    cable(f"cable_{k}", pts)
ph("portable_welding_cart", (-0.9, 4.0, 0), rot=15, max_dim=1.0)
ph("potted_plant_01", (-1.55, 4.55, 0), max_dim=1.2)
ph("potted_plant_04", (-1.4, 0.1, 0), max_dim=0.7)
for i, (hx, hy) in enumerate(((TX, TY), (1.4, 2.2), (0.3, 3.4))):
    ph("hanging_industrial_lamp", (hx, hy, H - 0.02), max_dim=1.0, anchor="top")
ph("caged_hanging_light", (-3.0, 2.6, H - 0.02), max_dim=0.9, anchor="top")
ph("modular_pipes", (-3.4, 4.7, H - 0.5), rot=90, max_dim=2.0)

# --- front half: a 2.6 m booth per project on each side of the aisle ---------------------------
def drop_z(x, y, from_z):
    """Height of the first surface below (x, y, from_z): props rest on shelves/tables, never float."""
    bpy.context.view_layer.update()
    hit, loc, *_ = bpy.context.scene.ray_cast(bpy.context.evaluated_depsgraph_get(), (x, y, from_z), (0, 0, -1))
    return loc.z if hit else 0.0


def on(name, x, y, from_z, rot=0.0, max_dim=None):
    return ph(name, (x, y, drop_z(x, y, from_z)), rot, max_dim=max_dim)


PZ = 0.04  # booth platform height: props stand at z = PZ


def zone(project, x0, y0, x1, y1):
    """Floor footprint of a booth: not baked; the web turns it into the hit area and focus glow."""
    me = bpy.data.meshes.new(f"zone_{project}")
    me.from_pydata([(x0, y0, PZ + 0.01), (x1, y0, PZ + 0.01), (x1, y1, PZ + 0.01), (x0, y1, PZ + 0.01)], [], [(0, 1, 2, 3)])
    o = bpy.data.objects.new(f"zone_{project}", me)
    o.hide_render = True
    C.objects.link(o)


def sign(project, centre, facing):
    quad(f"sign_{project}", centre, facing, 0.84, 0.13, image_mat(f"m_sign_{project}", GEN / "projects" / f"{project}_label.png", 1.0))


CORNER_SCREEN_Z, CORNER_SIGN_Z = 2.1, 2.65
CW, CH = 0.8, 0.5


def corner_screen(project, wall, facing):
    """A project's screen on the wall of its booth, above the props (web anchor `screen_<id>`). `wall` is the wall face (x, y)."""
    nx, ny = math.cos(math.radians(facing)), math.sin(math.radians(facing))
    along_x = abs(nx) > 0.5  # the wall runs along y (side walls) or along x (front wall)
    size = (0.04, CW + 0.05, CH + 0.05) if along_x else (CW + 0.05, 0.04, CH + 0.05)
    box(f"bezel_{project}", (wall[0] + nx * 0.03, wall[1] + ny * 0.03, CORNER_SCREEN_Z), size, "black", bevel=0.008)
    quad(f"screen_{project}", (wall[0] + nx * 0.055, wall[1] + ny * 0.055, CORNER_SCREEN_Z), facing, CW, CH,
         image_mat(f"m_screen_{project}", GEN / "projects" / f"{project}.png", 1.8))


RW = W / 2
AISLE = 1.4  # booths run from the side wall to x = ±AISLE; the aisle between them stays clear
BOOTHS = {  # project: (side, y0, y1)
    "4ustudio-academy": (-1, -3.3, -0.7), "kliniu": (-1, FY + 0.1, -3.4),
    "lorigine": (1, -3.3, -0.7), "drokex": (1, FY + 0.1, -3.4),
}
mat("booth_floor", "#20292c", 0.75, bump=0.02)
for project, (side, y0, y1) in BOOTHS.items():
    x0, x1 = sorted((side * RW, side * AISLE))
    xc, yc = (x0 + x1) / 2, (y0 + y1) / 2
    box(f"booth_{project}", (xc, yc, PZ / 2), (x1 - x0, y1 - y0, PZ), "booth_floor")
    box(f"booth_edge_{project}", (side * (AISLE + 0.02), yc, PZ + 0.004), (0.03, y1 - y0 - 0.1, 0.008), "cyan_dim")
    zone(project, x0, y0, x1, y1)
    wall = (side * RW, yc)
    facing = 180 if side > 0 else 0
    corner_screen(project, wall, facing)
    sign(project, (side * (RW - 0.03), yc, CORNER_SIGN_Z), facing)
    # near the aisle edge: from the booth cameras the lamp stays clear of the sign on the wall
    ph("hanging_industrial_lamp", (side * 2.0, yc, H - 0.02), max_dim=1.0, anchor="top")
PART_L, PART_H = 1.4, 0.85  # wall-side partition between the two booths of a side; the aisle half stays open
for side in (-1, 1):
    xc = side * (RW - PART_L / 2)
    box(f"partition_{side}", (xc, -3.35, PART_H / 2), (PART_L, 0.08, PART_H), "wall_low")
    box(f"partition_cap_{side}", (xc, -3.35, PART_H + 0.015), (PART_L, 0.1, 0.03), "trim")


def sk_static(name, loc, rot, max_dim):
    if (SK / name / "model.glb").exists():  # downloaded by hand from Sketchfab (logged-in account)
        sk(name, loc, rot=rot, max_dim=max_dim, role="static")


# 4ustudio Academy (music school), left back: piano on the wall, drum kit, guitar, amp (Sketchfab CC BY, see CREDITS.md)
sk_static("black_piano", (-RW + 0.4, -2.0, PZ), 90, 1.5)
sk_static("tama_drum_kit", (-2.3, -1.25, PZ), 215, 1.3)
sk_static("guitar_amplifier", (-1.8, -2.9, PZ), 120, 0.5)
sk_static("acoustic_guitar", (-2.35, -2.95, PZ), 110, 0.95)
on("Ukulele_01", -RW + 0.35, -1.7, 2.0, rot=15, max_dim=0.55)

# Kliniu (B2B hygiene supplies + ERP), left front: a dispatch point. Wall dispensers (what Kliniu sells),
# a stocked rack, a packing counter with the ERP laptop, a cart with boxes ready to ship.
mat("plastic_white", "#e4e8e8", 0.35)
mat("plastic_grey", "#7b8487", 0.4)
KY = (FY + 0.1 - 3.4) / 2
for k, (yy, kind) in enumerate(((KY + 0.85, "dryer"), (KY + 0.4, "soap"), (KY - 0.05, "towel"), (KY - 0.5, "soap"))):
    if kind == "towel":
        box(f"dispenser_{k}", (LX + 0.07, yy, 1.35), (0.12, 0.3, 0.4), "plastic_white", bevel=0.02)
        box(f"dispenser_win_{k}", (LX + 0.135, yy, 1.4), (0.005, 0.14, 0.08), "plastic_grey")
        box(f"dispenser_slot_{k}", (LX + 0.12, yy, 1.16), (0.04, 0.2, 0.01), "black")
    elif kind == "soap":
        box(f"dispenser_{k}", (LX + 0.055, yy, 1.25), (0.1, 0.12, 0.22), "plastic_white", bevel=0.015)
        box(f"dispenser_btn_{k}", (LX + 0.11, yy, 1.2), (0.012, 0.08, 0.06), "plastic_grey")
    else:
        box(f"dispenser_{k}", (LX + 0.08, yy, 1.15), (0.15, 0.28, 0.24), "metal", bevel=0.03)
        box(f"dispenser_nozzle_{k}", (LX + 0.13, yy, 1.02), (0.06, 0.1, 0.02), "black")
ph("steel_frame_shelves_02", (-3.0, FY + 0.32, PZ), rot=0, max_dim=1.8)
for k, (name, xx, zz) in enumerate((("cardboard_box_01", -3.55, 1.7), ("cardboard_box_01", -3.05, 1.7), ("multi_cleaner_5_litre", -2.55, 1.7),
                                    ("bleach_bottle", -3.6, 1.15), ("multi_cleaner_5_litre", -3.2, 1.15), ("all_purpose_cleaner", -2.8, 1.15),
                                    ("multi_cleaner_bottle", -2.5, 1.15), ("cardboard_box_01", -3.4, 0.6), ("plastic_crate_01", -2.75, 0.6))):
    size = 0.4 if "box" in name or "crate" in name else 0.34 if "5_litre" in name else 0.26
    on(name, xx, FY + 0.32, zz, rot=k * 13, max_dim=size)
box("packing_counter", (-2.05, KY + 0.15, PZ + 0.45), (0.6, 1.3, 0.9), "desk", bevel=0.01)
box("packing_counter_top", (-2.05, KY + 0.15, PZ + 0.92), (0.66, 1.36, 0.04), "bench_top", bevel=0.005)
on("classic_laptop", -2.05, KY + 0.35, 1.5, rot=-80, max_dim=0.38)
on("cardboard_box_01", -2.05, KY - 0.25, 1.5, rot=8, max_dim=0.36)
on("multi_cleaner_bottle", -2.1, KY + 0.7, 1.5, rot=40, max_dim=0.24)
ph("industrial_storage_cart", (-3.2, -3.95, PZ), rot=0, max_dim=1.0)
on("cardboard_box_01", -3.3, -3.95, 1.5, rot=-6, max_dim=0.42)
on("plastic_crate_01", -3.05, -3.95, 1.5, rot=12, max_dim=0.38)
for k, (xx, yy, zz, rr) in enumerate(((-2.0, FY + 0.45, 0.0, 4), (-2.0, FY + 0.45, 0.45, -7), (-2.45, FY + 0.42, 0.0, 10))):
    on("cardboard_box_01", xx, yy, PZ + zz + 0.5, rot=rr, max_dim=0.45)  # outgoing order, stacked by the door
ph("WetFloorSign_01", (-1.6, -3.7, PZ), rot=110, max_dim=0.62)

# L'Origine (professional hair care), right back: barber chair, cabinet with bottles
ph("BarberShopChair_01", (2.55, -2.0, PZ), rot=-90, max_dim=1.05)
ph("vintage_cabinet_01", (RW - 0.25, -1.2, PZ), rot=90, max_dim=1.0)
on("chemistry_set", RW - 0.25, -1.1, 2.0, rot=80, max_dim=0.34)
on("ceramic_vase_01", RW - 0.25, -1.45, 2.0, max_dim=0.22)
on("brass_candleholders", RW - 0.3, -0.9, 2.0, rot=30, max_dim=0.22)
ph("standing_picture_frame_01", (RW - 0.2, -2.9, PZ), rot=-110, max_dim=0.3)
ph("potted_plant_02", (1.75, -3.0, PZ), max_dim=0.8)

# Drokex (international catalogue), right front: pallet of export boxes, crate, barrel, globe
PX, PY = 2.75, -5.0
for k in range(5):
    box(f"pallet_{k}", (PX, PY + (k - 2) * 0.22, PZ + 0.13), (1.0, 0.1, 0.025), "bench_top")
for k in range(3):
    box(f"pallet_block_{k}", (PX - 0.45 + k * 0.45, PY, PZ + 0.06), (0.1, 1.0, 0.12), "bench_top")
for k, (dx, dy, rr) in enumerate(((-0.25, -0.2, 5), (0.25, -0.18, -8), (0.0, 0.2, 12), (0.0, -0.18, 3))):
    on("cardboard_box_01", PX + dx, PY + dy, 1.5, rot=rr, max_dim=0.45)
ph("old_military_crate", (RW - 0.5, -4.0, PZ), rot=94, max_dim=0.85)
ph("Barrel_01", (RW - 0.4, FY + 0.5, PZ), max_dim=0.85)
sk_static("floor_globe", (1.95, FY + 0.6, PZ), 20, 0.9)

# --- wall decor / glow -----------------------------------------------------------------------
box("neon_L", (LX + 0.05, 2.0, 2.65), (0.02, 3.0, 0.03), "pink_glow")
box("neon_R", (W / 2 - 0.03, 1.2, 2.55), (0.02, 1.2, 0.03), "cyan_glow")
box("ceiling_strip", (0.0, 2.2, H - 0.22), (0.14, 1.8, 0.03), "white_glow")

# --- lights ------------------------------------------------------------------------------------
sc = bpy.context.scene


def light(kind, name, loc, target, colour, energy, size=0.5, spot=None, radius=None):
    d = bpy.data.lights.new(name, kind)
    d.energy, d.color = energy, colour
    if kind == "AREA":
        d.shape, d.size, d.size_y = "RECTANGLE", size, size
    elif kind == "SPOT":
        d.spot_size, d.spot_blend, d.shadow_soft_size = math.radians(spot or 50), 0.5, 0.05
    elif kind == "POINT" and radius:
        d.shadow_soft_size = radius
    o = bpy.data.objects.new(name, d)
    C.objects.link(o)
    o.location = loc
    if target:
        o.rotation_euler = (Vector(target) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
    return o


light("AREA", "window_cyan", (1.25, BY - 0.2, 1.8), (1.0, 1.0, 1.0), (0.2, 0.85, 1.0), 150, 1.4)
light("AREA", "door_cyan", (-1.0, BY - 0.2, 1.2), (-1.0, 1.0, 0.8), (0.2, 0.8, 1.0), 90, 0.9)
light("SPOT", "cone_cyan", (TX, TY + 0.15, H - 0.1), (TX, TY, 0.0), (0.35, 0.85, 1.0), 700, spot=40)
light("AREA", "ceiling_white", (0.0, 2.2, H - 0.25), (0.0, 2.2, 0.0), (0.85, 0.95, 1.0), 45, 0.5)
light("AREA", "monitor_purple", (DX - 0.2, 3.0, 1.1), (DX - 1.5, 3.0, 0.9), (0.5, 0.3, 1.0), 60, 0.9)
for i, (hx, hy) in enumerate(((TX, TY), (1.4, 2.2), (0.3, 3.4))):
    light("POINT", f"hang_{i}", (hx, hy, H - 1.0), None, (1.0, 0.72, 0.4), 90, radius=0.08)
light("POINT", "bench_lamp", (LX + 0.4, 2.0, 1.45), None, (1.0, 0.75, 0.45), 110, radius=0.06)
light("AREA", "pegboard_wash", (LX + 0.5, 2.0, 2.9), (LX, 2.0, 1.6), (1.0, 0.8, 0.6), 50, 1.0)
light("AREA", "fill_warm", (0.3, -1.0, 2.9), (0.0, 2.0, 0.5), (1.0, 0.75, 0.5), 12, 2.5)
for project, (side, y0, y1) in BOOTHS.items():  # one warm pool per booth, under its lamp
    light("POINT", f"booth_{project}", (side * 2.0, (y0 + y1) / 2, H - 1.0), None, (1.0, 0.72, 0.4), 200, radius=0.08)
light("AREA", "front_fill", (0.0, -2.0, 2.9), (0.0, -4.5, 0.5), (1.0, 0.8, 0.6), 45, 3.0)

# --- render ------------------------------------------------------------------------------------
cams = {
    "main": add_camera("cam_main", (0.3, -4.6, 1.6), (-0.2, 4.0, 1.15), 20, C),
    "bench": add_camera("cam_bench", (1.4, 0.3, 1.7), (-2.8, 2.2, 1.5), 24, C),
    "desk": add_camera("cam_desk", (-1.0, 0.4, 1.6), (2.6, 2.6, 1.6), 22, C),
    "back": add_camera("cam_back", (0.5, 0.8, 1.7), (0.3, 4.6, 1.2), 24, C),
    "front": add_camera("cam_front", (0.4, 1.0, 1.9), (0.0, -5.0, 0.6), 18, C),
    "academy": add_camera("cam_academy", (0.5, -1.0, 1.5), (-4.0, -2.0, 1.3), 18, C),
    "kliniu": add_camera("cam_kliniu", (0.5, -3.7, 1.5), (-4.0, -4.75, 1.2), 18, C),
}
sc.render.resolution_x, sc.render.resolution_y = 1600, 900
sc.render.engine = "CYCLES"
sc.cycles.samples = 96
sc.cycles.use_denoising = True
prefs = bpy.context.preferences.addons["cycles"].preferences
prefs.compute_device_type = "METAL"
prefs.get_devices()
for dev in prefs.devices:
    dev.use = True
sc.cycles.device = "GPU"
sc.view_settings.view_transform = "AgX"
sc.view_settings.exposure = -0.2
sc.world = bpy.data.worlds.new("w")
sc.world.use_nodes = True
sc.world.node_tree.nodes["Background"].inputs["Color"].default_value = srgb_hex("#05090b")
sc.world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.03
vol = sc.world.node_tree.nodes.new("ShaderNodeVolumeScatter")
vol.inputs["Density"].default_value = 0.012
vol.inputs["Color"].default_value = (0.6, 0.85, 1.0, 1)
sc.world.node_tree.links.new(vol.outputs["Volume"], sc.world.node_tree.nodes["World Output"].inputs["Volume"])

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
if argv:
    sc.camera = cams[argv[1] if len(argv) > 1 else "main"]
    if len(argv) > 2:  # optional width, 16:9 (poster renders)
        sc.render.resolution_x, sc.render.resolution_y = int(argv[2]), int(argv[2]) * 9 // 16
    sc.render.filepath = argv[0]
    bpy.ops.render.render(write_still=True)
OUT_BLEND.parent.mkdir(parents=True, exist_ok=True)
assert_output_available()  # Check again before Blender writes the file.
bpy.ops.wm.save_as_mainfile(filepath=str(OUT_BLEND))
