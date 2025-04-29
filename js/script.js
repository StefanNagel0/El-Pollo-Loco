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

function getOrCreateVideoContainer() {
    let videoContainer = document.getElementById('rotation-video-container');
    if (!videoContainer) {
        videoContainer = createVideoContainer();
    }
    return videoContainer;
}

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

function handlePortraitMode(videoContainer, mainMenu) {
    videoContainer.classList.add('show-rotation-video');
    if (mainMenu) mainMenu.classList.add('d-none');
    const canvas = document.getElementById('canvas');
    if (canvas) canvas.classList.add('d-none');
    const video = videoContainer.querySelector('video');
    if (video) video.play().catch(e => {});
}

function handleLandscapeMode(videoContainer, mainMenu) {
    videoContainer.classList.remove('show-rotation-video');
    if (mainMenu) mainMenu.classList.remove('d-none');
    const canvas = document.getElementById('canvas');
    if (canvas) canvas.classList.remove('d-none');
}

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

function isGameActive() {
    return window.world && 
        !window.world.isPaused && 
        document.getElementById('main-menu')?.classList.contains('d-none') &&
        !document.getElementById('settings-overlay')?.classList.contains('show') &&
        !document.getElementById('game-over-screen')?.classList.contains('show') &&
        !document.getElementById('game-won-screen')?.classList.contains('show') &&
        !document.getElementById('custom-confirm')?.classList.contains('show');
}

function initMobileControls() {
    setupButton('button-left', 'LEFT');
    setupButton('button-right', 'RIGHT');
    setupButton('button-jump', 'SPACE');
    setupButton('button-throw', 'D');
    preventScrollOnMobileControls();
}

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

function updateKeyboardState(keyAction, isActive) {
    if (window.keyboard) window.keyboard[keyAction] = isActive;
    if (window.world && window.world.keyboard) window.world.keyboard[keyAction] = isActive;
}

function preventScrollOnMobileControls() {
    const mobileControls = document.getElementById('mobile-controls');
    if (mobileControls) {
        mobileControls.addEventListener('touchmove', (e) => {
            if (e.target.closest('.mobile-control-button')) e.preventDefault();
        }, { passive: false });
    }
}

function setupGameStateObserver() {
    const mobileControls = document.getElementById('mobile-controls');
    if (!mobileControls) return;
    startPeriodicVisibilityCheck();
    observeWorldPausedState();
}

function startPeriodicVisibilityCheck() {
    updateMobileControlsVisibility();
    setInterval(updateMobileControlsVisibility, 500);
}

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

function setupUIControls() {
    setupSoundIconControl();
    setupSettingsIconControl();
    setupFullscreenIconControl();
    setupFullscreenChangeDetection();
}

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

function updateSoundIconImage(soundIcon) {
    const img = soundIcon.querySelector('img');
    if (img) {
        img.src = window.world.userInterface.isMuted
            ? '../assets/img/ui_images/sound_off.svg'
            : '../assets/img/ui_images/sound_on.svg';
    }
}

function setupSettingsIconControl() {
    const settingsIcon = document.getElementById('settings-icon');
    if (!settingsIcon) return;
    settingsIcon.addEventListener('click', () => {
        if (window.world?.userInterface) {
            window.world.userInterface.openSettings();
        }
    });
}

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

function updateFullscreenIconImage(fullscreenIcon) {
    const img = fullscreenIcon.querySelector('img');
    if (!img) return;
    if (window.world?.userInterface?.isFullscreen) {
        img.src = '../assets/img/ui_images/fullscreen_exit.svg';
    } else {
        img.src = '../assets/img/ui_images/fullscreen.svg';
    }
}

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

document.addEventListener('DOMContentLoaded', function() {
    checkOrientation();
    initMobileControls();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    setupGameStateObserver();
    setupUIControls();
});