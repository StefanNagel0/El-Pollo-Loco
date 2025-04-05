class World {
    character = new Character();
    level = level1;
    canvas;
    ctx;
    keyboard;
    camera_x = 0;
    statusBar = new StatusBar();
    throwableObjects = [];
    

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
    }


    run(){
        setInterval(() => { 

            this.checkThrowObjects();
            this.checkCollisions();
        }, 1000 / 60);
    }

    checkThrowObjects(){
        if (this.keyboard.D) {
            let bottle = new ThrowableObject(this.character.x + 100 , this.character.y + 100);
            this.throwableObjects.push(bottle)
        }
    }

        checkCollisions() {
            if (this.level.enemies) {
                this.level.enemies.forEach((enemy) => {
                    // Berechnung der relevanten Seiten
                    const characterBottom = this.character.y + this.character.height - this.character.offset.bottom;
                    const enemyTop = enemy.y + (enemy.offset?.top || 0);
                    const stompHeight = enemy.stompableAreaHeight || 100; // Bereich, der als "stompbar" gilt
                    const enemyStompBottom = enemyTop + stompHeight;
                       
                    // Prüfen, ob der Charakter den Gegner von oben trifft
                    const isStomp =
                        this.character.isColiding(enemy) && // Prüfen, ob eine tatsächliche Kollision besteht
                        characterBottom >= enemyTop && // Untere Seite des Charakters berührt obere Seite des Gegners
                        characterBottom <= enemyStompBottom && // Innerhalb des stompbaren Bereichs
                        this.character.speedY < 0; // Charakter bewegt sich nach unten
        
                    const isCollision = this.character.isColiding(enemy);
        
                    if (isStomp) {
                        console.log('✅ Stomp erkannt!');
                        if (!enemy.isDead) {
                            enemy.die();
                            this.character.speedY = +30; // Bounce-Effekt
        
                            setTimeout(() => {
                                const enemyIndex = this.level.enemies.indexOf(enemy);
                                if (enemyIndex > -1) {
                                    this.level.enemies.splice(enemyIndex, 1); // Gegner aus dem Spiel entfernen
                                }
                            }, 500);
                        }
                    } else if (isCollision) {
                        console.log('❌ Kollision mit Gegner erkannt!');
                        if (!enemy.isDead && (enemy instanceof Chicken || enemy instanceof smallChicken)) {
                            this.character.hit();
                            this.statusBar.setEnergyPercentage(this.character.energy);
                            console.log('❌ Kollision mit Gegner, Energie = ', this.character.energy);
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
        }
        


    draw(ctx) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.translate(this.camera_x, 0);
        this.addObjectsToMap(this.level.backgroundObjects);
        this.addToMap(this.character);
        this.addObjectsToMap(this.level.clouds);
        this.addObjectsToMap(this.level.enemies);
        this.addObjectsToMap(this.level.coins); 
        this.ctx.translate(-this.camera_x, 0);

        this.statusBar.draw(this.ctx);  
        this.addObjectsToMap(this.throwableObjects);

        this.userInterface.drawSoundIcon();
        
        //Draw() wird immer wieder aufgerufen
        let self = this;
        requestAnimationFrame(function () {
            self.draw();
        });
    }

    addObjectsToMap(objects) {
        if (!objects || !Array.isArray(objects)) return; // Sicherheitsprüfung
        objects.forEach((o) => {
            this.addToMap(o);
        });
    }

    addToMap(mo) {
        if (mo.otherDirection) {
            this.flipImage(mo);
        }
        mo.draw(this.ctx);
        mo.drawFrame(this.ctx);

        if (mo.otherDirection) {
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
