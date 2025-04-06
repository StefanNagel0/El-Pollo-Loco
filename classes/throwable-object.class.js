class ThrowableObject extends MovableObject {
    isBroken = false;
    moveInterval = null; // Speichern der Intervall-ID
    groundPosition = 400; // Y-Position des Bodens für die Flasche
    
    IMAGES_BREAK = [
        '../assets/img/6_salsa_bottle/bottle_rotation/bottle_splash/1_bottle_splash.png',
        '../assets/img/6_salsa_bottle/bottle_rotation/bottle_splash/2_bottle_splash.png',
        '../assets/img/6_salsa_bottle/bottle_rotation/bottle_splash/3_bottle_splash.png',
        '../assets/img/6_salsa_bottle/bottle_rotation/bottle_splash/4_bottle_splash.png',
        '../assets/img/6_salsa_bottle/bottle_rotation/bottle_splash/5_bottle_splash.png',
        '../assets/img/6_salsa_bottle/bottle_rotation/bottle_splash/6_bottle_splash.png'
    ];

    constructor(x, y, otherDirection) {
        super();
        this.x = x;
        this.y = y;
        this.otherDirection = otherDirection; // Speichere die Richtung des Charakters
        this.loadImage('../assets/img/6_salsa_bottle/salsa_bottle.png');
        this.loadImages(this.IMAGES_BREAK); // Zerbrech-Bilder laden
        this.height = 80;
        this.width = 60;
        this.throw();
    }

    throw() {
        this.speedY = 30; // Anfangsgeschwindigkeit nach oben
        this.applyGravity(); // Schwerkraft anwenden

        // Speichern der Intervall-ID für spätere Verwendung
        this.moveInterval = setInterval(() => {
            // Bewege die Flasche nach rechts oder links basierend auf der Richtung des Charakters
            this.x += this.otherDirection ? -25 : 25;
            
            // Überprüfen, ob die Flasche den Boden erreicht hat
            if (this.y + this.height >= this.groundPosition && !this.isBroken) {
                this.break();
            }
        }, 25);
    }

    break() {
        if (this.isBroken) return; // Verhindere mehrfaches Zerbrechen
        
        this.isBroken = true;
        this.speedY = 0; // Stoppe die Y-Bewegung
        
        // Stoppen des X-Bewegungsintervalls
        if (this.moveInterval) {
            clearInterval(this.moveInterval);
            this.moveInterval = null;
        }
        
        // Animation für das Zerbrechen abspielen
        let i = 0;
        let breakInterval = setInterval(() => {
            if (i < this.IMAGES_BREAK.length) {
                this.img = this.imageCache[this.IMAGES_BREAK[i]];
                i++;
            } else {
                clearInterval(breakInterval);
            }
        }, 50);
        
        // Zerbrech-Sound abspielen
        if (this.world && this.world.userInterface) {
            const breakSound = new Audio('../assets/audio/bottle_break.mp3');
            this.world.userInterface.registerAudio(breakSound);
            
            if (!this.world.userInterface.isMuted) {
                breakSound.play();
            }
        }
    }
}