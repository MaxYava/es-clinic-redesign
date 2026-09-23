# Tree growth — Gemini Omni storyboard

Target: approximately 20 seconds, landscape 16:9, six continuous transitions. These stills are composition and continuity references, not frames to dissolve between. Use the first still as the start frame and the second as the end frame for each segment whenever the interface exposes first/last-frame control. If it accepts only references, upload both and explicitly identify their order.

| Time | Frame | Purpose |
| --- | --- | --- |
| 00:00 | `00-seedling.jpg` | Original two-leaf seedling; locked camera |
| 00:04 | `04-roots-trunk.png` | Same plant, now roots and lower woody trunk; still locked camera |
| 00:06 | `06-mature-trunk-low-angle.png` | Powerful mature base and roots, seen from a low angle |
| 00:08 | `08-right-branch.png` | First gentle upward move; branch on viewer's right |
| 00:12 | `12-left-branch.png` | Continued climb; branch on viewer's left |
| 00:16 | `16-upward-tilt.png` | Camera near two-thirds of trunk height, tilting up |
| 00:20 | `20-canopy.png` | Final upward view into the leafy crown |

## Shared continuity specification

Add this paragraph to every segment prompt if Omni does not retain context between generations:

> One and the same tree throughout. Match the supplied start and end frames precisely in subject identity, trunk silhouette, branch topology, warm brown fissured bark, exposed roots, muted olive-green leaves, central composition, warm ivory seamless background, soft diffused golden studio light, and 16:9 framing. Photorealistic macro-to-medium botanical cinematography, crisp detailed textures in every frame, stable exposure and color. One continuous physically plausible camera take, no cuts, crossfades, dissolves, time jumps, sudden speed changes, heavy motion blur, flicker, warping, duplicated branches, teleporting leaves, or changes of species. Do not show the whole tree, a landscape, a horizon, a pot, people, writing, logos, or graphics. Silent video. Leave clean negative space beside the trunk for text to be added later; do not generate any text.

## Segment 1 — 00:00–00:04, seedling to roots

Start: `00-seedling.jpg`  
End: `04-roots-trunk.png`

> Create an approximately four-second seamless shot interpolating from the supplied seedling start frame to the supplied roots-and-trunk end frame. Keep the camera absolutely locked: no pan, tilt, orbit, zoom, dolly, or reframing. The original seedling itself grows upward continuously and thickens; its thin green stem gradually becomes the same broad woody trunk, with bark forming progressively over its surface. The original seed leaves rise naturally out of the upper edge of the tight composition as the plant grows. Roots extend organically from the existing stem base across and through the same mound of dark soil, first fine threads, then visible branching roots. Small soil particles shift naturally as roots expand. This must read as one living plant maturing, never a separate tree rising from the ground. The growth is smooth, evenly paced, and fully legible when paused at any intermediate frame. End with only the roots and lower trunk visible; the crown remains off-screen. No camera movement before the end frame.

## Segment 2 — 00:04–00:06, trunk reaches full size

Start: `04-roots-trunk.png`  
End: `06-mature-trunk-low-angle.png`

> Create an approximately two-second seamless shot from the supplied smaller roots-and-trunk frame to the supplied powerful low-angle mature-trunk frame. During the first part, keep the camera entirely locked: the existing trunk itself thickens substantially, its bark deepens and roughens, and the same roots widen into a strong flared base while staying attached to the original soil mound. This is continuous biological growth of one plant, not a second trunk emerging from the ground and not a simple image-scale enlargement. Once the trunk and roots have fully formed, and only then, lower the camera slightly beside the mound and tilt it upward in one slow, smooth move to arrive at the end frame. The final perspective looks up along the massive lower trunk, which exits the top edge; there are no branches or leaves in this tight crop. Keep every intermediate frame sharp and physically coherent, with stable warm ivory backdrop and soft studio light. No cut, dissolve, sudden zoom, or whole-tree reveal.

## Segment 3 — 00:06–00:08, begin the ascent

Start: `06-mature-trunk-low-angle.png`  
End: `08-right-branch.png`

