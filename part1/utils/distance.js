/*
 * UBC CPSC 314 2025W2
 * Assignment 2 — Distance utilities (world space) and shared distance store.
 */

import * as THREE from '../js/three.module.js';

/**
 * Shared distance store: set each frame, get elsewhere; allows multiple consumers to share one value.
 */
export class DistanceStore {
  constructor(initial = Infinity) {
    this._value = initial;
  }
  get() {
    return this._value;
  }
  set(value) {
    this._value = value;
  }
}

/**
 * Distance from a point in world space to a single Object3D (uses its world position).
 * Call updateMatrixWorld(true) on the parent chain before calling for correct results.
 * @param {THREE.Vector3} point - Point in world space
 * @param {THREE.Object3D} object - Object to measure distance to
 * @returns {number} Distance, or Infinity if object is null
 */
export function distanceTo(point, object) {
  if (!object) return Infinity;
  const p = new THREE.Vector3();
  object.getWorldPosition(p);
  return point.distanceTo(p);
}

/**
 * Minimum distance from a point in world space to any of the given Object3Ds.
 * Call updateMatrixWorld(true) on relevant parents before calling.
 * @param {THREE.Vector3} point - Point in world space
 * @param {...THREE.Object3D} objects - Objects to measure distances to
 * @returns {number} Minimum distance
 */
export function minDistanceTo(point, ...objects) {
  const temp = new THREE.Vector3();
  let min = Infinity;
  for (const obj of objects) {
    if (!obj) continue;
    obj.getWorldPosition(temp);
    const d = point.distanceTo(temp);
    if (d < min) min = d;
  }
  return min;
}
