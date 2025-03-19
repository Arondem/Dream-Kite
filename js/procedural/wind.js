/**
 * Dream Kite - Wind System
 * 
 * This file handles the generation and updating of procedural wind patterns
 * that affect the kite's flight.
 */

// Constants
const BASE_WIND_STRENGTH = 5;
const WIND_VARIATION_SPEED = 0.5;
const GUST_PROBABILITY = 0.005; // Chance of a gust starting each frame
const GUST_DURATION_RANGE = { min: 1, max: 3 }; // In seconds
const GUST_STRENGTH_RANGE = { min: 2, max: 8 }; // Additional strength

// Wind state
let windSystem = {
    // Current wind vector
    current: new CANNON.Vec3(0, 0, -BASE_WIND_STRENGTH),
    
    // Target wind vector (for smooth transitions)
    target: new CANNON.Vec3(0, 0, -BASE_WIND_STRENGTH),
    
    // Base wind properties
    base: {
        strength: BASE_WIND_STRENGTH,
        direction: { x: 0, y: 0, z: -1 } // Initial direction
    },
    
    // Wind variation properties
    variation: {
        time: 0,
        noiseOffsetX: Math.random() * 1000,
        noiseOffsetY: Math.random() * 1000,
        noiseOffsetZ: Math.random() * 1000
    },
    
    // Gust properties
    gust: {
        active: false,
        strength: 0,
        direction: new CANNON.Vec3(0, 0, 0),
        timeRemaining: 0,
        transitionIn: 0.5, // Time to ramp up gust
        transitionOut: 0.8 // Time to ramp down gust
    },
    
    // Difficulty scaling (increases with game time)
    difficulty: 0, // 0-1 scale
    
    // Visual representation
    particles: []
};

/**
 * Initialize the wind system
 */
function initWindSystem() {
    // Set initial wind direction
    setBaseWindDirection(-30, 10); // Slight angle upward and to the right
    
    // Create wind particles for visualization
    createWindParticles();
}

/**
 * Set the base wind direction
 * @param {number} horizontalAngle - Angle in degrees (0 = forward, 90 = right)
 * @param {number} verticalAngle - Angle in degrees (0 = horizontal, 90 = up)
 */
function setBaseWindDirection(horizontalAngle, verticalAngle) {
    // Convert angles to radians
    const hRad = horizontalAngle * Math.PI / 180;
    const vRad = verticalAngle * Math.PI / 180;
    
    // Calculate direction vector
    const direction = {
        x: Math.sin(hRad) * Math.cos(vRad),
        y: Math.sin(vRad),
        z: -Math.cos(hRad) * Math.cos(vRad) // Negative because forward is -z in our coordinate system
    };
    
    // Normalize
    const length = Math.sqrt(direction.x * direction.x + direction.y * direction.y + direction.z * direction.z);
    direction.x /= length;
    direction.y /= length;
    direction.z /= length;
    
    // Update base direction
    windSystem.base.direction = direction;
    
    // Update target to reflect new base direction
    updateWindTarget();
}

/**
 * Update wind target vector based on current settings
 */
function updateWindTarget() {
    const base = windSystem.base;
    const gust = windSystem.gust;
    
    // Calculate base wind vector
    const baseVector = new CANNON.Vec3(
        base.direction.x * base.strength,
        base.direction.y * base.strength,
        base.direction.z * base.strength
    );
    
    // If gust is active, add gust vector
    if (gust.active) {
        // Calculate gust progress for transition effects
        let gustFactor = 1.0;
        
        if (gust.timeRemaining > (gust.duration - gust.transitionIn)) {
            // Transition in
            const progress = (gust.duration - gust.timeRemaining) / gust.transitionIn;
            gustFactor = Math.min(1.0, progress);
        } else if (gust.timeRemaining < gust.transitionOut) {
            // Transition out
            gustFactor = gust.timeRemaining / gust.transitionOut;
        }
        
        // Apply gust with transition factor
        baseVector.x += gust.direction.x * gust.strength * gustFactor;
        baseVector.y += gust.direction.y * gust.strength * gustFactor;
        baseVector.z += gust.direction.z * gust.strength * gustFactor;
    }
    
    // Set as target
    windSystem.target.copy(baseVector);
}

