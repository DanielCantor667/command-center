"""Original modular rooms for Workshop Game — Sprint 7 / Phase 7.3.

Run (no third-party dependencies):
  /Applications/Blender.app/Contents/MacOS/Blender --background --factory-startup \
    --python-exit-code 1 --python blender/generate_workshop_rooms.py
Append ``-- --render`` for five reference previews from the web camera poses.

The v1 kit is imported as authoring helpers, never rebuilt or overwritten. Its
packed first-party textures are reused. The v2 master keeps separate furniture,
room and portal objects. Only disposable export copies are joined by material.
Everything is authored in global Three.js metres, then exported Y-up at [0,0,0].
Actual project screenshots remain HTML content; the evidence planes are blank.
"""
from __future__ import annotations

import hashlib
import json
import math
import sys
from collections import defaultdict
from pathlib import Path

import bpy
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "blender"))
import generate_workshop_game as kit

ASSETS = ROOT / "docs/product/workshop-game-rooms"
MODELS = ROOT / "apps/web/public/models/workshop-game"
MASTER = ROOT / "blender/scenes/workshop-game-v2.blend"
V1_MANIFEST = ROOT / "docs/product/workshop-game-assets/manifest.json"
ROOMS = {
    "kliniu": {
        "name": "Kliniu", "projectId": "kliniu",
        "portal": [-5.1, 0, -3], "facing": "+Z",
        "position": [-5.1, 1.65, -4], "target": [-5.1, 1.5, -8.7],
        "bounds": {"min": [-9.35, 0, -9.72], "max": [-1.05, 2.75, -3]},
        "evidence": {"center": [-5.1, 1.56, -7.165], "facing": "+Z", "size": [1.84, 1.04]},
    },
    "lorigine": {
        "name": "L'ORIGINE", "projectId": "lorigine",
        "portal": [4.8, 0, -3], "facing": "+Z",
        "position": [4.8, 1.65, -4.1], "target": [4.8, 1.45, -8.5],
        "bounds": {"min": [1.05, 0, -9.72], "max": [7.35, 2.75, -3]},
        "evidence": {"center": [4.8, 1.66, -6.785], "facing": "+Z", "size": [1.82, 1.02]},
    },
    "academy": {
        "name": "4U Studio Academy", "projectId": "4ustudio-academy",
        "portal": [-4, 0, 5.7], "facing": "+X",
        "position": [-6.4, 1.65, 5.7], "target": [-8.6, 1.4, 5.7],
        "bounds": {"min": [-9.35, 0, 4.2], "max": [-4, 2.75, 7.65]},
        "evidence": {"center": [-8.73, 1.9, 5.7], "facing": "+X", "size": [1.5, .84]},
    },
    "drokex": {
        "name": "Drokex", "projectId": "drokex",
        "portal": [4, 0, 5.7], "facing": "-X",
        "position": [6.4, 1.65, 5.7], "target": [8.6, 1.4, 5.7],
        "bounds": {"min": [4, 0, 4.2], "max": [9.35, 2.75, 7.65]},
        "evidence": {"center": [8.78, 1.75, 5.7], "facing": "-X", "size": [1.55, .87]},
    },
}


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def check_v1():
    manifest = json.loads(V1_MANIFEST.read_text())
    paths = {
        "generator": ROOT / "blender/generate_workshop_game.py",
        "blend": ROOT / manifest["source"],
        "shell": MODELS / "workshop-shell-v1.glb",
        "door": MODELS / "workshop-door-v1.glb",
    }
    actual = {key: sha(path) for key, path in paths.items()}
    assert actual == manifest["sha256"], "Phase 7.2 source/export changed; stop before build"
    return actual


