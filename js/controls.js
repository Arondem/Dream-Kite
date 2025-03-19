/**
 * Dream Kite - Input Controls
 * 
 * This file handles user input for controlling the kite string,
 * including both desktop (mouse/keyboard) and mobile (touch/joystick) controls.
 */

// Constants
const MAX_TUG_FORCE = 10;
const KEYBOARD_FORCE_INCREMENT = 0.5;
const MOUSE_SENSITIVITY = 0.01;
const TOUCH_SENSITIVITY = 0.02;

// Control state
let controlState = {
    desktop: {
        mouseDown: false,
        mouseStartX: 0,
        mouseStartY: 0,
        currentX: 0,
        currentY: 0,
        keys: {
            up: false,
            down: false,
            left: false,
            right: false
        }
    },
    mobile: {
        joystick: null,
        joystickData: {
            angle: 0,
            force: 0,
            vector: { x: 0, y: 0 }
        }
    },
    tugForce: { x: 0, y: 0, z: 0 }
};

/**
 * Set up controls based on device type
 * @returns {Object} - Control handlers
 */
function setupControls() {
    // Detect if mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
        setupMobileControls();
    } else {
        setupDesktopControls();
    }
    
    return {
        getTugForce: getTugForce,
        reset: resetControls
    };
}

/**
 * Set up desktop controls (mouse and keyboard)
 */
function setupDesktopControls() {
    // Mouse controls for string tugging
    setupMouseControls();
    
    // Keyboard controls for string tugging
    setupKeyboardControls();
}

/**
 * Set up mouse controls
 */
function setupMouseControls() {
    const canvas = document.getElementById('game-canvas');
    
    // Mouse down event
    canvas.addEventListener('mousedown', (e) => {
        controlState.desktop.mouseDown = true;
        controlState.desktop.mouseStartX = e.clientX;
        controlState.desktop.mouseStartY = e.clientY;
        controlState.desktop.currentX = e.clientX;
        controlState.desktop.currentY = e.clientY;
    });
    
    // Mouse move event
    canvas.addEventListener('mousemove', (e) => {
        if (controlState.desktop.mouseDown) {
            controlState.desktop.currentX = e.clientX;
            controlState.desktop.currentY = e.clientY;
            
            // Calculate tug force based on mouse movement
            updateMouseTugForce();
        }
    });
    
    // Mouse up event
    canvas.addEventListener('mouseup', () => {
        controlState.desktop.mouseDown = false;
        
        // Gradually reset tug force
        resetTugForce();
    });
    
    // Mouse leave event
    canvas.addEventListener('mouseleave', () => {
        if (controlState.desktop.mouseDown) {
            controlState.desktop.mouseDown = false;
            
            // Gradually reset tug force
            resetTugForce();
        }
    });
}

/**
 * Set up keyboard controls
 */
function setupKeyboardControls() {
    // Keyboard events for arrow keys
    window.addEventListener('keydown', (e) => {
        updateKeyState(e.key, true);
    });
    
    window.addEventListener('keyup', (e) => {
        updateKeyState(e.key, false);
    });
}

/**
 * Update key state for keyboard controls
 * @param {string} key - Key that was pressed/released
 * @param {boolean} isDown - Whether key is pressed down
 */
function updateKeyState(key, isDown) {
    switch (key) {
        case 'ArrowUp':
            controlState.desktop.keys.up = isDown;
            break;
        case 'ArrowDown':
            controlState.desktop.keys.down = isDown;
            break;
        case 'ArrowLeft':
            controlState.desktop.keys.left = isDown;
            break;
        case 'ArrowRight':
            controlState.desktop.keys.right = isDown;
            break;
    }
    
    // Update tug force based on key state
    updateKeyboardTugForce();
}

/**
 * Update tug force based on mouse movement
 */
function updateMouseTugForce() {
    if (!controlState.desktop.mouseDown) return;
    
    // Calculate delta from starting position
    const deltaX = controlState.desktop.currentX - controlState.desktop.mouseStartX;
    const deltaY = controlState.desktop.mouseStartY - controlState.desktop.currentY; // Inverted Y axis
    
    // Scale by sensitivity and clamp to max force
    const forceX = Math.min(MAX_TUG_FORCE, Math.max(-MAX_TUG_FORCE, deltaX * MOUSE_SENSITIVITY));
    const forceY = Math.min(MAX_TUG_FORCE, Math.max(-MAX_TUG_FORCE, deltaY * MOUSE_SENSITIVITY));
    
    // Update tug force
    controlState.tugForce.x = forceX;
    controlState.tugForce.y = forceY;
}

