"""Export the approved, static workshop window rain to a new standalone GLB.

Run with Blender, supplying an absolute output path whose parent already exists::

    blender -b --factory-startup --python blender/export_workshop_rain.py -- \
        --output /absolute/path/lab-rain.glb

The output is never overwritten. This script does not save the Blender scene.
"""
import argparse
import os
import random
import sys
import tempfile
from pathlib import Path

import bpy


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", required=True, type=Path)
    args = parser.parse_args(sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else [])
    output = args.output
    if not output.is_absolute() or output.suffix.lower() != ".glb":
        parser.error("--output must be an absolute path ending in .glb")
    if not output.parent.is_dir():
        parser.error("the output directory must already exist")
    if os.path.lexists(output):
        raise FileExistsError(output)

    rng = random.Random(16)
    material = bpy.data.materials.new("visual1_rain")
    material.diffuse_color = (.44, .60, .72, 1)
    material.use_nodes = True
    bsdf = material.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (.32, .49, .61, 1)
    bsdf.inputs["Roughness"].default_value = .19
    bsdf.inputs["Metallic"].default_value = .12
    curve = bpy.data.curves.new("visual1_rain_streaks", "CURVE")
    curve.dimensions, curve.resolution_u, curve.bevel_depth, curve.bevel_resolution = "3D", 1, .0007, 0
    for _ in range(150):
        x, z = rng.uniform(.54, 1.96), rng.uniform(1.02, 2.38)
        length = rng.uniform(.025, .16)
        spline = curve.splines.new("POLY")
        spline.points.add(1)
        spline.points[0].co = (x, 4.875, z, 1)
        spline.points[1].co = (x + rng.uniform(-.004, .004), 4.875, max(1.01, z - length), 1)
    rain = bpy.data.objects.new("visual1_rain_streaks", curve)
    bpy.context.scene.collection.objects.link(rain)
    rain.data.materials.append(material)
    bpy.ops.object.select_all(action="DESELECT")
    rain.select_set(True)
    bpy.context.view_layer.objects.active = rain
    bpy.ops.object.convert(target="MESH")
    # Export beside the destination and link it atomically: even if another process
    # creates the destination during export, an existing file is never replaced.
    with tempfile.TemporaryDirectory(prefix=".workshop-rain-", dir=output.parent) as tmp:
        temporary_output = Path(tmp) / "rain.glb"
        bpy.ops.export_scene.gltf(filepath=str(temporary_output), export_format="GLB", use_selection=True,
                                  export_animations=False, export_apply=True, export_yup=True)
        os.link(temporary_output, output)
    print("VISUAL3_RAIN_EXPORTED", output, output.stat().st_size, flush=True)


if __name__ == "__main__":
    main()
