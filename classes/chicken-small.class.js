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

    initializePosition() {
        this.x = this.getValidXPosition();
        MovableObject.placedEnemies.push(this.x);
    }

    setRandomDirectionChangeTime() {
        this.changeDirectionTime = new Date().getTime() + Math.random() * 4000 + 1000; // 1-5 Sekunden
    }

    getValidXPosition() {
        let x;
        let isTooClose;
        do {
            x = 700 + Math.random() * 4500; // Generiere eine zufällige X-Position
            isTooClose = MovableObject.placedEnemies.some(existingX =>
                Math.abs(existingX - x) < MovableObject.minDistanceEnemies
            );
        } while (isTooClose);
        return x;
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

    handleMovement() {
        const now = new Date().getTime();
        this.checkWorldLimits();
        this.checkDirectionChange(now);
        this.moveInCurrentDirection();
    }

    checkWorldLimits() {
        if (this.x <= this.worldLimits.min) {
            this.otherDirection = false; // Nach rechts laufen
            this.setRandomDirectionChangeTime();
        } else if (this.x >= this.worldLimits.max - this.width) {
            this.otherDirection = true; // Nach links laufen
            this.setRandomDirectionChangeTime();
        }
    }

    checkDirectionChange(now) {
        if (now >= this.changeDirectionTime) {
            this.otherDirection = Math.random() < 0.5;
            this.setRandomDirectionChangeTime();
        }
    }

    moveInCurrentDirection() {
        if (this.otherDirection) {
            this.moveLeft();
        } else {
            this.moveRight();
        }
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