"""Approved Visual 1 lighting, opt-in for a copy of the raw workshop scene.

This function applies the original night look once, then the reviewed light values.
The existing bake script still calls night_look itself: its future integration must
replace that call with apply(), never call both. This module does not save, bake,
export, add the preview's rain or alter its cameras.
"""
from __future__ import annotations

import bpy
from mathutils import Vector

from lookdev_night import HDRI, night_look


LIGHT_ENERGY = {
    "hang_0": 72, "hang_1": 72, "hang_2": 72,
    "bench_lamp": 150, "pegboard_wash": 24,
    "window_cyan": 100, "monitor_purple": 42,
}
AREA_LIGHTS = (
    ("visual1_bench_bounce", (-3.35, 2.0, 2.36), (-3.45, 2.0, .7), 60, (1, .43, .18), 1.0),
    ("visual1_desk_task", (2.85, 2.25, 2.35), (3.35, 3.0, .75), 35, (1, .45, .18), .7),
    ("visual1_monitor_spill", (3.48, 3.0, 1.28), (2.2, 3.0, .75), 20, (.49, .60, 1.0), .7),
)
MARKER = "visual1_lighting_applied"


def apply(scene):
    """Set the approved look in memory; raise before changing an incompatible scene."""
    if scene != bpy.context.scene:
        raise RuntimeError("Visual 1 lighting requires the active Blender scene")
    if scene.get(MARKER) or bpy.data.objects.get("room_haze") or any(bpy.data.objects.get(name) for name, *_ in AREA_LIGHTS):
        raise RuntimeError("Visual 1 lighting or the base night look has already been applied")
    if not HDRI.is_file():
        raise FileNotFoundError(HDRI)
    for name in LIGHT_ENERGY:
        light = bpy.data.objects.get(name)
        if not light or light.type != "LIGHT":
            raise RuntimeError(f"Missing workshop light: {name}")
    floor = bpy.data.materials.get("floor")
    shader = floor and floor.use_nodes and floor.node_tree.nodes.get("Principled BSDF")
    output = scene.world and scene.world.use_nodes and scene.world.node_tree.nodes.get("World Output")
    if not bpy.data.objects.get("floor") or not shader or not output or not output.inputs["Volume"].links:
        raise RuntimeError("Expected raw workshop floor and world volume")

    night_look(scene)
    scene.view_settings.exposure = .15
    for name, energy in LIGHT_ENERGY.items():
        light = bpy.data.objects[name]
        light.data.energy = energy
        if name.startswith("hang_") or name == "bench_lamp":
            light.data.color = (1, .52, .20)
    for name, location, target, energy, color, size in AREA_LIGHTS:
        data = bpy.data.lights.new(name, "AREA")
        data.energy, data.color, data.shape, data.size = energy, color, "DISK", size
        obj = bpy.data.objects.new(name, data)
        scene.collection.objects.link(obj)
        obj.location = location
        obj.rotation_euler = (Vector(target) - obj.location).to_track_quat("-Z", "Y").to_euler()
    roughness = shader.inputs["Roughness"]
    for link in list(roughness.links):
        floor.node_tree.links.remove(link)
    roughness.default_value = .53
    scene[MARKER] = True
