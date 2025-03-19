/**
 * Dream Kite - String Health System
 * 
 * This file handles the string health/tension UI and mechanics.
 */

// Constants
const MAX_HEALTH = 100;
const CRITICAL_HEALTH_THRESHOLD = 30;
const DAMAGE_ANIMATION_DURATION = 300; // ms

// Variables
let currentHealth = MAX_HEALTH;
let isAnimatingDamage = false;

/**
 * Update the health bar with new health value
 * @param {number} health - New health value (0-100)
 */
function updateHealthBar(health) {
    // Get bar element
    const healthFill = document.getElementById('string-health-fill');
    
    // Clamp health between 0-100
    currentHealth = Math.max(0, Math.min(MAX_HEALTH, health));
    
    // Set width percentage
    healthFill.style.width = `${currentHealth}%`;
    
    // Update color based on health level
    updateHealthColor(currentHealth);
    
    // Check for critical health (low warning)
    if (currentHealth <= CRITICAL_HEALTH_THRESHOLD) {
        showLowHealthWarning();
    } else {
        hideLowHealthWarning();
    }
    
    // Check for game over
    if (currentHealth <= 0) {
        // This will call the gameOver function in game.js
        gameOver();
    }
}

/**
 * Update health bar color based on current health
 * @param {number} health - Current health value
 */
function updateHealthColor(health) {
    // Get bar element
    const healthFill = document.getElementById('string-health-fill');
    
    if (health <= 20) {
        // Critical - red
        healthFill.style.background = 'linear-gradient(to right, #ff0000, #ff4d4d)';
    } else if (health <= 50) {
        // Caution - orange/yellow
        healthFill.style.background = 'linear-gradient(to right, #ff6b6b, #ffd166)';
    } else {
        // Good - green gradient
        healthFill.style.background = 'linear-gradient(to right, #ff9e40, #ffd166, #06d6a0)';
    }
}

/**
 * Apply damage to the string health
 * @param {number} damageAmount - Amount of damage to apply
 * @returns {number} - New health value
 */
function damageString(damageAmount) {
    // Calculate new health
    const newHealth = Math.max(0, currentHealth - damageAmount);
    
    // Animate damage
    animateDamage();
    
    // Update health bar
    updateHealthBar(newHealth);
    
    return newHealth;
}

/**
 * Repair string with collected sparks
 * @param {number} repairAmount - Amount of health to repair
 * @returns {number} - New health value
 */
function repairString(repairAmount) {
    // Calculate new health
    const newHealth = Math.min(MAX_HEALTH, currentHealth + repairAmount);
    
    // Animate repair
    animateRepair();
    
    // Update health bar
    updateHealthBar(newHealth);
    
    return newHealth;
}

/**
 * Animate damage to health bar
 */
function animateDamage() {
    if (isAnimatingDamage) return;
    isAnimatingDamage = true;
    
    // Get health container
    const healthBar = document.getElementById('string-health-bar');
    
    // Add shake animation class
    healthBar.classList.add('shake');
    
    // Remove after animation completes
    setTimeout(() => {
        healthBar.classList.remove('shake');
        isAnimatingDamage = false;
    }, DAMAGE_ANIMATION_DURATION);
}

/**
 * Animate health repair
 */
function animateRepair() {
    // Get health container
    const healthBar = document.getElementById('string-health-bar');
    
    // Add glow animation class
    healthBar.classList.add('glow');
    
    // Remove after animation completes
    setTimeout(() => {
        healthBar.classList.remove('glow');
    }, DAMAGE_ANIMATION_DURATION);
}

/**
 * Show warning when health is critically low
 */
function showLowHealthWarning() {
    // Get health container
    const healthContainer = document.getElementById('string-health-container');
    
    // Add warning class if not already added
    if (!healthContainer.classList.contains('warning')) {
        healthContainer.classList.add('warning');
    }
}

/**
 * Hide low health warning
 */
function hideLowHealthWarning() {
    // Get health container
    const healthContainer = document.getElementById('string-health-container');
    
    // Remove warning class
    healthContainer.classList.remove('warning');
}

// Add CSS for health animations
function addHealthAnimations() {
    // Check if we already added the style
    if (document.getElementById('health-animations')) return;
    
    // Create and append style element
    const style = document.createElement('style');
    style.id = 'health-animations';
    style.textContent = `
        @keyframes shake {
            0% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            50% { transform: translateX(5px); }
            75% { transform: translateX(-5px); }
            100% { transform: translateX(0); }
        }
        
        @keyframes glow {
            0% { box-shadow: 0 0 5px rgba(6, 214, 160, 0.8); }
            50% { box-shadow: 0 0 15px rgba(6, 214, 160, 0.8); }
            100% { box-shadow: 0 0 5px rgba(6, 214, 160, 0.8); }
        }
        
        @keyframes pulse-warning {
            0% { opacity: 0.8; }
            50% { opacity: 1; }
            100% { opacity: 0.8; }
        }
        
        #string-health-bar.shake {
            animation: shake 0.3s ease-in-out;
        }
        
        #string-health-bar.glow {
            animation: glow 0.3s ease-in-out;
        }
        
        #string-health-container.warning {
            animation: pulse-warning 1s infinite;
        }
    `;
    document.head.appendChild(style);
}

// Add animations when the script loads
addHealthAnimations(); 