class UserInterface extends DrawableObject {
    constructor(canvas, gameAudio) {
        super();
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.audio = gameAudio || new GameAudio();
        this.initIcons();
        this.addMouseListeners();
        this.initSettingsWithDelay();
        this.handleMutedState();
        this.setupFullscreenHandler();
        window.addEventListener('resize', () => this.scheduleIconPositionUpdate());
    }

    initIcons() {
        this.soundIcon = new Image();
        this.soundIcon.src = this.audio.isMuted ? '../assets/img/ui_images/sound_off.svg' : '../assets/img/ui_images/sound_on.svg';
        this.settingsIcon = new Image();
        this.settingsIcon.src = '../assets/img/ui_images/settings.svg';
        this.fullscreenIcon = new Image();
        this.fullscreenIcon.src = '../assets/img/ui_images/fullscreen.svg';
        this.initIconProperties();
    }

    initIconProperties() {
        this.isFullscreen = false;
        this.soundIconX = 10;
        this.soundIconY = 10;
        this.soundIconWidth = 40;
        this.soundIconHeight = 40;
        this.settingsIconX = 60;
        this.settingsIconY = 10;
        this.settingsIconWidth = 40;
        this.settingsIconHeight = 40;
        this.fullscreenIconX = this.canvas.width - 50;
        this.fullscreenIconY = this.canvas.height - 50;
        this.fullscreenIconWidth = 40;
        this.fullscreenIconHeight = 40;
        this.audioInstances = [];
        this.soundIconHovered = false;
        this.settingsIconHovered = false;
        this.fullscreenIconHovered = false;
    }

    initSettingsWithDelay() {
        window.setTimeout(() => {
            this.initSettingsOverlay();
            const overlay = document.getElementById('settings-overlay');
            if (overlay) overlay.classList.add('d-none');
        }, 100);
    }

    handleMutedState() {
        if (this.isMuted) this.muteAllSounds();
    }

    setupFullscreenHandler() {
        document.addEventListener('fullscreenchange', () => {
            this.isFullscreen = !!document.fullscreenElement;
            document.body.classList.toggle('fullscreen', this.isFullscreen);
            this.updateFullscreenIcon();
        });
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
        this.ctx.save();
        if (this.soundIconHovered) {
            this.ctx.translate(this.soundIconX + this.soundIconWidth/2, this.soundIconY + this.soundIconHeight/2);
            this.ctx.scale(1.1, 1.1);
            this.ctx.translate(-(this.soundIconX + this.soundIconWidth/2), -(this.soundIconY + this.soundIconHeight/2));
        }
        this.ctx.drawImage(
            this.soundIcon,
            this.soundIconX,
            this.soundIconY,
            this.soundIconWidth,
            this.soundIconHeight
        );
        this.ctx.restore();
        this.ctx.save();
        if (this.settingsIconHovered) {
            this.ctx.translate(this.settingsIconX + this.settingsIconWidth/2, this.settingsIconY + this.settingsIconHeight/2);
            this.ctx.rotate(Math.PI/2);
            this.ctx.translate(-(this.settingsIconX + this.settingsIconWidth/2), -(this.settingsIconY + this.settingsIconHeight/2));
        }
        this.ctx.drawImage(
            this.settingsIcon,
            this.settingsIconX,
            this.settingsIconY,
            this.settingsIconWidth,
            this.settingsIconHeight
        );
        this.ctx.restore();
        const isSmallScreen = window.innerWidth < 720;
        const isLandscape = window.innerHeight < window.innerWidth;
        const shouldDisplayFullscreenIcon = !(isSmallScreen && isLandscape);
        
        if (shouldDisplayFullscreenIcon) {
            this.ctx.save();
            if (this.fullscreenIconHovered) {
                this.ctx.translate(this.fullscreenIconX + this.fullscreenIconWidth/2, this.fullscreenIconY + this.fullscreenIconHeight/2);
                this.ctx.scale(1.1, 1.1);
                this.ctx.translate(-(this.fullscreenIconX + this.fullscreenIconWidth/2), -(this.fullscreenIconY + this.fullscreenIconHeight/2));
            }
            this.ctx.drawImage(
                this.fullscreenIcon,
                this.fullscreenIconX,
                this.fullscreenIconY,
                this.fullscreenIconWidth,
                this.fullscreenIconHeight
            );
            this.ctx.restore();
        }
    }

    addMouseListeners() {
        this.canvas.addEventListener('mousemove', (event) => this.handleMouseMove(event));
        this.canvas.addEventListener('click', (event) => this.handleMouseClick(event));
        this.canvas.addEventListener('mouseout', () => this.handleMouseOut());
    }

