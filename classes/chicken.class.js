class Chicken extends MovableObject {
    y = 330;
    height = 100;
    width = 85;
    isDead = false;
    stompableAreaHeight = 20;
    health = 2; // Neues Attribut: 2 Leben für normale Chickens
    showHealthBar = false; // Flag zum Anzeigen des Lebensbalkens
    changeDirectionTime = 0;
    worldLimits = { min: 0, max: 5800 }; // Standardwerte, werden aktualisiert

    IMAGES_WALKING = [
        '../assets/img/3_enemies_chicken/chicken_normal/1_walk/1_w.png',
        '../assets/img/3_enemies_chicken/chicken_normal/1_walk/2_w.png',
        '../assets/img/3_enemies_chicken/chicken_normal/1_walk/3_w.png'
    ];
    IMAGE_DEAD = '../assets/img/3_enemies_chicken/chicken_normal/2_dead/dead.png';

    constructor() {
        super().loadImage(this.IMAGES_WALKING[0]);
        this.x = this.getValidXPosition(); // Berechne eine gültige X-Position
        MovableObject.placedEnemies.push(this.x); // Speichere die X-Position in der gemeinsamen Liste
        this.loadImages(this.IMAGES_WALKING);
        this.speed = 0.35 + Math.random() * 0.35; // Erhöhte Geschwindigkeit
        
        // Zufällig entscheiden, ob nach links oder rechts gelaufen wird
        this.otherDirection = Math.random() < 0.5;
        
        // Zeitraum setzen, nach dem die Richtung gewechselt werden kann
        this.setRandomDirectionChangeTime();
        
        this.animate();
    }

    // Zufälligen Zeitpunkt für Richtungswechsel setzen
    setRandomDirectionChangeTime() {
        this.changeDirectionTime = new Date().getTime() + Math.random() * 4000 + 2000; // 2-6 Sekunden
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

    die(fromBottle = false) {
        if (fromBottle) {
            // Bei Flaschentreffern sofort töten, unabhängig vom aktuellen Health
            this.health = 0;
            this.isDead = true;
            this.loadImage(this.IMAGE_DEAD);
            this.speed = 0;
            this.showHealthBar = false; // Verstecke Lebensbalken bei Tod
        } else {
            // Bei Stomps normales Verhalten (reduziere Leben um 1)
            this.health -= 1;
            
            if (this.health <= 0) {
                // Chicken stirbt, wenn kein Leben mehr übrig
                this.isDead = true;
                this.loadImage(this.IMAGE_DEAD);
                this.speed = 0;
                this.showHealthBar = false; // Verstecke Lebensbalken bei Tod
            } else {
                // Bei Treffer, aber noch am Leben
                this.showHealthBar = true; // Zeige Lebensbalken
                
                // Bug-Fix: Chicken wird schneller nach erstem Treffer (vorher 1.7)
                this.speed = this.speed * 1.7; // Reduziere Geschwindigkeit auf 70% nach Treffer
            }
        }
    }

    // Neue Methode zum Zeichnen des Lebensbalkens
    drawHealthBar(ctx) {
        if (this.showHealthBar && this.health > 0) {
            // Position über dem Chicken
            let barWidth = 60;
            let barHeight = 10;
            let barX = this.x + (this.width - barWidth) / 2;
            let barY = this.y - barHeight - 5;
            
            // Hintergrund des Lebensbalkens (rot)
            ctx.fillStyle = 'grey';
            ctx.fillRect(barX, barY, barWidth, barHeight);
            
            // Vordergrund des Lebensbalkens (grün) - prozentual zur Gesundheit
            let healthPercentage = this.health / 2; // 2 ist die maximale Gesundheit
            ctx.fillStyle = 'red';
            ctx.fillRect(barX, barY, barWidth * healthPercentage, barHeight);
        }
    }
}
