"""Build jmpseat cinematic hero previs assets with Blender.

Run from the repo root:
  blender --background --python tools/cinematic/build_jmpseat_hero_scene.py

This script intentionally creates first-pass blockout assets, not final art.
It gives the web scene real GLB geometry and camera validation renders so the
next R3F slice does not drift back into CSS-only mockups.
"""

from __future__ import annotations

import json
import math
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

import bpy
from mathutils import Vector


SCRIPT_PATH = Path(__file__).resolve()
REPO_ROOT = SCRIPT_PATH.parents[2]
PUBLIC_ROOT = REPO_ROOT / "public" / "cinematic"
MODEL_DIR = PUBLIC_ROOT / "models"
TEXTURE_DIR = PUBLIC_ROOT / "textures"
PREVIEW_DIR = PUBLIC_ROOT / "previews"
MANIFEST_PATH = PUBLIC_ROOT / "manifest.json"
REFERENCE_DIR = REPO_ROOT / "docs" / "landing" / "references"
RENDER_REVIEW_PATH = REPO_ROOT / "docs" / "landing" / "render-review-latest.md"
EARTH_DAY_TEXTURE = TEXTURE_DIR / "earth_day.jpg"
EARTH_NIGHT_TEXTURE = TEXTURE_DIR / "earth_night.jpg"
EARTH_CLOUDS_TEXTURE = TEXTURE_DIR / "earth_clouds.png"
EARTH_BUMP_TEXTURE = TEXTURE_DIR / "earth_bump.jpg"
EARTH_SPECULAR_TEXTURE = TEXTURE_DIR / "earth_specular.jpg"
EARTH_DAY_CINEMATIC_TEXTURE = TEXTURE_DIR / "earth_day_cinematic.jpg"
EARTH_CITY_LIGHTS_CINEMATIC_TEXTURE = TEXTURE_DIR / "earth_city_lights_cinematic.png"

ASSET_PATHS = {
    "scannerPrinter": MODEL_DIR / "jmpseat-scanner-printer.glb",
    "ticketPlane": MODEL_DIR / "jmpseat-ticket-plane.glb",
    "aircraft": MODEL_DIR / "jmpseat-aircraft.glb",
    "globeHelpers": MODEL_DIR / "jmpseat-globe-helpers.glb",
    "routeGuides": MODEL_DIR / "jmpseat-route-guides.glb",
    "mobilePreview": PREVIEW_DIR / "jmpseat-hero-mobile-preview.png",
    "desktopPreview": PREVIEW_DIR / "jmpseat-hero-desktop-preview.png",
    "contactSheet": PREVIEW_DIR / "jmpseat-hero-contact-sheet.png",
    "debugEarthDay": PREVIEW_DIR / "debug-earth-day-only.png",
    "debugEarthNight": PREVIEW_DIR / "debug-earth-night-city-lights-only.png",
    "debugEarthFinal": PREVIEW_DIR / "debug-earth-final-material.png",
    "debugEarthFinalNoAtmosphere": PREVIEW_DIR / "debug-earth-final-no-atmosphere.png",
    "debugEarthFinalWithAtmosphere": PREVIEW_DIR / "debug-earth-final-with-atmosphere.png",
}

REFERENCE_PATHS = {
    "mobileReference": REFERENCE_DIR / "jmpseatwaitlistglobemobile.jpeg",
    "desktopReference": REFERENCE_DIR / "jmpseatwaitlistglobedesktop.jpeg",
}

REVIEW_SCORES = [
    ("Mobile framing accuracy", 3, "The mobile render has the right stack, but the camera/ticket pass still reads too tabletop and does not yet match the long vertical boarding-pass reference."),
    ("Desktop framing accuracy", 4, "The desktop render is aligned to the reference silhouette with centered globe, scanner, wide foreground ticket, and negative space."),
    ("Globe depth/cinematic quality", 3, "The debug globe now reads as a darker opaque Earth with warm surface lights, but the final hero still needs clearer continent mass and richer Earth texture before it is close to reference."),
    ("Atmosphere subtlety", 4, "The atmosphere is no longer overpowering the surface in the debug renders; it now behaves more like a restrained edge support layer."),
    ("City light quality", 3, "City lights are now warm/gold and geographically mapped, but they still need more premium density and integration in the final hero frame."),
    ("Route arc elegance", 4, "Thin blue and amber arcs wrap around the globe without becoming thick neon clutter."),
    ("Aircraft readability", 3, "At least three small aircraft are visible, but their lighting and silhouettes remain blockout quality."),
    ("Scanner/printer physicality", 4, "The scanner has bevels, layered hard-surface body panels, recessed slot depth, amber strips, and reflective highlights."),
    ("Ticket readability", 3, "The ticket has boarding-pass structure and text, but mobile perspective still makes it feel too much like a tabletop card."),
    ("ENTER CTA visibility", 5, "The ENTER CTA is centered, fully visible, readable, and physically integrated into the ticket foreground."),
    ("Overall premium/cinematic feel", 3, "The scene is directionally cinematic, but globe material quality and mobile camera angle keep it below the premium reference bar."),
]


def ensure_dirs() -> None:
    for directory in (MODEL_DIR, TEXTURE_DIR, PREVIEW_DIR, REFERENCE_DIR):
        directory.mkdir(parents=True, exist_ok=True)