def materials():
    kit.M.clear()
    kit.material("concrete", "#D7D8CF", .88, texture="concrete-own-512.png", normal="concrete-normal-own-256.png")
    kit.material("plaster", "#E7E2D4", .91, texture="plaster-own-256.png")
    kit.material("oak", "#9F7E5A", .68, texture="oak-own-512.png", normal="oak-normal-own-256.png")
    for name, color, roughness, metal in [
        ("greensteel", "#315749", .48, .42), ("brass", "#BC9B63", .38, .62),
        ("graphite", "#252D29", .55, .2), ("steel_light", "#A8B5AD", .43, .5),
        ("paper", "#E7E3D8", .84, 0), ("teal", "#23676A", .68, 0),
        ("leaf", "#45624A", .85, 0), ("leaflight", "#71805D", .85, 0),
        ("ceramic", "#A99E86", .90, 0), ("soil", "#514D3D", 1, 0),
        ("ivory", "#F8F5EF", .80, 0), ("champagne", "#B8945A", .4, .62),
        ("espresso", "#231B16", .64, .05), ("acoustic", "#555E57", .95, 0),
        ("cyan", "#64B6B2", .45, .15), ("gate", "#C6CCBA", .72, .1),
    ]:
        kit.material(name, color, roughness, metal)
    kit.material("glass", "#D5E5DF", .35, alpha=.13)
    kit.material("warm", "#FFE4BC", .5, emission="#FFD8A0")


def layer(name, semantic):
    kit.C = kit.ensure_collection(name)
    kit.SEMANTIC = semantic


def text(name, body, xyz, height, mat="graphite", facing="+Z"):
    obj = kit.text(name, body, xyz, height, mat)
    if facing == "+X":
        obj.rotation_euler.z = math.pi / 2
    elif facing == "-X":
        obj.rotation_euler.z = -math.pi / 2
    kit.uv_world(obj)
    return obj


def plane_box(name, center, width, height, depth, mat, facing="+Z", bevel=.012):
    dims = (depth, height, width) if facing in ["+X", "-X"] else (width, height, depth)
    return kit.box(name, center, dims, mat, bevel)


def portal(room_id, wall_min, wall_max, plane, lateral=False):
    room = ROOMS[room_id]
    layer("Kit v2 / Portal " + room_id, "architecture")
    c = room["portal"][2 if lateral else 0]
    # Doorway retains 2.2m clear width and 2.5m height; separators 2.75m.
    for a, b in [(wall_min, c - 1.1), (c + 1.1, wall_max)]:
        dims = (.12, 2.75, b - a) if lateral else (b - a, 2.75, .12)
        xyz = (plane, 1.375, (a + b) / 2) if lateral else ((a + b) / 2, 1.375, plane)
        kit.box(room_id + " / plaster door jamb", xyz, dims, "plaster", .008)
    xyz = (plane, 2.625, c) if lateral else (c, 2.625, plane)
    dims = (.14, .25, 2.2) if lateral else (2.2, .25, .14)
    kit.box(room_id + " / doorway lintel", xyz, dims, "greensteel", .007)
    facing = room["facing"]
    face = .083 if facing in ["+X", "+Z"] else -.083
    xyz = (plane + face, 2.62, c) if lateral else (c, 2.62, plane + face)
    label_size = .13 if room_id == "academy" else .18
    text(room_id + " / portal physical lettering", room["name"], (xyz[0], xyz[1] - .065, xyz[2]), label_size, "paper", facing)
    # One opaque object and exact node name per gate: web hides only after
    # a requested room has rendered. Global origin means no extra transforms.
    layer("Kit v2 / Gate " + room_id, "roomgate__" + room_id)
    xyz = (plane, 1.24, c) if lateral else (c, 1.24, plane)
    dims = (.055, 2.48, 2.18) if lateral else (2.18, 2.48, .055)
    gate = kit.box(room_id + " / editable opaque gate", xyz, dims, "gate", .008)
    gate["roomId"], gate["portalDimensions"] = room_id, [2.2, 2.5]


