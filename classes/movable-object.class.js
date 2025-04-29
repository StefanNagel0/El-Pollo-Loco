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
    offset = { top: 0, left: 0, right: 0, bottom: 0 };
    energy = 100;
    lastHit = 0;    
    changeDirectionTime = 0;
    worldLimits = { min: 0, max: 720 };
    minXSpawn = 200;
    maxXSpawnRange = 500;
    minDirectionChangeDelay = 1000;
    maxDirectionChangeDelay = 4000;

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
        if (this instanceof ThrowableObject) return true;
        else return this.y < 150;
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
        return myRight > objLeft && myLeft < objRight && myBottom > objTop && myTop < objBottom;
    }

    hit() {
        this.energy -= 5;
        if (this.energy < 0) this.energy = 0;
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

    setRandomDirectionChangeTime() {
        const randomDelay = Math.random() * this.maxDirectionChangeDelay + this.minDirectionChangeDelay;
        this.changeDirectionTime = new Date().getTime() + randomDelay;
    }

    getValidXPosition() {
        let x, isTooClose;
        do {
            x = this.minXSpawn + Math.random() * this.maxXSpawnRange;
            isTooClose = MovableObject.placedEnemies.some(existingX =>
                Math.abs(existingX - x) < MovableObject.minDistanceEnemies
            );
        } while (isTooClose);
        return x;
    }

    animate() {
        setInterval(() => this.handleMovement(), 1000 / 60);
        setInterval(() => this.handleAnimation(), 200);
    }

    handleMovement() {
        if (this.shouldMove()) {
            this.checkBoundaryCollision();
            this.checkRandomDirectionChange();
            this.performMovement();
        }
    }

    handleAnimation() {
        if (this.shouldMove() && this.IMAGES_WALKING && this.IMAGES_WALKING.length > 0) {
            this.playAnimation(this.IMAGES_WALKING);
        }
    }

    shouldMove() {
        const worldExists = typeof this.world !== 'undefined' && this.world !== null;
        const isPaused = worldExists && typeof this.world.isPaused === 'boolean' ? this.world.isPaused : false;
        const isDead = typeof this.isDead === 'function' ? this.isDead() : this.isDead;
        return !isDead && !isPaused;
    }

    checkBoundaryCollision() {
        const minLimit = this.worldLimits?.min ?? 0;
        const maxLimit = this.worldLimits?.max ?? Infinity;
        if (this.x <= minLimit) {
            this.otherDirection = false;
            this.setRandomDirectionChangeTime();
        } else if (this.x >= maxLimit - this.width) {
            this.otherDirection = true;
            this.setRandomDirectionChangeTime();
        }
    }

    checkRandomDirectionChange() {
        const now = new Date().getTime();
        if (now >= this.changeDirectionTime) {
            this.otherDirection = Math.random() < 0.5;
            this.setRandomDirectionChangeTime();
        }
    }

    performMovement() {
        if (this.otherDirection) this.moveLeft();
        else this.moveRight();
    }
}