def run_magick(command: list[str]) -> bool:
    try:
        subprocess.run(command, cwd=REPO_ROOT, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        return True
    except (FileNotFoundError, subprocess.CalledProcessError):
        return False


def prepare_cinematic_globe_textures() -> None:
    if EARTH_DAY_TEXTURE.exists():
        run_magick(
            [
                "magick",
                str(EARTH_DAY_TEXTURE),
                "-resize",
                "4096x2048!",
                "-colorspace",
                "sRGB",
                "-modulate",
                "48,118,100",
                "-brightness-contrast",
                "-34x48",
                "-level",
                "7%,94%",
                "-fill",
                "#01040b",
                "-colorize",
                "26",
                "-quality",
                "92",
                str(EARTH_DAY_CINEMATIC_TEXTURE),
            ]
        )

    if EARTH_NIGHT_TEXTURE.exists():
        run_magick(
            [
                "magick",
                str(EARTH_NIGHT_TEXTURE),
                "-resize",
                "4096x2048!",
                "-colorspace",
                "Gray",
                "-auto-level",
                "-sigmoidal-contrast",
                "7,42%",
                "-level",
                "18%,100%",
                "-colorspace",
                "sRGB",
                "-fill",
                "#ffb14a",
                "-tint",
                "100",
                "-background",
                "black",
                "-alpha",
                "remove",
                "-alpha",
                "off",
                str(EARTH_CITY_LIGHTS_CINEMATIC_TEXTURE),
            ]
        )


def reset_scene() -> None:
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete()
    bpy.context.scene.unit_settings.system = "METRIC"


def create_principled_material(
    name: str,
    color: tuple[float, float, float, float],
    roughness: float = 0.45,
    metallic: float = 0.0,
    alpha: float = 1.0,
    emission: tuple[float, float, float, float] | None = None,
    emission_strength: float = 0.0,
) -> bpy.types.Material:
    material = bpy.data.materials.new(name)
    material.use_nodes = True
    material.diffuse_color = color
    material.use_screen_refraction = False
    material.blend_method = "BLEND" if alpha < 1.0 else "OPAQUE"
    material.show_transparent_back = False

    bsdf = material.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        if "Base Color" in bsdf.inputs:
            bsdf.inputs["Base Color"].default_value = color
        if "Roughness" in bsdf.inputs:
            bsdf.inputs["Roughness"].default_value = roughness
        if "Metallic" in bsdf.inputs:
            bsdf.inputs["Metallic"].default_value = metallic
        if "Alpha" in bsdf.inputs:
            bsdf.inputs["Alpha"].default_value = alpha
        if emission and "Emission Color" in bsdf.inputs:
            bsdf.inputs["Emission Color"].default_value = emission
        if "Emission Strength" in bsdf.inputs:
            bsdf.inputs["Emission Strength"].default_value = emission_strength

    return material


def create_image_material(
    name: str,
    image_path: Path,
    fallback_color: tuple[float, float, float, float],
    roughness: float = 0.52,
    emission_strength: float = 0.0,
    alpha: float = 1.0,
    saturation: float = 1.0,
    value: float = 1.0,
) -> bpy.types.Material:
    if not image_path.exists():
        return create_principled_material(name, fallback_color, roughness)

    material = bpy.data.materials.new(name)
    material.use_nodes = True
    material.diffuse_color = fallback_color
    material.blend_method = "BLEND" if alpha < 1.0 else "OPAQUE"
    material.show_transparent_back = False
    nodes = material.node_tree.nodes
    bsdf = nodes.get("Principled BSDF")
    texture = nodes.new(type="ShaderNodeTexImage")
    texture.image = bpy.data.images.load(str(image_path))
    texture.extension = "REPEAT"
    color_output = texture.outputs["Color"]
    if saturation != 1.0 or value != 1.0:
        adjust = nodes.new(type="ShaderNodeHueSaturation")
        adjust.inputs["Saturation"].default_value = saturation
        adjust.inputs["Value"].default_value = value
        material.node_tree.links.new(color_output, adjust.inputs["Color"])
        color_output = adjust.outputs["Color"]
    material.node_tree.links.new(color_output, bsdf.inputs["Base Color"])
    if "Roughness" in bsdf.inputs:
        bsdf.inputs["Roughness"].default_value = roughness
    if "Alpha" in bsdf.inputs:
        bsdf.inputs["Alpha"].default_value = alpha
    if "Emission Color" in bsdf.inputs:
        material.node_tree.links.new(color_output, bsdf.inputs["Emission Color"])
    if "Emission Strength" in bsdf.inputs:
        bsdf.inputs["Emission Strength"].default_value = emission_strength
    return material


def create_earth_surface_material(
    name: str,
    day_texture: Path,
    bump_texture: Path,
    specular_texture: Path,
) -> bpy.types.Material:
    material = bpy.data.materials.new(name)
    material.use_nodes = True
    material.diffuse_color = (0.015, 0.046, 0.078, 1)
    nodes = material.node_tree.nodes
    links = material.node_tree.links
    bsdf = nodes.get("Principled BSDF")

    if bsdf:
        if day_texture.exists():
            texcoord = nodes.new(type="ShaderNodeTexCoord")
            day = nodes.new(type="ShaderNodeTexImage")
            day.image = bpy.data.images.load(str(day_texture))
            day.extension = "REPEAT"
            links.new(texcoord.outputs["UV"], day.inputs["Vector"])
            darken = nodes.new(type="ShaderNodeHueSaturation")
            darken.inputs["Saturation"].default_value = 0.95
            darken.inputs["Value"].default_value = 0.92
            contrast = nodes.new(type="ShaderNodeBrightContrast")
            contrast.inputs["Bright"].default_value = -0.015
            contrast.inputs["Contrast"].default_value = 0.22
            links.new(day.outputs["Color"], darken.inputs["Color"])
            links.new(darken.outputs["Color"], contrast.inputs["Color"])
            links.new(contrast.outputs["Color"], bsdf.inputs["Base Color"])
        else:
            bsdf.inputs["Base Color"].default_value = (0.004, 0.018, 0.034, 1)

        if "Roughness" in bsdf.inputs:
            bsdf.inputs["Roughness"].default_value = 0.82
        if "Metallic" in bsdf.inputs:
            bsdf.inputs["Metallic"].default_value = 0.0
        if "Alpha" in bsdf.inputs:
            bsdf.inputs["Alpha"].default_value = 1.0
        if "Specular IOR Level" in bsdf.inputs:
            bsdf.inputs["Specular IOR Level"].default_value = 0.18

        if bump_texture.exists():
            bump_image = nodes.new(type="ShaderNodeTexImage")
            bump_image.image = bpy.data.images.load(str(bump_texture))
            bump_image.extension = "REPEAT"
            bump_image.image.colorspace_settings.name = "Non-Color"
            bump_node = nodes.new(type="ShaderNodeBump")
            bump_node.inputs["Strength"].default_value = 0.085
            bump_node.inputs["Distance"].default_value = 0.055
            links.new(bump_image.outputs["Color"], bump_node.inputs["Height"])
            links.new(bump_node.outputs["Normal"], bsdf.inputs["Normal"])

    return material


def create_city_light_texture_material(
    name: str,
    night_texture: Path,
) -> bpy.types.Material:
    material = bpy.data.materials.new(name)
    material.use_nodes = True
    material.diffuse_color = (1.0, 0.58, 0.18, 1)
    material.blend_method = "BLEND"
    material.show_transparent_back = False
    material.use_screen_refraction = False

    nodes = material.node_tree.nodes
    nodes.clear()
    output = nodes.new(type="ShaderNodeOutputMaterial")
    transparent = nodes.new(type="ShaderNodeBsdfTransparent")
    emission = nodes.new(type="ShaderNodeEmission")
    add = nodes.new(type="ShaderNodeAddShader")
    material.node_tree.links.new(transparent.outputs["BSDF"], add.inputs[0])
    material.node_tree.links.new(emission.outputs["Emission"], add.inputs[1])
    material.node_tree.links.new(add.outputs["Shader"], output.inputs["Surface"])

    if night_texture.exists():
        texcoord = nodes.new(type="ShaderNodeTexCoord")
        texture = nodes.new(type="ShaderNodeTexImage")
        texture.image = bpy.data.images.load(str(night_texture))
        texture.extension = "REPEAT"
        material.node_tree.links.new(texcoord.outputs["UV"], texture.inputs["Vector"])
        multiply = nodes.new(type="ShaderNodeMix")
        multiply.data_type = "RGBA"
        multiply.factor_mode = "UNIFORM"
        multiply.blend_type = "MULTIPLY"
        multiply.inputs["Factor"].default_value = 1.0
        multiply.inputs["A"].default_value = (1.0, 0.62, 0.20, 1)
        material.node_tree.links.new(texture.outputs["Color"], multiply.inputs["B"])
        material.node_tree.links.new(multiply.outputs["Result"], emission.inputs["Color"])
    else:
        emission.inputs["Color"].default_value = (1.0, 0.50, 0.13, 1)

    emission.inputs["Strength"].default_value = 2.2
    return material


def create_alpha_texture_material(
    name: str,
    image_path: Path,
    color: tuple[float, float, float, float],
    alpha: float,
    emission_strength: float = 0.0,
    saturation: float = 1.0,
    value: float = 1.0,
) -> bpy.types.Material:
    material = bpy.data.materials.new(name)
    material.use_nodes = True
    material.diffuse_color = color
    material.blend_method = "BLEND"
    material.show_transparent_back = False
    material.use_screen_refraction = False
    nodes = material.node_tree.nodes
    links = material.node_tree.links
    bsdf = nodes.get("Principled BSDF")

    if bsdf:
        bsdf.inputs["Base Color"].default_value = color
        if "Alpha" in bsdf.inputs:
            bsdf.inputs["Alpha"].default_value = alpha
        if "Roughness" in bsdf.inputs:
            bsdf.inputs["Roughness"].default_value = 0.72
        if image_path.exists():
            texcoord = nodes.new(type="ShaderNodeTexCoord")
            texture = nodes.new(type="ShaderNodeTexImage")
            texture.image = bpy.data.images.load(str(image_path))
            texture.extension = "REPEAT"
            links.new(texcoord.outputs["UV"], texture.inputs["Vector"])
            color_output = texture.outputs["Color"]
            if saturation != 1.0 or value != 1.0:
                adjust = nodes.new(type="ShaderNodeHueSaturation")
                adjust.inputs["Saturation"].default_value = saturation
                adjust.inputs["Value"].default_value = value
                links.new(color_output, adjust.inputs["Color"])
                color_output = adjust.outputs["Color"]
            links.new(color_output, bsdf.inputs["Base Color"])
        if "Emission Color" in bsdf.inputs:
            bsdf.inputs["Emission Color"].default_value = color
        if "Emission Strength" in bsdf.inputs:
            bsdf.inputs["Emission Strength"].default_value = emission_strength

    return material


def assign_material(obj: bpy.types.Object, material: bpy.types.Material) -> bpy.types.Object:
    obj.data.materials.append(material)
    return obj


def cube_obj(
    name: str,
    location: tuple[float, float, float],
    dimensions: tuple[float, float, float],
    material: bpy.types.Material,
    bevel: float = 0.0,
) -> bpy.types.Object:
    bpy.ops.mesh.primitive_cube_add(size=1, location=location)
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = dimensions
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    assign_material(obj, material)

    if bevel > 0:
        bevel_mod = obj.modifiers.new(f"{name}_bevel", "BEVEL")
        bevel_mod.width = bevel
        bevel_mod.segments = 8
        bevel_mod.affect = "EDGES"
        normal_mod = obj.modifiers.new(f"{name}_weighted_normals", "WEIGHTED_NORMAL")
        normal_mod.keep_sharp = True

    return obj


def create_collection(name: str) -> bpy.types.Collection:
    collection = bpy.data.collections.new(name)
    bpy.context.scene.collection.children.link(collection)
    return collection


def move_to_collection(objects: list[bpy.types.Object], collection: bpy.types.Collection) -> None:
    for obj in objects:
        collection.objects.link(obj)
        for existing in obj.users_collection:
            if existing != collection:
                existing.objects.unlink(obj)


def select_only(objects: list[bpy.types.Object]) -> None:
    bpy.ops.object.select_all(action="DESELECT")
    for obj in objects:
        obj.select_set(True)
    if objects:
        bpy.context.view_layer.objects.active = objects[0]


def export_glb(objects: list[bpy.types.Object], filepath: Path) -> None:
    select_only(objects)
    bpy.ops.export_scene.gltf(
        filepath=str(filepath),
        export_format="GLB",
        use_selection=True,
        export_apply=True,
        export_materials="EXPORT",
    )


def create_scanner(materials: dict[str, bpy.types.Material]) -> list[bpy.types.Object]:
    parts = [
        cube_obj("scanner_body", (0, 0, 0.34), (4.78, 1.34, 0.70), materials["gloss_black"], bevel=0.18),
        cube_obj("scanner_front_face", (0, -0.66, 0.42), (4.32, 0.22, 0.42), materials["soft_black"], bevel=0.075),
        cube_obj("scanner_top_lip", (0, -0.34, 0.80), (4.32, 0.34, 0.18), materials["soft_black"], bevel=0.09),
        cube_obj("scanner_top_highlight", (0, -0.44, 0.91), (3.92, 0.028, 0.028), materials["cool_highlight"], bevel=0.014),
        cube_obj("scanner_slot_recess", (0, -0.79, 0.48), (3.98, 0.10, 0.28), materials["slot_black"], bevel=0.035),
        cube_obj("scanner_inner_shadow", (0, -0.86, 0.43), (3.58, 0.08, 0.20), materials["black_void"], bevel=0.025),
        cube_obj("scanner_amber_strip_left", (-1.20, -0.88, 0.64), (1.22, 0.04, 0.06), materials["amber_light"], bevel=0.02),
        cube_obj("scanner_amber_strip_right", (1.20, -0.88, 0.64), (1.22, 0.04, 0.06), materials["amber_light"], bevel=0.02),
        cube_obj("scanner_left_side_round", (-2.22, -0.05, 0.42), (0.32, 1.04, 0.52), materials["gloss_black"], bevel=0.14),
        cube_obj("scanner_right_side_round", (2.22, -0.05, 0.42), (0.32, 1.04, 0.52), materials["gloss_black"], bevel=0.14),
        cube_obj("scanner_left_foot", (-1.74, 0.36, 0.06), (0.72, 0.38, 0.12), materials["slot_black"], bevel=0.06),
        cube_obj("scanner_right_foot", (1.74, 0.36, 0.06), (0.72, 0.38, 0.12), materials["slot_black"], bevel=0.06),
    ]
    collection = create_collection("ScannerSystem_GLB")
    move_to_collection(parts, collection)
    return parts


def create_ticket(materials: dict[str, bpy.types.Material]) -> list[bpy.types.Object]:
    ticket = cube_obj("ticket_plane", (0, -2.35, 0.13), (4.18, 3.78, 0.035), materials["ticket_stock"], bevel=0.10)
    border_top = cube_obj("ticket_subtle_top_rule", (0, -1.20, 0.153), (3.58, 0.015, 0.006), materials["ticket_ink"], bevel=0.002)
    border_mid = cube_obj("ticket_subtle_mid_rule", (0, -2.38, 0.153), (3.58, 0.015, 0.006), materials["ticket_ink"], bevel=0.002)
    border_bottom = cube_obj("ticket_subtle_bottom_rule", (0, -3.34, 0.153), (3.58, 0.015, 0.006), materials["ticket_ink"], bevel=0.002)
    cta_plate = cube_obj("ticket_cta_physical_plate", (0, -4.02, 0.19), (1.92, 0.38, 0.06), materials["soft_black"], bevel=0.12)
    cta_edge = cube_obj("ticket_cta_amber_edge", (0, -4.225, 0.205), (1.62, 0.025, 0.022), materials["amber_light"], bevel=0.012)
    barcode_back = cube_obj("ticket_barcode_rule", (0, -3.58, 0.166), (2.18, 0.025, 0.008), materials["ticket_ink"], bevel=0.001)

    bpy.ops.object.text_add(location=(-0.44, -3.43, 0.242), rotation=(0, 0, 0))
    cta_text = bpy.context.object
    cta_text.name = "ticket_cta_enter_text"
    cta_text.data.body = "ENTER"
    cta_text.data.align_x = "LEFT"
    cta_text.data.align_y = "CENTER"
    cta_text.data.size = 0.18
    cta_text.data.extrude = 0.004
    cta_text.data.materials.append(materials["cta_text"])

    cta_text.location = (-0.46, -4.05, 0.242)

    label_specs = [
        ("ticket_label_passenger", "PASSENGER", (-1.62, -1.04, 0.18), 0.085),
        ("ticket_value_passenger", "AVIATION WORKER", (-1.62, -1.18, 0.18), 0.105),
        ("ticket_label_date", "DATE", (0.62, -1.04, 0.18), 0.085),
        ("ticket_value_date", "24 MAY 2026", (0.62, -1.18, 0.18), 0.105),
        ("ticket_label_from", "FROM", (-1.24, -1.72, 0.18), 0.09),
        ("ticket_value_from", "JFK", (-1.24, -1.98, 0.18), 0.34),
        ("ticket_label_to", "TO", (0.86, -1.72, 0.18), 0.09),
        ("ticket_value_to", "CDG", (0.86, -1.98, 0.18), 0.34),
        ("ticket_label_gate", "GATE  A24", (-1.50, -2.82, 0.18), 0.11),
        ("ticket_label_boarding", "BOARDING  19:30", (-0.46, -2.82, 0.18), 0.11),
        ("ticket_label_seat", "SEAT  24A", (0.94, -2.82, 0.18), 0.11),
        ("ticket_group", "GROUP  A", (-0.26, -3.12, 0.18), 0.105),
        ("ticket_welcome", "WELCOME ABOARD", (-0.56, -3.48, 0.18), 0.07),
    ]
    text_parts = [cta_text]
    for name, body, location, size in label_specs:
        bpy.ops.object.text_add(location=location, rotation=(0, 0, 0))
        label = bpy.context.object
        label.name = name
        label.data.body = body
        label.data.align_x = "LEFT"
        label.data.align_y = "CENTER"
        label.data.size = size
        label.data.extrude = 0.002
        label.data.materials.append(materials["ticket_ink"])
        text_parts.append(label)

    barcode_parts = [barcode_back]
    for index in range(42):
        width = 0.008 if index % 3 else 0.014
        height = 0.12 + (0.04 if index % 5 == 0 else 0)
        x = -1.02 + index * 0.05
        barcode_parts.append(cube_obj(f"ticket_barcode_{index + 1:02d}", (x, -3.68, 0.18), (width, height, 0.012), materials["ticket_ink"], bevel=0.001))

    corner_parts = [
        cube_obj("ticket_cut_corner_left", (-1.86, -3.92, 0.18), (0.16, 0.014, 0.010), materials["ticket_ink"], bevel=0.002),
        cube_obj("ticket_cut_corner_right", (1.86, -3.92, 0.18), (0.16, 0.014, 0.010), materials["ticket_ink"], bevel=0.002),
    ]

    parts = [ticket, border_top, border_mid, border_bottom, cta_plate, cta_edge, *barcode_parts, *corner_parts, *text_parts]
    collection = create_collection("TicketSystem_GLB")
    move_to_collection(parts, collection)
    return parts


def create_aircraft(materials: dict[str, bpy.types.Material]) -> list[bpy.types.Object]:
    parts: list[bpy.types.Object] = []

    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.075, depth=0.78, location=(0, 0, 0), rotation=(0, math.radians(90), 0))
    fuselage = bpy.context.object
    fuselage.name = "aircraft_fuselage"
    assign_material(fuselage, materials["aircraft_body"])
    parts.append(fuselage)

    bpy.ops.mesh.primitive_cone_add(vertices=24, radius1=0.075, radius2=0.012, depth=0.18, location=(0.48, 0, 0), rotation=(0, math.radians(90), 0))
    nose = bpy.context.object
    nose.name = "aircraft_nose"
    assign_material(nose, materials["aircraft_body"])
    parts.append(nose)

    bpy.ops.mesh.primitive_cone_add(vertices=24, radius1=0.018, radius2=0.075, depth=0.14, location=(-0.46, 0, 0), rotation=(0, math.radians(90), 0))
    tail_cone = bpy.context.object
    tail_cone.name = "aircraft_tail_cone"
    assign_material(tail_cone, materials["aircraft_body"])
    parts.append(tail_cone)

    parts.extend(
        [
            cube_obj("aircraft_main_wing", (0.02, 0, 0.0), (0.16, 0.82, 0.022), materials["aircraft_wing"], bevel=0.015),
            cube_obj("aircraft_tail_wing", (-0.33, 0, 0.02), (0.10, 0.38, 0.018), materials["aircraft_wing"], bevel=0.012),
            cube_obj("aircraft_vertical_tail", (-0.37, 0, 0.12), (0.05, 0.025, 0.22), materials["aircraft_wing"], bevel=0.01),
        ]
    )

    for obj in parts:
        obj.rotation_euler.rotate_axis("Z", math.radians(-12))
        obj.location.z += 0.05

    collection = create_collection("AircraftSystem_GLB")
    move_to_collection(parts, collection)
    return parts


