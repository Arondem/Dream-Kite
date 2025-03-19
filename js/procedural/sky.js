/**
 * Dream Kite - Sky Theme
 * 
 * This file handles the generation and updating of the infinite sky dreamscape theme.
 */

// Constants
const SKY_CLOUD_COUNT = 30;
const CLOUD_SIZE_RANGE = { min: 5, max: 15 };
const CLOUD_HEIGHT_RANGE = { min: -20, max: 30 };
const CLOUD_DISTANCE_RANGE = { min: 30, max: 100 };
const BIRD_COUNT = 12;

// Sky theme state
let skyState = {
    // Arrays of objects
    clouds: [],
    birds: [],
    stars: [],
    
    // Sky animation time
    time: 0,
    
    // Sky colors
    topColor: new THREE.Color(0x1a2980),
    bottomColor: new THREE.Color(0x26d0ce),
    
    // Lighting
    ambientLight: null,
    directionalLight: null,
    
    // Fog
    fogColor: new THREE.Color(0x7ab6ff),
    fogNear: 10,
    fogFar: 100
};

/**
 * Generate sky theme
 */
function generateSky() {
    // Reset sky state
    skyState.clouds = [];
    skyState.birds = [];
    skyState.stars = [];
    skyState.time = 0;
    
    // Create sky dome
    createSkyDome();
    
    // Create clouds
    createClouds();
    
    // Create birds
    createBirds();
    
    // Create stars
    createStars();
    
    // Create lighting
    createSkyLighting();
    
    // Set fog
    scene.fog = new THREE.Fog(skyState.fogColor, skyState.fogNear, skyState.fogFar);
    
    // Set theme update function
    dreamscape.themes.sky.update = updateSky;
}

/**
 * Create sky dome
 */
function createSkyDome() {
    // Create a large sphere for the sky
    const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
    
    // Create shader material for gradient sky
    const skyMaterial = new THREE.ShaderMaterial({
        uniforms: {
            topColor: { value: skyState.topColor },
            bottomColor: { value: skyState.bottomColor },
            offset: { value: 100 },
            exponent: { value: 0.6 }
        },
        vertexShader: `
            varying vec3 vWorldPosition;
            void main() {
                vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                vWorldPosition = worldPosition.xyz;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform vec3 topColor;
            uniform vec3 bottomColor;
            uniform float offset;
            uniform float exponent;
            varying vec3 vWorldPosition;
            void main() {
                float h = normalize(vWorldPosition + offset).y;
                gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
            }
        `,
        side: THREE.BackSide
    });
    
    // Create sky mesh
    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    
    // Add to theme objects
    dreamscape.themes.sky.objects.push(sky);
    
    // Add to scene
    scene.add(sky);
}

/**
 * Create clouds
 */
function createClouds() {
    for (let i = 0; i < SKY_CLOUD_COUNT; i++) {
        // Random position in a sphere around the origin
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const radius = CLOUD_DISTANCE_RANGE.min + Math.random() * (CLOUD_DISTANCE_RANGE.max - CLOUD_DISTANCE_RANGE.min);
        
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = CLOUD_HEIGHT_RANGE.min + Math.random() * (CLOUD_HEIGHT_RANGE.max - CLOUD_HEIGHT_RANGE.min);
        const z = radius * Math.sin(phi) * Math.sin(theta);
        
        // Random cloud size
        const size = CLOUD_SIZE_RANGE.min + Math.random() * (CLOUD_SIZE_RANGE.max - CLOUD_SIZE_RANGE.min);
        
        // Create cloud
        const cloud = createCloud(x, y, z, size);
        
        // Add to theme objects
        dreamscape.themes.sky.objects.push(cloud.group);
        
        // Add to clouds array
        skyState.clouds.push(cloud);
    }
}

/**
 * Create a single cloud
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} z - Z position
 * @param {number} size - Cloud size
 * @returns {Object} - Cloud object with mesh and animation properties
 */
