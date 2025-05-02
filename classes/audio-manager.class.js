/**
 * Manages all audio functionality for the El Pollo Loco game,
 * including background music and sound effects.
 * Controls volume settings, muting, and audio categories.
 * @class
 */
class AudioManager {
    /**
     * Creates a new AudioManager instance.
     * @param {HTMLCanvasElement} canvas - The canvas element for positioning calculations.
     */
    constructor(canvas) {
        this.canvas = canvas;
        this.audioInstances = [];
        this.isMuted = localStorage.getItem('elPolloLoco_isMuted') === 'true';
        this.initializeAudioProperties();
    }

    /**
     * Initializes the audio properties based on stored values or defaults.
     */
    initializeAudioProperties() {
        this.characterVolume = parseInt(localStorage.getItem('elPolloLoco_characterVolume')) || 5;
        this.enemiesVolume = parseInt(localStorage.getItem('elPolloLoco_enemiesVolume')) || 5;
        this.objectsVolume = parseInt(localStorage.getItem('elPolloLoco_objectsVolume')) || 5;
        this.musicVolume = parseInt(localStorage.getItem('elPolloLoco_musicVolume')) || 5;
        this.audioCategories = {
            character: [],
            enemies: [],
            objects: [],
            music: []
        };
    }

    /**
     * Initializes the global background music for the game.
     * Uses a shared audio instance across all game areas.
     */
    initBackgroundMusic() {
        if (!window.globalBackgroundMusic) {
            window.globalBackgroundMusic = new Audio('../assets/audio/background.mp3');
            window.globalBackgroundMusic.loop = true;
            this.registerAudioWithCategory(window.globalBackgroundMusic, 'music');
        }
        this.backgroundMusic = window.globalBackgroundMusic;
    }
    
    /**
     * Plays the background music after user interaction.
     * Needed for browsers that block autoplay.
     */
    playBackgroundMusicAfterInteraction() {
        if (this.backgroundMusic && !this.isMuted) {
            this.backgroundMusic.play().catch(() => {});
        }
    }

    /**
     * Plays the background music if not muted.
     */
    playBackgroundMusic() {
        if (this.backgroundMusic && !this.isMuted) {
            this.backgroundMusic.play().catch(() => {});
        }
    }