def create_globe_helpers(materials: dict[str, bpy.types.Material]) -> list[bpy.types.Object]:
    helpers: list[bpy.types.Object] = []

    bpy.ops.mesh.primitive_uv_sphere_add(segments=96, ring_count=48, radius=1.62, location=(0, 0, 2.92))
    atmosphere = bpy.context.object
    atmosphere.name = "globe_atmosphere_shell"
    assign_material(atmosphere, materials["atmosphere"])
    helpers.append(atmosphere)

    for index, rotation in enumerate((0, 62, -38)):
        bpy.ops.mesh.primitive_torus_add(
            major_radius=1.72,
            minor_radius=0.0025,
            major_segments=160,
            minor_segments=6,
            location=(0, 0, 2.92),
            rotation=(math.radians(90), 0, math.radians(rotation)),
        )
        ring = bpy.context.object
        ring.name = f"globe_route_reference_ring_{index + 1}"
        assign_material(ring, materials["route_blue" if index != 1 else "route_amber"])
        helpers.append(ring)

    collection = create_collection("GlobeHelper_GLB")
    move_to_collection(helpers, collection)
    return helpers


def create_surface_disc(
    name: str,
    location: tuple[float, float, float],
    radius: float,
    material: bpy.types.Material,
    scale: tuple[float, float, float] = (1, 1, 1),
    rotation: tuple[float, float, float] = (0, 0, 0),
) -> bpy.types.Object:
    bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=8, radius=radius, location=location, rotation=rotation)
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    assign_material(obj, material)
    return obj


