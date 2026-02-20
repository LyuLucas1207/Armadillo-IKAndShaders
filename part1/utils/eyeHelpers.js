/*
 * UBC CPSC 314 2025W2
 * Assignment 2 — Eye creation and laser update helpers.
 */

import * as THREE from '../js/three.module.js';

/**
 * Creates one eye: an Object3D socket with a child mesh for placement in the scene.
 * @param {THREE.BufferGeometry} geometry - Eye geometry
 * @param {THREE.Material} material - Eye material
 * @param {number} scale - Scale factor
 * @param {{x: number, y: number, z: number}} position - Position of the socket
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
 * Updates one eye laser: from eyeSocket toward spherePos; sets laserMesh position, length, and orientation.
 * Reuses eyePos and dir to avoid per-frame allocation; hides laser if eye and sphere are nearly coincident (len < 1e-6).
 * @param {THREE.Object3D} eyeSocket - Eye socket (world position is used)
 * @param {THREE.Mesh} laserMesh - Laser mesh (CylinderGeometry height 1, aligned to Y)
 * @param {THREE.Vector3} spherePos - Sphere position in world space
 * @param {THREE.Vector3} eyePos - Scratch vector for eye world position
 * @param {THREE.Vector3} dir - Scratch vector for eye-to-sphere direction
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
