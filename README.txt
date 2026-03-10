================================================================================
CPSC 314 Assignment 2 - README
================================================================================

Name:           Lucas Lyu
Student Number: [30349559]
CWL Username:   [clyu05]


--------------------------------------------------------------------------------
HOW TO RUN
--------------------------------------------------------------------------------
- Serve the project from a local web server (do not open the HTML file directly).
  Example: python -m http.server 8000, or use VS Code Live Server.
- Part 1 (core): Open part1/A2.html in the browser.
- Part 2 (feature extension): Open part2/A2.html in the browser.


--------------------------------------------------------------------------------
KEYBOARD ACTIONS & USAGE
--------------------------------------------------------------------------------

Part 1:
  W / S / A / D  - Move the sphere (and Q/E for up/down if implemented).
  Mouse          - Orbit / pan / zoom the camera (if OrbitControls enabled).

Part 2 (Laser Orb Game):
  Start Game     - Click the "Start Game" button to begin.
  W / S / A / D  - Move the armadillo.
  J / L          - Turn the armadillo left / right.
  Space          - Jump.
  I              - Fire the eye laser at the currently locked orb (red ring).
  R              - Reset (when game is over or victory).
  Locking        - Only orbs within a set distance and in a ~160° cone in front
                   of the armadillo can be locked. The locked orb shows a red
                   ring; only that orb can be hit by the laser.
  Goal           - Destroy all orbs (laser hit -> grow -> particle explosion)
                   to win. Falling off the floor applies a score penalty;
                   score below zero is game over.


--------------------------------------------------------------------------------
DIRECTORY STRUCTURE
--------------------------------------------------------------------------------
  part1/   - All parts except the feature extension (a–f).
  part2/   - Feature extension (part g): Laser Orb Game with multiple orbs,
             WASD + jump, laser lock cone, particle explosions, etc.


--------------------------------------------------------------------------------
NOTES FOR THE MARKER
--------------------------------------------------------------------------------
- Part 2 extends the assignment with a full game: multiple orbs with random
  bounce, lock-on within distance and 160° FOV, gravity/jump/boundary like A1
  part 2, and modular structure (Armadillo class, OrbManager, EffectManager,
  PhysicsService, KeyboardController).
- Eyes and armadillo are set up in src/models/ (Armadillo.js); eyes are
  children of the armadillo group so they move and jump with the character.


--------------------------------------------------------------------------------
COLLABORATION & RESOURCES (fill in as required)
--------------------------------------------------------------------------------
People I discussed the assignment with:

Websites / resources I used:

================================================================================
