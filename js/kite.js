/**
 * Dream Kite - Kite Physics and Rendering
 * 
 * This file handles the creation and updating of the kite object,
 * including its physics body and visual mesh.
 */

// Constants
const KITE_SIZE = 2; // Size of the kite
const KITE_MASS = 0.5; // Mass of the kite
const TAIL_SEGMENTS = 15; // Number of segments in the kite's tail
const TAIL_LENGTH = 10; // Length of the kite's tail

/**
 * Create a kite with physics body and visual mesh
 * @param {Object} position - Initial position {x, y, z}
 * @returns {Object} - Kite object with mesh, body, and update method
 */
function createKite(position = {x: 0, y: 10, z: 0}) {
    // Create a kite object to hold all components
    const kite = {
        mesh: null,
        body: null,
        tail: null,
        tailMeshes: [],
        tailPositions: Array(TAIL_SEGMENTS).fill().map(() => new THREE.Vector3()),
        update: null
    };
    
    // Create the visual kite mesh
    kite.mesh = createKiteMesh();
    scene.add(kite.mesh);
    
    // Create the physics body
    kite.body = createKiteBody(position);
    world.addBody(kite.body);
    
    // Create the kite tail
    kite.tail = createKiteTail();
    scene.add(kite.tail);
    
    // Define the update method
    kite.update = function(deltaTime) {
        updateKite(kite, deltaTime);
    };
    
    return kite;
}

/**
 * Create the visual mesh for the kite
 * @returns {THREE.Object3D} - Kite mesh
 */
function createKiteMesh() {
    // Create a group to hold the kite parts
    const kiteGroup = new THREE.Group();
    
    // Create the main diamond shape
    const kiteMaterial = new THREE.MeshStandardMaterial({
        color: 0x6a98f0, // Blue color
        emissive: 0x1c3b70,
        emissiveIntensity: 0.3,
        side: THREE.DoubleSide
    });
    
    // Create diamond-shaped geometry
    const kiteGeometry = new THREE.BufferGeometry();
    const vertices = new Float32Array([
        0, 0, 0,           // Center point
        -KITE_SIZE, 0, 0,  // Left point
        0, KITE_SIZE, 0,   // Top point
        KITE_SIZE, 0, 0,   // Right point
        0, -KITE_SIZE, 0   // Bottom point
    ]);
    
    const indices = [
        0, 1, 2, // Top left triangle
        0, 2, 3, // Top right triangle
        0, 3, 4, // Bottom right triangle
        0, 4, 1  // Bottom left triangle
    ];
    
    kiteGeometry.setIndex(indices);
    kiteGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    kiteGeometry.computeVertexNormals();
    
    const kiteMesh = new THREE.Mesh(kiteGeometry, kiteMaterial);
    kiteGroup.add(kiteMesh);
    
    // Add crossbar
    const crossbarGeometry = new THREE.CylinderGeometry(0.05, 0.05, KITE_SIZE * 2, 8);
    const crossbarMaterial = new THREE.MeshStandardMaterial({ color: 0x5a3921 }); // Brown
    const crossbar = new THREE.Mesh(crossbarGeometry, crossbarMaterial);
    crossbar.rotation.z = Math.PI / 2; // Rotate to horizontal
    kiteGroup.add(crossbar);
    
    // Add vertical spar
    const sparGeometry = new THREE.CylinderGeometry(0.05, 0.05, KITE_SIZE * 2, 8);
    const spar = new THREE.Mesh(sparGeometry, crossbarMaterial);
    kiteGroup.add(spar);
    
    // Add glow effect
    const glowGeometry = new THREE.CircleGeometry(KITE_SIZE * 1.2, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0x6a98f0,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.position.z = -0.1; // Slightly behind
    kiteGroup.add(glow);
    
    return kiteGroup;
}

/**
 * Create the physics body for the kite
 * @param {Object} position - Initial position {x, y, z}
 * @returns {CANNON.Body} - Physics body
 */
function createKiteBody(position) {
    // Create a physics body for the kite
    const kiteShape = new CANNON.Box(new CANNON.Vec3(KITE_SIZE/2, KITE_SIZE/2, 0.1));
    const kiteBody = new CANNON.Body({
        mass: KITE_MASS,
        position: new CANNON.Vec3(position.x, position.y, position.z),
        shape: kiteShape,
        angularDamping: 0.8, // Reduce spinning
        linearDamping: 0.3   // Add some air resistance
    });
    
    // Add wind interaction by setting material property
    kiteBody.material = new CANNON.Material('kiteMaterial');
    
    return kiteBody;
}

/**
 * Create the kite tail
 * @returns {THREE.Line} - Line representing the tail
 */
function createKiteTail() {
    // Create a curved line for the tail
    const tailGeometry = new THREE.BufferGeometry();
    
    // Create initial positions
    const points = Array(TAIL_SEGMENTS).fill().map((_, i) => {
        const t = i / (TAIL_SEGMENTS - 1);
        return new THREE.Vector3(0, -KITE_SIZE - t * TAIL_LENGTH, 0);
    });
    
    // Set tail positions
    tailGeometry.setFromPoints(points);
    
    // Create material with gradient
    const tailMaterial = new THREE.LineDashedMaterial({
        color: 0xff9e40,
        linewidth: 2,
        scale: 1,
        dashSize: 0.5,
        gapSize: 0.3,
    });
    
    const tail = new THREE.Line(tailGeometry, tailMaterial);
    tail.computeLineDistances(); // Required for dashed lines
    
    return tail;
}

/**
 * Update kite position, rotation, and tail
 * @param {Object} kite - Kite object with mesh, body, and tail
 * @param {number} deltaTime - Time since last update
 */
function updateKite(kite, deltaTime) {
    // Update mesh position and rotation from physics body
    kite.mesh.position.copy(kite.body.position);
    kite.mesh.quaternion.copy(kite.body.quaternion);
    
    // Update tail positions with a wave motion
    updateKiteTail(kite, deltaTime);
}

/**
 * Update the kite tail with a flowing wave effect
 * @param {Object} kite - Kite object with tail
 * @param {number} deltaTime - Time since last update
 */
function updateKiteTail(kite, deltaTime) {
    // Get the current time for wave animation
    const time = performance.now() * 0.001;
    
    // Start with kite position
    const kitePos = kite.mesh.position.clone();
    const kiteQuat = kite.mesh.quaternion.clone();
    
    // Calculate bottom center of kite in world space
    const bottomOffset = new THREE.Vector3(0, -KITE_SIZE, 0);
    bottomOffset.applyQuaternion(kiteQuat);
    const tailStart = kitePos.clone().add(bottomOffset);
    
    // Calculate tail direction based on kite orientation and velocity
    const tailDir = new THREE.Vector3(0, -1, 0);
    tailDir.applyQuaternion(kiteQuat);
    
    // Store positions for tail geometry
    const positions = [];
    
    for (let i = 0; i < TAIL_SEGMENTS; i++) {
        const t = i / (TAIL_SEGMENTS - 1);
        
        // Calculate segment position with wave effect
        const segmentPos = tailStart.clone();
        const segmentOffset = tailDir.clone().multiplyScalar(t * TAIL_LENGTH);
        
        // Add wave effect
        const waveOffsetX = Math.sin(time * 3 + t * 10) * 0.5 * t;
        const waveOffsetZ = Math.cos(time * 2 + t * 8) * 0.5 * t;
        
        segmentPos.add(segmentOffset);
        segmentPos.x += waveOffsetX;
        segmentPos.z += waveOffsetZ;
        
        // Store position
        positions.push(segmentPos.x, segmentPos.y, segmentPos.z);
        kite.tailPositions[i].copy(segmentPos);
    }
    
    // Update tail geometry
    kite.tail.geometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(positions, 3)
    );
    kite.tail.computeLineDistances(); // Required for dashed lines
}

