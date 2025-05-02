let canvas;
let world;
let keyboard = new Keyboard();
let mainMenu;

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

function initializeUIElements() {
    const customConfirm = document.getElementById('custom-confirm');
    if (customConfirm) customConfirm.classList.add('d-none');
}

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

function showMainMenu() {
    const mainMenuElement = document.getElementById('main-menu');
    if (mainMenuElement) {
        mainMenuElement.classList.remove('d-none');
        mainMenuElement.style.display = 'flex';
    }
    mainMenu = new MainMenu();
}

function initGame() {
    world = new World(canvas, keyboard);
    window.world = world;
}

const KEY_ACTIONS = {
    39: { property: 'RIGHT', down: true, up: false },
    37: { property: 'LEFT', down: true, up: false },
    40: { property: 'DOWN', down: true, up: false },
    38: { property: 'UP', down: true, up: false },
    32: { property: 'SPACE', down: true, up: false },
    68: { property: 'D', down: true, up: false }
};

window.addEventListener('keydown', (event) => {
    const action = KEY_ACTIONS[event.keyCode];
    if (action) keyboard[action.property] = action.down;
});

window.addEventListener('keyup', (event) => {
    const action = KEY_ACTIONS[event.keyCode];
    if (action) keyboard[action.property] = action.up;
});