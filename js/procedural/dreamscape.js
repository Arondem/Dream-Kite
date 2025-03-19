/**
 * Dream Kite - Dreamscape Generation
 * 
 * This file handles the procedural generation of the base dreamscape environment
 * and manages transitions between different themes.
 */

// Constants
const TRANSITION_DURATION = 5.0; // Time in seconds for theme transition

// Dreamscape state
let dreamscape = {
    // Current active theme
    currentTheme: 'islands', // 'islands', 'forests', 'cities'
    
    // Theme objects (will be populated by specific theme generators)
    themes: {
        islands: { objects: [], generate: null, update: null },
        forests: { objects: [], generate: null, update: null },
        cities: { objects: [], generate: null, update: null }
    },
    
    // Transition state
    transition: {
        active: false,
        progress: 0, // 0-1
        fromTheme: '',
        toTheme: '',
        duration: TRANSITION_DURATION,
        timeRemaining: 0
    },
    
    // Environment objects
    ground: null,
    sky: null,
    fog: null,
    
    // Lighting
    ambientLight: null,
    directionalLight: null,
    
    // Game time for animation
    time: 0
};

/**
 * Initialize dreamscape with default theme
 * @param {string} initialTheme - Starting theme ('islands', 'forests', 'cities')
 */
function initDreamscape(initialTheme = 'islands') {
    // Create base environment
    createEnvironment();
    
    // Set initial theme
    dreamscape.currentTheme = initialTheme;
    
    // Generate initial theme
    generateDreamscape(initialTheme);
}

/**
 * Create the base environment (sky, ground, lighting)
 */
function createEnvironment() {
    // Create sky
    createSky();
    
    // Create ground (invisible floor for collision)
    createGround();
    
    // Create lighting
    createLighting();
    
    // Add fog
    createFog();
}

/**
 * Create sky dome
 */
