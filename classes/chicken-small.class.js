class smallChicken extends MovableObject {
    y = 350;
    height = 80;
    width = 55;
    isDead = false;
    worldLimits = { min: 0, max: 5800 };
    minXSpawn = 700;
    maxXSpawnRange = 4500;
    minDirectionChangeDelay = 1000;
    maxDirectionChangeDelay = 4000;
    IMAGES_WALKING = [
        '../assets/img/3_enemies_chicken/chicken_small/1_walk/1_w.png',
        '../assets/img/3_enemies_chicken/chicken_small/1_walk/2_w.png',
        '../assets/img/3_enemies_chicken/chicken_small/1_walk/3_w.png'
    ];
    IMAGE_DEAD = '../assets/img/3_enemies_chicken/chicken_small/2_dead/dead.png';

    constructor() {
        super().loadImage(this.IMAGES_WALKING[0]);
        this.speed = 2.5;
        this.x = this.getValidXPosition();
        MovableObject.placedEnemies.push(this.x);
        this.loadImages(this.IMAGES_WALKING);
        this.otherDirection = Math.random() < 0.5;
        this.setRandomDirectionChangeTime();
        this.animate();
    }

    die() {
        if (!this.isDead) {
            this.isDead = true;
            this.loadImage(this.IMAGE_DEAD);
            this.speed = 0;
        }
    }
}