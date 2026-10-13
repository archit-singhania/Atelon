# Showcase model download guide

The first ten targets are recorded in `data/showcase.csv`. Every proposed asset is still in `license-review`; a search result or visible download button is not final approval.

## Download each candidate

1. Create or sign in to your own Sketchfab account.
2. Open the exact model URL from `data/showcase.csv`.
3. Confirm the page still says **Download 3D Model** and **CC Attribution**, not NonCommercial, Editorial, Standard, view-only, or another license.
4. Copy the creator name and the attribution text offered by the download dialog.
5. Save a full-page PDF or screenshots showing the title, creator, model URL, license, and download availability.
6. Select **Download 3D Model**, then choose the original archive when available; choose glTF/GLB as a working copy only when the original is unavailable.
7. Store the archive outside the public web folder under `source-assets/<vehicle-slug>/original/`. This directory is ignored by Git.
8. Put the saved license evidence under `source-assets/<vehicle-slug>/evidence/`.
9. Do not rename or delete the original archive. Record its SHA-256 hash before editing.
10. Inspect the model in Blender before it is copied into `apps/web/public/models/`.

## Reject immediately

- CC BY-NC, NC-SA, NC-ND, Editorial, Standard marketplace, personal-use-only, or unclear terms.
- A model whose description says “not for commercial use” even if another label appears nearby.
- A ripped game model, manufacturer configurator extraction, or model credited to somebody other than the uploader.
- A generation or variant that does not match the vehicle record.
- Missing textures, unusable geometry, or branding embedded in a way that cannot be reviewed.

## Approval result

- **Full:** exact identity, acceptable quality, and license evidence complete.
- **Reference:** visually representative but not exact; disclosure is mandatory.
- **Specs-only:** identity, rights, quality, or performance cannot be approved.

CC BY requires creator credit, a license link, and disclosure of modifications. It does not grant trademark, design, privacy, or publicity rights, so final publication still needs the project legal review.
