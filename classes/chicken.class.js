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
        this.initializePosition();
        this.loadImages(this.IMAGES_WALKING);
        this.speed = 2;
        this.otherDirection = Math.random() < 0.5; // Zufällige Richtung
        this.setRandomDirectionChangeTime();
        this.animate();
    }

    setRandomDirectionChangeTime() {
        this.changeDirectionTime = new Date().getTime() + Math.random() * 4000 + 2000; // 2-6 Sekunden
    }

    animate() {
        this.setupMovementAnimation();
        this.setupWalkingAnimation();
    }

    setupMovementAnimation() {
        setInterval(() => {
            if (!this.isDead && (!this.world || !this.world.isPaused)) {
                this.handleMovement();
            }
        }, 1000 / 60);
    }

    setupWalkingAnimation() {
        setInterval(() => {
            if (!this.isDead && (!this.world || !this.world.isPaused)) {
                this.playAnimation(this.IMAGES_WALKING);
            }
        }, 200);
    }

    die(fromBottle = false) {
        if (fromBottle) {
            this.handleDeathFromBottle();
        } else {
            this.handleDeathFromStomp();
        }
    }

    handleDeathFromBottle() {
        this.health = 0;
        this.isDead = true;
        this.loadImage(this.IMAGE_DEAD);
        this.speed = 0;
        this.showHealthBar = false; // Verstecke Lebensbalken bei Tod
    }

    handleDeathFromStomp() {
        this.health -= 1;
        if (this.health <= 0) {
            this.markAsDead();
        } else {
            this.handleHurtState();
        }
    }

    markAsDead() {
        this.isDead = true;
        this.loadImage(this.IMAGE_DEAD);
        this.speed = 0;
        this.showHealthBar = false; // Verstecke Lebensbalken bei Tod
    }

    handleHurtState() {
        this.showHealthBar = true; // Zeige Lebensbalken
        this.speed = this.speed * 3; // Reduziere Geschwindigkeit auf 70% nach Treffer
    }

    drawHealthBar(ctx) {
        if (this.showHealthBar && this.health > 0) {
            this.drawHealthBarBackground(ctx);
            this.drawHealthBarForeground(ctx);
        }
    }

    drawHealthBarBackground(ctx) {
        let barWidth = 60;
        let barHeight = 10;
        let barX = this.x + (this.width - barWidth) / 2;
        let barY = this.y - barHeight - 5;

        ctx.fillStyle = 'grey';
        ctx.fillRect(barX, barY, barWidth, barHeight);
    }

    drawHealthBarForeground(ctx) {
        let barWidth = 60;
        let barHeight = 10;
        let barX = this.x + (this.width - barWidth) / 2;
        let barY = this.y - barHeight - 5;

        let healthPercentage = this.health / 2; // 2 ist die maximale Gesundheit
        ctx.fillStyle = 'red';
        ctx.fillRect(barX, barY, barWidth * healthPercentage, barHeight);
    }
}
