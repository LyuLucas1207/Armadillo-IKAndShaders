/*
 * UBC CPSC 314 2025W2
 * Assignment 2 Template
 */

import { setup, loadGLTFAsync, loadOBJAsync } from './js/setup.js';
import * as THREE from './js/three.module.js';
import { SourceLoader } from './js/SourceLoader.js';
import { THREEx } from './js/KeyboardState.js';
import { initModel, traverseSkeleton, cloneGloveWithMaterial } from './utils/modelHelpers.js';
import { distanceTo, DistanceStore } from './utils/distance.js';
import { createEye, updateOneLaser } from './utils/eyeHelpers.js';

// Setup and return the scene and related objects.
// You should look into js/setup.js to see what exactly is done here.
const {
  renderer,
  scene,
  camera,
  worldFrame,
} = setup();

// Used THREE.Clock for animation
var clock = new THREE.Clock();

/////////////////////////////////
//   YOUR WORK STARTS BELOW    //
/////////////////////////////////

// Initialize uniforms

// As in A1 we position the sphere in the world solely using this uniform
// So the initial y-offset being 1.0 here is intended.
const sphereOffset = { type: 'v3', value: new THREE.Vector3(0.0, 1.0, 0.0) };

// The following constants are provided as reference values. Feel free to adjust them.
// Distance threshold beyond which the armadillo should shoot lasers at the sphere (needed for Part e).
const LaserDistance = 15.0;

// Distance threshold for waving frequency modulation (needed for Part b).
const waveDistance = 12.0;

// Base frequency of armadillo waving its hand (needed for Part b).
const waveFreqBase = 1.0;

//! part 1 b: Angry Boxing Gloves
const sphereToArmadilloDist = new DistanceStore(Infinity);
//! part 1 e: Laser eyes
const sphereToLeftEyeDist = new DistanceStore(Infinity);
//! part 1 e: Laser eyes
const sphereToRightEyeDist = new DistanceStore(Infinity);


// Sphere max size when hit by lasers (needed for Part f).
const sphereMaxSize = 5.0;

// Sphere growth speed (needed for Part f).
const sphereGrowSpeed = 3.5;

// Color transition speed (needed for Part f).
const colorSpeed = 0.8;

//! part 1 f: Grow the ball
const sphereBaseColor = new THREE.Color(0xffff00);
const sphereHitColor = new THREE.Color(0xff6600);
let sphereScale = 1.0;

// Diffuse texture map (this defines the main colors of the boxing glove)
const gloveColorMap = new THREE.TextureLoader().load('images/boxing_gloves_texture.png');

const boxingGloveMaterial = new THREE.MeshStandardMaterial({
  map: gloveColorMap,
});

const eyeMaterial = new THREE.ShaderMaterial();

//! part 1 e: Laser eyes
const laserRadius = 0.08;
const laserGeometry = new THREE.CylinderGeometry(laserRadius, laserRadius, 1.0, 16);
const laserMaterial = new THREE.MeshBasicMaterial({
  color: 0xff3333,
  transparent: true,
  opacity: 0.9,
});
//! part 1 e: Laser eyes

// Load shaders.
const shaderFiles = [
  'glsl/eye.vs.glsl',
  'glsl/eye.fs.glsl',
];

new SourceLoader().load(shaderFiles, function (shaders)
{
  eyeMaterial.vertexShader = shaders['glsl/eye.vs.glsl'];
  eyeMaterial.fragmentShader = shaders['glsl/eye.fs.glsl'];
});

// PART A & B ---------------------------------------------------------------------------------
// Load Armadillo Model in GLTF format and attach Boxing Gloves
//
// Armadillo (glTF) — loaded in post-loading callback; reference kept for later parts.
//! part 1 a: Load the glTF armadillo model.
let armadillo = null;
const floorY = -0.0;  // same as floor.position.y in setup.js

//! part 1 a: Load the glTF armadillo model.

// Forearm and wrist bones for hand waving animation (Part b).
let forearmL = null;
let forearmR = null;
let wristL = null;
let wristR = null;

const FOREARM_L = "Forearm_L";
const FOREARM_R = "Forearm_R";
const WRIST_L = "Wrist_L";
const WRIST_R = "Wrist_R";
const gloveScale = 1.4;

/**
 * Loads boxing gloves from OBJ and attaches them to the given wrist bones.
 * @param {THREE.Bone} wristL - Left wrist bone
 * @param {THREE.Bone} wristR - Right wrist bone
 * @param {number} gloveScale - Scale for the gloves
 * @param {THREE.Material} material - Material for the gloves
 */
