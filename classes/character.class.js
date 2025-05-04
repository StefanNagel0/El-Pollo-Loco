/**
 * Represents the main player character in the game.
 * Handles movement, animations, collisions, and sound effects.
 * @class
 * @extends MovableObject
 */
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
    IMAGES_WALKING = [
        '../assets/img/2_character_pepe/2_walk/W-21.png',
        '../assets/img/2_character_pepe/2_walk/W-22.png',
        '../assets/img/2_character_pepe/2_walk/W-23.png',
        '../assets/img/2_character_pepe/2_walk/W-24.png',
        '../assets/img/2_character_pepe/2_walk/W-25.png',
        '../assets/img/2_character_pepe/2_walk/W-26.png'
    ]
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
    ]
    IMAGES_HURT = [
        '../assets/img/2_character_pepe/4_hurt/H-41.png',
        '../assets/img/2_character_pepe/4_hurt/H-42.png',
        '../assets/img/2_character_pepe/4_hurt/H-43.png'
    ]
    IMAGES_DEAD = [
        '../assets/img/2_character_pepe/5_dead/D-51.png',
        '../assets/img/2_character_pepe/5_dead/D-52.png',
        '../assets/img/2_character_pepe/5_dead/D-53.png',
        '../assets/img/2_character_pepe/5_dead/D-54.png',
        '../assets/img/2_character_pepe/5_dead/D-55.png',
        '../assets/img/2_character_pepe/5_dead/D-56.png',
        '../assets/img/2_character_pepe/5_dead/D-57.png'
    ]
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
    ]
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
    ]
    world;
    idleTime = 0;
    idleAnimationInterval = 0;
    sleepAnimationInterval = 0;
    yawnPlayed = false;
    sleepSound = null;
    gameOverScreenShown = false;
    deathSoundPlayed = false;
    hurtSoundPlayed = false;

    /**
     * Creates a new character and initializes its properties and animations.
     */
    constructor() {
        super().loadImage('../assets/img/2_character_pepe/1_idle/idle/I-1.png');
        this.loadImages(this.IMAGES_IDLE);
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_JUMPING);
        this.loadImages(this.IMAGES_SLEEPING);
        this.loadImages(this.IMAGES_DEAD);
        this.loadImages(this.IMAGES_HURT);
        this.applyGravity();
        this.setupSounds();
        this.offset = { top: 160, bottom: 30, left: 45, right: 45 };
        this.collidingEnemies = [];
        this.animate();
    }

    /**
     * Sets up sound effects for the character.
     */
    setupSounds() {
        this.runSound = new Audio('../assets/audio/character_run.mp3');
        this.runSound.loop = true;
        if (this.world?.userInterface) {
            this.world.userInterface.registerAudioWithCategory(this.runSound, 'character');
        }
    }

    /**
     * Handles collecting a coin, updating the status bar and playing sound effects.
     */
    collectCoin() {
        this.coins = (this.coins || 0) + 1;
        this.world.statusBar.setCoinsCount(this.coins);
        this.playObjectSound('../assets/audio/collect_coins.mp3');
    }

    /**
     * Handles collecting a bottle, updating the status bar and playing sound effects.
     */
    collectBottle() {
        this.bottles = (this.bottles || 0) + 1;
        this.world.statusBar.setBottlesCount(this.bottles);
        this.playObjectSound('../assets/audio/collect_bottle.mp3');
    }

    /**
     * Makes the character jump and plays the corresponding sound effect.
     * @override
     */
    jump() {
        super.jump();
        this.playCharacterSound('../assets/audio/character_jump.mp3', false);
    }

    /**
     * Sets up animation intervals for the character.
     */
    animate() {
        this.animationIntervals.push(
            setInterval(() => this.handleMovementAndCamera(), 1000 / 60)
        );
        this.animationIntervals.push(
            setInterval(() => this.handleAnimationStates(), 50)
        );
    }

    /**
     * Handles character movement and camera updates.
     */
    handleMovementAndCamera() {
        if (!this.world?.isPaused) {
            this.previousY = this.y;
            this.handleInput();
            this.updateCameraPosition();
        }
    }

    /**
     * Processes keyboard input for character movement.
     */
    handleInput() {
        if (this.world?.keyboard && !this.isDead()) {
            if (this.world.keyboard.RIGHT && this.x < this.world.level.level_end_x - this.width) {
                this.moveRight(); this.otherDirection = false;
            }
            if (this.world.keyboard.LEFT && this.x > 0) {
                this.moveLeft(); this.otherDirection = true;
            }
            if (this.world.keyboard.SPACE && !this.isAboveGround()) this.jump();
        }
    }

    /**
     * Updates the camera position based on character location.
     */
    updateCameraPosition() {
        if (this.world) {
            let newCameraX = -this.x + 100;
            newCameraX = Math.max(newCameraX, -this.world.level.level_end_x + this.world.canvas.width);
            newCameraX = Math.min(newCameraX, 0);
            this.world.camera_x = newCameraX;
        }
    }

    /**
     * Determines which animation to play based on character state.
     */
    handleAnimationStates() {
        if (!this.world?.isPaused) {
            if (this.isDead()) this.handleDeathAnimation();
            else if (this.isHurt()) this.handleHurtAnimation();
            else this.handleGroundedAnimations();
        }
    }

    /**
     * Handles death animation sequence and triggers game over.
     */
    handleDeathAnimation() {
        this.y += 10;
        if (!this.deathAnimationPlayed) {
            if (this.deathAnimationFrame < 6) {
                this.img = this.imageCache[this.IMAGES_DEAD[this.deathAnimationFrame++]];
            } else {
                this.img = this.imageCache[this.IMAGES_DEAD[5]];
                this.deathAnimationPlayed = true;
            }
        } else {
            this.img = this.imageCache[this.IMAGES_DEAD[5]];
        }
        this.gameOverScreenShown || this.triggerGameOverSequence();
        this.deathSoundPlayed || this.playDeathSounds();
        if (this.sleepSound) { this.sleepSound.pause(); this.sleepSound = null; }
    }

    /**
     * Triggers the game over sequence with appropriate timing.
     */
    triggerGameOverSequence() {
        if (this.gameOverScreenShown || (this.world && !this.world.endGame('lose'))) {
            return;
        }
        
        this.gameOverScreenShown = true;
        this.world?.userInterface?.backgroundMusic?.pause();
        setTimeout(() => {
            this.playMusicSound('../assets/audio/game_lose.mp3');
            if (!window.gameOverScreen) window.gameOverScreen = new Endscreen();
            window.gameOverScreen.show();
        }, 1700);
    }

    /**
     * Plays death-related sound effects with proper timing.
     */
    playDeathSounds() {
        this.playCharacterSound('../assets/audio/character_death.mp3', false);
        this.deathSoundPlayed = true;
        setTimeout(() => this.playMusicSound('../assets/audio/game_lose.mp3'), 500);
    }

    /**
     * Handles the hurt animation sequence and related sound effects.
     */
    handleHurtAnimation() {
        if (!this.hurtSoundPlayed) {
            this.playCharacterSound('../assets/audio/hurt.mp3', false);
            this.hurtSoundPlayed = true;
        }
        this.playAnimation(this.IMAGES_HURT);
        this.resetIdleState();
    }

    /**
     * Handles animations for when the character is grounded (not dead or hurt).
     */
    handleGroundedAnimations() {
        this.hurtSoundPlayed = false;
        if (this.isAboveGround()) {
            this.playAnimation(this.IMAGES_JUMPING);
            this.resetIdleState();
        } else if (this.world.keyboard.RIGHT || this.world.keyboard.LEFT) {
            this.playAnimation(this.IMAGES_WALKING);
            this.resetIdleState();
        } else {
            this.handleIdleAndSleep();
        }
    }

    /**
     * Manages idle and sleep states based on inactivity duration.
     */
    handleIdleAndSleep() {
        this.idleAnimationInterval++;
        this.idleTime += 50;
        if (this.idleTime >= 6500 && !this.yawnPlayed) {
            this.playCharacterSound('../assets/audio/yawn.mp3', false);
            this.yawnPlayed = true;
        }
        if (this.idleTime >= 15000) {
            this.handleSleepState();
        } else {
            this.handleIdleState();
        }
    }

    /**
     * Handles the sleeping animation and sound effects.
     */
    handleSleepState() {
        this.sleepAnimationInterval++;
        if (this.sleepAnimationInterval >= 7.5) {
            this.playAnimation(this.IMAGES_SLEEPING);
            if (!this.sleepSound) {
                this.sleepSound = this.playCharacterSound('../assets/audio/sleep.mp3', true);
            }
            this.sleepAnimationInterval = 0;
        }
    }

    /**
     * Handles the idle animation when the character is stationary.
     */
    handleIdleState() {
        if (this.sleepSound) {
            this.sleepSound.pause();
            this.sleepSound = null;
        }
        if (this.idleAnimationInterval >= 3) {
            this.playAnimation(this.IMAGES_IDLE);
            this.idleAnimationInterval = 0;
        }
    }

    /**
     * Resets the idle state counters and cleans up related resources.
     */
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

    /**
     * Plays a sound effect categorized as character sound.
     * @param {string} src - Path to the audio file
     * @param {boolean} loop - Whether the sound should loop
     * @returns {HTMLAudioElement} The created audio element
     */
    playCharacterSound(src, loop = false) {
        return this.playSound(src, 'character', loop);
    }

    /**
     * Plays a sound effect categorized as object sound.
     * @param {string} src - Path to the audio file
     * @param {boolean} loop - Whether the sound should loop
     * @returns {HTMLAudioElement} The created audio element
     */
    playObjectSound(src, loop = false) {
        return this.playSound(src, 'objects', loop);
    }

    /**
     * Plays a sound effect categorized as music sound.
     * @param {string} src - Path to the audio file
     * @param {boolean} loop - Whether the sound should loop
     * @returns {HTMLAudioElement} The created audio element
     */
    playMusicSound(src, loop = false) {
        return this.playSound(src, 'music', loop);
    }

    /**
     * Generic method to play a sound effect with category-based volume control.
     * @param {string} src - Path to the audio file
     * @param {string} category - Audio category for volume control
     * @param {boolean} loop - Whether the sound should loop
     * @returns {HTMLAudioElement} The created audio element
     */
    playSound(src, category, loop) {
        const sound = new Audio(src);
        sound.loop = loop;
        if (this.world?.userInterface) {
            this.world.userInterface.registerAudioWithCategory(sound, category);
            if (!this.world.userInterface.isMuted) {
                const volume = this.world.userInterface[`${category}Volume`] / 10;
                sound.volume = volume;
                sound.play();
            }
        }
        return sound;
    }
}