"""Render isolated globe material proof frames for the jmpseat cinematic hero.

Run from the repo root:
  blender --background --python tools/cinematic/render_globe_material_proof.py

This script intentionally does not build or render the full hero composition.
It is a material gate for the globe only.
"""

from __future__ import annotations

import subprocess
from datetime import datetime, timezone
from pathlib import Path

import bpy
from mathutils import Vector


SCRIPT_PATH = Path(__file__).resolve()
REPO_ROOT = SCRIPT_PATH.parents[2]
PUBLIC_ROOT = REPO_ROOT / "public" / "cinematic"
TEXTURE_DIR = PUBLIC_ROOT / "textures"
PREVIEW_DIR = PUBLIC_ROOT / "previews"
DOC_PATH = REPO_ROOT / "docs" / "landing" / "globe-material-debug-latest.md"
REFERENCE_GLOBE_SPEC = REPO_ROOT / "docs" / "landing" / "references" / "jmpseat-globe-material-reference.jpg"

EARTH_DAY_TEXTURE = TEXTURE_DIR / "earth_day.jpg"
EARTH_NIGHT_TEXTURE = TEXTURE_DIR / "earth_night.jpg"
EARTH_CLOUDS_TEXTURE = TEXTURE_DIR / "earth_clouds.png"
EARTH_BUMP_TEXTURE = TEXTURE_DIR / "earth_bump.jpg"
BEAUTY_COMPOSITE_TEXTURE = TEXTURE_DIR / "earth_beauty_composite.png"
BEAUTY_OCEAN_FILL_TEXTURE = TEXTURE_DIR / "earth_ocean_blue_fill.png"
BEAUTY_CLOUD_TERRAIN_TEXTURE = TEXTURE_DIR / "earth_cloud_terrain_detail.png"
BEAUTY_CITY_EMISSION_TEXTURE = TEXTURE_DIR / "earth_city_emission_warm.png"
DARK_COMPOSITE_TEXTURE = TEXTURE_DIR / "earth_dark_composite.png"
LAND_MASK_TEXTURE = TEXTURE_DIR / "earth_land_mask.png"
OCEAN_DEPTH_TEXTURE = TEXTURE_DIR / "earth_ocean_depth.png"
COASTLINE_MASK_TEXTURE = TEXTURE_DIR / "earth_coastline_mask.png"
SURFACE_DENSITY_TEXTURE = TEXTURE_DIR / "earth_surface_density.png"
PROOF_DAY_TEXTURE = TEXTURE_DIR / "earth_day_material_proof.jpg"
PROOF_LAND_MASK_TEXTURE = LAND_MASK_TEXTURE
PROOF_COAST_MASK_TEXTURE = COASTLINE_MASK_TEXTURE
PROOF_SURFACE_DETAIL_TEXTURE = SURFACE_DENSITY_TEXTURE
PROOF_CITY_TEXTURE = TEXTURE_DIR / "earth_city_lights_material_proof.png"
VARIANT_TEXTURES = {
    "referenceBalanced": TEXTURE_DIR / "earth_dark_composite_reference_balanced.png",
    "darkerCinematic": TEXTURE_DIR / "earth_dark_composite_darker_cinematic.png",
    "richerSurface": TEXTURE_DIR / "earth_dark_composite_richer_surface.png",
}
VARIANT_OUTPUTS = {
    "referenceBalanced": PREVIEW_DIR / "globe-material-variant-reference-balanced.png",
    "darkerCinematic": PREVIEW_DIR / "globe-material-variant-darker-cinematic.png",
    "richerSurface": PREVIEW_DIR / "globe-material-variant-richer-surface.png",
}
REFERENCE_MATCH_TEXTURES = {
    "fill": TEXTURE_DIR / "earth_reference_match_fill.png",
    "surface": TEXTURE_DIR / "earth_reference_match_surface.png",
    "cityAtmosphere": TEXTURE_DIR / "earth_reference_match_city_atmosphere.png",
    "combined": TEXTURE_DIR / "earth_reference_match_combined.png",
}
REFERENCE_FILL_TEXTURE = TEXTURE_DIR / "earth_reference_fill.png"
REFERENCE_MATCH_OUTPUTS = {
    "fill": PREVIEW_DIR / "globe-reference-match-fill.png",
    "surface": PREVIEW_DIR / "globe-reference-match-surface.png",
    "cityAtmosphere": PREVIEW_DIR / "globe-reference-match-city-atmosphere.png",
    "combined": PREVIEW_DIR / "globe-reference-match-combined.png",
}
MIDDLE_GROUND_TEXTURES = {
    "veryDarkNavyLift": TEXTURE_DIR / "earth_middle_ground_very_dark_navy_lift.png",
    "darkNavyLift": TEXTURE_DIR / "earth_middle_ground_dark_navy_lift.png",
    "balancedDeepNavy": TEXTURE_DIR / "earth_middle_ground_balanced_deep_navy.png",
    "richDeepNavy": TEXTURE_DIR / "earth_middle_ground_rich_deep_navy.png",
    "maximumAcceptableNavy": TEXTURE_DIR / "earth_middle_ground_maximum_acceptable_navy.png",
}
MIDDLE_GROUND_OUTPUTS = {
    "veryDarkNavyLift": PREVIEW_DIR / "globe-middle-ground-very-dark-navy-lift.png",
    "darkNavyLift": PREVIEW_DIR / "globe-middle-ground-dark-navy-lift.png",
    "balancedDeepNavy": PREVIEW_DIR / "globe-middle-ground-balanced-deep-navy.png",
    "richDeepNavy": PREVIEW_DIR / "globe-middle-ground-rich-deep-navy.png",
    "maximumAcceptableNavy": PREVIEW_DIR / "globe-middle-ground-maximum-acceptable-navy.png",
}

OUTPUTS = {
    "dayOnly": PREVIEW_DIR / "globe-material-day-only.png",
    "nightEmissionOnly": PREVIEW_DIR / "globe-material-night-emission-only.png",
    "noAtmosphere": PREVIEW_DIR / "globe-material-no-atmosphere.png",
    "withAtmosphere": PREVIEW_DIR / "globe-material-with-atmosphere.png",
    "proofSheet": PREVIEW_DIR / "globe-material-proof-sheet.png",
    "variantSheet": PREVIEW_DIR / "globe-material-variant-sheet.png",
    "referenceMatchSheet": PREVIEW_DIR / "globe-reference-match-variant-sheet.png",
    "middleGroundSheet": PREVIEW_DIR / "globe-middle-ground-variant-sheet.png",
    "beautyFlat": PREVIEW_DIR / "globe-beauty-composite-flat.png",
    "beautyDayOnly": PREVIEW_DIR / "globe-beauty-day-only.png",
    "beautyNoAtmosphere": PREVIEW_DIR / "globe-beauty-no-atmosphere.png",
    "beautyWithAtmosphere": PREVIEW_DIR / "globe-beauty-with-atmosphere.png",
    "beautySheet": PREVIEW_DIR / "globe-beauty-composite-proof-sheet.png",
}


def ensure_dirs() -> None:
    TEXTURE_DIR.mkdir(parents=True, exist_ok=True)
    PREVIEW_DIR.mkdir(parents=True, exist_ok=True)
    DOC_PATH.parent.mkdir(parents=True, exist_ok=True)


