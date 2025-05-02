/**
 * Represents a bottle collectible in the game.
 * Bottles can be collected by the player and used as throwable objects.
 * @class
 * @extends MovableObject
 */
class Bottles extends MovableObject {
    height = 100;
    width = 100;
    static IMAGE_PATH = '../assets/img/6_salsa_bottle/1_salsa_bottle_on_ground.png';
    static MAX_POSITION_ATTEMPTS = 100;

    /**
     * Creates a new bottle with a random position.
     * The bottle is placed at a valid x-coordinate and fixed y-coordinate.
     */
    constructor() {
        super();
        this.loadImage(Bottles.IMAGE_PATH);
        this.x = this.getValidXPosition();
        this.y = 350;
        MovableObject.placedObjects.push(this.x);
    }

    /**
     * Finds a valid x-position for the bottle that maintains minimum distance from other objects.
     * Uses an adaptive algorithm that reduces distance requirements after multiple failed attempts.
     * @returns {number} A valid x-coordinate
     */
    getValidXPosition() {
        let x;
        let isTooClose;
        let attempts = 0;
        const maxAttempts = Bottles.MAX_POSITION_ATTEMPTS;
        do {
            x = 300 + Math.random() * 4500;
            const minDistance = attempts > maxAttempts ? MovableObject.minDistanceObjects * 0.8 : MovableObject.minDistanceObjects;
            isTooClose = this.isPositionTooClose(x, minDistance);
            attempts++;
            if (isTooClose && attempts > maxAttempts * 1.5) break;
        } while (isTooClose);
        return x;
    }

    /**
     * Checks if a position is too close to existing objects.
     * @param {number} x - The x-coordinate to check
     * @param {number} minDistance - Minimum required distance between objects
     * @returns {boolean} True if position is too close to existing objects
     */
    isPositionTooClose(x, minDistance) {
        return MovableObject.placedObjects.some(existingX => Math.abs(existingX - x) < minDistance);
    }

    /**
     * Generates a specified number of bottle objects with optimal spacing.
     * Divides the level into segments and places bottles throughout.
     * @param {number} count - Number of bottles to generate
     * @returns {Array<Bottles>} Array of generated bottles
     * @static
     */
    static generateBottles(count) {
        let bottles = [];
        let bottlePositions = [];
        const segments = Math.ceil(4500 / count);
        for (let i = 0; i < count; i++) {
            const position = this.calculateBottlePosition(i, segments, bottlePositions);
            bottlePositions.push(position);
            const bottle = new Bottles();
            bottle.x = position;
            bottles.push(bottle);
        }
        return bottles;
    }

    /**
     * Calculates an optimal position for a bottle within a segment.
     * @param {number} index - The index of the segment
     * @param {number} segmentSize - The size of each segment
     * @param {Array<number>} existingPositions - Positions of already placed bottles
     * @returns {number} The calculated x-coordinate
     * @static
     */
    static calculateBottlePosition(index, segmentSize, existingPositions) {
        const minX = 300 + index * segmentSize;
        const maxX = minX + segmentSize - 100;
        let x = minX + Math.random() * (maxX - minX);
        let attempts = 0;
        while (this.isPositionCloseToOthers(x, existingPositions) && attempts < 10) {
            x = minX + Math.random() * (maxX - minX);
            attempts++;
        }
        return x;
    }

    /**
     * Checks if a position is too close to any existing bottle positions.
     * @param {number} position - The position to check
     * @param {Array<number>} existingPositions - Positions of already placed bottles
     * @returns {boolean} True if the position is too close to existing bottles
     * @static
     */
    static isPositionCloseToOthers(position, existingPositions) {
        const minDistance = MovableObject.minDistanceObjects / 2;
        return existingPositions.some(pos => Math.abs(pos - position) < minDistance);
    }
}