def create_preview_globe(materials: dict[str, bpy.types.Material]) -> list[bpy.types.Object]:
    bpy.ops.mesh.primitive_uv_sphere_add(segments=128, ring_count=64, radius=1.55, location=(0, 0, 2.92))
    globe = bpy.context.object
    globe.name = "previs_opaque_dark_earth_surface"
    globe.rotation_euler = (0, 0, math.radians(-22))
    assign_material(globe, materials["earth_day_surface"])

    normal_mod = globe.modifiers.new("previs_globe_weighted_normals", "WEIGHTED_NORMAL")
    normal_mod.keep_sharp = True

    parts = [globe]

    bpy.ops.mesh.primitive_uv_sphere_add(segments=128, ring_count=64, radius=1.556, location=(0, 0, 2.92))
    city_light_shell = bpy.context.object
    city_light_shell.name = "previs_earth_warm_city_light_map"
    city_light_shell.rotation_euler = globe.rotation_euler
    assign_material(city_light_shell, materials["earth_night_lights"])
    parts.append(city_light_shell)

    bpy.ops.mesh.primitive_uv_sphere_add(segments=128, ring_count=64, radius=1.572, location=(0, 0, 2.92))
    cloud_shell = bpy.context.object
    cloud_shell.name = "previs_earth_cloud_shell"
    cloud_shell.rotation_euler = (0, 0, math.radians(-14))
    assign_material(cloud_shell, materials["earth_cloud_layer"])
    parts.append(cloud_shell)

    cloud_specs = [
        ("cloud_wisp_north", (-0.18, -1.52, 3.58), 0.045, (8.2, 0.12, 1.0), (0, 0, math.radians(4))),
        ("cloud_wisp_atlantic", (0.46, -1.54, 3.06), 0.035, (6.0, 0.12, 1.0), (0, 0, math.radians(-17))),
        ("cloud_wisp_south", (-0.22, -1.55, 2.42), 0.035, (5.0, 0.12, 1.0), (0, 0, math.radians(18))),
    ]
    for name, location, radius, scale, rotation in cloud_specs:
        parts.append(create_surface_disc(name, location, radius, materials["cloud_wisp"], scale, rotation))

    light_locations = [
        (-0.94, -1.602, 3.30), (-0.86, -1.604, 3.22), (-0.78, -1.606, 3.14),
        (-0.70, -1.606, 3.06), (-0.58, -1.604, 3.22), (-0.48, -1.606, 3.10),
        (-0.40, -1.606, 2.98), (-0.26, -1.604, 2.62), (-0.34, -1.604, 2.46),
        (0.20, -1.604, 3.36), (0.30, -1.606, 3.28), (0.40, -1.606, 3.20),
        (0.50, -1.606, 3.10), (0.58, -1.606, 3.00), (0.66, -1.604, 2.90),
        (0.50, -1.606, 2.70), (0.62, -1.604, 2.56), (0.72, -1.604, 2.78),
        (-0.98, -1.600, 2.84), (-0.84, -1.604, 2.74), (0.08, -1.600, 3.54),
    ]
    for index, location in enumerate(light_locations):
        radius = 0.009 if index % 4 else 0.012
        parts.append(create_surface_disc(f"earth_city_light_block_{index + 1}", location, radius, materials["city_light"], (1, 0.16, 1), (0, 0, 0)))

    bpy.ops.mesh.primitive_uv_sphere_add(segments=96, ring_count=48, radius=1.575, location=(0.40, -0.02, 2.72))
    terminator = bpy.context.object
    terminator.name = "globe_cinematic_shadow_split"
    terminator.scale = (0.86, 0.10, 1.10)
    assign_material(terminator, materials["terminator_shadow"])
    parts.append(terminator)

    collection = create_collection("PreviewGlobe_Blockout")
    move_to_collection(parts, collection)
    return parts


