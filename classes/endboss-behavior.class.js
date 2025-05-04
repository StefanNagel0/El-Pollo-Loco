/**
 * Handles advanced behavior and AI logic for the Endboss.
 * Manages movement patterns, attacks, and state transitions.
 * @class
 */
class EndbossBehavior {
    /**
     * Creates a new EndbossBehavior instance linked to an Endboss.
     * @param {Endboss} endboss - The Endboss instance to control
     */
    constructor(endboss) {
        this.endboss = endboss;
    }

    /**
     * Updates the animation state based on the boss's current condition.
     */
    updateAnimationState() {
        if (this.endboss.isDead()) this.playDeathAnimation();
        else if (this.endboss.isHurt) this.playHurtAnimation();
        else if (this.endboss.isAttacking) this.endboss.playAnimation(this.endboss.IMAGES_ATTACK);
        else if (this.endboss.isCharging || this.endboss.isResting) this.endboss.playAnimation(this.endboss.IMAGES_WALKING);
        else if (this.endboss.isWalking) this.endboss.playAnimation(this.endboss.IMAGES_WALKING);
        else if (this.endboss.isAlerted) this.endboss.playAnimation(this.endboss.IMAGES_ALERT);
    }

    /**
     * Plays the death animation and sets appropriate state.
     */
    playDeathAnimation() {
        if (!this.endboss.isDying) this.endboss.setDyingState();
        this.endboss.playAnimation(this.endboss.IMAGES_DEAD);
    }

    /**
     * Plays the hurt animation and manages its duration.
     */
    playHurtAnimation() {
        this.endboss.playAnimation(this.endboss.IMAGES_HURT);
        const timeSinceHurt = new Date().getTime() - this.endboss.lastHurtTime;
        if (timeSinceHurt > this.endboss.hurtDuration) this.endboss.isHurt = false;
    }

    /**
     * Updates the AI behavior state based on the character's position.
     */
    updateAIState() {
        if (!this.endboss.world?.character || this.endboss.isDead() || this.endboss.isHurt) return;
        const characterX = this.endboss.world.character.x;
        const distanceAbs = Math.abs(this.endboss.x - characterX);
        this.checkAlert(distanceAbs);
        if (this.endboss.isAlerted) this.handleAlertedBehavior(characterX, distanceAbs);
    }

    /**
     * Checks if the boss should be alerted based on character distance.
     * @param {number} distanceAbs - Absolute distance to the character
     */
    checkAlert(distanceAbs) {
        if (distanceAbs < this.endboss.alertDistance && !this.endboss.isAlerted) this.endboss.alert();
    }

    /**
     * Handles behavior states when the boss is alerted.
     * @param {number} characterX - X-coordinate of the character
     * @param {number} distanceAbs - Absolute distance to the character
     */
    handleAlertedBehavior(characterX, distanceAbs) {
        const now = new Date().getTime();
        if (this.endboss.isCharging) this.handleCharging(characterX, now);
        else if (this.endboss.isAttacking) this.handleAttacking(now);
        else if (this.endboss.isResting) this.handleResting(characterX, now);
        else this.handleIdleOrWalking(characterX, distanceAbs, now);
    }

    /**
     * Handles the charging behavior, moving toward the character.
     * @param {number} characterX - X-coordinate of the character
     * @param {number} now - Current timestamp
     */
    handleCharging(characterX, now) {
        const targetXLeft = characterX + 100;
        const targetXRight = characterX - 100;
        if (this.endboss.x > targetXLeft) this.moveTowards(characterX, this.endboss.attackSpeed, true);
        else if (this.endboss.x < targetXRight) this.moveTowards(characterX, this.endboss.attackSpeed, false);
        else this.transitionToAttack(now);
    }

    /**
     * Moves the boss toward or away from a target position.
     * @param {number} targetX - Target X-coordinate
     * @param {number} speed - Movement speed
     * @param {boolean} moveLeft - Whether to move left
     */
    moveTowards(targetX, speed, moveLeft) {
        this.endboss.otherDirection = moveLeft;
        this.endboss.x += moveLeft ? -speed : speed;
    }

