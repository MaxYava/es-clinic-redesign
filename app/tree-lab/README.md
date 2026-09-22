# Tree lab — bonsai study

Preview route: `/tree-lab`, in the current **es-clinic-next-editor** workspace. The original research concerned **es-clinic-motion-lab**; implementation here is isolated from the existing home page.

## Current model: bonsai

The default model is a new, hand-composed bonsai study. `bonsai-model.js` defines the trunk bends, spreading roots, primary branch paths and six unequal foliage regions. Only fine ramification and individual leaves use deterministic variation. It does not reuse the previous EZ-Tree skeleton.

`tree-scene-bonsai.js` renders the model with textured bark, curved individual leaves, a small moss bed and five-petal flowers. The trunk remains visible between crown layers. Flowers open after the crown has developed. This is a stylized real-time 3D study, not a scanned tree or a claim of photographic realism.

Growth is reversible. The young stem gradually develops the mature bends. Tube cross-sections follow the sampled curve orientation at every stage, preventing the twisting and flattening that otherwise occurs on a bent growing trunk. Secondary limbs split into smaller forks instead of radiating from a single point. Instancing limits draw calls. The renderer sleeps when progress and viewing angle settle or the page is hidden; the mobile version uses fewer leaf subdivisions, lower pixel ratio and smaller shadow maps. GPU resources and observers are disposed when switching models.

The “Бонсай / Предыдущая модель” buttons compare this study with the earlier baked EZ-Tree version at the same growth stage. “Взрослое дерево” immediately shows the mature composition. “Ракурс” cycles through front and two oblique views without resetting growth. The first, older procedural scene is retained in `tree-scene.js` but is no longer in the comparison UI.

## Scroll and accessibility

Natural scroll, the range slider, the three contract chapter buttons and 20-second playback share one progress value. Reduced-motion mode uses chapter stills unless playback is explicitly requested. Keyboard tab navigation and the slider remain available. A render of this exact bonsai (`public/tree-lab/bonsai-fallback.png`) is used when its WebGL context cannot be created or is lost.

The three requested contract categories remain unchanged. The existing home page is unchanged.

## Keyframe images and video research

The second panel now shows **photorealistic magnolia series 02**, regenerated after the bonsai study. The trunk, leaves and restrained flowers follow photographic references generated for this project. The seed is intact; the bud-stage image is an edit of the final flowering frame. These images are a separate visual experiment and do not depict the bonsai geometry.

- `public/tree-lab/photoreal`: six current PNGs, 1254 × 1254, with real alpha channels, exact prompts, a video guide and measured bounds.
- `public/tree-lab/magnolia-photoreal-keyframes.zip`: the new downloadable set and instructions.
- `public/tree-lab/stages` and `magnolia-keyframes.zip`: retained original CGI experiment.
- `public/tree-lab/photoreal/PROMPTS.md`: exact built-in ImageGen requests, including the photographic master.
- `public/tree-lab/photoreal/VIDEO-GUIDE.md`: five adjacent-stage transition prompts and optional alignment offsets.
- `public/tree-lab/VIDEO-TOOLS.md`: official Flow, Kling and Luma references, checked on 2026-09-22; no paid video generations were run.

The current generated stages have related, not mathematically identical, branch topology. The opaque lower boundary varies by up to 35 pixels across the six unretouched originals; the bud/bloom pair differs by 2 pixels. These are measured in `photoreal/VALIDATION.json`, with optional vertical alignment offsets documented in the video guide. No programmatic image retouching was applied.

## Assets and references

The new bonsai skeleton and leaf geometry are authored locally. The bark textures are reused from the earlier model; sources and licenses are in `public/tree-lab/model/TEXTURE-LICENSE.md`. EZ-Tree is used only by the previous comparison model, with vendored attribution and license retained.

Visual reference for flowering bonsai forms: https://www.bonsaiempire.com/inspiration/top-10/flowering-bonsai . No photographs or meshes from that page are embedded in the model.

## Run and verify

- `npm run dev`: http://127.0.0.1:5175/tree-lab
- `npm run build`: production build.
- `node scripts/verify-tree-lab.mjs`: browser checks and screenshots in `artifacts/tree-lab`.
- `node scripts/inspect-bonsai.mjs`: desktop chapter renders, three viewing angles and transparent static fallback.

Both scripts accept `TEST_URL` and `CHROMIUM_EXECUTABLE`. Desktop and mobile layouts are checked with Chromium emulation at 1440 × 900, 390 × 844 and 360 × 640. This is not a real-device iOS/Android GPU benchmark.

Latest verification (2026-09-22): production build passed; all 11 browser check groups passed against the production server, including model switching, three views, reverse seeking, play/pause, keyboard controls, both mobile sizes, reduced motion, downloads and WebGL-loss fallback. No JavaScript or console errors were recorded.

The existing home-page test suite previously failed on unchanged expectations (copy paragraph 3 and `.brand img`); those files are outside this work. Current tree-lab check results are recorded in `artifacts/tree-lab/verification.json`.
