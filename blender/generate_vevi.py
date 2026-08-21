"""Generate Engineering City's Vevi Media Hub source scene, GLBs and render QA.

Vevi is a first-party procedural landmark: a dual-tower broadcast and streaming
hub with smoke-glass LED facades, camera masts and a restrained emerald information
signal.  It intentionally shares Engineering City's materials, camera language
and 30°/60° geometry with Command Center while keeping a clearly different,
horizontal media silhouette.

Run from the repository root:

    /Applications/Blender.app/Contents/MacOS/Blender --background \
      --python blender/generate_vevi.py -- --engine BLENDER_EEVEE_NEXT

Use ``--skip-render`` for a fast source/GLB export.  The script produces:

    blender/scenes/engineering-city-vevi-v1.blend
    apps/web/public/models/city/vevi.glb
    apps/web/public/models/city/vevi-lod1.glb
    blender/output/engineering-city/vevi-*.{png,exr}
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


LANDMARK_ID = "vevi"
LANDMARK_HEIGHT_METERS = 56.0
LOD0_TRIANGLE_BUDGET = 18_000
LOD1_TRIANGLE_BUDGET = 5_000
DEFAULT_SCENE_PATH = "blender/scenes/engineering-city-vevi-v1.blend"
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
        (106.0, -118.0, 104.0),
        (0.0, 0.0, 26.0),
        0.18,
        0.14,
        1.20,
        (1920, 1080),
    ),
    CameraPreset(
        "district-portrait-v1",
        50,
        (75.0, -87.0, 76.0),
        (0.0, 0.0, 27.0),
        0.14,
        0.10,
        1.10,
        (1600, 900),
    ),
    CameraPreset(
        "architecture-sheet-v1",
        70,
        (0.0, -132.0, 31.0),
        (0.0, 0.0, 31.0),
        0.00,
        0.00,
        1.00,
        (1600, 1200),
        "ORTHO",
        118.0,
    ),
    CameraPreset(
        "detail-material-v1",
        85,
        (34.0, -46.0, 38.0),
        (13.0, -8.0, 31.0),
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


def _screen_stack(
    name: str,
    center_x: float,
    z: float,
    width: float,
    height: float,
    collection: bpy.types.Collection,
    materials: dict[str, bpy.types.Material],
    root: bpy.types.Object,
    lod: int,
) -> None:
    """Create an inset vertical media wall, not a texture-only billboard."""
    dark = materials["dark_steel"]
    glass = materials["smoke_glass"]
    signal = materials["emerald"]
    front_y = -10.74
    _box(
        f"{name}_Frame",
        (center_x, front_y, z),
        (width + 1.45, 0.56, height + 1.45),
        collection,
        dark,
        root,
        "architecture",
        lod,
        bevel=0.12,
    )
    _box(
        f"{name}_SmokeGlass",
        (center_x, front_y - 0.34, z),
        (width, 0.13, height),
        collection,
        glass,
        root,
        "glass",
        lod,
        bevel=0.03,
    )
    # The screen is a rhythm of narrow information lines, so it remains
    # materially legible at a distance without turning the facade into neon.
    rail_count = 4 if lod == 0 else 2
    for index in range(rail_count):
        ratio = (index + 1) / (rail_count + 1)
        rail_x = center_x - width / 2 + width * ratio
        _box(
            f"{name}_SignalRail_{index + 1}",
            (rail_x, front_y - 0.44, z),
            (0.28, 0.10, height - 1.0),
            collection,
            signal,
            root,
            "screen-signal",
            lod,
            bevel=0.025,
        )
    _box(
        f"{name}_SignalHeader",
        (center_x, front_y - 0.44, z + height / 2 - 0.58),
        (width - 0.85, 0.10, 0.25),
        collection,
        signal,
        root,
        "screen-signal",
        lod,
        bevel=0.02,
    )
    if lod == 0:
        _box(
            f"{name}_HealthMarker",
            (center_x + width / 2 - 0.58, front_y - 0.47, z - height / 2 + 0.62),
            (0.34, 0.10, 0.34),
            collection,
            signal,
            root,
            "emissive",
            lod,
            bevel=0.02,
        )


def _tower_side_bands(
    name: str,
    center: tuple[float, float],
    body_height: float,
    collection: bpy.types.Collection,
    materials: dict[str, bpy.types.Material],
    root: bpy.types.Object,
    lod: int,
) -> None:
    """Add smoke-glass side bands aligned to the six-sided tower plan."""
    glass = materials["smoke_glass"]
    steel = materials["dark_steel"]
    signal = materials["emerald"]
    band_z = 4.1 + body_height * 0.54
    band_height = body_height * 0.67
    # These pairs map to the two visible diagonal facets of a hexagon whose
    # front face points toward -Y. They use only 30° and 60° orientations.
    for face_index, angle in enumerate((math.radians(30), math.radians(150)), start=1):
        offset = 10.1
        location = (
            center[0] + math.cos(angle) * offset,
            center[1] + math.sin(angle) * offset,
            band_z,
        )
        panel = _box(
            f"{name}_SideGlass_{face_index}",
            location,
            (7.25, 0.18, band_height),
            collection,
            glass,
            root,
            "glass",
            lod,
            rotation_z=angle + math.pi / 2,
            bevel=0.03,
        )
        panel["facing"] = "diagonal-media-facade"
        if lod == 0:
            rail = _box(
                f"{name}_SideSignal_{face_index}",
                (
                    center[0] + math.cos(angle) * 10.24,
                    center[1] + math.sin(angle) * 10.24,
                    band_z,
                ),
                (0.22, 0.10, band_height - 1.0),
                collection,
                signal,
                root,
                "screen-signal",
                lod,
                rotation_z=angle + math.pi / 2,
                bevel=0.02,
            )
            rail["facing"] = "diagonal-media-facade"
        _box(
            f"{name}_SideFrame_{face_index}",
            (
                center[0] + math.cos(angle) * 10.31,
                center[1] + math.sin(angle) * 10.31,
                4.1 + body_height * 0.5,
            ),
            (0.52, 0.38, body_height - 2.0),
            collection,
            steel,
            root,
            "technical",
            lod,
            rotation_z=angle + math.pi / 2,
            bevel=0.05,
        )


def _camera_mast(
    name: str,
    center: tuple[float, float],
    roof_z: float,
    target_x: float,
    collection: bpy.types.Collection,
    materials: dict[str, bpy.types.Material],
    root: bpy.types.Object,
    lod: int,
) -> None:
    """A physical broadcast camera mast rather than a decorative antenna."""
    steel = materials["dark_steel"]
    technical = materials["technical"]
    signal = materials["emerald"]
    mast_height = 1.90 if roof_z > 50.0 else 1.55
    mast = add_cylinder(
        f"{name}_Mast",
        (center[0], center[1], roof_z + mast_height / 2),
        0.68,
        mast_height,
        collection,
        steel,
        root,
        vertices=8,
        bevel=0.08,
    )
    _tag(mast, "camera-mast", lod)
    arm_direction = 1.0 if target_x > center[0] else -1.0
    _box(
        f"{name}_Arm",
        (center[0] + arm_direction * 2.0, center[1] - 0.20, roof_z + mast_height - 0.18),
        (4.15, 0.78, 0.72),
        collection,
        technical,
        root,
        "camera-mast",
        lod,
        bevel=0.08,
    )
    housing = _box(
        f"{name}_Housing",
        (target_x, center[1] - 0.20, roof_z + mast_height - 0.22),
        (2.0, 1.10, 1.10),
        collection,
        steel,
        root,
        "camera-mast",
        lod,
        bevel=0.10,
    )
    housing["function"] = "broadcast-camera"
    if lod == 0:
        lens = add_uv_sphere(
            f"{name}_Lens",
            (target_x + arm_direction * 1.12, center[1] - 0.20, roof_z + mast_height - 0.22),
            0.36,
            collection,
            signal,
            root,
            segments=12,
            rings=6,
        )
        _tag(lens, "screen-signal", lod)


def _tower(
    name: str,
    center_x: float,
    body_height: float,
    collection: bpy.types.Collection,
    materials: dict[str, bpy.types.Material],
    root: bpy.types.Object,
    lod: int,
) -> None:
    """Build one half of Vevi's asymmetrical dual-tower silhouette."""
    base_z = 4.10
    body_top = base_z + body_height
    black = materials["black_titanium"]
    steel = materials["dark_steel"]
    technical = materials["technical"]
    signal = materials["emerald"]
    center = (center_x, 0.0)

    body = add_tapered_prism(
        f"{name}_Body",
        (center_x, 0.0, base_z + body_height / 2),
        12.7,
        10.65,
        body_height,
        collection,
        black,
        root,
        vertices=6,
        rotation_z=0.0,
        bevel=0.20,
    )
    _tag(body, "architecture", lod)
    core = add_prism(
        f"{name}_TechnicalCore",
        (center_x, 0.0, base_z + body_height / 2),
        4.05,
        body_height - 1.0,
        collection,
        technical,
        root,
        vertices=6,
        rotation_z=0.0,
        bevel=0.12,
    )
    _tag(core, "architecture", lod)

    _tower_side_bands(name, center, body_height, collection, materials, root, lod)
    screen_height = min(25.0, body_height * 0.62)
    _screen_stack(
        f"{name}_FrontScreen",
        center_x,
        base_z + body_height * 0.56,
        13.6,
        screen_height,
        collection,
        materials,
        root,
        lod,
    )

    # A stepped crown makes the building read as broadcast infrastructure, not
    # a pair of generic office blocks.  Emerald signals stay deliberately
    # sparse, preserving the shared city emission language.
    shoulder = add_tapered_prism(
        f"{name}_CrownShoulder",
        (center_x, 0.0, body_top + 1.90),
        11.2,
        9.45,
        3.80,
        collection,
        steel,
        root,
        vertices=6,
        rotation_z=0.0,
        bevel=0.16,
    )
    _tag(shoulder, "architecture", lod)
    signal_ring = add_hex_ring(
        f"{name}_CrownMediaRing",
        (center_x, 0.0, body_top + 2.20),
        11.48,
        10.90,
        0.18,
        collection,
        signal,
        root,
        rotation_z=0.0,
        bevel=0.025,
    )
    _tag(signal_ring, "screen-signal", lod)
    cap = add_prism(
        f"{name}_CrownCap",
        (center_x, 0.0, body_top + 4.60),
        7.75,
        1.60,
        collection,
        black,
        root,
        vertices=6,
        rotation_z=0.0,
        bevel=0.13,
    )
    _tag(cap, "architecture", lod)
    health = add_hex_ring(
        f"{name}_CrownHealthRing",
        (center_x, 0.0, body_top + 5.36),
        7.05,
        6.72,
        0.14,
        collection,
        signal,
        root,
        rotation_z=0.0,
        bevel=0.02,
    )
    _tag(health, "emissive", lod)

    if lod == 0:
        # Horizontal cuts at whole-height stages reinforce the media-led
        # vertical cadence without resorting to texture panels.
        for index, z in enumerate((base_z + 8.5, base_z + body_height * 0.74), start=1):
            band = add_hex_ring(
                f"{name}_TechnicalBand_{index}",
                (center_x, 0.0, z),
                12.05 if index == 1 else 11.18,
                11.70 if index == 1 else 10.83,
                0.22,
                collection,
                steel,
                root,
                rotation_z=0.0,
                bevel=0.03,
            )
            _tag(band, "technical", lod)
        _camera_mast(
            name,
            (center_x, 0.0),
            # The mast is recessed into the crown rather than stacked above
            # it, preserving Vevi's documented 56 m delivery envelope.
            body_top + 3.60,
            center_x - 3.75 if center_x > 0.0 else center_x + 3.75,
            collection,
            materials,
            root,
            lod,
        )


