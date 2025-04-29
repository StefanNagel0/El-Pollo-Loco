class MainMenu {
    constructor() {
        const canvas = document.getElementById('canvas');
        this.userInterface = new UserInterface(canvas);
        this.init();
    }

    init() {
        this.initDOMReferences();
        this.initEventListeners();
        if (this.menuContainer) this.showMenu();
        window.addEventListener('resize', () => this.adjustMenuPosition());
        this.adjustMenuPosition();
    }

    initDOMReferences() {
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

    initEventListeners() {
        this.addButtonListener(this.startButton, () => this.startGame());
        this.addButtonListener(this.settingsIcon, () => this.openSettings());
        this.addButtonListener(this.closeSettingsBtn, () => this.closeSettings());
        this.addButtonListener(this.closeXBtn, () => this.closeSettings());
        this.addButtonListener(this.gameTab, () => this.switchTab('game'));
        this.addButtonListener(this.howToPlayTab, () => this.switchTab('how-to-play'));
        this.addButtonListener(this.audioTab, () => this.switchTab('audio'));
        this.addButtonListener(this.returnToGameBtn, () => this.closeSettings());
        this.addButtonListener(this.exitGameBtn, () => this.handleExitGame());
        this.initSoundIconListener();
    }

    addButtonListener(button, callback) {
        if (button) button.addEventListener('click', callback);
    }

    handleExitGame() {
        const ui = window.world?.userInterface;
        if (ui) ui.showCustomConfirm(() => window.location.reload());
        else window.location.reload();
    }

    initSoundIconListener() {
        if (this.soundIcon) {
            this.updateSoundIcon();
            this.soundIcon.addEventListener('click', () => {
                if (this.userInterface) {
                    this.userInterface.toggleSound();
                    this.updateSoundIcon();
                }
            });
        }
    }

    showMenu() {
        this.menuContainer.classList.remove('d-none');
        this.gameTitle.classList.add('d-none');
    }

    startGame() {
        this.hideMenuShowTitle();
        initGame();
        this.initializeAndResumeGame();
        this.closeAllOverlays();
    }

    hideMenuShowTitle() {
        this.menuContainer.classList.add('d-none');
        this.menuContainer.style.display = 'none';
        this.gameTitle.classList.remove('d-none');
        this.gameTitle.style.display = '';
    }

    initializeAndResumeGame() {
        if (window.world) {
            window.world.isPaused = false;
            if (this.userInterface) {
                this.transferUIState(window.world.userInterface);
            }
        }
    }

    transferUIState(targetUI) {
        if (this.userInterface.backgroundMusic) {
            targetUI.backgroundMusic = this.userInterface.backgroundMusic;
        }
        targetUI.isMuted = this.userInterface.isMuted;
        targetUI.updateSoundIcon();
    }

    closeAllOverlays() {
        if (this.howToPlayOverlay) {
            this.howToPlayOverlay.classList.add('d-none');
            this.howToPlayOverlay.classList.remove('show');
        }
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
        this.exitGameBtn.style.display = window.world ? 'block' : 'none';
        this.switchTab('game');
        this.settingsOverlay.classList.remove('d-none');
        this.settingsOverlay.classList.add('show');
    }

    closeSettings() {
        this.settingsOverlay.classList.remove('show');
        this.settingsOverlay.classList.add('d-none');
    }

    adjustMenuPosition() {
        const canvas = document.getElementById('canvas');
        if (canvas) {
            const canvasRect = canvas.getBoundingClientRect();
            this.positionMenuContainer(canvasRect);
            this.positionSettingsOverlay(canvasRect);
        }
    }

    positionMenuContainer(canvasRect) {
        if (this.menuContainer) {
            const canvasCenter = canvasRect.left + (canvasRect.width / 2);
            const menuWidth = canvasRect.width;
            this.menuContainer.style.top = `${canvasRect.top}px`;
            this.menuContainer.style.left = `${canvasCenter - (menuWidth / 2)}px`;
            this.menuContainer.style.width = `${menuWidth}px`;
            this.menuContainer.style.height = `${canvasRect.height}px`;
            this.menuContainer.style.transform = 'none';
        }
    }

    positionSettingsOverlay(canvasRect) {
        const settingsOverlay = document.getElementById('settings-overlay');
        if (settingsOverlay) {
            settingsOverlay.style.top = `${canvasRect.top}px`;
            settingsOverlay.style.left = `${canvasRect.left}px`;
            settingsOverlay.style.width = `${canvasRect.width}px`;
            settingsOverlay.style.height = `${canvasRect.height}px`;
            settingsOverlay.style.transform = 'none';
        }
    }

    switchTab(tabId) {
        this.resetAllTabs();
        this.activateTab(tabId);
    }

    resetAllTabs() {
        this.gameTab?.classList.remove('active');
        this.howToPlayTab?.classList.remove('active');
        this.audioTab?.classList.remove('active');
        this.gameContent?.classList.add('d-none');
        this.howToPlayContent?.classList.add('d-none');
        this.audioContent?.classList.add('d-none');
    }

    activateTab(tabId) {
        if (tabId === 'game') {
            this.gameTab?.classList.add('active');
            this.gameContent?.classList.remove('d-none');
        } else if (tabId === 'how-to-play') {
            this.howToPlayTab?.classList.add('active');
            this.howToPlayContent?.classList.remove('d-none');
        } else if (tabId === 'audio') {
            this.audioTab?.classList.add('active');
            this.audioContent?.classList.remove('d-none');
        }
    }

    updateSoundIcon() {
        if (this.soundIcon && this.userInterface) {
            const iconPath = this.userInterface.isMuted
                ? '../assets/img/ui_images/sound_off.svg'
                : '../assets/img/ui_images/sound_on.svg';
            this.soundIcon.src = iconPath;
        }
    }
}