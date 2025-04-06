class Character extends MovableObject {
    bottles = 0;
    x = 120;
    y = 80;
    height = 280;
    width = 130;
    speed = 10;
    previousY = 80;
    runSound = null; // Variable für den Laufsound
    deathAnimationPlayed = false;
    deathAnimationFrame = 0;
    offset = {
        top: 112,
        left: 30,
        right:20,
        bottom:15,
    };
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

    constructor() {
        super().loadImage('../assets/img/2_character_pepe/1_idle/idle/I-1.png');
        this.loadImages(this.IMAGES_IDLE);        
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_JUMPING);
        this.loadImages(this.IMAGES_SLEEPING);
        this.loadImages(this.IMAGES_DEAD);
        this.loadImages(this.IMAGES_HURT);
        this.applyGravity();
        
        // Sound für das Laufen initialisieren
        this.runSound = new Audio('../assets/audio/character_run.mp3');
        this.runSound.loop = true; // Loop aktivieren
        
        this.animate();
    }

    collectCoin() {
        this.coins = (this.coins || 0) + 1;
        const percentage = Math.min(this.coins * 20, 100);
        this.world.statusBar.setCoinsPercentage(percentage);

        // Coin-Sound abspielen und registrieren
        const coinSound = new Audio('../assets/audio/collect_coins.mp3');
        this.world.userInterface.registerAudio(coinSound); // Sound bei der UserInterface registrieren

        if (!this.world.userInterface.isMuted) {
            coinSound.play(); // Nur abspielen, wenn nicht stummgeschaltet
        }
    }

    collectBottle() {
        this.bottles = (this.bottles || 0) + 1; // Erhöhe die Anzahl der gesammelten Bottles
        const percentage = Math.min(this.bottles * 20, 100); // Maximal 100%
        this.world.statusBar.setBottlesPercentage(percentage); // Aktualisiere die Statusbar

        // Bottle-Sound abspielen
        const bottleSound = new Audio('../assets/audio/collect_bottle.mp3');
        this.world.userInterface.registerAudio(bottleSound); // Sound bei der UserInterface registrieren

        if (!this.world.userInterface.isMuted) {
            bottleSound.play(); // Nur abspielen, wenn nicht stummgeschaltet
        }
    }

    jump() {
        super.jump(); // Ruft die Original-Methode aus MovableObject auf
        
        // Sprung-Sound abspielen
        const jumpSound = new Audio('../assets/audio/character_jump.mp3');
        this.world.userInterface.registerAudio(jumpSound); // Sound bei der UserInterface registrieren
        
        if (!this.world.userInterface.isMuted) {
            jumpSound.play(); // Nur abspielen, wenn nicht stummgeschaltet
        }
    }

    animate() {
        setInterval(() => {
            this.previousY = this.y;

            // Bewegungslogik und Sound-Steuerung
            let isRunning = false;
            
            if (this.world && this.world.keyboard) {
                if (this.world.keyboard.RIGHT && this.x < this.world.level.level_end_x) {
                    this.moveRight();
                    this.otherDirection = false;
                    isRunning = true;
                }
                if (this.world.keyboard.LEFT && this.x > 0) {
                    this.moveLeft();
                    this.otherDirection = true;
                    isRunning = true;
                }
                if (this.world.keyboard.SPACE && !this.isAboveGround()) {
                    this.jump();
                }
                
                // Sound-Steuerung: Abspielen oder Stoppen des Laufsounds
                if (isRunning && !this.isAboveGround() && !this.isDead()) {
                    if (this.world.userInterface && !this.runSound.playing) {
                        this.world.userInterface.registerAudio(this.runSound);
                        if (!this.world.userInterface.isMuted) {
                            this.runSound.play();
                            this.runSound.playing = true;
                        }
                    }
                } else {
                    if (this.runSound.playing) {
                        this.runSound.pause();
                        this.runSound.currentTime = 0;
                        this.runSound.playing = false;
                    }
                }
            }
            
            if (this.world) {
                this.world.camera_x = 0 - this.x + 100;
            }
        }, 1000 / 60);

        let idleAnimationInterval = 0;
        let idleTime = 0;
        let sleepAnimationInterval = 0;
        let yawnPlayed = false;
        let sleepSound = null;

        setInterval(() => {
            if (this.isDead()) {
                // Immer fallen lassen, sobald der Charakter tot ist
                this.y += 10; // Fallgeschwindigkeit

                if (!this.deathAnimationPlayed) {
                    // Tod-Animation nur bis zum vorletzten Bild (D-56.png) abspielen
                    if (this.deathAnimationFrame < 6) { // D-56.png ist das 6. Bild (Index 5)
                        let path = this.IMAGES_DEAD[this.deathAnimationFrame];
                        this.img = this.imageCache[path];
                        this.deathAnimationFrame++;
                    } else {
                        // Bei D-56.png (Index 5) stehen bleiben
                        this.img = this.imageCache[this.IMAGES_DEAD[5]];
                        this.deathAnimationPlayed = true;
                    }
                }
                
                // Sound stoppen
                if (sleepSound) {
                    sleepSound.pause();
                    sleepSound = null;
                }
                
                // Optionaler Todesgeräusch
                if (!this.deathSoundPlayed) {
                    const deathSound = new Audio('../assets/audio/death.mp3');
                    this.world.userInterface.registerAudio(deathSound);
                    
                    if (!this.world.userInterface.isMuted) {
                        deathSound.play();
                    }
                    this.deathSoundPlayed = true;
                }
            } else if (this.isHurt()) {
                if (!this.hurtSoundPlayed) {
                    const hurtSound = new Audio('../assets/audio/hurt.mp3');
                    this.world.userInterface.registerAudio(hurtSound); // Sound registrieren

                    if (!this.world.userInterface.isMuted) {
                        hurtSound.play(); // Nur abspielen, wenn nicht stummgeschaltet
                    }
                    this.hurtSoundPlayed = true;
                }
                this.playAnimation(this.IMAGES_HURT);
                if (sleepSound) {
                    sleepSound.pause();
                    sleepSound = null;
                }
            } else {
                this.hurtSoundPlayed = false;
                if (this.isAboveGround()) {
                    this.playAnimation(this.IMAGES_JUMPING);
                    idleTime = 0;
                    yawnPlayed = false;
                    if (sleepSound) {
                        sleepSound.pause();
                        sleepSound = null;
                    }
                } else if (this.world.keyboard.RIGHT || this.world.keyboard.LEFT) {
                    this.playAnimation(this.IMAGES_WALKING);
                    idleTime = 0;
                    yawnPlayed = false;
                    if (sleepSound) {
                        sleepSound.pause();
                        sleepSound = null;
                    }
                } else {
                    idleAnimationInterval++;
                    idleTime += 50;

                    if (idleTime >= 6500 && !yawnPlayed) {
                        const yawnSound = new Audio('../assets/audio/yawn.mp3');
                        this.world.userInterface.registerAudio(yawnSound);

                        if (!this.world.userInterface.isMuted) {
                            yawnSound.play(); // Nur abspielen, wenn nicht stummgeschaltet
                        }
                        yawnPlayed = true;
                    }

                    if (idleTime >= 15000) {
                        sleepAnimationInterval++;
                        if (sleepAnimationInterval >= 7.5) {
                            this.playAnimation(this.IMAGES_SLEEPING);

                            // Sleep-Sound abspielen
                            if (!sleepSound) {
                                sleepSound = new Audio('../assets/audio/sleep.mp3');
                                if (sleepSound) {
                                    this.world.userInterface.registerAudio(sleepSound);
                                    sleepSound.loop = true;
                                    if (!this.world.userInterface.isMuted) {
                                        sleepSound.play();
                                    }
                                } else {
                                    console.error('Failed to create sleepSound instance');
                                }
                            }
                            sleepAnimationInterval = 0;
                        }
                    } else {
                        if (sleepSound) {
                            sleepSound.pause();
                            sleepSound = null;
                        }
                        if (idleAnimationInterval >= 30) {
                            this.playAnimation(this.IMAGES_IDLE);
                            idleAnimationInterval = 0;
                        }
                    }
                }
            }
        }, 50);
    }
}