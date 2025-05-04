/**
 * Manages cooldown mechanics for throwable objects in the El Pollo Loco game.
 * Handles timing, rendering, and visual effects for the cooldown system.
 * @class
 */
class WorldCooldownManager {
    /**
     * Creates a new WorldCooldownManager instance.
     * @param {World} world - Reference to the parent world object
     */
    constructor(world) {
        this.world = world;
        this.cooldownImage = new Image();
        this.cooldownImage.src = '../assets/img/6_salsa_bottle/salsa_bottle.png';
        this.throwCooldown = 0;
        this.maxThrowCooldown = 2250;
        this.canThrow = true;
    }

    /**
     * Starts the cooldown timer after throwing a bottle.
     * Prevents rapid bottle throwing by enforcing a delay.
     */
    startThrowCooldown() {
        this.canThrow = false;
        this.throwCooldown = this.maxThrowCooldown;
        setTimeout(() => {
            this.canThrow = true;
            this.throwCooldown = 0;
        }, this.maxThrowCooldown);
    }

    /**
     * Updates the bottle throw cooldown timer.
     * Decreases the cooldown timer during each game loop iteration.
     */
    updateCooldown() {
        if (this.throwCooldown > 0) {
            this.throwCooldown -= (1000 / 60);
            if (this.throwCooldown < 0) this.throwCooldown = 0;
        }
    }

    /**
     * Draws the cooldown circle indicator for bottle throws.
     * Shows a circular progress indicator with remaining time.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     */
    drawCooldownCircle(ctx) {
        if (this.throwCooldown <= 0) return;
        const circleData = this.calculateCooldownCirclePosition();
        this.drawBackgroundCircle(ctx, circleData);
        this.drawProgressCircle(ctx, circleData);
        this.drawBottleImage(ctx, circleData);
        this.drawRemainingTime(ctx, circleData);
    }

    /**
     * Calculates position and dimensions for the cooldown circle.
     * @returns {Object} Circle position, radius, and progress data
     */
    calculateCooldownCirclePosition() {
        const circleRadius = 25;
        const padding = 28;
        const bottleStatusBarY = this.world.statusBar.y_bottles;
        const bottleStatusBarHeight = this.world.statusBar.height;
        return {
            x: circleRadius + padding,
            y: bottleStatusBarY + bottleStatusBarHeight + padding,
            radius: circleRadius,
            progress: this.throwCooldown / this.maxThrowCooldown
        };
    }

    /**
     * Draws the background circle for the cooldown indicator.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     * @param {Object} data - Circle position and dimension data
     */
    drawBackgroundCircle(ctx, data) {
        ctx.beginPath();
        ctx.arc(data.x, data.y, data.radius, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(80, 80, 80, 0.7)';
        ctx.fill();
    }

    /**
     * Draws the progress circle overlay for the cooldown indicator.
     * Shows a diminishing segment as the cooldown progresses.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     * @param {Object} data - Circle position and progress data
     */
    drawProgressCircle(ctx, data) {
        ctx.beginPath();
        ctx.moveTo(data.x, data.y);
        ctx.arc(
            data.x, data.y, data.radius,
            -Math.PI / 2,
            -Math.PI / 2 + (1 - data.progress) * 2 * Math.PI,
            false
        );
        ctx.lineTo(data.x, data.y);
        ctx.fillStyle = 'rgba(255, 140, 0, 0.7)';
        ctx.fill();
    }

    /**
     * Draws the bottle image in the center of the cooldown circle.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     * @param {Object} data - Circle position and dimension data
     */
    drawBottleImage(ctx, data) {
        if (this.cooldownImage.complete) {
            const bottleSize = data.radius * 2.4;
            ctx.drawImage(
                this.cooldownImage,
                data.x - bottleSize / 2,
                data.y - bottleSize / 2,
                bottleSize,
                bottleSize
            );
        }
    }

    /**
     * Draws the remaining time text below the cooldown circle.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     * @param {Object} data - Circle position and countdown data
     */
    drawRemainingTime(ctx, data) {
        const remainingTime = (this.throwCooldown / 1000).toFixed(1);
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'white';
        ctx.fillText(remainingTime + 's', data.x, data.y + data.radius + 15);
    }
}