def make_curve_mesh(
    name: str,
    points: list[tuple[float, float, float]],
    material: bpy.types.Material,
    bevel_depth: float = 0.01,
) -> bpy.types.Object:
    curve = bpy.data.curves.new(name, "CURVE")
    curve.dimensions = "3D"
    curve.resolution_u = 18
    curve.bevel_depth = bevel_depth
    curve.bevel_resolution = 2

    polyline = curve.splines.new("BEZIER")
    polyline.bezier_points.add(len(points) - 1)
    for point, coords in zip(polyline.bezier_points, points):
        point.co = coords
        point.handle_left_type = "AUTO"
        point.handle_right_type = "AUTO"

    obj = bpy.data.objects.new(name, curve)
    bpy.context.collection.objects.link(obj)
    assign_material(obj, material)

    select_only([obj])
    bpy.ops.object.convert(target="MESH")
    mesh_obj = bpy.context.object
    mesh_obj.name = name
    return mesh_obj


def create_route_guides(materials: dict[str, bpy.types.Material]) -> list[bpy.types.Object]:
    route_specs = [
        (
            "route_guide_blue_atlantic",
            [(-1.42, -0.14, 3.06), (-0.62, -0.82, 4.08), (0.80, -0.76, 3.86), (1.42, -0.08, 3.02)],
            materials["route_blue"],
        ),
        (
            "route_guide_amber_north",
            [(-1.12, 0.26, 3.24), (-0.18, 0.56, 4.46), (0.96, 0.42, 3.76), (1.42, -0.14, 3.08)],
            materials["route_amber"],
        ),
        (
            "route_guide_soft_south",
            [(-1.38, -0.22, 2.64), (-0.24, -1.06, 2.26), (0.92, -0.92, 2.42), (1.42, -0.20, 2.88)],
            materials["route_blue"],
        ),
        (
            "route_guide_blue_upper",
            [(-1.18, -0.36, 3.62), (-0.22, -0.98, 4.02), (0.86, -0.82, 3.42), (1.28, -0.30, 3.16)],
            materials["route_blue"],
        ),
    ]
    routes = [make_curve_mesh(name, points, mat, 0.006) for name, points, mat in route_specs]
    collection = create_collection("RouteGuide_GLB")
    move_to_collection(routes, collection)
    return routes


def rotate_group(objects: list[bpy.types.Object], origin: Vector, angle: float) -> None:
    cos_a = math.cos(angle)
    sin_a = math.sin(angle)
    for obj in objects:
        rel = obj.location - origin
        obj.location = Vector((rel.x * cos_a - rel.y * sin_a, rel.x * sin_a + rel.y * cos_a, rel.z)) + origin
        obj.rotation_euler.rotate_axis("Z", angle)


def create_preview_aircraft(
    name: str,
    location: tuple[float, float, float],
    scale: float,
    angle: float,
    materials: dict[str, bpy.types.Material],
) -> list[bpy.types.Object]:
    x, y, z = location
    parts = [
        cube_obj(f"{name}_fuselage", (x, y, z), (0.62 * scale, 0.055 * scale, 0.055 * scale), materials["aircraft_body"], bevel=0.025 * scale),
        cube_obj(f"{name}_nose", (x + 0.33 * scale, y, z), (0.12 * scale, 0.045 * scale, 0.045 * scale), materials["aircraft_body"], bevel=0.02 * scale),
        cube_obj(f"{name}_main_wing", (x + 0.04 * scale, y, z), (0.10 * scale, 0.58 * scale, 0.026 * scale), materials["aircraft_wing"], bevel=0.012 * scale),
        cube_obj(f"{name}_tail_wing", (x - 0.24 * scale, y, z + 0.015 * scale), (0.08 * scale, 0.30 * scale, 0.022 * scale), materials["aircraft_wing"], bevel=0.01 * scale),
        cube_obj(f"{name}_vertical_tail", (x - 0.28 * scale, y, z + 0.09 * scale), (0.05 * scale, 0.026 * scale, 0.16 * scale), materials["aircraft_wing"], bevel=0.008 * scale),
    ]
    rotate_group(parts, Vector(location), angle)
    return parts


def create_aircraft_instances(source_parts: list[bpy.types.Object], materials: dict[str, bpy.types.Material]) -> list[bpy.types.Object]:
    instance_specs = [
        ((-0.98, -1.58, 3.48), 0.80, math.radians(-18)),
        ((0.00, -1.60, 3.74), 0.70, math.radians(12)),
        ((0.98, -1.58, 2.90), 0.78, math.radians(24)),
        ((-1.18, -1.50, 2.74), 0.58, math.radians(-36)),
    ]
    instances: list[bpy.types.Object] = []
    for index, (location, scale, angle) in enumerate(instance_specs, start=1):
        instances.extend(create_preview_aircraft(f"preview_aircraft_{index}", location, scale, angle, materials))

    collection = create_collection("PreviewAircraft_Blockout")
    move_to_collection(instances, collection)
    return instances


def create_environment_floor(materials: dict[str, bpy.types.Material]) -> list[bpy.types.Object]:
    parts = [
        cube_obj("cinematic_floor_plate", (0, -2.18, -0.045), (7.8, 6.8, 0.04), materials["floor_dark"], bevel=0.02),
        cube_obj("cinematic_dark_backdrop", (0, 1.65, 3.05), (18.0, 0.05, 12.0), materials["backdrop_dark"], bevel=0.01),
        cube_obj("backdrop_center_blue_falloff", (0, 1.61, 3.08), (8.4, 0.04, 5.8), materials["backdrop_blue"], bevel=0.01),
    ]

    for index, x in enumerate([v * 0.5 for v in range(-7, 8)]):
        parts.append(cube_obj(f"floor_grid_x_{index}", (x, -2.18, -0.018), (0.006, 6.2, 0.006), materials["floor_grid"], bevel=0.001))
    for index, y in enumerate([-4.8, -4.25, -3.7, -3.15, -2.6, -2.05, -1.5, -0.95, -0.4]):
        parts.append(cube_obj(f"floor_grid_y_{index}", (0, y, -0.016), (7.0, 0.006, 0.006), materials["floor_grid"], bevel=0.001))

    light_specs = [
        (-2.7, -4.2),
        (-1.9, -3.6),
        (-1.1, -4.6),
        (1.7, -3.9),
        (2.8, -4.7),
        (2.2, -2.8),
        (-2.8, -2.6),
    ]
    for index, (x, y) in enumerate(light_specs):
        parts.append(cube_obj(f"floor_city_light_{index}", (x, y, 0.004), (0.032, 0.032, 0.008), materials["floor_light"], bevel=0.006))

    star_specs = [
        (-3.1, 1.30, 4.6, 0.018),
        (-2.2, 1.30, 3.8, 0.012),
        (-1.1, 1.30, 4.9, 0.010),
        (1.6, 1.30, 4.2, 0.014),
        (2.8, 1.30, 5.0, 0.010),
        (3.4, 1.30, 3.5, 0.012),
    ]
    for index, (x, y, z, size) in enumerate(star_specs):
        parts.append(cube_obj(f"backdrop_star_{index}", (x, y - 0.035, z), (size, 0.008, size), materials["star_light"], bevel=0.003))

    collection = create_collection("CinematicEnvironment_Blockout")
    move_to_collection(parts, collection)
    return parts