def _broadcast_bridge(
    collection: bpy.types.Collection,
    materials: dict[str, bpy.types.Material],
    root: bpy.types.Object,
    lod: int,
) -> None:
    """Connect the two towers with a readable glass broadcast gallery."""
    steel = materials["dark_steel"]
    technical = materials["technical"]
    glass = materials["smoke_glass"]
    signal = materials["emerald"]
    _box("VMH_BridgeMass", (0.0, -0.40, 29.0), (29.5, 8.4, 8.8), collection, technical, root, "architecture", lod, bevel=0.18)
    _box("VMH_BridgeSmokeGlass", (0.0, -4.73, 29.0), (25.8, 0.15, 5.8), collection, glass, root, "glass", lod, bevel=0.03)
    _box("VMH_BridgeTopFrame", (0.0, -4.88, 32.15), (27.6, 0.25, 0.42), collection, steel, root, "technical", lod, bevel=0.04)
    _box("VMH_BridgeSignalLine", (0.0, -4.92, 32.45), (23.8, 0.10, 0.22), collection, signal, root, "screen-signal", lod, bevel=0.02)
    _box("VMH_BridgeHealthMarker", (0.0, -4.94, 25.95), (1.10, 0.10, 0.28), collection, signal, root, "emissive", lod, bevel=0.02)
    if lod == 0:
        for index, x in enumerate((-8.6, -4.3, 0.0, 4.3, 8.6), start=1):
            _box(
                f"VMH_BridgeMullion_{index}",
                (x, -4.90, 29.0),
                (0.32, 0.16, 5.8),
                collection,
                steel,
                root,
                "technical",
                lod,
                bevel=0.025,
            )


