// HUD and Minimap Rendering

export class HUD {
    constructor() {
        this.canvas = document.getElementById('minimap');
        this.ctx = this.canvas.getContext('2d');
        this.isVisible = true;
        this.mapScale = 10;
        
        // Listen for M key
        document.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'm') {
                this.isVisible = !this.isVisible;
                this.canvas.style.display = this.isVisible ? 'block' : 'none';
            }
        });
    }

    setLevel(levelNum) {
        document.getElementById('current-level').innerText = levelNum;
    }

    drawMinimap(maze, playerPos, chests) {
        if (!this.isVisible) return;

        // Resize canvas based on maze size
        this.canvas.width = maze.size * this.mapScale;
        this.canvas.height = maze.size * this.mapScale;

        // Clear
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw maze walls
        this.ctx.fillStyle = '#550000'; // Dark red walls
        for (let y = 0; y < maze.size; y++) {
            for (let x = 0; x < maze.size; x++) {
                if (maze.grid[y][x] === 1) {
                    this.ctx.fillRect(x * this.mapScale, y * this.mapScale, this.mapScale, this.mapScale);
                }
            }
        }

        // Draw player
        this.ctx.fillStyle = '#00ff00';
        this.ctx.beginPath();
        this.ctx.arc(playerPos.x * this.mapScale, playerPos.z * this.mapScale, this.mapScale / 2, 0, Math.PI * 2);
        this.ctx.fill();

        // Draw chests
        this.ctx.fillStyle = '#ffaa00';
        chests.forEach(chest => {
            if (!chest.isOpen) {
                this.ctx.fillRect(chest.position.x * this.mapScale - 2, chest.position.z * this.mapScale - 2, 4, 4);
            }
        });
    }

    showInteract(show) {
        const prompt = document.getElementById('interact-prompt');
        if (show) {
            prompt.classList.remove('hidden');
        } else {
            prompt.classList.add('hidden');
        }
    }
}
