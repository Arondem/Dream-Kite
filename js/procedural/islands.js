/**
 * Dream Kite - Floating Islands Theme
 * 
 * This file handles the generation and updating of the floating islands dreamscape theme.
 */

// Constants
const ISLAND_COUNT = 15;
const ISLAND_SIZE_RANGE = { min: 5, max: 20 };
const ISLAND_HEIGHT_RANGE = { min: 1, max: 3 };
const ISLAND_Y_RANGE = { min: -15, max: 15 };
const ISLAND_DISTANCE_RANGE = { min: 20, max: 50 };

// Island theme state
let islandState = {
    // Array of island objects
    islands: [],
    
    // Island animation time
    time: 0,
    
    // Animation parameters
    bobSpeed: 0.5,
    rotationSpeed: 0.1
};

/**
 * Generate floating islands theme
 */
function generateIslands() {
    // Reset island state
    islandState.islands = [];
    islandState.time = 0;
    
    // Create islands arranged in a circular pattern
    createIslands();
    
    // Create glowing flora on islands
    createFlora();
    
    // Set theme update function
    dreamscape.themes.islands.update = updateIslands;
}

/**
 * Create floating island meshes
 */
function createIslands() {
    for (let i = 0; i < ISLAND_COUNT; i++) {
        // Calculate position in a loose spiral pattern
        const angle = (i / ISLAND_COUNT) * Math.PI * 8; // Multiple loops of spiral
        const radiusMin = ISLAND_DISTANCE_RANGE.min;
        const radiusMax = ISLAND_DISTANCE_RANGE.max;
        const radius = radiusMin + (radiusMax - radiusMin) * (i / ISLAND_COUNT);
        
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        // Random y position within range
        const y = ISLAND_Y_RANGE.min + Math.random() * (ISLAND_Y_RANGE.max - ISLAND_Y_RANGE.min);
        
        // Random island size
        const sizeX = ISLAND_SIZE_RANGE.min + Math.random() * (ISLAND_SIZE_RANGE.max - ISLAND_SIZE_RANGE.min);
        const sizeZ = ISLAND_SIZE_RANGE.min + Math.random() * (ISLAND_SIZE_RANGE.max - ISLAND_SIZE_RANGE.min);
        const height = ISLAND_HEIGHT_RANGE.min + Math.random() * (ISLAND_HEIGHT_RANGE.max - ISLAND_HEIGHT_RANGE.min);
        
        // Create island
        const island = createIsland(x, y, z, sizeX, sizeZ, height);
        
        // Add to theme objects
        dreamscape.themes.islands.objects.push(island.group);
        
        // Add to islands array
        islandState.islands.push(island);
    }
}

/**
 * Create a single floating island
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} z - Z position
 * @param {number} sizeX - Width of island
 * @param {number} sizeZ - Depth of island
 * @param {number} height - Height of island
 * @returns {Object} - Island object with mesh and animation properties
 */
function createIsland(x, y, z, sizeX, sizeZ, height) {
    // Create a group to hold the island parts
    const group = new THREE.Group();
    group.position.set(x, y, z);
    
    // Random rotation
    group.rotation.y = Math.random() * Math.PI * 2;
    
    // Create the top part (green with grass)
    const topGeometry = new THREE.BoxGeometry(sizeX, height * 0.3, sizeZ);
    const topMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x44aa44,
        roughness: 0.8,
        metalness: 0.1
    });
    const topMesh = new THREE.Mesh(topGeometry, topMaterial);
    topMesh.position.y = height * 0.35;
    topMesh.castShadow = true;
    topMesh.receiveShadow = true;
    group.add(topMesh);
    
    // Create the bottom part (rock/dirt)
    const bottomGeometry = new THREE.ConeGeometry(sizeX * 0.8, height * 0.7, 5);
    const bottomMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x995533,
        roughness: 0.9,
        metalness: 0.0
    });
    const bottomMesh = new THREE.Mesh(bottomGeometry, bottomMaterial);
    bottomMesh.position.y = -0.15 * height;
    bottomMesh.rotation.x = Math.PI; // Flip cone upside down
    bottomMesh.castShadow = true;
    bottomMesh.receiveShadow = true;
    group.add(bottomMesh);
    
    // Add glow effect to island edges
    const glowGeometry = new THREE.BoxGeometry(sizeX * 1.05, height * 0.1, sizeZ * 1.05);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0x88eeaa,
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide
    });
    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    glowMesh.position.y = height * 0.22;
    group.add(glowMesh);
    
    // Add island to scene
    scene.add(group);
    
    // Create island object with animation parameters
    const island = {
        group: group,
        bobHeight: 0.2 + Math.random() * 0.3, // Random bob height
        bobPhase: Math.random() * Math.PI * 2, // Random phase offset
        rotationSpeed: 0.02 + Math.random() * 0.03, // Random rotation speed
        rotationAxis: new THREE.Vector3(
            Math.random() * 0.05,
            Math.random() * 0.05,
            Math.random() * 0.05
        ).normalize(),
        baseY: y // Store base Y position for animation
    };
    
    return island;
}

