/**
 * Represents a background object in the game that extends MovableObject.
 * These are static elements that create the game's environment and scenery.
 * @class
 * @extends MovableObject
 */
class BackgroundObject extends MovableObject{
    width = 720;
    height = 480;
    
    /**
     * Creates a new background object with the specified image and x-position.
     * The y-position is automatically calculated to place the object at the bottom of the canvas.
     * 
     * @param {string} imagePath - Path to the image file for this background object
     * @param {number} x - Horizontal position of the background object
     */
    constructor(imagePath, x){
        super().loadImage(imagePath);
        this.x = x;
        this.y = 480 - this.height;
    }
}