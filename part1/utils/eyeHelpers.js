/*
 * UBC CPSC 314 2025W2
 * Assignment 2 — 通用眼球创建.
 */

import * as THREE from '../js/three.module.js';

/**
 * 创建一只眼球：socket（Object3D）+ 其子 mesh，便于统一挂到 scene 并设置位置.
 * @param {THREE.BufferGeometry} geometry - 眼球几何
 * @param {THREE.Material} material - 眼球材质
 * @param {number} scale - 缩放
 * @param {{x: number, y: number, z: number}} position - 位置
 * @returns {{ socket: THREE.Object3D, eye: THREE.Mesh }}
 */
export function createEye(geometry, material, scale, position) {
  const socket = new THREE.Object3D();
  const eyeSocketPos = new THREE.Vector3(position.x, position.y, position.z);
  socket.position.copy(eyeSocketPos);
  const eye = new THREE.Mesh(geometry, material);
  eye.scale.copy(new THREE.Vector3(scale, scale, scale));
  socket.add(eye);
  return { socket, eye };
}
