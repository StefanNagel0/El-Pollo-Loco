/**
 * Manages all collision detection and reactions in the game.
 * Handles collisions between player, enemies, coins, bottles, and throwable objects.
 * @class
 */
class CollisionHandler {
    /**
     * Creates a new CollisionHandler with a reference to the game world.
     * @param {World} world - The game world in which collisions should be detected
     */
    constructor(world) {
        this.world = world;
    }

    /**
     * Checks all types of collisions in the game.
     * Handles enemy, coin, and bottle collisions.
     */
    checkCollisions() {
        if (this.world.level.enemies) this.checkEnemyCollisions();
        if (this.world.level.coins) this.checkCoinCollisions();
        if (this.world.level.bottles) this.checkBottleCollisions();
    }

    /**
     * Checks collisions between the character and enemies.
     * Handles stomping of enemies and damage from enemies.
     */
    checkEnemyCollisions() {
        this.world.level.enemies.forEach((enemy, enemyIndex) => {
            if (this.isCharacterStompingEnemy(enemy)) {
                this.handleEnemyStomp(enemy);
            } else if (this.world.character.isColiding(enemy)) {
                this.handleEnemyCollision(enemy, enemyIndex);
            } else {
                this.removeEnemyFromCollisionList(enemy, enemyIndex);
            }
        });
    }

    /**
     * Determines if the character is stomping on an enemy.
     * Checks vertical positions and velocity to detect stomping.
     * @param {MovableObject} enemy - The enemy to check
     * @returns {boolean} True if the character is stomping on the enemy
     */
    isCharacterStompingEnemy(enemy) {
        const characterBottom = this.world.character.y + this.world.character.height - this.world.character.offset.bottom;
        const enemyTop = enemy.y + (enemy.offset?.top || 0);
        const stompHeight = enemy.stompableAreaHeight || 40;
        return this.world.character.isColiding(enemy) &&
            characterBottom >= enemyTop &&
            characterBottom <= enemyTop + stompHeight &&
            this.world.character.speedY < 0;
    }

    /**
     * Handles the logic when an enemy is stomped by the character.
     * Makes the enemy die and causes the character to bounce up.
     * @param {MovableObject} enemy - The stomped enemy
     */
    handleEnemyStomp(enemy) {
        if (!(enemy instanceof Endboss) && !enemy.isDead) {
            enemy.die();
            this.world.character.speedY = 25;
            this.playStompSound();
            this.scheduleEnemyRemoval(enemy, 500);
        }
    }

    /**
     * Plays the stomp sound effect if sound is enabled.
     */
    playStompSound() {
        const stompSound = new Audio('../assets/audio/stomp_enemie.mp3');
        this.world.userInterface.registerAudioWithCategory(stompSound, 'enemies');
        if (!this.world.userInterface.isMuted) {
            stompSound.volume = this.world.userInterface.enemiesVolume / 10;
            stompSound.play();
        }
    }

    /**
     * Handles collision between character and enemy when no stomping occurs.
     * Applies damage to the character based on enemy type.
     * @param {MovableObject} enemy - The enemy colliding with the character
     * @param {number} enemyIndex - Index of the enemy in the enemies array
     */
    handleEnemyCollision(enemy, enemyIndex) {
        if (!enemy.isDead) {
            const enemyId = enemy.constructor.name + '_' + enemyIndex;
            if (!this.world.character.collidingEnemies.includes(enemyId)) {
                this.world.character.collidingEnemies.push(enemyId);
                this.applyEnemyDamage(enemy);
            }
        }
    }

    /**
     * Applies appropriate damage to the character based on enemy type.
     * Updates the health bar accordingly.
     * @param {MovableObject} enemy - The enemy causing damage
     */
    applyEnemyDamage(enemy) {
        if (enemy instanceof Endboss) {
            this.world.character.energy -= enemy.damage;
            this.world.statusBar.setEnergyPercentage(this.world.character.energy);
            this.world.character.lastHit = new Date().getTime();
        } else if (enemy instanceof Chicken || enemy instanceof smallChicken) {
            this.world.character.hit();
            this.world.statusBar.setEnergyPercentage(this.world.character.energy);
        }
    }

    /**
     * Removes an enemy from the collision tracking list when there's no longer a collision.
     * @param {MovableObject} enemy - The enemy to remove from the collision list
     * @param {number} enemyIndex - Index of the enemy in the enemies array
     */
    removeEnemyFromCollisionList(enemy, enemyIndex) {
        const enemyId = enemy.constructor.name + '_' + enemyIndex;
        const index = this.world.character.collidingEnemies.indexOf(enemyId);
        if (index !== -1) {
            this.world.character.collidingEnemies.splice(index, 1);
        }
    }

    /**
     * Checks collisions between the character and coins.
     * Collects coins upon detection and updates the UI.
     */
    checkCoinCollisions() {
        this.world.level.coins.forEach((coin, index) => {
            if (this.world.character.isColiding(coin)) {
                this.world.character.collectCoin();
                this.world.level.coins.splice(index, 1);
            }
        });
    }

    /**
     * Checks collisions between the character and bottles to pick up.
     * Collects bottles upon detection and updates the UI.
     */
    checkBottleCollisions() {
        this.world.level.bottles.forEach((bottle) => {
            if (this.world.character.isColiding(bottle)) {
                this.world.character.collectBottle();
                const bottleIndex = this.world.level.bottles.indexOf(bottle);
                if (bottleIndex > -1) {
                    this.world.level.bottles.splice(bottleIndex, 1);
                }
            }
        });
    }

