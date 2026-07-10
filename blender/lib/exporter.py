"""Exports the assembled scene as GLB."""

import bpy


def export_glb(output_path):
    bpy.ops.export_scene.gltf(filepath=output_path, export_format="GLB")
