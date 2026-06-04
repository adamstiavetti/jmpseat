"""Prepare local Earth texture assets for the jmpseat cinematic globe.

This helper does not hotlink runtime assets. It localizes the existing NASA
day/night files when available and creates documented procedural fallbacks for
cloud, bump, and specular maps when no sourced file has been provided.

Run from the repo root:
  python3 tools/cinematic/fetch_earth_textures.py

To replace existing generated files:
  python3 tools/cinematic/fetch_earth_textures.py --allow-overwrite
"""

from __future__ import annotations

import argparse
import shutil
import subprocess
from datetime import datetime, timezone
from pathlib import Path


SCRIPT_PATH = Path(__file__).resolve()
REPO_ROOT = SCRIPT_PATH.parents[2]
SOURCE_TEXTURE_DIR = REPO_ROOT / "public" / "textures" / "earth"
CINEMATIC_TEXTURE_DIR = REPO_ROOT / "public" / "cinematic" / "textures"
DOC_PATH = REPO_ROOT / "docs" / "landing" / "earth-texture-sources.md"

TEXTURES = {
    "earth_day": CINEMATIC_TEXTURE_DIR / "earth_day.jpg",
    "earth_night": CINEMATIC_TEXTURE_DIR / "earth_night.jpg",
    "earth_clouds": CINEMATIC_TEXTURE_DIR / "earth_clouds.png",
    "earth_bump": CINEMATIC_TEXTURE_DIR / "earth_bump.jpg",
    "earth_specular": CINEMATIC_TEXTURE_DIR / "earth_specular.jpg",
}

SOURCE_FILES = {
    "earth_day": SOURCE_TEXTURE_DIR / "earth-day.jpg",
    "earth_night": SOURCE_TEXTURE_DIR / "earth-night.jpg",
}


def run(command: list[str]) -> None:
    subprocess.run(command, cwd=REPO_ROOT, check=True)


def ensure_dirs() -> None:
    CINEMATIC_TEXTURE_DIR.mkdir(parents=True, exist_ok=True)
    DOC_PATH.parent.mkdir(parents=True, exist_ok=True)


def copy_if_needed(source: Path, destination: Path, allow_overwrite: bool) -> str:
    if destination.exists() and not allow_overwrite:
        return "existing local file preserved"
    if not source.exists():
        return f"missing source: {source.relative_to(REPO_ROOT)}"
    shutil.copyfile(source, destination)
    return f"copied from {source.relative_to(REPO_ROOT)}"


def generate_clouds(destination: Path, allow_overwrite: bool) -> str:
    if destination.exists() and not allow_overwrite:
        return "existing local file preserved"
    run(
        [
            "magick",
            "-size",
            "4096x2048",
            "plasma:fractal",
            "-colorspace",
            "Gray",
            "-blur",
            "0x3",
            "-level",
            "58%,100%",
            "-alpha",
            "set",
            "-channel",
            "A",
            "-evaluate",
            "multiply",
            "0.34",
            "+channel",
            str(destination),
        ]
    )
    return "generated procedural fallback cloud opacity map with ImageMagick plasma noise"


def generate_bump(destination: Path, allow_overwrite: bool) -> str:
    if destination.exists() and not allow_overwrite:
        return "existing local file preserved"
    source = SOURCE_FILES["earth_day"]
    if not source.exists():
        return f"missing source: {source.relative_to(REPO_ROOT)}"
    run(
        [
            "magick",
            str(source),
            "-resize",
            "4096x2048!",
            "-colorspace",
            "Gray",
            "-auto-level",
            "-blur",
            "0x0.7",
            "-contrast",
            "-quality",
            "90",
            str(destination),
        ]
    )
    return "generated procedural fallback bump map from NASA day texture luminance"


def generate_specular(destination: Path, allow_overwrite: bool) -> str:
    if destination.exists() and not allow_overwrite:
        return "existing local file preserved"
    source = SOURCE_FILES["earth_day"]
    if not source.exists():
        return f"missing source: {source.relative_to(REPO_ROOT)}"
    run(
        [
            "magick",
            str(source),
            "-resize",
            "4096x2048!",
            "-colorspace",
            "Gray",
            "-negate",
            "-blur",
            "0x1.2",
            "-level",
            "42%,94%",
            "-quality",
            "90",
            str(destination),
        ]
    )
    return "generated procedural fallback specular/ocean mask from inverted NASA day texture luminance"


def write_docs(statuses: dict[str, str]) -> None:
    lines = [
        "# jmpseat Cinematic Earth Texture Sources",
        "",
        f"Updated: {datetime.now(timezone.utc).isoformat()}",
        "",
        "These assets are local runtime files for the Blender/R3F cinematic globe pipeline. They are not hotlinked at runtime.",
        "",
        "## Output Files",
        "",
        "| File | Type | Source status |",
        "| --- | --- | --- |",
    ]
    for key, path in TEXTURES.items():
        lines.append(f"| `{path.relative_to(REPO_ROOT)}` | {'sourced' if key in ('earth_day', 'earth_night') else 'fallback/generated'} | {statuses[key]} |")

    lines.extend(
        [
            "",
            "## Source Notes",
            "",
            "- `earth_day.jpg` uses the repo-local NASA Blue Marble / Blue Marble Next Generation derivative from `public/textures/earth/earth-day.jpg`.",
            "- `earth_night.jpg` uses the repo-local NASA Black Marble / Earth at Night derivative from `public/textures/earth/earth-night.jpg`.",
            "- `earth_clouds.png` is a procedural fallback cloud-opacity map generated locally because no vetted permissive cloud map is currently committed.",
            "- `earth_bump.jpg` is a procedural fallback generated from day-texture luminance. It is useful for previs only and is not a scientifically accurate elevation map.",
            "- `earth_specular.jpg` is a procedural fallback generated from inverted day-texture luminance. It approximates ocean/land reflectivity for previs only.",
            "",
            "## License / Usage Assumption",
            "",
            "- NASA source imagery is used under NASA images and media usage guidance: https://www.nasa.gov/nasa-brand-center/images-and-media/",
            "- NASA endorsement must not be implied.",
            "- Procedural fallback maps were generated locally from either noise or derived luminance and should be replaced with vetted production-quality maps before final launch if higher fidelity is required.",
            "",
            "## Known Limitations",
            "",
            "- Cloud, bump, and specular maps are fallback assets, not final art.",
            "- The current Blender preview can use these maps to move beyond a blue procedural orb, but final premium quality may still require artist-authored texture tuning or higher-resolution map variants.",
            "",
        ]
    )
    DOC_PATH.write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--allow-overwrite", action="store_true", help="Replace existing texture files.")
    args = parser.parse_args()

    ensure_dirs()
    statuses = {
        "earth_day": copy_if_needed(SOURCE_FILES["earth_day"], TEXTURES["earth_day"], args.allow_overwrite),
        "earth_night": copy_if_needed(SOURCE_FILES["earth_night"], TEXTURES["earth_night"], args.allow_overwrite),
        "earth_clouds": generate_clouds(TEXTURES["earth_clouds"], args.allow_overwrite),
        "earth_bump": generate_bump(TEXTURES["earth_bump"], args.allow_overwrite),
        "earth_specular": generate_specular(TEXTURES["earth_specular"], args.allow_overwrite),
    }
    write_docs(statuses)
    for key, status in statuses.items():
        print(f"{key}: {status}")


if __name__ == "__main__":
    main()
