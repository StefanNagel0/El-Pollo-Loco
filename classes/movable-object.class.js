class MovableObject extends DrawableObject {
    static placedObjects = []; // Gemeinsame Liste für Coins und Bottles
    static placedEnemies = []; // Gemeinsame Liste für alle Gegner
    static minDistanceObjects = 65; // Mindestabstand für Coins und Bottles
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
            // Nur anwenden, wenn das Spiel nicht pausiert ist
            if (!this.world || !this.world.isPaused) {
                if (this.isAboveGround() || this.speedY > 0) {
                    this.y -= this.speedY;
                    this.speedY -= this.acceleration;
                }
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

    // Neue Methode für präzise Kollisionserkennung hinzufügen:

    /**
     * Überprüft, ob dieses Objekt mit einem anderen Objekt kollidiert,
     * berücksichtigt dabei die Offset-Werte für präzisere Kollisionserkennung
     */
    isPreciselyColiding(obj) {
        // Character-Position mit Offset-Berücksichtigung
        const myLeft = this.x + this.offset.left;
        const myRight = this.x + this.width - this.offset.right;
        const myTop = this.y + this.offset.top;
        const myBottom = this.y + this.height - this.offset.bottom;
        
        // Andere Objekt-Position (ohne Offset, da nicht jedes Objekt diese hat)
        const objLeft = obj.x;
        const objRight = obj.x + obj.width;
        const objTop = obj.y;
        const objBottom = obj.y + obj.height;
        
        // Kollisionsprüfung mit Offset-Berücksichtigung
        return myRight > objLeft &&
                myLeft < objRight &&
                myBottom > objTop &&
                myTop < objBottom;
    }

    /**
     * Verursacht Schaden am Objekt
     */
    hit() {
        // Cooldown-Check entfernen, damit bei jeder Kollision Schaden genommen wird
        this.energy -= 5;
        if (this.energy < 0) {
            this.energy = 0;
        }
        this.lastHit = new Date().getTime(); // Zeit des letzten Treffers für Animation aktualisieren
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