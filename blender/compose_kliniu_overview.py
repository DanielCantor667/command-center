"""Update a separately loaded overview, preserving the original workshop file."""
from pathlib import Path
import bpy

ROOT = Path(__file__).resolve().parents[1]


def compose(showroom_name):
    showroom = bpy.data.scenes[showroom_name]
    with bpy.data.libraries.load(str(ROOT/'blender/output/realistic-workshop/workshop-realistic-final.blend'),link=False) as (source,target):
        target.scenes = ['Realistic Workshop.002']
    overview = target.scenes[0]
    overview.name = 'Workshop Kliniu v3'
    old = next(c for c in overview.collection.children if c.name.startswith('Pavilion_kliniu'))
    overview.collection.children.unlink(old)
    collection = bpy.data.collections.new('Kliniu showroom overview')
    overview.collection.children.link(collection)
    for original in showroom.objects:
        if original.type not in {'MESH','FONT'} or original.get('studio'):
            continue
        obj = original.copy()
        collection.objects.link(obj)
        obj.location.x -= 2
        obj.location.y += 1.65
    overview.render.resolution_x = 1600
    overview.render.resolution_y = 1100
    overview.render.resolution_percentage = 100
    overview.cycles.samples = 64
    overview.cycles.use_denoising = True
    overview.render.filepath = str(ROOT/'blender/output/kliniu-showroom/workshop-kliniu-v3.png')
    bpy.context.window.scene = overview
    bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'blender/output/kliniu-showroom/workshop-kliniu-v3.blend'))
    return overview.name
