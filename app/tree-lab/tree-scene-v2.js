import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const clamp = THREE.MathUtils.clamp;
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const assets = "/tree-lab/model/";

// Baked EZ-Tree topology, photographic foliage and PBR bark replace the v1 primitives.
export async function createTreeScene(host, onError) {
  const loader = new THREE.TextureLoader();
  const textures = [];
  const load = async (name, color = false) => {
    const texture = await loader.loadAsync(`${assets}textures/${name}`);
    texture.colorSpace = color ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    textures.push(texture); return texture;
  };
  let data, barkColor, barkNormal, barkRoughness, foliage;
  try {
    const loaded = await Promise.allSettled([
      fetch(`${assets}botanical-tree.json`).then(r => { if (!r.ok) throw new Error("Tree model unavailable"); return r.json(); }),
      load("bark-color.jpg", true), load("bark-normal.jpg"), load("bark-roughness.jpg"), load("leaf.png", true),
    ]);
    const failed = loaded.find(result => result.status === "rejected");
    if (failed) throw failed.reason;
    [data, barkColor, barkNormal, barkRoughness, foliage] = loaded.map(result => result.value);
  } catch (error) { textures.forEach(t => t.dispose()); throw error; }
  const mobile = window.matchMedia("(max-width: 600px)").matches;
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" }); }
  catch (error) { textures.forEach(t => t.dispose()); throw error; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.35 : 1.8));
  renderer.setClearColor(0, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.07;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.setAttribute("aria-hidden", "true");
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(31, 1, .05, 50);
  const root = new THREE.Group(); root.rotation.y = -.65; root.scale.set(1.10, .83, 1.10); scene.add(root);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, .12);
  scene.environment = environment.texture; scene.environmentIntensity = .48;
  room.dispose(); pmrem.dispose();
  scene.add(new THREE.HemisphereLight(0xfff5e0, 0x828874, 1.3));
  const key = new THREE.DirectionalLight(0xfff1dc, 2.6);
  key.position.set(-3, 9, 4); key.target.position.set(0, 2.5, 0); key.castShadow = true;
  key.shadow.mapSize.set(mobile ? 1024 : 2048, mobile ? 1024 : 2048);
  Object.assign(key.shadow.camera, { left: -4, right: 4, top: 7, bottom: -2, near: .1, far: 18 });
  key.shadow.bias = -.00015; key.shadow.normalBias = .016; scene.add(key, key.target);
  const edge = new THREE.DirectionalLight(0xfff8e9, 1.1); edge.position.set(4, 5, -4); scene.add(edge);
  const front = new THREE.DirectionalLight(0xe4ebef, .45); front.position.set(2, 3, 7); scene.add(front);
  const geometries = [], materials = [];
  for (const map of [barkColor, barkNormal, barkRoughness]) {
    map.wrapS = map.wrapT = THREE.RepeatWrapping; map.repeat.set(1.1, 1.35);
    map.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  }
  foliage.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const bark = new THREE.MeshStandardMaterial({ color: 0xcebea9, map: barkColor, normalMap: barkNormal, roughnessMap: barkRoughness, normalScale: new THREE.Vector2(.55, .55), roughness: .96 });
  materials.push(bark);
  let seedState = 10021;
  const random = () => { seedState = (Math.imul(seedState, 1664525) + 1013904223) | 0; return (seedState >>> 0) / 4294967296; };
  const model = data.branches.map(b => ({ ...b, centers: b.sections.map(s => new THREE.Vector3().fromArray(s.p)), orientations: b.sections.map(s => new THREE.Quaternion().fromArray(s.q)) }));
  const maxPath = Math.max(...model.map(b => b.rootDistance + b.length));
  const vertices = [], normals = [], uvs = [], indices = [];
  const cross = V();
  model.forEach(b => {
    b.offset = vertices.length / 3;
    const count = b.sections.length;
    let length = 0;
    for (let i = 0; i < count; i++) {
      if (i) length += b.centers[i].distanceTo(b.centers[i - 1]);
      for (let j = 0; j <= b.segments; j++) {
        const angle = j / b.segments * Math.PI * 2;
        cross.set(Math.cos(angle), 0, Math.sin(angle)).applyQuaternion(b.orientations[i]);
        normals.push(cross.x, cross.y, cross.z);
        const radius = b.sections[i].r * (1 + .075 * Math.cos(angle * 5 + i * .16));
        vertices.push(...b.centers[i].clone().addScaledVector(cross, radius).toArray());
        uvs.push(j / b.segments, (b.rootDistance + length) * 1.5);
        if (i < count - 1 && j < b.segments) {
          const a = b.offset + i * (b.segments + 1) + j, c = a + b.segments + 1;
          indices.push(a, c, a + 1, a + 1, c, c + 1);
        }
      }
    }
  });
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3).setUsage(THREE.DynamicDrawUsage));
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2)); geometry.setIndex(indices); geometries.push(geometry);
  const wood = new THREE.Mesh(geometry, bark); wood.castShadow = wood.receiveShadow = true; wood.frustumCulled = false; root.add(wood);

  // Gently curved atlas planes retain photographed vein and twig detail.
  function foliageBlade() {
    const positions = [], uv = [], ix = []; const rows = 8, cols = 6;
    for (let i = 0; i <= rows; i++) {
      const t = i / rows;
      for (let j = 0; j <= cols; j++) {
        const s = j / cols - .5;
        positions.push(s, t, -.14 * t * t + .16 * s * s); uv.push(j / cols, t);
        const a = i * (cols + 1) + j;
        if (i < rows && j < cols) ix.push(a, a + 1, a + cols + 1, a + 1, a + cols + 2, a + cols + 1);
      }
    }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(ix); g.computeVertexNormals(); geometries.push(g); return g;
  }
  const leafMaterial = new THREE.MeshStandardMaterial({ color: 0xf0efd7, map: foliage, alphaTest: .38, alphaToCoverage: true, side: THREE.DoubleSide, roughness: .76, emissive: 0x344521, emissiveIntensity: .08 }); materials.push(leafMaterial);
  const leafData = data.leaves.map(leaf => {
    const distance = (model[leaf.parent].rootDistance + model[leaf.parent].length * leaf.attach) / maxPath;
    const birth = .055 + (.5 - Math.sin(Math.asin(1 - 2 * clamp(distance, 0, 1)) / 3)) * (.72 - .055);
    return { pos: new THREE.Vector3().fromArray(leaf.p), q: new THREE.Quaternion().fromArray(leaf.q), size: leaf.size, birth };
  });
  const foliageMesh = new THREE.InstancedMesh(foliageBlade(), leafMaterial, leafData.length);
  foliageMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); foliageMesh.frustumCulled = false;
  foliageMesh.castShadow = foliageMesh.receiveShadow = true; root.add(foliageMesh);
  const color = new THREE.Color();
  leafData.forEach((leaf, i) => foliageMesh.setColorAt(i, color.setHSL(.15 + random() * .07, .08 + random() * .10, .68 + random() * .25)));

  // Cupped petals morph between closed and open shapes; stamens remain separate geometry.
  function petalShape(open) {
    const positions = [], uv = [], ix = []; const rows = 16, cols = 12;
    for (let i = 0; i <= rows; i++) {
      const t = i / rows;
      const radius = open ? .92 * Math.pow(t, 1.22) : .26 * Math.sin(Math.PI * t * .92);
      const y = open ? .15 * t + .24 * Math.sin(Math.PI * t) : .98 * t;
      const halfWidth = Math.pow(Math.sin(Math.PI * t), .7) * (open ? .36 : .22);
      for (let j = 0; j <= cols; j++) {
        const s = j / cols * 2 - 1;
        positions.push(s * halfWidth, y + .14 * s * s * Math.sin(t * Math.PI), radius - .07 * s * s); uv.push(j / cols, t);
        const a = i * (cols + 1) + j;
        if (i < rows && j < cols) ix.push(a, a + cols + 1, a + 1, a + 1, a + cols + 1, a + cols + 2);
      }
    }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(ix); g.computeVertexNormals(); return g;
  }
  const petalGeometry = petalShape(false), openPetal = petalShape(true);
  petalGeometry.morphAttributes.position = [openPetal.attributes.position]; petalGeometry.morphAttributes.normal = [openPetal.attributes.normal]; geometries.push(petalGeometry, openPetal);
  const petalMaterial = new THREE.MeshPhysicalMaterial({ color: 0xfff5e9, roughness: .55, side: THREE.DoubleSide, sheen: .55, sheenRoughness: .8, sheenColor: new THREE.Color(0xffded1) });
  petalMaterial.onBeforeCompile = shader => {
    shader.vertexShader = "varying vec2 petalUv;\n" + shader.vertexShader.replace("#include <uv_vertex>", "#include <uv_vertex>\npetalUv = uv;");
    shader.fragmentShader = "varying vec2 petalUv;\n" + shader.fragmentShader.replace("#include <color_fragment>", `#include <color_fragment>
      float vein = sin(petalUv.x * 105.0 + petalUv.y * 2.5) * .012;
      vec3 blush = mix(vec3(.57,.29,.24), vec3(1.0,.94,.84), smoothstep(.02,.47,petalUv.y));
      diffuseColor.rgb *= blush + vein;
    `);
  }; materials.push(petalMaterial);
  const flowerData = model.filter((b, i) => b.sections.at(-1).r < .006 && i % 3 === 0).map(b => ({ pos: b.centers.at(-1).clone(), size: .17 + random() * .09, phase: random(), q: new THREE.Quaternion().setFromEuler(new THREE.Euler(.25 + random() * .55, random() * Math.PI * 2, (random() - .5) * .45)) })).filter(f => f.pos.y > 1.6);
  const petals = new THREE.InstancedMesh(petalGeometry, petalMaterial, flowerData.length * 9);
  petals.instanceMatrix.setUsage(THREE.DynamicDrawUsage); petals.frustumCulled = false; petals.castShadow = petals.receiveShadow = true; root.add(petals);
  const goldMaterial = new THREE.MeshStandardMaterial({ color: 0xb69a60, roughness: .77 });
  const coreGeometry = new THREE.SphereGeometry(1, 10, 8); materials.push(goldMaterial); geometries.push(coreGeometry);
  const cores = new THREE.InstancedMesh(coreGeometry, goldMaterial, flowerData.length); cores.frustumCulled = false; root.add(cores);
  const stamenGeometry = new THREE.SphereGeometry(1, 5, 4); geometries.push(stamenGeometry);
  const stamens = new THREE.InstancedMesh(stamenGeometry, goldMaterial, flowerData.length * 18); stamens.frustumCulled = false; root.add(stamens);
  const morph = new THREE.Mesh(petalGeometry, petalMaterial), dummy = new THREE.Object3D();
  const yaw = new THREE.Quaternion(), roll = new THREE.Quaternion();
  const yAxis = V(0, 1, 0), xAxis = V(1, 0, 0), origin = V(), tip = V(), normal = V();
  const rootGroup = new THREE.Group(); root.add(rootGroup);
  for (let i = 0; i < 7; i++) {
    const angle = i / 7 * Math.PI * 2, length = .26 + random() * .22;
    const curve = new THREE.CatmullRomCurve3([V(0, .16), V(Math.cos(angle) * length * .5, .035, Math.sin(angle) * length * .5), V(Math.cos(angle) * length, -.006, Math.sin(angle) * length)]);
    const g = new THREE.TubeGeometry(curve, 12, .04, 8, false), positions = g.attributes.position;
    for (let r = 0; r <= 12; r++) {
      const center = curve.getPointAt(r / 12);
      for (let c = 0; c <= 8; c++) {
        const id = r * 9 + c; tip.fromBufferAttribute(positions, id).sub(center).multiplyScalar(1 - r / 12 * .96).add(center); positions.setXYZ(id, tip.x, tip.y, tip.z);
      }
    }
    g.computeVertexNormals(); geometries.push(g); const mesh = new THREE.Mesh(g, bark); mesh.castShadow = mesh.receiveShadow = true; rootGroup.add(mesh);
  }
  const seedMaterial = new THREE.MeshPhysicalMaterial({ color: 0x654132, roughness: .48, clearcoat: .2, map: barkColor });
  const seedGeometry = new THREE.SphereGeometry(1, 32, 24); materials.push(seedMaterial); geometries.push(seedGeometry);
  const seeds = [new THREE.Mesh(seedGeometry, seedMaterial), new THREE.Mesh(seedGeometry, seedMaterial)]; seeds.forEach(seed => root.add(seed));
  const youngTexture = foliage.clone(); youngTexture.repeat.set(.075, .088); youngTexture.offset.set(.485, .912); textures.push(youngTexture);
  const youngMaterial = leafMaterial.clone(); youngMaterial.map = youngTexture; materials.push(youngMaterial);
  const youngBranches = model.slice(0, 5);
  const juveniles = new THREE.InstancedMesh(foliageMesh.geometry, youngMaterial, youngBranches.length * 2); juveniles.frustumCulled = false; juveniles.castShadow = true; root.add(juveniles);
  const groundGeometry = new THREE.PlaneGeometry(200, 200), groundMaterial = new THREE.ShadowMaterial({ color: 0x4a4537, opacity: .07 });
  geometries.push(groundGeometry); materials.push(groundMaterial);
  const ground = new THREE.Mesh(groundGeometry, groundMaterial); ground.rotation.x = -Math.PI / 2; ground.position.y = -.012; ground.receiveShadow = true; scene.add(ground);
  root.updateMatrixWorld(true);
  const bounds = new THREE.Box3();
  leafData.forEach(leaf => { bounds.expandByPoint(leaf.pos.clone().applyMatrix4(root.matrixWorld)); bounds.expandByPoint(leaf.pos.clone().add(V(0, leaf.size, 0)).applyMatrix4(root.matrixWorld)); });
  bounds.expandByPoint(V()).expandByScalar(.3);
  const extent = bounds.getSize(V()), center = bounds.getCenter(V());
  const positions = geometry.attributes.position.array, baseNormals = geometry.attributes.normal.array;
  let current = 0, target = 0, lastProgress = -1, reduced = false, disposed = false, raf = 0, lastTime = 0, intersecting = true;
  function updateTree(p) {
    const path = smooth(.055, .72, p) * maxPath, maturity = .14 + .86 * smooth(.16, .74, p);
    if (Math.abs(p - lastProgress) > .00001) {
      model.forEach(b => {
        const age = clamp((path - b.rootDistance) / b.length, 0, 1), rings = b.sections.length - 1;
        for (let i = 0; i <= rings; i++) {
          const sample = i * age, lo = Math.floor(sample), hi = Math.min(lo + 1, rings);
          origin.copy(b.centers[lo]).lerp(b.centers[hi], sample - lo);
          const taper = 1 - (1 - smooth(.86, 1, age)) * Math.pow(i / rings, 8);
          const radius = b.sections[i].r * maturity * smooth(0, .08, age) * taper;
          for (let j = 0; j <= b.segments; j++) {
            const id = (b.offset + i * (b.segments + 1) + j) * 3, ripple = 1 + .075 * Math.cos(j / b.segments * Math.PI * 10 + i * .16);
            positions[id] = origin.x + baseNormals[id] * radius * ripple;
            positions[id + 1] = origin.y + baseNormals[id + 1] * radius * ripple;
            positions[id + 2] = origin.z + baseNormals[id + 2] * radius * ripple;
          }
        }
      }); geometry.attributes.position.needsUpdate = true;
      leafData.forEach((leaf, i) => {
        const age = smooth(leaf.birth, leaf.birth + .085, p);
        dummy.position.copy(leaf.pos); dummy.quaternion.copy(leaf.q); roll.setFromAxisAngle(xAxis, (1 - age) * .75); dummy.quaternion.multiply(roll);
        dummy.scale.set(leaf.size * age * age, leaf.size * age, leaf.size * age); dummy.updateMatrix(); foliageMesh.setMatrixAt(i, dummy.matrix);
      }); foliageMesh.instanceMatrix.needsUpdate = true;
      flowerData.forEach((flower, i) => {
        const bud = smooth(.68 + flower.phase * .05, .79 + flower.phase * .035, p), bloom = smooth(.79 + flower.phase * .05, .93 + flower.phase * .065, p);
        for (let j = 0; j < 9; j++) {
          const inner = j >= 6;
          dummy.position.copy(flower.pos); dummy.quaternion.copy(flower.q).multiply(yaw.setFromAxisAngle(yAxis, j * Math.PI * 2 / (inner ? 3 : 6)));
          const size = flower.size * bud * (inner ? .7 : 1);
          dummy.scale.set(size, size, size); dummy.updateMatrix(); petals.setMatrixAt(i * 9 + j, dummy.matrix);
          morph.morphTargetInfluences[0] = bloom * (inner ? .60 : 1); petals.setMorphAt(i * 9 + j, morph);
        }
        dummy.position.copy(flower.pos).add(V(0, .045 * bud, 0).applyQuaternion(flower.q));
        dummy.quaternion.copy(flower.q); dummy.scale.set(.03 * bud, .065 * bud, .03 * bud); dummy.updateMatrix(); cores.setMatrixAt(i, dummy.matrix);
        for (let j = 0; j < 18; j++) {
          const angle = j * 2.399; normal.set(Math.cos(angle) * .04, .04 + j / 18 * .025, Math.sin(angle) * .04).multiplyScalar(bud).applyQuaternion(flower.q);
          dummy.position.copy(flower.pos).add(normal); dummy.scale.set(.007 * bud, .015 * bud, .007 * bud); dummy.updateMatrix(); stamens.setMatrixAt(i * 18 + j, dummy.matrix);
        }
      });
      petals.instanceMatrix.needsUpdate = cores.instanceMatrix.needsUpdate = stamens.instanceMatrix.needsUpdate = true;
      if (petals.morphTexture) petals.morphTexture.needsUpdate = true;
      youngBranches.forEach((b, i) => {
        const age = clamp((path - b.rootDistance) / b.length, 0, 1);
        const s = Math.min(b.centers.length - 1.001, age * (b.centers.length - 1) * .94), lo = Math.floor(s);
        for (let j = 0; j < 2; j++) {
          dummy.position.copy(b.centers[lo]).lerp(b.centers[lo + 1], s - lo);
          dummy.quaternion.copy(b.orientations[lo]).multiply(roll.setFromAxisAngle(V(0, 0, 1), j ? -.9 : .9));
          const size = .42 * smooth(.02, .14, age) * (1 - smooth(.50, .70, p));
          dummy.scale.set(size * .7, size, size); dummy.updateMatrix(); juveniles.setMatrixAt(i * 2 + j, dummy.matrix);
        }
      }); juveniles.instanceMatrix.needsUpdate = true;
      rootGroup.scale.setScalar(smooth(.04, .25, p));
      const split = smooth(.035, .14, p), fade = 1 - smooth(.12, .27, p);
      seeds.forEach((seed, i) => { seed.scale.set(.08 * fade, .12 * fade, .15 * fade); seed.position.set((i ? 1 : -1) * (.04 + split * .12), .11 * fade, .018); seed.rotation.z = (i ? -1 : 1) * split; seed.visible = fade > .001; });
      lastProgress = p;
    }
    const zoom = smooth(.045, .55, p), fit = Math.max(extent.y * 1.02, extent.x / camera.aspect * 1.03);
    const h = THREE.MathUtils.lerp(1.45, fit, zoom), distance = h / (2 * Math.tan(THREE.MathUtils.degToRad(15.5))) + extent.z * .25 * zoom;
    const lookY = THREE.MathUtils.lerp(.38, center.y, zoom);
    camera.position.set(0, lookY + distance * .10, distance); camera.lookAt(0, lookY, 0); renderer.render(scene, camera);
    host.dataset.triangles = String(renderer.info.render.triangles); host.dataset.model = "botanical-v2";
  }
  function frame(time) {
    raf = 0; if (disposed || !intersecting || document.hidden) return;
    const delta = Math.min((time - lastTime) / 1000, .05); lastTime = time;
    const difference = target - current;
    current = reduced || Math.abs(difference) < .0003 ? target : current + difference * (1 - Math.exp(-delta * 13)); updateTree(current);
    if (Math.abs(current - target) > .0001) raf = requestAnimationFrame(frame);
  }
  function schedule() { if (!raf && !disposed && intersecting && !document.hidden) { lastTime = performance.now() - 16; raf = requestAnimationFrame(frame); } }
  function resize() { const w = host.clientWidth, h = host.clientHeight; if (!w || !h) return; renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); schedule(); }
  const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(host);
  const observer = new IntersectionObserver(([entry]) => { intersecting = entry.isIntersecting; if (intersecting) schedule(); }); observer.observe(host);
  const visibility = () => schedule(); document.addEventListener("visibilitychange", visibility);
  const lost = event => { event.preventDefault(); cancelAnimationFrame(raf); raf = 0; onError(); }; renderer.domElement.addEventListener("webglcontextlost", lost);
  resize();
  return {
    setProgress(value, reduce = false) { target = clamp(value, 0, 1); reduced = reduce; schedule(); },
    dispose() {
      disposed = true; cancelAnimationFrame(raf); resizeObserver.disconnect(); observer.disconnect(); document.removeEventListener("visibilitychange", visibility); renderer.domElement.removeEventListener("webglcontextlost", lost);
      geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); textures.forEach(t => t.dispose());
      [foliageMesh, petals, cores, stamens, juveniles].forEach(m => m.dispose()); key.shadow.map?.dispose(); environment.dispose(); renderer.dispose(); renderer.domElement.remove();
    },
  };
}
