let canvas;
let world;
let keyboard = new Keyboard();
let mainMenu;
let gameAudio; // Zentrale Audio-Instance

function init() {
    canvas = document.getElementById("canvas");
    
    // Zentrale Audio-Instance erstellen
    gameAudio = new GameAudio();
    
    // Sicherstellen, dass der benutzerdefinierte Bestätigungsdialog versteckt ist
    const customConfirm = document.getElementById('custom-confirm');
    if (customConfirm) {
        customConfirm.classList.add('d-none');
    }
    
    // Hauptmenü-Element referenzieren
    const mainMenuElement = document.getElementById('main-menu');
    
    // Prüfen, ob Spiel direkt gestartet werden soll (nach Neustart)
    const directStart = localStorage.getItem('elPolloLoco_startGame') === 'true';
    
    if (directStart) {
        // Flags zurücksetzen
        localStorage.removeItem('elPolloLoco_startGame');
        localStorage.removeItem('elPolloLoco_restartTimestamp');
        
        // Sicherstellen, dass das Hauptmenü ausgeblendet ist
        if (mainMenuElement) {
            mainMenuElement.classList.add('d-none');
            mainMenuElement.style.display = 'none';
        }
        
        // Spiel direkt starten
        initGame();
        window.world.isPaused = false;
    } else {
        // Sicherstellen, dass das Hauptmenü sichtbar ist
        if (mainMenuElement) {
            mainMenuElement.classList.remove('d-none');
            mainMenuElement.style.display = 'flex';
        }
        
        // Hauptmenü erstellen mit der zentralen Audio-Instance
        mainMenu = new MainMenu(gameAudio);
    }
}

// Neue Funktion zum Initialisieren des Spiels nach dem Klick auf "Spiel starten"
function initGame() {
    world = new World(canvas, keyboard, gameAudio); // Übergebe die zentrale Audio-Instance
    window.world = world; // Globalen Zugriff ermöglichen
    
    // Sicherstellen, dass das Spiel zunächst pausiert ist
    // und erst nach dem Klick auf "Spiel starten" aktiviert wird
    window.world.isPaused = true;
}

window.addEventListener('keydown', (event)=>{
    if(event.keyCode == 39){
        keyboard.RIGHT = true;
    }

    if(event.keyCode == 37){
        keyboard.LEFT = true;
    }

    if(event.keyCode == 40){
        keyboard.DOWN = true;
    }

    if(event.keyCode == 38){
        keyboard.UP = true;
    }

    if(event.keyCode == 32){
        keyboard.SPACE = true;
    }

    if(event.keyCode == 68){
        keyboard.D = true;
    }

})

window.addEventListener('keyup', (event)=>{
    if(event.keyCode == 39){
        keyboard.RIGHT = false;
    }

    if(event.keyCode == 37){
        keyboard.LEFT = false;
    }

    if(event.keyCode == 40){
        keyboard.DOWN = false;
    }

    if(event.keyCode == 38){
        keyboard.UP = false;
    }

    if(event.keyCode == 32){
        keyboard.SPACE = false;
    }

    if(event.keyCode == 68){
        keyboard.D = false;
    }
    
})