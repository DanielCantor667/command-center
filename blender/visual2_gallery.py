"""Gallery composition for the workshop scene; call on a working copy before export."""
from pathlib import Path

import bpy
from mathutils import Matrix, Vector


EXHIBITS = (
    ("kliniu", "kliniu-desktop.webp", 3.78),
    ("lorigine", "lorigine-catalog-v4.webp", 2.96),
    ("4ustudio-academy", "academy-lessons-v4.webp", 2.14),
    ("drokex", "drokex-products-v4.webp", 1.32),
)
OLD_SLOTS = (("command-center", 1.7, -0.7), ("intranet-ess", 2.4, 0.0), ("vevi", 3.1, 0.7))
LABELS = Path("/Users/creativo/Documents/command-center-assets/generated/projects")


def _material(name, color=None, image=None, emission=0.0):
    material = bpy.data.materials.new(name)
    material.use_nodes = True
    nodes, links = material.node_tree.nodes, material.node_tree.links
    bsdf = nodes.get("Principled BSDF")
    if color is not None:
        bsdf.inputs["Base Color"].default_value = (*color, 1)
        bsdf.inputs["Roughness"].default_value = .52
        bsdf.inputs["Metallic"].default_value = .28
    if image is not None:
        texture = nodes.new("ShaderNodeTexImage")
        texture.image = bpy.data.images.load(str(image), check_existing=True)
        links.new(texture.outputs["Color"], bsdf.inputs["Base Color"])
        links.new(texture.outputs["Color"], bsdf.inputs["Emission Color"])
        bsdf.inputs["Emission Strength"].default_value = emission
        bsdf.inputs["Roughness"].default_value = .65
    return material


def _box(collection, name, location, size, material):
    bpy.ops.mesh.primitive_cube_add(size=1, location=location)
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = size
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    for existing in list(obj.users_collection):
        existing.objects.unlink(obj)
    collection.objects.link(obj)
    obj.data.materials.append(material)
    return obj


def _quad(collection, name, x, y, z, width, height, material):
    # The room faces -X; the quad carries world-space coordinates like the other screens.
    vertices = [(x, y + width / 2, z - height / 2), (x, y - width / 2, z - height / 2),
                (x, y - width / 2, z + height / 2), (x, y + width / 2, z + height / 2)]
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(vertices, [], [(0, 1, 2, 3)])
    mesh.update()
    uv = mesh.uv_layers.new(name="UVMap")
    for loop, coord in zip(mesh.loops, ((0, 0), (1, 0), (1, 1), (0, 1))):
        uv.data[loop.index].uv = coord
    obj = bpy.data.objects.new(name, mesh)
    collection.objects.link(obj)
    obj.data.materials.append(material)
    return obj


def apply(collection, root):
    """Add gallery anchors and move the original three screens above the entrance."""
    root = Path(root)
    if bpy.data.objects.get("screen_gallery_kliniu"):
        raise RuntimeError("Visual 2 gallery has already been applied")
    for project, capture, _ in EXHIBITS:
        for path in (root / "apps/web/public/projects" / capture, LABELS / f"{project}_label.png"):
            if not path.is_file():
                raise FileNotFoundError(path)
    for project, _, _ in OLD_SLOTS:
        for prefix in ("screen_", "label_", "bezel_", "arm_"):
            if not bpy.data.objects.get(prefix + project):
                raise RuntimeError(f"Missing existing wall object: {prefix + project}")

    # Keep each screen, label, bezel and arm together as a rigid group. The front wall
    # faces +Y; its door and illuminated exit sign remain below the relocated displays.
    bpy.context.view_layer.update()
    for project, old_y, new_x in OLD_SLOTS:
        old_centre = Vector((3.935, old_y, 2.0))
        new_centre = Vector((new_x, -6.035, 2.70))
        transform = Matrix.Translation(new_centre) @ Matrix.Rotation(-1.5707963267948966, 4, "Z") @ Matrix.Translation(-old_centre)
        for prefix in ("screen_", "label_", "bezel_", "arm_"):
            obj = bpy.data.objects[prefix + project]
            obj.matrix_world = transform @ obj.matrix_world

    frame = _material("gallery_frame", (.016, .019, .024))
    lamp = _material("gallery_lamp_glow", (1.0, .62, .3))
    bsdf = lamp.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Emission Color"].default_value = (1.0, .44, .16, 1)
    bsdf.inputs["Emission Strength"].default_value = 6
    _box(collection, "gallery_lamp_rail", (3.965, 2.55, 2.62), (.08, 3.45, .06), frame)
    for project, capture, y in EXHIBITS:
        _box(collection, f"gallery_frame_{project}", (3.958, y, 2.03), (.065, .74, .48), frame)
        image = _material(f"gallery_image_{project}", image=root / "apps/web/public/projects" / capture, emission=.5)
        _quad(collection, f"screen_gallery_{project}", 3.922, y, 2.03, .70, .44, image)
        label = _material(f"gallery_label_{project}", image=LABELS / f"{project}_label.png", emission=.12)
        _quad(collection, f"label_gallery_{project}", 3.921, y, 1.737, .70, .09, label)
        _box(collection, f"gallery_lamp_body_{project}", (3.86, y, 2.57), (.22, .13, .10), frame)
        _box(collection, f"gallery_lamp_face_{project}", (3.82, y, 2.514), (.12, .085, .008), lamp)
        data = bpy.data.lights.new(f"gallery_light_{project}", "AREA")
        data.energy, data.color, data.shape, data.size = 18, (1, .45, .18), "DISK", .22
        light = bpy.data.objects.new(data.name, data)
        collection.objects.link(light)
        light.location = (3.72, y, 2.53)
        light.rotation_euler = (Vector((3.95, y, 2.0)) - light.location).to_track_quat("-Z", "Y").to_euler()
    bpy.context.view_layer.update()
