class StatusBar extends DrawableObject {
    IMAGES_ENERGY = [
        '../assets/img/7_statusbars/1_statusbar/2_statusbar_health/green/0.png',
        '../assets/img/7_statusbars/1_statusbar/2_statusbar_health/green/20.png',
        '../assets/img/7_statusbars/1_statusbar/2_statusbar_health/green/40.png',
        '../assets/img/7_statusbars/1_statusbar/2_statusbar_health/green/60.png',
        '../assets/img/7_statusbars/1_statusbar/2_statusbar_health/green/80.png',
        '../assets/img/7_statusbars/1_statusbar/2_statusbar_health/green/100.png'
    ];
    IMAGES_COINS = [
        '../assets/img/7_statusbars/1_statusbar/1_statusbar_coin/orange/0.png',
        '../assets/img/7_statusbars/1_statusbar/1_statusbar_coin/orange/20.png',
        '../assets/img/7_statusbars/1_statusbar/1_statusbar_coin/orange/40.png',
        '../assets/img/7_statusbars/1_statusbar/1_statusbar_coin/orange/60.png',
        '../assets/img/7_statusbars/1_statusbar/1_statusbar_coin/orange/80.png',
        '../assets/img/7_statusbars/1_statusbar/1_statusbar_coin/orange/100.png',
    ];
    IMAGES_BOTTLES = [
        '../assets/img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/0.png',
        '../assets/img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/20.png',
        '../assets/img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/40.png',
        '../assets/img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/60.png',
        '../assets/img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/80.png',
        '../assets/img/7_statusbars/1_statusbar/3_statusbar_bottle/blue/100.png',
    ]

    percentage_energy = 100;
    percentage_coins = 0;
    percentage_bottles = 0;

    constructor() {
        super();
        this.loadImages(this.IMAGES_ENERGY);
        this.loadImages(this.IMAGES_COINS);
        this.loadImages(this.IMAGES_BOTTLES);

        this.x_energy = 20;
        this.y_energy = 0;
        this.width = 200;
        this.height = 60;

        this.x_coins = 20;
        this.y_coins = 40;

        this.x_bottles = 20;
        this.y_bottles = 85;

        this.img_energy = new Image();
        this.img_coins = new Image();
        this.img_bottles = new Image();

        this.updateStatusBars();
    }

    setEnergyPercentage(percentage) {
        this.percentage_energy = percentage;
        this.updateStatusBars();
    }

    setCoinsPercentage(percentage) {
        this.percentage_coins = percentage;
        this.updateStatusBars(); 
    }

    setBottlesPercentage(percentage) {
        this.percentage_bottles = percentage;
        this.updateStatusBars();
    }

    updateStatusBars() {
        let path_energy = this.IMAGES_ENERGY[this.resolveImageIndex(this.percentage_energy)];
        let path_coins = this.IMAGES_COINS[this.resolveImageIndex(this.percentage_coins)];
        let path_bottles = this.IMAGES_BOTTLES[this.resolveImageIndex(this.percentage_bottles)];

        if (this.imageCache[path_energy]) {
            this.img_energy = this.imageCache[path_energy];
        }

        if (this.imageCache[path_coins]) {
            this.img_coins = this.imageCache[path_coins];
        }

        if (this.imageCache[path_bottles]) {
            this.img_bottles = this.imageCache[path_bottles];
        }
    }

    resolveImageIndex(percentage) {
        if (percentage == 100) {
            return 5;
        } else if (percentage >= 80) {
            return 4;
        } else if (percentage >= 60) {
            return 3;
        } else if (percentage >= 40) {
            return 2;
        } else if (percentage >= 20) {
            return 1;
        } else {
            return 0;
        }
    }

    draw(ctx) {
        if (this.img_energy && this.img_energy.complete) {
            ctx.drawImage(this.img_energy, this.x_energy, this.y_energy, this.width, this.height);
        }

        if (this.img_coins && this.img_coins.complete) {
            ctx.drawImage(this.img_coins, this.x_coins, this.y_coins, this.width, this.height);
        }

        if (this.img_bottles && this.img_bottles.complete) {
            ctx.drawImage(this.img_bottles, this.x_bottles, this.y_bottles, this.width, this.height);
        }
    }
}