import { Textures } from './textures.js';
import { AudioSystem } from './audio.js';

export class Monster {
    constructor(scene, maze, player) {
        this.scene = scene;
        this.maze = maze;
        this.player = player;
        this.speed = 1.5; // Fast enough for maze chase
        this.isActive = true;
        this.isDead = false;
        this.respawnTimer = 0;

        // Spawn monster at a moderate distance so it is immediately active and visible sooner
        const spawnX = Math.min(this.maze.size - 2, 7.5);
        const spawnZ = Math.min(this.maze.size - 2, 7.5);
        this.position = new THREE.Vector3(spawnX, 0.5, spawnZ);

        // Create sprite
        const tex = Textures.getMonsterSprite();
        const mat = new THREE.SpriteMaterial({ map: tex, color: 0xffffff, transparent: true });
        this.sprite = new THREE.Sprite(mat);
        this.sprite.position.copy(this.position);
        this.sprite.scale.set(1.2, 1.2, 1);
        this.scene.add(this.sprite);
        
        // Add a red glow around the monster
        this.glow = new THREE.PointLight(0xff0000, 2, 5);
        this.glow.position.copy(this.position);
        this.scene.add(this.glow);

        this.time = 0;
        this.heartbeatTimer = 0;
    }

    update(dt) {
        if (this.isDead) {
            this.respawnTimer += dt;
            if (this.respawnTimer >= 8.0) {
                // Respawn
                this.isDead = false;
                this.isActive = true;
                this.sprite.visible = true;
                const spawnX = Math.min(this.maze.size - 2, 7.5);
                const spawnZ = Math.min(this.maze.size - 2, 7.5);
                this.position.set(spawnX, 0.5, spawnZ);
                this.sprite.position.copy(this.position);
                this.glow.position.copy(this.position);
            }
            return;
        }

        if (!this.isActive) return;

        this.time += dt;
        
        // Bobbing animation
        this.sprite.position.y = 0.5 + Math.sin(this.time * 5) * 0.1;
        
        // Flicker glow
        this.glow.intensity = 1.5 + Math.random() * 1.5;

        // Calculate vector towards player
        const dx = this.player.camera.position.x - this.position.x;
        const dz = this.player.camera.position.z - this.position.z;
        const distToPlayer = Math.sqrt(dx*dx + dz*dz);
        
        // Visual awareness vignette overlay
        const vignette = document.querySelector('.vignette');
        if (vignette) {
            if (distToPlayer < 10) {
                const intensity = (10 - distToPlayer) / 10;
                vignette.style.boxShadow = `inset 0 0 ${50 + intensity * 150}px rgba(255, 0, 0, ${intensity * 0.95})`;
            } else {
                vignette.style.boxShadow = '';
            }
        }

        // Heartbeat pulse rate
        if (distToPlayer < 10) {
            const period = Math.max(0.15, Math.min(1.5, distToPlayer / 7));
            this.heartbeatTimer += dt;
            if (this.heartbeatTimer >= period) {
                AudioSystem.playHeartbeat();
                this.heartbeatTimer = 0;
            }
        } else {
            this.heartbeatTimer = 0;
        }

        // If close enough, trigger jump scare
        if (distToPlayer < 0.8) {
            this.triggerJumpScare();
            return;
        }

        // Pathfinding chasing logic (Respects walls, never gets stuck)
        if (distToPlayer > 0) {
            const path = this.findPathTo(this.player.camera.position.x, this.player.camera.position.z);
            if (path && path.length > 1) {
                // Next step in path
                const nextCell = path[1];
                const targetPos = new THREE.Vector3(nextCell.x + 0.5, 0.5, nextCell.z + 0.5);
                const toTarget = targetPos.clone().sub(this.position);
                toTarget.y = 0; // lock Y
                const distToCell = toTarget.length();
                
                if (distToCell > 0.02) {
                    toTarget.normalize();
                    this.position.addScaledVector(toTarget, this.speed * dt);
                } else {
                    this.position.copy(targetPos);
                }
            } else {
                // Fallback to sliding/direct chasing if no path found
                const dirX = dx / distToPlayer;
                const dirZ = dz / distToPlayer;
                this.position.x += dirX * this.speed * dt;
                this.position.z += dirZ * this.speed * dt;
            }
            
            this.sprite.position.x = this.position.x;
            this.sprite.position.z = this.position.z;
            this.glow.position.copy(this.sprite.position);
        }
    }

