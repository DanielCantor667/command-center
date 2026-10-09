"""First-party Workshop Game master scene (Sprint 7 / Phase 7.2).

Run from any cwd:
  /Applications/Blender.app/Contents/MacOS/Blender --background --factory-startup \
    --python-exit-code 1 --python blender/generate_workshop_game.py
Append ``-- --render`` to render the two previews after saving/exporting.

Dimensions in authoring functions are metres in Three.js coordinates: x right,
y up, z towards the entrance. bpy/glTF perform the explicit (x, -z, y) map.
The .blend retains individually editable kit pieces. Export copies are batched
by semantic layer/material; source geometry and previous assets are preserved.
No third-party resources are downloaded. Textures are deterministic own pixels.
"""
from __future__ import annotations

import hashlib
import json
import math
import random
import struct
import sys
import zlib
from collections import defaultdict
from pathlib import Path

import bpy
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "blender"))
from lib.engineering_city import (add_box, apply_bevel, clear_scene,
                                  ensure_collection, link_to_collection, srgb_hex)

ASSETS = ROOT / "docs/product/workshop-game-assets"
TEXTURES = ASSETS / "textures"
MODELS = ROOT / "apps/web/public/models/workshop-game"
MASTER = ROOT / "blender/scenes/workshop-game-v1.blend"
RNG = random.Random(72)
M = {}
C = None
SEMANTIC = "architecture"


def pos(xyz):
    return (xyz[0], -xyz[2], xyz[1])


def size(xyz):
    return (xyz[0], xyz[2], xyz[1])


def png(path, width, height, pixel):
    """Write RGB PNG without an external image dependency."""
    def chunk(kind, data):
        return struct.pack(">I", len(data)) + kind + data + struct.pack(">I", zlib.crc32(kind + data) & 0xffffffff)
    data = bytearray()
    for y in range(height):
        data.append(0)
        for x in range(width):
            data.extend(max(0, min(255, round(v))) for v in pixel(x, y))
    raw = b"\x89PNG\r\n\x1a\n"
    raw += chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0))
    raw += chunk(b"IDAT", zlib.compress(bytes(data), 9)) + chunk(b"IEND", b"")
    path.write_bytes(raw)


def textures():
    TEXTURES.mkdir(parents=True, exist_ok=True)
    noise = random.Random(720)
    def concrete(x, y):
        cloud = 2.5 * math.sin(x / 22) * math.sin(y / 31) + 1.8 * math.cos(x / 7 + y / 9)
        n = cloud + noise.gauss(0, 1.8)
        if noise.random() < .015:
            n -= 10
        return (215 + n, 216 + n, 207 + n)
    def wood(x, y):
        grain = 5 * math.sin(x * .8 + 4 * math.sin(y / 49))
        grain += 2.5 * math.sin(x * 1.8 + 2 * math.sin(y / 25)) + noise.gauss(0, 1.5)
        knot = 8 * math.sin(math.hypot((x - 240) * 1.5, (y - 300) * .42) * .5)
        grain += knot * math.exp(-((x - 240) ** 2 / 1800 + (y - 300) ** 2 / 14000))
        return (159 + grain, 126 + grain * .78, 90 + grain * .5)
    def plaster(x, y):
        n = noise.gauss(0, .85) + 1.4 * math.sin(x / 13) * math.cos(y / 17)
        return (231 + n, 226 + n, 212 + n)
    def normal(dx, dy):
        length = math.sqrt(dx * dx + dy * dy + 1)
        return ((1 - dx / length) * 127.5, (1 - dy / length) * 127.5,
                (1 + 1 / length) * 127.5)
    def concrete_normal(x, y):
        dx = .035 * .7 * math.cos(x * .7) * math.cos(y * .67)
        dy = -.035 * .67 * math.sin(x * .7) * math.sin(y * .67)
        return normal(dx, dy)
    def oak_normal(x, y):
        x, y = x * 2, y * 2
        phase = x * .8 + 4 * math.sin(y / 49)
        dx = (5 * .8 * math.cos(phase) + 2.5 * 1.8 * math.cos(x * 1.8 + 2 * math.sin(y / 25))) * .025
        dy = 5 * math.cos(phase) * 4 / 49 * math.cos(y / 49) * .025
        return normal(dx, dy)
    png(TEXTURES / "concrete-own-512.png", 512, 512, concrete)
    png(TEXTURES / "oak-own-512.png", 512, 512, wood)
    png(TEXTURES / "plaster-own-256.png", 256, 256, plaster)
    png(TEXTURES / "concrete-normal-own-256.png", 256, 256, concrete_normal)
    png(TEXTURES / "oak-normal-own-256.png", 256, 256, oak_normal)


