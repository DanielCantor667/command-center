"""Brand-specific refinements on independent copies of the original pavilions."""
import math
import sys
from pathlib import Path

import bpy
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT/'blender'))
import generate_kliniu_showroom as kit
from export_interactive_workshop import layer

OUT = ROOT/'blender/output/brand-pavilions-v3'
POSITIONS = {'academy':(2,1.65),'lorigine':(-2,-1.65),'drokex':(2,-1.65)}


def palette(project):
    colors = {'academy':'#ff8000','lorigine':'#826a47','drokex':'#89df31'}
    for args in [
        ('white','#f4f5f2',.35),('stone','#e1e2dc',.6),('dark','#202324',.35),
        ('accent',colors[project],.3),('steel','#afb7ba',.3,.85),
        ('glass','#f6ffff',.015,0,1),('amber','#743117',.2),
        ('warm','#fff2dd',.35),('ground','#e5e9e9',.7),('gold','#bba273',.27,.7)]:
        kit.material(*args)
        kit.M[args[0]].name = project+'_'+args[0]


def rod(name,a,b,radius,mat='steel',group='interior'):
    vector=Vector(b)-Vector(a)
    obj=kit.cyl(name,(Vector(a)+Vector(b))/2,radius,vector.length,mat,group)
    obj.rotation_euler=vector.to_track_quat('Z','Y').to_euler()
    return obj


def sphere(name,p,size,mat,group='interior'):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=32,ring_count=16,location=p)
    obj=bpy.context.object
    obj.name=name
    obj.scale=size
    for owner in list(obj.users_collection):owner.objects.unlink(obj)
    kit.C.objects.link(obj)
    obj.data.materials.append(kit.M[mat])
    for face in obj.data.polygons:face.use_smooth=True
    obj['layer']=group
    return obj


def bottle(x,y,z,h=.30,r=.065):
    kit.cyl('Amber product body',(x,y,z+h*.42),r,h*.84,'amber','feature')
    sphere('Rounded bottle shoulder',(x,y,z+h*.82),(r,r,h*.12),'amber','feature')
    kit.cyl('Pump collar',(x,y,z+h*.94),r*.49,h*.14,'dark','feature')
    kit.cyl('Pump stem',(x,y,z+h*1.06),r*.15,h*.12,'dark','feature')
    kit.box('Pump head',(x+r*.26,y,z+h*1.13),(r*1.5,r*.38,h*.035),'dark','feature',.004)
    kit.text("L'ORIGINE",(x,y-r-.001,z+h*.59),r*.31,'white','feature')
    for i in range(4):
        kit.box('Fine label rule',(x,y-r-.002,z+h*(.24+i*.038)),(r*.85,.001,.002),'gold','feature',0)


def lorigine():
    kit.text("L'ORIGINE",(0,-.768,1.21),.137,'dark')
    for x in [-.60,0,.60]:bottle(x,-.1,.57,h=.28 if x else .34)
    kit.box('Rear display niche',(0,.568,.82),(1.55,.04,.62),'stone','interior',.016)
    for x in [-.58,0,.58]:
        kit.box('Floating stone shelf',(x,.43,.65),(.43,.25,.026),'white','interior')
        kit.box('Niche warm strip',(x,.40,1.12),(.39,.018,.008),'warm','interior',.002)
        bottle(x,.43,.67,h=.21,r=.045)
    for x in [-.80,.80]:
        kit.box('Stone facade seam',(x,-.749,1.25),(.002,.003,.17),'accent','structure',0)
    kit.text('SOINS CAPILLAIRES',(0,.53,1.16),.04,'dark','interior')


def guitar(x,y,z):
    # Overlapping lobes give the body a recognisable waist at miniature scale.
    sphere('Guitar lower bout',(x,y,z+.13),(.105,.032,.135),'accent')
    sphere('Guitar upper bout',(x,y,z+.27),(.079,.028,.09),'accent')
    kit.cyl('Guitar sound hole',(x,y-.034,z+.235),.031,.003,'dark',front=True)
    kit.box('Guitar neck',(x,y-.008,z+.44),(.033,.025,.29),'dark','interior',.003)
    kit.box('Guitar headstock',(x,y,z+.62),(.053,.026,.083),'accent','interior',.008)
    kit.box('Guitar bridge',(x,y-.035,z+.105),(.07,.012,.018),'dark','interior',.002)
    for i in range(6):
        rod('Guitar string',(x-.012+i*.0048,y-.043,z+.11),(x-.012+i*.0048,y-.025,z+.64),.0007)
    for i in range(10):
        kit.box('Guitar fret',(x,y-.024,z+.33+i*.024),(.033,.002,.001),'steel','interior',0)
    for dx in [-.026,.026]:
        for dz in [.59,.62,.65]:kit.cyl('Tuning peg',(x+dx,y,z+dz),.005,.018,'steel')
    rod('Guitar stand',(x,y+.04,z+.02),(x,y+.04,z+.38),.007,'dark')


