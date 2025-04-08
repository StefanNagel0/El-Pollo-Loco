class World {
    character = new Character();
    level = level1;
    canvas;
    ctx;
    keyboard;
    camera_x = 0;
    statusBar = new StatusBar();
    throwableObjects = [];
    canThrow = true; // Neue Variable, um das Werfen zu steuern

    constructor(canvas, keyboard) {
        this.ctx = canvas.getContext('2d');
        this.canvas = canvas;
        this.keyboard = keyboard;
        this.userInterface = new UserInterface(canvas);
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

            this.checkThrowObjects();
            this.checkCollisions();
            this.checkCollisionsWithBottles(); // Neue Methode aufrufen
            this.checkEnemyDistances();
        }, 1000 / 60);
    }

    checkThrowObjects() {
        if (this.keyboard.D && this.character.bottles > 0 && this.canThrow) { // Überprüfen, ob Bottles verfügbar sind und ob geworfen werden darf
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
        const percentage = Math.min(this.character.bottles * 20, 100); // Maximal 100%
        this.statusBar.setBottlesPercentage(percentage); // Aktualisiere die Statusbar

        // Sound beim Werfen der Flasche abspielen
        const throwSound = new Audio('../assets/audio/bottle_throw.mp3');
        this.userInterface.registerAudio(throwSound); // Sound bei der UserInterface registrieren
        
        if (!this.userInterface.isMuted) {
            throwSound.play(); // Nur abspielen, wenn nicht stummgeschaltet
        }

        this.canThrow = false; // Setze canThrow auf false, um mehrfaches Werfen zu verhindern

        // Warte, bis die Taste losgelassen wird, bevor erneut geworfen werden kann
        setTimeout(() => {
            this.canThrow = true;
        }, 500); // Cooldown von 1 Sekunde (anpassbar)
    }

    checkCollisions() {
        if (this.level.enemies) {
            this.level.enemies.forEach((enemy) => {
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
    
                if (isStomp && !(enemy instanceof Endboss)) { // Kein Stomp bei Endboss möglich
                    console.log('✅ Stomp erkannt!');
                    if (!enemy.isDead) {  // Änderung hier: isDead als Eigenschaft
                        enemy.die();
                        this.character.speedY = 25; // Bounce-Effekt
                        
                        // Stomp-Sound abspielen
                        const stompSound = new Audio('../assets/audio/stomp_enemie.mp3');
                        this.userInterface.registerAudio(stompSound);
                        
                        if (!this.userInterface.isMuted) {
                            stompSound.play();
                        }
                        
                        // NEU: Gegner nach Animation entfernen
                        setTimeout(() => {
                            const enemyIndex = this.level.enemies.indexOf(enemy);
                            if (enemyIndex > -1 && enemy.isDead) {
                                this.level.enemies.splice(enemyIndex, 1);
                            }
                        }, 500);
                    }
                } else if (isCollision) {
                    console.log('❌ Kollision mit Gegner erkannt!');
                    if (!enemy.isDead) {  // Änderung hier: isDead als Eigenschaft statt als Funktion
                        if (enemy instanceof Endboss) {
                            // Spezielle Logik für Kollisionen mit dem Endboss
                            this.character.hit();
                            this.character.energy -= (enemy.damage - 5); // Größerer Schaden
                            this.statusBar.setEnergyPercentage(this.character.energy);
                            console.log('❌ Kollision mit Endboss, Energie = ', this.character.energy);
                        } else if (enemy instanceof Chicken || enemy instanceof smallChicken) {
                            // Bestehende Logik für normale Chickens
                            this.character.hit();
                            this.statusBar.setEnergyPercentage(this.character.energy);
                            console.log('❌ Kollision mit Gegner, Energie = ', this.character.energy);
                        }
                    }
                }
            });
        }
    
        if (this.level.coins) {
            this.level.coins.forEach((coin) => {
                if (this.character.isColiding(coin)) {
                    console.log('🪙 Collision with Coin:', coin);
                    this.character.collectCoin();
                    console.log('Coin collected, total coins = ', this.character.coins);
                    const coinIndex = this.level.coins.indexOf(coin);
                    if (coinIndex > -1) {
                        this.level.coins.splice(coinIndex, 1);
                        console.log('Coin removed:', coin);
                        console.log('Remaining coins:', this.level.coins);
                    }
                }
            });
        }
    
        if (this.level.bottles) {
            this.level.bottles.forEach((bottle) => {
                if (this.character.isColiding(bottle)) {
                    console.log('🍾 Collision with Bottle:', bottle);
                    this.character.collectBottle(); // Methode zum Sammeln der Bottle
                    console.log('Bottle collected!');
                    const bottleIndex = this.level.bottles.indexOf(bottle);
                    if (bottleIndex > -1) {
                        this.level.bottles.splice(bottleIndex, 1);
                        console.log('Bottle removed:', bottle);
                        console.log('Remaining bottles:', this.level.bottles);
                    }
                }
            });
        }
    }
        
    checkEnemyDistances() {
        const minDistance = MovableObject.minDistanceEnemies; // Dynamischer Mindestabstand für Gegner
    
        this.level.enemies.forEach((enemy1, index1) => {
            this.level.enemies.forEach((enemy2, index2) => {
                if (index1 !== index2) { // Vermeide Vergleich mit sich selbst
                    const distanceX = Math.abs(enemy1.x - enemy2.x);
                    const distanceY = Math.abs(enemy1.y - enemy2.y);
    
                    if (distanceX < minDistance && distanceY < enemy1.height) {
                        // Gegner sind zu nah beieinander, bewege sie auseinander
                        if (enemy1.x < enemy2.x) {
                            enemy1.x -= (minDistance - distanceX) / 2;
                            enemy2.x += (minDistance - distanceX) / 2;
                        } else {
                            enemy1.x += (minDistance - distanceX) / 2;
                            enemy2.x -= (minDistance - distanceX) / 2;
                        }
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
                    if (bottle.isColiding(enemy) && !enemy.isDead && !bottle.isBroken) {
                        // Flasche zerbrechen lassen
                        bottle.break();
                        
                        // Spezialbehandlung für den Endboss
                        if (enemy instanceof Endboss) {
                            enemy.hitWithBottle(); // Spezielle Methode für den Endboss
                        } else {
                            // Normale Gegner sterben sofort
                            enemy.die(true); // true für "fromBottle"
                        }
                        
                        // Zerbrech-Sound abspielen
                        const breakSound = new Audio('../assets/audio/bottle_break.mp3');
                        this.userInterface.registerAudio(breakSound);
                        
                        if (!this.userInterface.isMuted) {
                            breakSound.play();
                        }
                        
                        // Flasche nach Animation entfernen
                        setTimeout(() => {
                            const bottleIndex = this.throwableObjects.indexOf(bottle);
                            if (bottleIndex > -1) {
                                this.throwableObjects.splice(bottleIndex, 1);
                            }
                        }, 300); // Zeit für die Zerbrech-Animation
                        
                        // Gegner nach Animation entfernen
                        setTimeout(() => {
                            const enemyIndex = this.level.enemies.indexOf(enemy);
                            if (enemyIndex > -1) {
                                this.level.enemies.splice(enemyIndex, 1);
                            }
                        }, 500);
                    }
                });
            });
        }
    }

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
            ((mo instanceof Chicken || mo instanceof smallChicken) && !mo.otherDirection)) {
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
            ((mo instanceof Chicken || mo instanceof smallChicken) && !mo.otherDirection)) {
            this.flipImageBack(mo);
        }
    }

    flipImage(mo){
        this.ctx.save();
        this.ctx.translate(mo.width, 0);
        this.ctx.scale(-1, 1);
        mo.x = mo.x * -1;
    }
    flipImageBack(mo){
        mo.x = mo.x * -1;
        this.ctx.restore();
    }
}
