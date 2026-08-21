"""Build Engineering City's editable aerial master scene and hero render.

The overview is deliberately a render-only assembly scene.  It imports the
six published *LOD0* first-party landmark GLBs, gives them a shared procedural
road / plate system, and produces the approved aerial view.  It never exports
another city GLB and it does not replace any web image.

Run from the repository root:

    /Applications/Blender.app/Contents/MacOS/Blender --background \
      --python blender/generate_engineering_city_overview.py -- \
      --engine BLENDER_EEVEE_NEXT

The default render is intentionally a 35 mm, 2560 x 1440 Camera Bible hero.
Use ``--skip-render`` to recreate only the editable source scene and delivery
metrics.  Use ``--engine CYCLES --samples 64`` for a slower lighting master.
"""

from __future__ import annotations

import argparse
import json
import math
import os
import sys
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Iterable

import bpy
from mathutils import Vector

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
    clear_scene,
    configure_scene,
    create_master_materials,
    create_volume_material,
    ensure_collection,
    link_to_collection,
    mesh_statistics,
    set_bloom_amount,
    srgb_hex,
)


OVERVIEW_ID = "engineering-city-overview"
DEFAULT_SCENE_PATH = "blender/scenes/engineering-city-overview-v1.blend"
DEFAULT_MODELS_DIR = "apps/web/public/models/city"
DEFAULT_RENDER_DIR = "blender/output/engineering-city"
HERO_STEM = "engineering-city-overview-hero-v1"


@dataclass(frozen=True)
class DistrictSpec:
    """One explicit, named placement in the master city composition."""

    id: str
    label: str
    filename: str
    position: tuple[float, float]
    rotation_degrees: float
    plate_radius: float


# Command Center is intentionally at the origin and is framed by the camera
# and the radial infrastructure.  The five secondary districts are separated
# enough for their source silhouettes to read individually at a 35 mm scale.
DISTRICTS = (
    DistrictSpec("command-center", "Command Center", "command-center.glb", (0.0, 0.0), 0.0, 52.0),
    DistrictSpec("kliniu", "Kliniu Logistics Hub", "kliniu.glb", (-150.0, 122.0), 30.0, 89.0),
    DistrictSpec("intranet-ess", "Intranet ESS", "intranet-ess.glb", (150.0, 122.0), -30.0, 89.0),
    DistrictSpec("academy", "4U Studio Academy", "academy.glb", (-155.0, -86.0), 0.0, 52.0),
    DistrictSpec("vevi", "Vevi Media Hub", "vevi.glb", (148.0, -84.0), 0.0, 67.0),
    DistrictSpec("lorigine", "L'Origine Bioengineering Pavilion", "lorigine.glb", (-20.0, -176.0), 0.0, 64.0),
)


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
    shift_x: float = 0.0
    shift_y: float = 0.0


HERO_CAMERA = CameraPreset(
    name="hero-aerial-v1",
    lens_mm=35.0,
    # Ten percent closer than v1, while the lens shift reserves the left side
    # for page copy rather than treating the render as a centred city map.
    location=(-306.0, -392.0, 263.0),
    target=(0.0, 0.0, 20.0),
    fog=0.18,
    bloom=0.12,
    exposure=1.10,
    resolution=(2560, 1440),
    shift_x=-0.075,
    shift_y=-0.040,
)


def cli_arguments() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--scene", default=DEFAULT_SCENE_PATH, help="editable overview .blend output")
    parser.add_argument("--models-dir", default=DEFAULT_MODELS_DIR, help="directory containing the six LOD0 GLBs")
    parser.add_argument("--render-dir", default=DEFAULT_RENDER_DIR, help="PNG, EXR and metrics output directory")
    parser.add_argument("--engine", choices=("BLENDER_EEVEE_NEXT", "CYCLES"), default="BLENDER_EEVEE_NEXT")
    parser.add_argument("--samples", type=int, default=32, help="Cycles samples when --engine CYCLES")
    parser.add_argument("--skip-render", action="store_true", help="write source scene and metrics without rendering")
    parser.add_argument("--render-only", action="store_true", help="kept for pipeline parity; overview never exports GLBs")
    parser.add_argument("--resolution-scale", type=float, default=1.0, help="QA render scale, between 0.25 and 1")
    argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    args = parser.parse_args(argv)
    if not 0.25 <= args.resolution_scale <= 1.0:
        parser.error("--resolution-scale must be between 0.25 and 1")
    if args.render_only and args.skip_render:
        parser.error("--render-only cannot be combined with --skip-render")
    return args


