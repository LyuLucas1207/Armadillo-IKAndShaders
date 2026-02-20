import { ORB_COUNT, SCORE_PER_ORB, BOUNDARY_PENALTY } from '../constants/GameConstants.js';

export class GameState {
  constructor() {
    this.score = 0;
    this.collectedCount = 0;
    this.totalCount = ORB_COUNT;
    this.startTime = null;
    this.pausedTime = 0;
    this.isStarted = false;
    this.isVictory = false;
    this.isGameOver = false;
    this.victoryTime = null;
    this.gameOverTime = null;
  }

  collectOrb() {
    this.collectedCount++;
    this.score += SCORE_PER_ORB;
    if (this.collectedCount >= this.totalCount) {
      this.isVictory = true;
      this.victoryTime = Date.now();
      return true;
    }
    return false;
  }

  applyBoundaryPenalty() {
    this.score -= BOUNDARY_PENALTY;
    if (this.score < 0) {
      this.isGameOver = true;
      this.gameOverTime = Date.now();
      return true;
    }
    return false;
  }

  start() {
    if (!this.isStarted) {
      this.isStarted = true;
      this.startTime = Date.now();
      this.pausedTime = 0;
    }
  }

  reset() {
    this.score = 0;
    this.collectedCount = 0;
    this.startTime = null;
    this.pausedTime = 0;
    this.isStarted = false;
    this.isVictory = false;
    this.isGameOver = false;
    this.victoryTime = null;
    this.gameOverTime = null;
  }
}
