// Game State
let currentLevelIndex = 1;
let levelData = null;
let botState = {
    x: 1,
    y: 1,
    orientation: 1 // 0=North, 1=East, 2=South, 3=West
};
let initialBotState = { x: 1, y: 1, orientation: 1 };
let isRunning = false;
window.botActions = [];

// DOM Elements
const gridContainer = document.getElementById('gridContainer');
const fileInput = document.getElementById('levelUpload');
const runBtn = document.getElementById('runBtn');
const resetBtn = document.getElementById('resetBtn');

// Handle File Upload
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(evt) {
            try {
                const json = JSON.parse(evt.target.result);
                loadLevel(json);
            } catch (err) {
                alert("Invalid JSON file! Make sure it matches the Reeborg format.");
            }
        };
        reader.readAsText(file);
    }
});

// Auto-load a specific level
async function fetchLevel(levelNumber) {
    try {
        const response = await fetch(`level${levelNumber}.json`);
        if (response.ok) {
            const data = await response.json();
            currentLevelIndex = levelNumber;
            const adminSelect = document.getElementById('adminLevelSelect');
            if (adminSelect) adminSelect.value = levelNumber;
            loadLevel(data);
        } else {
            console.log(`No level${levelNumber}.json found.`);
            if (levelNumber > 1) {
                alert(`Level ${levelNumber} is not available yet!`);
            }
        }
    } catch (err) {
        console.error("Error loading level:", err);
    }
}

// Bot Movement API for Blockly (Async)
window.movePlayerForward = async () => {
    if (!isRunning) return;
    
    let newX = botState.x;
    let newY = botState.y;
    
    if (botState.orientation === 0) newY -= 1; // North
    else if (botState.orientation === 1) newX += 1; // East
    else if (botState.orientation === 2) newY += 1; // South
    else if (botState.orientation === 3) newX -= 1; // West
    
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
        const botEl = document.getElementById('bot');
        botEl.classList.add('crash');
        setTimeout(() => botEl.classList.remove('crash'), 300);
        isRunning = false;
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
    if (levelData && levelData.goal && levelData.goal.possible_final_positions) {
        const goalPos = levelData.goal.possible_final_positions[0];
        return botState.x === goalPos[0] && botState.y === goalPos[1];
    }
    return false;
};

