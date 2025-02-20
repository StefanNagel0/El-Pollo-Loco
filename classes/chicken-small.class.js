class smallChicken extends MovableObject{
    y = 370;
    height = 60;
    width = 40;
    IMAGES_WALKING = [
        '../assets/img/3_enemies_chicken/chicken_small/1_walk/1_w.png',
        '../assets/img/3_enemies_chicken/chicken_small/1_walk/2_w.png',
        '../assets/img/3_enemies_chicken/chicken_small/1_walk/3_w.png'
    ];

    constructor(){
        super().loadImage('../assets/img/3_enemies_chicken/chicken_small/1_walk/1_w.png');

        this.x = 700 + Math.random() * 500;
        this.loadImages(this.IMAGES_WALKING);
        this.speed = 0.15 + Math.random() * 0.25;
        this.animate();
    }

    animate() {
        this.moveLeft();
        setInterval(() => {
            this.playAnimation(this.IMAGES_WALKING);
        }, 200);

    }


}