def _tag(obj: bpy.types.Object, role: str) -> bpy.types.Object:
    obj["engineering_city_role"] = role
    obj["engineering_city_overview"] = OVERVIEW_ID
    return obj


def _world_bounds(objects: Iterable[bpy.types.Object]) -> tuple[tuple[float, float, float], tuple[float, float, float]]:
    """Return exact world bounds from mesh vertices, including empty roots."""
    dependencies = bpy.context.evaluated_depsgraph_get()
    points: list[Vector] = []
    for obj in objects:
        if obj.type != "MESH":
            continue
        evaluated = obj.evaluated_get(dependencies)
        mesh = evaluated.to_mesh()
        try:
            points.extend(obj.matrix_world @ vertex.co for vertex in mesh.vertices)
        finally:
            evaluated.to_mesh_clear()
    if not points:
        return ((0.0, 0.0, 0.0), (0.0, 0.0, 0.0))
    minimum = tuple(min(point[index] for point in points) for index in range(3))
    maximum = tuple(max(point[index] for point in points) for index in range(3))
    return minimum, maximum


def _metric(objects: Iterable[bpy.types.Object]) -> dict[str, object]:
    objects = list(objects)
    triangles, minimum, maximum = mesh_statistics(objects)
    return {
        "triangles": triangles,
        "boundsMin": [round(value, 3) for value in minimum],
        "boundsMax": [round(value, 3) for value in maximum],
        "dimensionsMeters": [round(maximum[index] - minimum[index], 3) for index in range(3)],
        "meshObjects": sum(obj.type == "MESH" for obj in objects),
    }


def _add_road_segment(
    name: str,
    start: tuple[float, float],
    end: tuple[float, float],
    width: float,
    z: float,
    height: float,
    collection: bpy.types.Collection,
    material: bpy.types.Material,
    role: str,
) -> bpy.types.Object:
    """Place a local-Y road box exactly between two planar points."""
    dx = end[0] - start[0]
    dy = end[1] - start[1]
    length = math.hypot(dx, dy)
    if length <= 0.0:
        raise ValueError(f"road {name} has no length")
    # Blender's box starts along local Y, thus the quarter turn.
    rotation = math.atan2(dy, dx) - math.pi / 2
    road = add_box(
        name,
        ((start[0] + end[0]) / 2, (start[1] + end[1]) / 2, z),
        (width, length, height),
        collection,
        material,
        rotation_z=rotation,
        bevel=min(0.22, height / 2),
    )
    return _tag(road, role)


def _inset_route(start: tuple[float, float], end: tuple[float, float], start_radius: float, end_radius: float) -> tuple[tuple[float, float], tuple[float, float]]:
    """Keep a service route visible in the gap between two district plates."""
    direction = Vector((end[0] - start[0], end[1] - start[1]))
    distance = direction.length
    if distance <= start_radius + end_radius:
        raise ValueError("district plate layout leaves no road clearance")
    unit = direction.normalized()
    left = Vector(start) + unit * start_radius
    right = Vector(end) - unit * end_radius
    return (tuple(left), tuple(right))


def _build_district_plate(
    spec: DistrictSpec,
    collection: bpy.types.Collection,
    materials: dict[str, bpy.types.Material],
) -> None:
    """Create a compact, reusable hex district plate under one source GLB."""
    x, y = spec.position
    radius = spec.plate_radius
    subplate = add_prism(
        f"EC_{spec.id}_Foundation",
        (x, y, -0.60),
        radius + 7.0,
        1.25,
        collection,
        materials["dark_steel"],
        vertices=6,
        bevel=0.22,
    )
    _tag(subplate, "district-foundation")
    plate = add_prism(
        f"EC_{spec.id}_Plate",
        (x, y, 0.02),
        radius + 2.0,
        0.32,
        collection,
        materials["black_titanium"],
        vertices=6,
        bevel=0.08,
    )
    _tag(plate, "district-plate")
    trim = add_hex_ring(
        f"EC_{spec.id}_PlateTrim",
        (x, y, 0.24),
        radius + 0.95,
        radius + 0.38,
        0.13,
        collection,
        materials["emerald"],
        bevel=0.025,
    )
    _tag(trim, "district-energy-trim")


