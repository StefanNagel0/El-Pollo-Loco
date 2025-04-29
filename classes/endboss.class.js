class Endboss extends MovableObject {
    height = 400;
    width = 250;
    y = 50;
    damage = 25;
    speed = 8;
    attackSpeed = 18;
    isAlerted = false;
    isFighting = false;
    isWalking = false;
    isHurt = false;
    isDying = false;
    isAttacking = false;
    attackCooldown = 0;
    hurtDuration = 1000;
    lastHurtTime = 0;
    showHealthBar = false;
    alertDistance = 400;
    offset = { top: 70, left: 30, right: 30, bottom: 20 };
    isCharging = false;
    isResting = false;
    attackDuration = 1000;
    restDuration = 0;
    lastAttackTime = 0;
    followDistance = 200;
    IMAGES_WALKING = [
        '../assets/img/4_enemie_boss_chicken/1_walk/G1.png',
        '../assets/img/4_enemie_boss_chicken/1_walk/G2.png',
        '../assets/img/4_enemie_boss_chicken/1_walk/G3.png',
        '../assets/img/4_enemie_boss_chicken/1_walk/G4.png'
    ];
    IMAGES_ALERT = [
        '../assets/img/4_enemie_boss_chicken/2_alert/G5.png', '../assets/img/4_enemie_boss_chicken/2_alert/G6.png',
        '../assets/img/4_enemie_boss_chicken/2_alert/G7.png', '../assets/img/4_enemie_boss_chicken/2_alert/G8.png',
        '../assets/img/4_enemie_boss_chicken/2_alert/G9.png', '../assets/img/4_enemie_boss_chicken/2_alert/G10.png',
        '../assets/img/4_enemie_boss_chicken/2_alert/G11.png', '../assets/img/4_enemie_boss_chicken/2_alert/G12.png'
    ];
    IMAGES_ATTACK = [
        '../assets/img/4_enemie_boss_chicken/3_attack/G13.png', '../assets/img/4_enemie_boss_chicken/3_attack/G14.png',
        '../assets/img/4_enemie_boss_chicken/3_attack/G15.png', '../assets/img/4_enemie_boss_chicken/3_attack/G16.png',
        '../assets/img/4_enemie_boss_chicken/3_attack/G17.png', '../assets/img/4_enemie_boss_chicken/3_attack/G18.png',
        '../assets/img/4_enemie_boss_chicken/3_attack/G19.png', '../assets/img/4_enemie_boss_chicken/3_attack/G20.png'
    ];
    IMAGES_HURT = [
        '../assets/img/4_enemie_boss_chicken/4_hurt/G21.png',
        '../assets/img/4_enemie_boss_chicken/4_hurt/G22.png',
        '../assets/img/4_enemie_boss_chicken/4_hurt/G23.png'
    ];
    IMAGES_DEAD = [
        '../assets/img/4_enemie_boss_chicken/5_dead/G24.png',
        '../assets/img/4_enemie_boss_chicken/5_dead/G25.png',
        '../assets/img/4_enemie_boss_chicken/5_dead/G26.png'
    ];

    constructor() {
        super().loadImage(this.IMAGES_ALERT[0]);
        this.loadImages(this.IMAGES_ALERT);
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_HURT);
        this.loadImages(this.IMAGES_DEAD);
        this.loadImages(this.IMAGES_ATTACK);
        this.x = 5500;
        this.energy = 200;
        this.animate();
        this.setRandomAttackCooldown();
    }

    setRandomAttackCooldown() {
        this.attackCooldown = new Date().getTime() + (2000 + Math.random() * 2000);
    }

    animate() {
        setInterval(() => this.updateAnimationState(), 200);
        setInterval(() => this.updateAIState(), 1000 / 60);
    }

    updateAnimationState() {
        if (this.isDead()) this.playDeathAnimation();
        else if (this.isHurt) this.playHurtAnimation();
        else if (this.isAttacking) this.playAnimation(this.IMAGES_ATTACK);
        else if (this.isCharging || this.isResting) this.playAnimation(this.IMAGES_WALKING);
        else if (this.isWalking) this.playAnimation(this.IMAGES_WALKING);
        else if (this.isAlerted) this.playAnimation(this.IMAGES_ALERT);
    }

    playDeathAnimation() {
        if (!this.isDying) this.setDyingState();
        this.playAnimation(this.IMAGES_DEAD);
    }

    playHurtAnimation() {
        this.playAnimation(this.IMAGES_HURT);
        const timeSinceHurt = new Date().getTime() - this.lastHurtTime;
        if (timeSinceHurt > this.hurtDuration) this.isHurt = false;
    }

    updateAIState() {
        if (!this.world?.character || this.isDead() || this.isHurt) return;
        const characterX = this.world.character.x;
        const distanceAbs = Math.abs(this.x - characterX);
        this.checkAlert(distanceAbs);
        if (this.isAlerted) this.handleAlertedBehavior(characterX, distanceAbs);
    }

    checkAlert(distanceAbs) {
        if (distanceAbs < this.alertDistance && !this.isAlerted) this.alert();
    }

    handleAlertedBehavior(characterX, distanceAbs) {
        const now = new Date().getTime();
        if (this.isCharging) this.handleCharging(characterX, now);
        else if (this.isAttacking) this.handleAttacking(now);
        else if (this.isResting) this.handleResting(characterX, now);
        else this.handleIdleOrWalking(characterX, distanceAbs, now);
    }

    handleCharging(characterX, now) {
        const targetXLeft = characterX + 100;
        const targetXRight = characterX - 100;
        if (this.x > targetXLeft) this.moveTowards(characterX, this.attackSpeed, true);
        else if (this.x < targetXRight) this.moveTowards(characterX, this.attackSpeed, false);
        else this.transitionToAttack(now);
    }

    moveTowards(targetX, speed, moveLeft) {
        this.otherDirection = moveLeft;
        this.x += moveLeft ? -speed : speed;
    }

    transitionToAttack(now) {
        this.isCharging = false;
        this.isAttacking = true;
        this.lastAttackTime = now;
        this.attackCharacter();
    }

    attackCharacter() {
        const character = this.world?.character;
        if (character && !character.isHurt()) {
            character.hit();
            character.energy -= this.damage;
            this.world.statusBar.setEnergyPercentage(character.energy);
        }
    }

    handleAttacking(now) {
        const timeSinceAttack = now - this.lastAttackTime;
        if (timeSinceAttack > this.attackDuration) this.transitionToResting(now);
    }

    transitionToResting(now) {
        this.isAttacking = false;
        this.isResting = true;
        this.restDuration = 2000 + Math.random() * 2000;
        this.lastAttackTime = now;
    }

    handleResting(characterX, now) {
        this.followCharacter(characterX, this.speed);
        const timeSinceAttack = now - this.lastAttackTime;
        if (timeSinceAttack > this.restDuration) this.endResting();
    }

    endResting() {
        this.isResting = false;
        this.setRandomAttackCooldown();
        this.lastDirection = null;
    }

    handleIdleOrWalking(characterX, distanceAbs, now) {
        if (now >= this.attackCooldown && distanceAbs < 600) this.startAttack();
        else if (this.isWalking) this.followCharacter(characterX, this.speed);
        else if (!this.isWalking) this.tryStartWalking();
    }

    followCharacter(characterX, speed) {
        const distanceToCharacter = Math.abs(this.x - characterX);
        const deadZone = 80;
        let isMoving = false;
        if (distanceToCharacter < this.followDistance) isMoving = this.moveAway(characterX, speed);
        else if (distanceToCharacter > this.followDistance + 100) isMoving = this.moveCloser(characterX, speed, deadZone);
        if (!isMoving && distanceToCharacter <= this.followDistance && this.isWalking) this.isWalking = false;
    }

    moveAway(characterX, speed) {
        if (this.x > characterX) this.moveTowards(characterX, speed, false); // Move right
        else this.moveTowards(characterX, speed, true); // Move left
        return true;
    }

    moveCloser(characterX, speed, deadZone) {
        if (this.x > characterX + deadZone) this.moveTowards(characterX, speed, true); // Move left
        else if (this.x < characterX - deadZone) this.moveTowards(characterX, speed, false); // Move right
        else return false; // Inside deadzone
        return true;
    }

    tryStartWalking() {
        setTimeout(() => this.startWalking(), 500);
    }

    startAttack() {
        this.isCharging = true;
        this.isAttacking = false;
        this.isResting = false;
    }

    alert() {
        this.isAlerted = true;
        this.showHealthBar = true;
    }

    startWalking() {
        this.isWalking = true;
    }

    hit() {
        super.hit();
        if (this.isDead()) this.speed = 0;
    }

    die() {
        if (this.isDying) return;
        this.setDyingState();
        setTimeout(() => {
            this.handleDeathSoundAndMusic();
            this.showGameWonScreen();
        }, 300);
    }

    setDyingState() {
        this.energy = 0;
        this.speed = 0;
        this.isDying = true;
        this.showHealthBar = false;
        this.isWalking = false;
        this.isAttacking = false;
        this.isCharging = false;
        this.isResting = false;
        this.isHurt = false;
    }

    handleDeathSoundAndMusic() {
        try {
            const ui = this.world?.userInterface;
            if (ui?.backgroundMusic) {
                const wasPlaying = !ui.backgroundMusic.paused;
                const wasMuted = ui.backgroundMusic.muted;
                ui.backgroundMusic.pause();
                this.playGameWonSound(ui, wasPlaying, wasMuted);
            } else this.playGameWonSoundFallback();
        } catch (error) {/* ignore */ }
    }

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

    playGameWonSoundFallback() {
        const gameWonSound = new Audio('../assets/audio/game_won.mp3');
        gameWonSound.play();
    }

    showGameWonScreen() {
        setTimeout(() => {
            if (!window.wonScreen) window.wonScreen = new Won();
            window.wonScreen.show();
        }, 1000);
    }

    hitWithBottle() {
        this.energy -= 40;
        if (this.energy < 0) this.energy = 0;
        this.triggerHurtState();
        if (this.isDead()) this.die();
    }

    triggerHurtState() {
        this.isHurt = true;
        this.lastHurtTime = new Date().getTime();
        this.playHurtSound();
    }

    playHurtSound() {
        const ui = this.world?.userInterface;
        if (ui) {
            const hurtSound = new Audio('../assets/audio/Endboss_hurt.mp3');
            ui.registerAudioWithCategory(hurtSound, 'enemies');
            if (!ui.isMuted) hurtSound.play();
        }
    }

    drawHealthBar(ctx) {
        if (!this.showHealthBar || this.energy <= 0) return;
        const { barX, barY, barWidth, barHeight } = this.calculateHealthBarPosition();
        const healthPercentage = this.energy / 200;
        const barColor = this.getHealthBarColor(healthPercentage);
        this.drawHealthBarElements(ctx, barX, barY, barWidth, barHeight, healthPercentage, barColor);
    }

    calculateHealthBarPosition() {
        let barWidth = 200, barHeight = 20;
        if (this.world?.canvas) barWidth = this.world.canvas.width / 3;
        const barX = (this.world?.canvas?.width - barWidth) / 2 || 0;
        const barY = 20;
        return { barX, barY, barWidth, barHeight };
    }

    getHealthBarColor(percentage) {
        if (percentage > 0.75) return 'green';
        if (percentage > 0.25) return 'orange';
        return 'red';
    }

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
}