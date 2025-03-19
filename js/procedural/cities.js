/**
 * Dream Kite - Upside-Down Cities Theme
 * 
 * This file handles the generation and updating of the upside-down cities dreamscape theme.
 */

// Constants
const BUILDING_COUNT = 25;
const BUILDING_SIZE_RANGE = { min: 3, max: 15 };
const BUILDING_HEIGHT_RANGE = { min: 10, max: 30 };
const BUILDING_Y_RANGE = { min: 20, max: 40 };
const BUILDING_DISTANCE_RANGE = { min: 15, max: 50 };
const DEBRIS_COUNT = 40;
const DEBRIS_SIZE_RANGE = { min: 0.5, max: 2 };

// Cities theme state
let citiesState = {
    // Arrays for city objects
    buildings: [],
    debris: [],
    
    // Animation time
    time: 0,
    
    // Animation parameters
    rotationSpeed: 0.2,
    floatSpeed: 0.5,
    glowPulseSpeed: 0.8
};

/**
 * Generate upside-down cities theme
 */
function generateCities() {
    // Reset cities state
    citiesState.buildings = [];
    citiesState.debris = [];
    citiesState.time = 0;
    
    // Create buildings in a grid-like pattern
    createBuildings();
    
    // Create floating debris
    createDebris();
    
    // Set theme update function
    dreamscape.themes.cities.update = updateCities;
}

/**
 * Create upside-down buildings
 */
function createBuildings() {
    // Create buildings in a grid pattern with some randomness
    const gridSize = Math.ceil(Math.sqrt(BUILDING_COUNT));
    const spacing = BUILDING_DISTANCE_RANGE.min;
    
    for (let i = 0; i < BUILDING_COUNT; i++) {
        // Calculate grid position
        const gridX = (i % gridSize) - gridSize / 2;
        const gridZ = Math.floor(i / gridSize) - gridSize / 2;
        
        // Add randomness to position
        const x = gridX * spacing + (Math.random() - 0.5) * spacing * 0.5;
        const z = gridZ * spacing + (Math.random() - 0.5) * spacing * 0.5;
        const y = BUILDING_Y_RANGE.min + Math.random() * (BUILDING_Y_RANGE.max - BUILDING_Y_RANGE.min);
        
        // Random building size
        const width = BUILDING_SIZE_RANGE.min + Math.random() * (BUILDING_SIZE_RANGE.max - BUILDING_SIZE_RANGE.min);
        const depth = BUILDING_SIZE_RANGE.min + Math.random() * (BUILDING_SIZE_RANGE.max - BUILDING_SIZE_RANGE.min);
        const height = BUILDING_HEIGHT_RANGE.min + Math.random() * (BUILDING_HEIGHT_RANGE.max - BUILDING_HEIGHT_RANGE.min);
        
        // Create building
        const building = createBuilding(x, y, z, width, depth, height);
        
        // Add to theme objects
        dreamscape.themes.cities.objects.push(building.group);
        
        // Add to cities objects
        citiesState.buildings.push(building);
    }
}

/**
 * Create a single building
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} z - Z position
 * @param {number} width - Building width
 * @param {number} depth - Building depth
 * @param {number} height - Building height
 * @returns {Object} - Building object with mesh and animation properties
 */
