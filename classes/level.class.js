class Level{
    enemies;
    clouds;
    coins;
    bottles;
    backgroundObjects;
    level_end_x = 6500; 

    constructor(enemies, clouds, backgroundObjects, coins, bottles){
        this.enemies = enemies;
        this.clouds = clouds;
        this.backgroundObjects = backgroundObjects;
        this.coins = coins;
        this.bottles = bottles;
    }
}