class Chicken extends MovableObject{
    y = 350;
    height = 80;
    width = 60;
    IMAGES_WALKING = [
        '../assets/img/3_enemies_chicken/chicken_normal/1_walk/1_w.png',
        '../assets/img/3_enemies_chicken/chicken_normal/1_walk/2_w.png',
        '../assets/img/3_enemies_chicken/chicken_normal/1_walk/3_w.png'
    ];

    constructor(){
        super().loadImage('../assets/img/3_enemies_chicken/chicken_normal/1_walk/1_w.png');

        this.x = 700 + Math.random() * 500;
        this.loadImages(this.IMAGES_WALKING);
        this.speed = 0.15 + Math.random() * 0.25;
        this.animate();
    }

    animate() {
        setInterval(() =>{
                this.moveLeft();     
            },1000 / 60); 

        setInterval(() => {
            this.playAnimation(this.IMAGES_WALKING);
        }, 200);

    }

}