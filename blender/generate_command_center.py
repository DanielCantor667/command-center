"""Generate Engineering City's Command Center source scene, GLBs and render QA.

This is deliberately separate from ``generate_asset_library.py``: the office
catalog remains a stable pipeline, while this script owns the city landmark.
It creates first-party procedural geometry only, so the public GLBs are safe
to redistribute.

Run from the repository root:

    /Applications/Blender.app/Contents/MacOS/Blender --background \
      --python blender/generate_command_center.py -- --engine BLENDER_EEVEE_NEXT

The default outputs are:

    blender/scenes/engineering-city-v1.blend
    apps/web/public/models/city/command-center.glb
    apps/web/public/models/city/command-center-lod1.glb
    blender/output/engineering-city/command-center-*.{png,exr}

Use ``--skip-render`` for a fast authoring/export pass.  Use ``--engine
CYCLES --samples 64`` for the final render master once the composition is
approved.
"""

from __future__ import annotations

import argparse
import json
import math
import os
import sys
from dataclasses import dataclass
from pathlib import Path

import bpy

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from lib.engineering_city import (  # noqa: E402
    add_area_light,
    add_box,
    add_camera,
    add_cylinder,
    add_empty,
    add_hex_ring,
    add_point_light,
    add_prism,
    add_tapered_prism,
    add_uv_sphere,
    aim_at,
    clear_scene,
    configure_scene,
    create_master_materials,
    create_volume_material,
    descendants,
    ensure_collection,
    export_glb,
    link_to_collection,
    mesh_statistics,
    radial_position,
    set_bloom_amount,
    srgb_hex,
)


LANDMARK_ID = "command-center"
LANDMARK_HEIGHT_METERS = 72.0
LOD0_TRIANGLE_BUDGET = 18_000
LOD1_TRIANGLE_BUDGET = 5_000
DEFAULT_SCENE_PATH = "blender/scenes/engineering-city-v1.blend"
DEFAULT_MODELS_DIR = "apps/web/public/models/city"
DEFAULT_RENDER_DIR = "blender/output/engineering-city"


@dataclass(frozen=True)
class CameraPreset:
    name: str
    lens_mm: float
    location: tuple[float, float, float]
    target: tuple[float, float, float]
    fog: float
    bloom: float
    exposure: float
    resolution: tuple[int, int]
    camera_type: str = "PERSP"
    ortho_scale: float = 100.0


CAMERA_PRESETS = (
    CameraPreset(
        "hero-aerial-v1",
        35,
        (100.0, -100.0, 145.0),
        (0.0, 0.0, 32.0),
        0.18,
        0.14,
        1.20,
        (1920, 1080),
    ),
    CameraPreset(
        "district-portrait-v1",
        50,
        (130.0, -130.0, 180.0),
        (0.0, 0.0, 32.0),
        0.14,
        0.10,
        1.10,
        (1600, 900),
    ),
    CameraPreset(
        "architecture-sheet-v1",
        70,
        (0.0, -118.0, 36.0),
        (0.0, 0.0, 36.0),
        0.0,
        0.0,
        1.00,
        (1600, 1200),
        "ORTHO",
        120.0,
    ),
    CameraPreset(
        "detail-material-v1",
        85,
        (20.0, -30.0, 50.0),
        (6.0, -8.0, 40.0),
        0.06,
        0.06,
        1.00,
        (1600, 900),
    ),
)


def cli_arguments() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--scene", default=DEFAULT_SCENE_PATH, help="editable master .blend output")
    parser.add_argument("--models-dir", default=DEFAULT_MODELS_DIR, help="public GLB destination")
    parser.add_argument("--render-dir", default=DEFAULT_RENDER_DIR, help="PNG/EXR QA destination")
    parser.add_argument("--engine", choices=("BLENDER_EEVEE_NEXT", "CYCLES"), default="BLENDER_EEVEE_NEXT")
    parser.add_argument("--samples", type=int, default=32, help="Cycles samples when --engine CYCLES")
    parser.add_argument("--skip-render", action="store_true", help="only create the .blend and GLB files")
    parser.add_argument("--render-only", action="store_true", help="create source scene and QA renders without GLB export")
    parser.add_argument("--resolution-scale", type=float, default=1.0, help="scale QA renders, between 0.25 and 1")
    argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    args = parser.parse_args(argv)
    if not 0.25 <= args.resolution_scale <= 1.0:
        parser.error("--resolution-scale must be between 0.25 and 1")
    if args.render_only and args.skip_render:
        parser.error("--render-only cannot be combined with --skip-render")
    return args


