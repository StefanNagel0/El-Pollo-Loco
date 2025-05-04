/**
 * Manages the UI icons for the El Pollo Loco game interface.
 * Handles icon rendering, positioning, interactions and effects.
 * @class
 */
class UIIconManager {
    /**
     * Creates a new UIIconManager instance.
     * @param {HTMLCanvasElement} canvas - The canvas element for drawing icons
     * @param {Object} settings - Settings object containing initial properties
     */
    constructor(canvas, settings) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.isMuted = settings.isMuted || false;
        this.isFullscreen = settings.isFullscreen || false;
        this.soundIconHovered = false;
        this.settingsIconHovered = false;
        this.fullscreenIconHovered = false;
        this.initializeIcons();
        this.initializeIconDimensions(canvas);
        this.setupErrorHandlers();
    }

    /**
     * Initializes the UI icons with their respective images.
     */
    initializeIcons() {
        this.soundIcon = new Image();
        this.soundIcon.src = this.isMuted ? 
            '../assets/img/ui_images/sound_off.svg' : 
            '../assets/img/ui_images/sound_on.svg';
        this.settingsIcon = new Image();
        this.settingsIcon.src = '../assets/img/ui_images/settings.svg';
        this.fullscreenIcon = new Image();
        this.fullscreenIcon.src = '../assets/img/ui_images/fullscreen.svg';
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
     * Checks which icon was clicked and returns the action to take.
     * @param {number} x - Mouse x-coordinate relative to canvas
     * @param {number} y - Mouse y-coordinate relative to canvas
     * @returns {string|null} The action to take ('sound', 'settings', 'fullscreen') or null if no icon was clicked
     */
    getClickedIcon(x, y) {
        const tolerance = 10;
        if (this.isPointInRect(x, y, this.soundIconX, this.soundIconY, this.soundIconWidth, this.soundIconHeight, tolerance)) {
            return 'sound';
        } 
        if (this.isPointInRect(x, y, this.settingsIconX, this.settingsIconY, this.settingsIconWidth, this.settingsIconHeight, tolerance)) {
            return 'settings';
        }
        const isSmallScreen = window.innerWidth < 720;
        const isLandscape = window.innerHeight < window.innerWidth;
        const shouldDisplayFullscreenIcon = !(isSmallScreen && isLandscape);
        if (shouldDisplayFullscreenIcon && 
            this.isPointInRect(x, y, this.fullscreenIconX, this.fullscreenIconY, this.fullscreenIconWidth, this.fullscreenIconHeight, tolerance)) {
            return 'fullscreen';
        }
        return null;
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
     * Updates the sound icon based on current mute state.
     * @param {boolean} isMuted - Whether the sound is currently muted
     */
    updateSoundIcon(isMuted) {
        this.isMuted = isMuted;
        if (this.soundIcon) {
            this.soundIcon.src = this.isMuted
                ? '../assets/img/ui_images/sound_off.svg'
                : '../assets/img/ui_images/sound_on.svg';
        }
    }

    /**
     * Updates the fullscreen icon based on current fullscreen state.
     * @param {boolean} isFullscreen - Whether fullscreen mode is currently active
     */
    updateFullscreenIcon(isFullscreen) {
        this.isFullscreen = isFullscreen;
        this.fullscreenIcon.src = this.isFullscreen
            ? '../assets/img/ui_images/fullscreen_exit.svg'
            : '../assets/img/ui_images/fullscreen.svg';
    }

    /**
     * Resets all hover states and cursor style.
     */
    resetHoverStates() {
        this.soundIconHovered = false;
        this.settingsIconHovered = false;
        this.fullscreenIconHovered = false;
    }

    /**
     * Reloads all icon images.
     */
    reloadIcons() {
        this.soundIcon = new Image();
        this.soundIcon.src = this.isMuted ? '../assets/img/ui_images/sound_off.svg' : '../assets/img/ui_images/sound_on.svg';
        this.settingsIcon = new Image();
        this.settingsIcon.src = '../assets/img/ui_images/settings.svg';
        this.fullscreenIcon = new Image();
        this.fullscreenIcon.src = this.isFullscreen ? '../assets/img/ui_images/fullscreen_exit.svg' : '../assets/img/ui_images/fullscreen.svg';
        this.setupErrorHandlers();
    }
}