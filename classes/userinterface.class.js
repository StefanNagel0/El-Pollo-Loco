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
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;
            
            // Mauskoordinaten relativ zur Canvas unter Berücksichtigung der Skalierung
            const mouseX = (event.clientX - rect.left) * scaleX;
            const mouseY = (event.clientY - rect.top) * scaleY;
            
            // Sound-Icon Hover prüfen
            this.soundIconHovered = 
                mouseX >= this.soundIconX &&
                mouseX <= this.soundIconX + this.soundIconWidth &&
                mouseY >= this.soundIconY &&
                mouseY <= this.soundIconY + this.soundIconHeight;
                
            // Settings-Icon Hover prüfen
            this.settingsIconHovered = 
                mouseX >= this.settingsIconX &&
                mouseX <= this.settingsIconX + this.settingsIconWidth &&
                mouseY >= this.settingsIconY &&
                mouseY <= this.settingsIconY + this.settingsIconHeight;
                
            // Fullscreen-Icon Hover prüfen
            this.fullscreenIconHovered = 
                mouseX >= this.fullscreenIconX &&
                mouseX <= this.fullscreenIconX + this.fullscreenIconWidth &&
                mouseY >= this.fullscreenIconY &&
                mouseY <= this.fullscreenIconY + this.fullscreenIconHeight;
            
            // Cursor-Stil anpassen
            if (this.soundIconHovered || this.settingsIconHovered || this.fullscreenIconHovered) {
                this.canvas.style.cursor = 'pointer';
            } else {
                this.canvas.style.cursor = 'default';
            }
        });
        
        // Maus verlässt den Canvas
        this.canvas.addEventListener('mouseout', () => {
            this.soundIconHovered = false;
            this.settingsIconHovered = false;
            this.fullscreenIconHovered = false;
            this.canvas.style.cursor = 'default';
        });
        
        // Den vorhandenen Click-Event-Listener beibehalten
        this.canvas.addEventListener('click', (event) => {
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;
            
            // Klickkoordinaten relativ zur Canvas unter Berücksichtigung der Skalierung
            const clickX = (event.clientX - rect.left) * scaleX;
            const clickY = (event.clientY - rect.top) * scaleY;
            
            // Überprüfen, ob auf das Sound-Icon geklickt wurde
            if (
                clickX >= this.soundIconX &&
                clickX <= this.soundIconX + this.soundIconWidth &&
                clickY >= this.soundIconY &&
                clickY <= this.soundIconY + this.soundIconHeight
            ) {
                this.toggleSound();
            }
            
            // Überprüfen, ob auf das Settings-Icon geklickt wurde
            if (
                clickX >= this.settingsIconX &&
                clickX <= this.settingsIconX + this.settingsIconWidth &&
                clickY >= this.settingsIconY &&
                clickY <= this.settingsIconY + this.settingsIconHeight
            ) {
                this.openSettings();
            }
            
            // Überprüfen, ob auf das Fullscreen-Icon geklickt wurde
            // Nur prüfen, wenn es angezeigt wird (nicht in mobiler Querformat-Ansicht)
            const isSmallScreen = window.innerWidth < 720;
            const isLandscape = window.innerHeight < window.innerWidth;
            const shouldDisplayFullscreenIcon = !(isSmallScreen && isLandscape);

            if (shouldDisplayFullscreenIcon && 
                clickX >= this.fullscreenIconX &&
                clickX <= this.fullscreenIconX + this.fullscreenIconWidth &&
                clickY >= this.fullscreenIconY &&
                clickY <= this.fullscreenIconY + this.fullscreenIconHeight
            ) {
                this.toggleFullscreen();
            }
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
            document.body.classList.add('fullscreen'); // CSS-Klasse zum body-Element hinzufügen
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
            document.body.classList.remove('fullscreen'); // CSS-Klasse vom body-Element entfernen
        }
        
        this.updateFullscreenIcon();

        // Positionen nach Änderung des Vollbildstatus aktualisieren
        setTimeout(() => {
            this.updateIconPositions();
        }, 100); // Kurze Verzögerung für die Anpassung des Browserfensters
    }
    
    // Icon basierend auf dem aktuellen Fullscreen-Status aktualisieren
    updateFullscreenIcon() {
        this.fullscreenIcon.src = this.isFullscreen 
            ? '../assets/img/ui_images/fullscreen_exit.svg'
            : '../assets/img/ui_images/fullscreen.svg';
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
        
        // Referenz für X-Button
        this.closeXBtn = document.getElementById('close-x');
        
        // Event-Listener für X-Button hinzufügen
        if (this.closeXBtn) {
            this.closeXBtn.addEventListener('click', () => this.closeSettings());
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

    closeSettings() {
        // Spiel fortsetzen
        if (this.canvas && window.world) {
            window.world.isPaused = false;
        }
        
        const settingsOverlay = document.getElementById('settings-overlay');
        settingsOverlay.classList.remove('show');
        settingsOverlay.classList.add('d-none');
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