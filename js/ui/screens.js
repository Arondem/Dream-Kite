/**
 * Dream Kite - Game Screens
 * 
 * This file handles the start screen and game over screen functionality.
 */

/**
 * Show the start screen
 */
function showStartScreen() {
    // Show start screen
    document.getElementById('start-screen').classList.remove('hidden');
    
    // Hide game over screen if it's visible
    document.getElementById('game-over-screen').classList.add('hidden');
    
    // Create a simple animation for the title
    animateStartScreen();
}

/**
 * Add some simple animations to the start screen
 */
function animateStartScreen() {
    // Add a gentle floating animation to the title
    const title = document.querySelector('#start-screen h1');
    let angle = 0;
    
    function floatTitle() {
        if (document.getElementById('start-screen').classList.contains('hidden')) {
            return; // Stop animating if start screen is hidden
        }
        
        angle += 0.02;
        title.style.transform = `translateY(${Math.sin(angle) * 10}px)`;
        requestAnimationFrame(floatTitle);
    }
    
    floatTitle();
}

/**
 * Show the game over screen with final score
 * @param {number} finalScore - The player's final score
 */
function showGameOverScreen(finalScore) {
    // Set final score
    document.getElementById('final-score-value').textContent = finalScore;
    
    // Show game over screen
    document.getElementById('game-over-screen').classList.remove('hidden');
    
    // Add a subtle animation to game over title
    const gameOverTitle = document.querySelector('#game-over-screen h2');
    gameOverTitle.style.animation = 'pulse 2s infinite';
}

/**
 * Hide all game screens
 */
function hideAllScreens() {
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-over-screen').classList.add('hidden');
}

// Add CSS for animations if not already in style.css
function addScreenAnimations() {
    // Check if we already added the style
    if (document.getElementById('screen-animations')) return;
    
    // Create and append style element
    const style = document.createElement('style');
    style.id = 'screen-animations';
    style.textContent = `
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
    `;
    document.head.appendChild(style);
}

// Add animations when the script loads
addScreenAnimations(); 