/**
 * Dream Kite - Dream Sparks System
 * 
 * This file handles the generation and management of dream sparks, 
 * which are collectibles that repair/extend the kite's string and increase score.
 */

// Constants
const SPARK_COUNT = 30;
const SPARK_SIZE_RANGE = { min: 0.2, max: 0.5 };
const SPARK_Y_RANGE = { min: -5, max: 25 };
const SPARK_VALUE_RANGE = { min: 5, max: 15 }; // Health and score points
const SPARK_COLOR_OPTIONS = [
    { color: 0x88ffff, emissive: 0x44aaaa }, // Cyan
    { color: 0xff88ff, emissive: 0xaa44aa }, // Magenta
    { color: 0xffff88, emissive: 0xaaaa44 }, // Yellow
    { color: 0x88ff88, emissive: 0x44aa44 }  // Green
];

// Sparks system state
let sparksSystem = {
    // Array of spark objects
    sparks: [],
    
    // Animation time
    time: 0,
    
    // Animation parameters
    rotationSpeed: 1.0,
    floatSpeed: 0.5,
    pulseSpeed: 1.5,
    
    // Collection settings
    collectionRadius: 2.0, // How close the kite needs to be to collect
    spawnDelay: 0, // Time until next spawn
    maxSpawnDelay: 2.0, // Maximum time between spawns
    
    // Clusters
    clusterCenters: []
};

/**
 * Initialize the spark system
 */
function initSparks() {
    // Reset spark state
    sparksSystem.sparks = [];
    sparksSystem.time = 0;
    sparksSystem.spawnDelay = 0;
    sparksSystem.clusterCenters = [];
    
    // Create initial spark clusters
    createSparkClusters();
}

/**
 * Create initial spark clusters
 */
function createSparkClusters() {
    // Create 3-5 cluster centers
    const clusterCount = 3 + Math.floor(Math.random() * 3);
    
    for (let i = 0; i < clusterCount; i++) {
        // Random cluster position in a sphere around the origin
        const angle = Math.random() * Math.PI * 2;
        const radius = 15 + Math.random() * 20;
        
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = SPARK_Y_RANGE.min + Math.random() * (SPARK_Y_RANGE.max - SPARK_Y_RANGE.min);
        
        // Add cluster center
        sparksSystem.clusterCenters.push({
            position: new THREE.Vector3(x, y, z),
            radius: 5 + Math.random() * 5, // Cluster radius
            sparkCount: 2 + Math.floor(Math.random() * 4) // Sparks in this cluster
        });
    }
    
    // Fill clusters with sparks
    for (let i = 0; i < sparksSystem.clusterCenters.length; i++) {
        const cluster = sparksSystem.clusterCenters[i];
        for (let j = 0; j < cluster.sparkCount; j++) {
            // Random position within cluster radius
            const angle = Math.random() * Math.PI * 2;
            const heightAngle = Math.random() * Math.PI - Math.PI / 2;
            const radius = Math.random() * cluster.radius;
            
            const x = cluster.position.x + Math.cos(angle) * Math.cos(heightAngle) * radius;
            const y = cluster.position.y + Math.sin(heightAngle) * radius;
            const z = cluster.position.z + Math.sin(angle) * Math.cos(heightAngle) * radius;
            
            // Random spark size
            const size = SPARK_SIZE_RANGE.min + Math.random() * (SPARK_SIZE_RANGE.max - SPARK_SIZE_RANGE.min);
            
            // Create spark
            const spark = createSpark(x, y, z, size);
            
            // Add to sparks array
            sparksSystem.sparks.push(spark);
        }
    }
    
    // Add additional random sparks to reach SPARK_COUNT
    while (sparksSystem.sparks.length < SPARK_COUNT) {
        // Random position in a sphere around the origin
        const angle = Math.random() * Math.PI * 2;
        const heightAngle = Math.random() * Math.PI - Math.PI / 2;
        const radius = 10 + Math.random() * 30;
        
        const x = Math.cos(angle) * Math.cos(heightAngle) * radius;
        const y = SPARK_Y_RANGE.min + Math.random() * (SPARK_Y_RANGE.max - SPARK_Y_RANGE.min);
        const z = Math.sin(angle) * Math.cos(heightAngle) * radius;
        
        // Random spark size
        const size = SPARK_SIZE_RANGE.min + Math.random() * (SPARK_SIZE_RANGE.max - SPARK_SIZE_RANGE.min);
        
        // Create spark
        const spark = createSpark(x, y, z, size);
        
        // Add to sparks array
        sparksSystem.sparks.push(spark);
    }
}

