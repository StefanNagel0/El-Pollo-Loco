/**
 * Manages the main menu interface for the El Pollo Loco game.
 * Handles menu navigation, settings, game start, and UI positioning.
 * @class
 */
class MainMenu {

    /**
 * Creates a new MainMenu instance and initializes the UI.
 */
    constructor() {
        const canvas = document.getElementById('canvas');
        this.userInterface = new UserInterface(canvas);
        this.init();
    }
    
    /**
     * Initializes the main menu components and event handlers.
     */
    init() {
        this.initDOMReferences();
        this.initEventListeners();
        if (this.menuContainer) this.showMenu();
        window.addEventListener('resize', () => this.adjustMenuPosition());
        this.adjustMenuPosition();
    }

    /**
     * Initializes references to DOM elements used by the menu.
     */
    initDOMReferences() {
        this.menuContainer = document.getElementById('main-menu');
        this.startButton = document.getElementById('start-game');
        this.settingsIcon = document.getElementById('menu-settings-icon');
        this.settingsOverlay = document.getElementById('settings-overlay');
        this.closeSettingsBtn = document.getElementById('close-settings');
        this.gameTitle = document.querySelector('h1');
        this.closeXBtn = document.getElementById('close-x');
        this.gameTab = document.getElementById('game-tab');
        this.howToPlayTab = document.getElementById('how-to-play-tab');
        this.audioTab = document.getElementById('audio-tab');
        this.gameContent = document.getElementById('game-content');
        this.howToPlayContent = document.getElementById('how-to-play-content');
        this.audioContent = document.getElementById('audio-content');
        this.returnToGameBtn = document.getElementById('return-to-game');
        this.exitGameBtn = document.getElementById('exit-game');
        this.soundIcon = document.getElementById('menu-sound-icon');
    }

    /**
     * Sets up event listeners for menu interactions.
     */
    initEventListeners() {
        this.addButtonListener(this.startButton, () => this.startGame());
        this.addButtonListener(this.settingsIcon, () => this.openSettings());
        this.addButtonListener(this.closeSettingsBtn, () => this.closeSettings());
        this.addButtonListener(this.closeXBtn, () => this.closeSettings());
        this.addButtonListener(this.gameTab, () => this.switchTab('game'));
        this.addButtonListener(this.howToPlayTab, () => this.switchTab('how-to-play'));
        this.addButtonListener(this.audioTab, () => this.switchTab('audio'));
        this.addButtonListener(this.returnToGameBtn, () => this.closeSettings());
        this.addButtonListener(this.exitGameBtn, () => this.handleExitGame());
        this.initSoundIconListener();
    }

    /**
     * Helper method to add a click event listener to a button.
     * Only adds the listener if the button element exists.
     * @param {HTMLElement|null} button - The button to add a listener to
     * @param {Function} callback - The event handler to call when clicked
     */
    addButtonListener(button, callback) {
        if (button) button.addEventListener('click', callback);
    }

    /**
     * Handles the exit game button click with confirmation dialog.
     */
    handleExitGame() {
        const ui = window.world?.userInterface;
        if (ui) ui.showCustomConfirm(() => window.location.reload());
        else window.location.reload();
    }

    /**
     * Initializes the sound icon click handler.
     */
    initSoundIconListener() {
        if (this.soundIcon) {
            this.updateSoundIcon();
            this.soundIcon.addEventListener('click', () => {
                if (this.userInterface) {
                    this.userInterface.toggleSound();
                    this.updateSoundIcon();
                }
            });
        }
    }

    /**
     * Shows the main menu.
     */
    showMenu() {
        this.menuContainer.classList.remove('d-none');
        this.gameTitle.classList.add('d-none');
    }

    /**
     * Handles starting the game when the start button is clicked.
     */
    startGame() {
        this.hideMenuShowTitle();
        if (this.userInterface?.audioManager) {
            this.userInterface.audioManager.playBackgroundMusicAfterInteraction();
        }
        initGame();
        this.initializeAndResumeGame();
        this.closeAllOverlays();
    }

    /**
     * Hides the menu and shows the game title.
     */
    hideMenuShowTitle() {
        this.menuContainer.classList.add('d-none');
        this.menuContainer.style.display = 'none';
        this.gameTitle.classList.remove('d-none');
        this.gameTitle.style.display = '';
    }

    /**
     * Initializes the game world and resumes gameplay.
     */
    initializeAndResumeGame() {
        if (window.world) {
            window.world.isPaused = false;
            if (this.userInterface) {
                this.transferUIState(window.world.userInterface);
            }
        }
    }

    /**
     * Transfers UI state from the menu to the game world.
     * @param {UserInterface} targetUI - The target user interface to receive state
     */
    transferUIState(targetUI) {
        if (this.userInterface?.audioManager?.backgroundMusic) {
            targetUI.audioManager.transferBackgroundMusic(this.userInterface.audioManager.backgroundMusic);
        }
        targetUI.isMuted = this.userInterface.isMuted;
        targetUI.updateSoundIcon();
    }

