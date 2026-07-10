"""Renders the current scene to a PNG using Cycles.

Assumes the base .blend file (opened before this script runs) already has a
camera, lights and HDRI set up -- this pipeline never builds a scene from
scratch, it only populates an existing template.
"""

import bpy


def render_png(output_path, resolution=(1920, 1080)):
    scene = bpy.context.scene

    if scene.camera is None:
        raise RuntimeError("scene has no camera; the base .blend template must define one")

    scene.render.engine = "CYCLES"
    scene.render.resolution_x = resolution[0]
    scene.render.resolution_y = resolution[1]
    scene.render.filepath = output_path
    scene.render.image_settings.file_format = "PNG"

    bpy.ops.render.render(write_still=True)
