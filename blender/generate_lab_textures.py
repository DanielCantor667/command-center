"""Textures for the workshop-lab prototype, generated from the repo's real data (no invented content).

Run: python3 blender/generate_lab_textures.py
Writes to ASSETS/generated: one plate per technology (portfolio-technologies.ts), category labels,
one screen per project (real capture from public/projects when it exists, otherwise the name only),
name strips and the Trayectoria whiteboard. Prototype only: the web phase draws plates/screens at
runtime from the same data (technology-shelf.tsx atlas + project media).
"""
from __future__ import annotations

import json
import re
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
WEB = ROOT / "apps/web"
OUT = Path("/Users/creativo/Documents/command-center-assets/generated")
FONT = "/System/Library/Fonts/Helvetica.ttc"
MONO = "/System/Library/Fonts/Menlo.ttc"

# Real captures available in public/projects (others get a name-only screen).
CAPTURES = {
    "kliniu": "kliniu-desktop.webp",
    "lorigine": "lorigine-catalog-v4.webp",
    "4ustudio-academy": "academy-lessons-v4.webp",
    "drokex": "drokex-products-v4.webp",
}


def font(size, mono=False):
    return ImageFont.truetype(MONO if mono else FONT, size)


def fit(draw, text, max_w, size, mono=False):
    while size > 10 and draw.textlength(text, font=font(size, mono)) > max_w:
        size -= 1
    return font(size, mono)


def technologies():
    src = (WEB / "data/portfolio-technologies.ts").read_text()
    cats = re.findall(r"\{ id: '(\w+)', label: '([^']+)' \}", src)
    entries = []
    for block in re.split(r"\n\s*\{\s*\n\s*id:", src)[1:]:
        get = lambda key: (re.search(rf"{key}:\s*['\"]([^'\"]+)", block) or [None, None])[1]  # noqa: E731
        if get("name") and get("category"):
            entries.append({"name": get("name"), "short": get("shortName") or get("name")[:2],
                            "category": get("category"), "color": get("color") or "#7fd8e6"})
    return cats, entries


def projects():
    out = []
    for path in sorted((WEB / "data/projects").glob("*.ts")):
        src = path.read_text()
        pid = re.search(r"\bid: '([a-z0-9-]+)'", src)
        # top-level field (first after the project id), not a nested technology name
        name = re.search(r"\bname: (['\"])(.+?)\1", src[pid.end():]) if pid else None
        name = name and [None, name[2]]
        if pid and name and path.stem not in ("index", "projects", "project.enums", "project.schema", "project.types"):
            out.append({"id": pid[1], "name": name[1]})
    return out


def plate(entry, path):
    img = Image.new("RGB", (256, 256), "#11181b")
    d = ImageDraw.Draw(img)
    d.rectangle([0, 236, 256, 256], fill=entry["color"])
    d.rectangle([6, 6, 249, 229], outline="#2b3a3f", width=3)
    d.text((128, 100), entry["short"], fill=entry["color"], font=fit(d, entry["short"], 200, 92), anchor="mm")
    d.text((128, 196), entry["name"], fill="#e6f2f4", font=fit(d, entry["name"], 220, 30), anchor="mm")
    img.save(path)


def label(text, path, w=512, h=96, colour="#7fd8e6"):
    img = Image.new("RGB", (w, h), "#0d1417")
    d = ImageDraw.Draw(img)
    d.text((w // 2, h // 2), text, fill=colour, font=fit(d, text, w - 24, int(h * 0.55), mono=True), anchor="mm")
    img.save(path)


def screen(project, path):
    capture = CAPTURES.get(project["id"])
    if capture:
        img = Image.open(WEB / "public/projects" / capture).convert("RGB")
        img = img.resize((1024, int(1024 * img.height / img.width)))
        img = img.crop((0, 0, 1024, 640)) if img.height >= 640 else img.resize((1024, 640))
    else:
        img = Image.new("RGB", (1024, 640), "#071317")
        d = ImageDraw.Draw(img)
        for y in range(0, 640, 6):  # scanlines
            d.line([(0, y), (1024, y)], fill="#0b1d22")
        d.text((512, 300), project["name"], fill="#2fe6ff", font=fit(d, project["name"], 900, 110, mono=True), anchor="mm")
        d.text((512, 410), "sin captura publicada", fill="#4f7f88", font=font(34, mono=True), anchor="mm")
    img.save(path)


def whiteboard(path):
    """Title + the station's own description (stations.ts); timeline marks are decorative, no data."""
    img = Image.new("RGB", (1200, 800), "#e9ece8")
    d = ImageDraw.Draw(img)
    d.text((60, 60), "Trayectoria", fill="#1b2a30", font=font(96))
    d.text((64, 190), "Experiencia, formación e idiomas", fill="#36525a", font=font(40))
    d.line([(80, 520), (1120, 520)], fill="#1b2a30", width=6)
    for i, x in enumerate(range(140, 1121, 240)):
        d.ellipse([x - 18, 502, x + 18, 538], fill=("#2fa8c0", "#e06a3a", "#2fa8c0", "#e06a3a", "#2fa8c0")[i % 5])
    for i, (x, y) in enumerate(((150, 600), (420, 360), (690, 600), (960, 360))):
        d.rectangle([x, y, x + 170, y + 120], fill=("#ffe27a", "#9fe3ef", "#ffc0a8", "#c8f2a6")[i])
    img.save(path)


def main():
    (OUT / "tech").mkdir(parents=True, exist_ok=True)
    (OUT / "projects").mkdir(parents=True, exist_ok=True)
    cats, entries = technologies()
    layout = []
    for row, (cid, clabel) in enumerate(cats):
        label(clabel, OUT / "tech" / f"cat_{cid}.png")
        for col, entry in enumerate(e for e in entries if e["category"] == cid):
            name = f"{cid}_{col}.png"
            plate(entry, OUT / "tech" / name)
            layout.append({"row": row, "col": col, "file": name, "category": cid, "name": entry["name"]})
    projs = projects()
    for p in projs:
        screen(p, OUT / "projects" / f"{p['id']}.png")
        label(p["name"], OUT / "projects" / f"{p['id']}_label.png", 512, 80, "#e6f2f4")
    whiteboard(OUT / "trayectoria.png")
    (OUT / "layout.json").write_text(json.dumps({"categories": [c for c, _ in cats], "tech": layout, "projects": projs}, indent=1))
    print(len(entries), "technologies,", len(projs), "projects ->", OUT)


if __name__ == "__main__":
    main()