    /**
     * Transitions from charging to attacking state.
     * @param {number} now - Current timestamp
     */
    transitionToAttack(now) {
        this.endboss.isCharging = false;
        this.endboss.isAttacking = true;
        this.endboss.lastAttackTime = now;
        this.attackCharacter();
    }

    /**
     * Deals damage to the character if conditions are met.
     */
    attackCharacter() {
        const character = this.endboss.world?.character;
        if (character && !character.isHurt()) {
            character.hit();
            character.energy -= this.endboss.damage;
            this.endboss.world.statusBar.setEnergyPercentage(character.energy);
        }
    }

    /**
     * Handles the attacking state and its duration.
     * @param {number} now - Current timestamp
     */
    handleAttacking(now) {
        const timeSinceAttack = now - this.endboss.lastAttackTime;
        if (timeSinceAttack > this.endboss.attackDuration) this.transitionToResting(now);
    }

    /**
     * Transitions from attacking to resting state.
     * @param {number} now - Current timestamp
     */
    transitionToResting(now) {
        this.endboss.isAttacking = false;
        this.endboss.isResting = true;
        this.endboss.restDuration = 2000 + Math.random() * 2000;
        this.endboss.lastAttackTime = now;
    }

    /**
     * Handles the resting state after an attack.
     * @param {number} characterX - X-coordinate of the character
     * @param {number} now - Current timestamp
     */
    handleResting(characterX, now) {
        this.followCharacter(characterX, this.endboss.speed);
        const timeSinceAttack = now - this.endboss.lastAttackTime;
        if (timeSinceAttack > this.endboss.restDuration) this.endResting();
    }

    /**
     * Ends the resting state and resets for next attack cycle.
     */
    endResting() {
        this.endboss.isResting = false;
        this.endboss.setRandomAttackCooldown();
        this.endboss.lastDirection = null;
    }

    /**
     * Handles idle or walking behavior between attacks.
     * @param {number} characterX - X-coordinate of the character
     * @param {number} distanceAbs - Absolute distance to the character
     * @param {number} now - Current timestamp
     */
    handleIdleOrWalking(characterX, distanceAbs, now) {
        if (now >= this.endboss.attackCooldown && distanceAbs < 600) this.endboss.startAttack();
        else if (this.endboss.isWalking) this.followCharacter(characterX, this.endboss.speed);
        else if (!this.endboss.isWalking) this.endboss.tryStartWalking();
    }

    /**
     * Makes the boss follow the character, maintaining an optimal distance.
     * @param {number} characterX - X-coordinate of the character
     * @param {number} speed - Movement speed to use
     */
    followCharacter(characterX, speed) {
        const distanceToCharacter = Math.abs(this.endboss.x - characterX);
        const deadZone = 80;
        let isMoving = false;
        if (distanceToCharacter < this.endboss.followDistance) isMoving = this.moveAway(characterX, speed);
        else if (distanceToCharacter > this.endboss.followDistance + 100) isMoving = this.moveCloser(characterX, speed, deadZone);
        if (!isMoving && distanceToCharacter <= this.endboss.followDistance && this.endboss.isWalking) this.endboss.isWalking = false;
    }

    /**
     * Moves the boss away from the character.
     * @param {number} characterX - X-coordinate of the character
     * @param {number} speed - Movement speed
     * @returns {boolean} Whether movement occurred
     */
    moveAway(characterX, speed) {
        if (this.endboss.x > characterX) this.moveTowards(characterX, speed, false);
        else this.moveTowards(characterX, speed, true);
        return true;
    }

    /**
     * Moves the boss closer to the character.
     * @param {number} characterX - X-coordinate of the character
     * @param {number} speed - Movement speed
     * @param {number} deadZone - Zone where no movement is needed
     * @returns {boolean} Whether movement occurred
     */
    moveCloser(characterX, speed, deadZone) {
        if (this.endboss.x > characterX + deadZone) this.moveTowards(characterX, speed, true);
        else if (this.endboss.x < characterX - deadZone) this.moveTowards(characterX, speed, false);
        else return false;
        return true;
    }

    /**
     * Handles being hit by a bottle projectile.
     */
    hitWithBottle() {
        this.endboss.energy -= 40;
        if (this.endboss.energy < 0) this.endboss.energy = 0;
        if (!this.endboss.isAlerted) {
            this.endboss.alert();
            this.endboss.startAttack();
        }
        this.endboss.triggerHurtState();
        if (this.endboss.isDead()) this.endboss.die();
    }