def _tag(obj: bpy.types.Object, role: str, lod: int) -> bpy.types.Object:
    obj["engineering_city_role"] = role
    obj["engineering_city_lod"] = lod
    obj["engineering_city_landmark"] = LANDMARK_ID
    return obj


def _front_position(radius: float, z: float) -> tuple[float, float, float]:
    # The -Y face is the public entry/front; faces are aligned in 60° increments.
    return (0.0, -radius, z)


def _radial_box(
    name: str,
    face_index: int,
    radius: float,
    z: float,
    tangent_width: float,
    radial_depth: float,
    height: float,
    collection: bpy.types.Collection,
    material: bpy.types.Material,
    root: bpy.types.Object,
    lod: int,
    bevel: float = 0.0,
) -> bpy.types.Object:
    angle = math.radians(face_index * 60)
    obj = add_box(
        name,
        radial_position(radius, angle, z),
        (tangent_width, radial_depth, height),
        collection,
        material,
        root,
        rotation_z=angle + math.pi / 2,
        bevel=bevel,
    )
    return _tag(obj, "architecture", lod)


def _entry_frame(
    collection: bpy.types.Collection,
    materials: dict[str, bpy.types.Material],
    root: bpy.types.Object,
    lod: int,
) -> None:
    """A 30°/60° portal makes the front legible at thumbnail size."""
    dark = materials["black_titanium"]
    green = materials["emerald"]
    glass = materials["smoke_glass"]
    # All boxes face forward on the -Y side.  The diagonal braces are ±30°.
    for name, location, rotation in (
        ("CC_EntryPillar_L", (-7.2, -16.8, 8.0), 0.0),
        ("CC_EntryPillar_R", (7.2, -16.8, 8.0), 0.0),
        ("CC_EntryBrace_L", (-4.5, -16.8, 14.5), math.radians(-30)),
        ("CC_EntryBrace_R", (4.5, -16.8, 14.5), math.radians(30)),
    ):
        obj = add_box(name, location, (1.0, 1.2, 13.5), collection, dark, root, rotation_z=rotation, bevel=0.16)
        _tag(obj, "architecture", lod)
    lintel = add_box("CC_EntryLintel", (0.0, -16.8, 17.0), (14.6, 1.2, 1.0), collection, dark, root, bevel=0.16)
    _tag(lintel, "architecture", lod)
    atrium = add_box("CC_EntrySmokeGlass", (0.0, -16.15, 9.0), (11.5, 0.28, 12.8), collection, glass, root, bevel=0.05)
    _tag(atrium, "glass", lod)
    threshold = add_box("CC_EntryEnergyThreshold", (0.0, -17.45, 1.65), (10.8, 0.18, 0.22), collection, green, root, bevel=0.03)
    _tag(threshold, "emissive", lod)


def _vertical_window_bands(
    collection: bpy.types.Collection,
    materials: dict[str, bpy.types.Material],
    root: bpy.types.Object,
    lod: int,
    sections: tuple[tuple[float, float], ...],
) -> None:
    """Add six groups of tall, smoke-glass windows plus thin emerald spine lines."""
    glass = materials["smoke_glass"]
    technical = materials["technical"]
    emerald = materials["emerald"]
    for face in range(6):
        for section_index, (z, height) in enumerate(sections):
            panel = _radial_box(
                f"CC_WindowBand_{face + 1}_{section_index + 1}",
                face,
                11.85,
                z,
                7.3,
                0.22,
                height,
                collection,
                glass,
                root,
                lod,
                bevel=0.03,
            )
            panel["engineering_city_role"] = "glass"
            if section_index < len(sections) - 1:
                separator = _radial_box(
                    f"CC_WindowSeparator_{face + 1}_{section_index + 1}",
                    face,
                    12.03,
                    z + height / 2 + 0.25,
                    7.8,
                    0.38,
                    0.30,
                    collection,
                    technical,
                    root,
                    lod,
                    bevel=0.03,
                )
                separator["engineering_city_role"] = "technical"
        spine = _radial_box(
            f"CC_EnergySpine_{face + 1}",
            face,
            12.15,
            36.5,
            0.22,
            0.18,
            51.0,
            collection,
            emerald,
            root,
            lod,
            bevel=0.02,
        )
        spine["engineering_city_role"] = "emissive"