def _build_infrastructure(
    collection: bpy.types.Collection,
    materials: dict[str, bpy.types.Material],
) -> list[bpy.types.Object]:
    """Generate first-party roads, plates and quiet technical set dressing."""
    created: list[bpy.types.Object] = []
    ground = add_box(
        "EC_OverviewWetAsphalt",
        (0.0, 0.0, -2.2),
        (760.0, 760.0, 2.0),
        collection,
        materials["asphalt"],
        bevel=0.30,
    )
    created.append(_tag(ground, "ground"))
    city_plinth = add_prism(
        "EC_OverviewCityPlinth",
        (0.0, 0.0, -1.15),
        292.0,
        1.15,
        collection,
        materials["dark_steel"],
        vertices=6,
        bevel=0.30,
    )
    created.append(_tag(city_plinth, "city-plinth"))
    city_surface = add_prism(
        "EC_OverviewCitySurface",
        (0.0, 0.0, -0.48),
        284.0,
        0.25,
        collection,
        materials["black_titanium"],
        vertices=6,
        bevel=0.10,
    )
    created.append(_tag(city_surface, "city-surface"))

    perimeter = add_hex_ring(
        "EC_OverviewPerimeterRoad",
        (0.0, 0.0, -0.18),
        275.0,
        266.0,
        0.26,
        collection,
        materials["dark_steel"],
        bevel=0.06,
    )
    created.append(_tag(perimeter, "perimeter-road"))
    perimeter_signal = add_hex_ring(
        "EC_OverviewPerimeterSignal",
        (0.0, 0.0, 0.03),
        271.0,
        270.35,
        0.08,
        collection,
        materials["halo"],
        bevel=0.01,
    )
    created.append(_tag(perimeter_signal, "perimeter-signal"))

    command = DISTRICTS[0]
    for spec in DISTRICTS:
        _build_district_plate(spec, collection, materials)
    # Six clear roads make the Command Center's role unambiguous.  Each road
    # stops at plate boundaries, creating a readable dark gap around every
    # landmark instead of burying its silhouette in a single giant platform.
    for index, spec in enumerate(DISTRICTS[1:], start=1):
        start, end = _inset_route(command.position, spec.position, command.plate_radius + 2.5, spec.plate_radius + 4.0)
        road = _add_road_segment(
            f"EC_ServiceRoute_{index}",
            start,
            end,
            13.0 if spec.id in {"kliniu", "intranet-ess"} else 10.0,
            -0.03,
            0.22,
            collection,
            materials["dark_steel"],
            "service-road",
        )
        created.append(road)
        guide = _add_road_segment(
            f"EC_ServiceGuide_{index}",
            start,
            end,
            0.42,
            0.13,
            0.09,
            collection,
            materials["emerald"],
            "service-guide",
        )
        created.append(guide)

        # Dashes give the road a direction without adding logos or text.
        direction = Vector((end[0] - start[0], end[1] - start[1]))
        unit = direction.normalized()
        gap = 15.0
        for dash_index in range(1, int(direction.length / gap)):
            center = Vector(start) + unit * dash_index * gap
            cross = Vector((-unit.y, unit.x))
            for side in (-1.0, 1.0):
                point = center + cross * side * 2.9
                cap = add_cylinder(
                    f"EC_RouteNode_{index}_{dash_index}_{int(side)}",
                    (point.x, point.y, 0.42),
                    0.22,
                    0.23,
                    collection,
                    materials["halo"],
                    vertices=8,
                    bevel=0.03,
                )
                created.append(_tag(cap, "route-node"))

    central_ring = add_hex_ring(
        "EC_CommandCenterTransitRing",
        (0.0, 0.0, 0.18),
        64.0,
        59.0,
        0.17,
        collection,
        materials["dark_steel"],
        bevel=0.04,
    )
    created.append(_tag(central_ring, "central-transit-ring"))
    central_signal = add_hex_ring(
        "EC_CommandCenterSignalRing",
        (0.0, 0.0, 0.32),
        62.7,
        62.05,
        0.075,
        collection,
        materials["emerald"],
        bevel=0.01,
    )
    created.append(_tag(central_signal, "central-signal"))

    # Peripheral nodes remain below the landmarks.  They add city scale and
    # repeat the six-sided language without becoming extra named buildings.
    for index in range(12):
        angle = math.tau * index / 12 + math.radians(15)
        radius = 238.0 if index % 2 == 0 else 252.0
        x = radius * math.cos(angle)
        y = radius * math.sin(angle)
        node = add_prism(
            f"EC_PerimeterUtility_{index + 1}",
            (x, y, 0.75),
            3.3,
            1.65,
            collection,
            materials["technical"],
            vertices=6,
            bevel=0.10,
        )
        created.append(_tag(node, "perimeter-utility"))
        signal = add_cylinder(
            f"EC_PerimeterUtilitySignal_{index + 1}",
            (x, y, 1.74),
            0.33,
            0.14,
            collection,
            materials["halo"],
            vertices=8,
            bevel=0.02,
        )
        created.append(_tag(signal, "perimeter-utility-signal"))

    return created


