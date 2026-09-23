# Two missing tree-video segments

The supplied middle film is 1280 × 720, 24 fps, 384 frames (16 seconds). Its exact decoded frame 0 is `video-first-frame.png`; exact decoded frame 383 is `video-last-frame.png`. These are the authoritative join anchors. Do not replace them with similar storyboard pictures.

## Opening segment — sapling to the existing film

Recommended first image: `../tree-storyboard-v2/00-woody-sapling.png` as the **opening composition reference**. Required last image: `video-first-frame.png` as the **exact endpoint**. If the video tool accepts only one image, supply the required endpoint and describe the small sapling in the prompt. Target roughly 4 seconds, 16:9, 1280 × 720, 24 fps.

```text
Create an approximately four-second, single-take photorealistic botanical film in 16:9 at 1280 × 720 and 24 fps. Image 1 shows the intended small woody sapling at the beginning; Image 2 is the EXACT final frame of this new clip and is the exact first frame of an existing film. Image 2 has priority over Image 1 for the final camera position, soil mound shape and placement, background color, trunk position, bark pattern, crop, lighting and exposure. The final frame must match Image 2 as closely as possible, not merely depict a similar tree.

Start with a small, already woody sapling emerging from the CENTER of the same low dark-soil mound, with two modest muted olive leaves near its tip. The warm pale-ivory seamless studio background and soft diffuse golden illumination remain unchanged. Hold the opening view completely still for 0.5 seconds. Throughout all growth, the camera is completely LOCKED in a straight-on frontal view of the soil line and the beginning of the trunk. The soil mound and root collar remain at the same screen coordinates. Do NOT pan, tilt, dolly, orbit, zoom, change the lens, follow the tip or reframe.

The pre-existing woody stem grows as one living axis. Its growing tip extends UPWARD and carries the two leaves upward, eventually out through the TOP edge of the frame. At the same time the entire original stem gradually thickens and its existing bark deepens naturally across its full length. The stem itself becomes the young tree; do not spawn a separate trunk from the ground and do not make a brown bark sleeve rise from the roots. Do not reveal a whole tree. Most roots remain below the soil; show only a restrained, natural root collar. No long exposed rope roots or claws.

Match the final 0.5 seconds to Image 2: a centered, straight, medium-thickness brown trunk running out of the TOP edge, the same unbroken low soil mound near the bottom, no visible leaves or branches, and generous warm ivory negative space on both sides. Smoothly reduce growth to zero and hold this exact composition motionless for the last 0.5 seconds. No camera motion, leaf sway, changing light, exposure breathing, blur, crossfade, cut, added objects, text, pot, forest or blue sky.
```

## Closing segment — existing film to upward canopy view

Required first image: `video-last-frame.png`, the **exact last frame of the existing film**. Optional last-image composition reference: `../tree-storyboard-v2/20-canopy.png`. The required first image has priority for trunk identity and branch connections; do not simply morph the existing tree into the reference canopy. Target roughly 4 seconds, 16:9, 1280 × 720, 24 fps.

```text
Create an approximately four-second, single-take photorealistic botanical film in 16:9 at 1280 × 720 and 24 fps. Image 1 is the EXACT first frame of this new clip and the exact final frame of an existing film. It is the authoritative reference for tree identity, camera starting position, trunk location and width, distinctive vertical bark grooves and knots, the two already-visible upper branch attachments, olive leaves, lighting, ivory background, crop and exposure. If Image 2 is supplied, use it only as a reference for the desired FINAL upward-looking composition; preserve the actual tree from Image 1 rather than replacing it.

Begin with Image 1 completely motionless for 0.5 seconds. Then continue ONE uninterrupted camera move: rise only a little along the trunk and slowly tilt FURTHER UPWARD until the camera is looking almost straight up from beneath the leafy crown. Do not reverse direction, roll, swing sideways or suddenly change focal length. The trunk remains connected and recognizable, entering from the lower center as its real branches spread overhead. The two branch attachments visible at the start stay physically attached to the same places; new upper branches are revealed by the camera angle, not grown or teleported into existence. The tree has stopped growing.

End in an intimate upward view under the crown, with irregular natural branches and a breathable canopy of crisp muted olive leaves. Leave warm pale-ivory gaps between leaves; never turn the background into an outdoor blue sky or a forest. The canopy must be organic and asymmetric, not a symmetrical starburst. Preserve the existing film's warm soft light, brown bark texture, leaf shapes and premium photographic finish. Slow the camera to a complete stop and hold the exact final composition motionless for the last 0.5 seconds. Every intermediate frame must be sharp enough for scroll-controlled inspection. No cut, dissolve, flicker, bark morph, duplicated branches, leaf teleportation, heavy motion blur, text, people or pot.
```

## Join notes

For a frame-perfect join, the prompt is not enough. Insert the extracted PNG itself at the boundary: use `video-first-frame.png` as both the last hold of the new opening and the first frame/hold of the existing film; use `video-last-frame.png` as both the last frame/hold of the existing film and the first hold of the new closing. Keep identical 1280 × 720 crop and color. Use a hard cut inside the stillness, not a dissolve. The existing film's first half-second is effectively static, but its final half-second is still moving; gently ease or retime its last few frames before freezing `video-last-frame.png` if the stop is visible.
