"""Refine an independent 4U conceptual studio, preserving previous brand scenes."""
import math
import sys
from pathlib import Path
import bpy
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'blender'))
import generate_kliniu_showroom as kit
from refine_remaining_pavilions import rod, sphere
from lib.engineering_city import srgb_hex, add_area_light

OUT = ROOT / 'blender/output/academy-v4'


def shader(mat):
    return next(n for n in mat.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')


def grain(mat, scale, strength, distance):
    nodes = mat.node_tree.nodes
    noise = nodes.new('ShaderNodeTexNoise')
    noise.inputs['Scale'].default_value = scale
    bump = nodes.new('ShaderNodeBump')
    bump.inputs['Strength'].default_value = strength
    bump.inputs['Distance'].default_value = distance
    mat.node_tree.links.new(noise.outputs['Fac'], bump.inputs['Height'])
    mat.node_tree.links.new(bump.outputs['Normal'], shader(mat).inputs['Normal'])


def ring(name, center, radius, tube, material, front=False):
    vertices, faces = [], []
    for i in range(64):
        a = math.tau * i / 64
        for j in range(8):
            b = math.tau * j / 8
            p = ((radius+tube*math.cos(b))*math.cos(a),
                 (radius+tube*math.cos(b))*math.sin(a), tube*math.sin(b))
            if front:
                p = (p[0], p[2], p[1])
            vertices.append(tuple(center[k]+p[k] for k in range(3)))
            faces.append((i*8+j, ((i+1)%64)*8+j,
                          ((i+1)%64)*8+(j+1)%8, i*8+(j+1)%8))
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    kit.C.objects.link(obj)
    obj.data.materials.append(kit.M[material])
    for poly in mesh.polygons:
        poly.use_smooth = True
    obj['layer'] = 'feature'


def guitar_body():
    # A continuous waisted outline replaces the overlapping primitive lobes.
    half = [(0,.005),(.06,.015),(.10,.055),(.11,.12),(.08,.18),
            (.055,.205),(.07,.235),(.079,.275),(.065,.31),(.033,.335),(0,.34)]
    control = half + [(-x,z) for x,z in reversed(half[1:-1])]
    outline = []
    for i in range(len(control)):
        p0,p1,p2,p3 = [Vector(control[k%len(control)]) for k in [i-1,i,i+1,i+2]]
        for j in range(5):
            t = j/5
            p = .5*((2*p1)+(-p0+p2)*t+(2*p0-5*p1+4*p2-p3)*t*t+(-p0+3*p1-3*p2+p3)*t*t*t)
            outline.append((p.x,p.y))
    n = len(outline)
    vertices = [(.47+x,y,.22+z) for y in [.099,.165] for x,z in outline]
    faces = [tuple(reversed(range(n))),tuple(range(n,2*n))]
    faces += [(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)]
    mesh = bpy.data.meshes.new('Guitar continuous soundboard')
    mesh.from_pydata(vertices,[],faces)
    mesh.update()
    obj = bpy.data.objects.new('Guitar continuous soundboard',mesh)
    kit.C.objects.link(obj)
    mesh.materials.append(kit.M['wood'])
    bevel = obj.modifiers.new('Instrument edge binding','BEVEL')
    bevel.width = .002
    bevel.segments = 3
    obj['layer'] = 'feature'
    ring('Guitar rosette',(.47,.094,.455),.032,.0017,'gold',True)
    for dx in [-.025,.025]:
        rod('Guitar stand foot',(.47,.17,.24),(.47+dx,.02,.18),.005,'dark','feature')


def camera(scene, target, scale, position=(2.7,-4.5,2.5)):
    target = Vector(target)
    scene.camera.location = target+(Vector(position)-target)*3
    scene.camera.rotation_euler = (target-scene.camera.location).to_track_quat('-Z','Y').to_euler()
    scene.camera.data.ortho_scale = scale


def configure(scene, name, width, height):
    scene.use_fake_user = True
    scene.cycles.samples = 96
    scene.cycles.use_denoising = True
    scene.render.resolution_x = width
    scene.render.resolution_y = height
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = 'PNG'
    scene.render.filepath = str(OUT / (name+'-'))


def copy_view(source, name, hide_layers):
    scene = bpy.data.scenes.new(name)
    scene.world = source.world
    try:
        scene.render.engine = 'CYCLES'
    except TypeError:
        pass
    for original in source.objects:
        if original.get('layer') in hide_layers:
            continue
        obj = original.copy()
        scene.collection.objects.link(obj)
        if original == source.camera:
            obj.data = original.data.copy()
            scene.camera = obj
    return scene


def build():
    OUT.mkdir(parents=True, exist_ok=True)
    with bpy.data.libraries.load(str(ROOT/'blender/output/brand-pavilions-v3/brand-pavilions-v3.blend'),link=False) as (_, loaded):
        loaded.scenes = ['academy Brand v3']
    source = loaded.scenes[0]
    source.name = 'Academy Source v4'
    source.use_fake_user = True
    bpy.context.window.scene = source
    kit.C = next(c for c in source.collection.children if 'Objects' in c.name)
    materials = {}
    for obj in list(source.objects):
        if obj.type in {'MESH','FONT'}:
            for slot in obj.material_slots:
                if slot.material:
                    old = slot.material
                    if old not in materials:
                        materials[old] = old.copy()
                    slot.material = materials[old]
        if obj.name.startswith(('Name wall','4U STUDIO','ACADEMY')):
            obj['layer'] = 'facade'
        if obj.name.startswith('Ceiling luminaire'):
            obj['layer'] = 'roof'
        if obj.name.startswith('Studio light strip'):
            obj['layer'] = 'facade'
        if obj.name.startswith(('Guitar','Mic','Tuning','Snare','Cymbal')):
            obj['layer'] = 'feature'
        if obj.name.startswith(('Guitar lower bout','Guitar upper bout')):
            bpy.data.objects.remove(obj,do_unlink=True)
    for old,mat in materials.items():
        name = old.name.lower()
        node = shader(mat)
        if 'piano' in name:
            node.inputs['Base Color'].default_value = srgb_hex('#15191a')
            node.inputs['Roughness'].default_value = .21
            node.inputs['Coat Weight'].default_value = .45
            node.inputs['Coat Roughness'].default_value = .18
        if 'wood' in name:
            node.inputs['Base Color'].default_value = srgb_hex('#9f7951')
            node.inputs['Roughness'].default_value = .4
            grain(mat,170,.10,.0005)
            kit.M['wood'] = mat
        if 'steel' in name or 'metal' in name:
            node.inputs['Metallic'].default_value = .86
            node.inputs['Roughness'].default_value = .26
        if 'dark' in name or 'ink' in name:
            node.inputs['Base Color'].default_value = srgb_hex('#252829')
            node.inputs['Roughness'].default_value = .5
        if 'ground' in name:
            node.inputs['Base Color'].default_value = srgb_hex('#dfe3e3')
        if 'white' in name:
            node.inputs['Base Color'].default_value = srgb_hex('#f0f1ec')
            node.inputs['Roughness'].default_value = .32
        if old.name.startswith('academy_'):
            kit.M[old.name.split('academy_',1)[1].split('.')[0]] = mat
    kit.material('fabric','#414647',.92)
    kit.material('wall','#d8dedb',.68)
    grain(kit.M['fabric'],320,.25,.0008)
    kit.material('mesh','#9aa2a6',.45,.7)
    grain(kit.M['mesh'],240,.3,.001)
    for obj in source.objects:
        if obj.name.startswith('Acoustic back'):
            obj.data.materials.clear()
            obj.data.materials.append(kit.M['wall'])
        if obj.name.startswith('Acoustic absorber'):
            obj.data.materials.clear()
            obj.data.materials.append(kit.M['fabric'])
        if obj.name.startswith('Microphone grille'):
            obj.data.materials.clear()
            obj.data.materials.append(kit.M['mesh'])
        if obj.name.startswith('Guitar headstock'):
            obj.data.materials.clear()
            obj.data.materials.append(kit.M['wood'])
    guitar_body()
    for x in [-.3,-.25,-.2]:
        kit.box('Piano brass pedal',(x,-.35,.23),(.025,.095,.012),'gold','feature',.006)
        rod('Pedal linkage',(x,-.31,.24),(x,-.28,.66),.004,'steel','feature')
    kit.box('Piano music rest',(-.22,-.18,.79),(.30,.018,.15),'dark','interior',.004)
    kit.box('Keyboard front rail',(-.23,-.367,.66),(.60,.018,.03),'dark','interior',.003)
    for i in range(8):
        a=i*math.tau/8
        x,y=.5+math.cos(a)*.12,.4+math.sin(a)*.12
        rod('Snare tension bolt',(x,y,.535),(x,y,.625),.003,'steel','feature')
    for z in [.532,.638]:
        ring('Snare chrome rim',(.5,.4,z),.12,.004,'steel')
    sphere('Cymbal bell',(.73,.4,.915),(.044,.044,.016),'gold','feature')
    for x,y in [(.5,.4),(.73,.4)]:
        for a in [0,2.094,4.188]:
            rod('Percussion tripod',(x,y,.32),(x+math.cos(a)*.105,y+math.sin(a)*.105,.18),.004,'steel','feature')
    rod('Microphone body',(-.04,-.44,1.065),(.025,-.44,1.065),.012,'dark','feature')
    kit.text('4U STUDIO ACADEMY',(0,.568,1.41),.064,'dark','structure')
    kit.box('Studio brand accent',(0,.575,1.37),(.27,.012,.008),'accent','structure',.002)
    for x in [-.9,.9]:
        kit.box('Roof support',(x,-.66,.88),(.036,.036,1.40),'dark','roof',.003)
    add_area_light('Instrument softbox',(-.7,-1.1,2.6),(0,.15,.60),(1,.96,.9),100,1.4,kit.C)
    source.world = source.world.copy()
    next(n for n in source.world.node_tree.nodes if n.type=='BACKGROUND').inputs['Strength'].default_value=.3
    for obj in source.objects:
        if obj.type=='LIGHT' and 'Key' in obj.name:
            obj.data.energy=550
            obj.data.size=3
    kit.export_layers('academy-interactive-v4.glb')
    studio = copy_view(source,'Academy Studio v4',{'facade'})
    camera(studio,(0,0,.98),4.5,(-2.6,-4.5,2.4))
    configure(studio,'academy-studio-v4',1600,1100)
    detail = copy_view(source,'Academy Instruments v4',{'facade','roof'})
    camera(detail,(0,0,.85),3.35,(-1.8,-4.5,2.6))
    configure(detail,'academy-instruments-v4',1600,1100)
    for name,width,height,scale,target in [('wide',2000,1200,6.5,.98),('mobile',900,1600,6.6,.84)]:
        scene = copy_view(source,'Academy Hero '+name+' v4',{'facade','roof'})
        camera(scene,(0,0,target),scale,(-2.6,-4.5,2.6))
        configure(scene,'academy-hero-'+name+'-v4',width,height)
    bpy.context.window.scene=studio
    bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'academy-studio-v4.blend'))
    print('Saved Academy v4',len(source.objects))


if __name__=='__main__':
    build()
