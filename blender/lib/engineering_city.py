"""Shared Blender helpers for Engineering City authoring scripts.

The functions in this module deliberately use only Blender primitives and
procedural materials.  That keeps the resulting web assets first-party,
portable, and free from an external-asset licence dependency.
"""

from __future__ import annotations

import math
from typing import Iterable, Sequence

import bpy
from mathutils import Vector


def srgb_hex(value: str) -> tuple[float, float, float, float]:
    """Return a Blender-linear RGBA value from a #RRGGBB colour."""
    value = value.lstrip("#")
    if len(value) != 6:
        raise ValueError(f"expected #RRGGBB colour, got {value!r}")

    def linear(channel: int) -> float:
        number = channel / 255.0
        return number / 12.92 if number <= 0.04045 else ((number + 0.055) / 1.055) ** 2.4

    return (linear(int(value[0:2], 16)), linear(int(value[2:4], 16)), linear(int(value[4:6], 16)), 1.0)


def _input(node, name: str):
    return node.inputs.get(name) if node else None


def _set_input(node, name: str, value) -> None:
    socket = _input(node, name)
    if socket is not None:
        socket.default_value = value


def clear_scene() -> None:
    """Clear objects and collections from a disposable, headless scene."""
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for collection in list(bpy.data.collections):
        bpy.data.collections.remove(collection)


def ensure_collection(name: str, parent: bpy.types.Collection | None = None) -> bpy.types.Collection:
    collection = bpy.data.collections.get(name)
    if collection is None:
        collection = bpy.data.collections.new(name)

    owner = parent.children if parent else bpy.context.scene.collection.children
    if collection.name not in owner:
        owner.link(collection)
    return collection


def link_to_collection(obj: bpy.types.Object, collection: bpy.types.Collection) -> bpy.types.Object:
    for current in list(obj.users_collection):
        current.objects.unlink(obj)
    collection.objects.link(obj)
    return obj


def attach_to_root(obj: bpy.types.Object, root: bpy.types.Object | None) -> bpy.types.Object:
    if root is not None:
        obj.parent = root
    return obj


def add_empty(name: str, collection: bpy.types.Collection) -> bpy.types.Object:
    obj = bpy.data.objects.new(name, None)
    collection.objects.link(obj)
    return obj


def apply_bevel(obj: bpy.types.Object, width: float, segments: int = 1) -> None:
    if width <= 0 or obj.type != "MESH":
        return
    modifier = obj.modifiers.new("EC edge bevel", "BEVEL")
    modifier.width = width
    modifier.segments = segments
    modifier.limit_method = "ANGLE"
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.modifier_apply(modifier=modifier.name)
    obj.select_set(False)


def _finish_mesh(
    obj: bpy.types.Object,
    name: str,
    collection: bpy.types.Collection,
    material: bpy.types.Material | None,
    root: bpy.types.Object | None,
    bevel: float = 0.0,
    smooth: bool = False,
) -> bpy.types.Object:
    obj.name = name
    link_to_collection(obj, collection)
    if material:
        obj.data.materials.append(material)
    if bevel:
        apply_bevel(obj, bevel)
    if smooth and obj.type == "MESH":
        for polygon in obj.data.polygons:
            polygon.use_smooth = True
    attach_to_root(obj, root)
    return obj


def add_box(
    name: str,
    location: Sequence[float],
    dimensions: Sequence[float],
    collection: bpy.types.Collection,
    material: bpy.types.Material | None,
    root: bpy.types.Object | None = None,
    rotation_z: float = 0.0,
    bevel: float = 0.0,
) -> bpy.types.Object:
    # Set local dimensions before rotating.  ``Object.dimensions`` represents
    # a world-axis-aligned bounding box, so doing this after a 30°/60° rotation
    # silently distorts radial modules and inflates their web-space bounds.
    bpy.ops.mesh.primitive_cube_add(location=location)
    obj = bpy.context.active_object
    obj.dimensions = dimensions
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    obj.rotation_euler[2] = rotation_z
    return _finish_mesh(obj, name, collection, material, root, bevel)