    /**
     * Schedules the removal of an enemy after a delay.
     * Used for animation timing after an enemy's death.
     * @param {MovableObject} enemy - The enemy to remove
     * @param {number} delay - Delay in milliseconds before removal
     */
    scheduleEnemyRemoval(enemy, delay) {
        setTimeout(() => {
            const enemyIndex = this.world.level.enemies.indexOf(enemy);
            if (enemyIndex > -1 && enemy.isDead) {
                this.world.level.enemies.splice(enemyIndex, 1);
            }
        }, delay);
    }

    /**
     * Checks distances between enemies to prevent overlapping.
     * Makes enemies change direction when they get too close.
     */
    checkEnemyDistances() {
        if (this.world.isPaused) return;
        this.world.level.enemies.forEach((enemy1, index1) => {
            if (enemy1 instanceof Endboss) return;
            this.checkEnemyDistancesForSingleEnemy(enemy1, index1);
        });
    }

    /**
     * Checks distances between a single enemy and all other enemies.
     * @param {MovableObject} enemy1 - The enemy for which distances should be checked
     * @param {number} index1 - Index of the enemy in the enemies array
     */
    checkEnemyDistancesForSingleEnemy(enemy1, index1) {
        this.world.level.enemies.forEach((enemy2, index2) => {
            if (this.shouldCheckEnemies(enemy1, enemy2, index1, index2)) {
                this.handleEnemyProximity(enemy1, enemy2);
            }
        });
    }

    /**
     * Determines whether two enemies should be checked for proximity.
     * Skips checks for end bosses, dead enemies, and the same enemy.
     * @param {MovableObject} enemy1 - First enemy to check
     * @param {MovableObject} enemy2 - Second enemy to check
     * @param {number} index1 - Index of the first enemy
     * @param {number} index2 - Index of the second enemy
     * @returns {boolean} True if the enemies should be checked for proximity
     */
    shouldCheckEnemies(enemy1, enemy2, index1, index2) {
        return index1 !== index2 &&
            !(enemy2 instanceof Endboss) &&
            !enemy1.isDead &&
            !enemy2.isDead;
    }

    /**
     * Handles enemy proximity by causing direction changes.
     * Pushes enemies apart when they get too close.
     * @param {MovableObject} enemy1 - First enemy in proximity
     * @param {MovableObject} enemy2 - Second enemy in proximity
     */
    handleEnemyProximity(enemy1, enemy2) {
        const distanceX = Math.abs(enemy1.x - enemy2.x);
        const distanceY = Math.abs(enemy1.y - enemy2.y);
        if (distanceX < 100 && distanceY < enemy1.height / 2) {
            this.adjustEnemyDirections(enemy1, enemy2);
        }
    }

    /**
     * Adjusts the directions of two enemies to prevent overlap.
     * @param {MovableObject} enemy1 - First enemy to adjust
     * @param {MovableObject} enemy2 - Second enemy to adjust
     */
    adjustEnemyDirections(enemy1, enemy2) {
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

    /**
     * Checks collisions between thrown bottles and enemies.
     * Handles enemy damage and bottle breaking effects.
     */
    checkCollisionsWithBottles() {
        if (this.world.throwableObjects.length > 0 && this.world.level.enemies) {
            this.world.throwableObjects.forEach(bottle => {
                this.checkBottleCollisionsWithEnemies(bottle);
            });
        }
    }

    /**
     * Checks collisions between a bottle and all enemies.
     * @param {ThrowableObject} bottle - The thrown bottle to check
     */
    checkBottleCollisionsWithEnemies(bottle) {
        this.world.level.enemies.forEach(enemy => {
            this.checkBottleEnemyCollision(bottle, enemy);
        });
    }

    /**
     * Checks collision between a specific bottle and an enemy.
     * Handles bottle breaking and enemy damage upon collision.
     * @param {ThrowableObject} bottle - The thrown bottle to check
     * @param {MovableObject} enemy - The enemy to check for collision
     */
    checkBottleEnemyCollision(bottle, enemy) {
        const enemyIsDead = enemy instanceof Endboss ? enemy.isDead() : enemy.isDead;
        if (bottle.isColiding(enemy) && !enemyIsDead && !bottle.isBroken) {
            this.handleBottleEnemyImpact(bottle, enemy);
        }
    }

    /**
     * Handles the impact of a bottle on an enemy.
     * Breaks the bottle and applies damage to the enemy.
     * @param {ThrowableObject} bottle - The bottle that hit the enemy
     * @param {MovableObject} enemy - The enemy hit by the bottle
     */
    handleBottleEnemyImpact(bottle, enemy) {
        bottle.break();
        this.handleEnemyHitByBottle(enemy);
        this.playBottleBreakSound();
        this.scheduleObjectRemoval(bottle, this.world.throwableObjects, 300);
        if (!(enemy instanceof Endboss) || enemy.isDead()) {
            this.scheduleEnemyRemoval(enemy, 500);
        }
    }

    /**
     * Applies damage to an enemy hit by a bottle.
     * Handles end bosses differently than normal enemies.
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
     * Plays the bottle break sound effect if sound is enabled.
     */
    playBottleBreakSound() {
        const breakSound = new Audio('../assets/audio/bottle_break.mp3');
        this.world.userInterface.registerAudioWithCategory(breakSound, 'objects');
        if (!this.world.userInterface.isMuted) {
            breakSound.volume = this.world.userInterface.objectsVolume / 10;
            breakSound.play();
        }
    }

    /**
     * Schedules the removal of an object from an array after a delay.
     * Used for animation timing and cleanup.
     * @param {Object} object - The object to remove
     * @param {Array} array - The array from which to remove the object
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
}