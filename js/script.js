/**
 * Script to handle mobile and UI interactions for El Pollo Loco game.
 * Manages device orientation, mobile controls, and UI element behaviors.
 * @file script.js
 */

window.scriptIntervals = window.scriptIntervals || [];

/**
 * Checks device orientation and adapts the UI accordingly.
 * Shows rotation video on small screens in portrait mode and hides game elements.
 */
function checkOrientation() {
    const videoContainer = getOrCreateVideoContainer();
    const mainMenu = document.getElementById('main-menu');
    const isPortrait = window.innerHeight > window.innerWidth;
    const isSmallScreen = window.innerWidth < 720;
    if (isPortrait && isSmallScreen) {
        handlePortraitMode(videoContainer, mainMenu);
    } else {
        handleLandscapeMode(videoContainer, mainMenu);
    }
    updateMobileControlsVisibility();
}

/**
 * Gets the rotation video container or creates it if it doesn't exist.
 * @returns {HTMLElement} The rotation video container element
 */
function getOrCreateVideoContainer() {
    let videoContainer = document.getElementById('rotation-video-container');
    if (!videoContainer) {
        videoContainer = createVideoContainer();
    }
    return videoContainer;
}

/**
 * Creates the rotation video container with a video element.
 * @returns {HTMLElement} The newly created video container
 */
function createVideoContainer() {
    const videoContainer = document.createElement('div');
    videoContainer.id = 'rotation-video-container';
    videoContainer.classList.add('d-none');
    const video = document.createElement('video');
    video.src = '../assets/videos/rotate_your_phone.mp4';
    video.autoplay = true;
    video.loop = true;
    video.muted = true;
    video.playsinline = true;
    videoContainer.appendChild(video);
    document.body.appendChild(videoContainer);
    return videoContainer;
}

/**
 * Handles UI adjustments for portrait mode on small screens.
 * Shows the rotation video and hides game elements.
 * @param {HTMLElement} videoContainer - The rotation video container element
 * @param {HTMLElement} mainMenu - The main menu element
 */
function handlePortraitMode(videoContainer, mainMenu) {
    videoContainer.classList.add('show-rotation-video');
    if (mainMenu) mainMenu.classList.add('d-none');
    const canvas = document.getElementById('canvas');
    if (canvas) canvas.classList.add('d-none');
    const video = videoContainer.querySelector('video');
    if (video) video.play().catch(e => {});
}

/**
 * Handles UI adjustments for landscape mode.
 * Hides the rotation video and shows game elements.
 * @param {HTMLElement} videoContainer - The rotation video container element
 * @param {HTMLElement} mainMenu - The main menu element
 */
function handleLandscapeMode(videoContainer, mainMenu) {
    videoContainer.classList.remove('show-rotation-video');
    if (mainMenu) mainMenu.classList.remove('d-none');
    const canvas = document.getElementById('canvas');
    if (canvas) canvas.classList.remove('d-none');
}

/**
 * Updates the visibility of mobile controls based on screen orientation and game state.
 * Shows controls on small screens in landscape mode when the game is active.
 */
function updateMobileControlsVisibility() {
    const mobileControls = document.getElementById('mobile-controls');
    if (!mobileControls) return;
    const isLandscape = window.innerHeight < window.innerWidth;
    const isSmallScreen = window.innerWidth < 720;
    if (isLandscape && isSmallScreen) {
        const gameActive = isGameActive();
        mobileControls.style.display = gameActive ? 'flex' : 'none';
    } else {
        mobileControls.style.display = 'none';
    }
}

/**
 * Determines if the game is currently active.
 * Game is active if world exists, is not paused, and no overlay screens are showing.
 * @returns {boolean} True if the game is active and should show controls
 */
function isGameActive() {
    return window.world && 
        !window.world.isPaused && 
        document.getElementById('main-menu')?.classList.contains('d-none') &&
        !document.getElementById('settings-overlay')?.classList.contains('show') &&
        !document.getElementById('game-over-screen')?.classList.contains('show') &&
        !document.getElementById('game-won-screen')?.classList.contains('show') &&
        !document.getElementById('custom-confirm')?.classList.contains('show');
}

/**
 * Initializes mobile control buttons and their event listeners.
 * Sets up touch events for movement and action buttons.
 */
function initMobileControls() {
    setupButton('button-left', 'LEFT');
    setupButton('button-right', 'RIGHT');
    setupButton('button-jump', 'SPACE');
    setupButton('button-throw', 'D');
    preventScrollOnMobileControls();
}

/**
 * Sets up touch event handlers for a mobile control button.
 * @param {string} buttonId - The ID of the button element to set up
 * @param {string} keyAction - The keyboard action to trigger
 */
function setupButton(buttonId, keyAction) {
    const button = document.getElementById(buttonId);
    if (!button) return;
    button.addEventListener('touchstart', (e) => {
        e.preventDefault();
        e.currentTarget.classList.add('active');
        updateKeyboardState(keyAction, true);
    }, { passive: false });
    button.addEventListener('touchend', (e) => {
        e.preventDefault();
        e.currentTarget.classList.remove('active');
        updateKeyboardState(keyAction, false);
    }, { passive: false });
    button.addEventListener('touchcancel', (e) => {
        e.preventDefault();
        e.currentTarget.classList.remove('active');
        updateKeyboardState(keyAction, false);
    }, { passive: false });
}

/**
 * Updates the keyboard state in the game based on mobile control interactions.
 * @param {string} keyAction - The keyboard action to update
 * @param {boolean} isActive - Whether the action is active or not
 */
