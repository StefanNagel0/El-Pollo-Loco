/**
 * Represents the final boss enemy in the game.
 * Features complex AI behaviors including alerting, charging, attacking and different movement patterns.
 * Has its own health bar and various animation states.
 * @class
 * @extends MovableObject
 */
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

    /**
     * Creates a new endboss and initializes its animations and position.
     */
    constructor() {
        super().loadImage(this.IMAGES_ALERT[0]);
        this.loadImages(this.IMAGES_ALERT);
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_HURT);
        this.loadImages(this.IMAGES_DEAD);
        this.loadImages(this.IMAGES_ATTACK);
        this.x = 5500;
        this.energy = 200;
        this.behavior = new EndbossBehavior(this);
        this.animate();
        this.setRandomAttackCooldown();
    }

    /**
     * Sets a random cooldown time for the next attack.
     */
    setRandomAttackCooldown() {
        this.attackCooldown = new Date().getTime() + (2000 + Math.random() * 2000);
    }

    /**
     * Sets up animation and AI behavior intervals.
     */
    animate() {
        setInterval(() => this.behavior.updateAnimationState(), 200);
        setInterval(() => this.behavior.updateAIState(), 1000 / 60);
    }

    /**
     * Starts walking behavior after a delay.
     */
    tryStartWalking() {
        setTimeout(() => this.startWalking(), 500);
    }

    /**
     * Initiates an attack sequence.
     */
    startAttack() {
        this.isCharging = true;
        this.isAttacking = false;
        this.isResting = false;
    }

    /**
     * Alerts the boss to the player's presence.
     */
    alert() {
        this.isAlerted = true;
        this.showHealthBar = true;
    }

    /**
     * Sets the boss to walking state.
     */
    startWalking() {
        this.isWalking = true;
    }

    /**
     * Handles being hit, updating state accordingly.
     * @override
     */
    hit() {
        super.hit();
        if (this.isDead()) this.speed = 0;
    }

    /**
     * Handles the death sequence.
     */
    die() {
        if (this.isDying) return;
        this.setDyingState();
        setTimeout(() => {
            this.behavior.handleDeathSoundAndMusic();
            this.showGameWonScreen();
        }, 300);
    }

    /**
     * Sets the boss to dying state, disabling all active behaviors.
     */
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

    /**
     * Shows the game won screen after a delay.
     */
    showGameWonScreen() {
        if (!this.world || !this.world.endGame('win')) {
            return;
        }
        
        setTimeout(() => {
            if (!window.wonScreen) window.wonScreen = new Won();
            window.wonScreen.show();
        }, 1000);
    }

    /**
     * Handles being hit by a bottle projectile.
     */
    hitWithBottle() {
        this.behavior.hitWithBottle();
    }

    /**
     * Puts the boss into hurt state.
     */
    triggerHurtState() {
        this.isHurt = true;
        this.lastHurtTime = new Date().getTime();
        this.behavior.playHurtSound();
    }

    /**
     * Draws the boss's health bar at the top of the screen.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     */
    drawHealthBar(ctx) {
        this.behavior.drawHealthBar(ctx);
    }
}