def material(name, color, roughness=.75, metal=0, texture=None, emission=None, alpha=1, normal=None):
    mat = bpy.data.materials.new("WG_" + name)
    mat.use_nodes = True
    rgba = srgb_hex(color)
    mat.diffuse_color = (*rgba[:3], alpha)
    node = mat.node_tree.nodes.get("Principled BSDF")
    node.inputs["Base Color"].default_value = (*rgba[:3], alpha)
    node.inputs["Metallic"].default_value = metal
    node.inputs["Roughness"].default_value = roughness
    node.inputs["Alpha"].default_value = alpha
    if emission:
        node.inputs["Emission Color"].default_value = srgb_hex(emission)
        node.inputs["Emission Strength"].default_value = 1.2
    if texture:
        image = bpy.data.images.load(str(TEXTURES / texture), check_existing=True)
        image.pack()
        tex = mat.node_tree.nodes.new("ShaderNodeTexImage")
        tex.image = image
        mat.node_tree.links.new(tex.outputs["Color"], node.inputs["Base Color"])
    if normal:
        image = bpy.data.images.load(str(TEXTURES / normal), check_existing=True)
        image.colorspace_settings.name = "Non-Color"
        image.pack()
        tex = mat.node_tree.nodes.new("ShaderNodeTexImage")
        tex.image = image
        bump = mat.node_tree.nodes.new("ShaderNodeNormalMap")
        bump.inputs["Strength"].default_value = .65
        mat.node_tree.links.new(tex.outputs["Color"], bump.inputs["Color"])
        mat.node_tree.links.new(bump.outputs["Normal"], node.inputs["Normal"])
    if alpha < 1:
        # Compatible alpha blend; transmission is deliberately not required.
        mat.surface_render_method = "DITHERED"
        mat.use_transparency_overlap = False
        mat.use_backface_culling = False
    M[name] = mat
    return mat


def uv_world(obj, tile=2):
    """Box projection at a fixed physical scale, valid for Blender and glTF."""
    uv = obj.data.uv_layers.active or obj.data.uv_layers.new(name="UVMap")
    for face in obj.data.polygons:
        normal = face.normal
        axis = max(range(3), key=lambda i: abs(normal[i]))
        axes = (1, 2) if axis == 0 else ((0, 2) if axis == 1 else (0, 1))
        for loop_id in face.loop_indices:
            v = obj.data.vertices[obj.data.loops[loop_id].vertex_index].co
            uv.data[loop_id].uv = (v[axes[0]] / tile, v[axes[1]] / tile)


def tag(obj, name, mat, bevel=0, smooth=False):
    obj.name = name
    link_to_collection(obj, C)
    obj["semantic"] = SEMANTIC
    obj.data.materials.append(M[mat])
    if bevel:
        apply_bevel(obj, bevel, 2 if bevel >= .025 else 1)
    uv_world(obj, .65 if mat == "oak" else 2)
    if smooth:
        for face in obj.data.polygons:
            face.use_smooth = True
    return obj


def box(name, xyz, dims, mat="concrete", bevel=.012):
    obj = add_box(name, pos(xyz), size(dims), C, None, bevel=bevel)
    return tag(obj, name, mat)


def cylinder(name, xyz, radius, height, mat="greensteel", vertices=16, top=None):
    if top is None:
        bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=height, location=pos(xyz))
    else:
        bpy.ops.mesh.primitive_cone_add(vertices=vertices, radius1=radius, radius2=top, depth=height, location=pos(xyz))
    return tag(bpy.context.object, name, mat, .006, True)


def rod(name, a, b, radius=.02, mat="greensteel", vertices=10):
    start, end = Vector(pos(a)), Vector(pos(b))
    obj = cylinder(name, (0, 0, 0), radius, (end - start).length, mat, vertices)
    obj.location = (start + end) / 2
    obj.rotation_euler = (end - start).to_track_quat("Z", "Y").to_euler()
    return obj


def text(name, body, xyz, height, mat="graphite"):
    curve = bpy.data.curves.new(name, "FONT")
    curve.body = body
    curve.align_x = "CENTER"
    curve.size = height
    curve.extrude = .001
    curve.resolution_u = 4
    obj = bpy.data.objects.new(name, curve)
    C.objects.link(obj)
    obj.location = pos(xyz)
    # Text faces the entrance (+Three Z == -Blender Y).
    obj.rotation_euler = (math.pi / 2, 0, 0)
    curve.materials.append(M[mat])
    obj["semantic"] = SEMANTIC
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.convert(target="MESH")
    return bpy.context.object


