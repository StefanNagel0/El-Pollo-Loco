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
        if (this.shouldDrawFrames()) {
            this.drawOuterFrame(ctx);
            this.drawCollisionFrame(ctx);
            this.drawSpecificFrames(ctx);
        }
    }

    shouldDrawFrames() {
        return this instanceof Character || this instanceof Chicken || this instanceof smallChicken;
    }

    drawOuterFrame(ctx) {
        this.drawRect(ctx, this.x, this.y, this.width, this.height, 'blue', 4);
    }

    drawCollisionFrame(ctx) {
        const offsetX = this.offset?.left ?? 0;
        const offsetY = this.offset?.top ?? 0;
        const offsetWidth = (this.offset?.left ?? 0) + (this.offset?.right ?? 0);
        const offsetHeight = (this.offset?.top ?? 0) + (this.offset?.bottom ?? 0);
        this.drawRect(ctx, this.x + offsetX, this.y + offsetY, this.width - offsetWidth, this.height - offsetHeight, 'red', 2);
    }

    drawSpecificFrames(ctx) {
        if ((this instanceof Chicken || this instanceof smallChicken) && this.stompableAreaHeight) {
            this.drawStompableFrame(ctx);
        }
        if (this instanceof Chicken && this.drawHealthBar) {
            this.drawHealthBar(ctx);
        }
    }

    drawStompableFrame(ctx) {
        const offsetX = this.offset?.left ?? 0;
        const offsetY = this.offset?.top ?? 0;
        const offsetWidth = (this.offset?.left ?? 0) + (this.offset?.right ?? 0);
        this.drawRect(ctx, this.x + offsetX, this.y + offsetY, this.width - offsetWidth, this.stompableAreaHeight, 'green', 2);
    }

    drawRect(ctx, x, y, width, height, color, lineWidth) {
        ctx.beginPath();
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = color;
        ctx.rect(x, y, width, height);
        ctx.stroke();
    }
}