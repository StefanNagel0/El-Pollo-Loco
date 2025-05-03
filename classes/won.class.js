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
        this.adjustPosition();
        window.addEventListener('resize', this.adjustPosition.bind(this));
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
     * Adjusts the position of the victory screen to match the canvas position.
     * Ensures the screen is properly aligned when the window size changes.
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
     * Handles restarting the game when the restart button is clicked.
     * Sets flags in localStorage and reloads the page to restart.
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
        }
    }
}