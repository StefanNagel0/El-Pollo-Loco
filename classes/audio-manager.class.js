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
        this.settingsManager = new AudioSettingsManager(this, canvas);
    }

    /**
     * Initializes the audio properties based on stored values or defaults.
     */
    initializeAudioProperties() {
        this.characterVolume = parseInt(localStorage.getItem('elPolloLoco_characterVolume')) || 5;
        this.enemiesVolume = parseInt(localStorage.getItem('elPolloLoco_enemiesVolume')) || 5;
        this.objectsVolume = parseInt(localStorage.getItem('elPolloLoco_objectsVolume')) || 5;
        this.musicVolume = parseInt(localStorage.getItem('elPolloLoco_musicVolume')) || 5;
        this.audioCategories = this.createEmptyCategoryArrays();
    }

    /**
     * Creates a new set of empty audio category arrays.
     * @returns {Object} Object containing empty arrays for each audio category.
     */
    createEmptyCategoryArrays() {
        return {
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
     * Handles volume correctly based on current settings.
     */
    playBackgroundMusic() {
        if (this.backgroundMusic) {
            const musicVolume = this.getVolumeForCategory('music');
            this.backgroundMusic.volume = musicVolume;

            if (!this.isMuted) {
                this.backgroundMusic.play().catch(() => {});
            }
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
        this.settingsManager.initElements();
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
     * @param {string} category - The category to associate with this audio (character, enemies, objects, music).
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
     * @param {string} category - The audio category (character, enemies, objects, music).
     * @returns {number} The volume level (0.0 to 1.0).
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
            if (audio) audio.volume = this.isMuted ? 0 : categoryVolume;
        });
    }

    /**
     * Reinitializes audio elements after a game restart.
     * Refreshes DOM references and re-registers all audio elements.
     */
    reinitializeAudioElements() {
        this.settingsManager.resetAudioReferences();
        this.audioCategories = this.createEmptyCategoryArrays();
        this.audioInstances = [];
        
        this.settingsManager.reinitializeUI();
        
        if (this.backgroundMusic) {
            this.registerAudioWithCategory(this.backgroundMusic, 'music');
        }
        
        this.registerAllGameAudio();
        this.updateVolume();
    }

    /**
     * Registers all game audio elements from the current world.
     */
    registerAllGameAudio() {
        if (!window.world) return;
        this.registerCharacterAudio();
        this.registerEnemyAudio();
        this.registerObjectAudio();
    }

    /**
     * Registers character audio elements with the appropriate category.
     */
    registerCharacterAudio() {
        if (window.world.character?.audioJump) {
            this.registerAudioWithCategory(window.world.character.audioJump, 'character');
        }
        if (window.world.character?.audioHurt) {
            this.registerAudioWithCategory(window.world.character.audioHurt, 'character');
        }
    }

    /**
     * Registers enemy audio elements with the enemies category.
     */
    registerEnemyAudio() {
        if (!window.world.level?.enemies) return;
        
        window.world.level.enemies.forEach(enemy => {
            if (enemy.audio) this.registerAudioWithCategory(enemy.audio, 'enemies');
        });
    }

    /**
     * Registers object audio elements (coins, bottles, throwables) with the objects category.
     */
    registerObjectAudio() {
        this.registerAudioElements(window.world.level?.coins, 'objects');
        this.registerAudioElements(window.world.level?.bottles, 'objects');
        this.registerAudioElements(window.world.throwableObjects, 'objects');
    }

    /**
     * Registers multiple audio elements from a collection with the specified category.
     * @param {Array} collection - Collection of objects that may contain audio properties.
     * @param {string} category - The category to register the audio elements with.
     */
    registerAudioElements(collection, category) {
        if (!collection) return;
        
        collection.forEach(item => {
            if (item.audio) this.registerAudioWithCategory(item.audio, category);
        });
    }

    /**
     * Initializes all audio elements in the game and registers them.
     * Called on first game start.
     */
    initializeGameAudio() {
        this.audioCategories = this.createEmptyCategoryArrays();
        this.audioInstances = [];
        
        if (this.backgroundMusic) {
            this.registerAudioWithCategory(this.backgroundMusic, 'music');
        }
        
        this.registerAllGameAudio();
        this.updateVolume();
    }

    /**
     * Delegate method to handle tab switching in the settings menu.
     * @param {string} tabName - The name of the tab to display.
     */
    switchTab(tabName) {
        this.settingsManager.switchTab(tabName);
    }

    /**
     * Delegate method to position and show the settings overlay.
     */
    positionAndShowOverlay() {
        this.settingsManager.positionAndShowOverlay();
    }

    /**
     * Delegate method to hide the settings overlay.
     */
    hideOverlay() {
        this.settingsManager.hideOverlay();
    }
}