def plant(name, xyz, height=1.7, canopy=.62):
    x, y, z = xyz
    cylinder(name + " / ceramic pot", (x, y + .24, z), .28, .48, "ceramic", 18, .35)
    cylinder(name + " / soil", (x, y + .47, z), .32, .015, "soil", 18)
    rod(name + " / trunk", (x, y + .47, z), (x + .02, y + height - .1, z), .035, "oak", 8)
    verts, faces, mat_indices = [], [], []
    for branch in range(6):
        angle = branch * math.tau / 6
        dy = .55 + branch * .13
        end = (x + math.cos(angle) * canopy * .65, y + dy + .36, z + math.sin(angle) * canopy * .65)
        rod(name + " / branch", (x, y + dy, z), end, .011, "oak", 6)
    for i in range(230):
        angle = RNG.random() * math.tau
        r = math.sqrt(RNG.random()) * canopy
        cy = y + height - .26 + RNG.uniform(-.40, .34)
        c = Vector(pos((x + math.cos(angle) * r, cy, z + math.sin(angle) * r)))
        direction = Vector((math.cos(angle), math.sin(angle), RNG.uniform(-1.4, 1.4))).normalized()
        side = direction.cross(Vector((0, 0, 1))).normalized()
        length = RNG.uniform(.10, .20)
        width = length * .35
        n = len(verts)
        verts.extend([c - direction * length, c + side * width,
                      c + direction * length, c - side * width,
                      c + Vector((0, 0, length * .12))])
        faces.extend([(n, n + 1, n + 4), (n + 1, n + 2, n + 4),
                      (n + 2, n + 3, n + 4), (n + 3, n, n + 4)])
        mat_indices.extend([i % 3 == 0] * 4)
    mesh = bpy.data.meshes.new(name + " / individual leaves")
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name + " / foliage", mesh)
    C.objects.link(obj)
    obj["semantic"] = SEMANTIC
    mesh.materials.append(M["leaf"])
    mesh.materials.append(M["leaflight"])
    for poly, idx in zip(mesh.polygons, mat_indices):
        poly.material_index = idx
    uv_world(obj)


def shell():
    global C, SEMANTIC
    C = ensure_collection("Kit / Shell & windows")
    SEMANTIC = "architecture"
    box("Outdoor apron", (0, -.12, 11.8), (27, .22, 13), "concrete", .03)
    box("Workshop concrete slab", (0, -.10, -1), (19.2, .20, 18), "concrete", .025)
    for x in [-8, -4, 0, 4, 8]:
        box("Concrete expansion joint", (x, .003, -1), (.012, .004, 18), "soil", 0)
    for z in [-7, -3, 1, 5]:
        box("Concrete expansion joint", (0, .003, z), (19.2, .004, .012), "soil", 0)
    box("Rear plaster wall", (0, 2.8, -10), (19.5, 5.6, .32), "plaster", .02)
    for x in [-9.6, 9.6]:
        box("Window sill base", (x, .55, -1), (.32, 1.1, 18), "concrete", .02)
        box("Upper side lintel", (x, 5.25, -1), (.32, .7, 18), "concrete", .02)
        for z in [-9.7, -5.3, -.9, 3.5, 7.9]:
            box("Side concrete pier", (x, 2.8, z), (.38, 5.6, .3), "concrete", .018)
        for z in [-7.5, -3.1, 1.3, 5.7]:
            box("Frosted industrial window", (x, 3.05, z), (.03, 3.85, 4.0), "glass", 0)
            for dz in [-2.0, -1.0, 0, 1.0, 2.0]:
                box("Window steel mullion", (x, 3.05, z + dz), (.09, 3.92, .045), "greensteel", .003)
            for y in [1.12, 2.40, 3.68, 4.97]:
                box("Window steel transom", (x, y, z), (.09, .045, 4.06), "greensteel", .003)
    for x in [-6.9, 6.9]:
        box("Entrance concrete jamb", (x, 2.8, 8), (5.4, 5.6, .4), "concrete", .028)
    box("Entrance lintel", (0, 5.15, 8), (19.5, .9, .4), "concrete", .025)
    box("Sliding door overhead rail", (0, 4.53, 8.25), (18.4, .16, .18), "greensteel", .015)
    for x in [-4.18, 4.18]:
        box("Entry steel portal", (x, 2.23, 8.03), (.18, 4.46, .25), "greensteel", .01)
    box("Entry fixed right leaf", (1.8, 2.15, 8.08), (3.6, 4.3, .14), "greensteel", .014)
    for x in [-3.89, 3.89]:
        box("Entry fixed lateral closure", (x, 2.15, 8.08), (.58, 4.3, .14), "greensteel", .014)
    box("Entrance brass physical sign", (-6.05, 3.45, 8.235), (2.6, .82, .065), "brass", .025)
    box("Entrance sign inset", (-6.05, 3.45, 8.274), (2.46, .69, .018), "graphite", .015)
    text("Workshop sign lettering", "Taller", (-6.05, 3.29, 8.29), .37, "brass")
    for x in [-8.7, -3.9, 3.9, 8.7]:
        box("Tall steel column", (x, 2.74, -5.92), (.16, 5.48, .16), "greensteel", .012)
        box("Column bolted foot", (x, .07, -5.92), (.36, .10, .36), "greensteel", .012)
    # Shallow pitched roof, open middle skylight and exposed trusses.
    for x in [-6.1, 6.1]:
        slab = box("Pitched opaque roof wing", (x, 5.66, -1), (7.0, .09, 18.0), "plaster", .008)
        slab.rotation_euler[1] = -.035 if x < 0 else .035
    box("Roof skylight glazing", (0, 5.84, -1), (5.1, .026, 18), "glass", 0)
    for z in [-9.5, -5.0, -.5, 4.0, 7.7]:
        rod("Roof truss lower tie", (-9.5, 5.28, z), (9.5, 5.28, z), .048)
        rod("Roof truss left chord", (-9.5, 5.28, z), (0, 5.85, z), .055)
        rod("Roof truss right chord", (0, 5.85, z), (9.5, 5.28, z), .055)
        for x in [-7.1, -4.7, -2.3, 0, 2.3, 4.7, 7.1]:
            rod("Roof truss vertical web", (x, 5.3, z), (x, 5.85 - abs(x) * .06, z), .022)
    for x in [-9.4, -6.0, -2.55, 0, 2.55, 6.0, 9.4]:
        box("Roof longitudinal purlin", (x, 5.67, -1), (.075, .095, 18), "greensteel", .004)
    for z in [-8.5, -6.5, -4.5, -2.5, -.5, 1.5, 3.5, 5.5, 7.5]:
        box("Skylight narrow mullion", (0, 5.87, z), (5.1, .055, .048), "greensteel", .003)


