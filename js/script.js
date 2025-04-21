/**
 * Prüft die Ausrichtung des Geräts und zeigt entsprechend das Video oder das Hauptmenü an
 */
function checkOrientation() {
    // Video-Container erstellen, falls er noch nicht existiert
    let videoContainer = document.getElementById('rotation-video-container');
    if (!videoContainer) {
        videoContainer = document.createElement('div');
        videoContainer.id = 'rotation-video-container';
        videoContainer.classList.add('d-none');

        // Video-Element erstellen
        const video = document.createElement('video');
        video.src = '../assets/videos/rotate_your_phone.mp4';
        video.autoplay = true;
        video.loop = true;
        video.muted = true;
        video.playsinline = true;

        // Container und Video zusammenfügen
        videoContainer.appendChild(video);
        document.body.appendChild(videoContainer);
    }

    // Hauptmenü-Element referenzieren
    const mainMenu = document.getElementById('main-menu');

    // Prüfen ob im Hochformat (Portrait) und ob Bildschirmbreite < 720px
    const isPortrait = window.innerHeight > window.innerWidth;
    const isSmallScreen = window.innerWidth < 720;

    if (isPortrait && isSmallScreen) {
        // Hochformat und kleine Bildschirmbreite: Video anzeigen, Hauptmenü ausblenden
        videoContainer.classList.remove('d-none');
        if (mainMenu) {
            mainMenu.classList.add('d-none');
        }

        // Canvas ausblenden wenn vorhanden
        const canvas = document.getElementById('canvas');
        if (canvas) {
            canvas.classList.add('d-none');
        }

        // Sicherstellen, dass das Video abspielt
        const video = videoContainer.querySelector('video');
        if (video) {
            video.play().catch(e => console.log('Autoplay prevented:', e));
        }
    } else {
        // Querformat oder große Bildschirmbreite: Video ausblenden, Hauptmenü anzeigen
        videoContainer.classList.add('d-none');
        if (mainMenu) {
            mainMenu.classList.remove('d-none');
        }

        // Canvas wieder anzeigen falls vorhanden
        const canvas = document.getElementById('canvas');
        if (canvas) {
            canvas.classList.remove('d-none');
        }
    }

    // Mobile Steuerung aktualisieren
    const mobileControls = document.getElementById('mobile-controls');
    if (mobileControls) {
        const isLandscape = window.innerHeight < window.innerWidth;
        const isSmallScreen = window.innerWidth < 720;

        if (isLandscape && isSmallScreen) {
            // Nur anzeigen, wenn wir im Spiel sind und keine Overlays sichtbar sind
            const gameActive = window.world &&
                !window.world.isPaused &&
                document.getElementById('main-menu')?.classList.contains('d-none') &&
                !document.getElementById('settings-overlay')?.classList.contains('show') &&
                !document.getElementById('game-over-screen')?.classList.contains('show') &&
                !document.getElementById('game-won-screen')?.classList.contains('show') &&
                !document.getElementById('custom-confirm')?.classList.contains('show');

            // Direkt das display-Attribut setzen
            mobileControls.style.display = gameActive ? 'flex' : 'none';
        } else {
            mobileControls.style.display = 'none';
        }
    }

    // Log zur Fehlerbehebung
    console.log("Spielstatus:", {
        worldExists: !!window.world,
        isPaused: window.world?.isPaused,
        mainMenuHidden: document.getElementById('main-menu')?.classList.contains('d-none'),
        settingsHidden: !document.getElementById('settings-overlay')?.classList.contains('show'),
        gameOverHidden: !document.getElementById('game-over-screen')?.classList.contains('show'),
        gameWonHidden: !document.getElementById('game-won-screen')?.classList.contains('show'),
        confirmHidden: !document.getElementById('custom-confirm')?.classList.contains('show')
    });
}

/**
 * Initialisiert die mobile Steuerung (Touch-Buttons)
 */
