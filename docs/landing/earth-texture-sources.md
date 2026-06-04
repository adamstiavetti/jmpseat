# jmpseat Cinematic Earth Texture Sources

Updated: 2026-05-30T05:41:37.241634+00:00

These assets are local runtime files for the Blender/R3F cinematic globe pipeline. They are not hotlinked at runtime.

## Output Files

| File | Type | Source status |
| --- | --- | --- |
| `public/cinematic/textures/earth_day.jpg` | sourced | copied from public/textures/earth/earth-day.jpg |
| `public/cinematic/textures/earth_night.jpg` | sourced | copied from public/textures/earth/earth-night.jpg |
| `public/cinematic/textures/earth_clouds.png` | fallback/generated | generated procedural fallback cloud opacity map with ImageMagick plasma noise |
| `public/cinematic/textures/earth_bump.jpg` | fallback/generated | generated procedural fallback bump map from NASA day texture luminance |
| `public/cinematic/textures/earth_specular.jpg` | fallback/generated | generated procedural fallback specular/ocean mask from inverted NASA day texture luminance |

## Source Notes

- `earth_day.jpg` uses the repo-local NASA Blue Marble / Blue Marble Next Generation derivative from `public/textures/earth/earth-day.jpg`.
- `earth_night.jpg` uses the repo-local NASA Black Marble / Earth at Night derivative from `public/textures/earth/earth-night.jpg`.
- `earth_clouds.png` is a procedural fallback cloud-opacity map generated locally because no vetted permissive cloud map is currently committed.
- `earth_bump.jpg` is a procedural fallback generated from day-texture luminance. It is useful for previs only and is not a scientifically accurate elevation map.
- `earth_specular.jpg` is a procedural fallback generated from inverted day-texture luminance. It approximates ocean/land reflectivity for previs only.

## License / Usage Assumption

- NASA source imagery is used under NASA images and media usage guidance: https://www.nasa.gov/nasa-brand-center/images-and-media/
- NASA endorsement must not be implied.
- Procedural fallback maps were generated locally from either noise or derived luminance and should be replaced with vetted production-quality maps before final launch if higher fidelity is required.

## Known Limitations

- Cloud, bump, and specular maps are fallback assets, not final art.
- The current Blender preview can use these maps to move beyond a blue procedural orb, but final premium quality may still require artist-authored texture tuning or higher-resolution map variants.
