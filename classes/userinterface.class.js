class UserInterface extends DrawableObject {
    constructor(canvas) {
        super();
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Aus localStorage laden, falls vorhanden
        this.isMuted = localStorage.getItem('elPolloLoco_isMuted') === 'true';
        this.volumeLevel = parseInt(localStorage.getItem('elPolloLoco_volume')) || 5;
        
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
        
        // Positionen anpassen
        this.soundIconX = canvas.width - 100;
        this.soundIconY = 10;
        this.soundIconWidth = 40;
        this.soundIconHeight = 40;
        
        this.settingsIconX = canvas.width - 50;
        this.settingsIconY = 10;
        this.settingsIconWidth = 40;
        this.settingsIconHeight = 40;
        
        // Fullscreen-Icon in der unteren rechten Ecke positionieren
        this.fullscreenIconX = canvas.width - 50;
        this.fullscreenIconY = canvas.height - 50;
        this.fullscreenIconWidth = 40;
        this.fullscreenIconHeight = 40;
        
        this.audioInstances = [];

        this.addClickListener();
        
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
                    .catch(error => console.log('Autoplay prevented by browser:', error));
            }
        }, 500);
    }

    // Neue Methode zum Aktualisieren der Icon-Positionen
    updateIconPositions() {
        // Aktuelle Canvas-Dimensionen abrufen
        const currentWidth = this.canvas.clientWidth;
        const currentHeight = this.canvas.clientHeight;
        
        // Positionen relativ zur aktuellen Canvas-Größe anpassen
        this.soundIconX = currentWidth - 100;
        this.soundIconY = 10;
        
        this.settingsIconX = currentWidth - 50;
        this.settingsIconY = 10;
        
        this.fullscreenIconX = currentWidth - 50;
        this.fullscreenIconY = currentHeight - 50;
    }

    drawIcons() {
        // Positionen aktualisieren, bevor die Icons gezeichnet werden
        this.updateIconPositions();
        
        // Sound-Icon zeichnen
        this.ctx.drawImage(
            this.soundIcon,
            this.soundIconX,
            this.soundIconY,
            this.soundIconWidth,
            this.soundIconHeight
        );
        
        // Settings-Icon zeichnen
        this.ctx.drawImage(
            this.settingsIcon,
            this.settingsIconX,
            this.settingsIconY,
            this.settingsIconWidth,
            this.settingsIconHeight
        );
        
        // Fullscreen-Icon zeichnen
        this.ctx.drawImage(
            this.fullscreenIcon,
            this.fullscreenIconX,
            this.fullscreenIconY,
            this.fullscreenIconWidth,
            this.fullscreenIconHeight
        );
    }

    addClickListener() {
        this.canvas.addEventListener('click', (event) => {
            const rect = this.canvas.getBoundingClientRect();
            const clickX = event.clientX - rect.left;
            const clickY = event.clientY - rect.top;

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
            if (
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
        this.masterSlider = document.getElementById('master-volume');
        this.characterSlider = document.getElementById('character-volume');
        this.enemiesSlider = document.getElementById('enemies-volume');
        this.objectsSlider = document.getElementById('objects-volume'); // Neuer Slider
        this.musicSlider = document.getElementById('music-volume');
        
        // Value Displays
        this.masterValue = document.getElementById('master-volume-value');
        this.characterValue = document.getElementById('character-volume-value');
        this.enemiesValue = document.getElementById('enemies-volume-value');
        this.objectsValue = document.getElementById('objects-volume-value'); // Neuer Wert
        this.musicValue = document.getElementById('music-volume-value');
        
        this.exitGameBtn = document.getElementById('exit-game');
        this.closeSettingsBtn = document.getElementById('close-settings');
        
        // Initialen Wert setzen
        this.masterSlider.value = this.volumeLevel;
        this.masterValue.textContent = this.volumeLevel;
        
        this.characterSlider.value = this.characterVolume;
        this.characterValue.textContent = this.characterVolume;
        
        this.enemiesSlider.value = this.enemiesVolume;
        this.enemiesValue.textContent = this.enemiesVolume;
        
        this.objectsSlider.value = this.objectsVolume;
        this.objectsValue.textContent = this.objectsVolume;
        
        this.musicSlider.value = this.musicVolume;
        this.musicValue.textContent = this.musicVolume;
        
        // Event-Listener für Slider hinzufügen
        this.masterSlider.addEventListener('input', () => {
            this.volumeLevel = parseInt(this.masterSlider.value);
            this.masterValue.textContent = this.volumeLevel;
            this.updateVolume();
            
            // In localStorage speichern
            localStorage.setItem('elPolloLoco_volume', this.volumeLevel);
        });
        
        this.characterSlider.addEventListener('input', () => {
            this.characterVolume = parseInt(this.characterSlider.value);
            this.characterValue.textContent = this.characterVolume;
            this.updateCategoryVolume('character');
            
            // In localStorage speichern
            localStorage.setItem('elPolloLoco_characterVolume', this.characterVolume);
        });
        
        this.enemiesSlider.addEventListener('input', () => {
            this.enemiesVolume = parseInt(this.enemiesSlider.value);
            this.enemiesValue.textContent = this.enemiesVolume;
            this.updateCategoryVolume('enemies');
            
            // In localStorage speichern
            localStorage.setItem('elPolloLoco_enemiesVolume', this.enemiesVolume);
        });
        
        this.objectsSlider.addEventListener('input', () => {
            this.objectsVolume = parseInt(this.objectsSlider.value);
            this.objectsValue.textContent = this.objectsVolume;
            this.updateCategoryVolume('objects');
            
            // In localStorage speichern
            localStorage.setItem('elPolloLoco_objectsVolume', this.objectsVolume);
        });
        
        this.musicSlider.addEventListener('input', () => {
            this.musicVolume = parseInt(this.musicSlider.value);
            this.musicValue.textContent = this.musicVolume;
            this.updateCategoryVolume('music');
            
            // In localStorage speichern
            localStorage.setItem('elPolloLoco_musicVolume', this.musicVolume);
        });
        
        this.exitGameBtn.addEventListener('click', () => {
            // Spiel-Logik stoppen und zur Startseite zurückkehren
            if (confirm('Möchtest du das Spiel wirklich beenden?')) {
                window.location.reload();
            }
        });
        
        this.closeSettingsBtn.addEventListener('click', () => {
            this.closeSettings();
        });
    }

    openSettings() {
        // Spiel pausieren könnte hier implementiert werden
        this.settingsOverlay.classList.add('show');
    }

    closeSettings() {
        // Spiel fortsetzen könnte hier implementiert werden
        this.settingsOverlay.classList.remove('show');
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
        
        // Für nicht kategorisierte Audios
        const volume = this.volumeLevel / 10;
        const uncategorizedAudios = this.audioInstances.filter(audio => 
            !this.audioCategories.character.includes(audio) &&
            !this.audioCategories.enemies.includes(audio) &&
            !this.audioCategories.objects.includes(audio) &&
            !this.audioCategories.music.includes(audio)
        );
        
        uncategorizedAudios.forEach((audio) => {
            if (audio && !this.isMuted) {
                audio.volume = volume;
            }
        });
    }

    toggleSound() {
        this.isMuted = !this.isMuted;
        
        // In localStorage speichern
        localStorage.setItem('elPolloLoco_isMuted', this.isMuted);

        if (this.isMuted) {
            this.soundIcon.src = '../assets/img/ui_images/sound_off.svg';
            this.muteAllSounds();
            this.backgroundMusic.pause(); // Hintergrundmusik pausieren
        } else {
            this.soundIcon.src = '../assets/img/ui_images/sound_on.svg';
            this.unmuteAllSounds();
            this.backgroundMusic.play(); // Hintergrundmusik fortsetzen
        }
    }

    registerAudio(audio) {
        if (audio instanceof Audio) {
            if (!this.audioInstances.includes(audio)) {
                this.audioInstances.push(audio);
                
                // Lautstärke und Mute-Status sofort anwenden
                const volume = this.volumeLevel / 10;
                audio.volume = volume;
                
                if (this.isMuted) {
                    audio.muted = true;
                }
            }
        }
    }

    // Neue Methode zur Registrierung von Audio mit Kategorie
    registerAudioWithCategory(audio, category) {
        this.registerAudio(audio); // Bestehende Registrierung verwenden
        
        // Zusätzlich zur Kategorie hinzufügen
        if (category && this.audioCategories[category]) {
            if (!this.audioCategories[category].includes(audio)) {
                this.audioCategories[category].push(audio);
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
        this.audioInstances.forEach((audio) => {
            if (audio) {
                audio.muted = false;
                // Lautstärke anwenden
                audio.volume = this.volumeLevel / 10;
            }
        });
    }

    // Neue Methode zur Aktualisierung der Kategorie-Lautstärke
    updateCategoryVolume(category) {
        if (!this.audioCategories[category]) return;
        
        const masterVolume = this.volumeLevel / 10; // 0-1 Bereich
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
        
        // Kombinierte Lautstärke (Master * Kategorie)
        const finalVolume = masterVolume * categoryVolume;
        
        this.audioCategories[category].forEach((audio) => {
            if (audio && !this.isMuted) {
                audio.volume = finalVolume;
            }
        });
    }
}