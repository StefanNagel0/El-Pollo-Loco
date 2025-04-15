class World {
    character = new Character();
    level = level1;
    canvas;
    ctx;
    keyboard;
    camera_x = 0;
    statusBar = new StatusBar();
    throwableObjects = [];
    canThrow = true; // Variable, um das Werfen zu steuern
    throwCooldown = 0; // Aktueller Cooldown in ms
    maxThrowCooldown = 2250; // Maximaler Cooldown in ms
    cooldownImage = new Image(); // Bild für die Flasche im Cooldown
    isPaused = true; // Auf true setzen, damit das Spiel im pausierten Zustand startet

    constructor(canvas, keyboard) {
        this.ctx = canvas.getContext('2d');
        this.canvas = canvas;
        this.keyboard = keyboard;
        this.userInterface = new UserInterface(canvas);
        
        // Wenn eine MainMenu-Instanz existiert, prüfen ob Musik bereits läuft
        if (window.mainMenu && window.mainMenu.userInterface && 
            window.mainMenu.userInterface.backgroundMusic) {
            // Musik-Instanz übernehmen statt neu zu starten
            this.userInterface.backgroundMusic = window.mainMenu.userInterface.backgroundMusic;
        }
        
        // Flaschenbild für den Cooldown laden
        this.cooldownImage.src = '../assets/img/6_salsa_bottle/salsa_bottle.png';
        
        this.draw();
        this.setWorld();
        this.run();
        this.character.previousY = this.character.y;

    }

    setWorld() {
        this.character.world = this;
        
        // Setze die Weltgrenzen für alle Chickens und Small Chickens
        this.level.enemies.forEach(enemy => {
            enemy.world = this; // World-Referenz für alle Feinde
            
            if (enemy instanceof Chicken || enemy instanceof smallChicken) {
                enemy.worldLimits = {
                    min: 0,
                    max: this.level.level_end_x
                };
            }
        });
    }


    run(){
        setInterval(() => { 
            // Alle Aktionen nur ausführen, wenn das Spiel nicht pausiert ist
            if (!this.isPaused) {
                this.checkThrowObjects();
                this.checkCollisions();
                this.checkCollisionsWithBottles(); // Neue Methode aufrufen
                this.checkEnemyDistances();
                this.updateCooldown(); // Cooldown-Timer aktualisieren
            }
        }, 1000 / 60);
    }

    checkThrowObjects() {
        if (this.keyboard.D && this.character.bottles > 0 && this.canThrow) {
            // Idle-Zustand zurücksetzen, wenn eine Flasche geworfen wird
            this.character.resetIdleState();
            this.throwBottle();
        }
    }

    throwBottle() {
        let bottle = new ThrowableObject(
            this.character.x + (this.character.otherDirection ? -50 : 100), // Startposition der Flasche
            this.character.y + 100, // Vertikale Position der Flasche
            this.character.otherDirection // Richtung des Charakters
        );
        bottle.world = this; // Füge eine Referenz zur World hinzu
        this.throwableObjects.push(bottle);
        this.character.bottles--; // Reduziere die Anzahl der verfügbaren Bottles
        
        // Direkt die Flaschenanzahl aktualisieren statt Prozentsatz
        this.statusBar.setBottlesCount(this.character.bottles);

        // Sound beim Werfen der Flasche abspielen
        const throwSound = new Audio('../assets/audio/bottle_throw.mp3');
        this.userInterface.registerAudioWithCategory(throwSound, 'objects');
        
        // Manuell die Lautstärke der objects-Kategorie anwenden
        if (!this.userInterface.isMuted) {
            const objectsVolume = this.userInterface.objectsVolume / 10;
            throwSound.volume = objectsVolume;
            throwSound.play();
        }

        // Cooldown starten
        this.canThrow = false;
        this.throwCooldown = this.maxThrowCooldown;
        
        // Warte, bis der Cooldown abgelaufen ist
        setTimeout(() => {
            this.canThrow = true;
            this.throwCooldown = 0;
        }, this.maxThrowCooldown);
    }

    checkCollisions() {
        if (this.level.enemies) {
            this.level.enemies.forEach((enemy, enemyIndex) => {
                const characterBottom = this.character.y + this.character.height - this.character.offset.bottom;
                const enemyTop = enemy.y + (enemy.offset?.top || 0);
                const stompHeight = enemy.stompableAreaHeight || 40;
                const enemyStompBottom = enemyTop + stompHeight;
    
                const isStomp =
                    this.character.isColiding(enemy) &&
                    characterBottom >= enemyTop &&
                    characterBottom <= enemyStompBottom &&
                    this.character.speedY < 0;
    
                const isCollision = this.character.isColiding(enemy);
    
                if (isStomp && !(enemy instanceof Endboss)) {
                    if (!enemy.isDead) {
                        enemy.die();
                        this.character.speedY = 25; // Bounce-Effekt
                        
                        const stompSound = new Audio('../assets/audio/stomp_enemie.mp3');
                        this.userInterface.registerAudioWithCategory(stompSound, 'enemies');

                        if (!this.userInterface.isMuted) {
                            // Kategorie-Lautstärke direkt anwenden
                            const enemiesVolume = this.userInterface.enemiesVolume / 10;
                            stompSound.volume = enemiesVolume;
                            stompSound.play();
                        }

                        setTimeout(() => {
                            const enemyIndex = this.level.enemies.indexOf(enemy);
                            if (enemyIndex > -1 && enemy.isDead) {
                                this.level.enemies.splice(enemyIndex, 1);
                            }
                        }, 500);
                    }
                } else if (isCollision) {
                    if (!enemy.isDead) {  // Änderung hier: isDead als Eigenschaft statt als Funktion
                        // Gegner-ID zum Tracking erzeugen (nur einmal Schaden pro Gegner)
                        const enemyId = enemy.constructor.name + '_' + enemyIndex;
                        
                        // Prüfen, ob dieser Gegner bereits in der Liste ist
                        if (!this.character.collidingEnemies.includes(enemyId)) {
                            // Gegner zur Liste hinzufügen
                            this.character.collidingEnemies.push(enemyId);
                            
                            // Jetzt Schaden zufügen (nur einmal)
                            if (enemy instanceof Endboss) {
                                // Spezielle Logik für Kollisionen mit dem Endboss
                                // NICHT hit() UND energy reduzieren - wähle nur eine Methode
                                this.character.energy -= enemy.damage; // Nur direkten Schaden anwenden
                                this.statusBar.setEnergyPercentage(this.character.energy);
                                this.character.lastHit = new Date().getTime(); // Für Verletzungsanimation
                            } else if (enemy instanceof Chicken || enemy instanceof smallChicken) {
                                // Normale Chickens verursachen standardmäßigen Schaden
                                this.character.hit(); // hit() reduziert bereits Energy um 5
                                this.statusBar.setEnergyPercentage(this.character.energy);
                            }
                        }
                    }
                } else {
                    // Keine Kollision mehr, Gegner aus der Liste entfernen
                    const enemyId = enemy.constructor.name + '_' + enemyIndex;
                    const index = this.character.collidingEnemies.indexOf(enemyId);
                    if (index !== -1) {
                        this.character.collidingEnemies.splice(index, 1);
                    }
                }
            });
        }
    
        if (this.level.coins) {
            this.level.coins.forEach((coin, index) => {
                // Hier statt isColiding() die neue präzise Methode verwenden
                if (this.character.isPreciselyColiding(coin)) {
                    // Coin einsammeln
                    this.character.collectCoin();
                    // Coin aus dem Level entfernen
                    this.level.coins.splice(index, 1);
                }
            });
        }
    
        if (this.level.bottles) {
            this.level.bottles.forEach((bottle) => {
                if (this.character.isColiding(bottle)) {
                    this.character.collectBottle(); // Methode zum Sammeln der Bottle
                    const bottleIndex = this.level.bottles.indexOf(bottle);
                    if (bottleIndex > -1) {
                        this.level.bottles.splice(bottleIndex, 1);
                    }
                }
            });
        }
    }
        
    checkEnemyDistances() {
        // Nicht überprüfen, wenn das Spiel pausiert ist
        if (this.isPaused) return;
        
        const minDistance = 100; // Festgelegter Mindestabstand für bessere Kontrolle
        
        this.level.enemies.forEach((enemy1, index1) => {
            // Endboss überspringen - der sollte seine eigenen Regeln haben
            if (enemy1 instanceof Endboss) return;
            
            this.level.enemies.forEach((enemy2, index2) => {
                // Vergleich mit sich selbst oder mit Endboss vermeiden
                if (index1 !== index2 && !(enemy2 instanceof Endboss)) { 
                    // Ignorieren toter Feinde
                    if (enemy1.isDead || enemy2.isDead) return;
                    
                    const distanceX = Math.abs(enemy1.x - enemy2.x);
                    const distanceY = Math.abs(enemy1.y - enemy2.y);
                    
                    // Nur horizontale Kollisionen prüfen, die wichtig sind
                    if (distanceX < minDistance && distanceY < enemy1.height / 2) {
                        // Statt die Gegner auseinanderzuschieben, drehen wir einfach um
                        enemy1.otherDirection = !enemy1.otherDirection;
                        enemy2.otherDirection = !enemy2.otherDirection;
                        
                        // Kleine Positionskorrektur, damit sie nicht sofort wieder kollidieren
                        if (enemy1.x < enemy2.x) {
                            enemy1.x -= 10;
                            enemy2.x += 10;
                        } else {
                            enemy1.x += 10;
                            enemy2.x -= 10;
                        }
                        
                        // Optional: Kleine Verzögerung bis zur nächsten Richtungsänderung
                        enemy1.setRandomDirectionChangeTime();
                        enemy2.setRandomDirectionChangeTime();
                    }
                }
            });
        });
    }

    // Neue Methode zur Überprüfung von Kollisionen zwischen Flaschen und Gegnern
    checkCollisionsWithBottles() {
        if (this.throwableObjects.length > 0 && this.level.enemies) {
            this.throwableObjects.forEach((bottle, bottleIndex) => {
                this.level.enemies.forEach((enemy, enemyIndex) => {
                    // Korrigierte Bedingung, um beide isDead-Varianten zu berücksichtigen
                    const enemyIsDead = enemy instanceof Endboss ? enemy.isDead() : enemy.isDead;
                    
                    if (bottle.isColiding(enemy) && !enemyIsDead && !bottle.isBroken) {
                        console.log('Flasche kollidiert mit:', enemy instanceof Endboss ? 'Endboss' : 'Chicken');
                        
                        // Flasche zerbrechen lassen
                        bottle.break();
                        
                        // Spezialbehandlung für den Endboss
                        if (enemy instanceof Endboss) {
                            enemy.hitWithBottle(); // Spezielle Methode für den Endboss
                            console.log('Endboss getroffen, Energie:', enemy.energy);
                        } else {
                            // Normale Gegner sterben sofort
                            enemy.die(true); // true für "fromBottle"
                        }
                        
                        // Zerbrech-Sound abspielen
                        const breakSound = new Audio('../assets/audio/bottle_break.mp3');
                        this.userInterface.registerAudioWithCategory(breakSound, 'objects');
                        
                        // Manuell die Lautstärke der objects-Kategorie anwenden
                        if (!this.userInterface.isMuted) {
                            const objectsVolume = this.userInterface.objectsVolume / 10;
                            breakSound.volume = objectsVolume;
                            breakSound.play();
                        }
                        
                        // Flasche nach Animation entfernen
                        setTimeout(() => {
                            const bottleIndex = this.throwableObjects.indexOf(bottle);
                            if (bottleIndex > -1) {
                                this.throwableObjects.splice(bottleIndex, 1);
                            }
                        }, 300); // Zeit für die Zerbrech-Animation
                        
                        // Gegner nach Animation entfernen, ABER NUR wenn kein Endboss oder der Endboss tot ist
                        setTimeout(() => {
                            const enemyIndex = this.level.enemies.indexOf(enemy);
                            if (enemyIndex > -1 && (!(enemy instanceof Endboss) || enemy.isDead())) {
                                this.level.enemies.splice(enemyIndex, 1);
                            }
                        }, 500);
                    }
                });
            });
        }
    }

    // Neue Methode zum Aktualisieren des Cooldown-Timers
    updateCooldown() {
        if (this.throwCooldown > 0) {
            this.throwCooldown -= (1000 / 60); // Reduzierung pro Frame (60 FPS)
            if (this.throwCooldown < 0) this.throwCooldown = 0;
        }
    }
    
    // Aktualisierte Methode zum Zeichnen des Cooldown-Kreises
    drawCooldownCircle() {
        if (this.throwCooldown <= 0) return;
        
        // Positioniere den Kreis unter dem Settings-Icon (ursprüngliche Größe)
        const circleRadius = 25; // Zurück zur ursprünglichen Größe
        const padding = 10;      // Ursprünglicher Abstand
        
        // Position basierend auf dem Settings-Icon bestimmen
        const offsetX = this.userInterface.settingsIconX + this.userInterface.settingsIconWidth / 2;
        const offsetY = this.userInterface.settingsIconY + this.userInterface.settingsIconHeight + padding + circleRadius;
        
        // Grauer Hintergrund-Kreis (voller Kreis)
        this.ctx.beginPath();
        this.ctx.arc(offsetX, offsetY, circleRadius, 0, 2 * Math.PI);
        this.ctx.fillStyle = 'rgba(80, 80, 80, 0.7)';
        this.ctx.fill();
        
        // Oranger fortschreitender Kreis (von oben im Uhrzeigersinn)
        const progress = this.throwCooldown / this.maxThrowCooldown;
        this.ctx.beginPath();
        this.ctx.moveTo(offsetX, offsetY);
        this.ctx.arc(
            offsetX, 
            offsetY, 
            circleRadius, 
            -Math.PI / 2, // Startwinkel (oben)
            -Math.PI / 2 + (1 - progress) * 2 * Math.PI, // Endwinkel basierend auf Fortschritt
            false // im Uhrzeigersinn
        );
        this.ctx.lineTo(offsetX, offsetY);
        this.ctx.fillStyle = 'rgba(255, 140, 0, 0.7)';
        this.ctx.fill();
        
        // Flaschenbild in der Mitte des Kreises zeichnen
        if (this.cooldownImage.complete) {
            const bottleSize = circleRadius * 2.4; // Proportional vergrößert
            this.ctx.drawImage(
                this.cooldownImage, 
                offsetX - bottleSize / 2, 
                offsetY - bottleSize / 2, 
                bottleSize, 
                bottleSize
            );
        }
        
        // Verbleibende Zeit anzeigen - Kleinere Schrift
        const remainingTime = (this.throwCooldown / 1000).toFixed(1);
        this.ctx.font = 'bold 16px Arial'; // Zurück zur ursprünglichen Schriftgröße
        this.ctx.textAlign = 'center';
        this.ctx.fillStyle = 'white';
        this.ctx.fillText(remainingTime + 's', offsetX, offsetY + circleRadius + 15);
    }

    // Aktualisierte draw-Methode, um den Cooldown-Kreis an der richtigen Stelle zu zeichnen
    draw(ctx) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.translate(this.camera_x, 0);
        this.addObjectsToMap(this.level.backgroundObjects);
        this.addToMap(this.character);
        this.addObjectsToMap(this.level.clouds);
        this.addObjectsToMap(this.level.enemies);
        this.addObjectsToMap(this.level.coins); 
        this.addObjectsToMap(this.level.bottles);
        this.addObjectsToMap(this.throwableObjects); 
        this.ctx.translate(-this.camera_x, 0);

        // UI-Elemente nach der Kamera-Transformation zeichnen
        this.statusBar.draw(this.ctx);  
        this.userInterface.drawIcons();
        
        // Endboss-Lebensbalken als UI-Element zeichnen
        this.drawEndbossHealthBar();
        
        // Cooldown-Kreis als UI-Element zeichnen (ohne Kamera-Transformation)
        if (this.throwCooldown > 0) {
            this.drawCooldownCircle(); // Keine Kamera-Transformation nötig, da feste Position
        }
        
        //Draw() wird immer wieder aufgerufen
        let self = this;
        requestAnimationFrame(function () {
            self.draw();
        });
    }

    // Neue Methode zum Zeichnen des Endboss-Lebensbalken als UI-Element
    drawEndbossHealthBar() {
        // Suche nach dem Endboss
        const endboss = this.level.enemies.find(enemy => enemy instanceof Endboss);
        
        // Wenn der Endboss existiert und sein Lebensbalken angezeigt werden soll,
        // rufen wir seine drawHealthBar-Methode auf
        if (endboss && endboss.showHealthBar) {
            endboss.drawHealthBar(this.ctx);
        }
    }

    addObjectsToMap(objects) {
        if (!objects || !Array.isArray(objects)) return; // Sicherheitsprüfung
        objects.forEach((o) => {
            this.addToMap(o);
        });
    }

    addToMap(mo) {
        // Spiegellogik für verschiedene Objekttypen
        if ((mo instanceof Character && mo.otherDirection) || 
            ((mo instanceof Chicken || mo instanceof smallChicken || mo instanceof Endboss) && !mo.otherDirection)) {
            this.flipImage(mo);
        }
        
        mo.draw(this.ctx);
        
        // Zeichne Lebensbalken für Chicken nach dem Zeichnen des Objekts
        // Aber NICHT für den Endboss - dieser wird separat gezeichnet
        if (mo instanceof Chicken && mo.showHealthBar) {
            mo.drawHealthBar(this.ctx);
        }
        // Endboss-Lebensbalken wird jetzt in drawEndbossHealthBar() gezeichnet
        
        mo.drawFrame(this.ctx);
        
        // Stelle den ursprünglichen Zustand wieder her
        if ((mo instanceof Character && mo.otherDirection) || 
            ((mo instanceof Chicken || mo instanceof smallChicken || mo instanceof Endboss) && !mo.otherDirection)) {
            this.flipImageBack(mo);
        }
    }

    // Komplett überarbeitete flipImage und flipImageBack Methoden

    flipImage(mo){
        this.ctx.save();
        this.ctx.translate(mo.width, 0);
        this.ctx.scale(-1, 1);
        mo.x = mo.x * -1; // Hier wird die tatsächliche Position geändert
    }

    flipImageBack(mo){
        mo.x = mo.x * -1; // Hier sollte die Position wiederhergestellt werden
        this.ctx.restore();
    }
}
