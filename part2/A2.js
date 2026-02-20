/*
 * UBC CPSC 314 2025W2
 * Assignment 2
 */

import { setup } from './js/setup.js';
import * as THREE from './js/three.module.js';
import { SourceLoader } from './js/SourceLoader.js';
import { GameState } from './src/interface/GameState.js';
import { UI } from './src/interface/UI.js';
import { GameLoop } from './src/GameLoop.js';
import { PhysicsService } from './src/physics/PhysicsService.js';
import { KeyboardController } from './src/input/KeyboardController.js';
import { Armadillo } from './src/models/Armadillo.js';
import { OrbCollection } from './src/models/OrbCollection.js';
import { OrbManager } from './src/game/OrbManager.js';
import { EffectManager } from './src/game/EffectManager.js';

const { renderer, scene, camera } = setup();

const gameState = new GameState();
const ui = new UI(gameState);

const gloveColorMap = new THREE.TextureLoader().load('images/boxing_gloves_texture.png');
const boxingGloveMaterial = new THREE.MeshStandardMaterial({ map: gloveColorMap });
const eyeMaterial = new THREE.ShaderMaterial();
const laserGeometry = new THREE.CylinderGeometry(0.08, 0.08, 1.0, 16);
const laserMaterial = new THREE.MeshBasicMaterial({ color: 0xff3333, transparent: true, opacity: 0.9 });

new SourceLoader().load(['glsl/eye.vs.glsl', 'glsl/eye.fs.glsl'], (shaders) => {
  eyeMaterial.vertexShader = shaders['glsl/eye.vs.glsl'];
  eyeMaterial.fragmentShader = shaders['glsl/eye.fs.glsl'];

  const armadillo = new Armadillo(scene, {
    eyeMaterial,
    laserGeometry,
    laserMaterial,
    boxingGloveMaterial,
    floorY: 0,
  });

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

  gameLoop.start();
});