def mezzanine():
    global C
    C = ensure_collection("Kit / Mezzanine & stairs")
    box("Mezzanine concrete plate", (0, 3.10, -7.93), (18.5, .24, 3.65), "concrete", .025)
    box("Mezzanine front steel beam", (0, 2.93, -6.11), (18.55, .25, .17), "greensteel", .014)
    for y in [3.36, 3.75, 4.25]:
        rod("Mezzanine continuous balustrade", (-9.1, y, -6.10), (7.55, y, -6.10), .026)
    for x in [-9.1, -7.65, -6.2, -4.75, -3.3, -1.85, -.4, 1.05, 2.5, 3.95, 5.4, 6.85, 7.55]:
        rod("Mezzanine rail upright", (x, 3.20, -6.10), (x, 4.27, -6.10), .026)
    # A visual architectural stair only; circulation is still by approved points.
    for i in range(15):
        box("Stair oak tread", (8.35, .11 + i * .211, -3.4 - i * .235), (1.45, .075, .28), "oak", .012)
    for x in [7.60, 9.08]:
        rod("Stair stringer", (x, .03, -3.1), (x, 3.2, -7.0), .055)
        rod("Stair handrail", (x, 1.01, -3.1), (x, 4.17, -7.0), .028)
        for i in [0, 4, 8, 12]:
            rod("Stair rail post", (x, .18 + i * .211, -3.4 - i * .235), (x, 1.08 + i * .211, -3.4 - i * .235), .019)
    for x in [-7.9, -6.4, -4.9, 4.3, 5.8]:
        box("Loft shelf side", (x, 4.05, -9.49), (.05, 1.74, .44), "oak", .008)
    for x, width in [(-6.4, 3.1), (5.05, 1.55)]:
        for y in [3.3, 3.85, 4.4, 4.94]:
            box("Loft archive shelf", (x, y, -9.43), (width, .055, .5), "oak", .008)
        for i in range(13):
            px = x - width * .45 + i * width * .9 / 13
            for y in [3.56, 4.11, 4.66]:
                box("Loft archive book", (px, y, -9.43), (.10, RNG.uniform(.3, .4), .27), "paper" if i % 3 else "greensteel", .005)
    # Ordinary benches and planters add scale; no new rooms or project content.
    box("Loft working desk", (0, 3.91, -8.6), (3.15, .10, .80), "oak", .014)
    for x in [-1.30, 1.30]:
        box("Loft desk trestle", (x, 3.56, -8.6), (.10, .70, .65), "greensteel", .008)
    for x in [-8.6, 3.0]:
        plant("Loft planter", (x, 3.23, -8.9), 1.25, .40)


def workbench():
    global C, SEMANTIC
    C = ensure_collection("Kit / Workbench")
    SEMANTIC = "workbench"
    for i in range(8):
        box("Oak tabletop plank", (0, .925, -1.85 + i * .3), (5.0, .15, .292), "oak", .018)
    for x in [-2.16, 2.16]:
        for z in [-1.70, .10]:
            box("Bench solid timber leg", (x, .44, z), (.17, .84, .17), "oak", .015)
            box("Bench steel foot", (x, .055, z), (.21, .10, .21), "graphite", .014)
    for z in [-1.68, .12]:
        box("Bench apron rail", (0, .70, z), (4.65, .18, .08), "oak", .012)
        box("Bench apron steel bracket", (0, .72, z + .045), (4.52, .04, .035), "greensteel", .005)
    box("Bench bottom storage shelf", (0, .23, -.8), (4.58, .065, 1.70), "oak", .012)
    for x in [-1.6, -.55, .50, 1.55]:
        box("Bench storage crate", (x, .48, -.8), (.82, .40, .9), "paper", .012)
        box("Crate metal label", (x, .49, -.32), (.25, .10, .012), "brass", .004)
        for dx in [-.32, .32]:
            box("Storage crate edge slat", (x + dx, .48, -.32), (.075, .38, .018), "oak", .007)
    box("Rolled paper drawing", (1.55, 1.037, -.3), (.9, .02, .54), "paper", .005)
    for x in [1.25, 1.50, 1.77]:
        box("Architectural study miniature", (x, 1.15 + RNG.random() * .07, -1.45), (.27, .25, .32), "paper", .009)
    cylinder("Brass pencil cup", (1.98, 1.12, -.55), .08, .22, "brass", 16)
    for i in range(5):
        rod("Drawing pencil", (1.96 + i * .009, 1.12, -.55), (1.94 + i * .02, 1.36, -.56), .006, "graphite", 6)
    # Stool remains away from the approved hub/workbench/kliniu camera path.
    for x in [-3.3, 3.45]:
        cylinder("Workshop stool seat", (x, .66, -.8), .28, .065, "oak", 20)
        for angle in [0, math.tau / 3, 2 * math.tau / 3]:
            rod("Stool splayed steel leg", (x + .25 * math.cos(angle), .035, -.8 + .25 * math.sin(angle)), (x + .14 * math.cos(angle), .64, -.8 + .14 * math.sin(angle)), .023)
    SEMANTIC = "architecture"