def run_magick(command: list[str]) -> bool:
    try:
        subprocess.run(command, cwd=REPO_ROOT, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        return True
    except (FileNotFoundError, subprocess.CalledProcessError):
        return False


def prepare_proof_textures() -> dict[str, str]:
    statuses: dict[str, str] = {}

    if EARTH_DAY_TEXTURE.exists():
        legacy_day_ok = run_magick(
            [
                "magick",
                str(EARTH_DAY_TEXTURE),
                "-resize",
                "4096x2048!",
                "-colorspace",
                "sRGB",
                "-auto-level",
                "-modulate",
                "52,92,100",
                "-brightness-contrast",
                "-24x42",
                "-fill",
                "#020812",
                "-colorize",
                "22",
                "-quality",
                "92",
                str(PROOF_DAY_TEXTURE),
            ]
        )
        statuses["legacyDay"] = "generated legacy dark contrast proof day map" if legacy_day_ok else "failed to generate legacy proof day map"

        mask_ok = run_magick(
            [
                "magick",
                str(EARTH_DAY_TEXTURE),
                "-resize",
                "4096x2048!",
                "-colorspace",
                "Gray",
                "-auto-level",
                "-sigmoidal-contrast",
                "12,38%",
                "-level",
                "10%,88%",
                str(LAND_MASK_TEXTURE),
            ]
        )
        statuses["landMask"] = "generated land/continent contrast mask" if mask_ok else "failed to generate land/continent mask"

        if mask_ok:
            ocean_ok = run_magick(
                [
                    "magick",
                    str(EARTH_DAY_TEXTURE),
                    "-resize",
                    "4096x2048!",
                    "-fuzz",
                    "12%",
                    "-fill",
                    "white",
                    "-opaque",
                    "#00030d",
                    "-fill",
                    "black",
                    "+opaque",
                    "white",
                    "-colorspace",
                    "Gray",
                    "-blur",
                    "0x0.7",
                    "-level",
                    "8%,96%",
                    str(OCEAN_DEPTH_TEXTURE),
                ]
            )
            statuses["oceanDepth"] = "generated restrained ocean depth mask" if ocean_ok else "failed to generate ocean depth mask"

            coast_ok = run_magick(
                [
                    "magick",
                    str(PROOF_LAND_MASK_TEXTURE),
                    "-threshold",
                    "16%",
                    "-edge",
                    "1",
                    "-morphology",
                    "Dilate",
                    "Disk:1",
                    "-blur",
                    "0x0.35",
                    "-level",
                    "12%,100%",
                    str(COASTLINE_MASK_TEXTURE),
                ]
            )
            statuses["coastMask"] = "generated coastline/detail lift mask" if coast_ok else "failed to generate coastline/detail mask"

            detail_ok = run_magick(
                [
                    "magick",
                    str(EARTH_DAY_TEXTURE),
                    "-resize",
                    "4096x2048!",
                    "-colorspace",
                    "Gray",
                    "-auto-level",
                    "-sigmoidal-contrast",
                    "9,40%",
                    "-unsharp",
                    "0x1.0+1.9+0.02",
                    "(",
                    str(LAND_MASK_TEXTURE),
                    "-blur",
                    "0x0.45",
                    ")",
                    "-compose",
                    "Multiply",
                    "-composite",
                    "-level",
                    "6%,78%",
                    str(SURFACE_DENSITY_TEXTURE),
                ]
            )
            statuses["surfaceDetail"] = "generated land-gated surface density map" if detail_ok else "failed to generate surface density map"

            composite_ok = run_magick(
                [
                    "magick",
                    "(",
                    str(EARTH_DAY_TEXTURE),
                    "-resize",
                    "4096x2048!",
                    "-colorspace",
                    "sRGB",
                    "-auto-level",
                    "-modulate",
                    "70,78,100",
                    "-brightness-contrast",
                    "-14x42",
                    "-fill",
                    "#020914",
                    "-colorize",
                    "10",
                    ")",
                    "(",
                    "-size",
                    "4096x2048",
                    "xc:#073a6c",
                    str(OCEAN_DEPTH_TEXTURE),
                    "-alpha",
                    "off",
                    "-compose",
                    "CopyOpacity",
                    "-composite",
                    "-channel",
                    "A",
                    "-evaluate",
                    "multiply",
                    "0.34",
                    "+channel",
                    ")",
                    "-compose",
                    "Screen",
                    "-composite",
                    "(",
                    "-size",
                    "4096x2048",
                    "xc:#151d1b",
                    str(LAND_MASK_TEXTURE),
                    "-alpha",
                    "off",
                    "-compose",
                    "CopyOpacity",
                    "-composite",
                    "-channel",
                    "A",
                    "-evaluate",
                    "multiply",
                    "0.28",
                    "+channel",
                    ")",
                    "-compose",
                    "Screen",
                    "-composite",
                    "(",
                    "-size",
                    "4096x2048",
                    "xc:#1e1b14",
                    str(COASTLINE_MASK_TEXTURE),
                    "-alpha",
                    "off",
                    "-compose",
                    "CopyOpacity",
                    "-composite",
                    "-channel",
                    "A",
                    "-evaluate",
                    "multiply",
                    "0.20",
                    "+channel",
                    ")",
                    "-compose",
                    "Screen",
                    "-composite",
                    "(",
                    "-size",
                    "4096x2048",
                    "xc:#07101a",
                    str(SURFACE_DENSITY_TEXTURE),
                    "-alpha",
                    "off",
                    "-compose",
                    "CopyOpacity",
                    "-composite",
                    "-channel",
                    "A",
                    "-evaluate",
                    "multiply",
                    "0.14",
                    "+channel",
                    ")",
                    "-compose",
                    "Screen",
                    "-composite",
                    "-fill",
                    "#010712",
                    "-opaque",
                    "#000000",
                    str(DARK_COMPOSITE_TEXTURE),
                ]
            )
            statuses["darkComposite"] = "generated art-directed dark Earth surface composite" if composite_ok else "failed to generate dark Earth composite"
        else:
            statuses["oceanDepth"] = "not generated because land mask failed"
            statuses["coastMask"] = "not generated because land mask failed"
            statuses["surfaceDetail"] = "not generated because land mask failed"
            statuses["darkComposite"] = "not generated because land mask failed"
    else:
        statuses["day"] = f"missing source: {EARTH_DAY_TEXTURE.relative_to(REPO_ROOT)}"
        statuses["landMask"] = "not generated because day source is missing"
        statuses["oceanDepth"] = "not generated because day source is missing"
        statuses["coastMask"] = "not generated because day source is missing"
        statuses["surfaceDetail"] = "not generated because day source is missing"
        statuses["darkComposite"] = "not generated because day source is missing"

    if EARTH_NIGHT_TEXTURE.exists():
        ok = run_magick(
            [
                "magick",
                str(EARTH_NIGHT_TEXTURE),
                "-resize",
                "4096x2048!",
                "-colorspace",
                "Gray",
                "-auto-level",
                "-sigmoidal-contrast",
                "8,38%",
                "-level",
                "12%,100%",
                "-colorspace",
                "sRGB",
                "-fill",
                "#ffb24a",
                "-tint",
                "100",
                "-background",
                "black",
                "-alpha",
                "remove",
                "-alpha",
                "off",
                str(PROOF_CITY_TEXTURE),
            ]
        )
        statuses["night"] = "generated warm proof city-light map" if ok else "failed to generate proof city-light map"
    else:
        statuses["night"] = f"missing source: {EARTH_NIGHT_TEXTURE.relative_to(REPO_ROOT)}"

    return statuses


def generate_variant_composite(
    output_path: Path,
    ocean_color: str,
    ocean_alpha: str,
    land_color: str,
    land_alpha: str,
    coast_color: str,
    coast_alpha: str,
    density_color: str,
    density_alpha: str,
    modulate: str,
    contrast: str,
    colorize: str,
) -> bool:
    return run_magick(
        [
            "magick",
            "(",
            str(EARTH_DAY_TEXTURE),
            "-resize",
            "4096x2048!",
            "-colorspace",
            "sRGB",
            "-auto-level",
            "-modulate",
            modulate,
            "-brightness-contrast",
            contrast,
            "-fill",
            "#020914",
            "-colorize",
            colorize,
            ")",
            "(",
            "-size",
            "4096x2048",
            f"xc:{ocean_color}",
            str(OCEAN_DEPTH_TEXTURE),
            "-alpha",
            "off",
            "-compose",
            "CopyOpacity",
            "-composite",
            "-channel",
            "A",
            "-evaluate",
            "multiply",
            ocean_alpha,
            "+channel",
            ")",
            "-compose",
            "Screen",
            "-composite",
            "(",
            "-size",
            "4096x2048",
            f"xc:{land_color}",
            str(LAND_MASK_TEXTURE),
            "-alpha",
            "off",
            "-compose",
            "CopyOpacity",
            "-composite",
            "-channel",
            "A",
            "-evaluate",
            "multiply",
            land_alpha,
            "+channel",
            ")",
            "-compose",
            "Screen",
            "-composite",
            "(",
            "-size",
            "4096x2048",
            f"xc:{coast_color}",
            str(COASTLINE_MASK_TEXTURE),
            "-alpha",
            "off",
            "-compose",
            "CopyOpacity",
            "-composite",
            "-channel",
            "A",
            "-evaluate",
            "multiply",
            coast_alpha,
            "+channel",
            ")",
            "-compose",
            "Screen",
            "-composite",
            "(",
            "-size",
            "4096x2048",
            f"xc:{density_color}",
            str(SURFACE_DENSITY_TEXTURE),
            "-alpha",
            "off",
            "-compose",
            "CopyOpacity",
            "-composite",
            "-channel",
            "A",
            "-evaluate",
            "multiply",
            density_alpha,
            "+channel",
            ")",
            "-compose",
            "Screen",
            "-composite",
            "-fill",
            "#010712",
            "-opaque",
            "#000000",
            str(output_path),
        ]
    )


def generate_reference_match_composite(
    output_path: Path,
    ocean_color: str,
    ocean_alpha: str,
    land_color: str,
    land_alpha: str,
    coast_color: str,
    coast_alpha: str,
    density_color: str,
    density_alpha: str,
    fill_color: str,
    fill_alpha: str,
    modulate: str,
    contrast: str,
    colorize: str,
) -> bool:
    return run_magick(
        [
            "magick",
            "(",
            str(EARTH_DAY_TEXTURE),
            "-resize",
            "4096x2048!",
            "-colorspace",
            "sRGB",
            "-auto-level",
            "-modulate",
            modulate,
            "-brightness-contrast",
            contrast,
            "-fill",
            "#020914",
            "-colorize",
            colorize,
            ")",
            "(",
            "-size",
            "4096x2048",
            "radial-gradient:gray80-gray5",
            "-resize",
            "4096x2048!",
            "-colorspace",
            "Gray",
            "-level",
            "22%,92%",
            ")",
            "(",
            "-size",
            "4096x2048",
            f"xc:{fill_color}",
            "-alpha",
            "set",
            "-channel",
            "A",
            "-evaluate",
            "multiply",
            fill_alpha,
            "+channel",
            ")",
            "-compose",
            "Screen",
            "-composite",
            "(",
            "-size",
            "4096x2048",
            f"xc:{ocean_color}",
            str(OCEAN_DEPTH_TEXTURE),
            "-alpha",
            "off",
            "-compose",
            "CopyOpacity",
            "-composite",
            "-channel",
            "A",
            "-evaluate",
            "multiply",
            ocean_alpha,
            "+channel",
            ")",
            "-compose",
            "Screen",
            "-composite",
            "(",
            "-size",
            "4096x2048",
            f"xc:{land_color}",
            str(LAND_MASK_TEXTURE),
            "-alpha",
            "off",
            "-compose",
            "CopyOpacity",
            "-composite",
            "-channel",
            "A",
            "-evaluate",
            "multiply",
            land_alpha,
            "+channel",
            ")",
            "-compose",
            "Screen",
            "-composite",
            "(",
            "-size",
            "4096x2048",
            f"xc:{coast_color}",
            str(COASTLINE_MASK_TEXTURE),
            "-alpha",
            "off",
            "-compose",
            "CopyOpacity",
            "-composite",
            "-channel",
            "A",
            "-evaluate",
            "multiply",
            coast_alpha,
            "+channel",
            ")",
            "-compose",
            "Screen",
            "-composite",
            "(",
            "-size",
            "4096x2048",
            f"xc:{density_color}",
            str(SURFACE_DENSITY_TEXTURE),
            "-alpha",
            "off",
            "-compose",
            "CopyOpacity",
            "-composite",
            "-channel",
            "A",
            "-evaluate",
            "multiply",
            density_alpha,
            "+channel",
            ")",
            "-compose",
            "Screen",
            "-composite",
            "-fill",
            "#010712",
            "-opaque",
            "#000000",
            str(output_path),
        ]
    )


def prepare_variant_textures(statuses: dict[str, str]) -> None:
    if not (EARTH_DAY_TEXTURE.exists() and OCEAN_DEPTH_TEXTURE.exists() and LAND_MASK_TEXTURE.exists() and COASTLINE_MASK_TEXTURE.exists() and SURFACE_DENSITY_TEXTURE.exists()):
        statuses["variants"] = "not generated because required masks are missing"
        return

    variants = {
        "referenceBalanced": ("#06325f", "0.26", "#151c19", "0.22", "#1a1812", "0.12", "#07111b", "0.10", "67,72,100", "-18x40", "14"),
        "darkerCinematic": ("#042442", "0.20", "#111716", "0.17", "#15130f", "0.09", "#050a10", "0.07", "60,68,100", "-24x38", "20"),
        "richerSurface": ("#073968", "0.30", "#17201d", "0.24", "#1c1913", "0.14", "#08131e", "0.12", "70,72,100", "-16x42", "13"),
    }
    results = []
    for name, args in variants.items():
        ok = generate_variant_composite(VARIANT_TEXTURES[name], *args)
        results.append(f"{name}: {'generated' if ok else 'failed'}")
    statuses["variants"] = "; ".join(results)


def prepare_reference_match_textures(statuses: dict[str, str]) -> None:
    if not (EARTH_DAY_TEXTURE.exists() and OCEAN_DEPTH_TEXTURE.exists() and LAND_MASK_TEXTURE.exists() and COASTLINE_MASK_TEXTURE.exists() and SURFACE_DENSITY_TEXTURE.exists()):
        statuses["referenceMatchVariants"] = "not generated because required masks are missing"
        return

    fill_ok = run_magick(
        [
            "magick",
            "-size",
            "4096x2048",
            "radial-gradient:gray85-gray0",
            "-resize",
            "4096x2048!",
            "-colorspace",
            "Gray",
            "-level",
            "28%,100%",
            str(REFERENCE_FILL_TEXTURE),
        ]
    )
    statuses["referenceFill"] = "generated viewport-style blue fill mask" if fill_ok else "failed to generate viewport-style blue fill mask"

    variants = {
        "fill": ("#06315c", "0.18", "#111817", "0.12", "#15130f", "0.06", "#050b12", "0.06", "#03325f", "0.00", "62,68,100", "-24x36", "18"),
        "surface": ("#052b50", "0.16", "#151d1a", "0.18", "#19160f", "0.10", "#07111b", "0.13", "#022a50", "0.00", "64,68,100", "-22x40", "17"),
        "cityAtmosphere": ("#052945", "0.14", "#121916", "0.12", "#15130f", "0.06", "#061018", "0.07", "#03345f", "0.00", "60,66,100", "-24x36", "20"),
        "combined": ("#06345e", "0.18", "#151d1a", "0.16", "#19160f", "0.09", "#07131d", "0.11", "#033864", "0.00", "64,68,100", "-22x38", "17"),
    }
    results = []
    for name, args in variants.items():
        ok = generate_reference_match_composite(REFERENCE_MATCH_TEXTURES[name], *args)
        results.append(f"{name}: {'generated' if ok else 'failed'}")
    statuses["referenceMatchVariants"] = "; ".join(results)


def prepare_middle_ground_textures(statuses: dict[str, str]) -> None:
    if not (EARTH_DAY_TEXTURE.exists() and OCEAN_DEPTH_TEXTURE.exists() and LAND_MASK_TEXTURE.exists() and COASTLINE_MASK_TEXTURE.exists() and SURFACE_DENSITY_TEXTURE.exists()):
        statuses["middleGroundVariants"] = "not generated because required masks are missing"
        return

    variants = {
        "veryDarkNavyLift": ("#052746", "0.12", "#121817", "0.12", "#15130f", "0.05", "#050b12", "0.05", "#02203f", "0.00", "57,66,100", "-28x34", "22"),
        "darkNavyLift": ("#063052", "0.15", "#131a18", "0.14", "#16140f", "0.06", "#061018", "0.07", "#022848", "0.00", "60,67,100", "-26x36", "20"),
        "balancedDeepNavy": ("#07385e", "0.18", "#141c19", "0.16", "#181610", "0.08", "#07111b", "0.09", "#023056", "0.00", "62,68,100", "-24x38", "18"),
        "richDeepNavy": ("#08416c", "0.21", "#151e1b", "0.18", "#191711", "0.09", "#08131d", "0.10", "#03355f", "0.00", "64,68,100", "-22x39", "17"),
        "maximumAcceptableNavy": ("#094977", "0.24", "#151f1c", "0.19", "#191711", "0.10", "#081520", "0.11", "#033b68", "0.00", "65,69,100", "-20x40", "16"),
    }
    results = []
    for name, args in variants.items():
        ok = generate_reference_match_composite(MIDDLE_GROUND_TEXTURES[name], *args)
        results.append(f"{name}: {'generated' if ok else 'failed'}")
    statuses["middleGroundVariants"] = "; ".join(results)


def prepare_beauty_textures(statuses: dict[str, str]) -> None:
    if not (EARTH_DAY_TEXTURE.exists() and EARTH_NIGHT_TEXTURE.exists() and OCEAN_DEPTH_TEXTURE.exists() and LAND_MASK_TEXTURE.exists() and COASTLINE_MASK_TEXTURE.exists() and SURFACE_DENSITY_TEXTURE.exists()):
        statuses["beautyComposite"] = "not generated because required source maps are missing"
        return

    ocean_ok = run_magick(
        [
            "magick",
            "-size",
            "4096x2048",
            "xc:#062f57",
            str(OCEAN_DEPTH_TEXTURE),
            "-alpha",
            "off",
            "-compose",
            "CopyOpacity",
            "-composite",
            "-channel",
            "A",
            "-evaluate",
            "multiply",
            "0.24",
            "+channel",
            str(BEAUTY_OCEAN_FILL_TEXTURE),
        ]
    )
    detail_ok = run_magick(
        [
            "magick",
            str(EARTH_DAY_TEXTURE),
            "-resize",
            "4096x2048!",
            "-colorspace",
            "Gray",
            "-auto-level",
            "-sigmoidal-contrast",
            "7,42%",
            "-unsharp",
            "0x1.0+1.3+0.02",
            str(LAND_MASK_TEXTURE),
            "-compose",
            "Multiply",
            "-composite",
            "-level",
            "10%,88%",
            str(BEAUTY_CLOUD_TERRAIN_TEXTURE),
        ]
    )
    city_ok = run_magick(
        [
            "magick",
            str(EARTH_NIGHT_TEXTURE),
            "-resize",
            "4096x2048!",
            "-colorspace",
            "Gray",
            "-auto-level",
            "-sigmoidal-contrast",
            "8,38%",
            "-level",
            "10%,100%",
            "-colorspace",
            "sRGB",
            "-fill",
            "#ffb14a",
            "-tint",
            "100",
            str(BEAUTY_CITY_EMISSION_TEXTURE),
        ]
    )
    composite_ok = run_magick(
        [
            "magick",
            "(",
            str(EARTH_DAY_TEXTURE),
            "-resize",
            "4096x2048!",
            "-auto-level",
            "-modulate",
            "54,64,100",
            "-brightness-contrast",
            "-26x34",
            "-fill",
            "#020914",
            "-colorize",
            "22",
            ")",
            str(BEAUTY_OCEAN_FILL_TEXTURE),
            "-compose",
            "Screen",
            "-composite",
            "(",
            "-size",
            "4096x2048",
            "xc:#111917",
            str(LAND_MASK_TEXTURE),
            "-alpha",
            "off",
            "-compose",
            "CopyOpacity",
            "-composite",
            "-channel",
            "A",
            "-evaluate",
            "multiply",
            "0.13",
            "+channel",
            ")",
            "-compose",
            "Screen",
            "-composite",
            "(",
            "-size",
            "4096x2048",
            "xc:#18150f",
            str(COASTLINE_MASK_TEXTURE),
            "-alpha",
            "off",
            "-compose",
            "CopyOpacity",
            "-composite",
            "-channel",
            "A",
            "-evaluate",
            "multiply",
            "0.06",
            "+channel",
            ")",
            "-compose",
            "Screen",
            "-composite",
            "(",
            "-size",
            "4096x2048",
            "xc:#07131e",
            str(BEAUTY_CLOUD_TERRAIN_TEXTURE),
            "-alpha",
            "off",
            "-compose",
            "CopyOpacity",
            "-composite",
            "-channel",
            "A",
            "-evaluate",
            "multiply",
            "0.10",
            "+channel",
            ")",
            "-compose",
            "Screen",
            "-composite",
            "-fill",
            "#d7e8ee",
            "-opaque",
            "#ffffff",
            str(BEAUTY_COMPOSITE_TEXTURE),
        ]
    )
    flat_ok = run_magick(
        [
            "magick",
            str(BEAUTY_COMPOSITE_TEXTURE),
            "-resize",
            "1600x800!",
            str(OUTPUTS["beautyFlat"]),
        ]
    )
    statuses["beautyComposite"] = f"ocean: {'generated' if ocean_ok else 'failed'}; detail: {'generated' if detail_ok else 'failed'}; city: {'generated' if city_ok else 'failed'}; composite: {'generated' if composite_ok else 'failed'}; flat preview: {'generated' if flat_ok else 'failed'}"


def reset_scene() -> None:
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete()
    bpy.context.scene.unit_settings.system = "METRIC"


def set_principled_input(material: bpy.types.Material, input_name: str, value) -> None:
    bsdf = material.node_tree.nodes.get("Principled BSDF")
    if bsdf and input_name in bsdf.inputs:
        bsdf.inputs[input_name].default_value = value


def create_earth_surface_material(texture_path: Path | None = None, emission_strength: float = 0.105) -> bpy.types.Material:
    material = bpy.data.materials.new("proof_opaque_dark_earth_surface")
    material.use_nodes = True
    material.diffuse_color = (0.006, 0.014, 0.024, 1.0)
    material.blend_method = "OPAQUE"
    material.use_screen_refraction = False
    material.show_transparent_back = False

    nodes = material.node_tree.nodes
    links = material.node_tree.links
    bsdf = nodes.get("Principled BSDF")
    if not bsdf:
        return material

    day_path = texture_path if texture_path and texture_path.exists() else DARK_COMPOSITE_TEXTURE if DARK_COMPOSITE_TEXTURE.exists() else PROOF_DAY_TEXTURE if PROOF_DAY_TEXTURE.exists() else EARTH_DAY_TEXTURE
    use_precomposite = day_path == BEAUTY_COMPOSITE_TEXTURE or day_path == DARK_COMPOSITE_TEXTURE or day_path in VARIANT_TEXTURES.values() or day_path in REFERENCE_MATCH_TEXTURES.values() or day_path in MIDDLE_GROUND_TEXTURES.values()
    if day_path.exists():
        texcoord = nodes.new(type="ShaderNodeTexCoord")
        texture = nodes.new(type="ShaderNodeTexImage")
        texture.image = bpy.data.images.load(str(day_path))
        texture.extension = "REPEAT"
        color = nodes.new(type="ShaderNodeHueSaturation")
        color.inputs["Saturation"].default_value = 1.0
        color.inputs["Value"].default_value = 1.0
        contrast = nodes.new(type="ShaderNodeBrightContrast")
        contrast.inputs["Bright"].default_value = 0.0
        contrast.inputs["Contrast"].default_value = 0.10
        land_mix = nodes.new(type="ShaderNodeMix")
        land_mix.data_type = "RGBA"
        land_mix.factor_mode = "UNIFORM"
        land_mix.blend_type = "ADD"
        land_mix.inputs["Factor"].default_value = 0.24
        land_mix.inputs["B"].default_value = (0.16, 0.19, 0.17, 1.0)
        links.new(texcoord.outputs["UV"], texture.inputs["Vector"])
        links.new(texture.outputs["Color"], color.inputs["Color"])
        links.new(color.outputs["Color"], contrast.inputs["Color"])
        if use_precomposite:
            links.new(contrast.outputs["Color"], bsdf.inputs["Base Color"])
            if "Emission Color" in bsdf.inputs:
                links.new(contrast.outputs["Color"], bsdf.inputs["Emission Color"])
        else:
            links.new(contrast.outputs["Color"], land_mix.inputs["A"])
        if not use_precomposite and PROOF_LAND_MASK_TEXTURE.exists():
            mask = nodes.new(type="ShaderNodeTexImage")
            mask.image = bpy.data.images.load(str(PROOF_LAND_MASK_TEXTURE))
            mask.image.colorspace_settings.name = "Non-Color"
            mask.extension = "REPEAT"
            mask_ramp = nodes.new(type="ShaderNodeValToRGB")
            mask_ramp.color_ramp.elements[0].position = 0.12
            mask_ramp.color_ramp.elements[0].color = (0.0, 0.0, 0.0, 1.0)
            mask_ramp.color_ramp.elements[1].position = 0.58
            mask_ramp.color_ramp.elements[1].color = (1.0, 1.0, 1.0, 1.0)
            links.new(texcoord.outputs["UV"], mask.inputs["Vector"])
            links.new(mask.outputs["Color"], mask_ramp.inputs["Fac"])
            links.new(mask_ramp.outputs["Color"], land_mix.inputs["Factor"])
            surface_output = land_mix.outputs["Result"]
            if PROOF_COAST_MASK_TEXTURE.exists():
                coast = nodes.new(type="ShaderNodeTexImage")
                coast.image = bpy.data.images.load(str(PROOF_COAST_MASK_TEXTURE))
                coast.image.colorspace_settings.name = "Non-Color"
                coast.extension = "REPEAT"
                coast_ramp = nodes.new(type="ShaderNodeValToRGB")
                coast_ramp.color_ramp.elements[0].position = 0.18
                coast_ramp.color_ramp.elements[0].color = (0.0, 0.0, 0.0, 1.0)
                coast_ramp.color_ramp.elements[1].position = 0.72
                coast_ramp.color_ramp.elements[1].color = (1.0, 1.0, 1.0, 1.0)
                coast_mix = nodes.new(type="ShaderNodeMix")
                coast_mix.data_type = "RGBA"
                coast_mix.factor_mode = "UNIFORM"
                coast_mix.blend_type = "ADD"
                coast_mix.inputs["B"].default_value = (0.22, 0.21, 0.16, 1.0)
                links.new(texcoord.outputs["UV"], coast.inputs["Vector"])
                links.new(coast.outputs["Color"], coast_ramp.inputs["Fac"])
                links.new(coast_ramp.outputs["Color"], coast_mix.inputs["Factor"])
                links.new(surface_output, coast_mix.inputs["A"])
                surface_output = coast_mix.outputs["Result"]
            if PROOF_SURFACE_DETAIL_TEXTURE.exists():
                detail = nodes.new(type="ShaderNodeTexImage")
                detail.image = bpy.data.images.load(str(PROOF_SURFACE_DETAIL_TEXTURE))
                detail.image.colorspace_settings.name = "Non-Color"
                detail.extension = "REPEAT"
                detail_ramp = nodes.new(type="ShaderNodeValToRGB")
                detail_ramp.color_ramp.elements[0].position = 0.20
                detail_ramp.color_ramp.elements[0].color = (0.0, 0.0, 0.0, 1.0)
                detail_ramp.color_ramp.elements[1].position = 0.86
                detail_ramp.color_ramp.elements[1].color = (1.0, 1.0, 1.0, 1.0)
                detail_mix = nodes.new(type="ShaderNodeMix")
                detail_mix.data_type = "RGBA"
                detail_mix.factor_mode = "UNIFORM"
                detail_mix.blend_type = "ADD"
                detail_mix.inputs["B"].default_value = (0.12, 0.15, 0.16, 1.0)
                links.new(texcoord.outputs["UV"], detail.inputs["Vector"])
                links.new(detail.outputs["Color"], detail_ramp.inputs["Fac"])
                links.new(detail_ramp.outputs["Color"], detail_mix.inputs["Factor"])
                links.new(surface_output, detail_mix.inputs["A"])
                surface_output = detail_mix.outputs["Result"]
            links.new(surface_output, bsdf.inputs["Base Color"])
            if "Emission Color" in bsdf.inputs:
                links.new(surface_output, bsdf.inputs["Emission Color"])
        elif not use_precomposite:
            links.new(land_mix.outputs["Result"], bsdf.inputs["Base Color"])
            if "Emission Color" in bsdf.inputs:
                links.new(land_mix.outputs["Result"], bsdf.inputs["Emission Color"])
    else:
        bsdf.inputs["Base Color"].default_value = (0.006, 0.014, 0.024, 1.0)

    if EARTH_BUMP_TEXTURE.exists():
        texcoord = nodes.new(type="ShaderNodeTexCoord")
        bump_texture = nodes.new(type="ShaderNodeTexImage")
        bump_texture.image = bpy.data.images.load(str(EARTH_BUMP_TEXTURE))
        bump_texture.image.colorspace_settings.name = "Non-Color"
        bump = nodes.new(type="ShaderNodeBump")
        bump.inputs["Strength"].default_value = 0.045
        bump.inputs["Distance"].default_value = 0.030
        links.new(texcoord.outputs["UV"], bump_texture.inputs["Vector"])
        links.new(bump_texture.outputs["Color"], bump.inputs["Height"])
        links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])

    set_principled_input(material, "Alpha", 1.0)
    set_principled_input(material, "Roughness", 0.88)
    set_principled_input(material, "Metallic", 0.0)
    set_principled_input(material, "Specular IOR Level", 0.12)
    set_principled_input(material, "Coat Weight", 0.0)
    set_principled_input(material, "Transmission Weight", 0.0)
    set_principled_input(material, "Emission Strength", emission_strength)
    return material


