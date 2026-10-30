"""Phase R.1 (specs/workshop-realism.md): split the Sketchfab desk models into clean parts for the contact desk.

  /Applications/Blender.app/Contents/MacOS/Blender --background --python-exit-code 1 --python blender/prepare_desk_kit.py

Reads ASSETS/sketchfab/{gaming_desktop_pc,ultrawide_monitor_desk_mount,gaming_chair}/model.glb and writes ASSETS/kits/desk/<part>.glb:
metres, the user's side towards -X (as at the contact desk), origin at the bottom centre. Left out: the kit's flat
monitor, its desk plank, its cables (they no longer reach once the parts move) and every brand logo, mesh or texture
(specs/workshop-realism.md: nothing with a third-party brand on screen).
"""
from __future__ import annotations

import math
from pathlib import Path

import bpy
import numpy as np
from mathutils import Matrix, Vector

ASSETS = Path("/Users/creativo/Documents/command-center-assets")
SK = ASSETS / "sketchfab"
OUT = ASSETS / "kits" / "desk"
PC_SCALE = 0.1  # the kit is modelled in decimetres: its keyboard is 4.07 long, a real one ~0.41 m
CHAIR_HEIGHT = 1.28  # metres, a typical high-back gaming chair
CHAIR_TURN = -19  # the model's seat is swivelled off its base: this squares the backrest to -X


# Textures of the gaming PC kit that carry a brand (checked on a contact sheet of every image in the file).
LOGOS = {
    "blank": ["Image_7", "Image_8", "Image_15", "Image_16", "Image_17", "Image_22", "Image_25", "Image_26", "Image_50"],
    "hub": ["Image_3", "Image_24", "Image_28"],  # fan with the eagle on its hub: the hub goes dark
    "blur": ["Image_4", "Image_6", "Image_13", "Image_14", "Image_30", "Image_31"],  # board, GPU and PSU labels: tone stays, text goes
    "matte": ["Image_34"],  # the mouse shell's signature wave pattern
}


