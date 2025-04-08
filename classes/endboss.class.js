class Endboss extends MovableObject {

    height = 400;
    width = 250;
    y = 50;
    damage = 25; // Schaden, den der Endboss dem Character zufügt
    speed = 2.5;
    isAlerted = false;
    isFighting = false;
    isWalking = false;
    showHealthBar = false;
    alertDistance = 500; // Entfernung, bei der der Boss den Character erkennt
    offset = {
        top: 70,
        left: 20,
        right: 20,
        bottom: 20
    };

    IMAGES_WALKING = [
        '../assets/img/4_enemie_boss_chicken/1_walk/G1.png',
        '../assets/img/4_enemie_boss_chicken/1_walk/G2.png',
        '../assets/img/4_enemie_boss_chicken/1_walk/G3.png',
        '../assets/img/4_enemie_boss_chicken/1_walk/G4.png'
    ];

    IMAGES_ALERT = [
        '../assets/img/4_enemie_boss_chicken/2_alert/G5.png',
        '../assets/img/4_enemie_boss_chicken/2_alert/G6.png',
        '../assets/img/4_enemie_boss_chicken/2_alert/G7.png',
        '../assets/img/4_enemie_boss_chicken/2_alert/G8.png',
        '../assets/img/4_enemie_boss_chicken/2_alert/G9.png',
        '../assets/img/4_enemie_boss_chicken/2_alert/G10.png',
        '../assets/img/4_enemie_boss_chicken/2_alert/G11.png',
        '../assets/img/4_enemie_boss_chicken/2_alert/G12.png'
    ];

    constructor() {
        super().loadImage(this.IMAGES_ALERT[0]);
        this.loadImages(this.IMAGES_ALERT);
        this.loadImages(this.IMAGES_WALKING);
        this.x = 6000;
        this.energy = 200; // Lebensenergie des Endbosses
        this.animate();
    }

    animate() {
        setInterval(() => {
            if (this.isWalking && !this.isDead()) {
                this.moveLeft();
                this.playAnimation(this.IMAGES_WALKING);
            } else if (this.isAlerted && !this.isDead()) {
                this.playAnimation(this.IMAGES_ALERT);
            }
        }, 200);

        // Überprüfung der Entfernung zum Character
        setInterval(() => {
            if (this.world && this.world.character) {
                const distance = this.x - this.world.character.x;
                
                if (distance < this.alertDistance && !this.isAlerted) {
                    this.alert();
                }
                
                if (this.isAlerted && !this.isWalking && !this.isDead()) {
                    setTimeout(() => {
                        this.startWalking();
                    }, 1500); // Verzögerung, bevor der Boss anfängt zu laufen
                }
            }
        }, 1000 / 10); // 10 FPS für die Entfernungsprüfung reichen aus
    }

    alert() {
        this.isAlerted = true;
        this.showHealthBar = true;
        
        // Alert-Sound abspielen
        if (this.world && this.world.userInterface) {
            const alertSound = new Audio('../assets/audio/chicken_alert.mp3');
            this.world.userInterface.registerAudio(alertSound);
            
            if (!this.world.userInterface.isMuted) {
                alertSound.play();
            }
        }
    }

    startWalking() {
        this.isWalking = true;
    }

    hit() {
        super.hit(); // Die bestehende hit()-Methode von MovableObject aufrufen
        
        if (this.isDead()) {
            this.speed = 0;
        }
    }

    die() {
        if (!this.isDead()) {
            this.energy = 0;
            this.speed = 0;
            
            // Optional: Todesanimation, falls vorhanden
        }
    }

    // Methode für Treffer mit Flasche
    hitWithBottle() {
        const damage = 40; // Eine Flasche macht 40 Schaden
        this.energy -= damage;
        
        if (this.energy < 0) {
            this.energy = 0;
        }
        
        // Falls der Endboss stirbt
        if (this.isDead()) {
            this.die();
        }
    }

    // Methode zum Zeichnen des Lebensbalkens
    drawHealthBar(ctx) {
        if (this.showHealthBar && this.energy > 0) {  // health durch energy ersetzt
            // Position in der Mitte oben des Canvas
            let barWidth = 200;
            let barHeight = 20;
            
            // Wir nutzen world.canvas, um die Breite zu bekommen
            if (this.world && this.world.canvas) {
                barWidth = this.world.canvas.width / 3; // Ein Drittel der Canvas-Breite
            }
            
            let barX = (this.world.canvas.width - barWidth) / 2;
            let barY = 20;
            
            // Schwarzer Rahmen für bessere Sichtbarkeit
            ctx.fillStyle = 'black';
            ctx.fillRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4);
            
            // Hintergrund des Lebensbalkens (grau)
            ctx.fillStyle = 'grey';
            ctx.fillRect(barX, barY, barWidth, barHeight);
            
            // Berechnung des Gesundheitsanteils (0-1)
            let healthPercentage = this.energy / 200;
            
            // Farbe basierend auf Gesundheitszustand wählen
            let barColor;
            if (healthPercentage > 0.75) {
                barColor = 'green'; // Über 75% - grün
            } else if (healthPercentage > 0.25) {
                barColor = 'orange'; // Zwischen 25% und 75% - orange
            } else {
                barColor = 'red'; // Unter 25% - rot
            }
            
            // Vordergrund des Lebensbalkens mit dynamischer Farbe
            ctx.fillStyle = barColor;
            ctx.fillRect(barX, barY, barWidth * healthPercentage, barHeight);
            
            // Text "ENDBOSS" über dem Lebensbalken
            ctx.fillStyle = 'white';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('ENDBOSS', barX + barWidth / 2, barY - 5);
        }
    }
}