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
        
        // Sound bei der UserInterface registrieren
        if (this.world && this.world.userInterface) {
            this.world.userInterface.registerAudioWithCategory(this.runSound, 'character');
        }
        
        this.animate();
    }

    collectCoin() {
        this.coins = (this.coins || 0) + 1;
        this.world.statusBar.setCoinsCount(this.coins);

        // Coin-Sound abspielen mit "objects" Kategorie
        const coinSound = new Audio('../assets/audio/collect_coins.mp3');
        this.world.userInterface.registerAudioWithCategory(coinSound, 'objects');

        if (!this.world.userInterface.isMuted) {
            coinSound.play();
        }
    }

    collectBottle() {
        this.bottles = (this.bottles || 0) + 1;
        this.world.statusBar.setBottlesCount(this.bottles);

        // Bottle-Sound mit "objects" Kategorie
        const bottleSound = new Audio('../assets/audio/collect_bottle.mp3');
        this.world.userInterface.registerAudioWithCategory(bottleSound, 'objects');

        if (!this.world.userInterface.isMuted) {
            bottleSound.play();
        }
    }

    jump() {
        super.jump(); // Ruft die Original-Methode aus MovableObject auf
        
        // Sprung-Sound abspielen mit Kategorie
        const jumpSound = new Audio('../assets/audio/character_jump.mp3');
        this.world.userInterface.registerAudioWithCategory(jumpSound, 'character'); // Mit Kategorie registrieren
        
        if (!this.world.userInterface.isMuted) {
            jumpSound.play(); // Nur abspielen, wenn nicht stummgeschaltet
        }
    }

    animate() {
        setInterval(() => {
            this.previousY = this.y;

            if (this.world && this.world.keyboard) {
                // Bewegungslogik
                if (this.world.keyboard.RIGHT && this.x < this.world.level.level_end_x - this.width) {
                    this.moveRight();
                    this.otherDirection = false;
                }
                
                if (this.world.keyboard.LEFT && this.x > 0) {
                    this.moveLeft();
                    this.otherDirection = true;
                }
                
                if (this.world.keyboard.SPACE && !this.isAboveGround()) {
                    this.jump();
                }
                
                // Weitere Code...
            }
            
            // Kamera-Bewegung
            if (this.world) {
                let newCameraX = -this.x + 100;
                
                // Kamera nicht über den Levelanfang hinaus bewegen (links)
                if (newCameraX > 0) {
                    newCameraX = 0;
                }
                
                // Kamera nicht über das Levelende hinaus bewegen (rechts)
                const levelEnd = -this.world.level.level_end_x + this.world.canvas.width;
                if (newCameraX < levelEnd) {
                    newCameraX = levelEnd;
                }
                
                this.world.camera_x = newCameraX;
            }
        }, 1000 / 60);
        
        // Rest des animate()-Codes...
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
                
                // Todes-Sound abspielen
                if (!this.deathSoundPlayed) {
                    // Neuer Character Death Sound
                    const characterDeathSound = new Audio('../assets/audio/character_death.mp3');
                    this.world.userInterface.registerAudioWithCategory(characterDeathSound, 'character'); // Mit Kategorie registrieren
                    
                    if (!this.world.userInterface.isMuted) {
                        characterDeathSound.play();
                    }
                    this.deathSoundPlayed = true;
                    
                    // Game Lose Sound mit Verzögerung abspielen
                    setTimeout(() => {
                        const gameLoseSound = new Audio('../assets/audio/game_lose.mp3');
                        this.world.userInterface.registerAudioWithCategory(gameLoseSound, 'music');
                        
                        if (!this.world.userInterface.isMuted) {
                            gameLoseSound.play();
                        }
                    }, 500); // 500ms Verzögerung
                }
            } else if (this.isHurt()) {
                if (!this.hurtSoundPlayed) {
                    const hurtSound = new Audio('../assets/audio/hurt.mp3');
                    this.world.userInterface.registerAudioWithCategory(hurtSound, 'character'); // Mit Kategorie registrieren

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
                        this.world.userInterface.registerAudioWithCategory(yawnSound, 'character'); // Mit Kategorie registrieren

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
                                    this.world.userInterface.registerAudioWithCategory(sleepSound, 'character'); // Mit Kategorie registrieren
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