def _broadcast_crown(
    collection: bpy.types.Collection,
    materials: dict[str, bpy.types.Material],
    root: bpy.types.Object,
    lod: int,
) -> None:
    """Unify the twin towers with Vevi's recognisable transmission crown."""
    steel = materials["dark_steel"]
    signal = materials["emerald"]
    crown = add_hex_ring(
        "VMH_BroadcastCrownFrame",
        (0.0, 0.0, 45.4),
        23.6,
        20.4,
        0.82,
        collection,
        steel,
        root,
        rotation_z=0.0,
        bevel=0.10,
    )
    _tag(crown, "architecture", lod)
    signal_line = add_hex_ring(
        "VMH_BroadcastCrownSignal",
        (0.0, 0.0, 45.83),
        22.65,
        22.30,
        0.14,
        collection,
        signal,
        root,
        rotation_z=0.0,
        bevel=0.02,
    )
    _tag(signal_line, "screen-signal", lod)
    if lod == 0:
        for index, angle in enumerate((math.radians(0), math.radians(120), math.radians(240)), start=1):
            support = _box(
                f"VMH_BroadcastCrownSupport_{index}",
                radial_position(20.95, angle, 41.6),
                (1.25, 1.25, 7.0),
                collection,
                steel,
                root,
                "technical",
                lod,
                rotation_z=angle + math.radians(30),
                bevel=0.10,
            )
            support["function"] = "transmission-crown-support"


