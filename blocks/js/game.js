import { Game as MazeGame } from './main.js';

// Game State
let currentLevelIndex = 1;
let levelData = null;
let botState = { x: 1, y: 1, orientation: 1 };
let initialBotState = { x: 1, y: 1, orientation: 1 };
let isRunning = false;
let mazeGameInstance = null;

// Self-healing Socket.IO connection for Blockly Phase
let gameSocket = null;
let localTeamId = null;
let localTeamName = null;

function getSocket() {
    return null;
}

// DOM Elements
const gridContainer = document.getElementById('gridContainer');
const fileInput = document.getElementById('levelUpload');
const runBtn = document.getElementById('runBtn');
const resetBtn = document.getElementById('resetBtn');
const appWrapper = document.querySelector('.app-wrapper');
const gameContainer = document.getElementById('game-container');

// UI Toggling
function switchToPhase(phase) { // 'MAZE' or 'BLOCKLY' or 'SPECTRUM'
    const spectrumContainer = document.getElementById('spectrum-container');
    if (phase === 'MAZE') {
        appWrapper.classList.add('hidden');
        if (spectrumContainer) spectrumContainer.classList.add('hidden');
        gameContainer.classList.remove('hidden');
        document.body.classList.add('maze-mode');
        document.documentElement.classList.add('maze-mode');
        if (!mazeGameInstance) {
            mazeGameInstance = new MazeGame();
        }
    } else if (phase === 'BLOCKLY') {
        gameContainer.classList.add('hidden');
        if (spectrumContainer) spectrumContainer.classList.add('hidden');
        appWrapper.classList.remove('hidden');
        document.body.classList.remove('maze-mode');
        document.documentElement.classList.remove('maze-mode');
    } else if (phase === 'SPECTRUM') {
        gameContainer.classList.add('hidden');
        appWrapper.classList.add('hidden');
        if (spectrumContainer) spectrumContainer.classList.remove('hidden');
        document.body.classList.remove('maze-mode');
        document.documentElement.classList.remove('maze-mode');
    }
        // Stop any 3D ambient audio if needed
        if (window.AudioContext) {
            // AudioSystem logic is internal to MazeGame, but we can call methods if exposed
        }
        if (window.initBlockly) window.initBlockly();
    }

// Phase Completion Handler
window.onPhaseComplete = () => {
    setTimeout(() => {
        switchToPhase('BLOCKLY');
        fetchLevel(6);
    }, 2000);
};

// Handle File Upload
fileInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(evt) {
            try {
                const json = JSON.parse(evt.target.result);
                loadLevel(json);
            } catch (err) {
                alert("Invalid JSON file!");
            }
        };
        reader.readAsText(file);
    }
});

window.exitSpectrumPhase = () => {
    switchToPhase('MAZE');
    if (mazeGameInstance) {
        mazeGameInstance.showMenu();
    }
};

// Auto-load a specific level
async function fetchLevel(levelNumber) {
    window.fetchLevel = fetchLevel;

    if (levelNumber > 10) {
        switchToPhase('SPECTRUM');
        const iframe = document.getElementById('spectrum-iframe');
        if (iframe) {
            iframe.src = 'shitttt/index.html?level=' + levelNumber;
        }
        return;
    }

    if (window.parent && window.parent.Game && window.parent !== window) {
        window.parent.Game.state.level = levelNumber;
        window.parent.Game.updateUI();
    }
    if (levelNumber < 6) {
        switchToPhase('MAZE');
        if (mazeGameInstance) mazeGameInstance.startLevel(levelNumber - 1);
        return;
    }

    switchToPhase('BLOCKLY');
    
    try {
        const response = await fetch(`level${levelNumber}.json`);
        if (response.ok) {
            const data = await response.json();
            currentLevelIndex = levelNumber;
            const adminSelect = document.getElementById('adminLevelSelect');
            if (adminSelect) adminSelect.value = levelNumber;
            loadLevel(data);

            // Report progress to multiplayer server
            const socket = getSocket();
            if (socket) {
                const activeTeamId = (window.game && window.game.teamId) || localTeamId || 'unknown';
                socket.emit('update_progress', { 
                    teamId: activeTeamId, 
                    level: levelNumber 
                });
            }
            
            const statusIndicator = document.getElementById('statusIndicator');
            if (statusIndicator) statusIndicator.innerText = `Level ${levelNumber} / 25`;
        } else {
            console.log(`No level${levelNumber}.json found.`);
            if (levelNumber > 6) {
                alert(`Level ${levelNumber} coming soon!`);
            }
        }
    } catch (err) {
        console.error("Error loading level:", err);
    }
}

