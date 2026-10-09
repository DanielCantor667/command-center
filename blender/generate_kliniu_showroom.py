"""Kliniu showroom and catalogue-inspired products, authored through Blender MCP.

Creates independent scenes and versioned exports without altering earlier assets.
Product forms are visual interpretations of public photographs, not production CAD.
"""
import math
import sys
from pathlib import Path

import bpy
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'blender'))
from lib.engineering_city import add_box, add_cylinder, add_camera, add_area_light, srgb_hex

OUT = ROOT / 'blender/output/kliniu-showroom'
MODELS = ROOT / 'apps/web/public/models/workshop'
M = {}
C = None


def material(name, color, rough=.4, metal=0, transmission=0):
    mat = bpy.data.materials.new('Kliniu_' + name)
    mat.use_nodes = True
    mat.diffuse_color = srgb_hex(color)
    node = next(n for n in mat.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
    node.inputs['Base Color'].default_value = srgb_hex(color)
    node.inputs['Roughness'].default_value = rough
    node.inputs['Metallic'].default_value = metal
    node.inputs['Transmission Weight'].default_value = transmission
    node.inputs['IOR'].default_value = 1.45
    if name == 'warm':
        node.inputs['Emission Color'].default_value = srgb_hex('#fff2dd')
        node.inputs['Emission Strength'].default_value = 2
    if name == 'steel':
        tex = mat.node_tree.nodes.new('ShaderNodeTexNoise')
        tex.inputs['Scale'].default_value = 230
        bump = mat.node_tree.nodes.new('ShaderNodeBump')
        bump.inputs['Strength'].default_value = .08
        bump.inputs['Distance'].default_value = .00015
        mat.node_tree.links.new(tex.outputs['Fac'], bump.inputs['Height'])
        mat.node_tree.links.new(bump.outputs['Normal'], node.inputs['Normal'])
    M[name] = mat


def box(name, p, size, mat, layer='structure', bevel=.008):
    obj = add_box(name, p, size, C, M[mat], bevel=0)
    if bevel:
        mod = obj.modifiers.new('Soft manufactured edges', 'BEVEL')
        mod.width = bevel
        mod.segments = 4
    obj['layer'] = layer
    return obj


def cyl(name, p, radius, depth, mat, layer='interior', front=False):
    obj = add_cylinder(name, p, radius, depth, C, M[mat], vertices=64, bevel=.001)
    if front:
        obj.rotation_euler.x = math.pi / 2
    for polygon in obj.data.polygons:
        polygon.use_smooth = len(polygon.vertices) == 4
    obj['layer'] = layer
    return obj


def text(body, p, size, mat='teal', layer='structure'):
    curve = bpy.data.curves.new(body, 'FONT')
    curve.body = body
    curve.size = size
    curve.align_x = 'CENTER'
    curve.extrude = .0008
    obj = bpy.data.objects.new(body, curve)
    C.objects.link(obj)
    obj.location = p
    obj.rotation_euler.x = math.pi / 2
    curve.materials.append(M[mat])
    obj['layer'] = layer
    return obj


def paper(x, y, z, s=1):
    # The 25 cm circular body and 11 cm depth follow the public product sheet.
    cyl('KlinOx circular shell', (x,y,z), .125*s, .11*s, 'steel', front=True)
    cyl('KlinOx cover seam', (x,y-.057*s,z), .123*s, .004*s, 'dark', front=True)
    cyl('KlinOx satin cover', (x,y-.061*s,z), .122*s, .006*s, 'steel', front=True)
    box('Paper outlet foot', (x,y,z-.108*s), (.127*s,.106*s,.052*s), 'steel', 'interior', .012*s)
    cyl('Central lock', (x,y-.066*s,z-.005*s), .012*s,.005*s,'chrome',front=True)
    box('Lock slot',(x,y-.07*s,z-.005*s),(.012*s,.002*s,.002*s),'dark','interior',.0007)
    box('Paper level slit',(x,y-.066*s,z-.061*s),(.004*s,.002*s,.036*s),'dark','interior',.0015*s)
    text('KLINIU',(x,y-.067*s,z+.052*s),.019*s,'dark','interior')


def soap(x, y, z, s=1):
    box('Soap rounded ABS body',(x,y,z),(.14*s,.105*s,.25*s),'white','interior',.026*s)
    box('Blue liquid reservoir',(x,y-.054*s,z+.023*s),(.124*s,.018*s,.13*s),'blue','interior',.016*s)
    box('Reservoir highlight',(x-.037*s,y-.064*s,z+.035*s),(.003*s,.002*s,.10*s),'white','interior',.001*s)
    box('ABS cap seam',(x,y,z+.088*s),(.142*s,.107*s,.004*s),'silver','interior',.001)
    cyl('Round soap actuator',(x+.033*s,y-.064*s,z-.075*s),.026*s,.018*s,'white',front=True)
    cyl('Actuator inset',(x+.033*s,y-.075*s,z-.075*s),.018*s,.002*s,'silver',front=True)
    text('KLINIU',(x,y-.066*s,z+.033*s),.017*s,'teal','interior')


def towel(x, y, z, s=1):
    box('Towel folded steel casing',(x,y,z),(.26*s,.10*s,.21*s),'steel','interior',.015*s)
    box('Towel cover seam',(x,y-.052*s,z),(.245*s,.004*s,.195*s),'silver','interior',.011*s)
    box('Towel satin face',(x,y-.055*s,z+.002*s),(.239*s,.003*s,.19*s),'steel','interior',.009*s)
    box('Towel level window',(x,y-.058*s,z-.043*s),(.004*s,.003*s,.039*s),'dark','interior',.001*s)
    box('Folded paper outlet',(x,y-.005*s,z-.13*s),(.19*s,.003*s,.067*s),'paper','interior',.001)
    text('KLINIU',(x,y-.058*s,z+.035*s),.018*s,'dark','interior')


def showroom():
    box('Foundation',(0,0,.08),(2.04,1.76,.16),'stone',bevel=.024)
    box('Shadow plinth',(0,0,.17),(1.88,1.53,.035),'dark')
    box('Showroom floor',(0,0,.20),(1.86,1.51,.03),'white')
    for x in [-.60,0,.60]:
        box('Porcelain tile joint',(x,0,.217),(.003,1.46,.002),'silver',bevel=0)
    box('Back gallery wall',(0,.68,.78),(1.86,.08,1.16),'white')
    box('Teal display backdrop',(0,.632,.79),(1.72,.018,.96),'teal')
    for x in [-.59,0,.59]:
        box('Backlit product panel',(x,.604,.83),(.50,.032,.70),'white','interior',.014)
        box('Display shelf',(x,.48,.50),(.46,.25,.026),'stone','interior')
        box('Shelf LED',(x,.36,.49),(.40,.012,.006),'warm','interior',.002)
    soap(-.59,.52,.82,1.45)
    paper(0,.49,.83,1.4)
    towel(.59,.50,.83,1.35)
    for x,body in [(-.59,'LIQUIDOS'),(0,'KLINOX'),(.59,'TOALLAS')]:
        text(body,(x,.58,1.105),.033,'teal','interior')
    # Split frontage keeps the entry open and exhibits visible from overview.
    for x in [-.64,.64]:
        box('Clear front pane',(x,-.68,.79),(.48,.008,1.10),'glass','facade',.001)
        for dx in [-.24,.24]:
            box('Facade anodized frame',(x+dx,-.687,.79),(.016,.025,1.13),'silver','facade',.002)
    box('Side glazing',(.90,0,.79),(.008,1.34,1.10),'glass','facade',.001)
    box('Side service wall',(-.90,.23,.79),(.048,.92,1.12),'white')
    for y in [-.66,0,.66]:
        box('Right vertical frame',(.91,y,.79),(.022,.024,1.14),'silver','facade',.002)
    for x in [-.89,.89]:
        box('Structural post',(x,-.69,.78),(.055,.055,1.17),'white')
    box('Entry canopy',(0,-.80,1.28),(.78,.42,.042),'teal','feature',.01)
    box('Entry linear light',(0,-.80,1.252),(.65,.018,.008),'warm','feature',.002)
    box('Roof slab',(0,0,1.42),(1.98,1.60,.11),'white','roof',.018)
    box('Roof inset',(0,.05,1.481),(1.76,1.27,.018),'silver','roof',.01)
    box('Brand fascia',(0,-.82,1.47),(1.90,.09,.25),'white','roof',.012)
    text('KLINIU',(0,-.869,1.435),.18,'teal','roof')
    box('Fascia teal edge',(0,-.872,1.353),(1.81,.008,.014),'teal','roof',.003)
    for x in [-.54,.54]:
        box('Ceiling luminaire',(x,.05,1.35),(.035,1.12,.014),'warm','roof',.003)
    box('Consultation counter',(-.54,-.32,.42),(.47,.32,.4),'white','interior',.022)
    box('Counter turquoise inset',(-.54,-.486,.42),(.40,.015,.24),'teal','interior',.009)
    text('KLINIU',(-.54,-.496,.41),.058,'white','interior')
    box('Counter worktop',(-.54,-.32,.632),(.50,.35,.032),'stone','interior')
    box('Tablet',(-.54,-.29,.71),(.17,.025,.11),'dark','interior',.008)
    box('Tablet display',(-.54,-.305,.71),(.149,.002,.088),'blue','interior',.003)
    cyl('Exhibit plinth',(.56,-.30,.40),.17,.36,'white')
    soap(.56,-.30,.73,1.12)
    box('Entry step',(0,-.81,.205),(.69,.28,.05),'stone')
    for x in [-.91,.91]:
        cyl('Entry bollard',(x,-.78,.27),.018,.18,'silver',layer='structure')


def setup_scene(name):
    global C
    scene = bpy.data.scenes.new(name)
    bpy.context.window.scene = scene
    C = bpy.data.collections.new(name + ' Objects')
    scene.collection.children.link(C)
    return scene


def studio(scene, target, camera_position, scale):
    ground = box('Studio ground',(0,0,-.045),(200,200,.06),'ground',bevel=0)
    ground['studio'] = True
    camera = add_camera('Camera',camera_position,target,50,C,camera_type='ORTHO',ortho_scale=scale)
    scene.camera = camera
    add_area_light('Key softbox',(-3,-4,6),target,(1,.96,.91),450,4,C)
    add_area_light('Cool fill',(4,-1,3),target,(.80,.94,1),260,3,C)
    add_area_light('Rim',(1,4,4),target,(1,1,1),500,3,C)
    scene.world = bpy.data.worlds.new('Kliniu studio world')
    scene.world.use_nodes = True
    bg = next(n for n in scene.world.node_tree.nodes if n.type == 'BACKGROUND')
    bg.inputs['Color'].default_value = (.7,.75,.8,1)
    bg.inputs['Strength'].default_value = .35
    try:
        scene.render.engine = 'CYCLES'
    except TypeError:
        pass
    scene.cycles.samples = 64
    scene.cycles.use_denoising = True
    scene.render.resolution_x = 1400
    scene.render.resolution_y = 1200
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = 'PNG'


def export_layers(filename='kliniu-interactive-v3.glb'):
    temporary = []
    groups = {}
    try:
        for original in list(C.objects):
            if original.type not in {'MESH','FONT'} or original.get('studio'):
                continue
            obj = original.copy()
            obj.data = original.data.copy()
            bpy.context.scene.collection.objects.link(obj)
            temporary.append(obj)
            bpy.ops.object.select_all(action='DESELECT')
            obj.select_set(True)
            bpy.context.view_layer.objects.active = obj
            bpy.ops.object.convert(target='MESH')
            groups.setdefault(original.get('layer','structure'), []).append(obj)
        joined = []
        for layer, objects in groups.items():
            bpy.ops.object.select_all(action='DESELECT')
            for obj in objects:
                obj.select_set(True)
            bpy.context.view_layer.objects.active = objects[0]
            bpy.ops.object.join()
            bpy.context.object.name = layer
            joined.append(bpy.context.object)
        bpy.ops.object.select_all(action='DESELECT')
        for obj in joined:
            obj.select_set(True)
        bpy.ops.export_scene.gltf(filepath=str(MODELS/filename),
            export_format='GLB',use_selection=True,use_active_scene=True,
            export_apply=True,export_cameras=False,export_lights=False,export_animations=False)
    finally:
        for obj in temporary:
            try:
                bpy.data.objects.remove(obj,do_unlink=True)
            except ReferenceError:
                pass


def build():
    OUT.mkdir(parents=True,exist_ok=True)
    for args in [
        ('white','#f6f8f7',.28),('teal','#098991',.30),
        ('blue','#23b8d0',.19),('steel','#c7ccce',.29,.95),
        ('chrome','#e6ecef',.13,1),('silver','#969fa2',.35,.7),
        ('dark','#1b292d',.4),('stone','#e1e6e5',.55),
        ('glass','#f6ffff',.015,0,1),('paper','#faf9f3',.8),
        ('warm','#fff2dd',.35),('ground','#e5e9e9',.7)]:
        material(*args)
    main = setup_scene('Kliniu Showroom v3')
    showroom()
    export_layers()
    studio(main,(0,0,.74),(3,-4,2.8),3.25)
    main.render.filepath = str(OUT/'kliniu-showroom.png')
    product = setup_scene('Kliniu Product Studies')
    paper(0,0,.18,1)
    soap(-.36,0,.17,1)
    towel(.38,0,.19,1)
    for x in [-.36,0,.38]:
        box('Product mounting panel',(x,.069,.19),(.32,.028,.43),'teal','interior',.012)
    studio(product,(0,0,.17),(1.0,-3,1.0),1.12)
    product.render.filepath = str(OUT/'kliniu-products.png')
    bpy.context.window.scene = main
    bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'kliniu-showroom-v3.blend'))
    return {'showroom':main.name,'products':product.name}


if __name__ == '__main__':
    print(build())
