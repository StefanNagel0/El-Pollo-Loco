class smallChicken extends MovableObject {
    y = 350;
    height = 80;
    width = 55;
    isDead = false;
    changeDirectionTime = 0;
    worldLimits = { min: 0, max: 5800 }; // Standardwerte, werden aktualisiert

    IMAGES_WALKING = [
        '../assets/img/3_enemies_chicken/chicken_small/1_walk/1_w.png',
        '../assets/img/3_enemies_chicken/chicken_small/1_walk/2_w.png',
        '../assets/img/3_enemies_chicken/chicken_small/1_walk/3_w.png'
    ];
    IMAGE_DEAD = '../assets/img/3_enemies_chicken/chicken_small/2_dead/dead.png';

    constructor() {
        super().loadImage(this.IMAGES_WALKING[0]);
        this.x = this.getValidXPosition();
        MovableObject.placedEnemies.push(this.x);
        this.loadImages(this.IMAGES_WALKING);
        this.speed = 2 + Math.random() * 4; // Kleine Hühner sind noch schneller
        
        // Zufällig entscheiden, ob nach links oder rechts gelaufen wird
        this.otherDirection = Math.random() < 0.5;
        
        // Zeitraum setzen, nach dem die Richtung gewechselt werden kann
        this.setRandomDirectionChangeTime();
        
        this.animate();
    }
    
    // Zufälligen Zeitpunkt für Richtungswechsel setzen
    setRandomDirectionChangeTime() {
        this.changeDirectionTime = new Date().getTime() + Math.random() * 4000 + 1000; // 1-5 Sekunden
    }

    getValidXPosition() {
        let x;
        let isTooClose;
        do {
            x = 700 + Math.random() * 4500; // Generiere eine zufällige X-Position
            isTooClose = MovableObject.placedEnemies.some(existingX => 
                Math.abs(existingX - x) < MovableObject.minDistanceEnemies
            );
        } while (isTooClose); // Wiederhole, falls der Abstand zu gering ist
        return x;
    }

    animate() {
        setInterval(() => {
            if (!this.isDead) {
                const now = new Date().getTime();
                
                // Überprüfen, ob die Welt-Grenzen erreicht wurden
                if (this.x <= this.worldLimits.min) {
                    this.otherDirection = false; // Nach rechts laufen
                    this.setRandomDirectionChangeTime(); // Neuen Zeitpunkt setzen
                } else if (this.x >= this.worldLimits.max - this.width) {
                    this.otherDirection = true; // Nach links laufen
                    this.setRandomDirectionChangeTime(); // Neuen Zeitpunkt setzen
                }
                
                // Zufälliger Richtungswechsel nach Ablauf der Zeit
                if (now >= this.changeDirectionTime) {
                    this.otherDirection = Math.random() < 0.5;
                    this.setRandomDirectionChangeTime();
                }
                
                // Bewegung in die aktuelle Richtung
                if (this.otherDirection) {
                    this.moveLeft();
                } else {
                    this.moveRight();
                }
            }
        }, 1000 / 60);

        setInterval(() => {
            if (!this.isDead) {
                this.playAnimation(this.IMAGES_WALKING);
            }
        }, 200);
    }

    die() {
        if (!this.isDead) { // Überprüfen, ob der Gegner bereits tot ist
            this.isDead = true; // Gegner als tot markieren
            this.loadImage(this.IMAGE_DEAD); // Bild auf "tot" setzen
            this.speed = 0; // Bewegung stoppen
        }
    }
}