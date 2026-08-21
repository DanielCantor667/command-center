"""Generate Engineering City's Kliniu Logistics Hub source scene, GLBs and render QA.

Kliniu is the industrial logistics landmark of Engineering City.  It is built
only from procedural Blender geometry and shared master materials, keeping the
editable source and public web assets first-party and redistributable.

Run from the repository root:

    /Applications/Blender.app/Contents/MacOS/Blender --background \
      --python blender/generate_kliniu.py -- --engine BLENDER_EEVEE_NEXT

Use ``--skip-render`` for a fast authoring/export pass.  Use ``--engine
CYCLES --samples 64`` for a final lighting master once the composition is
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


LANDMARK_ID = "kliniu"
LANDMARK_HEIGHT_METERS = 40.0
LOD0_TRIANGLE_BUDGET = 18_000
LOD1_TRIANGLE_BUDGET = 5_000
DEFAULT_SCENE_PATH = "blender/scenes/engineering-city-kliniu-v1.blend"
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
        (90.0, -105.0, 116.0),
        (0.0, 0.0, 14.0),
        0.18,
        0.14,
        1.35,
        (1920, 1080),
    ),
    CameraPreset(
        "district-portrait-v1",
        50,
        (80.0, -96.0, 75.0),
        (0.0, 0.0, 14.0),
        0.14,
        0.10,
        1.30,
        (1600, 900),
    ),
    CameraPreset(
        "architecture-sheet-v1",
        70,
        (0.0, -142.0, 27.0),
        (0.0, 0.0, 17.0),
        0.0,
        0.0,
        1.15,
        (1600, 1200),
        "ORTHO",
        122.0,
    ),
    CameraPreset(
        "detail-material-v1",
        85,
        (39.0, -35.0, 42.0),
        (16.0, 10.0, 31.0),
        0.06,
        0.06,
        1.18,
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


def _local_position(
    origin: tuple[float, float, float],
    local_x: float,
    local_y: float,
    local_z: float,
    rotation_z: float,
) -> tuple[float, float, float]:
    """Transform a local cargo/detail offset while retaining 30°/60° alignment."""
    cosine = math.cos(rotation_z)
    sine = math.sin(rotation_z)
    return (
        origin[0] + local_x * cosine - local_y * sine,
        origin[1] + local_x * sine + local_y * cosine,
        origin[2] + local_z,
    )


def _container(
    name: str,
    location: tuple[float, float, float],
    rotation_z: float,
    material: bpy.types.Material,
    collection: bpy.types.Collection,
    root: bpy.types.Object,
    lod: int,
) -> None:
    """Build a dark, ribbed logistics container; LOD1 keeps its silhouette."""
    body = add_box(name, location, (10.5, 4.2, 3.40), collection, material, root, rotation_z=rotation_z, bevel=0.12)
    _tag(body, "cargo", lod)
    if lod != 0:
        return

    steel = bpy.data.materials["M_EC_DarkSteel"]
    for rib_index, offset_x in enumerate((-4.0, -2.0, 0.0, 2.0, 4.0), start=1):
        rib = add_box(
            f"{name}_Rib_{rib_index}",
            _local_position(location, offset_x, 0.0, 0.0, rotation_z),
            (0.18, 4.30, 3.12),
            collection,
            steel,
            root,
            rotation_z=rotation_z,
            bevel=0.02,
        )
        _tag(rib, "cargo-detail", lod)
    for rail_index, offset_z in enumerate((-1.33, 1.33), start=1):
        rail = add_box(
            f"{name}_Rail_{rail_index}",
            _local_position(location, 0.0, 0.0, offset_z, rotation_z),
            (10.22, 4.30, 0.14),
            collection,
            steel,
            root,
            rotation_z=rotation_z,
            bevel=0.02,
        )
        _tag(rail, "cargo-detail", lod)
    data_node = add_box(
        f"{name}_DataNode",
        _local_position(location, 4.73, 0.0, 0.0, rotation_z),
        (0.10, 0.92, 0.76),
        collection,
        bpy.data.materials["M_EC_EmeraldEnergy"],
        root,
        rotation_z=rotation_z,
        bevel=0.01,
    )
    _tag(data_node, "emissive", lod)


def _dock_bay(
    name: str,
    x: float,
    collection: bpy.types.Collection,
    materials: dict[str, bpy.types.Material],
    root: bpy.types.Object,
    lod: int,
) -> None:
    """A repeatable vertical loading bay makes the warehouse read at web scale."""
    black = materials["black_titanium"]
    steel = materials["dark_steel"]
    glass = materials["smoke_glass"]
    emerald = materials["emerald"]
    front_y = -3.28
    shutter = add_box(f"{name}_Shutter", (x, front_y, 8.4), (8.5, 0.24, 10.8), collection, steel, root, bevel=0.03)
    _tag(shutter, "architecture", lod)
    opening = add_box(f"{name}_DoorInset", (x, front_y - 0.15, 8.4), (7.35, 0.10, 8.85), collection, glass, root, bevel=0.02)
    _tag(opening, "glass", lod)
    for side, offset in (("L", -4.60), ("R", 4.60)):
        frame = add_box(
            f"{name}_Frame_{side}",
            (x + offset, front_y - 0.12, 8.4),
            (0.48, 0.48, 11.9),
            collection,
            black,
            root,
            bevel=0.06,
        )
        _tag(frame, "architecture", lod)
    lintel = add_box(f"{name}_Lintel", (x, front_y - 0.12, 14.35), (9.70, 0.48, 0.50), collection, steel, root, bevel=0.06)
    _tag(lintel, "architecture", lod)
    threshold = add_box(f"{name}_EnergyThreshold", (x, front_y - 0.30, 1.62), (7.55, 0.12, 0.14), collection, emerald, root, bevel=0.02)
    _tag(threshold, "emissive", lod)
    status = add_box(f"{name}_StatusMarker", (x, front_y - 0.30, 13.10), (1.70, 0.10, 0.16), collection, emerald, root, bevel=0.02)
    _tag(status, "emissive", lod)
    approach = add_box(
        f"{name}_LoadingApproach",
        (x, -7.70, 1.56),
        (7.35, 8.45, 0.34),
        collection,
        materials["technical"],
        root,
        bevel=0.04 if lod == 0 else 0.0,
    )
    approach.rotation_euler[0] = math.radians(4)
    _tag(approach, "loading-infrastructure", lod)
    approach_lane = add_box(
        f"{name}_ApproachEnergyLane",
        (x, -7.70, 1.78),
        (0.20, 7.75, 0.08),
        collection,
        emerald,
        root,
        bevel=0.01 if lod == 0 else 0.0,
    )
    approach_lane.rotation_euler[0] = math.radians(4)
    _tag(approach_lane, "emissive", lod)


def _energy_lane(
    name: str,
    location: tuple[float, float, float],
    dimensions: tuple[float, float, float],
    rotation_z: float,
    collection: bpy.types.Collection,
    material: bpy.types.Material,
    root: bpy.types.Object,
    lod: int,
) -> None:
    lane = add_box(name, location, dimensions, collection, material, root, rotation_z=rotation_z, bevel=0.025)
    _tag(lane, "emissive", lod)


def _automated_cargo_pod(
    name: str,
    location: tuple[float, float, float],
    rotation_z: float,
    collection: bpy.types.Collection,
    materials: dict[str, bpy.types.Material],
    root: bpy.types.Object,
    lod: int,
) -> None:
    pod = add_tapered_prism(
        name,
        location,
        2.35,
        1.75,
        1.35,
        collection,
        materials["black_titanium"],
        root,
        vertices=6,
        rotation_z=rotation_z,
        bevel=0.10,
    )
    _tag(pod, "autonomous-cargo", lod)
    energy = add_box(
        f"{name}_EnergyDeck",
        (location[0], location[1], location[2] + 0.72),
        (2.7, 1.55, 0.12),
        collection,
        materials["emerald"],
        root,
        rotation_z=rotation_z,
        bevel=0.02,
    )
    _tag(energy, "emissive", lod)
    pod["motion"] = "autonomous route, clockwise, 1.4 m/s"


def _robotic_loading_arm(
    name: str,
    location: tuple[float, float, float],
    yaw: float,
    collection: bpy.types.Collection,
    materials: dict[str, bpy.types.Material],
    root: bpy.types.Object,
    lod: int,
) -> None:
    """A deliberately low-poly articulated arm for the exposed roof deck."""
    steel = materials["dark_steel"]
    technical = materials["technical"]
    emerald = materials["emerald"]
    base = add_prism(name, location, 2.25, 1.35, collection, steel, root, bevel=0.10)
    _tag(base, "robotics", lod)
    turret = add_cylinder(
        f"{name}_Turret",
        (location[0], location[1], location[2] + 1.15),
        1.35,
        1.15,
        collection,
        technical,
        root,
        vertices=10,
        bevel=0.06,
    )
    _tag(turret, "robotics", lod)
    shoulder = add_uv_sphere(
        f"{name}_Shoulder",
        _local_position(location, 0.0, 0.0, 2.15, yaw),
        1.60,
        collection,
        steel,
        root,
        segments=12 if lod == 0 else 8,
        rings=6 if lod == 0 else 4,
    )
    _tag(shoulder, "robotics", lod)

    upper = add_box(
        f"{name}_UpperArm",
        _local_position(location, 3.2, 0.0, 5.25, yaw),
        (1.8, 2.2, 8.5),
        collection,
        technical,
        root,
        bevel=0.12,
    )
    upper.rotation_euler = (math.radians(-47), 0.0, yaw)
    _tag(upper, "robotics", lod)
    elbow = add_uv_sphere(
        f"{name}_Elbow",
        _local_position(location, 6.25, 0.0, 8.25, yaw),
        1.25,
        collection,
        steel,
        root,
        segments=12 if lod == 0 else 8,
        rings=6 if lod == 0 else 4,
    )
    _tag(elbow, "robotics", lod)
    forearm = add_box(
        f"{name}_Forearm",
        _local_position(location, 9.1, 0.0, 6.3, yaw),
        (1.45, 1.75, 6.8),
        collection,
        steel,
        root,
        bevel=0.10,
    )
    forearm.rotation_euler = (math.radians(42), 0.0, yaw)
    _tag(forearm, "robotics", lod)
    gripper = add_box(
        f"{name}_CargoGripper",
        _local_position(location, 12.3, 0.0, 3.95, yaw),
        (3.9, 2.15, 1.15),
        collection,
        technical,
        root,
        rotation_z=yaw,
        bevel=0.08,
    )
    _tag(gripper, "robotics", lod)
    if lod == 0:
        joint_light = add_cylinder(
            f"{name}_JointEnergy",
            _local_position(location, 6.25, 0.0, 8.25, yaw),
            0.42,
            0.24,
            collection,
            emerald,
            root,
            vertices=8,
            bevel=0.02,
        )
        _tag(joint_light, "emissive", lod)
    base["motion"] = "six-axis loading cycle, 8 seconds"


def _warehouse_facade(
    collection: bpy.types.Collection,
    materials: dict[str, bpy.types.Material],
    root: bpy.types.Object,
    lod: int,
) -> None:
    """Vertical smoked-glass slots and technical plates: no baked signage needed."""
    glass = materials["smoke_glass"]
    steel = materials["dark_steel"]
    emerald = materials["emerald"]
    for side, x in (("L", -31.45), ("R", 31.45)):
        for index, y in enumerate((5.0, 14.0, 23.0), start=1):
            panel = add_box(
                f"KLI_{side}_VerticalGlass_{index}",
                (x, y, 14.0),
                (0.20, 4.2, 13.5),
                collection,
                glass,
                root,
                bevel=0.03,
            )
            _tag(panel, "glass", lod)
            separator = add_box(
                f"KLI_{side}_TechnicalPlate_{index}",
                (x + (-0.16 if side == "L" else 0.16), y, 21.0),
                (0.30, 4.55, 0.38),
                collection,
                steel,
                root,
                bevel=0.03,
            )
            _tag(separator, "technical", lod)

    for index, x in enumerate((-20.0, 0.0, 20.0), start=1):
        spine = add_box(
            f"KLI_RoofEnergySpine_{index}",
            (x, 15.0, 28.9),
            (0.20, 23.0, 0.14),
            collection,
            emerald,
            root,
            bevel=0.02,
        )
        _tag(spine, "emissive", lod)


def _container_yard(
    collection: bpy.types.Collection,
    materials: dict[str, bpy.types.Material],
    root: bpy.types.Object,
    lod: int,
) -> None:
    """A compact reusable cargo yard, dense enough to explain Kliniu's role."""
    steel = materials["dark_steel"]
    technical = materials["technical"]
    black = materials["black_titanium"]
    cargo_positions = (
        ("A1", (-33.0, -28.0, 3.35), math.radians(30), technical),
        ("A2", (-25.2, -23.5, 3.35), math.radians(30), steel),
        ("A3", (-33.0, -28.0, 6.78), math.radians(30), steel),
        ("B1", (33.0, -28.0, 3.35), math.radians(-30), technical),
        ("B2", (25.2, -23.5, 3.35), math.radians(-30), steel),
        ("B3", (33.0, -28.0, 6.78), math.radians(-30), steel),
        ("C1", (-37.0, -4.5, 3.35), math.radians(60), steel),
        ("C2", (-37.0, 4.6, 3.35), math.radians(60), technical),
        ("D1", (37.0, -4.5, 3.35), math.radians(-60), steel),
        ("D2", (37.0, 4.6, 3.35), math.radians(-60), technical),
    )
    for suffix, location, rotation, material in cargo_positions:
        _container(f"KLI_Container_{suffix}", location, rotation, material, collection, root, lod)

    if lod != 0:
        return

    for index, (x, y, rotation) in enumerate(((-14.0, -23.0, math.radians(30)), (0.0, -27.0, 0.0), (14.0, -23.0, math.radians(-30))), start=1):
        rail = add_box(
            f"KLI_AutomationRail_{index}",
            (x, y, 1.82),
            (4.1, 18.0, 0.16),
            collection,
            steel,
            root,
            rotation_z=rotation,
            bevel=0.02,
        )
        _tag(rail, "automation-infrastructure", lod)
        _energy_lane(
            f"KLI_AutomationRailEnergy_{index}",
            (x, y, 1.93),
            (0.20, 15.4, 0.08),
            rotation,
            collection,
            materials["emerald"],
            root,
            lod,
        )

    for index, (x, y, rotation) in enumerate(((-14.0, -27.0, math.radians(30)), (0.0, -20.0, 0.0), (14.0, -27.0, math.radians(-30))), start=1):
        _automated_cargo_pod(
            f"KLI_CargoPod_{index}",
            (x, y, 2.62),
            rotation,
            collection,
            materials,
            root,
            lod,
        )


