/**
 * Dream Kite - Score System
 * 
 * This file handles the score tracking, display, and high score functionality.
 */

// Variables
let currentScore = 0;
const HIGH_SCORE_KEY = 'dreamKiteHighScore';

/**
 * Update the score display and value
 * @param {number} points - Points to add to the score
 * @returns {number} - New score value
 */
function updateScore(points) {
    if (points === 0) {
        // Reset score
        currentScore = 0;
    } else {
        // Add points to current score
        currentScore += points;
    }
    
    // Update score display
    const scoreElement = document.getElementById('score-value');
    scoreElement.textContent = currentScore;
    
    // Add a quick animation to show score increase
    if (points > 0) {
        animateScoreChange(points);
    }
    
    return currentScore;
}

/**
 * Animate the score change with a small floating points indicator
 * @param {number} points - Points that were just added
 */
function animateScoreChange(points) {
    // Create a floating +points element
    const pointsElement = document.createElement('div');
    pointsElement.classList.add('floating-points');
    pointsElement.textContent = `+${points}`;
    
    // Position it near the score
    const scoreContainer = document.getElementById('score-container');
    scoreContainer.appendChild(pointsElement);
    
    // Animate it
    setTimeout(() => {
        pointsElement.style.opacity = '0';
        pointsElement.style.transform = 'translateY(-30px)';
        
        // Remove after animation
        setTimeout(() => {
            scoreContainer.removeChild(pointsElement);
        }, 1000);
    }, 10);
    
    // Add style if it doesn't exist
    addFloatingPointsStyle();
}

/**
 * Add CSS for floating points animation
 */
function addFloatingPointsStyle() {
    // Check if we already added the style
    if (document.getElementById('floating-points-style')) return;
    
    // Create and append style element
    const style = document.createElement('style');
    style.id = 'floating-points-style';
    style.textContent = `
        .floating-points {
            position: absolute;
            left: 100%;
            top: 0;
            margin-left: 10px;
            color: #ffd166;
            font-size: 18px;
            opacity: 1;
            transform: translateY(0);
            transition: all 1s ease;
            text-shadow: 0 0 10px rgba(255, 209, 102, 0.8);
        }
    `;
    document.head.appendChild(style);
}

/**
 * Save high score to local storage
 * @param {number} score - Score to save if it's a new high score
 */
function saveHighScore(score) {
    // Get current high score
    const currentHighScore = localStorage.getItem(HIGH_SCORE_KEY) || 0;
    
    // If new score is higher, save it
    if (score > currentHighScore) {
        localStorage.setItem(HIGH_SCORE_KEY, score);
        return true; // New high score
    }
    
    return false; // Not a new high score
}

/**
 * Get the current high score
 * @returns {number} - Current high score
 */
function getHighScore() {
    return localStorage.getItem(HIGH_SCORE_KEY) || 0;
} 