def add_prism(
    name: str,
    location: Sequence[float],
    radius: float,
    height: float,
    collection: bpy.types.Collection,
    material: bpy.types.Material | None,
    root: bpy.types.Object | None = None,
    vertices: int = 6,
    rotation_z: float = math.radians(30),
    bevel: float = 0.0,
) -> bpy.types.Object:
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=vertices,
        radius=radius,
        depth=height,
        end_fill_type="NGON",
        location=location,
        rotation=(0.0, 0.0, rotation_z),
    )
    return _finish_mesh(bpy.context.active_object, name, collection, material, root, bevel)


def add_tapered_prism(
    name: str,
    location: Sequence[float],
    bottom_radius: float,
    top_radius: float,
    height: float,
    collection: bpy.types.Collection,
    material: bpy.types.Material | None,
    root: bpy.types.Object | None = None,
    vertices: int = 6,
    rotation_z: float = math.radians(30),
    bevel: float = 0.0,
) -> bpy.types.Object:
    bpy.ops.mesh.primitive_cone_add(
        vertices=vertices,
        radius1=bottom_radius,
        radius2=top_radius,
        depth=height,
        location=location,
        rotation=(0.0, 0.0, rotation_z),
    )
    return _finish_mesh(bpy.context.active_object, name, collection, material, root, bevel)


def add_hex_ring(
    name: str,
    location: Sequence[float],
    outer_radius: float,
    inner_radius: float,
    height: float,
    collection: bpy.types.Collection,
    material: bpy.types.Material | None,
    root: bpy.types.Object | None = None,
    rotation_z: float = math.radians(30),
    bevel: float = 0.0,
) -> bpy.types.Object:
    """Create a closed, extruded hexagonal ring without a Boolean modifier."""
    if inner_radius >= outer_radius:
        raise ValueError("inner_radius must be smaller than outer_radius")

    vertices = []
    for z in (-height / 2, height / 2):
        for radius in (outer_radius, inner_radius):
            for index in range(6):
                angle = rotation_z + index * math.tau / 6
                vertices.append((radius * math.cos(angle), radius * math.sin(angle), z))

    faces = []
    # Vertex layout: lower outer [0..5], lower inner [6..11], upper outer
    # [12..17], upper inner [18..23].
    for index in range(6):
        next_index = (index + 1) % 6
        faces.extend(
            [
                (index, next_index, 12 + next_index, 12 + index),
                (6 + next_index, 6 + index, 18 + index, 18 + next_index),
                (12 + index, 12 + next_index, 18 + next_index, 18 + index),
                (next_index, index, 6 + index, 6 + next_index),
            ]
        )

    mesh = bpy.data.meshes.new(f"{name}Mesh")
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    obj.location = location
    collection.objects.link(obj)
    if material:
        mesh.materials.append(material)
    if bevel:
        apply_bevel(obj, bevel)
    attach_to_root(obj, root)
    return obj


def add_cylinder(
    name: str,
    location: Sequence[float],
    radius: float,
    height: float,
    collection: bpy.types.Collection,
    material: bpy.types.Material | None,
    root: bpy.types.Object | None = None,
    vertices: int = 12,
    bevel: float = 0.0,
) -> bpy.types.Object:
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=height, location=location)
    return _finish_mesh(bpy.context.active_object, name, collection, material, root, bevel, smooth=True)


def add_uv_sphere(
    name: str,
    location: Sequence[float],
    radius: float,
    collection: bpy.types.Collection,
    material: bpy.types.Material | None,
    root: bpy.types.Object | None = None,
    segments: int = 16,
    rings: int = 8,
) -> bpy.types.Object:
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments, ring_count=rings, radius=radius, location=location)
    return _finish_mesh(bpy.context.active_object, name, collection, material, root, smooth=True)


def radial_position(radius: float, angle: float, z: float) -> tuple[float, float, float]:
    return (radius * math.cos(angle), radius * math.sin(angle), z)


def aim_at(obj: bpy.types.Object, target: Sequence[float]) -> None:
    obj.rotation_euler = (Vector(target) - obj.location).to_track_quat("-Z", "Y").to_euler()


def add_camera(
    name: str,
    location: Sequence[float],
    target: Sequence[float],
    lens: float,
    collection: bpy.types.Collection,
    camera_type: str = "PERSP",
    ortho_scale: float = 100.0,
) -> bpy.types.Object:
    data = bpy.data.cameras.new(name)
    data.type = camera_type
    data.lens = lens
    data.sensor_width = 36
    if camera_type == "ORTHO":
        data.ortho_scale = ortho_scale
    obj = bpy.data.objects.new(name, data)
    collection.objects.link(obj)
    obj.location = location
    aim_at(obj, target)
    return obj


