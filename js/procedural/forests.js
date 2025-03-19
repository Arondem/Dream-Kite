/**
 * Dream Kite - Glowing Forests Theme
 * 
 * This file handles the generation and updating of the glowing forests dreamscape theme.
 */

// Constants
const TREE_COUNT = 30;
const TREE_SIZE_RANGE = { min: 2, max: 6 };
const TREE_Y_RANGE = { min: -10, max: 10 };
const TREE_DISTANCE_RANGE = { min: 15, max: 40 };
const STREAM_COUNT = 3;
const STREAM_WIDTH_RANGE = { min: 2, max: 5 };
const STREAM_LENGTH_RANGE = { min: 50, max: 100 };

// Forest theme state
let forestState = {
    // Arrays for forest objects
    trees: [],
    plants: [],
    streams: [],
    
    // Animation time
    time: 0,
    
    // Animation parameters
    swaySpeed: 0.8,
    swayAmount: 0.2,
    glowPulseSpeed: 1.2
};

/**
 * Generate glowing forests theme
 */
function generateForests() {
    // Reset forest state
    forestState.trees = [];
    forestState.plants = [];
    forestState.streams = [];
    forestState.time = 0;
    
    // Create trees in a natural-looking cluster pattern
    createTrees();
    
    // Create undergrowth plants
    createPlants();
    
    // Create flowing streams
    createStreams();
    
    // Set theme update function
    dreamscape.themes.forests.update = updateForests;
}

/**
 * Create glowing trees
 */
function createTrees() {
    // Create several clusters of trees
    const clusterCount = 4;
    
    for (let c = 0; c < clusterCount; c++) {
        // Random cluster center
        const clusterAngle = (c / clusterCount) * Math.PI * 2;
        const clusterRadius = TREE_DISTANCE_RANGE.min + Math.random() * (TREE_DISTANCE_RANGE.max - TREE_DISTANCE_RANGE.min);
        
        const clusterX = Math.cos(clusterAngle) * clusterRadius;
        const clusterZ = Math.sin(clusterAngle) * clusterRadius;
        const clusterY = TREE_Y_RANGE.min + Math.random() * (TREE_Y_RANGE.max - TREE_Y_RANGE.min);
        
        // Number of trees in this cluster
        const treesInCluster = Math.floor(TREE_COUNT / clusterCount) + Math.floor(Math.random() * 3);
        
        for (let i = 0; i < treesInCluster; i++) {
            // Random position within the cluster
            const offsetRadius = 2 + Math.random() * 8;
            const offsetAngle = Math.random() * Math.PI * 2;
            
            const x = clusterX + Math.cos(offsetAngle) * offsetRadius;
            const z = clusterZ + Math.sin(offsetAngle) * offsetRadius;
            const y = clusterY + (Math.random() - 0.5) * 3;
            
            // Random tree size
            const size = TREE_SIZE_RANGE.min + Math.random() * (TREE_SIZE_RANGE.max - TREE_SIZE_RANGE.min);
            
            // Create tree
            const tree = createGlowingTree(x, y, z, size);
            
            // Add to theme objects
            dreamscape.themes.forests.objects.push(tree.group);
            
            // Add to forest objects
            forestState.trees.push(tree);
        }
    }
}

/**
 * Create a single glowing tree
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} z - Z position
 * @param {number} size - Tree size
 * @returns {Object} - Tree object with mesh and animation properties
 */
