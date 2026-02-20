import * as THREE from '../../js/three.module.js';

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

export function updateOneLaser(eyeSocket, laserMesh, spherePos, eyePos, dir) {
  eyeSocket.getWorldPosition(eyePos);
  dir.subVectors(spherePos, eyePos);
  const len = dir.length();
  if (len < 1e-6) {
    laserMesh.visible = false;
    return;
  }
  laserMesh.visible = true;
  laserMesh.position.lerpVectors(eyePos, spherePos, 0.5);
  laserMesh.scale.set(1, len, 1);
  laserMesh.quaternion.setFromUnitVectors(vecY, dir.clone().normalize());
}
