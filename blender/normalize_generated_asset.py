"""Normalize one generated GLB prop for the Workshop Game — Sprint 8.

Run (no third-party dependencies):
  /Applications/Blender.app/Contents/MacOS/Blender --background --factory-startup \
    --python-exit-code 1 --python blender/normalize_generated_asset.py -- \
    <input.glb> <output.glb> --name <id> --height <metres> [--drop-base] [--max-tris N] [--texture N]

Output: a single mesh named ``prop__<id>``, Y-up, pivot at the centre of its
ground contact, scaled so its height is ``--height`` metres, embedded JPEG
textures. ``--drop-base`` removes the flat slab image-to-3D engines build from
a reference's ground shadow.
"""
from __future__ import annotations

import argparse
import sys

import bmesh
import bpy


def arguments():
    parser = argparse.ArgumentParser()
    parser.add_argument("source")
    parser.add_argument("output")
    parser.add_argument("--name", required=True)
    parser.add_argument("--height", type=float, required=True)
    parser.add_argument("--drop-base", action="store_true")
    parser.add_argument("--max-tris", type=int, default=8000)
    parser.add_argument("--texture", type=int, default=512)
    return parser.parse_args(sys.argv[sys.argv.index("--") + 1:])


def islands(bm):
    seen = set()
    for face in bm.faces:
        if face.index in seen:
            continue
        stack, island = [face], []
        seen.add(face.index)
        while stack:
            current = stack.pop()
            island.append(current)
            for edge in current.edges:
                for linked in edge.link_faces:
                    if linked.index not in seen:
                        seen.add(linked.index)
                        stack.append(linked)
        yield island


def drop_base(bm):
    """Delete near-horizontal faces in the lowest 2.5% and the scraps they leave."""
    zs = [v.co.z for v in bm.verts]
    low, span = min(zs), max(zs) - min(zs)
    flat = [f for f in bm.faces if f.calc_center_median().z < low + span * .025 and abs(f.normal.z) > .7]
    bmesh.ops.delete(bm, geom=flat, context="FACES")
    bm.faces.ensure_lookup_table()
    bm.faces.index_update()
    scraps = [f for island in islands(bm) if len(island) < 400 and max(v.co.z for f in island for v in f.verts) < low + span * .08 for f in island]
    bmesh.ops.delete(bm, geom=scraps, context="FACES")
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if not v.link_faces], context="VERTS")


def main():
    args = arguments()
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=args.source)
    meshes = [o for o in bpy.context.scene.objects if o.type == "MESH"]
    assert meshes, "no mesh in source"
    bpy.ops.object.select_all(action="DESELECT")
    for obj in meshes:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = meshes[0]
    if len(meshes) > 1:
        bpy.ops.object.join()
    obj = bpy.context.view_layer.objects.active
    bpy.ops.object.parent_clear(type="CLEAR_KEEP_TRANSFORM")
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    for other in [o for o in bpy.context.scene.objects if o is not obj]:
        bpy.data.objects.remove(other, do_unlink=True)

    bm = bmesh.new()
    bm.from_mesh(obj.data)
    bm.faces.ensure_lookup_table()
    if args.drop_base:
        drop_base(bm)
    xs, ys, zs = ([v.co[i] for v in bm.verts] for i in range(3))
    scale = args.height / (max(zs) - min(zs))
    bmesh.ops.translate(bm, vec=(-(min(xs) + max(xs)) / 2, -(min(ys) + max(ys)) / 2, -min(zs)), verts=bm.verts)
    bmesh.ops.scale(bm, vec=(scale, scale, scale), verts=bm.verts)
    bm.to_mesh(obj.data)
    bm.free()

    triangles = sum(len(p.vertices) - 2 for p in obj.data.polygons)
    if triangles > args.max_tris:
        modifier = obj.modifiers.new("budget", "DECIMATE")
        modifier.ratio = args.max_tris / triangles
        bpy.ops.object.modifier_apply(modifier=modifier.name)
    obj.name = obj.data.name = "prop__" + args.name
    for index, slot in enumerate(obj.material_slots):
        slot.material.name = f"prop__{args.name}__{index}"
    for image in bpy.data.images:
        if image.size[0] > args.texture:
            image.scale(args.texture, max(1, round(image.size[1] * args.texture / image.size[0])))
    bpy.ops.export_scene.gltf(filepath=args.output, export_format="GLB", export_image_format="JPEG", export_jpeg_quality=85, export_yup=True)
    triangles = sum(len(p.vertices) - 2 for p in obj.data.polygons)
    print(f"NORMALIZED {args.name} triangles={triangles} height={args.height}")


main()
