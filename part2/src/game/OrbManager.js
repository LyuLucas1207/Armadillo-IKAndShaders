import * as THREE from '../../js/three.module.js';
import {
  LASER_FIRE_DURATION_MS,
  ORB_GROW_DURATION_MS,
  ORB_GROW_MAX_SCALE,
  LASER_LOCK_MAX_DISTANCE,
  LASER_LOCK_FOV_DEG,
} from '../constants/GameConstants.js';

export class OrbManager {
  constructor(orbCollection, scene) {
    this.orbCollection = orbCollection;
    this.scene = scene;
    this.laserFiring = false;
    this.laserFireEndTime = 0;
    this.laserTargetPos = new THREE.Vector3();
    this.nearestOrbIndex = -1;
    this.armadilloWorldPos = new THREE.Vector3();
    this.distToNearest = Infinity;
    this._forwardDir = new THREE.Vector3();
    this._toOrb = new THREE.Vector3();
    this._axisY = new THREE.Vector3(0, 1, 0);

    const g = new THREE.RingGeometry(1.2, 1.5, 32);
    const m = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
    });
    this.targetMarker = new THREE.Mesh(g, m);
    this.targetMarker.rotation.x = -Math.PI / 2;
    this.targetMarker.position.y = 1.8;
    this.targetMarker.visible = false;
    scene.add(this.targetMarker);
  }

  getOrbs() {
    return this.orbCollection.getOrbs();
  }

  reset() {
    this.orbCollection.reset();
    this.laserFiring = false;
    this.nearestOrbIndex = -1;
  }

  updateOrbBounce(currentTime) {
    const orbs = this.getOrbs();
    const t = currentTime * 0.001;
    const TWO_PI = Math.PI * 2;
    for (let i = 0; i < orbs.length; i++) {
      const o = orbs[i];
      if (o.hitState !== null) continue;
      const phase = o.jumpPhase + t * o.jumpSpeed * TWO_PI;
      const cycle = Math.floor(phase / TWO_PI);
      if (cycle > o.lastJumpCycle) {
        o.currentJumpAmplitude = o.jumpAmplitudeMin + Math.random() * (o.jumpAmplitudeMax - o.jumpAmplitudeMin);
        o.lastJumpCycle = cycle;
      }
      const offset = o.currentJumpAmplitude * Math.abs(Math.sin(phase));
      o.mesh.position.y = o.basePosition.y + offset;
    }
  }

  findNearestAndUpdateMarker(armadilloGroup) {
    const orbs = this.getOrbs();
    if (!armadilloGroup) return;
    armadilloGroup.getWorldPosition(this.armadilloWorldPos);
    this.nearestOrbIndex = -1;
    let minDistSq = Infinity;
    const maxDistSq = LASER_LOCK_MAX_DISTANCE * LASER_LOCK_MAX_DISTANCE;
    const halfFovRad = (LASER_LOCK_FOV_DEG / 2) * (Math.PI / 180);
    const cosHalfFov = Math.cos(halfFovRad);
    this._forwardDir.set(0, 0, 1).applyAxisAngle(this._axisY, armadilloGroup.rotation.y);
    for (let i = 0; i < orbs.length; i++) {
      const o = orbs[i];
      if (o.hitState !== null) continue;
      this._toOrb.set(
        o.mesh.position.x - this.armadilloWorldPos.x,
        o.mesh.position.y - this.armadilloWorldPos.y,
        o.mesh.position.z - this.armadilloWorldPos.z
      );
      const dSq = this._toOrb.lengthSq();
      if (dSq > maxDistSq) continue;
      if (dSq >= 1e-10) this._toOrb.normalize();
      else continue;
      const dot = this._forwardDir.dot(this._toOrb);
      if (dot >= cosHalfFov && dSq < minDistSq) {
        minDistSq = dSq;
        this.nearestOrbIndex = i;
      }
    }
    this.distToNearest = minDistSq === Infinity ? Infinity : Math.sqrt(minDistSq);

    const hasNearest = this.nearestOrbIndex >= 0 && this.distToNearest <= LASER_LOCK_MAX_DISTANCE;
    if (hasNearest) {
      const o = orbs[this.nearestOrbIndex];
      this.targetMarker.visible = true;
      this.targetMarker.position.x = o.mesh.position.x;
      this.targetMarker.position.y = o.mesh.position.y + 0.5;
      this.targetMarker.position.z = o.mesh.position.z;
    } else {
      this.targetMarker.visible = false;
    }
    for (let i = 0; i < orbs.length; i++) {
      orbs[i].material.emissiveIntensity = i === this.nearestOrbIndex && hasNearest ? 1.4 : 0.8;
    }
  }

  tryFireLaser(keyboard) {
    const orbs = this.getOrbs();
    const hasLockedTarget =
      this.nearestOrbIndex >= 0 &&
      this.distToNearest <= LASER_LOCK_MAX_DISTANCE &&
      orbs[this.nearestOrbIndex].hitState === null;
    if (keyboard.pressed('I') && !this.laserFiring && hasLockedTarget) {
      const targetOrb = orbs[this.nearestOrbIndex];
      this.laserFiring = true;
      this.laserFireEndTime = performance.now() + LASER_FIRE_DURATION_MS;
      this.laserTargetPos.copy(targetOrb.mesh.position);
      targetOrb.hitState = 'growing';
      targetOrb.growStartTime = performance.now();
    }
  }

  updateGrowth(currentTime) {
    const collectedEvents = [];
    const orbs = this.getOrbs();
    for (let i = 0; i < orbs.length; i++) {
      const o = orbs[i];
      if (o.hitState !== 'growing') continue;
      const elapsed = currentTime - o.growStartTime;
      const progress = Math.min(elapsed / ORB_GROW_DURATION_MS, 1.0);
      o.scale = 1 + (ORB_GROW_MAX_SCALE - 1) * progress;
      o.mesh.scale.setScalar(o.scale);
      if (progress >= 1.0) {
        const landingPosition = new THREE.Vector3().copy(o.mesh.position);
        o.mesh.visible = false;
        o.hitState = 'exploded';
        collectedEvents.push({ orbData: o, landingPosition });
      }
    }
    return collectedEvents;
  }

  getLaserState(now) {
    if (this.laserFiring && now < this.laserFireEndTime) {
      return { firing: true, targetPos: this.laserTargetPos };
    }
    this.laserFiring = false;
    return { firing: false, targetPos: this.laserTargetPos };
  }

  getDistToNearest() {
    return this.distToNearest;
  }

  getArmadilloWorldPos() {
    return this.armadilloWorldPos;
  }
}
