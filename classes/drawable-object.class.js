/**
 * Base class for all drawable objects in the game.
 * Provides functionality for loading, drawing, and animating game elements.
 * @class
 */
class DrawableObject {
    img;
    imageCache = {};
    currentImage = 0;
    x = 120;
    y = 280;
    height = 150;
    width = 100;

    /**
     * Loads a single image from the specified path.
     * @param {string} path - Path to the image file
     */
    loadImage(path) {
        this.img = new Image();
        this.img.src = path;
    }

    /**
     * Preloads multiple images and stores them in the image cache.
     * Used for animation sequences.
     * @param {string[]} arr - Array of image paths to load
     */
    loadImages(arr) {
        arr.forEach((path) => {
            let img = new Image();
            img.src = path;
            this.imageCache[path] = img;
        })
    }

    /**
     * Draws the object's current image on the canvas.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     */
    draw(ctx) {
        ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    }

    /**
     * Draws debugging frames around the object if appropriate.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     */
    drawFrame(ctx) {
        if (this.shouldDrawFrames()) {
            this.drawOuterFrame(ctx);
            this.drawCollisionFrame(ctx);
            this.drawSpecificFrames(ctx);
        }
    }

    /**
     * Determines if debug frames should be drawn for this object.
     * @returns {boolean} True if frames should be drawn
     */
    shouldDrawFrames() {
        return this instanceof Character || this instanceof Chicken || this instanceof smallChicken;
    }

    /**
     * Draws the outer blue frame around the entire object.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     */
    drawOuterFrame(ctx) {
        this.drawRect(ctx, this.x, this.y, this.width, this.height, 'blue', 4);
    }

    /**
     * Draws the collision frame (adjusted for offset) in red.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     */
    drawCollisionFrame(ctx) {
        const offsetX = this.offset?.left ?? 0;
        const offsetY = this.offset?.top ?? 0;
        const offsetWidth = (this.offset?.left ?? 0) + (this.offset?.right ?? 0);
        const offsetHeight = (this.offset?.top ?? 0) + (this.offset?.bottom ?? 0);
        this.drawRect(ctx, this.x + offsetX, this.y + offsetY, this.width - offsetWidth, this.height - offsetHeight, 'red', 2);
    }

    /**
     * Draws specialized frames for specific object types.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     */
    drawSpecificFrames(ctx) {
        if ((this instanceof Chicken || this instanceof smallChicken) && this.stompableAreaHeight) {
            this.drawStompableFrame(ctx);
        }
        if (this instanceof Chicken && this.drawHealthBar) {
            this.drawHealthBar(ctx);
        }
    }

    /**
     * Draws the green stompable area frame for enemies.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     */
    drawStompableFrame(ctx) {
        const offsetX = this.offset?.left ?? 0;
        const offsetY = this.offset?.top ?? 0;
        const offsetWidth = (this.offset?.left ?? 0) + (this.offset?.right ?? 0);
        this.drawRect(ctx, this.x + offsetX, this.y + offsetY, this.width - offsetWidth, this.stompableAreaHeight, 'green', 2);
    }

    /**
     * Utility function to draw rectangular frames.
     * Currently configured to draw transparent frames (for development).
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
     * @param {number} x - X-coordinate of the rectangle
     * @param {number} y - Y-coordinate of the rectangle
     * @param {number} width - Width of the rectangle
     * @param {number} height - Height of the rectangle
     * @param {string} color - Color of the rectangle (currently set transparent)
     * @param {number} lineWidth - Width of the rectangle border
     */
    drawRect(ctx, x, y, width, height, color, lineWidth) {
        const originalColor = color;
        const transparentColor = 'rgba(0, 0, 0, 0)';
        
        ctx.beginPath();
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = transparentColor;
        ctx.rect(x, y, width, height);
        ctx.stroke();
    }
}