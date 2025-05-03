/**
 * Represents a game level with all its components.
 * Contains enemies, clouds, background objects, collectible items and boundaries.
 * @class
 */
class Level{
    enemies;
    clouds;
    coins;
    bottles;
    backgroundObjects;
    level_end_x = 6500; 

        /**
     * Creates a new level with the specified components.
     * @param {Array<MovableObject>} enemies - The enemies in this level
     * @param {Array<Cloud>} clouds - The clouds in this level
     * @param {Array<BackgroundObject>} backgroundObjects - The background objects in this level
     * @param {Array<Coin>} coins - The coins in this level
     * @param {Array<Bottles>} bottles - The bottles in this level
     */
    constructor(enemies, clouds, backgroundObjects, coins, bottles){
        this.enemies = enemies;
        this.clouds = clouds;
        this.backgroundObjects = backgroundObjects;
        this.coins = coins;
        this.bottles = bottles;
    }
}