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
        this.initializeIcons(canvas);
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
        this.soundIconHovered = false;
        this.settingsIconHovered = false;
        this.fullscreenIconHovered = false;
        this.isFullscreen = false;
    }

    /**
     * Initializes the UI icons.
     * @param {HTMLCanvasElement} canvas - The canvas element for the UI
     */
    initializeIcons(canvas) {
        this.soundIcon = new Image();
        this.soundIcon.src = this.isMuted ? '../assets/img/ui_images/sound_off.svg' : '../assets/img/ui_images/sound_on.svg';
        this.settingsIcon = new Image();
        this.settingsIcon.src = '../assets/img/ui_images/settings.svg';
        this.fullscreenIcon = new Image();
        this.fullscreenIcon.src = '../assets/img/ui_images/fullscreen.svg';
        this.initializeIconDimensions(canvas);
    }

    /**
     * Sets the initial dimensions and positions of UI icons.
     * @param {HTMLCanvasElement} canvas - The canvas element for the UI
     */
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

    /**
     * Sets up the initial state of the UI, including event listeners and settings.
     */
    setupInitialState() {
        this.addMouseListeners();
        setTimeout(() => this.initSettingsAndOverlay(), 100);
        if (this.isMuted) this.audioManager.muteAllSounds();
        this.setupFullscreenHandler();
        this.audioManager.initBackgroundMusic();
        this.setupErrorHandlers();
        window.addEventListener('resize', () => this.scheduleIconPositionUpdate());
    }

    /**
     * Initializes the settings overlay.
     */
    initSettingsAndOverlay() {
        this.audioManager.initSettingsOverlay();
        const overlay = document.getElementById('settings-overlay');
        if (overlay) overlay.classList.add('d-none');
    }

    /**
     * Sets up the fullscreen change event handler.
     */
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

    /**
     * Sets up error handlers for icons to prevent uncaught exceptions.
     */
    setupErrorHandlers() {
        this.soundIcon.onerror = () => {};
        this.settingsIcon.onerror = () => {};
        this.fullscreenIcon.onerror = () => {};
    }

    /**
     * Updates the positions of UI icons based on canvas dimensions.
     */
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

    /**
     * Draws all UI icons on the canvas.
     */
    drawIcons() {
        this.updateIconPositions();
        this.drawSoundIcon();
        this.drawSettingsIcon();
        this.drawFullscreenIconIfNeeded();
    }

    /**
     * Draws the sound icon with hover effect if applicable.
     */
    drawSoundIcon() {
        this.ctx.save();
        if (this.soundIconHovered) {
            this.applyHoverEffect(this.soundIconX, this.soundIconY, this.soundIconWidth, this.soundIconHeight);
        }
        this.ctx.drawImage(this.soundIcon, this.soundIconX, this.soundIconY, this.soundIconWidth, this.soundIconHeight);
        this.ctx.restore();
    }

    /**
     * Draws the settings icon with rotation effect if hovered.
     */
    drawSettingsIcon() {
        this.ctx.save();
        if (this.settingsIconHovered) {
            this.applyRotationEffect(this.settingsIconX, this.settingsIconY, this.settingsIconWidth, this.settingsIconHeight);
        }
        this.ctx.drawImage(this.settingsIcon, this.settingsIconX, this.settingsIconY, this.settingsIconWidth, this.settingsIconHeight);
        this.ctx.restore();
    }

    /**
     * Draws the fullscreen icon if appropriate for the current screen size.
     */
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

    /**
     * Applies a hover scale effect to an icon.
     * @param {number} x - X-coordinate of the icon
     * @param {number} y - Y-coordinate of the icon
     * @param {number} width - Width of the icon
     * @param {number} height - Height of the icon
     */
    applyHoverEffect(x, y, width, height) {
        this.ctx.translate(x + width / 2, y + height / 2);
        this.ctx.scale(1.1, 1.1);
        this.ctx.translate(-(x + width / 2), -(y + height / 2));
    }

    /**
     * Applies a rotation effect to an icon.
     * @param {number} x - X-coordinate of the icon
     * @param {number} y - Y-coordinate of the icon
     * @param {number} width - Width of the icon
     * @param {number} height - Height of the icon
     */
    applyRotationEffect(x, y, width, height) {
        this.ctx.translate(x + width / 2, y + height / 2);
        this.ctx.rotate(Math.PI / 2);
        this.ctx.translate(-(x + width / 2), -(y + height / 2));
    }

    /**
     * Adds mouse event listeners to the canvas.
     */
    addMouseListeners() {
        this.canvas.addEventListener('mousemove', (event) => this.handleMouseMove(event));
        this.canvas.addEventListener('click', (event) => this.handleMouseClick(event));
        this.canvas.addEventListener('mouseout', () => this.handleMouseOut());
    }

    /**
     * Handles mouse movement over the canvas.
     * @param {MouseEvent} event - The mouse event
     */
    handleMouseMove(event) {
        const relativePos = this.calculateRelativeCoordinates(event);
        this.checkIconHoverStates(relativePos.x, relativePos.y);
        this.updateCursor();
    }

    /**
     * Handles mouse clicks on the canvas.
     * @param {MouseEvent} event - The mouse event
     */
    handleMouseClick(event) {
        const relativePos = this.calculateRelativeCoordinates(event);
        this.checkIconClick(relativePos.x, relativePos.y);
    }

    /**
     * Handles mouse out events for the canvas.
     */
    handleMouseOut() {
        this.soundIconHovered = false;
        this.settingsIconHovered = false;
        this.fullscreenIconHovered = false;
        this.canvas.style.cursor = 'default';
    }

    /**
     * Calculates coordinates relative to the canvas based on mouse position.
     * @param {MouseEvent} event - The mouse event
     * @returns {Object} The calculated x and y coordinates relative to the canvas
     */
    calculateRelativeCoordinates(event) {
        const rect = this.canvas.getBoundingClientRect();
        const canvasAspectRatio = this.canvas.width / this.canvas.height;
        const rectAspectRatio = rect.width / rect.height;
        return this.isFullscreen
            ? this.getFullscreenCoordinates(event, rect, canvasAspectRatio, rectAspectRatio)
            : this.getNormalCoordinates(event, rect);
    }

    /**
     * Calculates mouse coordinates when in fullscreen mode.
     * @param {MouseEvent} event - The mouse event
     * @param {DOMRect} rect - The canvas bounding rectangle
     * @param {number} canvasAspectRatio - The canvas aspect ratio
     * @param {number} rectAspectRatio - The canvas element's aspect ratio
     * @returns {Object} The calculated x and y coordinates
     */
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

    /**
     * Calculates mouse coordinates in normal (non-fullscreen) mode.
     * @param {MouseEvent} event - The mouse event
     * @param {DOMRect} rect - The canvas bounding rectangle
     * @returns {Object} The calculated x and y coordinates
     */
    getNormalCoordinates(event, rect) {
        return {
            x: (event.clientX - rect.left) / rect.width * this.canvas.width,
            y: (event.clientY - rect.top) / rect.height * this.canvas.height
        };
    }

    /**
     * Checks if any icons are being hovered over.
     * @param {number} x - Mouse x-coordinate relative to canvas
     * @param {number} y - Mouse y-coordinate relative to canvas
     */
    checkIconHoverStates(x, y) {
        const tolerance = 10;
        this.soundIconHovered = this.isPointInRect(x, y, this.soundIconX, this.soundIconY, this.soundIconWidth, this.soundIconHeight, tolerance);
        this.settingsIconHovered = this.isPointInRect(x, y, this.settingsIconX, this.settingsIconY, this.settingsIconWidth, this.settingsIconHeight, tolerance);
        this.fullscreenIconHovered = this.isPointInRect(x, y, this.fullscreenIconX, this.fullscreenIconY, this.fullscreenIconWidth, this.fullscreenIconHeight, tolerance);
    }

    /**
     * Updates the cursor style based on icon hover states.
     */
    updateCursor() {
        this.canvas.style.cursor = (this.soundIconHovered || this.settingsIconHovered || this.fullscreenIconHovered) ? 'pointer' : 'default';
    }

    /**
     * Checks if an icon has been clicked and triggers the appropriate action.
     * @param {number} x - Mouse x-coordinate relative to canvas
     * @param {number} y - Mouse y-coordinate relative to canvas
     */
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

    /**
     * Checks if the fullscreen icon has been clicked and toggles fullscreen if appropriate.
     * @param {number} x - Mouse x-coordinate relative to canvas
     * @param {number} y - Mouse y-coordinate relative to canvas
     * @param {number} tolerance - Click detection tolerance in pixels
     */
    checkFullscreenClick(x, y, tolerance) {
        const isSmallScreen = window.innerWidth < 720;
        const isLandscape = window.innerHeight < window.innerWidth;
        const shouldDisplayFullscreenIcon = !(isSmallScreen && isLandscape);
        if (shouldDisplayFullscreenIcon && this.isPointInRect(x, y, this.fullscreenIconX, this.fullscreenIconY, this.fullscreenIconWidth, this.fullscreenIconHeight, tolerance)) {
            this.toggleFullscreen();
        }
    }

    /**
     * Determines if a point is within a rectangle with optional tolerance.
     * @param {number} x - Point x-coordinate
     * @param {number} y - Point y-coordinate
     * @param {number} rectX - Rectangle x-coordinate
     * @param {number} rectY - Rectangle y-coordinate
     * @param {number} rectWidth - Rectangle width
     * @param {number} rectHeight - Rectangle height
     * @param {number} tolerance - Additional tolerance around the rectangle
     * @returns {boolean} True if the point is within the rectangle
     */
    isPointInRect(x, y, rectX, rectY, rectWidth, rectHeight, tolerance = 0) {
        return x >= (rectX - tolerance) && x <= (rectX + rectWidth + tolerance) &&
            y >= (rectY - tolerance) && y <= (rectY + rectHeight + tolerance);
    }

    /**
     * Toggles between fullscreen and normal display mode.
     */
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            this.enterFullscreen();
        } else {
            this.exitFullscreen();
        }
        this.updateFullscreenIcon();
        this.scheduleIconPositionUpdate();
    }

    /**
     * Enters fullscreen mode.
     */
    enterFullscreen() {
        const element = document.documentElement;
        if (element.requestFullscreen) element.requestFullscreen();
        else if (element.mozRequestFullScreen) element.mozRequestFullScreen();
        else if (element.webkitRequestFullscreen) element.webkitRequestFullscreen();
        else if (element.msRequestFullscreen) element.msRequestFullscreen();
        this.isFullscreen = true;
        document.body.classList.add('fullscreen');
    }

    /**
     * Exits fullscreen mode.
     */
    exitFullscreen() {
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        else if (document.msExitFullscreen) document.msExitFullscreen();
        this.isFullscreen = false;
        document.body.classList.remove('fullscreen');
    }

    /**
     * Updates the fullscreen icon based on current fullscreen state.
     */
    updateFullscreenIcon() {
        this.fullscreenIcon.src = this.isFullscreen
            ? '../assets/img/ui_images/fullscreen_exit.svg'
            : '../assets/img/ui_images/fullscreen.svg';
    }

    /**
     * Schedules multiple updates to icon positions to ensure proper rendering after DOM changes.
     */
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

    /**
     * Updates the icon hitboxes based on canvas scaling.
     */
    updateIconHitboxes() {
        const rect = this.canvas.getBoundingClientRect();
        const canvasRenderWidth = this.canvas.width;
        const canvasRenderHeight = this.canvas.height;
        this.canvasScaleX = canvasRenderWidth / rect.width;
        this.canvasScaleY = canvasRenderHeight / rect.height;
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
            this.updateSoundIcon();
            this.audioManager.muteAllSounds();
            this.audioManager.pauseBackgroundMusic();
        } else {
            this.updateSoundIcon();
            this.audioManager.unmuteAllSounds();
            this.audioManager.playBackgroundMusic();
        }
    }

    /**
     * Updates the sound icon based on current mute state.
     */
    updateSoundIcon() {
        if (this.soundIcon) {
            this.soundIcon.src = this.isMuted
                ? '../assets/img/ui_images/sound_off.svg'
                : '../assets/img/ui_images/sound_on.svg';
        }
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
}