def architecture():
    kit.shell()
    kit.mezzanine()
    kit.workbench()
    kit.scenery()
    # The old showroom is intentionally not built. Only the ordinary rear
    # storage and indoor trees produced by scenery are removed from v2.
    for obj in list(bpy.context.scene.objects):
        is_storage = obj.name.startswith(("Workshop background storage shelf", "Workshop archive cardboard box", "Workshop shelf steel upright"))
        is_indoor_tree = obj.name.startswith("Workshop tree") and -obj.location.y < 8.0
        if is_storage or is_indoor_tree:
            bpy.data.objects.remove(obj, do_unlink=True)
    kit.door()  # Editable master retains its open pose; export uses v1 unchanged.
    kit.import_miniature()
    layer("Kit v2 / Room partitions", "architecture")
    # Rear rooms stop before the stairs. The central aisle and z=3 corridor
    # remain free; no room furniture is exported into this shell.
    kit.box("Rear left room inner separator", (-1.05, 1.375, -6.36), (.12, 2.75, 6.72), "plaster", .008)
    kit.box("Rear right room inner separator", (1.05, 1.375, -6.36), (.12, 2.75, 6.72), "plaster", .008)
    kit.box("Rear gallery stair separator", (7.35, 1.375, -6.36), (.12, 2.75, 6.72), "plaster", .008)
    for x in [-6.7, 6.7]:
        for z in [4.2, 7.65]:
            kit.box("Front room side separator", (x, 1.375, z), (5.4, 2.75, .12), "plaster", .008)
    portal("kliniu", -9.35, -1.05, -3)
    portal("lorigine", 1.05, 7.35, -3)
    portal("academy", 4.2, 7.65, -4, True)
    portal("drokex", 4.2, 7.65, 4, True)


def monitor(name, xyz, width, height, facing="+Z", mat="graphite"):
    x, y, z = xyz
    plane_box(name + " / frame", xyz, width + .12, height + .12, .075, mat, facing, .015)
    direction = 1 if facing in ["+Z", "+X"] else -1
    p = (x + .043 * direction, y, z) if facing in ["+X", "-X"] else (x, y, z + .043)
    screen = plane_box(name + " / blank real evidence plane", p, width, height, .01, "ivory", facing, .004)
    screen["htmlEvidence"] = True
    # Screens contain no screenshot substitute, sample data or fake charts.
    return screen


def kliniu():
    layer("Room / Kliniu / Editable showroom", "room__kliniu")
    kit.box("Kliniu / teal display wall", (-5.2, 1.375, -9.54), (7.7, 2.75, .10), "teal", .008)
    text("Kliniu / physical name", "Kliniu", (-5.1, 2.34, -9.46), .38, "paper")
    for y in [.49, 1.10, 1.71]:
        kit.box("Kliniu / oak sample shelf", (-5.2, y, -9.11), (7.0, .065, .72), "oak", .01)
        kit.box("Kliniu / warm shelf diffuser", (-5.2, y - .05, -8.74), (6.9, .016, .02), "warm", .002)
        for i in range(8):
            x = -8.2 + i * .83
            kit.box("Kliniu / architectural catalogue sample", (x, y + .19, -9.08), (.45, .32, .42), "paper", .007)
            for dx in [-.13, 0, .13]:
                kit.box("Kliniu / sample upright fin", (x + dx, y + .19, -8.86), (.022, .31, .025), "steel_light", .002)
    for x in [-8.7, -5.2, -1.7]:
        kit.box("Kliniu / shelf upright", (x, 1.15, -9.1), (.045, 2.24, .7), "greensteel", .006)
    kit.box("Kliniu / operational worktop", (-5.1, .855, -7.14), (4.0, .12, 1.35), "oak", .016)
    for x in [-6.77, -3.43]:
        kit.box("Kliniu / desk trestle", (x, .42, -7.14), (.10, .79, 1.12), "greensteel", .007)
    monitor("Kliniu / evidence terminal", (-5.1, 1.56, -7.21), 1.84, 1.04)
    kit.rod("Kliniu / monitor support", (-5.1, .915, -7.23), (-5.1, 1.0, -7.23), .035)
    kit.box("Kliniu / drawing sheet", (-3.55, .92, -6.87), (.75, .015, .51), "paper", .004)
    for x in [-8.49, -8.02]:
        kit.box("Kliniu / material pedestal", (x, .46, -6.05), (.38, .92, .48), "concrete", .012)
        kit.box("Kliniu / material study", (x, 1.03, -6.05), (.27, .22, .29), "teal", .006)
    kit.plant("Kliniu / showroom tree", (-8.45, 0, -4.8), 1.78, .48)