function createCloud(x, y, z, size) {
    // Create a group to hold cloud parts
    const group = new THREE.Group();
    group.position.set(x, y, z);
    
    // Random rotation
    group.rotation.y = Math.random() * Math.PI * 2;
    
    // Create the cloud using multiple spheres
    const cloudColor = new THREE.Color(0xffffff);
    const cloudMaterial = new THREE.MeshStandardMaterial({
        color: cloudColor,
        roughness: 1.0,
        metalness: 0.0,
        emissive: new THREE.Color(0x888888),
        emissiveIntensity: 0.05,
        transparent: true,
        opacity: 0.8
    });
    
    // Main cloud mass
    const mainCloudGeometry = new THREE.SphereGeometry(size * 0.5, 8, 8);
    const mainCloud = new THREE.Mesh(mainCloudGeometry, cloudMaterial);
    mainCloud.castShadow = true;
    group.add(mainCloud);
    
    // Add additional cloud puffs
    const puffCount = Math.floor(3 + Math.random() * 5);
    
    for (let i = 0; i < puffCount; i++) {
        const puffSize = size * (0.3 + Math.random() * 0.3);
        const puffGeometry = new THREE.SphereGeometry(puffSize, 8, 8);
        const puff = new THREE.Mesh(puffGeometry, cloudMaterial);
        
        // Position puff around main cloud
        const puffAngle = (i / puffCount) * Math.PI * 2;
        const puffRadius = size * 0.6;
        puff.position.x = Math.cos(puffAngle) * puffRadius;
        puff.position.z = Math.sin(puffAngle) * puffRadius;
        puff.position.y = (Math.random() - 0.5) * size * 0.3;
        
        puff.castShadow = true;
        group.add(puff);
    }
    
    // Add glow effect
    const glowGeometry = new THREE.SphereGeometry(size * 1.2, 16, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.15,
        side: THREE.BackSide
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    group.add(glow);
    
    // Add to scene
    scene.add(group);
    
    // Create cloud object with animation parameters
    const cloud = {
        group: group,
        driftSpeed: 0.5 + Math.random() * 1.0, // Random drift speed
        driftDirection: new THREE.Vector3(
            (Math.random() - 0.5) * 0.1,
            (Math.random() - 0.5) * 0.02,
            (Math.random() - 0.5) * 0.1
        ).normalize(),
        pulseSpeed: 0.2 + Math.random() * 0.3, // Random pulse speed
        pulsePhase: Math.random() * Math.PI * 2, // Random phase offset
        basePosition: new THREE.Vector3(x, y, z) // Store base position
    };
    
    return cloud;
}

/**
 * Create birds
 */
function createBirds() {
    for (let i = 0; i < BIRD_COUNT; i++) {
        // Random position in a sphere
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const radius = 30 + Math.random() * 50;
        
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = 10 + Math.random() * 30; // Birds fly higher
        const z = radius * Math.sin(phi) * Math.sin(theta);
        
        // Create bird
        const bird = createBird(x, y, z);
        
        // Add to theme objects
        dreamscape.themes.sky.objects.push(bird.group);
        
        // Add to birds array
        skyState.birds.push(bird);
    }
}

/**
 * Create a flying bird
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} z - Z position
 * @returns {Object} - Bird object with mesh and animation properties
 */
function createBird(x, y, z) {
    // Create a group for the bird
    const group = new THREE.Group();
    group.position.set(x, y, z);
    
    // Random size
    const size = 0.5 + Math.random() * 0.5;
    
    // Create bird body
    const bodyGeometry = new THREE.ConeGeometry(size * 0.2, size * 1.0, 4);
    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0x5588cc,
        roughness: 0.8,
        metalness: 0.2,
        emissive: 0x223344,
        emissiveIntensity: 0.2
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.rotation.x = Math.PI / 2; // Rotate to horizontal
    group.add(body);
    
    // Create left wing
    const leftWing = createWing(size);
    leftWing.position.set(size * 0.3, 0, 0);
    group.add(leftWing);
    
    // Create right wing
    const rightWing = createWing(size);
    rightWing.position.set(-size * 0.3, 0, 0);
    rightWing.scale.x = -1; // Mirror the wing
    group.add(rightWing);
    
    // Create tail
    const tailGeometry = new THREE.ConeGeometry(size * 0.15, size * 0.5, 4);
    const tail = new THREE.Mesh(tailGeometry, bodyMaterial);
    tail.position.z = -size * 0.6;
    tail.rotation.x = Math.PI / 2;
    group.add(tail);
    
    // Add glow
    const glowGeometry = new THREE.SphereGeometry(size * 0.8, 8, 8);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0x88aaff,
        transparent: true,
        opacity: 0.1
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    group.add(glow);
    
    // Add to scene
    scene.add(group);
    
    // Create flight path
    const flightCenter = new THREE.Vector3(x, y, z);
    const flightRadius = 10 + Math.random() * 20;
    const flightSpeed = 0.2 + Math.random() * 0.3;
    const flightDirection = Math.random() > 0.5 ? 1 : -1; // Clockwise or counterclockwise
    const flightPhase = Math.random() * Math.PI * 2;
    const flightHeight = 2 + Math.random() * 4;
    
    // Create bird object with animation parameters
    const bird = {
        group: group,
        leftWing: leftWing,
        rightWing: rightWing,
        flapSpeed: 5 + Math.random() * 3,
        flapPhase: Math.random() * Math.PI * 2,
        size: size,
        flightCenter: flightCenter,
        flightRadius: flightRadius,
        flightSpeed: flightSpeed,
        flightDirection: flightDirection,
        flightPhase: flightPhase,
        flightHeight: flightHeight
    };
    
    return bird;
}

/**
 * Create a wing for a bird
 * @param {number} size - Size scale for the wing
 * @returns {THREE.Mesh} - Wing mesh
 */
function createWing(size) {
    // Create wing geometry as a triangle
    const wingShape = new THREE.Shape();
    wingShape.moveTo(0, 0);
    wingShape.lineTo(size * 0.8, size * 0.2);
    wingShape.lineTo(0, size * 0.6);
    wingShape.lineTo(0, 0);
    
    const wingGeometry = new THREE.ShapeGeometry(wingShape);
    const wingMaterial = new THREE.MeshStandardMaterial({
        color: 0x88aadd,
        roughness: 0.8,
        metalness: 0.2,
        side: THREE.DoubleSide
    });
    
    return new THREE.Mesh(wingGeometry, wingMaterial);
}

/**
 * Create stars
 */
function createStars() {
    // Create star field
    const starCount = 500;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = [];
    const starColors = [];
    
    for (let i = 0; i < starCount; i++) {
        // Random position on a sphere
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const radius = 400; // Far away
        
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.sin(phi) * Math.sin(theta);
        const z = radius * Math.cos(phi);
        
        starPositions.push(x, y, z);
        
        // Random star color (mostly white with some color variations)
        const r = 0.8 + Math.random() * 0.2;
        const g = 0.8 + Math.random() * 0.2;
        const b = 0.8 + Math.random() * 0.2;
        
        starColors.push(r, g, b);
    }
    
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starColors, 3));
    
    // Create material with custom point size
    const starMaterial = new THREE.PointsMaterial({
        size: 1.5,
        vertexColors: true,
        transparent: true,
        opacity: 0.8
    });
    
    // Create star points
    const stars = new THREE.Points(starGeometry, starMaterial);
    
    // Add to theme objects
    dreamscape.themes.sky.objects.push(stars);
    
    // Add to scene
    scene.add(stars);
    
    // Store stars in state
    skyState.stars = stars;
}

