let canvas;
let world;
let keyboard = new Keyboard();
let mainMenu;

function init() {
    canvas = document.getElementById("canvas");
    // Hauptmenü erstellen statt das Spiel direkt zu starten
    mainMenu = new MainMenu();
}

// Neue Funktion zum Initialisieren des Spiels nach dem Klick auf "Spiel starten"
function initGame() {
    world = new World(canvas, keyboard);
    window.world = world; // Globalen Zugriff ermöglichen
    console.log('My Character is', world.character);
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