    /**
     * Pauses the background music.
     */
    pauseBackgroundMusic() {
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
        }
    }

    /**
     * Transfers the state of a source audio to the local background music.
     * @param {HTMLAudioElement} sourceMusic - The source audio instance to transfer state from.
     */
    transferBackgroundMusic(sourceMusic) {
        if (sourceMusic && this.backgroundMusic) {
            this.backgroundMusic.currentTime = sourceMusic.currentTime;
            if (!sourceMusic.paused && !this.isMuted) {
                this.backgroundMusic.play().catch(() => {});
            }
        }
    }

    /**
     * Initializes the settings overlay for audio configuration.
     */
    initSettingsOverlay() {
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
        if (this.characterSlider && this.characterValue) {
            this.characterSlider.value = this.characterVolume;
            this.characterValue.textContent = this.characterVolume;
        }
        if (this.enemiesSlider && this.enemiesValue) {
            this.enemiesSlider.value = this.enemiesVolume;
            this.enemiesValue.textContent = this.enemiesVolume;
        }
        if (this.objectsSlider && this.objectsValue) {
            this.objectsSlider.value = this.objectsVolume;
            this.objectsValue.textContent = this.objectsVolume;
        }
        if (this.musicSlider && this.musicValue) {
            this.musicSlider.value = this.musicVolume;
            this.musicValue.textContent = this.musicVolume;
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
        if (slider) {
            slider.addEventListener('input', () => {
                this[volumeProperty] = parseInt(slider.value);
                valueDisplay.textContent = this[volumeProperty];
                this.updateCategoryVolume(category);
                localStorage.setItem(`elPolloLoco_${volumeProperty}`, this[volumeProperty]);
            });
        }
    }

    /**
     * Sets up event listeners for extra buttons like "Exit Game".
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
        const settingsOverlay = document.getElementById('settings-overlay');
        if (!settingsOverlay || !this.canvas) return;
        const canvasRect = this.canvas.getBoundingClientRect();
        settingsOverlay.style.top = `${canvasRect.top}px`;
        settingsOverlay.style.left = `${canvasRect.left}px`;
        settingsOverlay.style.width = `${canvasRect.width}px`;
        settingsOverlay.style.height = `${canvasRect.height}px`;
        settingsOverlay.style.transform = 'none';
        settingsOverlay.classList.add('show');
        settingsOverlay.classList.remove('d-none');
    }

    /**
     * Hides the settings overlay.
     */
    hideOverlay() {
        const settingsOverlay = document.getElementById('settings-overlay');
        if (settingsOverlay) {
            settingsOverlay.classList.remove('show');
            settingsOverlay.classList.add('d-none');
            setTimeout(() => {
                if (settingsOverlay) settingsOverlay.removeAttribute('style');
            }, 100);
        }
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
     * Updates the volume for all audio categories.
     */
    updateVolume() {
        ['character', 'enemies', 'objects', 'music'].forEach(category =>
            this.updateCategoryVolume(category));
    }

    /**
     * Registers an audio element with the manager.
     * @param {HTMLAudioElement} audio - The audio element to register.
     */
    registerAudio(audio) {
        if (audio instanceof Audio && !this.audioInstances.includes(audio)) {
            this.audioInstances.push(audio);
            audio.volume = 0.5;
            if (this.isMuted) audio.muted = true;
        }
    }

    /**
     * Registers an audio element with a specific category.
     * @param {HTMLAudioElement} audio - The audio element to register.
     * @param {string} category - The category to associate with this audio.
     */
    registerAudioWithCategory(audio, category) {
        if (!(audio instanceof Audio) || this.audioInstances.includes(audio)) return;
        this.audioInstances.push(audio);
        const categoryVolume = this.getVolumeForCategory(category);
        audio.volume = categoryVolume;
        if (this.isMuted) audio.muted = true;
        if (category && this.audioCategories[category] && !this.audioCategories[category].includes(audio)) {
            this.audioCategories[category].push(audio);
        }
    }

    /**
     * Gets the appropriate volume level for a specific category.
     * @param {string} category - The audio category.
     * @returns {number} - The volume level (0.0 to 1.0).
     */
    getVolumeForCategory(category) {
        if (!category || !this.audioCategories[category]) return 0.5;
        switch (category) {
            case 'character': return this.characterVolume / 10;
            case 'enemies': return this.enemiesVolume / 10;
            case 'objects': return this.objectsVolume / 10;
            case 'music': return this.musicVolume / 10;
            default: return 0.5;
        }
    }

    /**
     * Mutes all registered audio elements.
     */
    muteAllSounds() {
        this.audioInstances.forEach(audio => {
            if (audio) audio.muted = true;
        });
    }

    /**
     * Unmutes all registered audio elements and restores their appropriate volumes.
     */
    unmuteAllSounds() {
        this.audioInstances.forEach(audio => {
            if (!audio) return;
            audio.muted = false;
            let categoryFound = false;
            for (const category in this.audioCategories) {
                if (this.audioCategories[category].includes(audio)) {
                    audio.volume = this.getVolumeForCategory(category);
                    categoryFound = true;
                    break;
                }
            }
            if (!categoryFound) audio.volume = 0.5;
        });
    }

    /**
     * Updates the volume for all audio elements in a specific category.
     * @param {string} category - The category to update.
     */
    updateCategoryVolume(category) {
        if (!this.audioCategories[category]) return;
        const categoryVolume = this.getVolumeForCategory(category);
        this.audioCategories[category].forEach(audio => {
            if (audio && !this.isMuted) audio.volume = categoryVolume;
        });
    }
}