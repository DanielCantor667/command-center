"""Generate the Engineering City Academy / 4U Studio Academy landmark.

Academy is a reproducible first-party procedural asset: a 38 m learning
observatory assembled from stepped hexagonal terraces, classroom modules,
an acoustic studio, elevated walkways and a single emerald signal beacon.
It follows the Engineering City world, design, camera and motion bibles.

Run from the repository root:

    /Applications/Blender.app/Contents/MacOS/Blender --background \
      --python blender/generate_academy.py -- --engine BLENDER_EEVEE_NEXT

The script writes only the editable source scene and public web GLBs by
default. Use ``--render-dir`` to direct optional PNG/EXR QA renders outside
the repository when reviewing the asset locally.
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
    clear_scene,
    configure_scene,
    create_master_materials,
    create_volume_material,
    descendants,
    ensure_collection,
    export_glb,
    mesh_statistics,
    radial_position,
    set_bloom_amount,
    srgb_hex,
)


LANDMARK_ID = "academy"
LANDMARK_LABEL = "4U Studio Academy"
LANDMARK_HEIGHT_METERS = 38.0
LOD0_TRIANGLE_BUDGET = 18_000
LOD1_TRIANGLE_BUDGET = 5_000
DEFAULT_SCENE_PATH = "blender/scenes/engineering-city-academy-v1.blend"
DEFAULT_MODELS_DIR = "apps/web/public/models/city"


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
        (66.0, -76.0, 61.0),
        (0.0, 0.0, 18.0),
        0.18,
        0.14,
        1.20,
        (1920, 1080),
    ),
    CameraPreset(
        "district-portrait-v1",
        50,
        (84.0, -96.0, 70.0),
        (0.0, 0.0, 18.0),
        0.14,
        0.10,
        1.10,
        (1600, 900),
    ),
    CameraPreset(
        "architecture-sheet-v1",
        70,
        (0.0, -108.0, 22.0),
        (0.0, 0.0, 18.0),
        0.00,
        0.00,
        1.00,
        (1600, 1200),
        "ORTHO",
        88.0,
    ),
    CameraPreset(
        "detail-material-v1",
        85,
        (25.0, -35.0, 25.0),
        (8.0, -9.0, 15.0),
        0.06,
        0.06,
        1.00,
        (1600, 900),
    ),
)


def cli_arguments() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--scene", default=DEFAULT_SCENE_PATH, help="editable .blend destination")
    parser.add_argument("--models-dir", default=DEFAULT_MODELS_DIR, help="public GLB destination")
    parser.add_argument("--render-dir", type=Path, help="optional PNG/EXR QA destination")
    parser.add_argument("--engine", choices=("BLENDER_EEVEE_NEXT", "CYCLES"), default="BLENDER_EEVEE_NEXT")
    parser.add_argument("--samples", type=int, default=32, help="Cycles samples when --engine CYCLES")
    parser.add_argument("--skip-render", action="store_true", help="skip optional QA renders")
    parser.add_argument("--render-only", action="store_true", help="create source and QA renders without GLB export")
    parser.add_argument("--resolution-scale", type=float, default=1.0, help="QA render scale, between 0.25 and 1")
    argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    args = parser.parse_args(argv)
    if not 0.25 <= args.resolution_scale <= 1.0:
        parser.error("--resolution-scale must be between 0.25 and 1")
    if args.render_only and args.skip_render:
        parser.error("--render-only cannot be combined with --skip-render")
    return args


def _tag(obj: bpy.types.Object, role: str, lod: int) -> bpy.types.Object:
    obj["engineering_city_landmark"] = LANDMARK_ID
    obj["engineering_city_lod"] = lod
    obj["engineering_city_role"] = role
    return obj


def _box(
    name: str,
    location: tuple[float, float, float],
    dimensions: tuple[float, float, float],
    collection: bpy.types.Collection,
    material: bpy.types.Material,
    root: bpy.types.Object,
    role: str,
    lod: int,
    rotation_z: float = 0.0,
    bevel: float = 0.0,
) -> bpy.types.Object:
    return _tag(
        add_box(
            name,
            location,
            dimensions,
            collection,
            material,
            root,
            rotation_z=rotation_z,
            bevel=bevel,
        ),
        role,
        lod,
    )


def _radial_box(
    name: str,
    radius: float,
    angle: float,
    z: float,
    dimensions: tuple[float, float, float],
    collection: bpy.types.Collection,
    material: bpy.types.Material,
    root: bpy.types.Object,
    role: str,
    lod: int,
    bevel: float = 0.0,
) -> bpy.types.Object:
    return _box(
        name,
        radial_position(radius, angle, z),
        dimensions,
        collection,
        material,
        root,
        role,
        lod,
        rotation_z=angle + math.pi / 2,
        bevel=bevel,
    )


def _module_panel(
    name: str,
    center: tuple[float, float],
    angle: float,
    z: float,
    width: float,
    height: float,
    collection: bpy.types.Collection,
    material: bpy.types.Material,
    root: bpy.types.Object,
    role: str,
    lod: int,
    depth_offset: float,
    bevel: float = 0.0,
) -> bpy.types.Object:
    outward = (math.cos(angle), math.sin(angle))
    return _box(
        name,
        (center[0] + outward[0] * depth_offset, center[1] + outward[1] * depth_offset, z),
        (width, 0.20, height),
        collection,
        material,
        root,
        role,
        lod,
        rotation_z=angle + math.pi / 2,
        bevel=bevel,
    )


def _learning_module(
    index: int,
    angle: float,
    collection: bpy.types.Collection,
    materials: dict[str, bpy.types.Material],
    root: bpy.types.Object,
    lod: int,
) -> None:
    """Create one radial classroom or one dedicated acoustic studio."""
    # Modules sit beyond the stepped academic shells so their hexagonal
    # studios read as deliberate programme pods, not detached satellites.
    radius = 18.35
    center = radial_position(radius, angle, 0.0)
    module_kind = "acoustic-studio" if index == 3 else "classroom"
    module_label = "AcousticStudio" if index == 3 else f"Classroom_{index + 1}"
    black = materials["black_titanium"]
    steel = materials["dark_steel"]
    technical = materials["technical"]
    glass = materials["smoke_glass"]
    emerald = materials["emerald"]

    body = add_tapered_prism(
        f"AC_{module_label}_Body",
        (center[0], center[1], 8.00),
        4.75,
        4.20,
        6.70,
        collection,
        black,
        root,
        vertices=6,
        rotation_z=angle + math.radians(30),
        bevel=0.14,
    )
    _tag(body, "acoustic-studio" if module_kind == "acoustic-studio" else "classroom", lod)
    body["program"] = module_kind

    roof = add_tapered_prism(
        f"AC_{module_label}_TerraceRoof",
        (center[0], center[1], 11.55),
        4.36,
        3.55,
        0.48,
        collection,
        technical,
        root,
        vertices=6,
        rotation_z=angle + math.radians(30),
        bevel=0.08,
    )
    _tag(roof, "architecture", lod)
    roof["program"] = "outdoor-study-terrace"

    _module_panel(
        f"AC_{module_label}_VerticalGlass",
        center[:2],
        angle,
        8.15,
        5.10,
        5.10,
        collection,
        glass,
        root,
        "smoke-glass",
        lod,
        4.36,
        bevel=0.025,
    )

    if lod == 0:
        for rail_index, tangent_fraction in enumerate((-0.30, 0.30), start=1):
            tangent = (-math.sin(angle), math.cos(angle))
            rail_center = (
                center[0] + math.cos(angle) * 4.50 + tangent[0] * tangent_fraction * 5.0,
                center[1] + math.sin(angle) * 4.50 + tangent[1] * tangent_fraction * 5.0,
            )
            rail = _box(
                f"AC_{module_label}_WindowMullion_{rail_index}",
                (rail_center[0], rail_center[1], 8.15),
                (0.26, 0.30, 5.35),
                collection,
                steel,
                root,
                "technical",
                lod,
                rotation_z=angle + math.pi / 2,
                bevel=0.035,
            )
            rail["program"] = module_kind
        signal = _module_panel(
            f"AC_{module_label}_LearningSignal",
            center[:2],
            angle,
            8.15,
            0.22,
            4.25,
            collection,
            emerald,
            root,
            "emissive",
            lod,
            4.58,
            bevel=0.018,
        )
        signal["motion"] = "learning-state pulse, 8 seconds"

    if module_kind == "acoustic-studio" and lod == 0:
        # The visible baffles make this module read as a studio instead of a
        # sixth generic classroom, while still following the 30°/60° grammar.
        tangent = (-math.sin(angle), math.cos(angle))
        for baffle_index in range(5):
            offset = (baffle_index - 2) * 0.88
            baffle = _box(
                f"AC_AcousticStudio_Baffle_{baffle_index + 1}",
                (
                    center[0] + math.cos(angle) * 4.70 + tangent[0] * offset,
                    center[1] + math.sin(angle) * 4.70 + tangent[1] * offset,
                    8.15,
                ),
                (0.28, 0.48, 5.45),
                collection,
                technical,
                root,
                "acoustic-baffle",
                lod,
                rotation_z=angle + math.pi / 2,
                bevel=0.035,
            )
            baffle["function"] = "sound-diffusion"


def _entry_forum(
    collection: bpy.types.Collection,
    materials: dict[str, bpy.types.Material],
    root: bpy.types.Object,
    lod: int,
) -> None:
    """Build a public forum at the -Y entry without relying on baked text."""
    steel = materials["dark_steel"]
    black = materials["black_titanium"]
    green = materials["emerald"]
    glass = materials["smoke_glass"]
    if lod == 1:
        portal = _box(
            "AC_ForumPortal_LOD1",
            (0.0, -16.15, 6.25),
            (9.6, 1.0, 7.4),
            collection,
            black,
            root,
            "architecture",
            lod,
            bevel=0.10,
        )
        portal["program"] = "learning-forum"
        return

    for step_index in range(4):
        depth = 2.25 + step_index * 0.92
        z = 1.42 + step_index * 0.34
        step = _box(
            f"AC_ForumStep_{step_index + 1}",
            (0.0, -19.5 + step_index * 0.58, z),
            (10.8 - step_index * 0.90, depth, 0.34),
            collection,
            steel,
            root,
            "forum-step",
            lod,
            bevel=0.055,
        )
        step["program"] = "learning-forum"

    for name, location, rotation in (
        ("AC_ForumPillar_L", (-5.1, -14.4, 7.0), math.radians(-30)),
        ("AC_ForumPillar_R", (5.1, -14.4, 7.0), math.radians(30)),
    ):
        _box(name, location, (0.92, 1.10, 9.50), collection, black, root, "architecture", lod, rotation, 0.12)
    _box("AC_ForumLintel", (0.0, -14.4, 11.75), (10.8, 1.10, 0.82), collection, black, root, "architecture", lod, bevel=0.11)
    _box("AC_ForumGlass", (0.0, -13.98, 6.55), (7.9, 0.16, 7.8), collection, glass, root, "smoke-glass", lod, bevel=0.025)
    threshold = _box(
        "AC_ForumThreshold",
        (0.0, -15.1, 2.42),
        (8.25, 0.14, 0.18),
        collection,
        green,
        root,
        "emissive",
        lod,
        bevel=0.018,
    )
    threshold["motion"] = "learning-arrival glow, 8 seconds"


def build_academy(
    collection: bpy.types.Collection,
    materials: dict[str, bpy.types.Material],
    lod: int,
) -> bpy.types.Object:
    """Build the Academy in LOD0 or LOD1, maintaining a ground-centre pivot."""
    root = add_empty("Academy" if lod == 0 else "Academy_LOD1", collection)
    root["engineering_city_landmark"] = LANDMARK_ID
    root["engineering_city_lod"] = lod
    root["label"] = LANDMARK_LABEL
    root["pivot"] = "ground-center"
    root["dimensions_meters"] = {"height": LANDMARK_HEIGHT_METERS, "foundationRadius": 24.0}
    root["motion"] = "beacon breathes every 8 seconds; observatory halo rotates every 12 seconds"
    root["license"] = "first-party procedural geometry; public redistribution allowed"

    black = materials["black_titanium"]
    steel = materials["dark_steel"]
    technical = materials["technical"]
    glass = materials["smoke_glass"]
    emerald = materials["emerald"]
    halo = materials["halo"]

    # Stepped hexagonal terraces define Academy's horizontal, accessible
    # campus silhouette before the observatory rises from the centre.
    for name, radius, z, height, material in (
        ("AC_Foundation", 24.0, 0.60, 1.20, black),
        ("AC_LowerLearningTerrace", 20.8, 1.76, 1.10, steel),
        ("AC_MidLearningTerrace", 17.6, 2.92, 1.10, technical),
        ("AC_ObservatoryPlinth", 12.7, 4.20, 1.46, black),
    ):
        level = add_prism(name, (0.0, 0.0, z), radius, height, collection, material, root, bevel=0.18)
        _tag(level, "architecture", lod)

    terrace_signal = add_hex_ring(
        "AC_LearningTerraceSignal",
        (0.0, 0.0, 2.36),
        19.70,
        19.24,
        0.15,
        collection,
        emerald,
        root,
        bevel=0.018,
    )
    _tag(terrace_signal, "emissive", lod)
    terrace_signal["motion"] = "pulse, 8 seconds, 0.70 to 1.00"

    # Continuous stepped shells give the landmark its terraced observatory
    # silhouette. The classroom pods then emerge from their perimeter rather
    # than reading as isolated objects around a tower.
    lower_shell = add_hex_ring(
        "AC_LowerTerracedAcademicShell",
        (0.0, 0.0, 8.30),
        20.40,
        12.15,
        7.00,
        collection,
        black,
        root,
        bevel=0.16,
    )
    _tag(lower_shell, "architecture", lod)
    lower_shell["program"] = "learning-campus-lower-terrace"
    upper_shell = add_hex_ring(
        "AC_UpperTerracedAcademicShell",
        (0.0, 0.0, 14.48),
        15.95,
        9.30,
        5.36,
        collection,
        technical,
        root,
        bevel=0.14,
    )
    _tag(upper_shell, "architecture", lod)
    upper_shell["program"] = "learning-campus-observation-terrace"

    for index in range(6):
        angle = math.radians(index * 60)
        lower_glass = _radial_box(
            f"AC_LowerTerraceGlass_{index + 1}",
            20.52,
            angle,
            8.35,
            (11.55, 0.18, 4.92),
            collection,
            glass,
            root,
            "smoke-glass",
            lod,
            bevel=0.025,
        )
        lower_glass["program"] = "learning-campus"
        upper_glass = _radial_box(
            f"AC_UpperTerraceGlass_{index + 1}",
            16.06,
            angle,
            14.55,
            (8.65, 0.18, 3.60),
            collection,
            glass,
            root,
            "smoke-glass",
            lod,
            bevel=0.025,
        )
        upper_glass["program"] = "observation-terrace"
        if lod == 0:
            lower_guide = _radial_box(
                f"AC_LowerTerraceGuide_{index + 1}",
                20.66,
                angle,
                8.35,
                (0.22, 0.10, 4.20),
                collection,
                emerald,
                root,
                "emissive",
                lod,
                bevel=0.015,
            )
            lower_guide["motion"] = "quiet campus wayfinding pulse, 8 seconds"

    walkway = add_hex_ring(
        "AC_ObservationWalkway",
        (0.0, 0.0, 17.42),
        14.45,
        11.85,
        0.40,
        collection,
        steel,
        root,
        bevel=0.08,
    )
    _tag(walkway, "walkway", lod)
    walkway["program"] = "campus-circulation"

    # Six 60° radial bridges tie the individual spaces back to the knowledge
    # core. The narrow green line is the only emissive wayfinding accent.
    for index in range(6):
        angle = math.radians(index * 60)
        bridge = _radial_box(
            f"AC_LearningBridge_{index + 1}",
            13.45,
            angle,
            17.54,
            (2.60, 7.60, 0.38),
            collection,
            technical,
            root,
            "walkway",
            lod,
            bevel=0.06,
        )
        bridge["program"] = "campus-circulation"
        if lod == 0:
            rail = _radial_box(
                f"AC_LearningBridgeSignal_{index + 1}",
                13.45,
                angle,
                17.78,
                (0.19, 7.10, 0.12),
                collection,
                emerald,
                root,
                "emissive",
                lod,
                bevel=0.016,
            )
            rail["motion"] = "wayfinding pulse, 8 seconds"

    for index in range(6):
        _learning_module(index, math.radians(index * 60), collection, materials, root, lod)
    _entry_forum(collection, materials, root, lod)

    # Central atrium is deliberately faceted: a smoke-glass observation drum
    # protected by steel rings and vertical 60° frames, never a generic round
    # classroom block.
    atrium_frame = add_hex_ring(
        "AC_AtriumFrame",
        (0.0, 0.0, 14.45),
        9.15,
        8.25,
        8.30,
        collection,
        steel,
        root,
        bevel=0.12,
    )
    _tag(atrium_frame, "architecture", lod)
    atrium_glass = add_prism(
        "AC_AtriumSmokeGlass",
        (0.0, 0.0, 14.45),
        8.18,
        7.96,
        collection,
        glass,
        root,
        bevel=0.06,
    )
    _tag(atrium_glass, "smoke-glass", lod)
    atrium_glass["program"] = "knowledge-atrium"
    atrium_ring = add_hex_ring(
        "AC_AtriumLearningRing",
        (0.0, 0.0, 18.32),
        9.35,
        8.70,
        0.20,
        collection,
        emerald,
        root,
        bevel=0.02,
    )
    _tag(atrium_ring, "emissive", lod)

    observatory_glass = add_tapered_prism(
        "AC_ObservatorySmokeGlass",
        (0.0, 0.0, 21.05),
        7.85,
        7.10,
        6.50,
        collection,
        glass,
        root,
        bevel=0.08,
    )
    _tag(observatory_glass, "smoke-glass", lod)
    observatory_glass["program"] = "learning-observatory"
    observatory_base = add_hex_ring(
        "AC_ObservatoryBaseFrame",
        (0.0, 0.0, 17.90),
        8.62,
        7.83,
        0.56,
        collection,
        technical,
        root,
        bevel=0.08,
    )
    _tag(observatory_base, "architecture", lod)
    observatory_crown = add_hex_ring(
        "AC_ObservatoryCrownFrame",
        (0.0, 0.0, 24.10),
        7.68,
        7.05,
        0.62,
        collection,
        steel,
        root,
        bevel=0.08,
    )
    _tag(observatory_crown, "architecture", lod)

    if lod == 0:
        for index in range(6):
            angle = math.radians(index * 60)
            frame = _radial_box(
                f"AC_ObservatoryFrame_{index + 1}",
                7.98,
                angle,
                21.05,
                (0.46, 0.44, 6.05),
                collection,
                steel,
                root,
                "technical",
                lod,
                bevel=0.04,
            )
            frame["program"] = "learning-observatory"

    shoulder = add_tapered_prism(
        "AC_ObservatoryCrown",
        (0.0, 0.0, 26.22),
        8.20,
        6.15,
        4.10,
        collection,
        technical,
        root,
        bevel=0.13,
    )
    _tag(shoulder, "architecture", lod)
    rotating_halo = add_hex_ring(
        "AC_ObservationHalo",
        (0.0, 0.0, 27.85),
        7.35,
        6.72,
        0.18,
        collection,
        emerald,
        root,
        bevel=0.018,
    )
    _tag(rotating_halo, "emissive", lod)
    rotating_halo["motion"] = "clockwise rotation, 12 seconds"
    cap = add_prism(
        "AC_BeaconPlatform",
        (0.0, 0.0, 28.80),
        5.05,
        0.90,
        collection,
        black,
        root,
        bevel=0.10,
    )
    _tag(cap, "architecture", lod)
    mast = add_prism(
        "AC_BeaconMast",
        (0.0, 0.0, 31.60),
        1.72,
        5.70,
        collection,
        steel,
        root,
        bevel=0.08,
    )
    _tag(mast, "architecture", lod)
    knowledge_spine = add_prism(
        "AC_LearningSpine",
        (0.0, 0.0, 26.05),
        0.54,
        16.70,
        collection,
        emerald,
        root,
        bevel=0.035,
    )
    _tag(knowledge_spine, "emissive", lod)
    knowledge_spine["motion"] = "continuous learning signal, 8 seconds"
    beacon = add_tapered_prism(
        "AC_LearningBeacon",
        (0.0, 0.0, 36.15),
        1.58,
        0.52,
        3.70,
        collection,
        emerald,
        root,
        bevel=0.06,
    )
    _tag(beacon, "emissive", lod)
    beacon["motion"] = "beacon breathes, 8 seconds, 0.70 to 1.00"

    if lod == 0:
        for index in range(6):
            angle = math.radians(index * 60)
            base_position = radial_position(18.5, angle, 3.20)
            bollard = add_cylinder(
                f"AC_StudyBollard_{index + 1}",
                base_position,
                0.26,
                1.75,
                collection,
                steel,
                root,
                vertices=8,
                bevel=0.05,
            )
            _tag(bollard, "set-dressing", lod)
            cap_light = add_cylinder(
                f"AC_StudyBollardLight_{index + 1}",
                (base_position[0], base_position[1], 4.12),
                0.18,
                0.18,
                collection,
                halo,
                root,
                vertices=8,
                bevel=0.025,
            )
            _tag(cap_light, "emissive", lod)

    return root


def build_environment(
    root_collection: bpy.types.Collection,
    materials: dict[str, bpy.types.Material],
) -> bpy.types.Object:
    """Create private render-only infrastructure and atmospheric context."""
    infrastructure = ensure_collection("INFRASTRUCTURE", root_collection)
    atmosphere = ensure_collection("ATMOSPHERE", root_collection)
    ground = add_box(
        "EC_AcademyWetAsphalt",
        (0.0, 0.0, -0.55),
        (150.0, 150.0, 1.0),
        infrastructure,
        materials["asphalt"],
        bevel=0.10,
    )
    _tag(ground, "infrastructure", -1)
    road = add_hex_ring(
        "EC_AcademyServiceRoad",
        (0.0, 0.0, 0.08),
        31.8,
        28.6,
        0.12,
        infrastructure,
        materials["dark_steel"],
        bevel=0.025,
    )
    _tag(road, "infrastructure", -1)
    road_signal = add_hex_ring(
        "EC_AcademyServiceSignal",
        (0.0, 0.0, 0.16),
        30.0,
        29.70,
        0.06,
        infrastructure,
        materials["emerald"],
        bevel=0.012,
    )
    _tag(road_signal, "infrastructure", -1)
    mist = add_box(
        "EC_AcademyLightMist",
        (0.0, 0.0, 30.0),
        (140.0, 140.0, 66.0),
        atmosphere,
        create_volume_material(),
    )
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

    add_area_light("L_AcademyEmeraldKey", (0.0, -30.0, 12.0), (0.0, 0.0, 16.0), srgb_hex("#00D26A"), 28_000, 18.0, lights)
    add_area_light("L_AcademyColdRim", (38.0, 32.0, 48.0), (0.0, 0.0, 18.0), srgb_hex("#6AA9B5"), 62_000, 25.0, lights)
    add_area_light("L_AcademySoftFill", (-33.0, -20.0, 27.0), (0.0, 0.0, 13.0), srgb_hex("#27424B"), 45_000, 24.0, lights)
    add_area_light("L_AcademyOverhead", (-8.0, 10.0, 95.0), (0.0, 0.0, 17.0), srgb_hex("#48696B"), 95_000, 60.0, lights)
    add_point_light("L_AcademyBeacon", (0.0, 0.0, 36.0), srgb_hex("#00D26A"), 5_000, 5.0, lights)
    add_point_light("L_AcademyAtrium", (0.0, 0.0, 14.0), srgb_hex("#5CFF9D"), 2_300, 4.0, lights)
    return created


def animate_motion(
    scene: bpy.types.Scene,
    materials: dict[str, bpy.types.Material],
    observation_halo: bpy.types.Object,
) -> None:
    """Store the Motion Bible's quiet 8 s beacon cycle in the source scene."""
    scene.render.fps = 24
    scene.frame_start = 1
    scene.frame_end = 289
    for name, base_strength in (("emerald", 3.2), ("halo", 1.5)):
        socket = materials[name].node_tree.nodes["Principled BSDF"].inputs.get("Emission Strength")
        if socket is None:
            continue
        for frame, factor in ((1, 0.70), (97, 1.00), (193, 0.70)):
            socket.default_value = base_strength * factor
            socket.keyframe_insert("default_value", frame=frame)
    for frame, rotation in ((1, 0.0), (145, math.tau), (289, math.tau * 2)):
        observation_halo.rotation_euler[2] = rotation
        observation_halo.keyframe_insert("rotation_euler", index=2, frame=frame)
    scene["academy_motion_metadata"] = json.dumps(
        {
            "beacon": {"type": "emissive-pulse", "durationSeconds": 8, "range": [0.70, 1.00]},
            "observatoryHalo": {"type": "clockwise-rotation", "durationSeconds": 12},
        }
    )
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
        scene.camera = cameras[preset.name]
        scene.view_settings.exposure = preset.exposure
        set_bloom_amount(scene, preset.bloom)
        mist.hide_render = preset.fog == 0.0
        scene.render.resolution_x = round(preset.resolution[0] * resolution_scale)
        scene.render.resolution_y = round(preset.resolution[1] * resolution_scale)
        stem = f"{LANDMARK_ID}-{preset.name}"
        exr_path = render_dir / f"{stem}.exr"
        png_path = render_dir / f"{stem}.png"
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
    scene_path.parent.mkdir(parents=True, exist_ok=True)
    models_dir.mkdir(parents=True, exist_ok=True)

    clear_scene()
    scene = bpy.context.scene
    configure_scene(scene, args.engine, args.samples)
    root_collection = ensure_collection("ENGINEERING_CITY")
    landmarks = ensure_collection("LANDMARKS", root_collection)
    academy_collection = ensure_collection("Academy", landmarks)
    materials = create_master_materials()

    lod0_root = build_academy(academy_collection, materials, lod=0)
    mist = build_environment(root_collection, materials)
    cameras = build_cameras_and_lights(root_collection)
    scene.camera = cameras["district-portrait-v1"]
    observation_halo = bpy.data.objects["AC_ObservationHalo"]
    animate_motion(scene, materials, observation_halo)

    output: dict[str, object] = {
        "version": 1,
        "asset": LANDMARK_ID,
        "label": LANDMARK_LABEL,
        "sourceScene": str(scene_path),
        "license": "first-party procedural geometry; public redistribution allowed",
        "pivot": "ground-center",
        "motion": {
            "beacon": {"type": "emissive-pulse", "durationSeconds": 8, "range": [0.70, 1.00]},
            "observatoryHalo": {"type": "clockwise-rotation", "durationSeconds": 12},
        },
        "triangleBudgets": {"lod0": LOD0_TRIANGLE_BUDGET, "lod1": LOD1_TRIANGLE_BUDGET},
        "renderEngine": args.engine,
        "lods": [],
        "renders": [],
    }

    if not args.render_only:
        lod0 = export_landmark(lod0_root, models_dir, "academy.glb")
        if lod0["triangles"] > LOD0_TRIANGLE_BUDGET:
            raise RuntimeError(f"LOD0 uses {lod0['triangles']} triangles; budget is {LOD0_TRIANGLE_BUDGET}")
        lod0["level"] = "lod0"
        output["lods"].append(lod0)

        lod1_collection = ensure_collection("Academy_LOD1_EXPORT_ONLY", landmarks)
        lod1_root = build_academy(lod1_collection, materials, lod=1)
        lod1 = export_landmark(lod1_root, models_dir, "academy-lod1.glb")
        if lod1["triangles"] > LOD1_TRIANGLE_BUDGET:
            raise RuntimeError(f"LOD1 uses {lod1['triangles']} triangles; budget is {LOD1_TRIANGLE_BUDGET}")
        lod1["level"] = "lod1"
        output["lods"].append(lod1)
        remove_collection(lod1_collection)

    # Preserve actual delivery metrics in the editable source without adding a
    # second manifest file outside this landmark's allowed output set.
    lod0_root["delivery_metrics"] = json.dumps(output, sort_keys=True)
    scene["academy_delivery_metrics"] = json.dumps(output, sort_keys=True)
    bpy.ops.wm.save_as_mainfile(filepath=str(scene_path))

    if args.render_dir is not None and not args.skip_render:
        output["renders"] = render_presets(scene, cameras, mist, args.render_dir, args.resolution_scale)

    print(json.dumps(output, indent=2))


if __name__ == "__main__":
    main()
