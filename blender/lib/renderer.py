"""Renders the current scene to a PNG using Cycles.

Assumes the base .blend file (opened before this script runs) already has a
camera, lights and HDRI set up -- this pipeline never builds a scene from
scratch, it only populates an existing template.
"""

import bpy
from mathutils import Vector


def configure_environment(scene):
    """Normalize the lightweight template so output is readable without an HDRI."""
    scene.render.film_transparent = False
    scene.view_settings.look = 'AgX - Medium High Contrast'

    if scene.world and scene.world.use_nodes:
        background = scene.world.node_tree.nodes.get('Background')
        if background:
            background.inputs['Color'].default_value = (0.015, 0.025, 0.05, 1)
            background.inputs['Strength'].default_value = 0.25

    sun = bpy.data.objects.get('Sun')
    if sun and sun.type == 'LIGHT':
        sun.data.energy = 1.5


def ensure_ground_plane():
    if bpy.data.objects.get('RenderGround'):
        return

    bpy.ops.mesh.primitive_plane_add(size=30, location=(0, 0, -0.02))
    ground = bpy.context.active_object
    ground.name = 'RenderGround'
    material = bpy.data.materials.new('RenderGroundMaterial')
    material.use_nodes = True
    principled = material.node_tree.nodes.get('Principled BSDF')
    if principled:
        principled.inputs['Base Color'].default_value = (0.04, 0.07, 0.12, 1)
        principled.inputs['Roughness'].default_value = 0.9
    ground.data.materials.append(material)


def frame_camera(scene):
    """Frame imported meshes so a generated scene does not render as a distant dot."""
    meshes = [obj for obj in scene.objects if obj.type == 'MESH' and obj.name != 'RenderGround']
    if not meshes or scene.camera is None:
        return

    corners = [obj.matrix_world @ Vector(corner) for obj in meshes for corner in obj.bound_box]
    minimum = Vector((min(point.x for point in corners), min(point.y for point in corners), min(point.z for point in corners)))
    maximum = Vector((max(point.x for point in corners), max(point.y for point in corners), max(point.z for point in corners)))
    target = (minimum + maximum) / 2
    extent = max((maximum - minimum).length, 1.0)
    camera = scene.camera
    camera.location = target + Vector((extent * 1.7, -extent * 1.7, extent * 1.25))
    camera.rotation_euler = (target - camera.location).to_track_quat('-Z', 'Y').to_euler()


def render_png(output_path, resolution=(1920, 1080)):
    scene = bpy.context.scene

    if scene.camera is None:
        raise RuntimeError("scene has no camera; the base .blend template must define one")

    scene.render.engine = "CYCLES"
    configure_environment(scene)
    ensure_ground_plane()
    frame_camera(scene)
    scene.render.resolution_x = resolution[0]
    scene.render.resolution_y = resolution[1]
    scene.render.filepath = output_path
    scene.render.image_settings.file_format = "PNG"

    bpy.ops.render.render(write_still=True)