function loadGloves(wristL, wristR, gloveScale, material)
{
  loadOBJAsync(['obj/boxing_glove.obj'], function (gloveModels)
  {
    const gloveTemplate = gloveModels[0];
    if (!gloveTemplate) return;
    const leftGlove = cloneGloveWithMaterial(gloveTemplate, material);
    initModel(leftGlove, wristL, gloveScale, (box) => ({ x: 0.5, y: 1.0, z: -0.5 }), () => ({ x: 0, y: -Math.PI / 2, z: -Math.PI / 2 * 1 }));
    const rightGlove = cloneGloveWithMaterial(gloveTemplate, material);
    initModel(rightGlove, wristR, -gloveScale, (box) => ({ x: -0.3, y: 1.2, z: -0.5 }), () => ({ x: 0, y: -Math.PI / 2 * 1.6, z: Math.PI / 2 * 0.5 }));
  });
}
//! part 1 b: Angry Boxing Gloves.

loadGLTFAsync(['glb/armadillo.glb'], function (gltfModels)
{
  //! part 1 a: Load the glTF armadillo model.
  const gltf = gltfModels[0];
  if (!gltf) return;
  armadillo = gltf.scene;
  initModel(armadillo, scene, 0.1, (box) => ({ x: 0, y: floorY - box.min.y, z: 0 }), (b) => ({ x: 0, y: -Math.PI, z: 0 }));
  //! part 1 a: Load the glTF armadillo model.

  //! part 1 b: Angry Boxing Gloves.
  // based on the skeleton, get the forearm and wrist bones
  let skeleton = traverseSkeleton(armadillo);
  if (!skeleton) return;
  forearmL = skeleton.getBoneByName(FOREARM_L);
  forearmR = skeleton.getBoneByName(FOREARM_R);
  wristL = skeleton.getBoneByName(WRIST_L);
  wristR = skeleton.getBoneByName(WRIST_R);
  if (!wristL || !wristR) return;

  // Load boxing gloves and attach to wrists.
  loadGloves(wristL, wristR, gloveScale, boxingGloveMaterial);
  //! part 1 b: Angry Boxing Gloves.
});
// --------------------------------------------------------------------------------------------


// https://threejs.org/docs/#api/en/geometries/SphereGeometry
const sphereGeometry = new THREE.SphereGeometry(1.0, 32.0, 32.0);
const sphereMaterial = new THREE.MeshStandardMaterial({
  emissive: new THREE.Color(0xffff00),    // add self-emission (yellow)
  emissiveIntensity: 1.0
});
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
scene.add(sphere);

const sphereLight = new THREE.PointLight(0xffffff, 50.0, 100);
scene.add(sphereLight);

// PART C -------------------------------------------------------------------------------------
// Create eye balls and place on the armadillo
//
// Create an eye ball (left eye provided as example)
// HINT: Create two eye ball meshes from the same geometry.
const eyeGeometry = new THREE.SphereGeometry(1.0, 32, 32);
const eyeScale = 0.5;

//! part 1 c: Armadillos have Eyes.
const { socket: leftEyeSocket } = createEye(eyeGeometry, eyeMaterial, eyeScale, { x: -0.9, y: 12.1, z: 2.8 });
scene.add(leftEyeSocket);
const { socket: rightEyeSocket } = createEye(eyeGeometry, eyeMaterial, eyeScale, { x: 0.9, y: 12.1, z: 2.8 });
scene.add(rightEyeSocket);
//! part 1 c: Armadillos have Eyes.
// --------------------------------------------------------------------------------------------


// PART D -------------------------------------------------------------------------------------
/**
 * Orients both eyes to look at the given target position.
 * @param {THREE.Vector3} targetPosition - World-space position to look at
 */
function updateEyesLookAt(targetPosition)
{
  leftEyeSocket.lookAt(targetPosition);
  rightEyeSocket.lookAt(targetPosition);
}
//! part 1 d: Staring at the sphere
// --------------------------------------------------------------------------------------------


// PART E -------------------------------------------------------------------------------------
// Two lasers from eyes to sphere (world-space length and orientation).
const leftLaser = new THREE.Mesh(laserGeometry, laserMaterial);
const rightLaser = new THREE.Mesh(laserGeometry, laserMaterial);
leftLaser.visible = false;
rightLaser.visible = false;
scene.add(leftLaser);
scene.add(rightLaser);

const eyePos = new THREE.Vector3();
const spherePosLaser = new THREE.Vector3();
const dirLaser = new THREE.Vector3();

/**
 * Updates laser visibility and geometry: draws lasers from eyes to sphere when within LaserDistance.
 */
function updateLasers()
{
  scene.updateMatrixWorld(true);
  spherePosLaser.copy(sphereOffset.value); // get the world position of the sphere

  const distToLeftEye = sphereToLeftEyeDist.get();
  if (distToLeftEye < LaserDistance) {
    updateOneLaser(leftEyeSocket, leftLaser, spherePosLaser, eyePos, dirLaser);
  } else {
    leftLaser.visible = false;
  }

  const distToRightEye = sphereToRightEyeDist.get();
  if (distToRightEye < LaserDistance) {
    updateOneLaser(rightEyeSocket, rightLaser, spherePosLaser, eyePos, dirLaser);
  } else {
    rightLaser.visible = false;
  }
}
//! part 1 e: Laser eyes — two lasers from eyes to sphere (world-space length and orientation).
// --------------------------------------------------------------------------------------------


