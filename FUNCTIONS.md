# Dream Kite - Functions Documentation

This document tracks all major functions in the Dream Kite game. It will be updated as the project progresses.

## Game Core (game.js)

| Function | Purpose | Parameters | Return | Location |
|----------|---------|------------|--------|----------|
| initGame | Initialize game environment, physics, and scene | None | None | game.js |
| setupScene | Create ThreeJS scene, camera, and renderer | None | Object with scene, camera, renderer | game.js |
| setupPhysics | Initialize CannonJS world and physics properties | None | Physics world object | game.js |
| gameLoop | Main game loop that updates physics and renders frames | timestamp (number) | None | game.js |
| handleCollisions | Detect and process collisions between objects | None | None | game.js |
| resetGame | Reset game state for a new game | None | None | game.js |

## Kite (kite.js)

| Function | Purpose | Parameters | Return | Location |
|----------|---------|------------|--------|----------|
| createKite | Create kite mesh and physics body | position (Vector3) | Kite object | kite.js |
| updateKite | Update kite physics and mesh position | deltaTime (number) | None | kite.js |
| applyWindForce | Apply wind force to the kite | windVector (Vector3) | None | kite.js |

## String (string.js)

| Function | Purpose | Parameters | Return | Location |
|----------|---------|------------|--------|----------|
| createString | Create string physics constraint and visual line | startPoint (Vector3), endPoint (Vector3) | String object | string.js |
| updateStringTension | Calculate and update string tension based on distance and forces | None | Tension value (number) | string.js |
| damageString | Reduce string health based on tension or collision | damageAmount (number) | New health value (number) | string.js |
| repairString | Increase string health from collecting dream sparks | repairAmount (number) | New health value (number) | string.js |

## Controls (controls.js)

| Function | Purpose | Parameters | Return | Location |
|----------|---------|------------|--------|----------|
| setupDesktopControls | Initialize mouse and keyboard controls | None | Control handlers object | controls.js |
| setupMobileControls | Initialize NippleJS touch controls | None | Control handlers object | controls.js |
| handleTugInput | Process player input into string tension | inputVector (Vector2) | None | controls.js |

## Procedural Generation (dreamscape.js, etc.)

| Function | Purpose | Parameters | Return | Location |
|----------|---------|------------|--------|----------|
| generateDreamscape | Create base environment using current theme | theme (string) | Scene objects | dreamscape.js |
| transitionTheme | Smoothly transition between dreamscape themes | newTheme (string), duration (number) | None | dreamscape.js |
| generateWindPattern | Create procedural wind with varying direction and strength | complexity (number) | Wind vector | wind.js |
| generateObstacles | Create obstacles appropriate for current theme | count (number), complexity (number) | Array of obstacles | obstacles.js |
| generateSparks | Create collectible dream sparks | count (number), difficulty (number) | Array of sparks | sparks.js |

## UI (score.js, health.js, screens.js)

| Function | Purpose | Parameters | Return | Location |
|----------|---------|------------|--------|----------|
| updateScore | Update score display and value | points (number) | New score (number) | score.js |
| updateHealthBar | Update string health display | health (number) | None | health.js |
| showStartScreen | Display game start screen | None | None | screens.js |
| showGameOverScreen | Display game over screen with score | finalScore (number) | None | screens.js |
| saveHighScore | Save high score to local storage | score (number) | None | score.js | 