def _import_landmark(
    spec: DistrictSpec,
    models_dir: Path,
    landmarks_collection: bpy.types.Collection,
) -> tuple[list[bpy.types.Object], dict[str, object]]:
    """Import exactly one verified LOD0 GLB and attach a positioned anchor."""
    path = models_dir / spec.filename
    if "-lod" in path.stem or not path.name.endswith(".glb"):
        raise ValueError(f"overview accepts an explicit LOD0 GLB, received {path.name}")
    if not path.is_file():
        raise FileNotFoundError(f"missing required LOD0 landmark: {path}")

    before = set(bpy.data.objects)
    bpy.ops.object.select_all(action="DESELECT")
    bpy.ops.import_scene.gltf(filepath=str(path))
    imported = [obj for obj in bpy.data.objects if obj not in before]
    if not imported:
        raise RuntimeError(f"Blender did not import any objects from {path}")
    roots = [obj for obj in imported if obj.parent not in imported]
    if not roots:
        raise RuntimeError(f"no import roots found for {path}")
    imported_collection = ensure_collection(spec.label, landmarks_collection)
    for obj in imported:
        link_to_collection(obj, imported_collection)
        obj["source_glb"] = str(path)
        obj["source_lod"] = "lod0"
        obj["city_district"] = spec.id
    anchor = add_empty(f"EC_{spec.id}_Anchor", imported_collection)
    anchor["city_district"] = spec.id
    anchor["source_glb"] = str(path)
    anchor["source_lod"] = "lod0"
    for root in roots:
        root.parent = anchor

    # Every landmark source has a ground-center pivot.  Calculate its exact
    # imported bounds once so small exporter differences cannot float a model
    # above the shared district plate.
    minimum, maximum = _world_bounds(imported)
    anchor.location = (spec.position[0], spec.position[1], -minimum[2] + 0.22)
    anchor.rotation_euler[2] = math.radians(spec.rotation_degrees)
    metric = _metric(imported)
    metric.update(
        {
            "id": spec.id,
            "label": spec.label,
            "sourceGlb": str(path),
            "sourceLod": "lod0",
            "placement": {
                "positionMeters": [spec.position[0], spec.position[1], round(anchor.location.z, 3)],
                "rotationDegrees": spec.rotation_degrees,
                "plateRadiusMeters": spec.plate_radius,
            },
        }
    )
    return imported + [anchor], metric


def _build_atmosphere(
    collection: bpy.types.Collection,
) -> bpy.types.Object:
    mist = add_box(
        "EC_OverviewNightMist",
        (0.0, 0.0, 92.0),
        (680.0, 680.0, 188.0),
        collection,
        create_volume_material("M_EC_OverviewNightMist"),
    )
    mist.display_type = "WIRE"
    volume = mist.active_material.node_tree.nodes.get("Principled Volume")
    if volume is not None:
        # A 680 m overview volume needs far lower density than the close-up
        # landmark sets; otherwise it erases the dark-steel silhouettes before
        # the 35 mm camera reaches the city.
        volume.inputs["Density"].default_value = 0.000001
        volume.inputs["Anisotropy"].default_value = 0.20
    return _tag(mist, "atmosphere")