    handleMouseMove(event) {
        const { relativeX, relativeY } = this.getRelativeCoordinates(event);
        this.checkIconHover(relativeX, relativeY);
    }

    handleMouseClick(event) {
        const { relativeX, relativeY } = this.getRelativeCoordinates(event);
        this.checkIconClick(relativeX, relativeY);
    }

    handleMouseOut() {
        this.soundIconHovered = false;
        this.settingsIconHovered = false;
        this.fullscreenIconHovered = false;
        this.canvas.style.cursor = 'default';
    }

    getRelativeCoordinates(event) {
        const rect = this.canvas.getBoundingClientRect();
        const { visibleWidth, visibleHeight, offsetX, offsetY } = this.getVisibleDimensions(rect);
        let relativeX, relativeY;
        
        if (this.isFullscreen) {
            relativeX = ((event.clientX - rect.left - offsetX) / visibleWidth) * this.canvas.width;
            relativeY = ((event.clientY - rect.top - offsetY) / visibleHeight) * this.canvas.height;
        } else {
            relativeX = (event.clientX - rect.left) / rect.width * this.canvas.width;
            relativeY = (event.clientY - rect.top) / rect.height * this.canvas.height;
        }
        
        return { relativeX, relativeY };
    }

    getVisibleDimensions(rect) {
        const canvasAspectRatio = this.canvas.width / this.canvas.height;
        const rectAspectRatio = rect.width / rect.height;
        let visibleWidth, visibleHeight, offsetX, offsetY;
        
        if (rectAspectRatio > canvasAspectRatio) {
            visibleHeight = rect.height;
            visibleWidth = visibleHeight * canvasAspectRatio;
            offsetX = (rect.width - visibleWidth) / 2;
            offsetY = 0;
        } else {
            visibleWidth = rect.width;
            visibleHeight = visibleWidth / canvasAspectRatio;
            offsetX = 0;
            offsetY = (rect.height - visibleHeight) / 2;
        }
        
        return { visibleWidth, visibleHeight, offsetX, offsetY };
    }

    checkIconHover(relativeX, relativeY) {
        const iconTolerance = 10;
        this.soundIconHovered = this.isPointInIcon(relativeX, relativeY, this.soundIconX, this.soundIconY, this.soundIconWidth, this.soundIconHeight, iconTolerance);
        this.settingsIconHovered = this.isPointInIcon(relativeX, relativeY, this.settingsIconX, this.settingsIconY, this.settingsIconWidth, this.settingsIconHeight, iconTolerance);
        this.fullscreenIconHovered = this.isPointInIcon(relativeX, relativeY, this.fullscreenIconX, this.fullscreenIconY, this.fullscreenIconWidth, this.fullscreenIconHeight, iconTolerance);

        this.canvas.style.cursor = (this.soundIconHovered || this.settingsIconHovered || this.fullscreenIconHovered) ? 'pointer' : 'default';
    }

    checkIconClick(relativeX, relativeY) {
        const iconTolerance = 10;
        
        if (this.isPointInIcon(relativeX, relativeY, this.soundIconX, this.soundIconY, this.soundIconWidth, this.soundIconHeight, iconTolerance)) {
            this.toggleSound();
        }
        
        if (this.isPointInIcon(relativeX, relativeY, this.settingsIconX, this.settingsIconY, this.settingsIconWidth, this.settingsIconHeight, iconTolerance)) {
            this.openSettings();
        }
        
        const isSmallScreen = window.innerWidth < 720;
        const isLandscape = window.innerHeight < window.innerWidth;
        const shouldDisplayFullscreenIcon = !(isSmallScreen && isLandscape);
        
        if (shouldDisplayFullscreenIcon && this.isPointInIcon(relativeX, relativeY, this.fullscreenIconX, this.fullscreenIconY, this.fullscreenIconWidth, this.fullscreenIconHeight, iconTolerance)) {
            this.toggleFullscreen();
        }
    }

