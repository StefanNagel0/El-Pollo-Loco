/**
 * Manages resource cleanup for the El Pollo Loco game world.
 * Handles proper disposal of animations, intervals, and other resources.
 * @class
 */
class WorldCleanupManager {
    /**
     * Creates a new WorldCleanupManager instance.
     * @param {World} world - Reference to the parent world object
     */
    constructor(world) {
        this.world = world;
    }
    
    /**
     * Cleans up all resources registered in the world.
     */
    cleanup() {
        this.stopAnimations();
        this.clearIntervals();
        this.cleanupGameObjects();
        this.stopAudio();
        this.removeEventListeners();
    }
    
    /**
     * Stops the animation frame loop.
     */
    stopAnimations() {
        if (this.world.animationFrameId) {
            cancelAnimationFrame(this.world.animationFrameId);
            this.world.animationFrameId = null;
        }
    }
    
    /**
     * Clears all intervals registered in the world.
     */
    clearIntervals() {
        if (this.world.intervals && this.world.intervals.length > 0) {
            this.world.intervals.forEach(interval => clearInterval(interval));
            this.world.intervals = [];
        }
    }
    
    /**
     * Cleans up all game objects including character, enemies, clouds, and throwable objects.
     */
    cleanupGameObjects() {
        this.cleanupCharacter();
        this.cleanupEnemies();
        this.cleanupClouds();
        this.cleanupThrowableObjects();
    }
    
    /**
     * Cleans up the character's animations.
     */
    cleanupCharacter() {
        if (this.world.character) {
            this.world.character.cleanupAnimations();
        }
    }
    
    /**
     * Cleans up all enemy animations.
     */
    cleanupEnemies() {
        if (this.world.level && this.world.level.enemies) {
            this.world.level.enemies.forEach(enemy => {
                if (typeof enemy.cleanupAnimations === 'function') {
                    enemy.cleanupAnimations();
                }
            });
        }
    }
    
    /**
     * Cleans up all cloud animations.
     */
    cleanupClouds() {
        if (this.world.level && this.world.level.clouds) {
            this.world.level.clouds.forEach(cloud => {
                if (typeof cloud.cleanupAnimations === 'function') {
                    cloud.cleanupAnimations();
                }
            });
        }
    }
    
    /**
     * Cleans up all animations of throwable objects.
     */
    cleanupThrowableObjects() {
        if (this.world.throwableObjects) {
            this.world.throwableObjects.forEach(obj => {
                if (typeof obj.cleanupAnimations === 'function') {
                    obj.cleanupAnimations();
                }
            });
        }
    }
    
    /**
     * Stops the background music.
     */
    stopAudio() {
        if (this.world.userInterface?.audioManager) {
            this.world.userInterface.audioManager.pauseBackgroundMusic();
        }
    }
    
    /**
     * Removes all event listeners.
     */
    removeEventListeners() {
        window.removeEventListener('resize', this.world.handleResize);
    }
}