// Listen to keyboard events.
const keyboard = new THREEx.KeyboardState();

/**
 * Handles keyboard input: moves sphere (WASD, Q/E), updates distances for waving and lasers, updates laser state, sphere growth, and eye lookAt.
 */
function checkKeyboard()
{
  if (keyboard.pressed("W"))
    sphereOffset.value.z -= 0.1;
  else if (keyboard.pressed("S"))
    sphereOffset.value.z += 0.1;

  if (keyboard.pressed("A"))
    sphereOffset.value.x -= 0.1;
  else if (keyboard.pressed("D"))
    sphereOffset.value.x += 0.1;

  if (keyboard.pressed("E"))
    sphereOffset.value.y -= 0.1;
  else if (keyboard.pressed("Q"))
    sphereOffset.value.y += 0.1;

  // Update sphere and armadillo positions each frame and compute distances (for Part b waving speed, Part e lasers, etc.)
  sphereLight.position.set(sphereOffset.value.x, sphereOffset.value.y, sphereOffset.value.z);
  sphere.position.set(sphereOffset.value.x, sphereOffset.value.y, sphereOffset.value.z);
  if (armadillo) {
    armadillo.updateMatrixWorld(true);
    const spherePos = new THREE.Vector3(sphereOffset.value.x, sphereOffset.value.y, sphereOffset.value.z);
    sphereToArmadilloDist.set(distanceTo(spherePos, armadillo));
  }

  //! part 1 e: Laser eyes
  updateLasers();
  const spherePosForEyes = new THREE.Vector3(sphereOffset.value.x, sphereOffset.value.y, sphereOffset.value.z);
  sphereToLeftEyeDist.set(distanceTo(spherePosForEyes, leftEyeSocket));
  sphereToRightEyeDist.set(distanceTo(spherePosForEyes, rightEyeSocket));
  //! part 1 e: Laser eyes

  //! part 1 f: Grow the ball
  const isHitByLaser = leftLaser.visible || rightLaser.visible;
  // get the delta time, clock.getDelta() is the time since the last frame
  const dt = Math.min(clock.getDelta(), 0.1);
  if (isHitByLaser) {
    sphereScale = Math.min(sphereMaxSize, sphereScale + sphereGrowSpeed * dt);
    sphereMaterial.emissive.lerp(sphereHitColor, colorSpeed * dt);
  } else {
    sphereScale = Math.max(1.0, sphereScale - sphereGrowSpeed * dt);
    sphereMaterial.emissive.lerp(sphereBaseColor, colorSpeed * dt);
  }
  sphere.scale.setScalar(sphereScale);
  //! part 1 f: Grow the ball

  // The following tells three.js that some uniforms might have changed.
  sphereMaterial.needsUpdate = true;
  eyeMaterial.needsUpdate = true;

  //! part 1 d: Staring at the sphere
  // sphereOffset.value is THREE.Vector3; convert to Vector3 for lookAt
  const spherePosition = new THREE.Vector3(sphereOffset.value.x, sphereOffset.value.y, sphereOffset.value.z);
  updateEyesLookAt(spherePosition);
  //! part 1 d: Staring at the sphere
}


/**
 * Main update loop: keyboard, hand waving (frequency increases as sphere gets closer), render.
 */
function update()
{
  checkKeyboard();

  //! part 1 b: Angry Boxing Gloves — use DistanceStore.get(); wave faster as sphere gets closer.
  if (forearmL && forearmR && wristL && wristR) {
    const dist = sphereToArmadilloDist.get();
    // frequency from 1x to 6x, change very fast when close
    // if dist > waveDistance, t = 0, if dist < waveDistance, t = 1 - dist / waveDistance
    // angle = 2 * Math.PI * frequency * time; frequency = waveFreqBase * (1 + 5 * (Math.max(0, 1 - dist / waveDistance)))
    const angle = 2 * Math.PI * (waveFreqBase * (1 + 5 * (Math.max(0, 1 - dist / waveDistance)))) * clock.getElapsedTime();
    const amplitude = 0.6;
    wristL.rotation.z = amplitude * Math.sin(angle);
    forearmL.rotation.z = amplitude * Math.sin(angle);
    forearmR.rotation.z = amplitude * Math.sin(angle);
  }
  //! part 1 b: Angry Boxing Gloves.

  // Requests the next update call, this creates a loop
  requestAnimationFrame(update);
  renderer.render(scene, camera);
}

// Start the animation loop.
update();
