"""First-party architectural pavilions. Execute in Blender through the MCP.

Build with build(); export_and_stage(); save the source before rendering.
Original scenes and objects are preserved in the current Blender file.
"""
import math
import random
import sys
from pathlib import Path

import bpy
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'blender'))
from lib.engineering_city import add_box, add_cylinder, add_area_light, add_camera

MODELS = ROOT / 'apps/web/public/models/workshop'
OUTPUT = ROOT / 'blender/output/realistic-workshop'
M = {}
DISTRICTS = {}
random.seed(24)


def material(name, color, rough=.5, metal=0, glass=False, grain=False):
    mat = bpy.data.materials.new('Workshop_' + name)
    mat.diffuse_color = (*color, 1)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    bsdf = nodes.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value = (*color, 1)
    bsdf.inputs['Roughness'].default_value = rough
    bsdf.inputs['Metallic'].default_value = metal
    if glass:
        bsdf.inputs['Transmission Weight'].default_value = 1
        bsdf.inputs['IOR'].default_value = 1.45
    if grain:
        noise = nodes.new('ShaderNodeTexNoise')
        noise.inputs['Scale'].default_value = 95
        bump = nodes.new('ShaderNodeBump')
        bump.inputs['Strength'].default_value = .18
        bump.inputs['Distance'].default_value = .008
        mat.node_tree.links.new(noise.outputs['Fac'], bump.inputs['Height'])
        mat.node_tree.links.new(bump.outputs['Normal'], bsdf.inputs['Normal'])
    M[name] = mat
    return mat


def box(name, xyz, size, mat, bevel=.008):
    return add_box(name, xyz, size, C, M[mat], bevel=bevel)


def cylinder(name, xyz, radius, height, mat):
    return add_cylinder(name, xyz, radius, height, C, M[mat], vertices=32, bevel=.006)


def rod(name, start, end, radius, mat):
    delta = Vector(end) - Vector(start)
    obj = cylinder(name, (Vector(start) + Vector(end)) / 2, radius, delta.length, mat)
    obj.rotation_euler = delta.to_track_quat('Z', 'Y').to_euler()
    return obj


def label(text, xyz, size, mat='ink'):
    curve = bpy.data.curves.new(text, 'FONT')
    curve.body, curve.size, curve.extrude = text, size, .002
    curve.align_x = 'CENTER'
    obj = bpy.data.objects.new(text, curve)
    C.objects.link(obj)
    obj.location = xyz
    obj.rotation_euler = (math.pi / 2, 0, 0)
    curve.materials.append(M[mat])
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.convert(target='MESH')


