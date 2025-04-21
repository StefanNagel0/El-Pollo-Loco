class UserInterface extends DrawableObject {
    constructor(canvas) {
        super();
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Aus localStorage laden, falls vorhanden
        this.isMuted = localStorage.getItem('elPolloLoco_isMuted') === 'true';
        
        // Audio-Kategorien-Settings aus localStorage laden
        this.characterVolume = parseInt(localStorage.getItem('elPolloLoco_characterVolume')) || 5;
        this.enemiesVolume = parseInt(localStorage.getItem('elPolloLoco_enemiesVolume')) || 5;
        this.objectsVolume = parseInt(localStorage.getItem('elPolloLoco_objectsVolume')) || 5; // Neue Kategorie
        this.musicVolume = parseInt(localStorage.getItem('elPolloLoco_musicVolume')) || 5;
        
        // Audio-Kategorien für die Verwaltung
        this.audioCategories = {
            character: [],
            enemies: [],
            objects: [], // Neue Kategorie
            music: []
        };
        
        // Sound-Icon initialisieren
        this.soundIcon = new Image();
        this.soundIcon.src = this.isMuted 
            ? '../assets/img/ui_images/sound_off.svg' 
            : '../assets/img/ui_images/sound_on.svg';
            
        // Settings-Icon initialisieren
        this.settingsIcon = new Image();
        this.settingsIcon.src = '../assets/img/ui_images/settings.svg';
        
        // Fullscreen-Icon initialisieren
        this.fullscreenIcon = new Image();
        this.fullscreenIcon.src = '../assets/img/ui_images/fullscreen.svg';
        this.isFullscreen = false;
        
        // Größere Icons für die größere Canvas
        this.soundIconX = canvas.width - 100;
        this.soundIconY = 10;
        this.soundIconWidth = 40;
        this.soundIconHeight = 40;
        
        this.settingsIconX = canvas.width - 50;
        this.settingsIconY = 10;
        this.settingsIconWidth = 40;
        this.settingsIconHeight = 40;
        
        // Fullscreen-Icon in der unteren rechten Ecke mit größerem Abstand
        this.fullscreenIconX = canvas.width - 50;
        this.fullscreenIconY = canvas.height - 50;
        this.fullscreenIconWidth = 40;
        this.fullscreenIconHeight = 40;
        
        this.audioInstances = [];

        // Hover-Zustände für Icons
        this.soundIconHovered = false;
        this.settingsIconHovered = false;
        this.fullscreenIconHovered = false;

        this.addMouseListeners();
        
        // Wir initialisieren das Settings-Overlay nur, wenn das DOM vollständig geladen ist
        window.setTimeout(() => {
            this.initSettingsOverlay();
            
            // Sicherstellen, dass das Overlay versteckt ist
            const overlay = document.getElementById('settings-overlay');
            if (overlay) {
                overlay.classList.add('d-none');
            }
        }, 100);
        
        // Wenn bereits beim Start stummgeschaltet, sicherstellen dass alle Audios stumm sind
        if (this.isMuted) {
            this.muteAllSounds();
        }
        
        // Überwachen des Fullscreen-Status für Änderungen außerhalb unserer Kontrolle
        document.addEventListener('fullscreenchange', () => {
            this.isFullscreen = !!document.fullscreenElement;
            
            if (this.isFullscreen) {
                document.body.classList.add('fullscreen');
            } else {
                document.body.classList.remove('fullscreen');
            }
            
            this.updateFullscreenIcon();
        });

        // Hintergrundmusik initialisieren
        this.backgroundMusic = new Audio('../assets/audio/background.mp3');
        this.backgroundMusic.loop = true; // Im Loop abspielen
        this.registerAudioWithCategory(this.backgroundMusic, 'music'); // Bei der Audio-Verwaltung registrieren
        
        // Starte die Musik nach einer kurzen Verzögerung (um sicherzustellen, dass alles geladen ist)
        setTimeout(() => {
            if (!this.isMuted) {
                this.backgroundMusic.play()
                    .catch(error => {});
            }
        }, 500);

        this.soundIcon.onerror = () => {};
        this.settingsIcon.onerror = () => {};
        this.fullscreenIcon.onerror = () => {};

        // Event-Listener für Fenstergrößenänderungen
        window.addEventListener('resize', () => {
            this.scheduleIconPositionUpdate();
        });
    }

    // Neue Methode zum Aktualisieren der Icon-Positionen
    updateIconPositions() {
        // Die tatsächliche Canvas-Zeichenfläche verwenden statt clientWidth/clientHeight
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;
        
        // Konstante Werte für den Abstand zum Rand
        const marginRight = 60;
        const marginTop = 10;
        const marginBottom = 10; // Von 60 auf 20 reduziert
        
        // Positionen relativ zur tatsächlichen Canvas-Größe anpassen
        this.soundIconX = canvasWidth - this.soundIconWidth - marginRight;
        this.soundIconY = marginTop;
        
        this.settingsIconX = canvasWidth - this.settingsIconWidth - 10;
        this.settingsIconY = marginTop;
        
        // Fullscreen-Icon in der unteren rechten Ecke
        this.fullscreenIconX = canvasWidth - this.fullscreenIconWidth - 10;
        this.fullscreenIconY = canvasHeight - this.fullscreenIconHeight - marginBottom;
    }

    drawIcons() {
        // Positionen aktualisieren, bevor die Icons gezeichnet werden
        this.updateIconPositions();
        
        // Sound-Icon mit Hover-Effekt
        this.ctx.save();
        if (this.soundIconHovered) {
            // Bei Hover: Größer skalieren (wie im Menü)
            this.ctx.translate(this.soundIconX + this.soundIconWidth/2, this.soundIconY + this.soundIconHeight/2);
            this.ctx.scale(1.1, 1.1);
            this.ctx.translate(-(this.soundIconX + this.soundIconWidth/2), -(this.soundIconY + this.soundIconHeight/2));
        }
        this.ctx.drawImage(
            this.soundIcon,
            this.soundIconX,
            this.soundIconY,
            this.soundIconWidth,
            this.soundIconHeight
        );
        this.ctx.restore();
        
        // Settings-Icon mit Hover-Effekt
        this.ctx.save();
        if (this.settingsIconHovered) {
            // Bei Hover: Rotieren (wie im Menü)
            this.ctx.translate(this.settingsIconX + this.settingsIconWidth/2, this.settingsIconY + this.settingsIconHeight/2);
            this.ctx.rotate(Math.PI/2); // 90 Grad drehen
            this.ctx.translate(-(this.settingsIconX + this.settingsIconWidth/2), -(this.settingsIconY + this.settingsIconHeight/2));
        }
        this.ctx.drawImage(
            this.settingsIcon,
            this.settingsIconX,
            this.settingsIconY,
            this.settingsIconWidth,
            this.settingsIconHeight
        );
        this.ctx.restore();
        
        // Fullscreen-Icon nur anzeigen, wenn nicht in mobiler Querformat-Ansicht
        const isSmallScreen = window.innerWidth < 720;
        const isLandscape = window.innerHeight < window.innerWidth;
        const shouldDisplayFullscreenIcon = !(isSmallScreen && isLandscape);
        
        if (shouldDisplayFullscreenIcon) {
            // Fullscreen-Icon mit Hover-Effekt
            this.ctx.save();
            if (this.fullscreenIconHovered) {
                // Bei Hover: Leicht vergrößern
                this.ctx.translate(this.fullscreenIconX + this.fullscreenIconWidth/2, this.fullscreenIconY + this.fullscreenIconHeight/2);
                this.ctx.scale(1.1, 1.1);
                this.ctx.translate(-(this.fullscreenIconX + this.fullscreenIconWidth/2), -(this.fullscreenIconY + this.fullscreenIconHeight/2));
            }
            this.ctx.drawImage(
                this.fullscreenIcon,
                this.fullscreenIconX,
                this.fullscreenIconY,
                this.fullscreenIconWidth,
                this.fullscreenIconHeight
            );
            this.ctx.restore();
        }
    }

    addMouseListeners() {
        // Mausbewegung verfolgen für Hover-Effekte
        this.canvas.addEventListener('mousemove', (event) => {
            const rect = this.canvas.getBoundingClientRect();
            
            // Berechne das tatsächlich sichtbare Canvas-Rechteck (ohne schwarze Ränder)
            const canvasAspectRatio = this.canvas.width / this.canvas.height;
            const rectAspectRatio = rect.width / rect.height;
            
            let visibleWidth, visibleHeight, offsetX, offsetY;
            
            if (rectAspectRatio > canvasAspectRatio) {
                // Schwarze Ränder links und rechts
                visibleHeight = rect.height;
                visibleWidth = visibleHeight * canvasAspectRatio;
                offsetX = (rect.width - visibleWidth) / 2;
                offsetY = 0;
            } else {
                // Schwarze Ränder oben und unten
                visibleWidth = rect.width;
                visibleHeight = visibleWidth / canvasAspectRatio;
                offsetX = 0;
                offsetY = (rect.height - visibleHeight) / 2;
            }
            
            // Anpassung der Mauskoordinaten
            // In normaler Querformat-Ansicht (nicht Fullscreen) ist die Berechnung anders
            let relativeX, relativeY;
            
            if (this.isFullscreen) {
                // Fullscreen-Modus: Berücksichtige schwarze Ränder
                relativeX = ((event.clientX - rect.left - offsetX) / visibleWidth) * this.canvas.width;
                relativeY = ((event.clientY - rect.top - offsetY) / visibleHeight) * this.canvas.height;
            } else {
                // Normaler Modus: Direkte Skalierung mit einem kleinen Toleranzfaktor
                relativeX = (event.clientX - rect.left) / rect.width * this.canvas.width;
                relativeY = (event.clientY - rect.top) / rect.height * this.canvas.height;
            }
            
            // Sound-Icon Hover prüfen mit erhöhter Toleranz
            const iconTolerance = 10; // 10px Toleranzbereich hinzufügen
            this.soundIconHovered = 
                relativeX >= (this.soundIconX - iconTolerance) &&
                relativeX <= (this.soundIconX + this.soundIconWidth + iconTolerance) &&
                relativeY >= (this.soundIconY - iconTolerance) &&
                relativeY <= (this.soundIconY + this.soundIconHeight + iconTolerance);
                    
            // Settings-Icon Hover prüfen mit erhöhter Toleranz
            this.settingsIconHovered = 
                relativeX >= (this.settingsIconX - iconTolerance) &&
                relativeX <= (this.settingsIconX + this.settingsIconWidth + iconTolerance) &&
                relativeY >= (this.settingsIconY - iconTolerance) &&
                relativeY <= (this.settingsIconY + this.settingsIconHeight + iconTolerance);
                    
            // Fullscreen-Icon Hover prüfen mit erhöhter Toleranz
            this.fullscreenIconHovered = 
                relativeX >= (this.fullscreenIconX - iconTolerance) &&
                relativeX <= (this.fullscreenIconX + this.fullscreenIconWidth + iconTolerance) &&
                relativeY >= (this.fullscreenIconY - iconTolerance) &&
                relativeY <= (this.fullscreenIconY + this.fullscreenIconHeight + iconTolerance);
            
            // Cursor-Stil anpassen
            if (this.soundIconHovered || this.settingsIconHovered || this.fullscreenIconHovered) {
                this.canvas.style.cursor = 'pointer';
            } else {
                this.canvas.style.cursor = 'default';
            }
        });
        
        // Gleiche verbesserte Berechnung für den Click-Event-Listener
        this.canvas.addEventListener('click', (event) => {
            const rect = this.canvas.getBoundingClientRect();
            
            // Berechne das tatsächlich sichtbare Canvas-Rechteck
            const canvasAspectRatio = this.canvas.width / this.canvas.height;
            const rectAspectRatio = rect.width / rect.height;
            
            let visibleWidth, visibleHeight, offsetX, offsetY;
            
            if (rectAspectRatio > canvasAspectRatio) {
                // Schwarze Ränder links und rechts
                visibleHeight = rect.height;
                visibleWidth = visibleHeight * canvasAspectRatio;
                offsetX = (rect.width - visibleWidth) / 2;
                offsetY = 0;
            } else {
                // Schwarze Ränder oben und unten
                visibleWidth = rect.width;
                visibleHeight = visibleWidth / canvasAspectRatio;
                offsetX = 0;
                offsetY = (rect.height - visibleHeight) / 2;
            }
            
            // Anpassung der Mauskoordinaten je nach Modus
            let relativeX, relativeY;
            
            if (this.isFullscreen) {
                // Fullscreen-Modus: Berücksichtige schwarze Ränder
                relativeX = ((event.clientX - rect.left - offsetX) / visibleWidth) * this.canvas.width;
                relativeY = ((event.clientY - rect.top - offsetY) / visibleHeight) * this.canvas.height;
            } else {
                // Normaler Modus: Direkte Skalierung
                relativeX = (event.clientX - rect.left) / rect.width * this.canvas.width;
                relativeY = (event.clientY - rect.top) / rect.height * this.canvas.height;
            }
            
            console.log('Klick bei:', relativeX, relativeY, 'isFullscreen:', this.isFullscreen);
            console.log('Sound-Icon bei:', this.soundIconX, this.soundIconY, 'bis', this.soundIconX + this.soundIconWidth, this.soundIconY + this.soundIconHeight);
            
            // Toleranzbereich für leichteres Klicken
            const iconTolerance = 10;
            
            // Überprüfen, ob auf das Sound-Icon geklickt wurde
            if (relativeX >= (this.soundIconX - iconTolerance) &&
                relativeX <= (this.soundIconX + this.soundIconWidth + iconTolerance) &&
                relativeY >= (this.soundIconY - iconTolerance) &&
                relativeY <= (this.soundIconY + this.soundIconHeight + iconTolerance)) {
                this.toggleSound();
            }
            
            // Überprüfen, ob auf das Settings-Icon geklickt wurde
            if (relativeX >= (this.settingsIconX - iconTolerance) &&
                relativeX <= (this.settingsIconX + this.settingsIconWidth + iconTolerance) &&
                relativeY >= (this.settingsIconY - iconTolerance) &&
                relativeY <= (this.settingsIconY + this.settingsIconHeight + iconTolerance)) {
                this.openSettings();
            }
            
            // Überprüfen, ob auf das Fullscreen-Icon geklickt wurde
            const isSmallScreen = window.innerWidth < 720;
            const isLandscape = window.innerHeight < window.innerWidth;
            const shouldDisplayFullscreenIcon = !(isSmallScreen && isLandscape);

            if (shouldDisplayFullscreenIcon && 
                relativeX >= (this.fullscreenIconX - iconTolerance) &&
                relativeX <= (this.fullscreenIconX + this.fullscreenIconWidth + iconTolerance) &&
                relativeY >= (this.fullscreenIconY - iconTolerance) &&
                relativeY <= (this.fullscreenIconY + this.fullscreenIconHeight + iconTolerance)) {
                this.toggleFullscreen();
            }
        });
        
        // Maus verlässt den Canvas
        this.canvas.addEventListener('mouseout', () => {
            this.soundIconHovered = false;
            this.settingsIconHovered = false;
            this.fullscreenIconHovered = false;
            this.canvas.style.cursor = 'default';
        });
    }
    
    // Neue Methode zum Umschalten des Vollbildmodus
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            // Vollbildmodus aktivieren
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            } else if (document.documentElement.mozRequestFullScreen) { // Firefox
                document.documentElement.mozRequestFullScreen();
            } else if (document.documentElement.webkitRequestFullscreen) { // Chrome, Safari
                document.documentElement.webkitRequestFullscreen();
            } else if (document.documentElement.msRequestFullscreen) { // IE/Edge
                document.documentElement.msRequestFullscreen();
            }
            this.isFullscreen = true;
            document.body.classList.add('fullscreen');
        } else {
            // Vollbildmodus beenden
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
            this.isFullscreen = false;
            document.body.classList.remove('fullscreen');
        }
        
        this.updateFullscreenIcon();

        // Verzögerte Aktualisierung, damit Änderungen wirksam werden können
        this.scheduleIconPositionUpdate();
    }

    // Icon basierend auf dem aktuellen Fullscreen-Status aktualisieren
    updateFullscreenIcon() {
        this.fullscreenIcon.src = this.isFullscreen 
            ? '../assets/img/ui_images/fullscreen_exit.svg'
            : '../assets/img/ui_images/fullscreen.svg';
    }

    // Neue Methode für verzögerte Aktualisierung
    scheduleIconPositionUpdate() {
        // Sofortige Aktualisierung
        this.updateIconPositions();
        this.updateIconHitboxes();
        
        // Nach 100ms nochmals aktualisieren (kurze Wartezeit)
        setTimeout(() => {
            this.updateIconPositions();
            this.updateIconHitboxes();
        }, 100);
        
        // Nach 300ms final aktualisieren (für langsamere Browser/Geräte)
        setTimeout(() => {
            this.updateIconPositions();
            this.updateIconHitboxes();
        }, 300);
    }

    // Neue Methode hinzufügen, um die Hitboxen der Icons zu aktualisieren
    updateIconHitboxes() {
        const rect = this.canvas.getBoundingClientRect();
        
        // Wichtig: Hier die richtigen Canvas-Dimensionen verwenden
        const canvasRenderWidth = this.canvas.width;
        const canvasRenderHeight = this.canvas.height;
        
        // Skalierungsfaktoren berechnen
        const scaleX = canvasRenderWidth / rect.width;
        const scaleY = canvasRenderHeight / rect.height;
        
        // Diese Werte für die Event-Handler speichern
        this.canvasScaleX = scaleX;
        this.canvasScaleY = scaleY;
    }

    initSettingsOverlay() {
        // DOM-Elemente referenzieren
        this.settingsOverlay = document.getElementById('settings-overlay');
        
        // Volume Sliders
        this.characterSlider = document.getElementById('character-volume');
        this.enemiesSlider = document.getElementById('enemies-volume');
        this.objectsSlider = document.getElementById('objects-volume'); // Neuer Slider
        this.musicSlider = document.getElementById('music-volume');
        
        // Value Displays
        this.characterValue = document.getElementById('character-volume-value');
        this.enemiesValue = document.getElementById('enemies-volume-value');
        this.objectsValue = document.getElementById('objects-volume-value'); // Neuer Wert
        this.musicValue = document.getElementById('music-volume-value');
        
        this.exitGameBtn = document.getElementById('exit-game');
        this.closeSettingsBtn = document.getElementById('close-settings');
        this.returnToGameBtn = document.getElementById('return-to-game'); // Neue Referenz hinzufügen
        
        // Referenz für X-Button
        this.closeXBtn = document.getElementById('close-x');
        
        // Event-Listener für X-Button hinzufügen
        if (this.closeXBtn) {
            this.closeXBtn.addEventListener('click', () => this.closeSettings());
        }
        
        // Event-Listener für "Zurück zum Spiel"-Button hinzufügen
        if (this.returnToGameBtn) {
            this.returnToGameBtn.addEventListener('click', () => this.closeSettings());
        }
        
        // Bestehenden Listener für den Close-Button beibehalten (für Kompatibilität)
        if (this.closeSettingsBtn) {
            this.closeSettingsBtn.addEventListener('click', () => this.closeSettings());
        }
        
        // Initialen Wert setzen (mit Null-Prüfung)
        if (this.characterSlider && this.characterValue) {
            this.characterSlider.value = this.characterVolume;
            this.characterValue.textContent = this.characterVolume;
        }
        
        if (this.enemiesSlider && this.enemiesValue) {
            this.enemiesSlider.value = this.enemiesVolume;
            this.enemiesValue.textContent = this.enemiesVolume;
        }
        
        if (this.objectsSlider && this.objectsValue) {
            this.objectsSlider.value = this.objectsVolume;
            this.objectsValue.textContent = this.objectsVolume;
        }
        
        if (this.musicSlider && this.musicValue) {
            this.musicSlider.value = this.musicVolume;
            this.musicValue.textContent = this.musicVolume;
        }
        
        // Event-Listener für Slider hinzufügen (mit Null-Prüfung)
        if (this.characterSlider) {
            this.characterSlider.addEventListener('input', () => {
                this.characterVolume = parseInt(this.characterSlider.value);
                this.characterValue.textContent = this.characterVolume;
                this.updateCategoryVolume('character');
                
                // In localStorage speichern
                localStorage.setItem('elPolloLoco_characterVolume', this.characterVolume);
            });
        }
        
        if (this.enemiesSlider) {
            this.enemiesSlider.addEventListener('input', () => {
                this.enemiesVolume = parseInt(this.enemiesSlider.value);
                this.enemiesValue.textContent = this.enemiesVolume;
                this.updateCategoryVolume('enemies');
                
                // In localStorage speichern
                localStorage.setItem('elPolloLoco_enemiesVolume', this.enemiesVolume);
            });
        }
        
        if (this.objectsSlider) {
            this.objectsSlider.addEventListener('input', () => {
                this.objectsVolume = parseInt(this.objectsSlider.value);
                this.objectsValue.textContent = this.objectsVolume;
                this.updateCategoryVolume('objects');
                
                // In localStorage speichern
                localStorage.setItem('elPolloLoco_objectsVolume', this.objectsVolume);
            });
        }
        
        if (this.musicSlider) {
            this.musicSlider.addEventListener('input', () => {
                this.musicVolume = parseInt(this.musicSlider.value);
                this.musicValue.textContent = this.musicVolume;
                this.updateCategoryVolume('music');
                
                // In localStorage speichern
                localStorage.setItem('elPolloLoco_musicVolume', this.musicVolume);
            });
        }
        
        if (this.exitGameBtn) {
            this.exitGameBtn.addEventListener('click', () => {
                // Benutzerdefinierten Dialog anzeigen statt Browser-Alert
                this.showCustomConfirm(() => {
                    window.location.reload();
                });
            });
        }
        
        if (this.closeSettingsBtn) {
            this.closeSettingsBtn.addEventListener('click', () => {
                this.closeSettings();
            });
        }
        
        // Neuen Button für Legal Notice referenzieren und Event-Listener hinzufügen
        this.legalNoticeBtn = document.getElementById('legal-notice-btn');
        if (this.legalNoticeBtn) {
            this.legalNoticeBtn.addEventListener('click', () => {
                // Legal Notice in neuem Tab öffnen
                window.open('../html/legal_notice.html', '_blank');
            });
        }
    }

    openSettings() {
        // Spiel pausieren
        if (this.canvas && window.world) {
            window.world.isPaused = true;
            
            // Wenn im Spiel, den "Spiel beenden"-Button anzeigen
            const exitGameBtn = document.getElementById('exit-game');
            if (exitGameBtn) {
                exitGameBtn.style.display = 'block';
            }
        }
        
        // Standard-Tab ist jetzt "Spiel"
        if (window.mainMenu) {
            window.mainMenu.switchTab('game');
        } else {
            // Fallback, falls mainMenu nicht verfügbar ist
            const gameTab = document.getElementById('game-tab');
            const howToPlayTab = document.getElementById('how-to-play-tab');
            const audioTab = document.getElementById('audio-tab');
            const gameContent = document.getElementById('game-content');
            const howToPlayContent = document.getElementById('how-to-play-content');
            const audioContent = document.getElementById('audio-content');
            
            // Alle Tabs zurücksetzen
            if (gameTab) gameTab.classList.remove('active');
            if (howToPlayTab) howToPlayTab.classList.remove('active');
            if (audioTab) audioTab.classList.remove('active');
            if (gameContent) gameContent.classList.add('d-none');
            if (howToPlayContent) howToPlayContent.classList.add('d-none');
            if (audioContent) audioContent.classList.add('d-none');
            
            // Game-Tab aktivieren
            if (gameTab) gameTab.classList.add('active');
            if (gameContent) gameContent.classList.remove('d-none');
        }
        
        const settingsOverlay = document.getElementById('settings-overlay');
        
        // Canvas-Position abrufen und Overlay positionieren
        const canvasRect = this.canvas.getBoundingClientRect();
        settingsOverlay.style.top = `${canvasRect.top}px`;
        settingsOverlay.style.left = `${canvasRect.left}px`;
        settingsOverlay.style.width = `${canvasRect.width}px`;
        settingsOverlay.style.height = `${canvasRect.height}px`;
        settingsOverlay.style.transform = 'none';
        
        settingsOverlay.classList.add('show');
        settingsOverlay.classList.remove('d-none');
    }

    closeSettings(){
        // Spiel fortsetzen mit verzögerter Ausführung
        if (window.world) {
            // Direktes Setzen des isPaused-Werts
            window.world.isPaused = false;
            
            setTimeout(() => {
                if (window.world) {
                    window.world.isPaused = false;
                }
            }, 50);
        }
        
        const settingsOverlay = document.getElementById('settings-overlay');
        if (settingsOverlay) {
            settingsOverlay.classList.remove('show');
            settingsOverlay.classList.add('d-none');
            
            // Diese Zeile entfernen oder kommentieren:
            // settingsOverlay.style.display = 'none'; 
            // Stattdessen:
            // Nach kurzer Verzögerung alle inline-Styles zurücksetzen
            setTimeout(() => {
                if (settingsOverlay) {
                    // Inline-Style zurücksetzen für erneutes Öffnen
                    settingsOverlay.removeAttribute('style');
                }
            }, 100);
        }
    }

    // Neue Methode zum Wechseln der Tabs
    switchTab(tabName) {
        // Alle Tabs zurücksetzen
        this.generalTab.classList.remove('active');
        this.audioTab.classList.remove('active');
        this.generalContent.classList.add('d-none');
        this.audioContent.classList.add('d-none');
        
        // Gewählten Tab aktivieren
        if (tabName === 'general') {
            this.generalTab.classList.add('active');
            this.generalContent.classList.remove('d-none');
        } else if (tabName === 'audio') {
            this.audioTab.classList.add('active');
            this.audioContent.classList.remove('d-none');
        }
    }

    updateVolume() {
        // Aktualisiere alle Kategorien
        this.updateCategoryVolume('character');
        this.updateCategoryVolume('enemies');
        this.updateCategoryVolume('objects'); // Neue Kategorie
        this.updateCategoryVolume('music');
    }

    toggleSound() {
        this.isMuted = !this.isMuted;
        
        // In localStorage speichern
        localStorage.setItem('elPolloLoco_isMuted', this.isMuted);

        if (this.isMuted) {
            this.updateSoundIcon(); // Neue Methode aufrufen
            this.muteAllSounds();
            this.backgroundMusic.pause(); // Hintergrundmusik pausieren
        } else {
            this.updateSoundIcon(); // Neue Methode aufrufen
            this.unmuteAllSounds();
            this.backgroundMusic.play(); // Hintergrundmusik fortsetzen
        }
    }

    // Methode zur Aktualisierung des Sound-Icons hinzufügen:

    /**
     * Aktualisiert das Sound-Icon basierend auf dem Mute-Status
     */
    updateSoundIcon() {
        if (this.soundIcon) {
            this.soundIcon.src = this.isMuted 
                ? '../assets/img/ui_images/sound_off.svg' 
                : '../assets/img/ui_images/sound_on.svg';
        }
    }

    registerAudio(audio) {
        if (audio instanceof Audio) {
            if (!this.audioInstances.includes(audio)) {
                this.audioInstances.push(audio);
                
                // Standard-Lautstärke verwenden (statt volumeLevel)
                const defaultVolume = 0.5;
                audio.volume = defaultVolume;
                
                if (this.isMuted) {
                    audio.muted = true;
                }
            }
        }
    }

    // Neue Methode zur Registrierung von Audio mit Kategorie
    registerAudioWithCategory(audio, category) {
        // Wir überspringen registerAudio() und machen das manuell
        if (audio instanceof Audio) {
            if (!this.audioInstances.includes(audio)) {
                this.audioInstances.push(audio);
                
                // Kategorie-spezifische Lautstärke sofort anwenden
                let categoryVolume = 0.5; // Standardwert
                
                if (category && this.audioCategories[category]) {
                    switch(category) {
                        case 'character':
                            categoryVolume = this.characterVolume / 10;
                            break;
                        case 'enemies':
                            categoryVolume = this.enemiesVolume / 10;
                            break;
                        case 'objects':
                            categoryVolume = this.objectsVolume / 10;
                            break;
                        case 'music':
                            categoryVolume = this.musicVolume / 10;
                            break;
                    }
                }
                
                // Lautstärke direkt setzen
                audio.volume = categoryVolume;
                
                // Mute-Status anwenden
                if (this.isMuted) {
                    audio.muted = true;
                }
                
                // Zur Kategorie hinzufügen
                if (category && this.audioCategories[category]) {
                    if (!this.audioCategories[category].includes(audio)) {
                        this.audioCategories[category].push(audio);
                    }
                }
            }
        }
    }

    muteAllSounds() {
        this.audioInstances.forEach((audio) => {
            if (audio) {
                audio.muted = true;
            }
        });
    }

    unmuteAllSounds() {
        // Für nicht kategorisierte Audios eine Standard-Lautstärke verwenden
        const defaultVolume = 0.5; // Standard: 50% Lautstärke
        
        this.audioInstances.forEach((audio) => {
            if (audio) {
                audio.muted = false;
                
                // Kategorie bestimmen und entsprechende Lautstärke setzen
                let volumeSet = false;
                
                for (const category in this.audioCategories) {
                    if (this.audioCategories[category].includes(audio)) {
                        // Kategoriespezifische Lautstärke anwenden
                        let volume;
                        switch(category) {
                            case 'character':
                                volume = this.characterVolume / 10;
                                break;
                            case 'enemies':
                                volume = this.enemiesVolume / 10;
                                break;
                            case 'objects':
                                volume = this.objectsVolume / 10;
                                break;
                            case 'music':
                                volume = this.musicVolume / 10;
                                break;
                        }
                        audio.volume = volume;
                        volumeSet = true;
                        break;
                    }
                }
                
                // Für nicht kategorisierte Audios Standard-Lautstärke verwenden
                if (!volumeSet) {
                    audio.volume = defaultVolume;
                }
            }
        });
    }

    // Neue Methode zur Aktualisierung der Kategorie-Lautstärke
    updateCategoryVolume(category) {
        if (!this.audioCategories[category]) return;
        
        let categoryVolume;
        
        switch(category) {
            case 'character':
                categoryVolume = this.characterVolume / 10;
                break;
            case 'enemies':
                categoryVolume = this.enemiesVolume / 10;
                break;
            case 'objects':
                categoryVolume = this.objectsVolume / 10;
                break;
            case 'music':
                categoryVolume = this.musicVolume / 10;
                break;
            default:
                categoryVolume = 0.5;
        }
        
        // Direkte Anwendung der Kategorie-Lautstärke (ohne Multiplikation mit Master)
        this.audioCategories[category].forEach((audio) => {
            if (audio && !this.isMuted) {
                audio.volume = categoryVolume;
            }
        });
    }

    /**
     * Zeigt einen benutzerdefinierten Bestätigungsdialog an
     * @param {Function} onConfirm - Funktion, die bei Bestätigung ausgeführt wird
     */
    showCustomConfirm(onConfirm) {
        const customConfirm = document.getElementById('custom-confirm');
        const yesBtn = document.getElementById('confirm-yes');
        const noBtn = document.getElementById('confirm-no');
        
        // Dialog anzeigen - jetzt mit show-Klasse statt d-none zu entfernen
        customConfirm.classList.remove('d-none');
        customConfirm.classList.add('show');
        
        // Position anpassen, damit er über dem Canvas erscheint
        const canvasRect = this.canvas.getBoundingClientRect();
        customConfirm.style.top = `${canvasRect.top}px`;
        customConfirm.style.left = `${canvasRect.left}px`;
        customConfirm.style.width = `${canvasRect.width}px`;
        customConfirm.style.height = `${canvasRect.height}px`;
        
        // Event-Listener für die Buttons
        const handleYes = () => {
            // Dialog ausblenden
            customConfirm.classList.remove('show');
            customConfirm.classList.add('d-none');
            
            // Event-Listener entfernen
            yesBtn.removeEventListener('click', handleYes);
            noBtn.removeEventListener('click', handleNo);
            
            // Bestätigungsfunktion ausführen
            if (onConfirm) onConfirm();
        };
        
        const handleNo = () => {
            // Dialog ausblenden
            customConfirm.classList.remove('show');
            customConfirm.classList.add('d-none');
            
            // Event-Listener entfernen
            yesBtn.removeEventListener('click', handleYes);
            noBtn.removeEventListener('click', handleNo);
        };
        
        // Event-Listener hinzufügen
        yesBtn.addEventListener('click', handleYes);
        noBtn.addEventListener('click', handleNo);
    }
}