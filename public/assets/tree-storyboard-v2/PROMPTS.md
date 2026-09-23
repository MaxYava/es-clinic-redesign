# Tree film v2 — paired-frame prompts for Gemini Omni

Seven reference images, six clips, approximately 20 seconds. Generate each clip independently from its specified first and last image. The new opening is a **woody sapling**, not a green stem that receives bark from below. Its single existing wooden axis lengthens from the growing tip and thickens along its full length. The roots remain mostly below ground; only the natural root flare and short root shoulders are visible.

**Camera rule for the opening:** From the opening frame through all visible tree growth, the camera is locked in one fixed front-facing position, looking directly at the soil line and the beginning of the trunk. The camera does not follow the tip, zoom out, tilt up, pan, orbit, or change its lens to keep the growing tree in view. The base stays at the same screen coordinates; the growing upper trunk simply passes out through the top edge. The tree moves and changes; the camera does not. Only after the trunk and roots have completely reached their mature form may the camera make its first move toward the low-angle view at 00:07. The upward journey begins after that.

| Time | Image | Visual state |
| --- | --- | --- |
| 00:00 | `00-woody-sapling.png` | Small already-woody sapling |
| 00:04 | `04-young-trunk.png` | Taller young trunk, same static camera |
| 00:07 | `07-mature-base.png` | Full-size trunk and believable root collar; first low-angle view |
| 00:10 | `10-right-branch.png` | Camera climbing past a branch on the right |
| 00:13 | `13-left-branch.png` | Higher branch on the left |
| 00:16 | `16-upward-view.png` | Near two-thirds trunk height, tilting up |
| 00:20 | `20-canopy.png` | Final view under the crown |

Each clip must be **motionless for its first 0.5 seconds and its final 0.5 seconds**. Nothing moves during these holds: camera, branches, leaves, soil, light and exposure all remain fixed. Use the supplied stills as exact boundary images. The active movement happens only between the holds, with smooth ease-in and ease-out. At a join, the preceding 0.5-second hold and the following 0.5-second hold together create approximately one second of stillness. Do not use a crossfade.

Important: an image-to-video model may reinterpret even an uploaded endpoint. For a truly invisible join, in the editor use the **same actual still image** for the end hold of clip N and the start hold of clip N+1, at identical crop/resolution/color, or replace the generated hold frames with that still. Prompts alone cannot guarantee pixel-identical frames. If you prefer only 0.5 seconds total of stillness at the join, trim 0.25 seconds from each of the two holds; keep the matching still.

## Clip 1 — 0–4 s

Upload `00-woody-sapling.png` as first frame and `04-young-trunk.png` as last frame.

```text
Create one continuous photorealistic 16:9 botanical shot, approximately 4 seconds, using Image 1 as the exact first frame and Image 2 as the exact last frame. This is the SAME living tree in one fixed studio setup: warm seamless ivory background, centered dark soil mound, soft diffused golden light, muted olive-green leaves and warm brown bark.

Hold Image 1 completely motionless for the first 0.5 seconds. Then the existing woody sapling grows as a real tree grows: its original tip extends UPWARD, carrying the two leaves higher, while the entire pre-existing brown stem gradually thickens radially and develops mature bark texture across its whole length. The plant's base stays anchored at precisely the same screen position in the soil. The trunk is not extruded from the ground; bark does not travel upward like a sleeve or coating. The top and leaves eventually move beyond the upper frame edge as the living axis lengthens. Keep the camera absolutely locked in one front-facing view of the soil line and the beginning of the trunk throughout this clip: no zoom, tilt, pan, orbit, lens change, or reframing. Do not follow the growing tip; let it leave the frame.

At the soil line, show only a subtle natural root flare and perhaps two or three short shallow root shoulders that disappear back into the earth. Most roots stay buried. The mound may shift only slightly as the plant grows. No exposed rope lattice, spider roots, giant claws or tentacles. Reach the exact composition of Image 2, decelerate gently and hold it perfectly still for the final 0.5 seconds. Make every moving frame sharp, detailed and coherent for scroll-controlled inspection. No cut, dissolve, flicker, added tree, text, people, pot, sky or forest.
```

## Clip 2 — 4–7 s

Upload `04-young-trunk.png` as first frame and `07-mature-base.png` as last frame.

```text
Create one continuous photorealistic 16:9 shot, approximately 3 seconds, using Image 1 as the exact first frame and Image 2 as the exact last frame. Preserve the SAME tree, centered soil mound, warm ivory seamless background and soft diffused golden lighting.

Hold Image 1 completely motionless for the first 0.5 seconds. Then keep the camera absolutely fixed at the same front-facing position, still looking at the soil line and beginning of the trunk. Do not follow the top of the tree. While this viewpoint remains unchanged, the already-existing trunk continues to grow from its off-screen tip and thickens gradually along its full length into a powerful mature tree. Its bark gains depth organically across the surface; do not introduce a second trunk and do not let a bark shell crawl upward from the roots. The base stays at the same screen coordinates and widens naturally into a root collar and a few short sturdy root shoulders, which quickly disappear beneath the soil. Most roots remain buried. Preserve the same mound and believable anatomy; no long exposed snake roots, radial root net, claws or tentacles.

Only AFTER the tree has reached its full mature size, lower the camera slightly and tilt it gently upward to arrive at the low-angle perspective of Image 2. The camera must not begin rotating while the tree is still growing. Ease smoothly into the exact final composition, then hold Image 2 perfectly still for the last 0.5 seconds, including leaves, soil, exposure and camera. The wide trunk continues out of the top edge; no branch, crown or full tree is visible. No cut, crossfade, abrupt zoom, flicker, text, people, forest or pot.
```

