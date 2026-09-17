import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

// Fallback explicitly supplied by the user; Yandex client folder requires login.
const source = "https://es-clinic-home-v2.phleumphleumphleum.chatgpt.site/assets/";
const root = path.resolve(import.meta.dirname, "..");
const directory = path.join(root, "public/assets/partners-mono");
const names = ["Мать и дитя", "Чайка", "Клиника Фомина", "K+31", "Docdeti", "ФГБУ НМИЦК Чазова", "Сеченовский Университет", "Морозовская детская больница", "Коммунарка", "Три сестры", "ЕМС", "GMS", "Hadassah"];
await fs.mkdir(directory, { recursive: true });
await Promise.all(names.map(async (name, index) => {
  const response = await fetch(`${source}partner-${index}.png`);
  if (!response.ok) throw new Error(`${name}: HTTP ${response.status}`);
  await sharp(Buffer.from(await response.arrayBuffer()))
    .resize({ width: 720, withoutEnlargement: true })
    .webp({ lossless: true })
    .toFile(path.join(directory, `partner-${index}.webp`));
}));
console.log(`Downloaded ${names.length} partner logos from supplied reference.`);