def create_dark_base_material() -> bpy.types.Material:
    material = bpy.data.materials.new("proof_dark_night_base")
    material.use_nodes = True
    material.diffuse_color = (0.002, 0.006, 0.012, 1.0)
    material.blend_method = "OPAQUE"
    bsdf = material.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (0.002, 0.006, 0.012, 1.0)
        if "Alpha" in bsdf.inputs:
            bsdf.inputs["Alpha"].default_value = 1.0
        if "Roughness" in bsdf.inputs:
            bsdf.inputs["Roughness"].default_value = 0.90
        if "Specular IOR Level" in bsdf.inputs:
            bsdf.inputs["Specular IOR Level"].default_value = 0.08
    return material


def create_city_light_material() -> bpy.types.Material:
    material = bpy.data.materials.new("proof_warm_geographic_city_lights")
    material.use_nodes = True
    material.diffuse_color = (1.0, 0.62, 0.22, 1.0)
    material.blend_method = "BLEND"
    material.use_screen_refraction = False
    material.show_transparent_back = False

    nodes = material.node_tree.nodes
    nodes.clear()
    output = nodes.new(type="ShaderNodeOutputMaterial")
    transparent = nodes.new(type="ShaderNodeBsdfTransparent")
    emission = nodes.new(type="ShaderNodeEmission")
    add = nodes.new(type="ShaderNodeAddShader")
    links = material.node_tree.links
    links.new(transparent.outputs["BSDF"], add.inputs[0])
    links.new(emission.outputs["Emission"], add.inputs[1])
    links.new(add.outputs["Shader"], output.inputs["Surface"])

    city_path = PROOF_CITY_TEXTURE if PROOF_CITY_TEXTURE.exists() else EARTH_NIGHT_TEXTURE
    if city_path.exists():
        texcoord = nodes.new(type="ShaderNodeTexCoord")
        texture = nodes.new(type="ShaderNodeTexImage")
        texture.image = bpy.data.images.load(str(city_path))
        texture.extension = "REPEAT"
        warm = nodes.new(type="ShaderNodeMix")
        warm.data_type = "RGBA"
        warm.factor_mode = "UNIFORM"
        warm.blend_type = "MULTIPLY"
        warm.inputs["Factor"].default_value = 1.0
        warm.inputs["A"].default_value = (1.0, 0.56, 0.18, 1.0)
        links.new(texcoord.outputs["UV"], texture.inputs["Vector"])
        links.new(texture.outputs["Color"], warm.inputs["B"])
        links.new(warm.outputs["Result"], emission.inputs["Color"])
    else:
        emission.inputs["Color"].default_value = (1.0, 0.56, 0.18, 1.0)
    emission.inputs["Strength"].default_value = 2.8
    return material


