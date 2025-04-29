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

    getRandomGameOverImage() {
        const randomIndex = Math.floor(Math.random() * this.gameOverImages.length);
        return this.gameOverImages[randomIndex];
    }

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
        this.adjustPosition();
    }

    hideEnemies() {
        if (window.world?.level?.enemies) {
            window.world.level.enemies.forEach(enemy => {
                enemy.originalY = enemy.y;
                enemy.y = -1000;
            });
        }
    }

    createGameOverScreen() {
        this.createContainer();
        const gameOverImage = this.createImageElement();
        const buttonContainer = this.createButtonContainer();
        this.appendElementsToContainer(gameOverImage, buttonContainer);
        document.body.appendChild(this.container);
    }

    createContainer() {
        this.container = document.createElement('div');
        this.container.id = 'game-over-screen';
        this.container.classList.add('d-none');
    }

    createImageElement() {
        const img = document.createElement('img');
        img.src = this.selectedImage;
        img.alt = 'Game Over';
        img.classList.add('game-over-image');
        return img;
    }

    createButtonContainer() {
        const container = document.createElement('div');
        container.classList.add('game-over-buttons');
        const restartBtn = this.createButton('Restart Game', () => this.restartGame());
        const mainMenuBtn = this.createButton('Back to Main Menu', () => this.backToMainMenu());
        container.appendChild(restartBtn);
        container.appendChild(mainMenuBtn);
        return container;
    }

    createButton(text, onClick) {
        const button = document.createElement('button');
        button.textContent = text;
        button.classList.add('game-over-button');
        button.addEventListener('click', onClick);
        return button;
    }

    appendElementsToContainer(image, buttons) {
        this.container.appendChild(image);
        this.container.appendChild(buttons);
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
            this.container.style.display = 'none';
        }
    }
}