class MainMenu {
    constructor() {
        this.init();
    }

    /**
     * Initialisiert das Hauptmenü
     */
    init() {
        // Referenzen auf DOM-Elemente
        this.menuContainer = document.getElementById('main-menu');
        this.startButton = document.getElementById('start-game');
        this.howToPlayButton = document.getElementById('how-to-play');
        this.settingsButton = document.getElementById('menu-settings');
        this.howToPlayOverlay = document.getElementById('how-to-play-overlay');
        this.closeHowToPlayButton = document.getElementById('close-how-to-play');
        this.gameTitle = document.querySelector('h1');

        // Event-Listener hinzufügen
        this.startButton.addEventListener('click', () => this.startGame());
        this.howToPlayButton.addEventListener('click', () => this.openHowToPlay());
        this.closeHowToPlayButton.addEventListener('click', () => this.closeHowToPlay());
        this.settingsButton.addEventListener('click', () => this.openSettings());

        // Hauptmenü anzeigen
        this.showMenu();
        
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
        // Mehrere Methoden verwenden, um das Hauptmenü zuverlässig zu verstecken
        this.menuContainer.classList.add('d-none');
        this.menuContainer.style.display = 'none'; // Direkte CSS-Anweisung hinzufügen
        
        // Spieltitel anzeigen
        this.gameTitle.classList.remove('d-none');
        this.gameTitle.style.display = ''; // Zurücksetzen der display-Eigenschaft
        
        // Hier wird das Spiel initialisiert und gestartet
        initGame();
        
        // Zusätzlich sicherstellen, dass die How-to-Play und Settings-Overlays geschlossen sind
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
        const settingsOverlay = document.getElementById('settings-overlay');
        const exitGameBtn = document.getElementById('exit-game');
        
        // Verstecke den "Spiel beenden"-Button, wenn wir uns im Hauptmenü befinden
        if (exitGameBtn) {
            exitGameBtn.style.display = 'none';
        }
        
        settingsOverlay.classList.remove('d-none');
        settingsOverlay.classList.add('show');
        
        // Stelle sicher, dass der Close-Button funktioniert
        const closeSettingsBtn = document.getElementById('close-settings');
        if (closeSettingsBtn) {
            // Entferne bestehende Event-Listener, um Duplikate zu vermeiden
            closeSettingsBtn.removeEventListener('click', this.closeSettingsHandler);
            
            // Neuen Event-Listener hinzufügen
            this.closeSettingsHandler = () => {
                settingsOverlay.classList.remove('show');
                settingsOverlay.classList.add('d-none');
            };
            
            closeSettingsBtn.addEventListener('click', this.closeSettingsHandler);
        }
    }

    /**
     * Passt die Position des Menüs an die Canvas-Position an
     */
    adjustMenuPosition() {
        const canvas = document.getElementById('canvas');
        if (canvas && this.menuContainer) {
            const canvasRect = canvas.getBoundingClientRect();
            
            // Menücontainer an Canvas ausrichten
            this.menuContainer.style.top = `${canvasRect.top}px`;
            
            // Bei responsiven Bildschirmen Breite anpassen
            if (window.innerWidth <= 720) {
                this.menuContainer.style.width = `${canvasRect.width}px`;
            }
        }
    }
}