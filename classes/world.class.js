/**
 * Represents the game world that manages all game elements and logic.
 * Handles game loop, rendering, and object interactions.
 * @class
 */
class World {
    character = new Character();
    level = level1;
    canvas;
    ctx;
    keyboard;
    camera_x = 0;
    statusBar = new StatusBar();
    throwableObjects = [];
    canThrow = true;
    throwCooldown = 0;
    maxThrowCooldown = 2250;
    cooldownImage = new Image();
    isPaused = true;
    gameEnded = false;
    intervals = [];
    animationFrameId = null;
    collisionHandler;
    
    /**
     * Creates a new game world with the specified canvas and keyboard.
     * Sets up game elements, UI, and starts the game loop.
     * @param {HTMLCanvasElement} canvas - The canvas on which the game will be rendered
     * @param {Keyboard} keyboard - The keyboard input handler
     */
    constructor(canvas, keyboard) {
        this.setupCanvas(canvas);
        this.keyboard = keyboard;
        this.userInterface = new UserInterface(canvas);
        this.collisionHandler = new CollisionHandler(this);
        this.initializeUI();
        this.draw();
        this.setWorld();
        this.run();
        this.character.previousY = this.character.y;
    }

    /**
     * Sets up the canvas context and assigns it to the world.
     * @param {HTMLCanvasElement} canvas - The canvas on which the game will be rendered
     */
    setupCanvas(canvas) {
        this.ctx = canvas.getContext('2d');
        this.canvas = canvas;
    }

    /**
     * Initializes the user interface and loads required assets.
     * Transfers sound settings from the main menu if available.
     */
    initializeUI() {
        this.cooldownImage.src = '../assets/img/6_salsa_bottle/salsa_bottle.png';
        if (window.mainMenu?.userInterface) {
            this.userInterface.isMuted = window.mainMenu.userInterface.isMuted;
            this.userInterface.updateSoundIcon();
        }
    }

    /**
     * Sets this world reference on all game objects.
     * Allows objects to interact with the world and access common properties.
     */
    setWorld() {
        this.character.world = this;
        this.level.enemies.forEach(enemy => {
            enemy.world = this;
            if (enemy instanceof Chicken || enemy instanceof smallChicken) {
                enemy.worldLimits = { min: 0, max: this.level.level_end_x };
            }
        });
    }

    /**
     * Starts the game loop that handles collisions and game logic.
     * Runs at approximately 60fps when the game is not paused.
     */
    run() {
        const interval = setInterval(() => {
            if (!this.isPaused) {
                this.checkThrowObjects();
                this.collisionHandler.checkCollisions();
                this.collisionHandler.checkCollisionsWithBottles();
                this.collisionHandler.checkEnemyDistances();
                this.updateCooldown();
            }
        }, 1000 / 60);
        this.intervals.push(interval);
    }

    /**
     * Checks if the player is attempting to throw a bottle.
     * Handles bottle throwing when conditions are met.
     */
    checkThrowObjects() {
        if (this.keyboard.D && this.character.bottles > 0 && this.canThrow) {
            this.character.resetIdleState();
            this.throwBottle();
        }
    }

    /**
     * Creates and throws a bottle projectile.
     * Updates UI and starts the throw cooldown.
     */
    throwBottle() {
        const bottle = this.createBottle();
        this.throwableObjects.push(bottle);
        this.decreaseBottlesAndUpdateUI();
        this.playThrowSound();
        this.startThrowCooldown();
    }

    /**
     * Creates a new throwable bottle at the character's position.
     * @returns {ThrowableObject} The created bottle object
     */
    createBottle() {
        let bottle = new ThrowableObject(
            this.character.x + (this.character.otherDirection ? -50 : 100),
            this.character.y + 100,
            this.character.otherDirection
        );
        bottle.world = this;
        return bottle;
    }

    /**
     * Decreases the character's bottle count and updates the UI.
     */
    decreaseBottlesAndUpdateUI() {
        this.character.bottles--;
        this.statusBar.setBottlesCount(this.character.bottles);
    }

    /**
     * Plays the bottle throw sound effect if sound is enabled.
     */
    playThrowSound() {
        const throwSound = new Audio('../assets/audio/bottle_throw.mp3');
        this.userInterface.registerAudioWithCategory(throwSound, 'objects');
        if (!this.userInterface.isMuted) {
            throwSound.volume = this.userInterface.objectsVolume / 10;
            throwSound.play();
        }
    }

