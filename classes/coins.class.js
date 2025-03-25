class Coin extends MovableObject {
    y = 310;
    height = 140;
    width = 140;

    static placedCoins = [];
    static minDistance = 200;

    constructor() {
        super();
        this.loadImage('../assets/img/8_coin/coin_1.png');
        this.x = this.getValidXPosition();
        Coin.placedCoins.push(this.x);
    }

    getValidXPosition() {
        let x;
        let isTooClose;
        do {
            x = 300 + Math.random() * 1500;
            isTooClose = Coin.placedCoins.some(existingX => 
                Math.abs(existingX - x) < Coin.minDistance
            );
        } while (isTooClose);
        return x;
    }
}
