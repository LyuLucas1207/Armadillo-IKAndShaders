import * as THREE from '../js/three.module.js';
import { updateOneLaser } from './models/eyeHelpers.js';

const WAVE_DISTANCE = 12.0;
const WAVE_FREQ_BASE = 1.0;
const WAVE_AMPLITUDE = 0.6;

export class GameLoop {
  constructor(
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
  ) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.armadillo = armadillo;
    this.keyboardController = keyboardController;
    this.gameState = gameState;
    this.ui = ui;
    this.physicsService = physicsService;
    this.effectManager = effectManager;
    this.orbManager = orbManager;
  }

  handleResetKey() {
    if (
      (this.gameState.isVictory || this.gameState.isGameOver) &&
      this.keyboardController.keyboard.pressed('R')
    ) {
      this.effectManager.cleanupActiveEffects();
      this.ui.reset();
      this.keyboardController.reset();
      this.armadillo.resetPosition();
      this.orbManager.reset();
      this.gameState.reset();
    }
  }

  handleCollectionEvents(collectedEvents) {
    collectedEvents.forEach(({ orbData, landingPosition }) => {
      this.effectManager.startAnimation(orbData, landingPosition);
      if (this.gameState.collectOrb()) this.ui.showVictoryMessage();
    });
  }

  update() {
    this.renderer.render(this.scene, this.camera);
    this.ui.updateUI(this.gameState);
    this.handleResetKey();

    const now = performance.now();
    const k = this.keyboardController;
    const physics = this.physicsService;
    const arm = this.armadillo;
    const orbs = this.orbManager.getOrbs();

    if (
      this.gameState.isStarted &&
      !this.gameState.isVictory &&
      !this.gameState.isGameOver
    ) {
      let pos = null;
      if (arm.group) {
        k.checkKeyboard();
        k.handleRotation(arm.group);
        pos = k.getArmadilloPosition();
        physics.applyGravity(pos, k.getVelocityYRef(), k.getIsGroundedRef(), k.getBaseY());
        if (physics.checkBoundary(pos)) {
          k.reset();
          arm.resetPosition();
          if (this.gameState.applyBoundaryPenalty()) this.ui.showGameOverMessage();
        }
        k.syncToGroup(arm.group);
      }

      if (arm.armadillo) arm.armadillo.updateMatrixWorld(true);
      this.scene.updateMatrixWorld(true);

      this.orbManager.updateOrbBounce(now);
      this.orbManager.findNearestAndUpdateMarker(arm.group);
      if (arm.sphereToArmadilloDist) arm.sphereToArmadilloDist.set(this.orbManager.getDistToNearest());
      this.orbManager.tryFireLaser(k.keyboard);
      const collectedEvents = this.orbManager.updateGrowth(now);
      this.handleCollectionEvents(collectedEvents);
      this.effectManager.updateEffects(now);

      const laserState = this.orbManager.getLaserState(now);
      if (arm.leftEyeSocket && arm.rightEyeSocket && arm.leftLaser && arm.rightLaser) {
        this.scene.updateMatrixWorld(true);
        if (laserState.firing) {
          updateOneLaser(arm.leftEyeSocket, arm.leftLaser, laserState.targetPos, arm.eyePos, arm.dirLaser);
          updateOneLaser(arm.rightEyeSocket, arm.rightLaser, laserState.targetPos, arm.eyePos, arm.dirLaser);
        } else {
          arm.leftLaser.visible = false;
          arm.rightLaser.visible = false;
        }
      }
      if (arm.eyeMaterial) arm.eyeMaterial.needsUpdate = true;

      if (arm.leftEyeSocket && arm.rightEyeSocket) {
        const nearestIdx = this.orbManager.nearestOrbIndex;
        if (nearestIdx >= 0 && orbs[nearestIdx] && orbs[nearestIdx].hitState === null) {
          const p = orbs[nearestIdx].mesh.position;
          arm.leftEyeSocket.lookAt(new THREE.Vector3(p.x, p.y, p.z));
          arm.rightEyeSocket.lookAt(new THREE.Vector3(p.x, p.y, p.z));
        } else {
          const worldPos = this.orbManager.getArmadilloWorldPos();
          const front = worldPos.clone().add(new THREE.Vector3(0, 0, -5));
          arm.leftEyeSocket.lookAt(front);
          arm.rightEyeSocket.lookAt(front);
        }
      }

      if (arm.forearmL && arm.forearmR && arm.wristL && arm.wristR && arm.clock && arm.sphereToArmadilloDist) {
        const dist = arm.sphereToArmadilloDist ? arm.sphereToArmadilloDist.get() : Infinity;
        const t = Math.max(0, 1 - dist / WAVE_DISTANCE);
        const angle = 2 * Math.PI * WAVE_FREQ_BASE * (1 + 5 * t) * arm.clock.getElapsedTime();
        arm.wristL.rotation.z = WAVE_AMPLITUDE * Math.sin(angle);
        arm.forearmL.rotation.z = WAVE_AMPLITUDE * Math.sin(angle);
        arm.forearmR.rotation.z = WAVE_AMPLITUDE * Math.sin(angle);
      }
    } else {
      this.orbManager.targetMarker.visible = false;
      this.effectManager.updateEffects(now);
    }

    requestAnimationFrame(() => this.update());
  }

  start() {
    this.update();
  }
}
