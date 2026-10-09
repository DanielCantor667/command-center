"""Versioned Kliniu material/detail pass. Run in Blender via MCP.

Appends the existing showroom, leaving the user's open scenes untouched.
"""
import sys
from pathlib import Path
import bpy

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'blender'))
import generate_kliniu_showroom as base
from lib.engineering_city import srgb_hex, add_area_light


def build():
    source = ROOT / 'blender/output/kliniu-showroom/kliniu-showroom-v3.blend'
    with bpy.data.libraries.load(str(source), link=False) as (available, loaded):
        loaded.scenes = [n for n in available.scenes if n.startswith('Kliniu Showroom')][:1]
    scene = loaded.scenes[0]
    scene.name = 'Kliniu Showroom v4'
    bpy.context.window.scene = scene
    base.C = next(c for c in scene.collection.children if 'Objects' in c.name)
    for obj in scene.objects:
        for slot in obj.material_slots:
            if slot.material and slot.material.name.startswith('Kliniu_'):
                key = slot.material.name.split('Kliniu_', 1)[1].split('.')[0]
                base.M[key] = slot.material
    # Fine anisotropy supplies metal highlights without exaggerated surface noise.
    for key in ['steel', 'chrome', 'silver']:
        material = base.M[key]
        node = next(n for n in material.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
        node.inputs['Metallic'].default_value = 1
        node.inputs['Roughness'].default_value = {'steel': .24, 'chrome': .12, 'silver': .32}[key]
        if node.inputs.get('Anisotropic IOR Level'):
            node.inputs['Anisotropic IOR Level'].default_value = .55
    for key, roughness in [('white', .31), ('teal', .27), ('stone', .48)]:
        mat = base.M[key]
        node = next(n for n in mat.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
        node.inputs['Roughness'].default_value = roughness
        noise = mat.node_tree.nodes.new('ShaderNodeTexNoise')
        noise.inputs['Scale'].default_value = 180
        bump = mat.node_tree.nodes.new('ShaderNodeBump')
        bump.inputs['Strength'].default_value = .055
        bump.inputs['Distance'].default_value = .0003
        mat.node_tree.links.new(noise.outputs['Fac'], bump.inputs['Height'])
        mat.node_tree.links.new(bump.outputs['Normal'], node.inputs['Normal'])
    for x in [-.87, -.41, .41, .87]:
        for z in [.29, 1.23]:
            base.box('Glass stainless clamp', (x,-.695,z), (.035,.033,.058), 'chrome', 'facade', .004)
            base.cyl('Clamp screw', (x,-.715,z), .006,.004,'silver','facade',front=True)
    for x in [-.89,.89]:
        base.box('Facade threshold gasket',(x,-.03,.237),(.018,1.34,.012),'dark','facade',.002)
    for x in [-.59,0,.59]:
        base.box('Display label plate',(x,.34,.54),(.21,.012,.045),'silver','interior',.003)
    for y in [-.36,.35]:
        base.box('Transverse tile joint',(0,y,.217),(1.78,.002,.002),'silver',bevel=0)
    for x in [-.60, .60]:
        add_area_light('Interior warm wash',(x,.25,1.29),(x,.53,.73),(1,.92,.80),4,.35,base.C)
    for obj in scene.objects:
        if obj.type == 'LIGHT' and 'Key' in obj.name:
            obj.data.energy = 550
            obj.data.size = 2.4
        if obj.type == 'LIGHT' and 'fill' in obj.name:
            obj.data.energy = 125
    bg = next(n for n in scene.world.node_tree.nodes if n.type == 'BACKGROUND')
    bg.inputs['Strength'].default_value = .22
    scene.camera.location = (2.8,-4.8,2.5)
    from mathutils import Vector
    scene.camera.rotation_euler = (Vector((0,0,.73))-scene.camera.location).to_track_quat('-Z','Y').to_euler()
    scene.camera.data.ortho_scale = 3.8
    scene.render.resolution_x = 1600
    scene.render.resolution_y = 1100
    scene.cycles.samples = 96
    scene.render.filepath = str(ROOT / 'blender/output/kliniu-showroom/kliniu-space-v4.png')
    base.export_layers('kliniu-interactive-v4.glb')
    bpy.ops.wm.save_as_mainfile(filepath=str(ROOT / 'blender/output/kliniu-showroom/kliniu-showroom-v4.blend'))
    return {'scene':scene.name,'objects':len(scene.objects),'render':scene.render.filepath}


def blueprint():
    import bmesh
    source = bpy.data.scenes['Kliniu Showroom v4']
    scene = bpy.data.scenes.new('Kliniu Plan v4')
    scene.world = source.world.copy()
    paper = bpy.data.materials.new('Kliniu Plan Paper')
    paper.use_nodes = True
    shader = next(n for n in paper.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
    shader.inputs['Base Color'].default_value = srgb_hex('#e6e9e7')
    shader.inputs['Roughness'].default_value = .9
    ink = paper.copy()
    ink.name = 'Kliniu Plan Ink'
    next(n for n in ink.node_tree.nodes if n.type == 'BSDF_PRINCIPLED').inputs['Base Color'].default_value = srgb_hex('#365e52')
    depsgraph = bpy.context.evaluated_depsgraph_get()
    for original in source.objects:
        obj = original.copy()
        obj.data = original.data.copy()
        scene.collection.objects.link(obj)
        if original == source.camera:
            scene.camera = obj
        if original.type not in {'MESH','FONT'}:
            continue
        obj.data.materials.clear()
        obj.data.materials.append(paper)
        if original.get('studio'):
            continue
        mesh = original.data.copy() if original.type == 'MESH' else bpy.data.meshes.new_from_object(original.evaluated_get(depsgraph))
        bm = bmesh.new()
        bm.from_mesh(mesh)
        curve = bpy.data.curves.new(original.name + ' contours','CURVE')
        curve.dimensions = '3D'
        curve.bevel_depth = .0014
        curve.bevel_resolution = 0
        curve.materials.append(ink)
        for edge in bm.edges:
            if len(edge.link_faces) == 2 and edge.calc_face_angle(0) < .4:
                continue
            spline = curve.splines.new('POLY')
            spline.points.add(1)
            for point, vertex in zip(spline.points, edge.verts):
                point.co = (*vertex.co,1)
        lines = bpy.data.objects.new(curve.name, curve)
        lines.matrix_world = original.matrix_world.copy()
        scene.collection.objects.link(lines)
        bm.free()
        bpy.data.meshes.remove(mesh)
    try:
        scene.render.engine = 'CYCLES'
    except TypeError:
        pass
    scene.cycles.samples = 32
    scene.cycles.use_denoising = True
    scene.render.resolution_x = 1600
    scene.render.resolution_y = 1100
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = 'PNG'
    scene.render.filepath = str(ROOT / 'blender/output/kliniu-showroom/kliniu-plan-v4')
    bpy.ops.wm.save_as_mainfile(filepath=str(ROOT / 'blender/output/kliniu-showroom/kliniu-showroom-v4.blend'))
    return scene.name


if __name__ == '__main__':
    print(build())