/**
 * Create a single spark
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} z - Z position
 * @param {number} size - Spark size
 * @returns {Object} - Spark object with mesh and properties
 */
function createSpark(x, y, z, size) {
    // Create a group for the spark
    const group = new THREE.Group();
    group.position.set(x, y, z);
    
    // Choose a random color from options
    const colorIndex = Math.floor(Math.random() * SPARK_COLOR_OPTIONS.length);
    const colorOption = SPARK_COLOR_OPTIONS[colorIndex];
    
    // Create spark geometry
    const coreGeometry = new THREE.IcosahedronGeometry(size * 0.5, 1);
    const coreMaterial = new THREE.MeshStandardMaterial({
        color: colorOption.color,
        roughness: 0.3,
        metalness: 0.8,
        emissive: colorOption.emissive,
        emissiveIntensity: 1.0
    });
    
    // Create spark mesh
    const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
    group.add(coreMesh);
    
    // Add glow effect
    const glowGeometry = new THREE.SphereGeometry(size, 16, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: colorOption.color,
        transparent: true,
        opacity: 0.4,
        side: THREE.BackSide
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    group.add(glow);
    
    // Add particles effect
    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 10;
    const particlePositions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const heightAngle = Math.random() * Math.PI - Math.PI / 2;
        const particleRadius = size * (0.8 + Math.random() * 0.5);
        
        particlePositions[i * 3] = Math.cos(angle) * Math.cos(heightAngle) * particleRadius;
        particlePositions[i * 3 + 1] = Math.sin(heightAngle) * particleRadius;
        particlePositions[i * 3 + 2] = Math.sin(angle) * Math.cos(heightAngle) * particleRadius;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
        color: colorOption.color,
        size: size * 0.15,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });
    
    const particles = new THREE.Points(particlesGeometry, particleMaterial);
    group.add(particles);
    
    // Add to scene
    scene.add(group);
    
    // Calculate value based on size (bigger = more valuable)
    const normalizedSize = (size - SPARK_SIZE_RANGE.min) / (SPARK_SIZE_RANGE.max - SPARK_SIZE_RANGE.min);
    const value = Math.floor(SPARK_VALUE_RANGE.min + normalizedSize * (SPARK_VALUE_RANGE.max - SPARK_VALUE_RANGE.min));
    
    // Create spark object with animation properties
    const spark = {
        group: group,
        core: coreMesh,
        glow: glow,
        particles: particles,
        particlesPositions: particlePositions,
        size: size,
        value: value,
        rotationAxis: new THREE.Vector3(
            Math.random() - 0.5,
            Math.random() - 0.5,
            Math.random() - 0.5
        ).normalize(),
        rotationSpeed: 0.5 + Math.random() * 1.5,
        pulsePhase: Math.random() * Math.PI * 2,
        floatCenter: new THREE.Vector3(x, y, z),
        floatRadius: 0.5 + Math.random() * 0.5,
        floatSpeed: 0.2 + Math.random() * 0.5,
        floatPhase: Math.random() * Math.PI * 2,
        collected: false // Flag to mark when collected
    };
    
    return spark;
}

/**
 * Spawn a new spark
 */
function spawnSpark() {
    // Random position in a sphere around the origin
    const angle = Math.random() * Math.PI * 2;
    const heightAngle = Math.random() * Math.PI - Math.PI / 2;
    const radius = 15 + Math.random() * 25;
    
    const x = Math.cos(angle) * Math.cos(heightAngle) * radius;
    const y = SPARK_Y_RANGE.min + Math.random() * (SPARK_Y_RANGE.max - SPARK_Y_RANGE.min);
    const z = Math.sin(angle) * Math.cos(heightAngle) * radius;
    
    // Random spark size
    const size = SPARK_SIZE_RANGE.min + Math.random() * (SPARK_SIZE_RANGE.max - SPARK_SIZE_RANGE.min);
    
    // Create spark
    const spark = createSpark(x, y, z, size);
    
    // Add to sparks array
    sparksSystem.sparks.push(spark);
}

