/**
 * Represents a movable object in the game.
 * Base class for all game entities that can move, such as characters and enemies.
 * Provides physics, collision detection, and movement functionality.
 * @class
 * @extends DrawableObject
 */
class MovableObject extends DrawableObject {
    static placedObjects = [];
    static placedEnemies = [];
    static minDistanceObjects = 65;
    static minDistanceEnemies = 200;
    speed = 0.15;
    otherDirection = false;
    speedY = 0;
    acceleration = 2.5;
    isJumping = false;
    offset = { top: 0, left: 0, right: 0, bottom: 0 };
    energy = 100;
    lastHit = 0;    
    changeDirectionTime = 0;
    worldLimits = { min: 0, max: 720 };
    minXSpawn = 200;
    maxXSpawnRange = 500;
    minDirectionChangeDelay = 1000;
    maxDirectionChangeDelay = 4000;
    animationIntervals = [];

    /**
     * Startet ein Intervall und registriert es zur späteren Bereinigung
     * @param {Function} callback - Die auszuführende Funktion
     * @param {number} interval - Das Zeitintervall in Millisekunden
     * @returns {number} Die Intervall-ID
     */
    startAnimationInterval(callback, interval) {
        const id = setInterval(callback, interval);
        this.animationIntervals.push(id);
        return id;
    }

    /**
     * Bereinigt alle Animation-Intervalle dieses Objekts
     */
    cleanupAnimations() {
        if (this.animationIntervals && Array.isArray(this.animationIntervals)) {
            this.animationIntervals.forEach(interval => clearInterval(interval));
            this.animationIntervals = [];
        }
    }

    /**
     * Applies gravity to the object, making it fall when not on the ground.
     * Sets up an interval that continuously updates vertical position.
     */
    applyGravity() {
        // Wichtig: Intervall speichern statt einfach nur setInterval aufrufen
        const gravityInterval = setInterval(() => {
            if (!this.world || !this.world.isPaused) {
                if (this.isAboveGround() || this.speedY > 0) {
                    this.y -= this.speedY;
                    this.speedY -= this.acceleration;
                }
            }
        }, 1000 / 60);
        
        // Zum Tracking hinzufügen
        this.animationIntervals.push(gravityInterval);
    }

    /**
     * Checks if the object is currently in the air.
     * ThrowableObjects are always considered above ground.
     * @returns {boolean} True if the object is above ground level
     */
    isAboveGround() {
        if (this instanceof ThrowableObject) return true;
        else return this.y < 150;
    }

    /**
     * Checks if this object is colliding with another movable object.
     * Uses offset values to create more accurate hitboxes.
     * @param {MovableObject} mo - The other movable object to check collision with
     * @returns {boolean} True if the objects are colliding
     */
    isColiding(mo) {
        return this.x + this.width - this.offset.right > mo.x + mo.offset.left &&
            this.y + this.height - this.offset.bottom > mo.y + mo.offset.top &&
            this.x + this.offset.left < mo.x + mo.width - mo.offset.right &&
            this.y + this.offset.top < mo.y + mo.height - mo.offset.bottom;
    }

    /**
     * Performs a more precise collision check than isColiding.
     * Used for special collision cases where standard detection is insufficient.
     * @param {Object} obj - The object to check collision with
     * @returns {boolean} True if the objects are precisely colliding
     */
    isPreciselyColiding(obj) {
        const myLeft = this.x + this.offset.left;
        const myRight = this.x + this.width - this.offset.right;
        const myTop = this.y + this.offset.top;
        const myBottom = this.y + this.height - this.offset.bottom;
        const objLeft = obj.x;
        const objRight = obj.x + obj.width;
        const objTop = obj.y;
        const objBottom = obj.y + obj.height;
        return myRight > objLeft && myLeft < objRight && myBottom > objTop && myTop < objBottom;
    }

    /**
     * Reduces the object's energy when hit and records the time of the hit.
     * Used for damage calculations and invulnerability timing.
     */
    hit() {
        this.energy -= 5;
        if (this.energy < 0) this.energy = 0;
        this.lastHit = new Date().getTime();
    }

    /**
     * Checks if the object is currently in a hurt state.
     * An object is considered hurt for 1 second after being hit.
     * @returns {boolean} True if the object was hit less than 1 second ago
     */
    isHurt() {
        let timePassed = new Date().getTime() - this.lastHit;
        timePassed = timePassed / 1000;
        return timePassed < 1;
    }