def kliniu():
    global C, SEMANTIC
    C = ensure_collection("Kit / Existing Kliniu area")
    SEMANTIC = "kliniu"
    box("Kliniu existing teal backdrop", (-5.5, 1.45, -9.8), (6.6, 2.8, .09), "teal", .012)
    box("Kliniu controlled sign backing", (-5.5, 2.56, -8.43), (2.6, .56, .04), "teal", .012)
    text("Kliniu controlled physical lettering", "Kliniu", (-5.5, 2.41, -8.39), .42, "paper")
    box("Kliniu counter", (-5.1, .84, -5.4), (3.8, .12, 1.25), "oak", .017)
    for x in [-6.6, -3.6]:
        box("Kliniu counter support", (x, .40, -5.4), (.09, .79, 1.0), "greensteel", .009)
    for y in [.66, 1.47, 2.27]:
        box("Kliniu sample shelf", (-5.5, y, -9.1), (6.55, .07, 1.0), "oak", .013)
        box("Kliniu shelf warm strip", (-5.5, y - .055, -8.56), (6.45, .015, .022), "warm", .003)
    for x in [-8.6, -6.5, -4.4, -2.3]:
        box("Kliniu shelving steel upright", (x, 1.45, -9.12), (.05, 2.8, .85), "greensteel", .007)
    for j, y in enumerate([.93, 1.74, 2.54]):
        for i in range(8):
            x = -8.12 + i * .75
            box("Kliniu architectural catalogue sample", (x, y, -9.02), (.44, .44 if j < 2 else .32, .53), "paper", .01)
            for dx in [-.12, 0, .12]:
                box("Sample model upright fin", (x + dx, y, -8.74), (.025, .4 if j < 2 else .29, .028), "steel_light", .002)
    # Only the current Kliniu interaction, not a completed Phase 7.3 room.
    SEMANTIC = "kliniu_monitor"
    box("Kliniu monitor housing", (-5.1, 1.38, -5.58), (1.55, .84, .085), "graphite", .025)
    box("Kliniu monitor blank evidence plane", (-5.1, 1.38, -5.53), (1.43, .72, .016), "paper", .009)
    rod("Kliniu monitor stand", (-5.1, .90, -5.58), (-5.1, 1.13, -5.58), .038)
    box("Kliniu monitor foot", (-5.1, .905, -5.51), (.50, .025, .32), "graphite", .012)
    SEMANTIC = "architecture"


def lamp(x, z, y=3.78):
    rod("Pendant braided suspension", (x, y + .21, z), (x, 5.25, z), .012, "graphite", 8)
    cylinder("Pendant shade spun steel", (x, y + .12, z), .34, .26, "greensteel", 24, .13)
    cylinder("Pendant glowing diffuser", (x, y -.012, z), .305, .018, "warm", 24)
    cylinder("Pendant brass cap", (x, y + .26, z), .07, .075, "brass", 16)
    light("Pendant preview light", (x, y -.04, z), (x, .8, z), 65, 1.0, "#FFE5BA")


def scenery():
    global C
    C = ensure_collection("Kit / Lamps & plants & scenery")
    for x in [-2.0, 1.8]:
        lamp(x, -.7)
    for x in [-7.7, 5.9]:
        lamp(x, -4.9, 2.54)
    for x, z, h, w in [(-8.3, 6.8, 2.4, .8), (8.3, 5.5, 2.1, .7),
                        (-7.4, 10.4, 2.65, .85), (7.4, 10.7, 2.6, .85),
                        (-7.65, -3.55, 1.9, .63), (2.6, -6.6, 1.6, .54)]:
        plant("Workshop tree", (x, 0, z), h, w)
    box("Exterior timber bench", (-8.3, .48, 9.9), (2.1, .12, .50), "oak", .02)
    for x in [-9.05, -7.55]:
        box("Exterior bench concrete support", (x, .23, 9.9), (.20, .43, .40), "concrete", .015)
    # Right-hand tool cabinet/background is ordinary workshop scenery.
    box("Green rolling tool cabinet", (6.7, .57, -.3), (1.8, 1.02, .70), "greensteel", .025)
    box("Tool cabinet wooden top", (6.7, 1.13, -.3), (1.9, .09, .77), "oak", .018)
    for y in [.33, .57, .81]:
        box("Tool cabinet drawer reveal", (6.7, y, .061), (1.61, .018, .012), "graphite", 0)
        rod("Tool cabinet drawer handle", (6.48, y + .085, .075), (6.91, y + .085, .075), .013, "brass", 10)
    for x in [5.98, 7.42]:
        for z in [-.53, -.08]:
            cylinder("Tool cabinet caster", (x, .045, z), .055, .05, "graphite", 10)
    for y in [.65, 1.35, 2.05]:
        box("Workshop background storage shelf", (4.45, y, -9.40), (5.4, .065, .65), "oak", .009)
        for i in range(7):
            box("Workshop archive cardboard box", (2.15 + i * .74, y + .25, -9.43), (.55, .42, .45), "paper", .012)
    for x in [1.7, 7.2]:
        box("Workshop shelf steel upright", (x, 1.4, -9.44), (.06, 2.75, .69), "greensteel", .008)


