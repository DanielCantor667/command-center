"""L'ORIGINE v4: independent gallery and product-detail scenes for the portfolio.

Conceptual exhibition, not a replica of a built shop or production packaging CAD.
"""
import math
import sys
from pathlib import Path
import bpy
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'blender'))
import generate_kliniu_showroom as kit
from lib.engineering_city import srgb_hex, add_area_light

OUT = ROOT / 'blender/output/lorigine-v4'


def shader(mat):
    return next(n for n in mat.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')


def camera(scene, position, target, scale):
    scene.camera.location = position
    scene.camera.rotation_euler = (Vector(target)-Vector(position)).to_track_quat('-Z','Y').to_euler()
    scene.camera.data.ortho_scale = scale


def build():
    OUT.mkdir(parents=True, exist_ok=True)
    source = ROOT / 'blender/output/brand-pavilions-v3/brand-pavilions-v3.blend'
    with bpy.data.libraries.load(str(source), link=False) as (available, loaded):
        loaded.scenes = ['lorigine Brand v3']
    scene = loaded.scenes[0]
    scene.name = 'Lorigine Gallery v4'
    bpy.context.window.scene = scene
    kit.C = next(c for c in scene.collection.children if 'Objects' in c.name)
    materials = {}
    for obj in scene.objects:
        if obj.type in {'MESH','FONT'}:
            for slot in obj.material_slots:
                original = slot.material
                if not original:
                    continue
                if original not in materials:
                    materials[original] = original.copy()
                slot.material = materials[original]
        if obj.name.startswith(('Front fascia', 'Ceiling luminaire')) or (obj.type == 'FONT' and obj.get('layer') == 'structure'):
            obj['layer'] = 'roof'
    for original, mat in materials.items():
        name = original.name
        node = shader(mat)
        if any(key in name for key in ['stone','plaster']):
            node.inputs['Base Color'].default_value = srgb_hex('#dce0da' if 'stone' in name else '#f0f1ed')
            node.inputs['Roughness'].default_value = .55
            texture = mat.node_tree.nodes.new('ShaderNodeTexNoise')
            texture.inputs['Scale'].default_value = 145
            bump = mat.node_tree.nodes.new('ShaderNodeBump')
            bump.inputs['Strength'].default_value = .1
            bump.inputs['Distance'].default_value = .0008
            mat.node_tree.links.new(texture.outputs['Fac'],bump.inputs['Height'])
            mat.node_tree.links.new(bump.outputs['Normal'],node.inputs['Normal'])
        if 'amber' in name:
            node.inputs['Base Color'].default_value = srgb_hex('#783512')
            node.inputs['Roughness'].default_value = .22
            node.inputs['Coat Weight'].default_value = .4
            node.inputs['Coat Roughness'].default_value = .16
            node.inputs['IOR'].default_value = 1.46
        if any(key in name for key in ['brass','gold']):
            node.inputs['Base Color'].default_value = srgb_hex('#b6ab87')
            node.inputs['Metallic'].default_value = .82
            node.inputs['Roughness'].default_value = .3
        if 'dark' in name:
            node.inputs['Base Color'].default_value = srgb_hex('#202323')
            node.inputs['Roughness'].default_value = .28
        if 'ground' in name:
            node.inputs['Base Color'].default_value = srgb_hex('#edf0ee')
        if name.startswith('lorigine_'):
            kit.M[name.split('lorigine_',1)[1].split('.')[0]] = mat
    bottles = [o for o in scene.objects if o.name.startswith('Pump collar')]
    for collar in bottles:
        x,y,z = collar.location
        r = collar.dimensions.x / 2
        for index in range(20):
            angle = index * math.tau / 20
            kit.cyl('Pump collar grip',(x+math.cos(angle)*r,y+math.sin(angle)*r,z),.0011,collar.dimensions.z*.8,'dark','feature')
        kit.cyl('Collar sealing ring',(x,y,z-collar.dimensions.z*.48),r*1.02,.003,'gold','feature')
    for x in [-.6,0,.6]:
        kit.box('Pedestal presentation plaque',(x,-.24,.535),(.15,.045,.008),'gold','feature',.002)
    for x in [-.84,.84]:
        kit.box('Gallery floor edge',(x,0,.171),(.008,1.42,.009),'gold','structure',.002)
    for x in [-.58,0,.58]:
        add_area_light('Niche soft wash',(x,.27,1.2),(x,.4,.82),(1,.94,.82),2.5,.3,kit.C)
    for obj in scene.objects:
        if obj.type == 'LIGHT' and 'Key' in obj.name:
            obj.data.energy = 480
            obj.data.size = 2.5
        if obj.type == 'LIGHT' and 'fill' in obj.name:
            obj.data.energy = 150
    scene.world = scene.world.copy()
    bg = next(n for n in scene.world.node_tree.nodes if n.type == 'BACKGROUND')
    bg.inputs['Strength'].default_value = .22
    camera(scene,(2.8,-4.5,2.35),(0,0,.76),3.8)
    scene.cycles.samples = 96
    scene.render.resolution_x = 1600
    scene.render.resolution_y = 1100
    scene.render.resolution_percentage = 100
    scene.render.filepath = str(OUT / 'lorigine-gallery-v4-')
    kit.export_layers('lorigine-interactive-v4.glb')

    detail = bpy.data.scenes.new('Lorigine Detail v4')
    detail.world = scene.world
    for original in scene.objects:
        if original.get('layer') in {'roof','facade'}:
            continue
        obj = original.copy()
        detail.collection.objects.link(obj)
        if original == scene.camera:
            obj.data = original.data.copy()
            detail.camera = obj
    camera(detail,(1.35,-4,1.65),(0,-.02,.70),2.8)
    try:
        detail.render.engine = 'CYCLES'
    except TypeError:
        pass
    detail.cycles.samples = 96
    detail.cycles.use_denoising = True
    detail.render.resolution_x = 1600
    detail.render.resolution_y = 1100
    detail.render.resolution_percentage = 100
    detail.render.image_settings.file_format = 'PNG'
    detail.render.filepath = str(OUT / 'lorigine-detail-v4-')
    bpy.context.window.scene = scene
    bpy.ops.wm.save_as_mainfile(filepath=str(OUT / 'lorigine-gallery-v4.blend'))
    return {'gallery':scene.name,'detail':detail.name,'objects':len(scene.objects)}


if __name__ == '__main__':
    print(build())