/**
 * Create flora (plants, trees) on islands
 */
function createFlora() {
    // For each island, add some flora
    for (let i = 0; i < islandState.islands.length; i++) {
        const island = islandState.islands[i];
        const group = island.group;
        
        // Get island size from the top mesh
        const topMesh = group.children[0];
        const sizeX = topMesh.geometry.parameters.width;
        const sizeZ = topMesh.geometry.parameters.depth;
        
        // Add trees
        const treeCount = Math.floor(2 + Math.random() * 4); // 2-5 trees per island
        
        for (let j = 0; j < treeCount; j++) {
            // Random position on the island top
            const treeX = (Math.random() - 0.5) * sizeX * 0.8;
            const treeZ = (Math.random() - 0.5) * sizeZ * 0.8;
            
            // Create tree
            const tree = createGlowingTree(treeX, topMesh.position.y + 0.15, treeZ);
            
            // Add to island group
            group.add(tree);
        }
        
        // Add grass/glowing plants
        const plantCount = Math.floor(5 + Math.random() * 10); // 5-15 plants per island
        
        for (let j = 0; j < plantCount; j++) {
            // Random position on the island
            const plantX = (Math.random() - 0.5) * sizeX * 0.9;
            const plantZ = (Math.random() - 0.5) * sizeZ * 0.9;
            
            // Create plant
            const plant = createGlowingPlant(plantX, topMesh.position.y + 0.15, plantZ);
            
            // Add to island group
            group.add(plant);
        }
    }
}

/**
 * Create a glowing tree
 * @param {number} x - X position 
 * @param {number} y - Y position
 * @param {number} z - Z position
 * @returns {THREE.Group} - Tree mesh group
 */
function createGlowingTree(x, y, z) {
    // Create a group for the tree
    const treeGroup = new THREE.Group();
    treeGroup.position.set(x, y, z);
    
    // Random tree height and width
    const height = 1 + Math.random() * 2;
    const width = 0.5 + Math.random() * 0.5;
    
    // Create trunk
    const trunkGeometry = new THREE.CylinderGeometry(0.1, 0.15, height * 0.4, 8);
    const trunkMaterial = new THREE.MeshStandardMaterial({
        color: 0x664422,
        roughness: 0.9,
        metalness: 0.0
    });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = height * 0.2;
    trunk.castShadow = true;
    treeGroup.add(trunk);
    
    // Create foliage (cone shape)
    const foliageGeometry = new THREE.ConeGeometry(width, height * 0.8, 8);
    const foliageMaterial = new THREE.MeshStandardMaterial({
        color: 0x33cc55,
        roughness: 0.7,
        metalness: 0.2,
        emissive: 0x225533,
        emissiveIntensity: 0.2
    });
    const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
    foliage.position.y = height * 0.6;
    foliage.castShadow = true;
    treeGroup.add(foliage);
    
    // Add glow effect
    const glowGeometry = new THREE.SphereGeometry(width * 1.1, 8, 8);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0x88ffaa,
        transparent: true,
        opacity: 0.15,
        side: THREE.BackSide
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.position.y = height * 0.6;
    treeGroup.add(glow);
    
    return treeGroup;
}

/**
 * Create a glowing plant
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} z - Z position
 * @returns {THREE.Group} - Plant mesh group
 */