/**
 * Update spark system
 * @param {number} deltaTime - Time since last update
 * @param {Object} kitePosition - Position of the kite for collision detection
 */
function updateSparks(deltaTime, kitePosition) {
    // Update animation time
    sparksSystem.time += deltaTime;
    
    // Update spawn delay
    sparksSystem.spawnDelay -= deltaTime;
    
    // Check if we need to spawn new sparks
    if (sparksSystem.spawnDelay <= 0 && sparksSystem.sparks.length < SPARK_COUNT) {
        spawnSpark();
        sparksSystem.spawnDelay = sparksSystem.maxSpawnDelay;
    }
    
    // Update sparks
    for (let i = sparksSystem.sparks.length - 1; i >= 0; i--) {
        const spark = sparksSystem.sparks[i];
        
        // Skip collected sparks
        if (spark.collected) {
            continue;
        }
        
        // Check if kite collected this spark
        if (kitePosition && kitePosition.distanceTo(spark.group.position) < sparksSystem.collectionRadius) {
            collectSpark(spark);
            continue;
        }
        
        // Update spark animation
        updateSpark(spark, deltaTime, sparksSystem.time);
    }
    
    // Remove collected sparks
    sparksSystem.sparks = sparksSystem.sparks.filter(spark => !spark.collected);
}

/**
 * Update a single spark's animation
 * @param {Object} spark - Spark object to update
 * @param {number} deltaTime - Time since last update
 * @param {number} time - Current animation time
 */
function updateSpark(spark, deltaTime, time) {
    // Rotate spark
    spark.core.rotateOnAxis(spark.rotationAxis, spark.rotationSpeed * deltaTime);
    
    // Float movement
    const floatAngle = time * spark.floatSpeed + spark.floatPhase;
    const floatX = spark.floatCenter.x + Math.cos(floatAngle) * spark.floatRadius;
    const floatZ = spark.floatCenter.z + Math.sin(floatAngle) * spark.floatRadius;
    
    spark.group.position.set(
        floatX,
        spark.floatCenter.y + Math.sin(floatAngle * 1.5) * spark.floatRadius * 0.5,
        floatZ
    );
    
    // Pulse glow
    const pulseFactor = 0.3 + Math.sin(time * sparksSystem.pulseSpeed + spark.pulsePhase) * 0.15;
    spark.glow.material.opacity = pulseFactor;
    
    // Animate particles
    const particlePositions = spark.particlesPositions;
    for (let i = 0; i < particlePositions.length / 3; i++) {
        const angle = time * 0.5 + i * 0.6;
        const offsetX = Math.cos(angle) * 0.05;
        const offsetY = Math.sin(angle) * 0.05;
        const offsetZ = Math.cos(angle * 1.5) * 0.05;
        
        const originalX = particlePositions[i * 3] - offsetX;
        const originalY = particlePositions[i * 3 + 1] - offsetY;
        const originalZ = particlePositions[i * 3 + 2] - offsetZ;
        
        particlePositions[i * 3] = originalX + offsetX;
        particlePositions[i * 3 + 1] = originalY + offsetY;
        particlePositions[i * 3 + 2] = originalZ + offsetZ;
    }
    
    spark.particles.geometry.attributes.position.needsUpdate = true;
}

/**
 * Collect a spark
 * @param {Object} spark - Spark to collect
 */
function collectSpark(spark) {
    // Mark as collected
    spark.collected = true;
    
    // Update score
    increaseScore(spark.value);
    
    // Update string health
    increaseStringHealth(spark.value);
    
    // Play collection effect
    playSparkCollectionEffect(spark);
    
    // Remove from scene after effect completes
    setTimeout(() => {
        scene.remove(spark.group);
    }, 1000);
}

/**
 * Create a visual effect when a spark is collected
 * @param {Object} spark - Collected spark
 */
function playSparkCollectionEffect(spark) {
    // Animation for collection effect
    const startScale = spark.group.scale.x;
    const animateCollection = () => {
        spark.group.scale.multiplyScalar(1.1);
        spark.glow.material.opacity *= 1.2;
        
        if (spark.group.scale.x < startScale * 3) {
            requestAnimationFrame(animateCollection);
        } else {
            scene.remove(spark.group);
        }
    };
    
    // Start animation
    animateCollection();
} 