## Clip 3 — 7–10 s

Upload `07-mature-base.png` as first frame and `10-right-branch.png` as last frame.

```text
Create one continuous photorealistic 16:9 shot, approximately 3 seconds, using Image 1 as the exact first frame and Image 2 as the exact last frame. This is the SAME fully grown tree, with the same warm brown vertically fissured bark, believable root collar, muted olive leaves, warm ivory background and soft golden light. The tree itself no longer grows or changes shape.

Hold Image 1 completely motionless for the first 0.5 seconds. Then start a slow upward dolly along the trunk, with a small controlled orbit toward the viewer's left. The soil and roots move naturally down and out of frame as the camera climbs. A higher branch already attached to the trunk gradually enters on the viewer's RIGHT. Keep the branch connection and bark patterns physically continuous; the trunk becomes somewhat narrower only because the camera is viewing a higher section of the real tree. Leave clean ivory space on the left for future text, but generate no text.

Decelerate to the exact Image 2 composition and hold it perfectly motionless for the final 0.5 seconds. Do not introduce a cut, crossfade, sudden change of camera direction, camera shake, branch teleportation, bark morph, exposure drift, heavy motion blur, extra tree, sky, pot or people. Each frame must remain crisp enough to examine when scrolling.
```

## Clip 4 — 10–13 s

Upload `10-right-branch.png` as first frame and `13-left-branch.png` as last frame.

```text
Create one uninterrupted photorealistic 16:9 shot, approximately 3 seconds, using Image 1 as the exact first frame and Image 2 as the exact last frame. Preserve the SAME mature tree, warm medium-brown fissured bark, olive leaves, ivory studio background and gentle golden light. The tree is static; only the camera moves during the action.

Hold Image 1 completely motionless for the first 0.5 seconds. Then rise past the right-hand branch already visible in Image 1. It descends naturally out of frame because of camera travel; it does not disappear, flip sides or morph. Make one gentle S-shaped lateral move toward the viewer's right while continuing upward. A different higher branch attached to the same trunk gradually enters on the viewer's LEFT, reaching the composition in Image 2. Maintain plausible 3D parallax, continuous bark features and natural taper of the trunk. Leave clean ivory negative space to the right for later typography, but do not generate any words.

Slow to a complete stop on the exact Image 2 view and hold it fully static for the final 0.5 seconds. No motion of leaves, camera or exposure during either hold. No cuts, dissolves, camera-direction snap, flicker, duplicated branches, extra trees, people, pot, sky or heavy motion blur.
```

## Clip 5 — 13–16 s

Upload `13-left-branch.png` as first frame and `16-upward-view.png` as last frame.

```text
Create one continuous photorealistic 16:9 camera take, approximately 3 seconds, using Image 1 as the exact first frame and Image 2 as the exact last frame. This is the SAME mature tree in the same warm ivory studio environment, with identical bark character, muted olive leaves and soft golden diffused light.

Hold Image 1 completely motionless for the first 0.5 seconds. Then glide upward past the left-hand branch. The camera reaches roughly two-thirds of the trunk's height and begins a slow, controlled upward tilt, looking toward the first forks overhead. Introduce the tilt gradually, without any sudden change of direction or focal length. Keep the trunk recognizable in every frame; its taper and branch connections remain physically consistent. The first upper leaves enter near the upper corners, with warm ivory gaps still visible. Do not reveal the whole tree or a complete crown yet.

Ease smoothly to the exact upward-looking composition of Image 2 and hold it perfectly still for the final 0.5 seconds. No leaf sway or exposure drift during the holds. Keep all intermediate frames detailed and sharp. No cut, crossfade, orbit snap, flicker, branch teleportation, blue sky, forest, text, people or pot.
```

## Clip 6 — 16–20 s

Upload `16-upward-view.png` as first frame and `20-canopy.png` as last frame.

```text
Create the final continuous photorealistic 16:9 section, approximately 4 seconds, using Image 1 as the exact first frame and Image 2 as the exact last frame. Preserve the SAME single tree: distinctive brown fissured bark, organically connected branches, muted olive-green leaves, warm ivory background and soft diffused golden studio light.

Hold Image 1 completely motionless for the first 0.5 seconds. Then move only slightly higher while smoothly tilting farther upward into the leafy crown. The existing trunk enters from below and leads the eye into irregular, physically connected branches overhead. The canopy is natural and subtly asymmetric, not a perfect circular starburst. Keep individual leaves crisp, with breathable warm-ivory gaps between them. Do not replace the background with an outdoor blue sky or forest. Never pull back to show the full tree.

Let the motion decelerate gently into the exact final composition of Image 2 and hold that frame fully motionless for the final 0.5 seconds. Nothing moves during the two holds, including foliage, camera, shadows and exposure. No cut, crossfade, sudden orbit reversal, flicker, heavy motion blur, morphing bark, extra trees, text, people, pot or graphics.
```

## Final assembly checklist

1. Export every clip at the same resolution, aspect ratio, frame rate and color settings.
2. Confirm that each uploaded end still is also the uploaded start still of the next clip.
3. For exact joins, replace or cover both generated holds with the very same PNG at identical crop and color; prompt-only matching is not reliable enough for a frame-by-frame scroll experience.
4. Join with a hard cut **inside the stillness**, never with a dissolve. The direction can change only after the 0.5-second opening hold and should ease in, not snap.
5. Scrub across each boundary and inspect bark, branch attachment, leaf silhouette and background brightness, not only the central trunk.
