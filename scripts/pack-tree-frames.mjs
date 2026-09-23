import { readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const source = path.resolve(process.argv[2] ?? "public/contract-tree/source-quality");
const destination = path.resolve(process.argv[3] ?? "public/contract-tree/packed-full");
const variant = process.argv[4] ?? "";
const targetWidth = Number(variant) || 0;
const frameCount = 576;
const framesPerPack = 24;

await mkdir(destination, { recursive: true });
for (let pack = 0; pack < frameCount / framesPerPack; pack++) {
  const frames = await Promise.all(Array.from({ length: framesPerPack }, (_, offset) => {
    const index = pack * framesPerPack + offset + 1;
    return readFile(path.join(source, `frame-${String(index).padStart(3, "0")}.webp`))
      .then(buffer => variant === "mobile"
        ? sharp(buffer).extract({ left: 690, top: 0, width: 540, height: 1080 }).webp({ quality: 95 }).toBuffer()
        : targetWidth ? sharp(buffer).resize({ width: targetWidth }).webp({ quality: 95 }).toBuffer() : buffer);
  }));
  const header = Buffer.alloc((framesPerPack + 1) * 4);
  let byteOffset = header.length;
  for (let index = 0; index < frames.length; index++) {
    header.writeUInt32LE(byteOffset, index * 4);
    byteOffset += frames[index].length;
  }
  header.writeUInt32LE(byteOffset, framesPerPack * 4);
  await writeFile(path.join(destination, `pack-${String(pack + 1).padStart(2, "0")}.bin`), Buffer.concat([header, ...frames]));
}
