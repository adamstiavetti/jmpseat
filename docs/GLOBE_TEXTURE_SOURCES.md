# Globe Texture Sources

## 1. Purpose

This document records the selected Earth texture sources for the future premium interactive aviation globe. It exists so the future implementation phase can use pre-vetted, web-optimized assets with recorded provenance, usage assumptions, and limitations.

This task prepared assets only. It did not implement the globe, add app dependencies, modify app behavior, or deploy anything.

## 2. Selected Texture Sources

### Earth Surface / Day Texture

- Source title:
  - Blue Marble Next Generation January base map
- Source URL:
  - https://assets.science.nasa.gov/content/dam/science/esd/eo/images/bmng/bmng-base/january/world.200401.3x5400x2700.jpg
- Source owner:
  - NASA Earth Observatory / Visible Earth
- Date accessed:
  - 2026-05-29
- Supports:
  - Continents, oceans, polar ice, and overall Earth surface realism.

### Earth-at-Night / City Lights Texture

- Source title:
  - Black Marble 2016 global Earth-at-night image
- Source URL:
  - https://assets.science.nasa.gov/content/dam/science/esd/eo/images/imagerecords/144000/144898/BlackMarble_2016_01deg.jpg
- Source owner:
  - NASA Earth Observatory / Black Marble
- Date accessed:
  - 2026-05-29
- Supports:
  - Night-side emissive city lights and premium Earth-at-night visual character.

### Cloud Texture

- Status:
  - Deferred
- Reason:
  - A cloud layer is optional, and no official source was selected in this task that met all three constraints at once:
    1. clearly official/high-signal provenance,
    2. usable globe-layer characteristics for a premium hero,
    3. clean fit for a transparent web-ready cloud shell without forcing a weak or questionable asset.

## 3. Why Each Source Was Chosen

- `earth-day.jpg`
  - Chosen because Blue Marble is the highest-signal official NASA Earth surface source for a global base texture and is a standard reference for Earth render workflows.
- `earth-night.jpg`
  - Chosen because Black Marble provides the strongest official Earth-at-night/city-light signal and directly supports the intended cinematic night-globe look.
- Cloud layer deferred
  - Chosen not to commit yet because a weak or mismatched cloud texture would hurt the final globe more than help it. Deferral is the better technical and visual decision here.

## 4. License / Usage Notes

- NASA images/media guidance:
  - https://www.nasa.gov/nasa-brand-center/images-and-media/
- Usage assumption used in this repo:
  - NASA Earth imagery is acceptable for prototype and implementation planning use as long as NASA endorsement is not implied and NASA insignia/logos are not used as branding.
- Limit:
  - This is a working documentation note, not legal advice. Future public production use should continue to preserve provenance and avoid endorsement implications.

## 5. File Paths

- `public/textures/earth/earth-day.jpg`
- `public/textures/earth/earth-night.jpg`
- `public/textures/earth/README.md`
- `public/textures/earth/earth-clouds.png` - deferred / not present

## 6. File Sizes

- `public/textures/earth/earth-day.jpg`
  - `1,029,502` bytes
  - `4096x2048`
- `public/textures/earth/earth-night.jpg`
  - `722,575` bytes
  - `3600x1800`
- `public/textures/earth/earth-clouds.png`
  - deferred

## 7. Optimization Process

- Image tool:
  - ImageMagick `7.1.2-24`
- Installation method:
  - Homebrew, installed during this task
- Source files were staged in:
  - `/tmp/jmpseat-earth-src/`
- Commands used:

```bash
magick /tmp/jmpseat-earth-src/earth-day-source.jpg \
  -resize 4096x2048 -strip -interlace Plane -quality 90 \
  public/textures/earth/earth-day.jpg

magick /tmp/jmpseat-earth-src/earth-night-source.jpg \
  -resize 3600x1800 -strip -interlace Plane -quality 92 \
  public/textures/earth/earth-night.jpg
```

- Process notes:
  - Day texture was resized down from `5400x2700` to the preferred web target `4096x2048`.
  - Night texture remained at its official source resolution `3600x1800` to avoid unnecessary upscaling.
  - Metadata was stripped.
  - Progressive JPEG output was used to keep files small without visibly cheapening the textures.

## 8. Deferred / Missing Assets

- `public/textures/earth/earth-clouds.png`
  - deferred
- Why deferred:
  - No cloud asset was selected that was both clearly official/high-signal and strong enough for a premium globe shell.
- What to do later:
  - Revisit official NASA cloud sources specifically for a future cloud-shell pass, or intentionally skip clouds if city lights and atmosphere already read strongly enough.

## 9. Next Implementation Step

Recommended next step:

- Static globe core implementation

That phase should:

- install approved R3F/Three packages,
- create the globe on a lab-only route,
- use the prepared `earth-day.jpg` and `earth-night.jpg` textures,
- add an atmosphere layer and fallback handling,
- keep `/` and `/app` unchanged.
