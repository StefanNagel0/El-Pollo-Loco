class MovableObject extends DrawableObject {
    static placedObjects = []; // Gemeinsame Liste für Coins und Bottles
    static placedEnemies = []; // Gemeinsame Liste für alle Gegner
    static minDistanceObjects = 300; // Mindestabstand für Coins und Bottles
    static minDistanceEnemies = 200; // Mindestabstand für Gegner
    speed = 0.15;
    otherDirection = false;
    speedY = 0;
    acceleration = 2.5;
    isJumping = false;
    offset = {
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    };
    energy = 100;
    lastHit = 0;    

    applyGravity() {
        setInterval(() => {
            if (this.isAboveGround() || this.speedY > 0) {
                this.y -= this.speedY;
                this.speedY -= this.acceleration;
            }
        }, 1000 / 60);
    }

    isAboveGround() {
        if (this instanceof ThrowableObject) { // throwableObjects should always fall
            return true;
        } else {
            return this.y < 150;
        }
    }

    isColiding(mo) {
        return this.x + this.width - this.offset.right > mo.x + mo.offset.left &&
            this.y + this.height - this.offset.bottom > mo.y + mo.offset.top &&
            this.x + this.offset.left < mo.x + mo.width - mo.offset.right &&
            this.y + this.offset.top < mo.y + mo.height - mo.offset.bottom;
    }

    hit() {
        const now = new Date().getTime();
        if (now - this.lastHit > 800) { // Cooldown von 1 Sekunde
            this.energy -= 5;
            if (this.energy < 0) {
                this.energy = 0;
            }
            this.lastHit = now; // Zeit des letzten Treffers aktualisieren
        }
    }

    isHurt() {
        let timePassed = new Date().getTime() - this.lastHit; // difference in ms
        timePassed = timePassed / 1000; //difference in s
        return timePassed < 1;
    }

    isDead() {
        return this.energy <= 0; // Änderung von "==" zu "<="
    }

    playAnimation(images) {
        let i = this.currentImage % images.length; // let i = 0 % 6
        let path = images[i];
        this.img = this.imageCache[path];
        this.currentImage++;
    }

    moveRight() {
        this.x += this.speed;
    }

    moveLeft() {
        this.x -= this.speed;
    }

    jump() {
        this.speedY = 30;
    }
}