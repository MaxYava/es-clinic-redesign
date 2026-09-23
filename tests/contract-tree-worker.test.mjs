import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";

const workerSource = await readFile(new URL("../public/contract-tree/full-frame-worker.js", import.meta.url), "utf8");

function startWorker(fetch, frame = 0) {
  const drawn = [];
  const context = {
    fetch,
    Blob,
    DataView,
    Date,
    AbortController,
    setTimeout,
    createImageBitmap: async () => ({ close() {} }),
    self: {
      postMessage: message => drawn.push(message),
      requestAnimationFrame: callback => setTimeout(callback, 0),
    },
  };
  runInNewContext(workerSource, context);
  context.self.onmessage({ data: {
    type: "init",
    canvas: { width: 0, height: 0, getContext: () => ({ drawImage() {} }) },
    frame,
    size: { width: 1920, height: 1080 },
    mobile: false,
  } });
  return drawn;
}

test("tree worker requests following packs without waiting for the current pack", () => {
  const requests = [];
  startWorker(url => {
    requests.push(url);
    return new Promise(() => {});
  });
  assert.ok(requests.some(url => url.endsWith("pack-01.bin")));
  assert.ok(requests.some(url => url.endsWith("pack-02.bin")));
  assert.ok(requests.some(url => url.endsWith("pack-03.bin")));
});

test("tree worker falls back to the full-quality frame when a pack fails", async () => {
  const requests = [];
  const drawn = startWorker(url => {
    requests.push(url);
    if (url.endsWith("pack-01.bin")) return Promise.reject(new Error("network failure"));
    if (url.endsWith("frame-001.webp")) return Promise.resolve({ ok: true, blob: async () => new Blob(["frame"]) });
    return new Promise(() => {});
  });
  await new Promise(resolve => setTimeout(resolve, 20));
  assert.ok(requests.some(url => url.endsWith("frame-001.webp")));
  assert.ok(drawn.some(message => message.type === "drawn" && message.frame === 0));
});

test("tree worker draws the current frame while its pack is still downloading", async () => {
  const drawn = startWorker(url => {
    if (url.endsWith("frame-001.webp")) return Promise.resolve({ ok: true, blob: async () => new Blob(["frame"]) });
    return new Promise(() => {});
  });
  await new Promise(resolve => setTimeout(resolve, 20));
  assert.ok(drawn.some(message => message.type === "drawn" && message.frame === 0));
});

test("late tree frames use the smaller lossless packs", () => {
  const requests = [];
  startWorker(url => { requests.push(url); return new Promise(() => {}); }, 500);
  assert.ok(requests.some(url => url.endsWith("packed-1080-v2-late/pack-63.bin")));
  assert.ok(requests.some(url => url.endsWith("frame-501.webp")));
});

test("tree worker preloads the ending well before reaching it", () => {
  const requests = [];
  startWorker(url => { requests.push(url); return new Promise(() => {}); }, 400);
  assert.ok(requests.some(url => url.endsWith("packed-1080-v2-late/pack-63.bin")));
});
