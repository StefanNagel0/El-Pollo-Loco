/**
 * Represents a throwable object in the game.
 * These are projectiles that can be thrown by the player to damage enemies.
 * Features trajectory physics, collision detection, and breaking animations.
 * @class
 * @extends MovableObject
 */
class ThrowableObject extends MovableObject {
    isBroken = false;
    moveInterval = null;
    groundPosition = 400;
    IMAGES_BREAK = [
        '../assets/img/6_salsa_bottle/bottle_rotation/bottle_splash/1_bottle_splash.png',
        '../assets/img/6_salsa_bottle/bottle_rotation/bottle_splash/2_bottle_splash.png',
        '../assets/img/6_salsa_bottle/bottle_rotation/bottle_splash/3_bottle_splash.png',
        '../assets/img/6_salsa_bottle/bottle_rotation/bottle_splash/4_bottle_splash.png',
        '../assets/img/6_salsa_bottle/bottle_rotation/bottle_splash/5_bottle_splash.png',
        '../assets/img/6_salsa_bottle/bottle_rotation/bottle_splash/6_bottle_splash.png'
    ];

    /**
     * Creates a new throwable object at the specified position and direction.
     * Automatically starts the throwing motion.
     * @param {number} x - The initial x-coordinate
     * @param {number} y - The initial y-coordinate
     * @param {boolean} otherDirection - The direction to throw (true for left, false for right)
     */
    constructor(x, y, otherDirection) {
        super();
        this.x = x;
        this.y = y;
        this.otherDirection = otherDirection;
        this.loadImage('../assets/img/6_salsa_bottle/salsa_bottle.png');
        this.loadImages(this.IMAGES_BREAK);
        this.height = 80;
        this.width = 60;
        this.throw();
    }

    /**
     * Initiates the throwing motion of the object.
     * Sets initial vertical speed and applies gravity.
     * Creates an interval to handle horizontal movement and ground collision.
     */
    throw() {
        this.speedY = 30;
        this.applyGravity();
        this.moveInterval = setInterval(() => {
            this.x += this.otherDirection ? -25 : 25;
            if (this.y + this.height >= this.groundPosition && !this.isBroken) {
                this.break();
            }
        }, 25);
    }

    /**
     * Handles the breaking of the throwable object.
     * Sets the broken state, stops movement, and plays break animation and sound.
     */
    break() {
        if (this.isBroken) return;
        this.isBroken = true;
        this.stopMovement();
        this.playBreakAnimation();
        this.playBreakSound();
    }

    /**
     * Stops all movement of the object by clearing intervals and resetting speed.
     */
    stopMovement() {
        this.speedY = 0;
        if (this.moveInterval) {
            clearInterval(this.moveInterval);
            this.moveInterval = null;
        }
    }

    /**
     * Plays the breaking animation sequence.
     */
    playBreakAnimation() {
        let i = 0;
        let breakInterval = setInterval(() => {
            if (i < this.IMAGES_BREAK.length) {
                this.img = this.imageCache[this.IMAGES_BREAK[i]];
                i++;
            } else {
                clearInterval(breakInterval);
            }
        }, 50);
    }

    /**
     * Plays the sound effect for breaking.
     * Uses the game's audio system if available.
     */
    playBreakSound() {
        if (!this.world || !this.world.userInterface) return;
        const breakSound = new Audio('../assets/audio/bottle_break.mp3');
        this.world.userInterface.registerAudioWithCategory(breakSound, 'objects');
        if (!this.world.userInterface.isMuted) {
            const objectsVolume = this.world.userInterface.objectsVolume / 10;
            breakSound.volume = objectsVolume;
            breakSound.play();
        }
    }
}