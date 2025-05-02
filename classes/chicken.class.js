/**
 * Represents a standard chicken enemy in the game.
 * Has health system, can be killed by stomping or with bottles.
 * @class
 * @extends MovableObject
 */
class Chicken extends MovableObject {
    y = 330;
    height = 100;
    width = 85;
    isDead = false;
    stompableAreaHeight = 20;
    health = 2;
    showHealthBar = false;
    worldLimits = { min: 0, max: 5800 };
    minXSpawn = 700;
    maxXSpawnRange = 4500;
    minDirectionChangeDelay = 2000;
    maxDirectionChangeDelay = 4000;
    IMAGES_WALKING = [
        '../assets/img/3_enemies_chicken/chicken_normal/1_walk/1_w.png',
        '../assets/img/3_enemies_chicken/chicken_normal/1_walk/2_w.png',
        '../assets/img/3_enemies_chicken/chicken_normal/1_walk/3_w.png'
    ];
    IMAGE_DEAD = '../assets/img/3_enemies_chicken/chicken_normal/2_dead/dead.png';

    /**
     * Creates a new chicken with randomized position and movement patterns.
     */
    constructor() {
        super().loadImage(this.IMAGES_WALKING[0]);
        this.speed = 2;
        this.x = this.getValidXPosition();
        MovableObject.placedEnemies.push(this.x);
        this.loadImages(this.IMAGES_WALKING);
        this.otherDirection = Math.random() < 0.5;
        this.setRandomDirectionChangeTime();
        this.animate();
    }

    /**
     * Handles the death of the chicken from different causes.
     * @param {boolean} fromBottle - Whether the chicken was killed by a bottle
     */
    die(fromBottle = false) {
        if (this.isDead) return;
        if (fromBottle) this.handleBottleHit();
        else this.handleStompHit();
    }

    /**
     * Handles the chicken being hit by a bottle, instantly killing it.
     */
    handleBottleHit() {
        this.health = 0;
        this.markAsDead();
    }

    /**
     * Handles the chicken being stomped, reducing health and potentially killing it.
     * If not killed, the chicken becomes faster and shows its health bar.
     */
    handleStompHit() {
        this.health -= 1;
        if (this.health <= 0) this.markAsDead();
        else {
            this.showHealthBar = true;
            this.speed = this.speed * 3;
        }
    }

    /**
     * Marks the chicken as dead and updates its visual state.
     */
    markAsDead() {
        this.isDead = true;
        this.loadImage(this.IMAGE_DEAD);
        this.speed = 0;
        this.showHealthBar = false;
    }

    /**
     * Draws the chicken's health bar when needed.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     */
    drawHealthBar(ctx) {
        if (this.showHealthBar && this.health > 0) {
            let barWidth = 60, barHeight = 10;
            let barX = this.x + (this.width - barWidth) / 2;
            let barY = this.y - barHeight - 5;
            ctx.fillStyle = 'grey';
            ctx.fillRect(barX, barY, barWidth, barHeight);
            let healthPercentage = this.health / 2;
            ctx.fillStyle = 'red';
            ctx.fillRect(barX, barY, barWidth * healthPercentage, barHeight);
        }
    }
}
