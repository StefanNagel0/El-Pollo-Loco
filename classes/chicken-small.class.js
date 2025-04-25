class smallChicken extends MovableObject {
    y = 350;
    height = 80;
    width = 55;
    isDead = false;
    changeDirectionTime = 0;
    worldLimits = { min: 0, max: 5800 }; // Standardwerte, werden aktualisiert

    IMAGES_WALKING = [
        '../assets/img/3_enemies_chicken/chicken_small/1_walk/1_w.png',
        '../assets/img/3_enemies_chicken/chicken_small/1_walk/2_w.png',
        '../assets/img/3_enemies_chicken/chicken_small/1_walk/3_w.png'
    ];
    IMAGE_DEAD = '../assets/img/3_enemies_chicken/chicken_small/2_dead/dead.png';

    constructor() {
        super().loadImage(this.IMAGES_WALKING[0]);
        this.initializePosition();
        this.loadImages(this.IMAGES_WALKING);
        this.speed = 2.5;
        this.otherDirection = Math.random() < 0.5; // Zufällige Richtung
        this.setRandomDirectionChangeTime();
        this.animate();
    }

    animate() {
        this.setupMovementAnimation();
        this.setupWalkingAnimation();
    }

    setupMovementAnimation() {
        setInterval(() => {
            if (!this.isDead && (!this.world || !this.world.isPaused)) {
                this.handleMovement();
            }
        }, 1000 / 60);
    }

    setupWalkingAnimation() {
        setInterval(() => {
            if (!this.isDead && (!this.world || !this.world.isPaused)) {
                this.playAnimation(this.IMAGES_WALKING);
            }
        }, 200);
    }

    die() {
        if (!this.isDead) {
            this.markAsDead();
            this.loadImage(this.IMAGE_DEAD);
            this.speed = 0;
        }
    }

    markAsDead() {
        this.isDead = true;
    }
}