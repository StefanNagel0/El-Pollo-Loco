class MovableObject extends DrawableObject {
    static placedObjects = [];
    static placedEnemies = [];
    static minDistanceObjects = 65;
    static minDistanceEnemies = 200;
    speed = 0.15;
    otherDirection = false;
    speedY = 0;
    acceleration = 2.5;
    isJumping = false;
    offset = {top: 0,left: 0,right: 0,bottom: 0,};
    energy = 100;
    lastHit = 0;

    initializePosition() {
        this.x = this.getValidXPosition();
        MovableObject.placedEnemies.push(this.x);
    }

    setRandomDirectionChangeTime() {
        this.changeDirectionTime = new Date().getTime() + Math.random() * 4000 + 1000;
    }

    getValidXPosition() {
        let x;
        let isTooClose;
        do {
            x = 700 + Math.random() * 4500;
            isTooClose = MovableObject.placedEnemies.some(existingX =>
                Math.abs(existingX - x) < MovableObject.minDistanceEnemies
            );
        } while (isTooClose);
        return x;
    }

    checkWorldLimits() {
        if (this.x <= this.worldLimits.min) {
            this.otherDirection = false;
            this.setRandomDirectionChangeTime();
        } else if (this.x >= this.worldLimits.max - this.width) {
            this.otherDirection = true;
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

    handleMovement() {
        const now = new Date().getTime();
        this.checkWorldLimits();
        this.checkDirectionChange(now);
        this.moveInCurrentDirection();
    }

    applyGravity() {
        setInterval(() => {
            if (!this.world || !this.world.isPaused) {
                if (this.isAboveGround() || this.speedY > 0) {
                    this.y -= this.speedY;
                    this.speedY -= this.acceleration;
                }
            }
        }, 1000 / 60);
    }

    isAboveGround() {
        if (this instanceof ThrowableObject) {
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

    isPreciselyColiding(obj) {
        const myLeft = this.x + this.offset.left;
        const myRight = this.x + this.width - this.offset.right;
        const myTop = this.y + this.offset.top;
        const myBottom = this.y + this.height - this.offset.bottom;
        const objLeft = obj.x;
        const objRight = obj.x + obj.width;
        const objTop = obj.y;
        const objBottom = obj.y + obj.height;
        return myRight > objLeft &&
                myLeft < objRight &&
                myBottom > objTop &&
                myTop < objBottom;
    }

    hit() {
        this.energy -= 5;
        if (this.energy < 0) {
            this.energy = 0;
        }
        this.lastHit = new Date().getTime();
    }

    isHurt() {
        let timePassed = new Date().getTime() - this.lastHit;
        timePassed = timePassed / 1000;
        return timePassed < 1;
    }

    isDead() {
        return this.energy <= 0;
    }

    playAnimation(images) {
        let i = this.currentImage % images.length;
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