import { THREEx } from '../../js/KeyboardState.js';
import {
  ARMADILLO_MOVE_SPEED,
  ROTATION_SPEED,
  JUMP_FORCE,
} from '../constants/GameConstants.js';

const BASE_Y = 0;

export class KeyboardController {
  constructor() {
    this.keyboard = new THREEx.KeyboardState();
    this.moveSpeed = ARMADILLO_MOVE_SPEED;
    this.rotationSpeed = ROTATION_SPEED;
    this.jumpForce = JUMP_FORCE;
    this.baseY = BASE_Y;
    this.armadilloPosition = { x: 0, y: BASE_Y, z: 0 };
    this.velocityYRef = { value: 0 };
    this.isGroundedRef = { value: true };
  }

  handleMovement() {
    if (this.keyboard.pressed('W')) this.armadilloPosition.z -= this.moveSpeed;
    else if (this.keyboard.pressed('S')) this.armadilloPosition.z += this.moveSpeed;
    if (this.keyboard.pressed('A')) this.armadilloPosition.x -= this.moveSpeed;
    else if (this.keyboard.pressed('D')) this.armadilloPosition.x += this.moveSpeed;
  }

  handleRotation(armadilloGroup) {
    if (!armadilloGroup) return;
    if (this.keyboard.pressed('J')) armadilloGroup.rotation.y -= this.rotationSpeed;
    else if (this.keyboard.pressed('L')) armadilloGroup.rotation.y += this.rotationSpeed;
  }

  handleJump() {
    if (this.keyboard.pressed(' ') && this.isGroundedRef.value) {
      this.velocityYRef.value = this.jumpForce;
      this.isGroundedRef.value = false;
    }
  }

  checkKeyboard() {
    this.handleMovement();
    this.handleJump();
  }

  reset() {
    this.armadilloPosition.x = 0;
    this.armadilloPosition.y = this.baseY;
    this.armadilloPosition.z = 0;
    this.velocityYRef.value = 0;
    this.isGroundedRef.value = true;
  }

  getArmadilloPosition() {
    return this.armadilloPosition;
  }

  getVelocityYRef() {
    return this.velocityYRef;
  }

  getIsGroundedRef() {
    return this.isGroundedRef;
  }

  getBaseY() {
    return this.baseY;
  }

  syncToGroup(armadilloGroup) {
    if (!armadilloGroup) return;
    armadilloGroup.position.set(
      this.armadilloPosition.x,
      this.armadilloPosition.y,
      this.armadilloPosition.z
    );
  }
}
