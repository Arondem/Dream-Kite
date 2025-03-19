/**
 * Dream Kite - Obstacles System
 * 
 * This file handles the generation and updating of obstacles that the kite must avoid.
 * Includes spinning cubes, drifting ribbons, and other abstract shapes.
 */

// Constants
const OBSTACLE_COUNT = 20;
const OBSTACLE_SIZE_RANGE = { min: 1, max: 4 };
const OBSTACLE_Y_RANGE = { min: -10, max: 30 };
const OBSTACLE_DISTANCE_RANGE = { min: 10, max: 40 };
const RIBBON_COUNT = 10;
const RIBBON_LENGTH_RANGE = { min: 10, max: 30 };
const RIBBON_WIDTH_RANGE = { min: 0.5, max: 1.5 };

// Obstacle system state
let obstacleSystem = {
    // Arrays for different obstacle types
    obstacles: [],
    ribbons: [],
    
    // Animation time
    time: 0,
    
    // Animation parameters
    spinSpeed: 1.0,
    driftSpeed: 0.5,
    
    // Difficulty scaling
    difficulty: 0 // 0-1 scale
};

/**
 * Initialize the obstacle system
 */
function initObstacles() {
    // Reset obstacle state
    obstacleSystem.obstacles = [];
    obstacleSystem.ribbons = [];
    obstacleSystem.time = 0;
    obstacleSystem.difficulty = 0;
    
    // Create initial obstacles
    createObstacles();
    
    // Create initial ribbons
    createRibbons();
}

/**
 * Create obstacles
 */
function createObstacles() {
    for (let i = 0; i < OBSTACLE_COUNT; i++) {
        // Random position in a sphere around the origin
        const angle = Math.random() * Math.PI * 2;
        const radius = OBSTACLE_DISTANCE_RANGE.min + Math.random() * (OBSTACLE_DISTANCE_RANGE.max - OBSTACLE_DISTANCE_RANGE.min);
        
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = OBSTACLE_Y_RANGE.min + Math.random() * (OBSTACLE_Y_RANGE.max - OBSTACLE_Y_RANGE.min);
        
        // Random obstacle size
        const size = OBSTACLE_SIZE_RANGE.min + Math.random() * (OBSTACLE_SIZE_RANGE.max - OBSTACLE_SIZE_RANGE.min);
        
        // Create obstacle
        const obstacle = createObstacle(x, y, z, size);
        
        // Add to obstacles array
        obstacleSystem.obstacles.push(obstacle);
    }
}

/**
 * Create a single obstacle
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} z - Z position
 * @param {number} size - Obstacle size
 * @returns {Object} - Obstacle object with mesh and animation properties
 */
