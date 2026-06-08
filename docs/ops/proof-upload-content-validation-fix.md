# Proof Upload Content Validation Fix

Date: 2026-06-08

## Summary

This patch hardens redacted proof upload validation so the server no longer
trusts browser-controlled MIME metadata or filename extensions alone.

The prior upload path accepted `File.type` and the filename extension as the
source of truth, then stored the uploaded bytes in the private proof bucket with
that client-provided image content type. A normal authenticated user could label
HTML, SVG, PDF, ZIP, or random bytes as JPEG/PNG and store them as proof
objects. That did not prove script execution or account compromise, but it did
allow unexpected non-image bytes into a sensitive reviewer-facing storage flow.

## Fix

Redacted proof upload validation now requires all three signals to agree before
Storage upload:

- allowed browser MIME value: `image/jpeg` or `image/png`
- allowed filename extension: `.jpg`, `.jpeg`, or `.png`
- server-side byte validation of real JPEG or PNG structure

The server rejects:

- HTML labeled as PNG/JPEG
- SVG labeled as PNG/JPEG
- PDF labeled as PNG/JPEG
- ZIP or random bytes labeled as PNG/JPEG
- MIME/content/extension mismatches
- empty or truncated image-like files
- files over the existing size cap

Rejected files receive the safe user-facing error:

`Upload a real PNG or JPEG image.`

The action still enforces redaction acknowledgement before upload and keeps the
existing 5 MB cap.

## Decode/Re-Encode Decision

This patch does not add server-side decode/re-encode. The current runtime does
not already include an image decoding pipeline, and adding a heavy native image
dependency would require separate deployment compatibility review.

Instead, the patch uses bounded structural validation:

- PNG validation checks the PNG signature, required chunk order, `IHDR`, nonzero
  dimensions, supported image fields, nonempty `IDAT`, and terminal `IEND`.
- JPEG validation checks SOI/EOI markers, segment bounds, a valid start-of-frame
  segment with nonzero dimensions, and a start-of-scan segment.

This is a server-side content gate and materially improves reviewer safety
without changing product scope or storage policy.

## Storage Behavior

Storage remains private and unchanged:

- bucket: `verification-proofs`
- UUID-only randomized storage paths
- no public URLs
- no signed URLs during upload
- no proof filename/path/content in user-visible errors or security-event
  metadata

Storage `contentType` is set from the server-detected safe validation result,
not directly from `File.type`.

## Reviewer Access

Reviewer access behavior is unchanged:

- reviewer-scope checks remain required
- request/evidence matching remains required
- self-review remains blocked
- only reviewable statuses can be viewed
- signed URLs remain short-lived and server-minted only after authorization
- proof-view audit logging remains in place

This patch only reduces what can enter the private proof bucket.

## Boundaries Preserved

This patch does not change:

- public waitlist behavior
- waitlist database behavior
- private-app operator scope gate behavior
- security-events trust-boundary behavior
- proof bucket privacy
- reviewer authorization
- signed URL TTLs
- proof cleanup behavior
- beta grants
- operator grants
- role claims
- base claims
- restricted-board claims
- private beta auth settings

No proof files or runtime data were accessed or mutated.

## Validation Status

Regression coverage proves:

- valid minimal PNG bytes are accepted
- valid minimal JPEG bytes are accepted
- fake PNG/JPEG metadata with HTML bytes is rejected
- SVG, PDF, ZIP, random bytes, and truncated image-like bytes are rejected
- MIME/content/extension mismatches are rejected
- accepted upload metadata and Storage content type use the safe validation
  result
- existing redaction acknowledgement, file size, storage path, metadata,
  rollback, and reviewer signed-URL authorization tests still pass

Runtime deploy validation remains pending after review/merge.

This finding is part of security closeout before final Epoch 5 close.
