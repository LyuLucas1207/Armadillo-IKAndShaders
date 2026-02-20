# A2 Part2 — Laser Orb Game

## 目录结构（与 A1 part2 对齐）

```
part2/
├── A2.html
├── A2.js                 # 入口：setup、创建场景/犰狳/眼球/激光/orbs、GameState/UI/GameLoop
├── js/                   # Three.js、setup、loaders、OrbitControls、KeyboardState 等
├── glb/                  # glTF 犰狳模型
├── glsl/                 # 眼球 shader
├── obj/                  # 拳击手套 OBJ
├── images/               # 贴图
├── src/
│   ├── GameLoop.js       # 主循环
│   ├── constants/
│   │   ├── FloorConstants.js   # FLOOR_WIDTH, FLOOR_HEIGHT, FLOOR_HALF
│   │   ├── GameConstants.js    # ORB_COUNT, SCORE_PER_ORB, 速度/激光/成长参数
│   │   └── EffectsConstants.js # 粒子数量/速度/时长/大小
│   ├── interface/
│   │   ├── GameState.js  # 分数、收集数、开始/胜利/失败
│   │   └── UI.js         # 分数/计时/进度、开始按钮、Victory/Game Over
│   ├── game/
│   │   └── distance.js   # DistanceStore, distanceTo, minDistanceTo
│   ├── models/
│   │   ├── modelHelpers.js  # initModel, traverseSkeleton, cloneGloveWithMaterial
│   │   └── eyeHelpers.js   # createEye, updateOneLaser
│   └── animations/
│       └── ParticleExplosion.js  # create/update/remove 粒子爆炸
└── README.md
```

## 玩法

- **Start Game** 开始；**WASD** 移动犰狳；**J / L** 左转 / 右转（与 A1 part2 一致）；**I** 对当前最近（红色环标记）小球发射激光；小球变大后粒子爆炸，全部消灭即 Victory；**R** 重置。眼睛不挂在模型上，每帧随人物位置与朝向一起更新。
