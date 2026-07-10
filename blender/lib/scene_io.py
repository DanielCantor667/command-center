"""Loads and validates scene JSON produced by @command-center/ai-renderer."""

import json

REQUIRED_SCENE_KEYS = ("version", "id", "objects")
REQUIRED_OBJECT_KEYS = ("id", "asset", "transform")
REQUIRED_TRANSFORM_KEYS = ("position", "rotation", "scale")


def load_scene(scene_path):
    with open(scene_path, "r", encoding="utf-8") as handle:
        scene = json.load(handle)

    for key in REQUIRED_SCENE_KEYS:
        if key not in scene:
            raise ValueError(f"scene is missing required key: {key}")

    if scene["version"] != 1:
        raise ValueError(f"unsupported scene version: {scene['version']}")

    for obj in scene["objects"]:
        for key in REQUIRED_OBJECT_KEYS:
            if key not in obj:
                raise ValueError(f"scene object {obj.get('id', '?')} missing key: {key}")
        for key in REQUIRED_TRANSFORM_KEYS:
            if key not in obj["transform"]:
                raise ValueError(f"transform on object {obj['id']} missing key: {key}")

    return scene
