"""Phase R.0 (specs/workshop-realism.md): night low-key look-dev on the current lab, for Daniel to approve the mood.

Never saves the scene. Usage:
  /Applications/Blender.app/Contents/MacOS/Blender --background blender/scenes/workshop-room-proto-v2.blend \
    --python-exit-code 1 --python blender/lookdev_night.py -- <out_dir> [samples] [width] [camera ...]

The room is lit only by what the camera can see: monitors, lamps, neon and the night city through the back window
(Poly Haven `shanghai_bund`, CC0). Fills and the ceiling wash go; the fake skyline boxes give way to the HDRI.
"""
from __future__ import annotations

import math
import sys
from pathlib import Path

import bpy
from mathutils import Vector

HDRI = Path("/Users/creativo/Documents/command-center-assets/polyhaven-hdri/shanghai_bund_4k.hdr")
ARGV = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
OUT = Path(ARGV[0]) if ARGV else Path("/tmp/lookdev")
SAMPLES = int(ARGV[1]) if len(ARGV) > 1 else 128
WIDTH = int(ARGV[2]) if len(ARGV) > 2 else 1600
CAMERAS = ARGV[3:] or ["main", "desk"]

# Light multipliers by name prefix: practicals stay, fills go, overheads become small warm pools.
LIGHTS = {
    "fill_warm": 0.0, "front_fill": 0.0, "ceiling_white": 0.0, "pegboard_wash": 0.15,
    "hang_": 0.3, "booth_": 0.22, "cone_cyan": 0.5, "door_cyan": 0.0,
    "monitor_purple": 1.6, "bench_lamp": 1.0,
}
# Emissive strength multipliers by material name.
EMISSION = {"white_glow": 0.0, "screen": 1.2, "cyan_glow": 0.8, "pink_glow": 0.7, "amber_glow": 1.0}


def scale_lights():
    for obj in bpy.data.objects:
        if obj.type != "LIGHT":
            continue
        for prefix, factor in LIGHTS.items():
            if obj.name.startswith(prefix):
                obj.data.energy *= factor
                break
    window = bpy.data.objects.get("window_cyan")
    if window:  # the city through the glass: cool, soft, from outside
        window.data.color, window.data.energy = (0.55, 0.68, 1.0), 70


def scale_emission():
    for material in bpy.data.materials:
        factor = EMISSION.get(material.name)
        if factor is None or not material.use_nodes:
            continue
        for node in material.node_tree.nodes:
            if node.type == "BSDF_PRINCIPLED":
                node.inputs["Emission Strength"].default_value *= factor


def night_city():
    for obj in bpy.data.objects:  # stylised skyline and flat sky cards
        if obj.name.startswith(("bldg_", "bwin_", "window_sky", "door_sky")):
            obj.hide_render = True
    world = bpy.context.scene.world
    nodes, links = world.node_tree.nodes, world.node_tree.links
    env = nodes.new("ShaderNodeTexEnvironment")
    env.image = bpy.data.images.load(str(HDRI))
    mapping, coords = nodes.new("ShaderNodeMapping"), nodes.new("ShaderNodeTexCoord")
    # The Pudong skyline (across the river) turned to +Y, the back window. 46 deg, the brightest band, is the lit promenade trees.
    mapping.inputs["Rotation"].default_value[2] = math.radians(226)
    # Tilted up: the HDRI is shot at street level (crowd in front); the window should look out from a few floors up.
    mapping.inputs["Rotation"].default_value[0] = math.radians(12)
    links.new(coords.outputs["Generated"], mapping.inputs["Vector"])
    links.new(mapping.outputs["Vector"], env.inputs["Vector"])
    # The city reads bright through the glass but only lends the room a little light.
    background, seen = nodes["Background"], nodes.new("ShaderNodeBackground")
    path, mix = nodes.new("ShaderNodeLightPath"), nodes.new("ShaderNodeMixShader")
    for node, strength in ((background, 0.3), (seen, 0.9)):
        links.new(env.outputs["Color"], node.inputs["Color"])
        node.inputs["Strength"].default_value = strength
    links.new(path.outputs["Is Camera Ray"], mix.inputs["Fac"])
    links.new(background.outputs["Background"], mix.inputs[1])
    links.new(seen.outputs["Background"], mix.inputs[2])
    links.new(mix.outputs["Shader"], nodes["World Output"].inputs["Surface"])
    # The world-wide haze swallowed everything at infinity (the city): keep it, but only inside the room.
    output = nodes["World Output"]
    for link in list(output.inputs["Volume"].links):
        haze = link.from_node
        links.remove(link)
    bpy.ops.mesh.primitive_cube_add(location=(0.0, 0.0, 1.6))
    room = bpy.context.object
    room.name = "room_haze"
    floor = bpy.data.objects["floor"]
    room.location.y, room.dimensions = floor.location.y, (8.0, floor.dimensions.y, 3.2)
    material = bpy.data.materials.new("room_haze")
    material.use_nodes = True
    tree = material.node_tree
    tree.nodes.remove(tree.nodes["Principled BSDF"])
    scatter = tree.nodes.new("ShaderNodeVolumeScatter")
    scatter.inputs["Density"].default_value = haze.inputs["Density"].default_value
    scatter.inputs["Color"].default_value = haze.inputs["Color"].default_value
    tree.links.new(scatter.outputs["Volume"], tree.nodes["Material Output"].inputs["Volume"])
    room.data.materials.append(material)


# Look-dev only cameras (location, target, lens mm); the scene's own cam_<name> win when both exist.
CLOSE_UPS = {"deskclose": ((2.05, 1.75, 1.32), (3.75, 3.2, 0.98), 30)}


def camera(name):
    existing = bpy.data.objects.get(f"cam_{name}")
    if existing:
        return existing
    location, target, lens = CLOSE_UPS[name]
    data = bpy.data.cameras.new(name)
    data.lens = lens
    cam = bpy.data.objects.new(f"cam_{name}", data)
    bpy.context.scene.collection.objects.link(cam)
    cam.location = location
    cam.rotation_euler = (Vector(target) - Vector(location)).to_track_quat("-Z", "Y").to_euler()
    return cam


def main():
    scale_lights()
    scale_emission()
    night_city()
    scene = bpy.context.scene
    scene.cycles.samples = SAMPLES
    scene.render.resolution_x, scene.render.resolution_y = WIDTH, WIDTH * 9 // 16
    scene.view_settings.view_transform = "AgX"
    scene.view_settings.look = "AgX - Punchy"
    scene.view_settings.exposure = 0.3
    OUT.mkdir(parents=True, exist_ok=True)
    for name in CAMERAS:
        scene.camera = camera(name)
        scene.render.filepath = str(OUT / f"night-{name}.png")
        bpy.ops.render.render(write_still=True)
        print("rendered", scene.render.filepath)


main()
