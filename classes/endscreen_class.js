/**
 * Creates and manages the Game Over screen display.
 * Shows a random game over image and provides restart options.
 * @class
 */
class Endscreen {
    /**
     * Initializes a new Endscreen instance with default settings.
     */
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
     * Selects a random game over image from the available options.
     * @returns {string} The path to the randomly selected image
     */
    getRandomGameOverImage() {
        const randomIndex = Math.floor(Math.random() * this.gameOverImages.length);
        return this.gameOverImages[randomIndex];
    }

    /**
     * Displays the game over screen and pauses the game.
     */
    show() {
        if (window.world) {
            window.world.isPaused = true;
            this.hideEnemies();
        }
        if (!this.container) {
            this.createGameOverScreen();
        }
        this.container.classList.remove('d-none');
        this.container.classList.add('show');
        this.container.style.display = 'flex';
    }

    /**
     * Hides enemies by moving them off-screen while saving their original positions.
     */
    hideEnemies() {
        if (window.world?.level?.enemies) {
            window.world.level.enemies.forEach(enemy => {
                enemy.originalY = enemy.y;
                enemy.y = -1000;
            });
        }
    }

    /**
     * Creates the complete game over screen with image and buttons.
     */
    createGameOverScreen() {
        this.createContainer();
        const gameOverImage = this.createImageElement();
        const buttonContainer = this.createButtonContainer();
        this.appendElementsToContainer(gameOverImage, buttonContainer);
        document.body.appendChild(this.container);
    }

    /**
     * Creates the main container element for the game over screen.
     */
    createContainer() {
        this.container = document.createElement('div');
        this.container.id = 'game-over-screen';
        this.container.classList.add('d-none');
    }

    /**
     * Creates the image element displaying the game over message.
     * @returns {HTMLImageElement} The created image element
     */
    createImageElement() {
        const img = document.createElement('img');
        img.src = this.selectedImage;
        img.alt = 'Game Over';
        img.classList.add('game-over-image');
        return img;
    }

    /**
     * Creates a container with the game over screen buttons.
     * @returns {HTMLDivElement} The button container element
     */
    createButtonContainer() {
        const container = document.createElement('div');
        container.classList.add('game-over-buttons');
        const restartBtn = this.createButton('Restart Game', () => this.restartGame());
        const mainMenuBtn = this.createButton('Back to Main Menu', () => this.backToMainMenu());
        container.appendChild(restartBtn);
        container.appendChild(mainMenuBtn);
        return container;
    }

    /**
     * Creates a button with specified text and click handler.
     * @param {string} text - The text to display on the button
     * @param {Function} onClick - The event handler to call when the button is clicked
     * @returns {HTMLButtonElement} The created button element
     */
    createButton(text, onClick) {
        const button = document.createElement('button');
        button.textContent = text;
        button.classList.add('game-over-button');
        button.addEventListener('click', onClick);
        return button;
    }

    /**
     * Adds the created elements to the container.
     * @param {HTMLImageElement} image - The game over image element
     * @param {HTMLDivElement} buttons - The buttons container element
     */
    appendElementsToContainer(image, buttons) {
        this.container.appendChild(image);
        this.container.appendChild(buttons);
    }
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

    /**
     * Cleans up the old world instance before creating a new one.
     */
    cleanupWorld() {
        if (window.world) {
            window.world.cleanup();
            window.world = null;
        }
    }

    /**
     * Disables all game buttons to prevent further clicks during restart.
     */
    disableButtons() {
        document.querySelectorAll('.game-button').forEach(button => {
            button.disabled = true;
        });
    }

    /**
     * Setzt alle statischen Klassenvariablen zurück.
     */
    resetStaticVariables() {
        if (typeof MovableObject !== 'undefined' && MovableObject.placedObjects) {
            MovableObject.placedObjects = [];
        }
        this.removeElement('settings-overlay');
        this.removeElement('custom-confirm');
    }

    /**
     * Removes an element by its ID.
     * @param {string} id - The ID of the element to remove
     */
    removeElement(id) {
        const element = document.getElementById(id);
        if (element) element.remove();
    }

    /**
     * Resets global references to game screens.
     */
    resetGlobalReferences() {
        window.gameOverScreen = null;
        window.wonScreen = null;
    }

    /**
     * Starts the restart sequence with a delay.
     */
    startRestartSequence() {
        setTimeout(() => {
            this.initializeLevel();
        }, 200);
    }

    /**
     * Initializes the game level.
     */
    initializeLevel() {
        try {
            initLevel1();
            setTimeout(() => this.initializeGame(), 100);
        } catch (levelError) {
            window.location.reload();
        }
    }

    /**
     * Initializes the game.
     */
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

    /**
     * Finalizes the restart process.
     */
    finalizeRestart() {
        this.setupWorldSettings();
        setTimeout(() => this.reinitializeUI(), 200);
    }

    /**
     * Sets up world settings after restart.
     */
    setupWorldSettings() {
        window.world.isPaused = false;
        if (window.world.userInterface?.audioManager) {
            window.world.userInterface.audioManager.initBackgroundMusic();
            window.world.userInterface.audioManager.playBackgroundMusic();
        }
    }

    /**
     * Reinitializes the user interface.
     */
    reinitializeUI() {
        if (window.world?.userInterface) {
            window.world.userInterface.reinitializeUI();
            this.reinitializeAudio();
        }
        window._inRestart = false;
    }

    /**
     * Reinitializes audio elements.
     */
    reinitializeAudio() {
        setTimeout(() => {
            if (window.world?.userInterface?.audioManager) {
                window.world.userInterface.audioManager.reinitializeAudioElements();
            }
        }, 200);
    }

    /**
     * Cleans up the old world instance before creating a new one.
     */
    cleanupOldWorld() {
        if (window.world) {
            window.world.cleanup();
            window.removeEventListener('resize', window.world.adjustPosition);
            if (window.world.userInterface?.audioManager) {
                window.world.userInterface.audioManager.pauseBackgroundMusic();
            }
            window.world = null;
        }
    }

    /**
     * Returns to the main menu by reloading the page.
     */
    backToMainMenu() {
        this.hide();
        window.location.reload();
    }

    /**
     * Hides the game over screen.
     */
    hide() {
        if (this.container) {
            this.container.classList.remove('show');
            this.container.classList.add('d-none');
            this.container.style.display = 'none';
            setTimeout(() => {
                if (this.container && this.container.parentNode) {
                    this.container.parentNode.removeChild(this.container);
                    this.container = null;
                }
            }, 50);
        }
    }
}