    /**
     * Starts the cooldown timer after throwing a bottle.
     * Prevents rapid bottle throwing by enforcing a delay.
     */
    startThrowCooldown() {
        this.canThrow = false;
        this.throwCooldown = this.maxThrowCooldown;
        setTimeout(() => {
            this.canThrow = true;
            this.throwCooldown = 0;
        }, this.maxThrowCooldown);
    }

    /**
     * Updates the bottle throw cooldown timer.
     * Decreases the cooldown timer during each game loop iteration.
     */
    updateCooldown() {
        if (this.throwCooldown > 0) {
            this.throwCooldown -= (1000 / 60);
            if (this.throwCooldown < 0) this.throwCooldown = 0;
        }
    }

    /**
     * Draws the cooldown circle indicator for bottle throws.
     * Shows a circular progress indicator with remaining time.
     */
    drawCooldownCircle() {
        if (this.throwCooldown <= 0) return;
        const circleData = this.calculateCooldownCirclePosition();
        this.drawBackgroundCircle(circleData);
        this.drawProgressCircle(circleData);
        this.drawBottleImage(circleData);
        this.drawRemainingTime(circleData);
    }

    /**
     * Calculates position and dimensions for the cooldown circle.
     * @returns {Object} Circle position, radius, and progress data
     */
    calculateCooldownCirclePosition() {
        const circleRadius = 25;
        const padding = 28;
        const bottleStatusBarY = this.statusBar.y_bottles;
        const bottleStatusBarHeight = this.statusBar.height;
        return {
            x: circleRadius + padding,
            y: bottleStatusBarY + bottleStatusBarHeight + padding,
            radius: circleRadius,
            progress: this.throwCooldown / this.maxThrowCooldown
        };
    }

    /**
     * Draws the background circle for the cooldown indicator.
     * @param {Object} data - Circle position and dimension data
     */
    drawBackgroundCircle(data) {
        this.ctx.beginPath();
        this.ctx.arc(data.x, data.y, data.radius, 0, 2 * Math.PI);
        this.ctx.fillStyle = 'rgba(80, 80, 80, 0.7)';
        this.ctx.fill();
    }

    /**
     * Draws the progress circle overlay for the cooldown indicator.
     * Shows a diminishing segment as the cooldown progresses.
     * @param {Object} data - Circle position and progress data
     */
    drawProgressCircle(data) {
        this.ctx.beginPath();
        this.ctx.moveTo(data.x, data.y);
        this.ctx.arc(
            data.x, data.y, data.radius,
            -Math.PI / 2,
            -Math.PI / 2 + (1 - data.progress) * 2 * Math.PI,
            false
        );
        this.ctx.lineTo(data.x, data.y);
        this.ctx.fillStyle = 'rgba(255, 140, 0, 0.7)';
        this.ctx.fill();
    }

    /**
     * Draws the bottle image in the center of the cooldown circle.
     * @param {Object} data - Circle position and dimension data
     */
    drawBottleImage(data) {
        if (this.cooldownImage.complete) {
            const bottleSize = data.radius * 2.4;
            this.ctx.drawImage(
                this.cooldownImage,
                data.x - bottleSize / 2,
                data.y - bottleSize / 2,
                bottleSize,
                bottleSize
            );
        }
    }

    /**
     * Draws the remaining time text below the cooldown circle.
     * @param {Object} data - Circle position and countdown data
     */
    drawRemainingTime(data) {
        const remainingTime = (this.throwCooldown / 1000).toFixed(1);
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillStyle = 'white';
        this.ctx.fillText(remainingTime + 's', data.x, data.y + data.radius + 15);
    }

