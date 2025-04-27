class GameAudio {
    backgroundMusic;
    audioInstances = [];
    audioCategories = {
        character: [],
        enemies: [],
        objects: [],
        music: []
    };
    
    // Hier keine direkte Zuweisung - Wert wird in initializeLocalStorage geladen
    isMuted;
    characterVolume = parseInt(localStorage.getItem('elPolloLoco_characterVolume')) || 5;
    enemiesVolume = parseInt(localStorage.getItem('elPolloLoco_enemiesVolume')) || 5;
    objectsVolume = parseInt(localStorage.getItem('elPolloLoco_objectsVolume')) || 5;
    musicVolume = parseInt(localStorage.getItem('elPolloLoco_musicVolume')) || 5;
    
    constructor() {
        // Zuerst lokalen Speicher initialisieren, um isMuted zu setzen
        this.initializeLocalStorage();
        
        // Hintergrundmusik initialisieren und starten
        this.backgroundMusic = new Audio('../assets/audio/background.mp3');
        this.backgroundMusic.loop = true;
        this.registerAudioWithCategory(this.backgroundMusic, 'music');
        
        // Vorhandene Einstellung anwenden
        if (this.isMuted) {
            this.muteAllSounds();
        } else {
            // Starte die Musik nach einer kurzen Verzögerung
            setTimeout(() => {
                this.backgroundMusic.play()
                    .catch(error => console.log('Autoplay prevented: ', error));
            }, 500);
        }
    }
    
    initializeLocalStorage() {
        // Prüfe, ob der Mute-Status im localStorage existiert
        if (localStorage.getItem('elPolloLoco_isMuted') === null) {
            // Wenn nicht, setze den Standardwert (false = nicht stumm)
            localStorage.setItem('elPolloLoco_isMuted', 'false');
        }
        
        // Nun den Wert aus dem localStorage laden
        this.isMuted = localStorage.getItem('elPolloLoco_isMuted') === 'true';
    }

    /**
     * Schaltet den Sound ein/aus
     */
    toggleSound() {
        this.isMuted = !this.isMuted;
        
        // In localStorage speichern
        localStorage.setItem('elPolloLoco_isMuted', this.isMuted);

        if (this.isMuted) {
            this.muteAllSounds();
            this.backgroundMusic.pause();
        } else {
            this.unmuteAllSounds();
            this.backgroundMusic.play();
        }
    }

    /**
     * Registriert eine Audio-Instanz
     * @param {Audio} audio - Die Audio-Instanz
     */
    registerAudio(audio) {
        if (audio instanceof Audio) {
            if (!this.audioInstances.includes(audio)) {
                this.audioInstances.push(audio);
                
                // Standard-Lautstärke verwenden
                const defaultVolume = 0.5;
                audio.volume = defaultVolume;
                
                if (this.isMuted) {
                    audio.muted = true;
                }
            }
        }
    }

    /**
     * Registriert eine Audio-Instanz mit einer Kategorie
     * @param {Audio} audio - Die Audio-Instanz
     * @param {string} category - Die Kategorie (character, enemies, objects, music)
     */
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

    /**
     * Stummschaltet alle Sounds
     */
    muteAllSounds() {
        this.audioInstances.forEach((audio) => {
            if (audio) {
                audio.muted = true;
            }
        });
    }

    /**
     * Hebt die Stummschaltung für alle Sounds auf
     */
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
                            default:
                                volume = defaultVolume;
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

    /**
     * Aktualisiert die Lautstärke für eine bestimmte Kategorie
     * @param {string} category - Die Kategorie (character, enemies, objects, music)
     */
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
        
        // Direkte Anwendung der Kategorie-Lautstärke
        this.audioCategories[category].forEach((audio) => {
            if (audio && !this.isMuted) {
                audio.volume = categoryVolume;
            }
        });
    }
    
    /**
     * Spielt einen Sound ab
     * @param {string} path - Der Pfad zur Audiodatei
     * @param {string} category - Die Kategorie des Sounds
     * @returns {Audio} - Die Audio-Instanz
     */
    playSound(path, category) {
        const sound = new Audio(path);
        this.registerAudioWithCategory(sound, category);
        if (!this.isMuted) {
            sound.play();
        }
        return sound;
    }
}