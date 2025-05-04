/**
 * Handles all user interactions for the El Pollo Loco game interface.
 * Manages mouse events, coordinate calculations, and fullscreen functionality.
 * @class
 */
class UIInteractionHandler {
    /**
     * Creates a new UIInteractionHandler instance.
     * @param {HTMLCanvasElement} canvas - The canvas element for interaction
     * @param {UserInterface} parentUI - Reference to the parent UserInterface
     */
    constructor(canvas, parentUI) {
        this.canvas = canvas;
        this.parentUI = parentUI;
        this.isFullscreen = false;
        this._handleMouseMove = null;
        this._handleMouseClick = null;
        this._handleMouseOut = null;
        this.setupFullscreenHandler();
        this.addMouseListeners();
    }

    /**
     * Sets up the fullscreen change event handler.
     */
    setupFullscreenHandler() {
        document.addEventListener('fullscreenchange', () => {
            this.isFullscreen = !!document.fullscreenElement;
            document.body.classList.toggle('fullscreen', this.isFullscreen);
            this.parentUI.iconManager.updateFullscreenIcon(this.isFullscreen);
        });
    }

    /**
     * Adds mouse event listeners to the canvas.
     */
    addMouseListeners() {
        if (this._handleMouseMove) {
            this.canvas.removeEventListener('mousemove', this._handleMouseMove);
            this.canvas.removeEventListener('click', this._handleMouseClick);
            this.canvas.removeEventListener('mouseout', this._handleMouseOut);
        }
        this._handleMouseMove = (event) => this.handleMouseMove(event);
        this._handleMouseClick = (event) => this.handleMouseClick(event);
        this._handleMouseOut = () => this.handleMouseOut();
        this.canvas.addEventListener('mousemove', this._handleMouseMove);
        this.canvas.addEventListener('click', this._handleMouseClick);
        this.canvas.addEventListener('mouseout', this._handleMouseOut);
    }

    /**
     * Handles mouse movement over the canvas.
     * @param {MouseEvent} event - The mouse event
     */
    handleMouseMove(event) {
        const relativePos = this.calculateRelativeCoordinates(event);
        this.parentUI.iconManager.checkIconHoverStates(relativePos.x, relativePos.y);
        this.updateCursor();
    }

    /**
     * Handles mouse clicks on the canvas.
     * @param {MouseEvent} event - The mouse event
     */
    handleMouseClick(event) {
        const relativePos = this.calculateRelativeCoordinates(event);
        const clickedIcon = this.parentUI.iconManager.getClickedIcon(relativePos.x, relativePos.y);
        
        if (clickedIcon === 'sound') {
            this.parentUI.toggleSound();
        } else if (clickedIcon === 'settings') {
            this.parentUI.openSettings();
        } else if (clickedIcon === 'fullscreen') {
            this.toggleFullscreen();
        }
    }

    /**
     * Handles mouse out events for the canvas.
     */
    handleMouseOut() {
        this.parentUI.iconManager.resetHoverStates();
        this.canvas.style.cursor = 'default';
    }

    /**
     * Updates the cursor style based on icon hover states.
     */
    updateCursor() {
        const isHovering = 
            this.parentUI.iconManager.soundIconHovered || 
            this.parentUI.iconManager.settingsIconHovered || 
            this.parentUI.iconManager.fullscreenIconHovered;
            
        this.canvas.style.cursor = isHovering ? 'pointer' : 'default';
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
     * Toggles between fullscreen and normal display mode.
     */
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            this.enterFullscreen();
        } else {
            this.exitFullscreen();
        }
        this.parentUI.iconManager.updateFullscreenIcon(this.isFullscreen);
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
     * Schedules multiple updates to icon positions to ensure proper rendering after DOM changes.
     */
    scheduleIconPositionUpdate() {
        this.parentUI.iconManager.updateIconPositions();
        this.parentUI.iconManager.updateIconHitboxes();
        setTimeout(() => {
            this.parentUI.iconManager.updateIconPositions();
            this.parentUI.iconManager.updateIconHitboxes();
        }, 100);
        setTimeout(() => {
            this.parentUI.iconManager.updateIconPositions();
            this.parentUI.iconManager.updateIconHitboxes();
        }, 300);
    }

    /**
     * Reregisters the event listeners for the canvas.
     */
    reregisterEventListeners() {
        this.canvas.removeEventListener('mousemove', this._handleMouseMove);
        this.canvas.removeEventListener('click', this._handleMouseClick);
        this.canvas.removeEventListener('mouseout', this._handleMouseOut);
        this._handleMouseMove = (event) => this.handleMouseMove(event);
        this._handleMouseClick = (event) => this.handleMouseClick(event);
        this._handleMouseOut = () => this.handleMouseOut();
        this.canvas.addEventListener('mousemove', this._handleMouseMove);
        this.canvas.addEventListener('click', this._handleMouseClick);
        this.canvas.addEventListener('mouseout', this._handleMouseOut);
    }

    /**
     * Gets the current fullscreen state.
     * @returns {boolean} Whether the UI is currently in fullscreen mode
     */
    getFullscreenState() {
        return this.isFullscreen;
    }
}