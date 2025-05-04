/**
 * Manages the audio settings UI interface for the El Pollo Loco game.
 * Handles overlay, sliders, tabs, and UI interactions related to audio settings.
 * @class
 */
class AudioSettingsManager {
    /**
     * Creates a new AudioSettingsManager instance.
     * @param {AudioManager} audioManager - The AudioManager instance to control
     * @param {HTMLCanvasElement} canvas - The canvas element for positioning calculations
     */
    constructor(audioManager, canvas) {
        this.audioManager = audioManager;
        this.canvas = canvas;
        this.initElements();
    }

    /**
     * Initializes all DOM elements and settings.
     */
    initElements() {
        this.getSettingsElements();
        this.setupSettingsButtons();
        this.initializeVolumeSliders();
        this.setupVolumeListeners();
        this.setupExtraButtons();
    }

    /**
     * Retrieves all DOM elements for settings and stores them as properties.
     */
    getSettingsElements() {
        this.settingsOverlay = document.getElementById('settings-overlay');
        this.characterSlider = document.getElementById('character-volume');
        this.enemiesSlider = document.getElementById('enemies-volume');
        this.objectsSlider = document.getElementById('objects-volume');
        this.musicSlider = document.getElementById('music-volume');
        this.characterValue = document.getElementById('character-volume-value');
        this.enemiesValue = document.getElementById('enemies-volume-value');
        this.objectsValue = document.getElementById('objects-volume-value');
        this.musicValue = document.getElementById('music-volume-value');
        this.exitGameBtn = document.getElementById('exit-game');
        this.closeSettingsBtn = document.getElementById('close-settings');
        this.returnToGameBtn = document.getElementById('return-to-game');
        this.closeXBtn = document.getElementById('close-x');
        this.generalTab = document.getElementById('general-tab');
        this.audioTab = document.getElementById('audio-tab');
        this.generalContent = document.getElementById('general-content');
        this.audioContent = document.getElementById('audio-content');
    }

    /**
     * Sets up event listeners for the settings buttons.
     */
    setupSettingsButtons() {
        if (this.closeXBtn) {
            this.closeXBtn.addEventListener('click', () => this.closeSettings());
        }
        if (this.returnToGameBtn) {
            this.returnToGameBtn.addEventListener('click', () => this.closeSettings());
        }
        if (this.closeSettingsBtn) {
            this.closeSettingsBtn.addEventListener('click', () => this.closeSettings());
        }
    }

    /**
     * Closes the settings overlay through the world's UserInterface instance.
     */
    closeSettings() {
        if (window.world?.userInterface) {
            window.world.userInterface.closeSettings();
        }
    }

    /**
     * Initializes the volume sliders with stored values.
     */
    initializeVolumeSliders() {
        this.initializeSlider(this.characterSlider, this.characterValue, this.audioManager.characterVolume);
        this.initializeSlider(this.enemiesSlider, this.enemiesValue, this.audioManager.enemiesVolume);
        this.initializeSlider(this.objectsSlider, this.objectsValue, this.audioManager.objectsVolume);
        this.initializeSlider(this.musicSlider, this.musicValue, this.audioManager.musicVolume);
    }

    /**
     * Initializes a single volume slider and its value display.
     * @param {HTMLInputElement} slider - The slider element to initialize
     * @param {HTMLElement} valueDisplay - The element to display the current value
     * @param {number} value - The value to set
     */
    initializeSlider(slider, valueDisplay, value) {
        if (slider && valueDisplay) {
            slider.value = value;
            valueDisplay.textContent = value;
        }
    }

    /**
     * Sets up event listeners for all volume sliders.
     */
    setupVolumeListeners() {
        this.setupSliderListener(this.characterSlider, 'characterVolume', this.characterValue, 'character');
        this.setupSliderListener(this.enemiesSlider, 'enemiesVolume', this.enemiesValue, 'enemies');
        this.setupSliderListener(this.objectsSlider, 'objectsVolume', this.objectsValue, 'objects');
        this.setupSliderListener(this.musicSlider, 'musicVolume', this.musicValue, 'music');
    }

    /**
     * Sets up an individual event listener for a volume slider.
     * @param {HTMLInputElement} slider - The slider element
     * @param {string} volumeProperty - The name of the volume property
     * @param {HTMLElement} valueDisplay - The element to display the value
     * @param {string} category - The category of audio elements
     */
    setupSliderListener(slider, volumeProperty, valueDisplay, category) {
        if (!slider) return;
        
        slider.addEventListener('input', () => {
            this.handleSliderInput(slider, volumeProperty, valueDisplay, category);
        });
        
        slider.addEventListener('change', () => {
            this.audioManager.updateCategoryVolume(category);
        });
    }

