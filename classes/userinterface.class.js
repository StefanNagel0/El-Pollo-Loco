class UserInterface extends DrawableObject {
    constructor(canvas, gameAudio) {
        super();
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Wenn eine existierende GameAudio-Instanz übergeben wird, verwende diese
        // ansonsten erstelle eine neue (Rückwärtskompatibilität)
        this.audio = gameAudio || new GameAudio();
        
        this.soundIcon = new Image();
        this.soundIcon.src = this.audio.isMuted 
            ? '../assets/img/ui_images/sound_off.svg' 
            : '../assets/img/ui_images/sound_on.svg';
        this.settingsIcon = new Image();
        this.settingsIcon.src = '../assets/img/ui_images/settings.svg';
        this.fullscreenIcon = new Image();
        this.fullscreenIcon.src = '../assets/img/ui_images/fullscreen.svg';
        this.isFullscreen = false;
        this.soundIconX = 10;
        this.soundIconY = 10;
        this.soundIconWidth = 40;
        this.soundIconHeight = 40;
        this.settingsIconX = 60;
        this.settingsIconY = 10;
        this.settingsIconWidth = 40;
        this.settingsIconHeight = 40;
        this.fullscreenIconX = canvas.width - 50;
        this.fullscreenIconY = canvas.height - 50;
        this.fullscreenIconWidth = 40;
        this.fullscreenIconHeight = 40;
        this.audioInstances = [];
        this.soundIconHovered = false;
        this.settingsIconHovered = false;
        this.fullscreenIconHovered = false;
        this.addMouseListeners();

        window.setTimeout(() => {
            this.initSettingsOverlay();
            const overlay = document.getElementById('settings-overlay');
            if (overlay) {
                overlay.classList.add('d-none');
            }
        }, 100);
        if (this.isMuted) {
            this.muteAllSounds();
        }
        document.addEventListener('fullscreenchange', () => {
            this.isFullscreen = !!document.fullscreenElement;
            if (this.isFullscreen) {
                document.body.classList.add('fullscreen');
            } else {
                document.body.classList.remove('fullscreen');
            }
            this.updateFullscreenIcon();
        });

        // Keine zweite Hintergrundmusik-Instanz erstellen, da wir bereits eine in GameAudio haben
        this.soundIcon.onerror = () => {};
        this.settingsIcon.onerror = () => {};
        this.fullscreenIcon.onerror = () => {};

        // Event-Listener für Fenstergrößenänderungen
        window.addEventListener('resize', () => {
            this.scheduleIconPositionUpdate();
        });
    }
    updateIconPositions() {
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;
        const marginRight = 60;
        const marginTop = 10;
        const marginBottom = 10;
        this.soundIconX = canvasWidth - this.soundIconWidth - marginRight;
        this.soundIconY = marginTop;
        this.settingsIconX = canvasWidth - this.settingsIconWidth - 10;
        this.settingsIconY = marginTop;
        this.fullscreenIconX = canvasWidth - this.fullscreenIconWidth - 10;
        this.fullscreenIconY = canvasHeight - this.fullscreenIconHeight - marginBottom;
    }

    drawIcons() {
        this.updateIconPositions();
        this.ctx.save();
        if (this.soundIconHovered) {
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
        this.ctx.save();
        if (this.settingsIconHovered) {
            this.ctx.translate(this.settingsIconX + this.settingsIconWidth/2, this.settingsIconY + this.settingsIconHeight/2);
            this.ctx.rotate(Math.PI/2);
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
        const isSmallScreen = window.innerWidth < 720;
        const isLandscape = window.innerHeight < window.innerWidth;
        const shouldDisplayFullscreenIcon = !(isSmallScreen && isLandscape);
        
        if (shouldDisplayFullscreenIcon) {
            this.ctx.save();
            if (this.fullscreenIconHovered) {
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
        this.canvas.addEventListener('mousemove', (event) => {
            const rect = this.canvas.getBoundingClientRect();
            const canvasAspectRatio = this.canvas.width / this.canvas.height;
            const rectAspectRatio = rect.width / rect.height;
            let visibleWidth, visibleHeight, offsetX, offsetY;
            if (rectAspectRatio > canvasAspectRatio) {
                visibleHeight = rect.height;
                visibleWidth = visibleHeight * canvasAspectRatio;
                offsetX = (rect.width - visibleWidth) / 2;
                offsetY = 0;
            } else {
                visibleWidth = rect.width;
                visibleHeight = visibleWidth / canvasAspectRatio;
                offsetX = 0;
                offsetY = (rect.height - visibleHeight) / 2;
            }
            let relativeX, relativeY;
            if (this.isFullscreen) {
                relativeX = ((event.clientX - rect.left - offsetX) / visibleWidth) * this.canvas.width;
                relativeY = ((event.clientY - rect.top - offsetY) / visibleHeight) * this.canvas.height;
            } else {
                relativeX = (event.clientX - rect.left) / rect.width * this.canvas.width;
                relativeY = (event.clientY - rect.top) / rect.height * this.canvas.height;
            }
            const iconTolerance = 10;
            this.soundIconHovered = 
                relativeX >= (this.soundIconX - iconTolerance) &&
                relativeX <= (this.soundIconX + this.soundIconWidth + iconTolerance) &&
                relativeY >= (this.soundIconY - iconTolerance) &&
                relativeY <= (this.soundIconY + this.soundIconHeight + iconTolerance);
            this.settingsIconHovered = 
                relativeX >= (this.settingsIconX - iconTolerance) &&
                relativeX <= (this.settingsIconX + this.settingsIconWidth + iconTolerance) &&
                relativeY >= (this.settingsIconY - iconTolerance) &&
                relativeY <= (this.settingsIconY + this.settingsIconHeight + iconTolerance);
            this.fullscreenIconHovered = 
                relativeX >= (this.fullscreenIconX - iconTolerance) &&
                relativeX <= (this.fullscreenIconX + this.fullscreenIconWidth + iconTolerance) &&
                relativeY >= (this.fullscreenIconY - iconTolerance) &&
                relativeY <= (this.fullscreenIconY + this.fullscreenIconHeight + iconTolerance);
            if (this.soundIconHovered || this.settingsIconHovered || this.fullscreenIconHovered) {
                this.canvas.style.cursor = 'pointer';
            } else {
                this.canvas.style.cursor = 'default';
            }
        });
        
        this.canvas.addEventListener('click', (event) => {
            const rect = this.canvas.getBoundingClientRect();
            const canvasAspectRatio = this.canvas.width / this.canvas.height;
            const rectAspectRatio = rect.width / rect.height;
            let visibleWidth, visibleHeight, offsetX, offsetY;
            if (rectAspectRatio > canvasAspectRatio) {
                visibleHeight = rect.height;
                visibleWidth = visibleHeight * canvasAspectRatio;
                offsetX = (rect.width - visibleWidth) / 2;
                offsetY = 0;
            } else {
                visibleWidth = rect.width;
                visibleHeight = visibleWidth / canvasAspectRatio;
                offsetX = 0;
                offsetY = (rect.height - visibleHeight) / 2;
            }
            let relativeX, relativeY;
            if (this.isFullscreen) {
                relativeX = ((event.clientX - rect.left - offsetX) / visibleWidth) * this.canvas.width;
                relativeY = ((event.clientY - rect.top - offsetY) / visibleHeight) * this.canvas.height;
            } else {
                relativeX = (event.clientX - rect.left) / rect.width * this.canvas.width;
                relativeY = (event.clientY - rect.top) / rect.height * this.canvas.height;
            }
            const iconTolerance = 10;
            if (relativeX >= (this.soundIconX - iconTolerance) &&
                relativeX <= (this.soundIconX + this.soundIconWidth + iconTolerance) &&
                relativeY >= (this.soundIconY - iconTolerance) &&
                relativeY <= (this.soundIconY + this.soundIconHeight + iconTolerance)) {
                this.toggleSound();
            }
            if (relativeX >= (this.settingsIconX - iconTolerance) &&
                relativeX <= (this.settingsIconX + this.settingsIconWidth + iconTolerance) &&
                relativeY >= (this.settingsIconY - iconTolerance) &&
                relativeY <= (this.settingsIconY + this.settingsIconHeight + iconTolerance)) {
                this.openSettings();
            }
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
        this.canvas.addEventListener('mouseout', () => {
            this.soundIconHovered = false;
            this.settingsIconHovered = false;
            this.fullscreenIconHovered = false;
            this.canvas.style.cursor = 'default';
        });
    }

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
        this.scheduleIconPositionUpdate();
    }
    updateFullscreenIcon() {
        this.fullscreenIcon.src = this.isFullscreen 
            ? '../assets/img/ui_images/fullscreen_exit.svg'
            : '../assets/img/ui_images/fullscreen.svg';
    }

    scheduleIconPositionUpdate() {
        this.updateIconPositions();
        this.updateIconHitboxes();
        setTimeout(() => {
            this.updateIconPositions();
            this.updateIconHitboxes();
        }, 100);
        setTimeout(() => {
            this.updateIconPositions();
            this.updateIconHitboxes();
        }, 300);
    }

    updateIconHitboxes() {
        const rect = this.canvas.getBoundingClientRect();
        const canvasRenderWidth = this.canvas.width;
        const canvasRenderHeight = this.canvas.height;
        const scaleX = canvasRenderWidth / rect.width;
        const scaleY = canvasRenderHeight / rect.height;
        this.canvasScaleX = scaleX;
        this.canvasScaleY = scaleY;
    }

    initSettingsOverlay() {
        this.settingsOverlay = document.getElementById('settings-overlay');
        this.characterSlider = document.getElementById('character-volume');
        this.enemiesSlider = document.getElementById('enemies-volume');
        this.objectsSlider = document.getElementById('objects-volume');
        this.musicSlider = document.getElementById('music-volume');
        this.characterValue = document.getElementById('character-volume-value');
        this.enemiesValue = document.getElementById('enemies-volume-value');
        this.objectsValue = document.getElementById('objects-volume-value');
        this.musicValue = document.getElementById('music-volume-value');
        this.exitGameBtn = document.getElementById('exit-game');
        this.closeSettingsBtn = document.getElementById('close-settings');
        this.returnToGameBtn = document.getElementById('return-to-game');
        this.closeXBtn = document.getElementById('close-x');
        if (this.closeXBtn) {
            this.closeXBtn.addEventListener('click', () => this.closeSettings());
        }
        if (this.returnToGameBtn) {
            this.returnToGameBtn.addEventListener('click', () => this.closeSettings());
        }
        if (this.closeSettingsBtn) {
            this.closeSettingsBtn.addEventListener('click', () => this.closeSettings());
        }
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
        if (this.characterSlider) {
            this.characterSlider.addEventListener('input', () => {
                this.characterVolume = parseInt(this.characterSlider.value);
                this.characterValue.textContent = this.characterVolume;
                this.updateCategoryVolume('character');

                localStorage.setItem('elPolloLoco_characterVolume', this.characterVolume);
            });
        }
        
        if (this.enemiesSlider) {
            this.enemiesSlider.addEventListener('input', () => {
                this.enemiesVolume = parseInt(this.enemiesSlider.value);
                this.enemiesValue.textContent = this.enemiesVolume;
                this.updateCategoryVolume('enemies');
                localStorage.setItem('elPolloLoco_enemiesVolume', this.enemiesVolume);
            });
        }
        
        if (this.objectsSlider) {
            this.objectsSlider.addEventListener('input', () => {
                this.objectsVolume = parseInt(this.objectsSlider.value);
                this.objectsValue.textContent = this.objectsVolume;
                this.updateCategoryVolume('objects');
                localStorage.setItem('elPolloLoco_objectsVolume', this.objectsVolume);
            });
        }
        
        if (this.musicSlider) {
            this.musicSlider.addEventListener('input', () => {
                this.musicVolume = parseInt(this.musicSlider.value);
                this.musicValue.textContent = this.musicVolume;
                this.updateCategoryVolume('music');
                localStorage.setItem('elPolloLoco_musicVolume', this.musicVolume);
            });
        }
        
        if (this.exitGameBtn) {
            this.exitGameBtn.addEventListener('click', () => {
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
        this.legalNoticeBtn = document.getElementById('legal-notice-btn');
        if (this.legalNoticeBtn) {
            this.legalNoticeBtn.addEventListener('click', () => {
                window.open('../html/legal_notice.html', '_blank');
            });
        }
    }

    openSettings() {
        if (this.canvas && window.world) {
            window.world.isPaused = true;
            const exitGameBtn = document.getElementById('exit-game');
            if (exitGameBtn) {
                exitGameBtn.style.display = 'block';
            }
        }
        if (window.mainMenu) {
            window.mainMenu.switchTab('game');
        } else {
            const gameTab = document.getElementById('game-tab');
            const howToPlayTab = document.getElementById('how-to-play-tab');
            const audioTab = document.getElementById('audio-tab');
            const gameContent = document.getElementById('game-content');
            const howToPlayContent = document.getElementById('how-to-play-content');
            const audioContent = document.getElementById('audio-content');
            if (gameTab) gameTab.classList.remove('active');
            if (howToPlayTab) howToPlayTab.classList.remove('active');
            if (audioTab) audioTab.classList.remove('active');
            if (gameContent) gameContent.classList.add('d-none');
            if (howToPlayContent) howToPlayContent.classList.add('d-none');
            if (audioContent) audioContent.classList.add('d-none');
            if (gameTab) gameTab.classList.add('active');
            if (gameContent) gameContent.classList.remove('d-none');
        }
        const settingsOverlay = document.getElementById('settings-overlay');
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
        if (window.world) {
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
            setTimeout(() => {
                if (settingsOverlay) {
                    settingsOverlay.removeAttribute('style');
                }
            }, 100);
        }
    }

    switchTab(tabName) {
        this.generalTab.classList.remove('active');
        this.audioTab.classList.remove('active');
        this.generalContent.classList.add('d-none');
        this.audioContent.classList.add('d-none');
        if (tabName === 'general') {
            this.generalTab.classList.add('active');
            this.generalContent.classList.remove('d-none');
        } else if (tabName === 'audio') {
            this.audioTab.classList.add('active');
            this.audioContent.classList.remove('d-none');
        }
    }

    updateVolume() {
        this.updateCategoryVolume('character');
        this.updateCategoryVolume('enemies');
        this.updateCategoryVolume('objects');
        this.updateCategoryVolume('music');
    }

    toggleSound() {
        this.audio.toggleSound();
        this.updateSoundIcon();
    }

    updateSoundIcon() {
        if (this.soundIcon) {
            this.soundIcon.src = this.audio.isMuted 
                ? '../assets/img/ui_images/sound_off.svg' 
                : '../assets/img/ui_images/sound_on.svg';
        }
    }

    registerAudio(audio) {
        this.audio.registerAudio(audio);
    }

    registerAudioWithCategory(audio, category) {
        this.audio.registerAudioWithCategory(audio, category);
    }

    muteAllSounds() {
        this.audio.muteAllSounds();
    }

    unmuteAllSounds() {
        this.audio.unmuteAllSounds();
    }

    updateCategoryVolume(category) {
        this.audio.updateCategoryVolume(category);
    }


    showCustomConfirm(onConfirm) {
        const customConfirm = document.getElementById('custom-confirm');
        const yesBtn = document.getElementById('confirm-yes');
        const noBtn = document.getElementById('confirm-no');
        customConfirm.classList.remove('d-none');
        customConfirm.classList.add('show');
        const canvasRect = this.canvas.getBoundingClientRect();
        customConfirm.style.top = `${canvasRect.top}px`;
        customConfirm.style.left = `${canvasRect.left}px`;
        customConfirm.style.width = `${canvasRect.width}px`;
        customConfirm.style.height = `${canvasRect.height}px`;
        const handleYes = () => {
            customConfirm.classList.remove('show');
            customConfirm.classList.add('d-none');
            yesBtn.removeEventListener('click', handleYes);
            noBtn.removeEventListener('click', handleNo);
            if (onConfirm) onConfirm();
        };
        const handleNo = () => {
            customConfirm.classList.remove('show');
            customConfirm.classList.add('d-none');
            yesBtn.removeEventListener('click', handleYes);
            noBtn.removeEventListener('click', handleNo);
        };
        yesBtn.addEventListener('click', handleYes);
        noBtn.addEventListener('click', handleNo);
    }

    get isMuted() {
        return this.audio.isMuted;
    }
    
    get characterVolume() {
        return this.audio.characterVolume;
    }
    
    set characterVolume(value) {
        this.audio.characterVolume = value;
    }
    
    get enemiesVolume() {
        return this.audio.enemiesVolume;
    }
    
    set enemiesVolume(value) {
        this.audio.enemiesVolume = value;
    }
    
    get objectsVolume() {
        return this.audio.objectsVolume;
    }
    
    set objectsVolume(value) {
        this.audio.objectsVolume = value;
    }
    
    get musicVolume() {
        return this.audio.musicVolume;
    }
    
    set musicVolume(value) {
        this.audio.musicVolume = value;
    }
    
    get backgroundMusic() {
        return this.audio.backgroundMusic;
    }
    
    set backgroundMusic(value) {
        this.audio.backgroundMusic = value;
    }
}