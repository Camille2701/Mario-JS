const player = document.querySelector('#player')

// Gestion des mouvements 

let positionX = 50;
let positionY = 0;
let isJumping = false;
let score = 0;
let gamesPlayed = 0;
let totalScore = 0;
let scores = []; // Stocke tous les scores des parties
let victories = 0; // Nombre de victoires
let characterSelections = {}; // Stocke les sélections de personnages
let isPaused = false;
let velocityY = 0;

let isSoundOn = true; // Variable pour suivre l'état du son

const menuMusic = document.getElementById("menu-music");
const gameMusic = document.getElementById("game-music");
const gameOverMusic = document.getElementById("game-over-music");

document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') positionX += 10
    if (event.key === 'ArrowLeft') positionX -= 10
    
    player.style.left = positionX + 'px'
    
    if (event.key === " " || event.key === "ArrowUp") jump()
        
})

function jump() {
    if (isJumping) return;
    isJumping = true;

    let upInterval = setInterval(() => {
        velocityY = 8;
        if (positionY >= 150) {
            clearInterval(upInterval);

            let downInterval = setInterval(() => {
                velocityY = -6;
                checkPlateformeCollision();
                if (positionY <= 0) {
                    clearInterval(downInterval);
                    isJumping = false;
                    velocityY = 0;
                } else {
                    positionY -= 6;
                    player.style.bottom = positionY + 'px';
                    checkPlateformeCollision();
                }
            }, 20);
        } else {
            positionY += 8;
            player.style.bottom = positionY + 'px';
            checkPlateformeCollision();
        }
    }, 20);
}

// Gestion des ennemis
let gameOver = false;
let lives = 3;

function createBomb() {
    const bomb = document.createElement('div')
    bomb.classList.add('bomb')
    document.querySelector('#game').appendChild(bomb)
    
    let positionX = 800;
    bomb.style.left = positionX + 'px'
    
    const moveInterval = setInterval(() => {
        if (positionX < 0) {
            score += 5
            // updateHUD()
            clearInterval(moveInterval)
            bomb.remove()
        } else {
            positionX -= 5
            bomb.style.left = positionX + 'px'
            
            if (checkCollision(player, bomb)) {
                clearInterval(moveInterval)
                bomb.remove()
                if (!gameOver) {
                    lives --
                    updateHUD()
                    if (lives <= 0) {
                        showGameOver()
                        gameOver = true
                    } else {
                        console.log('Vies restantes :', lives)
                    }
                }
            }
        }
    }, 20)
}


function getObstacleDelay() {
    if (score > 40) return 1000
    if (score > 20) return 1700
    return 2500
}

function loopObstacleGeneration() {
    if (!gameOver) {
        createBomb()
        const delay = getObstacleDelay()
        setTimeout(loopObstacleGeneration, delay)
    } else {
        clearTimeout(loopObstacleGeneration)
    }
}


function checkCollision(player, obstacle) {
    const playerRect = player.getBoundingClientRect();
    const obstacleRect = obstacle.getBoundingClientRect();
    
    // reduction de la hitbox du joueur pour prendre en compte la taille de l'image
    const shrink = 0.2; 
    const widthShrink = playerRect.width * shrink;
    const heightShrink = playerRect.height * shrink;
    
    const reducedPlayerRect = {
        top: playerRect.top + heightShrink / 2,
        bottom: playerRect.bottom - heightShrink / 2,
        left: playerRect.left + widthShrink / 2,
        right: playerRect.right - widthShrink / 2
    };
    
    return !(
        reducedPlayerRect.top > obstacleRect.bottom ||
        reducedPlayerRect.bottom < obstacleRect.top ||
        reducedPlayerRect.left > obstacleRect.right ||
        reducedPlayerRect.right < obstacleRect.left
    );
}

function showGameOver() {
    const screen = document.getElementById('game-over-screen')
    const text = document.getElementById('game-over-text')
    screen.classList.remove('hidden')
    console.log('Game Over')
    
    menuMusic.muted = true;
    gameMusic.muted = true;
    gameOverMusic.play();
    
    // stats
    scores.push(score) 
    gamesPlayed++
    if (score >= 50) { // ex de condition pour une victoire
        victories++;
    }
    
    updateStats()
    
}