def add_area_light(
    name: str,
    location: Sequence[float],
    target: Sequence[float],
    colour: Sequence[float],
    energy: float,
    size: float,
    collection: bpy.types.Collection,
) -> bpy.types.Object:
    data = bpy.data.lights.new(name, "AREA")
    data.energy = energy
    data.color = colour[:3]
    data.shape = "DISK"
    data.size = size
    obj = bpy.data.objects.new(name, data)
    collection.objects.link(obj)
    obj.location = location
    aim_at(obj, target)
    return obj


def add_point_light(
    name: str,
    location: Sequence[float],
    colour: Sequence[float],
    energy: float,
    radius: float,
    collection: bpy.types.Collection,
) -> bpy.types.Object:
    data = bpy.data.lights.new(name, "POINT")
    data.energy = energy
    data.color = colour[:3]
    data.shadow_soft_size = radius
    obj = bpy.data.objects.new(name, data)
    collection.objects.link(obj)
    obj.location = location
    return obj


def create_master_materials() -> dict[str, bpy.types.Material]:
    """Build the small material palette used by every Engineering City asset."""
    materials: dict[str, bpy.types.Material] = {}

    def principled_material(
        name: str,
        colour: str,
        metallic: float,
        roughness: float,
        night_lift: float = 1.0,
    ) -> bpy.types.Material:
        material = bpy.data.materials.get(name) or bpy.data.materials.new(name)
        material.use_nodes = True
        nodes = material.node_tree.nodes
        bsdf = nodes.get("Principled BSDF")
        base = srgb_hex(colour)
        lifted = tuple(min(channel * night_lift, 1.0) for channel in base[:3]) + (1.0,)
        _set_input(bsdf, "Base Color", lifted)
        _set_input(bsdf, "Metallic", metallic)
        _set_input(bsdf, "Roughness", roughness)
        material.diffuse_color = lifted
        return material

    # Real metals at 70–85% metallic turn featureless black in an HDRI-free
    # night set.  These values retain metal response but leave enough diffuse
    # read for silhouettes in the master scene and in a WebGL viewer.
    black_titanium = principled_material("M_EC_BlackTitanium", "#050807", 0.48, 0.34)
    dark_steel = principled_material("M_EC_DarkSteel", "#101614", 0.52, 0.43)
    technical = principled_material("M_EC_TechnicalPanel", "#29312F", 0.42, 0.38)
    asphalt = principled_material("M_EC_WetAsphalt", "#090D0D", 0.28, 0.26)
    materials.update(
        black_titanium=black_titanium,
        dark_steel=dark_steel,
        technical=technical,
        asphalt=asphalt,
    )

    for material, scale in ((black_titanium, 4.0), (dark_steel, 5.5), (asphalt, 8.0)):
        nodes = material.node_tree.nodes
        links = material.node_tree.links
        bsdf = nodes.get("Principled BSDF")
        noise = nodes.get("EC MicroNoise") or nodes.new("ShaderNodeTexNoise")
        noise.name = "EC MicroNoise"
        noise.inputs["Scale"].default_value = scale
        noise.inputs["Detail"].default_value = 3.0
        bump = nodes.get("EC MicroBump") or nodes.new("ShaderNodeBump")
        bump.name = "EC MicroBump"
        bump.inputs["Strength"].default_value = 0.12
        bump.inputs["Distance"].default_value = 0.08
        if not bump.inputs["Height"].is_linked:
            links.new(noise.outputs["Fac"], bump.inputs["Height"])
        if not _input(bsdf, "Normal").is_linked:
            links.new(bump.outputs["Normal"], _input(bsdf, "Normal"))

    glass = principled_material("M_EC_SmokeGlass", "#07110E", 0.15, 0.16)
    bsdf = glass.node_tree.nodes.get("Principled BSDF")
    _set_input(bsdf, "Transmission Weight", 0.18)
    _set_input(bsdf, "IOR", 1.45)
    _set_input(bsdf, "Alpha", 0.78)
    try:
        glass.surface_render_method = "DITHERED"
    except (AttributeError, TypeError):
        pass
    materials["smoke_glass"] = glass

    emerald = principled_material("M_EC_EmeraldEnergy", "#00D26A", 0.05, 0.25)
    emerald_bsdf = emerald.node_tree.nodes.get("Principled BSDF")
    _set_input(emerald_bsdf, "Emission Color", srgb_hex("#00D26A"))
    _set_input(emerald_bsdf, "Emission Strength", 3.2)
    materials["emerald"] = emerald

    halo = principled_material("M_EC_EmeraldHalo", "#5CFF9D", 0.0, 0.30)
    halo_bsdf = halo.node_tree.nodes.get("Principled BSDF")
    _set_input(halo_bsdf, "Emission Color", srgb_hex("#5CFF9D"))
    _set_input(halo_bsdf, "Emission Strength", 1.5)
    materials["halo"] = halo

    return materials


