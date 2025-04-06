class UserInterface extends DrawableObject {
    constructor(canvas) {
        super();
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Aus localStorage laden, falls vorhanden
        this.isMuted = localStorage.getItem('elPolloLoco_isMuted') === 'true';
        this.volumeLevel = parseInt(localStorage.getItem('elPolloLoco_volume')) || 5;
        
        // Sound-Icon initialisieren
        this.soundIcon = new Image();
        this.soundIcon.src = this.isMuted 
            ? '../assets/img/ui_images/sound_off.svg' 
            : '../assets/img/ui_images/sound_on.svg';
            
        // Settings-Icon initialisieren
        this.settingsIcon = new Image();
        this.settingsIcon.src = '../assets/img/ui_images/settings.svg';
        
        // Positionen anpassen: Sound-Icon links, Settings-Icon rechts
        this.soundIconX = canvas.width - 100;
        this.soundIconY = 10;
        this.soundIconWidth = 40;
        this.soundIconHeight = 40;
        
        this.settingsIconX = canvas.width - 50;
        this.settingsIconY = 10;
        this.settingsIconWidth = 40;
        this.settingsIconHeight = 40;
        
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
    }

    drawIcons() {
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
        });
    }

    initSettingsOverlay() {
        // DOM-Elemente referenzieren
        this.settingsOverlay = document.getElementById('settings-overlay');
        this.volumeSlider = document.getElementById('volume-slider');
        this.volumeValue = document.getElementById('volume-value');
        this.exitGameBtn = document.getElementById('exit-game');
        this.closeSettingsBtn = document.getElementById('close-settings');
        
        // Initialen Wert setzen
        this.volumeSlider.value = this.volumeLevel;
        this.volumeValue.textContent = this.volumeLevel;
        
        // Event-Listener hinzufügen
        this.volumeSlider.addEventListener('input', () => {
            this.volumeLevel = parseInt(this.volumeSlider.value);
            this.volumeValue.textContent = this.volumeLevel;
            this.updateVolume();
            
            // In localStorage speichern
            localStorage.setItem('elPolloLoco_volume', this.volumeLevel);
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

    updateVolume() {
        // Lautstärke aller Audio-Instanzen aktualisieren
        const volume = this.volumeLevel / 10; // Umrechnung in 0-1 Bereich für Audio API
        
        this.audioInstances.forEach((audio) => {
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
        } else {
            this.soundIcon.src = '../assets/img/ui_images/sound_on.svg';
            this.unmuteAllSounds();
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
}