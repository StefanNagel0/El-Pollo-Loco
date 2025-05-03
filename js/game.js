/**
 * Main game initialization and control script for El Pollo Loco.
 * Handles game startup, keyboard events, and menu management.
 * @file game.js
 */

let canvas;
let world;
let keyboard = new Keyboard();
let mainMenu;

/**
 * Initializes the game.
 * Setups up UI elements and determines whether to show the main menu
 * or directly start the game based on localStorage settings.
 */
function init() {
    canvas = document.getElementById("canvas");
    initializeUIElements();
    const directStart = localStorage.getItem('elPolloLoco_startGame') === 'true';
    if (directStart) {
        handleDirectStart();
    } else {
        showMainMenu();
    }
}

/**
 * Initializes UI elements needed for the game interface.
 * Currently sets the custom confirmation dialog to hidden.
 */
function initializeUIElements() {
    const customConfirm = document.getElementById('custom-confirm');
    if (customConfirm) customConfirm.classList.add('d-none');
}

/**
 * Handles direct game start without showing the main menu.
 * Used when restarting the game or when triggered by a menu action.
 * Clears localStorage flags, hides menu elements, and initializes the game.
 */
function handleDirectStart() {
    localStorage.removeItem('elPolloLoco_startGame');
    localStorage.removeItem('elPolloLoco_restartTimestamp');
    const mainMenuElement = document.getElementById('main-menu');
    if (mainMenuElement) {
        mainMenuElement.classList.add('d-none');
        mainMenuElement.style.display = 'none';
    }
    initLevel1();
    initGame();
    window.world.isPaused = false;
}

/**
 * Shows the main menu.
 * Displays the menu interface and initializes the MainMenu class.
 */
function showMainMenu() {
    const mainMenuElement = document.getElementById('main-menu');
    if (mainMenuElement) {
        mainMenuElement.classList.remove('d-none');
        mainMenuElement.style.display = 'flex';
    }
    mainMenu = new MainMenu();
}

/**
 * Initializes the game world.
 * Creates a new World instance with the canvas and keyboard input.
 * Also sets a global reference to the world for easier access.
 */
function initGame() {
    world = new World(canvas, keyboard);
    window.world = world;
}

/**
 * Mapping of key codes to actions.
 * Each entry defines the keyboard property to modify and the values for keydown/keyup.
 * @type {Object.<number, {property: string, down: boolean, up: boolean}>}
 */
const KEY_ACTIONS = {
    39: { property: 'RIGHT', down: true, up: false },
    37: { property: 'LEFT', down: true, up: false },
    40: { property: 'DOWN', down: true, up: false },
    38: { property: 'UP', down: true, up: false },
    32: { property: 'SPACE', down: true, up: false },
    68: { property: 'D', down: true, up: false }
};

/**
 * Event listener for keydown events.
 * Updates keyboard state when keys are pressed.
 * @param {KeyboardEvent} event - The keydown event
 */
window.addEventListener('keydown', (event) => {
    const action = KEY_ACTIONS[event.keyCode];
    if (action) keyboard[action.property] = action.down;
});

/**
 * Event listener for keyup events.
 * Updates keyboard state when keys are released.
 * @param {KeyboardEvent} event - The keyup event
 */
window.addEventListener('keyup', (event) => {
    const action = KEY_ACTIONS[event.keyCode];
    if (action) keyboard[action.property] = action.up;
});