def bottle(name, xyz, radius=.14, height=.46, mat="ivory"):
    x, y, z = xyz
    kit.cylinder(name + " / vessel", (x, y + height / 2, z), radius, height, mat, 20, radius * .95)
    kit.cylinder(name + " / cap", (x, y + height + .035, z), radius * .77, .07, "champagne", 20)
    kit.box(name + " / unlettered label", (x, y + height * .53, z + radius * .963), (radius * 1.1, height * .39, .009), "espresso", .003)


def lorigine():
    layer("Room / L'ORIGINE / Editable gallery", "room__lorigine")
    kit.box("L'ORIGINE / ivory gallery lining", (4.19, 1.375, -9.53), (6.12, 2.75, .10), "ivory", .008)
    text("L'ORIGINE / physical name", "L'ORIGINE", (4.8, 2.36, -9.46), .27, "espresso")
    for x in [2.3, 4.8, 6.7]:
        kit.cylinder("L'ORIGINE / sculptural display plinth", (x, .53, -8.18), .36, 1.06, "ivory", 28)
        kit.cylinder("L'ORIGINE / plinth brass ring", (x, 1.08, -8.18), .36, .025, "champagne", 28)
        bottle("L'ORIGINE / capillary product study", (x, 1.094, -8.18), .13, .47 if x == 4.8 else .36)
    kit.box("L'ORIGINE / gallery evidence console", (4.8, .66, -6.8), (2.9, .10, .71), "oak", .016)
    for x in [3.6, 6.0]:
        kit.box("L'ORIGINE / console timber leg", (x, .31, -6.8), (.10, .6, .53), "oak", .008)
    monitor("L'ORIGINE / evidence display", (4.8, 1.66, -6.83), 1.82, 1.02, mat="espresso")
    kit.rod("L'ORIGINE / display stand", (4.8, .72, -6.9), (4.8, 1.08, -6.9), .022, "champagne")
    # A low editorial bench and wall-mounted product niches stay off the
    # camera's x=4.8 arrival line, preserving the clear near half of the room.
    kit.box("L'ORIGINE / gallery bench", (2.04, .44, -5.26), (.68, .12, 1.7), "oak", .02)
    for z in [-5.84, -4.68]:
        kit.box("L'ORIGINE / bench support", (2.04, .21, z), (.5, .4, .11), "champagne", .01)
    for y in [1.05, 1.72]:
        kit.box("L'ORIGINE / floating left niche", (1.45, y, -7.0), (.46, .04, 1.8), "oak", .01)
        for z in [-7.58, -6.98, -6.38]:
            bottle("L'ORIGINE / niche product study", (1.52, y + .023, z), .095, .30)
    kit.plant("L'ORIGINE / botanical gallery tree", (6.62, 0, -4.76), 1.69, .42)


def ellipsoid(name, xyz, scale, mat, segments=16, rings=8):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments, ring_count=rings, radius=1, location=kit.pos(xyz))
    obj = bpy.context.object
    obj.scale = kit.size(scale)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    return kit.tag(obj, name, mat, smooth=True)


