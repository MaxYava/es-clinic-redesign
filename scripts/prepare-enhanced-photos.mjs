import sharp from 'sharp';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const input = new URL('../../exports/photos-for-enhancement-2026-09-16/улучшеные версии/', import.meta.url);
const output = new URL('../public/assets/enhanced/', import.meta.url);
await fs.mkdir(output, { recursive: true });
const photos = [
  ['frolov', new URL('209cf0c4-2281-4fa0-8960-aac2b546a4e8.png', input)],
  ['utin', new URL('29d93725-6547-49bc-984a-9807fa64db11.png', input)],
  ['reception', new URL('41ce0ed8-c3cf-4081-b503-109cff8b1f95.png', input)],
  ['hero', new URL('684c4f41-edb5-4c6c-b824-17b9a4b4a84d.png', input)],
  ['clinic', new URL('ec7dbfa9-60b0-496e-bf22-d3cff58f3b35.png', input)],
  ['history', new URL('../../raw/assets/фото клиники/DSC_0691.jpg', import.meta.url)],
];
for (const [name, source] of photos) {
  // Retain full dimensions and pixels; responsive delivery is handled by Next.
  const image = sharp(fileURLToPath(source)).rotate();
  const result = await image.webp({ lossless: true }).toFile(fileURLToPath(new URL(`${name}.webp`, output)));
  console.log(`${name}: ${result.width}×${result.height}, ${result.size} bytes`);
}
