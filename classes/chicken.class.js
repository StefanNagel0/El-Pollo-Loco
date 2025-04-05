class Chicken extends MovableObject {
    y = 330;
    height = 100;
    width = 85;
    isDead = false; // Status, ob der Gegner tot ist
    // Neuer Wert: definiert den stompbaren Bereich (z.B. der Kopf des Gegners)
    stompableAreaHeight = 20; 

    IMAGES_WALKING = [
        '../assets/img/3_enemies_chicken/chicken_normal/1_walk/1_w.png',
        '../assets/img/3_enemies_chicken/chicken_normal/1_walk/2_w.png',
        '../assets/img/3_enemies_chicken/chicken_normal/1_walk/3_w.png'
    ];
    IMAGE_DEAD = '../assets/img/3_enemies_chicken/chicken_normal/2_dead/dead.png';

    constructor() {
        super().loadImage(this.IMAGES_WALKING[0]);
        this.x = 700 + Math.random() * 500;
        this.loadImages(this.IMAGES_WALKING);
        this.speed = 0.15 + Math.random() * 0.25;
        this.animate();
    }

    animate() {
        setInterval(() => {
            if (!this.isDead) { // Bewege den Gegner nur, wenn er nicht tot ist
                this.moveLeft();
            }
        }, 1000 / 60);

        setInterval(() => {
            if (!this.isDead) { // Animation nur, wenn der Gegner aktiv ist
                this.playAnimation(this.IMAGES_WALKING);
            }
        }, 200);
    }

    die() {
        if (!this.isDead) { // Stelle sicher, dass der Gegner nicht mehrfach getötet wird
            this.isDead = true;
            this.loadImage(this.IMAGE_DEAD);
            this.speed = 0; // Stoppe die Bewegung
        }
    }
}
