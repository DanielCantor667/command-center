"""Independent Drokex concept, authored through Blender MCP; preserve v3."""
import math
import sys
from pathlib import Path
import bpy
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'blender'))
import generate_kliniu_showroom as kit
from refine_academy_v4 import shader, grain, camera, copy_view
from lib.engineering_city import srgb_hex, add_area_light

OUT = ROOT / 'blender/output/drokex-v4'


def tube(name, points, radius, material):
    vertices, faces = [], []
    count = len(points)
    for i, point in enumerate(points):
        tangent = (Vector(points[(i+1)%count])-Vector(points[(i-1)%count])).normalized()
        normal = tangent.cross(Vector((0,0,1)))
        if normal.length < .01:
            normal = tangent.cross(Vector((0,1,0)))
        normal.normalize()
        binormal = tangent.cross(normal).normalized()
        for j in range(8):
            offset = normal*math.cos(j*math.tau/8)+binormal*math.sin(j*math.tau/8)
            vertices.append(Vector(point)+offset*radius)
            faces.append((i*8+j, ((i+1)%count)*8+j,
                          ((i+1)%count)*8+(j+1)%8, i*8+(j+1)%8))
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name,mesh)
    kit.C.objects.link(obj)
    mesh.materials.append(kit.M[material])
    for polygon in mesh.polygons:
        polygon.use_smooth = True
    obj['layer'] = 'feature'
    return obj


def ring(name, radius, material, axis=0, z=.88, tube_radius=.003):
    points=[]
    for i in range(96):
        a=i*math.tau/96
        x,y=radius*math.cos(a),radius*math.sin(a)
        p=(x,y,z) if axis==0 else ((x,0,z+y) if axis==1 else (0,x,z+y))
        points.append((p[0],p[1]+.13,p[2]))
    return tube(name,points,tube_radius,material)


def configure(scene,name,width,height):
    scene.use_fake_user=True
    scene.cycles.samples=96
    scene.cycles.use_denoising=True
    scene.render.resolution_x=width
    scene.render.resolution_y=height
    scene.render.resolution_percentage=100
    scene.render.image_settings.file_format='PNG'
    scene.render.filepath=str(OUT/(name+'-'))


