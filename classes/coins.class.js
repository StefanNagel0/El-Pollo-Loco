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

    constructor() {
        super();
        this.loadImage('../assets/img/8_coin/coin_1.png');
        this.loadImages(this.IMAGES_ANIMATION);
        this.x = this.getValidXPosition();
        this.y = this.getRandomY();
        MovableObject.placedObjects.push(this.x);
        this.animate();
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
    getRandomY() {
        return this.maxY + Math.random() * (this.minY - this.maxY);
    }

    animate() {
        setInterval(() => {
            if (!this.world || !this.world.isPaused) {
                this.playAnimation(this.IMAGES_ANIMATION);
            }
        }, 250);
        let direction = 1;
        let maxOffset = 10;
        let originalY = this.y;
        let offset = 0;
        
    }

    static generateCoins(amount) {
        const coins = [];
        for (let i = 0; i < amount; i++) {
            coins.push(new Coin());
        }
        return coins;
    }
}