/**
 * Create lighting for sky theme
 */
function createSkyLighting() {
    // Ambient light
    const ambient = new THREE.AmbientLight(0x88aaff, 0.5);
    scene.add(ambient);
    skyState.ambientLight = ambient;
    
    // Directional light (sun)
    const directional = new THREE.DirectionalLight(0xffffaa, 1.0);
    directional.position.set(30, 50, 30);
    directional.castShadow = true;
    
    // Configure shadow properties
    directional.shadow.mapSize.width = 2048;
    directional.shadow.mapSize.height = 2048;
    directional.shadow.camera.near = 0.5;
    directional.shadow.camera.far = 200;
    directional.shadow.camera.left = -50;
    directional.shadow.camera.right = 50;
    directional.shadow.camera.top = 50;
    directional.shadow.camera.bottom = -50;
    
    scene.add(directional);
    skyState.directionalLight = directional;
    
    // Add to theme objects
    dreamscape.themes.sky.objects.push(ambient);
    dreamscape.themes.sky.objects.push(directional);
}

/**
 * Update sky animation
 * @param {number} deltaTime - Time since last update
 * @param {number} gameTime - Total game time
 */
function updateSky(deltaTime, gameTime) {
    // Update animation time
    skyState.time += deltaTime;
    
    // Animate clouds
    updateClouds(deltaTime);
    
    // Animate birds
    updateBirds(deltaTime);
    
    // Animate stars
    updateStars(deltaTime);
}

