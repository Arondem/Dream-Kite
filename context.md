# Dream Kite - Game Concept and Design

## Overview
**Title:** Dream Kite [Added to TODO.md on 2023-10-15]  
**Genre:** Casual, Physics-Based Simulation, Arcade [Added to TODO.md on 2023-10-15]  
**Platform:** Web (Desktop and Mobile) [Added to TODO.md on 2023-10-15]  
**Target Audience:** Casual gamers, fans of unique simulations, players seeking a dreamy and mesmerizing experience [Added to TODO.md on 2023-10-15]  
**Development Tools:** ThreeJS, CannonJS, NippleJS, JavaScript [Added to TODO.md on 2023-10-15]  
**Contest:** Vibe Coding Game Jam (Deadline: March 25, 2025) [Added to TODO.md on 2023-10-15]

*Dream Kite* is a web-based game where players fly a kite through surreal, procedurally generated 3D dreamscapes—floating islands, glowing forests, upside-down cities—that shift and twist dynamically. The objective is to navigate these otherworldly environments, collecting "dream sparks" to extend or repair the kite's string while balancing lift and tension to avoid snapping the line or crashing. The game combines physics-driven kite flight, a trippy aesthetic, and a chill yet strategic vibe, making it both accessible and captivating on desktop and mobile web.

---

## Game Concept

### Objective
- **Primary Goal:** Survive as long as possible by keeping the kite aloft and navigating through dreamscapes. [Added to TODO.md on 2023-10-15]
- **Secondary Goal:** Collect dream sparks to increase your score and maintain or extend the kite's string. [Added to TODO.md on 2023-10-15]
- **Challenge:** Balance string tension—too much tug snaps the line (game over), too little causes a crash. [Added to TODO.md on 2023-10-15]

### Gameplay Mechanics
- **Controls:**
  - **Desktop:** Mouse drag (pull string up/down/left/right) or arrow keys (tug strength and direction). [Added to TODO.md on 2023-10-15]
  - **Mobile Web:** NippleJS virtual joystick (tug strength and angle). [Added to TODO.md on 2023-10-15]
- **Physics:** Realistic kite flight using CannonJS: [Added to TODO.md on 2023-10-15]
  - Wind (procedural, varying direction/strength) pushes the kite forward and upward.
  - String tension (controlled by player) pulls it back or adjusts its path.
  - Gravity pulls it downward if lift is insufficient.
- **Environments:** Procedurally generated surreal dreamscapes: [Added to TODO.md on 2023-10-15]
  - **Floating Islands:** Chunks of land with glowing flora.
  - **Glowing Forests:** Neon trees and flowing streams.
  - **Upside-Down Cities:** Skyscrapers hanging from the sky.
- **Obstacles:** Abstract shapes (e.g., spinning cubes, drifting ribbons) that can collide with the kite or snag the string. [Added to TODO.md on 2023-10-15]
- **Collectibles:** Dream sparks (small glowing orbs) that grant points and repair/extend the string. [Added to TODO.md on 2023-10-15]
- **String Health:** A meter that depletes with over-tension or obstacle snags; collecting sparks replenishes it. [Added to TODO.md on 2023-10-15]

### Game Flow
1. **Start Screen:** Title with a "Fly" button and a shimmering kite. [Added to TODO.md on 2023-10-15]
2. **Flight Begins:** The kite launches into the dreamscape with initial wind pushing it. [Added to TODO.md on 2023-10-15]
3. **Navigation:** Players tug the string to steer, avoiding obstacles and collecting sparks while the environment shifts procedurally. [Added to TODO.md on 2023-10-15]
4. **Progression:** Survive longer to increase score; the dreamscape evolves with new themes and challenges. [Added to TODO.md on 2023-10-15]
5. **Game Over:** String snaps or kite crashes, showing score and restarting. [Added to TODO.md on 2023-10-15]

---

## Features

### Core Features
- **Procedural Dreamscapes:** Continuously evolving environments with surreal layouts, obstacles, and spark placements for infinite variety. [Added to TODO.md on 2023-10-15]
- **Physics-Based Flight:** Kite movement driven by wind, gravity, and string tension, creating a dynamic yet intuitive challenge. [Added to TODO.md on 2023-10-15]
- **Mobile Compatibility:** Fully playable on mobile web with NippleJS touch controls. [Added to TODO.md on 2023-10-15]
- **Instant Play:** No loading screens or heavy downloads; all assets are programmatically generated. [Added to TODO.md on 2023-10-15]
- **Scoring System:** Earn points from dream sparks; high scores persist locally via browser storage. [Added to TODO.md on 2023-10-15]
- **String Management:** Tension mechanic adds strategic depth—players must balance control and risk. [Added to TODO.md on 2023-10-15]

### Visual and Audio Aesthetics
- **Graphics:** Trippy, lightweight 3D visuals using ThreeJS: [Added to TODO.md on 2023-10-15]
  - Simple geometric shapes for obstacles (e.g., cubes, ribbons, spheres).
  - A kite mesh with a flowing tail.
  - Vibrant gradients and particle effects (e.g., glowing sparks, wind trails).
- **Audio (Optional):** Ethereal ambient sounds (e.g., soft chimes, wind hums) and subtle effects for spark collection or string strain. [Added to TODO.md on 2023-10-15]

---

## Technical Requirements

