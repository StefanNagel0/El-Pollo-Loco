class Won {
    constructor() {
        this.container = null;
    }

    /**
     * Zeigt den Game-Won-Screen an
     */
    show() {
        // Spiel pausieren
        if (window.world) {
            window.world.isPaused = true;
        }
        
        // Erstellen, falls noch nicht vorhanden
        if (!this.container) {
            this.createWonScreen();
        }
        
        // Anzeigen
        this.container.classList.remove('d-none');
        this.container.classList.add('show');
        
        // Position anpassen
        this.adjustPosition();
        
        // Event-Listener für Fenstergrößenänderungen
        window.addEventListener('resize', this.adjustPosition.bind(this));
    }

    /**
     * Erstellt die HTML-Elemente für den Game-Won-Screen
     */
    createWonScreen() {
        // Container erstellen
        this.container = document.createElement('div');
        this.container.id = 'game-won-screen';
        this.container.classList.add('d-none');
        
        // Text-Container für Gewonnen-Nachricht
        const textContainer = document.createElement('div');
        textContainer.classList.add('game-won-text');
        
        // Überschrift erstellen
        const headline = document.createElement('h1');
        headline.textContent = 'DU HAST GEWONNEN!';
        
        // Untertext erstellen
        const subtext = document.createElement('p');
        subtext.textContent = 'Herzlichen Glückwunsch! Du hast den Endboss besiegt!';
        
        // Text zum Container hinzufügen
        textContainer.appendChild(headline);
        textContainer.appendChild(subtext);
        
        // Button-Container erstellen
        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('game-won-buttons');
        
        // Restart-Button erstellen
        const restartButton = document.createElement('button');
        restartButton.textContent = 'Spiel neu starten';
        restartButton.classList.add('game-button'); // Standard-Button-Klasse verwenden
        restartButton.addEventListener('click', () => this.restartGame());
        
        // Main-Menu-Button erstellen
        const mainMenuButton = document.createElement('button');
        mainMenuButton.textContent = 'Zurück zum Hauptmenü';
        mainMenuButton.classList.add('game-button'); // Standard-Button-Klasse verwenden
        mainMenuButton.addEventListener('click', () => this.backToMainMenu());
        
        // Elemente zusammenfügen
        buttonContainer.appendChild(restartButton);
        buttonContainer.appendChild(mainMenuButton);
        
        this.container.appendChild(textContainer);
        this.container.appendChild(buttonContainer);
        
        // Container zum DOM hinzufügen
        document.body.appendChild(this.container);
    }

    /**
     * Passt die Position des Game-Won-Screens an die Canvas-Position an
     */
    adjustPosition() {
        const canvas = document.getElementById('canvas');
        if (canvas && this.container) {
            const canvasRect = canvas.getBoundingClientRect();
            
            this.container.style.position = 'absolute';
            this.container.style.top = `${canvasRect.top}px`;
            this.container.style.left = `${canvasRect.left}px`;
            this.container.style.width = `${canvasRect.width}px`;
            this.container.style.height = `${canvasRect.height}px`;
        }
    }

    /**
     * Startet das Spiel neu
     */
    restartGame() {
        // Won-Screen ausblenden
        this.hide();
        
        // Flag mit Zeitstempel setzen
        const timestamp = new Date().getTime();
        localStorage.setItem('elPolloLoco_startGame', 'true');
        localStorage.setItem('elPolloLoco_restartTimestamp', timestamp.toString());
        
        // Verzögerung hinzufügen
        setTimeout(() => {
            window.location.reload();
        }, 50);
    }

    /**
     * Kehrt zum Hauptmenü zurück
     */
    backToMainMenu() {
        // Won-Screen ausblenden
        this.hide();
        
        window.location.reload();
    }

    /**
     * Blendet den Game-Won-Screen aus
     */
    hide() {
        if (this.container) {
            this.container.classList.remove('show');
            this.container.classList.add('d-none');
        }
    }
}