/**
 * Update wind system for current frame
 * @param {number} deltaTime - Time since last update in seconds
 * @param {number} gameTime - Total game time in seconds
 * @param {number} difficulty - Current game difficulty (0-1)
 */
function updateWind(deltaTime, gameTime, difficulty) {
    // Update time and difficulty
    windSystem.variation.time += deltaTime * WIND_VARIATION_SPEED;
    windSystem.difficulty = difficulty;
    
    // Update wind variations using noise
    updateWindVariations(deltaTime);
    
    // Update gusts
    updateWindGusts(deltaTime, difficulty);
    
    // Smoothly interpolate current wind toward target
    const lerpFactor = 0.1; // Adjust for smoother or sharper transitions
    windSystem.current.x += (windSystem.target.x - windSystem.current.x) * lerpFactor;
    windSystem.current.y += (windSystem.target.y - windSystem.current.y) * lerpFactor;
    windSystem.current.z += (windSystem.target.z - windSystem.current.z) * lerpFactor;
    
    // Update wind particles
    updateWindParticles(deltaTime);
}

/**
 * Update procedural wind variations using noise
 * @param {number} deltaTime - Time since last update
 */
function updateWindVariations(deltaTime) {
    // Use simplified noise function for variations
    // In a real implementation, we'd use Perlin or Simplex noise
    const time = windSystem.variation.time;
    const offsetX = windSystem.variation.noiseOffsetX;
    const offsetY = windSystem.variation.noiseOffsetY;
    const offsetZ = windSystem.variation.noiseOffsetZ;
    
    // Simple sine wave variations as a noise approximation
    const variationX = Math.sin(time * 0.3 + offsetX) * Math.cos(time * 0.7 + offsetY) * 0.5;
    const variationY = Math.sin(time * 0.4 + offsetY) * Math.cos(time * 0.6 + offsetZ) * 0.3;
    const variationZ = Math.sin(time * 0.5 + offsetZ) * Math.cos(time * 0.5 + offsetX) * 0.4;
    
    // Calculate variation strength based on difficulty
    const variationStrength = 1.0 + windSystem.difficulty * 0.5;
    
    // Apply variations to base wind direction
    const direction = windSystem.base.direction;
    const strength = windSystem.base.strength;
    
    // Update target wind with variations
    const baseVector = new CANNON.Vec3(
        direction.x * strength + variationX * variationStrength,
        direction.y * strength + variationY * variationStrength,
        direction.z * strength + variationZ * variationStrength
    );
    
    // Copy to target if no gust is active
    if (!windSystem.gust.active) {
        windSystem.target.copy(baseVector);
    }
}

/**
 * Update wind gusts
 * @param {number} deltaTime - Time since last update
 * @param {number} difficulty - Current game difficulty
 */
function updateWindGusts(deltaTime, difficulty) {
    const gust = windSystem.gust;
    
    // If gust is active, update its time remaining
    if (gust.active) {
        gust.timeRemaining -= deltaTime;
        
        // If gust has ended, deactivate it
        if (gust.timeRemaining <= 0) {
            gust.active = false;
            
            // Update wind target without gust
            updateWindTarget();
        } else {
            // Update wind target with current gust state
            updateWindTarget();
        }
    } else {
        // Check if a new gust should start
        // Increase probability with difficulty
        const gustProbability = GUST_PROBABILITY * (1 + difficulty);
        
        if (Math.random() < gustProbability) {
            startNewGust(difficulty);
        }
    }
}

/**
 * Start a new wind gust
 * @param {number} difficulty - Current game difficulty
 */