def build_kliniu(
    collection: bpy.types.Collection,
    materials: dict[str, bpy.types.Material],
    lod: int,
) -> bpy.types.Object:
    """Build Kliniu's industrial dock/warehouse landmark for LOD0 or LOD1."""
    root = add_empty("KliniuLogisticsHub" if lod == 0 else "KliniuLogisticsHub_LOD1", collection)
    root["engineering_city_landmark"] = LANDMARK_ID
    root["engineering_city_lod"] = lod
    root["dimensions_meters"] = {"height": LANDMARK_HEIGHT_METERS, "baseRadius": 49.0}
    root["pivot"] = "ground-center"
    root["motion"] = "energy lanes pulse every 8 seconds; cargo pods move at 1.4 m/s"

    black = materials["black_titanium"]
    steel = materials["dark_steel"]
    technical = materials["technical"]
    glass = materials["smoke_glass"]
    emerald = materials["emerald"]
    halo = materials["halo"]

    # The broad hex platform fixes scale, while the V-shaped dock wings keep
    # the silhouette unmistakably industrial instead of a generic office box.
    for name, radius, z, height, material in (
        ("KLI_Foundation", 49.0, 0.70, 1.40, black),
        ("KLI_LoadingDeck", 45.2, 1.72, 0.78, steel),
        ("KLI_ServicePodium", 41.0, 2.52, 0.72, technical),
    ):
        mass = add_prism(name, (0.0, 0.0, z), radius, height, collection, material, root, bevel=0.20)
        _tag(mass, "architecture", lod)

    perimeter = add_hex_ring("KLI_EnergyPerimeter", (0.0, 0.0, 2.91), 40.1, 39.78, 0.10, collection, emerald, root, bevel=0.02)
    _tag(perimeter, "emissive", lod)

    transfer_hall = add_box("KLI_TransferHall", (0.0, 14.0, 13.2), (63.0, 34.0, 21.2), collection, black, root, bevel=0.42)
    _tag(transfer_hall, "architecture", lod)
    roof = add_tapered_prism("KLI_TransferHallHexRoof", (0.0, 14.0, 26.0), 29.8, 24.8, 6.4, collection, steel, root, bevel=0.24)
    _tag(roof, "architecture", lod)
    roof_glass = add_prism("KLI_RoofSmokeGlass", (0.0, 14.0, 29.25), 17.0, 0.26, collection, glass, root, bevel=0.06)
    _tag(roof_glass, "glass", lod)
    dispatch_base = add_prism("KLI_DispatchHubBase", (0.0, 14.0, 30.05), 15.8, 1.45, collection, technical, root, bevel=0.14)
    _tag(dispatch_base, "automation-core", lod)
    dispatch_top = add_tapered_prism("KLI_DispatchHubTop", (0.0, 14.0, 31.55), 13.3, 10.8, 1.75, collection, steel, root, bevel=0.12)
    _tag(dispatch_top, "automation-core", lod)
    dispatch_ring = add_hex_ring("KLI_DispatchHubEnergyRing", (0.0, 14.0, 32.45), 13.9, 13.38, 0.14, collection, emerald, root, bevel=0.02)
    _tag(dispatch_ring, "emissive", lod)

    for name, location, rotation in (
        # Set behind the primary dock line so the front camera reads actual
        # loading portals and active space rather than two anonymous walls.
        ("KLI_WestReceivingWing", (-25.0, 10.5, 8.8), math.radians(30)),
        ("KLI_EastReceivingWing", (25.0, 10.5, 8.8), math.radians(-30)),
    ):
        wing = add_box(name, location, (22.0, 22.0, 12.8), collection, technical, root, rotation_z=rotation, bevel=0.30)
        _tag(wing, "architecture", lod)
        wing_roof = add_tapered_prism(
            f"{name}_RoofModule",
            (location[0], location[1], 16.0),
            10.4,
            8.1,
            1.8,
            collection,
            steel,
            root,
            rotation_z=rotation,
            bevel=0.16,
        )
        _tag(wing_roof, "architecture", lod)

    # Five vertical docking portals form the front-facing service rhythm.
    for index, x in enumerate((-22.0, -11.0, 0.0, 11.0, 22.0), start=1):
        _dock_bay(f"KLI_DockBay_{index}", x, collection, materials, root, lod)

    # The automated sorter is a machine, not a tower: lift core, bridge and
    # 30° gantry braces join the dock yard to the transfer hall.
    sorter = add_tapered_prism("KLI_AutomatedSorterCore", (0.0, -11.0, 17.5), 7.6, 5.4, 30.0, collection, black, root, bevel=0.22)
    _tag(sorter, "automation-core", lod)
    sorter_glass = add_box("KLI_SorterStatusGlass", (0.0, -17.08, 19.5), (5.5, 0.18, 18.6), collection, glass, root, bevel=0.03)
    _tag(sorter_glass, "glass", lod)
    sorter_lane = add_box("KLI_SorterEnergySpine", (0.0, -17.28, 19.5), (0.24, 0.10, 21.0), collection, emerald, root, bevel=0.02)
    _tag(sorter_lane, "emissive", lod)
    cap = add_prism("KLI_SorterCap", (0.0, -11.0, 32.9), 8.5, 2.6, collection, steel, root, bevel=0.16)
    _tag(cap, "automation-core", lod)
    cap_ring = add_hex_ring("KLI_SorterEnergyCollar", (0.0, -11.0, 34.10), 8.8, 8.28, 0.14, collection, emerald, root, bevel=0.02)
    _tag(cap_ring, "emissive", lod)
    beacon = add_prism("KLI_OperationsBeacon", (0.0, -11.0, 36.55), 1.25, 2.90, collection, halo, root, bevel=0.07)
    _tag(beacon, "emissive", lod)

    bridge = add_box("KLI_ConveyorBridge", (0.0, 4.2, 27.0), (7.7, 25.0, 2.8), collection, steel, root, bevel=0.14)
    _tag(bridge, "automation-core", lod)
    bridge_glass = add_box("KLI_ConveyorBridgeGlass", (0.0, 4.2, 28.40), (5.85, 23.8, 0.18), collection, glass, root, bevel=0.03)
    _tag(bridge_glass, "glass", lod)
    _energy_lane("KLI_ConveyorBridgeEnergy", (0.0, 4.2, 28.60), (1.20, 23.5, 0.10), 0.0, collection, emerald, root, lod)

    # The gantry rides along the western dock edge.  Keeping it off the front
    # axis lets the hero camera show loading portals and cargo, while its long
    # silhouette still communicates heavy automated logistics.
    crane_beam = add_box("KLI_ContainerGantryBeam", (-37.0, 0.0, 31.9), (3.2, 58.0, 2.35), collection, steel, root, bevel=0.16)
    _tag(crane_beam, "automation-core", lod)
    crane_lane = add_box("KLI_ContainerGantryEnergy", (-37.0, 0.0, 33.12), (0.24, 51.5, 0.10), collection, emerald, root, bevel=0.02)
    _tag(crane_lane, "emissive", lod)
    for side, y in (("Front", -25.5), ("Rear", 25.5)):
        support = add_box(f"KLI_GantrySupport_{side}", (-37.0, y, 16.7), (3.0, 2.4, 29.6), collection, black, root, bevel=0.16)
        _tag(support, "automation-core", lod)
        for brace_index, direction in enumerate((-1, 1), start=1):
            brace = add_box(
                f"KLI_GantryBrace_{side}_{brace_index}",
                (-37.0, y + direction * 4.4, 22.1),
                (0.92, 0.68, 18.0),
                collection,
                technical,
                root,
                rotation_z=math.radians(direction * 30),
                bevel=0.06,
            )
            _tag(brace, "technical", lod)

    _warehouse_facade(collection, materials, root, lod)
    _container_yard(collection, materials, root, lod)

    if lod == 0:
        # A small visible staging set on the roof turns the aerial view into an
        # operating logistics hub rather than an anonymous warehouse mass.
        for suffix, location, rotation, material in (
            ("RoofWestA", (-24.0, 24.0, 33.05), math.radians(30), technical),
            ("RoofWestB", (-18.0, 29.0, 33.05), math.radians(30), steel),
            ("RoofEastA", (24.0, 24.0, 33.05), math.radians(-30), technical),
            ("RoofEastB", (18.0, 29.0, 33.05), math.radians(-30), steel),
        ):
            _container(f"KLI_Container_{suffix}", location, rotation, material, collection, root, lod)

        # Two roof-mounted robots expose the automated part of the operation
        # in the aerial render.  They stay deliberately sparse and reusable.
        _robotic_loading_arm(
            "KLI_LoadingRobot_West",
            (-18.5, 15.0, 30.10),
            math.radians(-42),
            collection,
            materials,
            root,
            lod,
        )
        _robotic_loading_arm(
            "KLI_LoadingRobot_East",
            (18.5, 15.0, 30.10),
            math.radians(-138),
            collection,
            materials,
            root,
            lod,
        )
        _robotic_loading_arm(
            "KLI_LoadingRobot_FrontWest",
            (-18.0, 4.0, 30.10),
            math.radians(42),
            collection,
            materials,
            root,
            lod,
        )
        _robotic_loading_arm(
            "KLI_LoadingRobot_FrontEast",
            (18.0, 4.0, 30.10),
            math.radians(138),
            collection,
            materials,
            root,
            lod,
        )

    if lod == 0:
        # Protected indicators sell the operational scale without visual noise.
        for index, (x, y) in enumerate(((-38.0, -13.0), (-38.0, 16.0), (38.0, -13.0), (38.0, 16.0)), start=1):
            bollard = add_cylinder(
                f"KLI_DockBollard_{index}",
                (x, y, 3.70),
                0.38,
                2.2,
                collection,
                steel,
                root,
                vertices=8,
                bevel=0.05,
            )
            _tag(bollard, "set-dressing", lod)
            indicator = add_cylinder(
                f"KLI_DockIndicator_{index}",
                (x, y, 4.86),
                0.24,
                0.18,
                collection,
                halo,
                root,
                vertices=8,
                bevel=0.02,
            )
            _tag(indicator, "emissive", lod)

    # The complete operational envelope stays under 40 m.  No text is baked into the
    # asset; identity remains visual and product naming stays in the web UI.
    return root