def _set_bsdf_input(material: bpy.types.Material, name: str, value: object) -> None:
    if not material.use_nodes or material.node_tree is None:
        return
    bsdf = material.node_tree.nodes.get("Principled BSDF")
    if bsdf is None or name not in bsdf.inputs:
        return
    bsdf.inputs[name].default_value = value


def _grade_imported_materials_for_overview() -> None:
    """Lift near-black delivery materials only for the long aerial camera.

    The public GLBs intentionally use physically very dark graphite.  That is
    right for WebGL and close architecture shots, but at a 700 m camera
    distance it reads as an empty silhouette.  This render-scene grade stays
    inside the same graphite / dark-steel / smoke-glass language and does not
    touch any public delivery file.
    """
    grades = (
        ("M_EC_BlackTitanium", "#101214", 0.42, 0.38),
        ("M_EC_DarkSteel", "#1D2220", 0.48, 0.42),
        ("M_EC_TechnicalPanel", "#303632", 0.40, 0.40),
        ("M_EC_SmokeGlass", "#0D1210", 0.12, 0.20),
        ("M_EC_WetAsphalt", "#0A0C0B", 0.24, 0.34),
    )
    for material in bpy.data.materials:
        for prefix, colour, metallic, roughness in grades:
            if material.name.startswith(prefix):
                _set_bsdf_input(material, "Base Color", srgb_hex(colour))
                _set_bsdf_input(material, "Metallic", metallic)
                _set_bsdf_input(material, "Roughness", roughness)
                material.diffuse_color = srgb_hex(colour)
                break


def _build_camera_and_lights(
    root_collection: bpy.types.Collection,
) -> bpy.types.Object:
    cameras = ensure_collection("CAMERAS", root_collection)
    lights = ensure_collection("LIGHTS", root_collection)
    camera = add_camera(
        HERO_CAMERA.name,
        HERO_CAMERA.location,
        HERO_CAMERA.target,
        HERO_CAMERA.lens_mm,
        cameras,
    )
    camera["camera_bible"] = HERO_CAMERA.name
    camera["lens_mm"] = HERO_CAMERA.lens_mm
    camera["fog"] = HERO_CAMERA.fog
    camera["bloom"] = HERO_CAMERA.bloom
    camera["exposure"] = HERO_CAMERA.exposure
    camera.data.shift_x = HERO_CAMERA.shift_x
    camera.data.shift_y = HERO_CAMERA.shift_y

    # The v2 camera treats emerald as a signal, never as flood light.  Soft
    # neutral fill reveals graphite and glass as material, so district plates
    # remain architectural surfaces instead of reading as a green game board.
    add_area_light("L_OverviewEmeraldKey", (-80.0, -240.0, 165.0), (0.0, -5.0, 18.0), srgb_hex("#00D26A"), 58_000, 100.0, lights)
    add_area_light("L_OverviewNeutralRim", (235.0, 165.0, 260.0), (0.0, 20.0, 22.0), srgb_hex("#AEB8B0"), 720_000, 190.0, lights)
    add_area_light("L_OverviewNeutralFill", (-110.0, -72.0, 390.0), (0.0, 0.0, 8.0), srgb_hex("#D3DDD5"), 1_200_000, 330.0, lights)
    for spec in DISTRICTS:
        energy = 3_500 if spec.id == "command-center" else 900
        add_point_light(
            f"L_{spec.id}_DistrictSignal",
            (spec.position[0], spec.position[1], 22.0),
            srgb_hex("#00D26A"),
            energy,
            12.0,
            lights,
        )
    # A soft, green-tinted directional wash keeps the far façades legible.
    # It is not an additional material or asset, merely the night key light
    # required by this much wider camera distance.
    sun_data = bpy.data.lights.new("L_OverviewNightWash", "SUN")
    sun_data.color = srgb_hex("#D9E1DB")[:3]
    sun_data.energy = 0.85
    sun = bpy.data.objects.new("L_OverviewNightWash", sun_data)
    lights.objects.link(sun)
    sun.rotation_euler = (math.radians(24.0), math.radians(-18.0), math.radians(-28.0))
    return camera


