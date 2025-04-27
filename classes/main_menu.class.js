class MainMenu {
    constructor(gameAudio) {
        const canvas = document.getElementById('canvas');
        
        // Prüfe, ob bereits eine UserInterface-Instanz in window.world existiert
        if (window.world && window.world.userInterface) {
            this.userInterface = window.world.userInterface;
        } else {
            // Erstelle eine neue UserInterface-Instanz mit der übergebenen gameAudio
            this.userInterface = new UserInterface(canvas, gameAudio);
        }
        
        this.init();
        this.updateSoundIcon();
    }

    init() {
        this.setupReferences();
        this.setupEventListeners();
        this.showMenu();
        this.adjustMenuPosition();
        window.addEventListener('resize', () => this.adjustMenuPosition());
    }
    
    setupReferences() {
        this.menuContainer = document.getElementById('main-menu');
        this.startButton = document.getElementById('start-game');
        this.settingsIcon = document.getElementById('menu-settings-icon');
        this.settingsOverlay = document.getElementById('settings-overlay');
        this.closeSettingsBtn = document.getElementById('close-settings');
        this.gameTitle = document.querySelector('h1');
        this.closeXBtn = document.getElementById('close-x');
        this.gameTab = document.getElementById('game-tab');
        this.howToPlayTab = document.getElementById('how-to-play-tab');
        this.audioTab = document.getElementById('audio-tab');
        this.gameContent = document.getElementById('game-content');
        this.howToPlayContent = document.getElementById('how-to-play-content');
        this.audioContent = document.getElementById('audio-content');
        this.returnToGameBtn = document.getElementById('return-to-game');
        this.exitGameBtn = document.getElementById('exit-game');
        this.soundIcon = document.getElementById('menu-sound-icon');
    }
    
    setupEventListeners() {
        this.startButton?.addEventListener('click', () => this.startGame());
        this.settingsIcon?.addEventListener('click', () => this.openSettings());
        this.closeSettingsBtn?.addEventListener('click', () => this.closeSettings());
        this.closeXBtn?.addEventListener('click', () => this.closeSettings());
        this.gameTab?.addEventListener('click', () => this.switchTab('game'));
        this.howToPlayTab?.addEventListener('click', () => this.switchTab('how-to-play'));
        this.audioTab?.addEventListener('click', () => this.switchTab('audio'));
        this.returnToGameBtn?.addEventListener('click', () => this.closeSettings());
        this.exitGameBtn?.addEventListener('click', () => this.handleExitGame());
        this.soundIcon?.addEventListener('click', () => this.toggleSound());
    }
    
    handleExitGame() {
        if (window.world?.userInterface) {
            window.world.userInterface.showCustomConfirm(() => window.location.reload());
        } else {
            window.location.reload();
        }
    }
    
    toggleSound() {
        if (this.userInterface) {
            this.userInterface.toggleSound();
            this.updateSoundIcon();
        }
    }

    showMenu() {
        this.menuContainer.classList.remove('d-none');
        this.gameTitle.classList.add('d-none');
        void this.menuContainer.offsetWidth;
        this.adjustMenuPosition();
        setTimeout(() => this.adjustMenuPosition(), 50);
    }

startGame() {
    this.hideMenu();
    this.showGameTitle();
    initGame();
    this.resumeWorld();
    this.hideOverlays();
}

hideMenu() {
    this.menuContainer.classList.add('d-none');
    this.menuContainer.style.display = 'none';
}

showGameTitle() {
    this.gameTitle.classList.remove('d-none');
    this.gameTitle.style.display = '';
}

resumeWorld() {
    if (window.world) {
        window.world.isPaused = false;
        this.syncUserInterface();
    }
}

syncUserInterface() {
    if (this.userInterface && window.world && window.world.userInterface) {
        window.world.userInterface.audio = this.userInterface.audio;
        window.world.userInterface.updateSoundIcon();
    }
}

hideOverlays() {
    this.hideHowToPlayOverlay();
    this.hideSettingsOverlay();
}

hideHowToPlayOverlay() {
    if (this.howToPlayOverlay) {
        this.howToPlayOverlay.classList.add('d-none');
        this.howToPlayOverlay.classList.remove('show');
    }
}

hideSettingsOverlay() {
    const settingsOverlay = document.getElementById('settings-overlay');
    if (settingsOverlay) {
        settingsOverlay.classList.add('d-none');
        settingsOverlay.classList.remove('show');
    }
}

    openHowToPlay() {
        this.howToPlayOverlay.classList.remove('d-none');
        this.howToPlayOverlay.classList.add('show');
    }

    closeHowToPlay() {
        this.howToPlayOverlay.classList.remove('show');
        this.howToPlayOverlay.classList.add('d-none');
    }

    openSettings() {
        if (window.world) {
            this.exitGameBtn.style.display = 'block';
        } else {
            this.exitGameBtn.style.display = 'none';
        }
        this.switchTab('game');
        this.settingsOverlay.classList.remove('d-none');
        this.adjustMenuPosition();
        setTimeout(() => this.adjustMenuPosition(), 10);
        this.settingsOverlay.classList.add('show');
    }

    closeSettings() {
        this.settingsOverlay.classList.remove('show');
        this.settingsOverlay.classList.add('d-none');
    }

    adjustMenuPosition() {
        const canvas = document.getElementById('canvas');
        if (canvas && this.menuContainer) {
            this.menuContainer.removeAttribute('style');
            const canvasRect = canvas.getBoundingClientRect();
            this.menuContainer.style.cssText = `
                display: flex;
                position: absolute;
                top: ${canvasRect.top}px;
                left: ${canvasRect.left}px;
                width: ${canvasRect.width}px;
                height: ${canvasRect.height}px;
                transform: none;
                z-index: 1000;
            `;
            const settingsOverlay = document.getElementById('settings-overlay');
            if (settingsOverlay) {
                settingsOverlay.style.cssText = `
                    position: absolute;
                    top: ${canvasRect.top}px;
                    left: ${canvasRect.left}px;
                    width: ${canvasRect.width}px;
                    height: ${canvasRect.height}px;
                    transform: none;
                    z-index: 1001;
                `;
            }
        }
    }

    switchTab(tabId) {
        this.gameTab.classList.remove('active');
        this.howToPlayTab.classList.remove('active');
        this.audioTab.classList.remove('active');
        this.gameContent.classList.add('d-none');
        this.howToPlayContent.classList.add('d-none');
        this.audioContent.classList.add('d-none');
        if (tabId === 'game') {
            this.gameTab.classList.add('active');
            this.gameContent.classList.remove('d-none');
        } else if (tabId === 'how-to-play') {
            this.howToPlayTab.classList.add('active');
            this.howToPlayContent.classList.remove('d-none');
        } else if (tabId === 'audio') {
            this.audioTab.classList.add('active');
            this.audioContent.classList.remove('d-none');
        }
    }

    updateSoundIcon() {
        if (this.soundIcon && this.userInterface) {
            this.soundIcon.src = this.userInterface.audio.isMuted 
                ? '../assets/img/ui_images/sound_off.svg' 
                : '../assets/img/ui_images/sound_on.svg';
        }
    }
}