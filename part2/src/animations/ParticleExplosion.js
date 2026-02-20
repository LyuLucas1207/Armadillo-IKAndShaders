import * as THREE from '../../js/three.module.js';
import { PARTICLE_COUNT, PARTICLE_SPEED, PARTICLE_DURATION, PARTICLE_SIZE } from '../constants/EffectsConstants.js';

export function createParticleExplosion(position, color, parent) {
  const initialPositions = [];
  const velocities = [];
  const geometry = new THREE.BufferGeometry();

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const direction = new THREE.Vector3(
      Math.sin(phi) * Math.cos(theta),
      Math.sin(phi) * Math.sin(theta),
      Math.cos(phi)
    );
    const speed = PARTICLE_SPEED * (0.5 + Math.random());
    direction.multiplyScalar(speed);
    const offsetRadius = 0.1;
    initialPositions.push(
      position.x + (Math.random() - 0.5) * offsetRadius,
      position.y + (Math.random() - 0.5) * offsetRadius,
      position.z + (Math.random() - 0.5) * offsetRadius
    );
    velocities.push(direction.clone());
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(initialPositions, 3));
  const material = new THREE.PointsMaterial({
    color: color || new THREE.Color(1, 1, 0),
    size: PARTICLE_SIZE,
    transparent: true,
    opacity: 1.0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const particleSystem = new THREE.Points(geometry, material);
  parent.add(particleSystem);

  return {
    particles: particleSystem,
    initialPositions,
    velocities,
    startTime: performance.now(),
    isComplete: false,
    duration: PARTICLE_DURATION,
  };
}

export function updateParticleExplosion(particleData, currentTime) {
  if (particleData.isComplete) return true;
  const elapsed = currentTime - particleData.startTime;
  const progress = Math.min(elapsed / particleData.duration, 1.0);
  if (progress >= 1.0) {
    particleData.isComplete = true;
    return true;
  }
  const positions = particleData.particles.geometry.attributes.position.array;
  const totalTime = elapsed * 0.001;
  for (let i = 0; i < particleData.velocities.length; i++) {
    const v = particleData.velocities[i];
    const ii = i * 3;
    positions[ii] = particleData.initialPositions[ii] + v.x * totalTime;
    positions[ii + 1] = particleData.initialPositions[ii + 1] + v.y * totalTime;
    positions[ii + 2] = particleData.initialPositions[ii + 2] + v.z * totalTime;
  }
  particleData.particles.geometry.attributes.position.needsUpdate = true;
  particleData.particles.material.opacity = Math.exp(-progress * progress * 3.0);
  return false;
}

export function removeParticleExplosion(particleData) {
  if (particleData.particles.parent)
    particleData.particles.parent.remove(particleData.particles);
  particleData.particles.geometry.dispose();
  particleData.particles.material.dispose();
}