def door():
    global C, SEMANTIC
    C = ensure_collection("Kit / EntryDoor local pivot")
    SEMANTIC = "door"
    box("EntryDoor steel panel", (0, 2.15, 0), (3.6, 4.3, .16), "greensteel", .015)
    for x in [-1.74, -1.16, -.58, 0, .58, 1.16, 1.74]:
        box("EntryDoor pressed vertical rib", (x, 2.15, .096), (.046, 4.19, .04), "greensteel", .006)
    for y in [.09, 4.21]:
        box("EntryDoor edge rail", (0, y, .103), (3.48, .10, .045), "greensteel", .005)
    rod("EntryDoor brass pull", (1.42, 1.35, .19), (1.42, 1.74, .19), .026, "brass", 12)
    for y in [1.35, 1.74]:
        rod("EntryDoor pull fixing", (1.42, y, .09), (1.42, y, .19), .016, "brass", 10)
    for x in [-1.45, 1.45]:
        cylinder("EntryDoor rail carriage", (x, 4.29, 0), .075, .055, "graphite", 12)
    # Source displays its final OPEN pose; exported copies restore local origin.
    for obj in C.objects:
        obj.location += Vector(pos((-7.4, 0, 8.05)))
    SEMANTIC = "architecture"


def import_miniature():
    global C
    C = ensure_collection("Kit / Reused Kliniu miniature")
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=str(ROOT / "apps/web/public/models/workshop/kliniu-interactive-v4.glb"))
    imported = [o for o in bpy.data.objects if o not in before]
    meshes = [o for o in imported if o.type == "MESH"]
    points = [o.matrix_world @ Vector(v) for o in meshes for v in o.bound_box]
    lo = Vector(tuple(min(v[i] for v in points) for i in range(3)))
    hi = Vector(tuple(max(v[i] for v in points) for i in range(3)))
    center = Vector(((lo.x + hi.x) / 2, (lo.y + hi.y) / 2, lo.z))
    # A small architectural study, similar to the prototype's 0.45 scale.
    scale = 1.05 / max(hi.x - lo.x, hi.y - lo.y)
    target = Vector(pos((-.86, 1.005, -.75)))
    for obj in meshes:
        world = obj.matrix_world.copy()
        obj.parent = None
        obj.matrix_world = world
        obj.location = (obj.location - center) * scale + target
        obj.scale *= scale
        link_to_collection(obj, C)
        obj.name = "Kliniu table miniature / " + obj.name
        obj["semantic"] = "workbench"
        mapping = {"stone": "paper", "white": "paper", "paper": "paper", "dark": "graphite",
                   "silver": "steel_light", "teal": "teal", "warm": "warm", "blue": "teal",
                   "steel": "greensteel", "chrome": "brass", "glass": "glass"}
        for slot in obj.material_slots:
            original = slot.material.name.lower()
            slot.material = M[next((dest for key, dest in mapping.items() if key in original), "paper")]
        # At tabletop scale details below a centimetre only inflate transfer.
        mod = obj.modifiers.new("Tabletop LOD", "DECIMATE")
        mod.ratio = .42
        bpy.context.view_layer.objects.active = obj
        bpy.ops.object.modifier_apply(modifier=mod.name)
    for obj in imported:
        if obj.type != "MESH":
            bpy.data.objects.remove(obj, do_unlink=True)


def light(name, xyz, target, energy, area, color):
    collection = ensure_collection("Preview / Compatible lighting reference")
    data = bpy.data.lights.new(name, "AREA")
    data.energy, data.shape, data.size, data.color = energy, "DISK", area, srgb_hex(color)[:3]
    obj = bpy.data.objects.new(name, data)
    collection.objects.link(obj)
    obj.location = pos(xyz)
    obj.rotation_euler = (Vector(pos(target)) - obj.location).to_track_quat("-Z", "Y").to_euler()
    return obj


def camera(name, xyz, target, lens=23):
    collection = ensure_collection("Preview / Cameras")
    data = bpy.data.cameras.new(name)
    data.lens = lens
    obj = bpy.data.objects.new(name, data)
    collection.objects.link(obj)
    obj.location = pos(xyz)
    obj.rotation_euler = (Vector(pos(target)) - obj.location).to_track_quat("-Z", "Y").to_euler()
    return obj


