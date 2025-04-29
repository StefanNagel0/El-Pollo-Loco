class UserInterface extends DrawableObject {
    constructor(canvas) {
        super();
        this.initializeBasicProperties(canvas);
        this.initializeAudioProperties();
        this.initializeIcons(canvas);
        this.setupInitialState();
    }

    initializeBasicProperties(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.isMuted = localStorage.getItem('elPolloLoco_isMuted') === 'true';
        this.audioInstances = [];
        this.soundIconHovered = false;
        this.settingsIconHovered = false;
        this.fullscreenIconHovered = false;
        this.isFullscreen = false;
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

    initializeIcons(canvas) {
        this.soundIcon = new Image();
        this.soundIcon.src = this.isMuted ? '../assets/img/ui_images/sound_off.svg' : '../assets/img/ui_images/sound_on.svg';
        this.settingsIcon = new Image();
        this.settingsIcon.src = '../assets/img/ui_images/settings.svg';
        this.fullscreenIcon = new Image();
        this.fullscreenIcon.src = '../assets/img/ui_images/fullscreen.svg';
        
        this.initializeIconDimensions(canvas);
    }

    initializeIconDimensions(canvas) {
        this.soundIconX = canvas.width - 100;
        this.soundIconY = 10;
        this.soundIconWidth = 40;
        this.soundIconHeight = 40;
        
        this.settingsIconX = canvas.width - 50;
        this.settingsIconY = 10;
        this.settingsIconWidth = 40;
        this.settingsIconHeight = 40;
        
        this.fullscreenIconX = canvas.width - 50;
        this.fullscreenIconY = canvas.height - 50;
        this.fullscreenIconWidth = 40;
        this.fullscreenIconHeight = 40;
    }

    setupInitialState() {
        this.addMouseListeners();
        setTimeout(() => this.initSettingsAndOverlay(), 100);
        if (this.isMuted) this.muteAllSounds();
        this.setupFullscreenHandler();
        this.initBackgroundMusic();
        this.setupErrorHandlers();
        window.addEventListener('resize', () => this.scheduleIconPositionUpdate());
    }

    initSettingsAndOverlay() {
        this.initSettingsOverlay();
        const overlay = document.getElementById('settings-overlay');
        if (overlay) overlay.classList.add('d-none');
    }

    setupFullscreenHandler() {
        document.addEventListener('fullscreenchange', () => {
            this.isFullscreen = !!document.fullscreenElement;
            
            if (this.isFullscreen) {
                document.body.classList.add('fullscreen');
            } else {
                document.body.classList.remove('fullscreen');
            }
            
            this.updateFullscreenIcon();
        });
    }

    initBackgroundMusic() {
        this.backgroundMusic = new Audio('../assets/audio/background.mp3');
        this.backgroundMusic.loop = true;
        this.registerAudioWithCategory(this.backgroundMusic, 'music');
        
        setTimeout(() => {
            if (!this.isMuted) this.backgroundMusic.play().catch(() => {});
        }, 500);
    }

    setupErrorHandlers() {
        this.soundIcon.onerror = () => {};
        this.settingsIcon.onerror = () => {};
        this.fullscreenIcon.onerror = () => {};
    }

    updateIconPositions() {
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;
        const marginRight = 60;
        const marginTop = 10;
        const marginBottom = 10;
        
        this.soundIconX = canvasWidth - this.soundIconWidth - marginRight;
        this.soundIconY = marginTop;
        this.settingsIconX = canvasWidth - this.settingsIconWidth - 10;
        this.settingsIconY = marginTop;
        this.fullscreenIconX = canvasWidth - this.fullscreenIconWidth - 10;
        this.fullscreenIconY = canvasHeight - this.fullscreenIconHeight - marginBottom;
    }

    drawIcons() {
        this.updateIconPositions();
        this.drawSoundIcon();
        this.drawSettingsIcon();
        this.drawFullscreenIconIfNeeded();
    }

    drawSoundIcon() {
        this.ctx.save();
        if (this.soundIconHovered) {
            this.applyHoverEffect(this.soundIconX, this.soundIconY, this.soundIconWidth, this.soundIconHeight);
        }
        this.ctx.drawImage(this.soundIcon, this.soundIconX, this.soundIconY, this.soundIconWidth, this.soundIconHeight);
        this.ctx.restore();
    }

    drawSettingsIcon() {
        this.ctx.save();
        if (this.settingsIconHovered) {
            this.applyRotationEffect(this.settingsIconX, this.settingsIconY, this.settingsIconWidth, this.settingsIconHeight);
        }
        this.ctx.drawImage(this.settingsIcon, this.settingsIconX, this.settingsIconY, this.settingsIconWidth, this.settingsIconHeight);
        this.ctx.restore();
    }

    drawFullscreenIconIfNeeded() {
        const isSmallScreen = window.innerWidth < 720;
        const isLandscape = window.innerHeight < window.innerWidth;
        const shouldDisplayFullscreenIcon = !(isSmallScreen && isLandscape);
        
        if (shouldDisplayFullscreenIcon) {
            this.ctx.save();
            if (this.fullscreenIconHovered) {
                this.applyHoverEffect(this.fullscreenIconX, this.fullscreenIconY, this.fullscreenIconWidth, this.fullscreenIconHeight);
            }
            this.ctx.drawImage(this.fullscreenIcon, this.fullscreenIconX, this.fullscreenIconY, this.fullscreenIconWidth, this.fullscreenIconHeight);
            this.ctx.restore();
        }
    }

    applyHoverEffect(x, y, width, height) {
        this.ctx.translate(x + width/2, y + height/2);
        this.ctx.scale(1.1, 1.1);
        this.ctx.translate(-(x + width/2), -(y + height/2));
    }

    applyRotationEffect(x, y, width, height) {
        this.ctx.translate(x + width/2, y + height/2);
        this.ctx.rotate(Math.PI/2);
        this.ctx.translate(-(x + width/2), -(y + height/2));
    }

    addMouseListeners() {
        this.canvas.addEventListener('mousemove', (event) => this.handleMouseMove(event));
        this.canvas.addEventListener('click', (event) => this.handleMouseClick(event));
        this.canvas.addEventListener('mouseout', () => this.handleMouseOut());
    }

    handleMouseMove(event) {
        const relativePos = this.calculateRelativeCoordinates(event);
        this.checkIconHoverStates(relativePos.x, relativePos.y);
        this.updateCursor();
    }

    handleMouseClick(event) {
        const relativePos = this.calculateRelativeCoordinates(event);
        this.checkIconClick(relativePos.x, relativePos.y);
    }

    handleMouseOut() {
        this.soundIconHovered = false;
        this.settingsIconHovered = false;
        this.fullscreenIconHovered = false;
        this.canvas.style.cursor = 'default';
    }

    calculateRelativeCoordinates(event) {
        const rect = this.canvas.getBoundingClientRect();
        const canvasAspectRatio = this.canvas.width / this.canvas.height;
        const rectAspectRatio = rect.width / rect.height;
        
        return this.isFullscreen 
            ? this.getFullscreenCoordinates(event, rect, canvasAspectRatio, rectAspectRatio)
            : this.getNormalCoordinates(event, rect);
    }

    getFullscreenCoordinates(event, rect, canvasAspectRatio, rectAspectRatio) {
        let visibleWidth, visibleHeight, offsetX = 0, offsetY = 0;
        
        if (rectAspectRatio > canvasAspectRatio) {
            visibleHeight = rect.height;
            visibleWidth = visibleHeight * canvasAspectRatio;
            offsetX = (rect.width - visibleWidth) / 2;
        } else {
            visibleWidth = rect.width;
            visibleHeight = visibleWidth / canvasAspectRatio;
            offsetY = (rect.height - visibleHeight) / 2;
        }
        
        return {
            x: ((event.clientX - rect.left - offsetX) / visibleWidth) * this.canvas.width,
            y: ((event.clientY - rect.top - offsetY) / visibleHeight) * this.canvas.height
        };
    }

    getNormalCoordinates(event, rect) {
        return {
            x: (event.clientX - rect.left) / rect.width * this.canvas.width,
            y: (event.clientY - rect.top) / rect.height * this.canvas.height
        };
    }

    checkIconHoverStates(x, y) {
        const tolerance = 10;
        this.soundIconHovered = this.isPointInRect(x, y, this.soundIconX, this.soundIconY, this.soundIconWidth, this.soundIconHeight, tolerance);
        this.settingsIconHovered = this.isPointInRect(x, y, this.settingsIconX, this.settingsIconY, this.settingsIconWidth, this.settingsIconHeight, tolerance);
        this.fullscreenIconHovered = this.isPointInRect(x, y, this.fullscreenIconX, this.fullscreenIconY, this.fullscreenIconWidth, this.fullscreenIconHeight, tolerance);
    }

    updateCursor() {
        this.canvas.style.cursor = (this.soundIconHovered || this.settingsIconHovered || this.fullscreenIconHovered) ? 'pointer' : 'default';
    }

    checkIconClick(x, y) {
        const tolerance = 10;
        if (this.isPointInRect(x, y, this.soundIconX, this.soundIconY, this.soundIconWidth, this.soundIconHeight, tolerance)) {
            this.toggleSound();
        } else if (this.isPointInRect(x, y, this.settingsIconX, this.settingsIconY, this.settingsIconWidth, this.settingsIconHeight, tolerance)) {
            this.openSettings();
        } else {
            this.checkFullscreenClick(x, y, tolerance);
        }
    }

    checkFullscreenClick(x, y, tolerance) {
        const isSmallScreen = window.innerWidth < 720;
        const isLandscape = window.innerHeight < window.innerWidth;
        const shouldDisplayFullscreenIcon = !(isSmallScreen && isLandscape);

        if (shouldDisplayFullscreenIcon && this.isPointInRect(x, y, this.fullscreenIconX, this.fullscreenIconY, this.fullscreenIconWidth, this.fullscreenIconHeight, tolerance)) {
            this.toggleFullscreen();
        }
    }

    isPointInRect(x, y, rectX, rectY, rectWidth, rectHeight, tolerance = 0) {
        return x >= (rectX - tolerance) && x <= (rectX + rectWidth + tolerance) && 
               y >= (rectY - tolerance) && y <= (rectY + rectHeight + tolerance);
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            this.enterFullscreen();
        } else {
            this.exitFullscreen();
        }
        
        this.updateFullscreenIcon();
        this.scheduleIconPositionUpdate();
    }

    enterFullscreen() {
        const element = document.documentElement;
        
        if (element.requestFullscreen) element.requestFullscreen();
        else if (element.mozRequestFullScreen) element.mozRequestFullScreen();
        else if (element.webkitRequestFullscreen) element.webkitRequestFullscreen();
        else if (element.msRequestFullscreen) element.msRequestFullscreen();
        
        this.isFullscreen = true;
        document.body.classList.add('fullscreen');
    }

    exitFullscreen() {
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        else if (document.msExitFullscreen) document.msExitFullscreen();
        
        this.isFullscreen = false;
        document.body.classList.remove('fullscreen');
    }

    updateFullscreenIcon() {
        this.fullscreenIcon.src = this.isFullscreen 
            ? '../assets/img/ui_images/fullscreen_exit.svg'
            : '../assets/img/ui_images/fullscreen.svg';
    }

    scheduleIconPositionUpdate() {
        this.updateIconPositions();
        this.updateIconHitboxes();
        
        setTimeout(() => {
            this.updateIconPositions();
            this.updateIconHitboxes();
        }, 100);
        
        setTimeout(() => {
            this.updateIconPositions();
            this.updateIconHitboxes();
        }, 300);
    }

    updateIconHitboxes() {
        const rect = this.canvas.getBoundingClientRect();
        const canvasRenderWidth = this.canvas.width;
        const canvasRenderHeight = this.canvas.height;
        
        this.canvasScaleX = canvasRenderWidth / rect.width;
        this.canvasScaleY = canvasRenderHeight / rect.height;
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
                this.showCustomConfirm(() => window.location.reload());
            });
        }
        
        this.legalNoticeBtn = document.getElementById('legal-notice-btn');
        if (this.legalNoticeBtn) {
            this.legalNoticeBtn.addEventListener('click', () => {
                window.open('../html/legal_notice.html', '_blank');
            });
        }
    }

    openSettings() {
        this.pauseGameAndShowExitButton();
        this.activateDefaultTab();
        this.positionAndShowOverlay();
    }

    pauseGameAndShowExitButton() {
        if (this.canvas && window.world) {
            window.world.isPaused = true;
            
            const exitGameBtn = document.getElementById('exit-game');
            if (exitGameBtn) {
                exitGameBtn.style.display = 'block';
            }
        }
    }

    activateDefaultTab() {
        if (window.mainMenu) {
            window.mainMenu.switchTab('game');
        } else {
            this.resetAndActivateGameTab();
        }
    }

    resetAndActivateGameTab() {
        const gameTab = document.getElementById('game-tab');
        const howToPlayTab = document.getElementById('how-to-play-tab');
        const audioTab = document.getElementById('audio-tab');
        const gameContent = document.getElementById('game-content');
        const howToPlayContent = document.getElementById('how-to-play-content');
        const audioContent = document.getElementById('audio-content');
        
        [gameTab, howToPlayTab, audioTab].forEach(tab => tab?.classList.remove('active'));
        [gameContent, howToPlayContent, audioContent].forEach(content => content?.classList.add('d-none'));
        
        gameTab?.classList.add('active');
        gameContent?.classList.remove('d-none');
    }

    positionAndShowOverlay() {
        const settingsOverlay = document.getElementById('settings-overlay');
        const canvasRect = this.canvas.getBoundingClientRect();
        
        settingsOverlay.style.top = `${canvasRect.top}px`;
        settingsOverlay.style.left = `${canvasRect.left}px`;
        settingsOverlay.style.width = `${canvasRect.width}px`;
        settingsOverlay.style.height = `${canvasRect.height}px`;
        settingsOverlay.style.transform = 'none';
        
        settingsOverlay.classList.add('show');
        settingsOverlay.classList.remove('d-none');
    }

    closeSettings() {
        this.resumeGame();
        this.hideOverlay();
    }

    resumeGame() {
        if (window.world) {
            window.world.isPaused = false;
            setTimeout(() => {
                if (window.world) window.world.isPaused = false;
            }, 50);
        }
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
        this.generalTab.classList.remove('active');
        this.audioTab.classList.remove('active');
        this.generalContent.classList.add('d-none');
        this.audioContent.classList.add('d-none');
    }

    activateTab(tabName) {
        if (tabName === 'general') {
            this.generalTab.classList.add('active');
            this.generalContent.classList.remove('d-none');
        } else if (tabName === 'audio') {
            this.audioTab.classList.add('active');
            this.audioContent.classList.remove('d-none');
        }
    }

    updateVolume() {
        ['character', 'enemies', 'objects', 'music'].forEach(category => 
            this.updateCategoryVolume(category));
    }

    toggleSound() {
        this.isMuted = !this.isMuted;
        localStorage.setItem('elPolloLoco_isMuted', this.isMuted);

        if (this.isMuted) {
            this.updateSoundIcon();
            this.muteAllSounds();
            this.backgroundMusic.pause();
        } else {
            this.updateSoundIcon();
            this.unmuteAllSounds();
            this.backgroundMusic.play();
        }
    }

    updateSoundIcon() {
        if (this.soundIcon) {
            this.soundIcon.src = this.isMuted 
                ? '../assets/img/ui_images/sound_off.svg' 
                : '../assets/img/ui_images/sound_on.svg';
        }
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
        
        switch(category) {
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

    showCustomConfirm(onConfirm) {
        const customConfirm = document.getElementById('custom-confirm');
        const yesBtn = document.getElementById('confirm-yes');
        const noBtn = document.getElementById('confirm-no');
        
        this.setupCustomConfirmUI(customConfirm);
        this.setupCustomConfirmHandlers(customConfirm, yesBtn, noBtn, onConfirm);
    }

    setupCustomConfirmUI(customConfirm) {
        customConfirm.classList.remove('d-none');
        customConfirm.classList.add('show');
        
        const canvasRect = this.canvas.getBoundingClientRect();
        customConfirm.style.top = `${canvasRect.top}px`;
        customConfirm.style.left = `${canvasRect.left}px`;
        customConfirm.style.width = `${canvasRect.width}px`;
        customConfirm.style.height = `${canvasRect.height}px`;
    }

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

    hideCustomConfirm(customConfirm, yesBtn, noBtn, handleYes, handleNo) {
        customConfirm.classList.remove('show');
        customConfirm.classList.add('d-none');
        yesBtn.removeEventListener('click', handleYes);
        noBtn.removeEventListener('click', handleNo);
    }
}