def build_master_environment(
    root_collection: bpy.types.Collection,
    materials: dict[str, bpy.types.Material],
) -> bpy.types.Object:
    infrastructure = ensure_collection("INFRASTRUCTURE", root_collection)
    set_dressing = ensure_collection("SET_DRESSING", root_collection)
    atmosphere = ensure_collection("ATMOSPHERE", root_collection)
    environment_root = add_empty("KliniuEnvironment", infrastructure)

    ground = add_box("EC_WetAsphalt", (0.0, 0.0, -0.55), (210.0, 210.0, 1.0), infrastructure, materials["asphalt"], environment_root, bevel=0.10)
    _tag(ground, "infrastructure", -1)
    road = add_hex_ring("EC_LogisticsServiceRoad", (0.0, 0.0, 0.04), 65.0, 57.0, 0.12, infrastructure, materials["dark_steel"], environment_root, bevel=0.03)
    _tag(road, "infrastructure", -1)
    road_line = add_hex_ring("EC_LogisticsRoadEnergyLine", (0.0, 0.0, 0.12), 62.4, 62.02, 0.06, infrastructure, materials["emerald"], environment_root, bevel=0.01)
    _tag(road_line, "infrastructure", -1)

    for index, x in enumerate((-48.0, 48.0), start=1):
        beacon_base = add_prism(
            f"EC_LogisticsBeaconBase_{index}",
            (x, 37.0, 1.40),
            2.0,
            2.4,
            set_dressing,
            materials["technical"],
            None,
            bevel=0.10,
        )
        _tag(beacon_base, "set-dressing", -1)
        canopy = add_uv_sphere(
            f"EC_LogisticsBeacon_{index}",
            (x, 37.0, 3.65),
            1.10,
            set_dressing,
            materials["halo"],
            None,
            segments=12,
            rings=6,
        )
        _tag(canopy, "set-dressing", -1)

    mist = add_box("EC_LightMist", (0.0, 0.0, 44.0), (200.0, 200.0, 88.0), atmosphere, create_volume_material(), None)
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

    # Green is an energy accent, never the scene's key light.  Broad neutral
    # lighting keeps graphite material readable before the emissive systems
    # come alive, matching the Camera and Lighting Bible.
    add_area_light("L_EmeraldDockPractical", (0.0, -42.0, 16.0), (0.0, -4.0, 12.0), srgb_hex("#00D26A"), 8_000, 18.0, lights)
    add_area_light("L_ColdIndustrialRim", (64.0, 42.0, 72.0), (0.0, 0.0, 18.0), srgb_hex("#6AA9B5"), 185_000, 48.0, lights)
    add_area_light("L_WarehouseFill", (-68.0, -36.0, 52.0), (0.0, 0.0, 17.0), srgb_hex("#6B8590"), 185_000, 50.0, lights)
    add_area_light("L_FrontArchitectureFill", (0.0, -112.0, 72.0), (0.0, -4.0, 16.0), srgb_hex("#B8D3CC"), 250_000, 72.0, lights)
    add_area_light("L_OverheadSky", (-10.0, 2.0, 145.0), (0.0, 0.0, 16.0), srgb_hex("#48696B"), 230_000, 105.0, lights)
    add_point_light("L_SorterBounce", (0.0, -11.0, 20.0), srgb_hex("#00D26A"), 9_000, 8.0, lights)
    add_point_light("L_GantryPractical", (0.0, -22.2, 33.4), srgb_hex("#5CFF9D"), 4_000, 5.0, lights)
    return created