function startNewGust(difficulty) {
    const gust = windSystem.gust;
    
    // Set gust to active
    gust.active = true;
    
    // Determine gust duration
    const minDuration = GUST_DURATION_RANGE.min;
    const maxDuration = GUST_DURATION_RANGE.max;
    gust.duration = minDuration + Math.random() * (maxDuration - minDuration);
    gust.timeRemaining = gust.duration;
    
    // Determine gust strength
    const minStrength = GUST_STRENGTH_RANGE.min * (1 + difficulty * 0.5);
    const maxStrength = GUST_STRENGTH_RANGE.max * (1 + difficulty * 0.5);
    gust.strength = minStrength + Math.random() * (maxStrength - minStrength);
    
    // Determine gust direction (variation from base direction)
    const baseDir = windSystem.base.direction;
    const variation = 0.3 + difficulty * 0.2; // More variation with higher difficulty
    
    gust.direction.x = baseDir.x + (Math.random() * 2 - 1) * variation;
    gust.direction.y = baseDir.y + (Math.random() * 2 - 1) * variation;
    gust.direction.z = baseDir.z + (Math.random() * 2 - 1) * variation;
    gust.direction.normalize();
    
    // Update wind target with new gust
    updateWindTarget();
}

/**
 * Create particles to visualize wind
 */
function createWindParticles() {
    const PARTICLE_COUNT = 100;
    windSystem.particles = [];
    
    // Create a particle material
    const particleMaterial = new THREE.MeshBasicMaterial({
        color: 0xaaddff,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide
    });
    
    // Create particle geometry
    const particleGeometry = new THREE.PlaneGeometry(0.2, 0.8);
    
    // Create particles and add to scene
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        // Create mesh
        const particle = new THREE.Mesh(particleGeometry, particleMaterial);
        
        // Set random position within a box in front of the camera
        resetWindParticle(particle, true);
        
        // Add to scene and array
        scene.add(particle);
        windSystem.particles.push(particle);
    }
}

/**
 * Reset a wind particle to a new starting position
 * @param {THREE.Mesh} particle - Particle mesh to reset
 * @param {boolean} randomizeZ - Whether to randomize Z position (for initial setup)
 */
function resetWindParticle(particle, randomizeZ = false) {
    // Set random position within a box in front of the camera
    const boxSize = 50;
    particle.position.x = (Math.random() - 0.5) * boxSize;
    particle.position.y = (Math.random() - 0.5) * boxSize * 0.5 + boxSize * 0.3; // Mostly above ground
    
    if (randomizeZ) {
        particle.position.z = (Math.random() - 0.5) * boxSize;
    } else {
        // Reset to far side of box
        particle.position.z = -boxSize / 2;
    }
    
    // Random rotation
    particle.rotation.z = Math.random() * Math.PI * 2;
    
    // Random scale
    const scale = 0.5 + Math.random();
    particle.scale.set(scale, scale, scale);
    
    // Random opacity
    particle.material.opacity = 0.1 + Math.random() * 0.2;
}

/**
 * Update wind particle positions and appearance
 * @param {number} deltaTime - Time since last update
 */
function updateWindParticles(deltaTime) {
    // Get wind vector
    const windVector = windSystem.current;
    const windSpeed = windVector.length();
    
    // Update each particle
    for (let i = 0; i < windSystem.particles.length; i++) {
        const particle = windSystem.particles[i];
        
        // Move particle based on wind direction
        particle.position.x += windVector.x * deltaTime * 2;
        particle.position.y += windVector.y * deltaTime * 2;
        particle.position.z += windVector.z * deltaTime * 2;
        
        // Add some vertical drift and wobble
        particle.position.y += Math.sin(particle.position.z * 0.1 + windSystem.variation.time) * deltaTime * 0.5;
        
        // Rotate slightly
        particle.rotation.z += deltaTime * (0.1 + Math.random() * 0.2);
        
        // Check if particle is out of bounds and reset
        const boundSize = 30;
        if (
            particle.position.x > boundSize ||
            particle.position.x < -boundSize ||
            particle.position.y > boundSize ||
            particle.position.y < -boundSize ||
            particle.position.z > boundSize ||
            particle.position.z < -boundSize
        ) {
            resetWindParticle(particle);
        }
    }
}

/**
 * Get current wind vector
 * @returns {CANNON.Vec3} - Current wind vector
 */
function getCurrentWind() {
    return windSystem.current.clone();
} 