"""Generate Engineering City's Intranet ESS source scene, GLBs and render QA.

Intranet ESS is the administrative campus landmark: a 42 m composition of
stacked ERP modules around visible courtyards, vertical service cores and
bridges.  It uses only first-party procedural geometry and Engineering City's
shared materials, so its source scene and public GLBs are reproducible.

Run from the repository root:

    /Applications/Blender.app/Contents/MacOS/Blender --background \
      --python blender/generate_intranet_ess.py -- --engine BLENDER_EEVEE_NEXT

Use ``--skip-render`` for a fast authoring/export pass.  Use ``--engine
CYCLES --samples 64`` for the final lighting master once the composition is
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


LANDMARK_ID = "intranet-ess"
LANDMARK_HEIGHT_METERS = 42.0
LOD0_TRIANGLE_BUDGET = 18_000
LOD1_TRIANGLE_BUDGET = 5_000
DEFAULT_SCENE_PATH = "blender/scenes/engineering-city-intranet-ess-v1.blend"
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
        (102.0, -116.0, 126.0),
        (0.0, 1.0, 16.0),
        0.18,
        0.14,
        1.40,
        (1920, 1080),
    ),
    CameraPreset(
        "district-portrait-v1",
        50,
        (80.0, -94.0, 78.0),
        (0.0, 1.0, 17.0),
        0.14,
        0.10,
        1.16,
        (1600, 900),
    ),
    CameraPreset(
        "architecture-sheet-v1",
        70,
        (0.0, -134.0, 25.0),
        (0.0, 4.0, 20.0),
        0.00,
        0.00,
        1.08,
        (1600, 1200),
        "ORTHO",
        120.0,
    ),
    CameraPreset(
        "detail-material-v1",
        85,
        (38.0, -34.0, 31.0),
        (5.0, 5.0, 18.0),
        0.06,
        0.06,
        1.08,
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


def _local_position(
    origin: tuple[float, float],
    local_x: float,
    local_y: float,
    z: float,
    rotation_z: float,
) -> tuple[float, float, float]:
    cosine = math.cos(rotation_z)
    sine = math.sin(rotation_z)
    return (
        origin[0] + local_x * cosine - local_y * sine,
        origin[1] + local_x * sine + local_y * cosine,
        z,
    )


def _window_band(
    name: str,
    origin: tuple[float, float],
    local_y: float,
    span: float,
    lower_z: float,
    rows: int,
    panel_height: float,
    count: int,
    rotation_z: float,
    collection: bpy.types.Collection,
    materials: dict[str, bpy.types.Material],
    root: bpy.types.Object,
    lod: int,
) -> None:
    """Regular vertical smoke-glass modules make an ERP campus readable."""
    actual_count = count if lod == 0 else max(3, count // 2)
    actual_rows = rows if lod == 0 else max(1, rows - 1)
    spacing = 0.54 if lod == 0 else 0.70
    panel_width = (span - (actual_count - 1) * spacing) / actual_count
    glass = materials["smoke_glass"]
    technical = materials["technical"]
    emerald = materials["emerald"]
    for row in range(actual_rows):
        z = lower_z + row * (panel_height + 1.25)
        for index in range(actual_count):
            local_x = -span / 2 + panel_width / 2 + index * (panel_width + spacing)
            panel = _box(
                f"{name}_Glass_{row + 1}_{index + 1}",
                _local_position(origin, local_x, local_y, z, rotation_z),
                (panel_width, 0.18, panel_height),
                collection,
                glass,
                root,
                "glass",
                lod,
                rotation_z=rotation_z,
                bevel=0.025,
            )
            panel["window_system"] = "vertical-admin-band"
            if lod == 0:
                # A technical inner reveal catches the neutral key light through
                # smoke glass, so the campus reads as offices rather than a set
                # of anonymous black volumes at web-thumbnail scale.
                reveal = _box(
                    f"{name}_InnerReveal_{row + 1}_{index + 1}",
                    _local_position(origin, local_x, local_y + 0.11, z, rotation_z),
                    (panel_width + 0.14, 0.08, panel_height + 0.16),
                    collection,
                    technical,
                    root,
                    "technical",
                    lod,
                    rotation_z=rotation_z,
                    bevel=0.015,
                )
                reveal["window_system"] = "technical-inner-reveal"
        if lod == 0:
            lintel = _box(
                f"{name}_TechnicalLintel_{row + 1}",
                _local_position(origin, 0.0, local_y - 0.04, z + panel_height / 2 + 0.42, rotation_z),
                (span + 0.56, 0.26, 0.25),
                collection,
                technical,
                root,
                "technical",
                lod,
                rotation_z=rotation_z,
                bevel=0.02,
            )
            if row == 0:
                marker = _box(
                    f"{name}_StatusRail",
                    _local_position(origin, 0.0, local_y - 0.16, z - panel_height / 2 + 0.35, rotation_z),
                    (span * 0.42, 0.10, 0.11),
                    collection,
                    emerald,
                    root,
                    "emissive",
                    lod,
                    rotation_z=rotation_z,
                    bevel=0.01,
                )
                marker["motion"] = "administrative circulation pulse, 8 seconds"


def _campus_module(
    name: str,
    location: tuple[float, float, float],
    dimensions: tuple[float, float, float],
    rotation_z: float,
    collection: bpy.types.Collection,
    materials: dict[str, bpy.types.Material],
    root: bpy.types.Object,
    lod: int,
    upper_scale: float = 0.72,
) -> None:
    """A stepped administrative block with a re-usable technical roof module."""
    black = materials["black_titanium"]
    steel = materials["dark_steel"]
    technical = materials["technical"]
    body = _box(name, location, dimensions, collection, black, root, "architecture", lod, rotation_z, bevel=0.30)
    body["module_type"] = "administrative-erp"
    roof_z = location[2] + dimensions[2] / 2 + 0.32
    roof = _box(
        f"{name}_TechnicalRoof",
        (location[0], location[1], roof_z),
        (dimensions[0] * 0.88, dimensions[1] * 0.84, 0.52),
        collection,
        technical,
        root,
        "architecture",
        lod,
        rotation_z,
        bevel=0.12,
    )
    roof["module_type"] = "service-roof"
    if upper_scale <= 0:
        return
    upper_height = max(3.2, dimensions[2] * 0.30)
    upper = _box(
        f"{name}_StackedModule",
        (location[0], location[1], roof_z + upper_height / 2),
        (dimensions[0] * upper_scale, dimensions[1] * upper_scale, upper_height),
        collection,
        steel,
        root,
        "architecture",
        lod,
        rotation_z,
        bevel=0.20,
    )
    upper["module_type"] = "stacked-administration"


def _bridge(
    name: str,
    location: tuple[float, float, float],
    length: float,
    width: float,
    rotation_z: float,
    collection: bpy.types.Collection,
    materials: dict[str, bpy.types.Material],
    root: bpy.types.Object,
    lod: int,
) -> None:
    """A glazed bridge makes the central courtyard visibly connected."""
    steel = materials["dark_steel"]
    glass = materials["smoke_glass"]
    emerald = materials["emerald"]
    deck = _box(
        f"{name}_Deck",
        location,
        (length, width, 1.45),
        collection,
        steel,
        root,
        "bridge",
        lod,
        rotation_z,
        bevel=0.10,
    )
    deck["module_type"] = "courtyard-bridge"
    origin = (location[0], location[1])
    for side in (-1, 1):
        rail = _box(
            f"{name}_GlassRail_{'L' if side < 0 else 'R'}",
            _local_position(origin, 0.0, side * (width / 2 - 0.20), location[2] + 1.22, rotation_z),
            (length - 1.2, 0.10, 1.55),
            collection,
            glass,
            root,
            "glass",
            lod,
            rotation_z,
            bevel=0.02,
        )
    if lod == 0:
        lane = _box(
            f"{name}_CirculationLane",
            _local_position(origin, 0.0, 0.0, location[2] + 0.80, rotation_z),
            (length * 0.72, 0.18, 0.10),
            collection,
            emerald,
            root,
            "emissive",
            lod,
            rotation_z,
            bevel=0.01,
        )
        lane["motion"] = "circulation pulse, 8 seconds"


def _vertical_core(
    name: str,
    location: tuple[float, float],
    collection: bpy.types.Collection,
    materials: dict[str, bpy.types.Material],
    root: bpy.types.Object,
    lod: int,
) -> None:
    """A narrow service core gives the campus an unmistakable 42 m profile."""
    black = materials["black_titanium"]
    steel = materials["dark_steel"]
    glass = materials["smoke_glass"]
    emerald = materials["emerald"]
    base = add_prism(f"{name}_Base", (location[0], location[1], 4.3), 6.0, 4.2, collection, black, root, bevel=0.15)
    _tag(base, "vertical-core", lod)
    body = add_tapered_prism(f"{name}_Body", (location[0], location[1], 20.2), 4.7, 3.8, 28.0, collection, steel, root, bevel=0.16)
    _tag(body, "vertical-core", lod)
    for face in range(3):
        angle = math.radians(30 + face * 120)
        x = location[0] + math.cos(angle) * 4.15
        y = location[1] + math.sin(angle) * 4.15
        glass_panel = _box(
            f"{name}_VerticalGlass_{face + 1}",
            (x, y, 20.4),
            (1.95, 0.16, 20.4),
            collection,
            glass,
            root,
            "glass",
            lod,
            rotation_z=angle + math.pi / 2,
            bevel=0.02,
        )
        glass_panel["window_system"] = "vertical-core"
    spine = _box(
        f"{name}_EnergySpine",
        (location[0], location[1] - 4.82, 21.2),
        (0.18, 0.10, 23.2),
        collection,
        emerald,
        root,
        "emissive",
        lod,
        bevel=0.015,
    )
    spine["motion"] = "core pulse, 8 seconds"
    cap = add_prism(f"{name}_Cap", (location[0], location[1], 35.25), 4.95, 1.70, collection, black, root, bevel=0.12)
    _tag(cap, "vertical-core", lod)
    collar = add_hex_ring(f"{name}_EnergyCollar", (location[0], location[1], 36.02), 5.2, 4.72, 0.13, collection, emerald, root, bevel=0.02)
    _tag(collar, "emissive", lod)
    mast = add_prism(f"{name}_ServiceMast", (location[0], location[1], 39.50), 0.58, 5.00, collection, steel, root, bevel=0.04)
    _tag(mast, "vertical-core", lod)
    beacon = add_prism(f"{name}_ServiceBeacon", (location[0], location[1], 40.65), 0.72, 1.70, collection, emerald, root, bevel=0.05)
    _tag(beacon, "emissive", lod)


def _courtyard(
    collection: bpy.types.Collection,
    materials: dict[str, bpy.types.Material],
    root: bpy.types.Object,
    lod: int,
) -> None:
    """An open central courtyard: the identity of Intranet ESS from above."""
    asphalt = materials["asphalt"]
    steel = materials["dark_steel"]
    technical = materials["technical"]
    emerald = materials["emerald"]
    courtyard_y = 0.0
    courtyard_floor = add_prism("ESS_InternalCourtyardFloor", (0.0, courtyard_y, 3.15), 17.6, 0.42, collection, asphalt, root, bevel=0.08)
    _tag(courtyard_floor, "courtyard", lod)
    walkway = add_hex_ring("ESS_CourtyardWalkway", (0.0, courtyard_y, 3.55), 22.1, 17.9, 0.48, collection, steel, root, bevel=0.08)
    _tag(walkway, "courtyard", lod)
    guidance = add_hex_ring("ESS_CourtyardGuidance", (0.0, courtyard_y, 3.84), 18.5, 18.18, 0.08, collection, emerald, root, bevel=0.015)
    _tag(guidance, "emissive", lod)
    if lod == 0:
        garden_base = add_prism("ESS_CourtyardDataGarden", (0.0, courtyard_y, 3.75), 8.4, 0.36, collection, technical, root, bevel=0.08)
        _tag(garden_base, "courtyard", lod)
        garden_ring = add_hex_ring("ESS_CourtyardDataGardenRing", (0.0, courtyard_y, 3.98), 7.8, 7.28, 0.10, collection, emerald, root, bevel=0.015)
        _tag(garden_ring, "emissive", lod)
        garden_node = add_prism("ESS_CourtyardNode", (0.0, courtyard_y, 4.55), 2.25, 1.28, collection, steel, root, bevel=0.08)
        _tag(garden_node, "courtyard", lod)
    for index, angle in enumerate((math.radians(30), math.radians(150), math.radians(270)), start=1):
        position = radial_position(11.8, angle, 4.65)
        planter = add_prism(
            f"ESS_CourtyardPlanter_{index}",
            (position[0], position[1] + courtyard_y, position[2]),
            2.15,
            1.7,
            collection,
            technical,
            root,
            bevel=0.10,
        )
        _tag(planter, "courtyard-set-dressing", lod)
        if lod == 0:
            canopy = add_uv_sphere(
                f"ESS_CourtyardCanopy_{index}",
                (position[0], position[1] + courtyard_y, 6.45),
                1.48,
                collection,
                steel,
                root,
                segments=12,
                rings=6,
            )
            canopy.scale = (0.92, 0.92, 1.28)
            _tag(canopy, "courtyard-set-dressing", lod)


def _entry_portal(
    collection: bpy.types.Collection,
    materials: dict[str, bpy.types.Material],
    root: bpy.types.Object,
    lod: int,
) -> None:
    """An open campus entry preserves sight-lines to the courtyard."""
    black = materials["black_titanium"]
    steel = materials["dark_steel"]
    glass = materials["smoke_glass"]
    emerald = materials["emerald"]
    for side, x in (("L", -10.5), ("R", 10.5)):
        pillar = _box(
            f"ESS_EntryPillar_{side}",
            (x, -29.5, 7.3),
            (2.1, 2.4, 11.6),
            collection,
            black,
            root,
            "architecture",
            lod,
            bevel=0.14,
        )
        pillar["module_type"] = "campus-entry"
    lintel = _box("ESS_EntryLintel", (0.0, -29.5, 13.1), (23.2, 2.4, 1.25), collection, steel, root, "architecture", lod, bevel=0.12)
    glass_wall = _box("ESS_EntrySmokeGlass", (0.0, -28.45, 7.6), (17.8, 0.16, 10.0), collection, glass, root, "glass", lod, bevel=0.03)
    rail = _box("ESS_EntryEnergyRail", (0.0, -30.78, 2.94), (18.8, 0.12, 0.14), collection, emerald, root, "emissive", lod, bevel=0.01)
    rail["motion"] = "campus welcome pulse, 8 seconds"


def build_intranet_ess(
    collection: bpy.types.Collection,
    materials: dict[str, bpy.types.Material],
    lod: int,
) -> bpy.types.Object:
    """Build the 42 m Intranet ESS campus for LOD0 or LOD1."""
    root = add_empty("IntranetESS" if lod == 0 else "IntranetESS_LOD1", collection)
    root["engineering_city_landmark"] = LANDMARK_ID
    root["engineering_city_lod"] = lod
    root["dimensions_meters"] = {"height": LANDMARK_HEIGHT_METERS, "baseRadius": 48.0}
    root["pivot"] = "ground-center"
    root["motion"] = "service cores, bridges and guidance rails pulse every 8 seconds"

    black = materials["black_titanium"]
    steel = materials["dark_steel"]
    technical = materials["technical"]
    emerald = materials["emerald"]

    # Heavy hexagonal ground logic joins the campus to the same city grid while
    # the intentionally open middle makes it read unlike the other landmarks.
    for name, radius, z, height, material in (
        ("ESS_Foundation", 48.0, 0.70, 1.40, black),
        ("ESS_CampusDeck", 44.2, 1.72, 0.82, steel),
        ("ESS_AdminPodium", 40.2, 2.55, 0.74, technical),
    ):
        mass = add_prism(name, (0.0, 0.0, z), radius, height, collection, material, root, bevel=0.20)
        _tag(mass, "architecture", lod)
    perimeter = add_hex_ring("ESS_CampusEnergyPerimeter", (0.0, 0.0, 3.02), 39.5, 39.18, 0.10, collection, emerald, root, bevel=0.02)
    _tag(perimeter, "emissive", lod)

    # Five managed modules leave an actual courtyard instead of faking it with
    # dark material.  Every main face gets a regular vertical window system.
    modules = (
        ("ESS_SouthWestAdmin", (-22.0, -10.0, 8.7), (20.0, 20.0, 11.4), math.radians(30), 0.58),
        ("ESS_SouthEastAdmin", (22.0, -10.0, 8.7), (20.0, 20.0, 11.4), math.radians(-30), 0.58),
        ("ESS_WestOperations", (-27.0, 14.0, 12.8), (17.0, 25.0, 19.6), math.radians(30), 0.58),
        ("ESS_EastOperations", (27.0, 14.0, 12.8), (17.0, 25.0, 19.6), math.radians(-30), 0.58),
        ("ESS_NorthAdministration", (0.0, 30.0, 15.0), (42.0, 15.0, 23.0), 0.0, 0.62),
    )
    for name, location, dimensions, rotation, upper_scale in modules:
        _campus_module(name, location, dimensions, rotation, collection, materials, root, lod, upper_scale)

    _window_band("ESS_SouthWestFacade", (-22.0, -10.0), -10.15, 14.5, 7.0, 2, 4.25, 5, math.radians(30), collection, materials, root, lod)
    _window_band("ESS_SouthEastFacade", (22.0, -10.0), -10.15, 14.5, 7.0, 2, 4.25, 5, math.radians(-30), collection, materials, root, lod)
    _window_band("ESS_WestInnerFacade", (-27.0, 14.0), -12.65, 12.5, 8.0, 3, 4.60, 4, math.radians(30), collection, materials, root, lod)
    _window_band("ESS_EastInnerFacade", (27.0, 14.0), -12.65, 12.5, 8.0, 3, 4.60, 4, math.radians(-30), collection, materials, root, lod)
    _window_band("ESS_NorthInnerFacade", (0.0, 30.0), -7.65, 34.5, 8.5, 3, 5.20, 10, 0.0, collection, materials, root, lod)

    # A small upper administrative block makes the rear mass stepped rather
    # than a featureless wall, and is visible through the bridge sequence.
    _campus_module(
        "ESS_NorthExecutiveModule",
        (0.0, 30.0, 31.55),
        (26.0, 10.4, 6.8),
        0.0,
        collection,
        materials,
        root,
        lod,
        upper_scale=0.0,
    )
    executive_cap = add_tapered_prism("ESS_NorthExecutiveCap", (0.0, 30.0, 35.35), 12.2, 9.4, 1.55, collection, steel, root, bevel=0.12)
    _tag(executive_cap, "architecture", lod)

    _courtyard(collection, materials, root, lod)
    _entry_portal(collection, materials, root, lod)

    # Two service cores and three bridge elevations turn the courtyard into a
    # working campus network.  The diagonal bridge is deliberately 30°.
    _vertical_core("ESS_WestServiceCore", (-20.5, 10.0), collection, materials, root, lod)
    _vertical_core("ESS_EastServiceCore", (20.5, 10.0), collection, materials, root, lod)
    _bridge("ESS_CourtyardBridge_Lower", (0.0, -1.0, 15.6), 35.5, 4.0, 0.0, collection, materials, root, lod)
    _bridge("ESS_CourtyardBridge_Upper", (0.0, 8.8, 24.4), 35.0, 3.6, 0.0, collection, materials, root, lod)
    _bridge("ESS_CourtyardBridge_Diagonal", (0.0, 4.0, 20.3), 33.0, 3.1, math.radians(30), collection, materials, root, lod)

    if lod == 0:
        # Reusable terrace details give scale, but their low count preserves
        # the clear, calm administrative character rather than a busy factory.
        for index, (x, y, z, rotation) in enumerate(
            ((-33.0, -21.0, 4.45, math.radians(30)), (33.0, -21.0, 4.45, math.radians(-30)), (-34.0, 25.0, 4.45, math.radians(60)), (34.0, 25.0, 4.45, math.radians(-60))),
            start=1,
        ):
            station = add_prism(
                f"ESS_TerraceServiceStation_{index}",
                (x, y, z),
                1.75,
                2.4,
                collection,
                technical,
                root,
                rotation_z=rotation,
                bevel=0.08,
            )
            _tag(station, "set-dressing", lod)
            indicator = add_cylinder(
                f"ESS_TerraceIndicator_{index}",
                (x, y, z + 1.42),
                0.28,
                0.18,
                collection,
                materials["halo"],
                root,
                vertices=8,
                bevel=0.02,
            )
            _tag(indicator, "emissive", lod)

    return root


def build_master_environment(
    root_collection: bpy.types.Collection,
    materials: dict[str, bpy.types.Material],
) -> bpy.types.Object:
    infrastructure = ensure_collection("INFRASTRUCTURE", root_collection)
    set_dressing = ensure_collection("SET_DRESSING", root_collection)
    atmosphere = ensure_collection("ATMOSPHERE", root_collection)
    environment_root = add_empty("IntranetESSEnvironment", infrastructure)

    ground = add_box("EC_WetAsphalt", (0.0, 0.0, -0.55), (205.0, 205.0, 1.0), infrastructure, materials["asphalt"], environment_root, bevel=0.10)
    _tag(ground, "infrastructure", -1)
    road = add_hex_ring("EC_CampusServiceRoad", (0.0, 0.0, 0.04), 64.0, 56.0, 0.12, infrastructure, materials["dark_steel"], environment_root, bevel=0.03)
    _tag(road, "infrastructure", -1)
    road_line = add_hex_ring("EC_CampusRoadEnergyLine", (0.0, 0.0, 0.12), 61.5, 61.15, 0.06, infrastructure, materials["emerald"], environment_root, bevel=0.01)
    _tag(road_line, "infrastructure", -1)

    for index, angle in enumerate((math.radians(30), math.radians(150), math.radians(270)), start=1):
        position = radial_position(53.0, angle, 1.35)
        planter = add_prism(
            f"EC_CampusPlanter_{index}",
            position,
            2.3,
            1.9,
            set_dressing,
            materials["technical"],
            None,
            bevel=0.10,
        )
        _tag(planter, "set-dressing", -1)
        canopy = add_uv_sphere(
            f"EC_CampusCanopy_{index}",
            (position[0], position[1], 3.7),
            1.55,
            set_dressing,
            materials["dark_steel"],
            None,
            segments=12,
            rings=6,
        )
        canopy.scale = (0.90, 0.90, 1.25)
        _tag(canopy, "set-dressing", -1)

    mist = add_box("EC_LightMist", (0.0, 0.0, 47.0), (196.0, 196.0, 94.0), atmosphere, create_volume_material(), None)
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

    # Neutral architectural lights reveal structure; green stays reserved for
    # circulation systems and cores rather than colour-casting every facade.
    add_area_light("L_EmeraldCourtyardPractical", (0.0, -35.0, 14.0), (0.0, 4.0, 14.0), srgb_hex("#00D26A"), 8_000, 18.0, lights)
    add_area_light("L_ColdCampusRim", (62.0, 48.0, 72.0), (0.0, 5.0, 20.0), srgb_hex("#6AA9B5"), 190_000, 50.0, lights)
    add_area_light("L_WestCampusFill", (-68.0, -42.0, 55.0), (0.0, 2.0, 17.0), srgb_hex("#6B8590"), 180_000, 52.0, lights)
    add_area_light("L_LowCampusFill", (0.0, -62.0, 27.0), (0.0, 1.0, 9.0), srgb_hex("#607B7C"), 92_000, 46.0, lights)
    add_area_light("L_FrontArchitectureFill", (0.0, -112.0, 76.0), (0.0, 2.0, 18.0), srgb_hex("#B8D3CC"), 245_000, 72.0, lights)
    add_area_light("L_OverheadSky", (-12.0, 5.0, 145.0), (0.0, 5.0, 18.0), srgb_hex("#48696B"), 220_000, 105.0, lights)
    add_point_light("L_CourtyardBounce", (0.0, 4.0, 13.0), srgb_hex("#00D26A"), 7_000, 8.0, lights)
    add_point_light("L_CoreBeacon", (0.0, 18.0, 34.0), srgb_hex("#5CFF9D"), 3_000, 5.0, lights)
    return created


def animate_emissive_pulse(scene: bpy.types.Scene, materials: dict[str, bpy.types.Material]) -> None:
    """Encode the shared Motion Bible's calm, 8-second campus pulse."""
    scene.render.fps = 24
    scene.frame_start = 1
    scene.frame_end = 193
    for name, base in (("emerald", 3.2), ("halo", 1.5)):
        material = materials[name]
        socket = material.node_tree.nodes.get("Principled BSDF").inputs.get("Emission Strength")
        if socket is None:
            continue
        for frame, factor in ((1, 0.70), (97, 1.0), (193, 0.70)):
            socket.default_value = base * factor
            socket.keyframe_insert("default_value", frame=frame)
        if material.node_tree.animation_data and material.node_tree.animation_data.action:
            action = material.node_tree.animation_data.action
            curves = action.fcurves if hasattr(action, "fcurves") else [
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
    campus_collection = ensure_collection("IntranetESS", landmarks)
    materials = create_master_materials()

    lod0_root = build_intranet_ess(campus_collection, materials, lod=0)
    mist = build_master_environment(root_collection, materials)
    cameras = build_cameras_and_lights(root_collection)
    scene.camera = cameras["district-portrait-v1"]
    animate_emissive_pulse(scene, materials)
    bpy.ops.wm.save_as_mainfile(filepath=str(scene_path))

    output: dict[str, object] = {
        "version": 1,
        "asset": LANDMARK_ID,
        "sourceScene": str(scene_path),
        "license": "first-party procedural geometry; public redistribution allowed",
        "pivot": "ground-center",
        "motion": {"type": "campus-circulation-pulse", "durationSeconds": 8, "range": [0.70, 1.00]},
        "renderEngine": args.engine,
        "lods": [],
        "renders": [],
    }

    if not args.render_only:
        lod0 = export_landmark(lod0_root, models_dir, "intranet-ess.glb")
        if lod0["triangles"] > LOD0_TRIANGLE_BUDGET:
            raise RuntimeError(f"LOD0 uses {lod0['triangles']} triangles; budget is {LOD0_TRIANGLE_BUDGET}")
        lod0["level"] = "lod0"
        output["lods"].append(lod0)

        lod1_collection = ensure_collection("IntranetESS_LOD1_EXPORT_ONLY", landmarks)
        lod1_root = build_intranet_ess(lod1_collection, materials, lod=1)
        lod1 = export_landmark(lod1_root, models_dir, "intranet-ess-lod1.glb")
        if lod1["triangles"] > LOD1_TRIANGLE_BUDGET:
            raise RuntimeError(f"LOD1 uses {lod1['triangles']} triangles; budget is {LOD1_TRIANGLE_BUDGET}")
        lod1["level"] = "lod1"
        output["lods"].append(lod1)
        remove_collection(lod1_collection)

    if not args.skip_render:
        output["renders"] = render_presets(scene, cameras, mist, render_dir, args.resolution_scale)

    manifest_path = render_dir / "intranet-ess-build.json"
    with manifest_path.open("w", encoding="utf-8") as handle:
        json.dump(output, handle, indent=2)
        handle.write("\n")
    print(json.dumps(output, indent=2))
    print(f"Intranet ESS build complete: {manifest_path}")


if __name__ == "__main__":
    main()
