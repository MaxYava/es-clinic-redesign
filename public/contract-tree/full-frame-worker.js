const FRAME_COUNT = 576;
const EARLY_PACK_SIZE = 24;
const LATE_PACK_SIZE = 8;
const LATE_START_FRAME = 408;
const EARLY_PACK_COUNT = LATE_START_FRAME / EARLY_PACK_SIZE;
const PACK_COUNT = EARLY_PACK_COUNT + (FRAME_COUNT - LATE_START_FRAME) / LATE_PACK_SIZE;
let earlyPackPath = "/contract-tree/packed-1080-v2";
let latePackPath = "/contract-tree/packed-1080-v2-late";
let mobileMode = false;
let sourceVersion = 0;
const MAX_DECODED = 40;
const packs = new Array(PACK_COUNT);
const packRequests = new Array(PACK_COUNT);
const packRetryAt = new Array(PACK_COUNT).fill(0);
const decoded = new Map();
const decoding = new Set();
const urgentRequests = new Map();
let canvas;
let context;
let target = 0;
let previousTarget = 0;
let drawn = -1;
let drawnKey = "";
let queued = new Set();
let activeDecodes = 0;
let drawQueued = false;

const framePackKey = frame => frame < LATE_START_FRAME
  ? Math.floor(frame / EARLY_PACK_SIZE)
  : EARLY_PACK_COUNT + Math.floor((frame - LATE_START_FRAME) / LATE_PACK_SIZE);
const framePackOffset = frame => frame < LATE_START_FRAME
  ? frame % EARLY_PACK_SIZE : (frame - LATE_START_FRAME) % LATE_PACK_SIZE;

function fetchPack(index) {
  if (packs[index]) return Promise.resolve(packs[index]);
  if (packRequests[index]) return packRequests[index];
  if (Date.now() < packRetryAt[index]) return Promise.reject(new Error(`Tree frame pack ${index + 1} temporarily unavailable`));
  const version = sourceVersion;
  const packPath = index < EARLY_PACK_COUNT ? earlyPackPath : latePackPath;
  const packNumber = index < EARLY_PACK_COUNT ? index + 1 : 52 + index - EARLY_PACK_COUNT;
  const request = fetch(`${packPath}/pack-${String(packNumber).padStart(2, "0")}.bin`, { priority: "low" })
    .then(response => {
      if (!response.ok) throw new Error(`Tree frame pack ${index + 1}: ${response.status}`);
      return response.arrayBuffer();
    })
    .then(buffer => {
      if (version === sourceVersion) packs[index] = buffer;
      return buffer;
    })
    .catch(error => {
      if (version === sourceVersion) packRetryAt[index] = Date.now() + 10000;
      throw error;
    })
    .finally(() => { if (packRequests[index] === request) packRequests[index] = null; });
  packRequests[index] = request;
  return request;
}

function prefetchPacks(current, direction) {
  const currentPack = framePackKey(current);
  // Small lossless packs can finish independently. Stay several packs ahead
  // without making a visible frame wait for a much larger download.
  for (let distance = 0; distance <= 2; distance++) {
    const index = currentPack + direction * distance;
    if (index >= 0 && index < PACK_COUNT) fetchPack(index).catch(() => {});
  }
}

function trimDecoded() {
  while (decoded.size > MAX_DECODED) {
    let farthest = -1;
    let distance = -1;
    for (const index of decoded.keys()) {
      const away = Math.abs(index - target);
      if (away > distance) { farthest = index; distance = away; }
    }
    decoded.get(farthest).close();
    decoded.delete(farthest);
  }
}

function scheduleDraw() {
  if (drawQueued) return;
  drawQueued = true;
  (self.requestAnimationFrame || (callback => setTimeout(callback, 16)))(() => {
    drawQueued = false;
    const index = Math.round(target);
    const frame = decoded.get(index);
    if (!frame || !context) return;
    const key = String(index);
    if (drawnKey === key) return;
    context.drawImage(frame, 0, 0, canvas.width, canvas.height);
    drawn = index;
    drawnKey = key;
    self.postMessage({ type: "drawn", frame: index });
  });
}

function requestUrgentFrame(index) {
  if (decoded.has(index) || urgentRequests.has(index)) return;
  const version = sourceVersion;
  const controller = new AbortController();
  urgentRequests.set(index, controller);
  fetch(`/contract-tree/source-1080-v2/frame-${String(index + 1).padStart(3, "0")}.webp`, {
    priority: "high",
    signal: controller.signal,
  })
    .then(response => {
      if (!response.ok) throw new Error(`Tree frame ${index + 1}: ${response.status}`);
      return response.blob();
    })
    .then(image => mobileMode
      ? createImageBitmap(image, 690, 0, 540, 1080)
      : createImageBitmap(image))
    .then(bitmap => {
      if (version !== sourceVersion || decoded.has(index)) { bitmap.close(); return; }
      decoded.set(index, bitmap);
      trimDecoded();
      scheduleDraw();
    })
    .catch(error => {
      if (error.name !== "AbortError") self.postMessage({ type: "error", message: String(error) });
    })
    .finally(() => {
      if (urgentRequests.get(index) === controller) urgentRequests.delete(index);
    });
}

