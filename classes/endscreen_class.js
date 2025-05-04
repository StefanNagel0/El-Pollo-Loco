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

    /**
     */
    adjustPosition() {
    }

    /**
     * Handles restarting the game when the restart button is clicked.
     * Sets flags in localStorage and reloads the page.
     */
    restartGame() {
        this.hide();
        const timestamp = new Date().getTime();
        localStorage.setItem('elPolloLoco_startGame', 'true');
        localStorage.setItem('elPolloLoco_restartTimestamp', timestamp.toString());
        setTimeout(() => window.location.reload(), 50);
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
        }
    }
}