def guitar(x, z):
    ellipsoid("Academy / guitar lower bout", (x, .48, z), (.075, .26, .21), "oak")
    ellipsoid("Academy / guitar upper bout", (x, .69, z), (.07, .17, .16), "oak")
    kit.box("Academy / guitar fretboard", (x + .057, 1.05, z), (.045, .60, .073), "espresso", .005)
    kit.box("Academy / guitar headstock", (x + .025, 1.40, z), (.06, .13, .10), "oak", .006)
    hole = kit.cylinder("Academy / guitar sound hole", (x + .079, .65, z), .071, .012, "graphite", 18)
    hole.rotation_euler.y = math.pi / 2
    for dz in [-.025, -.015, -.005, .005, .015, .025]:
        kit.rod("Academy / guitar string", (x + .087, .42, z + dz), (x + .087, 1.37, z + dz), .0008, "steel_light", 4)
    for dz in [-.2, .2]:
        kit.rod("Academy / guitar stand foot", (x, .025, z + dz), (x - .05, .48, z), .012, "greensteel", 6)


def academy():
    layer("Room / Academy / Editable music studio", "room__academy")
    kit.box("Academy / warm acoustic back panel", (-8.92, 1.375, 5.7), (.12, 2.74, 3.03), "acoustic", .01)
    text("Academy / physical name", "4U Studio Academy", (-8.845, 2.39, 5.7), .18, "paper", "+X")
    for z in [4.35, 7.48]:
        for x in [-7.58, -6.15, -4.85]:
            kit.box("Academy / side acoustic absorber", (x, 1.42, z), (.73, 1.56, .12), "acoustic", .012)
            for dx in [-.27, -.09, .09, .27]:
                kit.box("Academy / timber acoustic slat", (x + dx, 1.42, z + (.075 if z < 5.7 else -.075)), (.06, 1.51, .035), "oak", .004)
    # Upright piano faces +X: visible keybed and lid, no geometry in the
    # approved arrival camera at[-6.4,1.65,5.7].
    kit.box("Academy / upright piano cabinet", (-8.48, .70, 5.7), (.57, 1.38, 2.0), "espresso", .025)
    kit.box("Academy / piano lid", (-8.44, 1.40, 5.7), (.68, .09, 2.10), "espresso", .012)
    kit.box("Academy / piano keybed", (-8.09, .84, 5.7), (.49, .08, 2.0), "espresso", .011)
    for i in range(28):
        z = 4.76 + i * .068
        kit.box("Academy / white piano key", (-8.025, .894, z), (.38, .026, .063), "ivory", .002)
        if i % 7 not in [2, 6] and i < 27:
            kit.box("Academy / black piano key", (-8.135, .920, z + .036), (.21, .04, .037), "graphite", .002)
    for z in [4.8, 6.6]:
        kit.box("Academy / piano front foot", (-8.02, .06, z), (.22, .10, .14), "espresso", .007)
    kit.box("Academy / piano teaching bench", (-7.42, .48, 5.7), (.45, .09, .91), "oak", .01)
    for x in [-7.59, -7.25]:
        for z in [5.38, 6.02]:
            kit.box("Academy / bench leg", (x, .24, z), (.065, .46, .065), "greensteel", .005)
    monitor("Academy / evidence display", (-8.775, 1.9, 5.7), 1.5, .84, "+X", "greensteel")
    guitar(-8.45, 7.00)
    # Compact teaching drum kit beside the piano; round shapes are low-poly.
    drum = kit.cylinder("Academy / bass drum shell", (-8.24, .32, 4.72), .30, .36, "oak", 20)
    drum.rotation_euler.y = math.pi / 2
    head = kit.cylinder("Academy / bass drum head", (-8.04, .32, 4.72), .29, .02, "ivory", 20)
    head.rotation_euler.y = math.pi / 2
    for x, z, radius, y in [(-8.19, 4.50, .19, .76), (-8.19, 4.96, .17, .8)]:
        kit.cylinder("Academy / teaching tom", (x, y, z), radius, .18, "oak", 16)
        kit.cylinder("Academy / tom head", (x, y + .098, z), radius, .015, "ivory", 16)
    kit.rod("Academy / cymbal stand", (-7.85, .02, 4.63), (-7.85, 1.16, 4.63), .013, "steel_light", 8)
    kit.cylinder("Academy / teaching cymbal", (-7.85, 1.17, 4.63), .26, .015, "brass", 24)
    kit.box("Academy / teaching music stand", (-5.03, 1.08, 7.0), (.045, .52, .48), "greensteel", .008)
    kit.rod("Academy / music stand post", (-5.03, .025, 7.0), (-5.03, .89, 7.0), .014, "greensteel", 8)


