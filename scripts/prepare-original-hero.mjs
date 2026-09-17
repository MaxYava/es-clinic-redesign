import path from "node:path";
import sharp from "sharp";

// Original es-clinic.ru hero: https://static.tildacdn.com/tild3337-6366-4065-b662-353163373666/desk.png
// Keep the previous hero and all other landing assets unchanged.
const root = path.resolve(import.meta.dirname, "..");
await sharp(path.resolve(root, "../site/public/mirror/1d6c2900267b6b8d.png"))
  .resize({ width: 1920, withoutEnlargement: true })
  .webp({ quality: 85 })
  .toFile(path.join(root, "public/assets/hero-original.webp"));
