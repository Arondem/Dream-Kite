/**
 * Dream Kite - String Physics and Rendering
 * 
 * This file handles the creation and updating of the kite string,
 * including its physics constraints and visual representation.
 */

// Constants
const STRING_SEGMENTS = 10; // Number of segments in the string
const MAX_STRING_LENGTH = 30; // Maximum string length
const MIN_STRING_LENGTH = 5; // Minimum string length
const BASE_STRING_LENGTH = 15; // Starting string length
const STRING_TENSION_THRESHOLD = 20; // Force threshold for string damage
const STRING_MATERIAL_NAME = 'stringMaterial';

/**
 * Create a string with physics constraint and visual representation
 * @param {Object} kiteBody - Kite physics body
 * @param {Object} anchorPoint - Anchor point position {x, y, z}
 * @returns {Object} - String object with constraint, mesh, and update method
 */
function createString(kiteBody, anchorPoint = {x: 0, y: 0, z: 0}) {
    // Create a string object to hold all components
    const string = {
        constraint: null,
        line: null,
        anchorBody: null,
        points: Array(STRING_SEGMENTS).fill().map(() => new THREE.Vector3()),
        length: BASE_STRING_LENGTH,
        tension: 0,
        tugForce: new CANNON.Vec3(0, 0, 0),
        update: null
    };
    
    // Create anchor body (fixed point)
    string.anchorBody = createAnchorBody(anchorPoint);
    world.addBody(string.anchorBody);
    
    // Create physics constraint
    string.constraint = createStringConstraint(kiteBody, string.anchorBody, string.length);
    world.addConstraint(string.constraint);
    
    // Create visual string representation
    string.line = createStringLine();
    scene.add(string.line);
    
    // Define the update method
    string.update = function(deltaTime) {
        updateString(string, kiteBody, deltaTime);
    };
    
    return string;
}

/**
 * Create anchor body (fixed point for string)
 * @param {Object} position - Anchor position {x, y, z}
 * @returns {CANNON.Body} - Anchor physics body
 */
function createAnchorBody(position) {
    const anchorBody = new CANNON.Body({
        mass: 0, // Static body
        position: new CANNON.Vec3(position.x, position.y, position.z),
        shape: new CANNON.Sphere(0.5) // Small sphere
    });
    
    // Create material for string interaction
    anchorBody.material = new CANNON.Material(STRING_MATERIAL_NAME);
    
    return anchorBody;
}

/**
 * Create physics constraint for string
 * @param {CANNON.Body} kiteBody - Kite physics body
 * @param {CANNON.Body} anchorBody - Anchor physics body
 * @param {number} length - String length
 * @returns {CANNON.DistanceConstraint} - String constraint
 */
function createStringConstraint(kiteBody, anchorBody, length) {
    // Create a distance constraint
    const constraint = new CANNON.DistanceConstraint(
        kiteBody,
        anchorBody,
        length
    );
    
    // Set constraint parameters
    constraint.collideConnected = true;
    
    return constraint;
}

/**
 * Create visual representation of string
 * @returns {THREE.Line} - Line representing the string
 */
function createStringLine() {
    // Create initial points for the string (will be updated later)
    const points = new Array(STRING_SEGMENTS).fill().map(() => new THREE.Vector3());
    
    const stringGeometry = new THREE.BufferGeometry().setFromPoints(points);
    
    // Create a line material
    const stringMaterial = new THREE.LineBasicMaterial({
        color: 0xffffff,
        linewidth: 1
    });
    
    // Create the line
    const line = new THREE.Line(stringGeometry, stringMaterial);
    
    return line;
}

/**
 * Update string physics and visual representation
 * @param {Object} string - String object
 * @param {CANNON.Body} kiteBody - Kite physics body
 * @param {number} deltaTime - Time since last update
 */
function updateString(string, kiteBody, deltaTime) {
    // Update string constraint length
    updateConstraintLength(string);
    
    // Calculate string tension
    string.tension = calculateStringTension(string, kiteBody);
    
    // Apply tug force to the kite
    applyTugForce(string, kiteBody);
    
    // Update visual representation
    updateStringVisual(string, kiteBody);
    
    // Check for string damage based on tension
    if (string.tension > STRING_TENSION_THRESHOLD) {
        const damageAmount = (string.tension - STRING_TENSION_THRESHOLD) * 0.1;
        damageString(damageAmount);
    }
}

/**
 * Update constraint length (for extending/shortening string)
 * @param {Object} string - String object
 */
function updateConstraintLength(string) {
    // Update constraint length if it changed
    if (string.constraint.distance !== string.length) {
        string.constraint.distance = string.length;
    }
}

