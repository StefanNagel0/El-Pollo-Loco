class UserInterface extends DrawableObject {
    constructor(canvas) {
        super();
        this.initializeBasicProperties(canvas);
        this.audioManager = new AudioManager(canvas);
        this.initializeIcons(canvas);
        this.setupInitialState();
    }

    initializeBasicProperties(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.isMuted = localStorage.getItem('elPolloLoco_isMuted') === 'true';
        this.soundIconHovered = false;
        this.settingsIconHovered = false;
        this.fullscreenIconHovered = false;
        this.isFullscreen = false;
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
        if (this.isMuted) this.audioManager.muteAllSounds();
        this.setupFullscreenHandler();
        this.audioManager.initBackgroundMusic();
        this.setupErrorHandlers();
        window.addEventListener('resize', () => this.scheduleIconPositionUpdate());
    }

    initSettingsAndOverlay() {
        this.audioManager.initSettingsOverlay();
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
        this.ctx.translate(x + width / 2, y + height / 2);
        this.ctx.scale(1.1, 1.1);
        this.ctx.translate(-(x + width / 2), -(y + height / 2));
    }

    applyRotationEffect(x, y, width, height) {
        this.ctx.translate(x + width / 2, y + height / 2);
        this.ctx.rotate(Math.PI / 2);
        this.ctx.translate(-(x + width / 2), -(y + height / 2));
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

    openSettings() {
        this.pauseGameAndShowExitButton();
        this.activateDefaultTab();
        this.audioManager.positionAndShowOverlay();
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

    closeSettings() {
        this.resumeGame();
        this.audioManager.hideOverlay();
    }

    resumeGame() {
        if (window.world) {
            window.world.isPaused = false;
            setTimeout(() => {
                if (window.world) window.world.isPaused = false;
            }, 50);
        }
    }

    toggleSound() {
        this.isMuted = !this.isMuted;
        localStorage.setItem('elPolloLoco_isMuted', this.isMuted);
        if (this.isMuted) {
            this.updateSoundIcon();
            this.audioManager.muteAllSounds();
            this.audioManager.pauseBackgroundMusic();
        } else {
            this.updateSoundIcon();
            this.audioManager.unmuteAllSounds();
            this.audioManager.playBackgroundMusic();
        }
    }

    updateSoundIcon() {
        if (this.soundIcon) {
            this.soundIcon.src = this.isMuted
                ? '../assets/img/ui_images/sound_off.svg'
                : '../assets/img/ui_images/sound_on.svg';
        }
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

    registerAudio(audio) {
        this.audioManager.registerAudio(audio);
    }

    registerAudioWithCategory(audio, category) {
        this.audioManager.registerAudioWithCategory(audio, category);
    }

    get characterVolume() { return this.audioManager.characterVolume; }
    get enemiesVolume() { return this.audioManager.enemiesVolume; }
    get objectsVolume() { return this.audioManager.objectsVolume; }
    get musicVolume() { return this.audioManager.musicVolume; }
    get backgroundMusic() { return this.audioManager.backgroundMusic; }
}