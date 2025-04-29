class Bottles extends MovableObject {
    height = 100;
    width = 100;

    constructor() {
        super();
        this.loadImage('../assets/img/6_salsa_bottle/1_salsa_bottle_on_ground.png');
        this.x = this.getValidXPosition();
        this.y = 350;
        MovableObject.placedObjects.push(this.x);
    }

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
}