def _data_rings(
    collection: bpy.types.Collection,
    materials: dict[str, bpy.types.Material],
    root: bpy.types.Object,
    lod: int,
    include_satellites: bool,
) -> None:
    dark = materials["dark_steel"]
    green = materials["emerald"]
    for ring_index, z in enumerate((23.0, 41.0, 59.0), start=1):
        frame = add_hex_ring(
            f"CC_DataRingFrame_{ring_index}",
            (0.0, 0.0, z),
            14.0 - ring_index * 0.35,
            12.9 - ring_index * 0.35,
            0.72,
            collection,
            dark,
            root,
            bevel=0.10,
        )
        _tag(frame, "architecture", lod)
        glow = add_hex_ring(
            f"CC_DataRingEnergy_{ring_index}",
            (0.0, 0.0, z + 0.22),
            13.70 - ring_index * 0.35,
            13.22 - ring_index * 0.35,
            0.16,
            collection,
            green,
            root,
            bevel=0.02,
        )
        _tag(glow, "emissive", lod)
        if include_satellites:
            for face in range(6):
                angle = math.radians(face * 60)
                node = add_cylinder(
                    f"CC_RingNode_{ring_index}_{face + 1}",
                    radial_position(14.4 - ring_index * 0.35, angle, z + 0.25),
                    0.42,
                    0.45,
                    collection,
                    green,
                    root,
                    vertices=8,
                    bevel=0.04,
                )
                _tag(node, "emissive", lod)


