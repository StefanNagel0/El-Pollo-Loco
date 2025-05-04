/**
 * Represents a cloud object that moves across the game background.
 * Creates atmospheric effect by slowly drifting from right to left.
 * @class
 * @extends MovableObject
 */
class Cloud extends MovableObject {
    y = 10;
    height = 250;
    width = 500;

    /**
     * Creates a new cloud with the specified image and position.
     * @param {string} imagePath - Path to the cloud image file
     * @param {number} x - Horizontal position of the cloud
     */
    constructor(imagePath, x) {
        super().loadImage(imagePath || '../assets/img/5_background/layers/4_clouds/1.png');
        this.x = x || Math.random() * 500;
        this.animate();
    }

    /**
     * Animates the cloud by moving it continuously to the left.
     * Creates the effect of clouds drifting across the sky.
     */
    animate() {
        // Intervall speichern statt einfach nur setInterval verwenden
        this.animationIntervals = this.animationIntervals || [];
        this.animationIntervals.push(
            setInterval(() => {
                this.moveLeft();     
            }, 1000 / 60)
        ); 
    }

    /**
     * Clear all Animation-Intervalle of this object.
     * This is important to avoid memory leaks and ensure proper cleanup.
     * It should be called when the object is no longer needed or when the game is paused.
     */
    cleanupAnimations() {
        if (this.animationIntervals) {
            this.animationIntervals.forEach(interval => clearInterval(interval));
            this.animationIntervals = [];
        }
    }
}