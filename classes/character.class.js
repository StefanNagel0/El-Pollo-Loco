class Character extends MovableObject {
    bottles = 0;
    x = 120;
    y = 145;
    height = 280;
    width = 130;
    speed = 10;
    previousY = 145;
    runSound = null;
    deathAnimationPlayed = false;
    deathAnimationFrame = 0;
    offset = { top: 112, left: 30, right: 20, bottom: 15 };
    collidingEnemies = [];
    idleTime = 0;
    idleAnimationInterval = 0;
    sleepAnimationInterval = 0;
    yawnPlayed = false;
    sleepSound = null;

    IMAGES_WALKING = [
        '../assets/img/2_character_pepe/2_walk/W-21.png',
        '../assets/img/2_character_pepe/2_walk/W-22.png',
        '../assets/img/2_character_pepe/2_walk/W-23.png',
        '../assets/img/2_character_pepe/2_walk/W-24.png',
        '../assets/img/2_character_pepe/2_walk/W-25.png',
        '../assets/img/2_character_pepe/2_walk/W-26.png'
    ];
    IMAGES_JUMPING = [
        '../assets/img/2_character_pepe/3_jump/J-31.png',
        '../assets/img/2_character_pepe/3_jump/J-32.png',
        '../assets/img/2_character_pepe/3_jump/J-33.png',
        '../assets/img/2_character_pepe/3_jump/J-34.png',
        '../assets/img/2_character_pepe/3_jump/J-35.png',
        '../assets/img/2_character_pepe/3_jump/J-36.png',
        '../assets/img/2_character_pepe/3_jump/J-37.png',
        '../assets/img/2_character_pepe/3_jump/J-38.png',
        '../assets/img/2_character_pepe/3_jump/J-39.png'
    ];
    IMAGES_HURT = [
        '../assets/img/2_character_pepe/4_hurt/H-41.png',
        '../assets/img/2_character_pepe/4_hurt/H-42.png',
        '../assets/img/2_character_pepe/4_hurt/H-43.png'
    ];
    IMAGES_DEAD = [
        '../assets/img/2_character_pepe/5_dead/D-51.png',
        '../assets/img/2_character_pepe/5_dead/D-52.png',
        '../assets/img/2_character_pepe/5_dead/D-53.png',
        '../assets/img/2_character_pepe/5_dead/D-54.png',
        '../assets/img/2_character_pepe/5_dead/D-55.png',
        '../assets/img/2_character_pepe/5_dead/D-56.png',
        '../assets/img/2_character_pepe/5_dead/D-57.png'
    ];
    IMAGES_IDLE = [
        '../assets/img/2_character_pepe/1_idle/idle/I-1.png',
        '../assets/img/2_character_pepe/1_idle/idle/I-2.png',
        '../assets/img/2_character_pepe/1_idle/idle/I-3.png',
        '../assets/img/2_character_pepe/1_idle/idle/I-4.png',
        '../assets/img/2_character_pepe/1_idle/idle/I-5.png',
        '../assets/img/2_character_pepe/1_idle/idle/I-6.png',
        '../assets/img/2_character_pepe/1_idle/idle/I-7.png',
        '../assets/img/2_character_pepe/1_idle/idle/I-8.png',
        '../assets/img/2_character_pepe/1_idle/idle/I-9.png',
        '../assets/img/2_character_pepe/1_idle/idle/I-10.png'
    ];
    IMAGES_SLEEPING = [
        '../assets/img/2_character_pepe/1_idle/long_idle/I-11.png',
        '../assets/img/2_character_pepe/1_idle/long_idle/I-12.png',
        '../assets/img/2_character_pepe/1_idle/long_idle/I-13.png',
        '../assets/img/2_character_pepe/1_idle/long_idle/I-14.png',
        '../assets/img/2_character_pepe/1_idle/long_idle/I-15.png',
        '../assets/img/2_character_pepe/1_idle/long_idle/I-16.png',
        '../assets/img/2_character_pepe/1_idle/long_idle/I-17.png',
        '../assets/img/2_character_pepe/1_idle/long_idle/I-18.png',
        '../assets/img/2_character_pepe/1_idle/long_idle/I-19.png',
        '../assets/img/2_character_pepe/1_idle/long_idle/I-20.png'
    ];

    constructor() {
        super().loadImage('../assets/img/2_character_pepe/1_idle/idle/I-1.png');
        this.loadAllImages();
        this.applyGravity();
        this.initializeSounds();
        this.animate();
    }

    loadAllImages() {
        this.loadImages(this.IMAGES_IDLE);
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_JUMPING);
        this.loadImages(this.IMAGES_SLEEPING);
        this.loadImages(this.IMAGES_DEAD);
        this.loadImages(this.IMAGES_HURT);
    }

    initializeSounds() {
        this.runSound = new Audio('../assets/audio/character_run.mp3');
        this.runSound.loop = true;
        if (this.world && this.world.userInterface) {
            this.world.userInterface.registerAudioWithCategory(this.runSound, 'character');
        }
    }

    collectCoin() {
        this.coins = (this.coins || 0) + 1;
        this.world.statusBar.setCoinsCount(this.coins);
        this.playSound('../assets/audio/collect_coins.mp3', 'objects');
    }

    collectBottle() {
        this.bottles = (this.bottles || 0) + 1;
        this.world.statusBar.setBottlesCount(this.bottles);
        this.playSound('../assets/audio/collect_bottle.mp3', 'objects');
    }

    jump() {
        super.jump();
        this.playSound('../assets/audio/character_jump.mp3', 'character');
    }

    playSound(path, category) {
        const sound = new Audio(path);
        this.world.userInterface.registerAudioWithCategory(sound, category);
        if (!this.world.userInterface.isMuted) {
            const volume = this.world.userInterface[`${category}Volume`] / 10;
            sound.volume = volume;
            sound.play();
        }
    }

    animate() {
        this.setupMovementAnimation();
        this.setupActionAnimation();
    }

    setupMovementAnimation() {
        setInterval(() => {
            if (!this.world || !this.world.isPaused) {
                this.previousY = this.y;
                this.handleCharacterMovement();
                this.updateCameraPosition();
            }
        }, 1000 / 60);
    }

    handleCharacterMovement() {
        if (this.world && this.world.keyboard && !this.isDead()) {
            this.moveCharacter();
            if (this.world.keyboard.SPACE && !this.isAboveGround()) {
                this.jump();
            }
        }
    }

    moveCharacter() {
        if (this.world.keyboard.RIGHT && this.x < this.world.level.level_end_x - this.width) {
            this.moveRight();
            this.otherDirection = false;
        }
        if (this.world.keyboard.LEFT && this.x > 0) {
            this.moveLeft();
            this.otherDirection = true;
        }
    }

    updateCameraPosition() {
        if (this.world) {
            let newCameraX = -this.x + 100;
            newCameraX = Math.max(newCameraX, -this.world.level.level_end_x + this.world.canvas.width);
            newCameraX = Math.min(newCameraX, 0);
            this.world.camera_x = newCameraX;
        }
    }

    setupActionAnimation() {
        setInterval(() => {
            if (!this.world || !this.world.isPaused) {
                this.handleCharacterState();
            }
        }, 50);
    }

    handleCharacterState() {
        if (this.isDead()) {
            this.handleDeath();
        } else if (this.isHurt()) {
            this.handleHurt();
        } else {
            this.handleIdleOrWalking();
        }
    }

    handleDeath() {
        this.y += 10;
        if (!this.deathAnimationPlayed) {
            this.playDeathAnimation();
        } else {
            this.img = this.imageCache[this.IMAGES_DEAD[5]];
        }
        if (!this.gameOverScreenShown) {
            this.showGameOverScreen();
        }
    }

    playDeathAnimation() {
        if (this.deathAnimationFrame < 6) {
            this.img = this.imageCache[this.IMAGES_DEAD[this.deathAnimationFrame]];
            this.deathAnimationFrame++;
        } else {
            this.deathAnimationPlayed = true;
        }
    }

    showGameOverScreen() {
        this.gameOverScreenShown = true;
        if (this.world && this.world.userInterface) {
            // Hintergrundmusik pausieren
            if (this.world.userInterface.backgroundMusic) {
                this.world.userInterface.backgroundMusic.pause();
            }
            
            // Todes-Sound abspielen
            const deathSound = new Audio('../assets/audio/character_death.mp3');
            this.world.userInterface.registerAudioWithCategory(deathSound, 'character');
            if (!this.world.userInterface.isMuted) {
                deathSound.play();
            }
        }
        
        setTimeout(() => {
            if (!window.gameOverScreen) {
                window.gameOverScreen = new Endscreen();
            }
            window.gameOverScreen.show();
        }, 1700);
    }

    handleHurt() {
        if (!this.hurtSoundPlayed) {
            this.playHurtSound();
            this.hurtSoundPlayed = true;
        }
        this.playAnimation(this.IMAGES_HURT);
        this.resetIdleState();
    }

    playHurtSound() {
        this.playSound('../assets/audio/hurt.mp3', 'character');
    }

    handleIdleOrWalking() {
        this.hurtSoundPlayed = false;
        if (this.isAboveGround()) {
            this.playAnimation(this.IMAGES_JUMPING);
            this.resetIdleState();
        } else if (this.world.keyboard.RIGHT || this.world.keyboard.LEFT) {
            this.playAnimation(this.IMAGES_WALKING);
            this.resetIdleState();
        } else {
            this.handleIdleState();
        }
    }

    handleIdleState() {
        this.idleAnimationInterval++;
        this.idleTime += 50;

        if (this.idleTime >= 6500 && !this.yawnPlayed) {
            this.playYawnSound();
        }
        if (this.idleTime >= 15000) {
            this.playSleepAnimation();
        } else {
            this.playIdleAnimation();
        }
    }

    playYawnSound() {
        this.playSound('../assets/audio/yawn.mp3', 'character');
        this.yawnPlayed = true;
    }

    playSleepAnimation() {
        if (this.sleepAnimationInterval >= 7.5) {
            this.playAnimation(this.IMAGES_SLEEPING);
            this.sleepAnimationInterval = 0;
        } else {
            this.sleepAnimationInterval++;
        }
    }

    playIdleAnimation() {
        if (this.idleAnimationInterval >= 30) {
            this.playAnimation(this.IMAGES_IDLE);
            this.idleAnimationInterval = 0;
        }
    }

    resetIdleState() {
        this.idleTime = 0;
        this.idleAnimationInterval = 0;
        this.sleepAnimationInterval = 0;
        this.yawnPlayed = false;

        if (this.sleepSound) {
            this.sleepSound.pause();
            this.sleepSound = null;
        }
    }
}