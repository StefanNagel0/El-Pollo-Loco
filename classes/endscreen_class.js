class Endscreen {
    constructor() {
        this.container = null;
        this.gameOverImages = [
            '../assets/img/9_intro_outro_screens/game_over/oh no you lost!.png',
            '../assets/img/9_intro_outro_screens/game_over/game over.png',
            '../assets/img/9_intro_outro_screens/game_over/game over!.png',
            '../assets/img/9_intro_outro_screens/game_over/you lost.png'
        ];
        this.selectedImage = this.getRandomGameOverImage();
    }

    /**
     * Wählt ein zufälliges Game-Over-Bild aus
     * @returns {string} - Pfad zum zufälligen Game-Over-Bild
     */
    getRandomGameOverImage() {
        const randomIndex = Math.floor(Math.random() * this.gameOverImages.length);
        return this.gameOverImages[randomIndex];
    }

    /**
     * Erstellt und zeigt den Game-Over-Screen an
     */
    show() {
        // Spiel pausieren, damit sich die Gegner nicht mehr bewegen
        if (window.world) {
            window.world.isPaused = true;
            // Alle Gegner unsichtbar machen
            this.hideEnemies();
        }
        
        // Container erstellen, falls noch nicht vorhanden
        if (!this.container) {
            this.createGameOverScreen();
        }
        
        // Endscreen anzeigen mit direktem Style
        this.container.classList.remove('d-none');
        this.container.classList.add('show');
        this.container.style.display = 'flex';
        
        // Position an Canvas anpassen
        this.adjustPosition();
    }

    /**
     * Versteckt alle Gegner im Spiel
     */
    hideEnemies() {
        if (window.world && window.world.level && window.world.level.enemies) {
            window.world.level.enemies.forEach(enemy => {
                // Originalposition speichern, falls wir sie später brauchen
                enemy.originalY = enemy.y;
                // Gegner außerhalb des sichtbaren Bereichs verschieben
                enemy.y = -1000;
            });
        }
    }

    /**
     * Erstellt die HTML-Elemente für den Game-Over-Screen
     */
    createGameOverScreen() {
        // Container erstellen
        this.container = document.createElement('div');
        this.container.id = 'game-over-screen';
        this.container.classList.add('d-none');
        
        // Game-Over-Bild hinzufügen
        const gameOverImage = document.createElement('img');
        gameOverImage.src = this.selectedImage;
        gameOverImage.alt = 'Game Over';
        gameOverImage.classList.add('game-over-image');
        
        // Button-Container erstellen
        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('game-over-buttons');
        
        // Restart-Button erstellen
        const restartButton = document.createElement('button');
        restartButton.textContent = 'Spiel neu starten';
        restartButton.classList.add('game-over-button');
        restartButton.addEventListener('click', () => this.restartGame());
        
        // Main-Menu-Button erstellen
        const mainMenuButton = document.createElement('button');
        mainMenuButton.textContent = 'Zurück zum Hauptmenü';
        mainMenuButton.classList.add('game-over-button');
        mainMenuButton.addEventListener('click', () => this.backToMainMenu());
        
        // Elemente zusammenfügen
        buttonContainer.appendChild(restartButton);
        buttonContainer.appendChild(mainMenuButton);
        
        this.container.appendChild(gameOverImage);
        this.container.appendChild(buttonContainer);
        
        // Container zum DOM hinzufügen
        document.body.appendChild(this.container);
    }

    /**
     * Passt die Position des Game-Over-Screens an die Canvas-Position an
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
        // Endscreen ausblenden
        this.hide();
        
        // Kurze Verzögerung, damit DOM-Änderungen wirksam werden
        setTimeout(() => {
            // Spiel neu initialisieren
            initGame();
            
            // Pause aufheben und Spiel starten
            if (window.world) {
                window.world.isPaused = false;
            }
        }, 100);
    }

    /**
     * Kehrt zum Hauptmenü zurück
     */
    backToMainMenu() {
        // Endscreen ausblenden
        this.hide();
        
        // Seite neu laden, um zum Hauptmenü zurückzukehren
        window.location.reload();
    }

    /**
     * Blendet den Game-Over-Screen aus
     */
    hide() {
        if (this.container) {
            // CSS-Klassen entfernen/hinzufügen
            this.container.classList.remove('show');
            this.container.classList.add('d-none');
            
            // Direktes Setzen des display-Stils (überschreibt alle CSS-Regeln)
            this.container.style.display = 'none';
        }
    }
}