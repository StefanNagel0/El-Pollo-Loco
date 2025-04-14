class MainMenu {
    constructor() {
        // Canvas-Referenz für UserInterface holen
        const canvas = document.getElementById('canvas');
        
        // UserInterface-Instanz für das Hauptmenü erstellen
        this.userInterface = new UserInterface(canvas);
        
        // DOM-Elemente referenzieren und Event-Listener hinzufügen
        this.init();
    }

    /**
     * Initialisiert das Hauptmenü
     */
    init() {
        // Referenzen auf DOM-Elemente
        this.menuContainer = document.getElementById('main-menu');
        this.startButton = document.getElementById('start-game');
        this.settingsIcon = document.getElementById('menu-settings-icon');
        this.settingsOverlay = document.getElementById('settings-overlay');
        this.closeSettingsBtn = document.getElementById('close-settings');
        this.gameTitle = document.querySelector('h1');
        
        // Zusätzliche Referenz für das X-Symbol
        this.closeXBtn = document.getElementById('close-x');
        
        // Tab-Navigation erweitern
        this.gameTab = document.getElementById('game-tab');
        this.howToPlayTab = document.getElementById('how-to-play-tab');
        this.audioTab = document.getElementById('audio-tab');
        this.gameContent = document.getElementById('game-content');
        this.howToPlayContent = document.getElementById('how-to-play-content');
        this.audioContent = document.getElementById('audio-content');

        // Neue Button-Referenzen
        this.returnToGameBtn = document.getElementById('return-to-game');
        this.exitGameBtn = document.getElementById('exit-game');

        // Sound-Icon Referenz
        this.soundIcon = document.getElementById('menu-sound-icon');

        // Event-Listener mit Null-Prüfung hinzufügen
        if (this.startButton) {
            this.startButton.addEventListener('click', () => this.startGame());
        }
        
        if (this.settingsIcon) {
            this.settingsIcon.addEventListener('click', () => this.openSettings());
        }
        
        if (this.closeSettingsBtn) {
            this.closeSettingsBtn.addEventListener('click', () => this.closeSettings());
        }
        
        // X-Button-Event-Listener
        if (this.closeXBtn) {
            this.closeXBtn.addEventListener('click', () => this.closeSettings());
        }
        
        // Tab-Wechsel mit Null-Prüfung
        if (this.gameTab) {
            this.gameTab.addEventListener('click', () => this.switchTab('game'));
        }
        
        if (this.howToPlayTab) {
            this.howToPlayTab.addEventListener('click', () => this.switchTab('how-to-play'));
        }
        
        if (this.audioTab) {
            this.audioTab.addEventListener('click', () => this.switchTab('audio'));
        }

        // Neue Event-Listener für die Buttons mit Null-Prüfung
        if (this.returnToGameBtn) {
            this.returnToGameBtn.addEventListener('click', () => this.closeSettings());
        }
        
        if (this.exitGameBtn) {
            this.exitGameBtn.addEventListener('click', () => {
                // Benutzerdefinierten Dialog anzeigen
                if (window.world && window.world.userInterface) {
                    window.world.userInterface.showCustomConfirm(() => {
                        window.location.reload();
                    });
                } else {
                    // Fallback zum normalen Reload, falls userInterface nicht verfügbar ist
                    window.location.reload();
                }
            });
        }

        // Sound-Icon Event-Listener
        if (this.soundIcon) {
            // Initialen Zustand setzen
            this.updateSoundIcon();
            
            // Klick-Event-Listener
            this.soundIcon.addEventListener('click', () => {
                if (this.userInterface) {
                    this.userInterface.toggleSound();
                    this.updateSoundIcon();
                }
            });
        }

        // Hauptmenü anzeigen
        if (this.menuContainer) {
            this.showMenu();
        }
        
        // Fenstergrößenänderungen überwachen
        window.addEventListener('resize', () => {
            this.adjustMenuPosition();
        });
        
        // Initiale Positionierung
        this.adjustMenuPosition();
    }

    /**
     * Zeigt das Hauptmenü an und versteckt den Spieltitel
     */
    showMenu() {
        this.menuContainer.classList.remove('d-none');
        this.gameTitle.classList.add('d-none');
    }

    /**
     * Startet das Spiel und versteckt das Hauptmenü
     */
    startGame() {
        // Menü ausblenden
        this.menuContainer.classList.add('d-none');
        this.menuContainer.style.display = 'none';
        
        // Spieltitel anzeigen
        this.gameTitle.classList.remove('d-none');
        this.gameTitle.style.display = '';
        
        // Spiel initialisieren
        initGame();
        
        // Wichtig: Pause aufheben, damit das Spiel beginnt
        if (window.world) {
            window.world.isPaused = false;
            
            // Hintergrundmusik und Mute-Status fortsetzen
            if (this.userInterface) {
                // Hintergrundmusik übernehmen
                if (this.userInterface.backgroundMusic) {
                    window.world.userInterface.backgroundMusic = this.userInterface.backgroundMusic;
                }
                
                // Mute-Status übernehmen
                window.world.userInterface.isMuted = this.userInterface.isMuted;
                window.world.userInterface.updateSoundIcon();
            }
        }
        
        // Overlays schließen
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

    /**
     * Öffnet das "How to Play"-Overlay
     */
    openHowToPlay() {
        this.howToPlayOverlay.classList.remove('d-none');
        this.howToPlayOverlay.classList.add('show');
    }

    /**
     * Schließt das "How to Play"-Overlay
     */
    closeHowToPlay() {
        this.howToPlayOverlay.classList.remove('show');
        this.howToPlayOverlay.classList.add('d-none');
    }

    /**
     * Öffnet die Einstellungen
     */
    openSettings() {
        // Wenn im Spiel, den "Spiel beenden"-Button anzeigen
        if (window.world) {
            this.exitGameBtn.style.display = 'block';
        } else {
            this.exitGameBtn.style.display = 'none';
        }
        
        // Standard-Tab ist jetzt "Spiel"
        this.switchTab('game');
        
        // Rest unverändert...
        this.settingsOverlay.classList.remove('d-none');
        this.settingsOverlay.classList.add('show');
    }

    closeSettings() {
        this.settingsOverlay.classList.remove('show');
        this.settingsOverlay.classList.add('d-none');
    }

    /**
     * Passt die Position des Menüs an die Canvas-Position an
     */
    adjustMenuPosition() {
        const canvas = document.getElementById('canvas');
        if (canvas) {
            const canvasRect = canvas.getBoundingClientRect();
            
            // Menücontainer an Canvas ausrichten und horizontal zentrieren
            if (this.menuContainer) {
                // Berechne die Mitte des Canvas
                const canvasCenter = canvasRect.left + (canvasRect.width / 2);
                const menuWidth = 720; // Die Breite des Menüs (aus CSS)
                
                // Positioniere das Menü so, dass seine Mitte unter der Canvas-Mitte liegt
                this.menuContainer.style.top = `${canvasRect.top}px`;
                this.menuContainer.style.left = `${canvasCenter - (menuWidth / 2)}px`;
                this.menuContainer.style.width = `${menuWidth}px`;
                this.menuContainer.style.height = `${canvasRect.height}px`;
                
                // Transform-Eigenschaft zurücksetzen, da wir jetzt direkt positionieren
                this.menuContainer.style.transform = 'none';
            }
            
            // Settings-Overlay-Position anpassen (bleibt unverändert)
            const settingsOverlay = document.getElementById('settings-overlay');
            if (settingsOverlay) {
                settingsOverlay.style.top = `${canvasRect.top}px`;
                settingsOverlay.style.left = `${canvasRect.left}px`;
                settingsOverlay.style.width = `${canvasRect.width}px`;
                settingsOverlay.style.height = `${canvasRect.height}px`;
                settingsOverlay.style.transform = 'none';
            }
        }
    }

    /**
     * Wechselt zwischen den Tabs
     */
    switchTab(tabId) {
        // Alle Tabs zurücksetzen
        this.gameTab.classList.remove('active');
        this.howToPlayTab.classList.remove('active');
        this.audioTab.classList.remove('active');
        this.gameContent.classList.add('d-none');
        this.howToPlayContent.classList.add('d-none');
        this.audioContent.classList.add('d-none');
        
        // Gewählten Tab aktivieren
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

    /**
     * Aktualisiert das Sound-Icon basierend auf dem Mute-Status
     */
    updateSoundIcon() {
        if (this.soundIcon && this.userInterface) {
            this.soundIcon.src = this.userInterface.isMuted 
                ? '../assets/img/ui_images/sound_off.svg' 
                : '../assets/img/ui_images/sound_on.svg';
        }
    }
}