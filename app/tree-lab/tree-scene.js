import * as THREE from "three";

const clamp = THREE.MathUtils.clamp;
const smooth = (a, b, x) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);

// A deterministic skeleton lets scroll seek in either direction without a simulation.
export function createTreeScene(host, onError) {
  let randomState = 731;
  const random = () => {
    randomState = (Math.imul(randomState, 1664525) + 1013904223) | 0;
    return (randomState >>> 0) / 4294967296;
  };
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.domElement.setAttribute("aria-hidden", "true");
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(33, 1, 0.1, 60);
  const tree = new THREE.Group();
  tree.rotation.y = -0.18;
  tree.scale.set(1.12, .86, 1);
  scene.add(tree);
  scene.add(new THREE.HemisphereLight(0xfff7df, 0x65734e, 1.45));
  const key = new THREE.DirectionalLight(0xffedcf, 2.8);
  key.position.set(-4, 7, 5);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xffffff, 1.6);
  rim.position.set(4, 5, -3);
  scene.add(rim);
  const fill = new THREE.DirectionalLight(0x99ada0, 0.8);
  fill.position.set(0, 1, 5);
  scene.add(fill);

  const barkCanvas = document.createElement("canvas");
  barkCanvas.width = 128;
  barkCanvas.height = 256;
  const barkCtx = barkCanvas.getContext("2d");
  barkCtx.fillStyle = "#9f8d70";
  barkCtx.fillRect(0, 0, 128, 256);
  for (let i = 0; i < 800; i++) {
    barkCtx.strokeStyle = random() > 0.5 ? "#79664c70" : "#d5c3a370";
    barkCtx.lineWidth = 0.4 + random() * 1.6;
    const x = random() * 128, y = random() * 256;
    barkCtx.beginPath();
    barkCtx.moveTo(x, y);
    barkCtx.bezierCurveTo(x - 2, y + 3, x + 2, y + 8, x - 1, y + 18 + random() * 50);
    barkCtx.stroke();
  }
  const barkTexture = new THREE.CanvasTexture(barkCanvas);
  barkTexture.colorSpace = THREE.SRGBColorSpace;
  barkTexture.wrapS = barkTexture.wrapT = THREE.RepeatWrapping;
  barkTexture.repeat.set(2, 3);
  const barkMaterial = new THREE.MeshStandardMaterial({ color: 0xa9977c, map: barkTexture, bumpMap: barkTexture, bumpScale: 0.025, roughness: 0.92 });
  const branches = [], leaves = [], flowers = [];
  const geometries = [], materials = [barkMaterial];
  const branchGroup = new THREE.Group();
  tree.add(branchGroup);

  function branch(points, radius, birth, duration, segments = 22) {
    const curve = new THREE.CatmullRomCurve3(points);
    const frames = curve.computeFrenetFrames(segments, false);
    const centers = Array.from({ length: segments + 1 }, (_, i) => curve.getPoint(i / segments));
    const sides = 7;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array((segments + 1) * (sides + 1) * 3);
    const normals = new Float32Array(positions.length);
    const uvs = new Float32Array((segments + 1) * (sides + 1) * 2);
    const indices = [];
    for (let i = 0; i <= segments; i++) {
      for (let j = 0; j <= sides; j++) {
        const n = i * (sides + 1) + j;
        const angle = j / sides * Math.PI * 2;
        const normal = frames.normals[i].clone().multiplyScalar(Math.cos(angle)).addScaledVector(frames.binormals[i], Math.sin(angle));
        normal.toArray(normals, n * 3);
        uvs[n * 2] = j / sides;
        uvs[n * 2 + 1] = i / segments;
        if (i < segments && j < sides) {
          indices.push(n, n + sides + 1, n + 1, n + 1, n + sides + 1, n + sides + 2);
        }
      }
    }
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage));
    geometry.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
    geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometries.push(geometry);
    const mesh = new THREE.Mesh(geometry, barkMaterial);
    mesh.frustumCulled = false;
    branchGroup.add(mesh);
    const item = { curve, radius, birth, duration, segments, sides, positions, normals, centers, mesh, previous: -1 };
    branches.push(item);
    return item;
  }

  const trunk = branch([V(), V(.10, .7, .05), V(.02, 1.4), V(-.16, 2.0, -.02), V(.04, 2.7, -.10), V(.03, 3.5, .08), V(-.08, 4.25), V(.10, 5.05, -.03)], .17, .07, .43, 44);
  for (let i = 0; i < 7; i++) {
    const t = .10 + i * .047;
    leaves.push({
      pos: trunk.curve.getPoint(t),
      q: new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), V(i % 2 ? -.8 : .8, .7, .3).normalize()),
      size: .43 + random() * .14, birth: trunk.birth + trunk.duration * t, tint: .6 + random() * .3,
      juvenile: true,
    });
  }
  for (let i = 0; i < 6; i++) {
    const a = i * Math.PI / 3 + .2;
    const d = .30 + random() * .24;
    branch([V(0, .12), V(Math.cos(a) * d * .5, .04, Math.sin(a) * d * .5), V(Math.cos(a) * d, .008, Math.sin(a) * d)], .075, .06, .15, 10);
  }

  function addLeaves(b, count, size = 1) {
    for (let j = 0; j < count; j++) {
      const t = .30 + j / count * .7;
      const pos = b.curve.getPoint(t);
      const tangent = b.curve.getTangent(t);
      const azimuth = j * 2.399 + random() * .7;
      const direction = V(Math.cos(azimuth), .4 + random() * .8, Math.sin(azimuth)).normalize();
      direction.addScaledVector(tangent, .45).normalize();
      const q = new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), direction);
      q.multiply(new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), random() * Math.PI));
      leaves.push({ pos, q, size: (.24 + random() * .19) * size, birth: b.birth + b.duration * t + .015, tint: random() });
    }
  }
  const mainAngles = [3.0, .10, 4.55, 1.7, 3.55, -.48, 2.8, 5.3, 1.1];
  for (let i = 0; i < mainAngles.length; i++) {
    const t = .29 + i * .067;
    const start = trunk.curve.getPoint(t);
    const a = mainAngles[i];
    const length = 2.10 - Math.max(0, i - 3) * .18 + random() * .25;
    const outward = V(Math.cos(a), 0, Math.sin(a) * .70);
    const end = start.clone().addScaledVector(outward, length).add(V(0, .9 + random() * .5, 0));
    const limb = branch([start, start.clone().addScaledVector(outward, length * .32).add(V(0, .18, 0)), start.clone().lerp(end, .73).add(V(0, -.12, 0)), end], .083 - i * .005, trunk.birth + trunk.duration * t, .22, 25);
    for (let j = 0; j < 5; j++) {
      const s = .30 + j * .135;
      const origin = limb.curve.getPoint(s);
      const angle = a + (j % 2 ? -1 : 1) * (.45 + random() * .85);
      const len = .55 + random() * .6;
      const tip = origin.clone().add(V(Math.cos(angle) * len, .55 + random() * .55, Math.sin(angle) * len * .75));
      const secondary = branch([origin, origin.clone().lerp(tip, .4).add(V(0, -.11, 0)), tip], .028 - j * .0015, limb.birth + limb.duration * s, .15, 14);
      addLeaves(secondary, 7, 1.05);
      for (let k = 0; k < 3; k++) {
        const u = .40 + k * .22;
        const root = secondary.curve.getPoint(u);
        const ang = angle + (k % 2 ? -1.3 : 1.1);
        const dest = root.clone().add(V(Math.cos(ang) * (.22 + random() * .27), .25 + random() * .32, Math.sin(ang) * .32));
        const twig = branch([root, root.clone().lerp(dest, .55).add(V(0, -.035, 0)), dest], .011, secondary.birth + secondary.duration * u, .095, 7);
        addLeaves(twig, 4, .87);
        if ((i + j + k) % 3 === 0) flowers.push({ pos: dest, size: .34 + random() * .10, birth: .73 + random() * .12, angle: random() * Math.PI * 2, tilt: .35 + random() * .65 });
      }
    }
    addLeaves(limb, 5, 1.15);
  }
  addLeaves(trunk, 13, .8);

  tree.updateMatrixWorld(true);
  const crownBounds = new THREE.Box3();
  branches.forEach(b => b.centers.forEach(point => crownBounds.expandByPoint(point.clone().applyMatrix4(tree.matrixWorld))));
  crownBounds.expandByScalar(.55);
  const crownSize = crownBounds.getSize(V());
  const crownCenter = crownBounds.getCenter(V());

  // All growing branches share one draw call; leaves, petals and cores are instanced.
  const totalVertices = branches.reduce((sum, b) => sum + b.positions.length / 3, 0);
  const branchPositions = new Float32Array(totalVertices * 3);
  const branchNormals = new Float32Array(totalVertices * 3);
  const branchUvs = new Float32Array(totalVertices * 2);
  const branchIndices = [];
  let vertexOffset = 0;
  branches.forEach(b => {
    const original = b.mesh.geometry;
    branchNormals.set(b.normals, vertexOffset * 3);
    branchUvs.set(original.attributes.uv.array, vertexOffset * 2);
    for (const index of original.index.array) branchIndices.push(index + vertexOffset);
    b.positions = branchPositions.subarray(vertexOffset * 3, vertexOffset * 3 + b.positions.length);
    vertexOffset += b.positions.length / 3;
    b.mesh.removeFromParent();
  });
  const branchGeometry = new THREE.BufferGeometry();
  branchGeometry.setAttribute("position", new THREE.BufferAttribute(branchPositions, 3).setUsage(THREE.DynamicDrawUsage));
  branchGeometry.setAttribute("normal", new THREE.BufferAttribute(branchNormals, 3));
  branchGeometry.setAttribute("uv", new THREE.BufferAttribute(branchUvs, 2));
  branchGeometry.setIndex(branchIndices);
  geometries.push(branchGeometry);
  const allBranches = new THREE.Mesh(branchGeometry, barkMaterial);
  allBranches.frustumCulled = false;
  branchGroup.add(allBranches);

  // Curved, thick-looking blades with a raised midrib, not flat billboard leaves.
  function blade(petal = false) {
    const positions = [], uvs = [], indices = [];
    const rows = 12, cols = 8;
    for (let i = 0; i <= rows; i++) {
      const t = i / rows;
      const width = Math.pow(Math.sin(Math.PI * t), petal ? .55 : .85) * (petal ? .47 : .28);
      for (let j = 0; j <= cols; j++) {
        const s = j / cols * 2 - 1;
        positions.push(s * width, t, petal ? .25 * t * t + .15 * s * s * Math.sin(Math.PI * t) : .10 * Math.sin(t * Math.PI) - .13 * s * s * Math.sin(t * Math.PI) + .1 * t * t);
        uvs.push(j / cols, t);
        const n = i * (cols + 1) + j;
        if (i < rows && j < cols) indices.push(n, n + 1, n + cols + 1, n + 1, n + cols + 2, n + cols + 1);
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    geometries.push(geo);
    return geo;
  }
  const leafCanvas = document.createElement("canvas");
  leafCanvas.width = leafCanvas.height = 128;
  const leafCtx = leafCanvas.getContext("2d");
  leafCtx.fillStyle = "#ffffff";
  leafCtx.fillRect(0, 0, 128, 128);
  leafCtx.strokeStyle = "#67784355";
  leafCtx.lineWidth = 2;
  leafCtx.beginPath(); leafCtx.moveTo(64, 0); leafCtx.lineTo(64, 128); leafCtx.stroke();
  leafCtx.lineWidth = .7;
  for (let i = 15; i < 125; i += 13) {
    leafCtx.beginPath(); leafCtx.moveTo(8, i + 25); leafCtx.quadraticCurveTo(40, i + 20, 64, i); leafCtx.quadraticCurveTo(88, i + 20, 120, i + 25); leafCtx.stroke();
  }
  const leafTexture = new THREE.CanvasTexture(leafCanvas);
  leafTexture.colorSpace = THREE.SRGBColorSpace;
  const leafMat = new THREE.MeshStandardMaterial({ color: 0xffffff, map: leafTexture, roughness: .53, metalness: .02, side: THREE.DoubleSide });
  const petalMat = new THREE.MeshStandardMaterial({ color: 0xfff1e7, emissive: 0x816d5c, emissiveIntensity: .26, roughness: .48, side: THREE.DoubleSide });
  const centerMat = new THREE.MeshStandardMaterial({ color: 0xb89a57, roughness: .72 });
  materials.push(leafMat, petalMat, centerMat);
  const leafMesh = new THREE.InstancedMesh(blade(), leafMat, leaves.length);
  const petalMesh = new THREE.InstancedMesh(blade(true), petalMat, flowers.length * 9);
  const coreGeo = new THREE.SphereGeometry(1, 8, 6);
  geometries.push(coreGeo);
  const cores = new THREE.InstancedMesh(coreGeo, centerMat, flowers.length);
  [leafMesh, petalMesh, cores].forEach(mesh => { mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); mesh.frustumCulled = false; tree.add(mesh); });
  leaves.forEach((leaf, i) => leafMesh.setColorAt(i, new THREE.Color().setHSL(.225 + leaf.tint * .045, .28 + leaf.tint * .18, .13 + leaf.tint * .13)));
  flowers.forEach((flower, i) => {
    for (let p = 0; p < 9; p++) petalMesh.setColorAt(i * 9 + p, new THREE.Color().setHSL(.066 + random() * .025, .30, .85 + random() * .12));
  });

  const seedMat = new THREE.MeshStandardMaterial({ color: 0x805137, roughness: .58, map: barkTexture });
  materials.push(seedMat);
  const seedGeo = new THREE.SphereGeometry(1, 24, 16);
  geometries.push(seedGeo);
  const seedA = new THREE.Mesh(seedGeo, seedMat);
  const seedB = new THREE.Mesh(seedGeo, seedMat);
  tree.add(seedA, seedB);
  const dummy = new THREE.Object3D();
  const yAxis = V(0, 1, 0), xAxis = V(1, 0, 0);
  const q1 = new THREE.Quaternion(), q2 = new THREE.Quaternion(), flowerOrientation = new THREE.Quaternion();
  let disposed = false, current = 0, target = 0, raf = 0, active = true, lastTime = 0, reduced = false;
  let width = 1, height = 1;

  function updateTree(p) {
    let branchesChanged = false;
    const woodMaturity = .23 + .77 * smooth(.12, .75, p);
    for (const b of branches) {
      const age = clamp((p - b.birth) / b.duration, 0, 1);
      if (age === b.previous && b.previousMaturity === woodMaturity) continue;
      b.previous = age;
      b.previousMaturity = woodMaturity;
      branchesChanged = true;
      const thickness = smooth(0, .28, age) * woodMaturity;
      for (let i = 0; i <= b.segments; i++) {
        const t = i / b.segments;
        const at = t * age * b.segments;
        const lo = Math.floor(at), hi = Math.min(lo + 1, b.segments), f = at - lo;
        const center = b.centers[lo], next = b.centers[hi];
        const r = b.radius * Math.pow(1 - t * .99, .85) * thickness;
        for (let j = 0; j <= b.sides; j++) {
          const n = (i * (b.sides + 1) + j) * 3;
          b.positions[n] = center.x + (next.x - center.x) * f + b.normals[n] * r;
          b.positions[n + 1] = center.y + (next.y - center.y) * f + b.normals[n + 1] * r;
          b.positions[n + 2] = center.z + (next.z - center.z) * f + b.normals[n + 2] * r;
        }
      }
    }
    if (branchesChanged) branchGeometry.attributes.position.needsUpdate = true;
    leaves.forEach((leaf, i) => {
      const age = smooth(leaf.birth, leaf.birth + .10, p) * (leaf.juvenile ? 1 - smooth(.48, .66, p) : 1);
      dummy.position.copy(leaf.pos);
      dummy.quaternion.copy(leaf.q);
      q1.setFromAxisAngle(xAxis, (1 - age) * 1.5);
      dummy.quaternion.multiply(q1);
      dummy.scale.set(leaf.size * age * age, leaf.size * age, leaf.size * age);
      dummy.updateMatrix();
      leafMesh.setMatrixAt(i, dummy.matrix);
    });
    leafMesh.instanceMatrix.needsUpdate = true;
    flowers.forEach((flower, i) => {
      const bud = smooth(flower.birth - .09, flower.birth, p);
      const bloom = smooth(flower.birth, Math.min(.99, flower.birth + .14), p);
      flowerOrientation.setFromAxisAngle(xAxis, flower.tilt);
      for (let j = 0; j < 9; j++) {
        const inner = j > 5;
        const angle = flower.angle + j * Math.PI * 2 / (inner ? 3 : 6);
        dummy.position.copy(flower.pos);
        dummy.position.y += inner ? .025 : 0;
        q1.setFromAxisAngle(yAxis, angle);
        q2.setFromAxisAngle(xAxis, .05 + bloom * (inner ? .28 : .66));
        dummy.quaternion.copy(flowerOrientation).multiply(q1).multiply(q2);
        const size = flower.size * (inner ? .8 : 1.18) * bud;
        dummy.scale.set(size * (.52 + bloom * .48), size, size);
        dummy.updateMatrix();
        petalMesh.setMatrixAt(i * 9 + j, dummy.matrix);
      }
      dummy.position.copy(flower.pos).add(V(0, .055 * bud, 0));
      dummy.quaternion.copy(flowerOrientation);
      dummy.scale.set(.043 * bud, .082 * bud, .043 * bud);
      dummy.updateMatrix();
      cores.setMatrixAt(i, dummy.matrix);
    });
    petalMesh.instanceMatrix.needsUpdate = cores.instanceMatrix.needsUpdate = true;
    const split = smooth(.055, .17, p), fade = 1 - smooth(.16, .30, p);
    [seedA, seedB].forEach((seed, i) => {
      seed.scale.set(.115 * fade, .17 * fade, .19 * fade);
      seed.position.set((i ? 1 : -1) * (.05 + split * .18), .13 * fade, .02);
      seed.rotation.z = (i ? -1 : 1) * split * .9;
      seed.visible = fade > .001;
    });
    const pullBack = smooth(.025, .45, p);
    const viewHeight = THREE.MathUtils.lerp(1.8, crownSize.y, pullBack);
    const verticalFit = viewHeight / (2 * Math.tan(THREE.MathUtils.degToRad(16.5)));
    const horizontalFit = crownSize.x / (camera.aspect * 2 * Math.tan(THREE.MathUtils.degToRad(16.5)));
    const distance = THREE.MathUtils.lerp(verticalFit, Math.max(verticalFit, horizontalFit) + crownSize.z * .42, pullBack);
    const lookY = THREE.MathUtils.lerp(.50, crownCenter.y, pullBack);
    camera.position.set(.1, lookY + distance * .075, distance);
    camera.lookAt(0, lookY, 0);
    renderer.render(scene, camera);
  }
  function frame(time) {
    raf = 0;
    if (disposed || !active) return;
    const delta = Math.min((time - lastTime) / 1000, .05);
    lastTime = time;
    const diff = target - current;
    current = reduced || Math.abs(diff) < .0002 ? target : current + diff * (1 - Math.exp(-delta * 12));
    updateTree(current);
    if (Math.abs(current - target) > .0001) raf = requestAnimationFrame(frame);
  }
  function schedule() {
    if (!raf && active && !disposed) { lastTime = performance.now() - 16; raf = requestAnimationFrame(frame); }
  }
  function resize() {
    width = host.clientWidth; height = host.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    schedule();
  }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);
  const intersection = new IntersectionObserver(([entry]) => { active = entry.isIntersecting && !document.hidden; if (active) schedule(); }, { rootMargin: "100px" });
  intersection.observe(host);
  const visibility = () => { active = !document.hidden; if (active) schedule(); };
  document.addEventListener("visibilitychange", visibility);
  const contextLost = event => { event.preventDefault(); onError(); };
  renderer.domElement.addEventListener("webglcontextlost", contextLost);
  resize();
  return {
    setProgress(value, reduceMotion = false) { target = clamp(value, 0, 1); reduced = reduceMotion; schedule(); },
    dispose() {
      disposed = true; cancelAnimationFrame(raf);
      resizeObserver.disconnect(); intersection.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      renderer.domElement.removeEventListener("webglcontextlost", contextLost);
      geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose());
      [leafMesh, petalMesh, cores].forEach(mesh => mesh.dispose());
      barkTexture.dispose(); leafTexture.dispose(); renderer.dispose(); renderer.domElement.remove();
    },
  };
}