function initMobileControls() {
    // Referenzen zu den Steuerungselementen
    const leftBtn = document.getElementById('button-left');
    const rightBtn = document.getElementById('button-right');
    const jumpBtn = document.getElementById('button-jump');
    const throwBtn = document.getElementById('button-throw');

    // Hilfsfunktionen für Touch-Events
    function handleTouchStart(event, keyAction) {
        event.preventDefault();
        event.currentTarget.classList.add('active');
        console.log('Touch Start:', keyAction);
        
        // Überprüfen, welches keyboard-Objekt verwendet wird
        if (window.keyboard) {
            window.keyboard[keyAction] = true;
            console.log('Keyboard-Objekt:', window.keyboard);
            
            // Zusätzlich: Direktes Prüfen der Eigenschaft
            console.log(`Ist ${keyAction} gesetzt?`, window.keyboard[keyAction]);
            
            // Wenn es ein world-Objekt gibt, setze auch dort die Taste
            if (window.world && window.world.keyboard) {
                window.world.keyboard[keyAction] = true;
                console.log('World.keyboard nach Start:', window.world.keyboard);
            }
        }
    }

    function handleTouchEnd(event, keyAction) {
        event.preventDefault();
        event.currentTarget.classList.remove('active');
        console.log('Touch End:', keyAction); // Debug-Ausgabe
        if (window.keyboard) {
            window.keyboard[keyAction] = false;
            console.log('Keyboard nach End:', window.keyboard); // Debug-Ausgabe
        }
    }

    // Bestehendes Setup beibehalten
    
    // Zusätzlich: Direkter Verweis auf das world-Keyboard
    function updateKeyboardState(keyAction, isActive) {
        // Beide keyboard-Objekte aktualisieren
        if (window.keyboard) {
            window.keyboard[keyAction] = isActive;
        }
        
        // Das aktuelle world.keyboard-Objekt aktualisieren
        if (window.world && window.world.keyboard) {
            window.world.keyboard[keyAction] = isActive;
        }
    }
    
    // Touch-Events für den "Nach links"-Button
    if (leftBtn) {
        leftBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            e.currentTarget.classList.add('active');
            updateKeyboardState('LEFT', true);
        }, { passive: false });
        
        leftBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            e.currentTarget.classList.remove('active');
            updateKeyboardState('LEFT', false);
        }, { passive: false });
        leftBtn.addEventListener('touchcancel', (e) => handleTouchEnd(e, 'LEFT'), { passive: false });
    }
    
    // Touch-Events für den "Nach rechts"-Button
    if (rightBtn) {
        rightBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            e.currentTarget.classList.add('active');
            updateKeyboardState('RIGHT', true);
        }, { passive: false });
        
        rightBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            e.currentTarget.classList.remove('active');
            updateKeyboardState('RIGHT', false);
        }, { passive: false });
        
        rightBtn.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            e.currentTarget.classList.remove('active');
            updateKeyboardState('RIGHT', false);
        }, { passive: false });
    }
    
    // Touch-Events für den "Springen"-Button
    if (jumpBtn) {
        jumpBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            e.currentTarget.classList.add('active');
            updateKeyboardState('SPACE', true);
        }, { passive: false });
        
        jumpBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            e.currentTarget.classList.remove('active');
            updateKeyboardState('SPACE', false);
        }, { passive: false });
        
        jumpBtn.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            e.currentTarget.classList.remove('active');
            updateKeyboardState('SPACE', false);
        }, { passive: false });
    }
    
    // Touch-Events für den "Flasche werfen"-Button
    if (throwBtn) {
        throwBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            e.currentTarget.classList.add('active');
            updateKeyboardState('D', true);
        }, { passive: false });
        
        throwBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            e.currentTarget.classList.remove('active');
            updateKeyboardState('D', false);
        }, { passive: false });
        
        throwBtn.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            e.currentTarget.classList.remove('active');
            updateKeyboardState('D', false);
        }, { passive: false });
    }

    // Verhindern von ungewolltem Scrollen/Zoomen bei Berührung der Steuerelemente
    const mobileControls = document.getElementById('mobile-controls');
    if (mobileControls) {
        mobileControls.addEventListener('touchmove', (e) => {
            if (e.target.closest('.mobile-control-button')) {
                e.preventDefault();
            }
        }, { passive: false });
    }
}

/**
 * Setzt einen Observer ein, der Veränderungen am DOM überwacht
 */
function setupGameStateObserver() {
    // Mobile Controls Element referenzieren
    const mobileControls = document.getElementById('mobile-controls');
    if (!mobileControls) return;

    // Funktion zum Aktualisieren der Steuerelemente basierend auf dem Spielstatus
    function updateMobileControlsVisibility() {
        // Prüfen ob im Querformat und kleine Bildschirmbreite
        const isLandscape = window.innerHeight < window.innerWidth;
        const isSmallScreen = window.innerWidth < 720;
        
        if (isLandscape && isSmallScreen) {
            // Spielstatus prüfen
            const gameActive = window.world &&
                !window.world.isPaused &&
                document.getElementById('main-menu')?.classList.contains('d-none') &&
                !document.getElementById('settings-overlay')?.classList.contains('show') &&
                !document.getElementById('game-over-screen')?.classList.contains('show') &&
                !document.getElementById('game-won-screen')?.classList.contains('show') &&
                !document.getElementById('custom-confirm')?.classList.contains('show');

            console.log("Spielstatus:", {
                worldExists: !!window.world,
                isPaused: window.world?.isPaused,
                mainMenuHidden: document.getElementById('main-menu')?.classList.contains('d-none'),
                settingsHidden: !document.getElementById('settings-overlay')?.classList.contains('show')
            });
            
            mobileControls.style.display = gameActive ? 'flex' : 'none';
        } else {
            mobileControls.style.display = 'none';
        }
    }

    // Direkt ausführen und dann alle 500ms wiederholen
    updateMobileControlsVisibility();
    setInterval(updateMobileControlsVisibility, 500);

    // Zusätzlich World-Status überwachen mit MutationObserver
    if (window.world) {
        // Bei Änderung des isPaused-Status
        const originalIsPaused = Object.getOwnPropertyDescriptor(window.world, 'isPaused');
        if (originalIsPaused) {
            Object.defineProperty(window.world, 'isPaused', {
                get: originalIsPaused.get,
                set: function(value) {
                    originalIsPaused.set.call(this, value);
                    updateMobileControlsVisibility();
                }
            });
        }
    }
}

/**
 * Event-Listener für DOMContentLoaded
 */
document.addEventListener('DOMContentLoaded', function () {
    // Initiale Prüfung
    checkOrientation();

    // Mobile Steuerung initialisieren
    initMobileControls();

    // Event-Listener für Änderungen
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    // Neuer Code: Game State Observer starten
    setupGameStateObserver();
});