"""Render lighting-driven globe lookdev proofs for the jmpseat cinematic hero.

Run from the repo root:
  blender --background --python tools/cinematic/render_globe_lighting_lookdev.py

This is a globe-only lookdev pass. It does not touch the full hero scene.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path

import bpy
from mathutils import Vector


SCRIPT_PATH = Path(__file__).resolve()
REPO_ROOT = SCRIPT_PATH.parents[2]
TEXTURE_DIR = REPO_ROOT / "public" / "cinematic" / "textures"
PREVIEW_DIR = REPO_ROOT / "public" / "cinematic" / "previews"
DOC_PATH = REPO_ROOT / "docs" / "landing" / "globe-material-debug-latest.md"
REFERENCE_GLOBE_SPEC = REPO_ROOT / "docs" / "landing" / "references" / "jmpseat-globe-material-reference.jpg"

EARTH_DAY_TEXTURE = TEXTURE_DIR / "earth_day.jpg"
EARTH_NIGHT_TEXTURE = TEXTURE_DIR / "earth_night.jpg"
EARTH_CLOUDS_TEXTURE = TEXTURE_DIR / "earth_clouds.png"
EARTH_BUMP_TEXTURE = TEXTURE_DIR / "earth_bump.jpg"

OUTPUTS = {
    "sheet": PREVIEW_DIR / "globe-lighting-lookdev-sheet.png",
    "lowFill": PREVIEW_DIR / "globe-lighting-low-fill-cinematic.png",
    "balanced": PREVIEW_DIR / "globe-lighting-reference-balanced.png",
    "richSurface": PREVIEW_DIR / "globe-lighting-rich-surface-fill.png",
    "rimAtmosphere": PREVIEW_DIR / "globe-lighting-rim-atmosphere-match.png",
    "bestNoAtmosphere": PREVIEW_DIR / "globe-lookdev-best-no-atmosphere.png",
    "bestWithAtmosphere": PREVIEW_DIR / "globe-lookdev-best-with-atmosphere.png",
    "bestCityEmission": PREVIEW_DIR / "globe-lookdev-best-city-emission.png",
    "bestDaySurface": PREVIEW_DIR / "globe-lookdev-best-day-surface.png",
}


@dataclass(frozen=True)
class Variant:
    name: str
    output_key: str
    fill_energy: float
    key_energy: float
    rim_energy: float
    day_value: float
    day_saturation: float
    surface_emit: float
    city_strength: float
    cloud_alpha: float
    atmosphere_strength: float
    exposure: float


VARIANTS = [
    Variant("A. Low Fill Cinematic", "lowFill", 180, 420, 160, 0.34, 0.62, 0.035, 3.2, 0.030, 0.10, -0.30),
    Variant("B. Reference Balanced", "balanced", 280, 520, 220, 0.42, 0.68, 0.055, 3.4, 0.040, 0.13, -0.22),
    Variant("C. Rich Surface Fill", "richSurface", 340, 600, 210, 0.48, 0.70, 0.070, 3.25, 0.052, 0.12, -0.20),
    Variant("D. Rim/Atmosphere Match", "rimAtmosphere", 250, 500, 360, 0.40, 0.66, 0.050, 3.35, 0.038, 0.20, -0.24),
]


def ensure_dirs() -> None:
    PREVIEW_DIR.mkdir(parents=True, exist_ok=True)
    DOC_PATH.parent.mkdir(parents=True, exist_ok=True)


def reset_scene() -> None:
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete()


def set_principled(material: bpy.types.Material, input_name: str, value) -> None:
    node = material.node_tree.nodes.get("Principled BSDF")
    if node and input_name in node.inputs:
        node.inputs[input_name].default_value = value


def make_earth_material(variant: Variant) -> bpy.types.Material:
    material = bpy.data.materials.new(f"lookdev_earth_{variant.output_key}")
    material.use_nodes = True
    material.blend_method = "OPAQUE"
    nodes = material.node_tree.nodes
    links = material.node_tree.links
    bsdf = nodes.get("Principled BSDF")
    if not bsdf:
        return material

    if EARTH_DAY_TEXTURE.exists():
        texcoord = nodes.new(type="ShaderNodeTexCoord")
        texture = nodes.new(type="ShaderNodeTexImage")
        texture.image = bpy.data.images.load(str(EARTH_DAY_TEXTURE))
        texture.extension = "REPEAT"
        color = nodes.new(type="ShaderNodeHueSaturation")
        color.inputs["Saturation"].default_value = variant.day_saturation
        color.inputs["Value"].default_value = variant.day_value
        contrast = nodes.new(type="ShaderNodeBrightContrast")
        contrast.inputs["Bright"].default_value = -0.08
        contrast.inputs["Contrast"].default_value = 0.22
        mix = nodes.new(type="ShaderNodeMix")
        mix.data_type = "RGBA"
        mix.factor_mode = "UNIFORM"
        mix.blend_type = "MULTIPLY"
        mix.inputs["Factor"].default_value = 0.42
        mix.inputs["A"].default_value = (0.045, 0.105, 0.18, 1.0)
        links.new(texcoord.outputs["UV"], texture.inputs["Vector"])
        links.new(texture.outputs["Color"], color.inputs["Color"])
        links.new(color.outputs["Color"], contrast.inputs["Color"])
        links.new(contrast.outputs["Color"], mix.inputs["B"])
        links.new(mix.outputs["Result"], bsdf.inputs["Base Color"])
        if "Emission Color" in bsdf.inputs:
            links.new(mix.outputs["Result"], bsdf.inputs["Emission Color"])

    if EARTH_BUMP_TEXTURE.exists():
        texcoord = nodes.new(type="ShaderNodeTexCoord")
        bump_tex = nodes.new(type="ShaderNodeTexImage")
        bump_tex.image = bpy.data.images.load(str(EARTH_BUMP_TEXTURE))
        bump_tex.image.colorspace_settings.name = "Non-Color"
        bump = nodes.new(type="ShaderNodeBump")
        bump.inputs["Strength"].default_value = 0.035
        bump.inputs["Distance"].default_value = 0.025
        links.new(texcoord.outputs["UV"], bump_tex.inputs["Vector"])
        links.new(bump_tex.outputs["Color"], bump.inputs["Height"])
        links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])

    set_principled(material, "Alpha", 1.0)
    set_principled(material, "Roughness", 0.84)
    set_principled(material, "Metallic", 0.0)
    set_principled(material, "Specular IOR Level", 0.16)
    set_principled(material, "Coat Weight", 0.0)
    set_principled(material, "Transmission Weight", 0.0)
    set_principled(material, "Emission Strength", variant.surface_emit)
    return material


def make_city_material(variant: Variant) -> bpy.types.Material:
    material = bpy.data.materials.new(f"lookdev_city_{variant.output_key}")
    material.use_nodes = True
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

    if EARTH_NIGHT_TEXTURE.exists():
        texcoord = nodes.new(type="ShaderNodeTexCoord")
        texture = nodes.new(type="ShaderNodeTexImage")
        texture.image = bpy.data.images.load(str(EARTH_NIGHT_TEXTURE))
        texture.extension = "REPEAT"
        ramp = nodes.new(type="ShaderNodeValToRGB")
        ramp.color_ramp.elements[0].position = 0.09
        ramp.color_ramp.elements[0].color = (0.0, 0.0, 0.0, 1.0)
        ramp.color_ramp.elements[1].position = 0.92
        ramp.color_ramp.elements[1].color = (1.0, 0.56, 0.18, 1.0)
        links.new(texcoord.outputs["UV"], texture.inputs["Vector"])
        links.new(texture.outputs["Color"], ramp.inputs["Fac"])
        links.new(ramp.outputs["Color"], emission.inputs["Color"])
    else:
        emission.inputs["Color"].default_value = (1.0, 0.56, 0.18, 1.0)
    emission.inputs["Strength"].default_value = variant.city_strength
    return material


def make_cloud_material(variant: Variant) -> bpy.types.Material:
    material = bpy.data.materials.new(f"lookdev_cloud_{variant.output_key}")
    material.use_nodes = True
    material.blend_method = "BLEND"
    material.use_screen_refraction = False
    material.show_transparent_back = False
    nodes = material.node_tree.nodes
    bsdf = nodes.get("Principled BSDF")
    if not bsdf:
        return material
    bsdf.inputs["Base Color"].default_value = (0.33, 0.43, 0.50, variant.cloud_alpha)
    if "Alpha" in bsdf.inputs:
        bsdf.inputs["Alpha"].default_value = variant.cloud_alpha
    if "Roughness" in bsdf.inputs:
        bsdf.inputs["Roughness"].default_value = 0.95
    if EARTH_CLOUDS_TEXTURE.exists():
        texcoord = nodes.new(type="ShaderNodeTexCoord")
        texture = nodes.new(type="ShaderNodeTexImage")
        texture.image = bpy.data.images.load(str(EARTH_CLOUDS_TEXTURE))
        texture.extension = "REPEAT"
        color = nodes.new(type="ShaderNodeHueSaturation")
        color.inputs["Saturation"].default_value = 0.12
        color.inputs["Value"].default_value = 0.26
        material.node_tree.links.new(texcoord.outputs["UV"], texture.inputs["Vector"])
        material.node_tree.links.new(texture.outputs["Color"], color.inputs["Color"])
        material.node_tree.links.new(color.outputs["Color"], bsdf.inputs["Base Color"])
    return material


def make_atmosphere_material(variant: Variant) -> bpy.types.Material:
    material = bpy.data.materials.new(f"lookdev_atmosphere_{variant.output_key}")
    material.use_nodes = True
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
    ramp = nodes.new(type="ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].position = 0.58
    ramp.color_ramp.elements[0].color = (0.0, 0.0, 0.0, 1.0)
    ramp.color_ramp.elements[1].position = 1.0
    ramp.color_ramp.elements[1].color = (1.0, 1.0, 1.0, 1.0)
    fresnel.inputs["IOR"].default_value = 1.08
    emission.inputs["Color"].default_value = (0.05, 0.32, 0.72, 1.0)
    emission.inputs["Strength"].default_value = variant.atmosphere_strength
    links = material.node_tree.links
    links.new(fresnel.outputs["Fac"], ramp.inputs["Fac"])
    links.new(ramp.outputs["Color"], mix.inputs["Fac"])
    links.new(transparent.outputs["BSDF"], mix.inputs[1])
    links.new(emission.outputs["Emission"], mix.inputs[2])
    links.new(mix.outputs["Shader"], output.inputs["Surface"])
    return material


def create_sphere(name: str, radius: float, material: bpy.types.Material) -> bpy.types.Object:
    bpy.ops.mesh.primitive_uv_sphere_add(segments=192, ring_count=96, radius=radius, location=(0, 0, 0))
    obj = bpy.context.object
    obj.name = name
    obj.rotation_euler = (0, 0, -0.38)
    obj.data.materials.append(material)
    return obj


def setup_scene(variant: Variant) -> bpy.types.Camera:
    scene = bpy.context.scene
    available_engines = {item.identifier for item in scene.render.bl_rna.properties["engine"].enum_items}
    scene.render.engine = "BLENDER_EEVEE_NEXT" if "BLENDER_EEVEE_NEXT" in available_engines else "BLENDER_EEVEE"
    scene.world = bpy.data.worlds.new(f"lookdev_world_{variant.output_key}")
    scene.world.color = (0.0, 0.003, 0.010)
    if hasattr(scene, "eevee"):
        if hasattr(scene.eevee, "taa_render_samples"):
            scene.eevee.taa_render_samples = 96
        if hasattr(scene.eevee, "use_bloom"):
            scene.eevee.use_bloom = True
        if hasattr(scene.eevee, "bloom_intensity"):
            scene.eevee.bloom_intensity = 0.035

    scene.view_settings.view_transform = "Filmic"
    scene.view_settings.look = "Medium High Contrast"
    scene.view_settings.exposure = variant.exposure
    scene.view_settings.gamma = 1.0

    bpy.ops.object.light_add(type="AREA", location=(-2.6, -3.4, 2.6))
    key = bpy.context.object
    key.name = "lookdev_cool_key"
    key.data.energy = variant.key_energy
    key.data.size = 4.2
    key.data.color = (0.40, 0.68, 1.0)

    bpy.ops.object.light_add(type="AREA", location=(0.2, -3.2, 0.6))
    fill = bpy.context.object
    fill.name = "lookdev_front_blue_fill"
    fill.data.energy = variant.fill_energy
    fill.data.size = 5.8
    fill.data.color = (0.08, 0.28, 0.72)

    bpy.ops.object.light_add(type="POINT", location=(2.6, -1.6, 1.0))
    rim = bpy.context.object
    rim.name = "lookdev_blue_rim"
    rim.data.energy = variant.rim_energy
    rim.data.color = (0.08, 0.45, 1.0)
    rim.data.shadow_soft_size = 5.0

    bpy.ops.object.light_add(type="POINT", location=(-1.0, -2.4, -0.4))
    warm = bpy.context.object
    warm.name = "lookdev_warm_city_support"
    warm.data.energy = 22
    warm.data.color = (1.0, 0.56, 0.18)
    warm.data.shadow_soft_size = 5.0

    bpy.ops.object.camera_add(location=(0, -4.2, 0.18))
    camera = bpy.context.object
    camera.name = "lookdev_camera"
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


def build_variant_scene(variant: Variant) -> tuple[bpy.types.Camera, dict[str, bpy.types.Object]]:
    reset_scene()
    camera = setup_scene(variant)
    earth = create_sphere("lookdev_earth", 1.0, make_earth_material(variant))
    city = create_sphere("lookdev_city", 1.004, make_city_material(variant))
    cloud = create_sphere("lookdev_cloud", 1.012, make_cloud_material(variant))
    atmosphere = create_sphere("lookdev_atmosphere", 1.045, make_atmosphere_material(variant))
    return camera, {"earth": earth, "city": city, "cloud": cloud, "atmosphere": atmosphere}


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


def create_sheet() -> None:
    margin = 36
    gap = 24
    reference_slot = 600
    slot = 390
    width = margin * 2 + reference_slot + gap + slot * 4 + gap * 3
    height = margin * 2 + max(reference_slot, slot)
    pixels = [0.010, 0.012, 0.016, 1.0] * (width * height)
    if REFERENCE_GLOBE_SPEC.exists():
        paste_image(pixels, width, REFERENCE_GLOBE_SPEC, margin, margin, reference_slot, reference_slot)
    x = margin + reference_slot + gap
    y = margin + (height - margin * 2 - slot) // 2
    for variant in VARIANTS:
        paste_image(pixels, width, OUTPUTS[variant.output_key], x, y, slot, slot)
        x += slot + gap
    sheet = bpy.data.images.new("globe_lighting_lookdev_sheet", width=width, height=height, alpha=True)
    sheet.pixels.foreach_set(pixels)
    sheet.filepath_raw = str(OUTPUTS["sheet"])
    sheet.file_format = "PNG"
    sheet.save()
    bpy.data.images.remove(sheet)


def write_debug_doc() -> None:
    lines = [
        "# Globe Lighting Lookdev Latest",
        "",
        f"Generated: {datetime.now(timezone.utc).isoformat()}",
        "",
        "Status: **FAILED LIGHTING LOOKDEV PROOF - NOT READY FOR HERO REINSERTION**",
        "",
        "## Outputs",
        "",
        f"- Sheet: `{OUTPUTS['sheet'].relative_to(REPO_ROOT)}`",
        f"- Best day surface: `{OUTPUTS['bestDaySurface'].relative_to(REPO_ROOT)}`",
        f"- Best city emission: `{OUTPUTS['bestCityEmission'].relative_to(REPO_ROOT)}`",
        f"- Best no atmosphere: `{OUTPUTS['bestNoAtmosphere'].relative_to(REPO_ROOT)}`",
        f"- Best with atmosphere: `{OUTPUTS['bestWithAtmosphere'].relative_to(REPO_ROOT)}`",
        "",
        "## Variant Scores",
        "",
        "| Variant | Score | Notes |",
        "| --- | ---: | --- |",
        "| A. Low Fill Cinematic | 16/30 | Darkest and least overfilled, but still reads as a smooth blue sphere with weak surface detail. |",
        "| B. Reference Balanced | 16/30 | More fill, but surface detail remains too weak and a visible band/seam breaks the render. |",
        "| C. Rich Surface Fill | 15/30 | Too smooth and map-like; not enough embedded terrain/cloud richness. |",
        "| D. Rim/Atmosphere Match | 15/30 | Rim direction is useful, but the globe still reads synthetic and under-detailed. |",
        "",
        "Best variant: **A. Low Fill Cinematic**, narrowly.",
        "",
        "## Gate",
        "",
        "- Ready for full hero reinsertion: no.",
        "- Best score: 16/30.",
        "- Pass requires at least 25/30 with no category below 4/5.",
        "- Remaining issue: lighting-only fill exposed a material/UV/detail problem. The globe reads as a smooth blue sphere with weak embedded Earth detail and a visible horizontal band/seam.",
        "",
        "## Recommendation",
        "",
        "Do not continue lighting-only tuning. Pivot to an R3F shader/static-render hybrid or source/create a high-quality art-directed globe plate that already contains the reference-level surface/cloud/ocean richness.",
        "",
    ]
    DOC_PATH.write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    ensure_dirs()
    best = VARIANTS[1]
    for variant in VARIANTS:
        camera, objs = build_variant_scene(variant)
        render(OUTPUTS[variant.output_key], camera, [objs["earth"], objs["city"], objs["cloud"], objs["atmosphere"]])

    camera, objs = build_variant_scene(best)
    render(OUTPUTS["bestDaySurface"], camera, [objs["earth"]])
    render(OUTPUTS["bestCityEmission"], camera, [objs["city"]])
    render(OUTPUTS["bestNoAtmosphere"], camera, [objs["earth"], objs["city"], objs["cloud"]])
    render(OUTPUTS["bestWithAtmosphere"], camera, [objs["earth"], objs["city"], objs["cloud"], objs["atmosphere"]])
    create_sheet()
    write_debug_doc()
    print(f"Globe lighting lookdev outputs written under {PREVIEW_DIR}")


if __name__ == "__main__":
    main()