def build_command_center(
    collection: bpy.types.Collection,
    materials: dict[str, bpy.types.Material],
    lod: int,
) -> bpy.types.Object:
    """Build the 72 m hexagonal knowledge landmark for LOD0 or LOD1."""
    root = add_empty("CommandCenter" if lod == 0 else "CommandCenter_LOD1", collection)
    root["engineering_city_landmark"] = LANDMARK_ID
    root["engineering_city_lod"] = lod
    root["dimensions_meters"] = {"height": LANDMARK_HEIGHT_METERS, "baseRadius": 27.0}
    root["pivot"] = "ground-center"
    root["motion"] = "emissive pulse, 8 seconds, 0.70 to 1.00"

    black = materials["black_titanium"]
    steel = materials["dark_steel"]
    technical = materials["technical"]
    glass = materials["smoke_glass"]
    green = materials["emerald"]
    halo = materials["halo"]

    # Heavy hexagonal base: silhouette and scale must still read at 300 px.
    for name, radius, z, height, material in (
        ("CC_Foundation", 27.0, 0.60, 1.20, black),
        ("CC_PlazaDeck", 24.3, 1.60, 0.82, steel),
        ("CC_Podium", 20.2, 3.00, 2.00, technical),
        ("CC_AtriumBase", 16.8, 5.35, 2.70, black),
    ):
        obj = add_prism(name, (0.0, 0.0, z), radius, height, collection, material, root, bevel=0.22)
        _tag(obj, "architecture", lod)

    plaza_trim = add_hex_ring("CC_PlazaEnergyTrim", (0.0, 0.0, 2.08), 23.3, 22.82, 0.16, collection, green, root, bevel=0.02)
    _tag(plaza_trim, "emissive", lod)
    podium_trim = add_hex_ring("CC_PodiumTechnicalTrim", (0.0, 0.0, 4.15), 19.4, 18.98, 0.24, collection, steel, root, bevel=0.03)
    _tag(podium_trim, "technical", lod)

    # The black tapered volume reads as the tower from afar.  A true core and
    # separated facades make its purpose visible rather than a generic prism.
    lower_body = add_tapered_prism("CC_LowerBody", (0.0, 0.0, 19.0), 14.3, 12.7, 26.0, collection, black, root, bevel=0.20)
    _tag(lower_body, "architecture", lod)
    upper_body = add_tapered_prism("CC_UpperBody", (0.0, 0.0, 47.0), 12.7, 10.8, 30.0, collection, black, root, bevel=0.20)
    _tag(upper_body, "architecture", lod)
    core_shadow = add_prism("CC_CoreShadow", (0.0, 0.0, 37.2), 7.0, 61.0, collection, steel, root, bevel=0.14)
    _tag(core_shadow, "architecture", lod)
    core = add_prism("CC_EmeraldCore", (0.0, 0.0, 38.4), 2.35, 63.2, collection, green, root, bevel=0.10)
    _tag(core, "emissive", lod)
    core_halo = add_hex_ring("CC_CoreHalo", (0.0, 0.0, 6.7), 4.55, 3.95, 0.26, collection, halo, root, bevel=0.03)
    _tag(core_halo, "emissive", lod)

    # Six facades enforce 60° alignment.  The void between them allows the
    # core to remain visible in a real-time asset without transparency tricks.
    for face in range(6):
        angle = math.radians(face * 60)
        mass = _radial_box(
            f"CC_FacadeMass_{face + 1}",
            face,
            10.6,
            34.0,
            8.0,
            1.5,
            55.5,
            collection,
            technical,
            root,
            lod,
            bevel=0.16,
        )
        mass["engineering_city_role"] = "architecture"
        # Deliberate 30° blades at the transition between facade modules.
        if lod == 0:
            for direction in (-1, 1):
                brace_angle = angle + direction * math.radians(30)
                brace = add_box(
                    f"CC_FacadeBrace_{face + 1}_{direction:+d}",
                    radial_position(12.0, brace_angle, 34.0),
                    (0.42, 0.55, 53.0),
                    collection,
                    steel,
                    root,
                    rotation_z=brace_angle + math.pi / 2,
                    bevel=0.06,
                )
                _tag(brace, "technical", lod)

    sections = ((12.6, 9.4), (26.5, 11.5), (42.4, 12.5), (58.2, 8.0)) if lod == 0 else ((15.5, 16.0), (40.0, 26.0))
    _vertical_window_bands(collection, materials, root, lod, sections)
    _data_rings(collection, materials, root, lod, include_satellites=lod == 0)
    _entry_frame(collection, materials, root, lod)

    # Crown: a stepped hex halo + beacon.  This is the recognisable identity
    # of the knowledge hub, and reaches exactly 72 m including the beacon.
    crown = add_tapered_prism("CC_CrownShoulder", (0.0, 0.0, 64.2), 13.0, 10.0, 5.0, collection, steel, root, bevel=0.18)
    _tag(crown, "architecture", lod)
    crown_ring = add_hex_ring("CC_CrownEnergyRing", (0.0, 0.0, 66.6), 13.4, 12.60, 0.22, collection, green, root, bevel=0.03)
    _tag(crown_ring, "emissive", lod)
    cap = add_prism("CC_CrownCap", (0.0, 0.0, 68.4), 8.8, 2.3, collection, black, root, bevel=0.16)
    _tag(cap, "architecture", lod)
    beacon = add_prism("CC_KnowledgeBeacon", (0.0, 0.0, 70.85), 1.55, 2.3, collection, green, root, bevel=0.08)
    _tag(beacon, "emissive", lod)

    if lod == 0:
        # Small, reusable technical details; never a dense texture substitute.
        for face in range(6):
            angle = math.radians(face * 60)
            for z in (8.0, 17.8, 51.2):
                plate = _radial_box(
                    f"CC_TechnicalPlate_{face + 1}_{int(z)}",
                    face,
                    15.25 if z < 20 else 12.7,
                    z,
                    4.1,
                    0.28,
                    1.10,
                    collection,
                    steel,
                    root,
                    lod,
                    bevel=0.05,
                )
                plate["engineering_city_role"] = "technical"
            # Inset green data markers.  The front avoids billboard-like text.
            marker = _radial_box(
                f"CC_DataMarker_{face + 1}",
                face,
                12.32,
                50.0,
                1.35,
                0.14,
                3.8,
                collection,
                green,
                root,
                lod,
                bevel=0.02,
            )
            marker["engineering_city_role"] = "emissive"

        # Six protected perimeter lights make the plaza feel inhabited without
        # introducing people/vehicles into the reusable landmark GLB.
        for face in range(6):
            position = radial_position(21.0, math.radians(face * 60), 3.4)
            bollard = add_cylinder(
                f"CC_PerimeterBollard_{face + 1}",
                position,
                0.34,
                2.5,
                collection,
                steel,
                root,
                vertices=8,
                bevel=0.06,
            )
            _tag(bollard, "set_dressing", lod)
            cap_light = add_cylinder(
                f"CC_PerimeterLight_{face + 1}",
                (position[0], position[1], 4.7),
                0.22,
                0.24,
                collection,
                halo,
                root,
                vertices=8,
                bevel=0.03,
            )
            _tag(cap_light, "emissive", lod)

    # A simple mesh label is intentionally avoided: identity comes from form,
    # and product-specific type is applied by the web UI rather than baked in.
    return root