function createGlowingTree(x, y, z, size) {
    // Create a group to hold the tree parts
    const group = new THREE.Group();
    group.position.set(x, y, z);
    
    // Random rotation
    group.rotation.y = Math.random() * Math.PI * 2;
    
    // Create the trunk
    const trunkHeight = size * 1.5;
    const trunkGeometry = new THREE.CylinderGeometry(size * 0.15, size * 0.2, trunkHeight, 8);
    const trunkMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x554433,
        roughness: 0.9,
        metalness: 0.1,
        emissive: 0x221100,
        emissiveIntensity: 0.1
    });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = trunkHeight / 2;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    group.add(trunk);
    
    // Create the foliage (multiple cone layers)
    const foliageLayers = 3;
    const foliageHeight = size * 0.8;
    const foliageWidth = size * 0.8;
    
    // Create different colors for variation
    const colors = [
        0x66ffaa, 0x88ffcc, 0xaaffdd
    ];
    
    const emissiveColors = [
        0x33aa77, 0x44bb88, 0x55cc99
    ];
    
    for (let i = 0; i < foliageLayers; i++) {
        const layerSize = 1 - (i * 0.2);
        const layerY = trunkHeight * 0.8 + (i * foliageHeight * 0.5);
        
        const coneGeometry = new THREE.ConeGeometry(
            foliageWidth * layerSize,
            foliageHeight,
            8
        );
        
        const colorIndex = Math.floor(Math.random() * colors.length);
        const foliageMaterial = new THREE.MeshStandardMaterial({ 
            color: colors[colorIndex],
            roughness: 0.7,
            metalness: 0.2,
            emissive: emissiveColors[colorIndex],
            emissiveIntensity: 0.4,
            transparent: true,
            opacity: 0.9
        });
        
        const cone = new THREE.Mesh(coneGeometry, foliageMaterial);
        cone.position.y = layerY;
        cone.castShadow = true;
        cone.receiveShadow = true;
        group.add(cone);
    }
    
    // Add glow effect
    const glowGeometry = new THREE.SphereGeometry(size * 1.2, 16, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0x88ffbb,
        transparent: true,
        opacity: 0.15,
        side: THREE.BackSide
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.position.y = trunkHeight * 0.8 + foliageHeight * 0.5;
    group.add(glow);
    
    // Add to scene
    scene.add(group);
    
    // Create tree object with animation parameters
    const tree = {
        group: group,
        foliage: group.children.slice(1, foliageLayers + 1), // Exclude trunk and glow
        glow: glow,
        swayPhase: Math.random() * Math.PI * 2,
        swayAmount: 0.05 + Math.random() * 0.05,
        glowPulsePhase: Math.random() * Math.PI * 2,
        size: size
    };
    
    return tree;
}

/**
 * Create undergrowth plants
 */
function createPlants() {
    // Add plants near each tree
    for (let i = 0; i < forestState.trees.length; i++) {
        const tree = forestState.trees[i];
        const treePos = tree.group.position;
        
        // Number of plants around this tree
        const plantCount = 3 + Math.floor(Math.random() * 5);
        
        for (let j = 0; j < plantCount; j++) {
            // Random position around the tree
            const angle = Math.random() * Math.PI * 2;
            const distance = 1 + Math.random() * 3;
            
            const x = treePos.x + Math.cos(angle) * distance;
            const z = treePos.z + Math.sin(angle) * distance;
            const y = treePos.y - 0.1; // Slightly lower than the tree base
            
            // Create plant
            const plant = createGlowingPlant(x, y, z);
            
            // Add to theme objects
            dreamscape.themes.forests.objects.push(plant.group);
            
            // Add to forest objects
            forestState.plants.push(plant);
        }
    }
    
    // Also add some standalone plants
    const standalonePlantCount = 30;
    
    for (let i = 0; i < standalonePlantCount; i++) {
        // Random position
        const angle = Math.random() * Math.PI * 2;
        const radius = 5 + Math.random() * 30;
        
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = TREE_Y_RANGE.min + Math.random() * (TREE_Y_RANGE.max - TREE_Y_RANGE.min);
        
        // Create plant
        const plant = createGlowingPlant(x, y, z);
        
        // Add to theme objects
        dreamscape.themes.forests.objects.push(plant.group);
        
        // Add to forest objects
        forestState.plants.push(plant);
    }
}

/**
 * Create a glowing plant
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} z - Z position
 * @returns {Object} - Plant object with mesh and animation properties
 */
