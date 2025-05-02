/**
 * Represents a coin collectible in the game.
 * Coins are animated objects that can be collected by the player for points.
 * @class
 * @extends MovableObject
 */
class Coin extends MovableObject {
    height = 140;
    width = 140;
    minY = 310;
    maxY = 120;
    IMAGES_ANIMATION = [
        '../assets/img/8_coin/coin_1.png',
        '../assets/img/8_coin/coin_2.png',
        '../assets/img/8_coin/coin_1.png',
        '../assets/img/8_coin/coin_2.png'
    ];

    /**
     * Creates a new coin at a valid random position.
     * Initializes animation and adds the coin's position to the shared tracking array.
     */
    constructor() {
        super();
        this.loadImage('../assets/img/8_coin/coin_1.png');
        this.loadImages(this.IMAGES_ANIMATION);
        this.x = this.getValidXPosition();
        this.y = this.getRandomY();
        MovableObject.placedObjects.push(this.x);
        this.animate();
    }

    /**
     * Finds a valid x-position for the coin that maintains minimum distance from other objects.
     * @returns {number} A valid x-coordinate
     */
    getValidXPosition() {
        let x;
        let isTooClose;
        do {
            x = 300 + Math.random() * 4500;
            isTooClose = MovableObject.placedObjects.some(existingX => 
                Math.abs(existingX - x) < MovableObject.minDistanceObjects
            );
        } while (isTooClose);
        return x;
    }
    
    /**
     * Generates a random y-coordinate within the defined vertical range.
     * @returns {number} A random y-coordinate
     */
    getRandomY() {
        return this.maxY + Math.random() * (this.minY - this.maxY);
    }

    /**
     * Starts the coin animation when the game is not paused.
     */
    animate() {
        setInterval(() => {
            if (!this.world || !this.world.isPaused) {
                this.playAnimation(this.IMAGES_ANIMATION);
            }
        }, 250);
    }

    /**
     * Generates a specified number of coin objects.
     * @param {number} amount - The number of coins to generate
     * @returns {Array<Coin>} An array of generated coins
     * @static
     */
    static generateCoins(amount) {
        const coins = [];
        for (let i = 0; i < amount; i++) {
            coins.push(new Coin());
        }
        return coins;
    }
}
