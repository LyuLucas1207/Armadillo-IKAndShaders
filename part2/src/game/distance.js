/*
 * UBC CPSC 314 2025W2
 * 距离计算（世界空间）与通用距离存储
 */

import * as THREE from '../../js/three.module.js';

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

export function distanceTo(point, object) {
  if (!object) return Infinity;
  const p = new THREE.Vector3();
  object.getWorldPosition(p);
  return point.distanceTo(p);
}

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