function createBuilding(x, y, z, width, depth, height) {
    // Create a group to hold the building parts
    const group = new THREE.Group();
    group.position.set(x, y, z);
    
    // Random rotation
    group.rotation.y = Math.random() * Math.PI * 2;
    
    // Create the main building structure
    const buildingGeometry = new THREE.BoxGeometry(width, height, depth);
    
    // Create windows pattern
    const windowUVs = buildingGeometry.attributes.uv;
    const windowSize = 0.1;
    const windowSpacing = 0.15;
    
    for (let i = 0; i < windowUVs.count; i++) {
        const u = windowUVs.getX(i);
        const v = windowUVs.getY(i);
        
        // Create grid pattern for windows
        const gridU = Math.round(u / windowSpacing) * windowSpacing;
        const gridV = Math.round(v / windowSpacing) * windowSpacing;
        
        windowUVs.setXY(i, gridU, gridV);
    }
    
    // Create building materials
    const buildingMaterial = new THREE.MeshStandardMaterial({
        color: 0x444466,
        roughness: 0.7,
        metalness: 0.3,
        emissive: 0x222233,
        emissiveIntensity: 0.2
    });
    
    const windowsMaterial = new THREE.MeshStandardMaterial({
        color: 0xaaaaff,
        roughness: 0.3,
        metalness: 0.8,
        emissive: 0x6666aa,
        emissiveIntensity: 0.5
    });
    
    // Create building mesh
    const buildingMesh = new THREE.Mesh(buildingGeometry, [
        buildingMaterial, // Right
        buildingMaterial, // Left
        buildingMaterial, // Top
        buildingMaterial, // Bottom
        windowsMaterial,  // Front
        windowsMaterial   // Back
    ]);
    
    // Rotate 180 degrees to make it upside down
    buildingMesh.rotation.x = Math.PI;
    buildingMesh.castShadow = true;
    buildingMesh.receiveShadow = true;
    group.add(buildingMesh);
    
    // Add antenna or spire to some buildings
    if (Math.random() > 0.5) {
        const spireHeight = height * 0.2;
        const spireGeometry = new THREE.CylinderGeometry(0.1, 0.3, spireHeight, 4);
        const spireMaterial = new THREE.MeshStandardMaterial({
            color: 0x666688,
            roughness: 0.6,
            metalness: 0.4
        });
        const spire = new THREE.Mesh(spireGeometry, spireMaterial);
        spire.position.y = -height / 2 - spireHeight / 2; // Position at bottom (now top) of building
        spire.castShadow = true;
        group.add(spire);
    }
    
    // Add glow effect
    const glowGeometry = new THREE.BoxGeometry(width * 1.1, height * 1.1, depth * 1.1);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0x8888ff,
        transparent: true,
        opacity: 0.1,
        side: THREE.BackSide
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.rotation.x = Math.PI; // Match building rotation
    group.add(glow);
    
    // Add to scene
    scene.add(group);
    
    // Create building object with animation parameters
    const building = {
        group: group,
        mesh: buildingMesh,
        glow: glow,
        floatPhase: Math.random() * Math.PI * 2,
        floatAmount: 0.2 + Math.random() * 0.3,
        rotationAxis: new THREE.Vector3(
            (Math.random() - 0.5) * 0.1,
            (Math.random() - 0.5) * 0.1,
            (Math.random() - 0.5) * 0.1
        ).normalize(),
        glowPulsePhase: Math.random() * Math.PI * 2,
        baseY: y
    };
    
    return building;
}

/**
 * Create floating debris
 */
function createDebris() {
    for (let i = 0; i < DEBRIS_COUNT; i++) {
        // Random position around buildings
        const angle = Math.random() * Math.PI * 2;
        const radius = BUILDING_DISTANCE_RANGE.min + Math.random() * (BUILDING_DISTANCE_RANGE.max - BUILDING_DISTANCE_RANGE.min);
        
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = BUILDING_Y_RANGE.min + Math.random() * (BUILDING_Y_RANGE.max - BUILDING_Y_RANGE.min);
        
        // Random debris size
        const size = DEBRIS_SIZE_RANGE.min + Math.random() * (DEBRIS_SIZE_RANGE.max - DEBRIS_SIZE_RANGE.min);
        
        // Create debris
        const debris = createDebrisPiece(x, y, z, size);
        
        // Add to theme objects
        dreamscape.themes.cities.objects.push(debris.group);
        
        // Add to cities objects
        citiesState.debris.push(debris);
    }
}

/**
 * Create a single piece of debris
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} z - Z position
 * @param {number} size - Debris size
 * @returns {Object} - Debris object with mesh and animation properties
 */
