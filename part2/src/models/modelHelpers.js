/*
 * UBC CPSC 314 2025W2
 * 模型/骨骼/手套：放置、遍历骨骼、克隆手套
 */

import * as THREE from '../../js/three.module.js';

export function initModel(model, parent, scale, getPosition, getRotation, floorY = 0) {
  if (!model) return;
  model.scale.setScalar(scale);
  parent.add(model);
  model.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(model);
  const pos = getPosition ? getPosition(box) : { x: 0, y: floorY - box.min.y, z: 0 };
  const v = pos instanceof THREE.Vector3 ? pos : new THREE.Vector3(pos.x, pos.y, pos.z);
  model.position.set(v.x, v.y, v.z);
  const rotation = getRotation ? getRotation(box) : { x: 0, y: 0, z: 0 };
  const r = rotation instanceof THREE.Vector3 ? rotation : new THREE.Vector3(rotation.x, rotation.y, rotation.z);
  model.rotation.set(r.x, r.y, r.z);
}

export function traverseSkeleton(armadillo) {
  let skeleton = null;
  armadillo.traverse(function (child) {
    if (child.isSkinnedMesh && child.skeleton) skeleton = child.skeleton;
  });
  return skeleton;
}

export function cloneGloveWithMaterial(gloveTemplate, material) {
  const g = gloveTemplate.clone();
  g.traverse(function (child) {
    if (child.isMesh) child.material = material;
  });
  return g;
}
