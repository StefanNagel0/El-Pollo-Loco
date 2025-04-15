class Character extends MovableObject {
    bottles = 0;
    x = 120;
    y = 145; // Änderung von 80 auf 145, damit der Character direkt auf dem Boden steht
    height = 280;
    width = 130;
    speed = 10;
    previousY = 145; // Auch hier den Wert aktualisieren
    runSound = null; // Variable für den Laufsound
    deathAnimationPlayed = false;
    deathAnimationFrame = 0;
    offset = {
        top: 112,
        left: 30,
        right:20,
        bottom:15,
    };
    collidingEnemies = []; // Liste, um Gegner zu speichern, mit denen aktuell kollidiert wird
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

    // Neue Eigenschaften für die Idle/Sleep-Animation
    idleTime = 0;
    idleAnimationInterval = 0;
    sleepAnimationInterval = 0;
    yawnPlayed = false;
    sleepSound = null;

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
        
        // Offset-Werte für präzisere Kollisionserkennung
        // Größere Werte = kleinerer Kollisionsbereich (roter Rahmen)
        this.offset = {
            top: 160,    // Sehr großer Abstand von oben
            bottom: 30,  // Größerer Abstand von unten
            left: 60,    // Größerer Abstand von links
            right: 60    // Größerer Abstand von rechts
        };

        // Liste für Kollisionsverfolgung initialisieren
        this.collidingEnemies = [];

        this.animate();
    }

    collectCoin() {
        this.coins = (this.coins || 0) + 1;
        this.world.statusBar.setCoinsCount(this.coins);

        // Coin-Sound abspielen mit "objects" Kategorie
        const coinSound = new Audio('../assets/audio/collect_coins.mp3');
        this.world.userInterface.registerAudioWithCategory(coinSound, 'objects');
        
        // Manuell die Lautstärke der objects-Kategorie anwenden
        if (!this.world.userInterface.isMuted) {
            const objectsVolume = this.world.userInterface.objectsVolume / 10;
            coinSound.volume = objectsVolume;
            coinSound.play();
        }
    }

    collectBottle() {
        this.bottles = (this.bottles || 0) + 1;
        this.world.statusBar.setBottlesCount(this.bottles);

        // Bottle-Sound mit "objects" Kategorie
        const bottleSound = new Audio('../assets/audio/collect_bottle.mp3');
        this.world.userInterface.registerAudioWithCategory(bottleSound, 'objects');
        
        // Manuell die Lautstärke der objects-Kategorie anwenden
        if (!this.world.userInterface.isMuted) {
            const objectsVolume = this.world.userInterface.objectsVolume / 10;
            bottleSound.volume = objectsVolume;
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
        // Erster Interval für Bewegung und Kamera bleibt unverändert
        setInterval(() => {
            // Nur ausführen, wenn das Spiel nicht pausiert ist
            if (!this.world || !this.world.isPaused) {
                this.previousY = this.y;

                // Bewegungstasten nur verarbeiten, wenn der Character noch lebt
                if (this.world && this.world.keyboard && !this.isDead()) {
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
            }
        }, 1000 / 60);
        
        // Zweiter Interval für Animationen
        setInterval(() => {
            // Nur ausführen, wenn das Spiel nicht pausiert ist
            if (!this.world || !this.world.isPaused) {
                if (this.isDead()) {
                    // Character fallen lassen, sobald er tot ist
                    this.y += 10; // Fallgeschwindigkeit
                    
                    // Spezielle Behandlung der Todesanimation
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
                    } else {
                        // Bild D-56.png beibehalten
                        this.img = this.imageCache[this.IMAGES_DEAD[5]];
                    }
                    
                    // Game Over Screen nach längerer Verzögerung anzeigen (nur einmal)
                    if (!this.gameOverScreenShown) {
                        this.gameOverScreenShown = true;
                        
                        // Hintergrundmusik pausieren
                        if (this.world && this.world.userInterface && this.world.userInterface.backgroundMusic) {
                            this.world.userInterface.backgroundMusic.pause();
                        }
                        
                        // Längere Verzögerung für die Animation des Sterbens und des Fallens
                        setTimeout(() => {
                            // Game-Over Sound abspielen
                            const gameOverSound = new Audio('../assets/audio/game_lose.mp3');
                            
                            if (this.world && this.world.userInterface) {
                                this.world.userInterface.registerAudioWithCategory(gameOverSound, 'music');
                                
                                if (!this.world.userInterface.isMuted) {
                                    gameOverSound.play();
                                }
                            }
                            
                            // Game-Over-Screen anzeigen
                            if (!window.gameOverScreen) {
                                window.gameOverScreen = new Endscreen();
                            }
                            window.gameOverScreen.show();
                        }, 1700);
                    }
                    
                    // Sound stoppen
                    if (this.sleepSound) {
                        this.sleepSound.pause();
                        this.sleepSound = null;
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
                    
                    // Idle-Zustand zurücksetzen, wenn getroffen
                    this.resetIdleState();
                } else {
                    this.hurtSoundPlayed = false;
                    if (this.isAboveGround()) {
                        this.playAnimation(this.IMAGES_JUMPING);
                        this.resetIdleState(); // Auch beim Springen zurücksetzen
                    } else if (this.world.keyboard.RIGHT || this.world.keyboard.LEFT) {
                        this.playAnimation(this.IMAGES_WALKING);
                        this.resetIdleState(); // Auch beim Laufen zurücksetzen
                    } else {
                        this.idleAnimationInterval++;
                        this.idleTime += 50;

                        if (this.idleTime >= 6500 && !this.yawnPlayed) {
                            const yawnSound = new Audio('../assets/audio/yawn.mp3');
                            this.world.userInterface.registerAudioWithCategory(yawnSound, 'character'); // Mit Kategorie registrieren

                            if (!this.world.userInterface.isMuted) {
                                yawnSound.play(); // Nur abspielen, wenn nicht stummgeschaltet
                            }
                            this.yawnPlayed = true;
                        }

                        if (this.idleTime >= 15000) {
                            this.sleepAnimationInterval++;
                            if (this.sleepAnimationInterval >= 7.5) {
                                this.playAnimation(this.IMAGES_SLEEPING);

                                // Sleep-Sound abspielen
                                if (!this.sleepSound) {
                                    this.sleepSound = new Audio('../assets/audio/sleep.mp3');
                                    if (this.sleepSound) {
                                        this.world.userInterface.registerAudioWithCategory(this.sleepSound, 'character'); // Mit Kategorie registrieren
                                        this.sleepSound.loop = true;
                                        if (!this.world.userInterface.isMuted) {
                                            this.sleepSound.play();
                                        }
                                    }
                                }
                                this.sleepAnimationInterval = 0;
                            }
                        } else {
                            if (this.sleepSound) {
                                this.sleepSound.pause();
                                this.sleepSound = null;
                            }
                            if (this.idleAnimationInterval >= 30) {
                                this.playAnimation(this.IMAGES_IDLE);
                                this.idleAnimationInterval = 0;
                            }
                        }
                    }
                }
            }
        }, 50);
    }

    // Neue Methode zum Zurücksetzen des Idle-Zustands
    resetIdleState() {
        this.idleTime = 0;
        this.idleAnimationInterval = 0;
        this.sleepAnimationInterval = 0;
        this.yawnPlayed = false;
        
        // Sleep-Sound pausieren, falls vorhanden
        if (this.sleepSound) {
            this.sleepSound.pause();
            this.sleepSound = null;
        }
    }
}