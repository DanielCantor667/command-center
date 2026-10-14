"""Drop the triangles of a room GLB that sit fully inside named boxes (Sprint 9.3).

Room GLBs are merged by material, so a primitive piece cannot be hidden by node
name. This rewrites only the index buffers: positions, materials and textures are
byte-identical, and the v1 source file is never touched.

  python3 blender/patch_room_glb.py <in.glb> <out.glb> <regions.json>

regions.json: {"name": [xmin, ymin, zmin, xmax, ymax, zmax], ...} in Three metres.
A region may also be {"box": [...], "materials": ["WG_paper", ...]} to touch only those materials.
A triangle is removed only when all three vertices are inside one box.
"""
import json
import struct
import sys


def read_glb(path):
    data = open(path, "rb").read()
    assert data[:4] == b"glTF", "not a GLB"
    json_len = struct.unpack("<I", data[12:16])[0]
    doc = json.loads(data[20:20 + json_len])
    bin_start = 20 + json_len + 8
    return doc, bytearray(data[bin_start:])


def accessor_view(doc, blob, index):
    acc = doc["accessors"][index]
    view = doc["bufferViews"][acc["bufferView"]]
    return acc, view["byteOffset"] + acc.get("byteOffset", 0), view.get("byteStride")


def positions(doc, blob, index):
    acc, off, stride = accessor_view(doc, blob, index)
    step = stride or 12
    return [struct.unpack_from("<3f", blob, off + i * step) for i in range(acc["count"])]


def indices(doc, blob, index):
    acc, off, _ = accessor_view(doc, blob, index)
    fmt, size = {5121: ("B", 1), 5123: ("H", 2), 5125: ("I", 4)}[acc["componentType"]]
    return [struct.unpack_from("<" + fmt, blob, off + i * size)[0] for i in range(acc["count"])]


def patch(src, dst, regions):
    doc, blob = read_glb(src)
    boxes = {name: (r["box"] if isinstance(r, dict) else r) for name, r in regions.items()}
    only = {name: set(r["materials"]) for name, r in regions.items() if isinstance(r, dict) and "materials" in r}
    removed = {name: 0 for name in regions}
    for mesh in doc["meshes"]:
        for prim in mesh["primitives"]:
            material = doc["materials"][prim["material"]]["name"] if "material" in prim else None
            pts = positions(doc, blob, prim["attributes"]["POSITION"])
            idx = indices(doc, blob, prim["indices"])
            kept = []
            for t in range(0, len(idx), 3):
                tri = idx[t:t + 3]
                hit = None
                for name, b in boxes.items():
                    if name in only and material not in only[name]:
                        continue
                    if all(b[0] <= pts[i][0] <= b[3] and b[1] <= pts[i][1] <= b[4] and b[2] <= pts[i][2] <= b[5] for i in tri):
                        hit = name
                        break
                if hit:
                    removed[hit] += 1
                else:
                    kept.extend(tri)
            if len(kept) == len(idx):
                continue
            while len(blob) % 4:
                blob.append(0)
            offset = len(blob)
            blob.extend(struct.pack("<%dI" % len(kept), *kept))
            doc["bufferViews"].append({"buffer": 0, "byteOffset": offset, "byteLength": len(kept) * 4, "target": 34963})
            doc["accessors"].append({"bufferView": len(doc["bufferViews"]) - 1, "componentType": 5125, "count": len(kept), "type": "SCALAR"})
            prim["indices"] = len(doc["accessors"]) - 1
    doc["buffers"][0]["byteLength"] = len(blob)
    body = json.dumps(doc, separators=(",", ":")).encode()
    body += b" " * (-len(body) % 4)
    out = struct.pack("<4sII", b"glTF", 2, 12 + 8 + len(body) + 8 + len(blob))
    out += struct.pack("<I4s", len(body), b"JSON") + body + struct.pack("<I4s", len(blob), b"BIN\0") + bytes(blob)
    open(dst, "wb").write(out)
    return removed


if __name__ == "__main__":
    src, dst, regions_path = sys.argv[1:4]
    result = patch(src, dst, json.load(open(regions_path)))
    print(json.dumps({"removedTriangles": result}))
    assert all(result.values()), "a region removed nothing: check its box"