    /**
     * Main drawing function that renders the game world in each animation frame.
     * Clears the canvas and draws all game elements in the correct order.
     */
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawGameWorld();
        this.drawUIElements();
        const self = this;
        this.animationFrameId = requestAnimationFrame(function() {
            self.draw();
        });
    }

    /**
     * Draws the UI elements including status bar and icons.
     * Also draws the cooldown circle when a throw is on cooldown.
     */
    drawUIElements() {
        this.statusBar.draw(this.ctx);  
        this.userInterface.drawIcons();
        this.drawEndbossHealthBar();
        if (this.throwCooldown > 0) {
            this.drawCooldownCircle();
        }
    }

    /**
     * Draws the game world elements with camera translation.
     * Renders background, character, and game objects in the correct order.
     */
    drawGameWorld() {
        this.ctx.translate(this.camera_x, 0);
        this.addObjectsToMap(this.level.backgroundObjects);
        this.addToMap(this.character);
        this.addObjectsToMap(this.level.clouds);
        this.addObjectsToMap(this.level.enemies);
        this.addObjectsToMap(this.level.coins); 
        this.addObjectsToMap(this.level.bottles);
        this.addObjectsToMap(this.throwableObjects); 
        this.ctx.translate(-this.camera_x, 0);
    }

    /**
     * Draws the end boss health bar at the top of the screen when visible.
     */
    drawEndbossHealthBar() {
        const endboss = this.level.enemies.find(enemy => enemy instanceof Endboss);
        if (endboss && endboss.showHealthBar) {
            endboss.drawHealthBar(this.ctx);
        }
    }

    /**
     * Adds an array of objects to the map by calling addToMap for each object.
     * @param {Array<MovableObject>} objects - Array of objects to be added to the map
     */
    addObjectsToMap(objects) {
        if (!objects || !Array.isArray(objects)) return;
        objects.forEach((o) => {
            this.addToMap(o);
        });
    }

    /**
     * Adds a single object to the map and handles direction flipping if needed.
     * @param {MovableObject} mo - The object to be added to the map
     */
    addToMap(mo) {
        this.handleObjectDirection(mo, true);
        mo.draw(this.ctx);
        this.drawAdditionalElements(mo);
        mo.drawFrame(this.ctx);
        this.handleObjectDirection(mo, false);
    }

    /**
     * Handles the flipping of objects based on their direction.
     * Applies canvas transformations before and after drawing.
     * @param {MovableObject} mo - The object for which direction is handled
     * @param {boolean} beforeDraw - Whether this is called before or after drawing
     */
    handleObjectDirection(mo, beforeDraw) {
        if (this.shouldFlipObject(mo)) {
            beforeDraw ? this.flipImage(mo) : this.flipImageBack(mo);
        }
    }

    /**
     * Determines if an object should be flipped based on its direction.
     * @param {MovableObject} mo - The object to check
     * @returns {boolean} True if the object should be flipped
     */
    shouldFlipObject(mo) {
        return (mo instanceof Character && mo.otherDirection) ||
            ((mo instanceof Chicken || mo instanceof smallChicken || mo instanceof Endboss) && !mo.otherDirection);
    }

    /**
     * Draws additional elements for certain object types.
     * Currently draws health bars for chickens when needed.
     * @param {MovableObject} mo - The object for which additional elements should be drawn
     */
    drawAdditionalElements(mo) {
        if (mo instanceof Chicken && mo.showHealthBar) {
            mo.drawHealthBar(this.ctx);
        }
    }

    /**
     * Flips an image horizontally by applying canvas transformations.
     * Used before drawing objects that face the opposite direction.
     * @param {MovableObject} mo - The object to flip
     */
    flipImage(mo) {
        this.ctx.save();
        this.ctx.translate(mo.width, 0);
        this.ctx.scale(-1, 1);
        mo.x = mo.x * -1;
    }

    /**
     * Restores the canvas state after drawing a flipped object.
     * @param {MovableObject} mo - The object that was flipped
     */
    flipImageBack(mo) {
        mo.x = mo.x * -1;
        this.ctx.restore();
    }

    /**
     * Marks the game as ended and prevents further end screens.
     * @param {string} endType - Type of game end ('win' or 'lose')
     * @returns {boolean} True if the game was just ended, false if it was already ended
     */
    endGame(endType) {
        if (this.gameEnded) {
            return false;
        }
        this.gameEnded = true;
        this.isPaused = true;
        return true;
    }

    /**
     * Starts an interval and stores its ID for later cleanup.
     * @param {Function} callback - The function to call at each interval
     * @param {number} interval - The interval time in milliseconds
     * @returns {number} The interval ID
     */
    startInterval(callback, interval) {
        const id = setInterval(callback, interval);
        this.intervals.push(id);
        return id;
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
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }
    
    /**
     * Clears all intervals registered in the world.
     */
    clearIntervals() {
        if (this.intervals && this.intervals.length > 0) {
            this.intervals.forEach(interval => clearInterval(interval));
            this.intervals = [];
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
        if (this.character) {
            this.character.cleanupAnimations();
        }
    }
    
    /**
     * Cleans up all enemy animations.
     */
    cleanupEnemies() {
        if (this.level && this.level.enemies) {
            this.level.enemies.forEach(enemy => {
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
        if (this.level && this.level.clouds) {
            this.level.clouds.forEach(cloud => {
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
        if (this.throwableObjects) {
            this.throwableObjects.forEach(obj => {
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
        if (this.userInterface?.audioManager) {
            this.userInterface.audioManager.pauseBackgroundMusic();
        }
    }
    
    /**
     * Removes all event listeners.
     */
    removeEventListeners() {
        window.removeEventListener('resize', this.handleResize);
    }
}