    /**
     * Checks if the object is dead (no energy left).
     * @returns {boolean} True if energy is less than or equal to zero
     */
    isDead() {
        return this.energy <= 0;
    }

    /**
     * Plays an animation by cycling through a series of images.
     * @param {string[]} images - Array of image paths to cycle through
     */
    playAnimation(images) {
        let i = this.currentImage % images.length;
        let path = images[i];
        this.img = this.imageCache[path];
        this.currentImage++;
    }

    /**
     * Moves the object to the right based on its speed.
     */
    moveRight() {
        this.x += this.speed;
    }

    /**
     * Moves the object to the left based on its speed.
     */
    moveLeft() {
        this.x -= this.speed;
    }

    /**
     * Makes the object jump by setting its vertical speed.
     */
    jump() {
        this.speedY = 30;
    }

    /**
     * Sets a random time for the next direction change.
     * Uses the object's defined minimum and maximum delay values.
     */
    setRandomDirectionChangeTime() {
        const randomDelay = Math.random() * this.maxDirectionChangeDelay + this.minDirectionChangeDelay;
        this.changeDirectionTime = new Date().getTime() + randomDelay;
    }

    /**
     * Finds a valid x-position for the object that maintains minimum distance from other enemies.
     * @returns {number} A valid x-coordinate for positioning
     */
    getValidXPosition() {
        let x, isTooClose;
        do {
            x = this.minXSpawn + Math.random() * this.maxXSpawnRange;
            isTooClose = MovableObject.placedEnemies.some(existingX =>
                Math.abs(existingX - x) < MovableObject.minDistanceEnemies
            );
        } while (isTooClose);
        return x;
    }

    /**
     * Sets up animation and movement intervals for the object.
     */
    animate() {
        setInterval(() => this.handleMovement(), 1000 / 60);
        setInterval(() => this.handleAnimation(), 200);
    }

    /**
     * Handles the object's movement logic on each animation frame.
     */
    handleMovement() {
        if (this.shouldMove()) {
            this.checkBoundaryCollision();
            this.checkRandomDirectionChange();
            this.performMovement();
        }
    }

    /**
     * Handles playing the appropriate animation on each animation frame.
     */
    handleAnimation() {
        if (this.shouldMove() && this.IMAGES_WALKING && this.IMAGES_WALKING.length > 0) {
            this.playAnimation(this.IMAGES_WALKING);
        }
    }

    /**
     * Determines if the object should be moving based on game state.
     * @returns {boolean} True if the object should move
     */
    shouldMove() {
        const worldExists = typeof this.world !== 'undefined' && this.world !== null;
        const isPaused = worldExists && typeof this.world.isPaused === 'boolean' ? this.world.isPaused : false;
        const isDead = typeof this.isDead === 'function' ? this.isDead() : this.isDead;
        return !isDead && !isPaused;
    }

    /**
     * Checks and handles collisions with world boundaries.
     * Changes direction when reaching a boundary.
     */
    checkBoundaryCollision() {
        const minLimit = this.worldLimits?.min ?? 0;
        const maxLimit = this.worldLimits?.max ?? Infinity;
        if (this.x <= minLimit) {
            this.otherDirection = false;
            this.setRandomDirectionChangeTime();
        } else if (this.x >= maxLimit - this.width) {
            this.otherDirection = true;
            this.setRandomDirectionChangeTime();
        }
    }

    /**
     * Checks if it's time for a random direction change and performs it if needed.
     */
    checkRandomDirectionChange() {
        const now = new Date().getTime();
        if (now >= this.changeDirectionTime) {
            this.otherDirection = Math.random() < 0.5;
            this.setRandomDirectionChangeTime();
        }
    }

    /**
     * Moves the object based on its current direction.
     */
    performMovement() {
        if (this.otherDirection) this.moveLeft();
        else this.moveRight();
    }

    /**
     * Register an audio element with the audio manager.
     * @param {HTMLAudioElement} audio - The audio element to register
     * @param {string} category - The category to register the audio under
     */
    registerAudioWithManager(audio, category) {
        if (audio && this.world?.userInterface?.audioManager) {
            this.world.userInterface.audioManager.registerAudioWithCategory(audio, category);
        }
    }
}