def create_volume_material(name: str = "M_EC_LightMist") -> bpy.types.Material:
    material = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    material.use_nodes = True
    nodes = material.node_tree.nodes
    nodes.clear()
    output = nodes.new("ShaderNodeOutputMaterial")
    volume = nodes.new("ShaderNodeVolumePrincipled")
    volume.inputs["Color"].default_value = srgb_hex("#1B4035")
    # The fog must shape the light without swallowing near-black materials.
    volume.inputs["Density"].default_value = 0.0015
    volume.inputs["Anisotropy"].default_value = 0.18
    material.node_tree.links.new(volume.outputs["Volume"], output.inputs["Volume"])
    return material


def configure_compositor(scene: bpy.types.Scene) -> None:
    scene.use_nodes = True
    # Blender 5.1 moved the compositor tree onto ``compositing_node_group``;
    # keep the fallback so the authoring script is also usable in Blender 4.x.
    tree = getattr(scene, "node_tree", None)
    if tree is None:
        tree = scene.compositing_node_group
        if tree is None:
            tree = bpy.data.node_groups.new("Engineering City Compositor", "CompositorNodeTree")
            scene.compositing_node_group = tree
    nodes = tree.nodes
    links = tree.links
    nodes.clear()
    render_layers = nodes.new("CompositorNodeRLayers")
    render_layers.name = "EC Render Layers"
    glare = nodes.new("CompositorNodeGlare")
    glare.name = "EC Bloom"
    if hasattr(glare, "glare_type"):
        # Blender 4.x compositor API.
        glare.glare_type = "FOG_GLOW"
        glare.quality = "HIGH"
        glare.threshold = 0.75
        glare.size = 6
        glare.mix = 0.0
    else:
        # Blender 5.1 compositor API exposes the former properties as sockets.
        glare.inputs["Type"].default_value = "Fog Glow"
        glare.inputs["Quality"].default_value = "High"
        glare.inputs["Threshold"].default_value = 0.75
        glare.inputs["Size"].default_value = 0.55
    try:
        mix = nodes.new("CompositorNodeMixRGB")
        mix.blend_type = "MIX"
        factor_socket = mix.inputs[0]
        background_socket = mix.inputs[1]
        foreground_socket = mix.inputs[2]
    except RuntimeError:
        # Blender 5.1's new compositor replaces MixRGB with Alpha Over.
        mix = nodes.new("CompositorNodeAlphaOver")
        factor_socket = mix.inputs["Factor"]
        background_socket = mix.inputs["Background"]
        foreground_socket = mix.inputs["Foreground"]
    mix.name = "EC Bloom Mix"
    factor_socket.default_value = 0.14
    try:
        composite = nodes.new("CompositorNodeComposite")
        composite_input = composite.inputs["Image"]
    except RuntimeError:
        # The Blender 5.1 compositor uses a node-group output instead of the
        # legacy Composite node.  Giving the group an Image output preserves
        # the same graph semantics in the saved master scene.
        if not tree.interface.items_tree.get("Image"):
            tree.interface.new_socket(name="Image", in_out="OUTPUT", socket_type="NodeSocketColor")
        composite = nodes.new("NodeGroupOutput")
        composite.name = "EC Composite Output"
        composite_input = composite.inputs["Image"]
    links.new(render_layers.outputs["Image"], glare.inputs["Image"])
    links.new(render_layers.outputs["Image"], background_socket)
    links.new(glare.outputs["Image"], foreground_socket)
    links.new(mix.outputs["Image"], composite_input)


