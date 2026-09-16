// Reproducible, non-destructive copies of the approved landing's assets.
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
const root = path.resolve(import.meta.dirname, "..");
const source = path.resolve(root, "../site");
await fs.mkdir(path.join(root, "public/assets"), { recursive: true });
await fs.mkdir(path.join(root, "app/data"), { recursive: true });
for (const name of ["copy.json", "faqs.json", "partners.json"])
  await fs.copyFile(
    path.join(source, "src", name),
    path.join(root, "app/data", name),
  );
for (const name of [
  "logo.svg",
  "clover.svg",
  "tishina.webp",
  "frolov.webp",
  "sorokin.webp",
  "maksakov.webp",
  "daria-tishina-web.mp4",
])
  await fs.copyFile(
    path.join(source, "public/assets", name),
    path.join(root, "public/assets", name),
  );
await fs.cp(
  path.join(source, "public/assets/partners"),
  path.join(root, "public/assets/partners"),
  { recursive: true },
);
await fs.copyFile(
  path.join(source, "public/mirror/efe9332aa5937166.woff"),
  path.join(root, "app/aeroport.woff"),
);
const photos = {
  hero: "91304f531ab30d8d.png",
  family: "cc447a921567ef10.png",
  reception: "bbbbf22bf24928dd.png",
  history: "e0ea1ec8ff7d9539.png",
  loyalty: "d0a79829e6ea122e.png",
  clinic: "e8713752fe25fb3f.png",
};
for (const [name, file] of Object.entries(photos))
  await sharp(path.join(source, "public/mirror", file))
    .resize({ width: name === "hero" ? 1920 : 1200, withoutEnlargement: true })
    .webp({ quality: 85 })
    .toFile(path.join(root, "public/assets", name + ".webp"));
await sharp(path.join(source, "public/assets/utin.png"))
  .resize({ width: 600, withoutEnlargement: true })
  .webp({ quality: 85 })
  .toFile(path.join(root, "public/assets/utin.webp"));
console.log(
  "Copied document text, local font, partner logos and optimized original photos.",
);
