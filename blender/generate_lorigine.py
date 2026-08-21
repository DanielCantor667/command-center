"""Generate Engineering City's L'Origine research pavilion, GLBs and render QA.

L'Origine is a first-party procedural bioengineering pavilion.  Its identity
comes from a tall hexagonal laboratory threshold, precision terraces, smoke
glass research chambers and a restrained emerald signal—not logos, text or
borrowed assets.

Run from the repository root:

    /Applications/Blender.app/Contents/MacOS/Blender --background \
      --python blender/generate_lorigine.py -- --engine BLENDER_EEVEE_NEXT

Use ``--skip-render`` for a fast source/GLB export.  The script produces:

    blender/scenes/engineering-city-lorigine-v1.blend
    apps/web/public/models/city/lorigine.glb
    apps/web/public/models/city/lorigine-lod1.glb
    blender/output/engineering-city/lorigine-*.{png,exr}
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


LANDMARK_ID = "lorigine"
LANDMARK_HEIGHT_METERS = 30.0
LOD0_TRIANGLE_BUDGET = 18_000
LOD1_TRIANGLE_BUDGET = 5_000
DEFAULT_SCENE_PATH = "blender/scenes/engineering-city-lorigine-v1.blend"
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
        (68.0, -110.0, 84.0),
        (0.0, -4.0, 13.0),
        0.18,
        0.14,
        1.20,
        (1920, 1080),
    ),
    CameraPreset(
        "district-portrait-v1",
        50,
        (96.0, -122.0, 80.0),
        (0.0, -4.0, 13.0),
        0.14,
        0.10,
        1.12,
        (1600, 900),
    ),
    CameraPreset(
        "architecture-sheet-v1",
        70,
        (0.0, -124.0, 19.0),
        (0.0, 0.0, 15.0),
        0.00,
        0.00,
        1.00,
        (1600, 1200),
        "ORTHO",
        76.0,
    ),
    CameraPreset(
        "detail-material-v1",
        85,
        (24.0, -46.0, 24.0),
        (0.0, -20.0, 12.0),
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


def _vertical_portal_ring(
    name: str,
    location: tuple[float, float, float],
    outer_radius: float,
    inner_radius: float,
    depth: float,
    collection: bpy.types.Collection,
    material: bpy.types.Material,
    root: bpy.types.Object,
    role: str,
    lod: int,
    bevel: float,
) -> bpy.types.Object:
    """Stand an extruded hex ring upright to form a real laboratory threshold."""
    portal = add_hex_ring(
        name,
        location,
        outer_radius,
        inner_radius,
        depth,
        collection,
        material,
        root,
        rotation_z=0.0,
        bevel=bevel,
    )
    portal.rotation_euler[0] = math.radians(90)
    return _tag(portal, role, lod)


def _research_capsule(
    name: str,
    location: tuple[float, float, float],
    rotation_z: float,
    collection: bpy.types.Collection,
    materials: dict[str, bpy.types.Material],
    root: bpy.types.Object,
    lod: int,
) -> None:
    """A sealed, abstract lab chamber whose function reads without product text."""
    black = materials["black_titanium"]
    steel = materials["dark_steel"]
    glass = materials["smoke_glass"]
    signal = materials["emerald"]
    body = add_tapered_prism(
        f"{name}_Body",
        location,
        4.85,
        3.92,
        7.6,
        collection,
        black,
        root,
        vertices=6,
        rotation_z=rotation_z,
        bevel=0.14,
    )
    _tag(body, "research-chamber", lod)
    shell = add_prism(
        f"{name}_SmokeGlass",
        (location[0], location[1], location[2] + 0.25),
        3.34,
        5.55,
        collection,
        glass,
        root,
        vertices=6,
        rotation_z=rotation_z,
        bevel=0.06,
    )
    _tag(shell, "glass", lod)
    core = add_prism(
        f"{name}_BioCore",
        (location[0], location[1], location[2] + 0.35),
        0.78,
        6.35,
        collection,
        signal,
        root,
        vertices=6,
        rotation_z=rotation_z,
        bevel=0.05,
    )
    _tag(core, "emissive", lod)
    collar = add_hex_ring(
        f"{name}_Collar",
        (location[0], location[1], location[2] + 2.2),
        4.38,
        4.02,
        0.15,
        collection,
        signal,
        root,
        rotation_z=rotation_z,
        bevel=0.02,
    )
    _tag(collar, "emissive", lod)
    if lod == 0:
        for index, angle in enumerate((rotation_z, rotation_z + math.radians(120), rotation_z + math.radians(240)), start=1):
            x, y, _ = radial_position(4.58, angle, 0.0)
            sensor = _box(
                f"{name}_Sensor_{index}",
                (location[0] + x, location[1] + y, location[2] + 1.2),
                (0.36, 0.36, 1.25),
                collection,
                steel,
                root,
                "research-instrument",
                lod,
                rotation_z=angle,
                bevel=0.04,
            )
            sensor["function"] = "sealed sample monitoring"


def _portal(
    collection: bpy.types.Collection,
    materials: dict[str, bpy.types.Material],
    root: bpy.types.Object,
    lod: int,
) -> None:
    """The iconic front-side hex threshold is L'Origine's thumbnail silhouette."""
    steel = materials["dark_steel"]
    black = materials["black_titanium"]
    technical = materials["technical"]
    glass = materials["smoke_glass"]
    signal = materials["emerald"]
    portal = _vertical_portal_ring(
        "ORG_LaboratoryThreshold",
        (0.0, -28.25, 16.0),
        16.10,
        12.92,
        1.35,
        collection,
        steel,
        root,
        "architecture",
        lod,
        0.15,
    )
    portal["function"] = "professional laboratory threshold"
    signal_ring = _vertical_portal_ring(
        "ORG_ThresholdSignal",
        (0.0, -29.02, 16.0),
        14.84,
        14.40,
        0.14,
        collection,
        signal,
        root,
        "emissive",
        lod,
        0.02,
    )
    signal_ring["function"] = "entry status signal"
    _box("ORG_ThresholdBase", (0.0, -28.25, 2.35), (30.0, 2.4, 1.20), collection, black, root, "architecture", lod, bevel=0.14)
    _box("ORG_ThresholdGlass", (0.0, -27.46, 8.25), (21.2, 0.14, 10.6), collection, glass, root, "glass", lod, bevel=0.03)
    _box("ORG_ThresholdSignalLine", (0.0, -29.15, 3.16), (19.4, 0.10, 0.18), collection, signal, root, "emissive", lod, bevel=0.02)

    # The portal ring is deliberately articulated into six 60° structural
    # segments.  The continuous inner ring preserves the airtight silhouette,
    # while these visible modules make the threshold unmistakable at thumbnail
    # scale and echo the approved concept sheet.
    for index, (x, z, rotation_y) in enumerate(
        (
            (12.08, 22.55, math.radians(-120)),
            (0.0, 29.25, 0.0),
            (-12.08, 22.55, math.radians(120)),
            (-12.08, 9.03, math.radians(60)),
            (0.0, 2.55, 0.0),
            (12.08, 9.03, math.radians(-60)),
        ),
        start=1,
    ):
        segment = _box(
            f"ORG_ThresholdSegment_{index}",
            (x, -29.28, z),
            (15.95, 1.70, 1.15),
            collection,
            steel,
            root,
            "architecture",
            lod,
            bevel=0.10,
        )
        segment.rotation_euler[1] = rotation_y
        segment["function"] = "segmented laboratory threshold"

    walkway_deck = _box(
        "ORG_CoveredWalkwayDeck",
        (0.0, -36.20, 2.10),
        (11.4, 15.0, 0.46),
        collection,
        technical,
        root,
        "infrastructure",
        lod,
        bevel=0.08,
    )
    walkway_deck["function"] = "covered laboratory approach"
    _box("ORG_CoveredWalkwayRoof", (0.0, -36.20, 8.20), (11.4, 15.0, 0.46), collection, black, root, "architecture", lod, bevel=0.08)
    _box("ORG_CoveredWalkwaySignal", (0.0, -43.55, 2.42), (8.8, 0.10, 0.16), collection, signal, root, "emissive", lod, bevel=0.02)
    for side, x in (("West", -5.18), ("East", 5.18)):
        _box(f"ORG_CoveredWalkwayGlass_{side}", (x, -36.20, 5.15), (0.12, 13.7, 5.35), collection, glass, root, "glass", lod, bevel=0.02)
    if lod == 0:
        for side, x in (("West", -12.3), ("East", 12.3)):
            sensor = add_cylinder(
                f"ORG_ThresholdSensor_{side}",
                (x, -29.35, 5.2),
                0.40,
                1.60,
                collection,
                signal,
                root,
                vertices=8,
                bevel=0.04,
            )
            _tag(sensor, "emissive", lod)


def _research_facade(
    collection: bpy.types.Collection,
    materials: dict[str, bpy.types.Material],
    root: bpy.types.Object,
    lod: int,
) -> None:
    """Vertical smoke-glass panels keep the pavilion technical, never retail-like."""
    glass = materials["smoke_glass"]
    steel = materials["dark_steel"]
    signal = materials["emerald"]
    for index, (x, y, rotation) in enumerate(
        ((-16.9, -8.8, math.radians(-30)), (16.9, -8.8, math.radians(30))),
        start=1,
    ):
        panel = _box(
            f"ORG_FacadeGlass_{index}",
            (x, y, 12.0),
            (10.2, 0.18, 13.1),
            collection,
            glass,
            root,
            "glass",
            lod,
            rotation_z=rotation,
            bevel=0.03,
        )
        panel["function"] = "research observation glass"
        for side, offset in (("L", -4.4), ("R", 4.4)):
            x_offset = math.cos(rotation) * offset
            y_offset = math.sin(rotation) * offset
            frame = _box(
                f"ORG_FacadeFrame_{index}_{side}",
                (x + x_offset, y + y_offset, 12.0),
                (0.32, 0.30, 13.8),
                collection,
                steel,
                root,
                "technical",
                lod,
                rotation_z=rotation,
                bevel=0.04,
            )
            frame["function"] = "sealed glass frame"
        if lod == 0:
            signal_line = _box(
                f"ORG_FacadeSignal_{index}",
                (x, y - 0.12, 17.6),
                (7.5, 0.08, 0.18),
                collection,
                signal,
                root,
                "emissive",
                lod,
                rotation_z=rotation,
                bevel=0.02,
            )
            signal_line["function"] = "chamber status"


def _terrace_instruments(
    collection: bpy.types.Collection,
    materials: dict[str, bpy.types.Material],
    root: bpy.types.Object,
    lod: int,
) -> None:
    """Sparse instruments give the roof a bioengineering purpose without clutter."""
    steel = materials["dark_steel"]
    technical = materials["technical"]
    signal = materials["emerald"]
    for index, (x, y, rotation) in enumerate(((-17.5, 12.0, math.radians(30)), (17.5, 12.0, math.radians(-30))), start=1):
        base = add_prism(
            f"ORG_InstrumentBase_{index}",
            (x, y, 17.8),
            3.10,
            1.50,
            collection,
            steel,
            root,
            vertices=6,
            rotation_z=rotation,
            bevel=0.10,
        )
        _tag(base, "research-instrument", lod)
        housing = add_tapered_prism(
            f"ORG_InstrumentHousing_{index}",
            (x, y, 20.1),
            2.25,
            1.45,
            3.10,
            collection,
            technical,
            root,
            vertices=6,
            rotation_z=rotation,
            bevel=0.10,
        )
        _tag(housing, "research-instrument", lod)
        if lod == 0:
            lens = add_uv_sphere(
                f"ORG_InstrumentLens_{index}",
                (x, y - 1.62, 20.35),
                0.48,
                collection,
                signal,
                root,
                segments=12,
                rings=6,
            )
            _tag(lens, "emissive", lod)


def build_lorigine(
    collection: bpy.types.Collection,
    materials: dict[str, bpy.types.Material],
    lod: int,
) -> bpy.types.Object:
    """Build L'Origine's 30 m precision laboratory pavilion for web delivery."""
    root = add_empty("LOrigineBioengineeringPavilion" if lod == 0 else "LOrigineBioengineeringPavilion_LOD1", collection)
    root["engineering_city_landmark"] = LANDMARK_ID
    root["engineering_city_lod"] = lod
    root["dimensions_meters"] = {"height": LANDMARK_HEIGHT_METERS, "baseRadius": 34.0}
    root["pivot"] = "ground-center"
    root["motion"] = "research core breathes every 10 seconds, 0.65 to 1.00"

    black = materials["black_titanium"]
    steel = materials["dark_steel"]
    technical = materials["technical"]
    glass = materials["smoke_glass"]
    signal = materials["emerald"]
    halo = materials["halo"]

    # Precise nested terraces establish a low, controlled lab campus rather
    # than a tower. Each uses a six-sided plan and visible edge treatment.
    for name, radius, z, height, material in (
        ("ORG_Foundation", 34.0, 0.60, 1.20, black),
        ("ORG_TerraceLower", 30.8, 1.58, 0.76, steel),
        ("ORG_TerraceUpper", 27.0, 2.45, 0.86, technical),
        ("ORG_LaboratoryPlinth", 23.8, 3.56, 1.36, black),
    ):
        terrace = add_prism(name, (0.0, 0.0, z), radius, height, collection, material, root, bevel=0.18)
        _tag(terrace, "architecture", lod)
    lower_signal = add_hex_ring("ORG_TerraceLowerSignal", (0.0, 0.0, 2.02), 29.35, 28.94, 0.14, collection, signal, root, bevel=0.02)
    _tag(lower_signal, "emissive", lod)
    upper_trim = add_hex_ring("ORG_TerraceUpperTrim", (0.0, 0.0, 3.00), 25.66, 25.18, 0.17, collection, steel, root, bevel=0.025)
    _tag(upper_trim, "technical", lod)

    # Main research chamber: heavy lower mass, vertical observation glass and
    # an elevated low vault. The glass is intentionally smoke-dark, never a
    # transparent retail showroom.
    pavilion = add_tapered_prism(
        "ORG_ResearchPavilion",
        (0.0, 1.40, 10.95),
        22.4,
        19.6,
        14.8,
        collection,
        black,
        root,
        vertices=6,
        rotation_z=0.0,
        bevel=0.22,
    )
    _tag(pavilion, "architecture", lod)
    glass_band = add_tapered_prism(
        "ORG_ObservationGlassBand",
        (0.0, 1.40, 12.4),
        18.5,
        16.8,
        9.5,
        collection,
        glass,
        root,
        vertices=6,
        rotation_z=0.0,
        bevel=0.08,
    )
    _tag(glass_band, "glass", lod)
    crown_shoulder = add_tapered_prism(
        "ORG_ResearchVaultShoulder",
        (0.0, 1.40, 20.30),
        17.2,
        12.6,
        5.1,
        collection,
        steel,
        root,
        vertices=6,
        rotation_z=0.0,
        bevel=0.18,
    )
    _tag(crown_shoulder, "architecture", lod)
    crown_glass = add_prism(
        "ORG_ResearchVaultGlass",
        (0.0, 1.40, 22.85),
        9.95,
        3.05,
        collection,
        glass,
        root,
        vertices=6,
        rotation_z=0.0,
        bevel=0.08,
    )
    _tag(crown_glass, "glass", lod)
    cap = add_prism(
        "ORG_ResearchVaultCap",
        (0.0, 1.40, 25.40),
        11.35,
        2.10,
        collection,
        black,
        root,
        vertices=6,
        rotation_z=0.0,
        bevel=0.15,
    )
    _tag(cap, "architecture", lod)
    vault_signal = add_hex_ring("ORG_ResearchVaultSignal", (0.0, 1.40, 24.45), 12.62, 12.12, 0.14, collection, signal, root, rotation_z=0.0, bevel=0.02)
    _tag(vault_signal, "emissive", lod)

    # The central core is an abstract sealed bioengineering chamber. Its form
    # communicates controlled research without literal product imagery.
    core_shadow = add_prism("ORG_CentralCoreHousing", (0.0, 1.40, 16.05), 6.25, 22.4, collection, technical, root, vertices=6, rotation_z=0.0, bevel=0.14)
    _tag(core_shadow, "research-core", lod)
    core = add_prism("ORG_CentralBioCore", (0.0, 1.40, 16.30), 1.42, 22.9, collection, signal, root, vertices=6, rotation_z=0.0, bevel=0.08)
    _tag(core, "emissive", lod)
    core_halo = add_hex_ring("ORG_CentralCoreHalo", (0.0, 1.40, 8.30), 4.65, 4.03, 0.18, collection, halo, root, rotation_z=0.0, bevel=0.025)
    _tag(core_halo, "emissive", lod)

    # The front atrium is a legible smoke-glass volume behind the segmented
    # threshold. It exposes the sealed core as an architectural relationship,
    # rather than leaving the entrance as a detached sculpture.
    atrium_frame = _box(
        "ORG_FrontAtriumFrame",
        (0.0, -19.12, 12.35),
        (23.8, 0.62, 13.9),
        collection,
        steel,
        root,
        "architecture",
        lod,
        bevel=0.14,
    )
    atrium_frame["function"] = "smoke-glass laboratory atrium"
    atrium_glass = _box(
        "ORG_FrontAtriumGlass",
        (0.0, -19.47, 12.35),
        (21.7, 0.12, 12.35),
        collection,
        glass,
        root,
        "glass",
        lod,
        bevel=0.03,
    )
    atrium_glass["function"] = "research observation glass"
    for index, x in enumerate((-7.0, 0.0, 7.0), start=1):
        mullion = _box(
            f"ORG_FrontAtriumMullion_{index}",
            (x, -19.56, 12.35),
            (0.34, 0.14, 12.25),
            collection,
            steel,
            root,
            "technical",
            lod,
            bevel=0.03,
        )
        mullion["function"] = "atrium structural mullion"
    _box("ORG_FrontAtriumSignal", (0.0, -19.58, 17.85), (17.8, 0.09, 0.16), collection, signal, root, "emissive", lod, bevel=0.02)

    _portal(collection, materials, root, lod)
    _research_facade(collection, materials, root, lod)
    _research_capsule("ORG_CapsuleWest", (-13.8, 9.4, 8.0), math.radians(30), collection, materials, root, lod)
    _research_capsule("ORG_CapsuleEast", (13.8, 9.4, 8.0), math.radians(-30), collection, materials, root, lod)
    _research_capsule("ORG_CapsuleRear", (0.0, 17.2, 8.0), math.radians(0), collection, materials, root, lod)
    _terrace_instruments(collection, materials, root, lod)

    # Low side galleries frame the threshold and make the pavilion legible in
    # the city map when the tall portal is not facing the camera.
    for name, x, rotation in (("ORG_WestGallery", -22.5, math.radians(30)), ("ORG_EastGallery", 22.5, math.radians(-30))):
        gallery = _box(name, (x, -1.2, 7.25), (14.0, 16.2, 7.6), collection, technical, root, "architecture", lod, rotation_z=rotation, bevel=0.18)
        gallery["function"] = "precision laboratory gallery"
        gallery_roof = add_tapered_prism(
            f"{name}_Roof",
            (x, -1.2, 11.95),
            7.25,
            5.85,
            2.35,
            collection,
            steel,
            root,
            vertices=6,
            rotation_z=rotation,
            bevel=0.12,
        )
        _tag(gallery_roof, "architecture", lod)
        gallery_glass = _box(f"{name}_SmokeGlass", (x, -6.85, 8.25), (8.25, 0.16, 5.5), collection, glass, root, "glass", lod, rotation_z=rotation, bevel=0.03)
        gallery_glass["function"] = "research observation glass"
        signal_line = _box(f"{name}_Signal", (x, -6.97, 10.88), (6.80, 0.08, 0.16), collection, signal, root, "emissive", lod, rotation_z=rotation, bevel=0.02)
        signal_line["function"] = "lab status"

    if lod == 0:
        # Sparse, protected indicators give scale to the terraces without
        # adding people, branding, or visually noisy particles.
        for index, angle in enumerate((math.radians(205), math.radians(235), math.radians(305), math.radians(335)), start=1):
            x, y, _ = radial_position(25.2, angle, 0.0)
            bollard = add_cylinder(
                f"ORG_TerraceBollard_{index}",
                (x, y, 3.52),
                0.30,
                2.20,
                collection,
                steel,
                root,
                vertices=8,
                bevel=0.05,
            )
            _tag(bollard, "set-dressing", lod)
            indicator = add_cylinder(
                f"ORG_TerraceIndicator_{index}",
                (x, y, 4.68),
                0.19,
                0.20,
                collection,
                halo,
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
    environment_root = add_empty("LOrigineEnvironment", infrastructure)

    ground = add_box("EC_WetAsphalt", (0.0, 0.0, -0.55), (176.0, 176.0, 1.0), infrastructure, materials["asphalt"], environment_root, bevel=0.10)
    _tag(ground, "infrastructure", -1)
    road = add_hex_ring("EC_ResearchServiceRoad", (0.0, 0.0, 0.04), 43.0, 37.4, 0.11, infrastructure, materials["dark_steel"], environment_root, bevel=0.03)
    _tag(road, "infrastructure", -1)
    road_line = add_hex_ring("EC_ResearchServiceRoadLine", (0.0, 0.0, 0.11), 40.8, 40.45, 0.06, infrastructure, materials["emerald"], environment_root, bevel=0.01)
    _tag(road_line, "infrastructure", -1)

    for index, angle in enumerate((math.radians(75), math.radians(105), math.radians(180)), start=1):
        position = radial_position(35.5, angle, 1.15)
        pod = add_prism(
            f"EC_ResearchTechnicalPod_{index}",
            position,
            2.05,
            1.65,
            set_dressing,
            materials["technical"],
            None,
            vertices=6,
            rotation_z=0.0,
            bevel=0.10,
        )
        _tag(pod, "set-dressing", -1)

    mist = add_box("EC_LightMist", (0.0, 0.0, 38.0), (168.0, 168.0, 76.0), atmosphere, create_volume_material(), None)
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

    add_area_light("L_EmeraldKey", (0.0, -42.0, 13.0), (0.0, 0.0, 14.0), srgb_hex("#00D26A"), 36_000, 24.0, lights)
    # Cyan is used only as a cold non-emissive rim light; all actual signals
    # remain the shared emerald materials in the exported model.
    add_area_light("L_ColdRim", (40.0, 34.0, 62.0), (0.0, 0.0, 17.0), srgb_hex("#6AA9B5"), 90_000, 30.0, lights)
    add_area_light("L_ArchitectureFill", (62.0, -78.0, 82.0), (0.0, 0.0, 16.0), srgb_hex("#B8D3CC"), 185_000, 48.0, lights)
    add_area_light("L_FrontFill", (0.0, -55.0, 42.0), (0.0, 0.0, 12.0), srgb_hex("#B8D3CC"), 88_000, 38.0, lights)
    add_area_light("L_OverheadSky", (-14.0, 4.0, 122.0), (0.0, 0.0, 16.0), srgb_hex("#48696B"), 92_000, 78.0, lights)
    add_point_light("L_CoreSignal", (0.0, 1.4, 16.0), srgb_hex("#00D26A"), 5_000, 5.0, lights)
    return created


def animate_emissive_pulse(scene: bpy.types.Scene, material: bpy.types.Material) -> None:
    """Encode L'Origine's ten-second research-core breathing pulse."""
    scene.render.fps = 24
    scene.frame_start = 1
    scene.frame_end = 241
    bsdf = material.node_tree.nodes.get("Principled BSDF")
    socket = bsdf.inputs.get("Emission Strength") if bsdf else None
    if socket is None:
        return
    for frame, value in ((1, 2.08), (121, 3.20), (241, 2.08)):
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
    lorigine_collection = ensure_collection("LOrigineBioengineeringPavilion", landmarks)
    materials = create_master_materials()

    lod0_root = build_lorigine(lorigine_collection, materials, lod=0)
    mist = build_master_environment(root_collection, materials)
    cameras = build_cameras_and_lights(root_collection)
    scene.camera = cameras["district-portrait-v1"]
    animate_emissive_pulse(scene, materials["emerald"])

    bpy.ops.wm.save_as_mainfile(filepath=str(scene_path))

    output: dict[str, object] = {
        "version": 1,
        "asset": LANDMARK_ID,
        "sourceScene": str(scene_path),
        "license": "first-party procedural geometry; public redistribution allowed",
        "pivot": "ground-center",
        "motion": {"type": "research-core-pulse", "durationSeconds": 10, "range": [0.65, 1.00]},
        "renderEngine": args.engine,
        "lods": [],
        "renders": [],
    }

    if not args.render_only:
        lod0 = export_landmark(lod0_root, models_dir, "lorigine.glb")
        if lod0["triangles"] > LOD0_TRIANGLE_BUDGET:
            raise RuntimeError(f"LOD0 uses {lod0['triangles']} triangles; budget is {LOD0_TRIANGLE_BUDGET}")
        lod0["level"] = "lod0"
        output["lods"].append(lod0)

        lod1_collection = ensure_collection("LOrigineBioengineeringPavilion_LOD1_EXPORT_ONLY", landmarks)
        lod1_root = build_lorigine(lod1_collection, materials, lod=1)
        lod1 = export_landmark(lod1_root, models_dir, "lorigine-lod1.glb")
        if lod1["triangles"] > LOD1_TRIANGLE_BUDGET:
            raise RuntimeError(f"LOD1 uses {lod1['triangles']} triangles; budget is {LOD1_TRIANGLE_BUDGET}")
        lod1["level"] = "lod1"
        output["lods"].append(lod1)
        remove_collection(lod1_collection)

    if not args.skip_render:
        output["renders"] = render_presets(scene, cameras, mist, render_dir, args.resolution_scale)

    manifest_path = render_dir / "lorigine-build.json"
    with manifest_path.open("w", encoding="utf-8") as handle:
        json.dump(output, handle, indent=2)
        handle.write("\n")
    print(json.dumps(output, indent=2))
    print(f"L'Origine build complete: {manifest_path}")


if __name__ == "__main__":
    main()
