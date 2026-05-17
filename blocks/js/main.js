// Main Game Loop and State Machine

import { GameRenderer } from './renderer.js';
import { Maze } from './maze.js';
import { Player } from './player.js';
import { Chest } from './chest.js';
import { HUD } from './hud.js';
import { QuizManager } from './quiz.js';
import { Levels } from './levels.js';
import { AudioSystem } from './audio.js';

export class Game {
    constructor() {
        window.game = this; // For debugging
        this.state = 'MENU'; // MENU, PLAYING, QUIZ, GAMEOVER, WIN
        this.levelIndex = 0;
        
        // Systems
        const canvas = document.getElementById('game-canvas');
        if (!canvas) {
            console.error("CRITICAL ERROR: #game-canvas not found in DOM. Check if index.html is loaded correctly.");
            alert("Game failed to load: Canvas missing. Try a hard refresh (Ctrl+F5).");
        }
        this.renderer = new GameRenderer(canvas);
        this.hud = new HUD();
        this.quiz = new QuizManager();
        
        // Entities
        this.maze = new Maze(11);
        this.renderer.buildLevel(this.maze, Levels[0]);
        this.player = new Player(this.renderer.camera, this.maze);
        this.chests = [];
        
        // Multiplayer Socket
        this.socket = io('http://localhost:3002');
        this.teamId = 'team-' + Math.random().toString(36).substr(2, 9);

        // Listen for mission start
        this.socket.on('mission_started', () => {
            if (this.state === 'WAITING') {
                document.getElementById('waiting-screen').classList.add('hidden');
                
                // Audio and pointer lock logic
                AudioSystem.init();
                AudioSystem.resume();
                
                const canvas = document.getElementById('game-canvas');
                if (canvas) {
                    setTimeout(() => {
                        try {
                            canvas.requestPointerLock();
                            canvas.focus();
                        } catch (err) {
                            console.warn("Pointer lock request failed:", err);
                        }
                    }, 100);
                }

                this.startLevel(0);
            }
        });

        this.socket.on('session_reset', () => {
            localStorage.removeItem('blockly_session');
            window.location.reload();
        });
        
        this.lastTime = performance.now();
        this.setupUI();
        
        // Session Persistence
        const savedTeam = localStorage.getItem('blockly_session');
        if (savedTeam) {
            const { name, id } = JSON.parse(savedTeam);
            this.teamId = id;
            const teamSpan = document.getElementById('current-team');
            if (teamSpan) teamSpan.innerText = name;
            document.getElementById('login-screen').classList.add('hidden');
            document.getElementById('waiting-screen').classList.remove('hidden');
            document.getElementById('waiting-team-name').innerText = `TEAM: ${name}`;
            this.state = 'WAITING';
            this.socket.emit('join_game', { teamName: name, teamId: id });
        }

        requestAnimationFrame((t) => this.loop(t));
    }

