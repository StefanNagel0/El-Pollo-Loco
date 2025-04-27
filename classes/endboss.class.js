class Endboss extends MovableObject {
    height = 400;
    width = 250;
    y = 50;
    damage = 25;
    speed = 8;
    attackSpeed = 18;
    isAlerted = false;
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
        '../assets/img/4_enemie_boss_chicken/2_alert/G5.png',
        '../assets/img/4_enemie_boss_chicken/2_alert/G6.png',
        '../assets/img/4_enemie_boss_chicken/2_alert/G7.png',
        '../assets/img/4_enemie_boss_chicken/2_alert/G8.png',
        '../assets/img/4_enemie_boss_chicken/2_alert/G9.png',
        '../assets/img/4_enemie_boss_chicken/2_alert/G10.png',
        '../assets/img/4_enemie_boss_chicken/2_alert/G11.png',
        '../assets/img/4_enemie_boss_chicken/2_alert/G12.png'
    ];
    IMAGES_ATTACK = [
        '../assets/img/4_enemie_boss_chicken/3_attack/G13.png',
        '../assets/img/4_enemie_boss_chicken/3_attack/G14.png',
        '../assets/img/4_enemie_boss_chicken/3_attack/G15.png',
        '../assets/img/4_enemie_boss_chicken/3_attack/G16.png',
        '../assets/img/4_enemie_boss_chicken/3_attack/G17.png',
        '../assets/img/4_enemie_boss_chicken/3_attack/G18.png',
        '../assets/img/4_enemie_boss_chicken/3_attack/G19.png',
        '../assets/img/4_enemie_boss_chicken/3_attack/G20.png'
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
        this.loadAllImages();
        this.x = 5500;
        this.energy = 200;
        this.animate();
        this.setRandomAttackCooldown();
    }

    loadAllImages() {
        this.loadImages(this.IMAGES_ALERT);
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_HURT);
        this.loadImages(this.IMAGES_DEAD);
        this.loadImages(this.IMAGES_ATTACK);
    }

    setRandomAttackCooldown() {
        this.attackCooldown = new Date().getTime() + 2000 + Math.random() * 2000;
    }

    animate() {
        this.setupAnimationIntervals();
        this.setupDistanceCheck();
    }

    setupAnimationIntervals() {
        setInterval(() => {
            if (this.isDead()) {
                this.handleDeathAnimation();
            } else if (this.isHurt) {
                this.handleHurtAnimation();
            } else if (this.isAttacking) {
                this.playAnimation(this.IMAGES_ATTACK);
            } else if (this.isAlerted && this.shouldShowAlertAnimation()) {
                this.playAnimation(this.IMAGES_ALERT);
            } else if (this.isCharging || this.isResting) {
                this.playAnimation(this.IMAGES_WALKING);
            } else if (this.isWalking) {
                this.playAnimation(this.IMAGES_WALKING);
            }
        }, 200);
    }

    shouldShowAlertAnimation() {
        return this.speed === 0;
    }

    setupDistanceCheck() {
        setInterval(() => {
            if (this.world && this.world.character && !this.isDead() && !this.isHurt) {
                this.checkCharacterDistance();
            }
        }, 1000 / 60);
    }

    handleDeathAnimation() {
        if (!this.isDying) {
            this.startDeathState();
        }
        this.playAnimation(this.IMAGES_DEAD);
    }

    startDeathState() {
        this.isDying = true;
        this.speed = 0;
        this.isWalking = false;
        this.isAttacking = false;
        this.isCharging = false;
        this.isResting = false;
        this.isHurt = false;
    }

    handleHurtAnimation() {
        this.playAnimation(this.IMAGES_HURT);
        if (this.isHurtDurationOver()) {
            this.isHurt = false;
        }
    }

    isHurtDurationOver() {
        const timeSinceHurt = new Date().getTime() - this.lastHurtTime;
        return timeSinceHurt > this.hurtDuration;
    }

    checkCharacterDistance() {
        if (!this.world || !this.world.character) {
            console.warn('World or character is not defined for Endboss');
            return;
        }

        const characterX = this.world.character.x;
        const distance = this.x - characterX;
        const distanceAbs = Math.abs(distance);
        if (distanceAbs < this.alertDistance && !this.isAlerted) {
            this.alert();
        }

        if (this.isAlerted) {
            this.handleAlertState(characterX, distance);
        }
    }

    handleAlertState(characterX, distance) {
        const now = new Date().getTime();
        if (this.shouldStartCharging(now)) {
            this.startChargingState();
            return;
        }
        if (this.isCharging) {
            this.handleChargingState(characterX);
        } else if (this.isAttacking) {
            this.handleAttackingState(now);
        } else if (this.isResting) {
            this.handleRestingState(characterX, distance, now);
        } else if (this.isTooCloseToCharacter(distance)) {
            this.stopAndAlert();
        } else {
            this.resumeMovement();
        }
    }
    
    shouldStartCharging(now) {
        return !this.isCharging && !this.isAttacking && !this.isResting && now >= this.attackCooldown;
    }
    
    isTooCloseToCharacter(distance) {
        return Math.abs(distance) <= this.followDistance;
    }
    
    stopAndAlert() {
        if (this.speed !== 0) {
            this._oldSpeed = this.speed;
        }
        this.speed = 0;
        this.isWalking = false;
        this.isCharging = false;
        this.isResting = false;
    }
    
    resumeMovement() {
        if (this.speed === 0 && this._oldSpeed) {
            this.speed = this._oldSpeed;
        }
    }

    handleChargingState(characterX) {
        if (this.x > characterX + 100) {
            this.otherDirection = true;
            this.x -= this.attackSpeed;
        } else if (this.x < characterX - 100) {
            this.otherDirection = false;
            this.x += this.attackSpeed;
        } else {
            this.startAttack();
        }
    }

    handleAttackingState(now) {
        const timeSinceAttack = now - this.lastAttackTime;
        if (timeSinceAttack > this.attackDuration) {
            this.startRestingState(now);
        }
    }

    handleRestingState(characterX, distance, now) {
        if (Math.abs(distance) <= this.followDistance) {
            if (this.speed !== 0) {
                this._oldSpeed = this.speed;
            }
            this.speed = 0;
            this.isWalking = false;
            this.isCharging = false;
            this.isResting = false;
            return;
        }
        if (Math.abs(distance) < this.followDistance) {
            this.moveAwayFromCharacter(characterX);
        } else {
            this.moveTowardsCharacter(characterX);
        }
        if (now - this.lastAttackTime > this.restDuration) {
            this.startChargingState();
        }
    }

    moveAwayFromCharacter(characterX) {
        if (this.x < characterX) {
            this.x -= this.speed;
        } else {
            this.x += this.speed;
        }
    }

    moveTowardsCharacter(characterX) {
        if (this.x < characterX) {
            this.x += this.speed;
        } else {
            this.x -= this.speed;
        }
    }

    startAttack() {
        this.isCharging = false;
        this.isAttacking = true;
        this.lastAttackTime = new Date().getTime();
        setTimeout(() => {
            if (this.isAttacking) {
                this.attackCharacter();
            }
        }, 450);
    }

    attackCharacter() {
        if (this.world.character && !this.world.character.isHurt()) {
            this.world.character.hit();
            this.world.character.energy -= this.damage;
            this.world.statusBar.setEnergyPercentage(this.world.character.energy);
        }
    }

    startRestingState(now) {
        this.isAttacking = false;
        this.isResting = true;
        this.restDuration = 2000 + Math.random() * 2000;
        this.lastAttackTime = now;
        this.setRandomAttackCooldown();
    }

    startChargingState() {
        this.isResting = false;
        this.isCharging = true;
    }

    alert() {
        this.isAlerted = true;
        this.showHealthBar = true;
    }

    hit() {
        super.hit();
        if (this.isDead()) {
            this.speed = 0;
        }
    }

    die() {
        if (this.isDying) return;
        this.prepareDeath();
        setTimeout(() => {
            this.handleGameWonSound();
            this.showWonScreen();
        }, 300);
    }

    prepareDeath() {
        this.energy = 0;
        this.speed = 0;
        this.isDying = true;
        this.showHealthBar = false;
    }

    handleGameWonSound() {
        try {
            const ui = this.world?.userInterface, src = '../assets/audio/game_won.mp3';
            if (!ui) return new Audio(src).play().catch(() => {});
            this.pauseBackgroundMusic();
            const sound = Object.assign(new Audio(src), { volume: 1.0 });
            ui.registerAudioWithCategory(sound, 'music');
            const resume = () => this.resumeBackgroundMusic();
            if (!ui.isMuted) {
                sound.addEventListener('ended', resume);
                sound.play().catch(resume);
            } else setTimeout(resume, 2000);
        } catch {
            setTimeout(() => this.world?.userInterface?.backgroundMusic && this.resumeBackgroundMusic(), 2000);
        }
    }

    pauseBackgroundMusic() {
        try {
            if (!this.world?.userInterface?.backgroundMusic) {
                return;
            }
            const bgMusic = this.world.userInterface.backgroundMusic;
            this.wasPlaying = !bgMusic.paused;
            this.wasMuted = bgMusic.muted;
            bgMusic.pause();
        } catch (error) {
            console.error('Fehler beim Pausieren der Hintergrundmusik:', error);
        }
    }

    resumeBackgroundMusic() {
        try {
            if (!this.world?.userInterface?.backgroundMusic) {
                return;
            }
            const bgMusic = this.world.userInterface.backgroundMusic;
            if (this.wasPlaying && !this.world.userInterface.isMuted) {
                bgMusic.muted = this.wasMuted;
                bgMusic.play()
                    .catch(error => console.error('Fehler beim Fortsetzen der Hintergrundmusik:', error));
            }
        } catch (error) {
            console.error('Fehler beim Fortsetzen der Hintergrundmusik:', error);
        }
    }

    showWonScreen() {
        setTimeout(() => {
            if (!window.wonScreen) {
                window.wonScreen = new Won();
            }
            window.wonScreen.show();
        }, 1000);
    }

    hitWithBottle() {
        this.applyDamage(40);
        this.isHurt = true;
        this.lastHurtTime = new Date().getTime();
        this.playHurtSound();
        if (this.isDead()) this.die();
    }

    applyDamage(damage) {
        this.energy = Math.max(0, this.energy - damage);
    }

    playHurtSound() {
        if (this.world?.userInterface) {
            const hurtSound = new Audio('../assets/audio/Endboss_hurt.mp3');
            this.world.userInterface.registerAudioWithCategory(hurtSound, 'enemies');
            if (!this.world.userInterface.isMuted) hurtSound.play();
        }
    }

    drawHealthBar(ctx) {
        if (this.showHealthBar && this.energy > 0) {
            const { barX, barY, barWidth, barHeight } = this.getHealthBarDimensions();
            this.drawHealthBarBackground(ctx, barX, barY, barWidth, barHeight);
            this.drawHealthBarForeground(ctx, barX, barY, barWidth, barHeight);
            this.drawHealthBarText(ctx, barX, barWidth, barY);
        }
    }

    getHealthBarDimensions() {
        const barWidth = this.world?.canvas ? this.world.canvas.width / 3 : 200;
        const barHeight = 20;
        const barX = (this.world.canvas.width - barWidth) / 2;
        const barY = 20;
        return { barX, barY, barWidth, barHeight };
    }

    drawHealthBarBackground(ctx, barX, barY, barWidth, barHeight) {
        ctx.fillStyle = 'black';
        ctx.fillRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4);
        ctx.fillStyle = 'grey';
        ctx.fillRect(barX, barY, barWidth, barHeight);
    }

    drawHealthBarForeground(ctx, barX, barY, barWidth, barHeight) {
        const healthPercentage = this.energy / 200;
        const barColor = this.getHealthBarColor(healthPercentage);
        ctx.fillStyle = barColor;
        ctx.fillRect(barX, barY, barWidth * healthPercentage, barHeight);
    }

    getHealthBarColor(healthPercentage) {
        if (healthPercentage > 0.75) return 'green';
        if (healthPercentage > 0.25) return 'orange';
        return 'red';
    }

    drawHealthBarText(ctx, barX, barWidth, barY) {
        ctx.fillStyle = 'white';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('ENDBOSS', barX + barWidth / 2, barY - 5);
    }
}