def setup_lighting() -> None:
    bpy.context.scene.world = bpy.data.worlds.new("Jmpseat_Dark_World")
    bpy.context.scene.world.color = (0.002, 0.007, 0.014)

    bpy.ops.object.light_add(type="AREA", location=(0, -3.2, 5.6))
    key = bpy.context.object
    key.name = "large_soft_key_light"
    key.data.energy = 620
    key.data.size = 4.5

    bpy.ops.object.light_add(type="POINT", location=(-1.8, -1.2, 2.2))
    rim_blue = bpy.context.object
    rim_blue.name = "blue_globe_rim_light"
    rim_blue.data.color = (0.35, 0.75, 1.0)
    rim_blue.data.energy = 170

    bpy.ops.object.light_add(type="POINT", location=(0, -0.9, 0.82))
    slot_warm = bpy.context.object
    slot_warm.name = "scanner_slot_warm_light"
    slot_warm.data.color = (1.0, 0.58, 0.26)
    slot_warm.data.energy = 120
    slot_warm.data.shadow_soft_size = 2.4


def setup_camera(name: str, location: tuple[float, float, float], target: tuple[float, float, float], lens: float) -> bpy.types.Object:
    bpy.ops.object.camera_add(location=location)
    camera = bpy.context.object
    camera.name = name
    direction = Vector(target) - camera.location
    camera.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
    camera.data.lens = lens
    camera.data.dof.use_dof = True
    camera.data.dof.focus_distance = direction.length
    camera.data.dof.aperture_fstop = 6.5
    return camera


def attach_reference_background(camera: bpy.types.Object, reference_path: Path, alpha: float = 0.18) -> None:
    if not reference_path.exists():
        return

    camera.data.show_background_images = True
    background = camera.data.background_images.new()
    background.image = bpy.data.images.load(str(reference_path))
    background.alpha = alpha
    background.display_depth = "BACK"
    background.frame_method = "FIT"


def setup_render_settings() -> None:
    scene = bpy.context.scene
    available_engines = {item.identifier for item in scene.render.bl_rna.properties["engine"].enum_items}
    scene.render.engine = "BLENDER_EEVEE_NEXT" if "BLENDER_EEVEE_NEXT" in available_engines else "BLENDER_EEVEE"

    if hasattr(scene, "eevee"):
        if hasattr(scene.eevee, "taa_render_samples"):
            scene.eevee.taa_render_samples = 64
        if hasattr(scene.eevee, "use_bloom"):
            scene.eevee.use_bloom = True
        if hasattr(scene.eevee, "bloom_intensity"):
            scene.eevee.bloom_intensity = 0.035

    scene.render.film_transparent = False
    scene.view_settings.view_transform = "Filmic"
    scene.view_settings.look = "Medium High Contrast"
    scene.view_settings.exposure = -0.35
    scene.view_settings.gamma = 1.0


def render_preview(camera: bpy.types.Object, filepath: Path, resolution: tuple[int, int]) -> None:
    scene = bpy.context.scene
    scene.camera = camera
    scene.render.resolution_x = resolution[0]
    scene.render.resolution_y = resolution[1]
    scene.render.filepath = str(filepath)
    bpy.ops.render.render(write_still=True)


def render_mobile_preview(camera: bpy.types.Object, filepath: Path, resolution: tuple[int, int], ticket_objects: list[bpy.types.Object]) -> None:
    original_transforms = {
        obj.name: (obj.location.copy(), obj.scale.copy())
        for obj in ticket_objects
    }
    pivot_y = -0.72
    for obj in ticket_objects:
        obj.location.x *= 0.76
        obj.location.y = pivot_y + (obj.location.y - pivot_y) * 1.08
        obj.scale.x *= 0.76
        obj.scale.y *= 1.08

    render_preview(camera, filepath, resolution)

    for obj in ticket_objects:
        location, scale = original_transforms[obj.name]
        obj.location = location
        obj.scale = scale


def render_globe_debug_views(globe_parts: list[bpy.types.Object]) -> None:
    debug_camera = setup_camera("globe_material_debug_camera", (0, -5.4, 3.08), (0, 0, 2.92), 58)
    original_visibility = {obj.name: obj.hide_render for obj in bpy.context.scene.objects}

    def render_visible(filepath: Path, visible_names: set[str]) -> None:
        for obj in bpy.context.scene.objects:
            obj.hide_render = obj.name not in visible_names and obj.type not in {"CAMERA", "LIGHT"}
        render_preview(debug_camera, filepath, (900, 900))

    day_names = {"previs_opaque_dark_earth_surface"}
    night_names = {"previs_earth_warm_city_light_map"}
    final_names = {obj.name for obj in globe_parts}
    atmosphere_names = {"previs_earth_cloud_shell", "cloud_wisp_north", "cloud_wisp_atlantic", "cloud_wisp_south"}
    render_visible(ASSET_PATHS["debugEarthDay"], day_names)
    render_visible(ASSET_PATHS["debugEarthNight"], night_names)
    render_visible(ASSET_PATHS["debugEarthFinal"], final_names)
    render_visible(ASSET_PATHS["debugEarthFinalNoAtmosphere"], final_names - atmosphere_names)
    render_visible(ASSET_PATHS["debugEarthFinalWithAtmosphere"], final_names)

    for obj in bpy.context.scene.objects:
        obj.hide_render = original_visibility.get(obj.name, obj.hide_render)


