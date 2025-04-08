class Endboss extends MovableObject {

    height = 400;
    width = 250;
    y = 50;
    damage = 25; // Schaden, den der Endboss dem Character zufügt
    speed = 8; // Erhöhte Grundgeschwindigkeit (fast so schnell wie Character)
    attackSpeed = 18; // Sehr schnell beim Anstürmen
    isAlerted = false;
    isFighting = false;
    isWalking = false;
    isHurt = false; // Neuer Zustand für Verletzung
    isDying = false; // Neuer Zustand für Todesanimation
    isAttacking = false; // Neuer Zustand für die Attacke
    attackCooldown = 0; // Zeitpunkt für die nächste Attacke
    hurtDuration = 1000; // Dauer der Verletzungsanimation in ms
    lastHurtTime = 0; // Zeitpunkt der letzten Verletzung
    showHealthBar = false;
    alertDistance = 500; // Entfernung, bei der der Boss den Character erkennt
    offset = {
        top: 70,
        left: 30,
        right: 30,
        bottom: 20
    };

    // Neue Phasen für den Angriffszyklus
    isCharging = false;  // Anstürmen mit hoher Geschwindigkeit
    isResting = false;   // Normale Bewegung nach dem Angriff
    
    attackDuration = 1000;  // Wie lange dauert ein Angriff 
    restDuration = 0;       // Zeit für normale Bewegung nach Angriff (wird dynamisch gesetzt)
    lastAttackTime = 0;     // Zeitpunkt des letzten Angriffs

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

    // Neue Bilder für die Attacke hinzufügen
    IMAGES_ATTACK = [
        '../assets/img/4_enemie_boss_chicken/3_attack/G13.png',
        '../assets/img/4_enemie_boss_chicken/3_attack/G14.png',
        '../assets/img/4_enemie_boss_chicken/3_attack/G15.png',
        '../assets/img/4_enemie_boss_chicken/3_attack/G16.png',
        '../assets/img/4_enemie_boss_chicken/3_attack/G17.png',
        '../assets/img/4_enemie_boss_chicken/3_attack/G18.png',
        '../assets/img/4_enemie_boss_chicken/3_attack/G19.png',
        '../assets/img/4_enemie_boss_chicken/3_attack/G20.png'
    ];

    // Neue Bilder für die Verletzungsanimation hinzufügen
    IMAGES_HURT = [
        '../assets/img/4_enemie_boss_chicken/4_hurt/G21.png',
        '../assets/img/4_enemie_boss_chicken/4_hurt/G22.png',
        '../assets/img/4_enemie_boss_chicken/4_hurt/G23.png'
    ];

    // Neue Bilder für die Todesanimation hinzufügen
    IMAGES_DEAD = [
        '../assets/img/4_enemie_boss_chicken/5_dead/G24.png',
        '../assets/img/4_enemie_boss_chicken/5_dead/G25.png',
        '../assets/img/4_enemie_boss_chicken/5_dead/G26.png'
    ];

    constructor() {
        super().loadImage(this.IMAGES_ALERT[0]);
        this.loadImages(this.IMAGES_ALERT);
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_HURT); // Verletzungsbilder laden
        this.loadImages(this.IMAGES_DEAD); // Todesbilder laden
        this.loadImages(this.IMAGES_ATTACK); // Neue Attacke-Bilder laden
        this.x = 6000;
        this.energy = 200; // Lebensenergie des Endbosses
        this.animate();
        this.setRandomAttackCooldown(); // Initial Cooldown für erste Attacke setzen
    }

    // Neue Methode: Zufälligen Zeitpunkt für die nächste Attacke festlegen
    setRandomAttackCooldown() {
        // Zwischen 1 und 3 Sekunden warten bis zur nächsten Attacke
        this.attackCooldown = new Date().getTime() + (2000 + Math.random() * 2000);
    }

    animate() {
        setInterval(() => {
            if (this.isDead()) {
                // Todesanimation abspielen, wenn der Endboss tot ist
                if (!this.isDying) {
                    this.isDying = true;
                    this.speed = 0;
                    this.isWalking = false;
                    this.isAttacking = false;
                    this.isCharging = false;
                    this.isResting = false;
                    this.isHurt = false;
                    
                    // Tod-Sound abspielen
                    const deathSound = new Audio('../assets/audio/boss_death.mp3');
                    if (this.world && this.world.userInterface) {
                        this.world.userInterface.registerAudio(deathSound);
                        if (!this.world.userInterface.isMuted) {
                            deathSound.play();
                        }
                    }
                }
                
                // Todesanimation abspielen
                this.playAnimation(this.IMAGES_DEAD);
                
            } else if (this.isHurt) {
                // Wenn verletzt, spiele Verletzungsanimation ab
                this.playAnimation(this.IMAGES_HURT);
                
                // Prüfe, ob die Verletzungsdauer abgelaufen ist
                const timeSinceHurt = new Date().getTime() - this.lastHurtTime;
                if (timeSinceHurt > this.hurtDuration) {
                    this.isHurt = false;
                }
            } else if (this.isAttacking) {
                // Attacke-Animation abspielen
                this.playAnimation(this.IMAGES_ATTACK);
            } else if (this.isCharging || this.isWalking || this.isResting) {
                // Lauf-Animation für alle Bewegungszustände
                this.playAnimation(this.IMAGES_WALKING);
            } else if (this.isAlerted && !this.isDead()) {
                this.playAnimation(this.IMAGES_ALERT);
            }
        }, 200);

        // Überprüfung der Entfernung zum Character
        setInterval(() => {
            if (this.world && this.world.character && !this.isDead() && !this.isHurt) {
                const characterX = this.world.character.x;
                const distance = this.x - characterX;
                const distanceAbs = Math.abs(distance);
                
                // Charakter-Entfernung prüfen und Alert-Zustand setzen
                if (distanceAbs < this.alertDistance && !this.isAlerted) {
                    this.alert();
                }
                
                if (this.isAlerted) {
                    // Aktuelle Zeit für Vergleiche mit Cooldowns
                    const now = new Date().getTime();
                    
                    if (this.isCharging) {
                        // Anstürmen mit hoher Geschwindigkeit
                        if (this.x > characterX + 100) { // Größerer Abstand für bessere Positionierung
                            this.otherDirection = true;
                            this.x -= this.attackSpeed;
                        } else if (this.x < characterX - 100) {
                            this.otherDirection = false;
                            this.x += this.attackSpeed;
                        } else {
                            // Endboss hat Character erreicht, starte Angriff
                            this.isCharging = false;
                            this.isAttacking = true;
                            this.lastAttackTime = now;
                            
                            // Character angreifen
                            if (this.world.character && !this.world.character.isHurt()) {
                                this.world.character.hit();
                                this.world.character.energy -= this.damage;
                                this.world.statusBar.setEnergyPercentage(this.world.character.energy);
                                
                                // Angriffssound abspielen
                                const attackSound = new Audio('../assets/audio/boss_attack.mp3');
                                if (this.world.userInterface) {
                                    this.world.userInterface.registerAudio(attackSound);
                                    if (!this.world.userInterface.isMuted) {
                                        attackSound.play();
                                    }
                                }
                            }
                        }
                    } else if (this.isAttacking) {
                        // Boss steht still während des Angriffs
                        const timeSinceAttack = now - this.lastAttackTime;
                        if (timeSinceAttack > this.attackDuration) {
                            // Angriff beendet, starte Ruhephase
                            this.isAttacking = false;
                            this.isResting = true;
                            this.restDuration = 2000 + Math.random() * 2000; // 2-4 Sekunden
                            this.lastAttackTime = now;
                        }
                    } else if (this.isResting) {
                        // Normale Bewegung nach Angriff (mit normaler Geschwindigkeit)
                        if (this.x > characterX) {
                            this.otherDirection = true;
                            this.x -= this.speed;
                        } else {
                            this.otherDirection = false;
                            this.x += this.speed;
                        }
                        
                        // Prüfen, ob Ruhephase beendet ist
                        const timeSinceAttack = now - this.lastAttackTime;
                        if (timeSinceAttack > this.restDuration) {
                            // Ruhephase beendet
                            this.isResting = false;
                            this.setRandomAttackCooldown();
                        }
                    } else if (now >= this.attackCooldown && distanceAbs < 600) {
                        // Cooldown abgelaufen und Character in Reichweite - starte neuen Angriff
                        this.startAttack();
                    } else if (this.isWalking) {
                        // Normale Verfolgung mit normaler Geschwindigkeit
                        if (this.x > characterX) {
                            this.otherDirection = true; // Nach links schauen
                            this.x -= this.speed;
                        } else {
                            this.otherDirection = false; // Nach rechts schauen
                            this.x += this.speed;
                        }
                    } else if (!this.isWalking && !this.isDead() && !this.isHurt) {
                        // Starten des Laufens nach kurzer Verzögerung
                        setTimeout(() => {
                            this.startWalking();
                        }, 500);
                    }
                }
            }
        }, 1000 / 60); // 60 FPS für flüssige Bewegungen
    }

    // Neue Methode: Attacke starten
    startAttack() {
        this.isCharging = true; // Zuerst die Charging-Phase
        this.isAttacking = false;
        this.isResting = false;
        
        // Sound für den Angriffsbeginn (optional)
        if (this.world && this.world.userInterface) {
            const attackStartSound = new Audio('../assets/audio/chicken_alert.mp3');
            this.world.userInterface.registerAudio(attackStartSound);
            if (!this.world.userInterface.isMuted) {
                attackStartSound.play();
            }
        }
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
            this.isDying = true;
            this.showHealthBar = false; // Optional: Lebensbalken beim Tod ausblenden
            
            // Zusätzlicher Code für die Todesanimation kann hier eingefügt werden
        }
    }

    // Aktualisierte Methode für Treffer mit Flasche
    hitWithBottle() {
        const damage = 40; // Eine Flasche macht 40 Schaden
        this.energy -= damage;
        
        if (this.energy < 0) {
            this.energy = 0;
        }
        
        // Hurt-Animation und Sound starten
        this.isHurt = true;
        this.lastHurtTime = new Date().getTime();
        
        // Verletzungssound abspielen
        if (this.world && this.world.userInterface) {
            const hurtSound = new Audio('../assets/audio/chicken_hurt.mp3');
            this.world.userInterface.registerAudio(hurtSound);
            
            if (!this.world.userInterface.isMuted) {
                hurtSound.play();
            }
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