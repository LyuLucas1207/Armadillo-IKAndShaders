/*
 * UBC CPSC 314 2025W2
 * Assignment 2
 */

import { setup, loadGLTFAsync, loadOBJAsync } from './js/setup.js';
import * as THREE from './js/three.module.js';
import { SourceLoader } from './js/SourceLoader.js';
import { initModel, traverseSkeleton, cloneGloveWithMaterial } from './src/models/modelHelpers.js';
import { DistanceStore } from './src/game/distance.js';
import { createEye } from './src/models/eyeHelpers.js';
import { GameState } from './src/interface/GameState.js';
import { UI } from './src/interface/UI.js';
import { GameLoop } from './src/GameLoop.js';
import { PhysicsService } from './src/physics/PhysicsService.js';
import { KeyboardController } from './src/input/KeyboardController.js';
import { OrbCollection } from './src/models/OrbCollection.js';
import { OrbManager } from './src/game/OrbManager.js';
import { EffectManager } from './src/game/EffectManager.js';

const { renderer, scene, camera, worldFrame } = setup();

const gameState = new GameState();
const ui = new UI(gameState);

const clock = new THREE.Clock();
const floorY = 0;
const FOREARM_L = 'Forearm_L';
const FOREARM_R = 'Forearm_R';
const WRIST_L = 'Wrist_L';
const WRIST_R = 'Wrist_R';
const gloveScale = 1.4;
const gloveColorMap = new THREE.TextureLoader().load('images/boxing_gloves_texture.png');
const boxingGloveMaterial = new THREE.MeshStandardMaterial({ map: gloveColorMap });
const eyeMaterial = new THREE.ShaderMaterial();
const laserRadius = 0.08;
const laserGeometry = new THREE.CylinderGeometry(laserRadius, laserRadius, 1.0, 16);
const laserMaterial = new THREE.MeshBasicMaterial({ color: 0xff3333, transparent: true, opacity: 0.9 });
const eyeGeometry = new THREE.SphereGeometry(1.0, 32, 32);
const eyeScale = 0.5;

new SourceLoader().load(['glsl/eye.vs.glsl', 'glsl/eye.fs.glsl'], (shaders) => {
  eyeMaterial.vertexShader = shaders['glsl/eye.vs.glsl'];
  eyeMaterial.fragmentShader = shaders['glsl/eye.fs.glsl'];
});

let leftEyeSocket = null;
let rightEyeSocket = null;
(function initEyes() {
  const left = createEye(eyeGeometry, eyeMaterial, eyeScale, { x: -0.9, y: 12.1, z: 2.8 });
  const right = createEye(eyeGeometry, eyeMaterial, eyeScale, { x: 0.9, y: 12.1, z: 2.8 });
  leftEyeSocket = left.socket;
  rightEyeSocket = right.socket;
  scene.add(leftEyeSocket);
  scene.add(rightEyeSocket);
})();

const leftLaser = new THREE.Mesh(laserGeometry, laserMaterial);
const rightLaser = new THREE.Mesh(laserGeometry, laserMaterial);
leftLaser.visible = false;
rightLaser.visible = false;
scene.add(leftLaser);
scene.add(rightLaser);

const eyePos = new THREE.Vector3();
const dirLaser = new THREE.Vector3();
const sphereToArmadilloDist = new DistanceStore(Infinity);

const armadillo = {
  group: null,
  armadillo: null,
  leftEyeSocket: null,
  rightEyeSocket: null,
  leftLaser: null,
  rightLaser: null,
  eyePos,
  dirLaser,
  eyeMaterial: null,
  forearmL: null,
  forearmR: null,
  wristL: null,
  wristR: null,
  clock: null,
  sphereToArmadilloDist: null,
  updatePosition(pos) {
    if (this.group) this.group.position.set(pos.x, pos.y, pos.z);
  },
  resetPosition() {
    if (this.group) {
      this.group.position.set(0, 0, 0);
      this.group.rotation.y = 0;
    }
  },
  markMaterialsForUpdate() {},
};

const orbCollection = new OrbCollection(scene);
orbCollection.reset();

const effectManager = new EffectManager(scene);
const physicsService = new PhysicsService();
const keyboardController = new KeyboardController();
const orbManager = new OrbManager(orbCollection, scene);

const gameLoop = new GameLoop(
  renderer,
  scene,
  camera,
  armadillo,
  keyboardController,
  gameState,
  ui,
  physicsService,
  effectManager,
  orbManager
);

function loadGloves(wristL, wristR, scale, material) {
  loadOBJAsync(['obj/boxing_glove.obj'], (gloveModels) => {
    const t = gloveModels[0];
    if (!t) return;
    const left = cloneGloveWithMaterial(t, material);
    initModel(left, wristL, scale, (box) => ({ x: 0.5, y: 1.0, z: -0.5 }), () => ({ x: 0, y: -Math.PI / 2, z: -Math.PI / 2 }));
    const right = cloneGloveWithMaterial(t, material);
    initModel(right, wristR, -scale, (box) => ({ x: -0.3, y: 1.2, z: -0.5 }), () => ({ x: 0, y: -Math.PI / 2 * 1.6, z: Math.PI / 2 * 0.5 }));
  });
}

loadGLTFAsync(['glb/armadillo.glb'], (gltfModels) => {
  const gltf = gltfModels[0];
  if (!gltf) return;
  const armadilloMesh = gltf.scene;
  const armadilloGroup = new THREE.Group();
  scene.add(armadilloGroup);
  initModel(armadilloMesh, armadilloGroup, 0.1, (box) => ({ x: 0, y: floorY - box.min.y, z: 0 }), () => ({ x: 0, y: -Math.PI, z: 0 }));

  const skeleton = traverseSkeleton(armadilloMesh);
  if (!skeleton) return;
  const forearmL = skeleton.getBoneByName(FOREARM_L);
  const forearmR = skeleton.getBoneByName(FOREARM_R);
  const wristL = skeleton.getBoneByName(WRIST_L);
  const wristR = skeleton.getBoneByName(WRIST_R);
  if (!wristL || !wristR) return;

  loadGloves(wristL, wristR, gloveScale, boxingGloveMaterial);

  armadillo.group = armadilloGroup;
  armadillo.armadillo = armadilloMesh;
  armadillo.leftEyeSocket = leftEyeSocket;
  armadillo.rightEyeSocket = rightEyeSocket;
  armadillo.leftLaser = leftLaser;
  armadillo.rightLaser = rightLaser;
  armadillo.eyeMaterial = eyeMaterial;
  armadillo.forearmL = forearmL;
  armadillo.forearmR = forearmR;
  armadillo.wristL = wristL;
  armadillo.wristR = wristR;
  armadillo.clock = clock;
  armadillo.sphereToArmadilloDist = sphereToArmadilloDist;
});

gameLoop.start();
