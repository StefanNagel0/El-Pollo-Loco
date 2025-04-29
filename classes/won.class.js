class Won {
    constructor() {
        this.container = null;
    }

    show() {
        if (window.world) window.world.isPaused = true;
        if (!this.container) this.createWonScreen();
        this.container.classList.remove('d-none');
        this.container.classList.add('show');
        this.adjustPosition();
        window.addEventListener('resize', this.adjustPosition.bind(this));
    }

    createWonScreen() {
        this.container = this.createContainer();
        const textContainer = this.createTextContent();
        const buttonContainer = this.createButtonContainer();
        this.container.appendChild(textContainer);
        this.container.appendChild(buttonContainer);
        document.body.appendChild(this.container);
    }

    createContainer() {
        const container = document.createElement('div');
        container.id = 'game-won-screen';
        container.classList.add('d-none');
        return container;
    }

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

    createButtonContainer() {
        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('game-won-buttons');
        const restartButton = this.createButton('Restart Game', () => this.restartGame());
        const mainMenuButton = this.createButton('Back to Main Menu', () => this.backToMainMenu());
        buttonContainer.appendChild(restartButton);
        buttonContainer.appendChild(mainMenuButton);
        return buttonContainer;
    }

    createButton(text, clickHandler) {
        const button = document.createElement('button');
        button.textContent = text;
        button.classList.add('game-button');
        button.addEventListener('click', clickHandler);
        return button;
    }

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

    restartGame() {
        this.hide();
        const timestamp = new Date().getTime();
        localStorage.setItem('elPolloLoco_startGame', 'true');
        localStorage.setItem('elPolloLoco_restartTimestamp', timestamp.toString());
        setTimeout(() => window.location.reload(), 50);
    }

    backToMainMenu() {
        this.hide();
        window.location.reload();
    }

    hide() {
        if (this.container) {
            this.container.classList.remove('show');
            this.container.classList.add('d-none');
        }
    }
}