class GameAudio {
    backgroundMusic;
    audioInstances = [];
    audioCategories = {
        character: [],
        enemies: [],
        objects: [],
        music: []
    };
    isMuted;
    characterVolume = parseInt(localStorage.getItem('elPolloLoco_characterVolume')) || 5;
    enemiesVolume = parseInt(localStorage.getItem('elPolloLoco_enemiesVolume')) || 5;
    objectsVolume = parseInt(localStorage.getItem('elPolloLoco_objectsVolume')) || 5;
    musicVolume = parseInt(localStorage.getItem('elPolloLoco_musicVolume')) || 5;
    
    constructor() {
        this.initializeLocalStorage();
        this.backgroundMusic = new Audio('../assets/audio/background.mp3');
        this.backgroundMusic.loop = true;
        this.registerAudioWithCategory(this.backgroundMusic, 'music');
        if (this.isMuted) {
            this.muteAllSounds();
        } else {
            setTimeout(() => {
                this.backgroundMusic.play()
                    .catch(error => console.log('Autoplay prevented: ', error));
            }, 500);
        }
    }
    
    initializeLocalStorage() {
        if (localStorage.getItem('elPolloLoco_isMuted') === null) {
            localStorage.setItem('elPolloLoco_isMuted', 'false');
        }
        this.isMuted = localStorage.getItem('elPolloLoco_isMuted') === 'true';
    }

    toggleSound() {
        this.isMuted = !this.isMuted;
        localStorage.setItem('elPolloLoco_isMuted', this.isMuted);
        if (this.isMuted) {
            this.muteAllSounds();
            this.backgroundMusic.pause();
        } else {
            this.unmuteAllSounds();
            this.backgroundMusic.play();
        }
    }

    registerAudio(audio) {
        if (audio instanceof Audio) {
            if (!this.audioInstances.includes(audio)) {
                this.audioInstances.push(audio);
                const defaultVolume = 0.5;
                audio.volume = defaultVolume;
                
                if (this.isMuted) {
                    audio.muted = true;
                }
            }
        }
    }

    registerAudioWithCategory(audio, category) {
        if (!(audio instanceof Audio) || this.audioInstances.includes(audio)) return;
        
        this.audioInstances.push(audio);
        let categoryVolume = this.getCategoryVolume(category);
        
        audio.volume = categoryVolume;
        audio.muted = this.isMuted;
        
        if (category && this.audioCategories[category] && 
            !this.audioCategories[category].includes(audio)) {
            this.audioCategories[category].push(audio);
        }
    }

    getCategoryVolume(category) {
        if (!category || !this.audioCategories[category]) return 0.5;
        
        const volumes = {
            'character': this.characterVolume,
            'enemies': this.enemiesVolume,
            'objects': this.objectsVolume,
            'music': this.musicVolume
        };
        
        return (volumes[category] || 5) / 10;
    }

    muteAllSounds() {
        this.audioInstances.forEach((audio) => {
            if (audio) {
                audio.muted = true;
            }
        });
    }

    unmuteAllSounds() {
        const defaultVolume = 0.5;
        
        this.audioInstances.forEach((audio) => {
            if (!audio) return;
            
            audio.muted = false;
            audio.volume = this.getAppropriateVolumeForAudio(audio, defaultVolume);
        });
    }

    getAppropriateVolumeForAudio(audio, defaultVolume) {
        for (const category in this.audioCategories) {
            if (this.audioCategories[category].includes(audio)) {
                return this.getCategoryVolume(category);
            }
        }
        return defaultVolume;
    }

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
        this.audioCategories[category].forEach((audio) => {
            if (audio && !this.isMuted) {
                audio.volume = categoryVolume;
            }
        });
    }
    
    playSound(path, category) {
        const sound = new Audio(path);
        this.registerAudioWithCategory(sound, category);
        if (!this.isMuted) {
            sound.play();
        }
        return sound;
    }
}