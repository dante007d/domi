// Recursive Backtracker Maze Generator

export class Maze {
    constructor(size) {
        this.size = size; // Must be odd
        this.grid = [];
        this.start = { x: 1, y: 1 };
        this.end = { x: size - 2, y: size - 2 };
        this.generate();
    }

    generate() {
        // Initialize grid with all walls (1)
        for (let y = 0; y < this.size; y++) {
            this.grid[y] = [];
            for (let x = 0; x < this.size; x++) {
                this.grid[y][x] = 1;
            }
        }

        // Carve paths (0)
        const carve = (x, y) => {
            this.grid[y][x] = 0;

            const dirs = [
                { dx: 0, dy: -2 }, // N
                { dx: 2, dy: 0 },  // E
                { dx: 0, dy: 2 },  // S
                { dx: -2, dy: 0 }  // W
            ];
            
            // Shuffle directions
            dirs.sort(() => Math.random() - 0.5);

            for (let i = 0; i < dirs.length; i++) {
                const nx = x + dirs[i].dx;
                const ny = y + dirs[i].dy;

                if (nx > 0 && nx < this.size - 1 && ny > 0 && ny < this.size - 1 && this.grid[ny][nx] === 1) {
                    this.grid[y + dirs[i].dy / 2][x + dirs[i].dx / 2] = 0;
                    carve(nx, ny);
                }
            }
        };

        carve(1, 1);
        
        // Ensure entrance and exit areas are open
        this.grid[1][1] = 0;
        this.grid[1][2] = 0;
        this.grid[2][1] = 0;

        // Find a dead end far away for the chest, or use size-2
        // Just force the furthest corner to be accessible
        this.grid[this.size - 2][this.size - 2] = 0;
        this.grid[this.size - 2][this.size - 3] = 0;
        this.end = { x: this.size - 2, y: this.size - 2 };
    }

    getCell(x, y) {
        if (x < 0 || x >= this.size || y < 0 || y >= this.size) return 1;
        return this.grid[Math.floor(y)][Math.floor(x)];
    }
}
