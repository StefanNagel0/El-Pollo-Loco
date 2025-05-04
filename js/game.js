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
        mainMenuElement.style.display = 'flex';
    }
    mainMenu = new MainMenu();
}

/**
 * Initializes the game world.
 * Creates a new World instance with the canvas and keyboard input.
 */
function initGame() {
    setupGameUI();
    world = new World(canvas, keyboard);
    window.world = world;
    setupUIEventListeners();
}

/**
 * initializes the game UI.
 * adds the settings overlay and cleans up any old overlays.
 */
function setupGameUI() {
    const gameContainer = document.getElementById('game-container') || document.body;
    cleanupOldOverlays();
    const settingsOverlayHTML = createSettingsOverlayHTML();
    appendHTMLToContainer(gameContainer, settingsOverlayHTML);
}

function cleanupOldOverlays() {
    const oldSettingsOverlay = document.getElementById('settings-overlay');
    if (oldSettingsOverlay) oldSettingsOverlay.remove();
    const oldCustomConfirm = document.getElementById('custom-confirm');
    if (oldCustomConfirm) oldCustomConfirm.remove();
}

function appendHTMLToContainer(container, html) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    while (tempDiv.firstChild) {
        container.appendChild(tempDiv.firstChild);
    }
}

function createSettingsOverlayHTML() {
    return `
    <div id="settings-overlay" class="d-none">
        <div class="settings-container">
            <h2>Settings</h2>
            <button class="close-x" id="close-x">&times;</button>
            <div class="settings-tabs">
                <div class="tab active" id="game-tab" data-tab="game-content">Game</div>
                <div class="tab" id="how-to-play-tab" data-tab="how-to-play-content">How to Play</div>
                <div class="tab" id="audio-tab" data-tab="audio-content">Audio</div>
            </div>
            <div class="settings-content">
                ${createGameTabContent()}
                ${createHowToPlayTabContent()}
                ${createAudioTabContent()}
            </div>
        </div>
    </div>
    ${createCustomConfirmHTML()}`;
}

function createGameTabContent() {
    return `
    <div id="game-content" class="tab-content">
        <div class="game-buttons">
            <button id="return-to-game" class="game-button">Back to Game</button>
            <button id="exit-game" class="game-button exit-button">Exit Game</button>
            <button id="legal-notice-btn" class="game-button legal-button">Legal Notice</button>
        </div>
    </div>`;
}

function createHowToPlayTabContent() {
    return `
    <div id="how-to-play-content" class="tab-content d-none">
        ${createControlsContent()}
        ${createTipsContent()}
    </div>`;
}

function createControlsContent() {
    return `
    <div class="controls-content">
        <div class="control-item">
            <div class="key">←</div>
            <span>Move left</span>
        </div>
        <div class="control-item">
            <div class="key">→</div>
            <span>Move right</span>
        </div>
        <div class="control-item">
            <div class="key">SPACE</div>
            <span>Jump</span>
        </div>
        <div class="control-item">
            <div class="key">D</div>
            <span>Throw bottles</span>
        </div>
    </div>`;
}

function createTipsContent() {
    return `
    <div class="how-to-play-tips">
        <p>• Collect coins & bottles</p>
        <p>• Jump on chickens to defeat them</p>
        <p>• Throw bottles at the end boss</p>
        <p>• Avoid getting hit by enemies</p>
    </div>`;
}

function createAudioTabContent() {
    return `
    <div id="audio-content" class="tab-content d-none">
        ${createVolumeSlider('character', 'Character')}
        ${createVolumeSlider('enemies', 'Enemies')}
        ${createVolumeSlider('objects', 'Objects')}
        ${createVolumeSlider('music', 'Music')}
    </div>`;
}

function createVolumeSlider(id, label) {
    return `
    <div class="setting">
        <label for="${id}-volume">${label}: <span id="${id}-volume-value">1</span></label>
        <input type="range" id="${id}-volume" class="volume-slider" min="0" max="10" value="1">
    </div>`;
}

function createCustomConfirmHTML() {
    return `
    <div id="custom-confirm" class="d-none">
        <div class="custom-confirm-container">
            <h3>Are you sure?</h3>
            <p>Do you really want to exit the game?</p>
            <div class="confirm-buttons">
                <button id="confirm-yes" class="confirm-button yes-button">Yes</button>
                <button id="confirm-no" class="confirm-button no-button">No</button>
            </div>
        </div>
    </div>`;
}

function setupUIEventListeners() {
    setTimeout(() => {
        if (window.world?.userInterface) {
            window.world.userInterface.addMouseListeners();
            window.world.userInterface.initSettingsAndOverlay();
            initializeAudioManager();
        }
    }, 100);
}

function initializeAudioManager() {
    if (window.world?.userInterface?.audioManager) {
        window.world.userInterface.audioManager.initSettingsOverlay();
        window.world.userInterface.audioManager.initializeGameAudio();
    }
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