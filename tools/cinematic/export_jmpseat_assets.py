"""Export jmpseat cinematic GLBs without rendering previews.

Run from the repo root:
  blender --background --python tools/cinematic/export_jmpseat_assets.py
"""

from __future__ import annotations

import importlib.util
from pathlib import Path


BUILD_SCRIPT = Path(__file__).with_name("build_jmpseat_hero_scene.py")

spec = importlib.util.spec_from_file_location("jmpseat_cinematic_builder", BUILD_SCRIPT)
if spec is None or spec.loader is None:
    raise RuntimeError(f"Unable to load {BUILD_SCRIPT}")

builder = importlib.util.module_from_spec(spec)
spec.loader.exec_module(builder)
builder.build_scene(skip_renders=True)