def create_beauty_city_light_material() -> bpy.types.Material:
    material = create_city_light_material()
    material.name = "proof_beauty_warm_geographic_city_lights"
    nodes = material.node_tree.nodes
    emission = next((node for node in nodes if node.bl_idname == "ShaderNodeEmission"), None)
    texture = next((node for node in nodes if node.bl_idname == "ShaderNodeTexImage"), None)
    if texture and BEAUTY_CITY_EMISSION_TEXTURE.exists():
        texture.image = bpy.data.images.load(str(BEAUTY_CITY_EMISSION_TEXTURE))
    if emission:
        emission.inputs["Strength"].default_value = 3.1
    return material


def create_cloud_material() -> bpy.types.Material:
    material = bpy.data.materials.new("proof_subtle_cloud_breakup")
    material.use_nodes = True
    material.diffuse_color = (0.46, 0.54, 0.58, 0.05)
    material.blend_method = "BLEND"
    material.use_screen_refraction = False
    material.show_transparent_back = False
    nodes = material.node_tree.nodes
    bsdf = nodes.get("Principled BSDF")
    if not bsdf:
        return material

    bsdf.inputs["Base Color"].default_value = (0.46, 0.54, 0.58, 0.05)
    if "Alpha" in bsdf.inputs:
        bsdf.inputs["Alpha"].default_value = 0.05
    if "Roughness" in bsdf.inputs:
        bsdf.inputs["Roughness"].default_value = 0.92
    if EARTH_CLOUDS_TEXTURE.exists():
        texcoord = nodes.new(type="ShaderNodeTexCoord")
        texture = nodes.new(type="ShaderNodeTexImage")
        texture.image = bpy.data.images.load(str(EARTH_CLOUDS_TEXTURE))
        texture.extension = "REPEAT"
        color = nodes.new(type="ShaderNodeHueSaturation")
        color.inputs["Saturation"].default_value = 0.08
        color.inputs["Value"].default_value = 0.18
        material.node_tree.links.new(texcoord.outputs["UV"], texture.inputs["Vector"])
        material.node_tree.links.new(texture.outputs["Color"], color.inputs["Color"])
        material.node_tree.links.new(color.outputs["Color"], bsdf.inputs["Base Color"])
    return material


