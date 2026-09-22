import * as THREE from "three";

// The silhouette is composed by hand. Randomness only breaks up secondary detail.
// Coordinates are shared by the growth renderer and any future model export.
export function createBonsaiModel() {
  const V = (p) => new THREE.Vector3(...p);
  const up = new THREE.Vector3(0, 1, 0);
  let seed = 90317;
  const rand = () => { seed = (Math.imul(seed, 1664525) + 1013904223) | 0; return (seed >>> 0) / 4294967296; };
  const branches = [], leaves = [], flowers = [];
  const curves = [];
  function branch(points, radius, endRadius, parent = -1, attach = 0, rings = 20, segments = 10, root = false) {
    const curve = new THREE.CatmullRomCurve3(points.map(V), false, "centripetal");
    const length = curve.getLength();
    const rootDistance = parent < 0 ? 0 : branches[parent].rootDistance + branches[parent].length * attach;
    const sections = [];
    for (let i = 0; i <= rings; i++) {
      const t = i / rings;
      const p = curve.getPointAt(t), tangent = curve.getTangentAt(t);
      const taper = THREE.MathUtils.lerp(radius, endRadius, Math.pow(t, .7));
      const flare = parent < 0 && !root ? .10 * Math.exp(-t * 27) : 0;
      const collar = parent === 0 ? radius * .18 * Math.exp(-t * 22) : 0;
      const age = radius > .08 ? 1 + .045 * Math.sin(t * 21 + parent) + .025 * Math.sin(t * 43) : 1;
      sections.push({ p: p.toArray(), q: new THREE.Quaternion().setFromUnitVectors(up, tangent).toArray(), r: taper * age + flare + collar });
    }
    const id = branches.length;
    branches.push({ parent, attach, length, rootDistance, segments, sections, root }); curves.push(curve);
    return id;
  }
  const trunk = branch([
    [0, 0, 0], [.12, .30, .015], [.34, .63, -.11], [.34, .91, -.12],
    [.10, 1.15, .03], [-.33, 1.41, .13], [-.45, 1.66, .09],
    [-.42, 1.87, -.05], [-.20, 2.03, -.18], [.08, 2.18, -.21], [.18, 2.50, -.10], [.19, 2.84, .04],
  ], .265, .026, -1, 0, 70, 24);

  // Unequal, spreading surface roots anchor the bent trunk.
  for (let i = 0; i < 7; i++) {
    const a = i / 7 * Math.PI * 2 + .22, len = .57 + rand() * .29;
    branch([[.02, .16, 0], [Math.cos(a) * len * .38, .07, Math.sin(a) * len * .38],
      [Math.cos(a + .11) * len * .76, .015, Math.sin(a + .11) * len * .76],
      [Math.cos(a + .16) * len, -.008, Math.sin(a + .16) * len]], .10 + rand() * .028, .002, -1, 0, 22, 10, true);
  }

  // Broad lower-left branch, counterbalancing right branch, smaller upper-left pad,
  // and an off-centre apex. Back pads give depth without closing the open trunk.
  const pads = [
    { at: .37, via: [[-.32, 1.02, .10], [-.80, .99, .15]], c: [-1.32, 1.30, .20], r: [.86, .43, .60], radius: .125 },
    { at: .60, via: [[.03, 1.61, -.10], [.67, 1.59, -.10]], c: [1.18, 1.89, -.10], r: [.85, .43, .60], radius: .10 },
    { at: .78, via: [[-.56, 2.19, .00], [-.80, 2.18, .02]], c: [-.99, 2.40, .06], r: [.67, .36, .48], radius: .073 },
    { at: 1, via: [[.20, 2.86, -.04]], c: [.20, 2.99, -.01], r: [.69, .43, .56], radius: .032 },
    { at: .48, via: [[.05, 1.46, -.35]], c: [.21, 1.68, -.72], r: [.54, .33, .40], radius: .063 },
    { at: .82, via: [[.29, 2.38, -.39]], c: [.65, 2.67, -.53], r: [.55, .32, .41], radius: .05 },
  ];
  for (const [padIndex, pad] of pads.entries()) {
    const base = curves[trunk].getPointAt(pad.at);
    const center = V(pad.c);
    const main = branch([base.toArray(), ...pad.via, [center.x, center.y + pad.r[1] * .26, center.z]], pad.radius, .003, trunk, pad.at, 30, 12);
    // Three unequal secondary limbs split into smaller forks. This avoids a
    // radial basket of twigs supporting an unnaturally flat foliage disc.
    const arms = [];
    for (let arm = 0; arm < 3; arm++) {
      const a = arm * 2.10 + padIndex * .63 + .30;
      const reach = arm === 0 ? .52 : arm === 1 ? .61 : .38;
      const at = .40 + arm * .26;
      const start = curves[main].getPointAt(at);
      const end = center.clone().add(new THREE.Vector3(Math.cos(a) * pad.r[0] * reach,
        pad.r[1] * (arm === 1 ? .31 : .52), Math.sin(a) * pad.r[2] * reach));
      const elbow = start.clone().lerp(end, .45);
      elbow.y -= .065; elbow.z += (arm - 1) * .035;
      const id = branch([start.toArray(), elbow.toArray(), end.toArray()], .036 - arm * .004, .010, main, at, 14, 8);
      arms.push({ id, end, angle: a });
    }
    for (let fan = 0; fan < 15; fan++) {
      const arm = arms[Math.floor(fan / 5)];
      const angle = (fan % 5) * 2.399963 + arm.angle;
      const radial = .34 + rand() * .55;
      const end = arm.end.clone().add(new THREE.Vector3(Math.cos(angle) * pad.r[0] * radial * .54,
        pad.r[1] * (.25 + rand() * .45) - (fan % 5 === 0 ? .14 : 0), Math.sin(angle) * pad.r[2] * radial * .63));
      const attach = .46 + .50 * rand();
      const start = curves[arm.id].getPointAt(attach);
      const mid = start.clone().lerp(end, .53); mid.y -= .025;
      mid.x += (rand() - .5) * .045;
      const fanId = branch([start.toArray(), mid.toArray(), end.toArray()], .012 + rand() * .005, .002, arm.id, attach, 9, 6);
      for (let shoot = 0; shoot < 7; shoot++) {
        const a = shoot * 2.399963 + angle;
        const reach = .07 + rand() * .18;
        const node = end.clone().add(new THREE.Vector3(Math.cos(a) * reach,
          -.10 + rand() * .25, Math.sin(a) * reach * .95));
        const startAt = .50 + .48 * rand();
        const shootStart = curves[fanId].getPointAt(startAt);
        const shootMid = shootStart.clone().lerp(node, .55); shootMid.y -= .018;
        const shootId = branch([shootStart.toArray(), shootMid.toArray(), node.toArray()], .0045, .0008, fanId, startAt, 5, 4);
        for (let leaf = 0; leaf < 7; leaf++) {
          const t = .32 + leaf / 7 * .68;
          const p = curves[shootId].getPointAt(t);
          const azimuth = a + leaf * 2.399963;
          const tilt = -.70 - rand() * .85;
          const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(tilt, azimuth, -.15 + rand() * .30, "YXZ"));
          const size = .13 + rand() * .065;
          leaves.push({ p: p.toArray(), q: q.toArray(), size, parent: shootId, attach: t, shade: rand() });
        }
        if (shoot === 2 && fan % 3 === 0 && padIndex !== 4) {
          flowers.push({ p: node.clone().add(new THREE.Vector3(0, .035, .055)).toArray(),
            q: new THREE.Quaternion().setFromEuler(new THREE.Euler(.75 + rand() * .65, rand() * 6.28, rand() * .35)).toArray(),
            size: .09 + rand() * .025, phase: rand(), parent: shootId });
        }
      }
    }
  }
  return { branches, leaves, flowers };
}
