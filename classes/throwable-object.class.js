class ThrowableObject extends MovableObject {
    constructor(x, y, otherDirection) {
        super();
        this.x = x;
        this.y = y;
        this.otherDirection = otherDirection; // Speichere die Richtung des Charakters
        this.loadImage('../assets/img/6_salsa_bottle/salsa_bottle.png');
        this.height = 80;
        this.width = 60;
        this.throw();
    }

    throw() {
        this.speedY = 30; // Anfangsgeschwindigkeit nach oben
        this.applyGravity(); // Schwerkraft anwenden

        setInterval(() => {
            // Bewege die Flasche nach rechts oder links basierend auf der Richtung des Charakters
            this.x += this.otherDirection ? -25 : 25;
        }, 25);
    }
}