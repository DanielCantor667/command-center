"""Headless regression test for multi-mesh GLB instance transforms."""

import os
import sys

import bpy

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from lib.importer import import_scene_objects  # noqa: E402


def main():
    args = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    if len(args) != 1:
        raise SystemExit("usage: test_importer.py -- <assets-dir>")

    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    scene = {
        "objects": [{
            "id": "desk-instance",
            "asset": "desk",
            "transform": {
                "position": {"x": 4, "y": 0, "z": -3},
                "rotation": {"x": 0, "y": 0.5, "z": 0},
                "scale": 1.5,
            },
        }],
    }
    roots = import_scene_objects(scene, args[0])
    root = roots[0]
    children = list(root.children_recursive)

    def belongs_to_root(child):
        parent = child.parent
        while parent is not None:
            if parent == root:
                return True
            parent = parent.parent
        return False

    assert root.type == "EMPTY"
    assert len(children) >= 5, f"expected a compound desk, got {len(children)} child objects"
    assert all(belongs_to_root(child) for child in children)
    assert tuple(round(value, 3) for value in root.location) == (4.0, 3.0, 0.0)
    assert tuple(round(value, 3) for value in root.scale) == (1.5, 1.5, 1.5)
    print(f"compound asset transform verified ({len(children)} child objects)")


if __name__ == "__main__":
    main()
