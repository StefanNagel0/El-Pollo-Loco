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

    die(fromBottle = false) {
        if (this.isDead) return;
        if (fromBottle) this.handleBottleHit();
        else this.handleStompHit();
    }

    handleBottleHit() {
        this.health = 0;
        this.markAsDead();
    }

    handleStompHit() {
        this.health -= 1;
        if (this.health <= 0) this.markAsDead();
        else {
            this.showHealthBar = true;
            this.speed = this.speed * 3;
        }
    }

    markAsDead() {
        this.isDead = true;
        this.loadImage(this.IMAGE_DEAD);
        this.speed = 0;
        this.showHealthBar = false;
    }

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
