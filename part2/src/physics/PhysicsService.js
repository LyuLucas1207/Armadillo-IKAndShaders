import { GRAVITY } from '../constants/PhysicsConstants.js';
import { FLOOR_WIDTH, FLOOR_HEIGHT } from '../constants/FloorConstants.js';

export class PhysicsService {
  constructor() {
    this.floorBoundary = {
      minX: -FLOOR_WIDTH / 2,
      maxX: FLOOR_WIDTH / 2,
      minZ: -FLOOR_HEIGHT / 2,
      maxZ: FLOOR_HEIGHT / 2,
    };
  }

  applyGravity(position, velocityYRef, isGroundedRef, groundY) {
    velocityYRef.value += GRAVITY;
    position.y += velocityYRef.value;

    if (position.y <= groundY) {
      position.y = groundY;
      velocityYRef.value = 0;
      isGroundedRef.value = true;
    }
  }

  checkBoundary(position) {
    return (
      position.x < this.floorBoundary.minX ||
      position.x > this.floorBoundary.maxX ||
      position.z < this.floorBoundary.minZ ||
      position.z > this.floorBoundary.maxZ
    );
  }
}
