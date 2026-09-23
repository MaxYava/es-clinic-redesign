import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const source = path.resolve(process.argv[2]);
const destination = path.resolve(process.argv[3]);
const frameCount = 576;
const oldPackSize = 24;
const newPackSize = 8;
const firstInputPack = Number(process.argv[4] ?? 0);
const lastInputPack = Number(process.argv[5] ?? frameCount / oldPackSize);

if (!process.argv[2] || !process.argv[3]) {
  throw new Error("Usage: node scripts/repack-tree-frames.mjs <source> <destination>");
}

await mkdir(destination, { recursive: true });
let outputCount = 0;
for (let inputPack = firstInputPack; inputPack < lastInputPack; inputPack++) {
  const sourceFile = path.join(source, `pack-${String(inputPack + 1).padStart(2, "0")}.bin`);
  const input = await readFile(sourceFile);
  for (let group = 0; group < oldPackSize / newPackSize; group++) {
    const header = Buffer.alloc((newPackSize + 1) * 4);
    const frames = [];
    let offset = header.length;
    for (let frame = 0; frame < newPackSize; frame++) {
      const sourceIndex = group * newPackSize + frame;
      const start = input.readUInt32LE(sourceIndex * 4);
      const end = input.readUInt32LE((sourceIndex + 1) * 4);
      const bytes = input.subarray(start, end);
      if (bytes.toString("ascii", 0, 4) !== "RIFF") throw new Error(`Invalid frame in ${sourceFile}: ${sourceIndex}`);
      header.writeUInt32LE(offset, frame * 4);
      offset += bytes.length;
      frames.push(bytes);
    }
    header.writeUInt32LE(offset, newPackSize * 4);
    const outputPack = inputPack * (oldPackSize / newPackSize) + group + 1;
    outputCount++;
    await writeFile(path.join(destination, `pack-${String(outputPack).padStart(2, "0")}.bin`), Buffer.concat([header, ...frames]));
  }
}
console.log(`Repacked ${outputCount * newPackSize} frames into ${outputCount} lossless packs at ${destination}`);