def academy():
    for x in [-.37,-.07]:
        for y in [-.54,-.42]:
            kit.box('Piano bench leg',(x,y,.28),(.022,.022,.20),'dark','interior',.002)
    kit.text('4U STUDIO',(.64,-.79,1.24),.105,'white')
    kit.text('ACADEMY',(.64,-.79,1.15),.05,'accent')
    kit.box('Orange fascia',(0,-.78,1.56),(1.83,.018,.016),'accent','roof',.003)
    guitar(.47,.13,.22)
    rod('Mic stand',(.18,-.43,.22),(.18,-.43,.99),.006,'dark')
    rod('Mic boom',(.18,-.43,.98),(-.04,-.44,1.06),.005)
    sphere('Microphone grille',(-.055,-.44,1.065),(.03,.018,.018),'steel')
    for angle in [0,2.094,4.188]:
        rod('Mic tripod',(.18,-.43,.25),(.18+math.cos(angle)*.12,-.43+math.sin(angle)*.12,.21),.005,'dark')
    for x in [-.64,-.29,.06]:
        kit.box('Acoustic absorber',(x,.55,1.10),(.24,.055,.38),'dark','interior',.012)
    for z in [.95,1.17]:
        kit.box('Studio light strip',(-.87,.10,z),(.013,.90,.009),'warm','interior',.002)
    kit.cyl('Snare shell',(.5,.40,.58),.12,.10,'steel')
    kit.cyl('Snare head',(.5,.40,.634),.12,.005,'white')
    rod('Snare stand',(.5,.40,.23),(.5,.40,.55),.01)
    kit.cyl('Cymbal',(.73,.40,.91),.135,.008,'gold')
    rod('Cymbal stand',(.73,.40,.22),(.73,.40,.91),.006)


def drokex():
    kit.text('Drokex',(.34,-.829,1.16),.16,'white','feature')
    kit.box('Lime sign underline',(.34,-.832,1.10),(1.0,.014,.014),'accent','feature',.003)
    kit.cyl('Globe pedestal',(0,.13,.38),.23,.36,'dark')
    sphere('Trade globe',(0,.13,.88),(.30,.30,.30),'dark','feature')
    # Latitude/longitude meridians reference the site's interactive world globe.
    for axis in range(3):
        for j in range(48):
            a=j*math.tau/48;b=(j+1)*math.tau/48
            p=[.304*math.cos(a),.304*math.sin(a),0]
            q=[.304*math.cos(b),.304*math.sin(b),0]
            if axis==1:p=[p[0],0,p[1]];q=[q[0],0,q[1]]
            if axis==2:p=[0,p[0],p[1]];q=[0,q[0],q[1]]
            rod('Globe meridian',(p[0],p[1]+.13,p[2]+.88),(q[0],q[1]+.13,q[2]+.88),.003,'accent','feature')
    for x in [-.60,.60]:
        kit.box('Catalogue kiosk',(x,.48,.65),(.30,.10,.65),'dark','interior',.025)
        kit.box('Catalogue display',(x,.423,.75),(.24,.008,.35),'white','interior',.01)
        for z in [.64,.75,.86]:
            kit.box('Catalogue tile',(x-.045,.416,z),(.10,.002,.062),'accent','interior',.004)
            kit.box('Catalogue line',(x+.062,.416,z),(.075,.002,.005),'dark','interior',0)
    for i in range(4):kit.box('Shipping pallet slat',(-.57+i*.075,-.34,.22),(.059,.34,.026),'stone','interior',.002)
    for x,z in [(-.52,.34),(-.66,.34),(-.59,.48)]:
        kit.box('Export sample crate',(x,-.32,z),(.13,.18,.13),'white','interior',.007)
        kit.box('Crate seal',(x,-.415,z),(.016,.002,.12),'accent','interior',0)
    kit.box('Roof lime edge',(0,-.76,1.42),(1.80,.02,.025),'accent','roof',.004)


