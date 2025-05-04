/**
 * Represents the user interface for the El Pollo Loco game.
 * Manages UI elements like sound controls, settings overlay, and fullscreen mode.
 * @class
 * @extends DrawableObject
 */
class UserInterface extends DrawableObject {

    /**
     * Creates a new UserInterface with the specified canvas.
     * @param {HTMLCanvasElement} canvas - The canvas element for drawing the UI
     */
    constructor(canvas) {
        super();
        this.initializeBasicProperties(canvas);
        this.audioManager = new AudioManager(canvas);
        this.iconManager = new UIIconManager(canvas, {
            isMuted: this.isMuted,
            isFullscreen: false
        });
        this.interactionHandler = new UIInteractionHandler(canvas, this);
        this.setupInitialState();
    }

    /**
     * Initializes the basic properties of the UI.
     * @param {HTMLCanvasElement} canvas - The canvas element for the UI
     */
    initializeBasicProperties(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.isMuted = localStorage.getItem('elPolloLoco_isMuted') === 'true';
    }

    /**
     * Sets up the initial state of the UI, including event listeners and settings.
     */
    setupInitialState() {
        setTimeout(() => this.initSettingsAndOverlay(), 100);
        if (this.isMuted) this.audioManager.muteAllSounds();
        this.audioManager.initBackgroundMusic();
        window.addEventListener('resize', () => this.interactionHandler.scheduleIconPositionUpdate());
    }

    /**
     * Initializes the settings overlay.
     */
    initSettingsAndOverlay() {
        this.audioManager.initSettingsOverlay();
        const overlay = document.getElementById('settings-overlay');
        if (overlay) {
            overlay.classList.add('d-none');
            this.setupOverlayButtons();
        }
    }

    /**
     * Sets up event listeners for the settings overlay buttons.
     */
    setupOverlayButtons() {
        const buttons = {
            'close-x': () => this.closeSettings(),
            'return-to-game': () => this.closeSettings(),
            'exit-game': () => this.showCustomConfirm(() => window.location.reload()),
            'game-tab': () => this.switchTab('game'),
            'how-to-play-tab': () => this.switchTab('howToPlay'),
            'audio-tab': () => this.switchTab('audio')
        };
        Object.entries(buttons).forEach(([id, handler]) => {
            const element = document.getElementById(id);
            if (element) element.addEventListener('click', handler);
        });
    }

    /**
     * Switches between different tabs in the settings overlay.
     * @param {string} tabName - The name of the tab to switch to ('game', 'howToPlay', or 'audio')
     */
    switchTab(tabName) {
        const tabs = {
            game: ['game-tab', 'game-content'],
            howToPlay: ['how-to-play-tab', 'how-to-play-content'],
            audio: ['audio-tab', 'audio-content']
        };
        this.resetAllTabs();
        if (tabs[tabName]) {
            const tabId = document.getElementById(tabs[tabName][0]);
            const contentId = document.getElementById(tabs[tabName][1]);
            if (tabId) tabId.classList.add('active');
            if (contentId) contentId.classList.remove('d-none');
        }
    }

    /**
     * Resets all tabs and their content to the default state.
     */
    resetAllTabs() {
        ['game-tab', 'how-to-play-tab', 'audio-tab'].forEach(id => {
            const tab = document.getElementById(id);
            if (tab) tab.classList.remove('active');
        });
        ['game-content', 'how-to-play-content', 'audio-content'].forEach(id => {
            const content = document.getElementById(id);
            if (content) content.classList.add('d-none');
        });
    }

    /**
     * Opens the settings overlay.
     */
    openSettings() {
        this.pauseGameAndShowExitButton();
        this.activateDefaultTab();
        this.audioManager.positionAndShowOverlay();
    }

    /**
     * Pauses the game and shows the exit button.
     */
    pauseGameAndShowExitButton() {
        if (this.canvas && window.world) {
            window.world.isPaused = true;
            const exitGameBtn = document.getElementById('exit-game');
            if (exitGameBtn) {
                exitGameBtn.style.display = 'block';
            }
        }
    }

    /**
     * Activates the default tab in the settings menu.
     */
    activateDefaultTab() {
        if (window.mainMenu) {
            window.mainMenu.switchTab('game');
        } else {
            this.resetAndActivateGameTab();
        }
    }

    /**
     * Resets all tabs and activates the game tab.
     */
    resetAndActivateGameTab() {
        this.resetAllTabs();
        const gameTab = document.getElementById('game-tab');
        const gameContent = document.getElementById('game-content');
        if (gameTab) gameTab.classList.add('active');
        if (gameContent) gameContent.classList.remove('d-none');
    }

    /**
     * Closes the settings overlay and resumes the game.
     */
    closeSettings() {
        this.resumeGame();
        this.audioManager.hideOverlay();
    }

    /**
     * Resumes the game after being paused.
     */
    resumeGame() {
        if (window.world) {
            window.world.isPaused = false;
            setTimeout(() => {
                if (window.world) window.world.isPaused = false;
            }, 50);
        }
    }

    /**
     * Toggles sound on/off and updates related states.
     */
    toggleSound() {
        this.isMuted = !this.isMuted;
        localStorage.setItem('elPolloLoco_isMuted', this.isMuted);
        if (this.isMuted) {
            this.muteSound();
        } else {
            this.unmuteSound();
        }
    }
    
    /**
     * Mutes all sounds and updates the sound icon.
     */
    muteSound() {
        this.iconManager.updateSoundIcon(true);
        this.audioManager.muteAllSounds();
        this.audioManager.pauseBackgroundMusic();
    }
    