def build_master_environment(
    root_collection: bpy.types.Collection,
    materials: dict[str, bpy.types.Material],
) -> bpy.types.Object:
    infrastructure = ensure_collection("INFRASTRUCTURE", root_collection)
    set_dressing = ensure_collection("SET_DRESSING", root_collection)
    atmosphere = ensure_collection("ATMOSPHERE", root_collection)
    environment_root = add_empty("EngineeringCityEnvironment", infrastructure)

    ground = add_box("EC_WetAsphalt", (0.0, 0.0, -0.55), (160.0, 160.0, 1.0), infrastructure, materials["asphalt"], environment_root, bevel=0.10)
    _tag(ground, "infrastructure", -1)
    # A thin 60° service road and plaza lines frame the landmark, but are not
    # exported with it; CityNavigator will own shared infrastructure later.
    road = add_hex_ring("EC_ServiceRoad", (0.0, 0.0, 0.04), 36.5, 31.5, 0.11, infrastructure, materials["dark_steel"], environment_root, bevel=0.03)
    _tag(road, "infrastructure", -1)
    road_line = add_hex_ring("EC_ServiceRoadLine", (0.0, 0.0, 0.11), 34.2, 33.84, 0.06, infrastructure, materials["emerald"], environment_root, bevel=0.01)
    _tag(road_line, "infrastructure", -1)

    for face in (1, 3, 5):
        angle = math.radians(face * 60)
        planter_position = radial_position(29.0, angle, 1.2)
        planter = add_prism(
            f"EC_TechnicalPlanter_{face}",
            planter_position,
            2.4,
            1.8,
            set_dressing,
            materials["technical"],
            None,
            bevel=0.12,
        )
        _tag(planter, "set_dressing", -1)
        canopy = add_uv_sphere(
            f"EC_ModularCanopy_{face}",
            (planter_position[0], planter_position[1], 3.3),
            1.8,
            set_dressing,
            materials["dark_steel"],
            None,
            segments=12,
            rings=6,
        )
        canopy.scale = (0.9, 0.9, 1.35)
        _tag(canopy, "set_dressing", -1)

    mist = add_box("EC_LightMist", (0.0, 0.0, 46.0), (150.0, 150.0, 92.0), atmosphere, create_volume_material(), None)
    mist.display_type = "WIRE"
    mist["engineering_city_role"] = "atmosphere"
    return mist


