import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { createBonsaiModel } from "./bonsai-model";

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const clamp = THREE.MathUtils.clamp;
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

const assets = "/tree-lab/model/";

// Art-directed bonsai: curved trunk, open branch structure and individual folded leaves.
export async function createTreeScene(host, onError) {
  const loader = new THREE.TextureLoader();
  const textures = [];
  const load = async (name, color = false) => {
    const texture = await loader.loadAsync(`${assets}textures/${name}`);
    texture.colorSpace = color ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    textures.push(texture); return texture;
  };
  const data = createBonsaiModel();
  let barkColor, barkNormal, barkRoughness;
  try {
    const loaded = await Promise.allSettled([
      load("bark-color.jpg", true), load("bark-normal.jpg"), load("bark-roughness.jpg"),
    ]);
    const failed = loaded.find(result => result.status === "rejected");
    if (failed) throw failed.reason;
    [barkColor, barkNormal, barkRoughness] = loaded.map(result => result.value);
  } catch (error) { textures.forEach(t => t.dispose()); throw error; }
  const mobile = window.matchMedia("(max-width: 600px)").matches;
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" }); }
  catch (error) { textures.forEach(t => t.dispose()); throw error; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.35 : 1.8));
  renderer.setClearColor(0, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = .98;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.setAttribute("aria-hidden", "true");
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(31, 1, .05, 50);
  const root = new THREE.Group(); root.rotation.y = -.06; scene.add(root);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, .04);
  scene.environment = environment.texture; scene.environmentIntensity = .30;
  room.dispose(); pmrem.dispose();
  scene.add(new THREE.HemisphereLight(0xfff4e1, 0x5c6551, 1.35));
  const key = new THREE.DirectionalLight(0xfff1dc, 2.8);
  key.position.set(-3, 7, 5); key.target.position.set(0, 2.5, 0); key.castShadow = true;
  key.shadow.mapSize.set(mobile ? 1024 : 2048, mobile ? 1024 : 2048);
  Object.assign(key.shadow.camera, { left: -4, right: 4, top: 7, bottom: -2, near: .1, far: 18 });
  key.shadow.bias = -.00015; key.shadow.normalBias = .006; scene.add(key, key.target);
  const edge = new THREE.DirectionalLight(0xfff8e9, 1.1); edge.position.set(4, 5, -4); scene.add(edge);
  const front = new THREE.DirectionalLight(0xe4ebef, .45); front.position.set(2, 3, 7); scene.add(front);
  const geometries = [], materials = [];
  for (const map of [barkColor, barkNormal, barkRoughness]) {
    map.wrapS = map.wrapT = THREE.RepeatWrapping; map.repeat.set(1.5, 1.0);
    map.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  }
  const bark = new THREE.MeshStandardMaterial({ color: 0xb2a695, map: barkColor, normalMap: barkNormal, roughnessMap: barkRoughness, normalScale: new THREE.Vector2(.70, .70), roughness: .96 });
  bark.onBeforeCompile = shader => {
    shader.fragmentShader = shader.fragmentShader.replace("#include <map_fragment>", `#include <map_fragment>
      float grey = dot(diffuseColor.rgb, vec3(.299,.587,.114));
      diffuseColor.rgb = mix(vec3(grey), diffuseColor.rgb, .38);
    `);
  };
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
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3).setUsage(THREE.DynamicDrawUsage));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2)); geometry.setIndex(indices); geometries.push(geometry);
  const wood = new THREE.Mesh(geometry, bark); wood.castShadow = wood.receiveShadow = true; wood.frustumCulled = false; root.add(wood);

  // Folded, curved leaves have real silhouettes: no alpha cards or crossed planes.
  function foliageBlade() {
    const positions = [], uv = [], ix = []; const rows = mobile ? 6 : 10, cols = mobile ? 2 : 4;
    for (let i = 0; i <= rows; i++) {
      const t = i / rows;
      for (let j = 0; j <= cols; j++) {
        const s = j / cols - .5;
        const width = Math.pow(Math.sin(Math.PI * t), .68) * .57;
        positions.push(s * width * (1 + .10 * Math.sin(t * 5)), t,
          -.16 * t * t + .34 * s * s * Math.sin(t * Math.PI) + .07 * s * t); uv.push(j / cols, t);
        const a = i * (cols + 1) + j;
        if (i < rows && j < cols) ix.push(a, a + 1, a + cols + 1, a + 1, a + cols + 2, a + cols + 1);
      }
    }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(ix); g.computeVertexNormals(); geometries.push(g); return g;
  }
  const leafMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.DoubleSide, roughness: .59, metalness: 0, emissive: 0x25391c, emissiveIntensity: .025 }); materials.push(leafMaterial);
  leafMaterial.onBeforeCompile = shader => {
    shader.vertexShader = "varying vec2 leafUv;\n" + shader.vertexShader.replace("#include <uv_vertex>", "#include <uv_vertex>\nleafUv = uv;");
    shader.fragmentShader = "varying vec2 leafUv;\n" + shader.fragmentShader.replace("#include <color_fragment>", `#include <color_fragment>
      float vein = exp(-abs(leafUv.x-.5)*100.0) * .10;
      float margin = smoothstep(.32,.50,abs(leafUv.x-.5)) * .11;
      diffuseColor.rgb *= .94 + vein - margin;
    `);
  };
  const leafData = data.leaves.map(leaf => {
    const distance = (model[leaf.parent].rootDistance + model[leaf.parent].length * leaf.attach) / maxPath;
    const birth = .055 + (.5 - Math.sin(Math.asin(1 - 2 * clamp(distance, 0, 1)) / 3)) * (.72 - .055);
    return { pos: new THREE.Vector3().fromArray(leaf.p), q: new THREE.Quaternion().fromArray(leaf.q), size: leaf.size, shade: leaf.shade, birth };
  });
  const firstLeaf = Math.min(...leafData.map(leaf => leaf.birth));
  const foliageMesh = new THREE.InstancedMesh(foliageBlade(), leafMaterial, leafData.length);
  foliageMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); foliageMesh.frustumCulled = false;
  foliageMesh.castShadow = foliageMesh.receiveShadow = true; root.add(foliageMesh);
  const color = new THREE.Color();
  leafData.forEach((leaf, i) => foliageMesh.setColorAt(i, color.setHSL(.235 + leaf.shade * .015, .36 + leaf.shade * .10, .10 + leaf.shade * .055)));

  // Cupped petals morph between closed and open shapes; stamens remain separate geometry.
  function petalShape(open) {
    const positions = [], uv = [], ix = []; const rows = 16, cols = 12;
    for (let i = 0; i <= rows; i++) {
      const t = i / rows;
      const radius = open ? .92 * Math.pow(t, 1.22) : .26 * Math.sin(Math.PI * t * .92);
      const y = open ? .15 * t + .24 * Math.sin(Math.PI * t) : .98 * t;
      const halfWidth = Math.pow(Math.sin(Math.PI * t), .7) * (open ? .59 : .22);
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
  const petalMaterial = new THREE.MeshPhysicalMaterial({ color: 0xffefe3, roughness: .55, side: THREE.DoubleSide, sheen: .55, sheenRoughness: .8, sheenColor: new THREE.Color(0xffded1) });
  petalMaterial.onBeforeCompile = shader => {
    shader.vertexShader = "varying vec2 petalUv;\n" + shader.vertexShader.replace("#include <uv_vertex>", "#include <uv_vertex>\npetalUv = uv;");
    shader.fragmentShader = "varying vec2 petalUv;\n" + shader.fragmentShader.replace("#include <color_fragment>", `#include <color_fragment>
      float vein = sin(petalUv.x * 105.0 + petalUv.y * 2.5) * .012;
      vec3 blush = mix(vec3(.70,.39,.33), vec3(1.0,.96,.91), smoothstep(.02,.47,petalUv.y));
      diffuseColor.rgb *= blush + vein;
    `);
  }; materials.push(petalMaterial);
  const flowerData = data.flowers.map(f => ({ pos: new THREE.Vector3().fromArray(f.p), q: new THREE.Quaternion().fromArray(f.q), size: f.size, phase: f.phase }));
  const petals = new THREE.InstancedMesh(petalGeometry, petalMaterial, flowerData.length * 5);
  petals.instanceMatrix.setUsage(THREE.DynamicDrawUsage); petals.frustumCulled = false; petals.castShadow = petals.receiveShadow = true; root.add(petals);
  const goldMaterial = new THREE.MeshStandardMaterial({ color: 0xb69a60, roughness: .77 });
  const coreGeometry = new THREE.SphereGeometry(1, 10, 8); materials.push(goldMaterial); geometries.push(coreGeometry);
  const cores = new THREE.InstancedMesh(coreGeometry, goldMaterial, flowerData.length); cores.frustumCulled = false; root.add(cores);
  const stamenGeometry = new THREE.SphereGeometry(1, 5, 4); geometries.push(stamenGeometry);
  const stamens = new THREE.InstancedMesh(stamenGeometry, goldMaterial, flowerData.length * 18); stamens.frustumCulled = false; root.add(stamens);
  const morph = new THREE.Mesh(petalGeometry, petalMaterial), dummy = new THREE.Object3D();
  const yaw = new THREE.Quaternion(), roll = new THREE.Quaternion();
  const yAxis = V(0, 1, 0), xAxis = V(1, 0, 0), origin = V(), normal = V();
  // A small, irregular moss bed grounds the exposed roots without a pot appearing
  // halfway through the seed-to-tree story.
  const rootGroup = new THREE.Group(); root.add(rootGroup);
  const soilGeometry = new THREE.SphereGeometry(1, 64, 24);
  const soilPositions = soilGeometry.attributes.position;
  for (let i = 0; i < soilPositions.count; i++) {
    const x = soilPositions.getX(i), y = soilPositions.getY(i), z = soilPositions.getZ(i);
    const edge = 1 + .035 * Math.sin(x * 16 + z * 5) + .024 * Math.cos(z * 21 - x * 7);
    soilPositions.setXYZ(i, x * .73 * edge, y * .055 - .040 + Math.sin(x * 23 + z * 18) * .004, z * .48 * edge);
  }
  soilGeometry.computeVertexNormals(); geometries.push(soilGeometry);
  const soilMaterial = new THREE.MeshStandardMaterial({ color: 0x585444, roughness: 1 });
  materials.push(soilMaterial);
  const soil = new THREE.Mesh(soilGeometry, soilMaterial); soil.receiveShadow = true; rootGroup.add(soil);
  const mossGeometry = new THREE.IcosahedronGeometry(1, 0); geometries.push(mossGeometry);
  const mossMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1 }); materials.push(mossMaterial);
  const moss = new THREE.InstancedMesh(mossGeometry, mossMaterial, 1500); moss.receiveShadow = true; rootGroup.add(moss);
  for (let i = 0; i < moss.count; i++) {
    const a = random() * Math.PI * 2, r = Math.sqrt(random()), x = Math.cos(a) * r * .71, z = Math.sin(a) * r * .46;
    const mound = Math.sqrt(Math.max(0, 1 - r * r));
    const size = .008 + random() * .015;
    dummy.position.set(x, mound * .055 - .04, z); dummy.rotation.set(random(), random(), random());
    dummy.scale.set(size, size * .55, size); dummy.updateMatrix(); moss.setMatrixAt(i, dummy.matrix);
    moss.setColorAt(i, color.setHSL(.19 + random() * .04, .23 + random() * .15, .065 + random() * .07));
  }
  const seedMaterial = new THREE.MeshPhysicalMaterial({ color: 0x654132, roughness: .48, clearcoat: .2, map: barkColor });
  const seedGeometry = new THREE.SphereGeometry(1, 32, 24); materials.push(seedMaterial); geometries.push(seedGeometry);
  const seeds = [new THREE.Mesh(seedGeometry, seedMaterial), new THREE.Mesh(seedGeometry, seedMaterial)]; seeds.forEach(seed => root.add(seed));
  const youngMaterial = new THREE.MeshStandardMaterial({color: 0x607742, roughness: .48, side: THREE.DoubleSide}); materials.push(youngMaterial);
  const youngBranches = [model[0]];
  const juveniles = new THREE.InstancedMesh(foliageMesh.geometry, youngMaterial, 2); juveniles.frustumCulled = false; juveniles.castShadow = true; root.add(juveniles);
  const groundGeometry = new THREE.PlaneGeometry(200, 200), groundMaterial = new THREE.ShadowMaterial({ color: 0x4a4537, opacity: .045 });
  geometries.push(groundGeometry); materials.push(groundMaterial);
  const ground = new THREE.Mesh(groundGeometry, groundMaterial); ground.rotation.x = -Math.PI / 2; ground.position.y = -.012; ground.receiveShadow = true; scene.add(ground);
  root.updateMatrixWorld(true);
  const bounds = new THREE.Box3();
  leafData.forEach(leaf => { bounds.expandByPoint(leaf.pos.clone().applyMatrix4(root.matrixWorld)); bounds.expandByPoint(leaf.pos.clone().add(V(0, leaf.size, 0)).applyMatrix4(root.matrixWorld)); });
  bounds.expandByPoint(V()).expandByScalar(.3);
  const extent = bounds.getSize(V()), center = bounds.getCenter(V());
  const positions = geometry.attributes.position.array;
  const baseNormals = new Float32Array(geometry.attributes.normal.array);
  const grownNormals = geometry.attributes.normal.array;
  let current = 0, target = 0, lastProgress = -1, reduced = false, disposed = false, raf = 0, lastTime = 0, intersecting = true;
  let targetAngle = root.rotation.y;
  function updateTree(p) {
    const path = smooth(.055, .72, p) * maxPath, maturity = .14 + .86 * smooth(.16, .74, p);
    const bend = .35 + .65 * smooth(.25, .62, p);
    wood.visible = p > .055; foliageMesh.visible = p > firstLeaf;
    rootGroup.visible = p > .18; juveniles.visible = p > .055 && p < .62;
    petals.visible = cores.visible = stamens.visible = p > .73;
    if (Math.abs(p - lastProgress) > .00001) {
      model.forEach(b => {
        const age = b.root ? smooth(.20, .47, p) : clamp((path - b.rootDistance) / b.length, 0, 1), rings = b.sections.length - 1;
        for (let i = 0; i <= rings; i++) {
          const sample = i * age, lo = Math.floor(sample), hi = Math.min(lo + 1, rings);
          origin.copy(b.centers[lo]).lerp(b.centers[hi], sample - lo);
          const taper = 1 - (1 - smooth(.86, 1, age)) * Math.pow(i / rings, 8);
          const radius = b.sections[i].r * maturity * smooth(0, .08, age) * taper;
          for (let j = 0; j <= b.segments; j++) {
            const id = (b.offset + i * (b.segments + 1) + j) * 3, ripple = 1 + .075 * Math.cos(j / b.segments * Math.PI * 10 + i * .16);
            // The cross-section must follow the sampled part of the curve as it
            // grows. Using the adult ring's orientation folds a curved trunk flat.
            const n0 = (b.offset + lo * (b.segments + 1) + j) * 3;
            const n1 = (b.offset + hi * (b.segments + 1) + j) * 3;
            normal.set(THREE.MathUtils.lerp(baseNormals[n0], baseNormals[n1], sample - lo),
              THREE.MathUtils.lerp(baseNormals[n0 + 1], baseNormals[n1 + 1], sample - lo),
              THREE.MathUtils.lerp(baseNormals[n0 + 2], baseNormals[n1 + 2], sample - lo)).normalize();
            positions[id] = (origin.x + normal.x * radius * ripple) * bend;
            positions[id + 1] = origin.y + normal.y * radius * ripple;
            positions[id + 2] = (origin.z + normal.z * radius * ripple) * bend;
            normal.set(normal.x / bend, normal.y, normal.z / bend).normalize();
            grownNormals[id] = normal.x; grownNormals[id + 1] = normal.y; grownNormals[id + 2] = normal.z;
          }
        }
      }); geometry.attributes.position.needsUpdate = geometry.attributes.normal.needsUpdate = true;
      leafData.forEach((leaf, i) => {
        const age = smooth(leaf.birth, leaf.birth + .085, p);
        dummy.position.copy(leaf.pos); dummy.position.x *= bend; dummy.position.z *= bend;
        dummy.quaternion.copy(leaf.q); roll.setFromAxisAngle(xAxis, (1 - age) * .75); dummy.quaternion.multiply(roll);
        dummy.scale.set(leaf.size * age * age, leaf.size * age, leaf.size * age); dummy.updateMatrix(); foliageMesh.setMatrixAt(i, dummy.matrix);
      }); foliageMesh.instanceMatrix.needsUpdate = true;
      flowerData.forEach((flower, i) => {
        const bud = smooth(.73 + flower.phase * .035, .82 + flower.phase * .035, p), bloom = smooth(.82 + flower.phase * .04, .94 + flower.phase * .06, p);
        for (let j = 0; j < 5; j++) {
          dummy.position.copy(flower.pos); dummy.quaternion.copy(flower.q).multiply(yaw.setFromAxisAngle(yAxis, j * Math.PI * 2 / 5));
          const size = flower.size * bud;
          dummy.scale.set(size, size, size); dummy.updateMatrix(); petals.setMatrixAt(i * 5 + j, dummy.matrix);
          morph.morphTargetInfluences[0] = bloom; petals.setMorphAt(i * 5 + j, morph);
        }
        dummy.position.copy(flower.pos).add(V(0, .012 * bud, 0).applyQuaternion(flower.q));
        dummy.quaternion.copy(flower.q); dummy.scale.set(.010 * bud, .014 * bud, .010 * bud); dummy.updateMatrix(); cores.setMatrixAt(i, dummy.matrix);
        for (let j = 0; j < 18; j++) {
          const angle = j * 2.399; normal.set(Math.cos(angle) * .016, .023 + j / 18 * .006, Math.sin(angle) * .016).multiplyScalar(bud).applyQuaternion(flower.q);
          dummy.position.copy(flower.pos).add(normal); dummy.scale.set(.0025 * bud, .004 * bud, .0025 * bud); dummy.updateMatrix(); stamens.setMatrixAt(i * 18 + j, dummy.matrix);
        }
      });
      petals.instanceMatrix.needsUpdate = cores.instanceMatrix.needsUpdate = stamens.instanceMatrix.needsUpdate = true;
      if (petals.morphTexture) petals.morphTexture.needsUpdate = true;
      youngBranches.forEach((b, i) => {
        const age = clamp((path - b.rootDistance) / b.length, 0, 1);
        const s = Math.min(b.centers.length - 1.001, age * (b.centers.length - 1) * .94), lo = Math.floor(s);
        for (let j = 0; j < 2; j++) {
          dummy.position.copy(b.centers[lo]).lerp(b.centers[lo + 1], s - lo);
          dummy.position.x *= bend; dummy.position.z *= bend;
          dummy.quaternion.copy(b.orientations[lo]).multiply(roll.setFromAxisAngle(V(0, 0, 1), j ? -.9 : .9));
          const size = .36 * smooth(.02, .14, age) * (1 - smooth(.43, .62, p));
          dummy.scale.set(size * .7, size, size); dummy.updateMatrix(); juveniles.setMatrixAt(i * 2 + j, dummy.matrix);
        }
      }); juveniles.instanceMatrix.needsUpdate = true;
      const groundGrowth = smooth(.18, .48, p);
      rootGroup.scale.set(groundGrowth * bend, groundGrowth, groundGrowth * bend);
      const split = smooth(.035, .14, p), fade = 1 - smooth(.12, .27, p);
      seeds.forEach((seed, i) => { seed.scale.set(.08 * fade, .12 * fade, .15 * fade); seed.position.set((i ? 1 : -1) * (.04 + split * .12), .11 * fade, .018); seed.rotation.z = (i ? -1 : 1) * split; seed.visible = fade > .001; });
      lastProgress = p;
    }
    const zoom = smooth(.045, .55, p), fit = Math.max(extent.y * 1.18, extent.x / camera.aspect * 1.10);
    const h = THREE.MathUtils.lerp(1.45, fit, zoom), distance = h / (2 * Math.tan(THREE.MathUtils.degToRad(15.5))) + extent.z * .25 * zoom;
    const lookY = THREE.MathUtils.lerp(.38, center.y, zoom);
    camera.position.set(0, lookY + distance * .12, distance); camera.lookAt(0, lookY, 0); renderer.render(scene, camera);
    host.dataset.triangles = String(renderer.info.render.triangles); host.dataset.model = "bonsai-v3";
    host.dataset.viewAngle = root.rotation.y.toFixed(3);
  }
  function frame(time) {
    raf = 0; if (disposed || !intersecting || document.hidden) return;
    const delta = Math.min((time - lastTime) / 1000, .05); lastTime = time;
    const difference = target - current;
    current = reduced || Math.abs(difference) < .0003 ? target : current + difference * (1 - Math.exp(-delta * 13));
    const turn = targetAngle - root.rotation.y;
    root.rotation.y = reduced || Math.abs(turn) < .0003 ? targetAngle : root.rotation.y + turn * (1 - Math.exp(-delta * 10));
    updateTree(current);
    if (Math.abs(current - target) > .0001 || Math.abs(root.rotation.y - targetAngle) > .0001) raf = requestAnimationFrame(frame);
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
    setView(angle) { targetAngle = clamp(angle, -.6, .6); schedule(); },
    dispose() {
      disposed = true; cancelAnimationFrame(raf); resizeObserver.disconnect(); observer.disconnect(); document.removeEventListener("visibilitychange", visibility); renderer.domElement.removeEventListener("webglcontextlost", lost);
      geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); textures.forEach(t => t.dispose());
      [foliageMesh, petals, cores, stamens, juveniles, moss].forEach(m => m.dispose()); key.shadow.map?.dispose(); environment.dispose(); renderer.dispose(); renderer.domElement.remove();
    },
  };
}