/**
 * Apply wind force to the kite
 * @param {Object} kite - Kite object with physics body
 * @param {CANNON.Vec3} windVector - Direction and strength of wind
 */
function applyWindForce(kite, windVector) {
    // Get kite normal vector (perpendicular to kite surface)
    const kiteNormal = new CANNON.Vec3(0, 0, 1);
    kiteNormal.applyQuaternion(kite.body.quaternion);
    
    // Calculate dot product to determine how directly the wind hits the kite
    const dot = kiteNormal.dot(windVector);
    
    // If dot is negative, wind is hitting the front of the kite
    if (dot < 0) {
        // Calculate lift component (perpendicular to wind direction)
        const liftForceMagnitude = windVector.length() * Math.abs(dot) * 2.0;
        const liftDirection = new CANNON.Vec3();
        
        // The lift is perpendicular to both the wind direction and the kite's edge
        // We use a cross product to find this direction
        const kiteEdge = new CANNON.Vec3(1, 0, 0); // Kite horizontal edge in local coordinates
        kiteEdge.applyQuaternion(kite.body.quaternion); // Convert to world coordinates
        
        // First cross product to find plane normal
        const planeNormal = new CANNON.Vec3();
        windVector.cross(kiteEdge, planeNormal);
        planeNormal.normalize();
        
        // Second cross product to find lift direction
        windVector.cross(planeNormal, liftDirection);
        liftDirection.normalize();
        
        // Apply lift force
        const liftForce = liftDirection.scale(liftForceMagnitude);
        kite.body.applyForce(liftForce, kite.body.position);
        
        // Also apply some drag in the wind direction
        const dragForceMagnitude = windVector.length() * Math.abs(dot) * 0.3;
        const dragForce = windVector.clone().scale(dragForceMagnitude);
        kite.body.applyForce(dragForce, kite.body.position);
    }
} 