    /**
     * Closes all overlay elements.
     */
    closeAllOverlays() {
        if (this.howToPlayOverlay) {
            this.howToPlayOverlay.classList.add('d-none');
            this.howToPlayOverlay.classList.remove('show');
        }
        const settingsOverlay = document.getElementById('settings-overlay');
        if (settingsOverlay) {
            settingsOverlay.classList.add('d-none');
            settingsOverlay.classList.remove('show');
        }
    }

    /**
     * Opens the how-to-play overlay.
     */
    openHowToPlay() {
        this.howToPlayOverlay.classList.remove('d-none');
        this.howToPlayOverlay.classList.add('show');
    }

    /**
     * Closes the how-to-play overlay.
     */
    closeHowToPlay() {
        this.howToPlayOverlay.classList.remove('show');
        this.howToPlayOverlay.classList.add('d-none');
    }

    /**
     * Opens the settings overlay.
     */
    openSettings() {
        this.exitGameBtn.style.display = window.world ? 'block' : 'none';
        this.switchTab('game');
        this.settingsOverlay.classList.remove('d-none');
        this.settingsOverlay.classList.add('show');
    }

    /**
     * Closes the settings overlay.
     */
    closeSettings() {
        this.settingsOverlay.classList.remove('show');
        this.settingsOverlay.classList.add('d-none');
    }

    /**
     * Adjusts the position of menu elements to match the canvas position.
     * Called on window resize and initialization.
     */
    adjustMenuPosition() {
        const canvas = document.getElementById('canvas');
        if (canvas) {
            const canvasRect = canvas.getBoundingClientRect();
            this.positionMenuContainer(canvasRect);
            this.positionSettingsOverlay(canvasRect);
        }
    }

    /**
     * Positions the main menu container based on canvas dimensions.
     * @param {DOMRect} canvasRect - The bounding rectangle of the canvas
     */
    positionMenuContainer(canvasRect) {
        if (this.menuContainer) {
            const canvasCenter = canvasRect.left + (canvasRect.width / 2);
            const menuWidth = canvasRect.width;
            this.menuContainer.style.top = `${canvasRect.top}px`;
            this.menuContainer.style.left = `${canvasCenter - (menuWidth / 2)}px`;
            this.menuContainer.style.width = `${menuWidth}px`;
            this.menuContainer.style.height = `${canvasRect.height}px`;
            this.menuContainer.style.transform = 'none';
        }
    }

    /**
     * Positions the settings overlay based on canvas dimensions.
     * @param {DOMRect} canvasRect - The bounding rectangle of the canvas
     */
    positionSettingsOverlay(canvasRect) {
        const settingsOverlay = document.getElementById('settings-overlay');
        if (settingsOverlay) {
            settingsOverlay.style.top = `${canvasRect.top}px`;
            settingsOverlay.style.left = `${canvasRect.left}px`;
            settingsOverlay.style.width = `${canvasRect.width}px`;
            settingsOverlay.style.height = `${canvasRect.height}px`;
            settingsOverlay.style.transform = 'none';
        }
    }

    /**
     * Switches between different tabs in the settings menu.
     * @param {string} tabId - The id of the tab to switch to ('game', 'how-to-play', or 'audio')
     */
    switchTab(tabId) {
        this.resetAllTabs();
        this.activateTab(tabId);
    }

    /**
     * Resets all tabs to their default inactive state.
     */
    resetAllTabs() {
        this.gameTab?.classList.remove('active');
        this.howToPlayTab?.classList.remove('active');
        this.audioTab?.classList.remove('active');
        this.gameContent?.classList.add('d-none');
        this.howToPlayContent?.classList.add('d-none');
        this.audioContent?.classList.add('d-none');
    }

    /**
     * Activates the specified tab.
     * @param {string} tabId - The id of the tab to activate
     */
    activateTab(tabId) {
        if (tabId === 'game') {
            this.gameTab?.classList.add('active');
            this.gameContent?.classList.remove('d-none');
        } else if (tabId === 'how-to-play') {
            this.howToPlayTab?.classList.add('active');
            this.howToPlayContent?.classList.remove('d-none');
        } else if (tabId === 'audio') {
            this.audioTab?.classList.add('active');
            this.audioContent?.classList.remove('d-none');
        }
    }

    /**
     * Updates the sound icon to reflect the current mute state.
     */
    updateSoundIcon() {
        if (this.soundIcon && this.userInterface) {
            const iconPath = this.userInterface.isMuted
                ? '../assets/img/ui_images/sound_off.svg'
                : '../assets/img/ui_images/sound_on.svg';
            this.soundIcon.src = iconPath;
        }
    }
}
