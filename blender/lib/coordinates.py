"""Axis conversion between the Scene Schema (Y-up, Three.js convention) and Blender (Z-up)."""


def to_blender_position(position):
    return (position["x"], -position["z"], position["y"])


def to_blender_rotation(rotation):
    return (rotation["x"], -rotation["z"], rotation["y"])
