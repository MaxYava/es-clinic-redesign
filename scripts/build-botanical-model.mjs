import * as THREE from 'three';
import { Tree } from './vendor/ez-tree/tree.js';
import { writeFile } from 'node:fs/promises';

// EZ-Tree is an authoring dependency only: the browser receives this baked skeleton.
const tree = new Tree();
tree.options.copy({
  seed: 42117, type: 'deciduous',
  branch: {
    levels: 3,
    angle: { 1: 61, 2: 52, 3: 48 },
    children: { 0: 4, 1: 6, 2: 4 },
    force: { direction: { x: 0, y: 1, z: 0 }, strength: .0002 },
    gnarliness: { 0: .015, 1: .015, 2: .017, 3: .021 },
    length: { 0: 2.35, 1: 1.95, 2: 1.04, 3: .53 },
    radius: { 0: .145, 1: .73, 2: .65, 3: .48 },
    sections: { 0: 24, 1: 18, 2: 12, 3: 8 },
    segments: { 0: 16, 1: 12, 2: 8, 3: 5 },
    start: { 1: .43, 2: .25, 3: .22 },
    taper: { 0: .6, 1: .73, 2: .72, 3: .95 },
    twist: { 0: .015, 1: .025, 2: .04, 3: .02 },
  },
  leaves: { count: 3, start: .25, angle: 55, size: .57, sizeVariance: .28 },
});
tree.generate();
const skeleton = tree.skeleton;
const toArray = vector => vector.toArray().slice(0, 3).map(n => +n.toFixed(5));
const distance = (a,b) => a.distanceTo(b);
const branches = [];
for (const [index, branch] of skeleton.branches.entries()) {
  const base = branch.sections[0].origin;
  let parent = -1, attach = 0, closest = Infinity;
  if (index > 0) {
    for (let j = 0; j < index; j++) {
      const sections = skeleton.branches[j].sections;
      for (let k = 0; k < sections.length - 1; k++) {
        const a=sections[k].origin, b=sections[k+1].origin;
        const segment=b.clone().sub(a);
        const t=THREE.MathUtils.clamp(base.clone().sub(a).dot(segment)/segment.lengthSq(),0,1);
        const d=distance(base,a.clone().addScaledVector(segment,t));
        if(d<closest){closest=d;parent=j;attach=(k+t)/(sections.length-1);}
      }
    }
  }
  const length=branch.sections.slice(1).reduce((sum,s,i)=>sum+distance(s.origin,branch.sections[i].origin),0);
  const rootDistance=parent<0?0:branches[parent].rootDistance+branches[parent].length*attach;
  branches.push({parent,attach:+attach.toFixed(6),length,rootDistance,segments:branch.segmentCount,sections:branch.sections.map(s=>({p:toArray(s.origin),q:new THREE.Quaternion().setFromEuler(s.orientation).toArray().map(n=>+n.toFixed(6)),r:+s.radius.toFixed(6)}))});
}
const leaves=skeleton.leaves.map(leaf=>{
  let parent=-1,attach=0,closest=Infinity;
  for(let j=0;j<skeleton.branches.length;j++){
    const sections=skeleton.branches[j].sections;
    for(let k=0;k<sections.length-1;k++){
      const a=sections[k].origin,b=sections[k+1].origin,segment=b.clone().sub(a);
      const t=THREE.MathUtils.clamp(leaf.origin.clone().sub(a).dot(segment)/segment.lengthSq(),0,1);
      const d=distance(leaf.origin,a.clone().addScaledVector(segment,t));
      if(d<closest){closest=d;parent=j;attach=(k+t)/(sections.length-1);}
    }
  }
  return {p:toArray(leaf.origin),q:new THREE.Quaternion().setFromEuler(leaf.orientation).toArray().map(n=>+n.toFixed(6)),size:+leaf.size.toFixed(5),parent,attach:+attach.toFixed(5)};
});
const model={version:2,source:'EZ-Tree / Daniel Greenheck / MIT',revision:'dcf309bd86bd521083d9c70f01f2de45fdc7c457',branches,leaves};
await writeFile(new URL('../public/tree-lab/model/botanical-tree.json',import.meta.url),JSON.stringify(model));
console.log(JSON.stringify({branches:branches.length,foliageClusters:leaves.length,vertices:tree.branches.verts.length/3,bytes:JSON.stringify(model).length}));
tree.traverse(object=>{object.geometry?.dispose();if(object.material)object.material.dispose();});