def build():
    OUT.mkdir(parents=True,exist_ok=True)
    source=bpy.data.scenes.get('Drokex Source v4')
    if source is None:
        with bpy.data.libraries.load(str(ROOT/'blender/output/brand-pavilions-v3/brand-pavilions-v3.blend'),link=False) as (_,loaded):
            loaded.scenes=['drokex Brand v3']
        source=loaded.scenes[0]
        source.name='Drokex Source v4'
    if source.get('refined_v4'):
        raise RuntimeError('Drokex v4 already refined; reopen an unmodified source to rebuild.')
    bpy.context.window.scene=source
    source.use_fake_user=True
    kit.C=next(c for c in source.collection.children if 'Objects' in c.name)
    materials={}
    for obj in list(source.objects):
        if obj.type in {'MESH','FONT'}:
            obj.data=obj.data.copy()
            for slot in obj.material_slots:
                if slot.material:
                    old=slot.material
                    if old not in materials:
                        materials[old]=old.copy()
                    slot.material=materials[old]
        if obj.name.startswith(('Globe meridian','Stone planter','Soil','Trunk','Twig','Foliage','Brick bed joint')):
            bpy.data.objects.remove(obj,do_unlink=True)
            continue
        if obj.name.startswith(('Corten sign','Drokex','Lime sign underline')):
            obj['layer']='facade'
        if obj.name.startswith('Ceiling luminaire'):
            obj['layer']='roof'
    for old,mat in materials.items():
        n=shader(mat)
        if 'ground' in old.name.lower():
            n.inputs['Base Color'].default_value=srgb_hex('#e5e8e6')
        if old.name.startswith('drokex_'):
            kit.M[old.name.split('drokex_',1)[1].split('.')[0]]=mat
    for name,color,rough,metal in [('alloy','#c3ccce',.28,.82),('graphite','#282e31',.34,.35),
                                  ('porcelain','#e9eeeb',.42,.0),('lime','#89df31',.32,.25),
                                  ('orange','#df752c',.42,.1)]:
        kit.material(name,color,rough,metal)
    grain(kit.M['alloy'],220,.07,.0002)
    grain(kit.M['graphite'],160,.08,.0003)
    for obj in source.objects:
        mat=None
        if obj.name.startswith(('Rear industrial wall','Brick side')):mat='porcelain'
        if obj.name.startswith(('Steel roof','Standing roof seam','Catalogue kiosk','Globe pedestal')):mat='graphite'
        if obj.name.startswith(('Trade globe','Diagonal brace','Steel post')):mat='alloy'
        if obj.name.startswith('Export sample crate'):mat='porcelain'
        if mat:
            obj.data.materials.clear()
            obj.data.materials.append(kit.M[mat])
    for axis in range(3):
        ring('Precision meridian',.304,'graphite',axis)
    for offset in [-.15,.15]:
        ring('Parallel ring',math.sqrt(.304**2-offset**2),'graphite',0,.88+offset,.002)
    ring('Mechanical gimbal',.345,'lime',1,tube_radius=.009)
    for x in [-.345,.345]:
        kit.cyl('Gimbal pivot',(x,.13,.88),.022,.024,'graphite','feature',True)
        kit.box('Gimbal arm',(x,.13,.63),(.018,.026,.50),'alloy','feature',.004)
    kit.cyl('Pedestal bearing',(0,.13,.566),.24,.028,'alloy','feature')
    kit.cyl('Pedestal foot',(0,.13,.205),.265,.04,'alloy','interior')
    for i in range(8):
        a=i*math.tau/8
        kit.cyl('Pedestal fixing',(.242*math.cos(a),.13+.242*math.sin(a),.229),.008,.008,'graphite','interior')
    for x in [-.6,.6]:
        kit.box('Kiosk foot',(x,.48,.185),(.34,.24,.03),'alloy','interior',.009)
        kit.box('Kiosk stem',(x,.49,.25),(.055,.07,.14),'alloy','interior',.004)
        kit.text('CATALOGO' if x<0 else 'DIRECTORIO',(x,.412,.945),.026,'graphite','interior')
        kit.cyl('Kiosk status',(x+.10,.414,.592),.006,.003,'orange','interior',True)
    # Samples are conceptual exhibits, not representations of actual shipments.
    for x in [-.66,-.52]:
        kit.box('Sample support',(x,-.32,.254),(.13,.18,.043),'alloy','interior',.003)
    for x,z in [(-.52,.34),(-.66,.34),(-.59,.48)]:
        kit.box('Sample lid seam',(x,-.32,z+.045),(.133,.183,.004),'graphite','interior',.001)
        kit.box('Sample label',(x+.032,-.414,z),(.032,.004,.035),'graphite','interior',.002)
    for x in [-.9,.9]:
        kit.box('Roof support',(x,-.66,.8),(.035,.035,1.25),'alloy','roof',.003)
    kit.text('DROKEX',(0,.586,1.29),.12,'graphite','structure')
    kit.box('Rear brand underline',(0,.582,1.255),(.44,.009,.007),'lime','structure',.001)
    source.world=source.world.copy()
    next(n for n in source.world.node_tree.nodes if n.type=='BACKGROUND').inputs['Strength'].default_value=.3
    for obj in source.objects:
        if obj.type=='LIGHT' and 'Key' in obj.name:
            obj.data.energy=550
            obj.data.size=3
    add_area_light('Globe softbox',(-1,-2,3),(0,.13,.8),(1,.98,.94),120,1.8,kit.C)
    kit.export_layers('drokex-interactive-v4.glb')
    for name,hide,w,h,scale,target,pos in [
        ('network',{'facade'},1600,1100,4.4,.9,(-2.7,-4.5,2.5)),
        ('detail',{'facade','roof'},1600,1100,3.5,.8,(-1.7,-4.5,2.6)),
        ('hero-wide',{'facade','roof'},2000,1200,6.5,.9,(-2.7,-4.5,2.6)),
        ('hero-mobile',{'facade','roof'},900,1600,6.6,.8,(-2.7,-4.5,2.6))]:
        scene=copy_view(source,'Drokex '+name+' v4',hide)
        camera(scene,(0,0,target),scale,pos)
        configure(scene,'drokex-'+name+'-v4',w,h)
    source['refined_v4']=True
    bpy.context.window.scene=bpy.data.scenes['Drokex network v4']
    bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'drokex-network-v4.blend'))
    print('Drokex v4 saved',len(source.objects))


if __name__=='__main__':
    build()