window.checkPath = (direction) => { // 'ahead', 'left', 'right'
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
    
    let newX = botState.x;
    let newY = botState.y;
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

// Load Level Data
function loadLevel(data) {
    if (window.workspace) {
        window.workspace.clear();
        if (data.maxBlocks !== undefined) {
            window.workspace.options.maxBlocks = data.maxBlocks;
        } else {
            window.workspace.options.maxBlocks = Infinity;
        }
    }

    levelData = data;
    const rows = data.rows || 10;
    const cols = data.cols || 10;
    
    // Set grid dimensions
    gridContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    gridContainer.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    gridContainer.style.aspectRatio = `${cols} / ${rows}`;
    gridContainer.style.width = '100%';
    gridContainer.style.maxWidth = `${cols * 62}px`;
    
    // Render cells and walls
    gridContainer.innerHTML = '';
    
    for (let r = 1; r <= rows; r++) {
        for (let c = 1; c <= cols; c++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.id = `cell-${c}-${r}`;
            
            // Check for walls
            const wallKey = `${c},${r}`;
            if (data.walls && data.walls[wallKey]) {
                data.walls[wallKey].forEach(direction => {
                    cell.classList.add(`wall-${direction}`);
                });
            }
            gridContainer.appendChild(cell);
        }
    }
    
    // Initialize Bot
    if (data.robots && data.robots.length > 0) {
        const robot = data.robots[0];
        initialBotState = {
            x: robot.x || 1,
            y: robot.y || 1,
            orientation: robot._orientation !== undefined ? robot._orientation : 1
        };
    }
    
    // Render Goal
    if (data.goal && data.goal.possible_final_positions) {
        const goalPos = data.goal.possible_final_positions[0];
        const goalEl = document.createElement('div');
        goalEl.className = 'goal';
        goalEl.id = 'goal';
        const cell = document.getElementById(`cell-${goalPos[0]}-${goalPos[1]}`);
        if (cell) cell.appendChild(goalEl);
    }
    
    // Create Bot Element with SVG Sprite
    const botEl = document.createElement('div');
    botEl.id = 'bot';
    botEl.className = 'bot';
    
    // Inject SVG Pegman with exact user-provided attributes and visibility fix
    botEl.innerHTML = `
        <svg width="49" height="52" viewBox="0 0 49 52" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <clipPath id="pegmanClipPath">
                    <rect x="0" y="0" width="49" height="52" />
                </clipPath>
            </defs>
            <g id="pegmanContainer">
                <image id="pegman" height="52" width="1029" clip-path="url(#pegmanClipPath)" xlink:href="maze/pegman.png" x="-95" y="0" transform="rotate(0, 0, 0)"></image>
            </g>
        </svg>
    `;
    gridContainer.appendChild(botEl);
    
    resetBot();
}

function updateBotVisuals() {
    const botEl = document.getElementById('bot');
    const spriteEl = document.getElementById('pegman');
    if (!botEl || !levelData || !spriteEl) return;
    
    const cellWidth = gridContainer.offsetWidth / levelData.cols;
    const cellHeight = gridContainer.offsetHeight / levelData.rows;
    
    const leftPos = (botState.x - 1) * cellWidth + (cellWidth - 49) / 2;
    const topPos = (botState.y - 1) * cellHeight + (cellHeight - 52) / 2;
    
    botEl.style.left = `${leftPos}px`;
    botEl.style.top = `${topPos}px`;
    
    // Sprite frame selection (49px per frame)
    // The sprite sheet has 16 frames for a full 360 rotation.
    // 0: North, 1: East, 2: South, 3: West
    // So East is frame 4, South is frame 8, West is frame 12.
    const frameX = -(botState.orientation * 4 * 49);
    spriteEl.setAttribute('x', frameX);

    // Removed the yellow background (visited class) as requested
}

function resetBot() {
    if (!levelData) return;
    botState = { ...initialBotState };
    
    // Clear visited states
    const cells = document.querySelectorAll('.grid-cell');
    cells.forEach(cell => cell.classList.remove('visited'));
    
    updateBotVisuals();
    isRunning = false;
    
    const botEl = document.getElementById('bot');
    if (botEl) botEl.classList.remove('crash');
}

resetBtn.addEventListener('click', resetBot);

// Execution Logic
runBtn.addEventListener('click', async () => {
    if (isRunning || !levelData) return;
    
    resetBot();
    isRunning = true;
    
    try {
        const code = javascript.javascriptGenerator.workspaceToCode(workspace);
        const asyncCode = `(async () => { \n${code}\n })()`;
        await eval(asyncCode);
        
        if (window.isGoalReached()) {
            setTimeout(() => {
                const modal = document.getElementById('victoryModal');
                if (modal) modal.classList.add('active');
            }, 100);
        }
    } catch (e) {
        if (e.message !== 'Crashed into a wall!') {
            alert("Error in code: " + e);
        }
    } finally {
        isRunning = false;
    }
});

window.addEventListener('load', () => fetchLevel(1));
window.addEventListener('resize', updateBotVisuals);

document.getElementById('nextLevelBtn')?.addEventListener('click', () => {
    document.getElementById('victoryModal').classList.remove('active');
    fetchLevel(currentLevelIndex + 1);
});

const adminSelect = document.getElementById('adminLevelSelect');
const adminAuthBtn = document.getElementById('adminAuthBtn');

if (adminSelect) {
    adminSelect.addEventListener('change', (e) => {
        fetchLevel(parseInt(e.target.value));
        // Auto-lock after selection
        adminSelect.style.display = 'none';
        if (adminAuthBtn) adminAuthBtn.style.display = 'inline-block';
    });
}

if (adminAuthBtn) {
    adminAuthBtn.addEventListener('click', () => {
        const code = prompt("Enter Admin Code:");
        if (code === "6969") {
            adminAuthBtn.style.display = 'none';
            if (adminSelect) adminSelect.style.display = 'inline-block';
            alert("Admin Access Granted!");
        } else if (code !== null) {
            alert("Incorrect Code! Access Denied.");
        }
    });
}