def build_cameras_and_lights(root_collection: bpy.types.Collection) -> dict[str, bpy.types.Object]:
    cameras = ensure_collection("CAMERAS", root_collection)
    lights = ensure_collection("LIGHTS", root_collection)
    created: dict[str, bpy.types.Object] = {}
    for preset in CAMERA_PRESETS:
        camera = add_camera(
            preset.name,
            preset.location,
            preset.target,
            preset.lens_mm,
            cameras,
            preset.camera_type,
            preset.ortho_scale,
        )
        camera["camera_bible"] = preset.name
        camera["fog"] = preset.fog
        camera["bloom"] = preset.bloom
        camera["exposure"] = preset.exposure
        created[preset.name] = camera

    # At a 72 m architectural scale, low-wattage practicals turn every dark
    # surface into black.  These are deliberately broad, night-time studio
    # lights (not a sun) so the silhouette reads while emission stays sparse.
    add_area_light("L_EmeraldKey", (0.0, -26.0, 9.0), (0.0, 0.0, 30.0), srgb_hex("#00D26A"), 35_000, 18.0, lights)
    add_area_light("L_ColdRim", (36.0, 30.0, 66.0), (0.0, 0.0, 36.0), srgb_hex("#6AA9B5"), 85_000, 28.0, lights)
    add_area_light("L_SoftFill", (-30.0, -18.0, 42.0), (0.0, 0.0, 28.0), srgb_hex("#27424B"), 60_000, 26.0, lights)
    add_area_light("L_ArchitectureFill", (82.0, -90.0, 102.0), (0.0, 0.0, 34.0), srgb_hex("#B8D3CC"), 180_000, 54.0, lights)
    add_area_light("L_OverheadSky", (-12.0, 5.0, 152.0), (0.0, 0.0, 34.0), srgb_hex("#48696B"), 110_000, 85.0, lights)
    add_point_light("L_CoreBounce", (0.0, 0.0, 31.0), srgb_hex("#00D26A"), 8_000, 7.0, lights)
    add_point_light("L_CrownBeacon", (0.0, 0.0, 69.0), srgb_hex("#5CFF9D"), 3_000, 4.0, lights)
    return created


def animate_emissive_pulse(scene: bpy.types.Scene, materials: dict[str, bpy.types.Material]) -> None:
    """Encode the Motion Bible's 8-second breathing pulse in the source scene."""
    scene.render.fps = 24
    scene.frame_start = 1
    scene.frame_end = 193
    for name in ("emerald", "halo"):
        material = materials[name]
        bsdf = material.node_tree.nodes.get("Principled BSDF")
        socket = bsdf.inputs.get("Emission Strength")
        if socket is None:
            continue
        base = 3.2 if name == "emerald" else 1.5
        for frame, factor in ((1, 0.70), (97, 1.0), (193, 0.70)):
            socket.default_value = base * factor
            socket.keyframe_insert("default_value", frame=frame)
        if material.node_tree.animation_data and material.node_tree.animation_data.action:
            action = material.node_tree.animation_data.action
            if hasattr(action, "fcurves"):
                curves = action.fcurves
            else:
                # Blender 5.0 introduced layered actions; F-curves now live
                # inside channel bags rather than directly on the action.
                curves = [
                    curve
                    for layer in action.layers
                    for strip in layer.strips
                    for bag in strip.channelbags
                    for curve in bag.fcurves
                ]
            for curve in curves:
                if curve.data_path.endswith('inputs["Emission Strength"].default_value'):
                    for point in curve.keyframe_points:
                        point.interpolation = "SINE"
                    curve.modifiers.new("CYCLES")
    scene.frame_set(1)


def export_landmark(root: bpy.types.Object, models_dir: Path, filename: str) -> dict[str, object]:
    objects = [root] + list(root.children_recursive)
    triangles, minimum, maximum = mesh_statistics(objects)
    target = models_dir / filename
    export_glb(objects, str(target))
    dimensions = tuple(round(maximum[index] - minimum[index], 3) for index in range(3))
    return {
        "path": str(target),
        "triangles": triangles,
        "bytes": target.stat().st_size,
        "boundsMin": [round(value, 3) for value in minimum],
        "boundsMax": [round(value, 3) for value in maximum],
        "dimensionsMeters": list(dimensions),
    }


def remove_collection(collection: bpy.types.Collection) -> None:
    for obj in list(descendants(collection)):
        bpy.data.objects.remove(obj, do_unlink=True)
    bpy.data.collections.remove(collection)