def drokex():
    layer("Room / Drokex / Editable modular network", "room__drokex")
    kit.box("Drokex / graphite modular backdrop", (8.96, 1.375, 5.7), (.12, 2.74, 3.02), "graphite", .01)
    text("Drokex / physical name", "Drokex", (8.884, 2.4, 5.7), .29, "paper", "-X")
    monitor("Drokex / evidence terminal", (8.825, 1.75, 5.7), 1.55, .87, "-X", "teal")
    # Nodes and links describe the catalogue/directorio theme spatially;
    # no node counts, numbers, labels, charts or business metrics are encoded.
    nodes = [(4.66, .54), (4.68, 1.35), (5.25, .51), (6.17, .5), (6.75, .62), (6.71, 1.38)]
    for i, (z, y) in enumerate(nodes):
        x = 8.52 if i % 2 else 8.26
        kit.box("Drokex / catalogue modular node", (x, y, z), (.48, .48, .46), "teal" if i % 2 else "paper", .015)
        kit.box("Drokex / module front recess", (x - .251, y, z), (.015, .32, .30), "graphite", .004)
        kit.box("Drokex / module brass edge", (x - .261, y - .165, z), (.018, .018, .33), "brass", .003)
        if y < .8:
            kit.box("Drokex / catalogue plinth", (x, .1, z), (.56, .20, .53), "concrete", .012)
    for a, b in [(0, 1), (0, 2), (2, 3), (3, 4), (4, 5)]:
        za, ya = nodes[a]
        zb, yb = nodes[b]
        kit.rod("Drokex / first party directory link", (8.71, ya, za), (8.71, yb, zb), .021, "cyan", 8)
    for z in [4.49, 7.35]:
        kit.box("Drokex / side catalogue rail", (6.76, .85, z), (2.96, .06, .42), "oak", .01)
        for x in [5.60, 6.35, 7.10, 7.85]:
            kit.box("Drokex / supplier sample module", (x, 1.07, z), (.44, .37, .29), "paper", .01)
            kit.box("Drokex / abstract catalogue tile", (x, 1.075, z + (.157 if z < 5.7 else -.157)), (.25, .17, .02), "teal", .003)
    kit.box("Drokex / modular interaction bench", (8.1, .53, 5.7), (.69, .16, 1.72), "oak", .016)
    for z in [5.09, 6.31]:
        kit.box("Drokex / bench steel support", (8.1, .26, z), (.56, .48, .075), "greensteel", .01)


def export(path, sources, key):
    """Batch disposable copies; keep room gates separately addressable."""
    collection = kit.ensure_collection("Temporary v2 / Export copies")
    batches = defaultdict(list)
    try:
        for source in sources:
            obj = source.copy()
            obj.data = source.data.copy()
            collection.objects.link(obj)
            bpy.ops.object.select_all(action="DESELECT")
            obj.select_set(True)
            bpy.context.view_layer.objects.active = obj
            bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
            if len(obj.data.materials) > 1:
                before = set(collection.objects)
                bpy.ops.mesh.separate(type="MATERIAL")
                pieces = [obj] + [o for o in collection.objects if o not in before]
            else:
                pieces = [obj]
            for piece in pieces:
                mat = piece.data.materials[piece.data.polygons[0].material_index]
                piece.data.materials.clear()
                piece.data.materials.append(mat)
                for poly in piece.data.polygons:
                    poly.material_index = 0
                semantic = source.get("semantic", "architecture")
                batch_name = semantic if semantic.startswith("roomgate__") else key + "__" + mat.name.removeprefix("WG_")
                batches[batch_name].append(piece)
        joined = []
        for name, objects in batches.items():
            bpy.ops.object.select_all(action="DESELECT")
            for obj in objects:
                obj.select_set(True)
            bpy.context.view_layer.objects.active = objects[0]
            bpy.ops.object.join()
            obj = bpy.context.object
            obj.name = name
            bpy.context.scene.cursor.location = (0, 0, 0)
            bpy.ops.object.origin_set(type="ORIGIN_CURSOR")
            joined.append(obj)
        bpy.ops.object.select_all(action="DESELECT")
        for obj in joined:
            obj.select_set(True)
        bpy.ops.export_scene.gltf(filepath=str(path), export_format="GLB", use_selection=True,
            export_apply=True, export_cameras=False, export_lights=False,
            export_animations=False, export_extras=True, export_materials="EXPORT", export_yup=True)
    finally:
        for obj in list(collection.objects):
            bpy.data.objects.remove(obj, do_unlink=True)
        bpy.data.collections.remove(collection)
    return stats(path)


