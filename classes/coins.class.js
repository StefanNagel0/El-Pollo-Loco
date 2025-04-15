class Coin extends MovableObject {
    height = 140;
    width = 140;
    
    // Minimale und maximale Y-Position für zufällige Höhe
    minY = 310;
    maxY = 120;

    // Bilder für die Coin-Animation
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
        
        // Animation starten
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

    /**
     * Animation für die Münze
     */
    animate() {
        // Rotation-Animation
        setInterval(() => {
            if (!this.world || !this.world.isPaused) {
                this.playAnimation(this.IMAGES_ANIMATION);
            }
        }, 250); // Langsamere Animation für besseren Effekt
        
        // Leichte Schwebebewegung
        let direction = 1; // 1 = nach oben, -1 = nach unten
        let maxOffset = 10; // Maximale Schwebebewegung in Pixeln
        let originalY = this.y;
        let offset = 0;
        
    }

    /**
     * Statische Methode zum Generieren mehrerer Coins
     */
    static generateCoins(amount) {
        const coins = [];
        for (let i = 0; i < amount; i++) {
            coins.push(new Coin());
        }
        return coins;
    }
}