def _perimeter_camera_towers(
    collection: bpy.types.Collection,
    materials: dict[str, bpy.types.Material],
    root: bpy.types.Object,
    lod: int,
) -> None:
    """Three slim camera pylons establish Vevi's production-campus identity."""
    steel = materials["dark_steel"]
    technical = materials["technical"]
    signal = materials["emerald"]
    for index, (x, y) in enumerate(((-28.0, -5.0), (28.0, -5.0), (0.0, -20.0)), start=1):
        base = add_prism(
            f"VMH_PerimeterCameraPylon_{index}",
            (x, y, 10.2),
            2.55,
            18.0,
            collection,
            steel,
            root,
            vertices=6,
            rotation_z=0.0,
            bevel=0.12,
        )
        _tag(base, "camera-mast", lod)
        head = add_tapered_prism(
            f"VMH_PerimeterCameraHead_{index}",
            (x, y, 20.2),
            3.15,
            2.25,
            3.60,
            collection,
            technical,
            root,
            vertices=6,
            rotation_z=0.0,
            bevel=0.12,
        )
        _tag(head, "camera-mast", lod)
        head["function"] = "broadcast-camera"
        _box(
            f"VMH_PerimeterCameraHood_{index}",
            (x, y - 2.28, 20.22),
            (3.20, 1.20, 1.70),
            collection,
            steel,
            root,
            "camera-mast",
            lod,
            bevel=0.10,
        )
        if lod == 0:
            lens = add_uv_sphere(
                f"VMH_PerimeterCameraLens_{index}",
                (x, y - 3.02, 20.22),
                0.66,
                collection,
                signal,
                root,
                segments=12,
                rings=6,
            )
            _tag(lens, "screen-signal", lod)