def render_presets(
    scene: bpy.types.Scene,
    cameras: dict[str, bpy.types.Object],
    mist: bpy.types.Object,
    render_dir: Path,
    resolution_scale: float,
) -> list[dict[str, str]]:
    render_dir.mkdir(parents=True, exist_ok=True)
    results: list[dict[str, str]] = []
    for preset in CAMERA_PRESETS:
        camera = cameras[preset.name]
        scene.camera = camera
        # These values are the versioned Camera Bible contract, not a
        # convenience offset for a particular monitor or renderer.
        scene.view_settings.exposure = preset.exposure
        set_bloom_amount(scene, preset.bloom)
        mist.hide_render = preset.fog == 0.0
        scene.render.resolution_x = round(preset.resolution[0] * resolution_scale)
        scene.render.resolution_y = round(preset.resolution[1] * resolution_scale)

        stem = f"{LANDMARK_ID}-{preset.name}"
        exr_path = render_dir / f"{stem}.exr"
        png_path = render_dir / f"{stem}.png"
        # ``OPEN_EXR`` is supported by current Blender versions and is the
        # portable EXR master.  The scene still enables Z/Mist/Emission passes
        # when Blender exposes them; final multi-layer packaging is optional.
        scene.render.image_settings.file_format = "OPEN_EXR"
        scene.render.image_settings.color_depth = "16"
        scene.render.filepath = str(exr_path)
        bpy.ops.render.render(write_still=True)
        scene.render.image_settings.file_format = "PNG"
        scene.render.image_settings.color_depth = "16"
        bpy.data.images["Render Result"].save_render(filepath=str(png_path), scene=scene)
        results.append({"camera": preset.name, "png": str(png_path), "exr": str(exr_path)})
    mist.hide_render = False
    return results


def main() -> None:
    args = cli_arguments()
    scene_path = Path(args.scene)
    models_dir = Path(args.models_dir)
    render_dir = Path(args.render_dir)
    scene_path.parent.mkdir(parents=True, exist_ok=True)
    models_dir.mkdir(parents=True, exist_ok=True)
    render_dir.mkdir(parents=True, exist_ok=True)

    clear_scene()
    scene = bpy.context.scene
    configure_scene(scene, args.engine, args.samples)
    root_collection = ensure_collection("ENGINEERING_CITY")
    landmarks = ensure_collection("LANDMARKS", root_collection)
    command_center_collection = ensure_collection("CommandCenter", landmarks)
    materials = create_master_materials()

    lod0_root = build_command_center(command_center_collection, materials, lod=0)
    mist = build_master_environment(root_collection, materials)
    cameras = build_cameras_and_lights(root_collection)
    scene.camera = cameras["district-portrait-v1"]
    animate_emissive_pulse(scene, materials)

    # Persist the editable source before generating delivery formats.  The
    # source has named collections/materials/cameras, while public GLBs only
    # contain the static model hierarchy and safe procedural materials.
    bpy.ops.wm.save_as_mainfile(filepath=str(scene_path))

    output: dict[str, object] = {
        "version": 1,
        "asset": LANDMARK_ID,
        "sourceScene": str(scene_path),
        "license": "first-party procedural geometry; public redistribution allowed",
        "pivot": "ground-center",
        "motion": {"type": "emissive-pulse", "durationSeconds": 8, "range": [0.70, 1.00]},
        "renderEngine": args.engine,
        "lods": [],
        "renders": [],
    }

    if not args.render_only:
        lod0 = export_landmark(lod0_root, models_dir, "command-center.glb")
        if lod0["triangles"] > LOD0_TRIANGLE_BUDGET:
            raise RuntimeError(f"LOD0 uses {lod0['triangles']} triangles; budget is {LOD0_TRIANGLE_BUDGET}")
        lod0["level"] = "lod0"
        output["lods"].append(lod0)

        lod1_collection = ensure_collection("CommandCenter_LOD1_EXPORT_ONLY", landmarks)
        lod1_root = build_command_center(lod1_collection, materials, lod=1)
        lod1 = export_landmark(lod1_root, models_dir, "command-center-lod1.glb")
        if lod1["triangles"] > LOD1_TRIANGLE_BUDGET:
            raise RuntimeError(f"LOD1 uses {lod1['triangles']} triangles; budget is {LOD1_TRIANGLE_BUDGET}")
        lod1["level"] = "lod1"
        output["lods"].append(lod1)
        remove_collection(lod1_collection)

    if not args.skip_render:
        output["renders"] = render_presets(scene, cameras, mist, render_dir, args.resolution_scale)

    manifest_path = render_dir / "command-center-build.json"
    with manifest_path.open("w", encoding="utf-8") as handle:
        json.dump(output, handle, indent=2)
        handle.write("\n")
    print(json.dumps(output, indent=2))
    print(f"Command Center build complete: {manifest_path}")


if __name__ == "__main__":
    main()