    setupUI() {
        // System Login
        const btnLogin = document.getElementById('btn-login');
        const playerPass = document.getElementById('player-pass');
        const loginScreen = document.getElementById('login-screen');
        const mainMenu = document.getElementById('main-menu');
        const loginError = document.getElementById('login-error');

        const attemptLogin = () => {
            const teamName = document.getElementById('team-name')?.value || "PLAYER";
            const code = playerPass.value;

            // Admin Bypass Check
            if (code === '586203') {
                window.location.href = 'admin.html';
                return;
            }

            // Level Selector Code
            if (code === '661902') {
                loginScreen.classList.add('hidden');
                const adminPanel = document.getElementById('admin-panel');
                adminPanel.classList.remove('hidden');
                document.getElementById('admin-login-box').classList.add('hidden');
                document.getElementById('admin-level-selector').classList.remove('hidden');
                document.getElementById('admin-error').classList.add('hidden');
                return;
            }

            if (teamName.trim() === "") {
                loginError.innerText = "TEAM NAME REQUIRED";
                loginError.classList.remove('hidden');
                setTimeout(() => {
                    loginError.classList.add('hidden');
                    loginError.innerText = "INVALID ACCESS CODE";
                }, 2000);
                return;
            }

            if (code === '69692839') { 
                this.teamId = 'TEAM-' + Math.random().toString(36).substr(2, 9);
                localStorage.setItem('blockly_session', JSON.stringify({ name: teamName, id: this.teamId }));

                this.teamName = teamName;
                const teamSpan = document.getElementById('current-team');
                if (teamSpan) teamSpan.innerText = teamName;
                
                const waitingTeamSpan = document.getElementById('waiting-team-name');
                if (waitingTeamSpan) waitingTeamSpan.innerText = `TEAM: ${teamName}`;

                loginScreen.classList.add('hidden');
                
                // Show waiting screen
                document.getElementById('waiting-screen').classList.remove('hidden');
                this.state = 'WAITING';

                // Join Multiplayer
                this.socket.emit('join_game', { teamName, teamId: this.teamId });
            } else {
                loginError.classList.remove('hidden');
                setTimeout(() => loginError.classList.add('hidden'), 2000);
            }
        };

        if (btnLogin) btnLogin.addEventListener('click', attemptLogin);
        if (playerPass) {
            playerPass.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') attemptLogin();
            });
        }

        // Back button on login screen now does nothing or we can hide it
        document.getElementById('btn-back-login')?.classList.add('hidden');

        // Menu logic removed - consolidated into login screen
        
        document.getElementById('btn-how')?.addEventListener('click', () => {
            document.getElementById('login-screen').classList.add('hidden');
            document.getElementById('how-to-play').classList.remove('hidden');
        });

        document.getElementById('btn-credits').addEventListener('click', () => {
            document.getElementById('main-menu').classList.add('hidden');
            document.getElementById('credits').classList.remove('hidden');
        });

        document.getElementById('btn-back-how').addEventListener('click', () => {
            document.getElementById('how-to-play').classList.add('hidden');
            document.getElementById('login-screen').classList.remove('hidden');
        });

        document.getElementById('btn-back-credits').addEventListener('click', () => {
            document.getElementById('credits').classList.add('hidden');
            document.getElementById('login-screen').classList.remove('hidden');
        });

        // Admin Access
        document.getElementById('btn-admin').addEventListener('click', () => {
            document.getElementById('main-menu').classList.add('hidden');
            document.getElementById('admin-panel').classList.remove('hidden');
            document.getElementById('admin-login-box').classList.remove('hidden');
            document.getElementById('admin-level-selector').classList.add('hidden');
            document.getElementById('admin-error').classList.add('hidden');
            document.getElementById('admin-pass').value = '';
        });

        document.getElementById('btn-admin-login').addEventListener('click', () => {
            const pass = document.getElementById('admin-pass').value;
            if (pass === '2839') {
                document.getElementById('admin-login-box').classList.add('hidden');
                document.getElementById('admin-level-selector').classList.remove('hidden');
                document.getElementById('admin-error').classList.add('hidden');
            } else {
                document.getElementById('admin-error').classList.remove('hidden');
            }
        });

        document.getElementById('admin-pass').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('btn-admin-login').click();
            }
        });

        document.getElementById('btn-back-admin').addEventListener('click', () => {
            document.getElementById('admin-panel').classList.add('hidden');
            document.getElementById('login-screen').classList.remove('hidden');
        });

        document.querySelectorAll('.level-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const levelIdx = parseInt(e.currentTarget.getAttribute('data-level'));
                document.getElementById('admin-panel').classList.add('hidden');
                
                AudioSystem.init();
                AudioSystem.resume();
                
                const canvas = document.getElementById('game-canvas');
                if (canvas) {
                    setTimeout(() => {
                        try {
                            canvas.requestPointerLock();
                            canvas.focus();
                        } catch (err) {
                            console.warn("Pointer lock request failed:", err);
                        }
                    }, 100);
                }
                
                this.startLevel(levelIdx);
            });
        });

        // Game Over / Win
        // Game Over Restart
        const btnRestart = document.getElementById('btn-restart');
        if (btnRestart) {
            btnRestart.addEventListener('click', () => {
                const checkpointIndex = Math.floor(this.levelIndex / 5) * 5;
                document.getElementById('game-over').classList.add('hidden');
                
                // Reset Quiz Stats
                this.quiz.lives = 3;
                document.querySelectorAll('.skull').forEach(s => s.style.opacity = '1');
                
                this.startLevel(checkpointIndex);
            });
        }

        // Pointer Lock & Focus Safety
        document.addEventListener('click', () => {
            if (this.state === 'PLAYING') {
                const canvas = document.getElementById('game-canvas');
                if (canvas && document.pointerLockElement !== canvas) {
                    canvas.requestPointerLock();
                }
            }
        });

        const btnMainMenu = document.getElementById('btn-main-menu');
        if (btnMainMenu) {
            btnMainMenu.addEventListener('click', () => {
                document.getElementById('win-screen').classList.add('hidden');
                document.getElementById('login-screen').classList.remove('hidden');
                this.levelIndex = 0;
                this.quiz.lives = 3;
                document.querySelectorAll('.skull').forEach(s => s.style.opacity = '1');
            });
        }

        // Quiz Options
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.currentTarget.getAttribute('data-opt'));
                this.quiz.submitAnswer(idx);
            });
        });

        // Interaction
        document.addEventListener('keydown', (e) => {
            if (e.key && e.key.toLowerCase() === 'e' && this.state === 'PLAYING') {
                const nearChest = this.chests.find(c => c.update(0, this.player.camera.position));
                if (nearChest && !nearChest.isOpen) {
                    if (nearChest.isFake) {
                        this.triggerTrap(nearChest);
                    } else {
                        this.triggerQuiz(nearChest);
                    }
                }
            }
        });
    }

    startLevel(index) {
        this.levelIndex = index;
        
        if (window.parent && window.parent.Game && window.parent !== window) {
            window.parent.Game.state.level = index + 1;
            window.parent.Game.updateUI();
        }
        
        // Handle Blockly Levels (6-10)
        if (this.levelIndex >= Levels.length) {
            if (window.fetchLevel) {
                window.fetchLevel(this.levelIndex + 1);
            } else {
                // Fallback to URL if fetchLevel is not globally available yet
                window.location.href = '?level=' + (this.levelIndex + 1);
            }
            return;
        }

        const config = Levels[this.levelIndex];

        // Report progress to server
        if (this.socket) {
            console.log(`[SOCKET] Reporting Level ${config.id} reached...`);
            this.socket.emit('update_progress', { teamId: this.teamId, level: config.id });
        }
        
        this.state = 'TRANSITION';
        const transScreen = document.getElementById('level-transition');
        document.getElementById('transition-text').innerText = `LEVEL ${config.id}`;
        transScreen.classList.remove('hidden');
        
        const mainMenu = document.getElementById('main-menu');
        if (mainMenu) mainMenu.classList.add('hidden');
        
        document.getElementById('hud').classList.add('hidden');

        setTimeout(() => {
            // Generate
            this.maze = new Maze(config.size);
            this.renderer.buildLevel(this.maze, config);
            this.player = new Player(this.renderer.camera, this.maze);
            
            // Spawn Chests
            this.chests.forEach(c => c.destroy());
            this.chests = [];
            
            // Real Chest at exit
            this.chests.push(new Chest(this.renderer.scene, this.maze, null, false));
            
            // Fake Chests (Traps)
            const fakeCount = 3; 
            for(let i=0; i<fakeCount; i++) {
                let fx, fy;
                do {
                    fx = Math.floor(Math.random() * this.maze.size);
                    fy = Math.floor(Math.random() * this.maze.size);
                } while (this.maze.grid[fy][fx] === 1 || (fx === this.maze.end.x && fy === this.maze.end.y));
                this.chests.push(new Chest(this.renderer.scene, this.maze, {x: fx, y: fy}, true));
            }
            
            this.hud.setLevel(config.id);
            
            transScreen.classList.add('hidden');
            document.getElementById('hud').classList.remove('hidden');
            
            // Ensure canvas has focus
            const canvas = document.getElementById('game-canvas');
            if (canvas) canvas.focus();

            AudioSystem.startAmbient();
            
            this.state = 'PLAYING';
            this.lastTime = performance.now();
            console.log("Game started successfully. Maze size:", this.maze.size);
            console.log("Walls in scene:", this.renderer.walls.length);
        }, 500);
    }

    triggerQuiz(chest) {
        this.state = 'QUIZ';
        this.player.unlockPointer();
        AudioSystem.stopAmbient();
        AudioSystem.playDiscovery();
        AudioSystem.playChestOpen();
        
        chest.open();
        
        const modal = document.getElementById('quiz-modal');
        setTimeout(() => {
            modal.classList.remove('hidden');
            this.quiz.startQuiz(Levels[this.levelIndex].id, 
                () => this.onLevelComplete(),
                () => this.onGameOver(),
                (isCorrect) => this.showQuizFeedback(isCorrect)
            );
        }, 1000); // Wait for chest animation
    }

    showQuizFeedback(isCorrect) {
        const feedback = document.getElementById('quiz-feedback');
        feedback.classList.remove('hidden', 'feedback-correct', 'feedback-wrong');
        
        if (isCorrect) {
            feedback.innerText = "ACCESS GRANTED";
            feedback.classList.add('feedback-correct');
            AudioSystem.playCorrect();
        } else {
            feedback.innerText = "SYSTEM ERROR";
            feedback.classList.add('feedback-wrong');
            AudioSystem.playWrong();
            this.reportFailure();
        }
        
        setTimeout(() => {
            feedback.classList.add('hidden');
        }, 1500);
    }

    onLevelComplete() {
        document.getElementById('quiz-modal').classList.add('hidden');
        AudioSystem.playFanfare();
        
        this.levelIndex++;
        if (this.levelIndex >= Levels.length) {
            this.state = 'WIN';
            document.getElementById('hud').classList.add('hidden');
            document.getElementById('win-screen').classList.remove('hidden');
            document.getElementById('final-score').innerText = `Maze Conquered! Preparing for Logic Phase...`;
            
            // Instead of hard redirect, we now notify the parent game controller
            if (window.onPhaseComplete) {
                window.onPhaseComplete();
            } else {
                setTimeout(() => {
                    window.location.href = '../index.html?level=6';
                }, 3000);
            }
        } else {
            this.startLevel(this.levelIndex);
        }
    }

    onGameOver() {
        document.getElementById('quiz-modal').classList.add('hidden');
        document.getElementById('hud').classList.add('hidden');
        document.getElementById('game-over').classList.remove('hidden');
        
        const checkpointLevel = Math.floor(this.levelIndex / 5) * 5;
        const msg = checkpointLevel === 0 ? "RESTARTING FROM LEVEL 1" : `RESTARTING FROM CHECKPOINT: LEVEL ${checkpointLevel + 1}`;
        document.querySelector('#game-over p').innerText = msg;
        
        this.state = 'GAMEOVER';
    }

    triggerTrap(chest) {
        chest.open();
        AudioSystem.playWrong();
        AudioSystem.playJumpScare(); // Reuse the scary sound for the trap
        this.reportFailure();

        this.quiz.lives--;
        document.querySelectorAll('.skull')[this.quiz.lives].style.opacity = '0.2';
        
        if (this.quiz.lives <= 0) {
            setTimeout(() => this.onGameOver(), 1000);
        } else {
            // Screen shake or something? 
            document.getElementById('game-canvas').style.filter = 'invert(1)';
            setTimeout(() => {
                document.getElementById('game-canvas').style.filter = 'none';
            }, 500);
        }
    }

    reportFailure() {
        if (this.socket) {
            this.socket.emit('report_failure', { teamId: this.teamId });
        }
    }

    loop(time) {
        const dt = (time - this.lastTime) / 1000;
        this.lastTime = time;

        if (this.state === 'PLAYING') {
            this.player.update(dt);
            
            let anyNear = false;
            this.chests.forEach(c => {
                const isNear = c.update(dt, this.player.camera.position);
                if (isNear && !c.isOpen) anyNear = true;
            });
            
            this.hud.showInteract(anyNear);
            
            // Minimap shows all chests
            this.hud.drawMinimap(this.maze, this.player.camera.position, this.chests);
        }

        // Always render if systems are initialized
        if (this.renderer && this.player) {
            this.renderer.render(this.player.camera.position, dt);
        }

        requestAnimationFrame((t) => this.loop(t));
    }
}

// Removed window.onload to allow control from root game.js