function updateKeyboardState(keyAction, isActive) {
    if (window.keyboard) window.keyboard[keyAction] = isActive;
    if (window.world && window.world.keyboard) window.world.keyboard[keyAction] = isActive;
}

/**
 * Prevents page scrolling when interacting with mobile controls.
 * Adds touchmove event handler to prevent default behavior.
 */
function preventScrollOnMobileControls() {
    const mobileControls = document.getElementById('mobile-controls');
    if (mobileControls) {
        mobileControls.addEventListener('touchmove', (e) => {
            if (e.target.closest('.mobile-control-button')) e.preventDefault();
        }, { passive: false });
    }
}

/**
 * Sets up observers for game state changes to update mobile controls visibility.
 * Starts periodic checks and observes the world's paused state.
 */
function setupGameStateObserver() {
    const mobileControls = document.getElementById('mobile-controls');
    if (!mobileControls) return;
    startPeriodicVisibilityCheck();
    observeWorldPausedState();
}

/**
 * Starts a periodic check of mobile controls visibility.
 */
function startPeriodicVisibilityCheck() {
    updateMobileControlsVisibility();
    safeSetInterval(updateMobileControlsVisibility, 500);
}

/**
 * Observes changes to the world's paused state.
 * Updates mobile controls visibility when the paused state changes.
 */
function observeWorldPausedState() {
    if (window.world) {
        const originalIsPaused = Object.getOwnPropertyDescriptor(window.world, 'isPaused');
        if (originalIsPaused) {
            Object.defineProperty(window.world, 'isPaused', {
                get: originalIsPaused.get,
                set: function(value) {
                    originalIsPaused.set.call(this, value);
                    updateMobileControlsVisibility();
                }
            });
        }
    }
}

/**
 * Sets up event handlers for UI control elements.
 * Initializes sound, settings, and fullscreen controls.
 */
function setupUIControls() {
    setupSoundIconControl();
    setupSettingsIconControl();
    setupFullscreenIconControl();
    setupFullscreenChangeDetection();
}

/**
 * Sets up the sound icon toggle functionality.
 * Adds click handler to toggle sound and update icon appearance.
 */
function setupSoundIconControl() {
    const soundIcon = document.getElementById('sound-icon');
    if (!soundIcon) return;
    soundIcon.addEventListener('click', () => {
        if (window.world?.userInterface) {
            window.world.userInterface.toggleSound();
            updateSoundIconImage(soundIcon);
        }
    });
}

/**
 * Updates the sound icon image based on current muted state.
 * @param {HTMLElement} soundIcon - The sound icon element
 */
function updateSoundIconImage(soundIcon) {
    const img = soundIcon.querySelector('img');
    if (img) {
        img.src = window.world.userInterface.isMuted
            ? '../assets/img/ui_images/sound_off.svg'
            : '../assets/img/ui_images/sound_on.svg';
    }
}

/**
 * Sets up the settings icon functionality.
 * Adds click handler to open the settings menu.
 */
function setupSettingsIconControl() {
    const settingsIcon = document.getElementById('settings-icon');
    if (!settingsIcon) return;
    settingsIcon.addEventListener('click', () => {
        if (window.world?.userInterface) {
            window.world.userInterface.openSettings();
        }
    });
}

/**
 * Sets up the fullscreen icon toggle functionality.
 * Adds click handler to toggle fullscreen mode and update icon appearance.
 */
function setupFullscreenIconControl() {
    const fullscreenIcon = document.getElementById('fullscreen-icon');
    if (!fullscreenIcon) return;
    fullscreenIcon.addEventListener('click', () => {
        if (window.world?.userInterface) {
            window.world.userInterface.toggleFullscreen();
            updateFullscreenIconImage(fullscreenIcon);
        }
    });
}

/**
 * Updates the fullscreen icon image based on current fullscreen state.
 * @param {HTMLElement} fullscreenIcon - The fullscreen icon element
 */
function updateFullscreenIconImage(fullscreenIcon) {
    const img = fullscreenIcon.querySelector('img');
    if (!img) return;
    if (window.world?.userInterface?.isFullscreen) {
        img.src = '../assets/img/ui_images/fullscreen_exit.svg';
    } else {
        img.src = '../assets/img/ui_images/fullscreen.svg';
    }
}

/**
 * Sets up detection of fullscreen state changes.
 * Updates the fullscreen icon when fullscreen mode is toggled.
 */
function setupFullscreenChangeDetection() {
    document.addEventListener('fullscreenchange', () => {
        const fullscreenIcon = document.getElementById('fullscreen-icon');
        if (!fullscreenIcon) return;
        const isFullscreen = !!document.fullscreenElement;
        const img = fullscreenIcon.querySelector('img');
        if (img) {
            img.src = isFullscreen
                ? '../assets/img/ui_images/fullscreen_exit.svg'
                : '../assets/img/ui_images/fullscreen.svg';
        }
    });
}

/**
 * starts a safe setInterval that cleans up on page unload.
 */
function safeSetInterval(callback, interval) {
    const id = setInterval(callback, interval);
    window.scriptIntervals.push(id);
    return id;
}

/**
 * cleans up all script intervals on page unload.
 */
function cleanupScriptIntervals() {
    if (window.scriptIntervals && window.scriptIntervals.length > 0) {
        window.scriptIntervals.forEach(id => clearInterval(id));
        window.scriptIntervals = [];
    }
}

/**
 * Initializes all script functionality when the DOM is fully loaded.
 * Sets up orientation checking, mobile controls, and UI elements.
 */
document.addEventListener('DOMContentLoaded', function() {
    checkOrientation();
    initMobileControls();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    setupGameStateObserver();
    setupUIControls();
});