> Create an approximately two-second continuous shot from the supplied low-angle mature-trunk frame to the supplied right-branch frame. The tree is already fully grown; nothing else sprouts or changes shape. Begin a slow upward camera dolly close to the trunk and a subtle orbit toward the viewer's left, so the first large branch enters from the viewer's right. The enormous root base descends smoothly out of the bottom of frame. As the camera rises, the trunk becomes narrower naturally because of height and perspective, never because it morphs or suddenly shrinks. Keep the bark markings and branch attachment physically continuous, with gentle parallax and no shake. Maintain clear ivory negative space on the viewer's left for future typography but generate no text. Never pull back to show the whole tree. End precisely on the supplied right-branch composition.

## Segment 4 — 00:08–00:12, pass alternating branches

Start: `08-right-branch.png`  
End: `12-left-branch.png`

> Continue the same uninterrupted upward journey for approximately four seconds, beginning exactly at the supplied right-branch frame and ending exactly at the supplied left-branch frame. Glide past the already-established branch on the viewer's right; it moves naturally downward and out of frame as the camera rises. Make a small, smooth S-shaped lateral move around the trunk toward the viewer's right. A different branch, attached higher on the same trunk, gradually appears on the viewer's left. Its leaves are muted olive green and sharply resolved. Preserve real 3D depth, coherent parallax, consistent bark details, and a slightly smaller trunk diameter as height increases. Leave open ivory background to the right for future copy, without generating text. Do not swap the side of a branch, create a new tree, or use a cut or dissolve.

## Segment 5 — 00:12–00:16, reach two-thirds height

Start: `12-left-branch.png`  
End: `16-upward-tilt.png`

> Continue seamlessly from the supplied left-branch frame for approximately four seconds. The camera rises along the same trunk, passes the left-side branch, and reaches roughly two-thirds of the trunk's height. Gradually transition from a near-level view into a controlled upward tilt; this tilt begins gently and increases smoothly, revealing the first larger forks overhead. The trunk remains present and recognizable in every frame and tapers naturally. The leafy crown begins to enter only at the upper edge. The camera does not reach the top and never shows the entire tree. Retain the warm ivory studio backdrop, soft light, detailed brown bark, restrained olive leaves, and a stable continuous sense of height. End exactly on the supplied upward-tilt composition. No jump in orientation or focal length.

## Segment 6 — 00:16–00:20, look into the crown

Start: `16-upward-tilt.png`  
End: `20-canopy.png`

> Create the final approximately four-second section of the same continuous camera take. From the supplied upward-tilt frame, rise only a little farther while the camera tilts more strongly upward into the leafy crown. The existing trunk and branching forks lead the eye from the lower frame toward overlapping leaves overhead. Preserve the exact same species, branch geometry, muted green foliage, warm brown textured bark, and cream-colored light visible through gaps in the leaves. Let the camera movement ease down smoothly, arriving at the supplied canopy end frame and holding it nearly still for the last half-second. Finish with an intimate upward view under the canopy, not a wide shot of the entire tree or any outdoor sky. Every intermediate frame remains crisp enough for scroll-controlled inspection.

## Assembly and review

Generate each adjacent pair separately, keeping the last frame of one segment identical to the first frame of the next. Review the boundary at 4, 6, 8, 12, and 16 seconds frame by frame: trunk texture, root layout, branch position, lighting, and camera direction should continue without a jump. The camera must remain locked until the trunk reaches full size in segment 2; its low-angle move begins only after growth is complete. Prefer a high-quality 16:9 export with stable frame rate and minimal motion blur, because scroll control exposes individual frames. If your Omni interface does not offer the requested two- or four-second durations, generate its native clip length and choose or retime the usable portions in an editor; do not assume that the reference stills alone guarantee exact timing.

Official feature references: [Google's Gemini Omni 1.1 Flash announcement](https://blog.google/innovation-and-ai/technology/developers-tools/build-with-gemini-omni-1-1-flash/), [Gemini video generation overview](https://gemini.google/us/overview/video-generation/).
