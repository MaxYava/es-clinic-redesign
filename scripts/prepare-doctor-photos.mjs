import fs from 'node:fs/promises';
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';

const directory = new URL('../public/assets/doctors-original/', import.meta.url);
await fs.mkdir(directory, { recursive: true });
const sources = {
  tishina: 'https://static.tildacdn.com/tild3432-3337-4034-a165-383134643730/Rectangle_240654594_.png',
  frolov: 'https://static.tildacdn.com/tild3334-6337-4135-b461-386135656332/Rectangle_240654593_.png',
  utin: 'https://static.tildacdn.com/tild3739-6635-4039-b539-316664363131/utin.jpg',
  sorokin: 'https://static.tildacdn.com/tild3537-3039-4364-a465-316662386130/Rectangle_240654593_.png',
  maksakov: 'https://static.tildacdn.com/tild3933-3238-4534-b065-383934663562/Rectangle_240654594_.png',
};
await Promise.all(Object.entries(sources).map(async ([name, url]) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${name}: HTTP ${response.status}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  const extension = url.endsWith('.jpg') ? 'jpg' : 'png';
  await fs.writeFile(new URL(`${name}.${extension}`, directory), buffer);
  const metadata = await sharp(buffer).metadata();
  // Preserve native resolution and pixels in the browser-ready derivative.
  await sharp(buffer).webp({ lossless: true }).toFile(fileURLToPath(new URL(`${name}.webp`, directory)));
  console.log(`${name}: ${metadata.width} × ${metadata.height}, original saved`);
}));
const portrait = process.argv[2];
if (portrait) {
  await sharp(portrait).webp({ lossless: true }).toFile(fileURLToPath(new URL('../public/assets/daria-enhanced.webp', import.meta.url)));
  console.log('Enhanced video cover saved without resizing or lossy compression');
}
