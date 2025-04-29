class World {
    character = new Character();
    level = level1;
    canvas;
    ctx;
    keyboard;
    camera_x = 0;
    statusBar = new StatusBar();
    throwableObjects = [];
    canThrow = true;
    throwCooldown = 0;
    maxThrowCooldown = 2250;
    cooldownImage = new Image();
    isPaused = true;

    constructor(canvas, keyboard) {
        this.ctx = canvas.getContext('2d');
        this.canvas = canvas;
        this.keyboard = keyboard;
        this.userInterface = new UserInterface(canvas);
        this.initializeUI();
        this.draw();
        this.setWorld();
        this.run();
        this.character.previousY = this.character.y;
    }

    initializeUI() {
        if (window.mainMenu?.userInterface?.backgroundMusic) {
            this.userInterface.backgroundMusic = window.mainMenu.userInterface.backgroundMusic;
        }
        this.cooldownImage.src = '../assets/img/6_salsa_bottle/salsa_bottle.png';
    }

    setWorld() {
        this.character.world = this;
        this.level.enemies.forEach(enemy => {
            enemy.world = this;
            if (enemy instanceof Chicken || enemy instanceof smallChicken) {
                enemy.worldLimits = { min: 0, max: this.level.level_end_x };
            }
        });
    }

    run() {
        setInterval(() => {
            if (!this.isPaused) {
                this.checkThrowObjects();
                this.checkCollisions();
                this.checkCollisionsWithBottles();
                this.checkEnemyDistances();
                this.updateCooldown();
            }
        }, 1000 / 60);
    }

    checkThrowObjects() {
        if (this.keyboard.D && this.character.bottles > 0 && this.canThrow) {
            this.character.resetIdleState();
            this.throwBottle();
        }
    }

    throwBottle() {
        const bottle = this.createBottle();
        this.throwableObjects.push(bottle);
        this.decreaseBottlesAndUpdateUI();
        this.playThrowSound();
        this.startThrowCooldown();
    }

    createBottle() {
        let bottle = new ThrowableObject(
            this.character.x + (this.character.otherDirection ? -50 : 100),
            this.character.y + 100,
            this.character.otherDirection
        );
        bottle.world = this;
        return bottle;
    }

    decreaseBottlesAndUpdateUI() {
        this.character.bottles--;
        this.statusBar.setBottlesCount(this.character.bottles);
    }

    playThrowSound() {
        const throwSound = new Audio('../assets/audio/bottle_throw.mp3');
        this.userInterface.registerAudioWithCategory(throwSound, 'objects');
        if (!this.userInterface.isMuted) {
            throwSound.volume = this.userInterface.objectsVolume / 10;
            throwSound.play();
        }
    }

    startThrowCooldown() {
        this.canThrow = false;
        this.throwCooldown = this.maxThrowCooldown;
        setTimeout(() => {
            this.canThrow = true;
            this.throwCooldown = 0;
        }, this.maxThrowCooldown);
    }

    checkCollisions() {
        if (this.level.enemies) this.checkEnemyCollisions();
        if (this.level.coins) this.checkCoinCollisions();
        if (this.level.bottles) this.checkBottleCollisions();
    }

    checkEnemyCollisions() {
        this.level.enemies.forEach((enemy, enemyIndex) => {
            if (this.isCharacterStompingEnemy(enemy)) {
                this.handleEnemyStomp(enemy);
            } else if (this.character.isColiding(enemy)) {
                this.handleEnemyCollision(enemy, enemyIndex);
            } else {
                this.removeEnemyFromCollisionList(enemy, enemyIndex);
            }
        });
    }

    isCharacterStompingEnemy(enemy) {
        const characterBottom = this.character.y + this.character.height - this.character.offset.bottom;
        const enemyTop = enemy.y + (enemy.offset?.top || 0);
        const stompHeight = enemy.stompableAreaHeight || 40;
        return this.character.isColiding(enemy) &&
            characterBottom >= enemyTop &&
            characterBottom <= enemyTop + stompHeight &&
            this.character.speedY < 0;
    }

    handleEnemyStomp(enemy) {
        if (!(enemy instanceof Endboss) && !enemy.isDead) {
            enemy.die();
            this.character.speedY = 25;
            this.playStompSound();
            this.scheduleEnemyRemoval(enemy, 500);
        }
    }

    playStompSound() {
        const stompSound = new Audio('../assets/audio/stomp_enemie.mp3');
        this.userInterface.registerAudioWithCategory(stompSound, 'enemies');
        if (!this.userInterface.isMuted) {
            stompSound.volume = this.userInterface.enemiesVolume / 10;
            stompSound.play();
        }
    }

    handleEnemyCollision(enemy, enemyIndex) {
        if (!enemy.isDead) {
            const enemyId = enemy.constructor.name + '_' + enemyIndex;
            if (!this.character.collidingEnemies.includes(enemyId)) {
                this.character.collidingEnemies.push(enemyId);
                this.applyEnemyDamage(enemy);
            }
        }
    }

    applyEnemyDamage(enemy) {
        if (enemy instanceof Endboss) {
            this.character.energy -= enemy.damage;
            this.statusBar.setEnergyPercentage(this.character.energy);
            this.character.lastHit = new Date().getTime();
        } else if (enemy instanceof Chicken || enemy instanceof smallChicken) {
            this.character.hit();
            this.statusBar.setEnergyPercentage(this.character.energy);
        }
    }

    removeEnemyFromCollisionList(enemy, enemyIndex) {
        const enemyId = enemy.constructor.name + '_' + enemyIndex;
        const index = this.character.collidingEnemies.indexOf(enemyId);
        if (index !== -1) {
            this.character.collidingEnemies.splice(index, 1);
        }
    }

    checkCoinCollisions() {
        this.level.coins.forEach((coin, index) => {
            if (this.character.isPreciselyColiding(coin)) {
                this.character.collectCoin();
                this.level.coins.splice(index, 1);
            }
        });
    }

    checkBottleCollisions() {
        this.level.bottles.forEach((bottle) => {
            if (this.character.isColiding(bottle)) {
                this.character.collectBottle();
                const bottleIndex = this.level.bottles.indexOf(bottle);
                if (bottleIndex > -1) {
                    this.level.bottles.splice(bottleIndex, 1);
                }
            }
        });
    }

    scheduleEnemyRemoval(enemy, delay) {
        setTimeout(() => {
            const enemyIndex = this.level.enemies.indexOf(enemy);
            if (enemyIndex > -1 && enemy.isDead) {
                this.level.enemies.splice(enemyIndex, 1);
            }
        }, delay);
    }

    checkEnemyDistances() {
        if (this.isPaused) return;
        const minDistance = 100;
        this.level.enemies.forEach((enemy1, index1) => {
            if (enemy1 instanceof Endboss) return;

            this.level.enemies.forEach((enemy2, index2) => {
                if (this.shouldCheckEnemies(enemy1, enemy2, index1, index2)) {
                    this.handleEnemyProximity(enemy1, enemy2);
                }
            });
        });
    }

    shouldCheckEnemies(enemy1, enemy2, index1, index2) {
        return index1 !== index2 &&
            !(enemy2 instanceof Endboss) &&
            !enemy1.isDead &&
            !enemy2.isDead;
    }

    handleEnemyProximity(enemy1, enemy2) {
        const distanceX = Math.abs(enemy1.x - enemy2.x);
        const distanceY = Math.abs(enemy1.y - enemy2.y);

        if (distanceX < 100 && distanceY < enemy1.height / 2) {
            enemy1.otherDirection = !enemy1.otherDirection;
            enemy2.otherDirection = !enemy2.otherDirection;
            if (enemy1.x < enemy2.x) {
                enemy1.x -= 10;
                enemy2.x += 10;
            } else {
                enemy1.x += 10;
                enemy2.x -= 10;
            }
            enemy1.setRandomDirectionChangeTime();
            enemy2.setRandomDirectionChangeTime();
        }
    }

    checkCollisionsWithBottles() {
        if (this.throwableObjects.length > 0 && this.level.enemies) {
            this.throwableObjects.forEach((bottle, bottleIndex) => {
                this.level.enemies.forEach((enemy, enemyIndex) => {
                    this.checkBottleEnemyCollision(bottle, enemy);
                });
            });
        }
    }

    checkBottleEnemyCollision(bottle, enemy) {
        const enemyIsDead = enemy instanceof Endboss ? enemy.isDead() : enemy.isDead;
        if (bottle.isColiding(enemy) && !enemyIsDead && !bottle.isBroken) {
            bottle.break();
            this.handleEnemyHitByBottle(enemy);
            this.playBottleBreakSound();
            this.scheduleObjectRemoval(bottle, this.throwableObjects, 300);
            if (!(enemy instanceof Endboss) || enemy.isDead()) {
                this.scheduleEnemyRemoval(enemy, 500);
            }
        }
    }

    handleEnemyHitByBottle(enemy) {
        if (enemy instanceof Endboss) {
            enemy.hitWithBottle();
        } else {
            enemy.die(true);
        }
    }

    playBottleBreakSound() {
        const breakSound = new Audio('../assets/audio/bottle_break.mp3');
        this.userInterface.registerAudioWithCategory(breakSound, 'objects');
        if (!this.userInterface.isMuted) {
            breakSound.volume = this.userInterface.objectsVolume / 10;
            breakSound.play();
        }
    }

    scheduleObjectRemoval(object, array, delay) {
        setTimeout(() => {
            const index = array.indexOf(object);
            if (index > -1) {
                array.splice(index, 1);
            }
        }, delay);
    }

    updateCooldown() {
        if (this.throwCooldown > 0) {
            this.throwCooldown -= (1000 / 60);
            if (this.throwCooldown < 0) this.throwCooldown = 0;
        }
    }

    drawCooldownCircle() {
        if (this.throwCooldown <= 0) return;
        const circleData = this.calculateCooldownCirclePosition();
        this.drawBackgroundCircle(circleData);
        this.drawProgressCircle(circleData);
        this.drawBottleImage(circleData);
        this.drawRemainingTime(circleData);
    }

    calculateCooldownCirclePosition() {
        const circleRadius = 25;
        const padding = 10;
        const offsetX = this.userInterface.settingsIconX + this.userInterface.settingsIconWidth / 2;
        const offsetY = this.userInterface.settingsIconY + this.userInterface.settingsIconHeight + padding + circleRadius;
        return {
            x: offsetX,
            y: offsetY,
            radius: circleRadius,
            progress: this.throwCooldown / this.maxThrowCooldown
        };
    }

    drawBackgroundCircle(data) {
        this.ctx.beginPath();
        this.ctx.arc(data.x, data.y, data.radius, 0, 2 * Math.PI);
        this.ctx.fillStyle = 'rgba(80, 80, 80, 0.7)';
        this.ctx.fill();
    }

    drawProgressCircle(data) {
        this.ctx.beginPath();
        this.ctx.moveTo(data.x, data.y);
        this.ctx.arc(
            data.x, data.y, data.radius,
            -Math.PI / 2,
            -Math.PI / 2 + (1 - data.progress) * 2 * Math.PI,
            false
        );
        this.ctx.lineTo(data.x, data.y);
        this.ctx.fillStyle = 'rgba(255, 140, 0, 0.7)';
        this.ctx.fill();
    }

    drawBottleImage(data) {
        if (this.cooldownImage.complete) {
            const bottleSize = data.radius * 2.4;
            this.ctx.drawImage(
                this.cooldownImage,
                data.x - bottleSize / 2,
                data.y - bottleSize / 2,
                bottleSize,
                bottleSize
            );
        }
    }

    drawRemainingTime(data) {
        const remainingTime = (this.throwCooldown / 1000).toFixed(1);
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillStyle = 'white';
        this.ctx.fillText(remainingTime + 's', data.x, data.y + data.radius + 15);
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawOptimizedGameWorld();
        this.drawUIElements();
        requestAnimationFrame(() => this.draw());
    }

    drawOptimizedGameWorld() {
        this.ctx.translate(this.camera_x, 0);
        const visibleObjects = this.getVisibleObjects(this.level.backgroundObjects);
        this.addObjectsToMap(visibleObjects);
        this.addToMap(this.character);
        const visibleClouds = this.getVisibleObjects(this.level.clouds);
        this.addObjectsToMap(visibleClouds);
        const visibleEnemies = this.getVisibleObjects(this.level.enemies);
        this.addObjectsToMap(visibleEnemies);
        const visibleCoins = this.getVisibleObjects(this.level.coins);
        this.addObjectsToMap(visibleCoins);
        const visibleBottles = this.getVisibleObjects(this.level.bottles);
        this.addObjectsToMap(visibleBottles);
        this.addObjectsToMap(this.throwableObjects);
        this.ctx.translate(-this.camera_x, 0);
    }

    getVisibleObjects(objects) {
        if (!objects || !Array.isArray(objects)) return [];
        const buffer = 150;
        const leftEdge = -this.camera_x - buffer;
        const rightEdge = leftEdge + this.canvas.width + 2 * buffer;
        return objects.filter(obj => {
            const objRightEdge = obj.x + obj.width;
            const objLeftEdge = obj.x;
            return objRightEdge > leftEdge && objLeftEdge < rightEdge;
        });
    }

    addObjectsToMap(objects) {
        if (!objects || !Array.isArray(objects)) return;
        objects.forEach((o) => {
            this.addToMap(o);
        });
    }

    addToMap(mo) {
        this.handleObjectDirection(mo, true);
        mo.draw(this.ctx);
        this.drawAdditionalElements(mo);
        mo.drawFrame(this.ctx);
        this.handleObjectDirection(mo, false);
    }

    handleObjectDirection(mo, beforeDraw) {
        const shouldFlip = (mo instanceof Character && mo.otherDirection) ||
            ((mo instanceof Chicken || mo instanceof smallChicken || mo instanceof Endboss) && !mo.otherDirection);

        if (shouldFlip) {
            beforeDraw ? this.flipImage(mo) : this.flipImageBack(mo);
        }
    }

    drawAdditionalElements(mo) {
        if (mo instanceof Chicken && mo.showHealthBar) {
            mo.drawHealthBar(this.ctx);
        }
    }

    flipImage(mo) {
        this.ctx.save();
        this.ctx.translate(mo.width, 0);
        this.ctx.scale(-1, 1);
        mo.x = mo.x * -1;
    }

    flipImageBack(mo) {
        mo.x = mo.x * -1;
        this.ctx.restore();
    }
}
