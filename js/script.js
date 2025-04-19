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
}

/**
 * Event-Listener für DOMContentLoaded
 */
document.addEventListener('DOMContentLoaded', function() {
    // Initiale Prüfung
    checkOrientation();
    
    // Event-Listener für Änderungen
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
});