def plant(x, y, z, height=.38):
    cylinder('Stone planter', (x, y, z + .055), .10, .11, 'stone')
    cylinder('Soil', (x, y, z + .115), .087, .012, 'soil')
    rod('Trunk', (x, y, z+.1), (x+.02, y, z+height), .014, 'wood')
    for i in range(6):
        a=i*math.tau/6
        rod('Twig',(x,y,z+height-.09),(x+.10*math.cos(a),y+.10*math.sin(a),z+height+.035),.004,'wood')
    vertices=[];faces=[]
    for i in range(140):
        angle=random.random()*math.tau
        radius=math.sqrt(random.random())*.14
        center=Vector((x+math.cos(angle)*radius,y+math.sin(angle)*radius,z+height+random.uniform(-.075,.09)))
        axis=Vector((math.cos(angle),math.sin(angle),random.uniform(-.8,.8))).normalized()
        side=axis.cross(Vector((0,0,1))).normalized()
        length=random.uniform(.022,.040);width=length*.45
        offset=len(vertices)
        vertices.extend([center,center+axis*length,center+axis*length*.45+side*width,
                         center-axis*length*.45+side*width,center-axis*length,
                         center-axis*length*.45-side*width,center+axis*length*.45-side*width])
        faces.extend([(offset,offset+j,offset+(j%6)+1) for j in range(1,7)])
    mesh=bpy.data.meshes.new('Individual leaves');mesh.from_pydata(vertices,[],faces);mesh.update()
    obj=bpy.data.objects.new('Foliage',mesh);C.objects.link(obj)
    mesh.materials.append(M['leaf']);mesh.materials.append(M['leaflight'])
    for poly in mesh.polygons: poly.material_index=(poly.index//6)%3==0


def base():
    box('Foundation', (0, 0, .08), (2.04, 1.76, .16), 'stone', .025)
    for i in range(5):
        box('Paving joint', (-.8+i*.4, -.78, .163), (.006, .18, .003), 'grout', 0)


def furniture(x, y, z):
    box('Desk', (x,y,z+.18), (.31,.18,.035), 'wood')
    for dx in [-.12,.12]: box('Desk leg',(x+dx,y,z+.09),(.018,.12,.18),'metal')
    box('Monitor',(x,y+.045,z+.28),(.16,.018,.12),'ink',.006)
    box('Screen',(x,y+.034,z+.28),(.145,.002,.10),'screen',0)
    box('Chair seat',(x,y-.17,z+.12),(.14,.13,.025),'ink')
    box('Chair back',(x,y-.22,z+.22),(.14,.025,.18),'ink')


def interior_lights():
    for x in [-.52,.52]:
        box('Ceiling luminaire',(x,.08,1.34),(.30,.12,.015),'warm')
        add_area_light('Interior warm light',(x,-.05,1.30),(x,-.15,.20),(1,.67,.36),12,.35,C)


def garden_roof(z):
    for y in [-.54,.54]:
        box('Roof planting bed',(0,y,z), (1.65,.23,.05),'soil')
        for i in range(8): plant(-.72+i*.205,y,z+.02,.12)


def kliniu():
    base()
    for z in [.2,.82,1.44]:
        box('Floor plate',(0,0,z),(1.86,1.48,.065),'stone')
    for z in [.53,1.14]:
        box('Front glass',(0,-.704,z),(1.78,.015,.55),'glass')
        box('Side glass',(.884,0,z),(.015,1.40,.55),'glass')
        box('Rear wall',(0,.70,z),(1.8,.04,.55),'plaster')
        for x in [-.88,-.59,-.30,0,.30,.59,.88]:
            box('Facade mullion',(x,-.72,z),(.023,.035,.6),'metal',.003)
        for y in [-.7,-.35,0,.35,.7]:
            box('Side mullion',(.90,y,z),(.025,.025,.6),'metal',.003)
    for floor in [.24,.85]:
        for x in [-.55,0,.55]: furniture(x,.15,floor)
    box('Entry canopy',(0,-.82,.74),(.74,.30,.035),'metal')
    for x in [-.35,.35]: box('Door frame',(x,-.74,.45),(.024,.025,.5),'metal')
    box('Roof garden',(0,0,1.49),(1.74,1.35,.035),'soil')
    for x in [-.65,0,.65]: plant(x,.40,1.5,.19)
    garden_roof(1.50)
    interior_lights()
    plant(-.88,-.62,.17)
    label('kliniu',(0,-.746,1.03),.19,'white')


def academy():
    base()
    box('Acoustic back',(0,.64,.86),(1.85,.12,1.4),'wood')
    box('Roof',(0,0,1.6),(1.98,1.52,.09),'stone')
    box('Name wall',(.66,-.15,.87),(.46,1.24,1.43),'plaster')
    box('Front glazing',(-.30,-.69,.89),(1.23,.014,1.32),'glass')
    for x in [-.88,-.60,-.32,0,.29]: box('Timber fin',(x,-.735,.9),(.035,.15,1.39),'wood')
    for i in range(7): box('Side acoustic fin',(-.90,-.6+i*.19,.9),(.09,.04,1.4),'wood')
    # Curved grand-piano body, keyboard and individual keys.
    points=[(-.35,-.23),(.26,-.23),(.30,.0),(.23,.27),(.08,.34),(-.19,.29),(-.35,.1)]
    verts=[(x-.20,y,z) for z in [.64,.72] for x,y in points]
    n=len(points)
    faces=[tuple(range(n-1,-1,-1)),tuple(range(n,n*2))]+[(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)]
    mesh=bpy.data.meshes.new('Grand piano body'); mesh.from_pydata(verts,[],faces); mesh.update()
    piano=bpy.data.objects.new('Grand piano',mesh); C.objects.link(piano); mesh.materials.append(M['piano'])
    mod=piano.modifiers.new('Rounded rim','BEVEL'); mod.width=.035; mod.segments=3
    for x,y in [(-.5,-.15),(.04,-.15),(-.1,.23)]: box('Piano leg',(x,y,.43),(.035,.035,.44),'piano')
    lid=box('Raised piano lid',(-.20,.03,.94),(.62,.54,.025),'piano',.02)
    lid.rotation_euler[1]=-.32
    rod('Lid prop',(-.45,0,.72),(-.45,0,1.02),.008,'metal')
    for i in range(21):
        box('Ivory key',(-.49+i*.026,-.285,.69),(.024,.10,.018),'white',.001)
        if i%7 not in [2,6]: box('Black key',(-.478+i*.026,-.25,.706),(.013,.06,.016),'ink',.001)
    box('Piano bench',(-.22,-.48,.40),(.38,.17,.045),'piano')
    label('4ustudio',(.65,-.785,1.19),.115)
    for x in [-.75,.75]: plant(x,.57,1.66,.20)
    interior_lights()


def arch(cx):
    radius=.225; outer=.27; spring=.84
    box('Arch pier',(cx-outer+.022,-.69,.53),(.044,.10,.74),'plaster')
    box('Arch pier',(cx+outer-.022,-.69,.53),(.044,.10,.74),'plaster')
    vertices=[]
    for y in [-.74,-.64]:
        for r in [radius,outer]:
            vertices.extend([(cx+math.cos(i*math.pi/24)*r,y,spring+math.sin(i*math.pi/24)*r) for i in range(25)])
    faces=[]
    for i in range(24):
        faces.extend([(i,i+1,i+26,i+25),(i+50,i+75,i+76,i+51),(i,i+50,i+51,i+1),(i+25,i+26,i+76,i+75)])
    mesh=bpy.data.meshes.new('Arch');mesh.from_pydata(vertices,[],faces);mesh.update()
    obj=bpy.data.objects.new('Stone arch',mesh);C.objects.link(obj);mesh.materials.append(M['plaster'])
    box('Arched opening glass',(cx,-.68,.60),(.445,.012,.87),'glass')
    box('Brass stile',(cx,-.75,.62),(.012,.018,.90),'brass',.002)


def lorigine():
    base()
    box('Rear gallery',(0,.64,.76),(1.85,.10,1.18),'plaster')
    box('Side wall',(-.90,0,.76),(.08,1.4,1.18),'plaster')
    box('Roof',(0,0,1.39),(1.98,1.52,.10),'plaster')
    box('Front fascia',(0,-.69,1.24),(1.86,.12,.23),'plaster')
    for x in [-.60,0,.60]:
        arch(x)
        cylinder('Display pedestal',(x,-.1,.37),.13,.40,'stone')
        cylinder('Amber bottle',(x,-.1,.65),.045,.17,'amber')
        cylinder('Bottle cap',(x,-.1,.75),.046,.03,'brass')
        box('Bottle label',(x,-.146,.65),(.057,.005,.07),'white',.002)
    label("L'Origine",(0,-.765,1.20),.15)
    plant(.84,.42,.16,.45)
    interior_lights()


def drokex():
    base()
    box('Rear industrial wall',(0,.64,.77),(1.9,.08,1.22),'ink')
    box('Steel roof',(0,0,1.44),(1.99,1.55,.065),'metal')
    for i in range(14): box('Standing roof seam',(-.90+i*.14,0,1.483),(.012,1.52,.017),'metal',.002)
    box('Brick side',(.90,0,.79),(.10,1.44,1.23),'corten')
    for j in range(12):
        box('Brick bed joint',(.955,0,.23+j*.10),(.002,1.4,.005),'grout',0)
    box('Curtain wall',(0,-.705,.72),(1.79,.015,1.05),'glass')
    for x in [-.9,-.45,0,.45,.9]: box('Steel post',(x,-.74,.78),(.035,.05,1.23),'metal')
    box('Transom',(0,-.74,.72),(1.85,.035,.025),'metal')
    box('Corten sign',(.34,-.77,1.19),(1.10,.10,.36),'corten')
    label('Drokex',(.34,-.828,1.16),.16,'white')
    for x in [-.55,0,.55]: furniture(x,.20,.2)
    for x in [-.92,.92]:
        rod('Diagonal brace',(x,-.64,.23),(x,.62,1.36),.023,'corten')
    plant(-.83,-.55,.17,.40)
    interior_lights()


def build():
    global C, SCENE
    SCENE=bpy.data.scenes.new('Realistic Workshop')
    bpy.context.window.scene=SCENE
    for args in [
        ('stone',(.54,.57,.56),.72,0,False,True),
        ('plaster',(.78,.77,.71),.8,0,False,True),
        ('metal',(.13,.17,.18),.28,.85),('brass',(.47,.32,.13),.28,.75),
        ('wood',(.30,.18,.085),.48,0,False,True),('ink',(.028,.033,.035),.45),
        ('white',(.87,.89,.86),.35),('glass',(.95,.98,.96),.018,0,True),
        ('corten',(.27,.075,.032),.66,0,False,True),('grout',(.15,.16,.15),.9),
        ('piano',(.012,.014,.015),.16),('amber',(.20,.065,.012),.20),
        ('soil',(.055,.045,.026),1),('leaf',(.07,.12,.036),.85),
        ('leaflight',(.17,.23,.065),.85),('screen',(.13,.28,.31),.25),
        ('aluminum',(.55,.61,.65),.3,.9),('floor',(.68,.71,.73),.8),
        ('warm',(1,.62,.28),.3)]: material(*args)
    light_shader=M['warm'].node_tree.nodes.get('Principled BSDF')
    light_shader.inputs['Emission Color'].default_value=(1,.60,.25,1)
    light_shader.inputs['Emission Strength'].default_value=3
    for name,fn in [('kliniu',kliniu),('academy',academy),('lorigine',lorigine),('drokex',drokex)]:
        C=bpy.data.collections.new('Pavilion_'+name);SCENE.collection.children.link(C)
        fn(); DISTRICTS[name]=C
    print('Built pavilions:', {k:len(v.objects) for k,v in DISTRICTS.items()})


def export_and_stage():
    global C
    MODELS.mkdir(parents=True,exist_ok=True);OUTPUT.mkdir(parents=True,exist_ok=True)
    positions={'kliniu':(-2.0,1.65),'academy':(2.0,1.65),'lorigine':(-2.0,-1.65),'drokex':(2.0,-1.65)}
    for name,col in DISTRICTS.items():
        export_pavilion(name, col)
        x,y=positions[name]
        for obj in col.objects: obj.location.x+=x;obj.location.y+=y
    C=bpy.data.collections.new('Studio');SCENE.collection.children.link(C)
    cylinder('Machined aluminum base',(0,0,-.18),4.35,.34,'aluminum')
    cylinder('Stone top',(0,0,.005),4.31,.035,'stone')
    for i in range(12):
        a=i*math.tau/12
        plant(3.95*math.cos(a),3.95*math.sin(a),.03,.42)
    for i in range(48):
        a=i*math.tau/48
        cylinder('Perimeter fastener',(4.22*math.cos(a),4.22*math.sin(a),.025),.019,.009,'metal')
    cylinder('Central pedestal',(0,0,.20),.62,.40,'aluminum')
    for angle in [-.65,.65]:
        bpy.ops.mesh.primitive_torus_add(major_radius=.45,minor_radius=.055,major_segments=64,minor_segments=12,location=(0,0,.95),rotation=(math.pi/2,angle,0))
        obj=bpy.context.object;obj.data.materials.append(M['aluminum'])
        for face in obj.data.polygons:face.use_smooth=True
    box('Studio floor',(0,0,-.39),(200,200,.05),'floor')
    SCENE.camera=add_camera('Workshop Camera',(10,-14,11),(0,0,.30),52,C,camera_type='ORTHO',ortho_scale=11.4)
    add_area_light('Large softbox',(-3,-4,9),(0,0,0),(1,.92,.82),1700,7,C)
    add_area_light('Cool fill',(5,1,6),(0,0,0),(.80,.89,1),1100,5,C)
    add_area_light('Rim',(-3,6,5),(0,0,0),(1,1,1),1400,4,C)
    world=bpy.data.worlds.new('Workshop Studio');world.use_nodes=True
    world.node_tree.nodes['Background'].inputs[0].default_value=(.68,.74,.82,1)
    world.node_tree.nodes['Background'].inputs[1].default_value=.35
    SCENE.world=world;SCENE.render.engine='CYCLES';SCENE.cycles.samples=64
    SCENE.view_settings.exposure=-.45
    SCENE.cycles.use_denoising=True
    SCENE.render.resolution_x=1600;SCENE.render.resolution_y=1200;SCENE.render.resolution_percentage=100
    SCENE.render.image_settings.file_format='PNG'
    SCENE.render.filepath=str(OUTPUT/'workshop-cycles-v1.png')
    export_pavilion('stage', C)
    bpy.ops.wm.save_as_mainfile(filepath=str(OUTPUT/'workshop-realistic-v1.blend'))
    print('Exported GLBs and saved editable source')


def export_pavilion(name, col):
    # Join export copies to batch static geometry by material, retaining editable originals.
    bpy.ops.object.select_all(action='DESELECT')
    copies=[]
    for original in col.objects:
        if original.type != 'MESH' or original.name.startswith('Studio floor'): continue
        obj=original.copy();obj.data=original.data.copy()
        SCENE.collection.objects.link(obj);obj.select_set(True);copies.append(obj)
    bpy.context.view_layer.objects.active=copies[0]
    for obj in copies:
        bpy.context.view_layer.objects.active=obj
        for modifier in list(obj.modifiers): bpy.ops.object.modifier_apply(modifier=modifier.name)
    bpy.context.view_layer.objects.active=copies[0]
    bpy.ops.object.join()
    joined=bpy.context.object;joined.name='Pavilion_'+name+'_Web'
    try:
        bpy.ops.export_scene.gltf(
            filepath=str(MODELS/(name+'-realistic-v1.glb')), export_format='GLB',
            use_selection=True, use_active_scene=True, export_apply=True,
            export_cameras=False, export_lights=False, export_animations=False,
        )
    finally:
        bpy.data.objects.remove(joined, do_unlink=True)


def render_details():
    camera=SCENE.camera
    old_matrix=camera.matrix_world.copy();old_scale=camera.data.ortho_scale
    old_path=SCENE.render.filepath
    old_size=(SCENE.render.resolution_x,SCENE.render.resolution_y)
    visibility={obj:obj.hide_render for obj in SCENE.objects}
    collection_visibility={col:col.hide_render for col in DISTRICTS.values()}
    try:
        SCENE.render.resolution_x=1200;SCENE.render.resolution_y=1000
        for name,col in DISTRICTS.items():
            bounds=[obj.matrix_world @ Vector(corner) for obj in col.objects if obj.type=='MESH' for corner in obj.bound_box]
            low=Vector(tuple(min(p[i] for p in bounds) for i in range(3)))
            high=Vector(tuple(max(p[i] for p in bounds) for i in range(3)))
            center=(low+high)/2
            for other in DISTRICTS.values(): other.hide_render=other!=col
            for obj in SCENE.objects:
                if obj.type=='MESH':
                    obj.hide_render=obj not in list(col.objects) and not obj.name.startswith(('Machined aluminum base','Stone top','Studio floor'))
            camera.location=center+Vector((2.8,-4.5,2.4))
            camera.rotation_euler=(center-camera.location).to_track_quat('-Z','Y').to_euler()
            inverse_rotation=camera.rotation_euler.to_quaternion().inverted()
            projected=[inverse_rotation @ (p-center) for p in bounds]
            width=max(p.x for p in projected)-min(p.x for p in projected)
            height=max(p.y for p in projected)-min(p.y for p in projected)
            camera.data.ortho_scale=max(width,height*1.2)*1.22
            SCENE.render.filepath=str(OUTPUT/(name+'-cycles-final.png'))
            bpy.ops.render.render(write_still=True)
    finally:
        for col,hidden in collection_visibility.items(): col.hide_render=hidden
        for obj,hidden in visibility.items(): obj.hide_render=hidden
        camera.matrix_world=old_matrix;camera.data.ortho_scale=old_scale
        SCENE.render.resolution_x,SCENE.render.resolution_y=old_size
        SCENE.render.filepath=old_path


def render_final():
    SCENE.world.node_tree.nodes['Background'].inputs[1].default_value=.18
    for obj in SCENE.objects:
        if obj.type!='LIGHT': continue
        if obj.name.startswith('Large softbox'): obj.data.energy=1500;obj.data.size=4
        elif obj.name.startswith('Cool fill'): obj.data.energy=650
        elif obj.name.startswith('Rim'): obj.data.energy=900
    SCENE.cycles.samples=96
    SCENE.render.filepath=str(OUTPUT/'workshop-cycles-final.png')
    bpy.ops.wm.save_as_mainfile(filepath=str(OUTPUT/'workshop-realistic-final.blend'))
    bpy.ops.render.render(write_still=True)
    render_details()
