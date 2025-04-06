class DrawableObject {
    img;
    imageCache = {};
    currentImage = 0;
    x = 120;
    y = 280;
    height = 150;
    width = 100;



    loadImage(path) {
        this.img = new Image();
        this.img.src = path;
    }

    loadImages(arr) {
        arr.forEach((path) => {
            let img = new Image();
            img.src = path;
            this.imageCache[path] = img;
        })
    }

    draw(ctx) {
        ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    }

    drawFrame(ctx) {
        if (this instanceof Character || this instanceof Chicken || this instanceof smallChicken) {
            // Blauer Rahmen (originale Bounding Box)
            ctx.beginPath();
            ctx.lineWidth = 4;
            ctx.strokeStyle = 'blue';
            ctx.rect(this.x, this.y, this.width, this.height);
            ctx.stroke();
    
            // Roter Rahmen (mit Offset angepasst)
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'red';
            ctx.rect(
                this.x + this.offset.left,
                this.y + this.offset.top,
                this.width - this.offset.left - this.offset.right,
                this.height - this.offset.top - this.offset.bottom
            );
            ctx.stroke();
    
            // Grüner Rahmen (stompbarer Bereich bei Chicken)
            if ((this instanceof Chicken || this instanceof smallChicken) && this.stompableAreaHeight) {
                ctx.beginPath();
                ctx.lineWidth = 2;
                ctx.strokeStyle = 'green';
                ctx.rect(
                    this.x + this.offset.left,
                    this.y + this.offset.top,
                    this.width - this.offset.left - this.offset.right,
                    this.stompableAreaHeight
                );
                ctx.stroke();
            }
        }
    }
}