def _render_hero(
    scene: bpy.types.Scene,
    camera: bpy.types.Object,
    render_dir: Path,
    resolution_scale: float,
) -> dict[str, str]:
    render_dir.mkdir(parents=True, exist_ok=True)
    scene.camera = camera
    scene.view_settings.exposure = HERO_CAMERA.exposure
    set_bloom_amount(scene, HERO_CAMERA.bloom)
    scene.render.resolution_x = round(HERO_CAMERA.resolution[0] * resolution_scale)
    scene.render.resolution_y = round(HERO_CAMERA.resolution[1] * resolution_scale)
    exr_path = render_dir / f"{HERO_STEM}.exr"
    png_path = render_dir / f"{HERO_STEM}.png"
    scene.render.image_settings.file_format = "OPEN_EXR"
    scene.render.image_settings.color_depth = "16"
    scene.render.filepath = str(exr_path)
    bpy.ops.render.render(write_still=True)
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_depth = "16"
    bpy.data.images["Render Result"].save_render(filepath=str(png_path), scene=scene)
    return {"camera": HERO_CAMERA.name, "png": str(png_path), "exr": str(exr_path)}


def main() -> None:
    args = cli_arguments()
    scene_path = Path(args.scene)
    models_dir = Path(args.models_dir)
    render_dir = Path(args.render_dir)
    scene_path.parent.mkdir(parents=True, exist_ok=True)
    render_dir.mkdir(parents=True, exist_ok=True)

    clear_scene()
    scene = bpy.context.scene
    configure_scene(scene, args.engine, args.samples)
    scene.render.fps = 24
    scene.frame_start = 1
    scene.frame_end = 193
    scene["engineering_city_overview_policy"] = "six first-party LOD0 GLBs; no third-party assets"
    scene["engineering_city_palette"] = "#050505 #101214 #00D26A #5CFF9D"

    root_collection = ensure_collection("ENGINEERING_CITY_OVERVIEW")
    landmarks_collection = ensure_collection("LANDMARKS_LOD0", root_collection)
    infrastructure_collection = ensure_collection("INFRASTRUCTURE", root_collection)
    atmosphere_collection = ensure_collection("ATMOSPHERE", root_collection)
    materials = create_master_materials()
    infrastructure = _build_infrastructure(infrastructure_collection, materials)
    imported_objects: list[bpy.types.Object] = []
    landmark_metrics: list[dict[str, object]] = []
    for spec in DISTRICTS:
        imported, metric = _import_landmark(spec, models_dir, landmarks_collection)
        imported_objects.extend(imported)
        landmark_metrics.append(metric)
    _grade_imported_materials_for_overview()
    mist = _build_atmosphere(atmosphere_collection)
    camera = _build_camera_and_lights(root_collection)
    scene.camera = camera

    geometry_for_metrics = infrastructure + [obj for obj in imported_objects if obj.type == "MESH"]
    output: dict[str, object] = {
        "version": 1,
        "asset": OVERVIEW_ID,
        "sourceScene": str(scene_path),
        "renderEngine": args.engine,
        "license": "first-party procedural infrastructure plus first-party Engineering City LOD0 GLBs; public redistribution allowed",
        "assetPolicy": {"thirdPartyAssets": 0, "importedLod": "lod0", "landmarkCount": len(DISTRICTS)},
        "camera": asdict(HERO_CAMERA),
        "districts": landmark_metrics,
        "sceneMetrics": _metric(geometry_for_metrics),
        "renders": [],
    }
    output["sceneMetrics"]["atmosphereObject"] = mist.name
    output["sceneMetrics"]["infrastructureMeshObjects"] = sum(obj.type == "MESH" for obj in infrastructure)
    scene["engineering_city_overview_metrics"] = json.dumps(output, sort_keys=True)
    bpy.ops.wm.save_as_mainfile(filepath=str(scene_path))

    if not args.skip_render:
        output["renders"] = [_render_hero(scene, camera, render_dir, args.resolution_scale)]
        scene["engineering_city_overview_metrics"] = json.dumps(output, sort_keys=True)
        bpy.ops.wm.save_as_mainfile(filepath=str(scene_path))

    metrics_path = render_dir / "engineering-city-overview-build.json"
    with metrics_path.open("w", encoding="utf-8") as handle:
        json.dump(output, handle, indent=2)
        handle.write("\n")
    print(json.dumps(output, indent=2))
    print(f"Engineering City overview complete: {metrics_path}")


if __name__ == "__main__":
    main()
