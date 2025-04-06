class Coin extends MovableObject {
    y = 310;
    height = 140;
    width = 140;

    constructor() {
        super();
        this.loadImage('../assets/img/8_coin/coin_1.png');
        this.x = this.getValidXPosition();
        MovableObject.placedObjects.push(this.x); // Speichere die X-Position in der gemeinsamen Liste
    }

    getValidXPosition() {
        let x;
        let isTooClose;
        do {
            x = 300 + Math.random() * 4500; // Generiere eine zufällige X-Position
            isTooClose = MovableObject.placedObjects.some(existingX => 
                Math.abs(existingX - x) < MovableObject.minDistanceObjects
            );
        } while (isTooClose); // Wiederhole, falls der Abstand zu gering ist
        return x;
    }
}
