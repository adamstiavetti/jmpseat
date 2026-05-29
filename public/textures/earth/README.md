# Earth Texture Assets

## 1. Asset List

- `earth-day.jpg`
- `earth-night.jpg`
- `earth-clouds.png` - deferred, not committed in this task

## 2. File Purpose

- `earth-day.jpg`
  - Global Earth surface/day texture for continents, oceans, ice, and land detail.
- `earth-night.jpg`
  - Global Earth-at-night/city-lights texture for emissive night-side lighting.
- `earth-clouds.png`
  - Planned optional cloud layer for a future translucent shell; deferred pending a better official source choice.

## 3. Source URL

- `earth-day.jpg`
  - https://assets.science.nasa.gov/content/dam/science/esd/eo/images/bmng/bmng-base/january/world.200401.3x5400x2700.jpg
- `earth-night.jpg`
  - https://assets.science.nasa.gov/content/dam/science/esd/eo/images/imagerecords/144000/144898/BlackMarble_2016_01deg.jpg
- `earth-clouds.png`
  - No committed file. Candidate official NASA cloud sources were reviewed, but no cloud asset was selected for commit in this task.

## 4. Source Owner

- `earth-day.jpg`
  - NASA Earth Observatory / Visible Earth / Blue Marble Next Generation
- `earth-night.jpg`
  - NASA Earth Observatory / Black Marble
- `earth-clouds.png`
  - Deferred

## 5. License / Usage Assumption

- NASA imagery is used under NASA images and media usage guidance:
  - https://www.nasa.gov/nasa-brand-center/images-and-media/
- Usage assumption for this repo:
  - NASA Earth imagery is acceptable for this planning/prototype workflow if NASA endorsement is not implied and NASA insignia/logos are not used as branding.
- Known caveat:
  - This is a documented usage assumption, not legal advice. Future production use should preserve source attribution records and avoid any endorsement implication.

## 6. Date Accessed

- `earth-day.jpg`
  - Accessed 2026-05-29
- `earth-night.jpg`
  - Accessed 2026-05-29
- `earth-clouds.png`
  - Deferred 2026-05-29

## 7. Optimization Notes

- Tool used:
  - ImageMagick `7.1.2-24`, installed via Homebrew during this task.
- Source staging path:
  - `/tmp/deadheadclub-earth-src/`
- Commands used:

```bash
magick /tmp/deadheadclub-earth-src/earth-day-source.jpg \
  -resize 4096x2048 -strip -interlace Plane -quality 90 \
  public/textures/earth/earth-day.jpg

magick /tmp/deadheadclub-earth-src/earth-night-source.jpg \
  -resize 3600x1800 -strip -interlace Plane -quality 92 \
  public/textures/earth/earth-night.jpg
```

- Notes:
  - The day texture was reduced from `5400x2700` to `4096x2048`.
  - The selected night source was already `3600x1800`; it was not upscaled to `4096x2048`.
  - Metadata was stripped and progressive JPEG encoding was used.

## 8. Known Limitations

- No cloud texture is committed yet.
- The selected Black Marble JPEG is lower resolution than the day texture and may be softer at extreme close-up hero scales.
- Textures alone will not create the final premium globe look; atmosphere shading, city-light tuning, route arcs, marker art direction, and mobile QA are still required.

## 9. File Sizes

- `earth-day.jpg`
  - `1,029,502` bytes (`1.0M`)
  - `4096x2048`
- `earth-night.jpg`
  - `722,575` bytes (`708K`)
  - `3600x1800`
- `earth-clouds.png`
  - deferred
