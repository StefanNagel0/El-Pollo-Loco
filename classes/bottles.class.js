class Bottles extends MovableObject {
    y = 310;
    height = 120;
    width = 120;

    static placedBottles = [];
    static minDistance = 100;

    constructor() {
        super();
        this.loadImage('../assets/img/6_salsa_bottle/salsa_bottle.png');
        this.x = this.getValidXPosition();
        Bottles.placedBottles.push(this.x);
    }

    getValidXPosition() {
        let x;
        let isTooClose;
        do {
            x = 300 + Math.random() * 1500;
            isTooClose = Bottles.placedBottles.some(existingX => 
                Math.abs(existingX - x) < Bottles.minDistance
            );
        } while (isTooClose);
        return x;
    }
}