/**
 * Calculate string tension based on distance and forces
 * @param {Object} string - String object
 * @param {CANNON.Body} kiteBody - Kite physics body
 * @returns {number} - String tension value
 */
function calculateStringTension(string, kiteBody) {
    // Get positions
    const kitePos = kiteBody.position;
    const anchorPos = string.anchorBody.position;
    
    // Calculate actual distance
    const distance = kitePos.distanceTo(anchorPos);
    
    // Calculate tension (0 when slack, increases when stretched)
    const tension = Math.max(0, (distance - string.length) * 10);
    
    // Add tension from tug force
    const tugTension = string.tugForce.length();
    
    return tension + tugTension;
}

/**
 * Apply tug force to the kite based on player input
 * @param {Object} string - String object
 * @param {CANNON.Body} kiteBody - Kite physics body
 */
function applyTugForce(string, kiteBody) {
    if (string.tugForce.length() > 0) {
        // Get direction from anchor to kite
        const direction = new CANNON.Vec3();
        direction.copy(string.anchorBody.position);
        direction.vsub(kiteBody.position, direction);
        direction.normalize();
        
        // Scale by tug force magnitude
        direction.scale(string.tugForce.length(), direction);
        
        // Apply force to kite
        kiteBody.applyForce(direction, kiteBody.position);
    }
}

/**
 * Update visual representation of string
 * @param {Object} string - String object
 * @param {CANNON.Body} kiteBody - Kite physics body
 */
function updateStringVisual(string, kiteBody) {
    // Get positions
    const kitePos = kiteBody.position;
    const anchorPos = string.anchorBody.position;
    
    // Calculate points along string with catenary curve
    for (let i = 0; i < STRING_SEGMENTS; i++) {
        const t = i / (STRING_SEGMENTS - 1);
        
        // Simple linear interpolation for position
        const x = anchorPos.x + t * (kitePos.x - anchorPos.x);
        const z = anchorPos.z + t * (kitePos.z - anchorPos.z);
        
        // Calculate y with a hanging curve (catenary)
        // More pronounced when string is slack, less when tense
        const stringTightness = Math.min(1, string.tension / 5);
        const sag = (1 - stringTightness) * 2; // Max sag of 2 units when completely slack
        
        // Catenary curve: y = a * cosh(x/a) where a controls the "sag"
        // We'll use a simplified approximation with a quadratic curve
        const linearY = anchorPos.y + t * (kitePos.y - anchorPos.y);
        const sagFactor = t * (1 - t); // 0 at endpoints, max at middle
        const y = linearY - (sagFactor * sag);
        
        // Store point
        string.points[i].set(x, y, z);
    }
    
    // Update line geometry
    string.line.geometry.setFromPoints(string.points);
    
    // Update color based on tension
    updateStringColor(string);
}

/**
 * Update string color based on tension
 * @param {Object} string - String object
 */
function updateStringColor(string) {
    // Define color ranges
    const lowTensionColor = new THREE.Color(0xffffff); // White - normal
    const mediumTensionColor = new THREE.Color(0xffd166); // Yellow - caution
    const highTensionColor = new THREE.Color(0xff6b6b); // Red - danger
    
    let color;
    
    // Set color based on tension
    if (string.tension < 5) {
        color = lowTensionColor;
    } else if (string.tension < 15) {
        // Interpolate between low and medium
        const t = (string.tension - 5) / 10;
        color = lowTensionColor.clone().lerp(mediumTensionColor, t);
    } else {
        // Interpolate between medium and high
        const t = Math.min(1, (string.tension - 15) / 10);
        color = mediumTensionColor.clone().lerp(highTensionColor, t);
    }
    
    // Update material color
    string.line.material.color = color;
}

/**
 * Set tug force on string (called from controls)
 * @param {Object} string - String object
 * @param {Object} tugVector - Tug force vector {x, y, z}
 */
function setStringTugForce(string, tugVector) {
    string.tugForce.set(tugVector.x, tugVector.y, tugVector.z);
}

/**
 * Extend string length (from collecting sparks)
 * @param {Object} string - String object
 * @param {number} amount - Amount to extend
 * @returns {number} - New string length
 */
function extendString(string, amount) {
    string.length = Math.min(MAX_STRING_LENGTH, string.length + amount);
    return string.length;
}

/**
 * Shorten string (from damage)
 * @param {Object} string - String object
 * @param {number} amount - Amount to shorten
 * @returns {number} - New string length
 */
function shortenString(string, amount) {
    string.length = Math.max(MIN_STRING_LENGTH, string.length - amount);
    return string.length;
} 