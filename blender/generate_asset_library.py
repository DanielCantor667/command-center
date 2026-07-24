"""Generate Command Center's minimal office catalog as portable GLB assets.

Usage: blender --background --python blender/generate_asset_library.py -- apps/web/public/models
"""

import os
import sys

import bpy

ASSET_IDS = ("office", "meeting_room", "warehouse", "truck", "rack", "computer", "employee", "desk", "chair", "tree", "reception", "factory")


def clear_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)


def material(name, color):
    value = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    value.use_nodes = True
    value.diffuse_color = (*color, 1)
    principled = value.node_tree.nodes.get("Principled BSDF")
    if principled:
        principled.inputs["Base Color"].default_value = (*color, 1)
        principled.inputs["Roughness"].default_value = 0.65
    return value


def box(name, location, dimensions, color):
    bpy.ops.mesh.primitive_cube_add(location=location)
    value = bpy.context.active_object
    value.name = name
    value.dimensions = dimensions
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    value.data.materials.append(material(name + "Material", color))


def cylinder(name, location, radius, depth, color, vertices=12):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=depth, location=location)
    value = bpy.context.active_object
    value.name = name
    value.data.materials.append(material(name + "Material", color))


def sphere(name, location, radius, color):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=8, radius=radius, location=location)
    value = bpy.context.active_object
    value.name = name
    value.data.materials.append(material(name + "Material", color))


def build(asset):
    navy, slate, steel = (0.05, 0.09, 0.16), (0.2, 0.26, 0.34), (0.55, 0.62, 0.7)
    blue, green, wood, glass = (0.08, 0.32, 0.75), (0.06, 0.55, 0.25), (0.43, 0.24, 0.12), (0.28, 0.62, 0.8)
    if asset == "office":
        box("floor", (0, -.08, 0), (10, .16, 10), navy); box("back_wall", (0, 1.5, -4.95), (10, 3, .1), slate); box("side_wall", (-4.95, 1.5, 0), (.1, 3, 10), slate)
    elif asset == "meeting_room":
        box("table", (0, .76, 0), (2.7, .16, 1.1), wood); box("back_wall", (0, 1.1, -1.1), (2.4, 2.2, .08), steel)
        for x in (-1.15, 1.15): box("glass_wall", (x, 1.1, 0), (.08, 2.2, 2.4), glass)
    elif asset == "warehouse":
        box("floor", (0, -.08, 0), (8, .16, 6), navy)
        for x in (-3.6, 3.6): box("wall", (x, 2, 0), (.12, 4, 6), slate)
    elif asset == "truck":
        box("body", (0, .75, 0), (2.6, 1.3, 1.1), blue); box("cab", (1.15, .65, 0), (.7, 1.1, 1.1), steel)
        for x in (-.8, .95):
            for z in (-.62, .62): cylinder("wheel", (x, .33, z), .32, .18, navy)
    elif asset == "rack":
        for x in (-.35, .35): box("post", (x, .9, 0), (.08, 1.8, .6), navy)
        for y in (.32, .9, 1.48): box("shelf", (0, y, 0), (.82, .06, .62), steel)
    elif asset == "computer":
        box("screen", (0, .55, 0), (.82, .5, .06), navy); box("stand", (0, .22, 0), (.06, .25, .06), steel); box("base", (0, .07, 0), (.46, .04, .28), steel)
    elif asset == "employee":
        cylinder("body", (0, .82, 0), .24, .95, blue); sphere("head", (0, 1.55, 0), .23, (0.9, .65, .45))
    elif asset == "desk":
        box("top", (0, .78, 0), (1.6, .12, .75), wood)
        for x in (-.65, .65):
            for z in (-.26, .26): box("leg", (x, .37, z), (.08, .75, .08), navy)
    elif asset == "chair":
        box("seat", (0, .48, 0), (.62, .14, .62), slate); box("back", (0, .88, .25), (.62, .68, .12), steel); cylinder("stem", (0, .22, 0), .05, .46, navy); cylinder("base", (0, .03, 0), .42, .06, navy, 5)
    elif asset == "tree":
        cylinder("pot", (0, .22, 0), .32, .44, wood); sphere("leaves", (0, 1.05, 0), .7, green)
    elif asset == "reception":
        box("counter", (0, .65, 0), (3.2, 1.3, .75), blue); box("countertop", (0, 1.36, -.05), (3.45, .12, .9), (0.85, .9, .95))
    elif asset == "factory":
        box("floor", (0, -.08, 0), (9, .16, 7), navy); box("building", (0, 2, 0), (7, 4, 5), slate)
        for x in (-2.2, 0, 2.2): box("window", (x, 2.1, -2.55), (1.2, 1.1, .05), glass)


def main():
    args = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    if len(args) != 1:
        raise SystemExit("usage: generate_asset_library.py -- <models-dir>")
    os.makedirs(args[0], exist_ok=True)
    for asset in ASSET_IDS:
        clear_scene()
        build(asset)
        output_path = os.path.join(args[0], asset + ".glb")
        bpy.ops.export_scene.gltf(filepath=output_path, export_format="GLB", use_selection=False)
        print("generated", output_path)


if __name__ == "__main__":
    main()
