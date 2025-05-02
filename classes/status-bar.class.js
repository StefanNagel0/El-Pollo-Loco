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
    current_energy = 100;
    max_energy = 100;
    current_coins = 0;
    max_coins = 45;
    current_bottles = 0;
    max_bottles = 10;

    constructor() {
        super();
        this.loadImages(this.IMAGES_ENERGY);
        this.loadImages(this.IMAGES_COINS);
        this.loadImages(this.IMAGES_BOTTLES);
        this.x_energy = 20;
        this.y_energy = 10;
        this.width = 170;
        this.height = 58;
        this.x_coins = 20;
        this.y_coins = 60;
        this.x_bottles = 20;
        this.y_bottles = 110;
        this.img_energy = new Image();
        this.img_coins = new Image();
        this.img_bottles = new Image();

        this.updateStatusBars();
    }

    setEnergyPercentage(percentage) {
        this.percentage_energy = percentage;
        this.current_energy = percentage;
        this.updateStatusBars();
    }

    setCoinsPercentage(percentage) {
        this.percentage_coins = percentage;
        this.current_coins = Math.min(Math.ceil(percentage * 45 / 100), this.max_coins); 
        this.updateStatusBars(); 
    }

    setBottlesPercentage(percentage) {
        this.percentage_bottles = percentage;
        this.current_bottles = Math.min(Math.ceil(percentage / 10), this.max_bottles); // 10 Flaschen maximal
        this.updateStatusBars();
    }

    setCoinsCount(count) {
        this.current_coins = count;
        const coinsPerLevel = 45 / 5;
        const level = Math.min(Math.floor(count / coinsPerLevel), 5);
        this.percentage_coins = level * 20;
        this.updateStatusBars();
    }

    setBottlesCount(count) {
        this.current_bottles = count;
        this.percentage_bottles = Math.min(count * 10, 100);
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
            this.drawStatusText(ctx, `${this.current_energy} / ${this.max_energy}`, this.x_energy + this.width - 80, this.y_energy + 46);
        }
        if (this.img_coins && this.img_coins.complete) {
            ctx.drawImage(this.img_coins, this.x_coins, this.y_coins, this.width, this.height);
            this.drawStatusText(ctx, `${this.current_coins} / ${this.max_coins}`, this.x_coins + this.width - 60, this.y_coins + 46);
        }
        if (this.img_bottles && this.img_bottles.complete) {
            ctx.drawImage(this.img_bottles, this.x_bottles, this.y_bottles, this.width, this.height);
            this.drawStatusText(ctx, `${this.current_bottles} / ${this.max_bottles}`, this.x_bottles + this.width - 55, this.y_bottles + 46);
        }
    }

    drawStatusText(ctx, text, x, y) {
        ctx.font = '16px Arial';
        ctx.fillStyle = 'black';
        ctx.fillText(text, x, y);
    }
}