function createPlateforme(x, y, destructible = false) {
    const plateforme = document.createElement('div');
    plateforme.classList.add('plateforme');
    if (destructible) plateforme.classList.add('destructible');
    plateforme.style.left = x + 'px';
    plateforme.style.bottom = y + 'px';
    document.getElementById('game').appendChild(plateforme);
    
    // Mouvement vers la gauche
    let positionX = x;
    const moveInterval = setInterval(() => {
        if (gameOver) {
            clearInterval(moveInterval);
            plateforme.remove();
            return;
        }
        positionX -= 3; // Vitesse de déplacement
        plateforme.style.left = positionX + 'px';
        
        // Supprime la plateforme si elle sort de l'écran
        if (positionX + plateforme.offsetWidth < 0) {
            clearInterval(moveInterval);
            plateforme.remove();
        }
    }, 20);
    
    return plateforme;
}


function generatePlateformes() {
    // Plateforme solide
    createPlateforme(800, 80, false);
    // plateforme destructible
    createPlateforme(1000, 120, true);
    createPlateforme(1200, 60, true);
}


function startGame() {
    menuMusic.pause();
    gameMusic.currentTime = 0;
    gameMusic.play();
    
    if (!isSoundOn) {
        gameMusic.muted = true;
    } else {
        gameMusic.muted = false;
    }
    
    lives = 3
    score = 0
    updateHUD() //update the HUD
    gameOver = false
    
    
    const screen = document.getElementById('game-over-screen')
    screen.classList.add('hidden')
    
    player.style.left = '50px'
    positionX = 50
    
    // Supprime les anciennes plateformes
    document.querySelectorAll('.plateforme').forEach(p => p.remove());
    generatePlateformes();
    
    loopObstacleGeneration()
}
startGame()

// Gestion du bouton de redémarrage
document.addEventListener('click', (event) => {
    if (event.target.id === 'restart-btn') {
        startGame();
    }
});

// Gestion du bouton de démarrage
document.querySelector('#start-btn').addEventListener('click', () => {
    document.getElementById('start-screen').style.display = 'none'
    document.getElementById('game').classList.remove('hidden')
    startGame()
})
// Gestion des personnages selectionnés
document.querySelectorAll('.character').forEach((char) => {
    char.addEventListener('click', () => {
        document.querySelectorAll('.character').forEach((c) => c.classList.remove('selected'))
        char.classList.add('selected')
        
        const character = char.dataset.character;
        characterSelections[character] = (characterSelections[character] || 0) + 1;
        
        document.getElementById('player').classList.add(char.dataset.character)
        // player.classList.add(char.dataset.character)
        
        const startButton = document.getElementById('start-btn');
        startButton.disabled = false;
    })
}
)

//drag and drop pour select personnage
document.querySelectorAll('.character').forEach(char => {
    char.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('character', char.dataset.character);
    });
});

const dropZone = document.getElementById('drop-zone');
const dropCharacter = document.getElementById('drop-character');

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('selected');
});
dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('selected');
});
dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('selected');
    const character = e.dataTransfer.getData('character');
    if (character) {
        //affiche le personnage dans la drop zone
        dropCharacter.className = '';
        dropCharacter.classList.add(character);
        
        //applique la classe au joueur
        document.getElementById('player').className = '';
        document.getElementById('player').classList.add(character);
        
        //active le bouton start
        document.getElementById('start-btn').disabled = false;
    }
});

function updateHUD() {
    const livesDisplay = document.getElementById('livesDisplay')
    livesDisplay.textContent = "❤️".repeat(lives)
    
    const scoreDisplay = document.getElementById('scoreDisplay')
    scoreDisplay.textContent = `Score: ${score}`
}

setInterval(() => { 
    if (!gameOver && !isPaused) {
        score++
        updateHUD()
    }
}
, 1000)

function updateStats() {
    //calculer le score moyen
    const averageScore = scores.length > 0
    ? scores.reduce((sum, current) => sum + current, 0) / scores.length
    : 0;
    
    //trouver le score maximum 
    const topScore = scores.length > 0 ? Math.max(...scores) : 0;
    
    //taux de victoire
    const winRate = gamesPlayed > 0
    ? ((victories / gamesPlayed) * 100).toFixed(2)
    : 0;
    
    // personnage principal
    const mainCharacter = Object.entries(characterSelections).reduce(
        (max, [character, count]) => (count > max.count ? { character, count } : max),
        { character: null, count: 0 }
    ).character || "None";
    
    // mise à jour des éléments HTML
    document.getElementById('gamesPlayed').textContent = `Games Played: ${gamesPlayed}`;
    document.getElementById('highScore').textContent = `High Score: ${topScore}`;
    document.getElementById('totalTime').textContent = `Average Score: ${averageScore.toFixed(2)}`;
    document.getElementById('winRate').textContent = `Win Rate: ${winRate}%`;
    document.getElementById('mainCharacter').textContent = `Main Character: ${mainCharacter}`;
}


