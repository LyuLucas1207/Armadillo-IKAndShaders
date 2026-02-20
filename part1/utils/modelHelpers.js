/*
 * UBC CPSC 314 2025W2
 * Assignment 2 — Model, skeleton, and glove helpers: placement, skeleton traversal, glove clone.
 */

import * as THREE from '../js/three.module.js';

/**
 * Adds the model to the parent and positions it using getPosition (optional floorY for ground alignment).
 * @param {THREE.Object3D} model - Model to place
 * @param {THREE.Object3D} parent - Parent to add the model to
 * @param {number} scale - Uniform scale
 * @param {function} getPosition - (box) => { x, y, z } or null for default
 * @param {function} getRotation - (box) => { x, y, z } or null
 * @param {number} floorY - Optional floor Y for default placement
 */
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

/**
 * Finds the skeleton from a glTF scene by traversing for SkinnedMesh; returns null if not found.
 * @param {THREE.Object3D} armadillo - Root of the glTF scene
 * @returns {THREE.Skeleton|null}
 */
export function traverseSkeleton(armadillo) {
  let skeleton = null;
  armadillo.traverse(function (child) {
    if (child.isSkinnedMesh && child.skeleton) skeleton = child.skeleton;
  });
  return skeleton;
}

/**
 * Clones the glove mesh and applies the given material to all meshes in the clone.
 * @param {THREE.Object3D} gloveTemplate - Source glove model
 * @param {THREE.Material} material - Material to apply
 * @returns {THREE.Object3D} Cloned glove with material
 */
export function cloneGloveWithMaterial(gloveTemplate, material) {
  const g = gloveTemplate.clone();
  g.traverse(function (child) {
    if (child.isMesh) child.material = material;
  });
  return g;
}