/**
 * Update clouds animation
 * @param {number} deltaTime - Time since last update
 */
function updateClouds(deltaTime) {
    for (let i = 0; i < skyState.clouds.length; i++) {
        const cloud = skyState.clouds[i];
        
        // Move along drift direction
        const driftAmount = cloud.driftSpeed * deltaTime;
        cloud.group.position.addScaledVector(cloud.driftDirection, driftAmount);
        
        // Scale pulsing
        const pulseScale = 1.0 + 0.05 * Math.sin(skyState.time * cloud.pulseSpeed + cloud.pulsePhase);
        cloud.group.scale.set(pulseScale, pulseScale, pulseScale);
        
        // Reset position if cloud drifted too far
        const distanceFromOrigin = cloud.group.position.length();
        if (distanceFromOrigin > CLOUD_DISTANCE_RANGE.max * 1.5) {
            // Reset to opposite side
            cloud.group.position.copy(cloud.basePosition);
        }
    }
}

/**
 * Update birds animation
 * @param {number} deltaTime - Time since last update
 */
function updateBirds(deltaTime) {
    for (let i = 0; i < skyState.birds.length; i++) {
        const bird = skyState.birds[i];
        
        // Update wing flapping
        const flapAngle = Math.sin(skyState.time * bird.flapSpeed + bird.flapPhase) * 0.6;
        bird.leftWing.rotation.z = flapAngle;
        bird.rightWing.rotation.z = -flapAngle;
        
        // Move along flight path
        const flightAngle = skyState.time * bird.flightSpeed * bird.flightDirection + bird.flightPhase;
        
        const newX = bird.flightCenter.x + Math.cos(flightAngle) * bird.flightRadius;
        const newY = bird.flightCenter.y + Math.sin(flightAngle * 0.5) * bird.flightHeight;
        const newZ = bird.flightCenter.z + Math.sin(flightAngle) * bird.flightRadius;
        
        bird.group.position.set(newX, newY, newZ);
        
        // Rotate bird to face direction of travel
        const tangentX = -Math.sin(flightAngle) * bird.flightDirection;
        const tangentZ = Math.cos(flightAngle) * bird.flightDirection;
        
        bird.group.rotation.y = Math.atan2(tangentX, tangentZ);
    }
}

/**
 * Update stars animation
 * @param {number} deltaTime - Time since last update
 */
function updateStars(deltaTime) {
    if (skyState.stars && skyState.stars.material) {
        // Twinkle stars by adjusting opacity
        skyState.stars.material.opacity = 0.6 + 0.2 * Math.sin(skyState.time * 0.5);
    }
} 