    isPointInIcon(x, y, iconX, iconY, iconWidth, iconHeight, tolerance) {
        return x >= (iconX - tolerance) &&
               x <= (iconX + iconWidth + tolerance) &&
               y >= (iconY - tolerance) &&
               y <= (iconY + iconHeight + tolerance);
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            // Vollbildmodus aktivieren
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            } else if (document.documentElement.mozRequestFullScreen) { // Firefox
                document.documentElement.mozRequestFullScreen();
            } else if (document.documentElement.webkitRequestFullscreen) { // Chrome, Safari
                document.documentElement.webkitRequestFullscreen();
            } else if (document.documentElement.msRequestFullscreen) { // IE/Edge
                document.documentElement.msRequestFullscreen();
            }
            this.isFullscreen = true;
            document.body.classList.add('fullscreen');
        } else {
            // Vollbildmodus beenden
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
            this.isFullscreen = false;
            document.body.classList.remove('fullscreen');
        }
        this.updateFullscreenIcon();
        this.scheduleIconPositionUpdate();
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
        const scaleX = canvasRenderWidth / rect.width;
        const scaleY = canvasRenderHeight / rect.height;
        this.canvasScaleX = scaleX;
        this.canvasScaleY = scaleY;
    }

    initSettingsOverlay() {
        this.findDOMElements();
        this.setupCloseButtons();
        this.setupVolumeSliders();
        this.setupButtons();
    }

    findDOMElements() {
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
        this.legalNoticeBtn = document.getElementById('legal-notice-btn');
    }

    setupCloseButtons() {
        if (this.closeXBtn) this.closeXBtn.addEventListener('click', () => this.closeSettings());
        if (this.returnToGameBtn) this.returnToGameBtn.addEventListener('click', () => this.closeSettings());
        if (this.closeSettingsBtn) this.closeSettingsBtn.addEventListener('click', () => this.closeSettings());
    }

    setupVolumeSliders() {
        this.initSliderValues();
        this.setSliderEvents();
    }

    initSliderValues() {
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

    setSliderEvents() {
        this.setSliderEvent(this.characterSlider, this.characterValue, 'character', 'characterVolume');
        this.setSliderEvent(this.enemiesSlider, this.enemiesValue, 'enemies', 'enemiesVolume');
        this.setSliderEvent(this.objectsSlider, this.objectsValue, 'objects', 'objectsVolume');
        this.setSliderEvent(this.musicSlider, this.musicValue, 'music', 'musicVolume');
    }

    setSliderEvent(slider, valueDisplay, category, storageKey) {
        if (slider) {
            slider.addEventListener('input', () => {
                const value = parseInt(slider.value);
                this[category + 'Volume'] = value;
                valueDisplay.textContent = value;
                this.updateCategoryVolume(category);
                localStorage.setItem('elPolloLoco_' + storageKey, value);
            });
        }
    }

    setupButtons() {
        if (this.exitGameBtn) {
            this.exitGameBtn.addEventListener('click', () => {
                this.showCustomConfirm(() => window.location.reload());
            });
        }
        
        if (this.legalNoticeBtn) {
            this.legalNoticeBtn.addEventListener('click', () => {
                window.open('../html/legal_notice.html', '_blank');
            });
        }
    }

    openSettings() {
        this.handleWorldPause();
        this.handleTabSwitching();
        this.positionOverlay();
    }

    handleWorldPause() {
        if (this.canvas && window.world) {
            window.world.isPaused = true;
            const exitGameBtn = document.getElementById('exit-game');
            if (exitGameBtn) exitGameBtn.style.display = 'block';
        }
    }

    handleTabSwitching() {
        if (window.mainMenu) {
            window.mainMenu.switchTab('game');
        } else {
            this.switchToGameTab();
        }
    }

    switchToGameTab() {
        const elements = ['game-tab', 'how-to-play-tab', 'audio-tab', 'game-content', 'how-to-play-content', 'audio-content'];
        const elementRefs = elements.map(id => document.getElementById(id));
        
        const gameTab = elementRefs[0];
        const howToPlayTab = elementRefs[1];
        const audioTab = elementRefs[2];
        const gameContent = elementRefs[3];
        const howToPlayContent = elementRefs[4];
        const audioContent = elementRefs[5];
        
        if (gameTab) gameTab.classList.remove('active');
        if (howToPlayTab) howToPlayTab.classList.remove('active');
        if (audioTab) audioTab.classList.remove('active');
        if (gameContent) gameContent.classList.add('d-none');
        if (howToPlayContent) howToPlayContent.classList.add('d-none');
        if (audioContent) audioContent.classList.add('d-none');
        if (gameTab) gameTab.classList.add('active');
        if (gameContent) gameContent.classList.remove('d-none');
    }

    positionOverlay() {
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

    closeSettings(){
        if (window.world) {
            window.world.isPaused = false;
            setTimeout(() => {
                if (window.world) {
                    window.world.isPaused = false;
                }
            }, 50);
        }
        const settingsOverlay = document.getElementById('settings-overlay');
        if (settingsOverlay) {
            settingsOverlay.classList.remove('show');
            settingsOverlay.classList.add('d-none');
            setTimeout(() => {
                if (settingsOverlay) {
                    settingsOverlay.removeAttribute('style');
                }
            }, 100);
        }
    }

    switchTab(tabName) {
        this.generalTab.classList.remove('active');
        this.audioTab.classList.remove('active');
        this.generalContent.classList.add('d-none');
        this.audioContent.classList.add('d-none');
        if (tabName === 'general') {
            this.generalTab.classList.add('active');
            this.generalContent.classList.remove('d-none');
        } else if (tabName === 'audio') {
            this.audioTab.classList.add('active');
            this.audioContent.classList.remove('d-none');
        }
    }

    updateVolume() {
        this.updateCategoryVolume('character');
        this.updateCategoryVolume('enemies');
        this.updateCategoryVolume('objects');
        this.updateCategoryVolume('music');
    }

    toggleSound() {
        this.audio.toggleSound();
        this.updateSoundIcon();
    }

    updateSoundIcon() {
        if (this.soundIcon) {
            this.soundIcon.src = this.audio.isMuted 
                ? '../assets/img/ui_images/sound_off.svg' 
                : '../assets/img/ui_images/sound_on.svg';
        }
    }

    registerAudio(audio) {
        this.audio.registerAudio(audio);
    }

    registerAudioWithCategory(audio, category) {
        this.audio.registerAudioWithCategory(audio, category);
    }

    muteAllSounds() {
        this.audio.muteAllSounds();
    }

    unmuteAllSounds() {
        this.audio.unmuteAllSounds();
    }

    updateCategoryVolume(category) {
        this.audio.updateCategoryVolume(category);
    }


    showCustomConfirm(onConfirm) {
        const { customConfirm, yesBtn, noBtn } = this.getConfirmElements();
        this.showConfirmDialog(customConfirm);
        this.setupConfirmListeners(customConfirm, yesBtn, noBtn, onConfirm);
    }

    getConfirmElements() {
        return {
            customConfirm: document.getElementById('custom-confirm'),
            yesBtn: document.getElementById('confirm-yes'),
            noBtn: document.getElementById('confirm-no')
        };
    }

    showConfirmDialog(customConfirm) {
        customConfirm.classList.remove('d-none');
        customConfirm.classList.add('show');
        const canvasRect = this.canvas.getBoundingClientRect();
        customConfirm.style.top = `${canvasRect.top}px`;
        customConfirm.style.left = `${canvasRect.left}px`;
        customConfirm.style.width = `${canvasRect.width}px`;
        customConfirm.style.height = `${canvasRect.height}px`;
    }

    setupConfirmListeners(customConfirm, yesBtn, noBtn, onConfirm) {
        const handleYes = () => {
            this.closeConfirmDialog(customConfirm, yesBtn, noBtn, handleYes, handleNo);
            if (onConfirm) onConfirm();
        };
        
        const handleNo = () => {
            this.closeConfirmDialog(customConfirm, yesBtn, noBtn, handleYes, handleNo);
        };
        
        yesBtn.addEventListener('click', handleYes);
        noBtn.addEventListener('click', handleNo);
    }

    closeConfirmDialog(customConfirm, yesBtn, noBtn, handleYes, handleNo) {
        customConfirm.classList.remove('show');
        customConfirm.classList.add('d-none');
        yesBtn.removeEventListener('click', handleYes);
        noBtn.removeEventListener('click', handleNo);
    }

    getAudioProperty(property) {
        return this.audio[property];
    }

    setAudioProperty(property, value) {
        this.audio[property] = value;
    }

    get isMuted() {
        return this.audio.isMuted;
    }

    get characterVolume() { return this.getAudioProperty('characterVolume'); }
    set characterVolume(value) { this.setAudioProperty('characterVolume', value); }

    get enemiesVolume() { return this.getAudioProperty('enemiesVolume'); }
    set enemiesVolume(value) { this.setAudioProperty('enemiesVolume', value); }

    get objectsVolume() { return this.getAudioProperty('objectsVolume'); }
    set objectsVolume(value) { this.setAudioProperty('objectsVolume', value); }

    get musicVolume() { return this.getAudioProperty('musicVolume'); }
    set musicVolume(value) { this.setAudioProperty('musicVolume', value); }

    get backgroundMusic() { return this.audio.backgroundMusic; }
    set backgroundMusic(value) { this.audio.backgroundMusic = value; }
}