def create_atmosphere_material() -> bpy.types.Material:
    material = bpy.data.materials.new("proof_thin_rim_atmosphere_only")
    material.use_nodes = True
    material.diffuse_color = (0.04, 0.18, 0.32, 0.04)
    material.blend_method = "BLEND"
    material.use_screen_refraction = False
    material.show_transparent_back = False

    nodes = material.node_tree.nodes
    nodes.clear()
    output = nodes.new(type="ShaderNodeOutputMaterial")
    transparent = nodes.new(type="ShaderNodeBsdfTransparent")
    emission = nodes.new(type="ShaderNodeEmission")
    fresnel = nodes.new(type="ShaderNodeFresnel")
    mix = nodes.new(type="ShaderNodeMixShader")
    color = nodes.new(type="ShaderNodeValToRGB")
    color.color_ramp.elements[0].position = 0.54
    color.color_ramp.elements[0].color = (0.0, 0.0, 0.0, 1.0)
    color.color_ramp.elements[1].position = 1.0
    color.color_ramp.elements[1].color = (1.0, 1.0, 1.0, 1.0)
    fresnel.inputs["IOR"].default_value = 1.08
    emission.inputs["Color"].default_value = (0.04, 0.22, 0.42, 1.0)
    emission.inputs["Strength"].default_value = 0.12
    links = material.node_tree.links
    links.new(fresnel.outputs["Fac"], color.inputs["Fac"])
    links.new(color.outputs["Color"], mix.inputs["Fac"])
    links.new(transparent.outputs["BSDF"], mix.inputs[1])
    links.new(emission.outputs["Emission"], mix.inputs[2])
    links.new(mix.outputs["Shader"], output.inputs["Surface"])
    return material


