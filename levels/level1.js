/**
 * Defines and initializes level 1 of El Pollo Loco.
 * Contains the level layout, enemies, background elements, and collectible items.
 * @file level1.js
 */

let level1;

/**
 * Initializes the first level of the game.
 * Creates all enemies, clouds, background objects, coins and bottles.
 * Sets up the entire game world environment for level 1.
 */
function initLevel1() {
    try {
        resetStaticVariables();
        level1 = new Level(
            createEnemies(),
            createClouds(),
            createBackgroundObjects(),
            Coin.generateCoins(45),
            createBottles()
        );
    } catch (error) {
        window.location.reload();
        throw error;
    }
}

function resetStaticVariables() {
    if (typeof MovableObject !== 'undefined' && MovableObject.placedObjects) {
        MovableObject.placedObjects = [];
    }
}

function createEnemies() {
    return [
        new Chicken(),
        new Chicken(),
        new Chicken(),
        new smallChicken(),
        new smallChicken(),
        new smallChicken(),
        new Endboss(),
    ];
}

function createClouds() {
    const clouds = [];
    const cloudImages = ['../assets/img/5_background/layers/4_clouds/1.png', '../assets/img/5_background/layers/4_clouds/2.png'];
    for (let i = 0; i < 12; i++) {
        const imageIndex = i % 2;
        const xPosition = i * 800 + 100;
        clouds.push(new Cloud(cloudImages[imageIndex], xPosition));
    }
    return clouds;
}

function createBottles() {
    const bottles = [];
    for (let i = 0; i < 10; i++) {
        bottles.push(new Bottles());
    }
    return bottles;
}

function createBackgroundObjects() {
    const backgrounds = [];
    const tileWidth = 719;
    backgrounds.push(...createBackgroundSection(-1, tileWidth));
    for (let i = 0; i <= 11; i++) {
        backgrounds.push(...createBackgroundSection(i, tileWidth));
    }
    return backgrounds;
}

function createBackgroundSection(index, width) {
    const section = [];
    const x = index * width;
    const layerType = index % 2 === 0 ? 1 : 2;
    section.push(new BackgroundObject(`../assets/img/5_background/layers/air.png`, x));
    section.push(new BackgroundObject(`../assets/img/5_background/layers/3_third_layer/${layerType}.png`, x));
    section.push(new BackgroundObject(`../assets/img/5_background/layers/2_second_layer/${layerType}.png`, x));
    section.push(new BackgroundObject(`../assets/img/5_background/layers/1_first_layer/${layerType}.png`, x));
    return section;
}
