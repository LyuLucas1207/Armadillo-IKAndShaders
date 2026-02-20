# A2 Part 2 — Laser Orb Game

## Directory structure (aligned with A1 part 2)

```
part2/
├── A2.html
├── A2.js                 # Entry: setup, game state, UI, Armadillo, OrbCollection, services, GameLoop
├── js/                   # Three.js, setup, loaders, OrbitControls, KeyboardState, etc.
├── glb/                  # glTF armadillo model
├── glsl/                 # Eye shaders
├── obj/                  # Boxing glove OBJ
├── images/               # Textures
├── src/
│   ├── GameLoop.js       # Main loop
│   ├── constants/
│   │   ├── FloorConstants.js   # FLOOR_WIDTH, FLOOR_HEIGHT, FLOOR_HALF
│   │   ├── GameConstants.js    # ORB_COUNT, SCORE_PER_ORB, speeds, laser/lock/growth params
│   │   ├── ModelConstants.js   # Armadillo initial position, eye offsets, bone names
│   │   ├── PhysicsConstants.js # GRAVITY
│   │   └── EffectsConstants.js # Particle count, speed, duration, size
│   ├── interface/
│   │   ├── GameState.js  # Score, collected count, start/victory/game over
│   │   └── UI.js         # Score, timer, progress, Start button, Victory/Game Over
│   ├── input/
│   │   └── KeyboardController.js  # WASD, J/L rotation, space jump
│   ├── physics/
│   │   └── PhysicsService.js  # Gravity, boundary check
│   ├── game/
│   │   ├── distance.js   # DistanceStore, distanceTo
│   │   ├── OrbManager.js # Nearest orb, lock cone (FOV), target marker, laser fire, growth
│   │   └── EffectManager.js  # Particle explosions
│   ├── models/
│   │   ├── modelHelpers.js  # initModel, traverseSkeleton, cloneGloveWithMaterial
│   │   ├── eyeHelpers.js    # createEye, updateOneLaser
│   │   ├── Armadillo.js     # Group, GLTF load, eyes (in group), lasers, skeleton
│   │   └── OrbCollection.js # Orbs with random bounce (per-orb amplitude in [min,max])
│   └── animations/
│       └── ParticleExplosion.js  # create/update/remove particle explosion
└── README.md
```

## How to play

- **Start Game** to begin. **WASD** move the armadillo; **J / L** turn left / right (same as A1 part 2); **Space** jump; **I** fire the eye laser at the **locked** orb (red ring). Locking is only for orbs within range and in a ~160° cone in front of you. The locked orb grows then explodes with particles; destroy all orbs to win. **R** resets. Eyes are updated each frame to follow the armadillo position and rotation.
