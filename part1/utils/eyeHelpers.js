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

const vecY = new THREE.Vector3(0, 1, 0);

/**
 * 更新单条眼激光：从 eyeSocket 指向 spherePos，设置 laserMesh 的位置、长度与朝向.
 * 复用 eyePos、dir 避免每帧分配；若眼与球几乎重合（len < 1e-6）则隐藏激光.
 * @param {THREE.Object3D} eyeSocket - 眼 socket（取世界位置）
 * @param {THREE.Mesh} laserMesh - 激光 mesh（CylinderGeometry 高度 1，沿 Y）
 * @param {THREE.Vector3} spherePos - 小球世界位置
 * @param {THREE.Vector3} eyePos - 临时向量，用于写出眼世界位置
 * @param {THREE.Vector3} dir - 临时向量，用于眼→球方向
 */
export function updateOneLaser(eyeSocket, laserMesh, spherePos, eyePos, dir) {
  eyeSocket.getWorldPosition(eyePos);
  dir.subVectors(spherePos, eyePos);
  const len = dir.length();
  if (len < 1e-6) {
    laserMesh.visible = false;
    return;
  }
  laserMesh.visible = true;
  // interpolate the position of the laser between the eye and the sphere
  // res = v1 + t * (v2 - v1)
  // t is 0.5, so the position of the laser is in the middle of the eye and the sphere
  laserMesh.position.lerpVectors(eyePos, spherePos, 0.5); 
  laserMesh.scale.set(1, len, 1); // set the scale of the laser
  // set the orientation of the laser
  // the direction of the laser is the direction from the eye to the sphere
  laserMesh.quaternion.setFromUnitVectors(vecY, dir.clone().normalize()); // set the orientation of the laser
}