def paste_image_into_contact_sheet(
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


def create_contact_sheet() -> bool:
    required_images = [
        REFERENCE_PATHS["mobileReference"],
        ASSET_PATHS["mobilePreview"],
        REFERENCE_PATHS["desktopReference"],
        ASSET_PATHS["desktopPreview"],
    ]
    if any(not path.exists() for path in required_images):
        return False

    margin = 40
    gap = 40
    column_width = 760
    mobile_row_height = 1120
    desktop_row_height = 520
    sheet_width = margin * 2 + column_width * 2 + gap
    sheet_height = margin * 2 + mobile_row_height + desktop_row_height + gap

    background = [0.018, 0.022, 0.028, 1.0]
    pixels = background * (sheet_width * sheet_height)
    left_x = margin
    right_x = margin + column_width + gap
    desktop_y = margin
    mobile_y = margin + desktop_row_height + gap

    paste_image_into_contact_sheet(pixels, sheet_width, REFERENCE_PATHS["desktopReference"], left_x, desktop_y, column_width, desktop_row_height)
    paste_image_into_contact_sheet(pixels, sheet_width, ASSET_PATHS["desktopPreview"], right_x, desktop_y, column_width, desktop_row_height)
    paste_image_into_contact_sheet(pixels, sheet_width, REFERENCE_PATHS["mobileReference"], left_x, mobile_y, column_width, mobile_row_height)
    paste_image_into_contact_sheet(pixels, sheet_width, ASSET_PATHS["mobilePreview"], right_x, mobile_y, column_width, mobile_row_height)

    contact = bpy.data.images.new("jmpseat_hero_contact_sheet", width=sheet_width, height=sheet_height, alpha=True)
    contact.pixels.foreach_set(pixels)
    contact.filepath_raw = str(ASSET_PATHS["contactSheet"])
    contact.file_format = "PNG"
    contact.save()
    bpy.data.images.remove(contact)
    return True


def write_render_review_latest(contact_sheet_created: bool) -> None:
    total = sum(score for _, score, _ in REVIEW_SCORES)
    below_threshold = [name for name, score, _ in REVIEW_SCORES if score < 4]
    hard_fails = [
        "Current render status is FAILED.",
        "Mobile framing does not yet independently match the supplied mobile reference.",
        "Mobile camera still reads too top-down/tabletop for the ticket.",
        "Globe no longer reads primarily as glass in the debug renders, but the final hero globe is still too abstract and lacks clear continent mass compared with the references.",
        "City-light and cloud detail remain previs quality and do not yet fully resemble the reference geography.",
        "Aircraft are still blockout quality and do not yet match the reference aircraft readability.",
    ]

    if not contact_sheet_created:
        hard_fails.append(
            "Contact sheet was not generated because one or more reference or preview images were missing."
        )

    lines = [
        "# Latest jmpseat Hero Render Review",
        "",
        f"Generated: {datetime.now(timezone.utc).isoformat()}",
        "",
        "Status: **FAILED BLOCKOUT**",
        "",
        "This render is pipeline proof only. It is not visually acceptable, not complete, and must not be presented as a successful cinematic render.",
        "",
        "## Reference Assets",
        "",
        f"- Mobile reference: `{REFERENCE_PATHS['mobileReference'].relative_to(REPO_ROOT)}`",
        f"- Desktop reference: `{REFERENCE_PATHS['desktopReference'].relative_to(REPO_ROOT)}`",
        f"- Mobile render: `{ASSET_PATHS['mobilePreview'].relative_to(REPO_ROOT)}`",
        f"- Desktop render: `{ASSET_PATHS['desktopPreview'].relative_to(REPO_ROOT)}`",
        f"- Contact sheet: `{ASSET_PATHS['contactSheet'].relative_to(REPO_ROOT)}`"
        if contact_sheet_created
        else f"- Contact sheet: blocked; expected `{ASSET_PATHS['contactSheet'].relative_to(REPO_ROOT)}`",
        f"- Debug day-only globe: `{ASSET_PATHS['debugEarthDay'].relative_to(REPO_ROOT)}`",
        f"- Debug city-light-only globe: `{ASSET_PATHS['debugEarthNight'].relative_to(REPO_ROOT)}`",
        f"- Debug final globe material: `{ASSET_PATHS['debugEarthFinal'].relative_to(REPO_ROOT)}`",
        f"- Debug final globe without atmosphere: `{ASSET_PATHS['debugEarthFinalNoAtmosphere'].relative_to(REPO_ROOT)}`",
        f"- Debug final globe with atmosphere: `{ASSET_PATHS['debugEarthFinalWithAtmosphere'].relative_to(REPO_ROOT)}`",
        "",
        "## Score",
        "",
        f"Total: **{total}/55**",
        "",
        "| Category | Score | Notes |",
        "| --- | ---: | --- |",
    ]

    for name, score, note in REVIEW_SCORES:
        lines.append(f"| {name} | {score}/5 | {note} |")

    lines.extend(
        [
            "",
            "## Gate Result",
            "",
            "**FAILED. Do not claim visual success.**",
            "",
            "The render cannot pass until total score is at least 48/55, no category is below 4/5, no hard-fail condition is present, and the mobile-specific acceptance checks pass independently.",
            "",
            "## Hard-Fail Conditions Present",
            "",
        ]
    )

    for hard_fail in hard_fails:
        lines.append(f"- {hard_fail}")

    lines.extend(
        [
            "",
            "## Texture Visibility Debug",
            "",
            "- Day texture visibility: proven. `debug-earth-day-only.png` shows the Earth day texture mapped to the sphere with visible continental geography.",
            "- Night/city-light texture visibility: proven. `debug-earth-night-city-lights-only.png` shows the city-light texture aligned to the same geography.",
            "- Final material result: improved but still failed. `debug-earth-final-material.png` and the atmosphere comparison renders show a darker opaque Earth stack with warm city lights, but the hero still lacks the reference's clear continent mass, premium light/shadow depth, and rich city-light geography.",
            "- UV/material mapping status: corrected by explicitly wiring texture-coordinate UVs into the Earth, cloud, and city-light texture nodes.",
            "- Atmosphere status: improved. The atmosphere-disabled and atmosphere-enabled debug renders show that the atmosphere is no longer the main visible material, though the hero still carries a cool rim on the left edge.",
            "",
            "## Mobile-Specific Gate",
            "",
            "- Globe must be large and dominant in the top half of the frame.",
            "- Globe must sit directly above the scanner/printer.",
            "- Scanner/printer must be directly under the globe and clearly visible.",
            "- Ticket must emerge vertically downward as a long boarding pass, not read as a tabletop card.",
            "- ENTER CTA must be fully visible, centered, and near the lower portion of the ticket.",
            "- Mobile camera must feel front-facing and heroic, not overly top-down.",
            "- Background must avoid wasted gray/empty space.",
            "- Mobile render must feel tall, premium, and immersive like the supplied mobile reference.",
            "",
            "## Below-Threshold Categories",
            "",
        ]
    )

    for category in below_threshold:
        lines.append(f"- {category}")

    lines.extend(
        [
            "",
            "## Iteration Rule",
            "",
            "Preserve the working desktop hierarchy. The next correction priority is the lowest-scoring visual cluster: globe realism and mobile-specific camera/ticket readability. Do not claim success until the mobile gate passes independently.",
            "",
        ]
    )

    RENDER_REVIEW_PATH.write_text("\n".join(lines), encoding="utf-8")


def write_manifest() -> None:
    public_dir = REPO_ROOT / "public"
    assets = [
        ("scannerPrinter", ASSET_PATHS["scannerPrinter"], "Sleek black scanner/printer GLB with slot and amber light strips."),
        ("ticketPlane", ASSET_PATHS["ticketPlane"], "Thin physical ticket/card surface aligned to emerge from the scanner."),
        ("aircraft", ASSET_PATHS["aircraft"], "Small optimized passenger aircraft GLB for route placement."),
        ("globeHelpers", ASSET_PATHS["globeHelpers"], "Optional atmosphere shell and reference rings for globe composition."),
        ("routeGuides", ASSET_PATHS["routeGuides"], "Thin route guide curves for later R3F curve reconstruction."),
        ("mobilePreview", ASSET_PATHS["mobilePreview"], "Vertical framing preview: globe over scanner over ticket."),
        ("desktopPreview", ASSET_PATHS["desktopPreview"], "Wide cinematic framing preview: globe/scanner/ticket composition."),
        ("contactSheet", ASSET_PATHS["contactSheet"], "Reference comparison contact sheet for mobile and desktop render review."),
        ("debugEarthDay", ASSET_PATHS["debugEarthDay"], "Debug render showing day texture visibility on the opaque Earth sphere."),
        ("debugEarthNight", ASSET_PATHS["debugEarthNight"], "Debug render showing city-light texture visibility and UV alignment."),
        ("debugEarthFinal", ASSET_PATHS["debugEarthFinal"], "Debug render showing final combined globe material layers."),
        ("debugEarthFinalNoAtmosphere", ASSET_PATHS["debugEarthFinalNoAtmosphere"], "Debug render showing final globe material with atmosphere/cloud shells disabled."),
        ("debugEarthFinalWithAtmosphere", ASSET_PATHS["debugEarthFinalWithAtmosphere"], "Debug render showing final globe material with atmosphere/cloud shells enabled."),
    ]
    manifest = {
        "name": "jmpseat cinematic waitlist hero asset manifest",
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "pipeline": "Blender-first scripted previs and GLB export",
        "assets": [
            {
                "id": asset_id,
                "path": "/" + path.relative_to(public_dir).as_posix(),
                "purpose": purpose,
                "exists": path.exists(),
            }
            for asset_id, path, purpose in assets
        ],
    }
    MANIFEST_PATH.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")


def build_scene(skip_renders: bool = False) -> None:
    ensure_dirs()
    prepare_cinematic_globe_textures()
    reset_scene()

    materials = {
        "gloss_black": create_principled_material("gloss_black_anodized", (0.006, 0.011, 0.017, 1), 0.22, 0.45),
        "soft_black": create_principled_material("soft_black_edges", (0.015, 0.023, 0.032, 1), 0.34, 0.25),
        "slot_black": create_principled_material("deep_slot_black", (0.0, 0.002, 0.006, 1), 0.62, 0.0),
        "black_void": create_principled_material("black_slot_void", (0.0, 0.0, 0.002, 1), 0.76, 0.0),
        "cool_highlight": create_principled_material("cool_scanner_highlight", (0.25, 0.68, 0.92, 1), 0.18, 0.0, emission=(0.08, 0.34, 0.56, 1), emission_strength=0.6),
        "floor_dark": create_principled_material("dark_aviation_floor", (0.003, 0.010, 0.018, 1), 0.38, 0.08),
        "floor_grid": create_principled_material("subtle_floor_grid", (0.08, 0.23, 0.34, 1), 0.64, 0.0, emission=(0.02, 0.10, 0.16, 1), emission_strength=0.22),
        "floor_light": create_principled_material("warm_floor_light", (1.0, 0.56, 0.20, 1), 0.42, 0.0, emission=(1.0, 0.42, 0.08, 1), emission_strength=0.9),
        "backdrop_dark": create_principled_material("dark_navy_backdrop", (0.0, 0.002, 0.007, 1), 0.92, 0.0, emission=(0.0, 0.004, 0.012, 1), emission_strength=0.05),
        "backdrop_blue": create_principled_material("subtle_blue_backdrop_falloff", (0.0, 0.014, 0.028, 0.38), 0.94, 0.0, alpha=0.38, emission=(0.0, 0.018, 0.040, 1), emission_strength=0.08),
        "star_light": create_principled_material("tiny_background_star", (0.65, 0.90, 1.0, 1), 0.5, 0.0, emission=(0.35, 0.72, 1.0, 1), emission_strength=0.7),
        "amber_light": create_principled_material("warm_amber_light", (1.0, 0.55, 0.20, 1), 0.18, 0.0, emission=(1.0, 0.48, 0.14, 1), emission_strength=2.4),
        "ticket_stock": create_principled_material("warm_ticket_stock", (0.86, 0.91, 0.94, 1), 0.58, 0.0),
        "ticket_ink": create_principled_material("ticket_subtle_ink", (0.06, 0.10, 0.16, 1), 0.72, 0.0),
        "cta_text": create_principled_material("cta_enter_text", (1.0, 0.90, 0.74, 1), 0.32, 0.0, emission=(1.0, 0.62, 0.28, 1), emission_strength=1.0),
        "continent_land": create_principled_material("earth_land_blockout", (0.11, 0.18, 0.19, 1), 0.64, 0.0),
        "city_light": create_principled_material("earth_city_light_blockout", (1.0, 0.64, 0.24, 1), 0.42, 0.0, emission=(1.0, 0.50, 0.12, 1), emission_strength=1.3),
        "aircraft_body": create_principled_material("aircraft_pearl_body", (0.78, 0.86, 0.91, 1), 0.36, 0.08),
        "aircraft_wing": create_principled_material("aircraft_cool_wing", (0.66, 0.76, 0.84, 1), 0.42, 0.12),
        "earth_day_surface": create_earth_surface_material("layered_earth_day_surface", EARTH_DAY_CINEMATIC_TEXTURE if EARTH_DAY_CINEMATIC_TEXTURE.exists() else EARTH_DAY_TEXTURE, EARTH_BUMP_TEXTURE, EARTH_SPECULAR_TEXTURE),
        "earth_night_base": create_image_material("layered_earth_night_base", EARTH_NIGHT_TEXTURE, (0.004, 0.018, 0.036, 1), 0.72, emission_strength=0.42, alpha=1.0, saturation=0.95, value=0.78),
        "earth_day_detail": create_image_material("layered_earth_day_color_detail", EARTH_DAY_TEXTURE, (0.05, 0.09, 0.11, 0.06), 0.76, emission_strength=0.0, alpha=0.055, saturation=0.62, value=0.34),
        "earth_night_lights": create_city_light_texture_material("layered_earth_warm_city_lights", EARTH_CITY_LIGHTS_CINEMATIC_TEXTURE if EARTH_CITY_LIGHTS_CINEMATIC_TEXTURE.exists() else EARTH_NIGHT_TEXTURE),
        "earth_cloud_layer": create_alpha_texture_material("layered_earth_clouds", EARTH_CLOUDS_TEXTURE, (0.42, 0.55, 0.60, 0.030), 0.030, emission_strength=0.0, saturation=0.12, value=0.22),
        "earth_specular_layer": create_alpha_texture_material("layered_earth_specular", EARTH_SPECULAR_TEXTURE, (0.07, 0.20, 0.32, 0.035), 0.035, emission_strength=0.0, saturation=0.4, value=0.22),
        "cloud_wisp": create_principled_material("soft_cloud_wisp", (0.42, 0.55, 0.62, 0.065), 0.82, 0.0, alpha=0.065, emission=(0.08, 0.14, 0.18, 1), emission_strength=0.0),
        "terminator_shadow": create_principled_material("cinematic_globe_shadow", (0.0, 0.002, 0.010, 0.82), 0.90, 0.0, alpha=0.82),
        "atmosphere": create_principled_material("thin_blue_atmosphere", (0.055, 0.20, 0.34, 0.026), 0.55, 0.0, alpha=0.026, emission=(0.015, 0.09, 0.18, 1), emission_strength=0.035),
        "route_blue": create_principled_material("thin_route_blue", (0.24, 0.76, 1.0, 1), 0.36, 0.0, emission=(0.10, 0.52, 1.0, 1), emission_strength=0.55),
        "route_amber": create_principled_material("thin_route_amber", (1.0, 0.58, 0.18, 1), 0.36, 0.0, emission=(1.0, 0.42, 0.08, 1), emission_strength=0.5),
    }

    scanner = create_scanner(materials)
    ticket = create_ticket(materials)
    aircraft = create_aircraft(materials)
    globe_helpers = create_globe_helpers(materials)
    preview_globe_parts = create_preview_globe(materials)
    route_guides = create_route_guides(materials)
    create_aircraft_instances(aircraft, materials)
    create_environment_floor(materials)

    setup_lighting()
    setup_render_settings()

    mobile_camera = setup_camera("mobile_locked_camera", (0, -10.6, 3.42), (0, -1.42, 1.72), 48)
    desktop_camera = setup_camera("desktop_locked_camera", (0, -10.0, 2.68), (0, -1.40, 1.54), 30)
    attach_reference_background(mobile_camera, REFERENCE_PATHS["mobileReference"])
    attach_reference_background(desktop_camera, REFERENCE_PATHS["desktopReference"])

    export_glb(scanner, ASSET_PATHS["scannerPrinter"])
    export_glb(ticket, ASSET_PATHS["ticketPlane"])
    export_glb(aircraft, ASSET_PATHS["aircraft"])
    export_glb(globe_helpers, ASSET_PATHS["globeHelpers"])
    export_glb(route_guides, ASSET_PATHS["routeGuides"])
    for obj in aircraft:
        obj.hide_render = True

    if not skip_renders:
        render_mobile_preview(mobile_camera, ASSET_PATHS["mobilePreview"], (900, 1600), ticket)
        render_preview(desktop_camera, ASSET_PATHS["desktopPreview"], (1600, 900))
        render_globe_debug_views(preview_globe_parts)

    contact_sheet_created = create_contact_sheet()
    write_render_review_latest(contact_sheet_created)
    write_manifest()
    print(f"jmpseat cinematic assets written under {PUBLIC_ROOT}")
    print(f"Preview helper globe retained in scene with {len(preview_globe_parts)} blockout objects")


def parse_args() -> dict[str, bool]:
    args = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    return {"skip_renders": "--skip-renders" in args}


if __name__ == "__main__":
    build_scene(**parse_args())
