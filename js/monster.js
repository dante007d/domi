import { Textures } from './textures.js';
import { AudioSystem } from './audio.js';

export class Monster {
    constructor(scene, maze, player, spawnX, spawnZ) {
        this.scene = scene;
        this.maze = maze;
        this.player = player;
        this.speed = 1.15; // Slower speed so they are dumber and evadable
        this.isActive = true;
        this.isDead = false;
        this.respawnTimer = 0;

        // Spawn position
        this.spawnX = spawnX !== undefined ? spawnX : Math.min(this.maze.size - 2, 7.5);
        this.spawnZ = spawnZ !== undefined ? spawnZ : Math.min(this.maze.size - 2, 7.5);
        this.position = new THREE.Vector3(this.spawnX, 0.5, this.spawnZ);

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
        this.growlTimer = 0;
        this.pathRecalcTimer = Math.random() * 0.3; // Stagger recalculations between monsters to save CPU
        this.currentPath = null;
    }

    update(dt) {
        if (this.isDead) {
            this.respawnTimer += dt;
            if (this.respawnTimer >= 8.0) {
                // Respawn
                this.isDead = false;
                this.isActive = true;
                this.sprite.visible = true;
                this.glow.visible = true;
                this.position.set(this.spawnX, 0.5, this.spawnZ);
                this.sprite.position.copy(this.position);
                this.glow.position.copy(this.position);
            }
            return;
        }

        if (!this.isActive) return;

        this.time += dt;
        
        // Bobbing & Breathing Animation to make it look "live"
        this.sprite.position.y = 0.5 + Math.sin(this.time * 5) * 0.1;
        const pulseScale = 1.2 + Math.sin(this.time * 6) * 0.08;
        this.sprite.scale.set(pulseScale, pulseScale, 1);
        
        // Waddling / swaying back and forth like it is walking
        this.sprite.material.rotation = Math.sin(this.time * 8) * 0.12;
        
        // Flicker glow
        this.glow.intensity = 1.5 + Math.random() * 1.5;

        // Calculate vector towards player
        const dx = this.player.camera.position.x - this.position.x;
        const dz = this.player.camera.position.z - this.position.z;
        const distToPlayer = Math.sqrt(dx*dx + dz*dz);
        
        // Visual awareness vignette overlay (only for the closest monster)
        const vignette = document.querySelector('.vignette');
        if (vignette && distToPlayer < 10) {
            const currentBoxShadow = vignette.style.boxShadow;
            const intensity = (10 - distToPlayer) / 10;
            const newShadow = `inset 0 0 ${50 + intensity * 150}px rgba(255, 0, 0, ${intensity * 0.95})`;
            if (!currentBoxShadow || currentBoxShadow.includes('rgba(255, 0, 0') && intensity > 0) {
                vignette.style.boxShadow = newShadow;
            }
        }

        // Heartbeat pulse rate & Random growls to make it "live"
        if (distToPlayer < 10) {
            const period = Math.max(0.15, Math.min(1.5, distToPlayer / 7));
            this.heartbeatTimer += dt;
            if (this.heartbeatTimer >= period) {
                AudioSystem.playHeartbeat();
                this.heartbeatTimer = 0;
            }

            // Play growling sound randomly when near player
            this.growlTimer += dt;
            if (this.growlTimer > 3.0) {
                if (Math.random() < 0.25) {
                    AudioSystem.playGrowl();
                    this.growlTimer = 0;
                }
            }
        } else {
            this.heartbeatTimer = 0;
            this.growlTimer = 0;
        }

        // If close enough, trigger attack
        if (distToPlayer < 0.8) {
            this.triggerJumpScare();
            return;
        }

        // Pathfinding chasing logic (Respects walls, never gets stuck, evadable reaction delay)
        if (distToPlayer > 0) {
            this.pathRecalcTimer += dt;
            if (!this.currentPath || this.pathRecalcTimer >= 0.35) {
                // Update player path with a small reaction delay (0.35s) to make monsters dumber and turn corners less perfectly
                this.currentPath = this.findPathTo(this.player.camera.position.x, this.player.camera.position.z);
                this.pathRecalcTimer = 0;
            }

            let nextX = this.position.x;
            let nextZ = this.position.z;

            if (this.currentPath && this.currentPath.length > 1) {
                // Next step in path
                const nextCell = this.currentPath[1];
                const targetPos = new THREE.Vector3(nextCell.x + 0.5, 0.5, nextCell.z + 0.5);
                const toTarget = targetPos.clone().sub(this.position);
                toTarget.y = 0; // lock Y
                const distToCell = toTarget.length();
                
                if (distToCell > 0.02) {
                    toTarget.normalize();
                    nextX += toTarget.x * this.speed * dt;
                    nextZ += toTarget.z * this.speed * dt;
                } else {
                    nextX = targetPos.x;
                    nextZ = targetPos.z;
                    this.currentPath.shift(); // Move on to next cell
                }
            } else {
                // Fallback to sliding / direct chasing WITH strict boundary collision
                const dirX = dx / distToPlayer;
                const dirZ = dz / distToPlayer;
                const stepX = dirX * this.speed * dt;
                const stepZ = dirZ * this.speed * dt;
                
                const radius = 0.25;
                if (this.maze.getCell(nextX + stepX + (stepX > 0 ? radius : -radius), nextZ) === 0) {
                    nextX += stepX;
                }
                if (this.maze.getCell(nextX, nextZ + stepZ + (stepZ > 0 ? radius : -radius)) === 0) {
                    nextZ += stepZ;
                }
            }
            
            // Foolproof boundary collision to guarantee monsters never clip walls
            const r = 0.22;
            if (this.maze.getCell(nextX - r, nextZ - r) === 0 &&
                this.maze.getCell(nextX + r, nextZ - r) === 0 &&
                this.maze.getCell(nextX - r, nextZ + r) === 0 &&
                this.maze.getCell(nextX + r, nextZ + r) === 0) {
                this.position.x = nextX;
                this.position.z = nextZ;
            } else {
                // Do sliding collision fallback if the target step penetrates a wall
                const stepX = nextX - this.position.x;
                const stepZ = nextZ - this.position.z;
                
                let slideX = this.position.x;
                let slideZ = this.position.z;
                
                if (this.maze.getCell(slideX + stepX + (stepX > 0 ? r : -r), slideZ) === 0) {
                    slideX += stepX;
                }
                if (this.maze.getCell(slideX, slideZ + stepZ + (stepZ > 0 ? r : -r)) === 0) {
                    slideZ += stepZ;
                }
                this.position.x = slideX;
                this.position.z = slideZ;
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

    resetPosition() {
        this.isDead = false;
        this.isActive = true;
        if (this.sprite) this.sprite.visible = true;
        if (this.glow) {
            this.glow.visible = true;
            this.scene.add(this.glow); // Ensure it's in the scene
        }
        this.position.set(this.spawnX, 0.5, this.spawnZ);
        if (this.sprite) {
            this.sprite.position.copy(this.position);
            this.sprite.material.rotation = 0; // Reset rotation
        }
        if (this.glow) this.glow.position.copy(this.position);
        this.time = 0;
    }

    triggerJumpScare() {
        this.isActive = false;
        
        // Reset vignette
        const vignette = document.querySelector('.vignette');
        if (vignette) vignette.style.boxShadow = '';

        if (window.gameInstance) {
            window.gameInstance.triggerMonsterAttack(this);
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
