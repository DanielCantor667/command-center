"""Imports scene objects into the current Blender scene from GLB assets."""

import os

import bpy

from .coordinates import to_blender_position, to_blender_rotation


def import_scene_objects(scene, assets_dir):
    imported = []

    for obj in scene["objects"]:
        model_path = os.path.join(assets_dir, f"{obj['asset']}.glb")
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"asset model not found: {model_path}")

        before = set(bpy.context.scene.objects)
        bpy.ops.import_scene.gltf(filepath=model_path)
        after = set(bpy.context.scene.objects)
        new_objects = list(after - before)

        if not new_objects:
            raise RuntimeError(f"import produced no objects for asset: {obj['asset']}")

        root = bpy.data.objects.new(obj["id"], None)
        bpy.context.scene.collection.objects.link(root)
        imported_set = set(new_objects)
        top_level_objects = [candidate for candidate in new_objects if candidate.parent not in imported_set]
        for candidate in top_level_objects:
            world_matrix = candidate.matrix_world.copy()
            candidate.parent = root
            candidate.matrix_world = world_matrix

        root.name = obj["id"]
        root.location = to_blender_position(obj["transform"]["position"])
        root.rotation_euler = to_blender_rotation(obj["transform"]["rotation"])
        root.scale = (obj["transform"]["scale"],) * 3

        imported.append(root)

    return imported
