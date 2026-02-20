import * as THREE from '../../js/three.module.js';
import { loadGLTFAsync, loadOBJAsync } from '../../js/setup.js';
import { initModel, traverseSkeleton, cloneGloveWithMaterial } from './modelHelpers.js';
import { createEye } from './eyeHelpers.js';
import { DistanceStore } from '../game/distance.js';
import { ARMADILLO_INITIAL_POSITION, EYE_OFFSET_LEFT, EYE_OFFSET_RIGHT, FOREARM_L, FOREARM_R, WRIST_L, WRIST_R, GLOVE_SCALE, FLOOR_Y } from '../constants/ModelConstants.js';

export class Armadillo {
  constructor(scene, options = {}) {
    this.scene = scene;
    this.eyeMaterial = options.eyeMaterial || null;
    this.laserGeometry = options.laserGeometry || null;
    this.laserMaterial = options.laserMaterial || null;
    this.boxingGloveMaterial = options.boxingGloveMaterial || null;
    this.eyeGeometry = options.eyeGeometry || new THREE.SphereGeometry(1.0, 32, 32);
    this.eyeScale = options.eyeScale ?? 0.5;
    this.floorY = options.floorY ?? FLOOR_Y;

    this.group = new THREE.Group();
    this.group.position.set(ARMADILLO_INITIAL_POSITION.x, ARMADILLO_INITIAL_POSITION.y, ARMADILLO_INITIAL_POSITION.z);
    this.scene.add(this.group);

    this.armadillo = null;
    this.leftEyeSocket = null;
    this.rightEyeSocket = null;
    this.forearmL = null;
    this.forearmR = null;
    this.wristL = null;
    this.wristR = null;

    this.leftLaser = null;
    this.rightLaser = null;
    if (this.laserGeometry && this.laserMaterial) {
      this.leftLaser = new THREE.Mesh(this.laserGeometry, this.laserMaterial);
      this.rightLaser = new THREE.Mesh(this.laserGeometry, this.laserMaterial);
      this.leftLaser.visible = false;
      this.rightLaser.visible = false;
      this.scene.add(this.leftLaser);
      this.scene.add(this.rightLaser);
    }

    this.eyePos = new THREE.Vector3();
    this.dirLaser = new THREE.Vector3();
    this.clock = new THREE.Clock();
    this.sphereToArmadilloDist = new DistanceStore(Infinity);

    loadGLTFAsync(['glb/armadillo.glb'], (gltfModels) => {
      const gltf = gltfModels[0];
      if (!gltf) return;
      const mesh = gltf.scene;
      this.armadillo = mesh;
      initModel(mesh, this.group, 0.1, (box) => ({ x: 0, y: this.floorY - box.min.y, z: 0 }), () => ({ x: 0, y: -Math.PI, z: 0 }));

      const skeleton = traverseSkeleton(mesh);
      if (!skeleton) return;
      this.forearmL = skeleton.getBoneByName(FOREARM_L);
      this.forearmR = skeleton.getBoneByName(FOREARM_R);
      this.wristL = skeleton.getBoneByName(WRIST_L);
      this.wristR = skeleton.getBoneByName(WRIST_R);
      if (!this.wristL || !this.wristR) return;

      this._loadGloves();

      if (this.eyeMaterial) {
        const left = createEye(this.eyeGeometry, this.eyeMaterial, this.eyeScale, EYE_OFFSET_LEFT);
        const right = createEye(this.eyeGeometry, this.eyeMaterial, this.eyeScale, EYE_OFFSET_RIGHT);
        this.leftEyeSocket = left.socket;
        this.rightEyeSocket = right.socket;
        this.group.add(this.leftEyeSocket);
        this.group.add(this.rightEyeSocket);
      }
    });
  }

  _loadGloves() {
    if (!this.boxingGloveMaterial || !this.wristL || !this.wristR) return;
    loadOBJAsync(['obj/boxing_glove.obj'], (gloveModels) => {
      const t = gloveModels[0];
      if (!t) return;
      const left = cloneGloveWithMaterial(t, this.boxingGloveMaterial);
      initModel(left, this.wristL, GLOVE_SCALE, (box) => ({ x: 0.5, y: 1.0, z: -0.5 }), () => ({ x: 0, y: -Math.PI / 2, z: -Math.PI / 2 }));
      const right = cloneGloveWithMaterial(t, this.boxingGloveMaterial);
      initModel(right, this.wristR, -GLOVE_SCALE, (box) => ({ x: -0.3, y: 1.2, z: -0.5 }), () => ({ x: 0, y: -Math.PI / 2 * 1.6, z: Math.PI / 2 * 0.5 }));
    });
  }

  updatePosition(position) {
    if (this.group) {
      this.group.position.set(position.x, position.y, position.z);
    }
  }

  markMaterialsForUpdate() {
    if (this.eyeMaterial) this.eyeMaterial.needsUpdate = true;
  }

  resetPosition() {
    if (this.group) {
      this.group.position.set(ARMADILLO_INITIAL_POSITION.x, ARMADILLO_INITIAL_POSITION.y, ARMADILLO_INITIAL_POSITION.z);
      this.group.rotation.y = 0;
    }
  }
}