    findPathTo(targetX, targetZ) {
        const startX = Math.floor(this.position.x);
        const startZ = Math.floor(this.position.z);
        const endX = Math.floor(targetX);
        const endZ = Math.floor(targetZ);

        if (startX === endX && startZ === endZ) {
            return [{ x: startX, z: startZ }];
        }

        const queue = [[{ x: startX, z: startZ }]];
        const visited = new Set();
        visited.add(`${startX},${startZ}`);

        const dirs = [
            { x: 0, z: -1 },
            { x: 1, z: 0 },
            { x: 0, z: 1 },
            { x: -1, z: 0 }
        ];

        let iterations = 0;
        const maxIterations = 400; // Limit search to avoid performance hits in huge levels

        while (queue.length > 0 && iterations++ < maxIterations) {
            const path = queue.shift();
            const curr = path[path.length - 1];

            if (curr.x === endX && curr.z === endZ) {
                return path;
            }

            for (const d of dirs) {
                const nx = curr.x + d.x;
                const nz = curr.z + d.z;

                if (nx >= 0 && nx < this.maze.size && nz >= 0 && nz < this.maze.size) {
                    if (this.maze.grid[nz][nx] === 0) {
                        const key = `${nx},${nz}`;
                        if (!visited.has(key)) {
                            visited.add(key);
                            queue.push([...path, { x: nx, z: nz }]);
                        }
                    }
                }
            }
        }
        return null;
    }

    triggerJumpScare() {
        this.isActive = false;
        AudioSystem.playJumpScare();
        
        // Reset vignette
        const vignette = document.querySelector('.vignette');
        if (vignette) vignette.style.boxShadow = '';

        // Trigger fullscreen jumpscare overlay
        const overlay = document.getElementById('jumpscare-overlay');
        if (overlay) {
            overlay.classList.remove('hidden');
            overlay.style.display = 'flex';
            
            // Flash effect
            let flashCount = 0;
            const flashInt = setInterval(() => {
                overlay.style.filter = flashCount % 2 === 0 ? 'invert(1)' : 'none';
                flashCount++;
            }, 100);
            
            setTimeout(() => {
                clearInterval(flashInt);
                overlay.style.filter = 'none';
                overlay.style.display = 'none';
                overlay.classList.add('hidden');
                
                // Deduct life and respawn player
                window.gameInstance.player.respawn();
                window.gameInstance.quiz.lives--;
                document.querySelectorAll('.skull')[window.gameInstance.quiz.lives].style.opacity = '0.2';
                
                if (window.gameInstance.quiz.lives <= 0) {
                    window.gameInstance.onGameOver();
                } else {
                    // Respawn monster back at the spawn point
                    const spawnX = Math.min(this.maze.size - 2, 7.5);
                    const spawnZ = Math.min(this.maze.size - 2, 7.5);
                    this.position.set(spawnX, 0.5, spawnZ);
                    this.sprite.position.copy(this.position);
                    this.glow.position.copy(this.position);
                    this.isActive = true;
                }
            }, 2000);
        }
    }

    die() {
        AudioSystem.playMonsterScream();
        this.isDead = true;
        this.isActive = false;
        this.sprite.visible = false;
        this.glow.visible = false;
        this.respawnTimer = 0;
        
        const vignette = document.querySelector('.vignette');
        if (vignette) vignette.style.boxShadow = '';
    }

    destroy() {
        const vignette = document.querySelector('.vignette');
        if (vignette) vignette.style.boxShadow = '';
        this.scene.remove(this.sprite);
        this.scene.remove(this.glow);
    }
}