// Bot Movement API for Blockly (Existing logic)
window.movePlayerForward = async () => {
    if (!isRunning) return;
    let newX = botState.x, newY = botState.y;
    if (botState.orientation === 0) newY -= 1;
    else if (botState.orientation === 1) newX += 1;
    else if (botState.orientation === 2) newY += 1;
    else if (botState.orientation === 3) newX -= 1;
    
    let blocked = false;
    const currentWalls = levelData.walls[`${botState.x},${botState.y}`] || [];
    if (botState.orientation === 0 && currentWalls.includes('north')) blocked = true;
    if (botState.orientation === 1 && currentWalls.includes('east')) blocked = true;
    if (botState.orientation === 2 && currentWalls.includes('south')) blocked = true;
    if (botState.orientation === 3 && currentWalls.includes('west')) blocked = true;
    
    if (!blocked) {
        const adjWalls = levelData.walls[`${newX},${newY}`] || [];
        if (botState.orientation === 0 && adjWalls.includes('south')) blocked = true;
        if (botState.orientation === 1 && adjWalls.includes('west')) blocked = true;
        if (botState.orientation === 2 && adjWalls.includes('north')) blocked = true;
        if (botState.orientation === 3 && adjWalls.includes('east')) blocked = true;
    }
    
    if (newX < 1 || newX > levelData.cols || newY < 1 || newY > levelData.rows) blocked = true;
    
    if (!blocked) {
        botState.x = newX;
        botState.y = newY;
    } else {
        document.getElementById('bot')?.classList.add('crash');
        isRunning = false;
        if (window.game && window.game.reportFailure) {
            window.game.reportFailure();
        } else {
            const socket = getSocket();
            if (socket) {
                const activeTeamId = (window.game && window.game.teamId) || localTeamId || 'unknown';
                socket.emit('report_failure', { teamId: activeTeamId });
            }
        }
        throw new Error('Crashed into a wall!');
    }
    updateBotVisuals();
    await new Promise(resolve => setTimeout(resolve, 300));
};

window.turnLeft = async () => {
    if (!isRunning) return;
    botState.orientation = (botState.orientation + 3) % 4;
    updateBotVisuals();
    await new Promise(resolve => setTimeout(resolve, 300));
};

window.turnRight = async () => {
    if (!isRunning) return;
    botState.orientation = (botState.orientation + 1) % 4;
    updateBotVisuals();
    await new Promise(resolve => setTimeout(resolve, 300));
};

window.isGoalReached = () => {
    if (levelData?.goal?.possible_final_positions) {
        const goalPos = levelData.goal.possible_final_positions[0];
        return botState.x === goalPos[0] && botState.y === goalPos[1];
    }
    return false;
};

window.checkPath = (direction) => {
    if (!levelData) return false;
    let checkDir = botState.orientation;
    if (direction === 'left') checkDir = (botState.orientation + 3) % 4;
    else if (direction === 'right') checkDir = (botState.orientation + 1) % 4;
    
    let blocked = false;
    const currentWalls = levelData.walls[`${botState.x},${botState.y}`] || [];
    if (checkDir === 0 && currentWalls.includes('north')) blocked = true;
    if (checkDir === 1 && currentWalls.includes('east')) blocked = true;
    if (checkDir === 2 && currentWalls.includes('south')) blocked = true;
    if (checkDir === 3 && currentWalls.includes('west')) blocked = true;
    
    let newX = botState.x, newY = botState.y;
    if (checkDir === 0) newY -= 1;
    else if (checkDir === 1) newX += 1;
    else if (checkDir === 2) newY += 1;
    else if (checkDir === 3) newX -= 1;
    
    if (!blocked) {
        const adjWalls = levelData.walls[`${newX},${newY}`] || [];
        if (checkDir === 0 && adjWalls.includes('south')) blocked = true;
        if (checkDir === 1 && adjWalls.includes('west')) blocked = true;
        if (checkDir === 2 && adjWalls.includes('north')) blocked = true;
        if (checkDir === 3 && adjWalls.includes('east')) blocked = true;
    }
    if (newX < 1 || newX > levelData.cols || newY < 1 || newY > levelData.rows) blocked = true;
    return !blocked;
};

