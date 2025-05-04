/**
 * Represents the game world which manages all game elements and logic.
 * Handles game loop, collisions, rendering, and object interactions.
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
    gameEnded = false; // Neue Eigenschaft zum Nachverfolgen des Spielendes
    
    /**
     * Creates a new game world with the specified canvas and keyboard.
     * Sets up game elements, UI, and starts the game loop.
     * @param {HTMLCanvasElement} canvas - The canvas to render the game on
     * @param {Keyboard} keyboard - The keyboard input handler
     */
    constructor(canvas, keyboard) {
        this.ctx = canvas.getContext('2d');
        this.canvas = canvas;
        this.keyboard = keyboard;
        this.userInterface = new UserInterface(canvas);
        this.initializeUI();
        this.draw();
        this.setWorld();
        this.run();
        this.character.previousY = this.character.y;
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
     * Allows objects to interact with the world and access shared properties.
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
        setInterval(() => {
            if (!this.isPaused) {
                this.checkThrowObjects();
                this.checkCollisions();
                this.checkCollisionsWithBottles();
                this.checkEnemyDistances();
                this.updateCooldown();
            }
        }, 1000 / 60);
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
     * Plays the bottle throwing sound effect if sound is enabled.
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
     * Checks for all types of collisions in the game.
     * Handles enemy, coin, and bottle pickup collisions.
     */
    checkCollisions() {
        if (this.level.enemies) this.checkEnemyCollisions();
        if (this.level.coins) this.checkCoinCollisions();
        if (this.level.bottles) this.checkBottleCollisions();
    }

    /**
     * Checks for collisions between the character and enemies.
     * Handles stomping enemies and taking damage from enemies.
     */
    checkEnemyCollisions() {
        this.level.enemies.forEach((enemy, enemyIndex) => {
            if (this.isCharacterStompingEnemy(enemy)) {
                this.handleEnemyStomp(enemy);
            } else if (this.character.isColiding(enemy)) {
                this.handleEnemyCollision(enemy, enemyIndex);
            } else {
                this.removeEnemyFromCollisionList(enemy, enemyIndex);
            }
        });
    }

    /**
     * Determines if the character is stomping on an enemy.
     * Checks vertical positions and velocity to detect stomps.
     * @param {MovableObject} enemy - The enemy to check
     * @returns {boolean} True if the character is stomping the enemy
     */
    isCharacterStompingEnemy(enemy) {
        const characterBottom = this.character.y + this.character.height - this.character.offset.bottom;
        const enemyTop = enemy.y + (enemy.offset?.top || 0);
        const stompHeight = enemy.stompableAreaHeight || 40;
        return this.character.isColiding(enemy) &&
            characterBottom >= enemyTop &&
            characterBottom <= enemyTop + stompHeight &&
            this.character.speedY < 0;
    }

    /**
     * Handles enemy stomping logic when the character jumps on an enemy.
     * Makes the enemy die and bounces the character up.
     * @param {MovableObject} enemy - The enemy being stomped
     */
    handleEnemyStomp(enemy) {
        if (!(enemy instanceof Endboss) && !enemy.isDead) {
            enemy.die();
            this.character.speedY = 25;
            this.playStompSound();
            this.scheduleEnemyRemoval(enemy, 500);
        }
    }

    /**
     * Plays the enemy stomp sound effect if sound is enabled.
     */
    playStompSound() {
        const stompSound = new Audio('../assets/audio/stomp_enemie.mp3');
        this.userInterface.registerAudioWithCategory(stompSound, 'enemies');
        if (!this.userInterface.isMuted) {
            stompSound.volume = this.userInterface.enemiesVolume / 10;
            stompSound.play();
        }
    }

    /**
     * Handles collision between character and enemy when not stomping.
     * Applies damage to the character based on enemy type.
     * @param {MovableObject} enemy - The enemy colliding with the character
     * @param {number} enemyIndex - Index of the enemy in the enemies array
     */
    handleEnemyCollision(enemy, enemyIndex) {
        if (!enemy.isDead) {
            const enemyId = enemy.constructor.name + '_' + enemyIndex;
            if (!this.character.collidingEnemies.includes(enemyId)) {
                this.character.collidingEnemies.push(enemyId);
                this.applyEnemyDamage(enemy);
            }
        }
    }

    /**
     * Applies appropriate damage to the character based on enemy type.
     * Updates the health bar accordingly.
     * @param {MovableObject} enemy - The enemy dealing damage
     */
    applyEnemyDamage(enemy) {
        if (enemy instanceof Endboss) {
            this.character.energy -= enemy.damage;
            this.statusBar.setEnergyPercentage(this.character.energy);
            this.character.lastHit = new Date().getTime();
        } else if (enemy instanceof Chicken || enemy instanceof smallChicken) {
            this.character.hit();
            this.statusBar.setEnergyPercentage(this.character.energy);
        }
    }

    /**
     * Removes an enemy from the collision tracking list when no longer colliding.
     * @param {MovableObject} enemy - The enemy to remove from collision list
     * @param {number} enemyIndex - Index of the enemy in the enemies array
     */
    removeEnemyFromCollisionList(enemy, enemyIndex) {
        const enemyId = enemy.constructor.name + '_' + enemyIndex;
        const index = this.character.collidingEnemies.indexOf(enemyId);
        if (index !== -1) {
            this.character.collidingEnemies.splice(index, 1);
        }
    }

    /**
     * Checks for collisions between the character and coins.
     * Collects coins when detected and updates UI.
     */
    checkCoinCollisions() {
        this.level.coins.forEach((coin, index) => {
            if (this.character.isColiding(coin)) {
                this.character.collectCoin();
                this.level.coins.splice(index, 1);
            }
        });
    }

    /**
     * Checks for collisions between the character and bottle pickups.
     * Collects bottles when detected and updates UI.
     */
    checkBottleCollisions() {
        this.level.bottles.forEach((bottle) => {
            if (this.character.isColiding(bottle)) {
                this.character.collectBottle();
                const bottleIndex = this.level.bottles.indexOf(bottle);
                if (bottleIndex > -1) {
                    this.level.bottles.splice(bottleIndex, 1);
                }
            }
        });
    }

    /**
     * Schedules an enemy for removal after a delay.
     * Used for animation timing after enemy death.
     * @param {MovableObject} enemy - The enemy to remove
     * @param {number} delay - Delay in milliseconds before removal
     */
    scheduleEnemyRemoval(enemy, delay) {
        setTimeout(() => {
            const enemyIndex = this.level.enemies.indexOf(enemy);
            if (enemyIndex > -1 && enemy.isDead) {
                this.level.enemies.splice(enemyIndex, 1);
            }
        }, delay);
    }

    /**
     * Checks distances between enemies to prevent them from overlapping.
     * Makes enemies change direction when they get too close to each other.
     */
    checkEnemyDistances() {
        if (this.isPaused) return;
        const minDistance = 100;
        this.level.enemies.forEach((enemy1, index1) => {
            if (enemy1 instanceof Endboss) return;
            this.level.enemies.forEach((enemy2, index2) => {
                if (this.shouldCheckEnemies(enemy1, enemy2, index1, index2)) {
                    this.handleEnemyProximity(enemy1, enemy2);
                }
            });
        });
    }

    /**
     * Determines if two enemies should be checked for proximity.
     * Skips checks for end boss, dead enemies, and same enemy.
     * @param {MovableObject} enemy1 - First enemy to check
     * @param {MovableObject} enemy2 - Second enemy to check
     * @param {number} index1 - Index of first enemy
     * @param {number} index2 - Index of second enemy
     * @returns {boolean} True if the enemies should be checked for proximity
     */
    shouldCheckEnemies(enemy1, enemy2, index1, index2) {
        return index1 !== index2 &&
            !(enemy2 instanceof Endboss) &&
            !enemy1.isDead &&
            !enemy2.isDead;
    }

    /**
     * Handles enemy proximity by making them change directions.
     * Pushes enemies apart when they get too close to each other.
     * @param {MovableObject} enemy1 - First enemy in proximity
     * @param {MovableObject} enemy2 - Second enemy in proximity
     */
    handleEnemyProximity(enemy1, enemy2) {
        const distanceX = Math.abs(enemy1.x - enemy2.x);
        const distanceY = Math.abs(enemy1.y - enemy2.y);
        if (distanceX < 100 && distanceY < enemy1.height / 2) {
            enemy1.otherDirection = !enemy1.otherDirection;
            enemy2.otherDirection = !enemy2.otherDirection;
            if (enemy1.x < enemy2.x) {
                enemy1.x -= 10;
                enemy2.x += 10;
            } else {
                enemy1.x += 10;
                enemy2.x -= 10;
            }
            enemy1.setRandomDirectionChangeTime();
            enemy2.setRandomDirectionChangeTime();
        }
    }

    /**
     * Checks for collisions between thrown bottles and enemies.
     * Handles enemy damage and bottle breaking effects.
     */
    checkCollisionsWithBottles() {
        if (this.throwableObjects.length > 0 && this.level.enemies) {
            this.throwableObjects.forEach((bottle, bottleIndex) => {
                this.level.enemies.forEach((enemy, enemyIndex) => {
                    this.checkBottleEnemyCollision(bottle, enemy);
                });
            });
        }
    }

    /**
     * Checks collision between a specific bottle and enemy.
     * Handles bottle breaking and enemy damage when collision occurs.
     * @param {ThrowableObject} bottle - The thrown bottle to check
     * @param {MovableObject} enemy - The enemy to check for collision
     */
    checkBottleEnemyCollision(bottle, enemy) {
        const enemyIsDead = enemy instanceof Endboss ? enemy.isDead() : enemy.isDead;
        if (bottle.isColiding(enemy) && !enemyIsDead && !bottle.isBroken) {
            bottle.break();
            this.handleEnemyHitByBottle(enemy);
            this.playBottleBreakSound();
            this.scheduleObjectRemoval(bottle, this.throwableObjects, 300);
            if (!(enemy instanceof Endboss) || enemy.isDead()) {
                this.scheduleEnemyRemoval(enemy, 500);
            }
        }
    }

    /**
     * Applies damage to an enemy hit by a bottle.
     * Handles end boss differently than regular enemies.
     * @param {MovableObject} enemy - The enemy hit by a bottle
     */
    handleEnemyHitByBottle(enemy) {
        if (enemy instanceof Endboss) {
            enemy.hitWithBottle();
        } else {
            enemy.die(true);
        }
    }

    /**
     * Plays the bottle breaking sound effect if sound is enabled.
     */
    playBottleBreakSound() {
        const breakSound = new Audio('../assets/audio/bottle_break.mp3');
        this.userInterface.registerAudioWithCategory(breakSound, 'objects');
        if (!this.userInterface.isMuted) {
            breakSound.volume = this.userInterface.objectsVolume / 10;
            breakSound.play();
        }
    }

    /**
     * Schedules an object for removal from an array after a delay.
     * Used for animation timing and cleanup.
     * @param {Object} object - The object to remove
     * @param {Array} array - The array to remove the object from
     * @param {number} delay - Delay in milliseconds before removal
     */
    scheduleObjectRemoval(object, array, delay) {
        setTimeout(() => {
            const index = array.indexOf(object);
            if (index > -1) {
                array.splice(index, 1);
            }
        }, delay);
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
     * Shows a circular progress indicator with the remaining time.
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
        const offsetX = circleRadius + padding;
        const offsetY = bottleStatusBarY + bottleStatusBarHeight + padding;
        return {
            x: offsetX,
            y: offsetY,
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
     * Shows a decreasing segment as the cooldown progresses.
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
     * Main draw function that renders the game world on each animation frame.
     * Clears the canvas and draws all game elements in proper order.
     */
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawGameWorld();
        this.statusBar.draw(this.ctx);  
        this.userInterface.drawIcons();
        this.drawEndbossHealthBar();
        if (this.throwCooldown > 0) {
            this.drawCooldownCircle();
        }
        let self = this;
        requestAnimationFrame(function() {
            self.draw();
        });
    }

    /**
     * Draws the game world elements with camera translation.
     * Renders background, character, and game objects in proper order.
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
     * Draws only the game objects currently visible on screen.
     * Performance optimization function for large levels.
     */
    drawOptimizedGameWorld() {
        this.ctx.translate(this.camera_x, 0);
        const visibleObjects = this.getVisibleObjects(this.level.backgroundObjects);
        this.addObjectsToMap(visibleObjects);
        this.addToMap(this.character);
        const visibleClouds = this.getVisibleObjects(this.level.clouds);
        this.addObjectsToMap(visibleClouds);
        const visibleEnemies = this.getVisibleObjects(this.level.enemies);
        this.addObjectsToMap(visibleEnemies);
        const visibleCoins = this.getVisibleObjects(this.level.coins);
        this.addObjectsToMap(visibleCoins);
        const visibleBottles = this.getVisibleObjects(this.level.bottles);
        this.addObjectsToMap(visibleBottles);
        this.addObjectsToMap(this.throwableObjects);
        this.ctx.translate(-this.camera_x, 0);
    }

    /**
     * Filters objects to only those visible within current camera view.
     * @param {Array<MovableObject>} objects - Array of game objects to filter
     * @returns {Array<MovableObject>} Array containing only visible objects
     */
    getVisibleObjects(objects) {
        if (!objects || !Array.isArray(objects)) return [];
        const buffer = 150;
        const leftEdge = -this.camera_x - buffer;
        const rightEdge = leftEdge + this.canvas.width + 2 * buffer;
        return objects.filter(obj => {
            const objRightEdge = obj.x + obj.width;
            const objLeftEdge = obj.x;
            return objRightEdge > leftEdge && objLeftEdge < rightEdge;
        });
    }

    /**
     * Adds an array of objects to the map by calling addToMap for each object.
     * @param {Array<MovableObject>} objects - Array of objects to add to the map
     */
    addObjectsToMap(objects) {
        if (!objects || !Array.isArray(objects)) return;
        objects.forEach((o) => {
            this.addToMap(o);
        });
    }

    /**
     * Adds a single object to the map, handling direction flipping if needed.
     * @param {MovableObject} mo - The object to add to the map
     */
    addToMap(mo) {
        this.handleObjectDirection(mo, true);
        mo.draw(this.ctx);
        this.drawAdditionalElements(mo);
        mo.drawFrame(this.ctx);
        this.handleObjectDirection(mo, false);
    }

    /**
     * Handles flipping objects based on their direction.
     * Applies canvas transformations before and after drawing.
     * @param {MovableObject} mo - The object to handle direction for
     * @param {boolean} beforeDraw - Whether this is called before or after drawing
     */
    handleObjectDirection(mo, beforeDraw) {
        const shouldFlip = (mo instanceof Character && mo.otherDirection) ||
            ((mo instanceof Chicken || mo instanceof smallChicken || mo instanceof Endboss) && !mo.otherDirection);
        if (shouldFlip) {
            beforeDraw ? this.flipImage(mo) : this.flipImageBack(mo);
        }
    }

    /**
     * Draws additional elements for specific object types.
     * Currently draws health bars for chickens when needed.
     * @param {MovableObject} mo - The object to draw additional elements for
     */
    drawAdditionalElements(mo) {
        if (mo instanceof Chicken && mo.showHealthBar) {
            mo.drawHealthBar(this.ctx);
        }
    }

    /**
     * Flips an image horizontally by applying canvas transformations.
     * Used before drawing objects facing the opposite direction.
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
     * Markiert das Spiel als beendet und verhindert weitere Endscreens.
     * @param {string} endType - Art des Spielendes ('win' oder 'lose')
     * @returns {boolean} True wenn das Spiel gerade beendet wurde, false wenn es bereits beendet war
     */
    endGame(endType) {
        if (this.gameEnded) {
            return false;
        }
        
        this.gameEnded = true;
        this.isPaused = true;
        return true;
    }
}