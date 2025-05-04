/**
 * Handles the victory screen displayed when the player wins the game.
 * Creates and manages the UI elements for congratulating the player and offering next steps.
 * @class
 */
class Won {
    /**
     * Container element for the victory screen.
     * @type {HTMLElement|null}
     */
    constructor() {
        this.container = null;
    }

    /**
     * Displays the victory screen and pauses the game.
     * Creates the screen if it doesn't exist and positions it over the game canvas.
     */
    show() {
        if (window.world) window.world.isPaused = true;
        if (!this.container) this.createWonScreen();
        this.container.classList.remove('d-none');
        this.container.classList.add('show');
    }

    /**
     * Creates the complete victory screen with text and buttons.
     * Assembles all components and adds them to the DOM.
     */
    createWonScreen() {
        this.container = this.createContainer();
        const textContainer = this.createTextContent();
        const buttonContainer = this.createButtonContainer();
        this.container.appendChild(textContainer);
        this.container.appendChild(buttonContainer);
        document.body.appendChild(this.container);
    }

    /**
     * Creates the main container element for the victory screen.
     * @returns {HTMLDivElement} The created container element
     */
    createContainer() {
        const container = document.createElement('div');
        container.id = 'game-won-screen';
        container.classList.add('d-none');
        return container;
    }

    /**
     * Creates the text content for the victory message.
     * Includes a headline and congratulatory message.
     * @returns {HTMLDivElement} The text container element
     */
    createTextContent() {
        const textContainer = document.createElement('div');
        textContainer.classList.add('game-won-text');
        const headline = document.createElement('h1');
        headline.textContent = 'YOU WON!';
        const subtext = document.createElement('p');
        subtext.textContent = 'Congratulations! You defeated the final boss!';
        textContainer.appendChild(headline);
        textContainer.appendChild(subtext);
        return textContainer;
    }

    /**
     * Creates the container with buttons for next actions.
     * Contains restart game and back to main menu options.
     * @returns {HTMLDivElement} The button container element
     */
    createButtonContainer() {
        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('game-won-buttons');
        const restartButton = this.createButton('Restart Game', () => this.restartGame());
        const mainMenuButton = this.createButton('Back to Main Menu', () => this.backToMainMenu());
        buttonContainer.appendChild(restartButton);
        buttonContainer.appendChild(mainMenuButton);
        return buttonContainer;
    }

    /**
     * Creates a button with specified text and click handler.
     * @param {string} text - The text to display on the button
     * @param {Function} clickHandler - The event handler for button click
     * @returns {HTMLButtonElement} The created button element
     */
    createButton(text, clickHandler) {
        const button = document.createElement('button');
        button.textContent = text;
        button.classList.add('game-button');
        button.addEventListener('click', clickHandler);
        return button;
    }

    /**
     */
    adjustPosition() {
    }

    /**
     * Handles restarting the game when the restart button is clicked.
     */
    restartGame() {
        if (window._inRestart === true) return;
        this.hide();
        try {
            window._inRestart = true;
            this.cleanupWorld();
            this.disableButtons();
            this.resetStaticVariables();
            this.resetGlobalReferences();
            this.startRestartSequence();
        } catch (e) {
            window.location.reload();
        }
    }

    cleanupWorld() {
        if (window.world) {
            window.world.cleanup();
            window.world = null;
        }
    }

    disableButtons() {
        document.querySelectorAll('.game-button').forEach(button => {
            button.disabled = true;
        });
    }

    resetStaticVariables() {
        if (typeof MovableObject !== 'undefined' && MovableObject.placedObjects) {
            MovableObject.placedObjects = [];
        }
        this.removeElement('settings-overlay');
        this.removeElement('custom-confirm');
    }

    removeElement(id) {
        const element = document.getElementById(id);
        if (element) element.remove();
    }

    resetGlobalReferences() {
        window.gameOverScreen = null;
        window.wonScreen = null;
    }

    startRestartSequence() {
        setTimeout(() => {
            this.initializeLevel();
        }, 200);
    }

    initializeLevel() {
        try {
            initLevel1();
            setTimeout(() => this.initializeGame(), 100);
        } catch (levelError) {
            window.location.reload();
        }
    }

    initializeGame() {
        try {
            initGame();
            if (window.world) {
                this.finalizeRestart();
            }
        } catch (gameError) {
            window.location.reload();
        }
    }

    finalizeRestart() {
        if (window.world?.userInterface) {
            this.initUI();
        }
        window.world.isPaused = false;
        this.initAudio();
        window._inRestart = false;
    }

    initUI() {
        setTimeout(() => {
            window.world.userInterface.reinitializeUI();
            setTimeout(() => this.initAudioElements(), 200);
        }, 200);
    }

    initAudioElements() {
        if (window.world?.userInterface?.audioManager) {
            window.world.userInterface.audioManager.reinitializeAudioElements();
        }
    }

    initAudio() {
        if (window.world.userInterface?.audioManager) {
            window.world.userInterface.audioManager.initBackgroundMusic();
            window.world.userInterface.audioManager.playBackgroundMusic();
        }
    }

    /**
     * Cleans up the old world instance before creating a new one.
     */
    cleanupOldWorld() {
        if (window.world) {
            window.world.cleanup();
            window.removeEventListener('resize', window.world.adjustPosition);
            window.world = null;
        }
    }

    /**
     * Returns to the main menu by reloading the page.
     * Hides the victory screen first.
     */
    backToMainMenu() {
        this.hide();
        window.location.reload();
    }

    /**
     * Hides the victory screen by removing display classes.
     */
    hide() {
        if (this.container) {
            this.container.classList.remove('show');
            this.container.classList.add('d-none');
            setTimeout(() => this.removeContainer(), 50);
        }
    }

    removeContainer() {
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
            this.container = null;
        }
    }
}