function createGlowingPlant(x, y, z) {
    // Create a group for the plant
    const plantGroup = new THREE.Group();
    plantGroup.position.set(x, y, z);
    
    // Random plant type
    const plantType = Math.floor(Math.random() * 3);
    
    let plantObject = {};
    
    switch (plantType) {
        case 0: // Mushroom
            plantObject = createGlowingMushroom(plantGroup);
            break;
        case 1: // Fern
            plantObject = createGlowingFern(plantGroup);
            break;
        case 2: // Flower
            plantObject = createGlowingFlower(plantGroup);
            break;
    }
    
    // Add to scene
    scene.add(plantGroup);
    
    return {
        group: plantGroup,
        type: plantType,
        ...plantObject
    };
}

/**
 * Create a glowing mushroom
 * @param {THREE.Group} group - Group to add mushroom to
 * @returns {Object} - Mushroom object with animation properties
 */
function createGlowingMushroom(group) {
    // Random mushroom properties
    const height = 0.3 + Math.random() * 0.5;
    const capSize = 0.2 + Math.random() * 0.3;
    
    // Create stem
    const stemGeometry = new THREE.CylinderGeometry(height * 0.15, height * 0.2, height, 8);
    const stemMaterial = new THREE.MeshStandardMaterial({
        color: 0xddddff,
        roughness: 0.7,
        metalness: 0.2,
        emissive: 0x8888aa,
        emissiveIntensity: 0.3
    });
    const stem = new THREE.Mesh(stemGeometry, stemMaterial);
    stem.position.y = height / 2;
    stem.castShadow = true;
    group.add(stem);
    
    // Create cap
    const capGeometry = new THREE.SphereGeometry(capSize, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const capMaterial = new THREE.MeshStandardMaterial({
        color: 0xaaddff,
        roughness: 0.6,
        metalness: 0.3,
        emissive: 0x6688bb,
        emissiveIntensity: 0.5
    });
    const cap = new THREE.Mesh(capGeometry, capMaterial);
    cap.position.y = height;
    cap.castShadow = true;
    group.add(cap);
    
    // Add glow
    const glowGeometry = new THREE.SphereGeometry(capSize * 1.3, 16, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0x88aaff,
        transparent: true,
        opacity: 0.2
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.position.y = height;
    group.add(glow);
    
    return {
        stem: stem,
        cap: cap,
        glow: glow,
        pulsePhase: Math.random() * Math.PI * 2
    };
}

/**
 * Create a glowing fern
 * @param {THREE.Group} group - Group to add fern to
 * @returns {Object} - Fern object with animation properties
 */
function createGlowingFern(group) {
    // Random fern properties
    const height = 0.5 + Math.random() * 0.7;
    const width = 0.3 + Math.random() * 0.5;
    
    // Create stem
    const stemGeometry = new THREE.CylinderGeometry(0.03, 0.05, height, 5);
    const stemMaterial = new THREE.MeshStandardMaterial({
        color: 0x44aa44,
        roughness: 0.9,
        metalness: 0.1
    });
    const stem = new THREE.Mesh(stemGeometry, stemMaterial);
    stem.position.y = height / 2;
    stem.castShadow = true;
    group.add(stem);
    
    // Create leaves
    const leaves = [];
    const leafCount = 5 + Math.floor(Math.random() * 4);
    
    for (let i = 0; i < leafCount; i++) {
        // Position along stem
        const t = 0.3 + (i / leafCount) * 0.7;
        const leafY = height * t;
        
        // Size decreases toward the top
        const leafSize = width * (1 - t * 0.5);
        
        // Alternate sides
        const side = i % 2 === 0 ? 1 : -1;
        
        // Create leaf
        const leafGeometry = new THREE.PlaneGeometry(leafSize, leafSize * 0.5);
        const leafMaterial = new THREE.MeshStandardMaterial({
            color: 0x66ff88,
            roughness: 0.8,
            metalness: 0.2,
            emissive: 0x44aa66,
            emissiveIntensity: 0.4,
            side: THREE.DoubleSide
        });
        const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
        
        // Position and rotate leaf
        leaf.position.set(side * leafSize * 0.3, leafY, 0);
        leaf.rotation.z = side * Math.PI * 0.15;
        leaf.rotation.y = side * Math.PI * 0.1;
        leaf.castShadow = true;
        
        group.add(leaf);
        leaves.push(leaf);
    }
    
    // Add glow
    const glowGeometry = new THREE.CylinderGeometry(width * 0.8, width * 0.4, height * 0.8, 8);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0x88ffaa,
        transparent: true,
        opacity: 0.15
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.position.y = height * 0.6;
    group.add(glow);
    
    return {
        stem: stem,
        leaves: leaves,
        glow: glow,
        swayPhase: Math.random() * Math.PI * 2
    };
}

/**
 * Create a glowing flower
 * @param {THREE.Group} group - Group to add flower to
 * @returns {Object} - Flower object with animation properties
 */
function createGlowingFlower(group) {
    // Random flower properties
    const height = 0.4 + Math.random() * 0.5;
    const petalSize = 0.15 + Math.random() * 0.2;
    
    // Create stem
    const stemGeometry = new THREE.CylinderGeometry(0.02, 0.04, height, 6);
    const stemMaterial = new THREE.MeshStandardMaterial({
        color: 0x55aa55,
        roughness: 0.8,
        metalness: 0.1
    });
    const stem = new THREE.Mesh(stemGeometry, stemMaterial);
    stem.position.y = height / 2;
    stem.castShadow = true;
    group.add(stem);
    
    // Create flower center
    const centerGeometry = new THREE.SphereGeometry(petalSize * 0.3, 8, 8);
    const centerMaterial = new THREE.MeshStandardMaterial({
        color: 0xffff44,
        roughness: 0.5,
        metalness: 0.3,
        emissive: 0xaaaa22,
        emissiveIntensity: 0.5
    });
    const center = new THREE.Mesh(centerGeometry, centerMaterial);
    center.position.y = height;
    center.castShadow = true;
    group.add(center);
    
    // Create petals
    const petals = [];
    const petalCount = 5 + Math.floor(Math.random() * 3);
    
    // Pick a random color scheme
    const colorSchemes = [
        { color: 0xff88ff, emissive: 0xcc66cc }, // Purple
        { color: 0xff8888, emissive: 0xcc6666 }, // Red
        { color: 0xffaa66, emissive: 0xcc8844 }  // Orange
    ];
    
    const colorScheme = colorSchemes[Math.floor(Math.random() * colorSchemes.length)];
    
    for (let i = 0; i < petalCount; i++) {
        const angle = (i / petalCount) * Math.PI * 2;
        
        // Create petal
        const petalGeometry = new THREE.CircleGeometry(petalSize, 8);
        const petalMaterial = new THREE.MeshStandardMaterial({
            color: colorScheme.color,
            roughness: 0.7,
            metalness: 0.2,
            emissive: colorScheme.emissive,
            emissiveIntensity: 0.4,
            side: THREE.DoubleSide
        });
        const petal = new THREE.Mesh(petalGeometry, petalMaterial);
        
        // Position and rotate petal
        petal.position.set(
            Math.cos(angle) * petalSize * 0.7,
            height,
            Math.sin(angle) * petalSize * 0.7
        );
        petal.lookAt(center.position);
        petal.rotation.y += Math.PI;
        petal.castShadow = true;
        
        group.add(petal);
        petals.push(petal);
    }
    
    // Add glow
    const glowGeometry = new THREE.SphereGeometry(petalSize * 2, 16, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: colorScheme.color,
        transparent: true,
        opacity: 0.2
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.position.y = height;
    group.add(glow);
    
    return {
        stem: stem,
        center: center,
        petals: petals,
        glow: glow,
        pulsePhase: Math.random() * Math.PI * 2,
        petalPhase: Math.random() * Math.PI * 2
    };
}

/**
 * Create flowing streams
 */
function createStreams() {
    for (let i = 0; i < STREAM_COUNT; i++) {
        // Random stream properties
        const startAngle = (i / STREAM_COUNT) * Math.PI * 2;
        const startRadius = 10;
        
        const startX = Math.cos(startAngle) * startRadius;
        const startZ = Math.sin(startAngle) * startRadius;
        const startY = TREE_Y_RANGE.min + Math.random() * (TREE_Y_RANGE.max - TREE_Y_RANGE.min) - 1;
        
        const width = STREAM_WIDTH_RANGE.min + Math.random() * (STREAM_WIDTH_RANGE.max - STREAM_WIDTH_RANGE.min);
        const length = STREAM_LENGTH_RANGE.min + Math.random() * (STREAM_LENGTH_RANGE.max - STREAM_LENGTH_RANGE.min);
        
        // Create stream
        const stream = createStream(startX, startY, startZ, width, length);
        
        // Add to theme objects
        dreamscape.themes.forests.objects.push(stream.group);
        
        // Add to forest objects
        forestState.streams.push(stream);
    }
}

/**
 * Create a flowing stream
 * @param {number} startX - Start X position
 * @param {number} startY - Start Y position
 * @param {number} startZ - Start Z position
 * @param {number} width - Stream width
 * @param {number} length - Stream length
 * @returns {Object} - Stream object with mesh and animation properties
 */
function createStream(startX, startY, startZ, width, length) {
    // Create a group for the stream
    const group = new THREE.Group();
    group.position.set(startX, startY, startZ);
    
    // Create stream path (curve)
    const curvePoints = [];
    const segmentCount = Math.floor(length / 5);
    let currentX = 0;
    let currentZ = 0;
    let direction = 0;
    
    for (let i = 0; i < segmentCount; i++) {
        // Add some randomness to direction
        direction += (Math.random() - 0.5) * 0.5;
        
        // Move forward in current direction
        currentX += Math.cos(direction) * 5;
        currentZ += Math.sin(direction) * 5;
        
        // Add point
        curvePoints.push(new THREE.Vector3(currentX, 0, currentZ));
    }
    
    const curve = new THREE.CatmullRomCurve3(curvePoints);
    
    // Create stream mesh
    const streamGeometry = new THREE.TubeGeometry(curve, segmentCount * 4, width * 0.5, 8, false);
    const streamMaterial = new THREE.MeshStandardMaterial({
        color: 0x44aaff,
        roughness: 0.4,
        metalness: 0.6,
        emissive: 0x2266aa,
        emissiveIntensity: 0.3,
        transparent: true,
        opacity: 0.8
    });
    const streamMesh = new THREE.Mesh(streamGeometry, streamMaterial);
    group.add(streamMesh);
    
    // Create particles for bubbles/flow
    const particleGroup = new THREE.Group();
    const particles = [];
    const particleCount = Math.floor(length / 2);
    
    for (let i = 0; i < particleCount; i++) {
        // Random position along curve
        const t = Math.random();
        const pos = curve.getPoint(t);
        
        // Create particle
        const particleGeometry = new THREE.SphereGeometry(0.1 + Math.random() * 0.2, 8, 8);
        const particleMaterial = new THREE.MeshBasicMaterial({
            color: 0xaaddff,
            transparent: true,
            opacity: 0.7
        });
        const particle = new THREE.Mesh(particleGeometry, particleMaterial);
        particle.position.copy(pos);
        particle.position.y += 0.1 + Math.random() * 0.2;
        
        // Add to group
        particleGroup.add(particle);
        
        // Store particle data
        particles.push({
            mesh: particle,
            t: t,
            speed: 0.001 + Math.random() * 0.002,
            size: particle.scale.x
        });
    }
    
    group.add(particleGroup);
    
    // Add to scene
    scene.add(group);
    
    // Create stream object with animation properties
    const stream = {
        group: group,
        mesh: streamMesh,
        particles: particles,
        curve: curve,
        flowSpeed: 0.5 + Math.random() * 0.5,
        flowPhase: Math.random() * Math.PI * 2
    };
    
    return stream;
}

/**
 * Update forests theme
 * @param {number} deltaTime - Time since last update
 * @param {number} gameTime - Total game time
 */
function updateForests(deltaTime, gameTime) {
    // Update animation time
    forestState.time += deltaTime;
    
    // Update trees
    for (let i = 0; i < forestState.trees.length; i++) {
        updateTree(forestState.trees[i], deltaTime, forestState.time);
    }
    
    // Update plants
    for (let i = 0; i < forestState.plants.length; i++) {
        updatePlant(forestState.plants[i], deltaTime, forestState.time);
    }
    
    // Update streams
    for (let i = 0; i < forestState.streams.length; i++) {
        updateStream(forestState.streams[i], deltaTime, forestState.time);
    }
}

/**
 * Update a tree's animation
 * @param {Object} tree - Tree object to update
 * @param {number} deltaTime - Time since last update
 * @param {number} time - Current animation time
 */
function updateTree(tree, deltaTime, time) {
    // Sway animation
    const swayAngle = Math.sin(time * forestState.swaySpeed + tree.swayPhase) * tree.swayAmount;
    tree.group.rotation.x = swayAngle;
    tree.group.rotation.z = swayAngle * 0.7;
    
    // Glow pulse
    const pulseFactor = 0.15 + Math.sin(time * forestState.glowPulseSpeed + tree.glowPulsePhase) * 0.05;
    tree.glow.material.opacity = pulseFactor;
}

/**
 * Update a plant's animation
 * @param {Object} plant - Plant object to update
 * @param {number} deltaTime - Time since last update
 * @param {number} time - Current animation time
 */
function updatePlant(plant, deltaTime, time) {
    switch (plant.type) {
        case 0: // Mushroom
            // Pulse glow
            const mushroomPulse = 0.2 + Math.sin(time * forestState.glowPulseSpeed * 1.2 + plant.pulsePhase) * 0.1;
            plant.glow.material.opacity = mushroomPulse;
            break;
            
        case 1: // Fern
            // Sway leaves
            for (let i = 0; i < plant.leaves.length; i++) {
                const leaf = plant.leaves[i];
                const swayPhase = plant.swayPhase + i * 0.5;
                const swayAngle = Math.sin(time * forestState.swaySpeed * 1.5 + swayPhase) * 0.1;
                leaf.rotation.z += (swayAngle - leaf.rotation.z) * 0.1;
            }
            break;
            
        case 2: // Flower
            // Pulse glow
            const flowerPulse = 0.2 + Math.sin(time * forestState.glowPulseSpeed + plant.pulsePhase) * 0.1;
            plant.glow.material.opacity = flowerPulse;
            
            // Animate petals
            for (let i = 0; i < plant.petals.length; i++) {
                const petal = plant.petals[i];
                const petalPhase = plant.petalPhase + i * (Math.PI * 2 / plant.petals.length);
                const petalPulse = Math.sin(time * 1.5 + petalPhase) * 0.1;
                petal.scale.set(1 + petalPulse, 1 + petalPulse, 1);
            }
            break;
    }
}

/**
 * Update a stream's animation
 * @param {Object} stream - Stream object to update
 * @param {number} deltaTime - Time since last update
 * @param {number} time - Current animation time
 */
function updateStream(stream, deltaTime, time) {
    // Animate flow texture
    if (stream.mesh.material.map) {
        stream.mesh.material.map.offset.y -= deltaTime * stream.flowSpeed;
    }
    
    // Animate opacity
    const opacityPulse = 0.7 + Math.sin(time * 1.2 + stream.flowPhase) * 0.1;
    stream.mesh.material.opacity = opacityPulse;
    
    // Update particles
    for (let i = 0; i < stream.particles.length; i++) {
        const particle = stream.particles[i];
        
        // Move along curve
        particle.t += particle.speed;
        if (particle.t > 1) {
            particle.t = 0;
        }
        
        const pos = stream.curve.getPoint(particle.t);
        particle.mesh.position.copy(pos);
        particle.mesh.position.y = 0.1 + Math.sin(time * 3 + i) * 0.1;
        
        // Pulse size
        const sizePulse = particle.size * (0.8 + Math.sin(time * 4 + i * 2) * 0.2);
        particle.mesh.scale.set(sizePulse, sizePulse, sizePulse);
    }
} 