def assign_material(obj: bpy.types.Object, material: bpy.types.Material) -> bpy.types.Object:
    obj.data.materials.append(material)
    return obj


def create_sphere(name: str, radius: float, material: bpy.types.Material) -> bpy.types.Object:
    bpy.ops.mesh.primitive_uv_sphere_add(segments=192, ring_count=96, radius=radius, location=(0, 0, 0))
    obj = bpy.context.object
    obj.name = name
    obj.rotation_euler = (0, 0, -0.38)
    assign_material(obj, material)
    return obj


def setup_scene() -> bpy.types.Camera:
    scene = bpy.context.scene
    available_engines = {item.identifier for item in scene.render.bl_rna.properties["engine"].enum_items}
    scene.render.engine = "BLENDER_EEVEE_NEXT" if "BLENDER_EEVEE_NEXT" in available_engines else "BLENDER_EEVEE"
    scene.world = bpy.data.worlds.new("globe_material_proof_world")
    scene.world.color = (0.0, 0.002, 0.006)
    if hasattr(scene, "eevee"):
        if hasattr(scene.eevee, "taa_render_samples"):
            scene.eevee.taa_render_samples = 96
        if hasattr(scene.eevee, "use_bloom"):
            scene.eevee.use_bloom = True
        if hasattr(scene.eevee, "bloom_intensity"):
            scene.eevee.bloom_intensity = 0.025

    scene.view_settings.view_transform = "Filmic"
    scene.view_settings.look = "Medium High Contrast"
    scene.view_settings.exposure = -0.15
    scene.view_settings.gamma = 1.0

    bpy.ops.object.light_add(type="AREA", location=(-2.8, -4.2, 3.2))
    key = bpy.context.object
    key.name = "proof_soft_key"
    key.data.energy = 450
    key.data.size = 4.0

    bpy.ops.object.light_add(type="POINT", location=(2.6, -2.0, -0.8))
    warm = bpy.context.object
    warm.name = "proof_warm_city_support"
    warm.data.energy = 14
    warm.data.color = (1.0, 0.58, 0.22)
    warm.data.shadow_soft_size = 5.0

    bpy.ops.object.camera_add(location=(0, -4.2, 0.18))
    camera = bpy.context.object
    camera.name = "globe_material_proof_camera"
    direction = Vector((0, 0, 0.03)) - camera.location
    camera.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
    camera.data.type = "ORTHO"
    camera.data.ortho_scale = 2.70
    return camera


def render(filepath: Path, camera: bpy.types.Camera, visible_objects: list[bpy.types.Object]) -> None:
    visible_names = {obj.name for obj in visible_objects}
    for obj in bpy.context.scene.objects:
        if obj.type not in {"CAMERA", "LIGHT"}:
            obj.hide_render = obj.name not in visible_names

    scene = bpy.context.scene
    scene.camera = camera
    scene.render.resolution_x = 1200
    scene.render.resolution_y = 1200
    scene.render.filepath = str(filepath)
    bpy.ops.render.render(write_still=True)


def paste_image(
    output_pixels: list[float],
    output_width: int,
    image_path: Path,
    slot_x: int,
    slot_y: int,
    slot_width: int,
    slot_height: int,
) -> None:
    image = bpy.data.images.load(str(image_path))
    source_width, source_height = image.size
    scale = min(slot_width / source_width, slot_height / source_height)
    target_width = max(1, int(source_width * scale))
    target_height = max(1, int(source_height * scale))
    image.scale(target_width, target_height)
    source_pixels = list(image.pixels[:])
    offset_x = slot_x + (slot_width - target_width) // 2
    offset_y = slot_y + (slot_height - target_height) // 2
    for y in range(target_height):
        for x in range(target_width):
            src_index = (y * target_width + x) * 4
            dst_index = ((offset_y + y) * output_width + offset_x + x) * 4
            output_pixels[dst_index : dst_index + 4] = source_pixels[src_index : src_index + 4]
    bpy.data.images.remove(image)


def create_proof_sheet() -> None:
    margin = 36
    gap = 32
    reference_slot = 900
    slot = 640
    width = margin * 2 + reference_slot + gap + slot * 2 + gap
    height = margin * 2 + slot * 2 + gap
    pixels = [0.010, 0.012, 0.016, 1.0] * (width * height)
    if REFERENCE_GLOBE_SPEC.exists():
        reference_y = margin + (height - margin * 2 - reference_slot) // 2
        paste_image(pixels, width, REFERENCE_GLOBE_SPEC, margin, reference_y, reference_slot, reference_slot)

    proof_x = margin + reference_slot + gap
    paste_image(pixels, width, OUTPUTS["nightEmissionOnly"], proof_x, margin + slot + gap, slot, slot)
    paste_image(pixels, width, OUTPUTS["dayOnly"], proof_x + slot + gap, margin + slot + gap, slot, slot)
    paste_image(pixels, width, OUTPUTS["withAtmosphere"], proof_x, margin, slot, slot)
    paste_image(pixels, width, OUTPUTS["noAtmosphere"], proof_x + slot + gap, margin, slot, slot)
    sheet = bpy.data.images.new("globe_material_proof_sheet", width=width, height=height, alpha=True)
    sheet.pixels.foreach_set(pixels)
    sheet.filepath_raw = str(OUTPUTS["proofSheet"])
    sheet.file_format = "PNG"
    sheet.save()
    bpy.data.images.remove(sheet)


