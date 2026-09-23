import sharp from 'sharp';
import { readdir, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
const source = 'public/contract-tree/new-growth';
const destination = 'public/contract-tree/new-tree-clean';
await mkdir(destination, { recursive: true });
const clamp = value => Math.max(0, Math.min(1, value));
for (const file of (await readdir(source)).filter(file => /^frame-\d+\.webp$/.test(file))) {
  const { data, info } = await sharp(join(source, file)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
    const i = (y * info.width + x) * 4;
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const light = Math.min(r, g, b);
    const saturation = Math.max(r, g, b) - light;
    let alpha = Math.max(clamp((saturation - 13) / 20), clamp((170 - light) / 26));
    if (y > info.height * .87 && saturation < 23 && light > 135) alpha = 0;
    data[i + 3] = Math.round(alpha * 255);
  }
  await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } }).webp({ quality: 86 }).toFile(join(destination, file));
}