function createObstacle(x, y, z, size) {
    // Create a group for the obstacle
    const group = new THREE.Group();
    group.position.set(x, y, z);
    
    // Random obstacle type
    const obstacleType = Math.floor(Math.random() * 3);
    let geometry;
    
    switch (obstacleType) {
        case 0: // Cube
            geometry = new THREE.BoxGeometry(size, size, size);
            break;
        case 1: // Octahedron
            geometry = new THREE.OctahedronGeometry(size * 0.7);
            break;
        case 2: // Tetrahedron
            geometry = new THREE.TetrahedronGeometry(size * 0.8);
            break;
    }
    
    // Create obstacle material
    const obstacleMaterial = new THREE.MeshStandardMaterial({
        color: 0xff4444,
        roughness: 0.6,
        metalness: 0.4,
        emissive: 0x662222,
        emissiveIntensity: 0.3
    });
    
    // Create obstacle mesh
    const obstacleMesh = new THREE.Mesh(geometry, obstacleMaterial);
    obstacleMesh.castShadow = true;
    obstacleMesh.receiveShadow = true;
    group.add(obstacleMesh);
    
    // Add glow effect
    const glowGeometry = new THREE.SphereGeometry(size * 1.2, 16, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xff6666,
        transparent: true,
        opacity: 0.15,
        side: THREE.BackSide
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    group.add(glow);
    
    // Create physics body
    const shape = new CANNON.Box(new CANNON.Vec3(size * 0.5, size * 0.5, size * 0.5));
    const body = new CANNON.Body({
        mass: 0, // Static body
        shape: shape,
        position: new CANNON.Vec3(x, y, z)
    });
    
    // Add to physics world
    world.addBody(body);
    
    // Add to scene
    scene.add(group);
    
    // Create obstacle object with animation parameters
    const obstacle = {
        group: group,
        mesh: obstacleMesh,
        glow: glow,
        body: body,
        type: obstacleType,
        size: size,
        spinAxis: new THREE.Vector3(
            Math.random() - 0.5,
            Math.random() - 0.5,
            Math.random() - 0.5
        ).normalize(),
        spinPhase: Math.random() * Math.PI * 2,
        driftCenter: new THREE.Vector3(x, y, z),
        driftRadius: 1 + Math.random() * 2,
        driftSpeed: 0.2 + Math.random() * 0.3,
        driftPhase: Math.random() * Math.PI * 2
    };
    
    return obstacle;
}

/**
 * Create ribbons
 */
function createRibbons() {
    for (let i = 0; i < RIBBON_COUNT; i++) {
        // Random ribbon properties
        const startAngle = (i / RIBBON_COUNT) * Math.PI * 2;
        const radius = OBSTACLE_DISTANCE_RANGE.min + Math.random() * (OBSTACLE_DISTANCE_RANGE.max - OBSTACLE_DISTANCE_RANGE.min);
        
        const startX = Math.cos(startAngle) * radius;
        const startZ = Math.sin(startAngle) * radius;
        const startY = OBSTACLE_Y_RANGE.min + Math.random() * (OBSTACLE_Y_RANGE.max - OBSTACLE_Y_RANGE.min);
        
        const length = RIBBON_LENGTH_RANGE.min + Math.random() * (RIBBON_LENGTH_RANGE.max - RIBBON_LENGTH_RANGE.min);
        const width = RIBBON_WIDTH_RANGE.min + Math.random() * (RIBBON_WIDTH_RANGE.max - RIBBON_WIDTH_RANGE.min);
        
        // Create ribbon
        const ribbon = createRibbon(startX, startY, startZ, length, width);
        
        // Add to ribbons array
        obstacleSystem.ribbons.push(ribbon);
    }
}

/**
 * Create a single ribbon
 * @param {number} startX - Start X position
 * @param {number} startY - Start Y position
 * @param {number} startZ - Start Z position
 * @param {number} length - Ribbon length
 * @param {number} width - Ribbon width
 * @returns {Object} - Ribbon object with mesh and animation properties
 */
function createRibbon(startX, startY, startZ, length, width) {
    // Create a group for the ribbon
    const group = new THREE.Group();
    group.position.set(startX, startY, startZ);
    
    // Create ribbon curve
    const curvePoints = [];
    const segments = Math.floor(length / 2);
    let currentX = 0;
    let currentY = 0;
    let currentZ = 0;
    let direction = new THREE.Vector3(
        Math.random() - 0.5,
        Math.random() - 0.5,
        Math.random() - 0.5
    ).normalize();
    
    for (let i = 0; i < segments; i++) {
        // Add some randomness to direction
        direction.add(new THREE.Vector3(
            (Math.random() - 0.5) * 0.2,
            (Math.random() - 0.5) * 0.2,
            (Math.random() - 0.5) * 0.2
        )).normalize();
        
        // Move forward in current direction
        currentX += direction.x * 2;
        currentY += direction.y * 2;
        currentZ += direction.z * 2;
        
        // Add point
        curvePoints.push(new THREE.Vector3(currentX, currentY, currentZ));
    }
    
    const curve = new THREE.CatmullRomCurve3(curvePoints);
    
    // Create ribbon geometry
    const ribbonGeometry = new THREE.TubeGeometry(curve, segments * 4, width * 0.5, 8, false);
    const ribbonMaterial = new THREE.MeshStandardMaterial({
        color: 0x44ff44,
        roughness: 0.4,
        metalness: 0.6,
        emissive: 0x226622,
        emissiveIntensity: 0.3,
        transparent: true,
        opacity: 0.8
    });
    
    // Create ribbon mesh
    const ribbonMesh = new THREE.Mesh(ribbonGeometry, ribbonMaterial);
    ribbonMesh.castShadow = true;
    ribbonMesh.receiveShadow = true;
    group.add(ribbonMesh);
    
    // Create physics body (simplified as a series of spheres along the curve)
    const sphereShape = new CANNON.Sphere(width);
    const sphereCount = Math.floor(segments / 2);
    const bodies = [];
    
    for (let i = 0; i < sphereCount; i++) {
        const t = i / (sphereCount - 1);
        const pos = curve.getPoint(t);
        
        const body = new CANNON.Body({
            mass: 0, // Static body
            shape: sphereShape,
            position: new CANNON.Vec3(
                startX + pos.x,
                startY + pos.y,
                startZ + pos.z
            )
        });
        
        world.addBody(body);
        bodies.push(body);
    }
    
    // Add to scene
    scene.add(group);
    
    // Create ribbon object with animation properties
    const ribbon = {
        group: group,
        mesh: ribbonMesh,
        curve: curve,
        bodies: bodies,
        wavePhase: Math.random() * Math.PI * 2,
        waveSpeed: 0.5 + Math.random() * 0.5,
        waveAmplitude: 0.2 + Math.random() * 0.3,
        driftCenter: new THREE.Vector3(startX, startY, startZ),
        driftRadius: 1 + Math.random() * 2,
        driftSpeed: 0.1 + Math.random() * 0.2,
        driftPhase: Math.random() * Math.PI * 2
    };
    
    return ribbon;
}

/**
 * Update obstacle system
 * @param {number} deltaTime - Time since last update
 * @param {number} gameTime - Total game time
 */
function updateObstacles(deltaTime, gameTime) {
    // Update animation time
    obstacleSystem.time += deltaTime;
    
    // Update difficulty based on game time
    obstacleSystem.difficulty = Math.min(gameTime / 120, 1); // Max difficulty after 2 minutes
    
    // Update obstacles
    for (let i = 0; i < obstacleSystem.obstacles.length; i++) {
        updateObstacle(obstacleSystem.obstacles[i], deltaTime, obstacleSystem.time);
    }
    
    // Update ribbons
    for (let i = 0; i < obstacleSystem.ribbons.length; i++) {
        updateRibbon(obstacleSystem.ribbons[i], deltaTime, obstacleSystem.time);
    }
}

/**
 * Update a single obstacle
 * @param {Object} obstacle - Obstacle object to update
 * @param {number} deltaTime - Time since last update
 * @param {number} time - Current animation time
 */
function updateObstacle(obstacle, deltaTime, time) {
    // Spin animation (faster with higher difficulty)
    const spinSpeed = obstacleSystem.spinSpeed * (1 + obstacleSystem.difficulty);
    const spinAngle = deltaTime * spinSpeed;
    obstacle.group.rotateOnAxis(obstacle.spinAxis, spinAngle);
    
    // Drift movement
    const driftAngle = time * obstacle.driftSpeed + obstacle.driftPhase;
    const driftX = obstacle.driftCenter.x + Math.cos(driftAngle) * obstacle.driftRadius;
    const driftZ = obstacle.driftCenter.z + Math.sin(driftAngle) * obstacle.driftRadius;
    
    obstacle.group.position.set(
        driftX,
        obstacle.driftCenter.y,
        driftZ
    );
    
    // Update physics body position
    obstacle.body.position.copy(obstacle.group.position);
    obstacle.body.quaternion.copy(obstacle.group.quaternion);
}

/**
 * Update a single ribbon
 * @param {Object} ribbon - Ribbon object to update
 * @param {number} deltaTime - Time since last update
 * @param {number} time - Current animation time
 */
function updateRibbon(ribbon, deltaTime, time) {
    // Wave animation
    const points = ribbon.curve.points;
    for (let i = 0; i < points.length; i++) {
        const t = i / points.length;
        const waveOffset = Math.sin(time * ribbon.waveSpeed + ribbon.wavePhase + t * Math.PI * 4) * ribbon.waveAmplitude;
        points[i].y = points[i]._baseY + waveOffset;
    }
    ribbon.curve.updateArcLengths();
    
    // Update ribbon geometry
    ribbon.mesh.geometry.dispose();
    ribbon.mesh.geometry = new THREE.TubeGeometry(ribbon.curve, points.length * 4, ribbon.mesh.geometry.parameters.radius, 8, false);
    
    // Drift movement
    const driftAngle = time * ribbon.driftSpeed + ribbon.driftPhase;
    const driftX = ribbon.driftCenter.x + Math.cos(driftAngle) * ribbon.driftRadius;
    const driftZ = ribbon.driftCenter.z + Math.sin(driftAngle) * ribbon.driftRadius;
    
    ribbon.group.position.set(
        driftX,
        ribbon.driftCenter.y,
        driftZ
    );
    
    // Update physics bodies
    for (let i = 0; i < ribbon.bodies.length; i++) {
        const t = i / (ribbon.bodies.length - 1);
        const pos = ribbon.curve.getPoint(t);
        ribbon.bodies[i].position.set(
            ribbon.group.position.x + pos.x,
            ribbon.group.position.y + pos.y,
            ribbon.group.position.z + pos.z
        );
    }
}

/**
 * Check for collisions between the kite and obstacles
 * @param {Object} kite - Kite object to check collisions for
 * @returns {boolean} - Whether a collision occurred
 */
function checkObstacleCollisions(kite) {
    // Check collisions with obstacles
    for (let i = 0; i < obstacleSystem.obstacles.length; i++) {
        const obstacle = obstacleSystem.obstacles[i];
        if (kite.body.position.distanceTo(obstacle.body.position) < (kite.size + obstacle.size) * 0.5) {
            return true;
        }
    }
    
    // Check collisions with ribbon segments
    for (let i = 0; i < obstacleSystem.ribbons.length; i++) {
        const ribbon = obstacleSystem.ribbons[i];
        for (let j = 0; j < ribbon.bodies.length; j++) {
            const body = ribbon.bodies[j];
            if (kite.body.position.distanceTo(body.position) < (kite.size + body.shapes[0].radius) * 0.5) {
                return true;
            }
        }
    }
    
    return false;
}

/**
 * Check if the kite's string intersects with any obstacles
 * @param {Array} stringPoints - Array of points representing the kite string
 * @returns {boolean} - Whether the string intersects with any obstacles
 */
function checkStringIntersections(stringPoints) {
    // Create line segments from string points
    for (let i = 0; i < stringPoints.length - 1; i++) {
        const start = stringPoints[i];
        const end = stringPoints[i + 1];
        
        // Check intersection with obstacles
        for (let j = 0; j < obstacleSystem.obstacles.length; j++) {
            const obstacle = obstacleSystem.obstacles[j];
            if (lineIntersectsSphere(start, end, obstacle.body.position, obstacle.size * 0.5)) {
                return true;
            }
        }
        
        // Check intersection with ribbon segments
        for (let j = 0; j < obstacleSystem.ribbons.length; j++) {
            const ribbon = obstacleSystem.ribbons[j];
            for (let k = 0; k < ribbon.bodies.length; k++) {
                const body = ribbon.bodies[k];
                if (lineIntersectsSphere(start, end, body.position, body.shapes[0].radius)) {
                    return true;
                }
            }
        }
    }
    
    return false;
}

/**
 * Check if a line segment intersects with a sphere
 * @param {THREE.Vector3} start - Start point of line segment
 * @param {THREE.Vector3} end - End point of line segment
 * @param {THREE.Vector3} center - Center of sphere
 * @param {number} radius - Radius of sphere
 * @returns {boolean} - Whether the line intersects the sphere
 */
function lineIntersectsSphere(start, end, center, radius) {
    const line = end.clone().sub(start);
    const lineLength = line.length();
    line.normalize();
    
    const startToCenter = center.clone().sub(start);
    const projection = startToCenter.dot(line);
    
    // Line segment is before or after sphere
    if (projection < 0 || projection > lineLength) {
        return start.distanceTo(center) < radius || end.distanceTo(center) < radius;
    }
    
    // Find closest point on line to sphere center
    const closest = start.clone().add(line.multiplyScalar(projection));
    
    return closest.distanceTo(center) < radius;
} 