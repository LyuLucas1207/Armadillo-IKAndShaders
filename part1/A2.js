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
const LaserDistance = 10.0;

// Distance threshold for waving frequency modulation (needed for Part b).
const waveDistance = 10.0;

// Base frequency of armadillo waving its hand (needed for Part b).
const waveFreqBase = 1.0;

// 每帧在 checkKeyboard 里 set、挥手/激光等处 get 的通用距离（Part b / Part e）
const sphereToArmadilloDist = new DistanceStore(Infinity);

// Sphere max size when hit by lasers (needed for Part f).
const sphereMaxSize = 5.0;

// Sphere growth speed (needed for Part f).
const sphereGrowSpeed = 3.5;

// Color transition speed (needed for Part f).
const colorSpeed = 0.8;

// Diffuse texture map (this defines the main colors of the boxing glove)
const gloveColorMap = new THREE.TextureLoader().load('images/boxing_gloves_texture.png');

const boxingGloveMaterial = new THREE.MeshStandardMaterial({
  map: gloveColorMap,
});

const eyeMaterial = new THREE.ShaderMaterial();

// TODO: Create a material for the laser (needed for Part e).
// You can use MeshStandardMaterial like the sphere, or a ShaderMaterial like the eyes.

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

//! part 1 b: Angry Boxing Gloves.
// Forearm bones for hand waving animation (Part b).
let forearmL = null; //中文：左前臂
let forearmR = null; //中文：右前臂
let wristL = null; //中文：左腕
let wristR = null; //中文：右腕

const FOREARM_L = "Forearm_L";
const FOREARM_R = "Forearm_R";
const WRIST_L = "Wrist_L";
const WRIST_R = "Wrist_R";
const gloveScale = 1.4;

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
  initModel(armadillo, scene, 0.1, (box) => ({ x: 0, y: floorY - box.min.y, z: 0 }), (box) => ({ x: 0, y: 0, z: 0 }));
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

const leftEyeSocket = new THREE.Object3D();
const leftEyeSocketPos = new THREE.Vector3(0, 4.0, 0);  // TODO: Adjust position to place on armadillo's face
leftEyeSocket.position.copy(leftEyeSocketPos);

const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
leftEye.scale.copy(new THREE.Vector3(eyeScale, eyeScale, eyeScale));
leftEyeSocket.add(leftEye);

scene.add(leftEyeSocket);

// TODO: Create the right eye similarly and add it to the scene.
// --------------------------------------------------------------------------------------------


// PART D -------------------------------------------------------------------------------------
// Make the eyes look at the sphere
//
// TODO: Create a function to update eye orientations so they look at the sphere.
// HINT: THREE.Object3D has a lookAt() method.
// --------------------------------------------------------------------------------------------


// PART E -------------------------------------------------------------------------------------
// Create laser beams from eyes to sphere
//
// TODO: Create laser geometry and meshes. Attach them to the eyes.
// HINT: THREE.CylinderGeometry can be used for the laser beam shape.
// --------------------------------------------------------------------------------------------


// Listen to keyboard events.
const keyboard = new THREEx.KeyboardState();
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

  // 每帧实时更新小球与犰狳位置，并计算距离（用于 Part b 挥手速度、Part e 激光等）
  sphereLight.position.set(sphereOffset.value.x, sphereOffset.value.y, sphereOffset.value.z);
  sphere.position.set(sphereOffset.value.x, sphereOffset.value.y, sphereOffset.value.z);
  if (armadillo) {
    armadillo.updateMatrixWorld(true);
    const spherePos = new THREE.Vector3(sphereOffset.value.x, sphereOffset.value.y, sphereOffset.value.z);
    sphereToArmadilloDist.set(distanceTo(spherePos, armadillo));
  }

  // TODO: Calculate distance from eyes to sphere for laser activation (Part e).

  // TODO: Update laser visibility and scale based on distance (Part e).

  // TODO: Update sphere size and color when hit by lasers (Part f).
  // HINT: Use THREE.Color.lerp() to interpolate between colors.

  // The following tells three.js that some uniforms might have changed.
  sphereMaterial.needsUpdate = true;
  eyeMaterial.needsUpdate = true;

  // TODO: Call your eye update function here to make eyes track the sphere (Part d).
}


// Setup update callback
function update()
{
  checkKeyboard();

  //! part 1 b: Angry Boxing Gloves — 用 DistanceStore.get()，球越近挥得越快（放大频率差异使变化更明显）
  if (forearmL && forearmR && wristL && wristR) {
    const dist = sphereToArmadilloDist.get();
    console.log( "dist: ", dist);
    // frequency from 1x to 6x, change very fast when close
    // if dist > waveDistance, t = 0, if dist < waveDistance, t = 1 - dist / waveDistance
    // angle = 2 * Math.PI * frequency * time; frequency = waveFreqBase * (1 + 5 * (Math.max(0, 1 - dist / waveDistance)))
    const angle = 2 * Math.PI * (waveFreqBase * (1 + 3 * (Math.max(0, 1 - dist / waveDistance)))) * clock.getElapsedTime();
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
