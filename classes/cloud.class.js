class Cloud extends MovableObject{
    y = 10;
    height = 250;
    width = 500;

    constructor(){
        super().loadImage('../assets/img/5_background/layers/4_clouds/1.png');

        this.x =  Math.random() * 500;
        this.animate();
        
    }

    animate(){
        setInterval(() =>{
            this.moveLeft();     
        },1000 / 60); 
    }
}