def clean_logos():
    for mode, names in LOGOS.items():
        for name in names:
            img = bpy.data.images[name]
            w, h = img.size
            px = np.array(img.pixels[:], dtype=np.float32).reshape(h, w, 4)
            if mode in ("blank", "matte"):
                px[..., :3] = 0.02 if mode == "blank" else 0.035
                px[..., 3] = 1.0  # the logo shape also lives in alpha
            elif mode == "hub":
                yy, xx = np.mgrid[0:h, 0:w]
                px[((xx - w / 2) ** 2 + (yy - h / 2) ** 2) < (0.2 * min(w, h)) ** 2, :3] = 0.03
            else:
                small = 12
                block = px[: h - h % small, : w - w % small, :3].reshape(small, (h - h % small) // small, small, (w - w % small) // small, 3)
                px[: h - h % small, : w - w % small, :3] = np.repeat(np.repeat(block.mean(axis=(1, 3)), (h - h % small) // small, 0), (w - w % small) // small, 1)
            img.pixels[:] = px.ravel()
            img.update()
            img.pack()


def bounds(objects):
    pts = [o.matrix_world @ Vector(c) for o in objects for c in o.bound_box]
    lo = Vector([min(p[i] for p in pts) for i in range(3)])
    hi = Vector([max(p[i] for p in pts) for i in range(3)])
    return lo, hi


def import_glb(path):
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=str(path))
    return [o for o in bpy.data.objects if o not in before and o.type == "MESH"]


def clusters(objects, eps=0.05):
    """Union of meshes whose bounding boxes touch: one cluster per physical part."""
    boxes = {o: bounds([o]) for o in objects}
    parent = {o: o for o in objects}

    def find(o):
        while parent[o] is not o:
            parent[o] = parent[parent[o]]
            o = parent[o]
        return o

    for i, a in enumerate(objects):
        la, ha = boxes[a]
        for b in objects[i + 1:]:
            lb, hb = boxes[b]
            if all(la[k] - eps <= hb[k] and lb[k] - eps <= ha[k] for k in range(3)):
                parent[find(a)] = find(b)
    groups = {}
    for o in objects:
        groups.setdefault(find(o), []).append(o)
    return list(groups.values())


def export_part(name, objects, scale, turn_deg):
    """Join, scale, turn the user's side to -X, put the origin at the bottom centre and export."""
    bpy.ops.object.select_all(action="DESELECT")
    for o in objects:
        mw = o.matrix_world.copy()
        o.parent = None
        o.matrix_world = mw
        o.select_set(True)
    bpy.context.view_layer.objects.active = objects[0]
    if len(objects) > 1:
        bpy.ops.object.join()
    part = bpy.context.view_layer.objects.active
    part.name = name
    part.data.transform(part.matrix_world)
    part.matrix_world = Matrix.Identity(4)
    part.data.transform(Matrix.Rotation(math.radians(turn_deg), 4, "Z") @ Matrix.Scale(scale, 4))
    lo, hi = bounds([part])
    part.data.transform(Matrix.Translation(-Vector(((lo.x + hi.x) / 2, (lo.y + hi.y) / 2, lo.z))))
    part.data.update()
    OUT.mkdir(parents=True, exist_ok=True)
    bpy.ops.object.select_all(action="DESELECT")
    part.select_set(True)
    bpy.ops.export_scene.gltf(filepath=str(OUT / f"{name}.glb"), use_selection=True, export_format="GLB")
    lo, hi = bounds([part])
    print("PART", name, "dims m", tuple(round(v, 3) for v in hi - lo), "tris", len(part.data.polygons))
    bpy.data.objects.remove(part)


def gaming_pc():
    meshes = import_glb(SK / "gaming_desktop_pc" / "model.glb")
    junk = []
    for o in meshes:
        lo, hi = bounds([o])
        size = hi - lo
        if o.name.startswith("Bezier") or size.y > 10 or size.x > 6 or "logo" in o.name.lower():
            junk.append(o)  # cables, the desk plank, brand logos
    parts = [o for o in meshes if o not in junk]
    found = {}
    for group in clusters(parts):
        names = " ".join(o.name.lower() for o in group)
        lo, hi = bounds(group)
        if "case fans" in names:
            found["tower"] = group
        elif len(group) > 300:
            found["keyboard"] = group
        elif len(group) == 3:
            found.setdefault("speakers", []).append(group)
        else:  # the flat monitor sits at the back (x < -0.5), the mouse on its pad at the front
            front = [o for o in group if sum(bounds([o]), Vector()).x / 2 > 0.5]
            found["mouse"] = front  # mouse + its pad
            junk += [o for o in group if o not in front]
    for o in junk:
        bpy.data.objects.remove(o)
    clean_logos()
    export_part("tower", found["tower"], PC_SCALE, 180)
    export_part("keyboard", found["keyboard"], PC_SCALE, 180)
    export_part("mouse", found["mouse"], PC_SCALE, 180)
    export_part("speaker", found["speakers"][0], PC_SCALE, 180)
    for group in found["speakers"][1:]:
        for o in group:
            bpy.data.objects.remove(o)


def ultrawide():
    meshes = import_glb(SK / "ultrawide_monitor_desk_mount" / "model.glb")
    export_part("ultrawide", meshes, 1.0, 180)  # already metres; screen faces +X in the file


def chair():
    meshes = [o for o in import_glb(SK / "gaming_chair" / "model.glb") if o.modifiers]  # the rest is a bone-shape sphere
    bpy.ops.object.select_all(action="DESELECT")
    for o in meshes:
        o.select_set(True)
    bpy.context.view_layer.objects.active = meshes[0]
    bpy.ops.object.convert(target="MESH")  # bake the rig's pose, the desk chair never moves
    lo, hi = bounds(meshes)
    bpy.data.materials["plasticSmoothPink"].node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (0.017, 0.014, 0.017, 1)
    export_part("chair", meshes, CHAIR_HEIGHT / (hi.z - lo.z), CHAIR_TURN)


def main():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    gaming_pc()
    bpy.ops.wm.read_factory_settings(use_empty=True)
    ultrawide()
    bpy.ops.wm.read_factory_settings(use_empty=True)
    chair()


main()
