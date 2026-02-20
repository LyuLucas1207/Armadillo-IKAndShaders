import {
  createParticleExplosion,
  updateParticleExplosion,
  removeParticleExplosion,
} from '../animations/ParticleExplosion.js';

export class EffectManager {
  constructor(scene) {
    this.scene = scene;
    this.activeParticles = [];
  }

  startAnimation(orbData, landingPosition) {
    const pos = landingPosition || orbData.mesh.position;
    const color = orbData.color || orbData.mesh.material.emissive;
    const data = createParticleExplosion(pos, color, this.scene);
    this.activeParticles.push(data);
  }

  updateEffects(currentTime) {
    for (let j = this.activeParticles.length - 1; j >= 0; j--) {
      const done = updateParticleExplosion(this.activeParticles[j], currentTime);
      if (done) {
        removeParticleExplosion(this.activeParticles[j]);
        this.activeParticles.splice(j, 1);
      }
    }
  }

  cleanupActiveEffects() {
    this.activeParticles.forEach((pd) => removeParticleExplosion(pd));
    this.activeParticles.length = 0;
  }
}
