// HUD and Minimap Rendering

export class HUD {
    constructor() {
        this.canvas = document.getElementById('minimap');
        this.ctx = this.canvas.getContext('2d');
        this.isVisible = true;
        this.mapScale = 10;
        
        // Listen for M key
        document.addEventListener('keydown', (e) => {
            if (e.key && e.key.toLowerCase() === 'm') {
                this.isVisible = !this.isVisible;
                this.canvas.style.display = this.isVisible ? 'block' : 'none';
            }
        });
    }

    setLevel(levelNum) {
        document.getElementById('current-level').innerText = levelNum;
    }

    update(playerPos, maze, chests, monster) {
        this.drawMinimap(maze, playerPos, chests, monster);
    }

    drawMinimap(maze, playerPos, chests, monster) {
        if (!this.isVisible) return;

        // Resize canvas based on maze size
        this.canvas.width = maze.size * this.mapScale;
        this.canvas.height = maze.size * this.mapScale;

        // Clear
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw maze walls
        this.ctx.fillStyle = '#440000'; // Darker red for walls
        for (let y = 0; y < maze.size; y++) {
            for (let x = 0; x < maze.size; x++) {
                if (maze.grid[y][x] === 1) {
                    this.ctx.fillRect(x * this.mapScale, y * this.mapScale, this.mapScale, this.mapScale);
                }
            }
        }

        // Draw Chests (Blinking)
        const isBlinkOn = Math.floor(Date.now() / 400) % 2 === 0;
        if (chests && isBlinkOn) {
            chests.forEach(chest => {
                // Same color for both to keep it a mystery!
                this.ctx.fillStyle = '#ffaa00'; 
                
                // Position is 3D Vector3 (x, y, z)
                const cx = chest.position.x * this.mapScale;
                const cz = chest.position.z * this.mapScale;
                
                this.ctx.beginPath();
                this.ctx.arc(cx, cz, this.mapScale / 1.5, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Add a small glow effect
                this.ctx.shadowBlur = 10;
                this.ctx.shadowColor = this.ctx.fillStyle;
                this.ctx.stroke();
                this.ctx.shadowBlur = 0;
            });
        }

        // Draw monster (Red skull)
        if (monster && !monster.isDead) {
            const mx = monster.position.x * this.mapScale;
            const mz = monster.position.z * this.mapScale;
            
            this.ctx.fillStyle = '#ff0000';
            this.ctx.beginPath();
            this.ctx.arc(mx, mz, this.mapScale / 1.2, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '10px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('💀', mx, mz);
        }

        // Draw player
        this.ctx.fillStyle = '#00ff00';
        this.ctx.beginPath();
        this.ctx.arc(playerPos.x * this.mapScale, playerPos.z * this.mapScale, this.mapScale / 2, 0, Math.PI * 2);
        this.ctx.fill();
    }

    showInteract(show) {
        const prompt = document.getElementById('interact-prompt');
        if (prompt) {
            if (show) prompt.classList.remove('hidden');
            else prompt.classList.add('hidden');
        }
    }
}