async function decodeFrame(index) {
  const version = sourceVersion;
  try {
    let bitmap;
    try {
      const buffer = await fetchPack(framePackKey(index));
      const offset = framePackOffset(index);
      const view = new DataView(buffer);
      const start = view.getUint32(offset * 4, true);
      const end = view.getUint32((offset + 1) * 4, true);
      bitmap = await createImageBitmap(new Blob([buffer.slice(start, end)], { type: "image/webp" }));
    } catch (packError) {
      const response = await fetch(`/contract-tree/source-1080-v2/frame-${String(index + 1).padStart(3, "0")}.webp`);
      if (!response.ok) throw new Error(`Tree frame ${index + 1}: ${response.status}; ${packError}`);
      const image = await response.blob();
      bitmap = mobileMode
        ? await createImageBitmap(image, 690, 0, 540, 1080)
        : await createImageBitmap(image);
    }
    if (version !== sourceVersion) { bitmap.close(); return; }
    if (decoded.has(index)) bitmap.close();
    else decoded.set(index, bitmap);
    trimDecoded();
    scheduleDraw();
  } catch (error) {
    self.postMessage({ type: "error", message: String(error) });
  } finally {
    decoding.delete(index);
    activeDecodes--;
    if (version !== sourceVersion) requestFrames(target);
    else pumpDecodes();
  }
}

function pumpDecodes() {
  while (activeDecodes < 3 && queued.size) {
    let nearest = -1;
    let distance = Infinity;
    for (const index of queued) {
      const away = Math.abs(index - target);
      if (away < distance) { nearest = index; distance = away; }
    }
    queued.delete(nearest);
    if (decoded.has(nearest) || decoding.has(nearest)) continue;
    decoding.add(nearest);
    activeDecodes++;
    decodeFrame(nearest);
  }
}

function requestFrames(position) {
  previousTarget = target;
  target = Math.max(0, Math.min(FRAME_COUNT - 1, position));
  queued = new Set();
  const current = Math.round(target);
  if (!decoded.has(current) && !decoding.has(current)) queued.add(current);
  const direction = target >= previousTarget ? 1 : -1;
  for (const [index, controller] of urgentRequests) {
    if (Math.abs(index - current) > 8) { controller.abort(); urgentRequests.delete(index); }
  }
  // A large pack may still be downloading. Keep the currently visible frame
  // available independently so the scroll playhead cannot wait on the pack.
  if (!packs[framePackKey(current)] &&
    !decoded.has(current) && (drawn < 0 || Math.abs(current - drawn) > 2)) {
    requestUrgentFrame(current);
  }
  prefetchPacks(current, direction);
  if (direction > 0 && current >= 240 && current < FRAME_COUNT - 100) {
    // Start the heavier ending section several seconds before the camera gets
    // there; fetchPack deduplicates requests as the playhead moves forward.
    fetchPack(framePackKey(current + 100)).catch(() => {});
  }
  for (let distance = 1; distance <= 12; distance++) {
    for (const index of [current + distance * direction, current - distance * direction]) {
      if (index >= 0 && index < FRAME_COUNT && !decoded.has(index) && !decoding.has(index)) queued.add(index);
    }
  }
  scheduleDraw();
  pumpDecodes();
}

self.onmessage = event => {
  if (event.data.type === "init") {
    canvas = event.data.canvas;
    mobileMode = Boolean(event.data.mobile);
    if (mobileMode) {
      earlyPackPath = "/contract-tree/packed-1080-v2-mobile";
      latePackPath = "/contract-tree/packed-1080-v2-mobile-late";
    }
    canvas.width = event.data.size.width;
    canvas.height = event.data.size.height;
    context = canvas.getContext("2d", { alpha: false });
    requestFrames(event.data.frame || 0);
  } else if (event.data.type === "resize") {
    canvas.width = event.data.size.width;
    canvas.height = event.data.size.height;
    drawnKey = "";
    if (Boolean(event.data.mobile) !== mobileMode) {
      mobileMode = Boolean(event.data.mobile);
      sourceVersion++;
      earlyPackPath = mobileMode ? "/contract-tree/packed-1080-v2-mobile" : "/contract-tree/packed-1080-v2";
      latePackPath = mobileMode ? "/contract-tree/packed-1080-v2-mobile-late" : "/contract-tree/packed-1080-v2-late";
      packs.fill(undefined);
      packRequests.fill(undefined);
      packRetryAt.fill(0);
      decoded.forEach(bitmap => bitmap.close());
      decoded.clear();
      urgentRequests.forEach(controller => controller.abort());
      urgentRequests.clear();
      drawn = -1;
      requestFrames(target);
    } else scheduleDraw();
  } else if (event.data.type === "frame") {
    requestFrames(event.data.frame);
  }
};
