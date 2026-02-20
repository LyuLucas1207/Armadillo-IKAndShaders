/**
 * UI: score, timer, progress, start button, victory / game over messages.
 */
export class UI {
  constructor(gameState) {
    this.gameState = gameState;
    this.lastUpdateTime = 0;
    this.updateInterval = 50;
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    const startButton = document.getElementById('startButton');
    if (startButton) {
      startButton.addEventListener('click', () => this.startGame());
    }
  }

  updateUI(gameState) {
    const now = performance.now();
    if (now - this.lastUpdateTime < this.updateInterval) return;
    this.lastUpdateTime = now;

    const scoreEl = document.getElementById('scoreValue');
    const collectedEl = document.getElementById('collectedCount');
    const totalEl = document.getElementById('totalCount');
    const timerEl = document.getElementById('timerValue');
    if (scoreEl) scoreEl.textContent = gameState.score;
    if (collectedEl) collectedEl.textContent = gameState.collectedCount;
    if (totalEl) totalEl.textContent = gameState.totalCount;

    if (gameState.isStarted && !gameState.isVictory && !gameState.isGameOver && gameState.startTime) {
      const elapsed = (Date.now() - gameState.startTime - gameState.pausedTime) / 1000;
      if (timerEl) timerEl.textContent = elapsed.toFixed(1);
    } else if (gameState.isVictory && gameState.startTime) {
      const elapsed = (gameState.victoryTime - gameState.startTime - gameState.pausedTime) / 1000;
      if (timerEl) timerEl.textContent = elapsed.toFixed(1);
    } else if (gameState.isGameOver && gameState.startTime) {
      const elapsed = (gameState.gameOverTime - gameState.startTime - gameState.pausedTime) / 1000;
      if (timerEl) timerEl.textContent = elapsed.toFixed(1);
    } else {
      if (timerEl) timerEl.textContent = '0.0';
    }
  }

  startGame() {
    this.gameState.start();
    const btn = document.getElementById('startButton');
    if (btn) btn.classList.add('hidden');
  }

  showVictoryMessage() {
    const el = document.getElementById('victoryMessage');
    if (!el) return;
    if (this.gameState.startTime && this.gameState.victoryTime) {
      const elapsed = (this.gameState.victoryTime - this.gameState.startTime - this.gameState.pausedTime) / 1000;
      el.textContent = `Victory! Time: ${elapsed.toFixed(1)}s\nPress R to Reset`;
    } else {
      el.textContent = 'Victory!\nPress R to Reset';
    }
    el.style.display = 'block';
  }

  hideVictoryMessage() {
    const el = document.getElementById('victoryMessage');
    if (el) el.style.display = 'none';
  }

  showGameOverMessage() {
    const el = document.getElementById('gameOverMessage');
    if (!el) return;
    el.textContent = `Game Over! Score: ${this.gameState.score}\nPress R to Reset`;
    el.style.display = 'block';
  }

  hideGameOverMessage() {
    const el = document.getElementById('gameOverMessage');
    if (el) el.style.display = 'none';
  }

  reset() {
    this.hideVictoryMessage();
    this.hideGameOverMessage();
    const btn = document.getElementById('startButton');
    if (btn) btn.classList.remove('hidden');
  }
}