def build_vevi(
    collection: bpy.types.Collection,
    materials: dict[str, bpy.types.Material],
    lod: int,
) -> bpy.types.Object:
    """Build Vevi's 56 m media hub in either web delivery LOD."""
    root = add_empty("VeviMediaHub" if lod == 0 else "VeviMediaHub_LOD1", collection)
    root["engineering_city_landmark"] = LANDMARK_ID
    root["engineering_city_lod"] = lod
    root["dimensions_meters"] = {"height": LANDMARK_HEIGHT_METERS, "baseRadius": 34.0}
    root["pivot"] = "ground-center"
    root["motion"] = "emerald screen signal sweep, 4 seconds, 0.55 to 1.00"

    black = materials["black_titanium"]
    steel = materials["dark_steel"]
    technical = materials["technical"]
    signal = materials["emerald"]

    for name, radius, z, height, material in (
        ("VMH_Foundation", 34.0, 0.60, 1.20, black),
        ("VMH_MediaPlaza", 30.6, 1.62, 0.84, steel),
        ("VMH_Podium", 27.2, 3.08, 2.08, technical),
    ):
        base = add_prism(name, (0.0, 0.0, z), radius, height, collection, material, root, bevel=0.20)
        _tag(base, "architecture", lod)
    plaza_energy = add_hex_ring("VMH_PlazaHealthTrim", (0.0, 0.0, 2.10), 29.25, 28.78, 0.15, collection, signal, root, bevel=0.02)
    _tag(plaza_energy, "emissive", lod)
    plaza_signal = add_hex_ring("VMH_PlazaMediaTrim", (0.0, 0.0, 3.96), 25.84, 25.45, 0.16, collection, signal, root, bevel=0.02)
    _tag(plaza_signal, "screen-signal", lod)

    _tower("VMH_WestTower", -13.35, 38.0, collection, materials, root, lod)
    _tower("VMH_EastTower", 13.35, 46.0, collection, materials, root, lod)
    _broadcast_bridge(collection, materials, root, lod)
    _broadcast_crown(collection, materials, root, lod)
    _perimeter_camera_towers(collection, materials, root, lod)

    # A deliberately shallow entry keeps the plaza navigable and makes the
    # two visible screens feel like a public broadcast surface.
    _box("VMH_EntryCanopy", (0.0, -25.8, 5.6), (20.0, 4.8, 2.5), collection, black, root, "architecture", lod, bevel=0.16)
    _box("VMH_EntryGlass", (0.0, -28.28, 4.1), (14.6, 0.16, 2.7), collection, materials["smoke_glass"], root, "glass", lod, bevel=0.03)
    _box("VMH_EntrySignal", (0.0, -28.42, 5.0), (10.8, 0.10, 0.22), collection, signal, root, "screen-signal", lod, bevel=0.02)

    if lod == 0:
        # Six protected entry lights retain scale information without adding
        # characters or external assets to the reusable GLB.
        for index, angle in enumerate((math.radians(210), math.radians(240), math.radians(270), math.radians(300), math.radians(330), math.radians(0)), start=1):
            x, y, _ = radial_position(24.2, angle, 0.0)
            bollard = add_cylinder(
                f"VMH_PerimeterBollard_{index}",
                (x, y, 3.35),
                0.30,
                2.35,
                collection,
                steel,
                root,
                vertices=8,
                bevel=0.05,
            )
            _tag(bollard, "set-dressing", lod)
            cap = add_cylinder(
                f"VMH_PerimeterLight_{index}",
                (x, y, 4.58),
                0.19,
                0.20,
                collection,
                signal,
                root,
                vertices=8,
                bevel=0.025,
            )
            _tag(cap, "emissive", lod)

    return root