function createSky() {
    // Create a large sphere for the sky
    const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
    // Invert the geometry so that the material is rendered on the inside
    skyGeometry.scale(-1, 1, 1);
    
    // Create gradient material for sky
    const skyMaterial = new THREE.ShaderMaterial({
        uniforms: {
            topColor: { value: new THREE.Color(0x0077ff) },
            bottomColor: { value: new THREE.Color(0xaaddff) },
            offset: { value: 400 },
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
    
    // Create and add sky mesh
    dreamscape.sky = new THREE.Mesh(skyGeometry, skyMaterial);
    scene.add(dreamscape.sky);
}

/**
 * Create ground (invisible floor for collision)
 */
function createGround() {
    // Create a large plane for the ground
    const groundGeometry = new THREE.PlaneGeometry(1000, 1000);
    const groundMaterial = new THREE.MeshStandardMaterial({
        color: 0x002244,
        roughness: 0.8,
        metalness: 0.2,
        transparent: true,
        opacity: 0.3
    });
    
    // Create ground mesh
    dreamscape.ground = new THREE.Mesh(groundGeometry, groundMaterial);
    dreamscape.ground.rotation.x = -Math.PI / 2; // Rotate to horizontal
    dreamscape.ground.position.y = -20; // Position below the scene
    dreamscape.ground.receiveShadow = true;
    scene.add(dreamscape.ground);
    
    // Add physics body for the ground
    const groundShape = new CANNON.Plane();
    const groundBody = new CANNON.Body({
        mass: 0, // Static body
        shape: groundShape
    });
    
    // Rotate to match visual ground
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    groundBody.position.set(0, -20, 0);
    
    // Add to physics world
    world.addBody(groundBody);
}

/**
 * Create lighting for the scene
 */
function createLighting() {
    // Add ambient light
    dreamscape.ambientLight = new THREE.AmbientLight(0x404040, 1);
    scene.add(dreamscape.ambientLight);
    
    // Add directional light (sun)
    dreamscape.directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    dreamscape.directionalLight.position.set(50, 200, 100);
    dreamscape.directionalLight.castShadow = true;
    
    // Configure shadow properties
    dreamscape.directionalLight.shadow.mapSize.width = 1024;
    dreamscape.directionalLight.shadow.mapSize.height = 1024;
    dreamscape.directionalLight.shadow.camera.near = 10;
    dreamscape.directionalLight.shadow.camera.far = 500;
    dreamscape.directionalLight.shadow.camera.left = -100;
    dreamscape.directionalLight.shadow.camera.right = 100;
    dreamscape.directionalLight.shadow.camera.top = 100;
    dreamscape.directionalLight.shadow.camera.bottom = -100;
    
    scene.add(dreamscape.directionalLight);
}

/**
 * Create fog for the scene
 */
function createFog() {
    scene.fog = new THREE.FogExp2(0x8cb3ff, 0.005);
    dreamscape.fog = scene.fog;
}

/**
 * Generate a dreamscape with the specified theme
 * @param {string} theme - Theme to generate ('islands', 'forests', 'cities')
 */
function generateDreamscape(theme) {
    // First clear any existing theme objects
    clearDreamscape();
    
    // Set current theme
    dreamscape.currentTheme = theme;
    
    // Call the appropriate theme generator
    switch (theme) {
        case 'islands':
            if (typeof generateIslands === 'function') {
                generateIslands();
            }
            break;
            
        case 'forests':
            if (typeof generateForests === 'function') {
                generateForests();
            }
            break;
            
        case 'cities':
            if (typeof generateCities === 'function') {
                generateCities();
            }
            break;
    }
    
    // Update environment based on theme
    updateEnvironmentForTheme(theme);
}

/**
 * Clear all theme-specific objects from the scene
 */
function clearDreamscape() {
    // Remove all theme objects from the scene
    for (const themeName in dreamscape.themes) {
        const theme = dreamscape.themes[themeName];
        
        for (let i = 0; i < theme.objects.length; i++) {
            const object = theme.objects[i];
            
            // Remove from scene
            scene.remove(object);
            
            // Dispose of geometries and materials
            if (object.geometry) object.geometry.dispose();
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(material => material.dispose());
                } else {
                    object.material.dispose();
                }
            }
        }
        
        // Clear the objects array
        theme.objects = [];
    }
}

/**
 * Update environment (sky, fog, lighting) based on theme
 * @param {string} theme - Current theme
 * @param {number} blendFactor - Blend factor for transitions (0-1)
 */
function updateEnvironmentForTheme(theme, blendFactor = 1.0) {
    // Sky colors
    let topColor, bottomColor;
    
    // Fog colors and density
    let fogColor, fogDensity;
    
    // Light colors and intensity
    let ambientColor, ambientIntensity;
    let directionalColor, directionalIntensity;
    
    // Set properties based on theme
    switch (theme) {
        case 'islands':
            // Bright blue sky
            topColor = new THREE.Color(0x0066cc);
            bottomColor = new THREE.Color(0x99ddff);
            
            // Light blue fog
            fogColor = new THREE.Color(0x8cb3ff);
            fogDensity = 0.005;
            
            // Lighting
            ambientColor = new THREE.Color(0x404040);
            ambientIntensity = 1.0;
            directionalColor = new THREE.Color(0xffffff);
            directionalIntensity = 1.0;
            break;
            
        case 'forests':
            // Purple-tinged sky
            topColor = new THREE.Color(0x331177);
            bottomColor = new THREE.Color(0x9988ff);
            
            // Purplish fog
            fogColor = new THREE.Color(0x7766cc);
            fogDensity = 0.01;
            
            // Lighting
            ambientColor = new THREE.Color(0x330066);
            ambientIntensity = 0.6;
            directionalColor = new THREE.Color(0xbb99ff);
            directionalIntensity = 1.2;
            break;
            
        case 'cities':
            // Dark blue sky
            topColor = new THREE.Color(0x000033);
            bottomColor = new THREE.Color(0x220066);
            
            // Dark fog
            fogColor = new THREE.Color(0x000033);
            fogDensity = 0.015;
            
            // Lighting
            ambientColor = new THREE.Color(0x0000ff);
            ambientIntensity = 0.4;
            directionalColor = new THREE.Color(0x8866ff);
            directionalIntensity = 0.8;
            break;
    }
    
    // Apply changes to the environment
    // Sky
    const skyUniforms = dreamscape.sky.material.uniforms;
    skyUniforms.topColor.value.lerp(topColor, blendFactor);
    skyUniforms.bottomColor.value.lerp(bottomColor, blendFactor);
    
    // Fog
    dreamscape.fog.color.lerp(fogColor, blendFactor);
    dreamscape.fog.density = THREE.MathUtils.lerp(dreamscape.fog.density, fogDensity, blendFactor);
    
    // Ambient light
    dreamscape.ambientLight.color.lerp(ambientColor, blendFactor);
    dreamscape.ambientLight.intensity = THREE.MathUtils.lerp(dreamscape.ambientLight.intensity, ambientIntensity, blendFactor);
    
    // Directional light
    dreamscape.directionalLight.color.lerp(directionalColor, blendFactor);
    dreamscape.directionalLight.intensity = THREE.MathUtils.lerp(dreamscape.directionalLight.intensity, directionalIntensity, blendFactor);
}

/**
 * Start a transition between two themes
 * @param {string} toTheme - Target theme to transition to
 * @param {number} duration - Duration of transition in seconds
 */
function transitionTheme(toTheme, duration = TRANSITION_DURATION) {
    // If already in the target theme, do nothing
    if (dreamscape.currentTheme === toTheme) return;
    
    // Set up transition
    dreamscape.transition.active = true;
    dreamscape.transition.fromTheme = dreamscape.currentTheme;
    dreamscape.transition.toTheme = toTheme;
    dreamscape.transition.progress = 0;
    dreamscape.transition.duration = duration;
    dreamscape.transition.timeRemaining = duration;
    
    // Generate the target theme but with opacity 0
    generateDreamscape(toTheme);
    
    // Hide all objects in the new theme
    const themeObjects = dreamscape.themes[toTheme].objects;
    for (let i = 0; i < themeObjects.length; i++) {
        const object = themeObjects[i];
        
        // Set object opacity to 0
        if (object.material) {
            if (Array.isArray(object.material)) {
                object.material.forEach(material => {
                    if (material.transparent !== undefined) material.transparent = true;
                    if (material.opacity !== undefined) material.opacity = 0;
                });
            } else {
                if (object.material.transparent !== undefined) object.material.transparent = true;
                if (object.material.opacity !== undefined) object.material.opacity = 0;
            }
        }
    }
    
    // Add objects from previous theme back to the scene
    const fromThemeObjects = dreamscape.themes[dreamscape.transition.fromTheme].objects;
    for (let i = 0; i < fromThemeObjects.length; i++) {
        const object = fromThemeObjects[i];
        
        // Make sure all objects in the old theme have transparency enabled
        if (object.material) {
            if (Array.isArray(object.material)) {
                object.material.forEach(material => {
                    if (material.transparent !== undefined) material.transparent = true;
                });
            } else {
                if (object.material.transparent !== undefined) object.material.transparent = true;
            }
        }
        
        // Add to scene if not already there
        if (!scene.children.includes(object)) {
            scene.add(object);
        }
    }
}

/**
 * Update dreamscape for current frame
 * @param {number} deltaTime - Time since last update in seconds
 * @param {number} gameTime - Total game time in seconds
 */
function updateDreamscape(deltaTime, gameTime) {
    // Update dreamscape time
    dreamscape.time = gameTime;
    
    // Update current theme
    const currentTheme = dreamscape.themes[dreamscape.currentTheme];
    if (currentTheme.update) {
        currentTheme.update(deltaTime, gameTime);
    }
    
    // Handle theme transitions
    if (dreamscape.transition.active) {
        updateThemeTransition(deltaTime);
    }
}

/**
 * Update theme transition progress
 * @param {number} deltaTime - Time since last update
 */
function updateThemeTransition(deltaTime) {
    const transition = dreamscape.transition;
    
    // Update time remaining
    transition.timeRemaining -= deltaTime;
    
    // Calculate progress (0 to 1)
    transition.progress = 1.0 - (transition.timeRemaining / transition.duration);
    transition.progress = Math.min(1.0, Math.max(0.0, transition.progress));
    
    // Update environment blend
    updateEnvironmentForTheme(transition.toTheme, transition.progress);
    
    // Update object opacities
    updateTransitionOpacities(transition.progress);
    
    // Check if transition is complete
    if (transition.timeRemaining <= 0) {
        finishTransition();
    }
}

/**
 * Update object opacities during theme transition
 * @param {number} progress - Transition progress (0-1)
 */
function updateTransitionOpacities(progress) {
    const transition = dreamscape.transition;
    
    // Fade out old theme
    const fromThemeObjects = dreamscape.themes[transition.fromTheme].objects;
    for (let i = 0; i < fromThemeObjects.length; i++) {
        const object = fromThemeObjects[i];
        
        if (object.material) {
            if (Array.isArray(object.material)) {
                object.material.forEach(material => {
                    if (material.opacity !== undefined) {
                        material.opacity = 1.0 - progress;
                    }
                });
            } else {
                if (object.material.opacity !== undefined) {
                    object.material.opacity = 1.0 - progress;
                }
            }
        }
    }
    
    // Fade in new theme
    const toThemeObjects = dreamscape.themes[transition.toTheme].objects;
    for (let i = 0; i < toThemeObjects.length; i++) {
        const object = toThemeObjects[i];
        
        if (object.material) {
            if (Array.isArray(object.material)) {
                object.material.forEach(material => {
                    if (material.opacity !== undefined) {
                        material.opacity = progress;
                    }
                });
            } else {
                if (object.material.opacity !== undefined) {
                    object.material.opacity = progress;
                }
            }
        }
    }
}

/**
 * Complete the theme transition
 */
function finishTransition() {
    const transition = dreamscape.transition;
    
    // Set current theme to target theme
    dreamscape.currentTheme = transition.toTheme;
    
    // Remove all objects from the old theme
    const fromThemeObjects = dreamscape.themes[transition.fromTheme].objects;
    for (let i = 0; i < fromThemeObjects.length; i++) {
        const object = fromThemeObjects[i];
        scene.remove(object);
    }
    
    // Reset all opacities in the new theme
    const toThemeObjects = dreamscape.themes[transition.toTheme].objects;
    for (let i = 0; i < toThemeObjects.length; i++) {
        const object = toThemeObjects[i];
        
        if (object.material) {
            if (Array.isArray(object.material)) {
                object.material.forEach(material => {
                    if (material.opacity !== undefined) {
                        material.opacity = 1.0;
                    }
                    
                    // Only keep transparency if the material needs it
                    if (material.transparent !== undefined && material.opacity >= 1.0) {
                        material.transparent = false;
                    }
                });
            } else {
                if (object.material.opacity !== undefined) {
                    object.material.opacity = 1.0;
                }
                
                // Only keep transparency if the material needs it
                if (object.material.transparent !== undefined && object.material.opacity >= 1.0) {
                    object.material.transparent = false;
                }
            }
        }
    }
    
    // Reset transition state
    transition.active = false;
    transition.progress = 0;
    transition.fromTheme = '';
    transition.timeRemaining = 0;
} 