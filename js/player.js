// Player Movement and Collision

export class Player {
    constructor(camera, maze) {
        this.camera = camera;
        this.maze = maze;
        this.keys = { w: false, a: false, s: false, d: false, ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false };
        this.speed = 3.0; // units per second
        this.turnSpeed = 2.0; // rads per second

        // Set initial position
        this.camera.position.set(maze.start.x + 0.5, 0.5, maze.start.y + 0.5); // Center in cell (1.5, 1.5)
        this.camera.rotation.set(0, Math.PI, 0); // Look towards +Z (into the maze)

        // Mouse look
        this.isPointerLocked = false;
        this.mouseMoveForward = false;
        
        this.setupInputs();
    }

    setupInputs() {
        document.addEventListener('keydown', (e) => {
            if (!e.key) return;
            const key = e.key.toLowerCase();
            if (this.keys.hasOwnProperty(key)) this.keys[key] = true;
            if (e.code === 'KeyW') this.keys.w = true;
            if (e.code === 'KeyS') this.keys.s = true;
            if (e.code === 'KeyA') this.keys.a = true;
            if (e.code === 'KeyD') this.keys.d = true;
            if (this.keys.hasOwnProperty(e.key)) this.keys[e.key] = true;
            
            // Space or F are disabled for shooting since weapon is removed
        });
        document.addEventListener('keyup', (e) => {
            if (!e.key) return;
            const key = e.key.toLowerCase();
            if (this.keys.hasOwnProperty(key)) this.keys[key] = false;
            if (e.code === 'KeyW') this.keys.w = false;
            if (e.code === 'KeyS') this.keys.s = false;
            if (e.code === 'KeyA') this.keys.a = false;
            if (e.code === 'KeyD') this.keys.d = false;
            if (this.keys.hasOwnProperty(e.key)) this.keys[e.key] = false;
        });

        document.addEventListener('mousemove', (e) => {
            if (this.isPointerLocked) {
                // Adjust sensitivity for trackpads
                const sensitivity = 0.002;
                this.camera.rotation.y -= e.movementX * sensitivity;

                // Subtle hand tilt
                const hand = document.getElementById('player-hand');
                if (hand) {
                    const tilt = -e.movementX * 0.1;
                    hand.style.transform = `rotate(${tilt}deg) translateX(${e.movementX * 0.5}px)`;
                }
            }
        });

        // Sync pointer lock state with browser
        document.addEventListener('pointerlockchange', () => {
            const canvas = document.getElementById('game-canvas');
            this.isPointerLocked = (document.pointerLockElement === canvas || document.pointerLockElement === document.body);
            if (!this.isPointerLocked) {
                this.mouseMoveForward = false;
            }
        });

        // Click to lock pointer
        document.addEventListener('mousedown', (e) => {
            if (window.gameInstance && window.gameInstance.state === 'PLAYING') {
                if (!this.isPointerLocked) {
                    this.lockPointer();
                }
            }
        });
    }

    lockPointer() {
        const canvas = document.getElementById('game-canvas');
        if (canvas) {
            try {
                canvas.requestPointerLock();
            } catch (err) {
                document.body.requestPointerLock();
            }
        } else {
            document.body.requestPointerLock();
        }
        this.isPointerLocked = true;
    }

    unlockPointer() {
        try {
            document.exitPointerLock();
        } catch (e) {
            console.warn(e);
        }
        this.isPointerLocked = false;
        this.mouseMoveForward = false;
    }

    update(dt) {
        // Keyboard Rotation (fallback if mouse not used)
        if (this.keys.ArrowLeft) this.camera.rotation.y += this.turnSpeed * dt;
        if (this.keys.ArrowRight) this.camera.rotation.y -= this.turnSpeed * dt;

        // Movement vectors
        const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
        const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion);
        
        // Zero out Y component so we don't fly
        dir.y = 0; dir.normalize();
        right.y = 0; right.normalize();

        const moveVec = new THREE.Vector3();

        if (this.keys.w || this.keys.ArrowUp) moveVec.add(dir);
        if (this.keys.s || this.keys.ArrowDown) moveVec.sub(dir);
        if (this.keys.d) moveVec.add(right);
        if (this.keys.a) moveVec.sub(right);

        if (moveVec.lengthSq() > 0) {
            moveVec.normalize().multiplyScalar(this.speed * dt);
            
            const newX = this.camera.position.x + moveVec.x;
            const newZ = this.camera.position.z + moveVec.z;

            // Separate checks for X and Z movement
            const r = 0.2; // Smaller radius for better fit
            
            // X Check
            const canMoveX = 
                this.maze.getCell(newX + (moveVec.x > 0 ? r : -r), this.camera.position.z) === 0 &&
                this.maze.getCell(newX + (moveVec.x > 0 ? r : -r), this.camera.position.z + r*0.9) === 0 &&
                this.maze.getCell(newX + (moveVec.x > 0 ? r : -r), this.camera.position.z - r*0.9) === 0;
            
            if (canMoveX) this.camera.position.x = newX;

            // Z Check
            const canMoveZ = 
                this.maze.getCell(this.camera.position.x, newZ + (moveVec.z > 0 ? r : -r)) === 0 &&
                this.maze.getCell(this.camera.position.x + r*0.9, newZ + (moveVec.z > 0 ? r : -r)) === 0 &&
                this.maze.getCell(this.camera.position.x - r*0.9, newZ + (moveVec.z > 0 ? r : -r)) === 0;
            
            if (canMoveZ) this.camera.position.z = newZ;
        }

        // Hand Bobbing Logic
        const hand = document.getElementById('player-hand');
        if (hand) {
            if (moveVec.lengthSq() > 0) {
                hand.classList.add('hand-bob');
            } else {
                hand.classList.remove('hand-bob');
            }
        }
    }

    respawn() {
        this.camera.position.set(this.maze.start.x + 0.5, 0.5, this.maze.start.y + 0.5);
        this.camera.rotation.set(0, Math.PI, 0);
    }
}