    /**
     * Handles input events for volume sliders.
     * @param {HTMLInputElement} slider - The slider element being adjusted
     * @param {string} volumeProperty - The volume property to update
     * @param {HTMLElement} valueDisplay - The element to display the updated value
     * @param {string} category - The audio category to update
     */
    handleSliderInput(slider, volumeProperty, valueDisplay, category) {
        const newValue = parseInt(slider.value);
        this.audioManager[volumeProperty] = newValue;
        if (valueDisplay) valueDisplay.textContent = newValue;
        localStorage.setItem(`elPolloLoco_${volumeProperty}`, newValue);
        this.audioManager.updateCategoryVolume(category);
    }

    /**
     * Sets up event listeners for extra buttons like "Exit Game" and "Legal Notice".
     */
    setupExtraButtons() {
        if (this.exitGameBtn) {
            this.exitGameBtn.addEventListener('click', () => {
                if (window.world?.userInterface) {
                    window.world.userInterface.showCustomConfirm(() => window.location.reload());
                }
            });
        }
        
        this.legalNoticeBtn = document.getElementById('legal-notice-btn');
        if (this.legalNoticeBtn) {
            this.legalNoticeBtn.addEventListener('click', () => {
                window.open('../html/legal_notice.html', '_blank');
            });
        }
    }

    /**
     * Positions and shows the settings overlay.
     */
    positionAndShowOverlay() {
        if (!this.settingsOverlay || !this.canvas) return;
        
        const canvasRect = this.canvas.getBoundingClientRect();
        this.settingsOverlay.style.top = `${canvasRect.top}px`;
        this.settingsOverlay.style.left = `${canvasRect.left}px`;
        this.settingsOverlay.style.width = `${canvasRect.width}px`;
        this.settingsOverlay.style.height = `${canvasRect.height}px`;
        this.settingsOverlay.style.transform = 'none';
        this.settingsOverlay.classList.add('show');
        this.settingsOverlay.classList.remove('d-none');
    }

    /**
     * Hides the settings overlay.
     */
    hideOverlay() {
        if (!this.settingsOverlay) return;
        
        this.settingsOverlay.classList.remove('show');
        this.settingsOverlay.classList.add('d-none');
        setTimeout(() => {
            if (this.settingsOverlay) this.settingsOverlay.removeAttribute('style');
        }, 100);
    }

    /**
     * Switches between different tabs in the settings menu.
     * @param {string} tabName - The name of the tab to display.
     */
    switchTab(tabName) {
        this.resetAllTabs();
        this.activateTab(tabName);
    }

    /**
     * Resets all tabs to their default state.
     */
    resetAllTabs() {
        if (this.generalTab) this.generalTab.classList.remove('active');
        if (this.audioTab) this.audioTab.classList.remove('active');
        if (this.generalContent) this.generalContent.classList.add('d-none');
        if (this.audioContent) this.audioContent.classList.add('d-none');
    }

    /**
     * Activates a specific tab in the settings menu.
     * @param {string} tabName - The name of the tab to activate.
     */
    activateTab(tabName) {
        if (tabName === 'general' && this.generalTab && this.generalContent) {
            this.generalTab.classList.add('active');
            this.generalContent.classList.remove('d-none');
        } else if (tabName === 'audio' && this.audioTab && this.audioContent) {
            this.audioTab.classList.add('active');
            this.audioContent.classList.remove('d-none');
        }
    }

    /**
     * Resets all audio DOM element references to null.
     * Used before re-acquiring references after UI changes.
     */
    resetAudioReferences() {
        this.characterSlider = this.enemiesSlider = this.objectsSlider = this.musicSlider = null;
        this.characterValue = this.enemiesValue = this.objectsValue = this.musicValue = null;
        this.generalTab = this.audioTab = this.generalContent = this.audioContent = null;
        this.exitGameBtn = this.closeSettingsBtn = this.returnToGameBtn = this.closeXBtn = null;
        this.legalNoticeBtn = null;
    }

    /**
     * Reinitializes the audio settings UI elements.
     * Called after a game restart or UI changes.
     */
    reinitializeUI() {
        this.resetAudioReferences();
        this.getSettingsElements();
        this.setupSettingsButtons();
        this.initializeVolumeSliders();
        this.setupVolumeListeners();
        this.setupExtraButtons();
    }
}