def preview_setup():
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.samples = 24
    scene.cycles.use_denoising = True
    scene.render.resolution_x, scene.render.resolution_y, scene.render.resolution_percentage = 1440, 810, 100
    scene.render.image_settings.file_format = "PNG"
    scene.world.use_nodes = True
    scene.world.node_tree.nodes["Background"].inputs["Color"].default_value = srgb_hex("#EEF1E9")
    scene.world.node_tree.nodes["Background"].inputs["Strength"].default_value = .5
    scene.view_settings.view_transform = "AgX"
    light("Skylight daylight", (0, 10, 1.4), (0, 0, -1), 2400, 10, "#FFF4DB")
    light("Window daylight", (-11, 6.6, 5), (-3, 1, -2), 1800, 8, "#F7EBD0")
    light("Entrance softbox", (1, 7, 14), (0, 1, -1), 2100, 8, "#F3F2EA")
    sun = bpy.data.lights.new("Preview / sun", "SUN")
    sun.energy, sun.angle, sun.color = 1.2, .15, srgb_hex("#FFE7BE")[:3]
    obj = bpy.data.objects.new("Preview / sun", sun)
    ensure_collection("Preview / Compatible lighting reference").objects.link(obj)
    obj.rotation_euler = (math.radians(35), math.radians(-25), math.radians(-30))
    camera("Preview_entrance", (-1.8, 1.65, 14), (-.5, 1.6, -4), 23)
    camera("Preview_hub", (0, 1.65, 5.1), (0, 1.6, -.8), 20)
    scene.camera = bpy.data.objects["Preview_entrance"]


def glb_stats(path):
    data = path.read_bytes()
    assert data[:4] == b"glTF", "invalid GLB header"
    count = struct.unpack_from("<I", data, 12)[0]
    doc = json.loads(data[20:20 + count])
    triangles = sum(doc["accessors"][p["indices"]]["count"] // 3
                    for mesh in doc.get("meshes", []) for p in mesh["primitives"])
    return {"bytes": len(data), "triangles": triangles,
            "meshes": len(doc.get("meshes", [])), "materials": len(doc.get("materials", [])),
            "images": len(doc.get("images", [])),
            "primitives": sum(len(m["primitives"]) for m in doc.get("meshes", [])),
            "nodes": [n.get("name") for n in doc.get("nodes", [])]}


def export_asset(path, sources, door_asset=False):
    collection = ensure_collection("Temporary / Export batches")
    copies, batches = [], defaultdict(list)
    offset = Vector(pos((-7.4, 0, 8.05))) if door_asset else Vector((0, 0, 0))
    try:
        for original in sources:
            obj = original.copy()
            obj.data = original.data.copy()
            collection.objects.link(obj)
            obj.location -= offset
            copies.append(obj)
            key = "door" if door_asset else "shell"
            # Meshes with multiple materials are separated in export copies.
            bpy.ops.object.select_all(action="DESELECT")
            obj.select_set(True)
            bpy.context.view_layer.objects.active = obj
            if len(obj.data.materials) > 1:
                before = set(collection.objects)
                bpy.ops.mesh.separate(type="MATERIAL")
                pieces = [obj] + [o for o in collection.objects if o not in before]
                copies.extend(pieces[1:])
            else:
                pieces = [obj]
            for piece in pieces:
                used = next((slot.material for slot in piece.material_slots if slot.material), None)
                # Separate retains all slots, so select the polygon's active one.
                if piece.data.polygons:
                    used = piece.data.materials[piece.data.polygons[0].material_index]
                piece.data.materials.clear()
                piece.data.materials.append(used)
                for polygon in piece.data.polygons:
                    polygon.material_index = 0
                batches[(key, used.name)].append(piece)
        joined = []
        for (key, mat), objects in batches.items():
            bpy.ops.object.select_all(action="DESELECT")
            for obj in objects:
                obj.select_set(True)
            bpy.context.view_layer.objects.active = objects[0]
            bpy.ops.object.join()
            obj = bpy.context.object
            obj.name = f"{key}__{mat.removeprefix('WG_')}"
            # A stable origin at floor [0,0,0], including the moving door.
            bpy.context.scene.cursor.location = (0, 0, 0)
            bpy.ops.object.origin_set(type="ORIGIN_CURSOR")
            joined.append(obj)
        bpy.ops.object.select_all(action="DESELECT")
        for obj in joined:
            obj.select_set(True)
        bpy.ops.export_scene.gltf(filepath=str(path), export_format="GLB", use_selection=True,
                                  export_apply=True, export_cameras=False, export_lights=False,
                                  export_animations=False, export_extras=True,
                                  export_materials="EXPORT", export_yup=True)
    finally:
        for obj in list(collection.objects):
            bpy.data.objects.remove(obj, do_unlink=True)
        bpy.data.collections.remove(collection)
    return glb_stats(path)