def create_variant_sheet() -> None:
    margin = 36
    gap = 28
    reference_slot = 720
    slot = 560
    width = margin * 2 + reference_slot + gap + slot * 3 + gap * 2
    height = margin * 2 + max(reference_slot, slot)
    pixels = [0.010, 0.012, 0.016, 1.0] * (width * height)
    if REFERENCE_GLOBE_SPEC.exists():
        paste_image(pixels, width, REFERENCE_GLOBE_SPEC, margin, margin, reference_slot, reference_slot)

    x = margin + reference_slot + gap
    paste_image(pixels, width, VARIANT_OUTPUTS["referenceBalanced"], x, margin + (height - margin * 2 - slot) // 2, slot, slot)
    x += slot + gap
    paste_image(pixels, width, VARIANT_OUTPUTS["darkerCinematic"], x, margin + (height - margin * 2 - slot) // 2, slot, slot)
    x += slot + gap
    paste_image(pixels, width, VARIANT_OUTPUTS["richerSurface"], x, margin + (height - margin * 2 - slot) // 2, slot, slot)

    sheet = bpy.data.images.new("globe_material_variant_sheet", width=width, height=height, alpha=True)
    sheet.pixels.foreach_set(pixels)
    sheet.filepath_raw = str(OUTPUTS["variantSheet"])
    sheet.file_format = "PNG"
    sheet.save()
    bpy.data.images.remove(sheet)


def create_reference_match_sheet() -> None:
    margin = 36
    gap = 24
    reference_slot = 640
    slot = 470
    width = margin * 2 + reference_slot + gap + slot * 4 + gap * 3
    height = margin * 2 + max(reference_slot, slot)
    pixels = [0.010, 0.012, 0.016, 1.0] * (width * height)
    if REFERENCE_GLOBE_SPEC.exists():
        paste_image(pixels, width, REFERENCE_GLOBE_SPEC, margin, margin, reference_slot, reference_slot)

    x = margin + reference_slot + gap
    y = margin + (height - margin * 2 - slot) // 2
    for name in ("fill", "surface", "cityAtmosphere", "combined"):
        paste_image(pixels, width, REFERENCE_MATCH_OUTPUTS[name], x, y, slot, slot)
        x += slot + gap

    sheet = bpy.data.images.new("globe_reference_match_variant_sheet", width=width, height=height, alpha=True)
    sheet.pixels.foreach_set(pixels)
    sheet.filepath_raw = str(OUTPUTS["referenceMatchSheet"])
    sheet.file_format = "PNG"
    sheet.save()
    bpy.data.images.remove(sheet)


def create_middle_ground_sheet() -> None:
    margin = 36
    gap = 20
    reference_slot = 560
    slot = 380
    width = margin * 2 + reference_slot + gap + slot * 5 + gap * 4
    height = margin * 2 + max(reference_slot, slot)
    pixels = [0.010, 0.012, 0.016, 1.0] * (width * height)
    if REFERENCE_GLOBE_SPEC.exists():
        paste_image(pixels, width, REFERENCE_GLOBE_SPEC, margin, margin, reference_slot, reference_slot)

    x = margin + reference_slot + gap
    y = margin + (height - margin * 2 - slot) // 2
    for name in ("veryDarkNavyLift", "darkNavyLift", "balancedDeepNavy", "richDeepNavy", "maximumAcceptableNavy"):
        paste_image(pixels, width, MIDDLE_GROUND_OUTPUTS[name], x, y, slot, slot)
        x += slot + gap

    sheet = bpy.data.images.new("globe_middle_ground_variant_sheet", width=width, height=height, alpha=True)
    sheet.pixels.foreach_set(pixels)
    sheet.filepath_raw = str(OUTPUTS["middleGroundSheet"])
    sheet.file_format = "PNG"
    sheet.save()
    bpy.data.images.remove(sheet)


def create_beauty_sheet() -> None:
    margin = 36
    gap = 28
    reference_slot = 720
    slot = 500
    width = margin * 2 + reference_slot + gap + slot * 3 + gap * 2
    height = margin * 2 + reference_slot
    pixels = [0.010, 0.012, 0.016, 1.0] * (width * height)
    if REFERENCE_GLOBE_SPEC.exists():
        paste_image(pixels, width, REFERENCE_GLOBE_SPEC, margin, margin, reference_slot, reference_slot)

    x = margin + reference_slot + gap
    y = margin + (reference_slot - slot) // 2
    paste_image(pixels, width, OUTPUTS["beautyDayOnly"], x, y, slot, slot)
    paste_image(pixels, width, OUTPUTS["beautyNoAtmosphere"], x + slot + gap, y, slot, slot)
    paste_image(pixels, width, OUTPUTS["beautyWithAtmosphere"], x + (slot + gap) * 2, y, slot, slot)

    sheet = bpy.data.images.new("globe_beauty_composite_proof_sheet", width=width, height=height, alpha=True)
    sheet.pixels.foreach_set(pixels)
    sheet.filepath_raw = str(OUTPUTS["beautySheet"])
    sheet.file_format = "PNG"
    sheet.save()
    bpy.data.images.remove(sheet)


def write_debug_doc(texture_statuses: dict[str, str], passed: bool) -> None:
    lines = [
        "# Globe Material Debug Latest",
        "",
        f"Generated: {datetime.now(timezone.utc).isoformat()}",
        "",
        f"Status: **{'PASSED GLOBE MATERIAL PROOF' if passed else 'FAILED VARIANT PROOF - NOT READY FOR HERO REINSERTION'}**",
        "",
        "## Outputs",
        "",
        f"- Globe-only design spec: `{REFERENCE_GLOBE_SPEC.relative_to(REPO_ROOT)}`",
        "- Source day texture flat preview: `public/cinematic/previews/audit-earth-day-source-flat.png`",
        f"- Dark Earth composite: `{DARK_COMPOSITE_TEXTURE.relative_to(REPO_ROOT)}`",
        f"- Ocean depth mask: `{OCEAN_DEPTH_TEXTURE.relative_to(REPO_ROOT)}`",
        f"- Day only: `{OUTPUTS['dayOnly'].relative_to(REPO_ROOT)}`",
        f"- Night/city emission only: `{OUTPUTS['nightEmissionOnly'].relative_to(REPO_ROOT)}`",
        f"- No atmosphere: `{OUTPUTS['noAtmosphere'].relative_to(REPO_ROOT)}`",
        f"- With atmosphere: `{OUTPUTS['withAtmosphere'].relative_to(REPO_ROOT)}`",
        f"- Proof sheet: `{OUTPUTS['proofSheet'].relative_to(REPO_ROOT)}`",
        f"- Variant sheet: `{OUTPUTS['variantSheet'].relative_to(REPO_ROOT)}`",
        f"- Reference-match variant sheet: `{OUTPUTS['referenceMatchSheet'].relative_to(REPO_ROOT)}`",
        f"- Middle-ground variant sheet: `{OUTPUTS['middleGroundSheet'].relative_to(REPO_ROOT)}`",
        f"- Beauty composite proof sheet: `{OUTPUTS['beautySheet'].relative_to(REPO_ROOT)}`",
        f"- Beauty composite texture: `{BEAUTY_COMPOSITE_TEXTURE.relative_to(REPO_ROOT)}`",
        "",
        "## Reference Traits Used For Scoring",
        "",
        "- Deep navy/blue oceans with subtle tonal variation, not pure black.",
        "- Visible land and coastline structure without chalky pale land.",
        "- Warm golden city-light geography embedded into the planet surface.",
        "- Thin blue atmosphere rim, strongest near the edge/top, not a glass coating.",
        "- Subtle cloud/terrain breakup and strong cinematic depth.",
        "- Premium aviation-render Earth, not generic NASA texture, blue glass ball, black ball with lights, or flat map projection.",
        "",
        "## Variant Comparison",
        "",
        "| Variant | Score | Notes |",
        "| --- | ---: | --- |",
        "| Reference-Balanced Globe | 21/30 | Best current candidate; city lights and top land read well, but oceans and surface still lack the reference's rich integrated blue depth. |",
        "| Darker Cinematic Globe | 20/30 | Moodier but too black and too dependent on city lights. |",
        "| Richer Surface Globe | 21/30 | Slightly more surface energy, but still too dark and does not solve ocean/surface integration. |",
        "",
        "Best variant for next work: **Reference-Balanced Globe**. Full hero reinsertion remains blocked because best score is below 25/30 and overall match is still below 4/5.",
        "",
        "## Reference-Match Variant Comparison",
        "",
        "| Variant | Score | Notes |",
        "| --- | ---: | --- |",
        "| A. Reference Fill Match | 17/30 | Overcorrected into bright flat blue ocean and chalky land; no longer dark/premium enough. |",
        "| B. Surface Detail Match | 18/30 | Best of this failed set because it is slightly darker, but still too daytime and pale. |",
        "| C. City/Atmosphere Match | 18/30 | Similar to B with usable warmth, but the surface remains too bright and map-like. |",
        "| D. Combined Reference Push | 17/30 | Too saturated/bright blue and too chalky; not a reinsertion candidate. |",
        "",
        "Best reference-match variant: **B. Surface Detail Match**, narrowly. It is not ready for hero reinsertion because it remains below 25/30, has categories below 4/5, and overcorrects toward bright/daytime Earth.",
        "",
        "## Middle-Ground Variant Comparison",
        "",
        "| Variant | Score | Notes |",
        "| --- | ---: | --- |",
        "| 1. Very Dark Navy Lift | 20/30 | Safer darkness, but still too black and dependent on city lights. |",
        "| 2. Dark Navy Lift | 21/30 | Better ocean lift, but surface still under-integrated. |",
        "| 3. Balanced Deep Navy | 22/30 | Best current middle ground; not chalky or daytime, but still lacks reference richness. |",
        "| 4. Rich Deep Navy | 22/30 | More ocean color, but begins drifting toward saturated map-blue. |",
        "| 5. Maximum Acceptable Navy Fill | 21/30 | Too close to overbright boundary; less premium than Balanced. |",
        "",
        "Best middle-ground variant: **3. Balanced Deep Navy**. Settings: ocean `#07385e` at `0.18`, land `#141c19` at `0.16`, coast `#181610` at `0.08`, density `#07111b` at `0.09`, modulate `62,68,100`, contrast `-24x38`, colorize `18`.",
        "",
        "## Beauty Composite Proof",
        "",
        "| Category | Score | Notes |",
        "| --- | ---: | --- |",
        "| Opaque dark Earth surface | 4/5 | Uses `earth_beauty_composite.png` as the main opaque surface. |",
        "| Day-surface land/coastline readability | 3/5 | Surface reads better than the black versions, but land/ice is still too raw in places. |",
        "| Deep ocean control | 3/5 | Oceans remain dark with more blue fill, but still miss the reference's integrated richness. |",
        "| Warm geographic city lights | 4/5 | Separate warm emission remains geography-shaped. |",
        "| Atmosphere restraint | 4/5 | Atmosphere remains a thin rim only. |",
        "| Overall match to globe-only design spec | 3/5 | Improved beauty texture stack, but still below premium reference match. |",
        "| **Total** | **21/30** | **Failed; do not reinsert into hero.** |",
        "",
        "## Globe-Only Reference Rubric",
        "",
        "Scores are 0-5 and are judged against `docs/landing/references/jmpseat-globe-material-reference.jpg`. This material proof intentionally excludes aircraft and route arcs until the globe surface itself passes.",
        "",
        "| Category | Score | Notes |",
        "| --- | ---: | --- |",
        "| Opaque dark Earth surface | 4/5 | Main globe is opaque, solid, and no longer driven by glass/transmission. |",
        "| Day-surface land/coastline readability | 3/5 | Variants show readable land in the lit/top region, but the surface still drops too quickly into black. |",
        "| Deep ocean control | 3/5 | Oceans stayed dark, but the blue tonality is not yet rich or integrated like the supplied reference. |",
        "| Warm geographic city lights | 4/5 | City lights are warm and geography-shaped, but not yet as dense/refined as the reference. |",
        "| Atmosphere restraint | 4/5 | Rim is thin and secondary; it no longer coats the front face like cyan glass. |",
        "| Overall match to globe-only design spec | 2/5 | The variants remain visibly below the supplied jmpseat reference globe. |",
        "| **Total** | **21/30** | **Failed; do not reinsert into hero.** |",
        "",
        "## Source Texture Audit",
        "",
        "- Source texture resolution: `earth_day.jpg` is `4096x2048`, which is usable for this previs stage.",
        "- Flat source preview: `public/cinematic/previews/audit-earth-day-source-flat.png`.",
        "- Source quality result: usable. The source contains recognizable equirectangular land, coastlines, ice, and terrain detail; the blocker is the cinematic dark-material conversion, not a missing or unusable source file.",
        "- Replacement decision: no replacement texture was fetched in this pass. Continue tuning the local material/detail pipeline before sourcing a new day map.",
        "- Limitation: the source has strong polar ice and uneven cloud/terrain density, so reaching the supplied spec may still require a more art-directed composite or higher-detail production texture later.",
        "",
        "## Checks",
        "",
        "- UV mapping works: yes. The day and night maps remain geographically aligned on matching UV sphere geometry.",
        "- Day texture is visible: partially. The best variant reads in the upper/lit region but still lacks consistent premium surface richness.",
        "- Night texture is warm/gold: yes. City-light geography remains amber/gold rather than blue.",
        "- City lights are geography-shaped: yes. The light map follows recognizable North America, Central America, South America, and coastal structure.",
        "- Atmosphere overpowering the surface: no. The atmosphere is thin and secondary in the with-atmosphere proof.",
        "- Globe still reads as glass: no, but the current variants still read too much like dark spheres with city lights.",
        "",
        "## Material Settings Changed",
        "",
        "- Main Earth material is `OPAQUE` with `Alpha = 1.0`.",
        "- Screen refraction is disabled on all proof materials.",
        "- Transmission weight is set to `0.0` when available.",
        "- Coat/clearcoat weight is set to `0.0` when available.",
        "- Specular IOR level is reduced to `0.12` on the main Earth surface.",
        "- Roughness is raised to `0.88` on the main Earth surface.",
        "- `earth_dark_composite.png` is now the main opaque surface texture.",
        "- `earth_ocean_depth.png` adds restrained deep-blue ocean tonality inside the composite.",
        "- The legacy proof day map is retained only as a comparison/debug derivative of `earth_day.jpg`.",
        "- A local land/continent mask derivative lifts land and coastline contrast without brightening the ocean field.",
        "- A separate coastline/detail mask adds a restrained surface-only contour lift for coast readability.",
        "- A land-gated surface density map adds subtle terrain/cloud texture without lifting open ocean.",
        "- The proof city-light map is a local warm amber/gold derivative of `earth_night.jpg`.",
        "- Atmosphere is a separate Fresnel rim material with transparent front face and low emission strength.",
        "- Clouds are a separate low-alpha shell and are not part of the main Earth surface.",
        "",
        "## Texture Preparation",
        "",
        f"- Dark Earth composite: {texture_statuses.get('darkComposite', 'not attempted')}",
        f"- Variant composites: {texture_statuses.get('variants', 'not attempted')}",
        f"- Reference-match composites: {texture_statuses.get('referenceMatchVariants', 'not attempted')}",
        f"- Middle-ground composites: {texture_statuses.get('middleGroundVariants', 'not attempted')}",
        f"- Beauty composite stack: {texture_statuses.get('beautyComposite', 'not attempted')}",
        f"- Legacy proof day texture: {texture_statuses.get('legacyDay', 'not attempted')}",
        f"- Land/continent mask: {texture_statuses.get('landMask', 'not attempted')}",
        f"- Ocean depth mask: {texture_statuses.get('oceanDepth', 'not attempted')}",
        f"- Coastline/detail mask: {texture_statuses.get('coastMask', 'not attempted')}",
        f"- Surface density map: {texture_statuses.get('surfaceDetail', 'not attempted')}",
        f"- Night texture: {texture_statuses.get('night', 'not attempted')}",
        "",
        "## Hard Stop",
        "",
        "Do not return to full hero contact-sheet iteration until this proof shows visible continents, dark oceans, warm geography-shaped city lights, an opaque Earth surface, thin atmosphere only, and no cyan glass-ball look.",
        "",
        "## Next Single Correction",
        "",
        "Continue globe-proof only. Use Reference-Balanced as the base, then add a viewport-facing blue ocean/terrain fill or improve lighting so the mid-face ocean reads rich navy instead of black without making land chalky or cyan.",
        "",
    ]
    DOC_PATH.write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    ensure_dirs()
    texture_statuses = prepare_proof_textures()
    prepare_variant_textures(texture_statuses)
    prepare_reference_match_textures(texture_statuses)
    prepare_middle_ground_textures(texture_statuses)
    prepare_beauty_textures(texture_statuses)
    reset_scene()
    camera = setup_scene()
    earth = create_sphere("proof_earth_surface", 1.0, create_earth_surface_material())
    night_base = create_sphere("proof_night_base", 1.0, create_dark_base_material())
    city = create_sphere("proof_city_light_shell", 1.004, create_city_light_material())
    cloud = create_sphere("proof_cloud_shell", 1.012, create_cloud_material())
    atmosphere = create_sphere("proof_atmosphere_shell", 1.045, create_atmosphere_material())
    beauty_earth = create_sphere("proof_beauty_earth_surface", 1.0, create_earth_surface_material(BEAUTY_COMPOSITE_TEXTURE, emission_strength=0.075))
    beauty_city = create_sphere("proof_beauty_city_light_shell", 1.004, create_beauty_city_light_material())

    render(OUTPUTS["dayOnly"], camera, [earth])
    render(OUTPUTS["nightEmissionOnly"], camera, [night_base, city])
    render(OUTPUTS["noAtmosphere"], camera, [earth, city, cloud])
    render(OUTPUTS["withAtmosphere"], camera, [earth, city, cloud, atmosphere])

    variant_earths = {
        name: create_sphere(f"proof_variant_{name}", 1.0, create_earth_surface_material(texture, emission_strength=0.085))
        for name, texture in VARIANT_TEXTURES.items()
    }
    for name, variant_earth in variant_earths.items():
        render(VARIANT_OUTPUTS[name], camera, [variant_earth, city, cloud, atmosphere])

    reference_match_earths = {
        name: create_sphere(f"proof_reference_match_{name}", 1.0, create_earth_surface_material(texture, emission_strength=0.105))
        for name, texture in REFERENCE_MATCH_TEXTURES.items()
    }
    for name, reference_match_earth in reference_match_earths.items():
        render(REFERENCE_MATCH_OUTPUTS[name], camera, [reference_match_earth, city, cloud, atmosphere])

    middle_ground_earths = {
        name: create_sphere(f"proof_middle_ground_{name}", 1.0, create_earth_surface_material(texture, emission_strength=0.095))
        for name, texture in MIDDLE_GROUND_TEXTURES.items()
    }
    for name, middle_ground_earth in middle_ground_earths.items():
        render(MIDDLE_GROUND_OUTPUTS[name], camera, [middle_ground_earth, city, cloud, atmosphere])

    render(OUTPUTS["beautyDayOnly"], camera, [beauty_earth])
    render(OUTPUTS["beautyNoAtmosphere"], camera, [beauty_earth, beauty_city, cloud])
    render(OUTPUTS["beautyWithAtmosphere"], camera, [beauty_earth, beauty_city, cloud, atmosphere])

    create_proof_sheet()
    create_variant_sheet()
    create_reference_match_sheet()
    create_middle_ground_sheet()
    create_beauty_sheet()
    write_debug_doc(texture_statuses, passed=False)
    print(f"Globe material proof outputs written under {PREVIEW_DIR}")
    print(f"Debug doc written to {DOC_PATH}")


if __name__ == "__main__":
    main()
