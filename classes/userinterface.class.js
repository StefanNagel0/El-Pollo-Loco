class UserInterface extends DrawableObject {
    constructor(canvas) {
        super();
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.isMuted = false; // Standardmäßig ist der Sound an
        this.soundIcon = new Image();
        this.soundIcon.src = '../assets/img/ui_images/sound_on.svg'; // Standardbild
        this.soundIconX = canvas.width - 50; // Position oben rechts
        this.soundIconY = 10;
        this.soundIconWidth = 40;
        this.soundIconHeight = 40;
        this.audioInstances = []; // Array für alle Audio-Instanzen

        this.addClickListener();
    }

    drawSoundIcon() {
        this.ctx.drawImage(
            this.soundIcon,
            this.soundIconX,
            this.soundIconY,
            this.soundIconWidth,
            this.soundIconHeight
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
        });
    }

    toggleSound() {
        this.isMuted = !this.isMuted;

        if (this.isMuted) {
            this.soundIcon.src = '../assets/img/ui_images/sound_off.svg'; // Bild wechseln
            this.muteAllSounds();
        } else {
            this.soundIcon.src = '../assets/img/ui_images/sound_on.svg'; // Bild wechseln
            this.unmuteAllSounds();
        }
    }

    registerAudio(audio) {
        if (audio instanceof Audio) {
            if (!this.audioInstances.includes(audio)) { // Überprüfen, ob die Instanz bereits registriert ist
                this.audioInstances.push(audio);
                if (this.isMuted) {
                    audio.muted = true; // Direkt stummschalten, wenn isMuted aktiv ist
                }
                console.log('Audio instance registered:', audio.src); // Debugging
            } else {
                console.log('Audio instance already registered:', audio.src); // Debugging
            }
        } else {
            console.warn('Invalid audio instance:', audio); // Warnung ausgeben, wenn das Objekt ungültig ist
        }
    }

    muteAllSounds() {
        this.audioInstances.forEach((audio) => {
            if (audio) {
                audio.muted = true;
                console.log('Muted audio:', audio.src); // Debugging
            }
        });
    }

    unmuteAllSounds() {
        this.audioInstances.forEach((audio) => {
            if (audio) {
                audio.muted = false;
                console.log('Unmuted audio:', audio.src); // Debugging
            }
        });
    }
}