/**
 * Dream Kite - Main Game File
 * 
 * This file contains the core game logic and initialization.
 * It sets up the ThreeJS scene, physics world, and main game loop.
 */

// Game state variables
let gameActive = false;
let score = 0;
let stringHealth = 100;
let currentTheme = 'islands'; // Starting theme: 'islands', 'forests', or 'cities'
let gameTime = 0; // Time elapsed since game start (in seconds)

// ThreeJS variables
let scene, camera, renderer;
let kite, string;

// Physics variables
let world; // CannonJS physics world

// Control variables
let controls;
let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

/**
 * Initialize the game
 * Sets up ThreeJS, CannonJS, and game elements
 */
function initGame() {
    // Set up ThreeJS scene, camera, and renderer
    setupScene();
    
    // Set up physics world
    setupPhysics();
    
    // Create kite and string
    setupKiteAndString();
    
    // Set up controls based on device
    setupControls();
    
    // Set up initial dreamscape
    generateDreamscape(currentTheme);
    
    // Set up event listeners
    setupEventListeners();
    
    // Start animation loop
    animate();
    
    // Show start screen
    showStartScreen();
}

/**
 * Set up ThreeJS scene, camera, and renderer
 */
function setupScene() {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050518); // Dark blue background
    
    // Create camera
    camera = new THREE.PerspectiveCamera(
        75, // Field of view
        window.innerWidth / window.innerHeight, // Aspect ratio
        0.1, // Near clipping plane
        1000 // Far clipping plane
    );
    camera.position.z = 15;
    camera.position.y = 5;
    camera.lookAt(0, 0, 0);
    
    // Create renderer
    renderer = new THREE.WebGLRenderer({ 
        canvas: document.getElementById('game-canvas'),
        antialias: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 1);
    scene.add(ambientLight);
    
    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);
}

/**
 * Set up CannonJS physics world
 */
function setupPhysics() {
    // Create physics world
    world = new CANNON.World();
    world.gravity.set(0, -9.82, 0); // Earth gravity
    world.broadphase = new CANNON.NaiveBroadphase();
    world.solver.iterations = 10;
}

/**
 * Create kite and string physics objects and meshes
 */
function setupKiteAndString() {
    // This will be implemented in kite.js and string.js
    // For now, we'll just set placeholders
    kite = {};
    string = {};
}

/**
 * Set up controls based on device type
 */
function setupControls() {
    // This will be implemented in controls.js
    controls = {};
}

/**
 * Set up event listeners for game controls
 */
function setupEventListeners() {
    // Start button click
    document.getElementById('start-button').addEventListener('click', startGame);
    
    // Restart button click
    document.getElementById('restart-button').addEventListener('click', restartGame);
}

/**
 * Start the game
 */
function startGame() {
    // Hide start screen
    document.getElementById('start-screen').classList.add('hidden');
    
    // Reset game state
    resetGame();
    
    // Set game as active
    gameActive = true;
}

/**
 * Reset game state for a new game
 */
function resetGame() {
    score = 0;
    stringHealth = 100;
    gameTime = 0;
    currentTheme = 'islands';
    
    // Update UI
    updateScore(0);
    updateHealthBar(100);
    
    // Reset objects and environment
    // These functions will be implemented in their respective files
}

/**
 * Restart game after game over
 */
function restartGame() {
    // Hide game over screen
    document.getElementById('game-over-screen').classList.add('hidden');
    
    // Reset and start new game
    startGame();
}

/**
 * Game over function
 */
function gameOver() {
    gameActive = false;
    
    // Show game over screen
    document.getElementById('game-over-screen').classList.remove('hidden');
    document.getElementById('final-score-value').textContent = score;
    
    // Save high score
    saveHighScore(score);
}

/**
 * Main animation loop
 */
function animate(timestamp) {
    requestAnimationFrame(animate);
    
    if (gameActive) {
        // Update game time
        const deltaTime = 1/60; // Fixed time step for physics
        gameTime += deltaTime;
        
        // Update physics
        world.step(deltaTime);
        
        // Update kite and string
        if (kite.update) kite.update(deltaTime);
        if (string.update) string.update(deltaTime);
        
        // Update dreamscape
        updateDreamscape(gameTime, deltaTime);
        
        // Check collisions
        handleCollisions();
        
        // Update UI
        // These functions will be implemented in their respective files
    }
    
    // Render scene
    renderer.render(scene, camera);
}

/**
 * Handle window resize
 */
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

/**
 * Update dreamscape based on game time
 */
function updateDreamscape(gameTime, deltaTime) {
    // This will be implemented in dreamscape.js
    // For now, we'll just have a placeholder
    
    // Theme transition based on game time
    if (gameTime > 120 && currentTheme !== 'cities') {
        currentTheme = 'cities';
        transitionTheme(currentTheme, 2.0);
    } else if (gameTime > 60 && currentTheme !== 'forests') {
        currentTheme = 'forests';
        transitionTheme(currentTheme, 2.0);
    }
}

/**
 * Handle collisions between objects
 */
function handleCollisions() {
    // This will be implemented with specific collision logic
    // For now, we'll just have a placeholder
}

// Initialize the game when the window loads
window.addEventListener('load', initGame); 