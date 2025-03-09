class ThrowableObject extends MovableObject {
    constructor(x, y) {
        super();
        this.x = x;
        this.y = y;
        this.loadImage('../assets/img/6_salsa_bottle/salsa_bottle.png');
        this.height = 80;
        this.width = 60;
        this.throw();
    }

    throw(){
        this.speedY = 30;
        this.applyGravity();
        setInterval(() => {
            this.x += 25;
        }, 25);
    }
}