def build_master_environment(
    root_collection: bpy.types.Collection,
    materials: dict[str, bpy.types.Material],
) -> bpy.types.Object:
    infrastructure = ensure_collection("INFRASTRUCTURE", root_collection)
    set_dressing = ensure_collection("SET_DRESSING", root_collection)
    atmosphere = ensure_collection("ATMOSPHERE", root_collection)
    environment_root = add_empty("VeviMediaEnvironment", infrastructure)

    ground = add_box("EC_WetAsphalt", (0.0, 0.0, -0.55), (180.0, 180.0, 1.0), infrastructure, materials["asphalt"], environment_root, bevel=0.10)
    _tag(ground, "infrastructure", -1)
    road = add_hex_ring("EC_MediaServiceRoad", (0.0, 0.0, 0.04), 44.0, 38.4, 0.11, infrastructure, materials["dark_steel"], environment_root, bevel=0.03)
    _tag(road, "infrastructure", -1)
    road_line = add_hex_ring("EC_MediaServiceRoadLine", (0.0, 0.0, 0.11), 41.9, 41.55, 0.06, infrastructure, materials["emerald"], environment_root, bevel=0.01)
    _tag(road_line, "infrastructure", -1)

    for index, angle in enumerate((math.radians(120), math.radians(60), math.radians(180)), start=1):
        position = radial_position(35.7, angle, 1.15)
        pod = add_prism(
            f"EC_MediaTechnicalPod_{index}",
            position,
            2.15,
            1.7,
            set_dressing,
            materials["technical"],
            None,
            vertices=6,
            rotation_z=0.0,
            bevel=0.10,
        )
        _tag(pod, "set-dressing", -1)

    mist = add_box("EC_LightMist", (0.0, 0.0, 44.0), (170.0, 170.0, 88.0), atmosphere, create_volume_material(), None)
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

    add_area_light("L_EmeraldKey", (0.0, -36.0, 12.0), (0.0, 0.0, 26.0), srgb_hex("#00D26A"), 38_000, 22.0, lights)
    add_area_light("L_ColdRim", (40.0, 34.0, 72.0), (0.0, 0.0, 28.0), srgb_hex("#6AA9B5"), 94_000, 32.0, lights)
    add_area_light("L_MediaSignalBounce", (0.0, -24.0, 38.0), (0.0, 0.0, 28.0), srgb_hex("#00D26A"), 28_000, 18.0, lights)
    add_area_light("L_ArchitectureFill", (72.0, -82.0, 92.0), (0.0, 0.0, 28.0), srgb_hex("#B8D3CC"), 240_000, 54.0, lights)
    add_area_light("L_FrontFill", (0.0, -58.0, 54.0), (0.0, 0.0, 25.0), srgb_hex("#B8D3CC"), 115_000, 42.0, lights)
    add_area_light("L_OverheadSky", (-15.0, 4.0, 150.0), (0.0, 0.0, 28.0), srgb_hex("#48696B"), 105_000, 84.0, lights)
    add_point_light("L_BridgeSignal", (0.0, -3.0, 29.0), srgb_hex("#00D26A"), 3_000, 5.0, lights)
    add_point_light("L_EastTowerHealth", (13.35, 0.0, 52.0), srgb_hex("#00D26A"), 2_500, 3.0, lights)
    return created