def animate_emissive_pulse(scene: bpy.types.Scene, materials: dict[str, bpy.types.Material]) -> None:
    """Encode the shared Motion Bible's 8-second operational breathing pulse."""
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
    kliniu_collection = ensure_collection("Kliniu", landmarks)
    materials = create_master_materials()

    lod0_root = build_kliniu(kliniu_collection, materials, lod=0)
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
        "motion": {"type": "energy-pulse-and-autonomous-cargo", "durationSeconds": 8, "cargoSpeedMetersPerSecond": 1.4},
        "renderEngine": args.engine,
        "lods": [],
        "renders": [],
    }

    if not args.render_only:
        lod0 = export_landmark(lod0_root, models_dir, "kliniu.glb")
        if lod0["triangles"] > LOD0_TRIANGLE_BUDGET:
            raise RuntimeError(f"LOD0 uses {lod0['triangles']} triangles; budget is {LOD0_TRIANGLE_BUDGET}")
        lod0["level"] = "lod0"
        output["lods"].append(lod0)

        lod1_collection = ensure_collection("Kliniu_LOD1_EXPORT_ONLY", landmarks)
        lod1_root = build_kliniu(lod1_collection, materials, lod=1)
        lod1 = export_landmark(lod1_root, models_dir, "kliniu-lod1.glb")
        if lod1["triangles"] > LOD1_TRIANGLE_BUDGET:
            raise RuntimeError(f"LOD1 uses {lod1['triangles']} triangles; budget is {LOD1_TRIANGLE_BUDGET}")
        lod1["level"] = "lod1"
        output["lods"].append(lod1)
        remove_collection(lod1_collection)

    if not args.skip_render:
        output["renders"] = render_presets(scene, cameras, mist, render_dir, args.resolution_scale)

    manifest_path = render_dir / "kliniu-build.json"
    with manifest_path.open("w", encoding="utf-8") as handle:
        json.dump(output, handle, indent=2)
        handle.write("\n")
    print(json.dumps(output, indent=2))
    print(f"Kliniu build complete: {manifest_path}")


if __name__ == "__main__":
    main()