function createDebrisPiece(x, y, z, size) {
    // Create a group for the debris
    const group = new THREE.Group();
    group.position.set(x, y, z);
    
    // Random debris type
    const debrisType = Math.floor(Math.random() * 4);
    let geometry;
    
    switch (debrisType) {
        case 0: // Cube
            geometry = new THREE.BoxGeometry(size, size, size);
            break;
        case 1: // Sphere
            geometry = new THREE.SphereGeometry(size * 0.5, 8, 8);
            break;
        case 2: // Cylinder
            geometry = new THREE.CylinderGeometry(size * 0.3, size * 0.3, size, 8);
            break;
        case 3: // Cone
            geometry = new THREE.ConeGeometry(size * 0.5, size, 8);
            break;
    }
    
    // Create debris material
    const debrisMaterial = new THREE.MeshStandardMaterial({
        color: 0x888899,
        roughness: 0.8,
        metalness: 0.2,
        emissive: 0x444455,
        emissiveIntensity: 0.2
    });
    
    // Create debris mesh
    const debrisMesh = new THREE.Mesh(geometry, debrisMaterial);
    debrisMesh.castShadow = true;
    debrisMesh.receiveShadow = true;
    group.add(debrisMesh);
    
    // Add glow effect
    const glowGeometry = new THREE.SphereGeometry(size * 0.8, 8, 8);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0x8888aa,
        transparent: true,
        opacity: 0.15,
        side: THREE.BackSide
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    group.add(glow);
    
    // Add to scene
    scene.add(group);
    
    // Create debris object with animation parameters
    const debris = {
        group: group,
        mesh: debrisMesh,
        glow: glow,
        rotationSpeed: (Math.random() - 0.5) * 2,
        rotationAxis: new THREE.Vector3(
            Math.random() - 0.5,
            Math.random() - 0.5,
            Math.random() - 0.5
        ).normalize(),
        orbitCenter: new THREE.Vector3(x, y, z),
        orbitRadius: 1 + Math.random() * 2,
        orbitSpeed: 0.2 + Math.random() * 0.3,
        orbitPhase: Math.random() * Math.PI * 2,
        floatPhase: Math.random() * Math.PI * 2,
        floatSpeed: 0.5 + Math.random() * 0.5
    };
    
    return debris;
}

/**
 * Update cities theme
 * @param {number} deltaTime - Time since last update
 * @param {number} gameTime - Total game time
 */
function updateCities(deltaTime, gameTime) {
    // Update animation time
    citiesState.time += deltaTime;
    
    // Update buildings
    for (let i = 0; i < citiesState.buildings.length; i++) {
        updateBuilding(citiesState.buildings[i], deltaTime, citiesState.time);
    }
    
    // Update debris
    for (let i = 0; i < citiesState.debris.length; i++) {
        updateDebris(citiesState.debris[i], deltaTime, citiesState.time);
    }
}

/**
 * Update a building's animation
 * @param {Object} building - Building object to update
 * @param {number} deltaTime - Time since last update
 * @param {number} time - Current animation time
 */
function updateBuilding(building, deltaTime, time) {
    // Float animation
    const floatOffset = Math.sin(time * citiesState.floatSpeed + building.floatPhase) * building.floatAmount;
    building.group.position.y = building.baseY + floatOffset;
    
    // Subtle rotation
    const rotationAngle = deltaTime * citiesState.rotationSpeed;
    building.group.rotateOnAxis(building.rotationAxis, rotationAngle);
    
    // Glow pulse
    const pulseFactor = 0.1 + Math.sin(time * citiesState.glowPulseSpeed + building.glowPulsePhase) * 0.05;
    building.glow.material.opacity = pulseFactor;
}

/**
 * Update a debris piece's animation
 * @param {Object} debris - Debris object to update
 * @param {number} deltaTime - Time since last update
 * @param {number} time - Current animation time
 */
function updateDebris(debris, deltaTime, time) {
    // Rotate debris
    debris.mesh.rotateOnAxis(debris.rotationAxis, debris.rotationSpeed * deltaTime);
    
    // Orbit around center point
    const orbitAngle = time * debris.orbitSpeed + debris.orbitPhase;
    const orbitX = debris.orbitCenter.x + Math.cos(orbitAngle) * debris.orbitRadius;
    const orbitZ = debris.orbitCenter.z + Math.sin(orbitAngle) * debris.orbitRadius;
    
    // Float up and down
    const floatOffset = Math.sin(time * debris.floatSpeed + debris.floatPhase) * 0.5;
    
    debris.group.position.set(
        orbitX,
        debris.orbitCenter.y + floatOffset,
        orbitZ
    );
} 