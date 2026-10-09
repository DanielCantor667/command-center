"""Export named, material-batched animation layers without changing originals."""
import bpy
from mathutils import Vector
from pathlib import Path

OUTPUT=Path(__file__).resolve().parents[1]/'apps/web/public/models/workshop'

def layer(obj, name):
    label=obj.name
    if (name=='kliniu' and label.startswith('Entry canopy') or
        name=='academy' and label.startswith(('Ivory key','Black key')) or
        name=='lorigine' and label.startswith(('Display pedestal','Amber bottle','Bottle cap','Bottle label')) or
        name=='drokex' and label.startswith(('Corten sign','Drokex'))): return 'feature'
    low_z=min((obj.matrix_world @ Vector(point)).z for point in obj.bound_box)
    if label.startswith(('Roof','Steel roof','Standing roof')) or low_z>1.40: return 'roof'
    if label.startswith(('Front glass','Side glass','Facade','Side mullion','Door frame','Front glazing','Timber fin','Side acoustic fin','Arch','Stone arch','Brass stile','Curtain wall','Steel post','Transom')): return 'facade'
    if label.startswith(('Desk','Monitor','Screen','Chair','Grand piano','Piano','Raised piano','Lid prop','Ceiling luminaire')): return 'interior'
    return 'structure'

def export_all():
    positions={'kliniu':(-2,1.65),'academy':(2,1.65),'lorigine':(-2,-1.65),'drokex':(2,-1.65)}
    for name,(x,y) in positions.items():
        collection=next(c for c in bpy.context.scene.collection.children if c.name.startswith('Pavilion_'+name))
        groups={key:[] for key in ['roof','facade','interior','structure','feature']}
        temporary=[]
        try:
            for original in collection.objects:
                if original.type!='MESH': continue
                obj=original.copy();obj.data=original.data.copy()
                bpy.context.scene.collection.objects.link(obj)
                obj.location.x-=x;obj.location.y-=y
                groups[layer(obj,name)].append(obj);temporary.append(obj)
            joined=[]
            for key,objects in groups.items():
                if not objects: continue
                bpy.ops.object.select_all(action='DESELECT')
                for obj in objects:
                    obj.select_set(True);bpy.context.view_layer.objects.active=obj
                    for modifier in list(obj.modifiers): bpy.ops.object.modifier_apply(modifier=modifier.name)
                bpy.context.view_layer.objects.active=objects[0]
                bpy.ops.object.join()
                obj=bpy.context.object;obj.name=key;joined.append(obj)
            bpy.ops.object.select_all(action='DESELECT')
            for obj in joined:obj.select_set(True)
            bpy.ops.export_scene.gltf(filepath=str(OUTPUT/(name+'-interactive-v2.glb')),export_format='GLB',use_selection=True,use_active_scene=True,export_apply=True,export_cameras=False,export_lights=False,export_animations=False)
        finally:
            for obj in temporary:
                try:bpy.data.objects.remove(obj,do_unlink=True)
                except ReferenceError:pass

if __name__=='__main__':export_all()
