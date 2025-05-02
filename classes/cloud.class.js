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
        setInterval(() => {
            this.moveLeft();     
        }, 1000 / 60); 
    }
}