def stats(path):
    result = kit.glb_stats(path)
    data = path.read_bytes()
    doc = json.loads(data[20:20 + int.from_bytes(data[12:16], "little")])
    meshes = doc.get("meshes", [])
    positions = [doc["accessors"][p["attributes"]["POSITION"]] for mesh in meshes for p in mesh["primitives"]]
    result["bounds"] = {
        "min": [min(p["min"][i] for p in positions) for i in range(3)],
        "max": [max(p["max"][i] for p in positions) for i in range(3)],
    }
    result["uvPrimitives"] = sum("TEXCOORD_0" in p["attributes"] for mesh in meshes for p in mesh["primitives"])
    result["normalMappedMaterials"] = sum("normalTexture" in m for m in doc.get("materials", []))
    result["externalResources"] = [r["uri"] for kind in ["buffers", "images"] for r in doc.get(kind, []) if "uri" in r and not r["uri"].startswith("data:")]
    result["sha256"] = sha(path)
    assert not result["externalResources"]
    return result


def preview_setup():
    kit.preview_setup()
    for room_id, room in ROOMS.items():
        kit.camera("Preview_" + room_id, room["position"], room["target"], 23)
        px, _, pz = room["target"]
        kit.light("Room preview daylight / " + room_id, (px, 2.65, pz), (px, .8, pz + .4), 90, 2.5, "#FFF2D9")
    scene = bpy.context.scene
    scene.cycles.samples = 16
    scene.render.resolution_x, scene.render.resolution_y = 1280, 720
    for gate in [obj for obj in scene.objects if obj.get("semantic", "").startswith("roomgate__")]:
        gate.hide_render = True


def render_previews():
    for name in ["hub", *ROOMS]:
        bpy.context.scene.camera = bpy.data.objects["Preview_" + name]
        bpy.context.scene.render.filepath = str(ASSETS / ("workshop-" + name + "-v2.png"))
        bpy.ops.render.render(write_still=True)


