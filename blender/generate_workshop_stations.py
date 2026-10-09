"""First-party workshop station kit — Sprint 7 / Phase 7.4.

Run from the repository (no installation or downloaded assets required):
  /Applications/Blender.app/Contents/MacOS/Blender --background --factory-startup \
    --python-exit-code 1 --python blender/generate_workshop_stations.py
Append ``-- --render`` for three station previews and the hub reference.

The existing v2 master is opened read-only and saved at a new v3 path. Existing
WG_* materials and packed textures are reused. Only newly authored station
objects are copied and exported; v1/v2 sources and GLBs are hash-checked before
and after. Source furniture remains individually editable. Web text, factual
technology lists, career history and contact links remain accessible HTML.
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

ASSETS = ROOT / "docs/product/workshop-game-stations"
PREVIEWS = ASSETS / "previews"
SOURCE = ROOT / "blender/scenes/workshop-game-v2.blend"
MASTER = ROOT / "blender/scenes/workshop-game-v3.blend"
GLB = ROOT / "apps/web/public/models/workshop-game/workshop-stations-v1.glb"
ROOM_MANIFEST = ROOT / "docs/product/workshop-game-rooms/manifest.json"
V1_MANIFEST = ROOT / "docs/product/workshop-game-assets/manifest.json"
STATIONS = {
    "technologies": {
        "name": "Tecnologías",
        "position": [-6.8, 1.65, 1.55], "target": [-9.14, 1.6, 1.55],
        "facing": "+X", "hotspot": [-8.64, 1.65, 1.55],
        "hitNode": "stationhit__technologies", "hitAnchor": [-8.948, 2.45, 1.55],
        "bounds": {"min": [-9.4, 0, .4], "max": [-8.6, 2.7, 2.8]},
    },
    "trajectory": {
        "name": "Trayectoria",
        "position": [-7.7, 1.65, .8], "target": [-8.1, 1.55, -2.65],
        "facing": "+Z", "hotspot": [-8.1, 1.65, -2.3],
        "hitNode": "stationhit__trajectory", "hitAnchor": [-8.1, 2.445, -2.389],
        "bounds": {"min": [-9, 0, -2.92], "max": [-7.2, 2.7, -2.38]},
    },
    "contact": {
        "name": "Contacto",
        "position": [6.7, 1.65, 2.7], "target": [6.7, 1.3, 1.45],
        "facing": "+Z", "hotspot": [6.7, 1.62, 1.9],
        "hitNode": "stationhit__contact", "hitAnchor": [6.7, 1.74, 1.512],
        "bounds": {"min": [5.6, 0, 1.0], "max": [7.8, 1.95, 1.9]},
    },
}


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def preserved_resources():
    """Use the recorded phase manifests as the immutable parent contracts."""
    v1 = json.loads(V1_MANIFEST.read_text())
    v2 = json.loads(ROOM_MANIFEST.read_text())
    expected = {
        "blender/generate_workshop_game.py": v1["sha256"]["generator"],
        v1["source"]: v1["sha256"]["blend"],
        "apps/web/public/models/workshop-game/workshop-shell-v1.glb": v1["sha256"]["shell"],
        "apps/web/public/models/workshop-game/workshop-door-v1.glb": v1["sha256"]["door"],
        v2["generator"]: v2["sha256"]["generator"],
        v2["source"]: v2["sha256"]["blend"],
        "apps/web/public" + v2["shell"]["url"]: v2["stats"]["shell"]["sha256"],
    }
    for station_id, room in v2["rooms"].items():
        expected["apps/web/public" + room["url"]] = v2["stats"][station_id]["sha256"]
    actual = {path: sha(ROOT / path) for path in expected}
    assert actual == expected, "Parent phase asset/source hash changed; stop before authoring"
    return actual


def layer(station_id, name, semantic="station"):
    kit.C = kit.ensure_collection("Stations v3 / " + station_id + " / " + name)
    kit.SEMANTIC = semantic


def title(name, body, xyz, height, facing="+Z", mat="paper"):
    obj = kit.text(name, body, xyz, height, mat)
    if facing == "+X":
        obj.rotation_euler.z = math.pi / 2
    kit.uv_world(obj)
    return obj


def board(name, center, width, height, depth, mat, facing="+Z", bevel=.008):
    dims = (depth, height, width) if facing == "+X" else (width, height, depth)
    return kit.box(name, center, dims, mat, bevel)


def technologies():
    # A wall-mounted tool/module composition, clear of the circulation aisle.
    layer("technologies", "Editable technical wall")
    board("Technologies / backing panel", (-9.13, 1.46, 1.55), 2.05, 1.96, .065, "greensteel", "+X")
    for z in [.47, 2.63]:
        kit.box("Technologies / oak wall stile", (-9.075, 1.46, z), (.10, 2.10, .075), "oak", .008)
    for y in [.415, 2.505]:
        kit.box("Technologies / oak end rail", (-9.075, y, 1.55), (.10, .075, 2.20), "oak", .008)
    # The visible header is the exact, opaque selectable node, rather than an
    # invisible collider or a material batch whose name depends on draw order.
    layer("technologies", "Selectable header", "stationhit__technologies")
    board("Technologies / selectable green header", (-8.97, 2.33, 1.55), 1.99, .29, .035, "greensteel", "+X")
    layer("technologies", "Editable technical wall")
    title("Technologies / physical controlled name", "Tecnologías", (-8.948, 2.272, 1.55), .137, "+X")
    # An abstract modular rack conveys tools without pretending to be project
    # evidence, a measured workflow, a dashboard or a real circuit schematic.
    for z in [.75, 1.20, 1.65]:
        for y in [1.14, 1.72]:
            kit.box("Technologies / tool module housing", (-8.99, y, z), (.16, .36, .31), "paper", .012)
            kit.box("Technologies / recessed module face", (-8.901, y, z), (.013, .23, .20), "graphite", .003)
            kit.box("Technologies / brass module tab", (-8.89, y - .122, z), (.016, .025, .16), "brass", .003)
    for z in [2.03, 2.32]:
        kit.rod("Technologies / upright workshop tool", (-8.91, 1.04, z), (-8.91, 1.95, z), .018, "steel_light", 8)
        kit.cylinder("Technologies / tool handle", (-8.91, 1.14, z), .047, .22, "graphite", 12)
    for y in [.69, 2.08]:
        kit.box("Technologies / shallow oak shelf", (-8.955, y, 1.55), (.33, .045, 1.91), "oak", .007)
    for z in [.74, 1.17, 1.60, 2.08]:
        kit.box("Technologies / unlabelled tool case", (-8.92, .83, z), (.20, .22, .29), "paper", .008)


def trajectory():
    # Ground-level archive alongside the Kliniu portal, under the loft edge.
    layer("trajectory", "Editable grounded archive")
    kit.box("Trajectory / archive opaque back", (-8.1, 1.135, -2.869), (1.72, 1.91, .062), "greensteel", .008)
    for x in [-8.944, -7.256]:
        kit.box("Trajectory / oak archive side", (x, 1.145, -2.65), (.075, 2.10, .47), "oak", .008)
    for y in [.12, .67, 1.22, 1.77, 2.19]:
        kit.box("Trajectory / oak archive shelf", (-8.1, y, -2.65), (1.75, .06, .47), "oak", .009)
    for shelf_y in [.158, .708, 1.258]:
        for i, x in enumerate([-8.70, -8.33, -7.96, -7.59]):
            height = [.34, .40, .36, .37][i]
            kit.box("Trajectory / ordinary archive case", (x, shelf_y + height / 2, -2.64), (.29, height, .33), "paper", .007)
            kit.box("Trajectory / blank brass label slot", (x, shelf_y + height * .61, -2.467), (.14, .07, .012), "brass", .003)
    # Closed folios are intentionally unlabelled: factual career dates and
    # accomplishments come only from PORTFOLIO_CAREER in the web reader.
    for i, x in enumerate([-8.77, -8.64, -8.51, -8.38, -8.25, -8.12, -7.99]):
        kit.box("Trajectory / unlettered archive folio", (x, 1.94, -2.66), (.09, .29 + .015 * (i % 3), .28), "greensteel" if i % 3 == 0 else "paper", .005)
    layer("trajectory", "Selectable header", "stationhit__trajectory")
    board("Trajectory / selectable archive header", (-8.1, 2.325, -2.416), 1.68, .285, .045, "greensteel")
    layer("trajectory", "Editable grounded archive")
    title("Trajectory / physical controlled name", "Trayectoria", (-8.1, 2.267, -2.389), .145)


def contact():
    layer("contact", "Editable public contact desk")
    kit.box("Contact / oak desk", (6.7, .835, 1.45), (2.18, .11, .88), "oak", .016)
    for x in [5.85, 7.55]:
        kit.box("Contact / desk steel trestle", (x, .397, 1.45), (.065, .75, .71), "greensteel", .008)
    kit.box("Contact / lower desk tie", (6.7, .31, 1.19), (1.74, .048, .04), "greensteel", .004)
    board("Contact / terminal housing", (6.7, 1.50, 1.464), 1.16, .68, .065, "graphite", bevel=.015)
    kit.rod("Contact / terminal support", (6.7, .89, 1.43), (6.7, 1.17, 1.43), .032, "greensteel", 12)
    kit.box("Contact / terminal foot", (6.7, .901, 1.50), (.49, .022, .30), "greensteel", .007)
    layer("contact", "Selectable terminal", "stationhit__contact")
    board("Contact / selectable public contact plane", (6.7, 1.50, 1.504), 1.06, .575, .015, "greensteel", bevel=.006)
    layer("contact", "Editable public contact desk")
    title("Contact / physical controlled name", "Contacto", (6.7, 1.442, 1.517), .159)
    for x in [5.92, 7.46]:
        kit.box("Contact / blank public correspondence sheet", (x, .901, 1.61), (.37, .009, .35), "paper", .004)
    kit.box("Contact / physical stationery tray", (7.53, .941, 1.19), (.35, .08, .24), "brass", .008)
    kit.box("Contact / blank stationery sheet", (7.53, .986, 1.19), (.31, .01, .20), "paper", .003)


def model_stats(path):
    result = kit.glb_stats(path)
    data = path.read_bytes()
    doc = json.loads(data[20:20 + int.from_bytes(data[12:16], "little")])
    primitives = [p for mesh in doc.get("meshes", []) for p in mesh["primitives"]]
    positions = [doc["accessors"][p["attributes"]["POSITION"]] for p in primitives]
    result["bounds"] = {
        "min": [min(a["min"][axis] for a in positions) for axis in range(3)],
        "max": [max(a["max"][axis] for a in positions) for axis in range(3)],
    }
    result["uvPrimitives"] = sum("TEXCOORD_0" in p["attributes"] for p in primitives)
    result["normalPrimitives"] = sum("NORMAL" in p["attributes"] for p in primitives)
    result["normalMappedMaterials"] = sum("normalTexture" in m for m in doc.get("materials", []))
    result["opaqueMaterials"] = sum(m.get("alphaMode", "OPAQUE") == "OPAQUE" for m in doc.get("materials", []))
    result["externalResources"] = [item["uri"] for kind in ["buffers", "images"] for item in doc.get(kind, []) if "uri" in item and not item["uri"].startswith("data:")]
    result["sha256"] = sha(path)
    result["hitBounds"] = {}
    for node in doc.get("nodes", []):
        if not node.get("name", "").startswith("stationhit__"):
            continue
        assert "matrix" not in node and "translation" not in node, "station origin is not global zero"
        mesh = doc["meshes"][node["mesh"]]
        accessors = [doc["accessors"][p["attributes"]["POSITION"]] for p in mesh["primitives"]]
        result["hitBounds"][node["name"]] = {
            "min": [min(a["min"][axis] for a in accessors) for axis in range(3)],
            "max": [max(a["max"][axis] for a in accessors) for axis in range(3)],
        }
    return result


def source_bounds(objects):
    points = [obj.matrix_world @ Vector(vertex) for obj in objects for vertex in obj.bound_box]
    three = [(p.x, p.z, -p.y) for p in points]
    return {"min": [min(p[axis] for p in three) for axis in range(3)],
            "max": [max(p[axis] for p in three) for axis in range(3)]}


def export_stations(objects):
    """Export disposable copies only, preserving the three physical hit nodes."""
    temporary = kit.ensure_collection("Temporary v3 / Station export copies")
    batches = defaultdict(list)
    try:
        for source in objects:
            obj = source.copy()
            obj.data = source.data.copy()
            temporary.objects.link(obj)
            bpy.ops.object.select_all(action="DESELECT")
            obj.select_set(True)
            bpy.context.view_layer.objects.active = obj
            bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
            assert len(obj.data.materials) == 1, "station source objects must own one existing material"
            material = obj.data.materials[0]
            semantic = source.get("semantic", "station")
            name = semantic if semantic.startswith("stationhit__") else "station__" + material.name.removeprefix("WG_")
            batches[name].append(obj)
        joined = []
        for name, pieces in batches.items():
            bpy.ops.object.select_all(action="DESELECT")
            for obj in pieces:
                obj.select_set(True)
            bpy.context.view_layer.objects.active = pieces[0]
            if len(pieces) > 1:
                bpy.ops.object.join()
            obj = bpy.context.view_layer.objects.active
            obj.name = name
            bpy.context.scene.cursor.location = (0, 0, 0)
            bpy.ops.object.origin_set(type="ORIGIN_CURSOR")
            if name.startswith("stationhit__"):
                obj["stationId"] = name.removeprefix("stationhit__")
            elif "stationId" in obj:
                del obj["stationId"]
            joined.append(obj)
        bpy.ops.object.select_all(action="DESELECT")
        for obj in joined:
            obj.select_set(True)
        bpy.ops.export_scene.gltf(filepath=str(GLB), export_format="GLB", use_selection=True,
            export_apply=True, export_cameras=False, export_lights=False,
            export_animations=False, export_extras=True, export_materials="EXPORT", export_yup=True)
    finally:
        for obj in list(temporary.objects):
            bpy.data.objects.remove(obj, do_unlink=True)
        bpy.data.collections.remove(temporary)
    return model_stats(GLB)


def prepare_previews():
    scene = bpy.context.scene
    scene.cycles.samples = 16
    scene.render.resolution_x, scene.render.resolution_y, scene.render.resolution_percentage = 1280, 720, 100
    scene.render.image_settings.file_format = "PNG"
    # v2's previews had gates hidden. v3 references show the station-only core;
    # gates remain closed and no unrequested room appears through its doorway.
    for obj in scene.objects:
        if obj.get("semantic", "").startswith("roomgate__"):
            obj.hide_render = False
    for station_id, station in STATIONS.items():
        kit.camera("Preview_v3_" + station_id, station["position"], station["target"], 23)
        position = station["position"]
        kit.light("Preview v3 / station bounce / " + station_id, (position[0], 2.4, position[2]), station["target"], 80, 1.5, "#FFF2D9")
    kit.camera("Preview_v3_hub", (0, 1.65, 5.1), (0, 1.5, -5.5), 23)


def render_previews():
    for station_id in ["hub", *STATIONS]:
        bpy.context.scene.camera = bpy.data.objects["Preview_v3_" + station_id]
        bpy.context.scene.render.filepath = str(PREVIEWS / ("workshop-" + station_id + "-v3.png"))
        bpy.ops.render.render(write_still=True)


def build():
    preserved = preserved_resources()
    bpy.ops.wm.open_mainfile(filepath=str(SOURCE))
    bpy.context.preferences.filepaths.save_version = 0
    # No material()/textures() calls: these exact datablocks carry the v2
    # PBR node setup and existing packed first-party images into the new kit.
    kit.M = {material.name.removeprefix("WG_"): material for material in bpy.data.materials if material.name.startswith("WG_")}
    assert all(name in kit.M for name in ["oak", "greensteel", "paper", "graphite", "brass", "steel_light"])
    ASSETS.mkdir(parents=True, exist_ok=True)
    PREVIEWS.mkdir(parents=True, exist_ok=True)
    added = {}
    for station_id, author in [("technologies", technologies), ("trajectory", trajectory), ("contact", contact)]:
        before = set(bpy.context.scene.objects)
        author()
        objects = [obj for obj in bpy.context.scene.objects if obj not in before and obj.type == "MESH"]
        for obj in objects:
            obj["stationId"] = station_id
        bpy.context.view_layer.update()
        bounds = source_bounds(objects)
        for axis in range(3):
            assert bounds["min"][axis] >= STATIONS[station_id]["bounds"]["min"][axis] - .002, station_id + " crosses minimum source bound"
            assert bounds["max"][axis] <= STATIONS[station_id]["bounds"]["max"][axis] + .002, station_id + " crosses maximum source bound"
        added[station_id] = {"objects": objects, "bounds": bounds}
    prepare_previews()
    scene = bpy.context.scene
    scene["phase"] = "Sprint 7 — Phase 7.4"
    scene["parentSource"] = str(SOURCE.relative_to(ROOT))
    scene["stationEvidence"] = "Decorative tools/files and controlled titles only. Canonical technology/career/contact content supplied by accessible web HTML."
    scene.camera = bpy.data.objects["Preview_v3_hub"]
    # Persist the editable full environment before export batching begins.
    bpy.ops.wm.save_as_mainfile(filepath=str(MASTER))
    stats = export_stations([obj for station in added.values() for obj in station["objects"]])
    assert stats["bytes"] <= 1_200_000, "station kit exceeds 1.2 MB"
    assert stats["triangles"] < 12_000, "station kit exceeds 12k triangles"
    assert stats["primitives"] <= 13, "station kit exceeds 13 primitives"
    assert stats["uvPrimitives"] == stats["primitives"], "station primitive lost UV data"
    assert stats["normalPrimitives"] == stats["primitives"], "station primitive lost normal data"
    assert stats["normalMappedMaterials"] >= 1, "existing oak normal map was not exported"
    assert stats["opaqueMaterials"] == stats["materials"], "station materials must be opaque"
    assert not stats["externalResources"], "station GLB contains an external texture/resource"
    assert set(stats["hitBounds"]) == {station["hitNode"] for station in STATIONS.values()}, "station hit-node contract changed"
    assert all(name.startswith(("station__", "stationhit__")) for name in stats["nodes"]), "non-station parent geometry exported"
    v2 = json.loads(ROOM_MANIFEST.read_text())
    total = v2["totalEssentialBytes"] + stats["bytes"]
    assert total <= 5_000_000, "essential shell + door + stations exceeds 5 MB"
    assert preserved_resources() == preserved, "parent assets/sources changed during station build"
    manifest = {
        "version": 3, "phase": "7.4", "units": "metres", "up": "Y",
        "generator": str(Path(__file__).relative_to(ROOT)), "source": str(MASTER.relative_to(ROOT)),
        "parentSource": str(SOURCE.relative_to(ROOT)), "blender": bpy.app.version_string,
        "coordinateMap": "Blender (Three.x,-Three.z,Three.y); GLTF Y-up export",
        "model": {"url": "/models/workshop-game/workshop-stations-v1.glb", "position": [0, 0, 0], "essential": True},
        "stations": {station_id: {**station, "sourceBounds": added[station_id]["bounds"], "sourceMeshObjects": len(added[station_id]["objects"])} for station_id, station in STATIONS.items()},
        "stats": stats, "previousEssentialBytes": v2["totalEssentialBytes"], "totalEssentialBytes": total,
        "budget": {"kitBytes": 1_200_000, "kitTrianglesExclusive": 12_000, "kitPrimitives": 13, "totalEssentialBytes": 5_000_000},
        "sha256": {"generator": sha(Path(__file__)), "blend": sha(MASTER), "model": sha(GLB)},
        "preservedPhase72And73Sha256": preserved,
        "preview": {"renderer": "Blender Cycles reference; actual web renderer is the acceptance gate", "poses": "Three exact web station views plus hub", "gates": "Closed", "previewLightsExported": False},
        "licence": "First-party original station geometry authored for Daniel's portfolio, reusing existing first-party WG_* PBR materials and packed textures. No downloaded assets, generative images, fabricated technology metrics, career dates or contact channels.",
    }
    (ASSETS / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
    print("WORKSHOP_STATIONS_ASSET_STATS " + json.dumps({"kit": stats, "totalEssentialBytes": total}), flush=True)
    if "--render" in sys.argv:
        render_previews()


if __name__ == "__main__":
    build()
