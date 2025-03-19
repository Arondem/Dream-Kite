# Dream Kite - File Structure

```
dream-kite/
│
├── index.html              # Main HTML file with canvas and UI elements
├── style.css               # Main stylesheet
├── README.md               # Project documentation
├── LICENSE                 # License information
├── TODO.md                 # Task list and progress tracking
├── FILE_STRUCTURE.md       # This file - documentation of file organization
├── FUNCTIONS.md            # Documentation of key functions
│
├── js/
│   ├── game.js             # Main game initialization and loop
│   ├── kite.js             # Kite physics and rendering
│   ├── string.js           # String physics and tension mechanics
│   ├── controls.js         # Input handling (desktop and mobile)
│   ├── procedural/
│   │   ├── wind.js         # Procedural wind generation
│   │   ├── dreamscape.js   # Base dreamscape generation
│   │   ├── islands.js      # Floating islands theme generation
│   │   ├── forests.js      # Glowing forests theme generation
│   │   └── cities.js       # Upside-down cities theme generation
│   │
│   ├── objects/
│   │   ├── obstacles.js    # Obstacle generation and management
│   │   └── sparks.js       # Dream spark collectibles
│   │
│   └── ui/
│       ├── score.js        # Score display and management
│       ├── health.js       # String health UI and mechanics
│       └── screens.js      # Start and game over screens
│
└── lib/                    # Third-party libraries
    ├── three.min.js        # ThreeJS library
    ├── cannon.min.js       # CannonJS physics library
    └── nipplejs.min.js     # NippleJS for mobile controls
``` 