def animate_screen_signal(scene: bpy.types.Scene, material: bpy.types.Material) -> None:
    """Encode a restrained four-second screen pulse in Vevi's source scene."""
    scene.render.fps = 24
    scene.frame_start = 1
    scene.frame_end = 97
    bsdf = material.node_tree.nodes.get("Principled BSDF")
    socket = bsdf.inputs.get("Emission Strength") if bsdf else None
    if socket is None:
        return
    for frame, value in ((1, 1.76), (49, 3.20), (97, 1.76)):
        socket.default_value = value
        socket.keyframe_insert("default_value", frame=frame)
    if material.node_tree.animation_data and material.node_tree.animation_data.action:
        action = material.node_tree.animation_data.action
        if hasattr(action, "fcurves"):
            curves = action.fcurves
        else:
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
    render_dir = Path(args.render_dir)
    scene_path.parent.mkdir(parents=True, exist_ok=True)
    models_dir.mkdir(parents=True, exist_ok=True)
    render_dir.mkdir(parents=True, exist_ok=True)

    clear_scene()
    scene = bpy.context.scene
    configure_scene(scene, args.engine, args.samples)
    root_collection = ensure_collection("ENGINEERING_CITY")
    landmarks = ensure_collection("LANDMARKS", root_collection)
    vevi_collection = ensure_collection("VeviMediaHub", landmarks)
    materials = create_master_materials()
    lod0_root = build_vevi(vevi_collection, materials, lod=0)
    mist = build_master_environment(root_collection, materials)
    cameras = build_cameras_and_lights(root_collection)
    scene.camera = cameras["district-portrait-v1"]
    animate_screen_signal(scene, materials["emerald"])

    bpy.ops.wm.save_as_mainfile(filepath=str(scene_path))

    output: dict[str, object] = {
        "version": 1,
        "asset": LANDMARK_ID,
        "sourceScene": str(scene_path),
        "license": "first-party procedural geometry; public redistribution allowed",
        "pivot": "ground-center",
        "motion": {"type": "emerald-screen-signal-pulse", "durationSeconds": 4, "range": [0.55, 1.00]},
        "renderEngine": args.engine,
        "lods": [],
        "renders": [],
    }

    if not args.render_only:
        lod0 = export_landmark(lod0_root, models_dir, "vevi.glb")
        if lod0["triangles"] > LOD0_TRIANGLE_BUDGET:
            raise RuntimeError(f"LOD0 uses {lod0['triangles']} triangles; budget is {LOD0_TRIANGLE_BUDGET}")
        lod0["level"] = "lod0"
        output["lods"].append(lod0)

        lod1_collection = ensure_collection("VeviMediaHub_LOD1_EXPORT_ONLY", landmarks)
        lod1_root = build_vevi(lod1_collection, materials, lod=1)
        lod1 = export_landmark(lod1_root, models_dir, "vevi-lod1.glb")
        if lod1["triangles"] > LOD1_TRIANGLE_BUDGET:
            raise RuntimeError(f"LOD1 uses {lod1['triangles']} triangles; budget is {LOD1_TRIANGLE_BUDGET}")
        lod1["level"] = "lod1"
        output["lods"].append(lod1)
        remove_collection(lod1_collection)

    if not args.skip_render:
        output["renders"] = render_presets(scene, cameras, mist, render_dir, args.resolution_scale)

    manifest_path = render_dir / "vevi-build.json"
    with manifest_path.open("w", encoding="utf-8") as handle:
        json.dump(output, handle, indent=2)
        handle.write("\n")
    print(json.dumps(output, indent=2))
    print(f"Vevi build complete: {manifest_path}")


if __name__ == "__main__":
    main()