def configure_scene(scene: bpy.types.Scene, engine: str, samples: int) -> None:
    scene.unit_settings.system = "METRIC"
    scene.unit_settings.length_unit = "METERS"
    scene.unit_settings.scale_length = 1.0
    # Blender renamed the display name to "Eevee Next" while retaining
    # ``BLENDER_EEVEE`` as the Python enum in current releases.
    engine = "BLENDER_EEVEE" if engine == "BLENDER_EEVEE_NEXT" else engine
    scene.render.engine = engine
    scene.render.resolution_percentage = 100
    scene.render.film_transparent = False
    scene.render.image_settings.color_mode = "RGB"
    scene.render.image_settings.color_depth = "16"
    scene.render.use_file_extension = True
    scene.render.engine = engine
    if engine == "CYCLES":
        scene.cycles.samples = samples
        scene.cycles.use_denoising = True
    else:
        scene.render.image_settings.color_depth = "8"
    try:
        scene.view_settings.look = "AgX - Medium High Contrast"
    except TypeError:
        pass
    scene.view_settings.exposure = 0.25
    if scene.world is None:
        scene.world = bpy.data.worlds.new("Engineering City World")
    scene.world.use_nodes = True
    background = scene.world.node_tree.nodes.get("Background")
    if background:
        background.inputs["Color"].default_value = srgb_hex("#0B1716")
        background.inputs["Strength"].default_value = 0.70
    try:
        scene.world.mist_settings.use_mist = True
        scene.world.mist_settings.start = 45
        scene.world.mist_settings.depth = 120
    except AttributeError:
        pass
    view_layer = scene.view_layers[0]
    for property_name in ("use_pass_z", "use_pass_mist", "use_pass_emit"):
        if hasattr(view_layer, property_name):
            setattr(view_layer, property_name, True)
    configure_compositor(scene)


def set_bloom_amount(scene: bpy.types.Scene, amount: float) -> None:
    tree = getattr(scene, "node_tree", None) or getattr(scene, "compositing_node_group", None)
    node = tree.nodes.get("EC Bloom Mix") if tree else None
    if node:
        socket = node.inputs.get("Factor") or node.inputs[0]
        socket.default_value = amount


def descendants(collection: bpy.types.Collection) -> list[bpy.types.Object]:
    objects = list(collection.objects)
    for child in collection.children:
        objects.extend(descendants(child))
    return objects


def mesh_statistics(objects: Iterable[bpy.types.Object]) -> tuple[int, tuple[float, float, float], tuple[float, float, float]]:
    """Return triangles and world-space (min,max) bounds for mesh objects."""
    depsgraph = bpy.context.evaluated_depsgraph_get()
    triangles = 0
    corners: list[Vector] = []
    for obj in objects:
        if obj.type != "MESH":
            continue
        evaluated = obj.evaluated_get(depsgraph)
        mesh = evaluated.to_mesh()
        try:
            mesh.calc_loop_triangles()
            triangles += len(mesh.loop_triangles)
            # Do not transform ``bound_box`` here: it is itself an axis-aligned
            # local box, so rotating a hexagonal object would report an
            # inflated *box of a box*.  Actual vertices yield delivery bounds.
            corners.extend(obj.matrix_world @ vertex.co for vertex in mesh.vertices)
        finally:
            evaluated.to_mesh_clear()
    if not corners:
        return (0, (0.0, 0.0, 0.0), (0.0, 0.0, 0.0))
    minimum = tuple(min(point[axis] for point in corners) for axis in range(3))
    maximum = tuple(max(point[axis] for point in corners) for axis in range(3))
    return (triangles, minimum, maximum)


def export_glb(objects: Iterable[bpy.types.Object], filepath: str) -> None:
    bpy.ops.object.select_all(action="DESELECT")
    exportable = list(objects)
    for obj in exportable:
        obj.select_set(True)
    if not exportable:
        raise ValueError("cannot export an empty object collection")
    bpy.context.view_layer.objects.active = next((obj for obj in exportable if obj.type == "MESH"), exportable[0])
    bpy.ops.export_scene.gltf(
        filepath=filepath,
        export_format="GLB",
        use_selection=True,
        use_visible=False,
        export_materials="EXPORT",
        export_cameras=False,
        export_lights=False,
        export_animations=False,
        export_extras=True,
        export_yup=True,
        export_apply=True,
    )
    bpy.ops.object.select_all(action="DESELECT")
