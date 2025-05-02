class Bottles extends MovableObject {
    height = 100;
    width = 100;
    static IMAGE_PATH = '../assets/img/6_salsa_bottle/1_salsa_bottle_on_ground.png';
    static MAX_POSITION_ATTEMPTS = 100; // Maximale Versuche zur Positionsfindung

    constructor() {
        super();
        this.loadImage(Bottles.IMAGE_PATH);
        this.x = this.getValidXPosition();
        this.y = 350;
        MovableObject.placedObjects.push(this.x);
    }

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

    isPositionTooClose(x, minDistance) {
        return MovableObject.placedObjects.some(existingX => Math.abs(existingX - x) < minDistance);
    }

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

    static isPositionCloseToOthers(position, existingPositions) {
        const minDistance = MovableObject.minDistanceObjects / 2;
        return existingPositions.some(pos => Math.abs(pos - position) < minDistance);
    }
}