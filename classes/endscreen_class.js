class Endscreen {
    constructor() {
        this.container = null;
        this.gameOverImages = this.loadGameOverImages();
        this.selectedImage = this.getRandomGameOverImage();
    }

    loadGameOverImages() {
        return [
            '../assets/img/9_intro_outro_screens/game_over/oh no you lost!.png',
            '../assets/img/9_intro_outro_screens/game_over/game over.png',
            '../assets/img/9_intro_outro_screens/game_over/game over!.png',
            '../assets/img/9_intro_outro_screens/game_over/you lost.png'
        ];
    }

    getRandomGameOverImage() {
        const randomIndex = Math.floor(Math.random() * this.gameOverImages.length);
        return this.gameOverImages[randomIndex];
    }

    show() {
        if (window.world) this.pauseGameAndHideEnemies();
        if (!this.container) this.createGameOverScreen();
        this.displayGameOverScreen();
    }

    pauseGameAndHideEnemies() {
        window.world.isPaused = true;
        this.hideEnemies();
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
        this.container = this.createEndscreenContainer();
        const gameOverImage = this.createGameOverImage();
        const buttonContainer = this.createButtonContainer();
        this.container.append(gameOverImage, buttonContainer);
        document.body.appendChild(this.container);
    }

    createEndscreenContainer() {
        const container = document.createElement('div');
        container.id = 'game-over-screen';
        container.classList.add('d-none');
        return container;
    }

    createGameOverImage() {
        const img = document.createElement('img');
        img.src = this.selectedImage;
        img.alt = 'Game Over';
        img.classList.add('game-over-image');
        return img;
    }

    createButtonContainer() {
        const container = document.createElement('div');
        container.classList.add('game-over-buttons');
        container.append(this.createRestartButton(), this.createMainMenuButton());
        return container;
    }

    createRestartButton() {
        const button = document.createElement('button');
        button.textContent = 'Restart Game';
        button.classList.add('game-over-button');
        button.addEventListener('click', () => this.restartGame());
        return button;
    }

    createMainMenuButton() {
        const button = document.createElement('button');
        button.textContent = 'Back to Main Menu';
        button.classList.add('game-over-button');
        button.addEventListener('click', () => this.backToMainMenu());
        return button;
    }

    displayGameOverScreen() {
        this.container.classList.remove('d-none');
        this.container.classList.add('show');
        this.container.style.display = 'flex';
        this.adjustPosition();
    }

    adjustPosition() {
        const canvas = document.getElementById('canvas');
        if (canvas && this.container) {
            const canvasRect = canvas.getBoundingClientRect();
            Object.assign(this.container.style, {
                position: 'absolute',
                top: `${canvasRect.top}px`,
                left: `${canvasRect.left}px`,
                width: `${canvasRect.width}px`,
                height: `${canvasRect.height}px`
            });
        }
    }

    restartGame() {
        this.hide();
        this.storeRestartState();
        setTimeout(() => window.location.reload(), 50);
    }

    storeRestartState() {
        const timestamp = new Date().getTime();
        localStorage.setItem('elPolloLoco_startGame', 'true');
        localStorage.setItem('elPolloLoco_restartTimestamp', timestamp.toString());
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