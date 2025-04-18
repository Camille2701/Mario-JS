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
        if (positionY >= 150) {
            clearInterval(upInterval)

            let downInterval = setInterval(() => {
                if (positionY <= 0) {
                    clearInterval(downInterval);
                    isJumping = false
                } else {
                    positionY -= 6
                    player.style.bottom = positionY + 'px'
                }
            }, 20);
        } else {
            positionY += 8
            player.style.bottom = positionY + 'px'
        }
    }, 20)
}

// Gestion des ennemis (bombes)
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
    const playerRect = player.getBoundingClientRect()
    const obstacleRect = obstacle.getBoundingClientRect()

    return !(
        playerRect.top > obstacleRect.bottom ||
        playerRect.bottom < obstacleRect.top ||
        playerRect.left > obstacleRect.right ||
        playerRect.right < obstacleRect.left
    )
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
    if (score >= 50) { // Exemple de condition pour une victoire
        victories++;
    }

    updateStats()

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

    loopObstacleGeneration()
}
startGame()

// Gestion du bouton de redémarrage
// document.querySelector('#restart-btn').addEventListener('click', startGame)

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
    // Calculer le score moyen avec reduce()
    const averageScore = scores.length > 0
        ? scores.reduce((sum, current) => sum + current, 0) / scores.length
        : 0;

    // Trouver le score maximum avec map() et Math.max()
    const topScore = scores.length > 0 ? Math.max(...scores) : 0;

    // Calculer le taux de victoire avec filter()
    const winRate = gamesPlayed > 0
        ? ((victories / gamesPlayed) * 100).toFixed(2)
        : 0;

    // Trouver le personnage principal avec reduce() et Object.entries()
    const mainCharacter = Object.entries(characterSelections).reduce(
        (max, [character, count]) => (count > max.count ? { character, count } : max),
        { character: null, count: 0 }
    ).character || "None";

    // Mettre à jour les éléments HTML
    document.getElementById('gamesPlayed').textContent = `Games Played: ${gamesPlayed}`;
    document.getElementById('highScore').textContent = `High Score: ${topScore}`;
    document.getElementById('totalTime').textContent = `Average Score: ${averageScore.toFixed(2)}`;
    document.getElementById('winRate').textContent = `Win Rate: ${winRate}%`;
    document.getElementById('mainCharacter').textContent = `Main Character: ${mainCharacter}`;
}



document.getElementById('sound-btn').addEventListener('click', () => {
    isSoundOn = !isSoundOn; // Inverse l'état du son

    // Met à jour l'icône du bouton
    const soundButton = document.getElementById('sound-btn');
    soundButton.textContent = isSoundOn ? '🔊' : '🔇';

    // Coupe ou active la musique
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

// Écouter la touche Échap pour activer/désactiver le menu de pause
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        togglePauseMenu();
    }
});

// Bouton "Reprendre"
document.getElementById('resume-btn').addEventListener('click', () => {
    togglePauseMenu();
});

// Bouton "Rejouer"
document.getElementById('restart-btn-pause').addEventListener('click', () => {
    togglePauseMenu();
    startGame();
});

// Bouton "Menu Principal"
document.getElementById('main-menu-btn').addEventListener('click', () => {
    // Ferme le menu de pause
    togglePauseMenu();

    // Réinitialise l'état global du jeu
    gameOver = true;
    isPaused = false;

    // Masque la section du jeu et affiche l'écran de démarrage
    document.getElementById('game').classList.add('hidden');
    document.getElementById('start-screen').classList.remove('hidden');

    // Réinitialise les bombes et les timers
    const bombs = document.querySelectorAll('.bomb');
    bombs.forEach((bomb) => bomb.remove());
});
