class smallChicken extends MovableObject {
    y = 350;
    height = 80;
    width = 55;
    isDead = false;

    IMAGES_WALKING = [
        '../assets/img/3_enemies_chicken/chicken_small/1_walk/1_w.png',
        '../assets/img/3_enemies_chicken/chicken_small/1_walk/2_w.png',
        '../assets/img/3_enemies_chicken/chicken_small/1_walk/3_w.png'
    ];
    IMAGE_DEAD = '../assets/img/3_enemies_chicken/chicken_small/2_dead/dead.png';

    constructor() {
        super().loadImage(this.IMAGES_WALKING[0]);
        this.x = this.getValidXPosition(); // Berechne eine gültige X-Position
        MovableObject.placedEnemies.push(this.x); // Speichere die X-Position in der gemeinsamen Liste
        this.loadImages(this.IMAGES_WALKING);
        this.speed = 0.15 + Math.random() * 0.25;
        this.animate();
    }

    getValidXPosition() {
        let x;
        let isTooClose;
        do {
            x = 700 + Math.random() * 1500; // Generiere eine zufällige X-Position
            isTooClose = MovableObject.placedEnemies.some(existingX => 
                Math.abs(existingX - x) < MovableObject.minDistance
            );
        } while (isTooClose); // Wiederhole, falls der Abstand zu gering ist
        return x;
    }

    animate() {
        setInterval(() => {
            if (!this.isDead) {
                this.moveLeft();
            }
        }, 1000 / 60);

        setInterval(() => {
            if (!this.isDead) {
                this.playAnimation(this.IMAGES_WALKING);
            }
        }, 200);
    }

    die() {
        if (!this.isDead) {
            this.isDead = true;
            this.loadImage(this.IMAGE_DEAD);
            this.speed = 0;
        }
    }
}