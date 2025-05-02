let level1;

function initLevel1() {
    
level1 = new Level(
    [
        new Chicken(),
        new Chicken(),
        new Chicken(),
        new smallChicken(),
        new smallChicken(),
        new smallChicken(),
        new Endboss(),
    ],
    [
        new Cloud('../assets/img/5_background/layers/4_clouds/1.png', 100),
        new Cloud('../assets/img/5_background/layers/4_clouds/2.png', 800),
        new Cloud('../assets/img/5_background/layers/4_clouds/1.png', 1600),
        new Cloud('../assets/img/5_background/layers/4_clouds/2.png', 2400),
        new Cloud('../assets/img/5_background/layers/4_clouds/1.png', 3200),
        new Cloud('../assets/img/5_background/layers/4_clouds/2.png', 4000),
        new Cloud('../assets/img/5_background/layers/4_clouds/1.png', 4800),
        new Cloud('../assets/img/5_background/layers/4_clouds/2.png', 5600),
        new Cloud('../assets/img/5_background/layers/4_clouds/1.png', 6400),
        new Cloud('../assets/img/5_background/layers/4_clouds/2.png', 7200),
        new Cloud('../assets/img/5_background/layers/4_clouds/1.png', 8000),
        new Cloud('../assets/img/5_background/layers/4_clouds/2.png', 8800),
    ],
    [
        new BackgroundObject('../assets/img/5_background/layers/air.png', -719,),
        new BackgroundObject('../assets/img/5_background/layers/3_third_layer/2.png', -719),
        new BackgroundObject('../assets/img/5_background/layers/2_second_layer/2.png', -719),
        new BackgroundObject('../assets/img/5_background/layers/1_first_layer/2.png', -719),

        new BackgroundObject('../assets/img/5_background/layers/air.png', 0),
        new BackgroundObject('../assets/img/5_background/layers/3_third_layer/1.png', 0),
        new BackgroundObject('../assets/img/5_background/layers/2_second_layer/1.png', 0),
        new BackgroundObject('../assets/img/5_background/layers/1_first_layer/1.png', 0),
        new BackgroundObject('../assets/img/5_background/layers/air.png', 719,),
        new BackgroundObject('../assets/img/5_background/layers/3_third_layer/2.png', 719),
        new BackgroundObject('../assets/img/5_background/layers/2_second_layer/2.png', 719),
        new BackgroundObject('../assets/img/5_background/layers/1_first_layer/2.png', 719),

        new BackgroundObject('../assets/img/5_background/layers/air.png', 719 *2),
        new BackgroundObject('../assets/img/5_background/layers/3_third_layer/1.png', 719 *2),
        new BackgroundObject('../assets/img/5_background/layers/2_second_layer/1.png', 719 *2),
        new BackgroundObject('../assets/img/5_background/layers/1_first_layer/1.png', 719 *2),
        new BackgroundObject('../assets/img/5_background/layers/air.png', 719 *3,),
        new BackgroundObject('../assets/img/5_background/layers/3_third_layer/2.png', 719 *3),
        new BackgroundObject('../assets/img/5_background/layers/2_second_layer/2.png', 719 *3),
        new BackgroundObject('../assets/img/5_background/layers/1_first_layer/2.png', 719 *3),
        
        new BackgroundObject('../assets/img/5_background/layers/air.png', 719 *4),
        new BackgroundObject('../assets/img/5_background/layers/3_third_layer/1.png', 719 *4),
        new BackgroundObject('../assets/img/5_background/layers/2_second_layer/1.png', 719 *4),
        new BackgroundObject('../assets/img/5_background/layers/1_first_layer/1.png', 719 *4),
        new BackgroundObject('../assets/img/5_background/layers/air.png', 719 *5,),
        new BackgroundObject('../assets/img/5_background/layers/3_third_layer/2.png', 719 *5),
        new BackgroundObject('../assets/img/5_background/layers/2_second_layer/2.png', 719 *5),
        new BackgroundObject('../assets/img/5_background/layers/1_first_layer/2.png', 719 *5),

        new BackgroundObject('../assets/img/5_background/layers/air.png', 719 *6),
        new BackgroundObject('../assets/img/5_background/layers/3_third_layer/1.png', 719 *6),
        new BackgroundObject('../assets/img/5_background/layers/2_second_layer/1.png', 719 *6),
        new BackgroundObject('../assets/img/5_background/layers/1_first_layer/1.png', 719 *6),
        new BackgroundObject('../assets/img/5_background/layers/air.png', 719 *7,),
        new BackgroundObject('../assets/img/5_background/layers/3_third_layer/2.png', 719 *7),
        new BackgroundObject('../assets/img/5_background/layers/2_second_layer/2.png', 719 *7),
        new BackgroundObject('../assets/img/5_background/layers/1_first_layer/2.png', 719 *7),

        new BackgroundObject('../assets/img/5_background/layers/air.png', 719 *8),
        new BackgroundObject('../assets/img/5_background/layers/3_third_layer/1.png', 719 *8),
        new BackgroundObject('../assets/img/5_background/layers/2_second_layer/1.png', 719 *8),
        new BackgroundObject('../assets/img/5_background/layers/1_first_layer/1.png', 719 *8),
        new BackgroundObject('../assets/img/5_background/layers/air.png', 719 *9,),
        new BackgroundObject('../assets/img/5_background/layers/3_third_layer/2.png', 719 *9),
        new BackgroundObject('../assets/img/5_background/layers/2_second_layer/2.png', 719 *9),
        new BackgroundObject('../assets/img/5_background/layers/1_first_layer/2.png', 719 *9),

        new BackgroundObject('../assets/img/5_background/layers/air.png', 719 *10),
        new BackgroundObject('../assets/img/5_background/layers/3_third_layer/1.png', 719 *10),
        new BackgroundObject('../assets/img/5_background/layers/2_second_layer/1.png', 719 *10),
        new BackgroundObject('../assets/img/5_background/layers/1_first_layer/1.png', 719 *10),
        new BackgroundObject('../assets/img/5_background/layers/air.png', 719 *11,),
        new BackgroundObject('../assets/img/5_background/layers/3_third_layer/2.png', 719 *11),
        new BackgroundObject('../assets/img/5_background/layers/2_second_layer/2.png', 719 *11),
        new BackgroundObject('../assets/img/5_background/layers/1_first_layer/2.png', 719 *11),
    ],
    Coin.generateCoins(45),
    [
        new Bottles(),
        new Bottles(),
        new Bottles(),
        new Bottles(),
        new Bottles(),
        new Bottles(),
        new Bottles(),
        new Bottles(),
        new Bottles(),
        new Bottles()
    ]

);
}
