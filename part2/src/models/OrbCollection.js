import * as THREE from '../../js/three.module.js';
import { FLOOR_HALF } from '../constants/FloorConstants.js';
import { ORB_COUNT } from '../constants/GameConstants.js';

const ORB_COLORS = [0xffff00, 0xff6600, 0xff0088, 0x00ff88, 0x0088ff];
const GEOMETRY = new THREE.SphereGeometry(1.0, 32, 32);

export class OrbCollection {
  constructor(scene) {
    this.scene = scene;
    this.orbs = [];
  }

  getOrbs() {
    return this.orbs;
  }

  reset() {
    this.orbs.forEach((o) => {
      this.scene.remove(o.mesh);
      o.mesh.geometry.dispose();
      o.mesh.material.dispose();
    });
    this.orbs.length = 0;
    for (let i = 0; i < ORB_COUNT; i++) {
      const x = (Math.random() * 2 - 1) * FLOOR_HALF;
      const z = (Math.random() * 2 - 1) * FLOOR_HALF;
      const color = new THREE.Color(ORB_COLORS[i % ORB_COLORS.length]);
      const material = new THREE.MeshStandardMaterial({
        emissive: color.clone(),
        emissiveIntensity: 0.8,
      });
      const mesh = new THREE.Mesh(GEOMETRY.clone(), material);
      mesh.position.set(x, 1.0, z);
      this.scene.add(mesh);
      this.orbs.push({
        mesh,
        material,
        basePosition: new THREE.Vector3(x, 1.0, z),
        scale: 1.0,
        hitState: null,
        growStartTime: 0,
        color,
      });
    }
  }
}