function loadLevel(data) {
    if (window.workspace) {
        window.workspace.clear();
        if (data.maxBlocks) {
            window.workspace.options.maxBlocks = data.maxBlocks;
        } else {
            window.workspace.options.maxBlocks = Infinity;
        }
    }
    levelData = data;
    const rows = data.rows || 10;
    const cols = data.cols || 10;
    gridContainer.style.gridTemplateColumns = `repeat(${cols}, 60px)`;
    gridContainer.style.gridTemplateRows = `repeat(${rows}, 60px)`;
    gridContainer.innerHTML = '';
    for (let r = 1; r <= rows; r++) {
        for (let c = 1; c <= cols; c++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.id = `cell-${c}-${r}`;
            if (data.walls?.[`${c},${r}`]) {
                data.walls[`${c},${r}`].forEach(dir => cell.classList.add(`wall-${dir}`));
            }
            gridContainer.appendChild(cell);
        }
    }
    if (data.robots?.[0]) {
        const robot = data.robots[0];
        initialBotState = { x: robot.x || 1, y: robot.y || 1, orientation: robot._orientation ?? 1 };
    }
    if (data.goal?.possible_final_positions) {
        const goalPos = data.goal.possible_final_positions[0];
        const goalEl = document.createElement('div');
        goalEl.className = 'goal';
        document.getElementById(`cell-${goalPos[0]}-${goalPos[1]}`)?.appendChild(goalEl);
    }
    const botEl = document.createElement('div');
    botEl.id = 'bot';
    botEl.className = 'bot';
    botEl.innerHTML = `<svg width="49" height="52" viewBox="0 0 49 52"><defs><clipPath id="pegmanClipPath"><rect width="49" height="52" /></clipPath></defs><g><image id="pegman" height="52" width="1029" clip-path="url(#pegmanClipPath)" xlink:href="maze/pegman.png" x="-95"></image></g></svg>`;
    gridContainer.appendChild(botEl);
    resetBot();
}

function updateBotVisuals() {
    const botEl = document.getElementById('bot');
    const spriteEl = document.getElementById('pegman');
    if (!botEl || !levelData || !spriteEl) return;
    
    const cellEl = document.getElementById(`cell-${botState.x}-${botState.y}`);
    if (cellEl) {
        const leftPos = cellEl.offsetLeft + (cellEl.offsetWidth - 49) / 2;
        const topPos = cellEl.offsetTop + (cellEl.offsetHeight - 52) / 2;
        botEl.style.left = `${leftPos}px`;
        botEl.style.top = `${topPos}px`;
    }
    spriteEl.setAttribute('x', -(botState.orientation * 4 * 49));
}

function resetBot() {
    if (!levelData) return;
    botState = { ...initialBotState };
    updateBotVisuals();
    isRunning = false;
}

resetBtn?.addEventListener('click', resetBot);
runBtn?.addEventListener('click', async () => {
    if (isRunning || !levelData) return;
    resetBot();
    isRunning = true;
    try {
        const generator = (window.javascript && window.javascript.javascriptGenerator) || (window.Blockly && window.Blockly.JavaScript);
        if (!generator) throw new Error("Blockly JavaScript generator not found!");
        const code = generator.workspaceToCode(window.workspace);
        await eval(`(async () => { ${code} })()`);
        if (window.isGoalReached()) {
            setTimeout(() => document.getElementById('victoryModal')?.classList.add('active'), 100);
        }
    } catch (e) {
        if (e.message !== 'Crashed into a wall!') alert("Error: " + e);
    } finally { isRunning = false; }
});

window.addEventListener('load', () => {
    // Add Blockly Back button listener
    document.getElementById('btn-blockly-back')?.addEventListener('click', () => {
        switchToPhase('MAZE');
        if (mazeGameInstance) {
            mazeGameInstance.exitToMainMenu();
        }
    });

    const urlParams = new URLSearchParams(window.location.search);
    const levelParam = urlParams.get('level');
    if (levelParam) {
        fetchLevel(parseInt(levelParam));
    } else {
        switchToPhase('MAZE');
    }
});
window.addEventListener('resize', updateBotVisuals);
document.getElementById('nextLevelBtn')?.addEventListener('click', () => {
    document.getElementById('victoryModal')?.classList.remove('active');
    fetchLevel(currentLevelIndex + 1);
});



// Admin Level Selector Logic
document.getElementById('adminLevelSelect')?.addEventListener('change', (e) => {
    const level = parseInt(e.target.value);
    if (level) fetchLevel(level);
});