def build():
    preserved = check_v1()
    kit.clear_scene()
    bpy.context.preferences.filepaths.save_version = 0
    ASSETS.mkdir(parents=True, exist_ok=True)
    MODELS.mkdir(parents=True, exist_ok=True)
    materials()
    architecture()
    kliniu()
    lorigine()
    academy()
    drokex()
    # Room plants share their existing PBR materials with concrete/graphite
    # and a single leaf tone. This removes three unnecessary draw batches.
    for obj in [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]:
        if not obj.get("semantic", "").startswith("room__"):
            continue
        for slot in obj.material_slots:
            aliases = {"WG_ceramic": "concrete", "WG_soil": "graphite", "WG_leaflight": "leaf"}
            if slot.material.name in aliases:
                slot.material = kit.M[aliases[slot.material.name]]
    preview_setup()
    scene = bpy.context.scene
    scene.unit_settings.system = "METRIC"
    scene.unit_settings.scale_length = 1
    scene["phase"] = "Sprint 7 — Phase 7.3"
    scene["coordinates"] = "Three x/right,y/up,z/entrance; Blender x,-z,y; GLB global origin0"
    scene["evidence"] = "Blank screen planes; factual project screenshots are supplied by accessible web HTML"
    mesh_objects = [obj for obj in scene.objects if obj.type == "MESH"]
    shell_objects = [obj for obj in mesh_objects if not obj.get("semantic", "").startswith("room__") and obj.get("semantic") != "door"]
    # Save the editable source first, with individual kit pieces untouched.
    bpy.ops.wm.save_as_mainfile(filepath=str(MASTER))
    all_stats = {"shell": export(MODELS / "workshop-shell-v2.glb", shell_objects, "shell")}
    for room_id in ROOMS:
        objects = [obj for obj in mesh_objects if obj.get("semantic") == "room__" + room_id]
        all_stats[room_id] = export(MODELS / ("room-" + room_id + "-v1.glb"), objects, "room__" + room_id)
    door_stats = stats(MODELS / "workshop-door-v1.glb")
    core_bytes = all_stats["shell"]["bytes"] + door_stats["bytes"]
    manifest = {
        "version": 2, "phase": "7.3", "units": "metres", "up": "Y",
        "generator": "blender/generate_workshop_rooms.py", "source": "blender/scenes/workshop-game-v2.blend",
        "blender": bpy.app.version_string, "coordinateMap": "Blender (Three.x,-Three.z,Three.y); GLTF Y-up export",
        "shell": {"url": "/models/workshop-game/workshop-shell-v2.glb", "position": [0, 0, 0]},
        "door": {"url": "/models/workshop-game/workshop-door-v1.glb", "preserved": True},
        "rooms": {room_id: {**room, "url": "/models/workshop-game/room-" + room_id + "-v1.glb", "modelPosition": [0, 0, 0], "gateNode": "roomgate__" + room_id} for room_id, room in ROOMS.items()},
        "stats": all_stats, "totalEssentialBytes": core_bytes, "doorStats": door_stats,
        "portalDimensions": [2.2, 2.5], "separatorHeight": 2.75,
        "preview": {"renderer": "Blender Cycles reference only; acceptance uses actual web renderer", "poses": "Exact room web poses; reference hub retained from7.2", "lights": "Preview lighting not exported", "gates": "Hidden only in reference renders; exported opaque by default"},
        "licence": "First-party original geometry for Daniel's portfolio. Existing first-party v1 kit/textures and Kliniu tabletop LOD reused. No third-party downloads, AI textures or screenshots invented.",
        "sha256": {"generator": sha(Path(__file__)), "blend": sha(MASTER)},
        "preservedPhase72Sha256": preserved,
    }
    assert check_v1() == preserved, "Phase7.2 resources changed during export"
    assert core_bytes <= 5_000_000, "essential core download exceeds5MB"
    assert all_stats["shell"]["triangles"] < 80_000, "shell exceeds80k triangles"
    for room_id in ROOMS:
        item = all_stats[room_id]
        assert item["bytes"] < 2_000_000, room_id + " exceeds2MB"
        assert item["triangles"] < 25_000, room_id + " exceeds25k triangles"
        assert item["primitives"] <= 12, room_id + " exceeds12 primitives"
        assert all(n.startswith("room__" + room_id + "__") for n in item["nodes"]), "room node naming contract"
        for axis in range(3):
            assert item["bounds"]["min"][axis] >= ROOMS[room_id]["bounds"]["min"][axis] - .02, room_id + " crosses room minimum bound"
            assert item["bounds"]["max"][axis] <= ROOMS[room_id]["bounds"]["max"][axis] + .02, room_id + " crosses room maximum bound"
    assert all("roomgate__" + room_id in all_stats["shell"]["nodes"] for room_id in ROOMS), "missing shell gates"
    (ASSETS / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
    print("WORKSHOP_ROOMS_ASSET_STATS " + json.dumps(all_stats), flush=True)
    if "--render" in sys.argv:
        render_previews()


if __name__ == "__main__":
    build()