    /**
     * Draws the boss's health bar at the top of the screen.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     */
    drawHealthBar(ctx) {
        if (!this.endboss.showHealthBar || this.endboss.energy <= 0) return;
        const { barX, barY, barWidth, barHeight } = this.calculateHealthBarPosition();
        const healthPercentage = this.endboss.energy / 200;
        const barColor = this.getHealthBarColor(healthPercentage);
        this.drawHealthBarElements(ctx, barX, barY, barWidth, barHeight, healthPercentage, barColor);
    }

    /**
     * Calculates the position and dimensions of the health bar.
     * @returns {Object} Object with x, y, width and height properties
     */
    calculateHealthBarPosition() {
        let barWidth = 200, barHeight = 20;
        if (this.endboss.world?.canvas) barWidth = this.endboss.world.canvas.width / 3;
        const barX = (this.endboss.world?.canvas?.width - barWidth) / 2 || 0;
        const barY = 20;
        return { barX, barY, barWidth, barHeight };
    }

    /**
     * Determines the color of the health bar based on remaining health percentage.
     * @param {number} percentage - Health percentage (0-1)
     * @returns {string} Color string for the health bar
     */
    getHealthBarColor(percentage) {
        if (percentage > 0.75) return 'green';
        if (percentage > 0.25) return 'orange';
        return 'red';
    }

    /**
     * Draws all elements of the health bar.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     * @param {number} x - X position of the health bar
     * @param {number} y - Y position of the health bar
     * @param {number} w - Width of the health bar
     * @param {number} h - Height of the health bar
     * @param {number} percentage - Health percentage (0-1)
     * @param {string} color - Color to use for the health bar
     */
    drawHealthBarElements(ctx, x, y, w, h, percentage, color) {
        ctx.fillStyle = 'black';
        ctx.fillRect(x - 2, y - 2, w + 4, h + 4);
        ctx.fillStyle = 'grey';
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = color;
        ctx.fillRect(x, y, w * percentage, h);
        ctx.fillStyle = 'white';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('ENDBOSS', x + w / 2, y - 5);
    }

    /**
     * Handles sound and music transitions when the boss dies.
     */
    handleDeathSoundAndMusic() {
        try {
            const ui = this.endboss.world?.userInterface;
            if (ui?.backgroundMusic) {
                const wasPlaying = !ui.backgroundMusic.paused;
                const wasMuted = ui.backgroundMusic.muted;
                ui.backgroundMusic.pause();
                this.playGameWonSound(ui, wasPlaying, wasMuted);
            } else this.playGameWonSoundFallback();
        } catch (error) {}
    }

    /**
     * Plays the victory sound and handles background music restoration.
     * @param {UserInterface} ui - Game UI instance
     * @param {boolean} wasPlaying - Whether background music was playing
     * @param {boolean} wasMuted - Whether background music was muted
     */
    playGameWonSound(ui, wasPlaying, wasMuted) {
        const gameWonSound = new Audio('../assets/audio/game_won.mp3');
        gameWonSound.volume = 1.0;
        ui.registerAudioWithCategory(gameWonSound, 'music');
        gameWonSound.addEventListener('ended', () => {
            if (wasPlaying && !ui.isMuted) {
                ui.backgroundMusic.muted = wasMuted;
                ui.backgroundMusic.play();
            }
        });
        gameWonSound.play().catch(() => {
            if (wasPlaying && !ui.isMuted) {
                ui.backgroundMusic.muted = wasMuted;
                ui.backgroundMusic.play();
            }
        });
    }

    /**
     * Fallback method to play victory sound if UI is unavailable.
     */
    playGameWonSoundFallback() {
        const gameWonSound = new Audio('../assets/audio/game_won.mp3');
        gameWonSound.play();
    }

    /**
     * Plays the hurt sound effect.
     */
    playHurtSound() {
        const ui = this.endboss.world?.userInterface;
        if (ui) {
            const hurtSound = new Audio('../assets/audio/Endboss_hurt.mp3');
            ui.registerAudioWithCategory(hurtSound, 'enemies');
            if (!ui.isMuted) hurtSound.play();
        }
    }
}