// Bouton "son"
document.getElementById('sound-btn').addEventListener('click', () => {
    isSoundOn = !isSoundOn; //inverse l'état du son au clic
    
    // met à jour l'icône du bouton 
    const soundButton = document.getElementById('sound-btn');
    soundButton.textContent = isSoundOn ? '🔊' : '🔇';
    
    // coupe ou active la musique
    if (isSoundOn) {
        menuMusic.muted = false;
        gameMusic.muted = false;
    } else {
        menuMusic.muted = true;
        gameMusic.muted = true;
    }
});


// Fonction pour activer/désactiver le menu de pause
function togglePauseMenu() {
    
    const pauseMenu = document.getElementById('pause-menu');
    isPaused = !isPaused;
    
    if (isPaused) {
        pauseMenu.classList.remove('hidden');
        clearTimeout(loopObstacleGeneration); // Arrêter la génération des obstacles
    } else {
        pauseMenu.classList.add('hidden');
        loopObstacleGeneration(); // Reprendre la génération des obstacles
    }
}

// Écouter la touche echap pour activer/désactiver le menu de pause
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        togglePauseMenu();
    }
});

// resume button
document.getElementById('resume-btn').addEventListener('click', () => {
    togglePauseMenu();
});

//replay button
document.getElementById('restart-btn-pause').addEventListener('click', () => {
    togglePauseMenu();
    startGame();
});

// main menu button
document.getElementById('main-menu-btn').addEventListener('click', () => {
    // ferme le menu de pause
    togglePauseMenu();
    
    // reset le jeu
    gameOver = true;
    isPaused = false;
    
    // Masque la section du jeu et affiche le main menu
    document.getElementById('game').classList.add('hidden'); // Masque le jeu
    document.getElementById('pause-menu').classList.add('hidden'); // Masque le menu de pause
    document.getElementById('start-screen').style.display = 'flex'
    
    gameMusic.pause();
    gameMusic.currentTime = 0;
    menuMusic.currentTime = 0;
    menuMusic.play();
    menuMusic.muted = false;
    gameOverMusic.pause();
    gameOverMusic.currentTime = 0;
    gameOverMusic.muted = true;
    
    // reset les bombes et les timers
    const bombs = document.querySelectorAll('.bomb');
    bombs.forEach((bomb) => bomb.remove());
});

function checkPlateformeCollision() {
    const playerRect = player.getBoundingClientRect();
    document.querySelectorAll('.plateforme:not(.destroyed)').forEach(plateforme => {
        const platRect = plateforme.getBoundingClientRect();
        
        //collision par le dessus
        if (
            playerRect.bottom >= platRect.top &&
            playerRect.bottom <= platRect.top + 20 &&
            playerRect.right > platRect.left + 10 &&
            playerRect.left < platRect.right - 10 &&
            positionY > 0 &&
            velocityY < 0 // Le joueur tombe
        ) {
            // Pose le joueur sur la plateforme
            const gameRect = document.getElementById('game').getBoundingClientRect();
            positionY = platRect.top - gameRect.top + platRect.height - player.offsetHeight;
            if (positionY < 0) positionY = 0;
            player.style.bottom = positionY + 'px';
            isJumping = false;
            velocityY = 0;
        }
        
        // Collision par le dessous (le joueur tape la plateforme en sautant)
        if (
            playerRect.top <= platRect.bottom &&
            playerRect.top >= platRect.bottom - 20 &&
            playerRect.right > platRect.left + 10 &&
            playerRect.left < platRect.right - 10 &&
            isJumping && positionY > 0
        ) {
            if (plateforme.classList.contains('destructible')) {
                plateforme.classList.add('destroyed');
                setTimeout(() => {
                    if (plateforme.parentNode) {
                        plateforme.parentNode.removeChild(plateforme);
                    }
                }, 300);
            }
        }
    });
}

function loopPlateformeGeneration() {
    if (!gameOver) {
        // Génère une plateforme aléatoire
        const y = [60, 80, 120][Math.floor(Math.random() * 3)];
        const destructible = Math.random() < 0.5;
        createPlateforme(800, y, destructible);
        
        setTimeout(loopPlateformeGeneration, 2000); // toutes les 2 secondes
    }
}