def build():
    # Headless --factory-startup keeps all unrelated open scenes safe.
    clear_scene()
    bpy.context.preferences.filepaths.save_version = 0
    ASSETS.mkdir(parents=True, exist_ok=True)
    MODELS.mkdir(parents=True, exist_ok=True)
    textures()
    material("concrete", "#D7D8CF", .88, texture="concrete-own-512.png", normal="concrete-normal-own-256.png")
    material("plaster", "#E7E2D4", .91, texture="plaster-own-256.png")
    material("oak", "#9F7E5A", .68, texture="oak-own-512.png", normal="oak-normal-own-256.png")
    material("greensteel", "#315749", .48, .42)
    material("brass", "#BC9B63", .38, .62)
    material("graphite", "#252D29", .55, .2)
    material("steel_light", "#A8B5AD", .43, .5)
    material("paper", "#E7E3D8", .84)
    material("teal", "#23676A", .68)
    material("glass", "#D5E5DF", .35, alpha=.13)
    material("leaf", "#45624A", .85)
    material("leaflight", "#71805D", .85)
    material("ceramic", "#A99E86", .90)
    material("soil", "#514D3D", 1)
    material("warm", "#FFE4BC", .5, emission="#FFD8A0")
    shell()
    mezzanine()
    workbench()
    kliniu()
    scenery()
    door()
    import_miniature()
    preview_setup()
    bpy.context.scene.unit_settings.system = "METRIC"
    bpy.context.scene.unit_settings.scale_length = 1
    bpy.context.scene["phase"] = "Sprint 7 — Phase 7.2"
    bpy.context.scene["coordinates"] = "Three x right/y up/z entrance; Blender x/-z/y"
    sources = [o for o in bpy.context.scene.objects if o.type == "MESH"]
    door_objects = [o for o in sources if o.get("semantic") == "door"]
    shell_objects = [o for o in sources if o not in door_objects]
    bpy.ops.wm.save_as_mainfile(filepath=str(MASTER))
    stats = {
        "shell": export_asset(MODELS / "workshop-shell-v1.glb", shell_objects),
        "door": export_asset(MODELS / "workshop-door-v1.glb", door_objects, True),
    }
    manifest = {
        "version": 1, "phase": "7.2", "units": "metres", "up": "Y",
        "generator": "blender/generate_workshop_game.py", "blender": bpy.app.version_string,
        "source": "blender/scenes/workshop-game-v1.blend", "stats": stats,
        "totalEssentialBytes": sum(item["bytes"] for item in stats.values()),
        "coordinateMap": "Blender (x,-Three.z,Three.y); glTF Y-up export",
        "shell": {"url": "/models/workshop-game/workshop-shell-v1.glb", "position": [0, 0, 0]},
        "door": {"url": "/models/workshop-game/workshop-door-v1.glb", "pivot": [0, 0, 0],
                 "positionClosed": [-1.8, 0, 8.05], "positionOpen": [-7.4, 0, 8.05],
                 "panelDimensions": [3.6, 4.3, .16],
                 "fixedRightPanel": {"position": [1.8, 2.15, 8.08], "dimensions": [3.6, 4.3, .14]},
                 "fixedLateralPanels": {"centersX": [-3.89, 3.89], "dimensions": [.58, 4.3, .14]}},
        "workbenchTopY": 1.0,
        "cameras": {"entrance": {"position": [-1.8, 1.65, 14], "target": [-.5, 1.6, -4]},
                    "hub": {"position": [0, 1.65, 5.1], "target": [0, 1.6, -.8]}},
        "entranceAdaptation": "Only entrance shifted left 1.8m to look through the open left door; all interior camera points remain unchanged.",
        "previewLights": "Reference only; not exported. Web recreates illumination.",
        "materials": list(M), "textures": [p.name for p in sorted(TEXTURES.glob("*.png"))],
        "licence": "First-party original geometry/textures created for Daniel's portfolio; no external assets. Existing first-party kliniu-interactive-v4.glb reused as tabletop LOD.",
        "scope": "Access/nave/architectural mezzanine/workbench/existing Kliniu. No Phase 7.3 rooms or new interactions.",
        "sha256": {
            "generator": hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
            "blend": hashlib.sha256(MASTER.read_bytes()).hexdigest(),
            "shell": hashlib.sha256((MODELS / "workshop-shell-v1.glb").read_bytes()).hexdigest(),
            "door": hashlib.sha256((MODELS / "workshop-door-v1.glb").read_bytes()).hexdigest(),
        },
    }
    assert manifest["totalEssentialBytes"] < 5_000_000, "mobile essential download budget exceeded"
    assert stats["shell"]["triangles"] < 80_000, "shell triangle budget exceeded"
    assert stats["door"]["bytes"] < 100_000, "door byte budget exceeded"
    (ASSETS / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
    print("WORKSHOP_ASSET_STATS " + json.dumps(stats), flush=True)
    if "--render" in sys.argv:
        for name in ["entrance", "hub"]:
            bpy.context.scene.camera = bpy.data.objects["Preview_" + name]
            bpy.context.scene.render.filepath = str(ASSETS / ("workshop-" + name + "-v1.png"))
            bpy.ops.render.render(write_still=True)


if __name__ == "__main__":
    build()