### Platform and Accessibility
- **Web-Based:** Hosted on a static web server (e.g., GitHub Pages or custom subdomain). [Added to TODO.md on 2023-10-15]
- **No Login/Signup:** Free-to-play with no authentication required. [Added to TODO.md on 2023-10-15]
- **Instant Loading:** All assets are defined in-code (no external models/textures), ensuring near-instant play. [Added to TODO.md on 2023-10-15]
- **Mobile Web Support:** Responsive and playable on mobile devices (e.g., iPhone) with NippleJS controls. [Added to TODO.md on 2023-10-15]

### Libraries and Frameworks
- **ThreeJS:** 3D rendering and scene management. [Added to TODO.md on 2023-10-15]
- **CannonJS:** Physics simulation (wind forces, string tension, collisions). [Added to TODO.md on 2023-10-15]
- **NippleJS:** Virtual joystick for mobile touch controls. [Added to TODO.md on 2023-10-15]

### Performance Considerations
- **Lightweight Assets:** Procedural geometry and materials keep file size minimal. [Added to TODO.md on 2023-10-15]
- **Efficient Rendering:** Optimized for smooth performance (>30 FPS) on desktop and mobile. [Added to TODO.md on 2023-10-15]
- **Dynamic Generation:** Environments evolve on-the-fly, eliminating pre-loaded content. [Added to TODO.md on 2023-10-15]

---

## Level Design and Procedural Generation

### Dreamscape Structure
- **Themes:** Surreal environments that transition seamlessly: [Added to TODO.md on 2023-10-15]
  - **Floating Islands:** Scattered platforms with glowing edges.
  - **Glowing Forests:** Dense neon foliage with twisting paths.
  - **Upside-Down Cities:** Inverted buildings with floating debris.
- **Evolution:** The dreamscape shifts every 30-60 seconds, blending themes (e.g., islands morph into forests). [Added to TODO.md on 2023-10-15]
- **Difficulty Progression:** [Added to TODO.md on 2023-10-15]
  - **Early Phase (0-60s):** Open spaces, gentle wind, few obstacles.
  - **Mid Phase (60-120s):** Tighter gaps, stronger wind gusts, more obstacles.
  - **Late Phase (120s+):** Chaotic shifts, spinning obstacles, unpredictable wind.

### Procedural Generation Approach
- **Obstacles:** Randomly spawned abstract shapes (e.g., cubes, ribbons) with varying sizes, positions, and movement (e.g., rotation, drift). [Added to TODO.md on 2023-10-15]
- **Collectibles:** Dream sparks placed in clusters or tricky spots, encouraging skillful navigation. [Added to TODO.md on 2023-10-15]
- **Wind Dynamics:** Procedural wind with changing direction and strength, affecting kite lift and drift. [Added to TODO.md on 2023-10-15]
- **String Interaction:** Obstacles can snag the string, increasing tension unless dodged. [Added to TODO.md on 2023-10-15]

### Number of Levels
- **Endless Mode:** Instead of discrete levels, *Dream Kite* uses a single, infinite dreamscape that evolves procedurally. The "level count" is effectively unlimited, with difficulty and variety scaling over time. [Added to TODO.md on 2023-10-15]
- **Practical Scope:** For the jam, aim for a polished experience lasting 3-5 minutes per run, with enough evolution (e.g., 3-5 distinct phases) to showcase the concept. [Added to TODO.md on 2023-10-15]

---

## Development Plan for AI (Cursor AI)

### Code Structure
- **index.html:** Sets up the canvas and UI (score, string health bar, joystick zone). [Added to TODO.md on 2023-10-15]
- **game.js:** Core logic including: [Added to TODO.md on 2023-10-15]
  - Scene initialization (ThreeJS).
  - Physics setup (CannonJS for kite, string, wind).
  - Kite and environment creation.
  - Control handling (mouse/keys and NippleJS).
  - Procedural dreamscape generation.
  - Collision and tension mechanics.
  - Animation loop.

### AI Coding Instructions
- **Kite Physics:** Simulate a kite with wind force, gravity, and a string tether (modeled as a constraint in CannonJS). Adjust tension based on player input. [Added to TODO.md on 2023-10-15]
- **Procedural Generation:** Create functions to spawn obstacles, sparks, and wind patterns, with smooth transitions between dreamscape themes. [Added to TODO.md on 2023-10-15]
- **Controls:** Map mouse/keys and NippleJS inputs to string tugs, tuning sensitivity for desktop and mobile. [Added to TODO.md on 2023-10-15]
- **String Health:** Implement a depleting meter that reacts to tension and snags, replenished by sparks. [Added to TODO.md on 2023-10-15]
- **Visuals:** Use ThreeJS to render simple shapes with gradients and particles, keeping it lightweight. [Added to TODO.md on 2023-10-15]

### Testing and Validation
- **Desktop Testing:** Verify mouse/key controls, physics responsiveness, and dreamscape evolution. [Added to TODO.md on 2023-10-15]
- **Mobile Testing:** Ensure NippleJS controls work smoothly on mobile web (e.g., iPhone Safari). [Added to TODO.md on 2023-10-15]
- **Performance Testing:** Confirm >30 FPS and instant loading. [Added to TODO.md on 2023-10-15]

---

## Conclusion
*Dream Kite* is a bold, innovative entry for the Vibe Coding Game Jam, blending physics-based kite flight with surreal, procedurally generated dreamscapes. Its trippy vibe, strategic string tension, and endless replayability make it a standout contender. With Cursor AI generating the code, this concept can be polished and submitted by March 25, 2025, offering a mesmerizing experience that could captivate players and judges alike.