def build_all():
    OUT.mkdir(parents=True,exist_ok=True)
    with bpy.data.libraries.load(str(ROOT/'blender/output/realistic-workshop/workshop-realistic-final.blend'),link=False) as (source,target):
        target.scenes=['Realistic Workshop.002']
    reference=target.scenes[0]
    results={}
    for project in ['lorigine','academy','drokex']:
        scene=kit.setup_scene(project+' Brand v3')
        palette(project)
        source=next(c for c in reference.collection.children if c.name.startswith('Pavilion_'+project))
        x,y=POSITIONS[project]
        for original in source.objects:
            if original.type!='MESH':continue
            name=original.name
            if project=='lorigine' and name.startswith(('Amber bottle','Bottle cap','Bottle label',"L'Origine")):continue
            if project=='academy' and name.startswith('4ustudio'):continue
            if project=='drokex' and name.startswith(('Drokex','Desk','Monitor','Screen','Chair')):continue
            obj=original.copy();obj.data=original.data.copy()
            kit.C.objects.link(obj)
            obj.location.x-=x;obj.location.y-=y
            obj['layer']=layer(original,project)
            replacement=None
            if 'glass' in name.lower() or 'glazing' in name.lower():replacement='glass'
            if project=='academy' and name.startswith(('Name wall','Roof')):replacement='dark'
            if project=='drokex' and name.startswith(('Brick','Corten','Steel roof','Standing','Mortar')):replacement='dark'
            if replacement:
                obj.data.materials.clear();obj.data.materials.append(kit.M[replacement])
        globals()[project]()
        kit.export_layers(project+'-interactive-v3.glb')
        kit.studio(scene,(0,0,.90 if project=='academy' else .80),(3,-4,2.8),3.65 if project=='academy' else 3.3)
        scene.render.filepath=str(OUT/(project+'-final-'))
        results[project]=scene.name
    bpy.context.window.scene=bpy.data.scenes[results['lorigine']]
    bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'brand-pavilions-v3.blend'))
    return results


def compose_overview(scenes):
    with bpy.data.libraries.load(str(ROOT/'blender/output/kliniu-showroom/workshop-kliniu-v3.blend'),link=False) as (source,target):
        target.scenes=['Workshop Kliniu v3']
    overview=target.scenes[0]
    overview.name='All Brands v3'
    for project,name in scenes.items():
        old=next(c for c in overview.collection.children if c.name.startswith('Pavilion_'+project))
        overview.collection.children.unlink(old)
        collection=bpy.data.collections.new(project+' v3 overview')
        overview.collection.children.link(collection)
        x,y=POSITIONS[project]
        for original in bpy.data.scenes[name].objects:
            if original.type not in {'MESH','FONT'} or original.get('studio'):continue
            obj=original.copy()
            collection.objects.link(obj)
            obj.location.x+=x;obj.location.y+=y
    overview.render.filepath=str(OUT/'all-brands-final-')
    bpy.context.window.scene=overview
    bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'brand-pavilions-v3.blend'))
    return overview.name


def interior_study(project, source_name):
    source=bpy.data.scenes[source_name]
    scene=bpy.data.scenes.new(project+' Interior v3')
    scene.world=source.world
    for original in source.objects:
        if original.get('layer') in {'roof','facade'}:continue
        if original.name.startswith(('Name wall','Corten sign','Lime sign underline','Diagonal brace','Ceiling luminaire','Studio light strip')):continue
        if original.type=='FONT' and original.data.body in {'Drokex','4U STUDIO','ACADEMY'}:continue
        obj=original.copy()
        scene.collection.objects.link(obj)
        if obj.type=='CAMERA':
            obj.data=original.data.copy()
            obj.data.ortho_scale=2.8
            obj.rotation_euler=(Vector((0,0,.65))-obj.location).to_track_quat('-Z','Y').to_euler()
            scene.camera=obj
    try:scene.render.engine='CYCLES'
    except TypeError:pass
    scene.cycles.samples=64
    scene.cycles.use_denoising=True
    scene.render.resolution_x=1400
    scene.render.resolution_y=1200
    scene.render.resolution_percentage=100
    scene.render.filepath=str(OUT/(project+'-interior-'))
    return scene.name


if __name__=='__main__':
    scenes=build_all()
    for project in ['academy','drokex']:interior_study(project,scenes[project])
    print(scenes,compose_overview(scenes))