    /**
     * Unmutes all sounds and updates the sound icon.
     */
    unmuteSound() {
        this.iconManager.updateSoundIcon(false);
        this.audioManager.unmuteAllSounds();
        this.audioManager.playBackgroundMusic();
    }

    /**
     * Updates the sound icon based on current mute state.
     */
    updateSoundIcon() {
        this.iconManager.updateSoundIcon(this.isMuted);
    }

    /**
     * Shows a custom confirmation dialog.
     * @param {Function} onConfirm - Callback function to execute when confirmed
     */
    showCustomConfirm(onConfirm) {
        const customConfirm = document.getElementById('custom-confirm');
        const yesBtn = document.getElementById('confirm-yes');
        const noBtn = document.getElementById('confirm-no');
        this.setupCustomConfirmUI(customConfirm);
        this.setupCustomConfirmHandlers(customConfirm, yesBtn, noBtn, onConfirm);
    }

    /**
     * Sets up the UI for the custom confirmation dialog.
     * @param {HTMLElement} customConfirm - The confirmation dialog element
     */
    setupCustomConfirmUI(customConfirm) {
        customConfirm.classList.remove('d-none');
        customConfirm.classList.add('show');
        const canvasRect = this.canvas.getBoundingClientRect();
        customConfirm.style.top = `${canvasRect.top}px`;
        customConfirm.style.left = `${canvasRect.left}px`;
        customConfirm.style.width = `${canvasRect.width}px`;
        customConfirm.style.height = `${canvasRect.height}px`;
    }

    /**
     * Sets up event handlers for the custom confirmation dialog buttons.
     * @param {HTMLElement} customConfirm - The confirmation dialog element
     * @param {HTMLElement} yesBtn - The "yes" button element
     * @param {HTMLElement} noBtn - The "no" button element
     * @param {Function} onConfirm - Function to call when confirmed
     */
    setupCustomConfirmHandlers(customConfirm, yesBtn, noBtn, onConfirm) {
        const handleYes = () => {
            this.hideCustomConfirm(customConfirm, yesBtn, noBtn, handleYes, handleNo);
            if (onConfirm) onConfirm();
        };
        const handleNo = () => {
            this.hideCustomConfirm(customConfirm, yesBtn, noBtn, handleYes, handleNo);
        };
        yesBtn.addEventListener('click', handleYes);
        noBtn.addEventListener('click', handleNo);
    }

    /**
     * Hides the custom confirmation dialog.
     * @param {HTMLElement} customConfirm - The confirmation dialog element
     * @param {HTMLElement} yesBtn - The "yes" button element
     * @param {HTMLElement} noBtn - The "no" button element
     * @param {Function} handleYes - The yes button event handler
     * @param {Function} handleNo - The no button event handler
     */
    hideCustomConfirm(customConfirm, yesBtn, noBtn, handleYes, handleNo) {
        customConfirm.classList.remove('show');
        customConfirm.classList.add('d-none');
        yesBtn.removeEventListener('click', handleYes);
        noBtn.removeEventListener('click', handleNo);
    }

    /**
     * Draws all UI icons on the canvas.
     */
    drawIcons() {
        this.iconManager.drawIcons();
    }

    /**
     * Registers an audio element with the audio manager.
     * @param {HTMLAudioElement} audio - The audio element to register
     */
    registerAudio(audio) {
        this.audioManager.registerAudio(audio);
    }

    /**
     * Registers an audio element with the audio manager in a specific category.
     * @param {HTMLAudioElement} audio - The audio element to register
     * @param {string} category - The category to register the audio in
     */
    registerAudioWithCategory(audio, category) {
        this.audioManager.registerAudioWithCategory(audio, category);
    }

    /**
     * Gets the current character sound volume.
     * @returns {number} The character volume level
     */
    get characterVolume() { return this.audioManager.characterVolume; }

    /**
     * Gets the current enemies sound volume.
     * @returns {number} The enemies volume level
     */
    get enemiesVolume() { return this.audioManager.enemiesVolume; }

    /**
     * Gets the current objects sound volume.
     * @returns {number} The objects volume level
     */
    get objectsVolume() { return this.audioManager.objectsVolume; }

    /**
     * Gets the current music volume.
     * @returns {number} The music volume level
     */
    get musicVolume() { return this.audioManager.musicVolume; }

    /**
     * Gets the background music audio element.
     * @returns {HTMLAudioElement} The background music audio element
     */
    get backgroundMusic() { return this.audioManager.backgroundMusic; }

    /**
     * Reinitializes the UI after changes.
     */
    reinitializeUI() {
        this.iconManager.reloadIcons();
        this.interactionHandler.reregisterEventListeners();
        this.updateUIElements();
    }
    
    /**
     * Updates the UI elements.
     */
    updateUIElements() {
        this.iconManager.updateIconPositions();
        this.iconManager.updateIconHitboxes();
        this.initSettingsAndOverlay();
        if (this.audioManager) {
            this.audioManager.reinitializeAudioElements();
        }
    }

    /**
     * Gets the current fullscreen state from the interaction handler.
     * @returns {boolean} Whether the interface is currently in fullscreen mode
     */
    get isFullscreen() {
        return this.interactionHandler ? this.interactionHandler.getFullscreenState() : false;
    }

    /**
     * Delegates mouse listeners setup to the interaction handler.
     * Maintains backwards compatibility with existing code.
     */
    addMouseListeners() {
        if (this.interactionHandler) {
            this.interactionHandler.addMouseListeners();
        }
    }
}