/**
 * Update tug force based on keyboard input
 */
function updateKeyboardTugForce() {
    const keys = controlState.desktop.keys;
    
    // Calculate force components based on key states
    let forceX = 0;
    let forceY = 0;
    
    if (keys.up) forceY += KEYBOARD_FORCE_INCREMENT;
    if (keys.down) forceY -= KEYBOARD_FORCE_INCREMENT;
    if (keys.left) forceX -= KEYBOARD_FORCE_INCREMENT;
    if (keys.right) forceX += KEYBOARD_FORCE_INCREMENT;
    
    // Clamp to max force
    forceX = Math.min(MAX_TUG_FORCE, Math.max(-MAX_TUG_FORCE, forceX));
    forceY = Math.min(MAX_TUG_FORCE, Math.max(-MAX_TUG_FORCE, forceY));
    
    // Update tug force
    controlState.tugForce.x = forceX;
    controlState.tugForce.y = forceY;
}

/**
 * Set up mobile controls (touch joystick)
 */
function setupMobileControls() {
    // Show joystick zone
    const joystickZone = document.getElementById('joystick-zone');
    joystickZone.style.display = 'block';
    
    // Create nippleJS joystick
    controlState.mobile.joystick = nipplejs.create({
        zone: joystickZone,
        mode: 'static',
        position: { left: '50%', top: '50%' },
        color: 'white',
        size: 120
    });
    
    // Set up joystick events
    controlState.mobile.joystick.on('move', (event, data) => {
        // Update joystick data
        controlState.mobile.joystickData.angle = data.angle.radian;
        controlState.mobile.joystickData.force = Math.min(1, data.force / 50); // Normalize force
        
        // Calculate vector from angle and force
        controlState.mobile.joystickData.vector.x = Math.cos(data.angle.radian) * controlState.mobile.joystickData.force;
        controlState.mobile.joystickData.vector.y = Math.sin(data.angle.radian) * controlState.mobile.joystickData.force;
        
        // Update tug force
        updateJoystickTugForce();
    });
    
    controlState.mobile.joystick.on('end', () => {
        // Reset joystick data
        controlState.mobile.joystickData.force = 0;
        controlState.mobile.joystickData.vector.x = 0;
        controlState.mobile.joystickData.vector.y = 0;
        
        // Gradually reset tug force
        resetTugForce();
    });
}

/**
 * Update tug force based on joystick input
 */
function updateJoystickTugForce() {
    const vector = controlState.mobile.joystickData.vector;
    
    // Scale by max force
    const forceX = vector.x * MAX_TUG_FORCE;
    
    // Y-axis is inverted in the game world
    const forceY = -vector.y * MAX_TUG_FORCE;
    
    // Update tug force
    controlState.tugForce.x = forceX;
    controlState.tugForce.y = forceY;
}

/**
 * Gradually reset tug force to zero
 */
function resetTugForce() {
    // This will be called by the animation loop
    const RESET_RATE = 0.1;
    
    if (Math.abs(controlState.tugForce.x) < 0.1) {
        controlState.tugForce.x = 0;
    } else {
        controlState.tugForce.x *= (1 - RESET_RATE);
    }
    
    if (Math.abs(controlState.tugForce.y) < 0.1) {
        controlState.tugForce.y = 0;
    } else {
        controlState.tugForce.y *= (1 - RESET_RATE);
    }
}

/**
 * Get current tug force vector
 * @returns {Object} - Tug force vector {x, y, z}
 */
function getTugForce() {
    return {
        x: controlState.tugForce.x,
        y: controlState.tugForce.y,
        z: controlState.tugForce.z
    };
}

/**
 * Reset all controls to initial state
 */
function resetControls() {
    controlState.tugForce.x = 0;
    controlState.tugForce.y = 0;
    controlState.tugForce.z = 0;
    
    controlState.desktop.mouseDown = false;
    controlState.desktop.keys.up = false;
    controlState.desktop.keys.down = false;
    controlState.desktop.keys.left = false;
    controlState.desktop.keys.right = false;
    
    if (controlState.mobile.joystick) {
        controlState.mobile.joystickData.force = 0;
        controlState.mobile.joystickData.vector.x = 0;
        controlState.mobile.joystickData.vector.y = 0;
    }
} 