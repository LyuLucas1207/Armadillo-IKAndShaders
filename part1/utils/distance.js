/*
 * UBC CPSC 314 2025W2
 * Assignment 2 — 距离计算（世界空间）与通用距离存储.
 */

import * as THREE from '../js/three.module.js';

/**
 * 通用距离存储：可在每帧 set，在别处 get，便于多处共享同一距离值.
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
 * 世界空间一点到单个 Object3D 的距离（用其世界位置）.
 * 调用前父链应先 updateMatrixWorld(true) 以保证正确.
 */
export function distanceTo(point, object) {
  if (!object) return Infinity;
  const p = new THREE.Vector3();
  object.getWorldPosition(p);
  return point.distanceTo(p);
}

/**
 * 世界空间一点到多个 Object3D 的最近距离.
 * 调用前相关父物体应先 updateMatrixWorld(true).
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