function createGlowingPlant(x, y, z) {
    // Create a group for the plant
    const plantGroup = new THREE.Group();
    plantGroup.position.set(x, y, z);
    
    // Random plant height
    const height = 0.2 + Math.random() * 0.3;
    
    // Create plant geometry based on random type
    let plantMesh;
    
    if (Math.random() > 0.5) {
        // Create grass-like plant
        const grassGeometry = new THREE.ConeGeometry(0.1, height, 4);
        const grassMaterial = new THREE.MeshStandardMaterial({
            color: 0x66ff88,
            roughness: 0.7,
            metalness: 0.1,
            emissive: 0x22aa44,
            emissiveIntensity: 0.3
        });
        plantMesh = new THREE.Mesh(grassGeometry, grassMaterial);
    } else {
        // Create mushroom-like plant
        // Stem
        const stemGeometry = new THREE.CylinderGeometry(0.03, 0.05, height * 0.7, 8);
        const stemMaterial = new THREE.MeshStandardMaterial({
            color: 0xaaddff,
            roughness: 0.5,
            metalness: 0.3,
            emissive: 0x6688ff,
            emissiveIntensity: 0.2
        });
        const stem = new THREE.Mesh(stemGeometry, stemMaterial);
        stem.position.y = height * 0.35;
        plantGroup.add(stem);
        
        // Cap
        const capGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const capMaterial = new THREE.MeshStandardMaterial({
            color: 0x77aaff,
            roughness: 0.5,
            metalness: 0.3,
            emissive: 0x4466cc,
            emissiveIntensity: 0.4
        });
        plantMesh = new THREE.Mesh(capGeometry, capMaterial);
        plantMesh.position.y = height * 0.7;
    }
    
    plantGroup.add(plantMesh);
    
    // Add glow effect
    const glowGeometry = new THREE.SphereGeometry(0.15, 8, 8);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xaaffcc,
        transparent: true,
        opacity: 0.2
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.position.y = height * 0.5;
    plantGroup.add(glow);
    
    return plantGroup;
}

/**
 * Update islands animation
 * @param {number} deltaTime - Time since last update
 * @param {number} gameTime - Total game time
 */
function updateIslands(deltaTime, gameTime) {
    // Update animation time
    islandState.time += deltaTime;
    
    // Animate each island
    for (let i = 0; i < islandState.islands.length; i++) {
        const island = islandState.islands[i];
        
        // Bob up and down
        const bobOffset = Math.sin(islandState.time * islandState.bobSpeed + island.bobPhase) * island.bobHeight;
        island.group.position.y = island.baseY + bobOffset;
        
        // Slight rotation
        const rotationAmount = island.rotationSpeed * deltaTime;
        island.group.rotateOnAxis(island.rotationAxis, rotationAmount);
        
        // Animate flora (trees and plants)
        animateFlora(island.group, deltaTime, islandState.time);
    }
}

/**
 * Animate flora on an island
 * @param {THREE.Group} islandGroup - Island group containing flora
 * @param {number} deltaTime - Time since last update
 * @param {number} time - Current animation time
 */
function animateFlora(islandGroup, deltaTime, time) {
    // Start from index 3 (skip island meshes)
    for (let i = 3; i < islandGroup.children.length; i++) {
        const flora = islandGroup.children[i];
        
        // Gentle swaying motion
        const swayAmplitude = 0.02;
        const swayFrequency = 1.5;
        const swayPhase = i * 0.5; // Different phase for each plant
        
        // Apply sway
        flora.rotation.x = Math.sin(time * swayFrequency + swayPhase) * swayAmplitude;
        flora.rotation.z = Math.cos(time * swayFrequency * 0.7 + swayPhase) * swayAmplitude;
        
        // Animate glow (last child is the glow effect)
        if (flora.children.length > 0) {
            const glow = flora.children[flora.children.length - 1];
            if (glow.material.opacity !== undefined) {
                // Pulse glow opacity
                const basePulse = 0.2;
                const pulseRange = 0.05;
                const pulseFreq = 0.8;
                glow.material.opacity = basePulse + Math.sin(time * pulseFreq + i) * pulseRange;
            }
        }
    }
} 