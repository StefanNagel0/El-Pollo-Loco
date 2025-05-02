class AudioManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.audioInstances = [];
        this.isMuted = localStorage.getItem('elPolloLoco_isMuted') === 'true';
        this.initializeAudioProperties();
    }

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

    initBackgroundMusic() {
        if (!window.globalBackgroundMusic) {
            window.globalBackgroundMusic = new Audio('../assets/audio/background.mp3');
            window.globalBackgroundMusic.loop = true;
            this.registerAudioWithCategory(window.globalBackgroundMusic, 'music');
        }
        this.backgroundMusic = window.globalBackgroundMusic;
    }
    
    playBackgroundMusicAfterInteraction() {
        if (this.backgroundMusic && !this.isMuted) {
            this.backgroundMusic.play().catch(err => console.log('Musik konnte nicht gestartet werden:', err));
        }
    }

    playBackgroundMusic() {
        if (this.backgroundMusic && !this.isMuted) {
            this.backgroundMusic.play().catch(() => {});
        }
    }

    pauseBackgroundMusic() {
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
        }
    }

    transferBackgroundMusic(sourceMusic) {
        if (sourceMusic && this.backgroundMusic) {
            this.backgroundMusic.currentTime = sourceMusic.currentTime;
            if (!sourceMusic.paused && !this.isMuted) {
                this.backgroundMusic.play().catch(() => {});
            }
        }
    }

    initSettingsOverlay() {
        this.getSettingsElements();
        this.setupSettingsButtons();
        this.initializeVolumeSliders();
        this.setupVolumeListeners();
        this.setupExtraButtons();
    }

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

    closeSettings() {
        if (window.world?.userInterface) {
            window.world.userInterface.closeSettings();
        }
    }

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

    setupVolumeListeners() {
        this.setupSliderListener(this.characterSlider, 'characterVolume', this.characterValue, 'character');
        this.setupSliderListener(this.enemiesSlider, 'enemiesVolume', this.enemiesValue, 'enemies');
        this.setupSliderListener(this.objectsSlider, 'objectsVolume', this.objectsValue, 'objects');
        this.setupSliderListener(this.musicSlider, 'musicVolume', this.musicValue, 'music');
    }

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

    switchTab(tabName) {
        this.resetAllTabs();
        this.activateTab(tabName);
    }

    resetAllTabs() {
        if (this.generalTab) this.generalTab.classList.remove('active');
        if (this.audioTab) this.audioTab.classList.remove('active');
        if (this.generalContent) this.generalContent.classList.add('d-none');
        if (this.audioContent) this.audioContent.classList.add('d-none');
    }

    activateTab(tabName) {
        if (tabName === 'general' && this.generalTab && this.generalContent) {
            this.generalTab.classList.add('active');
            this.generalContent.classList.remove('d-none');
        } else if (tabName === 'audio' && this.audioTab && this.audioContent) {
            this.audioTab.classList.add('active');
            this.audioContent.classList.remove('d-none');
        }
    }

    updateVolume() {
        ['character', 'enemies', 'objects', 'music'].forEach(category =>
            this.updateCategoryVolume(category));
    }

    registerAudio(audio) {
        if (audio instanceof Audio && !this.audioInstances.includes(audio)) {
            this.audioInstances.push(audio);
            audio.volume = 0.5;
            if (this.isMuted) audio.muted = true;
        }
    }

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

    muteAllSounds() {
        this.audioInstances.forEach(audio => {
            if (audio) audio.muted = true;
        });
    }

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

    updateCategoryVolume(category) {
        if (!this.audioCategories[category]) return;
        const categoryVolume = this.getVolumeForCategory(category);
        this.audioCategories[category].forEach(audio => {
            if (audio && !this.isMuted) audio.volume = categoryVolume;
        });
    }
}